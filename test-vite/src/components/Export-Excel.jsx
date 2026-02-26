import React from "react";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import ApiCustomer from "@/api";
import * as XLSX from "xlsx";
import { Button } from "./ui/button";
import { STATUS_ENUM_TO_LABEL } from "@/hooks/useCaseStatus";

export const ExportExcel = ({ caseData, resource, isAdmin }) => {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      const url = "/api/case-information"+ (!isAdmin ? `?resource=${resource}` : '')
      const res = await ApiCustomer.get(url);
      const json = res.data
      const transformed = json.data.map((c) => {
        // Get accessories string
        const accessories =
          c.caseinformation.accessory?.map((a) => a.Accessories).join(", ") || "N/A";

        // Calculate range in days between CreatedOn and CaseClosedDate
        let range = "N/A";
        if (
          c.caseinformation.CaseStatus === "Close" &&
          c.caseinformation.CreatedOn &&
          c.caseinformation.CaseClosedDate
        ) {
        const created = new Date(c.caseinformation.CreatedOn);
        const closed = new Date(c.caseinformation.CaseClosedDate);
        const diffTime = Math.abs(closed - created);
        range = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + " days";
        }

        let jarak;
        const CreatedCase = new Date(c.caseinformation.CreatedOn);

        const finishRepairLog = c.UpdatedActionLogs.find(
          log => log.dataNew === "FinishRepair"  || log.dataNew === "Finish Repair"
        );

        const partOrderLog = c.UpdatedActionLogs.find(
          log => log.dataNew === "PartOrder"
        );

        if (finishRepairLog) {
          const finisRepair = new Date(finishRepairLog.ChangeAt);
          const Waktu = Math.abs(CreatedCase - finisRepair);
          jarak = Math.ceil(Waktu / (1000 * 60 * 60 * 24)) + " days";
        } else {
          jarak = "N/A";
        }


        return {
          CaseID: c.caseinformation.CaseID || "N/A",
          CaseID_Manual: c.caseinformation.CaseID_Manual || "N/A",
          ProductTower: c.caseinformation.asset_information?.product_information?.product_type?.ProductTower || "N/A",
          Case_Notes:c.caseinformation.CaseProductNote || "N/A",
          ProductGroup: c.caseinformation.asset_information?.product_information?.product_type?.ProductGroup || "N/A",     
          ProductLine: c.caseinformation.asset_information?.product_information?.ProductLine || "N/A",     
          ProductType: c.caseinformation.asset_information?.product_information?.product_type?.ProductType || "N/A",
          ProductNumber: c.caseinformation.asset_information?.ProductNumber || "N/A",
          ProductName: c.caseinformation.asset_information?.product_information?.ProductName || "N/A",
          SerialNumber: c.caseinformation.asset_information?.SerialNumber || "N/A",
          WarrantyStatus: c.caseinformation.asset_information?.WarrantyOTCCode?.Description || "N/A",
          Company_Code : "HPSC KK",
          Company_Name: "PT. JAVA ABADI GEMILANG",
          CE_Name: c.caseinformation.workorder?.[0]?.owner?.Name || "N/A",
          CaseType: c.caseinformation.CaseType || "N/A",
          CaseStatus: c.caseinformation.CaseStatus || "N/A",
          Customer_Company: c.caseinformation.contact_information?.site_account?.Company || "N/A", 
          Customer_Name: `${
            c.caseinformation.contact_information?.FirstName || "N/A"
          } ${c.caseinformation.contact_information?.LastName ?? ""}`.trim() || "N/A",
          Customer_City : c.caseinformation.contact_information?.City || "N/A",
          Received_Date: c.caseinformation.CreatedOn ? new Date (c.caseinformation.CreatedOn).toLocaleString() : "N/A",
          Part_OrderDate: partOrderLog ? new Date (c.UpdatedActionLogs.find(log => log.dataNew === "PartOrder").ChangeAt).toLocaleString() : "N/A",
          FinishRepair : finishRepairLog ? new Date (c.UpdatedActionLogs.find(log => log.dataNew === "FinishRepair" || log.dataNew === "Finish Repair").ChangeAt).toLocaleString() : "N/A",
          Closed_Date: c.caseinformation.CaseClosedDate ? new Date (c.caseinformation.CaseClosedDate).toLocaleString() : "N/A",
          Case_ID_Manual_Date : c.caseinformation.CaseID_Manual_Date ? new Date (c.caseinformation.CaseID_Manual_Date).toLocaleString() : "N/A",
          //  NEW COLUMNS
          Accessories: accessories,
          TatFinisRepair : jarak,
          DurationDays: range,
          Delay_Code: c.caseinformation.workorder[0]?.DelayCode || "N/A",
        };
      });
      setCases(transformed);
    };

    fetchCases();
  }, [resource, isAdmin]);

  const labelCase = cases.map((items) => ({
    "ID Case" : items.CaseID,
    "Case ID Manual" : items.CaseID_Manual,
    "Case Note" : items.Case_Notes,
    "Product Tower" : items.ProductTower,
    "Product Group" : items.ProductGroup,
    "Product Line"  : items.ProductLine,
    "Product Type" : items.ProductType,
    "Product No" : items.ProductNumber,
    "Product Name" : items.ProductName,
    "Serial No" : items.SerialNumber,
    "Warranty Status" : items.WarrantyStatus,
    "Company Code" : items.Company_Code,
    "Company Name" : items.Company_Name,
    "CE Name" : items.CE_Name,
    "Case Type" : items.CaseType,
    "Case Status" : STATUS_ENUM_TO_LABEL[items.CaseStatus],
    "Customer Company" : items.Customer_Company,
    "Customer Name" : items.Customer_Name,
    "Customer City" : items.Customer_City,  
    "Received Date" : items.Received_Date,
    "Part Order Date" : items.Part_OrderDate,
    "Finish Repair Date" : items.FinishRepair,
    "Closed Date" : items.Closed_Date,
    "Case ID Manual Date" : items.Case_ID_Manual_Date,
    "TAT Finish Repair" : items.TatFinisRepair,
    "TAT E2E" : items.DurationDays,
    "Delay Code" : items.Delay_Code
  }))


  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(labelCase);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");
    XLSX.writeFile(workbook, "Case Information.xlsx");
  };
  return (
    <div>
      <Button
        onClick={exportToExcel}
        className={"bg-blue-500 text-white hover:bg-blue-400 dark:bg-sky-600 dark:hover:bg-sky-300"} 
      >
        Export to Excel
      </Button>
    </div>
  );
};

export const ExportExcelPart = ({}) => {
  const [MoData, setMoData] = useState([]);

  useEffect(() => {
    const fetchMo = async () => {
      const res = await ApiCustomer.get("/api/mo-detaill");
      const json = res.data
      const transformed = json.data.map((m) => {
      return {
       Moid: m.MOID || "N/A",
       PartNumber: m.materialorderlineitems?.[0]?.PartNumber || "N/A",
       Description: m.materialorderlineitems?.[0]?.Description || "N/A",
       Qty : m.materialorderlineitems?.[0]?.Quantity ?? 0,
       Qty_Used : Number(m.materialorderlineitems?.[0]?.QuantityUsed) ?? 0,
       CTBad : m.materialorderlineitems?.[0]?.RemovedPartNumber || "N/A",
       CTNew : m.materialorderlineitems?.[0]?.RemovedSerialNumber || "N/A", 
       UEFicode: m.materialorderlineitems?.[0]?.UEFICode || "N/A",
       SalesOrderNumber: m.SalesOrderNumber || "N/A",
       RMANumber: m.RMANumber || "N/A",
       RMAStatus: m.RMAStatus || "N/A",
       OrderStatus: m.OrderStatus || "N/A",
       AWB_InCode: m.AWB_InCode || "N/A",
       AWB_OutCode: m.AWB_OutCode || "N/A",
       Part_RequestDate : m.CreatedOn ? new Date (m.CreatedOn).toLocaleString() : "N/A",
       Part_OrderDate: m.workorder?.caseinformation?.ActionLog.find(log => log.dataNew === "PartOrder") ? new Date (m.workorder?.caseinformation?.ActionLog.find(log => log.dataNew === "PartOrder").ChangeAt).toLocaleString() : "N/A",
       ETA_Date : m.DeliveryRequestedDate ? new Date(m.DeliveryRequestedDate).toLocaleString() : "N/A",
       Part_InDate: m.workorder?.caseinformation?.UpdatedActionLogs.find(log => log.dataNew === "Shipped") ? new Date (m.workorder?.caseinformation?.UpdatedActionLogs.find(log => log.dataNew === "Shipped").ChangeAt).toLocaleString() : "N/A",
       Part_OnHandCE: m.CollectionRequestedDate ? new Date (m.CollectionRequestedDate).toLocaleString() : "N/A",
      }
      })
      setMoData(transformed)
    }

    fetchMo();
  }, []);

  const labelPart = MoData.map((items) => ({
    "ID Material Order": items.Moid,
    "HP Part no." : items.PartNumber,
    "Part Name" : items.Description,
    "Qty" : items.Qty,
    "Qty Used" : items.Qty_Used,
    "Bad CT Code" : items.CTBad,
    "CT Code New" : items.CTNew,
    "UEFI Code" : items.UEFicode,
    "Sales Order Number" : items.SalesOrderNumber,
    "RMA Number" : items.RMANumber,
    "RMA Status" : items.RMAStatus,
    "Order Status" : items.OrderStatus,
    "AWB In Code" : items.AWB_InCode,
    "AWB Out Code" : items.AWB_OutCode,
    "Part Request Date" : items.Part_RequestDate,
    "Part Order Date" : items.Part_OrderDate,
    "ETA Date" : items.ETA_Date,
    "Part In Date": items.Part_InDate,
    "Part On Hand CE Date" : items.Part_OnHandCE
  }))

  const exportToExcelPart = () => {
    const worksheet = XLSX.utils.json_to_sheet(labelPart)
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sparepart");
    XLSX.writeFile(workbook, "Sparepart.xlsx")
  };
  return (
    <div>
      <Button
        onClick={exportToExcelPart}
        className={"bg-blue-400 text-white hover:bg-blue-300 cursor-pointer dark:bg-gradient-to-b dark:border-2 dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%"}
      >
        Export to Excel
      </Button>
    </div>
  )
}
