import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchCommandBlock, SelectBarRelated } from "./sc-select";
import { Car, Lock, Plus, LockOpen } from "lucide-react";
import { CalendarDays } from "lucide-react";
import { KeyRound } from "lucide-react";
import { twMerge } from "tailwind-merge";

//import API
import ApiCustomer from "@/api";
import DatePicker from "./date-picker";
import CaseField from "@/components/CaseField";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/context/auth-context";
// import { CaseField } from "./service-case";
const spanMap = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
};



export function QuickWOInput ({ 
  WOID, 
  workOrderData, 
  caseInformation,
  SLA,
  setSLA,
  WOGeneral,
  setWOGeneral
}) {
  // State untuk 8 field General
  const [tab, setTab] = useState("wo_input");
  const [general, setGeneral] = useState({
    incomingChannel: "",
    workOrderNumber: "",
    workOrderType: "",
    systemStatus: "",
    subStatus: "",
    partnerStatus: "",
    workOrderDescription: "",
    workOrderInstruction: "",
  });

  const handleChangeGeneral = (field) => (e) => {
    setWOGeneral((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  }

  //Service Delivery Address
  const [addressID, setAddressID] = useState(""); // nanti bisa jadi ID

  const [ServiceDeliveryAddress, setServiceDeliveryAddress] = useState({
    companyName: "",
    contactFirstName: "",
    contactLastName: "",
    phoneNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    stateOrProvince: "",
    countryOrRegion: "",
    postalCode: "",
    timezone: "",
    serviceTerritory: "",
    businessSegment: "",
    longitude: "",
    latitude: "",
  });

  const handleChangeServciceDeliveryAddress = (field) => (e) => {
    setServiceDeliveryAddress((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  }
  
  //SLA
  const handleChangeSLA = (field) => (e) => {
    setSLA((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  }

  //fetch data site_account
  const [siteAccountInformation, setSiteAccountInformation] = useState([])
  
  useEffect(() => {
    const fetchDataSiteAccounts = async () => {
      try {
        setSiteAccountInformation(caseInformation.site_account)
      } catch (error) {
        
      }
    }
    fetchDataSiteAccounts();
  }, [caseInformation?.SiteAccountID])

  const [mainAccount, setMainAccount] = useState({
    MainAccount: null,
    SiteAccount: null,
    Type: ""
  });
  // Fetch data awal
  useEffect(() => {
    if (!WOID) return;
    (async () => {
      const wo = workOrderData; 
      
      const contact = caseInformation.contact_information; 
      setMainAccount({
        MainAccount: contact,
      });

      const siteAccount = caseInformation.site_account;
      // Build the mainAccount object locally
      const newMainAccount = {
        MainAccount: contact,
        SiteAccount: siteAccount || null,
        Type: siteAccount ? "SiteAccount" : "Individual",
      };

      setGeneral(prev => ({
        ...prev,
        incomingChannel: prev.incomingChannel || wo.IncomingChannel || "...",
        workOrderNumber: wo.WorkOrderNumber || "...",
        workOrderType: wo.WorkOrderType || "...",
        systemStatus: wo.SystemStatus || "...",
        subStatus: wo.SubStatus || "...",
        partnerStatus: wo.PartnerStatus || "...",
        workOrderDescription: wo.WorkOrderDescription || "...",
        workOrderInstruction: wo.WorkOrderInstruction || "...",
      }));
      setMainAccount(newMainAccount);

    // Now you can safely use newMainAccount
      setServiceDeliveryAddress({
        companyName: siteAccount?.Company || "---",
        contactFirstName: contact?.FirstName || "---",
        contactLastName: contact?.LastName || "---",
        phoneNumber: siteAccount?.PrimaryPhone || contact?.Phone || "---",
        email: siteAccount?.Email || contact?.Email || "---",
        addressLine1: siteAccount?.AddressLine1 || contact?.AddressLine1 || "---",
        addressLine2: siteAccount?.AddressLine2 || contact?.AddressLine2 || "---",
        addressLine3: "---",
        city: siteAccount?.City || contact?.City || "---",
        stateOrProvince: siteAccount?.StateProvince || contact?.StateProvince || "---",
        countryOrRegion: siteAccount?.Country || contact?.Country || "---",
        postalCode: siteAccount?.ZipPostalCode || contact?.ZipPostalCode || "---",
        timezone: "---",
        serviceTerritory: "---",
        businessSegment: "---",
        longitude: "---",
        latitude: "---",
      });

      setAddressID(siteAccount?.SiteAccountID || "---");
    })();
  }, [WOID]);

  const handleSLAChange = (field) => (value) => {
    setSLA((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Simpel update PATCH
  // const handleSave = async () => {
  //   await ApiCustomer.patch(`/api/work-order/${WOID}`, {
  //     WorkOrderType: general.workOrderType,
  //     SubStatus: general.subStatus,
  //     PartnerStatus: general.partnerStatus,
  //     CoverageWindow: SLA.coverageWindow,
  //     OTCCode: SLA.otcCode,
  //     RequestedDateTimeCustomer: SLA.requestedDateTimeCustomer,
  //   });

  // //   // Simpan Service Delivery Address
  // //   // await ApiCustomer.patch(`/api/workorder/${WOID}/service-address`, {
  // //   //   ContactFirstName: ServiceDeliveryAddress.contactFirstName,
  // //   //   PhoneNumber: ServiceDeliveryAddress.phoneNumber,
  // //   //   Email: ServiceDeliveryAddress.email,
  // //   //   City: ServiceDeliveryAddress.city,
  // //   // });
  // };
  

  return (
    <div className="p-1">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsContent value="wo_input" >
            <Card className="flex-col" hidden>
              <CardHeader>
                <CardTitle className='text-lg '>General</CardTitle>
                <hr />
              </CardHeader>

            <CardContent className="flex gap-5">
              <div className="grid flex-1 grid-cols-6 gap-5">
                <div className="grid grid-cols-6 col-span-6 p-4 border-1">
                  <CaseField label="Incoming Channel" className={'col-span-2'} lock span={4}>
                    <Input variant={'invisible'} className="" 
                    value={WOGeneral.IncomingChannel} onChange={handleChangeGeneral('IncomingChannel')}/> </CaseField>
                </div>
                <CaseField label="Work Order Number" className={'col-span-2 '} lock span={4}>
                  <Input variant={'invisible'} className="" 
                    value={general.workOrderNumber}  /></CaseField>
                <CaseField label="Work Order Type" className={'col-span-2'} lock span={4}>
                  <Input variant={'invisible'} className="" 
                    value={general.workOrderType} onChange={handleChangeGeneral('workOrderType')} /> </CaseField>
                <CaseField label="System Status" className={'col-span-2'} lock span={4}>
                  <Input variant={'invisible'} className="" 
                    value={general.systemStatus}  /> </CaseField>
                <CaseField label="Sub Status" className={'col-span-2'} lock={KeyRound} span={4}>
                  <Input variant={'invisible'} className="" 
                    value={general.subStatus} onChange={handleChangeGeneral('subStatus')} /> </CaseField>
                <CaseField label="Partner Status" className={'col-span-2'} lock span={4}>
                  <Input variant={'invisible'} className="" 
                    value={general.partnerStatus} /> </CaseField>
              </div>

              <div className="grid items-start content-start justify-start flex-1 grid-cols-6 gap-5">
                <CaseField label="Work Order Description" className={'col-span-2'} lock span={4}>
                   <Input variant={'invisible'} className="" value={general.workOrderDescription}  /> </CaseField>
                <CaseField label="Work Order Instruction" className={'col-span-2'} lock span={4}>
                   <Input variant={'invisible'} className="" value={general.workOrderInstruction}  /> </CaseField>

              </div>
            </CardContent>
            </Card>

            {/* 
            TODO :
            Make this available in Contact Individual
            */}
            <Card className="flex-col dark:bg-gradient-to-t dark:from-slate-700 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">  
              <CardHeader>
                <CardTitle className='text-lg'>Service Delivery Address</CardTitle>
                <hr className="dark:border-gray-400"/>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-6 gap-5 m-1">
                <CaseField label="Choose Address" className={''} lock ><Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2" value="Site Account address"/></CaseField>
                <CaseField label="Address Line1" className={''}  lock> <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.addressLine1} readOnly/> </CaseField>
                <CaseField label="Postal Code" className={''}  lock> <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"   value={ServiceDeliveryAddress.postalCode} readOnly/> </CaseField>
                <CaseField label="Company Name" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.companyName} readOnly/> </CaseField>
                <CaseField label="Address Line2" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.addressLine2} readOnly/> </CaseField>
                <CaseField label="Timezone" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.timezone} readOnly/> </CaseField>
                <CaseField label="Contact First Name" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.contactFirstName} onChange={e => handleChangeServciceDeliveryAddress("contactFirstName")} /> </CaseField>
                <CaseField label="Address Line3" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.addressLine3} onChange={e => handleChangeServciceDeliveryAddress("addressLine3")} /> </CaseField>
                <CaseField label="Service Territory" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.serviceTerritory} readOnly/> </CaseField>
                <CaseField label="Contact Last Name" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.contactLastName} readOnly/> </CaseField>
                <CaseField label="City" className={''}  lock> <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.city} readOnly/> </CaseField>
                <CaseField label="Business Segment" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.businessSegment} readOnly/> </CaseField>
                <CaseField label="Phone Number" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.phoneNumber} onChange={e => handleChangeServciceDeliveryAddress("phoneNumber")} /> </CaseField>
                <CaseField label="State Or Province" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.stateOrProvince} readOnly/> </CaseField>
                <CaseField label="Longitude" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.longitude} readOnly/> </CaseField>
                <CaseField label="Email Address" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.email} onChange={e => handleChangeServciceDeliveryAddress("email")} /> </CaseField>
                <CaseField label="Country/Region" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.countryOrRegion} readOnly/> </CaseField>
                <CaseField label="Latitude" className={''} lock > <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"  value={ServiceDeliveryAddress.latitude} readOnly/> </CaseField>
              </CardContent>
            </Card>

            <Card className="flex-col mt-7" hidden>
              <CardHeader>
                <CardTitle className='text-lg '>SLA in Customer Time Zone</CardTitle>
                <hr />
              </CardHeader>
              <CardContent className="grid grid-cols-6 gap-5 auto-rows-auto place-content-between">
                <CaseField label="SLA Jeopardy" className={''} lock > <Input className="" value={SLA.slaJeopardy} /> </CaseField>
                <CaseField star label="Requested Date Time (Customer)">
                  <DatePicker
                    value={SLA.requestedDateTimeCustomer ? new Date(SLA.requestedDateTimeCustomer) : null}
                    onChange={handleSLAChange("requestedDateTimeCustomer")}
                  />
                </CaseField>

                <CaseField label="SLA Reschedule" className={''} lock > <Input className="" value={SLA.slaReschedule} /> </CaseField>
                <CaseField label="Due Date (Customer)" className={''} lock >
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField label="Guaranteed Fix Time (Customer)" className={''} lock >
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField label="Active Schedule Date" className={''} lock > <Input className="" value={SLA.activeScheduleDate} /> </CaseField>
                <CaseField label="Coverage Window" className={''}  > <Input className="" value={SLA.coverageWindow} onChange={e => handleChangeServciceDeliveryAddress(e.target.value)} /> </CaseField>
                <CaseField label="Early Start Date Time (Customer)" className={''}  >
                  <DatePicker
                  value={SLA.earlyStartDateTimeCustomer ? new Date(SLA.earlyStartDateTimeCustomer) : null}
                  onChange={handleSLAChange("earlyStartDateTimeCustomer")}
                  ></DatePicker>
                </CaseField>
                <CaseField label="SLA Error Description" className={'row-span-2 items-start'} childClass={'row-span-2'} lock >
                   <textarea value={SLA.slaErrorDescription || ""} className='border-0 ring-0 ring-gray-400 w-[100%] h-[100%] resize-none'></textarea>
                </CaseField>
                <CaseField label="Response" className={''}  > <Input className="" value={SLA.response} readOnly/> </CaseField>
                <CaseField label="Latest Start Date Time (Customer)" className={''}  > 
                  <DatePicker></DatePicker>
                </CaseField>
                <CaseField label="OTC Code" className={''}  > <Input className="" value={SLA.otcCode} onChange={e => handleChangeServciceDeliveryAddress(e.target.value)} /> </CaseField>
                <CaseField label="Case Priority Index" className={'col-start-5'} lock > <Input className="" value={SLA.casePriorityIndex} readOnly/> </CaseField>
              </CardContent>
            </Card>

            
            <Card className={"mt-5 dark:bg-gradient-to-b dark:from-slate-700 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4"}>
              <CardHeader>
                <CardTitle className={"text-lg"}>Repair Action</CardTitle>
                <hr className="dark:border-gray-400"/>
              </CardHeader>
              <CardContent className={"grid grid-cols-1 lg:grid-cols-4 gap-2"}>
                <CaseField label={"Problem category"} lock>
                  <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2" value={workOrderData?.ServiceType?.ProblemCategory || ""}/>
                </CaseField>
                <CaseField label={"Delay code"} lock>
                  <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2" value={workOrderData?.DelayCode || ""}/>
                </CaseField>
                <CaseField label={"Service type"} lock>
                  <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2" value={workOrderData?.ServiceType?.ServiceTypeName || ""}/>
                </CaseField>
                <CaseField label={"NMU"} lock>
                  <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2" value={workOrderData?.NMU?.NMUDesc}/>
                </CaseField>
                <CaseField label={"NMU item"} lock>
                  <Input className="dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2" value={workOrderData?.NMUItem?.itemName} />
                </CaseField>
                <CaseField label={"Defec desc"} lock>
                  <Textarea className=" border-none italic ring-1 ring-gray-400 bg-gray-50 text-base dark:bg-gray-500/10 dark:border-gray-400" value={workOrderData?.DefectDesc || ""}/>
                </CaseField>
                <CaseField label={"CE analysis"} lock>
                  <Textarea className=" border-none italic ring-1 ring-gray-400 bg-gray-50 text-base dark:bg-gray-500/10 dark:border-gray-400" value={workOrderData?.CEAnalysis || ""}/>
                </CaseField>
                <CaseField label={"Repair Action"} lock>
                  <Textarea className=" border-none italic ring-1 ring-gray-400 bg-gray-50 text-base dark:bg-gray-500/10 dark:border-gray-400" value={workOrderData?.RepairAction || ""}/>
                </CaseField>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <CardFooter className="flex justify-end">
        </CardFooter>
        </div>
  );
};
