import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SearchCommandBlock,
  SelectBarRelated,
} from "../../components/sc-select";
import {
  ArrowDownNarrowWideIcon,
  Car,
  Lock,
  Plus,
  RotateCw,
  Search,
} from "lucide-react";
import { CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { Textarea } from "../../components/ui/textarea";
import { useParams } from "react-router";
import debounce from "lodash.debounce";
import ApiCustomer from "@/api";
import { TabsServiceMOLineItems } from "./service-case";
import { Description } from "@radix-ui/react-dialog";
import { useDraft } from "../../components/DraftContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CaseField from "@/components/CaseField";
import { useAuth } from "@/context/auth-context";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const GOOD_RETURN_REASON_OPTIONS = [
  { value: "AdminIssue", label: "Admin Issue" },
  { value: "CIDRejected", label: "CID Rejected By SC Team" },
  { value: "ComplexIssue", label: "Complex Issue" },
  { value: "CustomerCancelRepair", label: "Customer Cancel Repair / No Response" },
  { value: "OnsiteRemoteArea", label: "Onsite in Remote Area" },
  { value: "OtherReason", label: "Other Reason" },
  { value: "WrongAnalysisCCC", label: "Wrong Analysis by CCC" },
  { value: "WrongAnalysisCE", label: "Wrong Analysis by CE" },
  { value: "WrongOrderCE", label: "Wrong Order by CE" },
];

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const DateHelper = {
  fromDB(dateStr) {
    return formatDateForInput(dateStr);
  },
  toDB(dateStr) {
    return dateStr ? new Date(dateStr).toISOString() : null;
  },
};

export const ServiceMoDetailApo = () => {
  const { updateDraft } = useDraft(); // Access updateDraft from the DraftContext
  const {user} = useAuth();
  const { lineItemID } = useParams();

  const [moLineItems, setMoLineItems] = useState([]);
  const [partReturnStatuses, setPartReturnStatuses] = useState([]);
  const [photoUploadPreview, setPhotoUploadPreview] = useState(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [MODetailInput, setMODetailInput] = useState({
    MOID: "",
    moOrderName: "",
    SalesOrderNumber: "",
    lineNumber: "",
    partNumber: "",
    description: "",
    rohs: false,
    returnabilityFlag: false,
    functionalEquivalence: "",
    mediaHandlingPart: "",
    pickPackInstructions: "",
    collectionInstructions: "",
    customerResponse: "",
    rejectedReason: "",
    otherReason: "",
    partAuthorizationReason: "",
    partAuthorizationDetail: "",
    originalPartNumber: "",
    offeredPartNumber: "",
    offeredPartDescription: "",
    mainComponent: "",
    gratisFlag: false,
    failureId: null,
    failureName: "",
    serialNumber: "",
    removedPartNumber: "",
    removedSerialNumber: "",
    removedPartDescription: "",
    UEFICode: "",
    UEFI_NO : "",

    QuantityUsed : true,
    CTValidation: true,
    PartReturnStatusId : null,
    PartReturnStatusName : "",
    PartReturnDOA : false,
    DOAReason : "",
    PhotoPartUnit : null,
    GoodReturnReason : null,
  });

  const fetchMoLineItems = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Please wait a moment",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
        customClass: {
          popup: "z-[9999]",
        },
      });

      const res = await ApiCustomer.get(
        `/api/material-order/material-order-line-items/${lineItemID}`
      );
      const data = res.data.data;

      setMoLineItems(data);
      setMODetailInput({
        MOID: data.MOID,
        moOrderName: data ? `${data.MOID} - ${data.LineNumber}` : null,
        SalesOrderNumber: data.SalesOrderNumber || "",
        lineNumber: data.LineNumber?.toString() || "",
        partNumber: data.PartNumber || "",
        description: data.Description || "",
        rohs: data.servicecatalog_parts?.ROHS_Flag || false,
        returnabilityFlag: data.servicecatalog_parts?.Returnable_Flag || false,
        functionalEquivalence: data.FunctionalEquivalence || "",
        mediaHandlingPart: data.MediaHandlingPart || "",
        pickPackInstructions: data.PickPackInstructions || "",
        collectionInstructions: data.CollectionInstructions || "",
        customerResponse: data.CustomerResponse || "",
        rejectedReason: data.RejectedReason || "",
        otherReason: data.OtherReason || "",
        partAuthorizationReason: data.PartAuthorizationReason || "",
        partAuthorizationDetail: data.PartAuthorizationDetail || "",
        originalPartNumber: data.OriginalPartNumber || "",
        offeredPartNumber: data.OfferedPartNumber || "",
        offeredPartDescription: data.OfferedPartDescription || "",
        mainComponent: data.MainComponent || "",
        gratisFlag: data.GratisFlag || false,
        failureId: data.FailureId || null,
        failureName: data.failure?.Name || "",
        atpStatus: data.ATPStatus || "",
        serialNumber: data.SerialNumber || "",
        removedPartNumber: data.RemovedPartNumber || "",
        removedSerialNumber: data.RemovedSerialNumber || "",
        removedPartDescription: data.RemovedPartDescription || "",
        UEFICode: data.UEFICode || "",
        UEFI_NO: data.UEFI_NO || "",
        QuantityUsed: data.QuantityUsed ?? true,
        CTValidation: data.CTValidation ?? true,
        PartReturnStatusId: data.PartReturnStatusId ?? null,
        PartReturnStatusName: data.partReturnStatus?.StatusName || "",
        PartReturnDOA: data.partReturnStatus?.DOA || false,
        DOAReason: data.DOAReason || "",
        PhotoPartUnit: data.PhotoPartUnit || null,
        GoodReturnReason: data.GoodReturnReason ?? null,
      });
      updateDraft("moliId", data.lineItemID);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch Material Line Items", "error");
    } finally {
      Swal.close();
    }
  };

  useEffect(() => {
    fetchMoLineItems();
  }, []);

  useEffect(() => {
    const fetchPartReturnStatuses = async () => {
      try {
        const response = await ApiCustomer.get("/api/part-return-status");
        setPartReturnStatuses(response.data?.data ?? []);
      } catch (error) {
        toast.error(error?.response?.data?.message ?? "Failed to fetch Part Return Statuses:");
      }
    };

    fetchPartReturnStatuses();
  }, []);

  const handleChange = (field) => (eOrValue) => {
    const value = eOrValue?.target ? eOrValue.target.value : eOrValue;
    setMODetailInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuantityUsedToggle = (value) => {
    setMODetailInput((prev) => {
      const nextState = { ...prev, QuantityUsed: value };
      if (prev.PartReturnStatusId !== null) {
        const matchedStatus = partReturnStatuses.find(
          (status) =>
            status.ReturnStatusId === prev.PartReturnStatusId &&
            status.StatusQuantityType === value,
        );
        if (!matchedStatus) {
          nextState.PartReturnStatusId = null;
          nextState.PartReturnStatusName = "";
          nextState.PartReturnDOA = false;
          nextState.DOAReason = "";
        }
      }
      if (value) {
        nextState.GoodReturnReason = null;
      }
      return nextState;
    });

    if (value && MODetailInput.PhotoPartUnit) {
      handleRemovePhoto();
    }
  };

  const handlePartReturnStatusChange = (statusId) => {
    if (!statusId) {
      setMODetailInput((prev) => ({
        ...prev,
        PartReturnStatusId: null,
        PartReturnStatusName: "",
        PartReturnDOA: false,
        DOAReason: "",
      }));
      return;
    }

    const selectedStatus = partReturnStatuses.find(
      (status) => status.ReturnStatusId.toString() === statusId.toString(),
    );

    if (!selectedStatus) {
      return;
    }

    setMODetailInput((prev) => ({
      ...prev,
      PartReturnStatusId: selectedStatus.ReturnStatusId,
      PartReturnStatusName: selectedStatus.StatusName,
      PartReturnDOA: selectedStatus.DOA,
      DOAReason: selectedStatus.DOA ? prev.DOAReason || "" : "",
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target?.files?.[0];
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoUploadPreview(previewUrl);
    setPhotoUploadLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    if (MODetailInput.PhotoPartUnit) {
      formData.append("existingPath", MODetailInput.PhotoPartUnit);
    }

    try {
      const response = await ApiCustomer.post(
        `/api/material-order/material-order-line-items/${lineItemID}/upload-photo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      const uploadedPath = response.data?.data?.path;
      if (uploadedPath) {
        setMODetailInput((prev) => ({
          ...prev,
          PhotoPartUnit: uploadedPath,
        }));
      }
    } catch (error) {
      Swal.fire(
        "Upload Failed",
        error.response?.data?.message || "Failed to upload unit photo.",
        "error",
      );
    } finally {
      setPhotoUploadLoading(false);
      setPhotoUploadPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    const currentPath = MODetailInput.PhotoPartUnit;

    setPhotoUploadPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setMODetailInput((prev) => ({
      ...prev,
      PhotoPartUnit: null,
    }));

    const isStoredPath =
      typeof currentPath === "string" && currentPath.startsWith("/uploads/");

    if (isStoredPath) {
      try {
        await ApiCustomer.delete(
          `/api/material-order/material-order-line-items/${lineItemID}/upload-photo`,
          { params: { path: currentPath } },
        );
      } catch (error) {
        toast.warning("Failed to delete PhotoPartUnit file:", error);
      }
    }
  };

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

  const resolvedPhotoSrc = useMemo(() => {
    if (photoUploadPreview) {
      return photoUploadPreview;
    }

    const assetPath = MODetailInput.PhotoPartUnit;
    if (!assetPath) {
      return null;
    }
    if (assetPath.startsWith("http://") || assetPath.startsWith("https://") || assetPath.startsWith("data:")) {
      return assetPath;
    }
    if (assetPath.startsWith("/")) {
      return `${apiBaseUrl}${assetPath}`;
    }
    return `${apiBaseUrl}/${assetPath}`;
  }, [photoUploadPreview, MODetailInput.PhotoPartUnit, apiBaseUrl]);

  const filteredPartReturnOptions = useMemo(() => {
    const baseOptions = partReturnStatuses
      .filter(
        (status) =>
          status.StatusQuantityType === Boolean(MODetailInput.QuantityUsed),
      )
      .map((status) => ({
        value: status.ReturnStatusId.toString(),
        label: status.StatusName,
        data: status,
      }));

    const selectedId =
      MODetailInput.PartReturnStatusId !== null
        ? MODetailInput.PartReturnStatusId.toString()
        : null;

    if (selectedId && !baseOptions.some((option) => option.value === selectedId)) {
      const selectedFromSource = partReturnStatuses.find(
        (status) => status.ReturnStatusId.toString() === selectedId,
      );

      if (selectedFromSource) {
        baseOptions.push({
          value: selectedFromSource.ReturnStatusId.toString(),
          label: selectedFromSource.StatusName,
          data: selectedFromSource,
        });
      } else if (MODetailInput.PartReturnStatusName) {
        baseOptions.push({
          value: selectedId,
          label: MODetailInput.PartReturnStatusName,
          data: { DOA: MODetailInput.PartReturnDOA },
        });
      }
    }

    return baseOptions;
  }, [
    partReturnStatuses,
    MODetailInput.QuantityUsed,
    MODetailInput.PartReturnStatusId,
    MODetailInput.PartReturnStatusName,
    MODetailInput.PartReturnDOA,
  ]);

  const selectedPartReturnStatus = useMemo(
    () =>
      partReturnStatuses.find(
        (status) => status.ReturnStatusId === MODetailInput.PartReturnStatusId,
      ) || null,
    [partReturnStatuses, MODetailInput.PartReturnStatusId],
  );

  const isDOASelected = Boolean(
    (selectedPartReturnStatus && selectedPartReturnStatus.DOA) ?? MODetailInput.PartReturnDOA,
  );

  const renderPartReturnLabel = (option) => {
    if (typeof option === "string") {
      return option;
    }
    const label = option?.label ?? "";
    return option?.data?.DOA ? `${label} (DOA)` : label;
  };


  const handleUpdate = async () => {
    try {
      await ApiCustomer.patch(
        `/api/material-order/material-order-line-items/${lineItemID}`,
        {
          Description: MODetailInput.description,
          PickPackInstructions: MODetailInput.pickPackInstructions,
          CollectionInstructions: MODetailInput.collectionInstructions,
          CustomerResponse: MODetailInput.customerResponse,
          RejectedReason: MODetailInput.rejectedReason,
          OtherReason: MODetailInput.otherReason,
        }
      );
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Error updating Material Order Line Item");
    }
  };

  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false); 

useEffect(() => {
  ApiCustomer.get("/api/failure/options").then((res) => {
    const defaultOptions = res.data.map((f, index) => ({
      value: f.FailureId.toString(), 
      label: (
        <div className="flex flex-col">
          <span className="font-medium">
            {`${index === 0 ? "55" : index === 1 ? "72" : index === 2 ? "73" : index + 1}`} - {f.Name}
          </span>
          <span className="text-xs text-gray-500">{f.Description ?? ""}</span>
        </div>
      ),
    }));
    setSearchResults(defaultOptions);
  });

  if (MODetailInput.failureId) {
    ApiCustomer.get(`/api/failure/${MODetailInput.failureId}`)
      .then((res) => {
        const f = res.data.data;
        setInputValue(f.FailureId.toString()); 
      })
      .catch(() => {
        
      });
  }
}, [MODetailInput.failureId]);


  const fetchFailures = debounce((query) => {
    if (!query || query.length < 2) return;
    ApiCustomer.get(`/api/failure/options?q=${query}`).then((res) => {
      const limited = res.data.slice(0, 3).map((f) => ({
        value: f.FailureId.toString(),
        label: `${f.Name} — ${f.Description ?? ""}`,
      }));
      setSearchResults(limited);
    });
  }, 300);
  
  const handleInputChange = (value) => {
    setInputValue(value);
    fetchFailures(value);
    const failureId = Number(value);

    if (Number.isNaN(failureId)) return;
    setMODetailInput(prev => {
    let next = {
      ...prev,
      failureId,
      isQuantityUsedDisabled: false,
    };

    if (failureId === 6) {
      next.isQuantityUsedDisabled = true;
    } 
    else if (failureId === 7) {
      next.QuantityUsed = false;
    } 
    else if (failureId === 8) {
      next.QuantityUsed = true;
    }

    return next;
  });
  };

  const tabs = [
    { value: "mo_details", label: "MO Details" },
    { value: "mo_failure", label: "Failure & Return Details" },
    { value: "mo_attachments", label: "Attachments" },
  ];

  let canEdit;
  let canEditCE;
  const allowedRoles = ["apo","lg","admin","spv"]
  if (moLineItems?.Status !== "Closed" && moLineItems?.Status !== "Cancelled") {
    canEditCE = user?.role  === "ce" || user?.role === "celead" || user?.role === "admin" || user?.role === "spv"
    canEdit = allowedRoles.includes(user?.role)
  } else {
    canEdit = false
    canEditCE = false
  }

  return (
    <div className="bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
      {moLineItems.Status === "Closed" ? (
        <div className="p-4  text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500">
          This material order line is <strong>read-only</strong> because it is{" "}
          <strong>Closed</strong>.
          </div>
          ) : moLineItems.Status === "Cancelled" ? (
        <div className="p-4  text-red-700 bg-red-100 border-l-4 border-red-500">
          This material order line is <strong>read-only</strong> because it is{" "}
          <strong>Cancelled</strong>.
        </div>
      ) : null}
      {moLineItems.MOID ? (
        <TabsServiceMOLineItems
          MOLineDetails={MODetailInput}
          LineItemID={lineItemID}
          moLineItems={moLineItems}
        />
      ) : (
        ""
      )}
      <Card className="mt-2 rounded-none border-none bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
        <CardContent className={"p-0"}>
          <Tabs defaultValue="mo_details">
            <Card className={"p-2 rounded-none dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600"}>
              <CardTitle className="text-xl ">
                {moLineItems.MOID} - {moLineItems.LineItemID}
              </CardTitle>
              <CardTitle className="text-lg">
                Material Order Line Item  For <strong>{MODetailInput.description}</strong> 
              </CardTitle>
            <div className="  w-full overflow-x-auto h-fit no-scrollbar p-0">
              <TabsList className="sm:w-full  gap-2  bg-gray-100 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600 dark:rounded-none h-full">
                {tabs.map((tab, index) =>
                  tab.component ? (
                    <div key={index}>{tab.component}</div>
                  ) : (
                    <TabsTrigger
                      key={index}
                      variant={"modernUnderline"}
                      value={tab.value}
                      disabled={tab.disable}
                      className="dark:text-white "
                      hidden={tab.hidden}
                    >
                      {tab.label}
                    </TabsTrigger>
                  )
                )}
              </TabsList>
    </div>
            </Card>

            <TabsContent
              value="mo_details"
              className={"p-2 flex flex-col"}
            >
              <Card className="rounded-md dark:bg-gradient-to-tl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                <CardHeader>
                  <CardTitle className={"text-lg "}>MO Order Details</CardTitle>
                  <hr className="dark:border-gray-400"/>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <CaseField label={"MO Order Name"} lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      value={MODetailInput.moOrderName}
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"Part/Product Number"} lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      value={MODetailInput.partNumber}
                    />
                  </CaseField>

                  <CaseField label={"Collection Instructions"} lock={!canEditCE}>
                    <SearchCommandBlock
                      value={MODetailInput.collectionInstructions}
                      onChange={handleChange("collectionInstructions")}
                      options={["None", "Pickup", "DropOff", "ThirdParty"]}
                    />
                  </CaseField>

                  <CaseField label={"Sales Order Number"} lock>
                    <Input
                     className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      value={moLineItems?.materialorder?.SalesOrderNumber}
                      placeholder= "---"
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"UEFI CODE"} lock>
                    <SearchCommandBlock
                      value={MODetailInput.UEFICode}
                      onChange={handleChange("UEFICode")}
                      options={["None", "FID", "Non-FID"]}
                       className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                    />
                  </CaseField>

                  {MODetailInput?.UEFICode == "FID" && (
                    <CaseField label={"UEFI Number"} lock>
                      <Input
                       className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        value={MODetailInput.UEFI_NO}
                        placeholder= "---"
                        onChange={handleChange("UEFI_NO")}
                        />
                    </CaseField>
                  )}


                  <CaseField label={"RoHS"} lock>
                    <Input
                      value={MODetailInput.rohs ? "Yes" : "No"}
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>

                  <CaseField label={"Returnability Flag"} lock>
                    <Input
                      value={MODetailInput.returnabilityFlag ? "Yes" : "No"}
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>

                  
                  <CaseField label={"Description"}  lock >
                    <Textarea
                      className="ring-1 ring-gray-300 bg-gray-50 italic dark:bg-gray-500/10 dark:border-gray-400"
                      name="description"
                      value={MODetailInput.description}
                      onChange={handleChange}
                      placeholder="Description"
                    />
                  </CaseField>

                  <Accordion type="Single" collapsible className="col-span-1 md:col-span-4">
                    <AccordionItem value="more-details">
                      <AccordionTrigger className={"decoration-transparent cursor-pointer p-2 border-2"}>More Details . . .</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-6 gap-4 p-4">
                          <CaseField label={"Media Handling Part"} lock>
                            <Input
                              value={MODetailInput.mediaHandlingPart}
                              variant={"invisible"}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Functional Equivalence"} lock>
                            <Input
                              value={MODetailInput.functionalEquivalence}
                              variant="invisible"
                              placeholder= '---'
                            />
                          </CaseField>

                          <CaseField label={"Line Number"} lock>
                            <Input
                              value={MODetailInput.lineNumber}
                              variant={"invisible"}
                              readOnly
                            />
                          </CaseField>

                          <CaseField label={"Pick Pack Instructions"} lock>
                            <Input
                              name="pickPackInstructions"
                              value={MODetailInput.pickPackInstructions}
                              onChange={handleChange}
                              placeholder="---"
                              variant={"invisible"}
                            />
                          </CaseField>

                          <CaseField label={"Customer Response"} lock>
                            <Input
                              name="customerResponse"
                              value={MODetailInput.customerResponse}
                              onChange={handleChange}
                              placeholder="---"
                              variant={"invisible"}
                            />
                          </CaseField>

                          <CaseField label={"Rejected Reason"} lock>
                            <Input
                              name="rejectedReason"
                              value={MODetailInput.rejectedReason}
                              onChange={handleChange}
                              placeholder="---"
                              variant={"invisible"}
                            />
                          </CaseField>

                          <CaseField label={"Other Reason"} lock>
                            <Input
                              variant={"invisible"}
                              name="otherReason"
                              value={MODetailInput.otherReason}
                              onChange={handleChange}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Part Authorization Reason"} lock>
                            <Input
                              value={MODetailInput.partAuthorizationReason}
                              variant={"invisible"}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Part Authorization Detail"} lock>
                            <Input
                              value={MODetailInput.partAuthorizationDetail}
                              variant={"invisible"}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Functional Equivalent"} lock>
                            <Input
                              variant={"invisible"}
                              value={MODetailInput.functionalEquivalence}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Original Part Number"} lock>
                            <Input
                              variant={"invisible"}
                              value={MODetailInput.originalPartNumber}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Offered Part Number"} lock>
                            <Input
                              value={MODetailInput.offeredPartNumber}
                              variant={"invisible"}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Offered Part Description"} lock>
                            <Input
                              value={MODetailInput.offeredPartDescription}
                              variant={"invisible"}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Main Component"} lock>
                            <Input
                              value={MODetailInput.mainComponent}
                              variant={"invisible"}
                              placeholder="---"
                            />
                          </CaseField>

                          <CaseField label={"Gratis Flag"} lock>
                            <Input
                              variant={"invisible"}
                              value={MODetailInput.gratisFlag ? "Yes" : "No"}
                            />
                          </CaseField>

                          <CaseField label={"ATP Status"} lock>
                            <Input
                              variant={"invisible"}
                              value={MODetailInput.atpStatus}
                              placeholder="---"
                            />
                          </CaseField>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="rounded-md " hidden>
                <span className="ml-5 text-xl font-bold">
                  Outbound to Customer
                </span>
                <CardContent className="grid h-10 grid-flow-col grid-rows-2 gap-5">
                  <Card className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Outbound to Customer</span>
                    <span className="ml-40">...</span>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="mo_failure"
              className={" flex flex-col gap-4 p-2"}
            >
              <Card className="flex-col dark:bg-gradient-to-tl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Failure & Usage Details
                  </CardTitle>
                  <hr className="dark:border-gray-400"/>
                </CardHeader>
                <CardContent className="grid items-center grid-cols-1 md:grid-cols-4 gap-6 m-1">
                  <CaseField label="CT Validation"  lock>
                    <SearchCommandBlock
                    className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                    value={MODetailInput.CTValidation === true ? "Pass" : MODetailInput.CTValidation === false ? "Fail" : ""}
                    onChange={(val) => {
                      handleChange("CTValidation")(
                        val === 'Pass' ? true : val === 'Fail' ? false : null
                      )
                    }}
                    options={[
                      'Pass',
                      'Fail'
                    ]}
                    />
                  </CaseField>
                  
          
                <CaseField label={"Failure Code"} lock>
                <div className="relative w-full">
                  <SearchCommandBlock
                    name="failureId"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Search Failure..."
                    options={searchResults}
                    readOnly
                    className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                  />
              </div>
            </CaseField>

                    <CaseField label="Return CT Key" lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      name="removedPartNumber"
                      value={MODetailInput.removedPartNumber}
                      onChange={handleChange('removedPartNumber')}
                      placeholder="---"
                      
                    />
                  </CaseField>
                  
                  <CaseField label="New CT Key" lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      name="removedSerialNumber"
                      value={MODetailInput.removedSerialNumber}
                      onChange={handleChange('removedSerialNumber')}
                      placeholder="---"
                    />
                  </CaseField>

                  <CaseField label="Additional Failure Code" lock hide={true}>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" 
                    />
                  </CaseField>

                  <CaseField label="Part Usage Code" lock hide={true}>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>

                  <CaseField label="Part Used" lock>
                    <div className="flex items-center gap-2">
                      <Switch
                          checked={!!MODetailInput.QuantityUsed}
                          onCheckedChange={(checked) =>
                            setMODetailInput(prev => ({
                              ...prev,
                              QuantityUsed: checked,
                            }))
                          }
                          disabled
                      />
                      <span>{MODetailInput.QuantityUsed ? "Used" : "Not Used"}</span>
                    </div>
                  </CaseField>

                  <CaseField label="Part Return Status" 
                    lock
                    >
                    <SearchCommandBlock
                    className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                      value={
                        MODetailInput.PartReturnStatusId !== null
                          ? MODetailInput.PartReturnStatusId.toString()
                          : null
                      }
                      onChange={handlePartReturnStatusChange}
                      placeholder="Select Part Return Status"
                      options={filteredPartReturnOptions}
                      renderLabel={renderPartReturnLabel}
                    />
                  </CaseField>

                  <CaseField
                    label="DOA Reason"
                    hide={!isDOASelected}
                    lock
                  >
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      name="DOAReason"
                      value={MODetailInput.DOAReason}
                      onChange={handleChange("DOAReason")}
                      placeholder="Enter DOA reason"
                    />
                  </CaseField>

                  <CaseField
                    label="Unit Photo"
                    hide={Boolean(MODetailInput.QuantityUsed)} lock>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                  </CaseField>
                  
                  <CaseField
                    label="Good Return Reason"
                    hide={Boolean(MODetailInput.QuantityUsed)}
                    lock
                  >
                    <SearchCommandBlock
                      value={MODetailInput.GoodReturnReason}
                      onChange={handleChange("GoodReturnReason")}
                      placeholder="Select reason"
                      options={GOOD_RETURN_REASON_OPTIONS}
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                    />
                  </CaseField>
                  <div className=" col-span-1 md:col-span-4 flex flex-col gap-2 pl-10">
                     {photoUploadLoading && (
                       <span className="text-sm text-muted-foreground">Uploading photo...</span>
                     )}

                     {/* Thumbnail */}
                     {resolvedPhotoSrc && (
                       <div className="flex items-start gap-3">
                         <img
                           src={resolvedPhotoSrc}
                           alt="Unit photo preview"
                           className="max-h-24 rounded border object-cover cursor-pointer"
                           onClick={() => setPreviewSrc(resolvedPhotoSrc)} // klik untuk preview
                         />
                         {canEdit && (
                           <Button
                             type="button"
                             variant="outline"
                             onClick={handleRemovePhoto}
                           >
                             Remove
                           </Button>
                         )}
                       </div>
                     )}

                     {/* Modal Preview */}
                     {previewSrc && (
                       <div
                         className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                         onClick={() => setPreviewSrc(null)} // klik luar untuk tutup
                       >
                         <div className="max-w-3xl max-h-[90vh]">
                           <img
                             src={previewSrc}
                             alt="Preview"
                             className="rounded-lg max-h-[90vh] object-contain"
                           />
                         </div>
                       </div>
                     )}
                  </div>

                  <CaseField label="Part Order Consumption Comment" lock className={"hidden"} >
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" hidden/>
                  </CaseField>

                  <CaseField label="Removed Part Desc" lock className={"hidden"}>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      name="removedPartDescription"
                      value={MODetailInput.removedPartDescription}
                      onChange={handleChange}
                      placeholder="---"
                      hidden
                    />
                  </CaseField>
                </CardContent>
              </Card>

              <Card className="rounded-md " hidden>
                <CardHeader>
                  <CardTitle className="text-lg">Part Return Details</CardTitle>
                  <hr />
                </CardHeader>
                <CardContent className="grid items-center grid-cols-6 gap-10 m-1">
                  <CaseField label="Returnable Code" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>

                  <CaseField label="Return Type Code Identifier" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>

                  <CaseField label="Return Instructions" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>

                  <CaseField label="Return Tracking Number" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>

                  <CaseField label="Return Override Flag" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>

                  <CaseField label="Return Ovveride Reason" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>


                  <CaseField label="RMA Identifier" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>

                  <CaseField label="Return Deadline" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mo_attachments" className={"p-2"}>
              <Card className="flex-col dark:bg-gradient-to-tl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                <CardContent className="grid gap-5">
                  <span className="text-xl font-bold">Timeline</span>
                  <CaseField className="flex font-bold">
                    <Input
                      placeholder="Search Timeline"
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    ></Input>
                  </CaseField>
                  <span className="text-xl font-bold">Create a note</span>
                  <div>
                    <Input
                      type="text"
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="Tittle"
                    ></Input>
                    <Textarea
                      placeholder="Note"
                      className="ring-1 mt-2 ring-gray-300 bg-gray-50 italic dark:bg-gray-500/10 dark:border-gray-400"
                    ></Textarea>
                    <Button variant="outline"  className={'mt-2 mr-3 cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}>
                      Add note
                    </Button>
                    <Button variant="outline" className=" className={'cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

