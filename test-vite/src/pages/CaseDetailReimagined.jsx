// TabsServiceCaseDetails.tsx (top part, refactored to zustand)
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useSidebar } from "@/components/ui/sidebar";
import Swal from "sweetalert2";
import { pdf } from "@react-pdf/renderer";
import { useAuth } from "@/context/auth-context";
import ApiCustomer from "@/api";
import { getUserFromToken } from "@/lib/utils/auth";
import { toast } from "sonner";
import { BtnModalsServiceCatalog } from "@/components/model/sc-modal";
import ServiceRequestPDF from "@/components/service-request-form";
import EquipmentReciptForm from "@/components/Equipment-Recipt-Form";
import { QuotationInvoice } from "@/components/QuatationInvoice";
import { Invoice } from "../components/Invoice";
import {
  CircleChevronLeft,
  Save,
  FileSymlink,
  RotateCw,
  CopyX,
  StepBack,
  MessageSquareText,
  NotebookPen,
  CoinsIcon,
  Trash2,
  ClipboardPenLine,
  BadgeCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from 'react-responsive'


// ... STATUS ENUMS etc (same as before)

export const TabsServiceCaseDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { open } = useSidebar();
  // TO DO : Slamet 
  // const  isResponsive  = useMediaQuery({query: '(max-width: 1824px)'})

  // ---- pull state from zustand ----
  const caseDetails = useServiceCaseStore((s) => s.caseDetails);
  if (!caseDetails) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Some thing went wrong please reload
      </div>
    );
  }
  const caseForm = useServiceCaseStore((s) => s.caseForm);
  const entitlementStatus = useServiceCaseStore((s) => s.entitlementStatus);
  const productForm = useServiceCaseStore((s) => s.productForm);
  const caseNoteFormData = useServiceCaseStore((s) => s.caseNoteFormData);
  const notesList = useServiceCaseStore((s) => s.notesList);
  const selectedSymptom = useServiceCaseStore((s) => s.selectedSymptom);
  const signature = useServiceCaseStore((s) => s.signature);
  const refreshFetchPage = useServiceCaseStore((s) => s.refreshFetchPage);

  const openWorkOrder = useServiceCaseStore((s) => s.openWorkOrder);
  const serviceCatalogType = useServiceCaseStore((s) => s.serviceCatalogType);
  const openDialogQuotation = useServiceCaseStore((s) => s.openDialogQuotation);
  const invoiceDialogOpen = useServiceCaseStore((s) => s.invoiceDialogOpen);
  const invoiceData = useServiceCaseStore((s) => s.invoiceData);
  const invoiceLoading = useServiceCaseStore((s) => s.invoiceLoading);

  const setEntitlementField = useServiceCaseStore((s) => s.setEntitlementField);
  const setProductFormField = useServiceCaseStore((s) => s.setProductFormField);
  const setCaseNoteField = useServiceCaseStore((s) => s.setCaseNoteField);
  const setSelectedSymptom = useServiceCaseStore((s) => s.setSelectedSymptom);
  const setSignature = useServiceCaseStore((s) => s.setSignature);
  const setOpenWorkOrder = useServiceCaseStore((s) => s.setOpenWorkOrder);
  const setOpenDialogQuotation = useServiceCaseStore(
    (s) => s.setOpenDialogQuotation
  );
  const setInvoiceDialogOpen = useServiceCaseStore(
    (s) => s.setInvoiceDialogOpen
  );

  const fetchInvoiceData = useServiceCaseStore((s) => s.fetchInvoiceData);
  const fetchDPData = useServiceCaseStore((s) => s.fetchDPData)
  const saveAll = useServiceCaseStore((s) => s.saveAll);
  const isDirty = useServiceCaseStore((s) => s.isDirty)

  // ---- local only (still fine to keep) ----
  const [quotationInitialData, setQuotationInitialData] = useState(null);
  const [quotationMaterialItems, setQuotationMaterialItems] = useState([]);
  const [quotationLoading, setQuotationLoading] = useState(false);
  const [quotationSubmitting, setQuotationSubmitting] = useState(false);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
  const [cancelState, setCancelState] = useState(false);
  const [logNoteOpen, setLogNoteOpen] = useState(false)

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
        return new Promise((res) => {
          reader.onloadend = () => {
          res(reader.result);
        }})
      })


      setQrCodeImg(base64);

      }catch(error){
      toast.error(error?.response?.data?.message ?? "Error generating QR code");
      }
  }
  
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
        toast.error(error?.response?.data?.message ?? "Error in Downloading QRcode");
      }};
    }
  useEffect(()=>{
    generateQR()
  },[caseDetails.CaseID])


  const convertToBase64 = async (url) => {
    return base64
  }

  const handleSave = (redirect = true, onClose = false) => saveAll({ redirect, onClose });

  const openServiceCatalog = (type) => {
    setOpenWorkOrder(true, type);
  };

  const handleOpenSignaturePad = () => {
    const sigWindow = window.open(
      "/signature-pad",
      "Signature Pad",
      "width=600,height=400"
    );
  };

  useEffect(() => {
  const handler = (event) => {
    if (event.data?.type === "signature") {
      setSignature(event.data.signature);
      toast.success("Signature captured successfully!", {
           description: "Print ERF OR SRF Avaiable",
           position: "top-center",
         });    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}, [setSignature]);


  // ---------------- buttons (same, but handleSave from store) -------------
  const buttons = [
    {
      icon: CircleChevronLeft,
      label: "",
      onClick: () => navigate(`/app/`),
      roles: [
        "admin",
        "fd",
        "user",
        "apo",
        "ce",
        "lg",
        "celead",
        "spv",
        "ps",
        "cm",
        "apv",
      ],
    },
    {
      icon: Save,
      label: "Save",
      onClick: () => handleSave(),
      roles: ["admin", "fd", "user", "apo", "ce", "lg", "celead", "ps", "cm","apv"],
    },
    {
      icon: FileSymlink,
      label: "Save & Close",
      onClick: () =>
        handleSave().then((ok) => {
          if (ok) navigate(`/app/`);
        }),
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
      roles: [
        "admin",
        "fd",
        "user",
        "apo",
        "ce",
        "lg",
        "celead",
        "spv",
        "ps",
        "cm",
        "apv",
      ],
    },
    {
      icon: BadgeCheck,
      label: "Approve",
      onClick: () => Approve(),
      roles: ["admin", "apv"],
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
      },
      roles: ["admin", "fd", "user", "spv", "ce", "celead"],
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
            qrcode={qrCodeImg}
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
      hidden: caseDetails.workorder[0]?.SystemStatus == 'OPEN_UNSCHEDULED'  ? true : caseDetails.workorder[0]?.SystemStatus == 'OPEN_SCHEDULED' ? true : caseDetails.workorder[0]?.SystemStatus == 'OPEN_COMPLETED' ? true : false,
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
            qrcode={qrCodeImg}
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
                qrcode={qrCodeImg}
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
              Template: "INVOICE Requested",
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
                qrcode={qrCodeImg}
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
        { icon: ClipboardPenLine, label: "Quick Log Note", onClick: () => {setLogNoteOpen(true)}, roles: ["admin", "fd", "user", "apo", "ce", "lg", "celead", "ps", "cm"]},
  ];


  const allowedButtons = buttons.filter((btn) =>
  btn.roles.includes(user.role)
);

// const visibleButtons = isResponsive
//   ? allowedButtons.slice(0, -2)   
//   : allowedButtons;              

// const hiddenButtons = isResponsive
//   ? allowedButtons.slice(-2)      
//   : [];

  
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
      const message =
        error.response?.data?.message ?? "Gagal menyimpan invoice.";
      toast.error(message);
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  const ensureInvoiceBeforeClose = async () => {
    const latestInvoiceData = await fetchInvoiceData();
    if (!latestInvoiceData) {
      await Swal.fire({
        icon: "warning",
        title: "Quotation belum tersedia",
        text: "Buat quotation beserta invoice sebelum menutup case.",
      });
      return false;
    }
    if (!latestInvoiceData.invoice) {
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
     if (isDirty) {
      const success = await handleSave(false, true);
      if (!success) return; 
     }
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
        toast.error("Error",res.data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message ?? "Failed to update!")
    }
  };
  const Approve = async () => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update",
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const caseUpdate = await ApiCustomer.patch(`/api/case-information/${caseDetails.CaseID}`,{
        CaseStatus: "New",
        Owner: caseDetails.CreatedBy,
      })
      
      const assetUpdate = await ApiCustomer.patch(`/api/asset-information/${caseDetails.AssetID}`,{
        Warranty_Status: caseDetails.asset_information?.Warranty_Status,
        needWarrantyApproval: true,
        WarrantyApprovalStatus: "Add Info By WA",
        WarrantyCardDate: caseDetails.asset_information?.asset_warranty[0]?.WarrantyCardDate,
        PurchaseDate: caseDetails.asset_information?.asset_warranty[0]?.PurchaseDate,
        POPDocument: caseDetails.asset_information?.asset_warranty[0]?.POPDocument,
        WarrantyCard: caseDetails.asset_information?.asset_warranty[0]?.WarrantyCard,
        PhotoUnit: caseDetails.asset_information?.asset_warranty[0]?.PhotoUnit,
        EndUserName: caseDetails.asset_information?.asset_warranty[0]?.EndUserName,
        EndUserPhone: caseDetails.asset_information?.asset_warranty[0]?.EndUserPhone,
        EndUserAddress: caseDetails.asset_information?.asset_warranty[0]?.EndUserAddress,
      })

      const LogNote = await ApiCustomer.post("/api/case-information/case-notes", {
        LogType: "System Approved",
        ActionType: "Approved",
        Template: "Approve Requested",
        VisibleExternally: false,
        MinutesSpent: 0,
        Note : `Approved by ${user?.role} - ${user?.name || "Uknown User"}`,
        CaseID: caseDetails?.CaseID,
        CreatedBy: user?.id,
      })

      const actionLog = await ApiCustomer.post("/api/actionlog",{
        CaseId: `${caseDetails.CaseID}`,
        ReferenceId: ``,
        model: "Case",
        dataOld: caseDetails.CaseStatus,
        dataNew: caseUpdate.data.data.CaseStatus,
        changedBy: user?.id,
        logDescription: `Approve : Change Case ${caseDetails.CaseID} Status from ${caseDetails.CaseStatus} to ${caseUpdate.data.data.CaseStatus}`
      })
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Updated Succes",
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.reload()
      })
    } catch (error) {
        toast.error(error?.response?.data?.message ?? "Updated Failed")
    }
  }

function fieldMO(caseDetails) {
  return mapMaterialOrdersToQuotationItems(caseDetails);
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
              setQuotationInitialData(
                mapQuotationInitialData(quotationPayload)
              );
            }
          } catch (error) {
            if (!cancelled) {
              toast.error(
                error.response?.data?.message ??
                  "Gagal mengambil data quotation."
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
          const apiPayload = {
            ...payload,
            userAssign:
              user.id !== payload?.userAssign ? payload.userAssign : user.id,
          };
          if (apiPayload.quoteDecision === "Rejected") {
            apiPayload.userAssign = caseDetails.workorder[0]?.OwnerID;
          }
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
  // ... keep the rest of your logic (quotation/invoice handlers, fieldMO, saveAndCloseCase, dialogs, and finally <ServiceCase />)
  // but now when you pass props to <ServiceCase>, you can pull from the store instead of local state.

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

    const isTechRole = ["ce", "celead", "apo", "admin"].includes(user?.role);

  return (
    <>
  <div className="grid grid-cols-1 w-full">
      
      <div className="sticky top-15 z-5 w-full min-w-0 bg-gray-50 border-b border-gray-200 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600">
        
        <div className="w-full overflow-x-auto no-scrollbar">
          
          <div className="flex items-center min-w-max">
            {allowedButtons.map((btn, index) => (
              <Button
                key={index}
                onClick={btn.onClick}
                hidden={btn.hidden}
                variant="link"
                // 'shrink-0' ensures buttons don't crush each other
                className="shrink-0 has-[>svg]:px-2 rounded-none flex items-center gap-0.5 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-slate-600 "
              >
                <btn.icon className="w-4 h-4 dark:text-gray-400" />
                {btn.label && (
                  <span className="text-sm font-medium dark:text-gray-300">
                    {btn.label}
                  </span>
                )}
              </Button>
            ))}
            {/* {hiddenButtons.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="invisible"
                    className="rounded-none px-3 py-2 hover:bg-gray-200 dark:hover:bg-slate-600"
                  >
                    ...
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  {hiddenButtons.map((btn, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={btn.onClick}
                    >
                      <btn.icon/>
                      <span>{btn.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
          )} */}
            {(isTechRole && caseDetails?.CaseStatus !== "Close") && (
              <div className="shrink-0">
                <BtnModalsServiceCatalog
                  open={openWorkOrder}
                  setOpen={(open) => setOpenWorkOrder(open)}
                  caseDetails={caseDetails}
                  serviceCatalogType={serviceCatalogType}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full min-w-0">
        <QuotationDialog />
        <InvoiceDialog />
        <ServiceCase /> 
        <QuickLogNote 
          open={logNoteOpen}
          onOpenChange={setLogNoteOpen}
        />
      </div>
    </div>
      {/* Quotation dialog, Invoice dialog, ServiceCase component, etc
          Here you can either:
          - continue passing props,
          - or also move those into the store with the same pattern. */}
    </>
  );
};



// ServiceCase.tsx
import { format } from "date-fns";
import { cn, formatAccountingRupiah, formatDate } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import DatePicker from "@/components/date-picker";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectYN, SearchCommandBlock, SelectBar } from "@/components/sc-select";
import CaseField from "@/components/CaseField";
import { Separator } from "@/components/ui/separator";
import { parseNoteText } from "@/lib/utils.jsx";

// icons etc …
import {
  Briefcase,
  Contact,
  FileSliders,
  NotepadText,
} from "lucide-react";
import { useServiceCaseStore } from "@/hooks/useServiceCaseStore";
import { SelectGroup } from "../components/ui/select";
import { InvoiceDp } from "../components/InvoiceDp";
import { ComboboxDemo } from "../components/sc-select";
import InvoiceDialog from "../components/model/InvoiceModalReimagined";
import QuotationDialog from "../components/model/QuotationModalReimagined";
import { mapMaterialOrdersToQuotationItems } from "../lib/mappers/fieldMO";
import { QuickLogNote } from "../components/model/QuickLogNote";
import Approvel from "../layout/Apv_page";
import { DatePickertoDateOrNull, formatDateForInput } from "../lib/utils";

const suffixToRoleMap = {
  CE: "ce",
  APO: "apo",
  Leader: "celead",
  PS: "ps",
  FD: "fd", 
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
  Cancel: "Cancel",
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
  NEW_POPDoc: "New Needed POP Document",
  NEW_Warranty: "New Warranty Approval",
  PartRequest: "Part Request",
  PartRequestLog: "Part Request Logistic",
  PartOrder: "Part Order",
  PartAvailable: "Part Available",
  RepairProgress: "Repair Progress",
  FinishRepair: "Finish Repair",
  CancelRepair: "Cancel Repair",
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

export const statusEnumToLabelWO = {
  OPEN_UNSCHEDULED: 'Open - Unscheduled',
  OPEN_SCHEDULED: 'Open - Scheduled',
  OPEN_INPROGRES: 'Open - In Progress',
  OPEN_COMPLETED: 'Open - Completed',
  CLOSED_POSTED: 'Closed - Posted',
  CLOSED_CANCELLED: 'Closed - Cancelled',
  };
  
// Warranty label map
const WarrantyConditionEnumToLabel = {
  InWarranty: "In Warranty",
  OutWarranty: "Out of Warranty",
};

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R","U","T"]
const number  = [1,2,3,4,5]

const OptionStorage = letters.flatMap(letter =>
  number.map(num => ({ value: `${letter}${num}`, label: `${letter}${num}` }))
);

export const ServiceCase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();


  // ------ pull state from zustand ------
  const caseDetails = useServiceCaseStore((s) => s.caseDetails);

  const caseForm = useServiceCaseStore((s) => s.caseForm);
  const setCaseFormField = useServiceCaseStore((s) => s.setCaseFormField);

  const caseNoteFormData = useServiceCaseStore((s) => s.caseNoteFormData);
  const setCaseNoteField = useServiceCaseStore((s) => s.setCaseNoteField);

  const customerData = useServiceCaseStore((s) => s.customerData);
  const assetInformation = useServiceCaseStore((s) => s.assetInformation);
  const ownerUserData = useServiceCaseStore((s) => s.ownerUserData);
  const notesList = useServiceCaseStore((s) => s.notesList);
  const workOrders = useServiceCaseStore((s) => s.workOrders);
  const materialOrders = useServiceCaseStore((s) => s.materialOrders);
  const actionLogs = useServiceCaseStore((s) => s.actionLogs);
  const otcCode = useServiceCaseStore((s) => s.otcCode);

  const entitlementStatus = useServiceCaseStore((s) => s.entitlementStatus);
  const setEntitlementField = useServiceCaseStore((s) => s.setEntitlementField);
  const setEntitlementFieldSilent = useServiceCaseStore(
    (s) => s.setEntitlementFieldSilent
  );

  const productForm = useServiceCaseStore((s) => s.productForm);
  const setProductFormField = useServiceCaseStore((s) => s.setProductFormField);

  const csrForm = useServiceCaseStore((s) => s.csrForm);
  const setCsrFormField = useServiceCaseStore((s) => s.setCsrFormField);

  const signature = useServiceCaseStore((s) => s.signature);
  const setSignature = useServiceCaseStore((s) => s.setSignature);

  const refreshFetchPage = useServiceCaseStore((s) => s.refreshFetchPage);

  const invoiceData = useServiceCaseStore((s) => s.invoiceData);
  const invoiceLoading = useServiceCaseStore((s) => s.invoiceLoading);
  const totalDpAmount = useServiceCaseStore((s) => s.totalDpAmount());
  const setInvoiceDialogOpen = useServiceCaseStore(
    (s) => s.setInvoiceDialogOpen
  );

 

  const setSelectedSymptom = useServiceCaseStore((s) => s.setSelectedSymptom);

  // ------ tiny derived values & helpers ------
  const createdOn = caseDetails?.CreatedOn
    ? new Date(caseDetails.CreatedOn)
    : null;
  const caseClosedDate = caseDetails?.CaseClosedDate
    ? new Date(caseDetails.CaseClosedDate)
    : null;

  const dataWarrantyStatus =
    assetInformation?.Warranty_Status ??
    assetInformation?.WarrantyOTCCode?.WarrantyCondition ??
    null;

  // Invoice summary helpers
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

  const grandTotalNumber = useMemo(() => {
    if (!invoiceQuotation?.grandTotal) return 0;
    let parsed = Number(invoiceQuotation.grandTotal);
    if(totalDpAmount !== 0) parsed = parsed - Number(totalDpAmount)
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [invoiceQuotation, totalDpAmount]);

  // UI-only state
  const [selectedSite, setSelectedSite] = useState("--Selected--");
  const [roleAssign, setRoleAssign] = useState([]);
  const [hideAssignTo, setHideAssignTo] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState(null);

  // symptom search stuff (UI only)
  const [symptomSearchTerm, setSymptomSearchTerm] = useState("");
  const [symptomSuggestions, setSymptomSuggestions] = useState([]);

  // --------- entitlement initial fill when asset info ready ----------

const dpList = useServiceCaseStore((s) => s.dpList);
const addDpRow = useServiceCaseStore((s) => s.addDpRow);
const removeDpRow = useServiceCaseStore((s) => s.removeDpRow);
const setDpField = useServiceCaseStore((s) => s.setDpField);



const currentCaseId = caseDetails?.CaseID;

const entitlementInitializedRef = useRef(false);


  useEffect(() => {
    if (!assetInformation || entitlementInitializedRef.current) return;

    entitlementInitializedRef.current = true;

    // Set OTC and EOW from asset
    if (assetInformation.Warranty_Status) {
      setEntitlementFieldSilent("OTCCode", assetInformation.Warranty_Status);
    }
    if (assetInformation.EOW_Date) {
      setEntitlementFieldSilent("EOW_Date", new Date(assetInformation.EOW_Date));
    }

    const w = assetInformation.asset_warranty?.[0];
    if (w) {
      setEntitlementFieldSilent("needWarrantyApproval", true);
      if (w.PurchaseDate)
        setEntitlementFieldSilent("PurchaseDate", new Date(w.PurchaseDate));
      if (w.WarrantyCardDate)
        setEntitlementFieldSilent(
          "WarrantyCardDate",
          new Date(w.WarrantyCardDate)
        );
      setEntitlementFieldSilent("WarrantyApprovalStatus", w.WarrantyApprovalStatus);
      setEntitlementFieldSilent("EndUserName", w.EndUserName);
      setEntitlementFieldSilent("EndUserPhone", w.EndUserPhone);
      setEntitlementFieldSilent("EndUserAddress", w.EndUserAddress);
      setEntitlementFieldSilent("POPDocument", w.POPDocument);
      setEntitlementFieldSilent("WarrantyCard", w.WarrantyCard);
      setEntitlementFieldSilent("PhotoUnit", w.PhotoUnit);
    }
  }, [assetInformation, setEntitlementFieldSilent]);

useEffect(() => {
  entitlementInitializedRef.current = false;
}, [currentCaseId]);


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

  // ------ fetch assignable users by role when needed ------
  const fetchUserAssign = async (role) => {
    try {
      const res = await ApiCustomer.get(`/api/user?role=${role}`);
      const FetchAllUserByRole = res.data.data || [];
      const FilterAllUserByRole = FetchAllUserByRole.filter(u => u.ResourceId === user.resource)
      setRoleAssign(FilterAllUserByRole);      
    } catch (err) {
      toast.error("Error fetching role");
    }
  };

  const handleClick = async (work) => {

    navigate(`/app/work/${work.WOID}`);
  };

  // ------ edit permissions ------
  let canEdit = false;
  let canEditFd = false;
  let canEditApo = false;
  let canEditCe = false;
  let canEditWarranty = false;

  if (caseDetails?.CaseStatus !== "Close" && caseDetails?.CaseStatus !== "Cancel" ) {
    canEdit = caseDetails?.Owner === user?.id || user?.role === "admin";
    canEditFd = user?.role === "fd" || user?.role === "admin";
    canEditApo = user?.role === "apo" || user?.role === "admin";
    canEditCe =
      user?.role === "ce" || user?.role === "celead" || user?.role === "admin";
    canEditWarranty =
      user?.role === "fd" ||
      user?.role === "admin" ||
      user?.role === "apv";
  }

  // ------ file pick handlers (kept local) ------
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

  const handleInvoiceOpenChange = (nextOpen  = true) => {
    setInvoiceDialogOpen(nextOpen);
  };

  // --- small wrappers around store setters for JSX ---
  const onChangeCase = (field) => (value) =>
    setCaseFormField(field, value);

  const onChangeCaseNote = (field, value) =>
    setCaseNoteField(field, value);

  const handleEntitlementStatus = (field) => (value) =>
    setEntitlementField(field, value);

  const handleProductChange = (field) => (value) =>
    setProductFormField(field, value);

  const onChangeCsr = (field) => (value) =>
    setCsrFormField(field, value);



  // safety: if no caseDetails yet, don't render
  if (!caseDetails) return null;

  // ---- compute hidden tab for OOW ----
  const hiddenOowTab =
    caseDetails.asset_information?.WarrantyOTCCode?.OTCCode !== "01T";

  const tabs = [
    { value: "case_info", label: "Case & Customer" },
    { value: "ci_asset", label: "Assets , WO and MO" },
    { value: "quotation", label: "OOW Information", hidden: hiddenOowTab },
    { value: "doc_photo", label: "Document Photo" },
    { value: "action_log", label: "Action Log" },
  ];

  let totalquoLineItemPrice = 0;
  
  return (
    <>
      {(caseDetails.CaseStatus === "Close" || caseDetails.CaseStatus === "Cancel") && (
        <div className="p-4 mt-2 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500">
          This Case is <strong>read-only</strong> because it is
          <strong> Closed OR Canceled</strong>.
        </div>
      )}

      <Card className="border-0 dark:rounded-none bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
        <Tabs defaultValue="case_info" onValueChange={(value) => {window.location.hash = value.toLowerCase()}}>
          <CardHeader className="sticky top-24 z-5 w-full border-b bg-white shadow-sm flex flex-col dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
              {/* LEFT SIDE - Case Info */}
              <div>
                <h1 className="text-2xl font-semibold">{caseDetails.CaseID}</h1>
                <p className="text-lg text-muted-foreground">
                  {caseDetails.CaseSubject}
                </p>
              </div>

              {/* RIGHT SIDE - Quick Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Owner */}
                <div className="flex flex-col">
                  <span className="text-blue-600 font-medium dark:text-white">
                    {ownerUserData?.Name || "."}
                  </span>
                  <span className="text-muted-foreground">
                    {ownerUserData?.Role === "fd"
                      ? "Owner Fd"
                      : ownerUserData?.Role === "ce"
                      ? "Owner Ce"
                      : ownerUserData?.Role === "celead"
                      ? "Owner Ce Leader"
                      : ownerUserData?.Role === "lg"
                      ? "Owner Lg"
                      : ownerUserData?.Role === "apo"
                      ? "Owner Apo"
                      : ownerUserData?.Role === "cm"
                      ? "Owner Cm"
                      : ownerUserData?.Role === "admin"
                      ? "Owner Admin"
                      : ownerUserData?.Role === "ps"
                      ? "Owner Ps"
                      : ownerUserData?.Role === "apv"
                      ? "Owner Approvel"
                      : ownerUserData?.Role === "user"
                      ? "User"
                      : "None"}
                  </span>
                </div>

                {/* Queue */}
                <div className="flex flex-col">
                  <span className="text-blue-600 font-medium dark:text-white">{STATUS_ENUM_TO_LABEL[caseDetails.CaseStatus]}</span>
                  <span className="text-muted-foreground">Status</span>
                </div>

                {/* Contact */}
                <div className="flex flex-col">
                  <span className="text-blue-600 font-medium dark:text-white">
                    {customerData.MainAccount?.Salutation}
                    {customerData.MainAccount?.FirstName}{" "}
                    {customerData.MainAccount?.LastName}
                  </span>
                  <span className="text-muted-foreground">Contact</span>
                </div>

                {/* Site Account */}
                <div className="flex flex-col">
                  <Select defaultValue="first">
                    <SelectTrigger className="h-auto p-0 text-blue-600 font-medium border-none shadow-none focus:ring-0 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="first">
                          {customerData.SiteAccount?.Company}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">Site Account</span>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className=" border-t bg-gray-50 w-full overflow-x-auto h-fit no-scrollbar">
              <TabsList className="sm:w-full w-fit flex gap-4 h-fit p-0  dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600 dark:rounded-none">
                {tabs.map((tab, index) =>
                  tab.component ? (
                    <div key={index}>{tab.component}</div>
                  ) : (
                    <TabsTrigger
                      key={index}
                      variant="modernUnderline"
                      value={tab.value}
                      disabled={tab.disable}
                      hidden={tab.hidden}
                      className="text-sm font-medium dark:border-b-slate-500 dark:text-gray-300"
                    >
                      {tab.label}
                    </TabsTrigger>
                  )
                )}
              </TabsList>
            </div>
          </CardHeader>
          {/* Example of changed bindings in Case Info tab: */}
          <TabsContent value="case_info" className="p-2 flex flex-col gap-5">
            {/* ... your existing JSX, but:
                - value={caseForm.CaseSubject}
                - onChange={e => onChangeCase("CaseSubject")(e.target.value)}
                - customer fields from customerData instead of dataFetchCustomerData
                - etc.
            */}
            <div className={" grid lg:grid-cols-2 md:grid-cols-1 gap-4"}>
              <Card className="flex-col dark:bg-gradient-to-tl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                <CardHeader>
                  <CardTitle className={"text-lg  flex gap-3"}>
                    <Briefcase />
                    Case Information
                  </CardTitle>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3 ">
                  <CaseField
                    label="Case Subject"
                    span={3}
                    childClass={"col-span-3"}
                    lock={!canEditFd}
                  >
                    <div className="ml-8 w-full" id="case-subject">
                      <Textarea
                        value={caseForm?.CaseSubject}
                        onChange={(e) =>
                          onChangeCase("CaseSubject")(e.target.value)
                        }
                        className=" border-none italic ring-1 ring-gray-400 bg-gray-50 text-base dark:bg-gray-500/10 dark:border-gray-400"
                        readOnly={!canEditFd}
                      />
                    </div>
                  </CaseField>

                  <CaseField
                    label="Case ID manual"
                    className={"mt-2"}
                    childClass={"col-span-2"}
                    span={2}
                    lock={!canEditApo}
                  >
                    <Input
                      placeholder="---"
                      value={caseForm?.CaseID_Manual}
                      onChange={(e) =>
                        onChangeCase("CaseID_Manual")(e.target.value)
                      }
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>

                  <CaseField
                    label="Case ID manual Date"
                    className={"mt-2"}
                    childClass={"col-span-2"}
                    span={2}
                    lock={!canEditApo}
                  >
                    <DatePicker
                      value={
                        caseForm?.CaseID_Manual_Date
                          ? new Date(caseForm.CaseID_Manual_Date)
                          : null
                      }
                      onChange={onChangeCase("CaseID_Manual_Date")}
                    />
                  </CaseField>

                  {/* detail owner */}
                  <CaseField
                    label="Created By"
                    className={"mt-2"}
                    childClass={"col-span-2"}
                    span={2}
                    lock
                  >
                    <Input
                      placeholder="---"
                      value={caseDetails.createdByUser?.Name}
                      readOnly
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  {caseDetails?.workorder[0]?.owner?.IDUser && (
                    <CaseField
                      label="Engineer name"
                      className={"mt-2"}
                      childClass={"col-span-2"}
                      span={2}
                      lock
                    >
                      <Input
                        placeholder="---"
                        value={caseDetails.workorder[0].owner.Name}
                        readOnly
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                  )}
                  {caseDetails?.workorder[0]?.materialorder[0]
                    ?.materialorderlineitems[0]?.quotation_lineitem[0]
                    ?.quotation?.User?.IDUser && (
                    <CaseField
                      label="CM name"
                      className={"mt-2"}
                      childClass={"col-span-2"}
                      span={2}
                      lock
                    >
                      <Input
                        placeholder="---"
                        value={
                          caseDetails?.workorder[0]?.materialorder[0]
                            ?.materialorderlineitems[0]?.quotation_lineitem[0]
                            ?.quotation?.User?.Name
                        }
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        readOnly
                      />
                    </CaseField>
                  )}
                  {caseDetails?.workorder[0]?.materialorder[0]?.owner
                    ?.IDUser && (
                    <CaseField
                      label="APO name"
                      className={"mt-2"}
                      childClass={"col-span-2"}
                      span={2}
                      lock
                    >
                      <Input
                        placeholder="---"
                        value={
                          caseDetails.workorder[0].materialorder[0].owner.Name
                        }
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        readOnly
                      />
                    </CaseField>
                  )}

                  <CaseField
                    label="Case Status"
                    className={"mt-2"}
                    childClass={"col-span-2"}
                    span={2}
                    lock={!canEdit}
                  >
                    <SearchCommandBlock
                      id="case-status"
                      value={
                        STATUS_ENUM_TO_LABEL[caseForm?.CaseStatus] ||
                        "--Select--"
                      }
                      onChange={async (label) => {
                        const enumValue = labelToStatusEnum[label];
                        onChangeCase("CaseStatus")(enumValue || "");
                        const isNewAssign =
                          typeof enumValue === "string" &&
                          enumValue?.startsWith("NEW_Assign");
                        setHideAssignTo(isNewAssign);

                        if (isNewAssign) {
                          const role = extractRoleFromStatus(enumValue);

                          if (role) {
                            try {
                              fetchUserAssign(role);
                            } catch (err) {
                              toast.error("Error fetching role");
                            }
                          }
                        } else {
                          setRoleAssign([]);
                        }
                      }}
                      placeholder="--Select--"
                      options={statusOptions}
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                    />
                  </CaseField>
                  <CaseField
                    label="Assign To"
                    className={"mt-2"}
                    childClass={"col-span-2"}
                    span={2}
                    hide={!hideAssignTo}
                  >
                    <SearchCommandBlock
                      value={caseForm?.Owner}
                      onChange={(selectedID) => {
                        if (!selectedID) {
                          onChangeCase("Owner")(null); // Clear the value!
                          return;
                        }
                        const selectedUser = roleAssign.find(
                          (user) => user.IDUser === selectedID
                        );
                        if (selectedUser) {
                          onChangeCase("Owner")(selectedUser.IDUser);
                        }
                      }}
                      placeholder="--Select--"
                      options={roleAssign.map((user) => ({
                        label: user.Name,
                        value: user.IDUser,
                      }))}
                      renderLabel={(opt) => opt.label}
                      getValue={(opt) => opt.value}
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400 "}
                    />
                  </CaseField>

                  <CaseField
                    label="Case Type"
                    open
                    className={"mt-2"}
                    childClass={"col-span-2"}
                    span={2}
                    lock={!canEditFd}
                  >
                    <SearchCommandBlock
                      id="case-type"
                      value={caseForm?.CaseType}
                      onChange={onChangeCase("CaseType")}
                      placeholder="--Select--"
                      options={["Depot Repair", "Onsite", "Bench", "DOA"]}
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400 "}
                    />
                  </CaseField>

                  <CaseField
                    label="Problem Description"
                    span={3}
                    lock={!canEditFd}
                    childClass={" col-span-3"}
                  >
                    <div className="ml-8 w-full" id="problem-desc">
                      <Textarea
                        value={caseForm?.ProblemDescription}
                        onChange={(e) =>
                          onChangeCase("ProblemDescription")(e.target.value)
                        }
                        className=" ring-1 ring-gray-300 bg-gray-50 italic dark:bg-gray-500/10 dark:border-gray-400"
                        readOnly={!canEditFd}
                      />
                    </div>
                  </CaseField>

                  <CaseField
                    label="Case Priority"
                    className={"mt-2"}
                    childClass={"col-span-2"}
                    span={2}
                    lock={!canEditFd}
                  >

                    <SearchCommandBlock
                      id="case-priority"
                      value={caseForm?.CasePriority}
                      onChange={onChangeCase("CasePriority")}
                      options={[
                        "Same Businnes Day (SBD)",
                        "Next Businnes Days (NBD)",
                        "3 Businnes Days (3BD)",
                      ]}

                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400 "}
                    />
                  </CaseField>

                  <CaseField
                    label="KCI For Case?"
                    childClass={"col-span-2"}
                    span={2}
                    lock
                  >
                    <Input
                      value={caseDetails.KCI_Flag ? "Yes" : "No"}
                      className={"dark:text-white dark:border-gray-400  dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  <CaseField
                    label="Created ON"
                    childClass={"col-span-2"}
                    span={2}
                    lock
                  >
                    <DatePicker
                      variant="icon"
                      value={createdOn}
                    ></DatePicker>
                  </CaseField>

                  <CaseField
                    label="Case Closed Date"
                    childClass={"col-span-2"}
                    span={2}
                    lock
                  >
                    <DatePicker
                      variant="icon"
                      value={caseClosedDate}
                    ></DatePicker>
                  </CaseField>

                  <Accordion type="single" collapsible className=" col-span-3">
                    <AccordionItem value="more-details" className="pl-5">
                      <AccordionTrigger
                        className={
                          "decoration-transparent border-1 p-2 cursor-pointer"
                        }
                      >
                        More Details . . .
                      </AccordionTrigger>
                      <AccordionContent className={"m-1"}>
                        <div className="grid grid-cols-2  gap-4">
                          <CaseField
                            lock
                            label="Incoming Channel"
                            className={"mt-2"}
                          >
                            <Input
                              className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={caseDetails.IncomingChannel}
                            />
                          </CaseField>
                          <CaseField lock label="Submitted To Base">
                            <span className="gap-[5em]">
                              <DatePicker
                                variant="icon"
                              ></DatePicker>
                            </span>
                          </CaseField>
                          <CaseField lock label="Customer Severity">
                            <Input
                              className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={caseDetails.CustomerSeverity}
                            />
                          </CaseField>
                          <CaseField lock label="Business Segment">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>

                          <CaseField lock label="HPI Segment">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>

                          <CaseField lock label="Customer Tracking Number">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>

                          <CaseField
                            lock
                            label="Update Customer Tracking Number"
                          >
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField
                            lock
                            label="Alternate Customer Tracking Number"
                          >
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>

                          <CaseField lock label="Irrelevant">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>

                          <CaseField lock label="Email Status">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>

                          <CaseField label="Case ID" lock className={"hidden"}>
                            <Input
                              className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
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

              <Card className="flex-col dark:bg-gradient-to-tr dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                <CardHeader>
                  <CardTitle className="text-lg flex gap-3">
                    <Contact />
                    Customer Information
                  </CardTitle>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent className="grid items-center grid-cols-2 gap-3">
                  <CaseField label="Customer Account" lock>
                    <Input
                      value={
                        customerData?.Type == "SiteAccount"
                          ? customerData?.SiteAccount?.Company
                          : customerData?.MainAccount?.FirstName &&
                            customerData?.MainAccount?.LastName
                          ? customerData?.MainAccount?.FirstName +
                            " " +
                            customerData?.MainAccount?.LastName
                          : "---"
                      }
                      readOnly
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  <CaseField label="Primary Contact" lock>
                    <Input
                      value={
                        customerData.MainAccount?.Salutation &&
                        customerData.MainAccount?.FirstName &&
                        customerData.MainAccount?.LastName
                          ? `${customerData.MainAccount?.Salutation} ${customerData.MainAccount?.FirstName} ${customerData.MainAccount?.LastName}`
                          : customerData.MainAccount?.FirstName &&
                            customerData.MainAccount?.LastName
                          ? `${customerData.MainAccount?.FirstName} ${customerData.MainAccount?.LastName}`
                          : "---"
                      }
                      readOnly
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  <CaseField label="Secondary Contact" lock>
                    <Input  placeholder="---" className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                  </CaseField>
                  <CaseField label=" Primary Email" lock>
                    <Input
                      value={
                        customerData.MainAccount?.Email
                          ? customerData.MainAccount?.Email
                          : "---"
                      }
                      placeholder="---"
                      readOnly
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  <CaseField label="Country" lock>
                    <Input
                      value={
                        customerData?.Type == "SiteAccount"
                          ? customerData?.SiteAccount?.Country
                          : customerData?.MainAccount?.Country
                          ? customerData?.MainAccount?.Country
                          : "---"
                      }
                      readOnly
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  <CaseField label="Phone" lock>
                    <Input
                      value={customerData?.Type == "SiteAccount"
                        ? customerData?.SiteAccount?.PrimaryPhone
                        : customerData?.MainAccount?.Phone
                        ? customerData?.MainAccount?.Phone
                        : "---"}
                        readOnly
                        className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  <CaseField label="Region" lock>
                    <Input
                      placeholder="---"
                      value={
                        customerData?.Type == "SiteAccount"
                          ? customerData?.SiteAccount?.City +
                            " - " +
                            customerData?.SiteAccount?.StateProvince
                          : customerData?.MainAccount?.City &&
                            customerData?.MainAccount?.StateProvince
                          ? customerData?.MainAccount?.City +
                            " - " +
                            customerData?.MainAccount?.StateProvince
                          : "---"
                      }
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                    />
                  </CaseField>
                  <CaseField label="Is Partner" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>
                  <CaseField label="Partner & Customer" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>
                  <CaseField label="PIC Name" lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      value={customerData.MainAccount?.PIC_Name}
                    />
                  </CaseField>
                  <CaseField label="PIC Email" lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      value={customerData.MainAccount?.PIC_Email}
                    />
                  </CaseField>
                  <CaseField label="PIC Phone no." lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      value={customerData.MainAccount?.PIC_Phone}
                    />
                  </CaseField>
                  <CaseField label="NPWP" lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      value={customerData.SiteAccount?.NPWP}
                    />
                  </CaseField>

                  <Accordion type="single" collapsible className="col-span-2">
                    <AccordionItem value="more-details" className={"pl-5 "}>
                      <AccordionTrigger
                        className={
                          "decoration-transparent border p-2 cursor-pointer"
                        }
                      >
                        More Details . . .
                      </AccordionTrigger>
                      <AccordionContent className="m-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                          <CaseField lock label="Submitted By">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField lock label="HIPAA">
                            <Input
                              className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              placeholder="---"
                              readOnly
                            />
                          </CaseField>
                          <CaseField lock label="PIN">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField lock label="Parent Company">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField lock label="Parent Company Non-Latin">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField lock label="Customer Time Zone">
                            <Input
                              className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              placeholder="---"
                              readOnly
                            />
                          </CaseField>
                          <CaseField lock label="Account Tier">
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>  
              </Card>
            </div>
            {/* --- Card 1: Customer Issue & System Info --- */}

            <Card className="flex-col dark:bg-gradient-to-l dark:from-slate-800 dark:via-slate-600 dark:to-slate-800  dark:border-slate-700 dark:border-4">
              <CardHeader>
                <CardTitle className="text-lg  flex gap-3">
                  <FileSliders />
                  Customer Issue Description & System Information
                </CardTitle>
                <hr className="dark:border-gray-500"/>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                  {/* LEFT COLUMN - Issue Description */}
                  <div className="space-y-6" id="customer-issue">
                    <textarea
                      className={cn(
                        "w-full h-48 resize-none border rounded-md p-3 text-sm ring-1 ring-gray-300 bg-gray-50 dark:bg-gray-500/10 dark:border-gray-400",
                        !canEditFd && "cursor-not-allowed"
                      )}
                      value={caseForm?.CaseProductNote}
                      onChange={(e) =>
                        onChangeCase("CaseProductNote")(e.target.value)
                      }
                      disabled={!canEditFd}
                    />
                  </div>
                  {/* RIGHT COLUMN - System Info */}
                  <Accordion type="single" collapsible className="col-span-2">
                    <AccordionItem value="more-details" className={"pl-5 "}>
                      <AccordionTrigger
                        className={
                          "decoration-transparent border p-2 cursor-pointer"
                        }
                      >
                        More Details . . .
                      </AccordionTrigger>
                      <AccordionContent className="m-1">
                        <div className="grid grid-cols-4 gap-6">
                          <CaseField label="Related Device" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Device Manufacturer" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Device Model" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Program / Category" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Operating System" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Version" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Remote Diag Code" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Application Information" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Provider / Platform" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                          <CaseField label="Software Version" lock>
                            <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                          </CaseField>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
            {/* --- Card 2: Case Notes --- */}
            <Card className="dark:bg-radial-[at_50%_20%] dark:from-slate-600 dark:via-slate-800 dark:to-slate-700  dark:border-slate-700 dark:border-4">
              <CardHeader>
                <CardTitle className="text-xl flex gap-2 ">
                  <NotepadText />
                  Log Notes
                </CardTitle>
                <hr className="dark:border-gray-500"/>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-4">
                    <CaseField label="Log Type">

                      <SearchCommandBlock
                        id="log-type"
                        value={caseNoteFormData?.LogType}
                        onChange={(val) => onChangeCaseNote("LogType", val)}
                        options={["Notes Log", "Phone Log"]}
                        placeholder="--Select--"
                        className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400 "}
                      />
                    </CaseField>

                    <CaseField label="Action Type">
                      <SearchCommandBlock
                        id="action-type"
                        value={caseNoteFormData?.ActionType}
                        onChange={(val) => onChangeCaseNote("ActionType", val)}
                        placeholder="--Select--"
                        options={[
                          "Inbound Customer call",
                          "Action Plan",
                          "Administrative task",
                          "CE/Partner Assist",
                          "Customer Email",
                        ]}
                        className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400 "}
                      />
                    </CaseField>

                    <CaseField label="Notes" star>
                      <textarea
                        id="notes"
                        className="w-full h-full min-h-[100px] resize-none border rounded-md p-3 text-sm ring-1 ring-gray-300 shadow-sm dark:bg-gray-500/10 dark:border-gray-400"
                        value={caseNoteFormData?.Note || ""}
                        onChange={(e) =>
                          onChangeCaseNote("Note", e.target.value)
                        }
                        placeholder="Write your note"
                      />
                    </CaseField>
                  </div>
                  <div className="w-full overflow-auto rounded-2xl shadow-xl dark:bg-slate-900/90 dark:border-slate-700">
                    <Table>
                      <TableHeader className={"bg-slate-300 dark:bg-slate-700/90"}>
                        <TableRow>
                          <TableHead>Created On</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Log Type</TableHead>
                          <TableHead>Action Type</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Note</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(notesList) && notesList.length > 0 ? (
                          notesList.map((n, i) => (
                            <TableRow key={n.NoteID} className={cn(
                                              "hover:bg-blue-50/70 dark:hover:bg-slate-700",
                                              i % 2 === 0
                                                ? "bg-white dark:bg-slate-900"
                                                : "bg-gray-50 dark:bg-slate-800/80"
                                             )}>
                              <TableCell>
                                {n.CreatedOn
                                  ? format(
                                      new Date(n.CreatedOn),
                                      "yyyy-MM-dd HH:mm"
                                    )
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {n.createdByUser?.Name || n.CreatedBy || "-"}
                              </TableCell>
                              <TableCell>{n.LogType || "-"}</TableCell>
                              <TableCell>{n.ActionType || "-"}</TableCell>
                              <TableCell>
                                {n.createdByUser?.Role || "-"}
                              </TableCell>
                              <TableCell
                                colSpan="3"
                                className="whitespace-pre-wrap max-w-xl"
                              >
                                {parseNoteText(n.Note)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-sm text-gray-500"
                            >
                              No notes yet
                            </TableCell>
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
              <Card className="flex-col dark:bg-radial-[at_30%_80%] dark:from-slate-500 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4">
                <CardHeader>
                  <CardTitle className="text-lg ">Asset Information</CardTitle>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                  <CaseField
                    label="Category Warranty"
                    lock
                    className={"whitespace-break-spaces"}
                  >
                    <Input
                      value={
                        WarrantyConditionEnumToLabel[
                          assetInformation?.WarrantyOTCCode?.WarrantyCondition
                        ]
                      }
                      className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder={"---"}
                    />
                  </CaseField>
                  <CaseField label="Product Number" lock>
                    <Input
                      value={
                        assetInformation?.product_information?.ProductNumber
                      }
                      className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder={"---"}
                    />
                  </CaseField>
                  <CaseField label="Asset Location" lock={user?.role !== "ps"}>
                    <SearchCommandBlock
                      value={caseForm?.StorageLocationStore}
                      onChange={onChangeCase("StorageLocationStore")}
                      options={OptionStorage}
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400 "}
                    />
                  </CaseField>

                  <CaseField label="Serial Number" lock>
                    <Input
                      value={assetInformation?.SerialNumber}
                      placeholder={"---"}
                      className={"hover:text-blue-600 dark:hover:text-blue-600 dark:hover:cursor-pointer hover:cursor-pointer dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      onClick={() => {
                        const sn = assetInformation?.SerialNumber;
                        if (sn) {
                          window.open(
                            `https://partsurfer.hp.com/?searchtext=${sn}`,
                            "_blank"
                          );
                        }
                      }}
                    />
                  </CaseField>

                  <CaseField label="HPI Segment" lock>
                    <Input
                      value={
                        assetInformation?.product_information?.product_type
                          ?.ProductGroup
                      }
                      className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder={"---"}
                    />
                  </CaseField>

                  <CaseField label="SNIC - Count" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>
                  <CaseField label="Product Name" lock>
                    <Input
                      value={assetInformation?.product_information?.ProductName}
                      className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder={"---"}
                    />
                  </CaseField>

                  <CaseField label="HWPC Code" lock={!canEditCe}>
                    <Input
                      value={productForm?.HWPC}
                      className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      onChange={(e) =>
                        handleProductChange("HWPC")(e.target.value)
                      }
                    />
                  </CaseField>

                  <CaseField label="HW Profit Center" lock>
                    <Input className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                  </CaseField>
                  <div className="grid items-center grid-cols-2 col-span-2 gap-2 p-5 ring-1">
                    <CaseField label="Device Properties" lock>
                      <Input className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                    </CaseField>
                  </div>
                  <CaseField
                    label="Warranty Status"
                    span={3}
                    star
                    className={
                      "whitespace-break-spaces col-span-1 sm:col-span-2 md:col-span-1"
                    }
                    lock={!canEditWarranty}
                  >
                    <SearchCommandBlock
                      options={otcCode}
                      value={entitlementStatus.OTCCode || "--select--"}
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
                  <CaseField
                    lock={
                      !canEditWarranty
                    }
                    label="Need warranty approval?"
                    className={"col-span-1 "}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                  >
                    <SelectYN
                      value={
                        entitlementStatus?.needWarrantyApproval === undefined ||
                        entitlementStatus?.needWarrantyApproval == null 
                          ? "No"
                          : entitlementStatus?.needWarrantyApproval
                          ? "Yes"
                          : "No"
                      }
                      onValueChange={async (val) => {
                        const isNeed = val === "Yes";
                        const userTarget = await ApiCustomer.get(`/api/user?role=apv`)
                        const OwnerApv = userTarget.data.data[0];
                        handleEntitlementStatus("needWarrantyApproval")(isNeed);
                        if (isNeed) {
                          const CmbineOTC = otcCode.find(
                            (otc) =>
                              otc.OTCCode === "01T" &&
                              otc.Description === "Trade (OOW)"
                          );
                          if (CmbineOTC) {
                            handleEntitlementStatus("OTCCode")(
                              CmbineOTC.OTCCode
                            );
                          }
                          onChangeCase("CaseStatus")("NEW_POPDoc");
                          onChangeCase("Owner")(OwnerApv.IDUser);
                        }
                      }}
                      className={"cursor-pointer dark:bg-transparent dark:ring-2 dark:ring-gray-400 dark:rounded-md dark:text-white"}
                    />
                  </CaseField>
                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="Warranty Approval Status"
                    className={"col-span-1"}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                    lock={!canEditWarranty}
                  >
                    <SelectBar
                      options={[
                        { id: 1, name: "Add Info By WA" },
                        { id: 2, name: "Revision To WA" },
                        { id: 3, name: "New"},
                      ]}
                      value={entitlementStatus.WarrantyApprovalStatus}
                      onChange={handleEntitlementStatus(
                        "WarrantyApprovalStatus"
                      )}
                      className={"dark:bg-transparent dark:ring-2 dark:ring-gray-400 dark:rounded-md dark:text-white"}
                    />
                  </CaseField>
                  <CaseField
                    label="Warranty Expiration Date"
                    className={"col-span-1"}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                    lock={!canEditWarranty}
                  >
                    <DatePicker
                      variant="icon"
                      value={entitlementStatus?.EOW_Date}
                      onChange={handleEntitlementStatus("EOW_Date")}
                      readOnly={!canEditWarranty}
                    ></DatePicker>
                  </CaseField>
                 
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
                        {typeof entitlementStatus?.POPDocument === "string" ? (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}${
                              entitlementStatus.POPDocument
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {(entitlementStatus?.POPDocument).split("/").pop()}
                          </a>
                        ) : (
                          <a
                            href={URL.createObjectURL(
                              entitlementStatus.POPDocument
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {entitlementStatus?.POPDocument.name}
                          </a>
                        )}
                        <Input
                          type="file"
                          onChange={(e) =>
                            handleEntitlementStatus("POPDocument")(
                              e.target.files?.[0] || ""
                            )
                          }
                          readOnly={!canEditWarranty}
                          className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        />
                      </div>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleEntitlementStatus("POPDocument")(
                            e.target.files?.[0] || ""
                          )
                        }
                        readOnly={!canEditWarranty}
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    )}
                  </CaseField>

                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="Purchase date"
                    className={"col-span-1"}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                    lock={!canEditWarranty}
                  >
                    <DatePicker
                      variant="icon"
                      value={entitlementStatus?.PurchaseDate}
                      onChange={handleEntitlementStatus("PurchaseDate")}
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
                            href={`${import.meta.env.VITE_API_BASE_URL}${
                              entitlementStatus.WarrantyCard
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {entitlementStatus.WarrantyCard.split("/").pop()}
                          </a>
                        ) : (
                          <a
                            href={URL.createObjectURL(
                              entitlementStatus.WarrantyCard
                            )}
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
                            handleEntitlementStatus("WarrantyCard")(
                              e.target.files?.[0] || ""
                            )
                          }
                          readOnly={!canEditWarranty}
                          className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        />
                      </div>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleEntitlementStatus("WarrantyCard")(
                            e.target.files?.[0] || ""
                          )
                        }
                        readOnly={!canEditWarranty}
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    )}
                  </CaseField>

                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="Warranty Card Date"
                    className={"col-span-1"}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                    lock={!canEditWarranty}
                  >
                    <DatePicker
                      variant="icon"
                      value={entitlementStatus?.WarrantyCardDate}
                      onChange={handleEntitlementStatus("WarrantyCardDate")}
                      readOnly={!canEditWarranty}
                    ></DatePicker>
                  </CaseField>
               
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
                        {typeof entitlementStatus?.PhotoUnit === "string" ? (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}${
                              entitlementStatus?.PhotoUnit
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {(entitlementStatus?.PhotoUnit).split("/").pop()}
                          </a>
                        ) : (
                          <a
                            href={URL.createObjectURL(
                              entitlementStatus.PhotoUnit
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {entitlementStatus?.PhotoUnit.name}
                          </a>
                        )}
                        <Input
                          type="file"
                          onChange={(e) =>
                            handleEntitlementStatus("PhotoUnit")(
                              e.target.files?.[0] || ""
                            )
                          }
                          readOnly={!canEditWarranty}
                          className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        />
                      </div>
                    ) : (
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleEntitlementStatus("PhotoUnit")(
                            e.target.files?.[0] || ""
                          )
                        }
                        readOnly={!canEditWarranty}
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    )}
                  </CaseField>

                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="End User Name"
                    className={"col-span-1"}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                    lock={!canEditWarranty}
                  >
                    <Input
                      value={entitlementStatus.EndUserName}
                      onChange={(e) =>
                        handleEntitlementStatus("EndUserName")(e.target.value)
                      }
                      className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                    />
                  </CaseField>
                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="End User Phone"
                    className={"col-span-1"}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                    lock={!canEditWarranty}
                  >
                    <Input
                      value={entitlementStatus.EndUserPhone}
                      onChange={(e) =>
                        handleEntitlementStatus("EndUserPhone")(e.target.value)
                      }
                      className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                    />
                  </CaseField>
                  <CaseField
                    hide={!entitlementStatus.needWarrantyApproval}
                    label="End User Address"
                    className={"col-span-1"}
                    childClass={"col-span-1 sm:col-span-2 md:col-span-1"}
                    span={2}
                    lock={!canEditWarranty}
                  >
                    <Textarea
                      value={entitlementStatus.EndUserAddress}
                      onChange={(e) =>
                        handleEntitlementStatus("EndUserAddress")(
                          e.target.value
                        )
                      }
                      className={" dark:bg-gray-500/10 dark:border-gray-400"}
                      placeholder="---"
                    />
                  </CaseField>
                </CardContent>
                {/* TABEL ACCESSORY */}
                <div className="px-6 pb-6">
                  <h3 className="text-md font-semibold mb-2">Accessory</h3>
                  <div className="overflow-x-auto">
                    <Table className="min-w-full text-sm ">
                      <TableHeader className="bg-gray-100 text-gray-700 dark:bg-gray-700 ">
                        <TableRow>
                          <TableHead className="px-4 py-2" hidden>
                            No Accesories
                          </TableHead>
                          <TableHead className=" px-4 py-2" hidden>
                            Case ID
                          </TableHead>
                          <TableHead className=" dark:text-white px-4 py-2">Accessories</TableHead>
                          <TableHead className=" dark:text-white px-4 py-2">Note</TableHead>
                          <TableHead className=" dark:text-white px-4 py-2">CT / SN code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caseDetails.accessory?.map((item, index) => (
                          <TableRow key={index} className={cn(
                                            "hover:bg-blue-50/70 dark:hover:bg-slate-700 dark:text-gray-300",
                                            index % 2 === 0
                                              ? "bg-white dark:bg-slate-800"
                                              : "bg-gray-50 dark:bg-slate-700/80"
                                           )}>
                            <TableCell className=" px-4 py-2" hidden>
                              {item.id}
                            </TableCell>
                            <TableCell className=" px-4 py-2" hidden>
                              {item.CaseID}
                            </TableCell>
                            <TableCell className=" px-4 py-2">
                              {item.Accessories}
                            </TableCell>
                            <TableCell className=" px-4 py-2">
                              {item.Note || "---"}
                            </TableCell>
                            <TableCell className=" px-4 py-2">
                              {item.CT_SNCode || "---"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!caseDetails?.accessory ||
                          caseDetails.accessory.length === 0) && (
                          <TableRow>
                            <TableCell
                              className=" px-4 py-2 text-center"
                              colSpan={5}
                            >
                              No accessories found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <div className="mt-2 text-md text-gray-600 dark:text-white">
                      Total Accesories: {caseDetails.accessory?.length || 0}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="flex-col dark:bg-radial-[at_90%_30%] dark:from-slate-500 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4">
                <CardHeader>
                  <CardTitle className="text-lg ">Work Order</CardTitle>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 p-3 ">
                  {/* <div className="grid grid-cols-4 gap-5" hidden>
                    <CaseField label="Incident Type" span={3}>
                      <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                    </CaseField>
                    <CaseField label="Work Order Description" span={3}>
                      <Input className={"dark:text-white dark:border-b-gray-400 mt-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} placeholder="---" />
                    </CaseField>
                  </div> */}

                  <Table className={"max-w-100 "}>
                    <TableHeader >
                      <TableRow>
                        <TableHead className={"dark:text-white"}>Work Order Number</TableHead>
                        <TableHead className={"dark:text-white"}>Case ID</TableHead>
                        <TableHead className={"dark:text-white"}>Service Account</TableHead>
                        <TableHead className={"dark:text-white"}>Sub-Status</TableHead>
                        <TableHead className={"dark:text-white"}>System Status</TableHead>
                        <TableHead className={"dark:text-white"}>Priority</TableHead>
                        <TableHead className={"dark:text-white"}>Work Order</TableHead>
                        <TableHead className={"dark:text-white"}>Primary Incident</TableHead>
                        <TableHead className={"dark:text-white"}>Due Date</TableHead>
                        <TableHead className={"dark:text-white"}>Orion</TableHead>
                        <TableHead className={"dark:text-white"}>Owner</TableHead>
                        <TableHead className={"dark:text-white"}>Created By</TableHead>
                        <TableHead className={"dark:text-white"}>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className={"max-w-100"}>
                      {workOrders.map((work) => (
                        <TableRow
                          key={work.WOID}
                          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-300"
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

                          <TableCell>{work.SubStatus ? work.SubStatus : "-"}</TableCell>
                          <TableCell>
                            {statusEnumToLabelWO[work.SystemStatus]}
                          </TableCell>
                          <TableCell>{work.Priority ? work.Priority : "-"}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>{work.owner?.Name}</TableCell>
                          <TableCell>{work.owner?.Name}</TableCell>
                          <TableCell>{formatDate(work.CreatedOn)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="flex-col dark:bg-radial-[at_40%_10%] dark:from-slate-500 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4">
                <CardHeader>
                  <CardTitle className="text-lg">Material Order</CardTitle>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px] dark:text-white">Name</TableHead>
                        <TableHead className={"dark:text-white"}>Case ID</TableHead>
                        <TableHead className={"dark:text-white"}>Created On</TableHead>
                        <TableHead className={"dark:text-white"}>Order Status</TableHead>
                        <TableHead className={"dark:text-white"}>Order Type</TableHead>
                        <TableHead className={"dark:text-white"}>Owner</TableHead>
                        <TableHead className={"dark:text-white"}>Work Order</TableHead>
                        <TableHead className={"dark:text-white"}>Ready For Closure Date</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {materialOrders.map((material) => (
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
                          <TableCell>{material.owner?.Name}</TableCell>
                          <TableCell>{material.WOID}</TableCell>
                          <TableCell>
                            {formatDate(material.ReadyForClosureDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="action_log">
            <div className="mt-2 p-1 grid grid-cols-2">
              <Card className="flex-col col-span-2 dark:bg-slate-900/90 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Action Log</CardTitle>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader className="dark:bg-slate-800/95">
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
                        [...actionLogs].sort((a,b) => new Date(b.ChangeAt) - new Date(a.ChangeAt))
                        .map((log, index) => (
                          <TableRow key={log.id || index} className={cn(
                                            "hover:bg-blue-50/70 dark:hover:bg-slate-700",
                                            index % 2 === 0
                                              ? "bg-white dark:bg-slate-900"
                                              : "bg-gray-50 dark:bg-slate-800/80"
                                           )}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{log.ReferenceId}</TableCell>
                            <TableCell>{log.model}</TableCell>
                            <TableCell>{log.CaseId}</TableCell>
                            <TableCell>
                              {log.changedByUser?.Role} - {" "}
                              {log.changedByUser?.Name} (
                              {log.changedByUser?.Username})
                            </TableCell>
                            <TableCell>{STATUS_ENUM_TO_LABEL[log.dataOld]}</TableCell>
                            <TableCell>{STATUS_ENUM_TO_LABEL[log.dataNew]}</TableCell>
                            <TableCell>
                              {new Date(log.ChangeAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{log.logDescription}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center italic">
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
              <Card className="dark:bg-gradient-to-l dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:border-gray-700 dark:border-4">
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
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                         className={'cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}
                      >
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
                              {
                                headers: {
                                  "Content-Type": "multipart/form-data",
                                },
                              }
                            );

                            toast.success("Photos uploaded!");
                            setPhotos([]); // reset preview lokal
                          } catch (err) {
                            toast.error(err?.response?.data?.message ?? "Photo upload failed");
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
                      <span className="font-bold italic">
                        Preview New Photos
                      </span>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {photos.map((file, idx) => {
                          const previewUrl = URL.createObjectURL(file);
                          return (
                            <div key={idx} className="relative">
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="border border-black shadow-lg rounded-sm cursor-pointer"
                                onClick={() =>
                                  setSelectedPhotoPreview(previewUrl)
                                } // ⬅️ klik = buka popup zoom
                              />
                              <p className="text-xs truncate mt-1">
                                {file.name}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Foto lama dari server */}
                  <span className="font-bold italic mt-4 block">
                    Uploaded Photos
                  </span>
                  {Array.isArray(caseDetails.casephotos) &&
                  caseDetails.casephotos.length > 0 ? (
                    <CardFooter className="grid grid-cols-3 gap-3 mt-2">
                      {caseDetails.casephotos.map((photo) => (
                        <img
                          key={photo.id}
                          src={`${import.meta.env.VITE_API_BASE_URL}${
                            photo.url
                          }`}
                          alt={`Photo ${photo.id}`}
                          className="border border-black shadow-lg rounded-sm cursor-pointer hover:opacity-80 transition"
                          onClick={() => setSelectedPhoto(photo)} // klik -> buka modal
                        />
                      ))}
                    </CardFooter>
                  ) : (
                    <p className="italic text-sm text-gray-500">
                      Belum ada foto yang diupload
                    </p>
                  )}

                  {/* 🪄 Popup Zoom Modal */}
                  {selectedPhoto && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                      onClick={() => setSelectedPhoto(null)} // klik luar area untuk close
                    >
                      <div className="relative max-w-4xl max-h-[90vh] p-2">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${
                            selectedPhoto.url
                          }`}
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
              <Card className={"flex-col col-span-2 dark:bg-radial-[at_30%_80%] dark:from-slate-600 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4"}>
                <CardHeader>
                  <CardTitle className={"text-lg"}>
                    Quotation Information
                  </CardTitle>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent className={"flex flex-col gap-4"}>
                  <div className="grid grid-cols-2 border-2 p-2 rounded-sm gap-2 dark:border-gray-500 ">
                    <CaseField label={"Quotation no"} lock>
                      <Input
                        value={
                          caseDetails.workorder[0]?.materialorder[0]
                            ?.materialorderlineitems[0]?.quotation_lineitem[0]
                            ?.QuotationNo || "---"
                        }
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                    <CaseField label={"Quotation type"} lock>
                      <Input
                        value={
                          caseDetails.workorder[0]?.materialorder[0]
                            ?.materialorderlineitems[0]?.quotation_lineitem[0]
                            ?.quotation?.QuotationType || "---"
                        }
                         className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                    <CaseField label={"Labor Fee"} lock> 
                      <Input 
                        value={formatAccountingRupiah(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.LaborFee)}
                         className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                    <CaseField label={"Quotation amount"} lock>
                      <Input
                        value={formatAccountingRupiah(
                          caseDetails.workorder[0]?.materialorder[0]
                            ?.materialorderlineitems[0]?.quotation_lineitem[0]
                            ?.quotation?.Subtotal
                        )}
                         className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                    <CaseField label={"VAT value (%)"} lock>
                      <Input
                        value={
                          caseDetails.workorder[0]?.materialorder[0]
                            ?.materialorderlineitems[0]?.quotation_lineitem[0]
                            ?.quotation?.VatValue
                            ? caseDetails.workorder[0]?.materialorder[0]
                                ?.materialorderlineitems[0]
                                ?.quotation_lineitem[0]?.quotation?.VatValue +
                              "%"
                            : "---"
                        }
                         className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                    <CaseField label={"Quotation amount + VAT"} lock>
                      <Input
                        value={formatAccountingRupiah(
                          caseDetails.workorder[0]?.materialorder[0]
                            ?.materialorderlineitems[0]?.quotation_lineitem[0]
                            ?.quotation?.GrandTotal
                        )}
                         className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                    <CaseField label={"Quotation Request date"} lock>
                      <DatePicker
                        value={
                          new Date(
                            caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.QuotationDate
                          )
                        }
                        
                      />
                    </CaseField>
                    {caseDetails.workorder[0]?.materialorder[0]
                      ?.materialorderlineitems[0]?.quotation_lineitem[0]
                      ?.quotation?.QuotationApprovedDate !== null && (
                      <CaseField label={"Quotation Response date"} lock>
                        <DatePicker
                          value={
                            new Date(
                              caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.QuotationApprovedDate
                            )
                          }
                        />
                      </CaseField>
                    )}
                    <CaseField label={"Quote decision"} lock>
                      <Input
                        value={
                          caseDetails.workorder[0]?.materialorder[0]
                            ?.materialorderlineitems[0]?.quotation_lineitem[0]
                            ?.quotation?.QuoteDecision || "---"
                        }
                         className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      />
                    </CaseField>
                  </div>
                  <div className="grid grid-cols-2 border-2 p-2 rounded-sm gap-2 dark:border-gray-500">
                    {caseDetails.workorder[0]?.materialorder.map((quo, i) => (
                      <div key={quo.MOID}>
                        <span className="font-bold">Sparepart {i + 1}</span>
                        <div className="grid grid-cols-2">
                          <CaseField label={"Vendor part no"} lock>
                            <Input value={"-"} className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                          </CaseField>
                          <CaseField label={"HP part no"} lock>
                            <Input
                              className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={quo.materialorderlineitems[0]?.PartNumber}
                            />
                          </CaseField>
                          <CaseField label={"Part name"} lock>
                            <Input
                            className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={quo.materialorderlineitems[0]?.Description}
                            />
                          </CaseField>
                          <CaseField label={"QTY"} lock>
                            <Input
                            className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={quo.materialorderlineitems[0]?.Quantity}
                            />
                          </CaseField>
                          <CaseField label={"Price"} lock>
                              <Input
                              className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                                value={formatAccountingRupiah(quo.materialorderlineitems[0]?.Price)}
                              />
                           </CaseField>
                          <CaseField label={"Part category"} lock>
                            <Input
                            className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={
                                quo.materialorderlineitems[0]
                                  ?.servicecatalog_parts?.Keyword
                              }
                            />
                          </CaseField>
                          <CaseField label={"Part approved"} lock>
                            <Input
                            className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={
                                quo.materialorderlineitems[0]
                                  ?.quotation_lineitem[0]?.Approved === true
                                  ? "Yes"
                                  : "No"
                              }
                            />
                          </CaseField>
                          <CaseField label={"Bad CT code"} lock>
                            <Input
                            className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                              value={
                                quo.materialorderlineitems[0]?.RemovedPartNumber
                              }
                            />
                          </CaseField>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={"flex-col col-span-2 dark:bg-radial-[at_70%_20%] dark:from-slate-600 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4"}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={"text-lg"}>
                      Invoice Information
                    </CardTitle>
                    <Button
                      className={'cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}
                      size="sm"
                      variant="outline"
                      onClick={() => handleInvoiceOpenChange(true)}
                      disabled={
                        invoiceLoading || caseDetails?.CaseStatus === "Close"
                      }
                    >
                      {invoiceSummary ? "Edit Invoice" : "Buat Invoice"}
                    </Button>
                  </div>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>
                <CardContent>
                  
                  {invoiceLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Memuat data invoice...
                    </p>
                  ) : invoiceSummary ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <CaseField label={"Quotation No"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={invoiceQuotation?.quotationNo || "-"}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Invoice No"} lock>
                        <Input value={invoiceSummary.invoiceNo} readOnly className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                      </CaseField>
                       <CaseField label={"Total Harga Sparepart"} lock>
                        {
                        caseDetails.workorder[0]?.materialorder.map((mo) =>{
                          const quoLineItemPrice = mo.materialorderlineitems[0]?.quotation_lineitem[0]?.Price;
                          totalquoLineItemPrice += Number(quoLineItemPrice);

                        })}
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(totalquoLineItemPrice)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Labor Fee"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.LaborFee)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Subtotal"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(
                            invoiceQuotation?.subtotal
                          )}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"VAT value (%)"} lock> 
                        <Input 
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.VatValue 
                            ? caseDetails.workorder[0]?.materialorder[0]?.materialorderlineitems[0]?.quotation_lineitem[0]?.quotation?.VatValue + "%" 
                            : "---"}
                        />
                      </CaseField>
                        
                      <CaseField label={"Total + VAT"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(
                            invoiceQuotation.grandTotal
                          )}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"DP"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(totalDpAmount)}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Balance Due"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(
                            grandTotalNumber
                          )}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Amount Receive"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(
                            invoiceSummary.amountReceive
                          )}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Amount Difference"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={formatAccountingRupiah(
                            invoiceSummary.amountDiff
                          )}
                          readOnly
                        />
                      </CaseField>
                      <CaseField
                        label={"Amount Difference Reason"}
                        lock
                        hide={!invoiceSummary.amountDiffReason}
                      >
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={invoiceSummary.amountDiffReason || "-"}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Payment Type"} lock>
                        <Input
                        className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={invoiceSummary.paymentType || "-"}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Tanggal Terima"} lock>
                        <DatePicker
                          value={DatePickertoDateOrNull(
                            invoiceSummary.amountReceiveDate
                          )}
                          readOnly
                        />
                      </CaseField>
                      <CaseField label={"Notifikasi"} lock>
                        <Input className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={invoiceNotificationLabel} readOnly />
                      </CaseField>
                      <CaseField label={"Catatan"} lock span={2}>
                        <Textarea
                          value={invoiceSummary.amountReceiveNote || "-"}
                          rows={3}
                          readOnly
                          className="ring-1 mt-2 ring-gray-300 bg-gray-50 italic dark:bg-gray-500/10 dark:border-gray-400"
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

              <Card className="flex-col col-span-2 dark:bg-radial-[at_70%_20%] dark:from-slate-600 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">DP Information</CardTitle>
                    <Button
                      className={'cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}
                      size="sm"
                      variant="outline"
                      onClick={addDpRow} // ✅ only in handler
                      disabled={caseDetails?.CaseStatus === "Close"}
                    >
                      Tambah DP
                    </Button>
                  </div>
                  <hr className="dark:border-gray-500"/>
                </CardHeader>

                <CardContent className="space-y-3 ">
                  {dpList.length > 0 ? dpList.map((row) => (
                    <Card key={`${row.tempId}-${row.DpDate}`} className={"border shadow-sm dark:bg-radial-[at_70%_20%] dark:from-slate-600 dark:via-slate-800 dark:to-slate-700 dark:border-gray-700 dark:border-4", row.isPersisted && "shadow-sm shadow-gray-200 bg-gray-200"}>
                      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
                        <CardTitle className="text-sm font-semibold">
                          Invoice No: {row.InvoiceNo || "-"}
                        </CardTitle>
                        {!row.isPersisted && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeDpRow(row.tempId)}
                          >
                            ✕
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3 px-4 pb-4 ">
                        <CaseField label="DP Amount" lock={row.isPersisted}>
                          <Input
                            value={row.DpAmount}
                            onChange={(e) =>
                              setDpField(row.tempId, "DpAmount", e.target.value)
                            }
                            className={"dark:text-white dark:border-b-gray-400  dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          />
                        </CaseField>

                        <CaseField label="Payment Date" lock={row.isPersisted} >
                          <DatePicker
                            value={DatePickertoDateOrNull(row.DpDate)}
                            onChange={(e) =>
                              setDpField(row.tempId, "DpDate", e)
                            }
                          />
                        </CaseField>

                        <CaseField label="Payment Type" lock={row.isPersisted} >
                          <SearchCommandBlock
                            value={row.PaymentType}
                            onChange={(val) =>
                              setDpField(row.tempId, "PaymentType", val)
                            }
                            placeholder="Pilih metode..."
                            options={[
                              { label: "Transfer", value: "Transfer" },
                              { label: "Cash", value: "Cash" },
                              { label: "Debit", value: "Debit" },
                              { label: "VA", value: "VA" },
                            ]}
                          />
                        </CaseField>

                        <CaseField label="DP Note" span={2} lock={row.isPersisted} >
                          <Textarea
                            value={row.DpNote}
                            onChange={(e) =>
                              setDpField(row.tempId, "DpNote", e.target.value)
                            }
                            className=" border-none italic ring-1 ring-gray-400 bg-gray-50 text-base dark:bg-gray-500/10 dark:border-gray-400"
                          />
                        </CaseField>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <p>Belum ada DP untuk case ini.</p>
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

