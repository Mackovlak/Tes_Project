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
import { SelectBarRelated } from "../sc-select";
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
  KeyRound,
  BookmarkCheck,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import Swal from "sweetalert2";
import { BtnModalsServiceCatalog } from "../model/sc-modal";
import DatePicker from "../date-picker";

import ApiCustomer from "@/api";



const partsorder = [
  {
    name: "Budiono",
    orderstatus: "-",
    workorder: "-",
    customerselfrepair: "-",
    owner: "Budiono",
    createdon: "W-",
    ordercloseddate: "-",
    createdby: "-",
  },
];

const spanMap = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
};

export const TabsService = ({ caseDetails }) => {
  const navigate = useNavigate();
  const [openWorkOrder, setOpenWorkOrder] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);

  const { open } = useSidebar();

  //casenote
  const [caseNoteFormData, setCaseNoteFormData] = useState({
    LogType: "",
    ActionType: "",
    Template: "",
    VisibleExternally: null,
    MinutesSpent: 0,
    Note: "",
  });

  const handleCaseNoteChange = (key, value) => {
    setCaseNoteFormData((prev) => {
      const updated = { ...prev, [key]: value };
      console.log(" Updated Form:", updated); // Log on every change
      return updated;
    });
  };
  const saveCaseNote = async () => {
    console.log(" Form Data to Submit:", caseNoteFormData); // Log the form data
    try {
      const response = await ApiCustomer.post(
        "/api/case-information/case-notes",
        {
          ...caseNoteFormData,
          CaseID: caseDetails.CaseID,
        }
      );
      console.log("Saved successfully:", response.data);
      alert("Case Note Saved!");
      setCaseNotes({
        NotesDisplay: response.data.data.Note,
      });
      console.log("Case Notes Infor after save : ", caseNotes);
      console.log("Case Notes Display Infor after save : ", response);

      let dataUpdated = {
        CaseNote: response.data.data.NoteID,
      };
      //symptom code
      if (selectedSymptom) {
        dataUpdated.SymptomCode = selectedSymptom.SymptomCodeID;
      }
      await ApiCustomer.patch(
        `/api/case-information/${caseDetails.CaseID}`,
        dataUpdated
      );
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save note.");
    }
  };

  const checkOrCreateNote = async () => {
    const existing = await ApiCustomer.get(
      `/api/case-information/case-notes?caseId=${caseDetails.CaseID}`
    );

    if (existing.data.data.length > 0) {
      const noteID = existing.data.data[0].NoteID;
      await ApiCustomer.patch(`/api/case-information/case-notes/${noteID}`, {
        ...caseNoteFormData,
        Note: existing.data.data[0].Note + "\n" + caseNoteFormData.Note,
      });
    } else {
      await ApiCustomer.post("/api/case-information/case-notes", {
        ...caseNoteFormData,
        CaseID: caseDetails.CaseID,
      });
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
            ActionType: "Initial",
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

      console.log(" Case Note Detail:", noteDetail);
      return noteDetail;
    } catch (err) {
      console.error("Error in fetchCaseNotes:", err);
      return null;
    }
  };

  const fetchSymptomCodes = async () => {
    try {
      const res = await ApiCustomer.get(
        `/api/case-information/${caseDetails.CaseID}`
      );
      const caseData = res.data.data;
      const symptomCode = caseData.SymptomCode;

      const resSymptomCode = await ApiCustomer.get(
        `/api/case-information/symptom-codes/${symptomCode}`
      );
      return resSymptomCode.data.data;
    } catch (err) {
      console.error("Error in fetchSymptomCodes:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadNote = async () => {
      const noteDetail = await fetchCaseNotes();
      if (noteDetail) {
        setCaseNotes({
          NotesDisplay: noteDetail.Note,
        });
      }
      const symptomCodeDetail = await fetchSymptomCodes();
      if (symptomCodeDetail) {
        setSelectedSymptom({
          TopCategory: symptomCodeDetail.TopCategory,
          SubCategory: symptomCodeDetail.SubCategory,
          SymptomCode: symptomCodeDetail.SymptomCode,
        });
      }
    };
    loadNote();
  }, []);

  const [caseNotes, setCaseNotes] = useState([]);

  const buttons = [
    {
      icon: ArrowLeftFromLine,
      label: "",
      onClick: () => navigate(`/app/master/Case_table`),
    },
    { icon: SquareArrowOutUpRight, label: "", onClick: () => alert("not now") },
    { icon: Save, label: "Save", onClick: () => saveCaseNote() },
    {
      icon: FileSymlink,
      label: "Save & Close",
      onClick: () => saveAndCloseCase(),
    },
    { icon: RotateCw, label: "Refresh", onClick: () => refresh() },
    { icon: StepBack, label: "Complaint", onClick: () => alert("not now") },
    { icon: StepBack, label: "CSR", onClick: () => alert("not now") },
    { icon: StepBack, label: "Service Order", onClick: () => alert("not now") },
    {
      icon: StepBack,
      label: "Work Order",
      onClick: () => setOpenWorkOrder(true),
    },
    { icon: StepBack, label: "Sales Offer", onClick: () => alert("not now") },
    { icon: StepBack, label: "Close Case", onClick: () => alert("not now") },
    { icon: StepBack, label: "Pick", onClick: () => alert("not now") },
    { icon: StepBack, label: "Queue Details", onClick: () => alert("not now") },
    { icon: UserPen, label: "Assign", onClick: () => alert("not now") },
    { icon: StepBack, label: "Add to Queue", onClick: () => alert("not now") },
  ];
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];

  const saveAndCloseCase = async () => {
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
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const res = await ApiCustomer.patch(
        `/api/case-information/${caseDetails.CaseID}`,
        {
          CaseStatus: "Close",
        }
      );
      if (res.data.success) {
     
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: res.data.message,
          timer: 2000,
          showConfirmButton: false,
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

  const refresh = async () => {
    try {
      Swal.fire({
        title: "Refreshing...",
        text: "Please wait while we refresh the data.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setTimeout(() => {
        location.reload();
      }, 1500); 
    } catch (err) {
      console.error("Error in refresh:", err);
    }
  };

  return (
    <>
      <div className="border-1 flex items-center ">
        {visibleButtons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="h-4 w-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}

        {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 rounded-md bg-gray-200">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="h-4 w-4 inline-block mr-2" />
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
        />
      </div>
      <div>
        <ServiceCase
          caseDetails={caseDetails}
          formData={caseNoteFormData}
          onChange={handleCaseNoteChange}
          caseNotes={caseNotes}
          setCaseNotes={setCaseNotes}
          selectedSymptom={selectedSymptom}
          setSelectedSymptom={setSelectedSymptom}
        />
      </div>
    </>
  );
};

export const CaseField = ({ label, children, icon, span = 1, className }) => (
  <>
    <CardTitle
      className={twMerge(
        `relative font-medium flex items-center`,
        icon ? "pl-6" : "",
        className
      )}
    >
      {icon && (
        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      )}
      {label}
    </CardTitle>

    <CardTitle className={spanMap[span]}>{children}</CardTitle>
  </>
);

export const TabsServiceWO = ({ workOrders }) => {
  const navigate = useNavigate();
  const buttons = [
    {
      icon: ArrowLeftFromLine,
      label: "",
      onClick: () => navigate(`/app/case/${workOrders.CaseID}`),
    },
    { icon: SquareArrowOutUpRight, label: "", onClick: () => alert("not now") },
    { icon: Save, label: "Save", onClick: () => saveCaseNote() },
    {
      icon: FileSymlink,
      label: "Save & Close",
      onClick: () => saveAndCloseWorkOrder(),
    },
    { icon: RotateCw, label: "Book", onClick: () => alert("not now") },
    { icon: StepBack, label: "Audit", onClick: () => alert("not now") },
    { icon: StepBack, label: "Pick", onClick: () => alert("not now") },
    { icon: StepBack, label: "Geo Code", onClick: () => alert("not now") },
    { icon: StepBack, label: "Refresh", onClick: () => refresh() },
    { icon: StepBack, label: "Process", onClick: () => alert("not now") },
    { icon: StepBack, label: "Reset RDT", onClick: () => alert("not now") },
    { icon: StepBack, label: "Add To Queue", onClick: () => alert("not now") },
    {
      icon: UserPen,
      label: "Create Material Order",
      onClick: () => alert("not now"),
    },
    { icon: StepBack, label: "Show Alerts", onClick: () => alert("not now") },
  ];
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];
  const saveAndCloseWorkOrder = async () => {
    const confirmResult = await Swal.fire({
      title: "Confirm Save",
      text: "This will give the order status as CLOSED. Are you sure you want to save changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save it",
    });

    if (!confirmResult.isConfirmed) {
      return; // User canceled
    }
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update the Work Order.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const res = await ApiCustomer.patch(
        `/api/work-order/${workOrders.WOID}`,
        {
          SystemStatus: "CLOSED_POSTED",
        }
      );
      if (res.data.success) {
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

  const refresh = async () => {
    try {
      Swal.fire({
        title: "Refreshing...",
        text: "Please wait while we refresh the data.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setTimeout(() => {
        location.reload();
      }, 1500); 
    } catch (err) {
      console.error("Error in refresh:", err);
    }
  };
  return (
    <>
      <div className="border-1 flex items-center ">
        {visibleButtons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="h-4 w-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}

        {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 rounded-md bg-gray-200">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="h-4 w-4 inline-block mr-2" />
                  {btn.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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

export const TabsServiceMO = ({ materialOrders }) => {
  const navigate = useNavigate();
  const buttons = [
    {
      icon: ArrowLeftFromLine,
      label: "",
      onClick: () => navigate(`/app/work/${materialOrders.WOID}`),
    },
    { icon: SquareArrowOutUpRight, label: "", onClick: () => alert("not now") },
    { icon: Save, label: "Save", onClick: () => saveCaseNote() },
    {
      icon: FileSymlink,
      label: "Save & Close",
      onClick: () => saveAndCloseMaterialOrder(),
    },
    { icon: RotateCw, label: "ATP", onClick: () => alert("not now") },
    { icon: StepBack, label: "Cancel Order", onClick: () => alert("not now") },
    { icon: StepBack, label: "Add To Queue", onClick: () => alert("not now") },
    { icon: StepBack, label: "Add Parts", onClick: () => alert("not now") },
    { icon: StepBack, label: "Pick", onClick: () => alert("not now") },
    { icon: StepBack, label: "Place Order", onClick: () => alert("not now") },
    { icon: StepBack, label: "Tax", onClick: () => alert("not now") },
    { icon: StepBack, label: "CustID Search", onClick: () => alert("not now") },
    { icon: UserPen, label: "PUDO Search", onClick: () => alert("not now") },
    { icon: StepBack, label: "Audit", onClick: () => alert("not now") },
  ];
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];
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
      const res = await ApiCustomer.patch(
        `/api/material-order/${materialOrders.MOID}`,
        {
          OrderStatus: "Closed",
        }
      );
      if (res.data.success) {
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
      <div className="border-1 flex items-center ">
        {visibleButtons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="h-4 w-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}

        {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 rounded-md bg-gray-200">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="h-4 w-4 inline-block mr-2" />
                  {btn.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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

export const TabsServiceMOLineItems = ({ MOLineDetails }) => {
  const navigate = useNavigate();
  const buttons = [
    {
      icon: ArrowLeftFromLine,
      label: "",
      onClick: () => navigate(`/app/material-order/${MOLineDetails.MOID}`),
    },
    { icon: SquareArrowOutUpRight, label: "", onClick: () => alert("not now"),hidden: true },
    { icon: Save, label: "Save", onClick: () => saveCaseNote() },
    {
      icon: FileSymlink,
      label: "Save & Close",
      onClick: () => saveAndCloseMaterialLineItemsOrder(),
    },
    { icon: StepBack, label: "Cancel", onClick: () => alert("not now") },
    { icon: StepBack, label: "Audit", onClick: () => alert("not now") },
    { icon: RotateCw, label: "Assign", onClick: () => alert("not now") },
    {
      icon: StepBack,
      label: "Word Templates",
      onClick: () => alert("not now"),
    },
    { icon: StepBack, label: "Run Report", onClick: () => alert("not now") },
    { icon: StepBack, label: "Geo Code", onClick: () => alert("not now") },
    { icon: StepBack, label: "Process", onClick: () => alert("not now") },
    { icon: StepBack, label: "Reset RDT", onClick: () => alert("not now") },
    // { icon: UserPen, label:  "Add To Queue", onClick: () => alert("not now") },
    // { icon: StepBack, label: "Audit", onClick: () => alert("not now") },
  ];
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];

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
      const res = await ApiCustomer.patch(
        `/api/material-order/material-order-line-items/${MOLineDetails.LineItemID}`,
        {
          Status: "Closed",
        }
      );
      if (res.data.success) {
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
      <div className="border-1 flex items-center ">
        {visibleButtons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="h-4 w-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}

        {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 rounded-md bg-gray-200">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="h-4 w-4 inline-block mr-2" />
                  {btn.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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

export const TabsBooking = ({
  handleUpdate,
  bookingData,
  handleComplete,
}) => {

  const navigate = useNavigate();   

  const buttons = [
    { icon: ArrowLeftFromLine, label: "", onClick: () => navigate(`/app/work/${bookingData.WOID}`) },
    { icon: SquareArrowOutUpRight, label: "", onClick: () => alert("not now"), hidden: true },
    { icon: Save, label: "Save", onClick: () => handleUpdate() },
    { icon: RotateCw, label: "Refresh", onClick: () => refresh() },
    { icon: BookmarkCheck, label: "Mark Completed", onClick: () => handleComplete() },
    { icon: StepBack, label: "Audit", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Pick", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Geo Code", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Process", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Reset RDT", onClick: () => alert("not now"), hidden: true },
    { icon: StepBack, label: "Add To Queue", onClick: () => alert("not now"), hidden: true },
    {
      icon: UserPen,
      label: "Create Material Order",
      onClick: () => alert("not now"), hidden: true
    },
    { icon: StepBack, label: "Show Alerts", onClick: () => alert("not now"), hidden: true },
  ];
  const visibleButtons = open ? buttons.slice(0, -3) : buttons;
  const hiddenButtons = open ? buttons.slice(-3) : [];

  /**
   * NOTE WARNING : SOMETIMES THIS RUN AND AFFECTED THE WO
   * FIND OUT WHY
   * NOW COMMENTED
   */
  // const saveAndCloseWorkOrder = async () => {
  //   const confirmResult = await Swal.fire({
  //     title: "Confirm Save",
  //     text: "This will give the order status as CLOSED. Are you sure you want to save changes?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, Save it",
  //   });

  //   if (!confirmResult.isConfirmed) {
  //     return; // User canceled
  //   }
  //   try {
  //     Swal.fire({
  //       title: "Saving...",
  //       text: "Please wait while we update the Work Order.",
  //       allowOutsideClick: false,
  //       didOpen: () => {
  //         Swal.showLoading();
  //       },
  //     });
  //     const res = await ApiCustomer.patch(
  //       `/api/work-order/${workOrders.WOID}`,
  //       {
  //         SystemStatus: "CLOSED_POSTED",
  //       }
  //     );
  //     if (res.data.success) {
  //       // Success alert
  //       Swal.fire({
  //         icon: "success",
  //         title: "Updated!",
  //         text: res.data.message,
  //         timer: 2000,
  //         showConfirmButton: false,
  //       }).then(() => {
  //         navigate(`/app/case/${workOrders.CaseID}`);
  //       });
  //     } else {
  //       // Error from API
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: res.data.message,
  //       });
  //     }
  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Failed to update!",
  //       text: error.message || "Something went wrong.",
  //     });
  //   }
  // };

  const refresh = async () => {
    try {
      Swal.fire({
        title: "Refreshing...",
        text: "Please wait while we refresh the data.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Tunggu sebentar sebelum reload agar user bisa melihat loading
      setTimeout(() => {
        location.reload();
      }, 1500); // 1.5 detik delay
    } catch (err) {
      console.error("Error in refresh:", err);
    }
  };
  return (
    <>
      <div className="border-1 flex items-center dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600 overflow-auto">
        {buttons.map((btn, index) => (
          <Button
            key={index}
            onClick={btn.onClick}
            variant="link"
            hidden={btn.hidden}
            className={`rounded-none px-0 py-0  flex items-center gap-0.5 transition-all duration-300 has-[>svg]:px-1.5  `}
          >
            <btn.icon className="h-4 w-4" />
            {btn.label && <span className="text-md">{btn.label}</span>}
          </Button>
        ))}
{/* 
        {open && hiddenButtons.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 rounded-md bg-gray-200">
              ...
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hiddenButtons.map((btn, index) => (
                <DropdownMenuItem key={index}>
                  <btn.icon className="h-4 w-4 inline-block mr-2" />
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
  onChange,
  caseNotes,
  setCaseNotes,
  selectedSymptom,
  setSelectedSymptom,
}) => {
  const { open } = useSidebar();

  const [symptomSearchTerm, setSymptomSearchTerm] = useState("");
  const [symptomSuggestions, setSymptomSuggestions] = useState([]);

  const [caseClosedDate, setCaseClosedDate] = useState(null);

  const tabs = [
    { value: "case_info", label: "Case Information" },
    { value: "customer,add,entitement", label: "Customer, Asset & Entitement" },
    { value: "ci_notes", label: "Notes & Information" },
    { value: "ci_activitas", label: "Activities", disabled: true},
    { value: "ci_actions", label: "Customer Interactions" },
    { value: "ci_wo", label: "Work Order Validation" },
    { value: "ci_orders", label: "Orders" },
    { value: "ci_salles", label: "Sales Offer" },
    { value: "ci_knowledge", label: "Knowledge & Attachments" },
    { component: <SelectBarRelated /> },
  ];

  const visibleTabs = open ? tabs.slice(0, -2) : tabs;
  const hiddenTabs = open
    ? [
        { value: "ci_knowledge", label: "Knowledge & Attachments" },
        { component: <SelectBarRelated /> },
      ]
    : [];

  const [selected, setSelected] = useState("apple"); // Default to 'apple'

  //customer, asset, entitlement
  //customer
  const [dataFetchCustomerData, setDataFetchCustomerData] = useState({
    MainAccount: null,
    SiteAccount: null,
    Type: null,
  });
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
          type: "Individual", // fallback if no site account
        }));
      }

      // const res = await ApiCustomer.get(`/api/`)
    } catch (err) {
      console.error("Error returning Customer Data : ", err);
      return null;
    }
  };
  //asset
  const [dataFetchAssetInformation, setDataFetchAssetInformation] = useState();
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

  //notes handler
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
            ActionType: "Initial",
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
  useEffect(() => {
    fetchCustomerData();
    fetchAssetInformation();
    fetchOwnerUserData();

    fetchWorkOrders();
    const loadNote = async () => {
      const noteDetail = await fetchCaseNotes();
      if (noteDetail) {
        setCaseNotes({
          NotesDisplay: noteDetail.Note,
        });
      }
    };
    loadNote();
  }, []);

  //data for upper style
  const [ownerUserData, setOwnerUserData] = useState([]);
  
  const fetchOwnerUserData = async () => {
    try {
      const response = await ApiCustomer.get(
        `/api/user/${caseDetails.CreatedBy}`
      );
      setOwnerUserData(response.data.data);
    } catch (error) {}
  };

  useEffect(() => {
    console.log("Data Asset Info : ", dataFetchAssetInformation);

    console.log("Fetch Data Customer Success : ", dataFetchCustomerData);
    console.log("Fetch Data User ", ownerUserData);
  }, [ownerUserData]);


  const fetchSymptomCodes = async (term) => {
    try {
      const response = await ApiCustomer.get(
        "/api/case-information/symptom-codes"
      );
      const allCodes = response.data.data;

      const filtered = allCodes.filter((sym) =>
        sym.SymptomCode.toLowerCase().includes(term.toLowerCase())
      );

      setSymptomSuggestions(filtered);
    } catch (err) {
      console.error("Error fetching symptom codes", err);
    }
  };
  // console.log("Selected Symptopm ",selectedSymptom)

  // useEffect(() => {
  // }, selectedSymptom)

  //order section
  //workorder
  const [workOrders, setWorkOrders] = useState([]);
  const fetchWorkOrders = async () => {
    try {
      const res = await ApiCustomer.get(
        `/api/work-order?CaseID=${caseDetails.CaseID}`
      );
      setWorkOrders(res.data.data); // adjust based on API response shape
    } catch (err) {
      console.error("Failed to fetch work orders:", err);
    }
  };

  const [materialOrders, setMaterialOrders] = useState([]);
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

  return (
    <>
      {caseDetails.CaseStatus === "Close" && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-2">
          This Case is <strong>read-only</strong> because it is{" "}
          <strong>Closed</strong>.
        </div>
      )}
      <Card className="mt-2 rounded-none p-0 border-0">
        <Tabs defaultValue="case_info">
          <CardHeader className="flex flex-col gap-3 border-2 w-full p-2 sticky">
            <div className="flex justify-between">
              <CardTitle className="text-xl ">
                {caseDetails.CaseID}
                <span className="text-sm flex items-center">
                  Case .
                  <Select
                    onValueChange={setSelected}
                    defaultValue="case"
                    className="shadow-xl"
                  >
                    <SelectTrigger className="shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="case">Case</SelectItem>
                        <SelectItem value="??">??</SelectItem>
                        <SelectItem value="!!">!!</SelectItem>
                        <SelectItem value="**">**</SelectItem>
                        <SelectItem value="&&">&&</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </span>
              </CardTitle>
              <CardTitle className="flex">
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <h1 className="text-blue-500">{ownerUserData.Name}</h1>
                  <p className="text-sm font-light ">Owner</p>
                </div>
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <h1 className="text-blue-500">---</h1>
                  <p className="text-sm font-light ">Queue</p>
                </div>
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <h1 className="text-blue-500">
                    {dataFetchCustomerData.MainAccount?.Salutation}{" "}
                    {dataFetchCustomerData.MainAccount?.FirstName}{" "}
                    {dataFetchCustomerData.MainAccount?.LastName}
                  </h1>
                  <p className="text-sm font-light ">Contact</p>
                </div>
                <div className="px-2 flex flex-col item-center justify-center border-r-2">
                  <Select onValueChange={setSelected} defaultValue="first">
                    <SelectTrigger className="shadow-none border-none text-blue-500 p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-0">
                      <SelectGroup className="p-0">
                        <SelectItem value="first" className="p-0">
                          {dataFetchCustomerData.SiteAccount?.Company}
                        </SelectItem>
                        <SelectItem value="??">??</SelectItem>
                        <SelectItem value="!!">!!</SelectItem>
                        <SelectItem value="**">**</SelectItem>
                        <SelectItem value="&&">&&</SelectItem>
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
                    disabled={tab.disabled}
                  >
                    {tab.label}
                  </TabsTrigger>
                )
              )}
              {open && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-2 py-1 rounded-md bg-gray-200">
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
              <CardContent className="grid gap-10 items-center grid-cols-6 p-3 ">
                <CaseField label="Case ID" icon>
                  <Input variant="invisible" value={caseDetails.CaseID} />
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
                  {caseDetails.CaseStatus}
                </CaseField>
                <CaseField label="Case Type">{caseDetails.CaseType}</CaseField>
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
                  <span className="flex gap-[5em]">
                    {new Date(caseDetails.CreatedOn).toLocaleDateString(
                      "id-ID"
                    )}
                    <DatePicker variant="icon"></DatePicker>
                    {new Date(caseDetails.CreatedOn).toLocaleTimeString(
                      "id-ID",
                      { hour12: true, hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
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
                    ></DatePicker>
                    ---
                  </span>
                </CaseField>
                <CaseField label="Irrelevant" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Submitted To Base" icon span={3}>
                  <span className="flex gap-[5em]">
                    <DatePicker variant="icon"></DatePicker>
                    ---
                  </span>
                </CaseField>
              </CardContent>
            </Card>

            <Card className="mt-5 flex-col">
              <CardHeader>
                <CardTitle className=" text-lg">Global Trade Check</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-10  grid-cols-6 p-3 ">
                <CaseField label="Global Trade Status">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="GT Override Reason">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="GT Active Listening">
                  {" "}
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Embargoed Country" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="GT Details">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="GT All Comments">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField className={"col-start-3"} label="Screening ID">
                  <Input variant="invisible" placeholder="---" />
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
                <CardTitle className=" text-lg">Customer Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-10 grid-cols-6">
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
                  />
                </CaseField>
                <CaseField label="Primary Contact" icon>
                  <Input variant="invisible" />
                  {dataFetchCustomerData.MainAccount?.Salutation}{" "}
                  {dataFetchCustomerData.MainAccount?.FirstName}{" "}
                  {dataFetchCustomerData.MainAccount?.LastName}
                </CaseField>
                <CaseField label="Submitted By">
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Is Partner" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label=" Primary Email" icon>
                  {dataFetchCustomerData.MainAccount?.Salutation}{" "}
                  {dataFetchCustomerData.MainAccount?.FirstName}{" "}
                  {dataFetchCustomerData.MainAccount?.LastName}
                </CaseField>
                <CaseField label="Partner & Customer" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="HIPAA" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Phone" icon>
                  {" "}
                  {dataFetchCustomerData?.Type == "SiteAccount"
                    ? dataFetchCustomerData?.SiteAccount?.PrimaryPhone
                    : dataFetchCustomerData?.MainAccount?.Phone}
                </CaseField>
                <CaseField label="Region" icon>
                  <Input variant="invisible" placeholder="---" />
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
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Country" icon>
                  <Input
                    variant="invisible"
                    value={
                      dataFetchCustomerData?.Type == "SiteAccount"
                        ? dataFetchCustomerData?.SiteAccount?.Country
                        : dataFetchCustomerData?.MainAccount?.Country
                    }
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
                <CardTitle className=" text-lg">Asset Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-10 grid-cols-6 items-center">
                <CaseField label="Assets" icon>
                  {dataFetchAssetInformation?.AssetInformation?.SerialNumber}{" "}
                </CaseField>
                <CaseField label="Product Number" icon>
                  <Input variant="invisible" placeholder="---" />
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
                <div className="p-5 gap-2 ring-1 col-span-2 grid grid-cols-2 items-center">
                  <CaseField label="Device Properties" icon>
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className=" text-lg">SLA Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-10 grid-cols-6 items-center">
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
                <CardTitle className=" text-lg">
                  Entitlement Information
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-10 grid-cols-6 items-center">
                <CaseField label="Case Entitlement" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Start Date" icon>
                  {" "}
                  <DatePicker></DatePicker>{" "}
                </CaseField>
                <CaseField label="OTC Code" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Entitlement Status" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="End Date" icon>
                  {" "}
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField label="Entitlement Override" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Selected Entitlement Offer" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Days Left" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Authorizing Employee" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ci_notes" className={"p-2 flex flex-col gap-4"}>
            <Card className="flex-col p-2  ">
              <CardHeader>
                <CardTitle className=" text-lg">
                  Customer Issue Description & System Information
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="flex gap-x-5 p-4">
                <div className="flex-1 grid grid-row-7 grid-cols-6 items-center gap-y-7">
                  <div className="row-span-4 col-span-full">
                    <textarea className="border-2 ring-1 ring-gray-400 w-[100%] h-[12em] resize-none"></textarea>
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

                <div className="flex-1 grid-flow-row gap-y-7 grid grid-cols-6">
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

            <Card className="flex-col p-2  ">
              <CardHeader>
                <CardTitle className=" text-lg">Case Notes</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="flex gap-4">
                <div className="grid grid-cols-6 gap-y-7 flex-1">
                  <CaseField label="Log Type" className={"col-span-2"} span={4}>
                    <Select onValueChange={(val) => onChange("LogType", val)}>
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
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>

                  <CaseField label="Template" className={"col-span-2"} span={4}>
                    <Input variant="invisible" placeholder="---" />
                  </CaseField>

                  <CaseField
                    label="Visible Externally"
                    className={"col-span-2"}
                    span={4}
                  >
                    <Select
                      value={
                        formData?.VisibleExternally === undefined ||
                        formData?.VisibleExternally === null
                          ? ""
                          : formData?.VisibleExternally
                          ? "1"
                          : "0"
                      }
                      onValueChange={(val) =>
                        onChange("VisibleExternally", val === "1")
                      }
                    >
                      <SelectTrigger
                        className={"w-[100%] hover:shadow-lg border-b-0"}
                      >
                        <SelectValue placeholder="---" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Yes</SelectItem>
                        <SelectItem value="0">No</SelectItem>
                      </SelectContent>
                    </Select>
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
                    className={"col-span-2 self-start"}
                    span={4}
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
                    value={caseNotes?.NotesDisplay}
                  >
                    {" "}
                  </textarea>
                </div>
              </CardContent>
            </Card>

            <Card className=" flex-col">
              <CardHeader>
                <CardTitle className=" text-lg">
                  Symtome Description / CardTitle
                </CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="flex gap-6">
                <div className="grid grid-cols-5 gap-y-7 gap-x-2 flex-1">
                  <CaseField
                    label="Keyword Search"
                    className={"col-span-2"}
                    span={3}
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
                    <ul className="bg-white border  max-h-40 overflow-y-auto absolute z-10">
                      {symptomSuggestions.map((sym) => (
                        <li
                          key={sym.SymptomCodeID}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
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

                <div className="font-bold flex flex-1">
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
                          <div className="flex items-center  gap-1">
                            QA Level 1 <ArrowUp /> <ChevronDown />
                          </div>
                        </TableHead>
                        <TableHead className="">
                          <div className="flex items-center  gap-1">
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

            <Card className="mt-5 flex-col">
              <CardHeader>
                <CardTitle className=" text-lg">Case Resolution</CardTitle>
                <hr />
              </CardHeader>

              <CardContent className="grid gap-5 grid-cols-6 p-3 ">
                <CaseField label="Case Resolution Code"> --- </CaseField>
                <CaseField label="Case Ready for Closure" icon>
                  <Select
                    className=""
                    onValueChange={(val) =>
                      onChange("VisibleExternally", val === "1")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                </CaseField>
                <CaseField label="Pending Customer Action" icon>
                  <DatePicker />
                </CaseField>
                <CaseField label="Auto Close">
                  <Select
                    className=""
                    onValueChange={(val) =>
                      onChange("VisibleExternally", val === "1")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                </CaseField>
                <CaseField label="Ready for Close Days" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
                <CaseField label="Customer Requested Close Date" icon>
                  {" "}
                  <DatePicker />
                </CaseField>
                <CaseField
                  className={"col-start-3"}
                  label="Ready for Closure Date"
                  icon
                >
                  <DatePicker />{" "}
                </CaseField>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ci_activitas">
            <Card className="mt-7">
              <CardHeader>Hello Word</CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="ci_actions" >
            <Card className="mt-7 tex">
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
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="Global Trade Ovveride Reason">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
                  </CaseField>
                  <CaseField label="GT Active Listening">
                    <Input
                      variant={"invisible"}
                      className=""
                      value={"---"}
                      readOnly
                    />
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
                        className="mt-4 resize-none w-full min-h-[150px] p-2 ring-1 ring-gray-300 rounded-md"
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
                <CardTitle className=" text-lg">Shipment Information</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid gap-10 grid-cols-4 items-center">
                <CaseField label="Shipment Country">
                  <Input variant="invisible" placeholder="---" />
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
                <CardTitle className=" text-lg">Work Order</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className=" flex flex-col gap-5 p-3">
                <div className="grid gap-5 grid-cols-4">
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
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((work) => (
                      <TableRow
                        key={work.WOID}
                        className="hover:bg-gray-500 cursor-pointer"
                      >
                        <TableCell
                          className="font-medium "
                          onClick={handleClick}
                        >
                          {work.WOID}
                        </TableCell>
                        <TableCell>{work.CaseID}</TableCell>
                        {/* <TableCell>{work.serviceaccount}</TableCell>
                      <TableCell>{work.substatus}</TableCell>
                      <TableCell>{work.systemstatus}</TableCell>
                      <TableCell>{work.priority}</TableCell>
                      <TableCell>{work.workorder}</TableCell>
                      <TableCell>{work.primaryincident}</TableCell>
                      <TableCell>{work.duedate}</TableCell>
                      <TableCell>{work.orion}</TableCell>
                      <TableCell>{work.owner}</TableCell>
                      <TableCell>{work.created}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className=" text-lg">Parts Order</CardTitle>
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
                    {partsorder.map((parts) => (
                      <TableRow key={parts.name}>
                        <TableCell className="font-medium">
                          {parts.name}
                        </TableCell>
                        <TableCell>{parts.orderstatus}</TableCell>
                        <TableCell>{parts.workorder}</TableCell>
                        <TableCell>{parts.customerselfrepair}</TableCell>
                        <TableCell>{parts.owner}</TableCell>
                        <TableCell>{parts.createdon}</TableCell>
                        <TableCell>{parts.ordercloseddate}</TableCell>
                        <TableCell>{parts.createdby}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className=" text-lg">Service Order</CardTitle>
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
                <CardTitle className=" text-lg">Material Order</CardTitle>
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
                        <TableCell>{material.CaseID}</TableCell>
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
