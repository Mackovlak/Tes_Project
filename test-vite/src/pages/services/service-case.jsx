import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectBarRelated } from "../../components/sc-select";
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
import {
  ArrowLeftFromLine,
  SquareArrowOutUpRight,
  Save,
  FileSymlink,
  RotateCw,
  StepBack,
  CalendarDays,
  Lock,
  UserPen,
  ArrowUp,
  ChevronDown,
  Smile,
  User,
  Calculator,
  CreditCard,
  Settings,
  CopyX,
  CopyXIcon,
  CircleChevronLeft,
} from "lucide-react";

import { SelectYN } from "../../components/sc-select";
import { useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ApiCustomer from "@/api";
import { getUserFromToken } from "@/lib/utils/auth";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import Swal from "sweetalert2";

import { BtnModalsServiceCatalog } from '../../components/model/sc-modal'
import DatePicker from '../../components/date-picker'


import { SearchCommandBlock } from "../../components/sc-select";

import { pdf } from '@react-pdf/renderer';
import ServiceRequestPDF from '../../components/service-request-form'; // adjust path if needed
import { useAuth } from "@/context/auth-context";

import RepairActionDialog from "@/components/model/RepairActionModal";
import { useWorkOrderStore } from "../../hooks/useWorkOrderStore";

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
    // DB → UI
    return formatDateForInput(dateStr);
  },
  toDB(dateStr) {
    // UI → DB
    return dateStr ? new Date(dateStr).toISOString() : null;
  },
};


export const TabsService = ({
  caseDetails,
  setCaseDetails,
  caseNote,
  caseNoteFormData,
  setCaseNoteFormData
}) => {
  const navigate = useNavigate();
  const [openWorkOrder, setOpenWorkOrder] = useState(false);

  const [selectedSymptom, setSelectedSymptom] = useState(null);

  const { open } = useSidebar();
  const [entitlementStatus, setEntitlementStatus] = useState({
    OTCCode: ''
  })

  const [caseForm, setCaseForm] = useState({
    CaseType: "",
    CaseStatus: "",
    CaseSubject: "",
  });

  const [gtcForm, setGtcForm] = useState({
    global_trade_status: "",
    embargoed_country: "",
    gt_override_reason: "",
    gt_details: "",
    screening_id: "",
    gt_active_listening: "",
    gt_al_comments: "",
  });

  const [csrForm, setCsrForm] = useState({
    caseResolutionCode: "",
    autoClose: "",
    caseReadyForClosure: "",
    readyForCloseDays: "",
    readyForClosureDate: "",
    ReadyForClosureDate: "",
    pendingCustomerAction: "",
    customerRequestedCloseDate: "",
  });

  const handleCaseDetails = (field) => (value) => {
    setCaseDetails((prev) => ({ ...prev, [field]: value }));
  }

  const handleCaseChange = (field) => (value) => {
    setCaseForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleCaseNoteChange = (key, value) => {
    setCaseNoteFormData((prev) => {
      const updated = { ...prev, [key]: value };
      console.log(" Updated Form:", updated); // Log on every change
      return updated;
    });
  };

  const handleGtcChange = (field) => (value) => {
    setGtcForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEntitlementStatus = (field) => (value) => {
    setEntitlementStatus((prev) => ({ ...prev, [field]: value }));
  };

  const handleCsrChange = (field) => (value) => {
    setCsrForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (redirect = true) => {
    console.log("Form Data to Submit:", caseNoteFormData, gtcForm, entitlementStatus);

    try {
      Swal.fire({
        title: 'Saving Case...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const user = getUserFromToken();
      const timestamp = new Date().toLocaleString();
      const author = user?.name || user?.email || "Unknown User";
      const role = user?.role || "Unknown";

      const noteFilled = caseNoteFormData.Note && caseNoteFormData.Note.trim() !== "";
      const caseFilled = caseForm.CaseType && caseForm.CaseType.trim() !== "";
      const gtcEdited = gtcForm && Object.keys(gtcForm).length > 0;
      const entitlementEdited = entitlementStatus !== undefined;
      const csrEdited = csrForm && Object.keys(csrForm).length > 0;

      const hasIntentToSave = noteFilled || gtcEdited || entitlementEdited || csrEdited || caseFilled;

      if (!hasIntentToSave) {
        alert("Tidak ada data yang disimpan.");
        return;
      }

      let savedModules = [];
      const dataToUpdate = {};
      for (const target of ['NOTE', 'GTC', 'ENTITLEMENT', 'CSR', 'CASE']) {
        switch (target) {

          case 'NOTE':
            if (noteFilled) {
              const modifiedNote = `[@${timestamp}] by ${author} (${role})\n${caseNoteFormData.LogType} : ${caseNoteFormData.Note}`;

              const response = await ApiCustomer.post("/api/case-information/case-notes", {
                LogType: caseNoteFormData.LogType,
                ActionType: caseNoteFormData.ActionType,
                VisibleExternally: caseNoteFormData.VisibleExternally,
                Note: modifiedNote,
                CaseID: caseDetails.CaseID
              });
              dataToUpdate.CaseNote = response.data.data.NoteID;

              const NotedDisplay = `@Created On : ${response.data.data.CreatedOn}\n${response.data.data.Note}`;
              setCaseNotes({
                NotesDisplay: NotedDisplay,
                ActionType: caseNoteFormData.ActionType,
                LogType: caseNoteFormData.LogType,
                VisibleExternally: caseNoteFormData.VisibleExternally,
              });

              if (selectedSymptom) {
                dataToUpdate.SymptomCode = selectedSymptom.SymptomCodeID;
              }

              savedModules.push("Note");
            }
            break;

          case 'GTC':
            if (gtcEdited) {
              await ApiCustomer.patch("/api/case-information/global-trade-check", {
                ...gtcForm,
                screening_id: gtcForm.screening_id || "",
                CaseID: caseDetails.CaseID,
              });
              savedModules.push("GTC");
            }
            break;

          case 'ENTITLEMENT':
            if (entitlementEdited) {
              console.log(entitlementStatus);
              Object.assign(dataToUpdate, entitlementStatus); // includes OTCCo
              savedModules.push("Entitlement");
            }
            break;

          case 'CSR':
            if (csrEdited) {
              let response;
              if (caseDetails.id_csr) {
                response = await ApiCustomer.patch(`/api/caseResolution/${caseDetails.id_csr}`, {
                  ...csrForm,
                  caseResolutionCode: csrForm.caseResolutionCode || "",
                });
              } else {
                response = await ApiCustomer.post("/api/caseResolution", {
                  ...csrForm,
                  caseResolutionCode: csrForm.caseResolutionCode || "",
                });
                dataToUpdate.id_csr = response.data.data.id_csr;
              }
              savedModules.push("CSR");
            }
            break;

          case 'CASE':
            if (caseFilled) {
              try {
                const oldStatus = caseDetails.CaseStatus;
                const newStatus = caseForm.CaseStatus;
                Object.assign(dataToUpdate, {
                  CaseType: caseForm.CaseType || "",
                  CaseStatus: newStatus || "",
                });
                savedModules.push("Case");
                if (oldStatus !== newStatus) {
                  const token = {
                    user: getUserFromToken()
                  }
                  await ApiCustomer.post("/api/actionlog", {
                    CaseId: `${caseDetails.CaseID}`,
                    ReferenceId: ``,
                    model: "Case",
                    dataOld: oldStatus,
                    dataNew: newStatus,
                    changedBy: token.user.id,
                    logDescription: `Edit : Change Case ${caseDetails.CaseID} Status from ${oldStatus} to ${newStatus}`,
                  });
                }
              } catch (err) {
                console.error("Gagal update case:", err);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Gagal menyimpan data case.",
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                });
              }
            }
            break;
        }

        if (Object.keys(dataToUpdate).length > 0) {
          await ApiCustomer.patch(`/api/case-information/${caseDetails.CaseID}`, dataToUpdate);
        }
      }

      if (savedModules.length > 0) {
        if (redirect) {
          await Swal.fire({
            icon: "success",
            title: "Berhasil Disimpan",
            text: `Data berhasil disimpan: ${savedModules.join(", ")}`,
            timer: 2500,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
          window.location.reload();
        }
        return true
      }

    } catch (error) {
      console.error("Save failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong.",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then(() => {
        Swal.close();
      });
    }
  };

  const openPopup = () => {
    console.log("TeSPOP");
    const popup = window.open(
      '/auditwindows',
      'Popup Title',
      'width=600,height=400'
    );

    if (popup) {
      popup.focus();
    } else {
      alert('Popup blocked by browser. Please allow popups for this site.');
    }
  };


  useEffect(() => {
    const loadNote = async () => {
      const noteDetail = caseNote;
      if (noteDetail) {
        const NotedDisplay = `@Created On : ${noteDetail.CreatedOn}\n${noteDetail.Note}`;
        setCaseNotes({
          NotesDisplay: NotedDisplay,
          ActionType: noteDetail.ActionType,
          LogType: noteDetail.LogType,
          VisibleExternally: noteDetail.VisibleExternally,
        })
      }
    }
    loadNote()
  }, [])

  const [caseNotes, setCaseNotes] = useState([]);

  const buttons = [
    {
      icon: ArrowLeftFromLine,
      label: "",
      onClick: () => navigate(`/app/master/Case_table`),
    },
    { icon: SquareArrowOutUpRight, label: "", },
    { icon: Save, label: "Save", onClick: () => handleSave() },
    {
      icon: FileSymlink,
      label: "Save & Close",
      onClick: () => saveAndCloseCase(),
    },
    { icon: RotateCw, label: "Refresh", onClick: () => window.location.reload() },
    { icon: StepBack, label: "Complaint", },
    {
      icon: StepBack, label: "SRF", onClick: async () => {
        const blob = await pdf(<ServiceRequestPDF caseDetails={caseDetails} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Service_Request_Form.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    { icon: StepBack, label: "CSR", onClick: () => openServiceCatalog("CSR") },
    { icon: StepBack, label: "Service Order", onClick: () => openServiceCatalog("serviceorder") },
    { icon: StepBack, label: "Work Order", onClick: () => openServiceCatalog("workorder") },
    { icon: StepBack, label: "Sales Offer", },
    { icon: StepBack, label: "Close Case", },
    { icon: StepBack, label: "Pick", },
    { icon: StepBack, label: "Queue Details", },
    { icon: UserPen, label: "Assign" },
    { icon: StepBack, label: "Add to Queue", },
    { icon: StepBack, label: "Audit", onClick: () => openPopup() },
  ];
  console.log("TES CASE DETAILS VALUE", caseDetails);
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];
  const [serviceCatalogType, setServiceCatalogType] = useState("null");
  const openServiceCatalog = async (type) => {
    setOpenWorkOrder(true);
    setServiceCatalogType(type)
  };
  const saveAndCloseCase = async () => {

    if (!csrForm.caseResolutionCode || csrForm.caseResolutionCode.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Case Resolution",
        text: "You must select a Case Resolution Code before closing the case.",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Confirm Save",
      text: "This will give the Case status as CLOSED. Are you sure you want to save changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save it",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }
    try {

      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update the Case.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const success = await handleSave(false);
      if (!success) return;
      const res = await ApiCustomer.patch(
        `/api/case-information/${caseDetails.CaseID}`,
        {
          CaseStatus: "Close",
          CaseClosedDate: new Date().toISOString(),
        }
      );
      if (res.data.success) {
        const token = {
          user: getUserFromToken()
        }
        const updateLog = await ApiCustomer.post("/api/actionlog", {
          CaseId: `${caseDetails.CaseID}`,
          ReferenceId: ``,
          model: "Case",
          dataOld: caseDetails.CaseStatus,
          dataNew: res.data.data.CaseStatus,
          changedBy: token.user.id,
          logDescription: `Edit : Change Case ${caseDetails.CaseID} Status from ${caseDetails.CaseStatus} to ${res.data.data.CaseStatus}`
        })
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          navigate(`/app/master/Case_table`);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update!",
        text: error.message || "Something went wrong.",
      });
    }
  };
  return (
    <>
      <div className="flex items-center border-1 ">
        {visibleButtons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}

        {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 bg-gray-200 rounded-md">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index} onClick={btn.onClick}>
                  <btn.icon className="inline-block w-4 h-4 mr-2" />
                  {btn.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <BtnModalsServiceCatalog
          open={openWorkOrder}
          setOpen={setOpenWorkOrder}
          caseDetails={caseDetails}
          serviceCatalogType={serviceCatalogType}
        />
      </div>
      <div>
        <ServiceCase
          caseDetails={caseDetails}
          formData={caseNoteFormData}
          setCaseNoteFormData={setCaseNoteFormData}
          formGtc={gtcForm}
          setFormGtc={setGtcForm}
          onChangeCase={handleCaseChange}
          caseForm={caseForm}
          setCaseForm={setCaseForm}
          onChangeGtc={handleGtcChange}
          onChange={handleCaseNoteChange}
          handleCaseDetails={handleCaseDetails}
          caseNotes={caseNotes}
          setCaseNotes={setCaseNotes}
          selectedSymptom={selectedSymptom}
          setSelectedSymptom={setSelectedSymptom}
          entitlementStatus={entitlementStatus}
          handleEntitlementStatus={handleEntitlementStatus}
          csrForm={csrForm}
          setCsrForm={setCsrForm}
          onChangeCsr={handleCsrChange}
        />
      </div>
    </>
  );
};

const spanMap = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
};

export const CaseField = ({ label, children, icon, span = 1, className, star }) => (
  <>
    <CardTitle
      className={twMerge(
        `relative font-medium flex items-center gap-2`,
        icon ? "pl-6" : "",
        className
      )}
    >
      {icon && (
        <Lock className="absolute left-0 -translate-y-1/2 top-1/2 size-4 text-muted-foreground" />
      )}
      {label}
      {star ? <span className="text-red-400">*</span> : ""}
    </CardTitle>

    <CardTitle className={twMerge(spanMap[span], "")}>
      {children}
    </CardTitle>
  </>
);

export const TabsServiceWO = ({ workOrders, SLA, setSLA, WOGeneral }) => {
  const navigate = useNavigate();
  const WOID = workOrders.WOID;

  //modal handle repair action
  const [openRepairDialog, setOpenRepairDialog] = useState(false);
  const [onCancelWo, setOnCancelWo] = useState(false)


  const handleSave = async () => {
    try {
      Swal.fire({
        title: "Updating WORK ORDER...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      /**
       * TODO :
       * MAKE ANOTHER SAVE FUNCTION *INSIDE* THIS HANDLER
       */
      const response = await ApiCustomer.patch(`/api/work-order/${WOID}`, {
        //WO GENERAL
        ShipmentCountry: WOGeneral.ShipmentCountry || undefined,
        IncomingChannel: WOGeneral.IncomingChannel || undefined,
        Priority: WOGeneral.Priority || undefined,
        SubStatus: WOGeneral.SubStatus || undefined,
        RecommendedResource: WOGeneral.RecommendedResource || undefined,
        WorkOrderDescription: WOGeneral.WorkOrderDescription || undefined,
        ShipmentState: WOGeneral.ShipmentState || undefined,
        SystemStatus: WOGeneral.SystemStatus || undefined,
        //SLA
        SLAJeopardy: SLA.slaJeopardy || undefined,
        DueDateCustomer: SLA.dueDateCustomer || undefined,
        CoverageWindow: SLA.coverageWindow || undefined,
        Response: SLA.response || undefined,
        OTCCode: SLA.otcCode || undefined,
        RequestedDateTimeCustomer: SLA.requestedDateTimeCustomer || undefined,
        GuaranteedFixTimeCustomer: SLA.guaranteedFixTimeCustomer || undefined,
        EarlyStartDateTimeCustomer: SLA.earlyStartDateTimeCustomer || undefined,
        LatestStartDateTimeCustomer: SLA.latestStartDateTimeCustomer || undefined,
        SLAReschedule: SLA.slaReschedule || undefined,
        ActiveScheduleDate: SLA.activeScheduleDate || undefined,
        SLAErrorDescription: SLA.slaErrorDescription || undefined,
        CasePriorityIndex:
          SLA.casePriorityIndex !== ""
            ? parseInt(SLA.casePriorityIndex, 10)
            : undefined,
      });

      const result = response.data;
      console.log(response);


      if (!result.success) {
        return Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Unknown error",
        });
      }

      return Swal.fire({
        icon: "success",
        title: "Success",
        text: "SLA updated successfully!",
      });
    } catch (error) {
      return Swal.fire({
        icon: "error",
        title: "Request Error",
        text: error.message || "Something went wrong!",
      });
    }
  };

  const buttons = [
    {
      icon: ArrowLeftFromLine,
      label: "",
      onClick: () => navigate(`/app/case/${workOrders.CaseID}`),
    },
    { icon: SquareArrowOutUpRight, label: "", onClick: () => alert("not now") },
    { icon: Save, label: "Save", onClick: () => handleSave() },
    {
      icon: FileSymlink ,
      label: "Save & Close",
      onClick: () => handleSave().then(() => navigate(`/app/case/${workOrders.CaseID}`)),
    },
    {
      icon: CopyX,
      label: "Close WO",
      onClick:async () => {
        // const isValid = true;
        const isValid = await validate();
        if (isValid !== false) {
          setOnCancelWo(false);
          setOpenRepairDialog(true);
        }
      },
    },
    {
      icon: CopyX,
      label: "Cancel WO",
      onClick:async () => {
        // const isValid = true;
        const isValid = await validate();
        if (isValid !== false) {
          setOnCancelWo(true);
          setOpenRepairDialog(true);
        }
      },
    },
    { icon: RotateCw, label: "Book", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Audit", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Pick", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Geo Code", onClick: () => alert("not now"), hidden: true},
    { icon: RotateCw, label: "Refresh", onClick: () => window.location.reload() },
    { icon: StepBack, label: "Process", onClick: () => alert("not now"), hidden: true},
    { icon: StepBack, label: "Reset RDT", onClick: () => alert("not now"), hidden: true},
    { icon: StepBack, label: "Add To Queue", onClick: () => alert("not now"), hidden: true },
    {
      icon: UserPen,
      label: "Create Material Order",
      onClick: () => alert("not now"),
      hidden: true
    },
    { icon: StepBack, label: "Show Alerts", onClick: () => alert("not now"), hidden: true },
  ];
  // const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  // const hiddenButtons = open ? buttons.slice(-3) : [];

  const handleRepairSubmit = async (repairFormData) => {

    // Tutup dialog
    setOpenRepairDialog(false);
    // Lanjut proses yang sudah kamu punya
    await saveAndCloseWorkOrder(repairFormData);
  };

  const validate = async () => {
    // Validation: all MO under WO must be Closed
    try {
      const moRes = await ApiCustomer.get(`/api/material-order?WOID=${workOrders.WOID}`);
      const mos = Array.isArray(moRes.data?.data) ? moRes.data.data : [];
      const mosNotClosed = mos.filter(mo => String(mo.OrderStatus).toLowerCase() !== 'closed' && String(mo.OrderStatus).toLowerCase() !== 'cancelled');
      if (mosNotClosed.length > 0) {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Material Orders Still Open',
          text: 'Close all Material Orders before closing the Work Order.',
        });
        return false
      }
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        text: 'Unable to verify Material Orders for this Work Order.',
      });
      return false;
    }

    // Validation: bookings must be Completed. As a proxy, require end, ETA, AAT in Customer Time
    try {
      const bRes = await ApiCustomer.get(`/api/bookings?WOID=${workOrders.WOID}`);
      const bookings = Array.isArray(bRes.data?.data) ? bRes.data.data : [];
      const notCompleted = bookings.filter(b => {
        // Prefer explicit status if present
        const statusText = (b.BookingStatus || b.Status || '').toString().toLowerCase();
        if (statusText === 'completed') return false;
        const bd = Array.isArray(b.bookingDetails) && b.bookingDetails[0] ? b.bookingDetails[0] : {};
        const end = bd?.EndTimeCustomerTime;
        const eta = bd?.EstimatedArrivalTimeCustomerTime;
        const aat = bd?.ActualArrivalTimeCustomerTime;
        return !(end && eta && aat);
      });
      if (notCompleted.length > 0) {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Booking Not Completed',
          text: 'Ensure all bookings have End Time, Estimated Arrival, and Actual Arrival (Customer Time) before closing the Work Order.',
        });
        return false;
      }
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Validation Failed',
        text: 'Unable to verify bookings for this Work Order.',
      });
      return false;
    }
    return true; // if all validations pass

  }
  const saveAndCloseWorkOrder = async (repairFormData) => {
    // return console.log(repairFormData);
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update the Work Order.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // Role guard: only CE can close Work Order
      const tokenUser = getUserFromToken();
      if (!tokenUser || String(tokenUser.role).toLowerCase() !== 'ce' && String(tokenUser.role).toLowerCase() !== 'celead') {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'Only CE can close a Work Order.',
        });
      }

      // return console.log("Repair PROM KOOJRN ",repairFormData);

      const statusTarget = onCancelWo ? "CLOSED_CANCELLED" : "CLOSED_POSTED";
      const res = await ApiCustomer.patch(
        `/api/work-order/${workOrders.WOID}`,
        {
          DelayCode: repairFormData.delayCode,
          NMUId: repairFormData.nmu,
          VersionNMU: repairFormData?.Version,
          NMUItemId: repairFormData?.nmuItem,
          CEAnalysis: repairFormData.ceAnalysis,
          DefectDesc: repairFormData.defectDesc,
          RepairAction: repairFormData.repairAction,
          ServiceTypeId: repairFormData.serviceType,
          CancelReason: repairFormData.cancelReason,
          SystemStatus: statusTarget,
          IsCancel: onCancelWo
        }
      );
      if (res.data.success) {
        const token = {
          user: getUserFromToken()
        }
        //updateLog
        const updateLog = await ApiCustomer.post("/api/actionlog", {
          CaseId: `${workOrders.CaseID}`,
          ReferenceId: `${workOrders.WOID}`,
          model: "Work Orders",
          dataOld: workOrders.SystemStatus,
          dataNew: res.data.data.SystemStatus,
          changedBy: token.user.id,
          logDescription: `Edit : Changed Work Order ${workOrders.WOID} from ${workOrders.SystemStatus} to ${res.data.data.SystemStatus}`
        })
        // console.log("wololo",workOrders)
        //update log customer
        const statusCaseTarget = onCancelWo ? "CancelRepair" : "FinishRepair";
        const caseLog = await ApiCustomer.post("/api/actionlog",{
          CaseId: `${workOrders.CaseID}`,
          ReferenceId: `${workOrders.CaseID}`,
          model: "Case",
          dataOld: workOrders?.caseinformation?.CaseStatus,
          dataNew: statusCaseTarget,
          changedBy: token.user.id,
          logDescription: `Edit : Changed Case Status ${workOrders.CaseID} from ${workOrders?.caseinformation?.CaseStatus} to ${statusCaseTarget}`
        })
        //update Case status
        const caseChangeStatus = await ApiCustomer.patch(`/api/case-information/${workOrders.CaseID}`,{
          Owner: workOrders?.caseinformation?.CreatedBy,
          CaseStatus: statusCaseTarget
        })

        const previousOwnerId = workOrders?.caseinformation?.Owner;
        const newOwnerId = workOrders?.caseinformation?.CreatedBy;

        if (
          caseChangeStatus.data?.success &&
          previousOwnerId &&
          newOwnerId &&
          String(previousOwnerId) !== String(newOwnerId)
        ) {
          await ApiCustomer.post("/api/actionlog", {
            CaseId: `${workOrders.CaseID}`,
            ReferenceId: `${workOrders.CaseID}`,
            model: "CaseOwner",
            dataOld: String(previousOwnerId ?? ""),
            dataNew: String(newOwnerId ?? ""),
            changedBy: token.user.id,
            logDescription: `Edit : Change Case ${workOrders.CaseID} Owner from ${previousOwnerId} to ${newOwnerId}`,
          });
        }

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate(`/app/case/${workOrders.CaseID}`);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update!",
        text: error.message || "Something went wrong.",
      });
    }
  };
  return (
    <>
      <div className="flex items-center border-1 sticky top-13 bg-white z-10 ">
        {buttons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            hidden={btn.hidden}
            variant="link"
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}


        {/* {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 bg-gray-200 rounded-md">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="inline-block w-4 h-4 mr-2" />
                  {btn.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
        {/* <BtnModalsServiceCatalog open={openWorkOrder} setOpen={setOpenWorkOrder} caseDetails={caseDetails}/> */}
      </div>
      <div>
        
        {/* <ServiceCase 
      caseDetails={caseDetails}
      formData={caseNoteFormData}
      onChange={handleCaseNoteChange}
      caseNotes={caseNotes}
      setCaseNotes={setCaseNotes}
      selectedSymptom={selectedSymptom}
      setSelectedSymptom={setSelectedSymptom}
      /> */}
      </div>
      <RepairActionDialog
        open={openRepairDialog}
        onOpenChange={setOpenRepairDialog}
        onSubmit={handleRepairSubmit}
        canEdit={true}
        onCancelWo={onCancelWo}
        
        //data
        workOrders={workOrders}
      />
    </>
  );
};

export const TabsServiceMO = ({ materialOrders, updatedLineItems, materialOrderInformation }) => {
  const {user} = useAuth();
  const navigate = useNavigate();
  const currentRole = (getUserFromToken()?.role || '').toLowerCase();
  const buttons = [
    {
      icon: ArrowLeftFromLine,
      label: "",
      onClick: () => navigate(`/app/work/${materialOrders.WOID}`),
    },
    { icon: SquareArrowOutUpRight, label: "", },
    { icon: Save, label: "Save", onClick: () => saveMaterialOrder().then(() => {`/app/material-order/${materialOrders.MOID}`}) },
    { icon: FileSymlink, label: "Save & Close", onClick: () => saveMaterialOrder().then(() => navigate(`/app/work/${materialOrders.WOID}`))},
    {
      icon: CopyXIcon,
      label: "Close MO",
      onClick: () => saveAndCloseMaterialOrder(),
      hidden: currentRole !== 'ce' && currentRole !== 'celead' && currentRole !== 'admin',
    },
    { icon: RotateCw, label: "Refresh", onClick: () => window.location.reload() },
    { icon: StepBack, label: "Cancel Order", hidden: true},
    { icon: StepBack, label: "Add To Queue", hidden: true },
    { icon: StepBack, label: "Add Parts", hidden: true },
    { icon: StepBack, label: "Pick", hidden: true },
    { icon: StepBack, label: "Place Order", hidden: true },
    { icon: StepBack, label: "Tax", hidden: true },
    { icon: StepBack, label: "CustID Search", hidden: true },
    { icon: UserPen, label: "PUDO Search", hidden: true },
    { icon: StepBack, label: "Audit", hidden: true },
  ];
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];

  const saveMaterialOrder = async () => {
   
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we save the Material Order.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      let res = null;
      // Guard: if any line item update is set to Shipped, require SON and RMA
      const hasShippingUpdate = updatedLineItems && Object.values(updatedLineItems).some(
        (v) => String(v).toLowerCase() === 'shipped' || String(v).toLowerCase() === 'ordered'
      );
      const soNumber = (materialOrderInformation?.SalesOrderNumber ?? materialOrders?.SalesOrderNumber ?? '').toString().trim();
      const rmaNumber = (materialOrderInformation?.RMANumber ?? materialOrders?.RMANumber ?? '').toString().trim();
      // return console.log(soNumber, moForm, materialOrderInformation);
      if (hasShippingUpdate && (!soNumber || !rmaNumber)) {
        Swal.close();
        return Swal.fire({
          icon: 'warning',
          title: 'Missing Sales/RMA Number',
          text: 'Before setting a line item to Shipped, fill Sales Order Number and RMA Number.',
        });
      }
      const formatMaterialOrderInformationForBackend = () => {
        return {
          ...materialOrderInformation,
          DeliveryRequestedDate: DateHelper.toDB(materialOrderInformation.DeliveryRequestedDate),
          CollectionRequestedDate: DateHelper.toDB(materialOrderInformation.CollectionRequestedDate),
          ReadyForClosureDate: DateHelper.toDB(materialOrderInformation.ReadyForClosureDate),
        };
      };

      if (!updatedLineItems || Object.keys(updatedLineItems).length === 0) {
        const payloadMoForm = {
          SalesOrderNumber: soNumber || undefined,
          RMANumber: rmaNumber || undefined,
          moUpdates: formatMaterialOrderInformationForBackend(),
        }
        const result = await ApiCustomer.patch(`/api/material-order/${materialOrders.MOID}`, payloadMoForm);
        res = result;
      } else {
        const payload = {
          moUpdates: formatMaterialOrderInformationForBackend(),
          updates: updatedLineItems,
          MOID: materialOrders.MOID,
          WOID: materialOrders.WOID,
          userId: user.id,
          SalesOrderNumber: soNumber || null,
          RMANumber: rmaNumber || null,
        };
        const result = await ApiCustomer.patch(`/api/material-order/batch-update`, payload);
        res = result;
      }
      console.log("RES : ",res);
      if(res.data) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.message,
        });
      }
      console.log("Semua line item berhasil diupdate.");

    } catch (error) {
         return Swal.fire({
        icon: "error",
        title: "Request Error",
        text: error.message || "Something went wrong!",
      });
    }
  }

  const saveAndCloseMaterialOrder = async () => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update the Material Order.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // Role guard: only CE can close MO
      const tokenUser = getUserFromToken();
      if (!tokenUser || (String(tokenUser.role).toLowerCase() !== 'ce' && String(tokenUser.role).toLowerCase() !== 'celead')) {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'Only CE can close a Material Order.',
        });
      }

      // Validation: all MO line items must be Closed
      try {
        const listRes = await ApiCustomer.get(`/api/material-order/material-order-line-items?MOID=${materialOrders.MOID}`);
        const items = Array.isArray(listRes.data?.data) ? listRes.data.data : [];
        const notClosed = items.filter(it => String(it.Status).toLowerCase() !== 'closed');
        if (notClosed.length > 0) {
          Swal.close();
          return Swal.fire({
            icon: 'warning',
            title: 'Line Items Still Open',
            text: 'Please close all Material Order Line Items before closing the Material Order.',
          });
        }
      } catch (e) {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          title: 'Validation Failed',
          text: 'Unable to verify line items status. Try again.',
        });
      }
      const res = await ApiCustomer.patch(
        `/api/material-order/${materialOrders.MOID}`,
        {
          OrderStatus: "Closed",
        }
      );
      if (res.data.success) {
        const token = {
          user: getUserFromToken()
        }
        const updateLog = await ApiCustomer.post("/api/actionlog", {
          CaseId: `${materialOrders.workorder?.CaseID}`,
          ReferenceId: `${materialOrders.MOID}`,
          model: "Material Orders",
          dataOld: materialOrders.OrderStatus,
          dataNew: res.data.data.OrderStatus,
          changedBy: token.user.id,
          logDescription: `Edit : Changed Material Order ${materialOrders.MOID} from ${materialOrders.OrderStatus} to ${res.data.data.OrderStatus}`
        })
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate(`/app/work/${materialOrders.WOID}`);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update!",
        text: error.message || "Something went wrong.",
      });
    }
  };
  return (
    <>
      <div className="flex items-center border-1 ">
        {buttons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            hidden={btn.hidden}
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}

        {/* {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 bg-gray-200 rounded-md">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="inline-block w-4 h-4 mr-2" />
                  {btn.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
        {/* <BtnModalsServiceCatalog open={openWorkOrder} setOpen={setOpenWorkOrder} caseDetails={caseDetails}/> */}
      </div>
      <div>
        {/* <ServiceCase 
      caseDetails={caseDetails}
      formData={caseNoteFormData}
      onChange={handleCaseNoteChange}
      caseNotes={caseNotes}
      setCaseNotes={setCaseNotes}
      selectedSymptom={selectedSymptom}
      setSelectedSymptom={setSelectedSymptom}
      /> */}
      </div>
    </>
  );
};

export const TabsServiceMOLineItems = ({ MOLineDetails, LineItemID, moLineItems }) => {
  const navigate = useNavigate();
  const currentRole = (getUserFromToken()?.role || '').toLowerCase();

  const buttons = [
    {
      icon: CircleChevronLeft,
      label: "",
      onClick: () => navigate(`/app/material-order/${MOLineDetails.MOID}`),
    },
    // { icon: SquareArrowOutUpRight, label: "", },
    { icon: Save, label: "Save", onClick: () => saveMOLI(LineItemID) },
    {
      icon: CopyXIcon,
      label: "Close MO Line Items",
      onClick: () => saveAndCloseMaterialLineItemsOrder(),
      hidden: currentRole !== 'ce' && currentRole !== 'celead',
    },
    { icon: StepBack, label: "Cancel", hidden: true },
    { icon: StepBack, label: "Audit", hidden: true },
    { icon: RotateCw, label: "Refresh", onClick: () => window.location.reload()},
    {
      icon: StepBack,
      label: "Word Templates",
      onClick: () => alert("not now"), hidden: true
    },
    { icon: StepBack, label: "Run Report", hidden: true },
    { icon: StepBack, label: "Geo Code", hidden: true },
    { icon: StepBack, label: "Process",hidden: true },
    { icon: StepBack, label: "Reset RDT",hidden: true },
    // { icon: UserPen, label:  "Add To Queue", onClick: () => alert("not now") },
    // { icon: StepBack, label: "Audit", onClick: () => alert("not now") },
  ];
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];

  const saveMOLI = async (LineItemID, shouldRedirect = true) => {
    try {
      Swal.fire({
        title: 'Saving...',
        text: 'Please wait while we update the line item.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      if (
        MOLineDetails.PartReturnStatusId &&
        MOLineDetails.PartReturnDOA &&
        !String(MOLineDetails.DOAReason || '').trim()
      ) {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Missing DOA Reason',
          text: 'Please provide a DOA reason when selecting a DOA return status.',
        });
        return false;
      }

      if (!MOLineDetails.QuantityUsed && !MOLineDetails.GoodReturnReason) {
        Swal.close();
        Swal.fire({
          icon: 'warning',
          title: 'Missing Good Return Reason',
          text: 'Select a reason for not using the part before saving.',
        });
        return false;
      }
      const res = await ApiCustomer.patch(`/api/material-order/material-order-line-items/${LineItemID}`, {
        Description: MOLineDetails.description,
        PickPackInstructions: MOLineDetails.pickPackInstructions,
        CollectionInstructions: MOLineDetails.collectionInstructions || "None",
        CustomerResponse: MOLineDetails.customerResponse,
        RejectedReason: MOLineDetails.rejectedReason,
        OtherReason: MOLineDetails.otherReason,
        FailureId: MOLineDetails.failureId,
        SerialNumber: MOLineDetails.serialNumber,
        RemovedPartNumber: MOLineDetails.removedPartNumber,
        RemovedSerialNumber: MOLineDetails.removedSerialNumber,
        RemovedPartDescription: MOLineDetails.removedPartDescription,
        QuantityUsed: MOLineDetails.QuantityUsed,
        CTValidation: MOLineDetails.CTValidation,
        PartReturnStatusId: MOLineDetails.PartReturnStatusId ?? null,
        DOAReason: MOLineDetails.DOAReason,
        PhotoPartUnit: MOLineDetails.PhotoPartUnit,
        GoodReturnReason: MOLineDetails.GoodReturnReason,
        UEFICode: MOLineDetails.UEFICode || "",  
        UEFI_NO : MOLineDetails.UEFI_NO || "",
      });
      if (res.data.success) {
        if (shouldRedirect) {
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: res.data.message,
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            navigate(`/app/mo_detail/${LineItemID}`);
          });
        }
        return true;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.data.message
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to update!',
        text: error.message || 'Something went wrong.'
      });
    }
  }

  const saveAndCloseMaterialLineItemsOrder = async () => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update the line item.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // Role guard: only CE can close a line item
      const tokenUser = getUserFromToken();
      if (!tokenUser || (String(tokenUser.role).toLowerCase() !== 'ce' && String(tokenUser.role).toLowerCase() !== 'celead')) {
        
        Swal.close();
        return Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'Only CE can close a Material Order Line Item.',
        });
      }

      // Required fields guard: Failure Code, New CT Key, Return CT Key
      const failureId = MOLineDetails?.failureId;
      const newCtKey = (MOLineDetails?.removedSerialNumber ?? '').toString().trim();
      const returnCtKey = (MOLineDetails?.removedPartNumber ?? '').toString().trim();
      if (!failureId || !newCtKey || !returnCtKey) {
        Swal.close();
        return Swal.fire({
          icon: 'warning',
          title: 'Missing Required Fields',
          text: 'Fill Failure Code, New CT Key, and Return CT Key before closing the line item.',
          timer: 3000, // auto close dalam 3 detik
          timerProgressBar: true, 
          didOpen: () => {
            Swal.showLoading();
          }

        });
      }
      const success = await saveMOLI(LineItemID, false);
      if (!success) return; // Stop if saveMOLI failed
      const res = await ApiCustomer.patch(
        `/api/material-order/material-order-line-items/${LineItemID}`,
        {
          Status: "Closed",
          FailureId: MOLineDetails.failureId,
        }
      );
      if (res.data.success) {
        console.log("MATERIAL ORDeR IN CLOSED POSTED : ", moLineItems)
        const token = {
          user: getUserFromToken()
        }
        const updateLog = await ApiCustomer.post("/api/actionlog", {
          CaseId: `${moLineItems.materialorder?.workorder?.CaseID}`,
          ReferenceId: `${moLineItems.MOID}`,
          model: "Material Order Line Item",
          dataOld: moLineItems.Status,
          dataNew: "Closed",
          changedBy: token.user.id,
          logDescription: `Edit : Change Material Order Line Item ${moLineItems.MOID} - ${moLineItems.LineItemID} Status from ${moLineItems.Status} to Closed`
        })

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate(`/app/material-order/${MOLineDetails.MOID}`);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update!",
        text: error.message || "Something went wrong.",
      });
    }
  };

  return (
    <>
      <div className="flex items-center border-1 sticky top-13 bg-gray-50 z-10 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600">
        {buttons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            hidden={btn.hidden}
            className={`rounded-none hover:bg-gray-200  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-2`}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}
        {console.log("Mo lIne Details ",MOLineDetails)}
        {/* {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 bg-gray-200 rounded-md">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="inline-block w-4 h-4 mr-2" />
                  {btn.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
        {/* <BtnModalsServiceCatalog open={openWorkOrder} setOpen={setOpenWorkOrder} caseDetails={caseDetails}/> */}
      </div>
      <div>
        {/* <ServiceCase 
      caseDetails={caseDetails}
      formData={caseNoteFormData}
      onChange={handleCaseNoteChange}
      caseNotes={caseNotes}
      setCaseNotes={setCaseNotes}
      selectedSymptom={selectedSymptom}
      setSelectedSymptom={setSelectedSymptom}
      /> */}
      </div>
    </>
  );
};

export const ServiceCase = ({
  caseDetails,
  formData,
  setCaseNoteFormData,
  onChange,
  caseNotes,
  setCaseNotes,
  handleCaseDetails,
  selectedSymptom,
  setSelectedSymptom,
  formGtc,
  setFormGtc,
  onChangeGtc,
  entitlementStatus,
  handleEntitlementStatus,
  csrForm,
  setCsrForm,
  onChangeCsr,
  caseForm,
  onChangeCase,
  setCaseForm,
}) => {
  const { open } = useSidebar();

  const [symptomSearchTerm, setSymptomSearchTerm] = useState("");
  const [symptomSuggestions, setSymptomSuggestions] = useState([]);

  const [createdOn, setCreatedOn] = useState(null);
  const [caseClosedDate, setCaseClosedDate] = useState(null);
  const [submittedToBase, setsubmittedToBase] = useState(null);

  const [pendingCustomerAction, setPendingCustomerAction] = useState(null);
  const [customerRequestedCloseDate, setCustomerRequestedCloseDate] =
    useState(null);
  const [ReadyForClosureDate, setReadyForClosureDate] = useState(null);
  // const [cr]
  useEffect(() => {
    if (caseDetails?.CreatedOn) {
      setCreatedOn(new Date(caseDetails.CreatedOn)); // includes date + time
    }
  }, [caseDetails]);

  const tabs = [
    { value: "case_info", label: "Case Information" },
    { value: "customer,add,entitement", label: "Customer, Asset & Entitement" },
    { value: "ci_notes", label: "Notes & Information" },
    { value: "ci_activitas", label: "Activities", disable: true },
    { value: "ci_actions", label: "Customer Interactions", disable: true },
    { value: "ci_wo", label: "Work Order Validation" },
    { value: "ci_orders", label: "Orders" },
    { value: "ci_salles", label: "Sales Offer", disable: true },
    { value: "ci_knowledge", label: "Knowledge & Attachments", },
    { component: <SelectBarRelated /> },
  ];

  const visibleTabs = open ? tabs.slice(0, -2) : tabs;
  const hiddenTabs = open
    ? [
      { value: "ci_knowledge", label: "Knowledge & Attachments" },
      { component: <SelectBarRelated /> },
    ]
    : [];

  const [selected, setSelected] = useState("--Selected--");

  const [dataFetchCustomerData, setDataFetchCustomerData] = useState({
    MainAccount: null,
    SiteAccount: null,
    Type: null,
  });
  const [dataFetchAssetInformation, setDataFetchAssetInformation] = useState();
  const [ownerUserData, setOwnerUserData] = useState([]);

  const [workOrders, setWorkOrders] = useState([]);

  const [materialOrders, setMaterialOrders] = useState([]);

  const [actionLogs, setActionLogs] = useState([]);

  const fetchCustomerData = async () => {
    try {
      const resMainAccount = await ApiCustomer.get(
        `/api/contact-information/${caseDetails.ContactID}`
      );
      setDataFetchCustomerData({
        MainAccount: resMainAccount.data.data,
      });
      if (caseDetails.SiteAccountID !== null) {
        const resSiteAccount = await ApiCustomer.get(
          `/api/site_account/${caseDetails.SiteAccountID}`
        );
        setDataFetchCustomerData((prev) => ({
          ...prev,
          SiteAccount: resSiteAccount.data.data,
          Type: "SiteAccount",
        }));
      } else {
        setDataFetchCustomerData((prev) => ({
          ...prev,
          type: "Individual",
        }));
      }
    } catch (err) {
      console.error("Error returning Customer Data : ", err);
      return null;
    }
  };

  const fetchAssetInformation = async () => {
    try {
      const resAsset = await ApiCustomer.get(
        `/api/asset-information/${caseDetails.AssetID}`
      );
      setDataFetchAssetInformation({
        AssetInformation: resAsset.data.data,
      });
    } catch (err) {
      console.error("Error returning Asset Data : ", err);
      return null;
    }
  };

  const fetchCaseNotes = async () => {
    try {
      const res = await ApiCustomer.get(`/api/case-information/case-notes`);
      const notes = res.data.data;

      const existingNote = notes.find(
        (note) => note.CaseID === caseDetails.CaseID
      );

      let noteID = null;

      if (existingNote) {
        noteID = existingNote.NoteID;
      } else {
        const createResponse = await ApiCustomer.post(
          `/api/case-information/case-notes`,
          {
            LogType: "NotesLog",
            ActionType: "",
            Template: "",
            VisibleExternally: false,
            MinutesSpent: 0,
            Note: "",
            CaseID: caseID,
          }
        );

        noteID = createResponse.data.data.NoteID;
      }

      const detailRes = await ApiCustomer.get(
        `/api/case-information/case-notes/${noteID}`
      );
      const noteDetail = detailRes.data.data;

      console.log("Case Note Detail:", noteDetail);
      return noteDetail;
    } catch (err) {
      console.error("Error in fetchCaseNotes:", err);
      return null;
    }
  };

  const fetchOwnerUserData = async () => {
    try {
      const response = await ApiCustomer.get(`/api/user/${caseDetails.CreatedBy}`)
      setOwnerUserData(response.data.data)
    } catch (error) {

    }
  }

  const fetchWorkOrders = async () => {
    try {
      const res = await ApiCustomer.get(
        `/api/work-order?CaseID=${caseDetails.CaseID}`
      );
      setWorkOrders(res.data.data); // adjust based on API response shape
      console.log("Fetch Work Order: ", res.data.data);
    } catch (err) {
      console.error("Failed to fetch work orders:", err);
    }
  };

  const fetchMaterialOrders = async () => {
    try {
      if (!workOrders.length) return;

      const woidList = workOrders.map((wo) => wo.WOID).join(",");
      const res = await ApiCustomer.get(`/api/material-order?WOID=${woidList}`);
      setMaterialOrders(res.data.data);
    } catch (err) {
      console.error("Failed to fetch Material orders:", err);
    }
  };

  const fetchGtc = async () => {
    try {
      const gtcData = caseDetails.global_trade_check;
      setFormGtc(gtcData ?? formGtc);
    } catch (err) {
      console.error("Error fetching GTC:", err);
      setFormGtc(formGtc);
    }
  };

  const [otcCode, setOtcCode] = useState([])

  const fetchOTCCode = async () => {
    try {
      const res = await ApiCustomer.get('/api/otc-code')
      setOtcCode(res.data.data)
    } catch (e) {
      console.error("Failed to fetch OTC Code:", err);
    }
  }

  const [caseTipe, setCaseTipe] = useState([
    {
      CaseType: "Administrative"
    },
    {
      CaseType: "ASP/Reseller/GS1"
    },
    {
      CaseType: "Bench"
    },
    {
      CaseType: "Call to Repair"
    },
    {
      CaseType: "Complex T&M"
    },
    {
      CaseType: "Depot Repair"
    },
    {
      CaseType: "Electronic"
    },
    {
      CaseType: "HW Delivery"
    },
    {
      CaseType: "IMACD"
    },
    {
      CaseType: "Internal Service"
    },
    {
      CaseType: "Internal Support"
    },
    {
      CaseType: "Onsite"
    },
    {
      CaseType: "Proactive"
    },
    {
      CaseType: "Remote Services"
    },
    {
      CaseType: "Services (VAS)"
    },
    {
      CaseType: "SW Delivery"
    },
    {
      CaseType: "T&M"
    },
  ])

  const fetchCsr = async () => {
    try {
      const csrData = caseDetails.caseresolution;
      console.log("CSR Data: ", csrData);

      if (csrData) {
        setCsrForm({
          caseResolutionCode: csrData.caseResolutionCode || "",
          autoClose: csrData.autoClose || "",
          caseReadyForClosure: csrData.caseReadyForClosure || "",
          readyForCloseDays: csrData.readyForCloseDays || "",
          readyForClosureDate: csrData.readyForClosureDate ? new Date(csrData.readyForClosureDate) : "",
          pendingCustomerAction: csrData.pendingCustomerAction ? new Date(csrData.pendingCustomerAction) : "",
          customerRequestedCloseDate: csrData.customerRequestedCloseDate ? new Date(csrData.customerRequestedCloseDate) : "",
        });
      } else {
        setCsrForm(csrForm);
      }
    } catch (err) {
      console.error("Error fetching CSR:", err);
      setCsrForm(csrForm);
    }
  };


  const statusEnumToLabel = {
    New: "New",
    Open: "Open",
    InActive: "Inactive",
    Close: "Closed",
    Active: "Active",
    Monitor: "Monitor",
    Pending_Customer_Action: "Pending Customer Action",
    Quote_Requested: "Quote Requested",
    Pending_Follow_Up: "Pending Follow Up",
    Pending_Order: "Pending Order",
    Escalated: "Escalated",
    Quote_Approved: "Quote Approved",
    Pending_Quote: "Pending Quote"
  };

  const labelToStatusEnum = Object.fromEntries(
    Object.entries(statusEnumToLabel).map(([key, val]) => [val, key])
  );


  const fetchCase = async () => {
    try {
      const res = await ApiCustomer.get(`/api/case-information/${caseDetails.CaseID}`);
      setCaseForm(res.data.data);
    } catch (err) {
      console.error("Error fetching case:", err);
      setCaseForm(caseForm); // fallback jika error
    }
  };

  const fetchActionLog = async () => {
    try {
      const actionlog = await ApiCustomer.get(`/api/actionlog?caseId=${caseDetails.CaseID}`)
      setActionLogs(actionlog.data.data)
    } catch (error) {
      console.error("Error fetching ActionLog:", err);
    }
  }

  //handler all case
  useEffect(() => {
    fetchCustomerData();
    fetchAssetInformation();
    fetchOwnerUserData();

    fetchWorkOrders();
    const loadNote = async () => {
      const noteDetail = await fetchCaseNotes();
      if (noteDetail) {
        setCaseNoteFormData((prev) => ({
          ...prev,
          NotesDisplay: noteDetail.Note,
          ActionType: noteDetail.ActionType,
          CreatedOn: noteDetail.CreatedOn,
          LogType: noteDetail.LogType,
          VisibleExternally: noteDetail.VisibleExternally,
        }));
      }
    };
    loadNote();
    fetchGtc();
    fetchOTCCode();
    fetchCsr();
    fetchCase();
    fetchActionLog();
  }, []);

  useEffect(() => {
    if (otcCode.length > 0 && caseDetails?.OTCCode) {
      handleEntitlementStatus("OTCCode")(caseDetails.OTCCode)
    }
  }, [otcCode, caseDetails]);

  useEffect(() => {
    console.log("Data Asset Info : ", dataFetchAssetInformation);

    console.log("Fetch Data Customer Success : ", dataFetchCustomerData);
    console.log("Fetch Data User ", ownerUserData);
  }, [ownerUserData]);

  // console.log("Selected Symptopm ",selectedSymptom)

  // useEffect(() => {
  // }, selectedSymptom)

  //order section
  //workorder

  useEffect(() => {
    console.log("Work Orders Fetching L ", workOrders);
    if (workOrders.length > 0) {
      fetchMaterialOrders();
    }
  }, [workOrders]);

  const navigate = useNavigate();

  const handleClick = async () => {
    // await fetchOwnerUserData();
    // await fetchCustomerData();
    {
      workOrders.map((work) => {
        navigate(`/app/work/${work.WOID}`, {
          // state: { ownerUserData, dataFetchCustomerData }
        });
      });
    }
  };

  useEffect(() => {
    console.log("Data Asset Info : ", dataFetchAssetInformation)

    console.log("Fetch Data Customer Success : ", dataFetchCustomerData)
    console.log("Fetch Data User ", ownerUserData)
  }, [ownerUserData])

  const fetchSymptomCodes = async (term) => {
    try {
      const response = await ApiCustomer.get("/api/symptom-codes");
      const allCodes = response.data.data;

      const filtered = allCodes.filter((sym) =>
        sym.SymptomCode.toLowerCase().includes(term.toLowerCase())
      );

      setSymptomSuggestions(filtered);
    } catch (err) {
      console.error("Error fetching symptom codes", err);
    }
  };


  const [startDate, setstartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  return (
    <>
      {caseDetails.CaseStatus === "Close" && (
        <div className="p-4 my-2 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500">
          This Case is <strong>read-only</strong> because it is{" "}
          <strong>Closed</strong>.
        </div>
      )}
      <Card className="p-0 mt-2 border-0 rounded-none">
        <Tabs defaultValue="case_info">
          <CardHeader className="sticky flex flex-col w-full gap-3 p-2 border-2">
            <div className="flex justify-between">
              <CardTitle className="text-xl ">
                {caseDetails.CaseID}
                <span className="flex items-center text-sm">
                  Case .
                  <Select
                    onValueChange={setSelected}
                    defaultValue="case"
                    className="shadow-xl"
                  >
                    <SelectTrigger className="border-none shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="case">Case</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </span>
              </CardTitle>
              <CardTitle className="flex">
                <div className="flex flex-col justify-center px-2 border-r-2 item-center">
                  <h1 className="text-blue-500">{ownerUserData.Name}</h1>
                  <p className="text-sm font-light ">Owner</p>
                </div>
                <div className="flex flex-col justify-center px-2 border-r-2 item-center">
                  <h1 className="text-blue-500">---</h1>
                  <p className="text-sm font-light ">Queue</p>
                </div>
                <div className="flex flex-col justify-center px-2 border-r-2 item-center">
                  <h1 className="text-blue-500">
                    {dataFetchCustomerData.MainAccount?.Salutation}{" "}
                    {dataFetchCustomerData.MainAccount?.FirstName}{" "}
                    {dataFetchCustomerData.MainAccount?.LastName}
                  </h1>
                  <p className="text-sm font-light ">Contact</p>
                </div>
                <div className="flex flex-col justify-center px-2 border-r-2 item-center">
                  <Select onValueChange={setSelected} defaultValue="first">
                    <SelectTrigger className="p-0 text-blue-500 border-none shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <SelectGroup className="p-0">
                        <SelectItem value="first" className="p-0">
                          {dataFetchCustomerData.SiteAccount?.Company}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-sm font-light ">Site Account</p>
                </div>
              </CardTitle>
            </div>
            <TabsList className="bg-white">
              {visibleTabs.map((tab, index) =>
                tab.component ? (
                  <div key={index}>{tab.component}</div> // Ensure SelectBarRelated renders properly
                ) : (
                  <TabsTrigger
                    key={index}
                    variant="underline"
                    value={tab.value}
                    disabled={tab.disable}

                  >
                    {tab.label}
                  </TabsTrigger>
                )
              )}
              {open && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-2 py-1 bg-gray-200 rounded-md">
                    ...
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {hiddenTabs.map((tab, index) =>
                      tab.component ? (
                        <DropdownMenuItem key={index}>
                          {tab.component}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem key={index}>
                          <TabsTrigger variant="underline" value={tab.value}>
                            {tab.label}
                          </TabsTrigger>
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TabsList>
          </CardHeader>
          <TabsContent value="case_info" className={"p-2"}>
            <Card className="flex-row">
              <CardContent className="grid items-center grid-cols-6 gap-10 p-3 ">
                <CaseField label="Case ID" icon>
                  <Input
                    variant="invisible"
                    value={caseDetails.CaseID}
                    readOnly
                  />
                </CaseField>
                <CaseField label="Case Subject" span={3}>
                  <Input variant="invisible" value={caseDetails.CaseSubject} />
                </CaseField>
                <CaseField label="Incoming Channel" icon>
                  <Input
                    variant="invisible"
                    value={caseDetails.IncomingChannel}
                  />
                </CaseField>
                <CaseField label="Business Segment">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Email Status">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Case Status">
                  <SearchCommandBlock
                    value={statusEnumToLabel[caseForm?.CaseStatus] || "--Select--"}
                    onChange={(label) => {
                      const enumValue = labelToStatusEnum[label];
                      onChangeCase("CaseStatus")(enumValue);
                    }}
                    placeholder="--Select--"
                    options={Object.values(statusEnumToLabel)}
                  />
                </CaseField>
                <CaseField label="Case Type">
                  <SearchCommandBlock
                    value={caseForm?.CaseType}
                    onChange={onChangeCase("CaseType")}
                    placeholder="--Select--"
                    options={[
                      "Depot Repair",
                      "Onsite",
                      "Bench",
                    ]}
                  />
                </CaseField>
                <CaseField label="KCI For Case?">
                  {caseDetails.KCI_Flag ? "Yes" : "No"}
                </CaseField>
                <CaseField label="Case Priority">
                  {caseDetails.CasePriority}
                </CaseField>
                <CaseField label="HPI Segment">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Customer Tracking Number" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Customer Severity">
                  {caseDetails.CustomerSeverity}
                </CaseField>
                <CaseField label="Update Customer Tracking Number" span={3}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Created ON" icon span={3}>
                  <DatePicker
                    variant="icon"
                    value={createdOn}
                    onChange={setCreatedOn}
                    readOnly
                  ></DatePicker>
                </CaseField>
                <CaseField label="Alternate Customer Tracking Number">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Case Closed Date" icon span={3}>
                  <span className="flex gap-[5em]">
                    <DatePicker
                      variant="icon"
                      value={caseClosedDate}
                      onChange={setCaseClosedDate}
                      readOnly
                    ></DatePicker>
                  </span>
                </CaseField>
                <CaseField label="Irrelevant" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Submitted To Base" icon span={3}>
                  <span className="flex gap-[5em]">
                    <DatePicker
                      variant="icon"
                      value={submittedToBase}
                      onChange={setsubmittedToBase}
                      readOnly
                    ></DatePicker>
                  </span>
                </CaseField>
              </CardContent>
            </Card>

            <Card className="flex-col mt-5">
              <CardHeader>
                <CardTitle className="text-lg ">Global Trade Check</CardTitle>
                <hr />
              </CardHeader>

              <CardContent className="grid gap-10  grid-cols-6 p-3 items-center">
                <CaseField label="Global Trade Status">
                  <SearchCommandBlock
                    value={formGtc.global_trade_status}
                    onChange={onChangeGtc("global_trade_status")}
                    placeholder="--Select--"
                    options={[
                      "Pass",
                      "Fail",
                      "Not Done",
                      "Not Needed",
                      "Failed Confirmed",
                    ]}
                  />
                </CaseField>

                <CaseField label="GT Override Reason">
                  <SearchCommandBlock
                    value={formGtc.gt_override_reason}
                    onChange={onChangeGtc("gt_override_reason")}
                    placeholder="--Select--"
                    options={[
                      "Military Keyword False Match",
                      "Embargo False Match",
                      "RPL False Match",
                      "Active Contract",
                      "United States Government",
                      "Global Trade Authorization",
                      "RPL Manual Screening Passed",
                      "Fail Confirmed by GT",
                      "Other",
                    ]}
                  />
                </CaseField>
                <CaseField label="GT Active Listening">
                  <SearchCommandBlock
                    value={formGtc.gt_active_listening}
                    onChange={onChangeGtc("gt_active_listening")}
                    placeholder="--Select--"
                    options={["Pass", "Fail"]}
                  />
                </CaseField>
                <CaseField label="Embargoed Country" icon>
                  <Input
                    variant="invisible"
                    placeholder="---"
                    value={formGtc.embargoed_country}
                    onChange={(e) =>
                      onChangeGtc("embargoed_country")(e.target.value)
                    }
                  />
                </CaseField>
                <CaseField label="GT Details">
                  <Input
                    variant="invisible"
                    placeholder="---"
                    value={formGtc.gt_details}
                    onChange={(e) => onChangeGtc("gt_details")(e.target.value)}
                  />
                </CaseField>
                <CaseField label="GT All Comments">
                  <Input
                    variant="invisible"
                    placeholder="---"
                    value={formGtc.gt_al_comments}
                    onChange={(e) =>
                      onChangeGtc("gt_al_comments")(e.target.value)
                    }
                  />
                </CaseField>
                <CaseField className={"col-start-3"} label="Screening ID">
                  <Input
                    variant="invisible"
                    placeholder="---"
                    value={formGtc.screening_id}
                    onChange={(e) =>
                      onChangeGtc("screening_id")(e.target.value)
                    }
                  />
                </CaseField>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="customer,add,entitement"
            className={"p-1 flex flex-col gap-4"}
          >
            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">Customer Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid items-center grid-cols-6 gap-10">
                <CaseField label="Customer Account" icon>
                  <Input
                    variant="invisible"
                    value={
                      dataFetchCustomerData?.Type == "SiteAccount"
                        ? dataFetchCustomerData?.SiteAccount?.Company
                        : dataFetchCustomerData?.MainAccount?.FirstName +
                        " " +
                        dataFetchCustomerData?.MainAccount?.LastName
                    }
                    readOnly
                  />
                </CaseField>
                <CaseField label="Primary Contact" icon>
                  <Input
                    variant="invisible"
                    value={`${dataFetchCustomerData.MainAccount?.Salutation} ${dataFetchCustomerData.MainAccount?.FirstName} ${dataFetchCustomerData.MainAccount?.LastName}`}
                    readOnly
                  />
                </CaseField>
                <CaseField label="Submitted By">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Is Partner" icon>
                  <Input variant="invisible" placeholder="---" readOnly />
                </CaseField>
                <CaseField label=" Primary Email" icon>
                  <Input
                    variant="invisible"
                    value={dataFetchCustomerData.MainAccount?.Email}
                    placeholder="---"
                    readOnly
                  />
                </CaseField>
                <CaseField label="Partner & Customer" icon>
                  <Input variant="invisible" placeholder="---" readOnly />
                </CaseField>
                <CaseField label="HIPAA" icon>
                  <Input variant="invisible" placeholder="---" readOnly />
                </CaseField>
                <CaseField label="Phone" icon>
                  {" "}
                  {dataFetchCustomerData?.Type == "SiteAccount"
                    ? dataFetchCustomerData?.SiteAccount?.PrimaryPhone
                    : dataFetchCustomerData?.MainAccount?.Phone}
                </CaseField>
                <CaseField label="Region" icon>
                  <Input variant="invisible" placeholder="---" readOnly />
                </CaseField>
                <CaseField label="PIN">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Secondary Contact">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Parent Company">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Customer Time Zone" icon>
                  <Input variant="invisible" placeholder="---" readOnly />
                </CaseField>
                <CaseField label="Country" icon>
                  <Input
                    variant="invisible"
                    value={
                      dataFetchCustomerData?.Type == "SiteAccount"
                        ? dataFetchCustomerData?.SiteAccount?.Country
                        : dataFetchCustomerData?.MainAccount?.Country
                    }
                    readOnly
                  />
                </CaseField>
                <CaseField label="Parent Company Non-Latin">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Account Tier" className={"col-start-5"}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">Asset Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid items-center grid-cols-6 gap-10">
                <CaseField label="Assets" icon>
                  {dataFetchAssetInformation?.AssetInformation?.SerialNumber}{" "}
                </CaseField>
                <CaseField label="Product Number" icon>
                  {
                    dataFetchAssetInformation?.AssetInformation
                      ?.product_information?.ProductNumber
                  }
                </CaseField>
                <CaseField label="Asset Location">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Serial Number" icon>
                  {dataFetchAssetInformation?.AssetInformation?.SerialNumber}{" "}
                </CaseField>
                <CaseField label="HW Profit Center" icon>
                  {" "}
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="SNIC - Count" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Product Name" icon>
                  {
                    dataFetchAssetInformation?.AssetInformation
                      ?.product_information?.ProductName
                  }{" "}
                </CaseField>
                <CaseField label="HWPC Code" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="MV Product Description" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <div className="grid items-center grid-cols-2 col-span-2 gap-2 p-5 ring-1">
                  <CaseField label="Device Properties" icon>
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                </div>
              </CardContent>
              {/* TABEL ACCESSORY */}
              <div className="px-6 pb-6">
                <h3 className="text-md font-semibold mb-2">Accessory</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="border px-4 py-2">Accessories ID</th>
                        <th className="border px-4 py-2">Case ID</th>
                        <th className="border px-4 py-2">Accessories</th>
                        <th className="border px-4 py-2">Note</th>
                        <th className="border px-4 py-2">CT_SNCode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {caseDetails.accessory?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border px-4 py-2">{item.id}</td>
                          <td className="border px-4 py-2">{item.CaseID}</td>
                          <td className="border px-4 py-2">{item.Accessories}</td>
                          <td className="border px-4 py-2">{item.Note || "---"}</td>
                          <td className="border px-4 py-2">{item.CT_SNCode || "---"}</td>
                        </tr>
                      ))}
                      {(!caseDetails?.accessory ||
                        caseDetails.accessory.length === 0) && (
                          <tr>
                            <td className="border px-4 py-2 text-center" colSpan={5}>
                              No accessories found.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">SLA Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid items-center grid-cols-6 gap-10">
                <CaseField label="Latest Start Date (Cust Time)" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Coverage Window Used" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Response Time Value" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Guaranteed Fix Date (Cust Time)" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Coverage Window Value" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Repair Time Value" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Case Priority Index" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Case Priority Rule" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">
                  Entitlement Information
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid items-center grid-cols-9 gap-10">
                <CaseField label="Case Entitlement" icon span={2}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Start Date" icon span={2}>
                  {" "}
                  <DatePicker
                    value={startDate}
                    onChange={setstartDate}
                    readOnly
                  ></DatePicker>{" "}
                </CaseField>
                {console.log(entitlementStatus)}
                <CaseField label="OTC Code" icon span={2}>
                  <SearchCommandBlock
                    options={otcCode}
                    value={entitlementStatus.OTCCode}
                    onChange={(value) =>
                      handleEntitlementStatus("OTCCode")(value)
                    }
                    placeholder="---"
                    renderLabel={(opt) => `${opt.OTCCode} - ${opt.Description}`}
                    getValue={(opt) => opt.OTCCode}
                  />
                </CaseField>
                <CaseField label="Entitlement Status" icon span={2}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="End Date" icon span={2}>
                  {" "}
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    readOnly
                  ></DatePicker>
                </CaseField>
                <CaseField label="Entitlement Override" icon span={2}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Selected Entitlement Offer" icon span={2}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Days Left" icon span={2}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Authorizing Employee" icon span={2}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ci_notes" className={"p-2 flex flex-col gap-4"}>
            <Card className="flex-col p-2 ">
              <CardHeader>
                <CardTitle className="text-lg ">
                  Customer Issue Description & System Information
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="flex p-4 gap-x-5">
                <div className="grid items-center flex-1 grid-cols-6 grid-row-7 gap-y-7">
                  <div className="row-span-4 col-span-full">
                    <textarea
                      className="border-2 ring-1 ring-gray-400 w-[100%] h-[12em] resize-none"
                      readOnly
                      value={caseDetails?.CaseProductNote}
                    ></textarea>
                  </div>
                  <CaseField
                    label="Related Device"
                    className={"col-span-3"}
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField
                    label="Device Manufacturer"
                    className={"col-span-3"}
                    span={3}
                    icon
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField
                    label="Device Model"
                    className={"col-span-3"}
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                </div>

                <div className="grid flex-1 grid-flow-row grid-cols-6 gap-y-7">
                  <CaseField
                    label="Program/Category"
                    className={"col-span-3"}
                    span={2}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField
                    label="Operating System"
                    className={"col-span-3"}
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField label="Version" className={"col-span-3"} span={3}>
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField
                    label="Remote Diag Code"
                    className={"col-span-3"}
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField
                    label="Application Information"
                    className={"col-span-3"}
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField
                    label="Provider / Platform"
                    className={"col-span-3"}
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField
                    label="Software Version"
                    className={"col-span-3"}
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col p-2 ">
              <CardHeader>
                <CardTitle className="text-lg ">Case Notes</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="flex gap-4">
                <div className="grid flex-1 grid-cols-6 gap-y-7">
                  <CaseField label="Log Type" className={"col-span-2"} span={4}>
                    <Select value={formData?.LogType} onValueChange={(val) => onChange("LogType", val)}>
                      <SelectTrigger
                        className={"w-[100%] hover:shadow-lg border-b-0"}
                      >
                        <SelectValue placeholder="Log Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NotesLog">Notes Log</SelectItem>
                        <SelectItem value="PhoneLog">Phone Log</SelectItem>
                      </SelectContent>
                    </Select>
                  </CaseField>

                  <CaseField
                    label="Action Type"
                    className={"col-span-2"}
                    span={4}
                  >
                    <SearchCommandBlock
                      value={formData?.ActionType}
                      onChange={(val) => onChange("ActionType", val)}
                      placeholder="--Select--"
                      options={[
                        "Inbound Customer call",
                        "Action Plan",
                        "Administrative task",
                        "CE/Partner Assist",
                        "Customer Email",
                      ]}
                    />
                  </CaseField>

                  <CaseField label="Template" className={"col-span-2"} span={4}>
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>

                  <CaseField
                    label="Visible Externally"
                    className={"col-span-2"}
                    span={4}
                  >
                    <SelectYN
                      value={
                        formData?.VisibleExternally === undefined ||
                          formData?.VisibleExternally === null
                          ? ""
                          : formData?.VisibleExternally
                            ? "Yes"
                            : "No"
                      }
                      onValueChange={(val) =>
                        onChange("VisibleExternally", val === "Yes")
                      }
                    ></SelectYN>
                  </CaseField>

                  <CaseField
                    label="Number of Minutes Spent"
                    className={"col-span-2"}
                    icon
                    span={3}
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>

                  <CaseField
                    label="Notes"
                    className={"col-span-2 self-start bg-red"}
                    span={4}
                    star
                  >
                    <textarea
                      className="h-[10em] w-[100%] resize-none p-2 border-2 ring-1 ring-gray-500"
                      value={formData?.Note || ""}
                      onChange={(e) => onChange("Note", e.target.value)}
                    />
                  </CaseField>
                </div>

                <div className="flex flex-1">
                  <textarea
                    className="w-[100%] h-[100%] resize-none p-2 ring-1 ring-gray-500"
                    readOnly
                    value={formData?.NotesDisplay}
                  >
                  </textarea>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Action Log</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">No</TableHead>
                      <TableHead>ReferenceId</TableHead>
                      <TableHead>Change By</TableHead>
                      <TableHead>Old Status</TableHead>
                      <TableHead>New Status</TableHead>
                      <TableHead>Change At</TableHead>
                      <TableHead>Log Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionLogs?.length > 0 ? (
                      actionLogs.map((log, index) => (
                        <TableRow key={log.id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{log.ReferenceId}</TableCell>
                          <TableCell>{log.changedByUser?.Name}</TableCell>
                          <TableCell>{log.dataOld}</TableCell>
                          <TableCell>{log.dataNew}</TableCell>
                          <TableCell>{new Date(log.ChangeAt).toLocaleString()}</TableCell>
                          <TableCell>{log.logDescription}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center italic">
                          No action logs available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">
                  Symptom Description / CardTitle
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="flex gap-6">
                <div className="grid flex-1 grid-cols-5 gap-y-7 gap-x-2">
                  <CaseField
                    label="Keyword Search"
                    className={"col-span-2"}
                    span={3}
                    star
                  >
                    <Input
                      placeholder="..."
                      type="search"
                      className=""
                      value={symptomSearchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSymptomSearchTerm(value);
                        if (value.length >= 2) fetchSymptomCodes(value);
                        else setSymptomSuggestions([]);
                      }}
                    />
                  </CaseField>

                  {symptomSuggestions.length > 0 && (
                    <ul className="absolute z-10 overflow-y-auto bg-white border max-h-40">
                      {symptomSuggestions.map((sym) => (
                        <li
                          key={sym.SymptomCodeID}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedSymptom(sym);
                            setSymptomSearchTerm(sym.SymptomCode);
                            setSymptomSuggestions([]);
                          }}
                        >
                          {sym.SymptomCode}
                        </li>
                      ))}
                    </ul>
                  )}

                  <CaseField
                    label="Top Category"
                    className={"col-span-2"}
                    span={3}
                  >
                    {selectedSymptom?.TopCategory}
                  </CaseField>
                  <CaseField
                    label="Sub Category"
                    className={"col-span-2"}
                    span={3}
                  >
                    {selectedSymptom?.SubCategory}
                  </CaseField>
                  <CaseField
                    label="Spesific Symptom"
                    className={"col-span-2"}
                    span={3}
                  >
                    {selectedSymptom?.SymptomCode}
                  </CaseField>
                </div>

                <div className="flex flex-1 font-bold">
                  <Table className="pverflow-auto">
                    <TableCaption className="caption-top">
                      {/* Optional caption content here */}
                    </TableCaption>

                    <TableHeader>
                      <TableRow className={""}>
                        <TableHead>Quality Codes</TableHead>
                        <TableHead className={"text-right"}>
                          Add Existing QA Code
                        </TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="">
                          <div className="flex items-center gap-1">
                            QA Level 1 <ArrowUp /> <ChevronDown />
                          </div>
                        </TableHead>
                        <TableHead className="">
                          <div className="flex items-center gap-1">
                            QA Level 2 <ArrowUp /> <ChevronDown />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      <TableRow>
                        <TableCell>Entry</TableCell>
                        <TableCell>0A - see comments</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col mt-5">
              <CardHeader>
                <CardTitle className="text-lg ">Case Resolution</CardTitle>
                <hr />
              </CardHeader>

              <CardContent className="grid grid-cols-7 gap-5 p-3 ">
                <CaseField label="Case Resolution Code" star>
                  <SearchCommandBlock
                    value={csrForm.caseResolutionCode}
                    onChange={onChangeCsr("caseResolutionCode")}
                    placeholder="--Select--"
                    options={[
                      "Offsite Solution",
                      "Cancel per Customer/No Contact",
                      "Case Voided",
                      "Cloud Recovery Download",
                      "Customer Satisfaction",
                    ]}
                  />
                </CaseField>
                <CaseField label="Case Ready for Closure" icon>
                  <SelectYN
                    value={csrForm.caseReadyForClosure}
                    onValueChange={(val) =>
                      onChangeCsr("caseReadyForClosure")(val)
                    }
                  />
                </CaseField>

                <CaseField label="Pending Customer Action" icon span={2}>
                  <DatePicker
                    value={csrForm.pendingCustomerAction}
                    onChange={onChangeCsr("pendingCustomerAction")}
                  />
                </CaseField>
                <CaseField label="Auto Close">
                  <SelectYN
                    value={csrForm.autoClose}
                    onValueChange={(val) => onChangeCsr("autoClose")(val)}
                  />
                </CaseField>
                <CaseField label="Ready for Close Days" icon>
                  <Input
                    type="number"
                    variant="invisible"
                    value={csrForm.readyForCloseDays}
                    onChange={(e) =>
                      onChangeCsr("readyForCloseDays")(e.target.value)
                    }
                  />
                </CaseField>
                <CaseField label="Customer Requested Close Date" icon span={2}>
                  <DatePicker
                    value={csrForm.customerRequestedCloseDate}
                    onChange={onChangeCsr("customerRequestedCloseDate")}
                  />
                </CaseField>
                <CaseField
                  className={"col-start-3"}
                  label="Ready for Closure Date"
                  icon
                  span={2}
                >
                  <DatePicker
                    value={csrForm.readyForClosureDate}
                    onChange={onChangeCsr("readyForClosureDate")}
                  />
                </CaseField>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ci_activitas">
            <Card className="mt-7">
              <CardHeader>Hello Word</CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="ci_actions">
            <Card className="mt-7">
              <CardHeader>Hello Word</CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="ci_wo">
            <div className="flex gap-4">
              <Card className="flex-1/3  rounded-md">
                <CardHeader>
                  <CardTitle className=" text-lg">Case Information</CardTitle>
                  <hr />
                </CardHeader>
                <CardContent className="grid gap-5 grid-cols-2">
                  <CaseField label="Case Subject" span={1}>
                    {caseDetails.CaseSubject}
                  </CaseField>
                  <CaseField label="Case Type">{caseDetails.CaseType}</CaseField>
                  <CaseField label="Businnes Segment">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="HPI Segment">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>

                  <CaseField label="Global Trade Status">
                    {caseDetails.global_trade_check?.global_trade_status || "---"}
                  </CaseField>
                  <CaseField label="Global Trade Ovveride Reason">
                    {caseDetails.global_trade_check?.gt_override_reason || "---"}
                  </CaseField>
                  <CaseField label="GT Active Listening">
                    {caseDetails.global_trade_check?.gt_active_listening || "---"}
                  </CaseField>
                  <CaseField label="Security Status" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Security Ovveride Reason" icon>
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                </CardContent>
              </Card>
              <div className="flex-3 flex flex-col gap-4">
                <Card className="rounded-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Case Notes History</CardTitle>
                    <hr />
                  </CardHeader>
                  <CardContent>
                    <CaseField label="Notes History" icon>
                      <textarea
                        className="mt-4 resize-none w-full min-h-[400px] p-2 ring-1 ring-gray-300 rounded-md text-md"
                        readOnly
                        value={caseNotes?.NotesDisplay}
                      />
                    </CaseField>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ci_orders" className={"p-2 flex flex-col gap-4"}>
            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">Shipment Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid items-center grid-cols-4 gap-10">
                <CaseField label="Shipment Country">
                  <SearchCommandBlock
                    variant="invisible"
                    value={workOrders[0]?.ShipmentCountry || "---"}
                    readOnly
                    options={["USA", "Canada", "Indonesia", "UK", "Germany", "France", "Japan", "China", "India", "Australia", "Brazil"]}
                  />
                </CaseField>
                <CaseField label="Exception Order">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Shipment State" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="SBD Override">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Major Account Id">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Currency">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Promo Code" className={"col-start-3"}>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">Work Order</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="flex flex-col gap-5 p-3 ">
                <div className="grid grid-cols-4 gap-5">
                  <CaseField label="Incident Type" span={3}>
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField label="Work Order Description" span={3}>
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        Work Order Number
                      </TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Service Account</TableHead>
                      <TableHead>Sub-Status</TableHead>
                      <TableHead>System Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Primary Incident</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Orion</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((work) => (
                      <TableRow
                        key={work.WOID}
                        className="cursor-pointer hover:bg-gray-300"
                        onClick={handleClick}
                      >
                        <TableCell
                          className="font-medium "
                        >
                          {work.WOID}
                        </TableCell>
                        <TableCell>{work.CaseID}</TableCell>
                        <TableCell>
                          {work.caseinformation?.site_account?.Company ||
                            work.caseinformation?.contact_information
                              ?.FirstName +
                            " " +
                            work.caseinformation?.contact_information
                              ?.LastName ||
                            "-"}
                        </TableCell>

                        <TableCell>{work.SubStatus}</TableCell>
                        <TableCell>{work.SystemStatus}</TableCell>
                        <TableCell>{work.Priority}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell>{work.owner?.Name}</TableCell>
                        <TableCell>{work.owner?.Name}</TableCell>
                        <TableCell>{work.CreatedOn}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">Parts Order</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Name</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Customer Self Repair (CSR)</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Order Closed Date</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        No data available
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">Service Order</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Name</TableHead>
                      <TableHead>Order Refere</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Service Status</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Submit</TableHead>
                      <TableHead>Date and Time</TableHead>
                      <TableHead>EMEA</TableHead>
                      <TableHead>Custom Owner</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created On</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        No data available
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg ">Material Order</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Name</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Order Type</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Ready For Closure Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {materialOrders.map((material) => (
                      <TableRow key={material.MOID}>
                        <TableCell className="font-medium">
                          <Link to={`/app/material-order/${material.MOID}`}>
                            {material.MOID} on {material.WOID}
                          </Link>
                        </TableCell>
                        <TableCell>{material.workorder?.CaseID}</TableCell>
                        <TableCell>{material.CreatedOn}</TableCell>
                        <TableCell>{material.OrderStatus}</TableCell>
                        <TableCell>{material.OrderType}</TableCell>
                        <TableCell>{material.owner?.Name}</TableCell>
                        <TableCell>{material.WOID}</TableCell>
                        <TableCell>{material.ReadyForClosureDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ci_salles">
            <Card className="mt-7">
              <CardHeader>Hello Word</CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="ci_knowledge">
            <Card className="mt-7">
              <CardHeader>Hello Word</CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="ci_related">
            <Card className="mt-7">
              <CardHeader>Hello Word</CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </>
  );
};
