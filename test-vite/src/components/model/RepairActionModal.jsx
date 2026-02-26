import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "../ui/card";
import CaseField from "../CaseField";
import { Textarea } from "../ui/textarea";
import { debounce } from "lodash";
import { SearchCommandBlock } from "../sc-select";
import ApiCustomer from "@/api";
import { toast } from "sonner";
import { useWorkOrderStore } from "@/hooks/useWorkOrderStore";

export const RepairActionDialog = ({ open, onOpenChange, onSubmit, canEdit, IsCancel, workOrders }) => {
  const [step, setStep] = useState("form");
  const [NMUList, setNMUList] = useState([]);
  const [NMUItemNeed, setNMUItemNeed] = useState(false);
  const [NMUVersionNeed, setNMUVersionNeed] = useState(false);
  const [nmuNotFound, setNMUNotFound] = useState(false)
  const [NMUItemList, setNMUItemList] = useState([]);
  const [nmuItemNotFound, setNMUItemNotFound] = useState(false)
  const [problemCategory, setProblemCategory] = useState("");
  const [serviceTypeList, setServiceTypeList] = useState([]);
  const [showDelayCode, setShowDelayCode] = useState(false);
  const [selectedNMU, setSelectedNMU] = useState("");
  const [selectedNMUItem, setSelectedNMUItem] = useState("");
  const [formData, setFormData] = useState({
    serviceType: null,
    nmu: null,
    nmuItem: null,
    Version: null,
    defectDesc: "",
    ceAnalysis: "",
    repairAction: "",
    delayCode : null,
    cancelReason: "",
  });

const [delayToggle, setDelayToggle] = useState(false);
  const caseInformation = useWorkOrderStore((s) => s.caseInformation);
const checkTimeDelay = () => {
  
  const currentDateObj = new Date(); 
  const numberOfMlSeconds = currentDateObj.getTime();

  const createdOn = caseInformation?.CreatedOn
    ? new Date(caseInformation.CreatedOn)
    : null;
  const createdOninsec = createdOn.getTime();

const TimeDelay = () => {
  switch (caseInformation?.CasePriority) {
    case "Same Businnes Day (SBD)":
      return 24 * 60 * 60 * 1000 ;
    case "Next Businnes Days (NBD)" :
      return 48 * 60 * 60 * 1000 ;
    case "3 Businnes Days (3BD)":
      return 92 * 60 * 60 * 1000 ;
    default:
      break;
  }
}

const delaytime = createdOninsec + TimeDelay();
 (currentDateObj >= delaytime) &&  setDelayToggle(true) 
}
  // const isOutWarranty = workOrders?.serviceCatalog?.asset_information?.Warranty_Status === "01T"

  const selectedServiceType = useMemo(() => {
    return serviceTypeList.find(item => item.ServiceTypeId === formData.serviceType)
  }, [serviceTypeList, formData.serviceType])

  const isCancelRepair = selectedServiceType?.ServiceTypeName === "Cancel Repair"

  const fetchServiceType = async (problemCategory) => {
    try {
      const res = await ApiCustomer.get(`/api/service-type?ProblemCategory=${problemCategory}`);
      const list = res.data?.data || [];
      setServiceTypeList(list)
    } catch (e) {
      toast.error("Search Service Type failed", e);
      setServiceTypeList([])
    }
  }
  const fetchNMU = async () =>{
    try {
      const res = await ApiCustomer.get(`/api/nmu`);
      const list = res.data?.data || [];
      setNMUList(list);
      setNMUNotFound(list.length === 0);
    } catch (e) {
      toast.error("Search NMU failed", e);
      setNMUList([]);
      setNMUNotFound(true);
    }
  }

  const fetchNMUList = async (nmu) => {
    try {
      const res = await ApiCustomer.get(`/api/nmu/nmuitem?NMUId=${nmu}`);
      const list = res.data?.data || [];
      setNMUItemList(list);
      setNMUItemNotFound(list.length === 0);
    } catch (e) {
      toast.error("Search NMU failed", e);
      setNMUItemList([]);
      setNMUItemNotFound(true);
    }
  }

  useEffect(()=>{
    // isOutWarranty ? setProblemCategory('Hardware') : '';
    fetchNMU();
    checkTimeDelay();
  },[])

  useEffect(()=>{
    fetchServiceType(problemCategory)    
  },[problemCategory])
  
  // useEffect(()=>{
  //   if(isOutWarranty){
  //     const targetServiceType = IsCancel ? "Cancel Repair" : "Standard Replacement / Failure (Part Used)"
  //     const target = serviceTypeList.find(
  //       item => item.ServiceTypeName === targetServiceType
  //     );
  //     if (target) {
  //       handleChange("serviceType", target.ServiceTypeId);  
  //     }
  //   }
  // },[serviceTypeList, IsCancel])

  useEffect(() => {
    setFormData(prev => ({ ...prev, nmuItem: null, Version: "" }));
    const foundNMU = NMUList.find(item => item.NMUId === formData.nmu);
    setSelectedNMU(foundNMU);
    if (foundNMU) {
      setNMUItemNeed(foundNMU.ItemNeeded);
      setNMUVersionNeed(foundNMU.VersionNeeded);
      if(foundNMU.ItemNeeded === true){
        fetchNMUList(foundNMU.NMUId);
      }
    }
  }, [formData.nmu]);

  useEffect(()=>{
    setSelectedNMUItem(NMUItemList.find(item => item.id === formData.nmuItem));
  }, [formData.nmuItem])

  useEffect(()=>{
    if(!workOrders?.CreatedOn) return;

    const createdDate = new Date(workOrders.CreatedOn);
    const now = new Date()

    const diffDays = Math.floor((now - createdDate) / (1000*60 *60*24))
    setShowDelayCode(diffDays >= 3);
  }, [workOrders?.CreatedOn])

  const delayCodeEnumToLabel = {
    PartBackOrder: "Part Back Order",
    IntermittentCase: "Intermitten Case",
    CustomerCausedDelay: "Customer Caused Delay",
    MultipleIssue: "Multiple Issue",
    WarrantySalesDelayApproval: "Warranty Sales Delay Approval",
    EscalationComplexIssue: "Escalation Complex Issue",
    WrongPartOrderorAnalysis: "WrongPart Orderor Analysis",
    CaseHandlingDelay: "Case Handling Delay",
    PartDOA: "Part DOA",
    NOCEAvailable: "NOCE Available",
    CutOffTime: "Cut Off Time",
    HPSystemDown: "HP System Down",
    ADPInvestigation: "ADP Investigation",
    RecoveryOS: "Recovery OS",
    UpdateWindows: "Update Windows",
    OfficeClosure: "Office Closure",
    AMRMonitor: "AMR Monitor",
    TravelDelay: "Travel Delay",
  };

  const labelToStatusEnum = Object.fromEntries(
    Object.entries(delayCodeEnumToLabel).map(([key, val]) => [val, key])
  );

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitStep = (e) => {
    e?.preventDefault?.();
    const requiredFields = [
      { key: "defectDesc", label: "Defect Description" },
      { key: "ceAnalysis", label: "CE Analysis" },
      { key: "repairAction", label: "Repair Action" },
      { key: "delayCode", label: "Delay Code", 
        condition: showDelayCode === true
      },
    ];

    const emptyFields = requiredFields.filter(field => {
      if (field.condition === false) return false; // skip if condition is false
      return !formData[field.key] || formData[field.key].toString().trim() === "";
    });

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(f => `- ${f.label}`).join("\n");
      toast.warning(`Mohon isi field berikut sebelum melanjutkan:\n\n${fieldNames}`,{
        position: 'top-center'
      });
      return;
    }
    setStep("confirm"); // go to confirmation screen
  };

  const handleConfirm = () => {
    onSubmit({
      ...formData,
      isCancelRepair
    }); // send data
    
    setStep("form");
    onOpenChange(false); // close dialog
  };

  const handleCancelConfirm = () => {
    setStep("form"); // back to form
  };
  
  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) setStep("form"); // reset on close
      onOpenChange(o);
    }}>
      <DialogContent
        className={`transition-all duration-300 max-h-[90vh] bg-white ${
          step === "confirm" ? "sm:max-w-[700px]" : "sm:max-w-[900px]"
        }`}
      >
        <DialogHeader>
          <DialogTitle>
            {step === "form" ? "Repair Action" : "Confirm Repair Action"}
          </DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Tambahkan tindakan perbaikan yang diperlukan untuk work order ini."
              : "Pastikan data berikut sudah benar sebelum disimpan."}
          </DialogDescription>
        </DialogHeader>

        {/* FORM VIEW */}
        {step === "form" && (
          <Card className="mt-2">
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3 overflow-auto h-100 md:h-fit p-2">
              {isCancelRepair && (
                <CaseField label="Cancel Reason" lock={!canEdit} span={3} star={isCancelRepair} indent>
                  <Textarea
                    onChange={(e) => handleChange("cancelReason", e.target.value)}
                  />
                </CaseField>
              )}

              <CaseField label="Problem category" lock={!canEdit} indent>
                <SearchCommandBlock
                  value={problemCategory}
                  onChange={(selectedValue)=>{
                    setProblemCategory(selectedValue)
                  }}
                  placeholder="Search Problem Category..."
                  options={[
                    "Hardware",
                    "Software"
                    ]}
                  readOnly={!canEdit}
                />
              </CaseField>

              <CaseField label="Service type" lock={!canEdit} indent>
                <SearchCommandBlock
                  value={formData.serviceType}
                  onChange={(selectedValue)=>{
                    handleChange("serviceType", selectedValue)
                  }}
                  placeholder="Search Service Type Item..."
                  options={serviceTypeList.map((item) =>({
                    label: item.ServiceTypeName,
                    value: item.ServiceTypeId,
                  }))}
                  readOnly={!canEdit}
                />
              </CaseField>
              <CaseField label="Defect desc" star={canEdit} lock={!canEdit} indent>
                <Textarea
                  onChange={(e) => handleChange("defectDesc", e.target.value)}
                />
              </CaseField>

              <CaseField label="CE analysis" star={canEdit} lock={!canEdit} indent>
                <Textarea
                  onChange={(e) => handleChange("ceAnalysis", e.target.value)}
                />
              </CaseField>

              <CaseField label="Repair Action" star={canEdit} lock={!canEdit} indent>
                <Textarea
                  onChange={(e) => handleChange("repairAction", e.target.value)}
                />
              </CaseField>

              <CaseField label="NMU" lock={!canEdit} indent>
                  <SearchCommandBlock
                    value={formData.nmu}
                    onChange={(selectedValue)=>{
                      handleChange("nmu", selectedValue)
                    }}
                    placeholder="Search NMU..."
                    options={NMUList.map((item) =>({
                      label: item.NMUDesc,
                      value: item.NMUId,
                    }))}
                    readOnly={!canEdit}
                  />
              </CaseField>
              

              <CaseField label="NMU Item" lock={!canEdit} 
              hide={!NMUItemNeed}
              indent
              >
                <SearchCommandBlock
                  value={formData.nmuItem}
                  onChange={(selectedValue)=>{
                    handleChange("nmuItem", selectedValue)
                  }}
                  placeholder="Search NMU Item..."
                  options={NMUItemList.map((item) =>({
                    label: item.itemName,
                    value: item.id,
                  }))}
                  readOnly={!canEdit}
                />
              </CaseField>

              <CaseField label="Version" lock={!canEdit} 
              hide={!NMUVersionNeed}
              indent
              >
                <Input
                  id="Version"
                  onChange={(e) => handleChange("Version", e.target.value)}
                  value={formData.Version}
                />
              </CaseField>
                
              <CaseField label="Delay code" star={canEdit} lock={!canEdit}  hide={!delayToggle} indent>
                <SearchCommandBlock
                  value={delayCodeEnumToLabel[formData.delayCode] || "Search Delay Code"}
                  onChange={(selectedValue)=>{
                    const enumValue = labelToStatusEnum[selectedValue]
                    handleChange("delayCode", enumValue)
                  }}
                  placeholder="Search Delay Code..."
                  options={Object.values(delayCodeEnumToLabel)}
                  readOnly={!canEdit}
                />
              </CaseField>

              
            </CardContent>
          </Card>
        )}

        {/* CONFIRMATION VIEW */}
        {step === "confirm" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
                <span className="text-red-600 font-semibold">⚠️ WARNING : Status Work Order akan berubah menjadi {isCancelRepair ? "CLOSED - CANCEL" : "OPEN - COMPLETED"}</span>
              <br />Berikut adalah data yang akan dikirim:
            </p>

            <div className="space-y-2 bg-gray-50 border rounded p-4 text-sm">
              <p><strong>Problem Category:</strong> {workOrders?.WorkOrderType || ""}</p>
              {showDelayCode && (<p><strong>Delay Code:</strong> {formData.delayCode}</p>)}
              <p><strong>Service Type:</strong> {workOrders?.serviceCatalog?.warranty_services?.Service_description || ""}</p>
              {selectedNMU && (<p><strong>NMU:</strong> {selectedNMU.NMUDesc}</p>)}
              {NMUItemNeed && (<p><strong>NMU Item:</strong> {selectedNMUItem.itemName}</p>)}
              {NMUVersionNeed && (<p><strong>Version:</strong> {formData.Version}</p>)}
              <p><strong>Defect Desc:</strong> {formData.defectDesc}</p>
              <p><strong>CE Analysis:</strong> {formData.ceAnalysis}</p>
              <p><strong>Repair Action:</strong> {formData.repairAction}</p>
            </div>
          </div>
        )}

        {/* FOOTER BUTTONS */}
        <DialogFooter className="mt-4">
          {step === "form" ? (
            <>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmitStep}>Next</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCancelConfirm}>
                Back
              </Button>
              <Button onClick={handleConfirm}>Confirm & Submit</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepairActionDialog;
