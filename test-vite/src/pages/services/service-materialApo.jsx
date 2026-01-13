import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchCommandBlock, SelectBarRelated } from "../../components/sc-select";
import { Car, Lock } from "lucide-react";
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
import { TabsServiceMO } from "./service-case";
import Swal from "sweetalert2";

import { useParams, useNavigate } from "react-router";
import ApiCustomer from "@/api";
import DatePicker from "../../components/date-picker";
import { Case } from "@/pages/Case";
import { useDraft } from "../../components/DraftContext";
import { Accordion, AccordionContent } from "@/components/ui/accordion";
import { AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import CaseField from "@/components/CaseField";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export const RMA_STATUS_OPTIONS = [
  { value: "InOutCE", label: "In & On Hand CE" },
  { value: "ReturnLogistic", label: "Return via Logistic" },
  { value: "ReturnDHL", label: "Return to DHL/SC" },
  { value: "FullCharge", label: "Full Charge" },
];

export const ServiceMaterialApo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { moid } = useParams();
  const {updateDraft } = useDraft(); // Access updateDraft from the DraftContext
  const [materialOrders, setMaterialOrders] = useState([]);
  const [materialLineOrders, setMaterialLineOrders] = useState([]);
  const [MaterialOrder, setMaterialOrder] = useState([]);

  const [rmaWarning, setRmaWarning] = useState("");
  const [materialOrderInformation, setMaterialOrderInformation] = useState({
    MOID: "",
    orderNumber: "",
    serviceOfferID: "",
    serviceDescription: "",
    orderType: "",
    shippingPriority: "",
    ReadyForClosureDate: "",
    caseID: "",
    contact: null,
    DeliveryRequestedDate: null,
    CollectionRequestedDate: null,
    promoCode: "",
    customerInducedDamage: false,
    accidentalDamageProtection: false,
    defectiveMediaRetention: false,
    notificationNumber: "",
    SalesOrderNumber: "",
    resourceName: "",
    resourceId: "",
    workOrder: null,
    parentMO: null,
    isBCPOrder: false,
    materialOrderType: "",
    eotOrderNumber: "",
    AWB_InCode: "",
    AWB_OutCode: "",
    RMAStatus: null,
    RMANumber: "",
  });
  const [error, setError] = useState(null);

  const [updatedLineItems, setUpdatedLineItems] = useState({}); 

  const handleStatusChange = (lineItemID, newStatus) => {
    setUpdatedLineItems((prev) => ({
      ...prev,
      [lineItemID]: newStatus
    }));
    console.log("Handle Status Change ",lineItemID)
    console.log("Handle Status Change ",newStatus)
  };


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

  const handleMaterialOrderChange = (field) => (valueOrEvent) => {
    const value =
      valueOrEvent && valueOrEvent.target !== undefined
        ? valueOrEvent.target.value
        : valueOrEvent;

    setMaterialOrderInformation((prev) => {
      const updated = { ...prev, [field]: value};
      // if(field === "SalesOrderNumber"){
      //   if(prev.RMANumber && prev.RMANumber.length > 0){
      //     if(prev.RMANumber.startsWith(value)){
      //       setRmaWarning("");
      //     } else{
      //       setRmaWarning("⚠️ RMA Number tidak sesuai dengan Sales Order Number");
      //     }
      //   } else{
      //     setRmaWarning("");
      //   }
      // }

      // if(field === "RMANumber"){
      //   if(value && prev.SalesOrderNumber){
      //     if(value.startsWith(prev.SalesOrderNumber)){
      //       setRmaWarning("");
      //     }else{
      //       setRmaWarning("⚠️ RMA Number tidak sesuai dengan Sales Order Number")
      //     }
      //   }else{
      //     setRmaWarning("");
      //   }
      // }
      return updated;
    })
  };



  // Fetch Material Order
  const fetchMaterialOrder = async () => {
    try {
      const res = await ApiCustomer.get(`/api/material-order/${moid}`);
      const data = res.data.data;

      setMaterialOrders(data);
    
      // Save the material order information to the state
      setMaterialOrderInformation({
        MOID: data.MOID || "",
        orderNumber: data.MOID || "",
        serviceOfferID: data.ServiceOfferID || "",
        serviceDescription: data.ServiceDescription || "",
        orderType: data.OrderType || "",
        shippingPriority: data.ShippingPriority || "",
        ReadyForClosureDate: DateHelper.fromDB(data.ReadyForClosureDate || ""),
        caseID: data.workorder?.CaseID || "",
        contact: data.workorder?.caseinformation?.contact_information
          ? `${data.workorder.caseinformation.contact_information.FirstName} ${data.workorder.caseinformation.contact_information.LastName}`
          : null,
        DeliveryRequestedDate: DateHelper.fromDB(
          data.DeliveryRequestedDate || ""
        ),
        CollectionRequestedDate: DateHelper.fromDB(
          data.CollectionRequestedDate || ""
        ),
        promoCode: data.PromoCode || "",
        customerInducedDamage: data.CustomerInducedDamage || false,
        accidentalDamageProtection: data.AccidentalDamageProtection || false,
        defectiveMediaRetention: data.DefectiveMediaRetention || false,
        notificationNumber: data.NotificationNumber || "",
        SalesOrderNumber: data.SalesOrderNumber || "",
        resourceName: data.Resource?.Name || "",
        resourceId: data.Resource?.ResourceId || "",
        workOrder: data.WOID || null,
        parentMO: data.parentMO?.MOID || null,
        isBCPOrder: data.IsBCPOrder || false,
        materialOrderType: data.MaterialOrderType || "",
        eotOrderNumber: data.EOTOrderNumber || "",
        AWB_InCode: data.AWB_InCode || "",
        AWB_OutCode: data.AWB_OutCode || "",
        RMAStatus: data.RMAStatus || null,
        RMANumber: data.RMANumber || "",
      });

      console.log("Fetched Material Order:", data);

      updateDraft("moid", data.MOID);
    } catch (err) {
      console.error("Failed to fetch material orders:", err);
      setError("Failed to fetch material order data");
    }
  };

  const tabs = [
    { value: "mo_info", label: "Mo Information", hidden: true },
    { value: "mo_items", label: "Material Order Line Items", hidden: true },
    { value: "entitlement_sla", label: "Entitlement & SLA", hidden: true },
    { value: "billing_quotation", label: "Billing & Quotation", hidden: true },
    { value: "notes_attaechment", label: "Notes & Attachment", hidden: true },
  ];

  const fetchMaterialLineOrdersInMODetail = async () => {
    try {
      const res = await ApiCustomer.get(
        `/api/material-order/material-order-line-items?MOID=${moid}`
      );
      setMaterialLineOrders(res.data.data);
     
    } catch (err) {
      console.error("Failed to fetch material line orders:", err);
      setError("Failed to fetch material line orders");
    }
  };

  useEffect(() => {
    Swal.fire({
      title: "Memuat Data...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Run both fetch functions in parallel
    Promise.all([fetchMaterialOrder(), fetchMaterialLineOrdersInMODetail()])
      .then(() => {
        Swal.close();
      })
      .catch((err) => {
        Swal.close();
      });
  }, [moid]);

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

   

  let canEditapo;
  const allowedRoles = ["apo", "lg", "admin"];

    
  if (materialOrders?.OrderStatus === "Closed" || materialOrders?.OrderStatus === "Cancelled") {
    canEditapo = false;
  } else {
    canEditapo = allowedRoles.includes(user?.role);
  }

  console.log("tw", materialOrders?.workorder?.caseinformation?.Owner)
  
  return (
    <div>
      {materialOrders.OrderStatus === "Closed" ? (
        <div className="p-4 my-2 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500">
          This material order is <strong>read-only</strong> because it is{" "}
          <strong>Closed</strong>.
          </div>
          ) : materialOrders.OrderStatus === "Cancelled" ? (
        <div className="p-4 my-2 text-red-700 bg-red-100 border-l-4 border-red-500">
          This material order is <strong>read-only</strong> because it is{" "}
          <strong>Cancelled</strong>.
        </div>
      ) : null}
      <TabsServiceMO 
        materialOrders={materialOrders} 
        updatedLineItems={updatedLineItems}
        // moForm={moForm}
        // setMoForm={setMoForm}
        materialOrderInformation={materialOrderInformation}
      />
      <Card className="mt-2 rounded-none">
        <CardContent className="p-0">
          <Tabs defaultValue="mo_info">
            <Card className="flex flex-col gap-3 p-4 h-25">
              <CardTitle className="text-xl">
                {materialOrders.MOID} for {materialOrders.WOID}
              </CardTitle>
              <CardTitle className="text-sm">
                Material Order . Informations
              </CardTitle>
              <TabsList className="bg-white ">
                {tabs.map((tab, index) =>
                  tab.component ? (
                    <div key={index}>{tab.component}</div>
                  ) : (
                    <TabsTrigger
                      key={index}
                      variant={"underline"}
                      value={tab.value}
                      disabled={tab.disable}
                      hidden={tab.hidden}
                      className={"font-normal"}
                    >
                      {tab.label}
                    </TabsTrigger>
                  )
                )}
                {/* <SelectBarRelated></SelectBarRelated> */}
              </TabsList>
            </Card>

            <div className="p-2">
              <Card className="rounded-md">
                <CardHeader>
                  <CardTitle className="text-lg">Order Information</CardTitle>
                  <hr />
                </CardHeader>
                <CardContent className="grid items-center grid-cols-2 md:grid-cols-4 gap-5">
                  <CaseField label={"Case ID"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={materialOrders.workorder?.CaseID}
                    />
                  </CaseField>

                  <CaseField label={"Resource Name"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={
                        materialOrders.workorder?.bookings?.[0]
                          ?.bookingDetails?.[0]?.ResourceId
                      }
                    />
                  </CaseField>

                  <CaseField label={"Contact"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={`${materialOrders.workorder?.caseinformation?.contact_information?.Salutation} ${materialOrders.workorder?.caseinformation?.contact_information?.FirstName} ${materialOrders.workorder?.caseinformation?.contact_information?.LastName}`}
                    />
                  </CaseField>

                  <CaseField label={"Service Offer ID"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={materialOrders?.workorder?.serviceCatalog?.warranty_services?.Service_offerID}
                    />
                  </CaseField>

                  <CaseField label={"Work Order"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={materialOrders.WOID}
                    />
                  </CaseField>

                  <CaseField label={"Service Description"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={materialOrders?.workorder?.serviceCatalog?.warranty_services?.Service_description}
                    />
                  </CaseField>

                  <CaseField label={"Order Number"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={materialOrders.MOID}
                    />
                  </CaseField>

                  <CaseField label={"Sales Order Number"} star={user?.role === 'apo'} lock={!canEditapo}>
                    <Input
                      variant={"invisible"}
                      type="text"
                      value={materialOrderInformation?.SalesOrderNumber || ""}
                      placeholder="---"
                      onChange={handleMaterialOrderChange("SalesOrderNumber")}
                      // onBlur={() =>{
                      //   if (!materialOrderInformation?.RMANumber) {
                      //     setMaterialOrderInformation(prev => ({
                      //       ...prev,
                      //       RMANumber: prev.SalesOrderNumber
                      //     }))
                      //   }
                      // }}
                    />
                  </CaseField>

                  <CaseField label={"Order Type"} lock>
                    <Input
                      variant={"invisible"}
                      type="text"
                      className=""
                      value={materialOrders.OrderType}
                    />
                  </CaseField>

                  <CaseField label="RMA Number" star={user?.role === 'apo'} lock={!canEditapo}>
                    <Input variant="invisible" placeholder="---" 
                    value={materialOrderInformation?.RMANumber || ""}
                    onChange={handleMaterialOrderChange("RMANumber")}
                    />
                    {/* {rmaWarning && (
                      <span style={{ color: "orange", fontSize: "0.8rem", marginTop: 2 }}>
                        {rmaWarning}
                      </span>
                    )} */}
                  </CaseField>  

                  <CaseField
                    label="RMA Status"
                    lock={!canEditapo}
                    star={user?.role === 'lg'}
                  >
                    <SearchCommandBlock
                      value={materialOrderInformation?.RMAStatus || null}
                      onChange={handleMaterialOrderChange("RMAStatus")}
                      placeholder="Select RMA Status"
                      options={RMA_STATUS_OPTIONS}
                      // readOnly={!canEdit}
                    />
                  </CaseField>
                  
                  <CaseField
                    label={"ETA Delivery Required Date (Customer Time)"}
                    lock={!canEditapo}
                    star= {user?.role === 'apo'}
                  >
                    {console.log("MATERIAL ORDER INFO ", materialOrderInformation)}
                    <DatePicker
                      value={materialOrderInformation?.DeliveryRequestedDate ? new Date(materialOrderInformation?.DeliveryRequestedDate) : null}
                      onChange={handleMaterialOrderChange("DeliveryRequestedDate")}
                    />
                  </CaseField>

                  <CaseField label={"Part on Hand CE Date"}  star={user?.role === 'lg'} lock={!canEditapo}>
                    <DatePicker
                      value={materialOrderInformation?.CollectionRequestedDate ? new Date(materialOrderInformation?.CollectionRequestedDate) : null}
                      onChange={handleMaterialOrderChange("CollectionRequestedDate")}
                    />
                  </CaseField>

                  <CaseField label={"Part OUT CE Ready For Closure Date"} star={user?.role === 'lg'} lock={!canEditapo}>
                    <DatePicker
                      value={materialOrderInformation?.ReadyForClosureDate ? new Date(materialOrderInformation?.ReadyForClosureDate) : null}
                      onChange={handleMaterialOrderChange("ReadyForClosureDate")}
                    />
                  </CaseField>

                  <CaseField label={"AWB no. in"} star={user?.role === 'lg'} lock={!canEditapo}>
                    <Input variant="invisible" placeholder="---"               
                      value={materialOrderInformation?.AWB_InCode || null}
                      onChange={handleMaterialOrderChange("AWB_InCode")}
                    />
                  </CaseField>
                  <CaseField label={"AWB no. out"} star={user?.role === 'lg'} lock={!canEditapo}>
                    <Input variant="invisible" placeholder="---" 
                      value={materialOrderInformation?.AWB_OutCode || null}
                      onChange={handleMaterialOrderChange("AWB_OutCode")}
                    />
                  </CaseField>

                  <Accordion type="single" collapsible className="col-span-2 md:col-span-4 ">
                    <AccordionItem value="more-detail" >
                      <AccordionTrigger className=" ">More Detail . . .</AccordionTrigger>
                      <AccordionContent className={"p-2"}>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <CaseField label={"Notification Number"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={"---"}
                            />
                          </CaseField>
                          <CaseField label={"Shipping Priority"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={materialOrders.ShippingPriority}
                            />
                          </CaseField>
                          <CaseField label={"Promo Code"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={"---"}
                            />
                          </CaseField>
                          <CaseField label={"Parent MO"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={"---"}
                            />
                          </CaseField>
                          
                          <CaseField label={"Customer Induced Damage"} icon >
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={materialOrders.ReadyForClosureDate}
                            />
                          </CaseField>
                          <CaseField label={"BCP Order"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={"---"}
                            />
                          </CaseField>
                          <CaseField label={"Accidental Damage Proctection"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={"---"}
                            />
                          </CaseField>
                          <CaseField label={"Material Order Type"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={"---"}
                            />
                          </CaseField>
                          <CaseField label={"Detective Media Retention"} icon>
                            <Input
                              variant={"invisible"}
                              type="text"
                              className=""
                              value={"---"}
                            />
                          </CaseField>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
           
            
            {/* Booking */}
            <Card className="flex-col mt-5">
              <span className="ml-5 text-xl font-bold">Booking</span>
              <CardContent className="grid">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Order Number</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Order Type</TableHead>
                      <TableHead>Ready For Closure</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow key={materialOrders.MOID}
                    className={
                        materialOrders.OrderStatus === "New" ? "cursor-pointer bg-green-100" :
                        materialOrders.OrderStatus === "Shipped" ? "cursor-pointer bg-yellow-100" :
                        materialOrders.OrderStatus === "Ordered" ? "cursor-pointer bg-blue-100" :
                        materialOrders.OrderStatus === "Closed" ? "cursor-pointer bg-gray-100" :
                        materialOrders.OrderStatus === "BackOrdered" ? "cursor-pointer bg-purple-100" 
                        : "cursor-pointer bg-red-100"
                      }
                    
                    >
                      <TableCell>{materialOrders.MOID}</TableCell>
                      <TableCell>{materialOrders.workorder?.CaseID}</TableCell>
                      <TableCell>{formatDate(materialOrders.CreatedOn)}</TableCell>
                      <TableCell>{materialOrders.OrderStatus}</TableCell>
                      <TableCell>{materialOrders.OrderType}</TableCell>
                      <TableCell>{formatDate(materialOrders.ReadyForClosureDate)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            
            {/* Material Order Line Items */}
            <Card className="flex-col mt-7">
              <span className="ml-5 text-xl font-bold">
                Material Order Line Items
              </span>
              <CardContent className="grid">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Mo Line Item</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ATP</TableHead>
                      <TableHead>Part No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Promise</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Ship</TableHead>
                      <TableHead>Storage</TableHead>
                      <TableHead>Offered</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {materialLineOrders.map((lineitem) => (
                      <TableRow 
                      key={lineitem.LineItemID}
                      onClick={() => navigate(`/app/mo_detail/${lineitem.LineItemID}`)}
                      className={
                        lineitem.Status === "New" ? "cursor-pointer bg-green-100" :
                        lineitem.Status === "Shipped" ? "cursor-pointer bg-yellow-100" :
                        lineitem.Status === "Ordered" ? "cursor-pointer bg-blue-100" :
                        lineitem.Status === "Closed" ? "cursor-pointer bg-gray-100" :
                        lineitem.Status === "BackOrdered" ? "cursor-pointer bg-purple-100" 
                        : "cursor-pointer bg-red-100"
                      }
                      >
                        <TableCell className="font-medium">
                            {lineitem.MOID} - {lineitem.LineNumber}
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={lineitem.Status}
                            onValueChange={(newStatus) => handleStatusChange(lineitem.LineItemID, newStatus)}
                            disabled={!canEditapo}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="New">New</SelectItem>
                              <SelectItem value="Ordered">Ordered</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="BackOrdered">BackOrdered</SelectItem>
                              <SelectItem value="Closed">Closed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{lineitem.ATPStatus}</TableCell>
                        <TableCell>{lineitem.PartNumber}</TableCell>
                        <TableCell>{lineitem.Description}</TableCell>
                        <TableCell>---</TableCell>
                        <TableCell>---</TableCell>
                        <TableCell>---</TableCell>
                        <TableCell>---</TableCell>
                        <TableCell>---</TableCell>
                        <TableCell>---</TableCell>
                        <TableCell>---</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
             </div>

            <TabsContent value="mo_info"></TabsContent>

            <TabsContent value="mo_items">
              <Card className="rounded-md mt-7">
                <span className="ml-5 text-xl font-bold">Failure Code</span>
                <CardContent className="grid grid-flow-col grid-rows-2 gap-5 h-25">
                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Category 1</span>
                    <span className="ml-40">...</span>
                  </div>

                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Failure code 1</span>
                    <span className="ml-35">...</span>
                  </div>

                  <div className="flex font-bold">
                    <span className="ml-7">Category 2</span>
                    <span className="ml-42">...</span>
                  </div>

                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Failure code 2</span>
                    <span className="ml-37">...</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-md mt-7">
                <span className="ml-5 text-xl font-bold">Security Check</span>
                <CardContent className="grid h-10 grid-flow-col grid-rows-2 gap-5">
                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Security Check</span>
                    <span className="ml-40">...</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-md mt-7">
                <span className="ml-5 text-xl font-bold">S4 Messages</span>
                <CardContent className="grid h-10 grid-flow-col grid-rows-2 gap-5">
                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>S4 Messages</span>
                    <span className="ml-40">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entitlement_sla">
              <Card className="flex-col mt-5">
                <span className="ml-5 text-xl font-bold">
                  Entitlement & SLA
                </span>
                <CardContent className="grid gap-5">
                  <div className="flex font-bold">
                    <span>Entitlement & SLA</span>
                    <span className="ml-60">...</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-col mt-5">
                <span className="ml-5 text-xl font-bold">Actions</span>
                <CardContent className="grid gap-4.5 grid-flow-col grid-rows-3">
                  <div className="flex font-bold">
                    <span className="ml-7">Action Booking</span>
                    <span className="ml-49.5">...</span>
                  </div>

                  <div className="flex font-bold">
                    <span className="ml-7">Action Booking Status</span>
                    <span className="ml-37">...</span>
                  </div>

                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Action Date</span>
                    <span className="ml-56.5">...</span>
                  </div>

                  <div className="flex font-bold">
                    <span className="ml-7">Action Count</span>
                    <span className="ml-50">...</span>
                  </div>

                  <div className="flex font-bold">
                    <span className="ml-7">Finished By</span>
                    <span className="ml-53.5">...</span>
                  </div>

                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Finished on Date</span>
                    <span className="ml-43.5">...</span>
                  </div>

                  <div className="flex font-bold">
                    <span>Partner Contact</span>
                    <span className="ml-40">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing_quotation">
              <Card className="flex-col mt-7">
                <span className="ml-5 text-xl font-bold">
                  Billing & Quotation
                </span>
                <CardContent className="grid">
                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span> Billing & Quotation</span>
                    <span className="ml-30">...</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes_attaechment">
              <Card className="flex-col mt-7">
                <span className="ml-5 text-xl font-bold">
                  Notes & Attachment
                </span>
                <CardContent className="grid">
                  <div className="flex font-bold">
                    <Lock className="mr-2 size-5"></Lock>
                    <span>Notes & Attachment</span>
                    <span className="ml-30">...</span>
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
