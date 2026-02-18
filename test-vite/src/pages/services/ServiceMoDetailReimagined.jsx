// services/service-materialApo.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchCommandBlock } from "@/components/sc-select";
import { Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { TabsServiceMO } from "./service-case";
import DatePicker from "@/components/date-picker";
import { useDraft } from "@/components/DraftContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CaseField from "@/components/CaseField";
import { useAuth } from "@/context/auth-context";
import { cn, formatDate } from "@/lib/utils";
import { useMaterialOrderStore } from "@/hooks/useMaterialOrderStore";
import { TabsServiceMO } from "./TabsServiceReimagined";
import { CardDescription } from "../../components/ui/card";

export const RMA_STATUS_OPTIONS = [
  { value: "InOutCE", label: "In & On Hand CE" },
  { value: "ReturnLogistic", label: "Return via Logistic" },
  { value: "ReturnDHL", label: "Return to DHL/SC" },
  { value: "FullCharge", label: "Full Charge" },
];

export const ServiceMaterialApo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateDraft } = useDraft();
  const materialOrder = useMaterialOrderStore((s) => s.materialOrder);
  const lineItems = useMaterialOrderStore((s) => s.lineItems);
  const materialInfo = useMaterialOrderStore((s) => s.materialInfo);
  const updatedLineItems = useMaterialOrderStore((s) => s.updatedLineItems);
  const setMaterialInfoField = useMaterialOrderStore(
    (s) => s.setMaterialInfoField
  );
  const setLineItemStatus = useMaterialOrderStore(
    (s) => s.setLineItemStatus
  );
  // ----- permissions -----
  const allowedRoles = ["apo", "lg", "admin", "spv"];
  let canEditapo = false;

  if (
    materialOrder?.OrderStatus === "Closed" ||
    materialOrder?.OrderStatus === "Cancelled"
  ) {
    canEditapo = false;
  } else {
    canEditapo = allowedRoles.includes(user?.role);
  }

  const tabs = [
    { value: "mo_info", label: "Mo Information"},
    { value: "mo_items", label: "Material Order Line Items"},
    { value: "entitlement_sla", label: "Entitlement & SLA", hidden: true },
    { value: "billing_quotation", label: "Billing & Quotation", hidden: true },
    { value: "notes_attaechment", label: "Notes & Attachment", hidden: true },
  ];

  // ----- helpers for form updates -----
  const handleInfoChange =
    (field) => (valueOrEvent) => {
      const value =
        valueOrEvent && valueOrEvent.target !== undefined
          ? valueOrEvent.target.value
          : valueOrEvent;
      setMaterialInfoField(field, value ?? "");
    };

  const handleDateChange =
    (field) => (date) => {
      setMaterialInfoField(field, date ? date.toISOString() : null);
    };

  const handleStatusChange = (lineItemID, newStatus) => {
    setLineItemStatus(lineItemID, newStatus);
  };

  // ----------------- RENDER -----------------
  return (
    <div className="bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
      {/* Status banners */}
      {materialOrder?.OrderStatus === "Closed" ? (
        <div className="p-4  text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500">
          This material order is <strong>read-only</strong> because it is{" "}
          <strong>Closed</strong>.
        </div>
      ) : materialOrder?.OrderStatus === "Cancelled" ? (
        <div className="p-4  text-red-700 bg-red-100 border-l-4 border-red-500">
          This material order is <strong>read-only</strong> because it is{" "}
          <strong>Cancelled</strong>.
        </div>
      ) : null}

      <TabsServiceMO />

      <Card className="mt-2 rounded-none border-none bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
        <CardContent className="p-0">
          <Tabs defaultValue="mo_info">
            {/* Header card */}
            <Card className="flex  p-4 h-fit rounded-none dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600">
              <CardHeader>
                <CardTitle className="text-xl">
                  {materialOrder?.MOID} for {materialOrder?.WOID}
                </CardTitle>
                <CardDescription>
                  Material Order Details and Management Total Line Items:{" "}
                  <span className="font-semibold">{lineItems.length}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between w-full">
                <h1>{materialOrder?.Description}</h1>
                {/* <div>
                  <span className="font-semibold">Order Status:</span>
                  {lineItems.map((items) => (
                    <div
                      key={items.lineItemID}
     
                    >
                    <SearchCommandBlock
                      value={items.Status}
                      onChange={(newStatus) =>
                            handleStatusChange(
                              items.LineItemID,
                              newStatus
                            )
                          }
                      placeholder="Select status"
                      options={[
                        { value: "New", label: "New" },
                        { value: "Ordered", label: "Ordered" },
                        { value: "Shipped", label: "Shipped" },
                        { value: "BackOrdered", label: "BackOrdered" },
                        { value: "Closed", label: "Closed" },
                        { value: "Cancelled", label: "Cancelled" },
                      ]}
                      disabled={!canEditapo}
                    />
                </div>
              ))}
                </div> */}
              </CardContent>
            </Card>
              {/* <div className=" border-t bg-gray-50 w-full overflow-x-auto ">
              <TabsList className="sm:w-full w-fit flex gap-4 h-fit p-0  dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600 dark:rounded-none">
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
                      className="text-sm font-medium dark:border-b-slate-500 dark:text-gray-300"
                    >
                      {tab.label}
                    </TabsTrigger>
                  )
                )}
              </TabsList>
            </div> */}

            {/* MAIN CONTENT */}
            <div className="p-2">
              {/* ========== ORDER INFO ========== */}
              <Card className="rounded-md dark:bg-gradient-to-tl dark:from-slate-600 dark:via-slate-800 dark:to-slate-800  dark:border-slate-700 dark:border-4">
                <CardHeader>
                  <CardTitle className="text-lg">Order Information</CardTitle>
                  <hr className="dark:border-gray-400"/>
                </CardHeader>
                <CardContent className="grid items-center grid-cols-1 md:grid-cols-4 gap-5">
                  <CaseField label={"Case ID"} lock>
                    <Input
                      className={"dark:text-white cursor-pointer hover:text-blue-400 dark:hover:text-blue-400 dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={materialOrder?.workorder?.CaseID || ""}
                      onClick={()=>{
                        if(materialOrder?.workorder?.CaseID){
                           navigate(`/app/case/${materialOrder?.workorder?.CaseID}`);
                        }
                      }}
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"Resource Name"} lock>
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={
                        materialOrder?.workorder?.bookings?.[0]
                          ?.bookingDetails?.[0]?.ResourceId || ""
                      }
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"Contact"} lock>
                    <Input
                    className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={
                        materialOrder?.workorder?.caseinformation
                          ?.contact_information
                          ? `${materialOrder.workorder.caseinformation.contact_information.Salutation} ${materialOrder.workorder.caseinformation.contact_information.FirstName} ${materialOrder.workorder.caseinformation.contact_information.LastName}`
                          : ""
                      }
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"Service Offer ID"} lock>
                    <Input
                    className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={
                        materialOrder?.workorder?.serviceCatalog
                          ?.warranty_services?.Service_offerID || ""
                      }
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"Work Order"} lock>
                    <Input
                    className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={materialOrder?.WOID || ""}
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"Service Description"} lock>
                    <Input
                    className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={
                        materialOrder?.workorder?.serviceCatalog
                          ?.warranty_services?.Service_description || ""
                      }
                      readOnly
                    />
                  </CaseField>

                  <CaseField label={"Order Number"} lock>
                    <Input
                    className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={materialOrder?.MOID || ""}
                      readOnly
                    />
                  </CaseField>

                  <CaseField
                    label={"Sales Order Number"}
                    star={user?.role === "apo"}
                    lock={!canEditapo}
                  >
                    <Input
                    className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={materialInfo.SalesOrderNumber}
                      placeholder="---"
                      onChange={handleInfoChange("SalesOrderNumber")}
                    />
                  </CaseField>

                  <CaseField label={"Order Type"} lock>
                    <Input
                    className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      type="text"
                      value={materialOrder?.OrderType || ""}
                      readOnly
                    />
                  </CaseField>

                  <CaseField
                    label="RMA Number"
                    star={user?.role === "apo"}
                    lock={!canEditapo}
                  >
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      value={materialInfo.RMANumber}
                      onChange={handleInfoChange("RMANumber")}
                    />
                  </CaseField>

                  <CaseField
                    label="RMA Status"
                    lock={!canEditapo}
                    star={user?.role === "lg"}
                  >
                    <SearchCommandBlock
                      value={materialInfo.RMAStatus}
                      onChange={handleInfoChange("RMAStatus")}
                      placeholder="Select RMA Status"
                      options={RMA_STATUS_OPTIONS}
                      className={"dark:bg-transparent dark:ring-1 dark:ring-gray-400"}
                    />
                  </CaseField>

                  <CaseField
                    label={"ETA Delivery Required Date (Customer Time)"}
                    lock={!canEditapo}
                    star={user?.role === "apo"}
                  >
                    <DatePicker
                      value={
                        materialInfo.DeliveryRequestedDate
                          ? new Date(materialInfo.DeliveryRequestedDate)
                          : null
                      }
                      onChange={handleDateChange("DeliveryRequestedDate")}
                    />
                  </CaseField>

                  <CaseField
                    label={"Part on Hand CE Date"}
                    star={user?.role === "lg"}
                    lock={!canEditapo}
                  >
                    <DatePicker
                      value={
                        materialInfo.CollectionRequestedDate
                          ? new Date(materialInfo.CollectionRequestedDate)
                          : null
                      }
                      onChange={handleDateChange("CollectionRequestedDate")}
                    />
                  </CaseField>

                  <CaseField
                    label={"Part OUT CE Ready For Closure Date"}
                    star={user?.role === "lg"}
                    lock={!canEditapo}
                  >
                    <DatePicker
                      value={
                        materialInfo.ReadyForClosureDate
                          ? new Date(materialInfo.ReadyForClosureDate)
                          : null
                      }
                      onChange={handleDateChange("ReadyForClosureDate")}
                    />
                  </CaseField>

                  <CaseField
                    label={"AWB no. in"}
                    star={user?.role === "lg"}
                    lock={!canEditapo}
                  >
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      value={materialInfo.AWB_InCode || ""}
                      onChange={handleInfoChange("AWB_InCode")}
                    />
                  </CaseField>

                  <CaseField
                    label={"AWB no. out"}
                    star={user?.role === "lg"}
                    lock={!canEditapo}
                  >
                    <Input
                      className={"dark:text-white dark:border-b-gray-400 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      placeholder="---"
                      value={materialInfo.AWB_OutCode || ""}
                      onChange={handleInfoChange("AWB_OutCode")}
                    />
                  </CaseField>

                  {/* Accordion more detail */}
                  <Accordion
                    className="col-span-1 md:col-span-4"
                    type="single"
                    collapsible
                  >
                    <AccordionItem value="more-detail">
                      <AccordionTrigger className={"border-1 cursor-pointer decoration-transparent p-2"}>More Detail . . .</AccordionTrigger>
                      <AccordionContent className="mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <CaseField label={"Notification Number"} icon lock>
                            <Input
                              type="text"
                              value={materialOrder?.NotificationNumber || "---"}
                              readOnly
                            />
                          </CaseField>
                          <CaseField label={"Shipping Priority"} icon lock>
                            <Input
                              type="text"
                              value={materialOrder?.ShippingPriority || "---"}
                              readOnly
                            />
                          </CaseField>
                          <CaseField label={"Promo Code"} icon lock>
                            <Input type="text" value={"---"} readOnly />
                          </CaseField>
                          <CaseField label={"Parent MO"} icon lock>
                            <Input
                              type="text"
                              value={materialInfo.parentMO || "---"}
                              readOnly
                            />
                          </CaseField>

                          <CaseField label={"Customer Induced Damage"} icon lock>
                            <Input
                              type="text"
                              value={
                                materialOrder?.CustomerInducedDamage
                                  ? "Yes"
                                  : "No"
                              }
                              readOnly
                            />
                          </CaseField>
                          <CaseField label={"BCP Order"} icon lock>
                            <Input
                              type="text"
                              value={materialInfo.isBCPOrder ? "Yes" : "No"}
                              readOnly
                            />
                          </CaseField>
                          <CaseField
                            label={"Accidental Damage Protection"}
                            icon
                            lock
                          >
                            <Input
                              type="text"
                              value={
                                materialOrder?.AccidentalDamageProtection
                                  ? "Yes"
                                  : "No"
                              }
                              readOnly
                            />
                          </CaseField>
                          <CaseField label={"Material Order Type"} icon lock>
                            <Input
                              type="text"
                              value={materialOrder?.MaterialOrderType || "---"}
                              readOnly
                            />
                          </CaseField>
                          <CaseField label={"Defective Media Retention"} icon lock>
                            <Input
                              type="text"
                              value={
                                materialOrder?.DefectiveMediaRetention
                                  ? "Yes"
                                  : "No"
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

              {/* Booking summary table */}
              <Card className="flex-col mt-5 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600">
                <span className="ml-5 text-xl font-bold">Booking</span>
                <CardContent className="grid">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px] dark:text-white">
                          Order Number
                        </TableHead>
                        <TableHead className="dark:text-white">Case ID</TableHead>
                        <TableHead className="dark:text-white">Created On</TableHead>
                        <TableHead className="dark:text-white">Order Status</TableHead>
                        <TableHead className="dark:text-white">Order Type</TableHead>
                        <TableHead className="dark:text-white">Ready For Closure</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {materialOrder && (
                        <TableRow
                          key={materialOrder.MOID}
                          className={
                            materialOrder.OrderStatus === "New"
                              ? "cursor-pointer bg-green-100 dark:bg-green-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : materialOrder.OrderStatus === "Shipped"
                              ? "cursor-pointer bg-yellow-100 dark:bg-yellow-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : materialOrder.OrderStatus === "Ordered"
                              ? "cursor-pointer bg-blue-100 dark:bg-blue-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : materialOrder.OrderStatus === "Closed"
                              ? "cursor-pointer bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : materialOrder.OrderStatus === "BackOrdered"
                              ? "cursor-pointer bg-purple-100 dark:bg-purple-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : "cursor-pointer bg-red-100 dark:bg-red-600 dark:hover:bg-gray-500 dark:text-gray-300"
                          }
                        >
                          <TableCell>{materialOrder.MOID}</TableCell>
                          <TableCell>
                            {materialOrder.workorder?.CaseID}
                          </TableCell>
                          <TableCell>
                            {formatDate(materialOrder.CreatedOn)}
                          </TableCell>
                          <TableCell>{materialOrder.OrderStatus}</TableCell>
                          <TableCell>{materialOrder.OrderType}</TableCell>
                          <TableCell>
                            {formatDate(materialOrder.ReadyForClosureDate)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Material Order Line Items */}
              <Card className="flex-col mt-7 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800  dark:border-b-slate-600">
                <span className="ml-5 text-xl font-bold">
                  Material Order Line Items
                </span>
                <CardContent className="grid">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px] dark:text-white">
                          Mo Line Item
                        </TableHead>
                        <TableHead className="dark:text-white">Status</TableHead>
                        <TableHead className="dark:text-white">ATP</TableHead>
                        <TableHead className="dark:text-white">Part No</TableHead>
                        <TableHead className="dark:text-white">Description</TableHead>
                        <TableHead className="dark:text-white">Delivery</TableHead>
                        <TableHead className="dark:text-white">Promise</TableHead>
                        <TableHead className="dark:text-white">Expected</TableHead>
                        <TableHead className="dark:text-white">Tracking</TableHead>
                        <TableHead className="dark:text-white">Ship</TableHead>
                        <TableHead className="dark:text-white">Storage</TableHead>
                        <TableHead className="dark:text-white">Offered</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {lineItems.map((lineitem) => (
                        <TableRow
                          key={lineitem.LineItemID}
                          onClick={() =>
                            navigate(`/app/mo_detail/${lineitem.LineItemID}`)
                          }
                          className={
                            lineitem.Status === "New"
                              ? "cursor-pointer bg-green-100 dark:bg-green-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : lineitem.Status === "Shipped"
                              ? "cursor-pointer bg-yellow-100 dark:bg-yellow-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : lineitem.Status === "Ordered"
                              ? "cursor-pointer bg-blue-100 dark:bg-blue-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : lineitem.Status === "Closed"
                              ? "cursor-pointer bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : lineitem.Status === "BackOrdered"
                              ? "cursor-pointer bg-purple-100 dark:bg-purple-600 dark:hover:bg-gray-500 dark:text-gray-300"
                              : "cursor-pointer bg-red-100 dark:bg-red-600 dark:hover:bg-gray-500 dark:text-gray-300"
                          }
                        >
                          <TableCell className="font-medium">
                            {lineitem.MOID} - {lineitem.LineNumber}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lineitem.Status}
                              onValueChange={(newStatus) =>
                                handleStatusChange(
                                  lineitem.LineItemID,
                                  newStatus
                                )
                              }
                              disabled={!canEditapo}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Ordered">Ordered</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="BackOrdered">
                                  BackOrdered
                                </SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                                <SelectItem value="Cancelled">
                                  Cancelled
                                </SelectItem>
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

            {/* Other tabs remain the same as your existing JSX */}
            <TabsContent value="mo_info" />
            {/* ... keep your other TabsContent (mo_items, entitlement_sla, etc.) as-is ... */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

