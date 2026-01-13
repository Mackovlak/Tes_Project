import React, { use, useCallback, useMemo } from "react";
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
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
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
import { SelectBarRelated, SelectYN, SearchCommandBlock, SelectBar } from "@/components/sc-select";
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
  LockOpen,
  UserPen,
  ArrowUp,
  ChevronDown,
  Smile,
  User,
  Calculator,
  CreditCard,
  Settings,
  Computer,
  NotepadText,
  FileSliders,
  Contact,
  Briefcase,
  CopyX,
  NotebookPen,
  MessageSquareText,
  CoinsIcon,
  ClipboardPenLine,
} from "lucide-react";
import { CircleChevronLeft } from "lucide-react";
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
import { BtnModalsServiceCatalog } from '@/components/model/sc-modal'
import DatePicker from '@/components/date-picker'
import { pdf } from '@react-pdf/renderer';
import ServiceRequestPDF from '@/components/service-request-form'; // adjust path if needed
import { Textarea } from "@/components/ui/textarea";
import CaseField from "@/components/CaseField";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import EquipmentReciptForm from "@/components/Equipment-Recipt-Form";
import { parseNoteText } from "@/lib/utils.jsx";
import SignatureWrite from "@/components/SignaturePad";
import { description } from "@/components/sc-chart";
import { toast } from "sonner";
import { cn, formatAccountingRupiah, formatDate } from "@/lib/utils";
import { map, set } from "lodash";
import QuotationDialog from "@/components/model/QuotationModal";
import InvoiceDialog from "@/components/model/InvoiceModal"
import { QuotationInvoice } from "@/components/QuatationInvoice";
import { QuickLogNote } from "@/components/model/QuickLogNote";
import { InvoiceDp } from "@/components/InvoiceDp";
import { Invoice } from "../components/Invoice";

/**
 * TODO : 
 * ADDING THIS FUNCTION GLOBALLY OR MAKE THE CASE DETAIL INTO ONE
 */
const suffixToRoleMap = {
  CE: "ce",
  APO: "apo",
  Leader: "celead",
  PS: "ps",
  // Tambah sesuai kebutuhan
};

function extractRoleFromStatus(status) {
  const match = status.match(/^(NEW_Assign|Assign)([A-Za-z]+)/);
  if (match) {
    const suffix = match[2];
    return suffixToRoleMap[suffix] || null;
  }
  return null;
}


export const STATUS_ENUM_TO_LABEL = {
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
  Quote_Rejected: "Quote Rejected",
  Pending_Quote: "Pending Quote",
  NEW_AssignFD: "New Assign To FD",
  NEW_AssignCE: "New Assign To CE",
  NEW_AssignLeader: "New Assign To Leader",
  NEW_AssignAPO: "New Assign To APO",
  NEW_AssignPS: "New Assign To PS",
  NEW_POPDoc: "New Needed POP Doc",
  NEW_Warranty: "New Warranty Approval",
  PartRequest: "Part Request",
  PartRequestLog: "Part Request Logistic",
  PartOrder: "Part Order",
  PartAvailable: "Part Available",
  RepairProgress: "Repair Progress",
  FinishRepair: "Finish Repair",
  CancelRepair: "Cancel Repair",
  Cancel: "Cancel",
};

export const STATUS_LABELS = Object.keys(STATUS_ENUM_TO_LABEL);

const BASE_STATUS_KEYS = [
  "New",
  "Open",
  "InActive",
  "Close",
  "Active",
  "Monitor",
  "Pending_Customer_Action",
  "Quote_Requested",
  "Pending_Follow_Up",
  "Pending_Order",
  "Escalated",
  "Quote_Approved",
  "Quote_Rejected",
  "Pending_Quote",
];

const ROLE_STATUS_EXTRAS = {
  fd: [
    "NEW_AssignFD",
    "NEW_AssignCE",
    "NEW_AssignLeader",
    "NEW_AssignAPO",
    "NEW_AssignPS",
    "NEW_POPDoc",
    "NEW_Warranty",
    "Close",
    "New",
  ],
  ce: [
    "PartRequest",
    "PartRequestLog",
    "PartOrder",
    "PartAvailable",
    "RepairProgress",
    "FinishRepair",
  ],
  celead: [
    "NEW_AssignCE",
    "NEW_AssignAPO",
    "PartRequest",
    "PartRequestLog",
    "PartOrder",
    "PartAvailable",
    "RepairProgress",
    "FinishRepair",
  ],
  apo: [
    "NEW_AssignCE",
    "NEW_AssignAPO",
    "PartRequest",
    "PartRequestLog",
    "PartOrder",
    "PartAvailable",
  ],
  lg: [
    "NEW_AssignCE",
    "NEW_AssignAPO",
    "PartRequest",
    "PartRequestLog",
    "PartOrder",
    "PartAvailable",
  ],
  ps: [
    "NEW_AssignCE",
    "NEW_AssignLeader",
    "NEW_AssignAPO",
    "NEW_AssignPS",
  ],
};

const ALL_STATUS_KEYS = Object.keys(STATUS_ENUM_TO_LABEL);
const DEFAULT_EXTRA_STATUS_KEYS = ALL_STATUS_KEYS.filter((key) => !BASE_STATUS_KEYS.includes(key));

export const TabsServiceCaseDetails = ({ 
  caseDetails,
  setCaseDetails, 
  // caseNote,
  caseNoteFormData,
  setCaseNoteFormData
}) => {
  const navigate = useNavigate();
  const [openWorkOrder, setOpenWorkOrder] = useState(false);
  const { user } = useAuth();

  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [notesList, setNotesList] = useState([]);
  const { open } = useSidebar();
  const [refreshFetchPage, setRefreshFetchPage] = useState(false)
  console.log("CHECK REFRESH STATTUS",refreshFetchPage)
  const [entitlementStatus, setEntitlementStatus] = useState({
    OTCCode: "",
    PurchaseDate: "",
    WarrantyCardDate: "",
    EOW_Date: "",
    EndUserName: "",
    EndUserPhone: "",
    EndUserAddress: "",
    WarrantyApprovalStatus: "",
    needWarrantyApproval: false,
    POPDocument: "",
    WarrantyCard: "",
    PhotoUnit: "",
  })

  entitlementStatus.needWarrantyApproval  ? console.log("THIS IS TRUE") : console.log("NOPE NOT TODAYS");

  const [productForm, setProductForm] = useState({
    HWPC: "",
    ProductTypeID: caseDetails.asset_information?.product_information?.ProductTypeID,
  })

  

  const [caseForm, setCaseForm] = useState({
    CaseType: "",
    CaseStatus: "",
    CaseSubject: "",
    Owner: "",
    CasePriority: "",
    ProblemDescription:"",
    CaseID_Manual: "",
    CaseID_Manual_Date: null,
    CaseProductNote: "",
    StorageLocationStore: "",
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
    pendingCustomerAction: "",
    customerRequestedCloseDate: "",
  });

  const [signature, setSignature] = useState(null);

  // Modal Quotation
  const [openDialogQuotation, setOpenDialogQuotation] = useState(false);
  const [quotationInitialData, setQuotationInitialData] = useState(null);
  const [quotationMaterialItems, setQuotationMaterialItems] = useState([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotationSubmitting, setQuotationSubmitting] = useState(false);

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

  const [logNoteOpen, setLogNoteOpen] = useState(false)

  const handleCaseDetails = (field) => (value) => {
    setCaseDetails((prev) => ({ ...prev, [field]: value }));
  }
  
  const handleCaseChange = (field) => (value) => {
    console.log("caseChange ",field, value)
    setCaseForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleCaseNoteChange = (key, value) => {
    setCaseNoteFormData((prev) => {
      const updated = { ...prev, [key]: value };
      console.log(" Updated Form:", updated); // Log on every change
      return updated;
    });
  };

  const handleProductChange = (field) => (value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
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
  console.log("CaseForm Data to Submit:", caseForm);

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

    // Consider CASE edited if any field has a non-empty value
   const caseEdited = Object.entries({
    CaseType: caseForm.CaseType,
    CaseStatus: caseForm.CaseStatus,
    CaseSubject: caseForm.CaseSubject,
    Owner: caseForm.Owner,
    CasePriority: caseForm.CasePriority,
    CaseProductNote: caseForm.CaseProductNote,
    ProblemDescription: caseForm.ProblemDescription,
    CaseID_Manual: caseForm.CaseID_Manual,
    CaseID_Manual_Date: caseForm.CaseID_Manual_Date,
    StorageLocationStore: caseForm.StorageLocationStore
   }).some(([_, v]) => v !== undefined && v !== null && String(v).trim() !== "");
  
    const gtcEdited = gtcForm && Object.keys(gtcForm).length > 0;
    // Only treat entitlement as edited if it has any non-empty value
    const entitlementEdited =
      entitlementStatus &&
      Object.values(entitlementStatus).some(
        (v) => v !== undefined && v !== null && String(v).trim() !== ""
      );

    const csrEdited = csrForm && Object.keys(csrForm).length > 0;

    const productEdited = productForm && Object.keys(productForm).length > 0;

    const hasIntentToSave = noteFilled || gtcEdited || entitlementEdited || csrEdited || caseEdited || productEdited;

    if (!hasIntentToSave) {
      alert("Tidak ada data yang disimpan.");
      return;
    }

    let savedModules = [];
    const dataToUpdate = {};
    for (const target of ['NOTE', 'GTC', 'ENTITLEMENT', 'CSR', 'CASE', 'PRODUCT']) {
      console.log(target);
      switch (target) {

        case 'NOTE':
         if (noteFilled) {
           const response = await ApiCustomer.post("/api/case-information/case-notes", {
             LogType: caseNoteFormData.LogType,
             ActionType: caseNoteFormData.ActionType,
             VisibleExternally: caseNoteFormData.VisibleExternally,
             Note: caseNoteFormData.Note,
             CaseID: caseDetails.CaseID,
             CreatedBy: user?.id
           });
           dataToUpdate.CaseNote = response.data.data.NoteID;
           // Refresh notes table and clear input note
          //  await fetchCaseNotes();
          //  setCaseNoteFormData((prev) => ({ ...prev, Note: "" }));
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
            console.log("OTC CODE EDIT : ",entitlementStatus);
              //  await ApiCustomer.patch(`/api/asset-information/${caseDetails.AssetID}`, {
              //   Warranty_Status: entitlementStatus.OTCCode || "",
              //    EOW_Date: entitlementStatus.EOW_Date || "",
              //    PurchaseDate: entitlementStatus.PurchaseDate || "",
              //    WarrantyCardDate: entitlementStatus.WarrantyCardDate || "",
              //    EndUserName: entitlementStatus.EndUserName || "",
              //    EndUserPhone: entitlementStatus.EndUserPhone || "",
              //    EndUserAddress: entitlementStatus.EndUserAddress || "",
              //    WarrantyApprovalStatus: entitlementStatus.WarrantyApprovalStatus || "",
              //    needWarrantyApproval: entitlementStatus.needWarrantyApproval || false,
              //    POPDocument: entitlementStatus.POPDocument || "",
              //    WarrantyCard: entitlementStatus.WarrantyCard || "",
              //    PhotoUnit: entitlementStatus.PhotoUnit || "",

              // });
            const formData = new FormData();
            formData.append("Warranty_Status", entitlementStatus.OTCCode || "");
            formData.append("EOW_Date", entitlementStatus.EOW_Date?.toISOString?.() || "");
            formData.append("PurchaseDate", entitlementStatus.PurchaseDate?.toISOString?.() || "");
            formData.append("WarrantyCardDate", entitlementStatus.WarrantyCardDate?.toISOString?.() || "");
            formData.append("EndUserName", entitlementStatus.EndUserName || "");
            formData.append("EndUserPhone", entitlementStatus.EndUserPhone || "");
            formData.append("EndUserAddress", entitlementStatus.EndUserAddress || "");
            formData.append("WarrantyApprovalStatus", entitlementStatus.WarrantyApprovalStatus || "");
            formData.append("needWarrantyApproval", entitlementStatus.needWarrantyApproval ? "true" : "false");

            // Add files
            if (entitlementStatus.POPDocument instanceof File) {
              formData.append("POPDocument", entitlementStatus.POPDocument);
            } else if (typeof entitlementStatus.POPDocument === "string") {
              formData.append("POPDocument", entitlementStatus.POPDocument);
            }
            if (entitlementStatus.WarrantyCard instanceof File) {
              formData.append("WarrantyCard", entitlementStatus.WarrantyCard);
            } else if (typeof entitlementStatus.WarrantyCard === "string") {
              formData.append("WarrantyCard", entitlementStatus.WarrantyCard);
            }
            if (entitlementStatus.PhotoUnit instanceof File) {
              formData.append("PhotoUnit", entitlementStatus.PhotoUnit);
            } else if (typeof entitlementStatus.PhotoUnit === "string") {
              formData.append("PhotoUnit", entitlementStatus.PhotoUnit);
            }


            await ApiCustomer.patch(`/api/asset-information/${caseDetails.AssetID}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data", // 👈 Important for file upload
              },
            });
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

        case 'PRODUCT':
          if (productEdited) {
             await ApiCustomer.patch(`/api/product-information/${caseDetails.asset_information.product_information.ProductNumber}`, {
              ...productForm,
              HWPC:productForm.HWPC || "",
              ProductTypeID: productForm.ProductTypeID
            });
            savedModules.push("PRODUCT")
          }
          break;

        case 'CASE':
          if (caseEdited) {
              try {
                console.log("CaseForm Data To Update: ", caseForm);
                const oldStatus = caseDetails.CaseStatus;
                let newStatus = caseForm.CaseStatus;
                
                // const isNewAssignStatus = newStatus.includes("NEW_Assign");
                savedModules.push("Case");
                const originalOwnerId = caseDetails.Owner ?? null;
                const nextOwnerId = caseForm.Owner;

                const ownerChanged =
                  nextOwnerId !== undefined &&
                  nextOwnerId !== null &&
                  String(nextOwnerId).trim() !== "" &&
                  String(nextOwnerId) !== String(originalOwnerId ?? "");

                // console.log(caseFor)
                // Build updates only for fields provided (avoid blanking with empty strings)
                const caseUpdates = {};
                if (caseForm.CaseType && caseForm.CaseType.trim() !== "") {
                  caseUpdates.CaseType = caseForm.CaseType;
                }
                if (newStatus && String(newStatus).trim() !== "") {
                  caseUpdates.CaseStatus = newStatus;
                }
                if (ownerChanged) {
                  caseUpdates.Owner = nextOwnerId;
                }
                if (caseForm.CaseSubject && String(caseForm.CaseSubject).trim() !== "") {
                  caseUpdates.CaseSubject = caseForm.CaseSubject;
                }
                if (caseForm.CasePriority && String(caseForm.CasePriority).trim() !== "") {
                  caseUpdates.CasePriority = caseForm.CasePriority;
                } 
                if (caseForm.CaseProductNote && String(caseForm.CaseProductNote).trim() !== "") {
                  caseUpdates.CaseProductNote = caseForm.CaseProductNote;
                }
                if (caseForm.ProblemDescription && String(caseForm.ProblemDescription).trim() !== "") {
                  caseUpdates.ProblemDescription = caseForm.ProblemDescription;
                }
                if (caseForm.CaseID_Manual && String(caseForm.CaseID_Manual).trim() !== "") {
                  caseUpdates.CaseID_Manual = caseForm.CaseID_Manual;
                }
               if (caseForm.CaseID_Manual_Date) {
                  const dateVal = new Date (caseForm.CaseID_Manual_Date);
                  if (!isNaN(dateVal.getTime())) {
                    caseUpdates.CaseID_Manual_Date = dateVal.toISOString();
                  }
                }
                if (caseForm.StorageLocationStore && String(caseForm.StorageLocationStore).trim()!== ""){
                  caseUpdates.StorageLocationStore = caseForm.StorageLocationStore
                }

                await ApiCustomer.patch(
                  `/api/case-information/${caseDetails.CaseID}`,
                  caseUpdates
                );

                Object.assign(dataToUpdate, caseUpdates);

                // Log status change if it actually changed
                if (
                  newStatus &&
                  String(newStatus).trim() !== "" &&
                  oldStatus !== newStatus
                ) {
                  const token = { user: getUserFromToken() };
                  const actionlof = await ApiCustomer.post("/api/actionlog", {
                    CaseId: `${caseDetails.CaseID}`,
                    ReferenceId: ``,
                    model: "Case",
                    dataOld: oldStatus,
                    dataNew: newStatus,
                    changedBy: token.user.id,
                    logDescription: `Edit : Change Case ${caseDetails.CaseID} Status from ${oldStatus} to ${newStatus}`,
                  });
                  const dataActionlog = actionlof.data.data
                  const subject = `[Case Update] Case #${caseDetails.CaseID} status berubah dari ${oldStatus} ke ${newStatus}`;
                  const caseLink = `${import.meta.env.VITE_BASE_URL}/app/case/${caseDetails.CaseID}`;
                  
                  const html = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                      <h2 style="color: #2c3e50;">Notifikasi Perubahan Case</h2>
                      <p>Halo ${dataActionlog.ownerUser?.Name || "User"},</p>
                      
                      <p>Case dengan ID: <b>${caseDetails.CaseID}</b> telah diperbarui.</p>
                      
                      <table border="0" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                          <td><b>Status lama</b></td>
                          <td>${oldStatus}</td>
                        </tr>
                        <tr>
                          <td><b>Status baru</b></td>
                          <td>${newStatus}</td>
                        </tr>
                        <tr>
                          <td><b>Diedit oleh</b></td>
                          <td>${token.user.name || token.user.id}</td>
                        </tr>
                      </table>
                      
                      <p><b>Deskripsi:</b><br>${dataActionlog.logDescription}</p>
                      
                      <p style="margin-top: 20px;">
                        <a href="${caseLink}" 
                              style="display: inline-block; padding: 10px 16px; background: #007bff; color: #fff; 
                                    text-decoration: none; border-radius: 4px;">
                          Lihat Case
                        </a>
                      </p>
                      
                      <p style="margin-top: 30px; font-size: 12px; color: #777;">
                        Terima kasih,<br>
                        <i>System Notification</i>
                      </p>
                    </div>
                  `;

                  await ApiCustomer.post("/api/sendEmail", {
                    to: dataActionlog.ownerUser?.Email,
                    subject,
                    text: subject,
                    html
                  });

                } else {
                  const token = { user: getUserFromToken() };
                  await ApiCustomer.post("/api/actionlog", {
                    CaseId: `${caseDetails.CaseID}`,
                    ReferenceId: ``,
                    model: "Case",
                    dataOld: oldStatus,
                    dataNew: newStatus,
                    changedBy: token.user.id,
                    logDescription: `Edit : Edit Case ${caseDetails.CaseID} Data`,
                  });
                }

                if (ownerChanged) {
                  try {
                    let newOwnerInfo = null;
                    try {
                      const newOwnerResponse = await ApiCustomer.get(`/api/user/${nextOwnerId}`);
                      newOwnerInfo = newOwnerResponse.data.data;
                    } catch (infoError) {
                      console.warn("Failed to fetch new owner info:", infoError);
                    }

                    const previousOwnerName = ownerUserData?.Name || originalOwnerId || "Unknown";
                    const newOwnerName = newOwnerInfo?.Name || nextOwnerId;

                    await ApiCustomer.post("/api/actionlog", {
                      CaseId: `${caseDetails.CaseID}`,
                      ReferenceId: "",
                      model: "CaseOwner",
                      dataOld: String(originalOwnerId ?? ""),
                      dataNew: String(nextOwnerId ?? ""),
                      changedBy: user?.id,
                      logDescription: `Edit : Change Case ${caseDetails.CaseID} Owner from ${previousOwnerName} to ${newOwnerName}`,
                    });

                    if (newOwnerInfo) {
                      setOwnerUserData(newOwnerInfo);
                    }
                  } catch (ownerLogError) {
                    console.error("Failed to create owner change log:", ownerLogError);
                  }
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

    }

    // After collecting all updates, patch once if needed
    // console.log("Data To Update: ", dataToUpdate);
    // if (Object.keys(dataToUpdate).length > 0) {
    //   console.log("Data To Update: ", dataToUpdate);
    //   await ApiCustomer.patch(
    //     `/api/case-information/${caseDetails.CaseID}`,
    //     dataToUpdate
    //   );
    // }

    if (savedModules.length > 0) {
      if(redirect){
        await Swal.fire({
          icon: "success",
          title: "Berhasil Disimpan",
          // text: `Data berhasil disimpan: ${savedModules.join(", ")}`,
          text: "Data berhasil disimpan",
          timer: 2500,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        setRefreshFetchPage(prev => !prev);
        // window.location.reload();
      }
      return true
    }

  } catch (error) {
    console.error("failed:", error);
    Swal.fire({
      icon: "error",
      title: error.message,
      text: error.response.data.message || "Something went wrong.",
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

  const handleOpenSignaturePad = () => {
    const sigWindow = window.open("/signature-pad", "Signature Pad", "width=600,height=400");

    window.addEventListener("message", (event) => {
      if (event.data.type === "signature") {
        setSignature(event.data.signature); // save base64 signature
        toast.success("Signature captured successfully!",
          {
            description: "Print ERF OR SRF Avaiable",
            position:"top-center"
          }
        );
      }
    });
  };
  
  //QR CODE
  const [qrCodeImg,setQrCodeImg]= useState("");
  const[qrData,setQrData]=useState(caseDetails.CaseID);
  //define this manually
  /**TODO FOR SLAMET */
  const[qrSize,setQrSize]=useState(150);

  async function generateQR(){
      
      try{
      const url =`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}`;

      const base64 = await fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        console.log("QR",reader)
        return new Promise((res) => {
          reader.onloadend = () => {
          res(reader.result);
        }})
      })


      setQrCodeImg(base64);

      }catch(error){
      console.error("Error generating QR code",error);

      }
  }
  
  console.log("QRCODEIMAGE",qrCodeImg);
  function downloadQr(){
      try{
          fetch(qrCodeimg).then((response)=>response.blob()).then((blob)=>{
              const link=document.createElement("a");
              link.href=URL.createObjectURL(blob);
              link.download="qrcode.png";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          });
        }
      catch{(error) => {
        console.error("Error in Downloading QRcode",error);
      }};
    }
  useEffect(()=>{
    generateQR()
  },[caseDetails.CaseID])

  // Source - https://stackoverflow.com/a
// Posted by Jukka Koivu
// Retrieved 2025-11-29, License - CC BY-SA 4.0


  const convertToBase64 = async (url) => {
    // Source - https://stackoverflow.com/a
    // Posted by Robert
    // Retrieved 2025-11-29, License - CC BY-SA 4.0

    
    return base64
  }


  // Deprecated: previously used for single textarea notes display
  // Replaced by notesList table
  const [cancelState, setCancelState] = useState(false);

  const buttons = [
    {
      icon: CircleChevronLeft,
      label: "",
      onClick: () => navigate(`/app/`),
      roles: ["admin", "fd","user", "apo", "ce","lg","celead","spv","ps","cm","apv"]
    },
    // { icon: SquareArrowOutUpRight, label: "",},
    {
      icon: Save,
      label: "Save",
      onClick: () => handleSave(),
      roles: ["admin", "fd", "user", "apo", "ce", "lg", "celead", "ps", "cm"],
    },
    {
      icon: FileSymlink,
      label: "Save & Close",
      onClick: () => handleSave().then(() => navigate(`/app/`)),
      roles: ["admin", "fd", "user", "apo", "ce", "lg", "celead", "ps", "cm"],
    },
    {
      icon: CopyX,
      label: "Close Case",
      onClick: () => saveAndCloseCase(false),
      roles: ["admin", "fd"],
    },
    {
      icon: CopyX,
      label: "Cancel Case",
      onClick: () => saveAndCloseCase(true),
      roles: ["admin", "fd"],
    },
    {
      icon: RotateCw,
      label: "Refresh",
      onClick: () => window.location.reload(),
      roles: ["admin", "fd","user", "apo", "ce", "lg", "celead", "spv", "ps","cm","apv"],
    },
    {
      icon: MessageSquareText,
      label: "Quotation",
      onClick: () => handleQuotationOpenChange(),
      roles: ["admin", "cm"],
    },
    {
      icon: StepBack,
      label: "SRF",
      onClick: async () => {
        await ApiCustomer.post("/api/case-information/case-notes", {
          LogType: "System Info",
          ActionType: "Request SRF",
          Template: "SRF Requested",
          VisibleExternally: false,
          MinutesSpent: 0,
          Note: `[PRINT] SRF requested by ${user?.role} - ${
            user?.name || "Unknown User"
          }`,
          CaseID: caseDetails?.CaseID,
          CreatedBy: user?.id,
        });
        const blob = await pdf(
          <ServiceRequestPDF
            caseDetails={caseDetails}
            customerSignature={signature}
            qrcode={qrCodeImg}
          />
        ).toBlob();
        const fileName = `SRF-${
           quotationInitialData?.quotationNo ||
           caseDetails?.CaseID ||
           "document"
         }.pdf`;

         const url = URL.createObjectURL(blob);

         // Open a new tab/window
         const newWindow = window.open("", "_blank");

         if (!newWindow) return;

         // Set the tab title
         newWindow.document.title = fileName;

         // Fill with a minimal HTML shell and embed the PDF
         newWindow.document.body.style.margin = "0";
         const iframe = newWindow.document.createElement("iframe");
         iframe.src = url;
         iframe.style.border = "none";
         iframe.style.width = "100%";
         iframe.style.height = "100vh";

         newWindow.document.body.appendChild(iframe);
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = 'Service_Request_Form.pdf';
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
      },
      roles: ["admin", "fd", "user", "spv"],
    },
    {
      icon: StepBack,
      label: "ERF",
      onClick: async () => {
        await ApiCustomer.post("/api/case-information/case-notes", {
          LogType: "System Info",
          ActionType: "Request ERF",
          Template: "ERF Requested",
          VisibleExternally: false,
          MinutesSpent: 0,
          Note: `[PRINT] ERF requested by ${user?.role} - ${
            user?.name || "Unknown User"
          }`,
          CaseID: caseDetails?.CaseID,
          CreatedBy: user?.id,
        });
        const blob = await pdf(
          <EquipmentReciptForm
            caseDetails={caseDetails}
            customerSignature={signature}
          />
        ).toBlob();
       const fileName = `ERF-${
           quotationInitialData?.quotationNo ||
           caseDetails?.CaseID ||
           "document"
         }.pdf`;

         const url = URL.createObjectURL(blob);

         // Open a new tab/window
         const newWindow = window.open("", "_blank");

         if (!newWindow) return;

         // Set the tab title
         newWindow.document.title = fileName;

         // Fill with a minimal HTML shell and embed the PDF
         newWindow.document.body.style.margin = "0";
         const iframe = newWindow.document.createElement("iframe");
         iframe.src = url;
         iframe.style.border = "none";
         iframe.style.width = "100%";
         iframe.style.height = "100vh";

         newWindow.document.body.appendChild(iframe);
      },
      roles: ["admin", "fd", "user", "spv"],
    },
    {
      icon: StepBack,
      label: "Service Order",
      onClick: () => openServiceCatalog("serviceorder"),
      roles: ["admin", "ce", "celead"],
      hidden: caseDetails?.CaseStatus === "Close" ? true : false,
    },
    {
      icon: NotebookPen,
      label: "Signature Customer",
      onClick: () => {
        handleOpenSignaturePad();
      },
      roles: ["admin", "fd", "user", "spv"],
    },
    {
      icon: CoinsIcon,
      label: "Quotation Invoice",
       onClick: async () => {
        await ApiCustomer.post("/api/case-information/case-notes", {
          LogType: "System Info",
          ActionType: "Request QUOTATION INVOICE",
          Template: "QUOTATION INVOICE Requested",
          VisibleExternally: false,
          MinutesSpent: 0,
          Note: `[PRINT] QUOTATION INVOICE requested by ${user?.role} - ${
            user?.name || "Unknown User"
          }`,
          CaseID: caseDetails?.CaseID,
          CreatedBy: user?.id,
        });
        const blob = await pdf(
          <QuotationInvoice
            caseDetails={caseDetails}
            customerSignature={signature}
            materialItems={fieldMO(caseDetails)}
            initialData={quotationInitialData || {}}
          />
        ).toBlob();
         const fileName = `Quotation-${
           quotationInitialData?.quotationNo ||
           caseDetails?.CaseID ||
           "document"
         }.pdf`;

         const url = URL.createObjectURL(blob);

         // Open a new tab/window
         const newWindow = window.open("", "_blank");

         if (!newWindow) return;

         // Set the tab title
         newWindow.document.title = fileName;

         // Fill with a minimal HTML shell and embed the PDF
         newWindow.document.body.style.margin = "0";
         const iframe = newWindow.document.createElement("iframe");
         iframe.src = url;
         iframe.style.border = "none";
         iframe.style.width = "100%";
         iframe.style.height = "100vh";

         newWindow.document.body.appendChild(iframe);
      },
      roles: ["admin", "fd", "user", "spv", "cm"],
      hidden: caseDetails.asset_information?.WarrantyOTCCode?.OTCCode === '01T' ? false : true,
    },
     {
      icon: CoinsIcon,
      label: "DP",
       onClick: async () => {
        await ApiCustomer.post("/api/case-information/case-notes", {
          LogType: "System Info",
          ActionType: "Request DP",
          Template: "INVOICE DP Requested",
          VisibleExternally: false,
          MinutesSpent: 0,
          Note: `[PRINT] DP requested by ${user?.role} - ${
            user?.name || "Unknown User"
          }`,
          CaseID: caseDetails?.CaseID,
          CreatedBy: user?.id,
        });
        const blob = await pdf(
          <InvoiceDp
            caseDetails={caseDetails}
            customerSignature={signature}
            materialItems={fieldMO(caseDetails)}
            initialData={quotationInitialData || {}}
          />
        ).toBlob();
         const fileName = `DP-${
           quotationInitialData?.quotationNo ||
           caseDetails?.CaseID ||
           "document"
         }.pdf`;

         const url = URL.createObjectURL(blob);

         // Open a new tab/window
         const newWindow = window.open("", "_blank");

         if (!newWindow) return;

         // Set the tab title
         newWindow.document.title = fileName;

         // Fill with a minimal HTML shell and embed the PDF
         newWindow.document.body.style.margin = "0";
         const iframe = newWindow.document.createElement("iframe");
         iframe.src = url;
         iframe.style.border = "none";
         iframe.style.width = "100%";
         iframe.style.height = "100vh";

         newWindow.document.body.appendChild(iframe);
      },
      roles: ["admin", "fd", "user", "spv", "cm"],
      hidden: caseDetails.asset_information?.WarrantyOTCCode?.OTCCode === '01T' ? false : true,
    },
     {
      icon: CoinsIcon,
      label: "Invoice",
       onClick: async () => {
        await ApiCustomer.post("/api/case-information/case-notes", {
          LogType: "System Info",
          ActionType: "Request INVOICE",
          Template: "INVOICE DP Requested",
          VisibleExternally: false,
          MinutesSpent: 0,
          Note: `[PRINT] INVOICE requested by ${user?.role} - ${
            user?.name || "Unknown User"
          }`,
          CaseID: caseDetails?.CaseID,
          CreatedBy: user?.id,
        });
        const blob = await pdf(
          <Invoice
            caseDetails={caseDetails}
            customerSignature={signature}
            materialItems={fieldMO(caseDetails)}
            initialData={quotationInitialData || {}}
          />
        ).toBlob();
         const fileName = `Invoice-${
           quotationInitialData?.quotationNo ||
           caseDetails?.CaseID ||
           "document"
         }.pdf`;

         const url = URL.createObjectURL(blob);

         // Open a new tab/window
         const newWindow = window.open("", "_blank");

         if (!newWindow) return;

         // Set the tab title
         newWindow.document.title = fileName;

         // Fill with a minimal HTML shell and embed the PDF
         newWindow.document.body.style.margin = "0";
         const iframe = newWindow.document.createElement("iframe");
         iframe.src = url;
         iframe.style.border = "none";
         iframe.style.width = "100%";
         iframe.style.height = "100vh";

         newWindow.document.body.appendChild(iframe);
      },
      roles: ["admin", "fd", "user", "spv", "cm"],
      hidden: caseDetails.asset_information?.WarrantyOTCCode?.OTCCode === '01T' ? false : true,
    },
     { icon: ClipboardPenLine, label: "Quick Log Note", onClick: () => {setLogNoteOpen(true)}, roles: ['admin','fd']},
    // { icon: StepBack, label: "Sales Offer", hidden:true},
    // { icon: StepBack, label: "Close Case", hidden:true },
    // { icon: StepBack, label: "Pick", hidden:true },
    // { icon: StepBack, label: "Queue Details", hidden:true},
    // { icon: UserPen, label: "Assign", hidden:true },
    // { icon: StepBack, label: "Add to Queue", hidden:true },
    // { icon: StepBack, label: "Audit", onClick: () => openPopup(), hidden:true },
  ];

  // Do not memoize with only user.role; it freezes onClick closures
  // causing handleSave to capture stale state. Compute each render.
  const visibleButtons = buttons.filter(button => button.roles.includes(user.role));
  // console.log("TES CASE DETAILS VALUE",caseDetails);
  // const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  // const hiddenButtons = open ? buttons.slice(-3) : [];
  const [serviceCatalogType, setServiceCatalogType] = useState("null");
  const openServiceCatalog = async (type) => {
    setOpenWorkOrder(true);
    setServiceCatalogType(type)
  };

  const fetchInvoiceData = useCallback(async () => {
    if (!caseDetails?.CaseID) return null;
    setInvoiceLoading(true);
    try {
      const response = await ApiCustomer.get(
        `/api/invoice-information?caseId=${caseDetails.CaseID}`
      );
      const payload = response.data?.data ?? null;
      setInvoiceData(payload);
      return payload;
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      toast.error(
        error.response?.data?.message ?? "Gagal mengambil data invoice."
      );
      return null;
    } finally {
      setInvoiceLoading(false);
    }
  }, [caseDetails?.CaseID]);

  useEffect(() => {
    if (!caseDetails?.CaseID) return;
    fetchInvoiceData();
  }, [caseDetails?.CaseID, fetchInvoiceData]);

  const handleInvoiceOpenChange = (nextOpen = true) => {
    setInvoiceDialogOpen(nextOpen);
    if (nextOpen) {
      fetchInvoiceData();
    } else {
      setInvoiceSubmitting(false);
    }
  };

  const handleInvoiceSubmit = async (payload) => {
    if (!caseDetails?.CaseID) return;
    if (!user?.id) {
      toast.error("User tidak valid. Silakan login kembali.");
      return;
    }
    try {
      setInvoiceSubmitting(true);
      const hasInvoice = Boolean(payload.invoiceNo);
      const endpoint = hasInvoice
        ? `/api/invoice-information/${payload.invoiceNo}`
        : "/api/invoice-information";
      const method = hasInvoice ? "patch" : "post";
      const requester =
        method === "patch"
          ? ApiCustomer.patch.bind(ApiCustomer)
          : ApiCustomer.post.bind(ApiCustomer);

      const requestBody = {
        ...payload,
        caseId : caseDetails?.CaseID
      };

      if (!hasInvoice) {
        requestBody.createdBy = user.id;
      }

      const response = await requester(endpoint, requestBody);
      setInvoiceData(response.data?.data ?? null);
      toast.success(
        hasInvoice
          ? "Invoice berhasil diperbarui."
          : "Invoice berhasil dibuat."
      );
      setInvoiceDialogOpen(false);
      await fetchInvoiceData();
      //do what after submit??
      // IDK, just add the save and close again, maybe
      // --miku21
      saveAndCloseCase(cancelState);
    } catch (error) {
      console.error("Failed to save invoice:", error);
      const message =
        error.response?.data?.message ?? "Gagal menyimpan invoice.";
      toast.error(message);
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  const ensureInvoiceBeforeClose = async () => {
    const data = await fetchInvoiceData();
    if (!data) {
      await Swal.fire({
        icon: "warning",
        title: "Quotation belum tersedia",
        text: "Buat quotation beserta invoice sebelum menutup case.",
      });
      return false;
    }
    if (!data.invoice) {
      /**
       * TODO FOR SLAMET : 
       * MAKE TIS CONFIRMATION INTO SOMETHING ELSE
       * TULUNG ININYA DI ITUIN BIAR GA APA KALI
       */
      await Swal.fire({
        icon: "warning",
        title: "Invoice belum tersedia",
        text: "Input invoice terlebih dahulu sebelum menutup case.",
        confirmButtonText: "Input Invoice",
      });
      handleInvoiceOpenChange(true);
      return false;
    }
    return true;
  };


  const saveAndCloseCase = async (cancell = false) => {
    setCancelState(cancell); //default initialization
    // Role guard: only FD can close a Case
    const tokenUser = getUserFromToken();
    if (!tokenUser || String(tokenUser.role).toLowerCase() !== 'fd') {
      return Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'Only FD can close a Case.',
      });
    }

  //   if (!csrForm.caseResolutionCode || csrForm.caseResolutionCode.trim() === "") {
  //   Swal.fire({
  //     icon: "warning",
  //     title: "Missing Case Resolution",
  //     text: "You must select a Case Resolution Code before closing the case.",
  //   });
  //   return;
  // }
  // return console.log(caseDetails?.asset_information?.WarrantyOTCCode?.WarrantyCondition);
  if(caseDetails?.asset_information?.WarrantyOTCCode?.WarrantyCondition === "OutWarranty"){

    const invoiceReady = await ensureInvoiceBeforeClose();
    if (!invoiceReady) {
      return;
    }
  }



  const targetStatus = cancell ? "CANCEL" : "CLOSED"
  const targetSystemCaseStatus = cancell ? "Cancel" : "Close"
    const confirmResult = await Swal.fire({
      title: "Confirm Save",
      text: "This will give the Case status as "+targetStatus+". Are you sure you want to save changes?",
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
      // Validation: All WO must be CLOSED_POSTED and all related MO must be Closed
      try {
        const woRes = await ApiCustomer.get(`/api/work-order?CaseID=${caseDetails.CaseID}`);
        const workOrders = Array.isArray(woRes.data?.data) ? woRes.data.data : [];
        const openWOs = workOrders.filter(wo => String(wo.SystemStatus).toUpperCase() !== 'CLOSED_POSTED' && String(wo.SystemStatus).toUpperCase() !== 'CLOSED_CANCELLED');
        if (openWOs.length > 0) {
          Swal.close();
          return Swal.fire({
            icon: 'warning',
            title: 'Work Orders Still Open',
            text: 'Close all Work Orders before closing the Case.',
          });
        }
        // For each WO, check Material Orders
        for (const wo of workOrders) {
          const moRes = await ApiCustomer.get(`/api/material-order?WOID=${wo.WOID}`);
          const mos = Array.isArray(moRes.data?.data) ? moRes.data.data : [];
          const mosNotClosed = mos.filter(mo => String(mo.OrderStatus).toLowerCase() !== 'closed' && String(mo.OrderStatus).toLowerCase() !== 'cancelled');
          if (mosNotClosed.length > 0) {
            Swal.close();
            return Swal.fire({
              icon: 'warning',
              title: 'Material Orders Still Open',
              text: 'Close all Material Orders under all Work Orders before closing the Case.',
            });
          }
        }
      } catch (e) {
        Swal.close();
        return Swal.fire({
          icon: 'error',
          title: 'Validation Failed',
          text: 'Unable to verify Work/Material Orders for this Case.',
        });
      }
      const success = await handleSave(false);
      if (!success) return; 
      const res = await ApiCustomer.patch(
        `/api/case-information/${caseDetails.CaseID}`,
        {
          CaseStatus: targetSystemCaseStatus,
          CaseClosedDate: new Date().toISOString(), 
        }
      );
      if (res.data.success) {
        const token = {
          user: getUserFromToken()
        }
        const updateLog = await ApiCustomer.post("/api/actionlog",{
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
          navigate(`/app/viewcase`);
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



  console.log("CHECK DAtA initial quotation",quotationInitialData)

  const fieldMO = (caseDetails) => {
    const workorders = caseDetails?.workorder || [];
    const Allitems = [];

    workorders.forEach((wo) => {
            (wo.materialorder || []).forEach((mo) => {
                (mo.materialorderlineitems || []).forEach((line) => {
                    const quotationEntry = Array.isArray(line.quotation_lineitem) && line.quotation_lineitem.length > 0
                        ? line.quotation_lineitem[0]
                        : undefined;

                    const initialApproved = quotationEntry?.Approved;
                    const approvedValue =
                        initialApproved === undefined || initialApproved === null
                            ? ""
                            : initialApproved
                                ? "yes"
                                : "no";

                    const linePrice =
                        quotationEntry?.Price ?? line.Price ?? "";

                    Allitems.push({
                        lineItemId: line.LineItemID,
                        moid: mo.MOID,
                        woid: wo.WOID,
                        partNumber: line.PartNumber,
                        description: line.Description,
                        quantity: line.Quantity ?? "",
                        price:
                            linePrice === null || linePrice === undefined
                                ? ""
                                : String(linePrice),
                        partApproved: approvedValue,
                    });
                });
            });
        });
    return Allitems;
  }

  useEffect(() => {
    if (!openDialogQuotation || !caseDetails) return;

    let cancelled = false;

    setQuotationInitialData(null);
    setQuotationLoading(true);

    const loadQuotation = async () => {
      try {
        const response = await ApiCustomer.get(
          `/api/quotation-information?caseId=${caseDetails.CaseID}`
        );
        if (cancelled) return;
        const quotationPayload = response.data.data;
        if (quotationPayload) {
          setQuotationInitialData(mapQuotationInitialData(quotationPayload));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch quotation:", error);
          toast.error(
            error.response?.data?.message ?? "Gagal mengambil data quotation."
          );
        }
      } finally {
        if (!cancelled) {
          setQuotationLoading(false);
        }
      }
    };

    loadQuotation();

    return () => {
      cancelled = true;
    };
  }, [openDialogQuotation, caseDetails]);

  const handleQuotationOpenChange = (nextOpen = true) => {
    setOpenDialogQuotation(nextOpen);
    if (!nextOpen) {
      setQuotationInitialData(null);
      setQuotationLoading(false);
      setQuotationSubmitting(false);
    }
  };

  const handleQuotationSubmit = async (payload) => {
    if (!caseDetails) return;
    if (!user?.id) {
      toast.error("User tidak valid. Silakan login kembali.");
      return;
    }
    try {
      setQuotationSubmitting(true);
      // return console.log("Submit : ",payload)
      const apiPayload = {
        ...payload,
        userAssign:
          user.id !== payload?.userAssign ? payload.userAssign : user.id,
      };
      if (apiPayload.quoteDecision === "Rejected") {
        apiPayload.userAssign = caseDetails.workorder[0]?.OwnerID;
      }

      console.log("Sending payload:", apiPayload);
      const endpoint = payload.quotationNo
        ? `/api/quotation-information/${payload.quotationNo}`
        : "/api/quotation-information";
      const method = payload.quotationNo ? "patch" : "post";
      const requester =
        method === "patch"
          ? ApiCustomer.patch.bind(ApiCustomer)
          : ApiCustomer.post.bind(ApiCustomer);

      await requester(endpoint, apiPayload);

      toast.success(
        payload.quotationNo
          ? "Quotation berhasil diperbarui."
          : "Quotation berhasil dibuat."
      );

      handleQuotationOpenChange(false);
    } catch (error) {
      console.error("Failed to save quotation:", error);
      const message =
        error.response?.data?.message ?? "Gagal menyimpan quotation.";
      toast.error(message);
    } finally {
      setQuotationSubmitting(false);
    }
  };

  const mapQuotationInitialData = (quotationPayload) => {
    if (!quotationPayload?.quotation) return null;
    const q = quotationPayload.quotation;

    return {
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
    };
  };

  const invoiceSummary = invoiceData?.invoice;
  const invoiceQuotation = invoiceData?.quotation;
  const invoiceNotificationLabel =
    [
      invoiceSummary?.sendInvoice && "Invoice",
      invoiceSummary?.sendWa && "WA",
      invoiceSummary?.sendEmail && "Email",
      invoiceSummary?.sendErf && "ERF",
    ]
      .filter(Boolean)
      .join(", ") || "-";

  

  return (
    <>
      <div className="flex items-center border-1 sticky top-15 z-5 bg-gray-50 overflow-auto">
        {/* {visibleButtons.map((btn, index) => (
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
        )} */}
        {visibleButtons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            hidden={btn.hidden}
            variant="link"
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon/>
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}
        <BtnModalsServiceCatalog 
          open={openWorkOrder}
          setOpen={setOpenWorkOrder}
          caseDetails={caseDetails}
          serviceCatalogType={serviceCatalogType}
        />
      </div>
      <div>
        <QuotationDialog
          open={openDialogQuotation}
          onOpenChange={handleQuotationOpenChange}
          materialItems={fieldMO(caseDetails)}
          caseId={caseDetails.CaseID}
          status={caseDetails.CaseStatus}
          initialData={quotationInitialData || {}}
          loading={quotationLoading}
          submitting={quotationSubmitting}
          onSubmit={handleQuotationSubmit}
          createdBy={user}
          signature={signature}
          caseDetails={caseDetails}
        />
      </div>
      <div>
        <InvoiceDialog
          open={invoiceDialogOpen}
          onOpenChange={handleInvoiceOpenChange}
          quotation={invoiceData?.quotation}
          invoice={invoiceData?.invoice}
          loading={invoiceLoading}
          submitting={invoiceSubmitting}
          onSubmit={handleInvoiceSubmit}
        />
      </div>
      <div>
        <QuickLogNote
          formData={FormData}
          notesList={notesList}
          open={logNoteOpen}
          onChange={handleCaseNoteChange}
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
            notesList={notesList}
            setNotesList={setNotesList}
            selectedSymptom={selectedSymptom}
            setSelectedSymptom={setSelectedSymptom}
            entitlementStatus={entitlementStatus}
            handleEntitlementStatus={handleEntitlementStatus}
            csrForm={csrForm}
            setCsrForm={setCsrForm}
            onChangeCsr={handleCsrChange}
            signature={signature}
            setSignature={setSignature}
            refreshFetchPage={refreshFetchPage}
            productForm={productForm}
            setProductForm={setProductForm}
            handleProductChange={handleProductChange}
            invoiceLoading={invoiceLoading}
            invoiceSummary={invoiceSummary}
            invoiceQuotation={invoiceQuotation}
            invoiceNotificationLabel={invoiceNotificationLabel}
            handleInvoiceOpenChange={handleInvoiceOpenChange}
          />
      </div>
    </>
  );
};

export const ServiceCase = ({
  caseDetails,
  formData,
  setCaseNoteFormData,
  onChange,  //!
  notesList,
  setNotesList,
  handleCaseDetails,
  selectedSymptom,
  setSelectedSymptom,
  formGtc,
  setFormGtc,
  onChangeGtc,
  entitlementStatus,
  handleEntitlementStatus, //!
  csrForm,
  setCsrForm,
  onChangeCsr,
  caseForm,
  onChangeCase,  //!
  setCaseForm,
  signature,
  setSignature,
  refreshFetchPage,
  productForm,
  setProductForm,
  handleProductChange, //! 
  invoiceLoading,
  invoiceSummary,
  invoiceQuotation,
  invoiceNotificationLabel,
  handleInvoiceOpenChange
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
  
  const [roleAssign, setRoleAssign] = useState([]);
  const [ReadyForClosureDate, setReadyForClosureDate] = useState(null);

  useEffect(() => {
    if (caseDetails?.CreatedOn) {
      setCreatedOn(new Date(caseDetails.CreatedOn)); // includes date + time
    }
  }, [caseDetails]);

  useEffect(() => {
    if (caseDetails?.CaseClosedDate) {
      setCaseClosedDate(new Date(caseDetails.CaseClosedDate)); // includes date + time
    }
  }, [caseDetails]);

  // const allRoleTabs = ["admin","fd", "apo","ce","lg","celead","ps"];
  
  let hiddenTab;
  if (caseDetails.asset_information?.WarrantyOTCCode.OTCCode !== "01T") {
    hiddenTab = true
  }else {
    hiddenTab = false
  }

  const tabs = [
    { value: "case_info", label: "Case & Customer"},
    { value: "ci_asset", label: "Assets , WO and MO"},
    { value: "quotation", label: "OOW Information", hidden: hiddenTab},
    { value: "doc_photo", label: "Document Photo" },
    { value: "action_log", label: "Action Log"},
    // { value: "customer,add,entitement", label: "Asset & Entitement", roles:["admin"]},
    // { value: "ci_notes", label: "Notes & Information", roles:["admin"]},
    // { value: "ci_activitas", label: "Activities", disable: true, roles:["admin"]},
    // { value: "ci_actions", label: "Customer Interactions", disable: true, roles:["admin"]},
    // { value: "ci_wo", label: "Work Order Validation", disable: true ,roles:["admin"]},
    // { value: "ci_salles", label: "Sales Offer", disable: true ,roles:["admin"]},
    // { value: "ci_knowledge", label: "Knowledge & Attachments", roles:["admin"]},
    // { component: <SelectBarRelated />,},
  ];

  const { user } = useAuth();

  let totalquoLineItemPrice = 0;

  // const visibleTabs = useMemo(
  //   () => tabs.filter(tab => tab.roles.includes(user.role)),
  //   [user.role]
  // );

  // const visibleTabs = open ? tabs.slice(0, -2) : tabs;
  // const hiddenTabs = open
  //   ? [
  //       { value: "ci_knowledge", label: "Knowledge & Attachments" },
  //       { component: <SelectBarRelated /> },
  //     ]
  //   : [];

  const [selected, setSelected] = useState("--Selected--"); 

  const [dataFetchCustomerData, setDataFetchCustomerData] = useState({
    MainAccount: null,
    SiteAccount: null,
    Type: null,
  });
  const [dataFetchAssetInformation, setDataFetchAssetInformation] = useState();
  const [dataWarrantyStatus, setDataWarrantyStatus] = useState()
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
      setDataWarrantyStatus(resAsset.data.data?.Warranty_Status)
    } catch (err) {
      console.error("Error returning Asset Data : ", err);
      return null;
    }
  };

  const fetchCaseNotes = async () => {
    try {
      const res = await ApiCustomer.get(`/api/case-information/case-notes?caseId=${caseDetails.CaseID}`);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      console.log("Case Nots Available : ",res.data.data)
      setNotesList(list);
      return list;
    } catch (err) {
      console.error("Error in fetchCaseNotes:", err);
      setNotesList([]);
      return [];
    }
  };

  const fetchOwnerUserData = async () => {
    try {
      const response = await ApiCustomer.get(`/api/user/${caseDetails.Owner}`)
      setOwnerUserData(response.data.data)
      console.log("CHECK OWNER FETCH IF ITS WORKS")
    } catch (error) {
      console.error("WRONG THING IN FETCH OWNER")
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
    try{
      const res = await ApiCustomer.get('/api/otc-code')
      setOtcCode(res.data.data)
    }catch(err){
      console.error("Failed to fetch OTC Code:", err);
    }
  }

  const fetchProduct = async () => {
    try {
      const res = await ApiCustomer.get(`/api/product-information/${caseDetails.asset_information.product_information.ProductNumber}`)
      setProductForm(res.data.data)
    }catch(err) {
      console.error("Gagal Fetching Product Information",err)
    }
  }

  const [caseTipe, setCaseTipe] = useState([
    {
      CaseType : "Administrative"
    },
    {
      CaseType : "ASP/Reseller/GS1"
    },
    {
      CaseType : "Bench"
    },
    {
      CaseType : "Call to Repair"
    },
    {
      CaseType : "Complex T&M"
    },
    {
      CaseType : "Depot Repair"
    },
    {
      CaseType : "Electronic"
    },
    {
      CaseType : "HW Delivery"
    },
    {
      CaseType : "IMACD"
    },
    {
      CaseType : "Internal Service"
    },
    {
      CaseType : "Internal Support"
    },
    {
      CaseType : "Onsite"
    },
    {
      CaseType : "Proactive"
    },
    {
      CaseType : "Remote Services"
    },
    {
      CaseType : "Services (VAS)"
    },
    {
      CaseType : "SW Delivery"
    },
    {
      CaseType : "T&M"
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



  const statusEnumToLabelWO = {
  OPEN_UNSCHEDULED: 'Open - Unscheduled',
  OPEN_SCHEDULED: 'Open - Scheduled',
  OPEN_INPROGRES: 'Open - In Progress',
  OPEN_COMPLETED: 'Open - Completed',
  CLOSED_POSTED: 'Closed - Posted'
  };

  const WarrantyConditionEnumToLabel = {
    InWarranty: "In Warranty",
    OutWarranty: "Out of Warranty",
  };  

  const OptionStorage = [
     "Storage 1",
     "Storage 2",
     "Storage 3",
     "Storage 4",
     "Storage 5",
     "Storage 6",
     "Storage 7",
     "Storage 8",
     "Storage 9",
     "Storage 10",
  ]

  const assignToForm= true;
  // const assignToForm = statusEnumToLabel.startsWith("NEW_Assign");

  

// const labelToStatusEnum = Object.fromEntries(
//   Object.entries(STATUS_ENUM_TO_LABEL).map(([key, val]) => [val, key])
// );
const labelToStatusEnum = Object.entries(STATUS_ENUM_TO_LABEL).reduce((acc, [key, val]) => {
  acc[val] = key;
  return acc;
}, {});

const ownerRole = (
  ownerUserData?.Role ??
  ownerUserData?.role ??
  caseDetails?.owner?.Role ??
  user?.role ??
  ""
)
  .toString()
  .toLowerCase();

const filteredStatusKeys = useMemo(() => {
  const extras = ROLE_STATUS_EXTRAS[ownerRole] ?? DEFAULT_EXTRA_STATUS_KEYS;
  const keys = [...BASE_STATUS_KEYS];

  extras.forEach((key) => {
    if (STATUS_ENUM_TO_LABEL[key] && !keys.includes(key)) {
      keys.push(key);
    }
  });

  const currentKey = caseForm?.CaseStatus;
  if (currentKey && STATUS_ENUM_TO_LABEL[currentKey] && !keys.includes(currentKey)) {
    keys.push(currentKey);
  }

  return keys.filter((key) => STATUS_ENUM_TO_LABEL[key]);
}, [ownerRole, caseForm?.CaseStatus]);

const statusOptions = useMemo(
  () => filteredStatusKeys.map((key) => STATUS_ENUM_TO_LABEL[key]),
  [filteredStatusKeys]
);


const fetchUserAssign = async (role) => {
  try {
    const res = await ApiCustomer.get(`/api/user?role=${role}`);
    setRoleAssign(res.data.data);
  } catch (err) {
    console.error("Error fetching role: ",err);    
  }
}



const fetchCase = async () => {
  try {
    const res = await ApiCustomer.get(`/api/case-information/${caseDetails.CaseID}`);
    setCaseForm(res.data.data);
    console.log("Case Infomation",res.data.data)
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
    console.error("Error fetching ActionLog:", error);
  }
}
  // const location = useLocation();

  //handler all case
  useEffect(() => {
    fetchOTCCode();
    fetchCustomerData();
    fetchAssetInformation();
    fetchOwnerUserData();
    fetchProduct();
    fetchWorkOrders();
    fetchCaseNotes();
    fetchGtc(); 
    fetchCsr();
    fetchCase();
    fetchActionLog();
    console.log("CHECK IF THE FETCH IS WORKS ")
  }, [ caseDetails.CaseID, refreshFetchPage]);
  useEffect(() => {
    fetchUserAssign();
  }, [assignToForm]);

  useEffect(() => {
    if (otcCode.length > 0 && dataFetchAssetInformation?.AssetInformation?.Warranty_Status) {
      handleEntitlementStatus("OTCCode")(dataFetchAssetInformation?.AssetInformation?.Warranty_Status);
      handleEntitlementStatus("EOW_Date")(new Date(dataFetchAssetInformation?.AssetInformation?.EOW_Date));
      
    }
    
    if (dataFetchAssetInformation?.AssetInformation?.asset_warranty.length > 0) {
      handleEntitlementStatus("needWarrantyApproval")(true);
      handleEntitlementStatus("PurchaseDate")(new Date(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.PurchaseDate));
      handleEntitlementStatus("WarrantyCardDate")(new Date(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.WarrantyCardDate));
      handleEntitlementStatus("WarrantyApprovalStatus")(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.WarrantyApprovalStatus);
      handleEntitlementStatus("EndUserName")(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.EndUserName);
      handleEntitlementStatus("EndUserPhone")(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.EndUserPhone);
      handleEntitlementStatus("EndUserAddress")(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.EndUserAddress);
      handleEntitlementStatus("POPDocument")(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.POPDocument);
      handleEntitlementStatus("WarrantyCard")(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.WarrantyCard);
      handleEntitlementStatus("PhotoUnit")(dataFetchAssetInformation?.AssetInformation?.asset_warranty[0]?.PhotoUnit);
      
    } else {
      console.log("SEEMS NOT WORK")
    }
  }, [otcCode, dataFetchAssetInformation]);

  useEffect(() => {
    // console.log("Data Asset Info : ", dataFetchAssetInformation);

    // console.log("Fetch Data Customer Success : ", dataFetchCustomerData);
    // console.log("Fetch Data User ", ownerUserData);
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

  const handleClick = async (work) => {
    console.log(work.WOID); // ✅ Ini sekarang valid

    navigate(`/app/work/${work.WOID}`, {
      // state: { ownerUserData, dataFetchCustomerData }
    });
  };

useEffect(() =>{
  // console.log("Data Asset Info : ",dataFetchAssetInformation)
  
  // console.log("Fetch Data Customer Success : ",dataFetchCustomerData)
  // console.log("Fetch Data User ", ownerUserData)
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
let canEdit;
let canEditFd;
let canEditApo;
let canEditCe;
let canEditWarranty;

const [hideAsignTo, setHideAsignTo] = useState(null)
if (caseDetails.CaseStatus !== "Close") {
   canEdit = caseDetails?.Owner === user?.id || user?.role === 'admin';
   canEditFd = user?.role === "fd" || user?.role === 'admin';
   canEditApo = user?.role === "apo" || user?.role === 'admin';
   canEditCe = user?.role === "ce" || user?.role === "celead" || user?.role === 'admin';
   canEditWarranty = user?.role === "fd" || user?.role === 'admin' || user?.role === 'apv';
} else {
   canEdit = false;
   canEditFd = false;
   canEditApo = false;
   canEditCe = false;
   canEditWarranty = false;
}



  // ----------------------------
  // Photo handlers
  // ----------------------------

  // Photos
  /** @type {[File[], (val: File[]) => void]} */
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState(null);

  /**
   * Handle file input change for photos.
   * @param {FileList|null} files
   */
  const onPickPhotos = (files) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.warning(`${f.name} lebih dari 5MB, tidak bisa diupload`);
        return false;
      }
      if (!f.type.startsWith("image/")) {
        toast.warning(`${f.name} bukan file gambar`);
        return false;
      }
      return true;
    });
    setPhotos(validFiles);
  };
  
  

  const onPickDocuments = (files) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.warning(`${f.name} lebih dari 5MB, tidak bisa diupload`);
        return false;
      }
      return true
    })
    // setPopDocument(validFiles)
    handleEntitlementStatus('POPDocument')(validFiles);
  }

  
  const onPickWarrantyCards = (files) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.warning(`${f.name} lebih dari 5MB, tidak bisa diupload`);
        return false;
      }
      return true
    })
    // setWarrantyCards(validFiles)
    handleEntitlementStatus('WarrantyCard')(validFiles);
  }
  const onPickPhotoUnits = (files) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.warning(`${f.name} lebih dari 5MB, tidak bisa diupload`);
        return false;
      }
      return true
    })
    // setPhotoUnit(validFiles)
    handleEntitlementStatus('PhotoUnit')(validFiles);
  }

  

  

  
  return (
    <>
      {caseDetails.CaseStatus === "Close" && (
        <div className="p-4 mt-2 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500">
          This Case is <strong>read-only</strong> because it is
          <strong>Closed</strong>.
        </div>
      )}
      <Card className="border-0 w-full">
        <Tabs defaultValue="case_info">
        <CardHeader className="sticky top-24 z-5 w-full border-b bg-white shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">

            {/* LEFT SIDE - Case Info */}
            <div>
              <h1 className="text-2xl font-semibold">{caseDetails.CaseID}</h1>
              <p className="text-lg text-muted-foreground">{caseDetails.CaseSubject}</p>
            </div>
            <div className="app-container">
              {/* { img && <img src={img} className="qr-code-image" />} */}
            </div>


            {/* RIGHT SIDE - Quick Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Owner */}
              <div className="flex flex-col">
                <span className="text-blue-600 font-medium">{ownerUserData.Name}</span>
                <span className="text-muted-foreground">
                  {
                    ownerUserData.Role === 'fd' ? "Owner Fd" : 
                    ownerUserData.Role === 'ce' ? "Owner Ce" :
                    ownerUserData.Role === 'celead' ? "Owner Ce Leader" :
                    ownerUserData.Role === 'lg' ? "Owner Lg" :
                    ownerUserData.Role === 'apo' ? "Owner Apo" :
                    ownerUserData.Role === 'cm' ? "Owner Cm" :
                    ownerUserData.Role === 'admin' ? "Owner Admin" :
                    ownerUserData.Role === 'ps' ? "Owner Ps" :
                    ownerUserData.Role === 'apv' ? "Owner Aprovel" :
                    ownerUserData.Role === 'user' ? "User" :
                    "None" 
                  }
                </span>
              </div>

              {/* Queue */}
              <div className="flex flex-col">
                <span className="text-blue-600 font-medium">---</span>
                <span className="text-muted-foreground">Queue</span>
              </div>

              {/* Contact */}
              <div className="flex flex-col">
                <span className="text-blue-600 font-medium">
                  {dataFetchCustomerData.MainAccount?.Salutation}
                  {dataFetchCustomerData.MainAccount?.FirstName}{" "}
                  {dataFetchCustomerData.MainAccount?.LastName}
                </span>
                <span className="text-muted-foreground">Contact</span>
              </div>

              {/* Site Account */}
              <div className="flex flex-col">
                <Select onValueChange={setSelected} defaultValue="first">
                  <SelectTrigger className="h-auto p-0 text-blue-600 font-medium border-none shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="first">
                        {dataFetchCustomerData.SiteAccount?.Company}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">Site Account</span>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className=" border-t bg-gray-50 w-full overflow-x-auto">
            <TabsList className="sm:w-full w-fit flex gap-4 h-fit p-0 ">
              {tabs.map((tab, index) =>
                tab.component ? (
                  <div key={index}>{tab.component}</div>
                ) : (
                  <TabsTrigger
                    key={index}
                    variant="simple"
                    value={tab.value}
                    disabled={tab.disable}
                    hidden={tab.hidden}
                    className="text-sm font-medium"
                  >
                    {tab.label}
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </div>
        </CardHeader>


          <TabsContent value="case_info" className={"p-2 flex flex-col gap-5"}>
          <div  className={" grid lg:grid-cols-2 md:grid-cols-1 gap-4 "}>
            <Card className="flex-col">
              <CardHeader>
                <CardTitle className={"text-lg  flex gap-3"}><Briefcase/>Case Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 ">
                <CaseField label="Case Subject"  span={3} childClass={' col-span-3'} lock={!canEditFd}>
                  <div className="ml-8 w-full">
                    <Textarea
                     value={caseForm?.CaseSubject}
                      onChange={e => onChangeCase("CaseSubject")(e.target.value)}
                     className=" border-none italic ring-1 ring-gray-400 bg-gray-50 text-base"
                     readOnly={!canEditFd}
                    />
                  </div>
                </CaseField>
              
                <CaseField label="Case ID manual" className={"mt-2"} childClass={'col-span-2'} span={2} lock={!canEditApo} >  
                    <Input variant="invisible" placeholder="---"
                      value={caseForm?.CaseID_Manual}
                      onChange={e => onChangeCase("CaseID_Manual")(e.target.value)}
                    />                    
                </CaseField>

                <CaseField label="Case ID manual Date" className={"mt-2"} childClass={'col-span-2'} span={2} lock={!canEditApo}>  
                    <DatePicker
                        value={caseForm?.CaseID_Manual_Date ? new Date(caseForm.CaseID_Manual_Date) : null}
                        onChange={onChangeCase("CaseID_Manual_Date")}
                    />               
                </CaseField>

                {/* detail owner */}
                <CaseField label="Created By" className={"mt-2"} childClass={'col-span-2'} span={2} lock >  
                {/* {console.log("Bool to check wo owner aaliabe : ", caseDetails?.workorder[0]?.owner?.IDUser)} */}
                    <Input variant="invisible" placeholder="---" value={caseDetails.createdByUser.Name} readOnly/>                    
                </CaseField>
                {caseDetails?.workorder[0]?.owner?.IDUser && (
                  <CaseField label="Engineer name" className={"mt-2"} childClass={'col-span-2'} span={2} lock >  
                      <Input variant="invisible" placeholder="---" value={caseDetails.workorder[0].owner.Name} readOnly/>                    
                  </CaseField>
                )}
                
                {caseDetails?.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.User?.IDUser && (
                  <CaseField label="CM name" className={"mt-2"} childClass={'col-span-2'} span={2} lock >  
                      <Input variant="invisible" placeholder="---" value={caseDetails?.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.User?.Name} readOnly/>                    
                  </CaseField>
                )}
                {caseDetails?.workorder[0]?.materialorder[0]?.owner?.IDUser && (
                  <CaseField label="APO name" className={"mt-2"} childClass={'col-span-2'} span={2} lock >  
                      <Input variant="invisible" placeholder="---" value={caseDetails.workorder[0].materialorder[0].owner.Name} readOnly/>                    
                  </CaseField>
                )}
                
              
                <CaseField label="Case Status" className={"mt-2"} childClass={'col-span-2'} span={2} lock={!canEdit}  >
                  <SearchCommandBlock
                      value={STATUS_ENUM_TO_LABEL[caseForm?.CaseStatus] || "--Select--"}
                      onChange={ async (label) => {
                        

                        const enumValue = labelToStatusEnum[label];
                        onChangeCase("CaseStatus")(enumValue);
                        console.log("Selected label:", label);
                        console.log("Mapped enum:", enumValue);
                        setHideAsignTo(enumValue?.startsWith("NEW_Assign"))
                        
                        if(enumValue.startsWith("NEW_Assign")) {
                          const role = extractRoleFromStatus(enumValue);
                          
                          console.log("Mapped enum:", role);
                          
                          if(role) {
                            try {
                              fetchUserAssign(role);
                              console.log("Mapped enum:", roleAssign);
                            } catch (err) {
                              console.error("Error fetching role: ", err);
                            }
                          }
                        } else{
                          setRoleAssign([]);
                        }
                        
                      }}
                      placeholder="--Select--"
                      options={statusOptions}
                    />

                </CaseField>
                  <CaseField label="Assign To" className={"mt-2"} childClass={'col-span-2'} span={2}   hide={!hideAsignTo}>
                    <SearchCommandBlock
                      value={caseForm?.Owner}
                      onChange={(selectedID) => {
                            if (!selectedID) {
                          onChangeCase("Owner")(null); // Clear the value!
                          return;
                        }
                        const selectedUser = roleAssign.find(user => user.IDUser === selectedID);
                        if (selectedUser) {
                          onChangeCase("Owner")(selectedUser.IDUser);
                        }
                      }}
                      placeholder="--Select--"
                      options={roleAssign.map(user => ({ label: user.Name, value: user.IDUser }))}
                      renderLabel={(opt) => opt.label}
                      getValue={(opt) => opt.value}
                    />
                  </CaseField>
                {/* {assignToForm == true ?? (
                )} */}
                <CaseField label="Case Type" open className={"mt-2"} childClass={'col-span-2'} span={2} lock={!canEditFd} >
                  <SearchCommandBlock
                    value={caseForm?.CaseType}
                    onChange={onChangeCase("CaseType")}
                    placeholder="--Select--"
                    options={[
                    "Depot Repair",
                    "Onsite",
                    "Bench",
                    "DOA"
                    ]}
                    />
                </CaseField>

                  <CaseField label="Problem Description" span={3} lock={!canEditFd} childClass={' col-span-3'}>
                  <div className="ml-8 w-full">
                    <Textarea
                     value={caseForm?.ProblemDescription}
                     onChange={(e) => onChangeCase("ProblemDescription") (e.target.value)}
                     className=" ring-1 ring-gray-300 bg-gray-50 italic"
                     readOnly={!canEditFd}
                    />

                  </div>
                </CaseField>

                  <CaseField label="Case Priority" className={"mt-2"} childClass={'col-span-2'} span={2}  lock={!canEditFd}>
                  {/* <Input variant="invisible" value={caseDetails.CasePriority}/> */}
                  <SearchCommandBlock
                  value={caseForm?.CasePriority}
                  onChange={onChangeCase("CasePriority")}
                  options={[
                      "Same Businnes Day (SBD)",
                      "Next Businnes Days (NBD)",
                      "3 Businnes Days (3BD)"
                    ]}
                  />
                </CaseField>

                <CaseField label="KCI For Case?" childClass={'col-span-2'} span={2} lock >
                     <Input 
                      variant="invisible"
                      value={caseDetails.KCI_Flag ? "Yes" : "No"}
                     />
                </CaseField>               
                <CaseField label="Created ON"  childClass={'col-span-2'} span={2} lock>
                  <DatePicker
                    variant="icon"
                    value={createdOn}
                    onChange={setCreatedOn}
                    
                  ></DatePicker>
                </CaseField>

                 <CaseField label="Case Closed Date" childClass={'col-span-2'} span={2} lock >
                          {/* {caseClosedDate ? format(caseClosedDate, "dd/M/yyyy") : "---"} */}
                          <DatePicker
                            variant="icon"
                            value={caseClosedDate}
                            onChange={setCaseClosedDate}
                          ></DatePicker>
                </CaseField>

                  <Accordion type="single" collapsible className=" col-span-3">
                    <AccordionItem value="more-details" className="pl-5">
                      <AccordionTrigger className={"decoration-transparent border-1 p-2 cursor-pointer"}>More Details . . .</AccordionTrigger>
                      <AccordionContent className={"m-1"}>
                        <div className="grid grid-cols-2  gap-4">
                          <CaseField lock label="Incoming Channel" className={"mt-2"}>
                            <Input
                              variant="invisible"
                              value={caseDetails.IncomingChannel}
                              
                            />
                          </CaseField>
                          <CaseField lock label="Submitted To Base">
                            <span className="gap-[5em]">
                              <DatePicker
                                variant="icon"
                                value={submittedToBase}
                                onChange={setsubmittedToBase}
                                
                              ></DatePicker>
                            </span>
                          </CaseField>
                          <CaseField lock label="Customer Severity" >
                            <Input
                              variant="invisible"
                              value={caseDetails.CustomerSeverity}
                            />
                          </CaseField>
                          <CaseField lock label="Business Segment" >
                            <Input variant="invisible" placeholder="---" />
                          </CaseField>

                          <CaseField lock label="HPI Segment" >
                            <Input variant="invisible" placeholder="---" />
                          </CaseField>

                          <CaseField lock label="Customer Tracking Number" >
                            <Input variant="invisible" placeholder="---" />
                          </CaseField>

                          <CaseField lock label="Update Customer Tracking Number">
                            <Input variant="invisible" placeholder="---" />
                          </CaseField>
                          <CaseField lock label="Alternate Customer Tracking Number" >
                            <Input variant="invisible" placeholder="---" />
                          </CaseField>

                          <CaseField lock label="Irrelevant" >
                            <Input variant="invisible" placeholder="---" />
                          </CaseField>


                          <CaseField lock label="Email Status"  >
                            <Input variant="invisible" placeholder="---" />
                          </CaseField>

                          <CaseField  label="Case ID" lock className={"hidden"}>
                            <Input
                              variant="invisible"
                              value={caseDetails.CaseID}
                              hidden
                            />
                          </CaseField>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
              </CardContent>
            </Card>
                    
            <Card className="flex-col">
              <CardHeader>
                <CardTitle className="text-lg flex gap-3"><Contact/>Customer Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid items-center grid-cols-2 gap-3">
                <CaseField label="Customer Account"  lock>
                  <Input
                    variant="invisible"
                    value={
                      dataFetchCustomerData?.Type == "SiteAccount"
                        ? dataFetchCustomerData?.SiteAccount?.Company
                        : dataFetchCustomerData?.MainAccount?.FirstName && dataFetchCustomerData?.MainAccount?.LastName ? dataFetchCustomerData?.MainAccount?.FirstName + " " + dataFetchCustomerData?.MainAccount?.LastName : "---"
                    }
                    readOnly
                  />
                </CaseField>
                <CaseField label="Primary Contact" lock>
                  <Input
                    variant="invisible"
                    value = {
                      dataFetchCustomerData.MainAccount?.Salutation && dataFetchCustomerData.MainAccount?.FirstName && dataFetchCustomerData.MainAccount?.LastName ?
                      `${dataFetchCustomerData.MainAccount?.Salutation} ${dataFetchCustomerData.MainAccount?.FirstName} ${dataFetchCustomerData.MainAccount?.LastName}` : 
                      dataFetchCustomerData.MainAccount?.FirstName && dataFetchCustomerData.MainAccount?.LastName ?
                      `${dataFetchCustomerData.MainAccount?.FirstName} ${dataFetchCustomerData.MainAccount?.LastName}` : "---"
                    }
                    readOnly
                  />
                </CaseField>
                 <CaseField label="Secondary Contact" lock>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label=" Primary Email" lock>
                  <Input
                    variant="invisible"
                    value={dataFetchCustomerData.MainAccount?.Email ? dataFetchCustomerData.MainAccount?.Email : "---"}
                    placeholder="---"
                    readOnly
                  />
                </CaseField>
                <CaseField label="Country" lock>
                  <Input
                    variant="invisible"
                    value={
                      dataFetchCustomerData?.Type == "SiteAccount"
                        ? dataFetchCustomerData?.SiteAccount?.Country
                        : dataFetchCustomerData?.MainAccount?.Country ? dataFetchCustomerData?.MainAccount?.Country : "---"
                    }
                    readOnly
                  />                  
                </CaseField>
                <CaseField label="Phone" lock>
                  <span className="pl-3">
                  {dataFetchCustomerData?.Type == "SiteAccount"
                    ? dataFetchCustomerData?.SiteAccount?.PrimaryPhone
                    : dataFetchCustomerData?.MainAccount?.Phone ? dataFetchCustomerData?.MainAccount?.Phone : "---"}
                  </span>
                </CaseField>
                <CaseField label="Region" lock>
                  <Input 
                  variant="invisible" 
                  placeholder="---"  
                  value={dataFetchCustomerData?.Type == "SiteAccount"
                    ? dataFetchCustomerData?.SiteAccount?.City + " - " + dataFetchCustomerData?.SiteAccount?.StateProvince
                    : dataFetchCustomerData?.MainAccount?.City && dataFetchCustomerData?.MainAccount?.StateProvince ? dataFetchCustomerData?.MainAccount?.City + " - " + dataFetchCustomerData?.MainAccount?.StateProvince : "---"
                    }/>
                </CaseField>
                <CaseField label="Is Partner" lock>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Partner & Customer" lock>
                  <Input variant="invisible" placeholder="---"  />
                </CaseField>
                <CaseField label="PIC Name" lock>
                  <Input variant="invisible" placeholder="---"  
                  value={dataFetchCustomerData.MainAccount?.PIC_Name}
                  />
                </CaseField>
                <CaseField label="PIC Email" lock>
                  <Input variant="invisible" placeholder="---"  
                  value={dataFetchCustomerData.MainAccount?.PIC_Email}
                  />
                </CaseField>
                <CaseField label="PIC Phone no." lock>
                  <Input variant="invisible" placeholder="---"  
                  value={dataFetchCustomerData.MainAccount?.PIC_Phone}
                  />
                </CaseField>
                <CaseField label="NPWP" lock>
                  <Input variant="invisible" placeholder="---"
                  value={dataFetchCustomerData.SiteAccount?.NPWP}  
                  />
                </CaseField>

                <Accordion type="single" collapsible className="col-span-2">
                  <AccordionItem value="more-details" className={"pl-5 "}>
                    <AccordionTrigger className={"decoration-transparent border p-2 cursor-pointer"}>More Details . . .</AccordionTrigger>
                    <AccordionContent className="m-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        <CaseField lock label="Submitted By">
                          <Input variant="invisible" placeholder="---"  />
                        </CaseField>
                        <CaseField lock label="HIPAA" >
                          <Input variant="invisible" placeholder="---" readOnly/>
                        </CaseField>
                        <CaseField lock label="PIN">
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>              
                        <CaseField lock label="Parent Company">
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField lock label="Parent Company Non-Latin">
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField lock label="Customer Time Zone">
                          <Input variant="invisible" placeholder="---" readOnly/>
                        </CaseField>
                        <CaseField lock label="Account Tier">
                          <Input variant="invisible" placeholder="---"/>
                        </CaseField>
                      </div>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            </div>
            {/* --- Card 1: Customer Issue & System Info --- */}
                         
              <Card className="flex-col">
                <CardHeader>
                  <CardTitle className="text-lg  flex gap-3">
                    <FileSliders/>
                    Customer Issue Description & System Information
                  </CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* LEFT COLUMN - Issue Description */}
                    <div className="space-y-6">
                      <textarea
                      className={cn("w-full h-48 resize-none border rounded-md p-3 text-sm ring-1 ring-gray-300 bg-gray-50 ", !canEditFd && "cursor-not-allowed")}
                        value={caseForm?.CaseProductNote}
                      onChange={(e) => onChangeCase("CaseProductNote")(e.target.value)}
                      disabled={!canEditFd}
                      />
                    </div>
                    {/* RIGHT COLUMN - System Info */}
                <Accordion type="single" collapsible className="col-span-2">
                  <AccordionItem value="more-details" className={"pl-5 "}>
                    <AccordionTrigger className={"decoration-transparent border p-2 cursor-pointer"}>More Details . . .</AccordionTrigger>
                    <AccordionContent className="m-1">

                      <div className="grid grid-cols-4 gap-6">
                        <CaseField label="Related Device" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Device Manufacturer" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Device Model" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Program / Category" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Operating System" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Version" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Remote Diag Code" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Application Information" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Provider / Platform" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                        <CaseField label="Software Version" lock >
                          <Input variant="invisible" placeholder="---" />
                        </CaseField>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                  </div>
                </CardContent>
              </Card>
              {/* --- Card 2: Case Notes --- */}
              <Card className=" hover:shadow-gray-400">
                <CardHeader>
                  <CardTitle className="text-xl flex gap-2 "><NotepadText />Log Notes</CardTitle>
                  <hr />
                </CardHeader>
                <CardContent >
                  <div className="flex flex-col gap-2">
                    

                <div className="grid grid-cols-2 gap-4">
                  <CaseField
                    label="Log Type"

                  >
                    {/* <Select
                      value={formData?.LogType}
                      onValueChange={(val) => onChange("LogType", val)}
                    >
                      <SelectTrigger
                        className={"w-[100%] hover:shadow-lg border-b-0 p-3"}
                      >
                        <SelectValue placeholder="Log Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NotesLog">Notes Log</SelectItem>
                        <SelectItem value="PhoneLog">Phone Log</SelectItem>
                      </SelectContent>
                    </Select> */}

                    <SearchCommandBlock
                     value={formData?.LogType}
                     onChange={(val) => onChange("LogType", val)}
                     options={[
                      "Notes Log",
                      "Phone Log"
                     ]}
                      placeholder="--Select--"
                    />
                  </CaseField>

                  <CaseField
                    label="Action Type"

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

                  <CaseField
                    label="Template"
                    lock
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>

                  <CaseField
                    label="Visible Externally"

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
                      lock
                  >
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>

                  <CaseField
                    label="Notes"


                    star
                  >
                    <textarea
                      className="w-full h-full min-h-[100px] resize-none border rounded-md p-3 text-sm ring-1 ring-gray-300 shadow-sm"
                      value={formData?.Note || ""}
                      onChange={(e) => onChange("Note", e.target.value)}
                      placeholder="Write your note"
                    />
                  </CaseField>
                </div>
                <div className="w-full overflow-auto rounded-2xl shadow-xl">
                  <Table >
                    <TableHeader className={'bg-slate-300 '}>
                      <TableRow>
                        <TableHead>Created On</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Log Type</TableHead>
                        <TableHead>Action Type</TableHead>
                        {/* <TableHead>Template</TableHead>
                        <TableHead>Visible Externally</TableHead>
                        <TableHead>Number of Minutes Spent</TableHead> */}
                        <TableHead>Role</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(notesList) && notesList.length > 0 ? (
                        notesList.map((n,i) => (
                          
                          <TableRow key={n.NoteID} className={``}>
                            <TableCell>{n.CreatedOn ? format(new Date(n.CreatedOn), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                            <TableCell>{n.createdByUser?.Name || n.CreatedBy || '-'}</TableCell>
                            <TableCell>{n.LogType || '-'}</TableCell>
                            <TableCell>{n.ActionType || '-'}</TableCell>
                            {/* <TableCell>{n.Template || '-'}</TableCell>
                            <TableCell>{n.VisibleExternally || '-'}</TableCell>
                            <TableCell>{n.MinutesSpent || '-'}</TableCell> */}
                            <TableCell>{n.createdByUser?.Role || '-'}</TableCell>
                            <TableCell  colSpan="3" className="whitespace-pre-wrap max-w-xl">{parseNoteText(n.Note)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-gray-500">No notes yet</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                  </div>


                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="ci_asset">
            <div className="grid grid-cols-1 p-3 gap-3">
  
                <Card className="flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg ">Asset Information</CardTitle>
                    <hr />
                  </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                    <CaseField label="Category Warranty" lock className={"whitespace-break-spaces"}>
                      <Input
                        value={WarrantyConditionEnumToLabel[dataFetchAssetInformation?.AssetInformation?.WarrantyOTCCode?.WarrantyCondition]} 
                        variant={"invisible"}
                        placeholder={"---"}
                      />
                    </CaseField>
                    <CaseField label="Product Number" lock>
                      <Input
                        value={
                          dataFetchAssetInformation?.AssetInformation
                            ?.product_information?.ProductNumber
                        }
                        variant={"invisible"}
                        placeholder={"---"}
                      />
                    </CaseField>
                    <CaseField label="Asset Location" lock={user?.role  !== 'ps'}>
                      <Input variant="invisible" placeholder="---" value={caseForm?.StorageLocationStore} 
                      onChange= {(e) => onChangeCase('StorageLocationStore')(e.target.value)}
                      hidden/>
                      <SearchCommandBlock
                      value={caseForm?.StorageLocationStore}
                      onChange={onChangeCase('StorageLocationStore')}
                      options={OptionStorage}
                      />
                    </CaseField>
                    
                    <CaseField label="Serial Number" lock>
                      <Input
                      value={dataFetchAssetInformation?.AssetInformation?.SerialNumber}
                      variant={"invisible"}
                      placeholder={"---"}
                      className={"hover:text-blue-600 hover:cursor-pointer"}
                      onClick={() => {
                      const sn = dataFetchAssetInformation?.AssetInformation?.SerialNumber;
                      if (sn) {
                        window.open(`https://partsurfer.hp.com/?searchtext=${sn}`, "_blank");
                        }
                      }}
                      />
                    </CaseField>

                    <CaseField label="HPI Segment" lock>
                      <Input
                      value={dataFetchAssetInformation?.AssetInformation?.product_information?.product_type?.ProductGroup}
                      variant={"invisible"}
                      placeholder={"---"}
                      />
                    </CaseField>
                    
                    <CaseField label="SNIC - Count" lock>
                      <Input variant="invisible" placeholder="---" />
                    </CaseField>
                    <CaseField label="Product Name" lock>
                      <Input
                      value={
                        dataFetchAssetInformation?.AssetInformation
                          ?.product_information?.ProductName
                      }
                      variant={"invisible"}
                      placeholder={"---"}
                      
                      />
                    </CaseField>

                    <CaseField label="HWPC Code" lock={!canEditCe}>
                      <Input 
                      value={productForm?.HWPC}
                      variant="invisible" 
                      placeholder="---" 
                      onChange={(e) => handleProductChange("HWPC") (e.target.value)}
                      />
                    </CaseField>
  
                    <CaseField label="HW Profit Center" lock>
                      <Input variant="invisible" placeholder="---" />
                    </CaseField>
                    <div className="grid items-center grid-cols-2 col-span-2 gap-2 p-5 ring-1">
                      <CaseField label="Device Properties" lock>
                        <Input variant="invisible" placeholder="---" />
                      </CaseField>
                    </div>
                    <CaseField label="Warranty Status"  span={3} star className={"whitespace-break-spaces col-span-1 sm:col-span-2 md:col-span-1"} lock={!canEditWarranty}>
                      <SearchCommandBlock
                        options={otcCode}
                        value={entitlementStatus.OTCCode || "--select--"}
                        // value={dataWarrantyStatus || "--Select--"}
                        onChange={(value) =>
                          handleEntitlementStatus("OTCCode")(value)
                        }
                        placeholder="---"
                        renderLabel={(opt) =>
                          `${opt.OTCCode} - ${opt.Description}`
                        }
                        getValue={(opt) => opt.OTCCode}
                      />
                    </CaseField>
                  <CaseField lock={entitlementStatus?.needWarrantyApproval || !canEditWarranty} label="Need warranty approval?"  className={'col-span-1 '} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2}>
                    <SelectYN
                      // value={caseDetails.CaseStatus === "NEW_POPDoc" ? (WarrantyConditionEnumToLabel[dataFetchAssetInformation?.AssetInformation?.WarrantyOTCCode?.WarrantyCondition] === 'Out of Warranty' ? "Yes" : WarrantyConditionEnumToLabel[dataFetchAssetInformation?.AssetInformation?.WarrantyOTCCode?.WarrantyCondition] === 'InWarranty' ? "No" : "") : (caseDetails?.IsHWUnderWarranty ? "Yes" : "No")}
                      value={entitlementStatus?.needWarrantyApproval === undefined || entitlementStatus?.needWarrantyApproval === null ? "No" : entitlementStatus?.needWarrantyApproval ? "Yes" : "No"}
                      onValueChange={(val) => {
                        const isNeed = val === "Yes";
                        handleEntitlementStatus('needWarrantyApproval')(isNeed);
                          if (isNeed) {
                            const CmbineOTC = otcCode.find(otc => otc.OTCCode === '01T' && otc.Description === 'Trade (OOW)');
                            console.log("CmbineOTC:", CmbineOTC);
                            if (CmbineOTC) {
                              handleEntitlementStatus("OTCCode")(CmbineOTC.OTCCode);
                            }
                          } 
                        }
                      }
                    />
                  </CaseField>
                  <CaseField hide={!entitlementStatus.needWarrantyApproval} label="Warranty Approval Status"  className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2} lock={!canEditWarranty}>
                    <SelectBar
                      options={
                        [
                          {id: 1 , name: 'Add Info By WA' },
                          {id: 2 , name: 'Revision To WA' },
                          {id: 3 , name: 'New', disable: true }
                        ]
                      }
                      value={entitlementStatus.WarrantyApprovalStatus}
                      onChange={handleEntitlementStatus('WarrantyApprovalStatus')}
                    />
                  </CaseField>
                    <CaseField  label="Warranty Expiration Date"  className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2} lock={!canEditWarranty}>
                      <DatePicker
                        variant="icon"
                      value={entitlementStatus?.EOW_Date}
                        onChange={handleEntitlementStatus('EOW_Date')}
                        readOnly={!canEditWarranty}
                      ></DatePicker>
                    </CaseField>
                  {/* <CaseField hide={!entitlementStatus.needWarrantyApproval}  label="Upload Pop Document" className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-2"} span={2}>
                    <Input type="file"  onChange={(e) => onPickDocuments(e.target.files)} />
                  </CaseField> */}
                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="POP Document"
                    className="col-span-1"
                    childClass="col-span-1 sm:col-span-2 md:col-span-1"
                    span={2}
                    lock={!canEditWarranty}
                  >
                    {entitlementStatus?.POPDocument ? (
                      
                      <div className="flex flex-col gap-2">
                        { typeof entitlementStatus?.POPDocument === "string" ?
                        (<a
                          href={`${import.meta.env.VITE_API_BASE_URL}${entitlementStatus.POPDocument}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {(entitlementStatus?.POPDocument).split('/').pop()}
                        </a>
                        ) : (
                            <a
                              href={URL.createObjectURL(entitlementStatus.POPDocument)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {entitlementStatus?.POPDocument.name}
                            </a>

                        )
                          }
                        <Input
                          type="file"
                          onChange={(e) =>
                            handleEntitlementStatus("POPDocument")(e.target.files?.[0] || "")
                          }
                          readOnly={!canEditWarranty}
                        />
                        
                      </div>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleEntitlementStatus("POPDocument")(e.target.files?.[0] || "")
                        }
                        readOnly={!canEditWarranty}
                      />
                    )}
                  </CaseField>



                  
                  <CaseField hide={!entitlementStatus.needWarrantyApproval}  label="Purchase date"  className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2} lock={!canEditWarranty}>
                    <DatePicker
                      variant="icon"
                      value={entitlementStatus?.PurchaseDate}
                      onChange={handleEntitlementStatus('PurchaseDate')}
                      readOnly={!canEditWarranty}
                    ></DatePicker>
                  </CaseField>
                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="Upload Warranty Card"
                    className="col-span-1"
                    childClass="col-span-1 sm:col-span-2 md:col-span-1"
                    span={2}
                    lock={!canEditWarranty}
                  >
                    {entitlementStatus.WarrantyCard ? (

                      <div className="flex flex-col gap-2">
                        {typeof entitlementStatus.WarrantyCard === "string" ? (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}${entitlementStatus.WarrantyCard}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {entitlementStatus.WarrantyCard.split('/').pop()}
                          </a>
                        ) : (
                           <a
                              href={URL.createObjectURL(entitlementStatus.WarrantyCard)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {entitlementStatus?.WarrantyCard.name}
                            </a>
                        )}
                        <Input
                          type="file"
                          onChange={(e) =>
                            handleEntitlementStatus("WarrantyCard")(e.target.files?.[0] || "")
                          }
                          readOnly={!canEditWarranty}
                        />

                      </div>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleEntitlementStatus("WarrantyCard")(e.target.files?.[0] || "")
                        }
                        readOnly={!canEditWarranty}
                      />
                    )}
                  </CaseField>
                  {/* <CaseField hide={!entitlementStatus.needWarrantyApproval}   label="Upload Warranty Card" className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2}>
                    <Input type="file"  onChange={(e) => onPickWarrantyCards(e.target.files)} />
                  </CaseField> */}
                 
                  <CaseField hide={!entitlementStatus.needWarrantyApproval} label="Warranty Card Date"  className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2} lock={!canEditWarranty}>
                    <DatePicker
                      variant="icon"
                      value={entitlementStatus?.WarrantyCardDate}
                      onChange={handleEntitlementStatus('WarrantyCardDate')}
                      readOnly={!canEditWarranty}
                    ></DatePicker>
                  </CaseField>
                  {/* <CaseField hide={!entitlementStatus.needWarrantyApproval}  label="Upload Photo Unit" className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2}>
                    <Input type="file"  onChange={(e) => onPickPhotoUnits(e.target.files)} />
                  </CaseField> */}
                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="Upload Photo Unit"
                    className="col-span-1"
                    childClass="col-span-1 sm:col-span-2 md:col-span-1"
                    span={2}
                    lock={!canEditWarranty}
                  >
                    {entitlementStatus?.PhotoUnit ? (

                      <div className="flex flex-col gap-2">
                        { typeof entitlementStatus?.PhotoUnit === "string" ? (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}${entitlementStatus?.PhotoUnit}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {(entitlementStatus?.PhotoUnit).split('/').pop()}
                          </a>
                        ) :
                          (
                            <a
                              href={URL.createObjectURL(entitlementStatus.PhotoUnit)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {entitlementStatus?.PhotoUnit.name}
                            </a>
                        )
                      }
                        <Input
                          type="file"
                          onChange={(e) =>
                            handleEntitlementStatus("PhotoUnit")(e.target.files?.[0] || "")
                          }
                          readOnly={!canEditWarranty}
                        />

                      </div>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleEntitlementStatus("PhotoUnit")(e.target.files?.[0] || "")
                        }
                        readOnly={!canEditWarranty}
                      />
                    )}
                  </CaseField>
                  
                  <CaseField hide={!entitlementStatus.needWarrantyApproval} label="End User Name"  className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2} lock={!canEditWarranty}>
                    <Input value={entitlementStatus.EndUserName} onChange={(e) => handleEntitlementStatus('EndUserName')(e.target.value)} variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField hide={!entitlementStatus.needWarrantyApproval} label="End User Phone"  className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2} lock={!canEditWarranty}>
                    <Input value={entitlementStatus.EndUserPhone} onChange={(e) => handleEntitlementStatus('EndUserPhone')(e.target.value)} variant="invisible" placeholder="---" />
                  </CaseField>
                  <CaseField hide={!entitlementStatus.needWarrantyApproval} label="End User Address"  className={'col-span-1'} childClass={"col-span-1 sm:col-span-2 md:col-span-1"} span={2} lock={!canEditWarranty}>
                    <Textarea value={entitlementStatus.EndUserAddress} onChange={(e) => handleEntitlementStatus('EndUserAddress')(e.target.value)} variant="invisible" placeholder="---" />
                  </CaseField>
                  </CardContent>
                  {/* TABEL ACCESSORY */}
                  <div className="px-6 pb-6">
                    <h3 className="text-md font-semibold mb-2">Accessory</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr>
                            <th className="border px-4 py-2" hidden>No Accesories</th>
                            <th className="border px-4 py-2" hidden>
                              Case ID
                            </th>
                            <th className="border px-4 py-2">Accessories</th>
                            <th className="border px-4 py-2">Note</th>
                            <th className="border px-4 py-2">CT / SN code</th>
                          </tr>
                        </thead>
                        <tbody>
                          {caseDetails.accessory?.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border px-4 py-2" hidden>{item.id}</td>
                              <td className="border px-4 py-2" hidden>
                                {item.CaseID}
                              </td>
                              <td className="border px-4 py-2">
                                {item.Accessories}
                              </td>
                              <td className="border px-4 py-2">
                                {item.Note || "---"}
                              </td>
                              <td className="border px-4 py-2">
                                {item.CT_SNCode || "---"}
                              </td>
                            </tr>
                          ))}
                          {(!caseDetails?.accessory ||
                            caseDetails.accessory.length === 0) && (
                              <tr>
                                <td
                                  className="border px-4 py-2 text-center"
                                  colSpan={5}
                                >
                                  No accessories found.
                                </td>
                              </tr>
                            )}
                        </tbody>
                      </table>
                      <div className="mt-2 text-md text-gray-600">
                        Total Accesories: {caseDetails.accessory?.length || 0}
                      </div>
                    </div>
                  </div>
                </Card>
  
  
                <Card className="flex-col  ">
                  <CardHeader>
                    <CardTitle className="text-lg ">Work Order</CardTitle>
                    <hr />
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5 p-3 ">
                    <div className="grid grid-cols-4 gap-5" hidden>
                      <CaseField label="Incident Type" span={3} >
                        <Input variant="invisible" placeholder="---" />
                      </CaseField>
                      <CaseField label="Work Order Description" span={3}>
                        <Input variant="invisible" placeholder="---" />
                      </CaseField>
                    </div>
  
                    <Table className={'max-w-100'}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="">
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
                      <TableBody className={'max-w-100'}>
                        {workOrders.map((work) => (
                          <TableRow
                            key={work.WOID}
                            className="cursor-pointer hover:bg-gray-300"
                            onClick={() => handleClick(work)}
                          >
                            <TableCell className="font-medium ">
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
                            <TableCell>{statusEnumToLabelWO[work.SystemStatus]}</TableCell>
                            <TableCell>{work.Priority}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>{work.owner?.Name}</TableCell>
                            <TableCell>{work.owner?.Name}</TableCell>
                            <TableCell>{formatDate(work.CreatedOn)}</TableCell>
                          </TableRow>
                        ))}
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
                          <TableRow 
                          key={material.MOID}
                          onClick = {() => navigate(`/app/material-order/${material.MOID}`)}
                           className={
                            material.OrderStatus === "New" ? "cursor-pointer bg-green-100" :
                            material.OrderStatus === "Shipped" ? "cursor-pointer bg-yellow-100" :
                            material.OrderStatus === "Ordered" ? "cursor-pointer bg-blue-100" :
                            material.OrderStatus === "Closed" ? "cursor-pointer bg-gray-100" :
                            material.OrderStatus === "BackOrdered" ? "cursor-pointer bg-purple-100" 
                            : "cursor-pointer bg-red-100"
                          }
                          >
                            <TableCell className="font-medium">
                                {material.MOID} on {material.WOID}
                            </TableCell>
                            <TableCell>{material.workorder?.CaseID}</TableCell>
                            <TableCell>{formatDate(material.CreatedOn)}</TableCell>
                            <TableCell>{material.OrderStatus}</TableCell>
                            <TableCell>{material.OrderType}</TableCell>
                            <TableCell>{material.owner?.Name}</TableCell>
                            <TableCell>{material.WOID}</TableCell>
                            <TableCell>{formatDate(material.ReadyForClosureDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            </div>
            

          </TabsContent>

          <TabsContent value="action_log" >
            <div className="mt-2 p-1 grid grid-cols-2">
              <Card className="flex-col col-span-2">
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
                        <TableHead>Model</TableHead>
                        <TableHead>Case ID</TableHead>
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
                          <TableRow key={log.id || index} className={'text-xs'}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{log.ReferenceId}</TableCell>
                            <TableCell>{log.model}</TableCell>
                            <TableCell>{log.CaseId}</TableCell>
                            <TableCell>{log.changedByUser?.Role} - {log.changedByUser?.Name} ({log.changedByUser?.Username})</TableCell>
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
            </div>
          </TabsContent>
          
         <TabsContent value="doc_photo">
  <div className="p-3 space-y-5">
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-lg">Photo Unit</CardTitle>

        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <Input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="upload-photos"
            onChange={(e) => onPickPhotos(e.target.files)}
          />

          {/* Add photo button */}
          <label htmlFor="upload-photos">
            <Button asChild size="sm" variant="outline" className={"cursor-pointer"}>
              <span>+ Add Photo</span>
            </Button>
          </label>

          {/* Upload button muncul hanya jika ada file dipilih */}
          {photos.length > 0 && (
            <Button
              size="sm"
              className={"cursor-pointer"}
              onClick={async () => {
                try {
                  const fd = new FormData();
                  photos.forEach((f) => fd.append("files", f));
                  fd.append("caseId", caseDetails.CaseID);

                  await ApiCustomer.post(
                    "/api/case-information/upload-case",
                    fd,
                    { headers: { "Content-Type": "multipart/form-data" } }
                  );

                  toast.success("Photos uploaded!");
                  setPhotos([]); // reset preview lokal
                } catch (e) {
                  console.error(e);
                  toast.error("Photo upload failed");
                }
              }}
            >
              Upload Photos
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/*  Preview foto baru yang baru dipilih */}
        {photos.length > 0 && (
          <>
            <span className="font-bold italic">Preview New Photos</span>
            <div className="grid grid-cols-3 gap-3 mt-2">
             {photos.map((file, idx) => {
        const previewUrl = URL.createObjectURL(file);
        return (
          <div key={idx} className="relative">
            <img
              src={previewUrl}
              alt={file.name}
              className="border border-black shadow-lg rounded-sm cursor-pointer"
              onClick={() => setSelectedPhotoPreview(previewUrl)} // ⬅️ klik = buka popup zoom
            />
            <p className="text-xs truncate mt-1">{file.name}</p>
          </div>
        );
      })}
            </div>
          </>
        )}

        {/* Foto lama dari server */}
        <span className="font-bold italic mt-4 block">Uploaded Photos</span>
              {Array.isArray(caseDetails.casephotos) && caseDetails.casephotos.length > 0 ? (
        <CardFooter className="grid grid-cols-3 gap-3 mt-2">
          {caseDetails.casephotos.map((photo) => (
            <img
              key={photo.id}
              src={`${import.meta.env.VITE_API_BASE_URL}${photo.url}`}
              alt={`Photo ${photo.id}`}
              className="border border-black shadow-lg rounded-sm cursor-pointer hover:opacity-80 transition"
              onClick={() => setSelectedPhoto(photo)} // klik -> buka modal
            />
          ))}
        </CardFooter>
      ) : (
        <p className="italic text-sm text-gray-500">Belum ada foto yang diupload</p>
      )}

      {/* 🪄 Popup Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)} // klik luar area untuk close
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2">
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${selectedPhoto.url}`}
              alt={`Photo ${selectedPhoto.id}`}
              className="max-h-[90vh] rounded-lg shadow-2xl object-contain"
            />
          </div>
        </div>
      )}

     {selectedPhotoPreview && (
  <div
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    onClick={() => setSelectedPhotoPreview(null)}
  >
    <img
      src={selectedPhotoPreview}
      alt="Preview Zoom"
      className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
    />
  </div>
)}

      </CardContent>
    </Card>
  </div>
         </TabsContent>

         <TabsContent value="quotation">
            <div className="grid grid-cols-1 p-3 gap-3">
               <Card className={"flex-col col-span-2"}>
                <CardHeader>
                  <CardTitle className={"text-lg"}>Quotation Information</CardTitle>
                  <hr />
                </CardHeader>
                <CardContent className={"flex flex-col gap-4"}>
                <div className="grid grid-cols-2 border-2 p-2 rounded-sm gap-2">
                 <CaseField label={"Quotation no"} lock> 
                  <Input 
                    value={caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.QuotationNo || "---"}
                  />
                 </CaseField>
                 <CaseField label={"Quotation type"} lock> 
                  <Input 
                    value={caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.QuotationType || "---"}
                  />
                 </CaseField>
                  <CaseField label={"Labor Fee"} lock> 
                    <Input 
                      value={formatAccountingRupiah(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.LaborFee)}
                    />
                 </CaseField>
                  <CaseField label={"Quotation amount"} lock> 
                  <Input 
                    value={formatAccountingRupiah(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.Subtotal)}
                  />
                 </CaseField>
                 <CaseField label={"VAT value (%)"} lock> 
                  <Input 
                    value={caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.VatValue 
                      ? caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.VatValue + "%" 
                      : "---"}
                  />
                 </CaseField>
                   <CaseField label={"Quotation amount + VAT"} lock> 
                  <Input 
                    value={formatAccountingRupiah(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.GrandTotal)}
                  />
                 </CaseField>
                 <CaseField label={"Quotation Request date"} lock> 
                  <DatePicker 
                    value={new Date(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.QuotationDate)}
                  />
                 </CaseField>
                 {caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.QuotationApprovedDate !== null && (
                  <CaseField label={"Quotation Response date"} lock> 
                    <DatePicker 
                      value={new Date(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.QuotationApprovedDate)}
                    />
                  </CaseField>
                 )}
                  <CaseField label={"Quote decision"} lock> 
                  <Input 
                    value={caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.QuoteDecision || "---"}
                  />
                 </CaseField>
                </div>
                <div className="grid grid-cols-2 border-2 p-2 rounded-sm gap-2">
                 {caseDetails.workorder[0]?.materialorder.map((quo, i) => (
                   <div key={quo.MOID}>
                    <span className="font-bold">Sparepart {i+1}</span>
                    <div className="grid grid-cols-2">
                    <CaseField label={"Vendor part no"} lock>
                      <Input
                        value={"-"}
                      />
                    </CaseField>
                    <CaseField label={"HP part no"} lock>
                      <Input
                        value={quo.materialorderlineitems[0]?.PartNumber}
                      />
                    </CaseField>
                    <CaseField label={"Part name"} lock>
                      <Input
                        value={quo.materialorderlineitems[0]?.Description}
                      />
                    </CaseField>
                    <CaseField label={"QTY"} lock>
                      <Input
                        value={quo.materialorderlineitems[0]?.Quantity}
                      />
                    </CaseField>
                    <CaseField label={"Price"} lock>
                      <Input
                        value={formatAccountingRupiah(quo.materialorderlineitems[0]?.Price)}
                      />
                    </CaseField>
                    <CaseField label={"Part category"} lock>
                      <Input
                        value={quo.materialorderlineitems[0]?.servicecatalog_parts?.Keyword}
                      />
                    </CaseField>
                    <CaseField label={"Part approved"} lock>
                      <Input
                        value={quo.materialorderlineitems[0]?.quotation_lineitem[0]?.Approved === true ? "Yes" : "No"}
                      />
                    </CaseField>
                    <CaseField label={"Bad CT code"} lock>
                      <Input
                        value={quo.materialorderlineitems[0]?.RemovedPartNumber}
                      />
                    </CaseField>
                    </div>
                   </div>
                  ))}
                </div>
                </CardContent>
              </Card>
             
              <Card className={"flex-col col-span-2"}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={"text-lg"}>Invoice Information</CardTitle>
                    <Button
                    className={'bg-gray-300'}
                      size="sm"
                      variant="outline"
                      onClick={() => handleInvoiceOpenChange(true)}
                      disabled={invoiceLoading || caseDetails?.CaseStatus === "Close"}
                    >
                      {invoiceSummary ? "Edit Invoice" : "Buat Invoice"}
                    </Button>
                  </div>
                  <hr />
                </CardHeader>
                <CardContent>
                  {invoiceLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Memuat data invoice...
                    </p>
                  ) : invoiceSummary ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <CaseField label={"Quotation No"} lock>
                        <Input value={invoiceQuotation?.quotationNo || "-"} readOnly />
                      </CaseField>
                      <CaseField label={"Invoice No"} lock>
                        <Input value={invoiceSummary.invoiceNo} readOnly />
                      </CaseField>
                      <CaseField label={"Total Harga Sparepart"} lock>
                        {
                        caseDetails.workorder[0]?.materialorder.map((mo) =>{
                          const quoLineItemPrice = mo.materialorderlineitems[0]?.quotation_lineitem[0]?.Price;
                          totalquoLineItemPrice += Number(quoLineItemPrice);

                        })}
                        <Input
                          value={formatAccountingRupiah(totalquoLineItemPrice)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Labor Fee"} lock>
                        <Input
                          value={formatAccountingRupiah(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.LaborFee)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Subtotal"} lock>
                        <Input
                          value={formatAccountingRupiah(invoiceQuotation?.subtotal)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"VAT value (%)"} lock> 
                        <Input 
                          value={caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.VatValue 
                            ? caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.VatValue + "%" 
                            : "---"}
                        />
                      </CaseField>
                      <CaseField label={"DP"} lock>
                        <Input
                          value={formatAccountingRupiah("0")}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Grand Total"} lock>
                        <Input
                          value={formatAccountingRupiah(invoiceQuotation?.grandTotal)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Amount Receive"} lock>
                        <Input
                          value={formatAccountingRupiah(invoiceSummary.amountReceive)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Amount Difference"} lock>
                        <Input
                          value={formatAccountingRupiah(invoiceSummary.amountDiff)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField
                        label={"Ammount Difference Reason"}
                        lock
                        hide={!invoiceSummary.amountDiffReason}
                      >
                        <Input
                          value={invoiceSummary.amountDiffReason || "-"}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Payment Type"} lock>
                        <Input value={invoiceSummary.paymentType || "-"} readOnly />
                      </CaseField>
                      <CaseField label={"Tanggal Terima"} lock>
                        <Input
                          value={formatDate(invoiceSummary.amountReceiveDate)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Notifikasi"} lock>
                        <Input value={invoiceNotificationLabel} readOnly />
                      </CaseField>
                      <CaseField label={"Catatan"} lock span={2}>
                        <Textarea
                          value={invoiceSummary.amountReceiveNote || "-"}
                          rows={3}
                          readOnly
                        />
                      </CaseField>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <p>Belum ada invoice untuk case ini.</p>
                     
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>         
        </Tabs>
      </Card>
    </>
  );
};
  
