// QuotationDialog.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import CaseField from "../CaseField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { SearchCommandBlock } from "../sc-select";
import ApiCustomer from "@/api";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { QuotationInvoice } from "../QuatationInvoice";
import { useServiceCaseStore } from "../../hooks/useServiceCaseStore";
import { useAuth } from "../../context/auth-context";
import { mapMaterialOrdersToQuotationItems } from "../../lib/mappers/fieldMO";

// ---- helper: date to datetime-local string ----
const formatDateForInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// ---- helper: normalize line items (same as before) ----
const normaliseLineItems = (items = [], prevItems = []) => {
  return items.map((item, index) => {
    const internalId =
      item?.id ??
      item?.lineItemId ??
      item?.LineItemId ??
      item?.MOItemId ??
      item?.lineId ??
      index;

    const previous =
      prevItems.find((line) => line.internalId === internalId) || {};

    const partNumber =
      item?.PartNumber ??
      item?.partNumber ??
      item?.ItemCode ??
      item?.itemCode ??
      item?.MaterialCode ??
      item?.materialCode ??
      "";

    const description =
      item?.Description ??
      item?.description ??
      item?.PartName ??
      item?.partName ??
      item?.itemName ??
      item?.Name ??
      "";

    const quantity =
      item?.quantity ??
      item?.Quantity ??
      item?.qty ??
      item?.Qty ??
      item?.RequestQty ??
      item?.requestQty ??
      previous.quantity ??
      "";

    const priceValue = item?.price ?? item?.Price ?? previous.dbPrice ?? "";

    let partApprovedValue =
      item?.partApproved ?? item?.Approved ?? previous.partApproved ?? "yes";

    if (partApprovedValue === null || partApprovedValue === undefined) {
      partApprovedValue = "";
    } else if (typeof partApprovedValue === "boolean") {
      partApprovedValue = partApprovedValue ? "yes" : "no";
    } else if (typeof partApprovedValue === "string") {
      const lowered = partApprovedValue.toLowerCase();
      if (lowered === "true") partApprovedValue = "yes";
      else if (lowered === "false") partApprovedValue = "no";
      else partApprovedValue = lowered;
    }

    return {
      internalId,
      partNumber,
      description,
      quantity,
      dbPrice:
        priceValue === null || priceValue === undefined
          ? 0
          : Number(priceValue),
      price: 
        priceValue === null || priceValue === undefined
          ? ""
          : String(priceValue),
     partApproved: String(partApprovedValue),
    };
  });
};

const copyToClipboard = (value) => {
  if (!value) return;
  navigator.clipboard.writeText(value);
  toast.success(`Copied: ${value}`);
};



const QuotationDialog = () => {
  const { user } = useAuth();
  const open = useServiceCaseStore((s) => s.openDialogQuotation);
  const setOpenDialogQuotation = useServiceCaseStore(
    (s) => s.setOpenDialogQuotation
  );
  const caseDetails = useServiceCaseStore((s) => s.caseDetails);
  const signature = useServiceCaseStore((s) => s.signature);

    const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [lineErrors, setLineErrors] = useState({});
  const [roleAssign, setRoleAssign] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const status = caseDetails?.CaseStatus;
  const isQuoteRequested = status === "Quote_Requested";
  const isPendingQuote = status === "Pending_Quote";

  const materialItems = useMemo(
    () => (caseDetails ? mapMaterialOrdersToQuotationItems(caseDetails) : []),
    [caseDetails]
  );

  const existingQuotationNo = initialData?.quotationNo ?? null;
  const formDisabled = loading || submitting;

  // --- fetch APO users once ---
  const fetchUserAssign = useCallback(async (role) => {
    try {
      const res = await ApiCustomer.get(`/api/user?role=${role}`);
      setRoleAssign(res.data.data || []);
    } catch (err) {
      toast.error("Error fetching role: ", err);
    }
  }, []);

  useEffect(() => {
    fetchUserAssign("apo");
  }, [fetchUserAssign]);

  const filteredUserAssign = useMemo(
    () => roleAssign.filter((u) => u.Role === "apo"),
    [roleAssign]
  );

  // --- fetch quotation when dialog opens ---
  useEffect(() => {
    if (!open || !caseDetails?.CaseID) return;

    let cancelled = false;
    setInitialData(null);
    setLoading(true);

    (async () => {
      try {
        const response = await ApiCustomer.get(
          `/api/quotation-information?caseId=${caseDetails.CaseID}`
        );
        if (cancelled) return;
        const quotationPayload = response.data.data;
        if (quotationPayload?.quotation) {
          const q = quotationPayload.quotation;
          setInitialData({
            quotationNo: q.quotationNo,
            quotationType: q.quotationType ?? "Simple",
            vatValue:
              q.vatValue === null || q.vatValue === undefined
                ? ""
                : String(q.vatValue),
            quotationNote: q.quotationNote ?? "",
            laborFee:
              q.laborFee === null || q.laborFee === undefined
                ? ""
                : String(q.laborFee),
            quotationDate: q.quotationDate ?? "",
            quoteApproveDate: q.quoteApproveDate ?? "",
            sendWa: Boolean(q.sendWa),
            sendEmail: Boolean(q.sendEmail),
            quoteDecision: q.quoteDecision ?? "",
            // userAssign: q.userAssign ?? undefined, #don't deleted, because one day it will be needed
          });
        } else {
          setInitialData({});
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ?? "Gagal mengambil data quotation."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, caseDetails?.CaseID]);

  // --- default form state based on initialData + materialItems ---
  const defaultFormState = useMemo(() => {
    const data = initialData || {};
    const quotationDate =
      formatDateForInput(data.quotationDate) || formatDateForInput();
    const quoteApproveDate = isPendingQuote
      ? formatDateForInput(data.quoteApproveDate) || formatDateForInput()
      : "";

    const decision = data.quoteDecision;
    let mappedDecision = "";
    if (decision) {
      const lowered = String(decision).toLowerCase();
      if (lowered === "approved") mappedDecision = "approve";
      else if (lowered === "rejected") mappedDecision = "reject";
      else mappedDecision = lowered;
    }

    return {
      quotationType: data.quotationType ?? "Simple",
      vatValue: data.vatValue ?? "",
      quotationNote: data.quotationNote ?? "",
      laborFee: data.laborFee ?? "",
      quotationDate,
      useNewQuotationNo:
        data.useNewQuotationNo ?? (isQuoteRequested ? true : false),
      sendWa: data.sendWa ?? false,
      sendEmail: data.sendEmail ?? false,
      quoteApproveDate,
      quoteDecision: mappedDecision,
      lineItems: normaliseLineItems(materialItems),
      userAssign: data.userAssign ?? undefined,
    };
  }, [initialData, isPendingQuote, isQuoteRequested, materialItems]);

  const [form, setForm] = useState(defaultFormState);

  const resetForm = useCallback(() => {
    setForm(defaultFormState);
    setFieldErrors({});
    setLineErrors({});
    setIsDirty(false);
  }, [defaultFormState]);

  useEffect(() => {
    if (!open) {
      // when dialog closed, reset "dirty" flag
      setIsDirty(false);
    }
  }, [open]);

  // sync form when initialData/materialItems change, but only if not dirty
  useEffect(() => {
    if (isDirty) return;
    resetForm();
  }, [defaultFormState, isDirty, resetForm]);

  // keep line items in sync with materialItems
  const syncLineItems = useCallback(
    (items) => {
      setForm((prev) => ({
        ...prev,
        lineItems: normaliseLineItems(items, prev.lineItems),
      }));
    },
    []
  );

  useEffect(() => {
    syncLineItems(materialItems);
  }, [materialItems, syncLineItems]);

  // auto adjust decision-dependent fields
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      useNewQuotationNo: isQuoteRequested ? true : prev.useNewQuotationNo,
      quoteApproveDate: isPendingQuote
        ? prev.quoteApproveDate || formatDateForInput()
        : "",
      quoteDecision: isPendingQuote ? prev.quoteDecision : "",
    }));
  }, [isPendingQuote, isQuoteRequested]);

  // auto set partApproved yes/no depending on quoteDecision
  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      lineItems: prevForm.lineItems.map((item) => ({
        ...item,
        partApproved: prevForm.quoteDecision === "reject" ? "no" : "yes",
        price: prevForm.quoteDecision === "reject" ? 0 : item.dbPrice
      })),
    }));
  }, [form.quoteDecision]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => {
      if (prev[field] === value) return prev;
      setIsDirty(true);
      return { ...prev, [field]: value };
    });
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleCheckboxChange = (field, value) => {
    handleFieldChange(field, Boolean(value));
  };

  const handleLineItemChange = (
    internalId,
    field,
    value
  ) => {
    setForm((prev) => {
      let hasChanged = false;
      const nextLineItems = prev.lineItems.map((item) => {
        if (item.internalId !== internalId) return item;
         let updatedItem = item;

      if (item[field] !== value) {
        hasChanged = true;
        updatedItem = { ...updatedItem, [field]: value };
      }

      if (field === "partApproved") {
        updatedItem = {
          ...updatedItem,
          price: value === "no" ? 0 : updatedItem.dbPrice
        }
      }

      return updatedItem;
      });

      if (!hasChanged) return prev;
      setIsDirty(true);
      return { ...prev, lineItems: nextLineItems };
    });

      setLineErrors((prev) => {
        const existing = prev[internalId];
        if (!existing?.[field]) return prev;

        const next = { ...prev };
        const fieldErrs = { ...existing };
        delete fieldErrs[field];

        if (Object.keys(fieldErrs).length === 0) {
          delete next[internalId];
        } else {
          next[internalId] = fieldErrs;
        }

        return next;
      });
    };

  const validateForm = () => {
    const newFieldErrors = {};
    const newLineErrors = {};

    if (!form.laborFee) {
      toast.warning("Labor fee wajib diisi.", { position: "top-center" });
      return false;
    }

    if (!form.quotationDate) {
      toast.warning("Quotation date wajib diisi.", {
        position: "top-center",
      });
      return false;
    }

    if (form.quotationType === "Standard" && !form.vatValue) {
      toast.warning("VAT value wajib diisi untuk tipe Standard.", {
        position: "top-center",
      });
      return false;
    }

    if (isPendingQuote && !form.quoteApproveDate) {
      toast.warning("Quote approve date wajib diisi", {
        position: "top-center",
      });
      return false;
    }

    if (isPendingQuote && !form.quoteDecision) {
      toast.warning("Quotation decision wajib diisi", {
        description: "Pilih apakah quotation disetujui atau ditolak",
        position: "top-center",
      });
      return false;
    }

    if (isPendingQuote && !form.userAssign && form.quoteDecision === 'approve') {
      toast.warning("APO belum di-assign", {
        description: "Pilih partner APO sebelum menyimpan quotation",
        position: "top-center",
      });
      return false;
    }

    form.lineItems.forEach((item) => {
      const itemErrors = {};
      if (!item.price && item.price !== 0) {
        itemErrors.price = "Price wajib diisi.";
      }
      if (isPendingQuote && !item.partApproved) {
        itemErrors.partApproved = "Part approved wajib dipilih.";
      }

      if (Object.keys(itemErrors).length > 0) {
        newLineErrors[item.internalId] = itemErrors;
      }
    });

    setFieldErrors(newFieldErrors);
    setLineErrors(newLineErrors);

    return (
      Object.keys(newFieldErrors).length === 0 &&
      Object.keys(newLineErrors).length === 0
    );
  };

  const handleSubmit = async () => {
    if (formDisabled) return;
    if (!validateForm()) return;
    if (!caseDetails?.CaseID || !user?.id) return;
    const quoteDecisionValue = form.quoteDecision
      ? form.quoteDecision === "approve"
        ? "Approved"
        : "Rejected"
      : null;

    const basePayload = {
      quotationNo: existingQuotationNo,
      quotationType: form.quotationType,
      vatValue: form.vatValue,
      quotationNote: form.quotationNote,
      laborFee: form.laborFee,
      quotationDate: form.quotationDate,
      quoteApproveDate: isPendingQuote ? form.quoteApproveDate : null,
      useNewQuotationNo: form.useNewQuotationNo,
      sendWa: form.sendWa,
      sendEmail: form.sendEmail,
      quoteDecision: quoteDecisionValue,
      userAssign: form.userAssign ?? user.id,
      lineItems: form.lineItems.map((item) => ({
        lineItemId: item.internalId,
        price: item.price,
        quantity: item.quantity,
        partApproved: isPendingQuote ? item.partApproved : undefined,
      })),
      status,
      caseId: caseDetails.CaseID,
      createdBy: user.id,
    };

    const apiPayload = { ...basePayload };

    if (apiPayload.quoteDecision === "Rejected") {
      // assign back to WO owner if rejected
      apiPayload.userAssign = caseDetails.workorder?.[0]?.OwnerID;
    }

    try {
      setSubmitting(true);
      const endpoint = existingQuotationNo
        ? `/api/quotation-information/${existingQuotationNo}`
        : "/api/quotation-information";
      const method = existingQuotationNo ? "patch" : "post";
      const requester =
        method === "patch"
          ? ApiCustomer.patch.bind(ApiCustomer)
          : ApiCustomer.post.bind(ApiCustomer);

      await requester(endpoint, apiPayload);

      toast.success(
        existingQuotationNo
          ? "Quotation berhasil diperbarui."
          : "Quotation berhasil dibuat."
      );

      setOpenDialogQuotation(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save quotation:", error);
      const message =
        error?.response?.data?.message ?? "Gagal menyimpan quotation.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- close handler for Dialog ---
  const handleOpenChange = (nextOpen) => {
    setOpenDialogQuotation(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="md:min-w-6xl bg-white flex flex-col h-150 gap-1">
        <DialogHeader className="flex flex-row justify-between gap-4 px-10 py-4 border-b">
          <div>
            <DialogTitle>Quotation Detail</DialogTitle>
            <DialogDescription>
              Sesuaikan informasi quotation berdasarkan status case.
            </DialogDescription>
          </div>
          {existingQuotationNo && (
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-md font-medium text-muted-foreground bg-muted/60">
              <span className="uppercase tracking-wide text-[10px] text-muted-foreground/70">
                Quotation No
              </span>
              <span>{existingQuotationNo}</span>
            </div>
          )}
        </DialogHeader>

        {loading && (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Memuat data quotation...
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Quotation</CardTitle>
            </CardHeader>

            <CardContent className="gap-6  columns-1 md:columns-2">
              {/* LEFT COLUMN: MAIN FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                {isPendingQuote && (
                  <CaseField label="Quote Approve Date" star className="gap-1">
                    <Input
                      type="datetime-local"
                      disabled={formDisabled}
                      value={form.quoteApproveDate}
                      onChange={(e) =>
                        handleFieldChange("quoteApproveDate", e.target.value)
                      }
                    />
                    {fieldErrors.quoteApproveDate && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.quoteApproveDate}
                      </p>
                    )}
                  </CaseField>
                )}

                <CaseField label="Quotation Type" star className="gap-1">
                  <Select
                    disabled={formDisabled}
                    value={form.quotationType}
                    onValueChange={(value) =>
                      handleFieldChange("quotationType", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tipe quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simple">Simple</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.quotationType && (
                    <p className="text-xs text-red-500">
                      {fieldErrors.quotationType}
                    </p>
                  )}
                </CaseField>

                <CaseField label="Quotation Date" star className="gap-1">
                  <Input
                    type="datetime-local"
                    disabled={formDisabled}
                    value={form.quotationDate}
                    onChange={(e) =>
                      handleFieldChange("quotationDate", e.target.value)
                    }
                  />
                  {fieldErrors.quotationDate && (
                    <p className="text-xs text-red-500">
                      {fieldErrors.quotationDate}
                    </p>
                  )}
                </CaseField>

                {isPendingQuote && (
                  <CaseField label="Quotation Decision" star className="gap-1">
                    <Select
                      disabled={formDisabled}
                      value={form.quoteDecision}
                      onValueChange={(value) =>
                        handleFieldChange("quoteDecision", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih keputusan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.quoteDecision && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.quoteDecision}
                      </p>
                    )}
                  </CaseField>
                )}

                <CaseField label="Labor Fee" star className="gap-1">
                  <Input
                    disabled={formDisabled}
                    value={form.laborFee}
                    onChange={(e) =>
                      handleFieldChange("laborFee", e.target.value)
                    }
                    placeholder="Masukkan biaya labor"
                    type="number"
                    min="0"
                  />
                  {fieldErrors.laborFee && (
                    <p className="text-xs text-red-500">
                      {fieldErrors.laborFee}
                    </p>
                  )}
                </CaseField>

                {form.quotationType === "Standard" && (
                  <CaseField label="VAT Value (%)" star>
                    <Input
                      disabled={formDisabled}
                      value={form.vatValue}
                      onChange={(e) =>
                        handleFieldChange("vatValue", e.target.value)
                      }
                      placeholder="Contoh: 10"
                      type="number"
                      min="0"
                    />
                    {fieldErrors.vatValue && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.vatValue}
                      </p>
                    )}
                  </CaseField>
                )}

                {form.quoteDecision === "approve" && (
                  <CaseField
                    label="Select APO"
                    star
                    childClass="flex flex-col items-start w-full"
                    className="gap-1"
                  >
                    <SearchCommandBlock
                      value={form.userAssign}
                      onChange={(selectedID) => {
                        if (!selectedID) {
                          handleFieldChange("userAssign", "");
                          return;
                        }
                        const selectedUser = filteredUserAssign.find(
                          (user) => user.IDUser === selectedID
                        );
                        if (selectedUser) {
                          handleFieldChange("userAssign", selectedUser.IDUser);
                        }
                      }}
                      placeholder="--Select--"
                      options={filteredUserAssign.map((user) => ({
                        label: user.Name,
                        value: user.IDUser,
                      }))}
                      renderLabel={(opt) => opt.label}
                      getValue={(opt) => opt.value}
                      className="border border-gray-200 bg-slate-100"
                    />
                    {fieldErrors.userAssign && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.userAssign}
                      </p>
                    )}
                  </CaseField>
                )}
              </div>

              {/* RIGHT COLUMN: NOTE & OPTIONS */}
              <div className="flex flex-col gap-4  break-inside-avoid">
                <CaseField
                  label="Quotation Note"
                  span={2}
                  childClass="flex flex-col gap-2 w-full"
                >
                  <Textarea
                    disabled={formDisabled}
                    value={form.quotationNote}
                    onChange={(e) =>
                      handleFieldChange("quotationNote", e.target.value)
                    }
                    placeholder="Catatan tambahan untuk quotation"
                    className="min-h-[120px]"
                  />
                </CaseField>

                <CaseField
                  label="Pilihan Tambahan"
                  span={2}
                  childClass="flex flex-col gap-2 justify-start items-start! "
                >
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      className="border-fuchsia-400"
                      id="useNewQuotationNo"
                      disabled={formDisabled}
                      checked={form.useNewQuotationNo}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("useNewQuotationNo", checked)
                      }
                    />
                    <span>Use new Quotation No</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      className="border-fuchsia-400"
                      id="sendWa"
                      disabled={formDisabled}
                      checked={form.sendWa}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("sendWa", checked)
                      }
                    />
                    <span>Send WA</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      className="border-fuchsia-400"
                      id="sendEmail"
                      disabled={formDisabled}
                      checked={form.sendEmail}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("sendEmail", checked)
                      }
                    />
                    <span>Send Email</span>
                  </label>
                </CaseField>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Order Line Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada material order line item yang ditambahkan.
                </p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-24">Qty</TableHead>
                        <TableHead className="w-40">Price *</TableHead>
                        {isPendingQuote && (
                          <TableHead className="w-40">
                            Part Approved *
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.lineItems.map((item) => {
                        const errors = lineErrors[item.internalId] || {};
                        return (
                          <TableRow key={item.internalId}>
                            <TableCell
                              className="max-w-[180px]"
                              onClick={() => copyToClipboard(item.partNumber)}
                            >
                              {item.partNumber || "-"}
                            </TableCell>
                            <TableCell
                              className="max-w-[240px]"
                              onClick={() => copyToClipboard(item.description)}
                            >
                              <span className="line-clamp-2">
                                {item.description || "-"}
                              </span>
                            </TableCell>
                            <TableCell>{item.quantity || "-"}</TableCell>
                            <TableCell>
                              <div className="flex flex-col w-50 gap-1">
                                <Input
                                  disabled={formDisabled || item.partApproved === "no"}
                                  value={item.price}
                                  onChange={(e) =>
                                    handleLineItemChange(
                                      item.internalId,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  type="number"
                                  min="0"
                                  placeholder="Harga"
                                  required
                                />
                                {errors.price && (
                                  <p className="text-xs text-red-500">
                                    {errors.price}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            {isPendingQuote && (
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Select
                                    disabled={formDisabled}
                                    value={item.partApproved}
                                    onValueChange={(value) =>
                                      handleLineItemChange(
                                        item.internalId,
                                        "partApproved",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger disabled={formDisabled}>
                                      <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {errors.partApproved && (
                                    <p className="text-xs text-red-500">
                                      {errors.partApproved}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="border-t px-2 py-2 m-0">
          <DialogClose asChild>
            <Button variant="secondary" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={formDisabled}>
            {submitting ? "Menyimpan..." : "Simpan Quotation"}
          </Button>
          <Button
            onClick={async () => {
              if (!caseDetails) return;
              const blob = await pdf(
                <QuotationInvoice
                  caseDetails={caseDetails}
                  customerSignature={signature}
                  materialItems={materialItems}
                  initialData={initialData || {}}
                />
              ).toBlob();
              const url = URL.createObjectURL(blob);
              window.open(url);
            }}
            disabled={formDisabled}
          >
            Print Quotation Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationDialog;
