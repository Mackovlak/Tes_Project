// services/service-work.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { useWorkOrderStore } from "@/hooks/useWorkOrderStore";
import { getUserFromToken } from "@/lib/utils/auth";
import { QuickWOInput } from "@/components/quick-wo-input";
import { BtnModalsServiceCatalog } from "@/components/model/sc-modal";
import { NewBookableResourceBooking } from "../services/service-booking";
// ...all your UI imports...
import { useDraft } from "@/components/DraftContext";
import DatePicker from "@/components/date-picker";
import CaseField from "@/components/CaseField";
import { Plus, RotateCw, Lock, KeyRound } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { Command, CommandInput } from "@/components/ui/command";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatDate } from "@/lib/utils";
import ApiCustomer from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Input } from "../../components/ui/input";
import { SearchCommandBlock } from "../../components/sc-select";
import { Button } from "../../components/ui/button";
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
import { TabsServiceWO } from "./TabsServiceReimagined";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import { Switch } from "@/components/ui/switch";
import { GOOD_RETURN_REASON_OPTIONS } from "./service-mo_detailApo";
import { useMemo } from "react";

export const ServiceWork = () => {
  const user = getUserFromToken();
  const navigate = useNavigate();

  const workOrder = useWorkOrderStore((s) => s.workOrder);
  const materialOrders = useWorkOrderStore((s) => s.materialOrders);
  const caseInformation = useWorkOrderStore((s) => s.caseInformation);
  const bookings = useWorkOrderStore((s) => s.bookings);
  const ownerWorkOrder = useWorkOrderStore((s) => s.ownerWorkOrder);
  const customerData = useWorkOrderStore((s) => s.customerData);
  const SLA = useWorkOrderStore((s) => s.SLA);
  const WOGeneral = useWorkOrderStore((s) => s.WOGeneral);
  const MOLineGeneral = useWorkOrderStore((s) => s.MOLineGeneral);
  const failureOptions = useWorkOrderStore((s) => s.failureOptions);
  const partReturnStatusOptions = useWorkOrderStore((s) => s.partReturnStatusOptions)
  const setSLAField = useWorkOrderStore((s) => s.setSLAField);
  const setWOGeneralField = useWorkOrderStore((s) => s.setWOGeneralField);
  const setMoLineGeneralField = useWorkOrderStore((s) => s.setMoLineGeneralField);
  const setSLA = useWorkOrderStore((s) => s.setSLA);
  const setWOGeneral = useWorkOrderStore((s) => s.setWOGeneral);
  const uploadFotoMoLine = useWorkOrderStore((s) => s.uploadMOLinePhoto);
  const removeFotoMoLine = useWorkOrderStore((s) => s.removeMOLinePhoto);
  
  const notesList = useWorkOrderStore((s) => s.notesList);
  // ---- local UI state only ----
  const [openAddMO, setOpenAddMO] = useState(false);
  const [caseDetails, setCaseDetails] = useState(null);
  const [selectedSiteOption, setSelectedSiteOption] = useState("first");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpCompleted, setFollowUpCompleted] = useState(false);
  const [meterReadAvailable, setMeterReadAvailable] = useState(false);
  const [finishedOnDateCustomer, setFinishedOnDateCustomer] = useState(null);
  const [finishedOnDate, setFinishedOnDate] = useState(null);


  const handleSLAChange = (field) =>  (value) => {
      // Normalize dates to ISO string in store
      const normalized =
        value instanceof Date
          ? value.toISOString()
          : value ?? "";
      setSLAField(field, normalized);
  };

  const handleWOGeneral = (field) => (eOrValue) => {
      const value = eOrValue?.target ? eOrValue.target.value : eOrValue;
      setWOGeneralField(field, value);
  };

  const openServiceCatalog = () => {
    if (!caseInformation) return;
    setCaseDetails(caseInformation);
    setOpenAddMO(true);
  };

  // Mo Line Item
  const [photoUploadPreview, setPhotoUploadPreview] = useState(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  const searchResults = failureOptions.map((f, index) => ({
    value: String(f.FailureId),
    label: (
      <div className="flex flex-col">
      <span className="font-medium">
        {`${index === 0 ? "55" : index === 1 ? "72" : index === 2 ? "73" : index + 1}`} - {f.Name}
      </span>
      <span className="text-xs text-gray-500">{f.Description ?? ""}</span>
    </div>
    )
  }))

  const filteredPartReturnOptions = (mo) => {
     const baseOptions = partReturnStatusOptions.filter((status) =>
        status.StatusQuantityType === Boolean(mo.QuantityUsed),
      ).map((status) => ({
        value: status.ReturnStatusId.toString(),
        label: status.StatusName,
        data: status,
      }));

      const selectedId = mo.PartReturnStatusId !== null ? mo.PartReturnStatusId.toString(): null;
  
      if (selectedId && !baseOptions.some((option) => option.value === selectedId)) {
            const selectedFromSource = partReturnStatusOptions.find(
            (status) => status.ReturnStatusId.toString() === selectedId,
          );
  
        if (selectedFromSource) {
          baseOptions.push({
            value: selectedFromSource.ReturnStatusId.toString(),
            label: selectedFromSource.StatusName,
            data: selectedFromSource,
          });
        } else if (mo.PartReturnStatusName) {
          baseOptions.push({
            value: selectedId,
            label: mo.PartReturnStatusName,
            data: { DOA: mo.PartReturnDOA },
          });
        }
      }
      return baseOptions;
  }

  const renderPartReturnLabel = (option) => {
      if (typeof option === "string") {
        return option;
      }
      const label = option?.label ?? "";
      return option?.data?.DOA ? `${label} (DOA)` : label;
  };

  const handleInputChange = (index, value) => {
    const failureId = Number(value);
    if (Number.isNaN(failureId)) return;

    setMoLineGeneralField(index, "failureId", value);

    if (failureId === 6){
      setMoLineGeneralField(index, "QuantityUsed", false)
    }else if (failureId === 7){
      setMoLineGeneralField(index, "QuantityUsed", false)
    } else if (failureId === 8){
      setMoLineGeneralField(index, "QuantityUsed", true)
    }
  };

  const handleChange = (index, field) => (eOrValue) => {
    const value = eOrValue?.target ? eOrValue.target.value : eOrValue;
    setMoLineGeneralField(index, field, value);
  };

  const handlePartReturnStatusChange = (index, statusId) => {
    if (!statusId) {
      setMoLineGeneralField(index, "PartReturnStatusId", null);
      setMoLineGeneralField(index, "PartReturnStatusName", "");
      setMoLineGeneralField(index, "PartReturnDOA", false);
      setMoLineGeneralField(index, "DOAReason", "")
      return;
    }

    const selectedStatus = partReturnStatusOptions.find(
      (status) => status.ReturnStatusId.toString() === statusId.toString(),
    );

    if (!selectedStatus) return;

    setMoLineGeneralField(index, "PartReturnStatusId", selectedStatus.ReturnStatusId);
    setMoLineGeneralField(index, "PartReturnStatusName", selectedStatus.StatusName);
    setMoLineGeneralField(index, "PartReturnDOA", selectedStatus.DOA);
    setMoLineGeneralField(index, "DOAReason", selectedStatus.DOA ? "" : "");
  };

  const selectedPartReturnStatus = (mo) => {
    return (
      partReturnStatusOptions.find((status) => status.ReturnStatusId === mo.PartReturnStatusId) || null    
    )

  }
  
  const handlePhotoUpload = async (index, event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setPhotoUploadLoading(true);
  try {
    await uploadFotoMoLine(index, file);
  } finally {
    setPhotoUploadLoading(false);
    event.target.value = "";
  }
  };
    
  const handleRemovePhoto = async (index) => {
    await removeFotoMoLine(index);
  }
    
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
    
  const resolvedPhotoSrc = (mo) => {
    if (photoUploadPreview) {
      return photoUploadPreview;
    }

    const assetPath = mo.PhotoPartUnit;
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
  };

  // permissions
  const editRoles = ["apo", "admin", "ce", "celead", "spv"];
  let canEdit = false;
  if (workOrder?.SystemStatus !== "CLOSED_POSTED") {
    canEdit = editRoles.includes(user?.role);
  }

  const tabs = [
    { value: "wo_summary", label: "Wo Summary" },
    { value: "wo_bookings", label: "Wo Bookings" },
    { value: "wo_input", label: "Quick WO Input" },
    { value: "mo_failure", label: "Failure & Return Details" },
  ];

  const statusEnumToLabelWO = {
    OPEN_UNSCHEDULED: "Open - Unscheduled",
    OPEN_SCHEDULED: "Open - Scheduled",
    REPAIR_PROGRESS: "Open - In Progress",
    OPEN_COMPLETED: "Open - Completed",
    CLOSED_POSTED: "Closed - Posted",
    CLOSED_CANCELLED: "Closed - Cancelled"
  };
  
  const statusOptions = Object.entries(statusEnumToLabelWO).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  const validateRequestedDateTimeCustomer = async () => {
    try {
      if (!SLA?.requestedDateTimeCustomer) {
        Swal.fire({
          icon: "warning",
          title: "Requested Date Time is missing",
          text: "Please save Requested Date Time (Customer) before creating a booking.",
        });
        return false;
      }
      return true;
    } catch (err) {
      toast.error("Error validating RequestedDateTimeCustomer:", err);
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Failed to validate Requested Date Time.",
      });
      return false;
    }
  };

  // Fungsi Deadline by RDT
  function Deadline({ target }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const targetTime = new Date(target).getTime();
  if (!targetTime) return null;
  
  const WoDate = workOrder?.SystemStatus === "CLOSED_POSTED" ? new Date(workOrder.caseinformation?.ActionLog.find(log => log.dataNew === "CLOSED_POSTED").ChangeAt) : 
                 workOrder?.SystemStatus === "CLOSED_CANCELLED" ? new Date(workOrder.caseinformation?.ActionLog.find(log => log.dataNew === "CLOSED_CANCELLED").ChangeAt) : null
  let diffMs;

  if (workOrder?.SystemStatus === "CLOSED_POSTED" || workOrder?.SystemStatus === "CLOSED_CANCELLED") {
    diffMs = WoDate - targetTime;
  } else {
    diffMs = targetTime - now;
  }

  const diffAbs = Math.abs(diffMs);
  const seconds = Math.floor(diffAbs / 1000) % 60;
  const minutes = Math.floor(diffAbs / (1000 * 60)) % 60;
  const hours   = Math.floor(diffAbs / (1000 * 60 * 60)) % 24;
  const days    = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
  const diffText = `${days} hari ${hours} jam ${minutes} menit`;

 let status;
 if (workOrder?.SystemStatus === "CLOSED_POSTED" || workOrder?.SystemStatus === "CLOSED_CANCELLED") {
  status = diffMs > 0
    ? "wo-deadline-past"
    : "wo-deadline-not-past";
} else {
  status = now > targetTime ? "lewat" : "belum";
}

  return (
    <>
      {status === "lewat" && (
        <div className="p-2 bg-red-500 text-white font-bold">
          Deadline sudah lewat
        </div>
      )}

      {status === "belum" && (
        <div className="p-2 bg-green-500 text-white font-bold">
          Deadline belum sampai
        </div>
      )}

      {(status === "wo-deadline-past" || status === "wo-deadline-not-past") && (
        <div className="p-2 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 font-bold">
          {workOrder?.SystemStatus === "CLOSED_POSTED" ? "This work order is read-only because it is Closed" : 
           workOrder?.SystemStatus === "CLOSED_CANCELLED" ? "This work order is read-only because it is Cancelled" : 
           ""
          }, your time deadline {diffText} 
        </div>
      )}
    </>
  );}

  // TAT 
  function TATDuration({WOData}) {
    const createdOn  = WOData.caseinformation?.CreatedOn
    const closedDate = WOData.caseinformation?.CaseClosedDate

    const [now, setNow] = useState(Date.now());

    const isClosed = Boolean(closedDate)
    useEffect(() => {
      if (isClosed) return;

      const timer = setInterval(() => {
        setNow(Date.now())
      }, 1000);

      return () => clearInterval(timer)
    }, [isClosed]);

    if (!createdOn) return null;
      const startMs = new Date(createdOn).getTime();
      const endMs   = isClosed
        ? new Date(closedDate).getTime()
        : now;

      const diffMs = endMs - startMs;
      const diffAbs = Math.max(diffMs, 0);

      const totalSeconds = Math.floor(diffAbs / 1000);
      const days    = Math.floor(totalSeconds / 86400);
      const hours   = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60; 

  return (
    <div className="p-2 font-mono text-nowrap font-bold">
        {days} hari {hours} jam {minutes} menit {seconds} detik
    </div>
  )}

  return (
    <>
     <Deadline target={workOrder.RequestedDateTimeCustomer}/>
      
      {workOrder?.WOID && caseInformation?.CaseID && <TabsServiceWO />}

      <Card className=" border-0 rounded-none bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
        <Tabs defaultValue="wo_summary">
          <CardHeader className="flex flex-col gap-3 border-2 w-full p-2 sticky z-30 top-22 bg-white dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
              <CardTitle className="text-xl pl-2">
                {workOrder?.WOID || "---"}
                <span className="flex items-center text-sm gap-1">
                  For Case :
                  {workOrder?.CaseID && (
                    <Link to={`/app/case/${workOrder.CaseID}`}>
                      {workOrder.CaseID}
                    </Link>
                  )}
                </span>
              </CardTitle>
              <CardTitle className="flex flex-row flex-wrap gap-2 lg:gap-4 items-center">
                <div className="flex flex-col dark:text-gray-300">
                  <h1 className="text-blue-500 dark:text-white font-medium">
                    {ownerWorkOrder?.Name || "---"}
                  </h1>
                  <p className="text-sm font-light ">Owner Ce</p>
                </div>
                <div className="flex flex-col dark:text-gray-300">
                  <h1 className="text-blue-500 dark:text-white font-medium">{statusEnumToLabelWO[WOGeneral?.SystemStatus]}</h1>
                  <p className="text-sm font-light ">Status</p>
                </div>
                <div className="flex flex-col dark:text-gray-300">
                  <h1 className="text-blue-500 dark:text-white font-medium">
                    {customerData.MainAccount?.Salutation}{" "}
                    {customerData.MainAccount?.FirstName}{" "}
                    {customerData.MainAccount?.LastName}
                  </h1>
                  <p className="text-sm font-light">Contact</p>
                </div>
                <div className="flex flex-col dark:text-gray-300">
                  <Select
                    onValueChange={setSelectedSiteOption}
                    defaultValue="first"
                  >
                    <SelectTrigger className="p-0 text-blue-500 border-none shadow-none font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <SelectGroup className="p-0">
                        <SelectItem value="first" className="p-0">
                          {customerData.SiteAccount?.Company}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-sm font-light">Site Account</p>
                </div>
              </CardTitle>
            </div>
            
            <div className="  w-full overflow-x-auto h-fit no-scrollbar p-0">
              <TabsList className="border-t bg-gray-100 sm:w-full flex gap-4 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600 dark:rounded-none h-full p-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    variant={"modernUnderline"}
                    value={tab.value}
                    className="text-sm font-medium dark:border-b-slate-500 dark:text-gray-300"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
             </div>
          </CardHeader>

          {/* ========= TAB: WO SUMMARY ========= */}
          <TabsContent value="wo_summary" className="p-2 ">
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="rounded-md flex-1/3 dark:bg-gradient-to-tl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between">
                    <CardTitle className="text-lg ">General</CardTitle>
                    <TATDuration WOData={workOrder}/>
                  </div>
                  <hr className="dark:bg-gray-400"/>
                </CardHeader>
                <CardContent className="grid items-center grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    className="grid items-center grid-cols-2 col-span-2 p-4 ring-1"
                    hidden
                  >
                    <CaseField label="Incoming Channel" lock>
                      <Input
                        
                        className=""
                        value={WOGeneral.IncomingChannel}
                        onChange={handleWOGeneral("IncomingChannel")}
                      />
                    </CaseField>
                  </div>

                  <CaseField label="Work Order Description" lock span={3}>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      value={workOrder?.caseinformation?.CaseSubject}
                    />
                  </CaseField>

                  <CaseField label="Work Order Number" lock>
                    <Input
                      className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                      value={WOGeneral.WorkOrderNumber || "---"}
                      readOnly
                    />
                  </CaseField>

                  <CaseField label="System Status" lock={!canEdit}>
                    <SearchCommandBlock
                    className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                      value={WOGeneral?.SystemStatus}
                      onChange={(val) => handleWOGeneral("SystemStatus")(val)}
                      options={statusOptions}
                    />
                  </CaseField>

                  <CaseField label="Shipment Country" lock={!canEdit}>
                    <SearchCommandBlock
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                      value={WOGeneral.ShipmentCountry}
                      onChange={handleWOGeneral("ShipmentCountry")}
                      placeholder="---"
                      options={[
                        "USA",
                        "Canada",
                        "Indonesia",
                        "UK",
                        "Germany",
                        "France",
                        "Japan",
                        "China",
                        "India",
                        "Australia",
                        "Brazil",
                      ]}
                      readOnly={!canEdit}
                    />
                  </CaseField>

                  <CaseField label="Work Order Type" lock>
                    <Input
                      className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                      value={WOGeneral.WorkOrderType || "---"}
                      onChange={handleWOGeneral("WorkOrderType")}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Shipment State" lock={!canEdit}>
                    <Input
                      value={WOGeneral.ShipmentState}
                      onChange={handleWOGeneral("ShipmentState")}
                      placeholder="---"
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>

                  <CaseField label="Cancel Reason" lock hide={!workOrder.CancelReason}>
                    <Input
                      className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                      value={workOrder.CancelReason || "---"}
                    />
                  </CaseField>
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full col-span-2 lg:col-span-4"
                  >
                    <AccordionItem value="more-details" className="pl-5">
                      <AccordionTrigger className="cursor-pointer p-2 border-1 decoration-transparent">
                        More Details . . .
                      </AccordionTrigger>
                      <AccordionContent className={"mt-2"}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CaseField label="Priority" lock>
                        <Input
                          className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                          value={WOGeneral.Priority || "---"}
                          onChange={handleWOGeneral("Priority")}
                        />
                      </CaseField>

                      <CaseField label="Patner Case Id" lock>
                        <Input
                          
                          className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                          value={"---"}
                          readOnly
                        />
                      </CaseField>

                      <CaseField label="Recommended Resource" lock>
                        <Input
                          className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={WOGeneral.RecommendedResource}
                          onChange={handleWOGeneral("RecommendedResource")}
                          placeholder="---"
                          readOnly
                        />
                      </CaseField>

                      <CaseField label="Patner Status" lock>
                        <Input
                          
                          className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                          value={"---"}
                          readOnly
                        />
                      </CaseField>

                      <CaseField label="Sub-Status" lock={KeyRound}>
                        <Input
                          
                          className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                          value={WOGeneral.SubStatus}
                          onChange={handleWOGeneral("SubStatus")}
                          placeholder="---"
                        />
                      </CaseField>
                      <CaseField label="Work Order Instruction" lock>
                        <Input  placeholder="---" readOnly className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                      </CaseField>
                          <CaseField label="Bookable Resource Booking" lock>
                            <Input
                              
                              className=""
                              value={WOGeneral.BookableResourceBooking || "---"}
                              readOnly
                            />
                          </CaseField>

                          <CaseField
                            label="Service Offer ID"
                            className={"col-start-1"}
                            lock
                          >
                            <Input
                              
                              className=""
                              value={
                                caseInformation.servicecatalog
                                  ?.Service_offerID || "---"
                              }
                              readOnly
                            />
                          </CaseField>

                          <CaseField
                            label="Service Description"
                            className={"col-start-1"}
                            lock
                          >
                            <Input
                              
                              className=""
                              value={
                                caseInformation.servicecatalog
                                  ?.warranty_services?.Service_description ||
                                "---"
                              }
                              readOnly
                            />
                          </CaseField>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <div className="flex flex-col flex-1 gap-4" hidden>
                <Card className="rounded-sm dark:bg-gradient-to-t dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                  <CardContent className="grid items-center grid-cols-2">
                    <CaseField
                      label="Currently Worked By"
                      className={"col-span-3 hidden"}
                    >
                      {" "}
                      <Input
                        
                        className=""
                        value={"---"}
                        readOnly
                        hidden
                      />
                    </CaseField>
                  </CardContent>
                </Card>

                <Card className="rounded-md dark:bg-gradient-to-tr dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4" hidden>
                  <CardHeader>
                    <CardTitle className="text-lg ">
                      Entitlement and Modifier
                    </CardTitle>
                    <hr />
                  </CardHeader>
                  <CardContent className="grid items-center grid-cols-2 gap-5">
                    <CaseField label="Entitlement" lock>
                      <Input
                        
                        className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Offer" lock>
                      <Input
                        
                        className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Warranty Status" lock>
                      <Input
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        value={
                          workOrder.caseinformation?.otcCodeTable
                            ?.Description || "---"
                        }
                        placeholder="---"
                      />
                    </CaseField>
                    <CaseField label="Authorizing Employee" lock>
                      <Input
                        
                        className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                        value={"---"}
                        readOnly
                      />
                    </CaseField>
                    <CaseField label="Coverage Window Used" lock>
                      <Input
                        
                        className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"
                        value={"---"}
                        readOnly
                      />
                    </CaseField>

                    <Accordion
                      type="single"
                      collapsible
                      className="w-full col-span-2"
                    >
                      <AccordionItem value="more-details">
                        <AccordionTrigger>More Details . . .</AccordionTrigger>
                        <AccordionContent className={"m-1"}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <CaseField label="Coverage Window Value" lock>
                              <Input
                                
                                className=""
                                value={"---"}
                                readOnly
                              />
                            </CaseField>
                            <CaseField label="Response Time Value" lock>
                              <Input
                                
                                className=""
                                value={"---"}
                                readOnly
                              />
                            </CaseField>
                            <CaseField label="Repair Time Value" lock>
                              <Input
                                
                                className=""
                                value={"---"}
                                readOnly
                              />
                            </CaseField>
                            <CaseField label="Case Priority Index" lock>
                              <Input
                                
                                className=""
                                value={"---"}
                                readOnly
                              />
                            </CaseField>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

              </div>
            </div>
            <Card className="flex-col mt-5 dark:bg-gradient-to-bl dark:from-slate-600 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-lg ">
                    Material Order Information
                  </CardTitle>
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={openServiceCatalog}
                    disabled={!canEdit}
                    className={'cursor-pointer dark:text-white dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}
                  >
                    <Plus className="mr-2" size={16} /> 
                    Create Material Order
                  </Button>
                </div>
                <hr />
              </CardHeader>
              <CardContent className="grid">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] dark:text-white">Order Number</TableHead>
                      <TableHead className="dark:text-white">Case ID</TableHead>
                      <TableHead className="dark:text-white">Created On</TableHead>
                      <TableHead className="dark:text-white">Order Status</TableHead>
                      <TableHead className="dark:text-white">Order Type</TableHead>
                      <TableHead className="dark:text-white">Ready For Closure</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {materialOrders.length > 0
                      ? materialOrders.map((material) => (
                          <TableRow
                            key={material.MOID}
                            onClick={() =>
                              navigate(`/app/material-order/${material.MOID}`)
                            }
                            className={
                              material.OrderStatus === "New"
                                ? "cursor-pointer bg-green-100 dark:bg-green-600 dark:hover:bg-gray-500 dark:text-gray-300"
                                : material.OrderStatus === "Shipped"
                                ? "cursor-pointer bg-yellow-100 dark:bg-yellow-600 dark:hover:bg-gray-500 dark:text-gray-300"
                                : material.OrderStatus === "Ordered"
                                ? "cursor-pointer bg-blue-100 dark:bg-blue-600 dark:hover:bg-gray-500 dark:text-gray-300"
                                : material.OrderStatus === "Closed"
                                ? "cursor-pointer bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-300"
                                : material.OrderStatus === "BackOrdered"
                                ? "cursor-pointer bg-purple-100 dark:bg-purple-600 dark:hover:bg-gray-500 dark:text-gray-300"
                                : "cursor-pointer bg-red-100 dark:bg-red-600 dark:hover:bg-gray-500 dark:text-gray-300"
                            }
                          >
                            <TableCell className="font-medium">
                              {material.MOID} on {material.WOID}
                            </TableCell>
                            <TableCell>{material.workorder?.CaseID}</TableCell>
                            <TableCell>
                              {formatDate(material.CreatedOn)}
                            </TableCell>
                            <TableCell>{material.OrderStatus}</TableCell>
                            <TableCell>{material.OrderType}</TableCell>
                            <TableCell>
                              {formatDate(material.ReadyForClosureDate)}
                            </TableCell>
                          </TableRow>
                        ))
                      : null}
                  </TableBody>
                </Table>{" "}
              </CardContent>
            </Card>
    {canEdit &&
            <BtnModalsServiceCatalog
              open={openAddMO}
              setOpen={setOpenAddMO}
              caseDetails={caseDetails}
              serviceCatalogType="wo-add-mo"
              WOID={workOrder?.WOID}
            />
    }
          </TabsContent>

          {/* ========= TAB: WO BOOKINGS ========= */}
          <TabsContent value="wo_bookings" className="p-1">
            <Card className="flex-col rounded-md dark:bg-gradient-to-tl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
              <CardHeader>
                <CardTitle>WO Bookings</CardTitle>
                <hr className="dark:border-gray-400"/>
              </CardHeader>
              <CardContent
                className={
                  "grid items-center grid-cols-1 lg:grid-cols-6 gap-2 lg:gap-10"
                }
              >
                <CaseField
                  label={"Requested Date Time (Customer)"}
                  lock={!canEdit}
                  span={2}
                >
                  <DatePicker
                    variant="icon"
                    value={
                      SLA.requestedDateTimeCustomer
                        ? new Date(SLA.requestedDateTimeCustomer)
                        : null
                    }
                    onChange={handleSLAChange("requestedDateTimeCustomer")}
                  ></DatePicker>
                </CaseField>

                <CaseField
                  label="Early Start Date Time (Customer)"
                  lock={!canEdit}
                  span={2}
                >
                  <DatePicker
                    value={
                      SLA.earlyStartDateTimeCustomer
                        ? new Date(SLA.earlyStartDateTimeCustomer)
                        : null
                    }
                    onChange={handleSLAChange("earlyStartDateTimeCustomer")}
                  ></DatePicker>
                </CaseField>

                <CaseField
                  label={"Guaranteed Fix Time (Customer)"}
                  lock={!canEdit}
                  span={2}
                >
                  <DatePicker
                    variant="icon"
                    value={
                      SLA.guaranteedFixTimeCustomer
                        ? new Date(SLA.guaranteedFixTimeCustomer)
                        : null
                    }
                    onChange={handleSLAChange("guaranteedFixTimeCustomer")}
                  ></DatePicker>
                </CaseField>

                <CaseField
                  label="Latest Start Date Time (Customer)"
                  lock={!canEdit}
                  span={2}
                >
                  <DatePicker
                    value={
                      SLA.latestStartDateTimeCustomer
                        ? new Date(SLA.latestStartDateTimeCustomer)
                        : null
                    }
                    onChange={handleSLAChange("latestStartDateTimeCustomer")}
                  ></DatePicker>
                </CaseField>

                <CaseField
                  label={"Due Date  (Customer)"}
                  lock={!canEdit}
                  span={2}
                >
                  <DatePicker
                    variant="icon"
                    value={
                      SLA.dueDateCustomer ? new Date(SLA.dueDateCustomer) : null
                    }
                    onChange={handleSLAChange("dueDateCustomer")}
                  ></DatePicker>
                </CaseField>

                <CaseField
                  label="Active Schedule Date"
                  lock={!canEdit}
                  span={2}
                >
                  <DatePicker
                    value={
                      SLA.activeScheduleDate
                        ? new Date(SLA.activeScheduleDate)
                        : null
                    }
                    onChange={handleSLAChange("activeScheduleDate")}
                  ></DatePicker>
                </CaseField>
              </CardContent>
            </Card>

            <Card className="flex-col mt-5 rounded-md dark:bg-gradient-to-bl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
              <span className="ml-5 text-xl font-bold">Booking </span>
              <CardContent className="grid">
                {canEdit ? (
                  <NewBookableResourceBooking
                    CaseID={caseInformation?.CaseID}
                    WOID={workOrder.WOID}
                    CreatedBy={user.id}
                    RequestedDateTimeCustomer={
                      SLA.requestedDateTimeCustomer
                        ? new Date(SLA.requestedDateTimeCustomer)
                        : null
                    }
                    validateRequestedDateTimeCustomer={
                      validateRequestedDateTimeCustomer
                    }
                  />
                ) : null}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] dark:text-white">Resource</TableHead>
                      <TableHead className="dark:text-white">Account</TableHead>
                      <TableHead className="dark:text-white">Booking</TableHead>
                      <TableHead className="dark:text-white">Reschedule</TableHead>
                      <TableHead className="dark:text-white">Reschedule Reason</TableHead>
                      <TableHead className="dark:text-white">Start Time</TableHead>
                      <TableHead className="dark:text-white">Estimated Arrival Time (ETA)</TableHead>
                      <TableHead className="dark:text-white">Actual Arrival Time</TableHead>
                      <TableHead className="dark:text-white">End Time</TableHead>
                      <TableHead className="dark:text-white">Created On</TableHead>
                      <TableHead className="dark:text-white">Created By</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {bookings.length > 0 ? (
                      bookings.map((booking, index) => (
                        <TableRow
                          key={booking.BookingId || index}
                          onClick={() =>
                            navigate(`/app/bookings/${booking.BookingId}`)
                          }
                          className="cursor-pointer hover:bg-gray-700 dark:text-gray-400"
                        >
                          <TableCell>
                            {booking.bookingDetails?.[0].resource?.Name || "-"}
                          </TableCell>
                          <TableCell>
                            {booking.bookingDetails?.[0].resourceaccount
                              ?.Name || "-"}
                          </TableCell>
                          <TableCell>
                            {booking.BookingStatus?.Description || "-"}
                          </TableCell>
                          <TableCell>
                            {booking.CeScheduleChange ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            {booking.ScheduleJeopardy ? "Jeopardy" : "-"}
                          </TableCell>
                          <TableCell>
                            {formatDate(
                              booking.bookingDetails?.[0].StartTimeUserTime
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(
                              booking.bookingDetails?.[0]
                                .EstimatedArrivalTimeUserTime
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(
                              booking.bookingDetails?.[0]
                                .ActualArrivalTimeUserTime
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(
                              booking.bookingDetails?.[0].EndTimeUserTime
                            )}
                          </TableCell>
                          <TableCell>{formatDate(booking.CreatedAt)}</TableCell>
                          {/* <TableCell>{formatDate(booking.StartTimeCustomerTime)}</TableCell>
                                      <TableCell>{formatDate(booking.EstimatedArrivalTimeCustomerTime)}</TableCell>
                                      <TableCell>{formatDate(booking.ActualArrivalTimeCustomerTime)}</TableCell>
                                      <TableCell>{formatDate(booking.EndTimeCustomerTime)}</TableCell>
                                      <TableCell>{formatDate(booking.CreatedAt)}</TableCell> */}
                          <TableCell>
                            {booking.createdByUser?.Name || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========= TAB: QUICK WO INPUT ========= */}
          {workOrder?.WOID && caseInformation?.CaseID && (
            <TabsContent value="wo_input">
              <QuickWOInput
                WOID={workOrder?.WOID}
                workOrderData={workOrder}
                caseInformation={caseInformation}
                SLA={SLA}
                setSLA={setSLA}
                WOGeneral={WOGeneral}
                setWOGeneral={setWOGeneral}
              />
            </TabsContent>
          )}

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
                <CardContent className="grid grid-row-2 gap-4">
                  {MOLineGeneral.map((mo, index) => {
                    const OptionPartReturnStatus = filteredPartReturnOptions(mo)
                    const SelectOptionPartReturn = selectedPartReturnStatus(mo)
                    const isDOASelected = Boolean(SelectOptionPartReturn?.DOA)
                    const reviewPhoto = resolvedPhotoSrc(mo)
                    return (
                    <div key={mo.moid}>
                    <span className="italic font-semibold">Sparepart {index + 1} - {mo.Description} / {mo.PartNumber}</span>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 border-2 mt-2 rounded-sm p-4">

                    <CaseField label="CT Validation" star={editRoles} lock={!editRoles}>
                      <SearchCommandBlock
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                      value={mo.CTValidation === true ? "Pass" : mo.CTValidation === false ? "Fail" : ""}
                      onChange={(val) => {
                        handleChange(index, "CTValidation")(
                          val === 'Pass' ? true : val === 'Fail' ? false : null
                        )
                      }}
                      options={[
                        'Pass',
                        'Fail'
                      ]}
                      />
                    </CaseField>

                    <CaseField label={"Failure Code"} star={editRoles} lock={!editRoles}>
                    <div className="relative w-full">
                      <SearchCommandBlock
                        name="failureId"
                        value={mo.failureId}
                        onChange={(val) => handleInputChange(index, val)}
                        placeholder="Search Failure..."
                        options={searchResults}
                        readOnly={!editRoles}
                        className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                      />
                    </div>
                    </CaseField>

                    <CaseField label="Return CT Key" star={editRoles} >
                      <Input
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        name="removedPartNumber"
                        value={mo.removedPartNumber}
                        onChange={handleChange(index, 'removedPartNumber')}
                        placeholder="---"
                        
                      />
                    </CaseField>

                    <CaseField label="New CT Key" lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      name="removedSerialNumber"
                      value={mo.removedSerialNumber}
                      onChange={handleChange(index, 'removedSerialNumber')}
                      placeholder="---"
                    />
                  </CaseField>

                  <CaseField label="Part Used" star={editRoles} lock={!editRoles}>
                    <div className="flex items-center gap-2">
                      <Switch
                          checked={!!mo.QuantityUsed}
                          onCheckedChange={(checked) => setMoLineGeneralField(index, "QuantityUsed", checked)}
                          disabled={!editRoles || mo.QuantityUsed || mo.QuantityUsed == false}
                      />
                      <span>{mo.QuantityUsed ? "Used" : "Not Used"}</span>
                    </div>
                  </CaseField>

                  <CaseField label="Part Return Status" 
                    star={editRoles}
                    lock={!editRoles}
                    >
                    <SearchCommandBlock
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                      value={mo.PartReturnStatusId !== null? mo.PartReturnStatusId.toString(): null}
                      onChange={(val) => handlePartReturnStatusChange(index,val)}
                      placeholder="Select Part Return Status"
                      options={OptionPartReturnStatus}
                      renderLabel={renderPartReturnLabel}
                    />
                  </CaseField>

                  <CaseField
                    label="DOA Reason"
                    star={isDOASelected}
                    hide={!isDOASelected}
                  >
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      name="DOAReason"
                      value={mo.DOAReason}
                      onChange={handleChange(index, "DOAReason")}
                      placeholder="Enter DOA reason"
                    />
                  </CaseField>

                  <CaseField
                    label="Unit Photo"
                    hide={Boolean(mo.QuantityUsed)} lock={!editRoles}>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>handlePhotoUpload(index, e)}
                        disabled={!editRoles}
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                  </CaseField>
                  
                  <CaseField
                    label="Good Return Reason"
                    star={!mo.QuantityUsed && editRoles}
                    hide={Boolean(mo.QuantityUsed)}
                    lock={!editRoles}
                  >
                    <SearchCommandBlock
                      value={mo.GoodReturnReason}
                      onChange={handleChange(index,"GoodReturnReason")}
                      placeholder="Select reason"
                      options={GOOD_RETURN_REASON_OPTIONS}
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                    />
                  </CaseField>
                   
                  <div className="lg:col-span-4 flex flex-col gap-2 pl-10">
                     {photoUploadLoading && (
                      <span className="text-sm text-muted-foreground">Uploading photo...</span>
                    )}

                    {/* Thumbnail */}
                    {reviewPhoto && (
                      <div className="flex flex-wrap items-start gap-3">
                        <img
                          src={reviewPhoto}
                          alt="Unit photo preview"
                          className="max-h-24 rounded border object-cover cursor-pointer"
                          onClick={() => setPreviewSrc(reviewPhoto)} // klik untuk preview
                        />
                        {editRoles && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRemovePhoto(index)}
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
                    </div>
                    </div>
                  )})}
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>
      </Card>
    </>
  );
};

