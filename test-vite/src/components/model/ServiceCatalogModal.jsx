import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"
import { Plus,PhoneCall, Copy, ExternalLink, XIcon, ArchiveIcon, User } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { SearchCommandBlock, SelectBar3, SelectBarContact4, SelectYN } from "../sc-select";
import { 
  SelectBarContact,
  SelectBarContact2,
  SelectBarContact3,
  SelectBar,
  SelectBar1,
  SelectBar2,
 } from "@/components/sc-select";
 import { 
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectLabel,
   SelectTrigger,
   SelectValue,
  } from '@/components/ui/select'
  
  import CaseField from "../CaseField";

 import { SnInput } from "../sn-input";
import { Textarea } from "../ui/textarea";
import { Pencil, Trash } from "lucide-react";
//import API
import ApiCustomer from "@/api";

import Swal from "sweetalert2";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { getUserFromToken } from "@/lib/utils/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ServiceRequestPDF from "../service-request-form";
import { pdf } from '@react-pdf/renderer';

import { cn } from "@/lib/utils";

import { useAuth } from "@/context/auth-context";
import { ServiceCatalogWarrantyTable } from "../table-data/ServiceCatalogWarranty";
import { CreateNewPartModal } from "./CreateNewPartModal";
import { useServerPageTable } from "../table-data/config/data-use-table";
import { PartCatalogPaginated } from "../table-data/PartCatalogTable";

function partFiltersToParams(filters) {
  const p = { mode: "paginated" };
  for (const f of filters) {
    const v = Array.isArray(f.value) ? f.value[0] : f.value;
    if (!v) continue;
    switch (f.id) {
      case "Keyword":           p.keyword = v; break;
      default: break;
    }
  }
  return p;
}

function makeFetch(field) {
  return async (q) => {
    const res = await ApiCustomer.get("/api/service-log/parts-catalog", {
      params: { mode: "distinct", field, q: q ?? "", limit: 30 },
    });
    return (res.data.values ?? []).map((v) => ({ label: v, value: v }));
  };
}

// const fetchCatagory = makeFetch("Keyword");
// ── Shared filter params ──────────────────────────────────────────────────────

// function partFiltersToParams(filters) {
//   const p = {};
//   for (const f of filters) {
//     if (f.id === "PartNumber")      p.partNumber = f.value;
//     if (f.id === "Keyword")         p.keyword    = f.value;
//     if (f.id === "PartDescription") p.partDesc   = f.value;
//   }
//   return p;
// }

function partSortToParams(s) {
  return {
    sortBy:  s[0]?.id   ?? "PartNumber",
    sortDir: s[0]?.desc ? "desc" : "asc",
  };
}

function StepWarranty({
  asset,
  warrantyOffer,
  selectedWarrantyServices,
  setSelectedWarrantyServices,
  onNext,
  onCancel,
}) {
  return (
    <div className="flex flex-col h-full p-3">
      <div className="grid grid-cols-4 gap-4">
        <CaseField label="Product Number" lock>
          <Input value={asset?.ProductNumber || "-"} readOnly />
        </CaseField>
        <CaseField label="Product Name" lock>
          <Input
            value={asset?.product_information?.ProductName || "-"}
            readOnly
          />
        </CaseField>
        <CaseField label="Serial Number" lock>
          <Input value={asset?.SerialNumber || "-"} readOnly />
        </CaseField>
        <CaseField label="Warranty Status" lock>
          <Input
            value={`${asset?.Warranty_Status ?? ""} - ${asset?.WarrantyOTCCode?.Description ?? ""}`}
          />
        </CaseField>
      </div>

      <div className="flex-1 overflow-auto mt-4">
        <ServiceCatalogWarrantyTable
          data={warrantyOffer}
          selectedWarrantyServices={selectedWarrantyServices}
          setSelectedWarrantyServices={setSelectedWarrantyServices}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!selectedWarrantyServices} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function StepParts({
  hook,
  selectedPartCatalog,
  setSelectedPartCatalog,
  onNext,
  onPrev,
}) {
  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex-1 overflow-hidden">
        <PartCatalogPaginated
          hook={hook}
          selectedPartCatalog={selectedPartCatalog}
          setSelectedPartCatalog={setSelectedPartCatalog}
          fetchFilter={{
            Category : makeFetch("Keyword")
          }}
        />
      </div>

      <div className="flex justify-end mt-4 gap-4">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

function StepConfirm({
  asset,
  selectedPartCatalog,
  selectedWarrantyServices,
  onSubmit,
  onPrev,
  showUEFINumberHeader,
  subTotalConfirmServices,
  selected,
  setSelected,
  assignApo,
  setAssignApo,
  filteredUserAssign,
  isOutWarranty,
  addNewpart,
  effectiveWarrantyService,
  // Added required missing props
  onQtyChange,
  onRemovedPartNumberChange,
  onUEFICodeChange,
  onUEFINoChange,
  onRemovePart,
}) {
  return (
    <div className="flex flex-col h-120 p-3">
      <div className="flex flex-col lg:flex-row justify-evenly gap-0 p-0 my-2">
        <div className="grid grid-cols-2 p-2  gap-2">
          <CaseField label="Product Number" lock>
            <Input value={asset?.ProductNumber || "-"} readOnly />
          </CaseField>
          <CaseField label="Product Name" lock>
            <Input
              value={asset?.product_information?.ProductName || "-"}
              readOnly
            />
          </CaseField>
          <CaseField label="Serial Number" lock>
            <Input value={asset?.SerialNumber || "-"} readOnly />
          </CaseField>
          <CaseField label="Warranty Status" lock>
            <Input
              value={`${asset?.Warranty_Status ?? ""} - ${asset?.WarrantyOTCCode?.Description ?? ""}`}
            />
          </CaseField>
        </div>
        <div className="grid grid-cols-2 p-2  gap-2">
          <CaseField label="Service OfferID" lock>
            <Input
              value={effectiveWarrantyService?.Service_offerID ?? "-"}
              readOnly
            />
          </CaseField>
          <CaseField label="Description" lock>
            <Input
              value={effectiveWarrantyService?.Service_description}
              readOnly
            />
          </CaseField>
        </div>
      </div>
      <Table
        className="text-[11px] leading-tight"
        potrait={"mt-3 rounded-xl border-2 max-h-105 2xl:max-h-195"}
      >
        <TableHeader className={"sticky top-0 z-9"}>
          <TableRow className={"bg-blue-400"}>
            <TableHead className={"font-bold text-black"}>Select</TableHead>
            <TableHead className={"font-bold text-black"}>Part #</TableHead>
            <TableHead className={"font-bold text-black"}>
              Description
            </TableHead>
            <TableHead className={"font-bold text-black"}>Unit Price</TableHead>
            <TableHead className={"font-bold text-black"}>Qty</TableHead>
            <TableHead className={"font-bold text-black"}>
              CT KEY RETURN
            </TableHead>
            <TableHead className={"font-bold text-black"}>UEFI CODE</TableHead>
            {showUEFINumberHeader && (
              <TableHead className={"font-bold text-black"}>
                UEFI Number
              </TableHead>
            )}
            <TableHead colSpan={2} className={"font-bold text-black"}>
              Price
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedPartCatalog.map((part, index) => {
            const isChecked = selectedPartCatalog.some(
              (item) => item.PartNumber === part.PartNumber,
            );
            return (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      onRemovePart(part, checked) // Updated to use prop
                    }
                  />
                </TableCell>
                <TableCell>{part.PartNumber}</TableCell>
                <TableCell>{part.PartDescription}</TableCell>
                <TableCell>{part.Shipping_Fee}</TableCell>
                <TableCell>{part.qty} </TableCell>
                <TableCell>
                  <Input
                    placeholder="Enter Return CT Key"
                    className="bg-white"
                    value={part.RemovedPartNumber || ""}
                    onChange={(e) =>
                      onRemovedPartNumberChange( // Updated to use prop
                        part.PartNumber,
                        e.target.value,
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={part.UEFICode || ""}
                    onValueChange={(val) =>
                      onUEFICodeChange(part.PartNumber, val) // Updated to use prop
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DHU">DHU</SelectItem>
                      <SelectItem value="FID">FID</SelectItem>
                      <SelectItem value="MPS">MPS</SelectItem>
                      <SelectItem value="PND">PND</SelectItem>
                      <SelectItem value="PPR">PPR</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                {part.UEFICode === "FID" ? (
                  <TableCell>
                    <Input
                      placeholder="Enter UEFI No"
                      value={part.UEFI_NO || ""}
                      onChange={(e) =>
                        onUEFINoChange(part.PartNumber, e.target.value) // Updated to use prop
                      }
                      className="w-32"
                    />
                  </TableCell>
                ) : null}
                <TableCell>
                  {asset?.WarrantyOTCCode?.WarrantyCondition === "OutWarranty"
                    ? part.Total
                    : 0}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell colSpan={4}></TableCell>
            <TableCell colSpan={2}>Sub Total</TableCell>
            <TableCell>{subTotalConfirmServices}</TableCell>
          </TableRow>
          <TableRow className={"bg-blue-400"}>
            <TableCell colSpan={4}></TableCell>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell>--</TableCell>
            <TableCell>--</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4 gap-4">
        <div className="inline-flex items-center gap-2">
          <Label htmlFor="incident" className={"font-bold whitespace-nowrap"}>
            Incident Type :
          </Label>
          <Select
            value={selected}
            onValueChange={setSelected}
            defaultValue="DepotRepair"
          >
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="CE Assist-APJ-Computing">
                  CE Assist-APJ-Computing
                </SelectItem>
                <SelectItem value="CE Assist-APJ-Printing">
                  CE Assist-APJ-Printing
                </SelectItem>
                <SelectItem value="Cust Sat-Issue-APJ-Computing">
                  Cust Sat Issue-APJ-Computing
                </SelectItem>
                <SelectItem value="Cust Sat-Issue-APJ-Printing">
                  Cust Sat Issue-APJ-Printing
                </SelectItem>
                <SelectItem value="IMACD-APJ-Computing">
                  IMACD-APJ-Computing
                </SelectItem>
                <SelectItem value="IMACD-APJ-Printing">
                  IMACD-APJ-Printing
                </SelectItem>
                <SelectItem value="Installation Only-APJ-Computing">
                  Installation Only-APJ-Computing
                </SelectItem>
                <SelectItem value="Installation Only-APJ-Printing">
                  Installation Only-APJ-Printing
                </SelectItem>
                <SelectItem value="PC Problem-APJ-Computing">
                  PC Problem-APJ-Computing
                </SelectItem>
                <SelectItem value="Print Problem-APJ-Printing">
                  Print Problem-APJ-Printing
                </SelectItem>
                <SelectItem value="Print Quality-APJ-Printing">
                  Print Quality-APJ-Printing
                </SelectItem>
                <SelectItem value="Prev Maint-APJ-Computing">
                  Prev Maint-APJ-Computing
                </SelectItem>
                <SelectItem value="Prev Maint-APJ-Printing">
                  Prev Maint-APJ-Printing
                </SelectItem>
                <SelectItem value="DepotRepair">Depot Repair</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {selectedPartCatalog.length > 0 && (
          <div className={"flex gap-2"}>
            <Label
              htmlFor="Assign_APO"
              className={"font-bold whitespace-nowrap"}
            >
              SELECT {isOutWarranty ? "CM" : "APO"} :{" "}
            </Label>
            <SearchCommandBlock
              value={assignApo}
              onChange={(selectedID) => {
                if (!selectedID) {
                  setAssignApo(null);
                  return;
                }
                const selectedUser = filteredUserAssign.find(
                  (user) => user.IDUser === selectedID,
                );
                if (selectedUser) {
                  setAssignApo(selectedUser.IDUser);
                }
              }}
              placeholder="--Select--"
              options={filteredUserAssign.map((user) => ({
                label: user.Name,
                value: user.IDUser,
              }))}
              renderLabel={(opt) => opt.label}
              getValue={(opt) => opt.value}
              className={"border-2 ring-1 ring-gray-200 bg-slate-100"}
            />
          </div>
        )}
        <Button className="" onClick={addNewpart}>
          Add Part
        </Button>
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onSubmit}>Create Order</Button>
      </div>
    </div>
  );
}

function StepIndicator({ active, label }) {
  return (
    <div
      className={`px-3 py-1 rounded-full text-sm font-medium transition
      ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
    >
      {label}
    </div>
  );
}

function HeaderTittle({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-3 border-b p-1">
      <StepIndicator active={currentStep === 1} label="Warranty" />
      <StepIndicator active={currentStep === 2} label="Parts" />
      <StepIndicator active={currentStep === 3} label="Confirm" />
    </div>
  );
}
export function ServiceCatalogModel({
  open,
  setOpen,
  caseDetails,
  serviceCatalogType,
  WOID = undefined,
}) {
  const { user } = useAuth();
  useEffect(() => {
    // Resetting modal state when serviceCatalogType changes
    setCurrentStep(1);
    setStep(0);
    setSelectedWarrantyServices(null);
    setSelectedPartCatalog([]);
    setSubTotalConfirmServices(0);
    setTotalTaxConfirmServices(0);
    setTotalConfirmServices(0);
    setPartNumberSearch("");
    setKeywordSearch("");
    setDescriptionSearch("");
  }, [serviceCatalogType]);

  const STEPS = {
    WARRANTY: 1,
    PARTS: 2,
    CONFIRM: 3,
  };
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  // If creating MO from WO, start directly at parts step
  useEffect(() => {
    if ((WOID || serviceCatalogType === "wo-add-mo") && open) {
      setCurrentStep(2);
    }
  }, [WOID, serviceCatalogType, open]);
  const [assetForWorkOrderCreation, setAssetForWorkOrderCreation] = useState(
    [],
  );
  const [modalPart, setModalPart] = useState(false);
  const [roleAssign, setRoleAssign] = useState([]);
  const [assignApo, setAssignApo] = useState(null);

  //product information
  const fetchDataAssets = async () => {
    try {
      const assetId = caseDetails?.AssetID;
      if (!assetId) return null;
      const response = await ApiCustomer.get(
        `/api/asset-information/${caseDetails.AssetID}`,
      );

      return response.data.data;
    } catch (e) {
      toast.error("error fetching Asset: ", e);
    }
  };

  const fetchUserAssign = async (role) => {
    try {
      const res = await ApiCustomer.get(`/api/user?role=${role}`);
      setRoleAssign(res.data.data);
    } catch (err) {
      toast.error("Error fetching role: ", err);
    }
  };

  //waranty
  //warranty state
  const [warrantyOffer, setWarrantyOffer] = useState([]);
  //fetching data function
  const fetchDataServiceOffer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get(
        `/api/service-log/warranty-services`,
      );

      return response.data.data;
    } catch (e) {
      setError("Failed to load Warranty Service");
      toast.error("error fetching Service Offer: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataServiceOffer().then((data) => {
      if (data) setWarrantyOffer(data);
    });
    fetchDataAssets().then((data) => {
      if (data) setAssetForWorkOrderCreation(data);
    });
    fetchUserAssign("");
  }, [caseDetails]);

  useEffect(() => {
    const fetchWarrantyFromWO = async () => {
      if (!WOID) return;

      try {
        const res = await ApiCustomer.get(`/api/work-order/${WOID}`);

        const woData = res.data.data;

        if (woData?.serviceCatalog?.warranty_services) {
          setWoWarrantyService(woData.serviceCatalog.warranty_services);
        }
      } catch (err) {
        toast.error("Error fetching WO Warranty:", err);
      }
    };

    fetchWarrantyFromWO();
  }, [WOID]);

  const [selected, setSelected] = useState("DepotRepair");

  const [selectedWarrantyServices, setSelectedWarrantyServices] =
    useState(null);
  const [woWarrantyService, setWoWarrantyService] = useState(null);

  const handlerWarrantyService = (service) => {
    setSelectedWarrantyServices(service);
  };

  useEffect(() => {}, [selectedWarrantyServices]);

  const hook = useServerPageTable({
    url: "/api/service-log/parts-catalog",
    pageSize: 20,
    defaultSorting: [{ id: "PartNumber", desc: false }],
    // filtersToParams: (f) => ({ mode: "paginated", ...partFiltersToParams(f) }),
    filtersToParams: partFiltersToParams, 
    sortToParams: partSortToParams,
  });

  const handlePartAdded = async (createdPart) => {
    // Rely on hook for updated data instead of manually tracking it
    hook.refresh();

    if (createdPart?.PartNumber) {
      setSelectedPartCatalog((prev) => {
        const alreadyExists = prev.some(
          (p) => p.PartNumber === createdPart.PartNumber,
        );
        if (alreadyExists) return prev;

        const price = parseFloat(createdPart.Price) || 0;

        return [
          ...prev,
          {
            ...createdPart,
            qty: 1,
            Total: price.toFixed ? price.toFixed(2) : price,
          },
        ];
      });
    }
  };

  //search part handler
  const [partNumberSearch, setPartNumberSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [descriptionSearch, setDescriptionSearch] = useState("");

  //handler part
  const [selectedPartCatalog, setSelectedPartCatalog] = useState([]);
  const handlerPartCatalog = (part, checked) => {
    if (checked) {
      setSelectedPartCatalog((prev) => [
        ...prev,
        {
          ...part,
          qty: 1,
          Total: part.Price,
        },
      ]);
    } else {
      setSelectedPartCatalog((prev) =>
        prev.filter((item) => item.PartNumber !== part.PartNumber),
      );
    }
  };
  useEffect(() => {
    handlerPriceConfirmServices();
  }, [selectedPartCatalog]);

  const warrantyCondition =
    assetForWorkOrderCreation?.AssetInformation?.WarrantyOTCCode
      ?.WarrantyCondition;

  const isOutWarranty = assetForWorkOrderCreation?.Warranty_Status === "01T";

  const filteredWarrantyOffers = warrantyOffer.filter((service) =>
    isOutWarranty
      ? service.WarrantyCondition === "OutWarranty"
      : service.WarrantyCondition === "InWarranty",
  );
  const filteredUserAssign = roleAssign.filter((user) =>
    isOutWarranty ? user.Role === "cm" : user.Role === "apo",
  );

  //hanlder confirm
  //handler qty price parts
  const handleQtyChangePartsCatalog = (partNumber, qty) => {
    setSelectedPartCatalog((prev) =>
      prev.map((item) => {
        if (item.PartNumber === partNumber) {
          const parsedQty = parseInt(qty) || 1;
          const price = parseFloat(item.Price) || 0;
          return {
            ...item,
            qty: parsedQty,
            Total: (parsedQty * price).toFixed(2),
          };
        }
        return item;
      }),
    );
  };

  const handleRemovedPartNumberChange = (partNumber, value) => {
    setSelectedPartCatalog((prev) =>
      prev.map((item) =>
        item.PartNumber === partNumber
          ? { ...item, RemovedPartNumber: value }
          : item,
      ),
    );
  };

  const handleUEFICodeChange = (partNumber, value) => {
    setSelectedPartCatalog((prev) =>
      prev.map((p) =>
        p.PartNumber === partNumber
          ? { ...p, UEFICode: value, UEFI_NO: "" }
          : p,
      ),
    );
  };

  const handleUEFINoChange = (partNumber, value) => {
    setSelectedPartCatalog((prev) =>
      prev.map((p) =>
        p.PartNumber === partNumber ? { ...p, UEFI_NO: value } : p,
      ),
    );
  };

  const showUEFINumberHeader = selectedPartCatalog.some(
    (p) => p.UEFICode === "FID",
  );

  //handle add part in confirm services
  const [tempSelectedParts, setTempSelectedParts] = useState([]);

  //handler Total Subtotal Confirm Services
  const [subTotalConfirmServices, setSubTotalConfirmServices] = useState(0);
  const [TotalTaxConfirmServices, setTotalTaxConfirmServices] = useState(0);
  const [totalConfirmServices, setTotalConfirmServices] = useState(0);
  const effectiveWarrantyService =
    selectedWarrantyServices ?? woWarrantyService;
  const handlerPriceConfirmServices = () => {
    let serviceTotal = selectedWarrantyServices
      ? parseFloat(selectedWarrantyServices.Price) || 0
      : 0;

    let partsTotal = selectedPartCatalog.reduce((acc, part) => {
      return acc + (parseFloat(part.Total) || 0);
    }, 0);

    if (
      assetForWorkOrderCreation?.WarrantyOTCCode?.WarrantyCondition ===
      "OutWarranty"
    ) {
      const subTotal = serviceTotal + partsTotal;
      setSubTotalConfirmServices(subTotal.toFixed(2));
    } else {
      setSubTotalConfirmServices(0);
    }
  };

  //createorder
  const createOrder = async () => {
    const hasPart = selectedPartCatalog.length > 0;
    if (hasPart && !assignApo) {
      toast.warning("APO IS NOT ASSIGN YET", {
        description: "PLEASE CHOOSE THE APO PATNER BEFORE CREATING ORDER",
        position: "top-center",
      });
      return;
    } else {
      // cek apakah ada part yang belum diisi UEFI Code
      const partWithoutUEFICode = selectedPartCatalog.find(
        (p) => !p.UEFICode || p.UEFICode.trim() === "",
      );

      const partWithoutCT = selectedPartCatalog.find(
        (p) => !p.RemovedPartNumber || p.RemovedPartNumber.trim() === "",
      );

      if (partWithoutCT) {
        toast.warning(
          `CT BAD belum diisi untuk part ${partWithoutCT.PartNumber}`,
          {
            description: "PLEASE FILL TE CT BAD BEFORE CREATING ORDER",
            position: "top-center",
          },
        );
        return;
      }
      if (partWithoutUEFICode) {
        toast.warning(
          `UEFI Code belum diisi untuk part ${partWithoutUEFICode.PartNumber}`,
          {
            description: "PLEASE CHOOSE THE UEFI CODE BEFORE CREATING ORDER",
            position: "top-center",
          },
        );
        return;
      }

      try {
        Swal.fire({
          title: "Creating Order...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading(),
        });
        const data = {
          user: getUserFromToken(),
        };

        // If WOID present or special mode, create only MO for existing WO
        const isCreateMOOnly = !!WOID || serviceCatalogType === "wo-add-mo";
        const res = isCreateMOOnly
          ? await (async () => {
              const createdMOIDs = [];
              for (const part of selectedPartCatalog) {
                const r = await ApiCustomer.post("/api/material-order", {
                  WOID: WOID,
                  selectedPartCatalog: [{ ...part, qty: part.qty || 1 }],
                  OwnerID: data.user.id,
                  assignApo: assignApo,
                });
                if (r?.data?.MOID) createdMOIDs.push(r.data.MOID);
              }
              return { data: { many: true, MOIDs: createdMOIDs } };
            })()
          : await ApiCustomer.post("/api/service-log/create-order", {
              /**
               * ASK : IF ORDER IS OUT WARRANTY, ARE THE WO / MO CREATED AUTOMATE TOO, BUT CLOSED IF CANCELLED, OR NEED APPROVE FIRST BY CM?
               */
              AssetID: assetForWorkOrderCreation.AssetID,
              CaseID: caseDetails.CaseID,
              selectedWarrantyServices,
              selectedPartCatalog,
              IncidentType: selected,
              OwnerID: data.user.id,
              assignApo: assignApo,
            });
        Swal.close();
        // Close loading after success
        await Swal.fire({
          title: "Success!",
          text: "Order added successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          allowEscapeKey: false,
        }).then(() => {
          setOpen(false);
          const WOIDRes = res.data.WOID;
          const MOID = res.data.MOID;
          if (isCreateMOOnly) {
            if (
              res.data?.many &&
              Array.isArray(res.data.MOIDs) &&
              res.data.MOIDs.length
            ) {
              // could open the last MO, keep silent here per prior behavior
            } else if (MOID) {
              window.open(`/app/material-order/${MOID}`, "_blank");
            }
          } else {
            // handle multi-MO creation from create-order
            const manyCreate =
              res.data?.many &&
              Array.isArray(res.data.MOIDs) &&
              res.data.MOIDs.length;
            switch (serviceCatalogType) {
              case "CSR":
                if (manyCreate) {
                  // Open the last created MO or keep on WO page as desired
                } else if (MOID) {
                  window.open(`/app/material-order/${MOID}`, "_blank");
                }
                break;
              case "serviceorder":
                window.open(`/app/work/${WOIDRes}`, "_blank");
                break;
              default:
                break;
            }
          }
        });
      } catch (err) {
        toast.error("Order Creation Failed:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to create order",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className=" w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-7xl
            flex flex-col justify-center
            gap-0 p-0 bg-white
            [&>button]:hidden"
        >
          <DialogHeader>
            <div className="flex items-end justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={
                    "hover:bg-gray-200 active:bg-gray-700  border-none"
                  }
                >
                  <XIcon />
                </Button>
              </DialogClose>
            </div>
            <div className={"flex items-center flex-col"}>
              <DialogTitle className={"text-blue-600 text-2xl"}>
                Service Catalog
              </DialogTitle>
              <DialogDescription>
                Select parts required for the repair.
              </DialogDescription>
              <HeaderTittle currentStep={currentStep} />
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div
              className={
                currentStep === STEPS.WARRANTY ? "block h-full" : "hidden"
              }
            >
              <StepWarranty
                asset={assetForWorkOrderCreation}
                warrantyOffer={filteredWarrantyOffers}
                selectedWarrantyServices={selectedWarrantyServices}
                setSelectedWarrantyServices={setSelectedWarrantyServices}
                onNext={() => setCurrentStep(STEPS.PARTS)}
                onCancel={() => setOpen(false)}
              />
            </div>

            <div
              className={
                currentStep === STEPS.PARTS ? "block h-full" : "hidden"
              }
            >
              <StepParts
                hook={hook}
                selectedPartCatalog={selectedPartCatalog}
                setSelectedPartCatalog={setSelectedPartCatalog}
                onNext={() => setCurrentStep(STEPS.CONFIRM)}
                onPrev={() => setCurrentStep(STEPS.WARRANTY)}
              />
            </div>

            <div
              className={
                currentStep === STEPS.CONFIRM ? "block h-full" : "hidden"
              }
            >
              <StepConfirm
                asset={assetForWorkOrderCreation}
                selectedWarrantyServices={effectiveWarrantyService}
                selectedPartCatalog={selectedPartCatalog}
                onPrev={() => setCurrentStep(STEPS.PARTS)}
                onSubmit={createOrder}
                showUEFINumberHeader={showUEFINumberHeader}
                subTotalConfirmServices={subTotalConfirmServices}
                selected={selected}
                setSelected={setSelected}
                assignApo={assignApo}
                setAssignApo={setAssignApo}
                filteredUserAssign={filteredUserAssign}
                isOutWarranty={isOutWarranty}
                addNewpart={() => setModalPart(true)}
                effectiveWarrantyService={effectiveWarrantyService}
                // Appended missing handlers:
                onQtyChange={handleQtyChangePartsCatalog}
                onRemovedPartNumberChange={handleRemovedPartNumberChange}
                onUEFICodeChange={handleUEFICodeChange}
                onUEFINoChange={handleUEFINoChange}
                onRemovePart={handlerPartCatalog}
              />
            </div>
          </div>
        </DialogContent>

        <CreateNewPartModal
          hook={hook}
          open2={modalPart}
          setOpen2={setModalPart}
          partCatalog={hook.data} // Fixed: relying on hook's data
          selectedPartCatalog={selectedPartCatalog}
          setSelectedPartCatalog={setSelectedPartCatalog}
          onPartAdded={handlePartAdded} 
        />
      </Dialog>
    </>
  );
}
