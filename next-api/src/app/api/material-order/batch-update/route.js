import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";
import { handleActionLogNotifications } from "../../../../../lib/actionLogDispatcher";
import { STATUS_ENUM_TO_LABEL } from "@/utils/EnumToLabel";

const CASE_STATUS_BY_ORDER_STATUS = {
  Ordered: "PartOrder",
  Shipped: "PartAvailable",
};
const CASE_INFO_SELECT = {
  CaseID: true,
  CaseSubject: true,
  Owner: true,
  CreatedBy: true,
  ownerUser: {
    select: {
      IDUser: true,
      Name: true,
      Email: true,
    },
  },
  createdByUser: {
    select: {
      IDUser: true,
      Name: true,
      Email: true,
    },
  },
};


export async function PATCH(request) {
  try {
    const {
      moUpdates = {},
      updates = {},
      MOID,
      WOID,
      userId,
      ResourceId,
      SalesOrderNumber,
      RMANumber,
    } = await request.json();
    if (!MOID || !WOID) {
      return NextResponse.json(
        {
          success: false,
          message: "MOID and WOID are required for batch update",
        },
        { status: 400 },
      );
    }

    moUpdates.OrderNumber = moUpdates.orderNumber
    const result = await prisma.$transaction(async (tx) => {
      const [materialOrder, workOrder] = await Promise.all([
        tx.materialorder.findUnique({ where: { MOID } }),
        tx.workorder.findUnique({
          where: { WOID },
          include: { caseinformation: true },
        }),
      ]);

      if (!materialOrder) {
        throw new Error("Material Order not found");
      }

      if (!workOrder) {
        throw new Error("Work Order not found");
      }

      const originalOrderStatus = materialOrder.OrderStatus;
      const originalSalesOrder = materialOrder.SalesOrderNumber ?? null;
      const originalRmaNumber = materialOrder.RMANumber ?? null;  
      const originalDeliveryRequestedDate = materialOrder.DeliveryRequestedDate ?? null;

      const updateEntries = Object.entries(updates ?? {});
      
      if (updateEntries.length > 0) {
        for (const [lineItemID, status] of updateEntries) {
          await tx.materialorderlineitems.update({
            where: { LineItemID: Number(lineItemID) },
            data: { Status: status },
          });
        }
      }

      const lineItems = await tx.materialorderlineitems.findMany({ where: { MOID } });
      const allMatch = (status) =>
        lineItems.length > 0 && lineItems.every((item) => item.Status === status);

      const mergeAllowedMoUpdates = (source, target, current) => {
        const allowedFields = [
          'DeliveryRequestedDate',
          'deliveryRequestedDate',
          'CollectionRequestedDate',
          'collectionRequestedDate',
          'ReadyForClosureDate',
          'readyForClosureDate',
          'AWB_InCode',
          'AWB_OutCode',
          'RMAStatus',
          //AND ETCETERA ONFIELD REQUIRED
        ];

        for (const field of allowedFields) {
          if (field in source) {
            const newVal = source[field] ?? null;
            const oldVal = current[field] ?? null;
            if (newVal !== oldVal) {
              target[field] = newVal;
            }
          }
        }
      };

      const materialOrderUpdate = {};

      if (allMatch("Shipped")) {
        materialOrderUpdate.OrderStatus = "Shipped";
      } else if (allMatch("Ordered")) {
        materialOrderUpdate.OrderStatus = "Ordered";
      } else if (allMatch("Cancelled")) {
        materialOrderUpdate.OrderStatus = "Cancelled";
      } else if (allMatch("Closed")) {
        materialOrderUpdate.OrderStatus = "Closed";
      } else if (allMatch("Submitted")) {
        materialOrderUpdate.OrderStatus = "Submitted";
      } else if (allMatch("New")) {
        materialOrderUpdate.OrderStatus = "New";
      }else if (allMatch("BackOrdered")) {
        materialOrderUpdate.OrderStatus = "BackOrdered";
      }

      if (
        SalesOrderNumber !== undefined &&
        (SalesOrderNumber || null) !== originalSalesOrder
      ) {
        materialOrderUpdate.SalesOrderNumber = SalesOrderNumber || null;
      }

      if (
        RMANumber !== undefined &&
        (RMANumber || null) !== originalRmaNumber
      ) {
        materialOrderUpdate.RMANumber = RMANumber || null;
      }

      if (
        moUpdates.deliveryRequestedDate !== undefined &&
        (moUpdates.deliveryRequestedDate || null) !== originalDeliveryRequestedDate
      ) {
        materialOrderUpdate.DeliveryRequestedDate = moUpdates.deliveryRequestedDate || null;
      }
      mergeAllowedMoUpdates(moUpdates, materialOrderUpdate, materialOrder);


      let updatedOrder = materialOrder;
      if (Object.keys(materialOrderUpdate).length > 0) {
        updatedOrder = await tx.materialorder.update({
          where: { MOID },
          data: materialOrderUpdate,
        });
      }

      const derivedOrderStatus = updatedOrder.OrderStatus;
      const caseId = workOrder.caseinformation?.CaseID ?? null;
      const previousCaseOwnerId = workOrder.caseinformation?.Owner ?? null;

      const includeChangedBy = {
        changedByUser: {
          select: {
            IDUser: true,
            Name: true,
            Email: true,
          },
        },
      };

      const createdLogs = [];

      if (updateEntries.length > 0) {
        const statusSummary =
          derivedOrderStatus !== originalOrderStatus
            ? `${originalOrderStatus ?? "Unknown"} -> ${derivedOrderStatus}`
            : derivedOrderStatus ?? originalOrderStatus ?? "Unknown";

        const log = await tx.actionLog.create({
          data: {
            CaseId: workOrder.caseinformation?.CaseID,
            ReferenceId: MOID,
            model: "Material Orders",
            dataOld: originalOrderStatus ?? "Unknown",
            dataNew: derivedOrderStatus ?? originalOrderStatus ?? "Unknown",
            changedBy: userId,
            logDescription: `Batch update MOLI for MO ${MOID}: ${updateEntries.length} item(s) updated. MO status: ${statusSummary}`,
          },
          include: includeChangedBy,
        });

        createdLogs.push(log);
      }

      const targetCaseStatus = CASE_STATUS_BY_ORDER_STATUS[derivedOrderStatus];
      const currentCaseStatus = workOrder.caseinformation?.CaseStatus ?? null;

      let caseOwnerId = null;
      if (targetCaseStatus === "PartOrder") {
        let logisticUser = await tx.user.findFirst({ where: { Role: "lg", ResourceId: ResourceId  } });
        if (!logisticUser) {
          logisticUser = await tx.user.findFirst({
            where: { Role: { equals: "lg" } },
            orderBy: { IDUser: "asc" },
          });
        }
        
        caseOwnerId = logisticUser?.IDUser ?? null;
      } else if (targetCaseStatus === "PartAvailable") {
        caseOwnerId = workOrder.OwnerID ?? null;
      }
      
      if (
        targetCaseStatus &&
        targetCaseStatus !== currentCaseStatus &&
        workOrder.caseinformation?.CaseID
      ) {
        const caseUpdateData = {
          CaseStatus: targetCaseStatus,
        };
        if (caseOwnerId) {
          caseUpdateData.Owner = caseOwnerId;
        }

        await tx.caseinformation.update({
          where: { CaseID: workOrder.caseinformation.CaseID },
          data: caseUpdateData,
        });
        

        const ownerChanged =
          caseOwnerId &&
          caseOwnerId !== (workOrder.caseinformation?.Owner ?? null);

        if (ownerChanged) {
          const ownerLog = await tx.actionLog.create({
            data: {
              CaseId: `${workOrder.caseinformation.CaseID}`,
              model: "CaseOwner",
              dataOld: String(previousCaseOwnerId ?? ""),
              dataNew: String(caseOwnerId ?? ""),
              changedBy: userId,
              logDescription:
                targetCaseStatus === "PartOrder"
                  ? `Edit: change owner from ${previousCaseOwnerId ?? "Unknown"} to ${caseOwnerId} (Logistic)`
                  : `Edit: change owner from ${previousCaseOwnerId ?? "Unknown"} to ${caseOwnerId}`,
            },
            include: includeChangedBy,
          });

          createdLogs.push(ownerLog);
        }

        const ownerNote = ownerChanged
          ? targetCaseStatus === "PartOrder"
            ? " Owner reassigned to Logistic."
            : " Owner reassigned to CE."
          : "";

        const statusLog = await tx.actionLog.create({
          data: {
            CaseId: `${workOrder.caseinformation.CaseID}`,
            model: "Case",
            dataOld: currentCaseStatus ?? "Unknown",
            dataNew: targetCaseStatus,
            changedBy: userId,
            logDescription: `Edit: change status from ${STATUS_ENUM_TO_LABEL[currentCaseStatus] ?? "Unknown"} to ${STATUS_ENUM_TO_LABEL[targetCaseStatus]}.${ownerNote}`,
          },
          include: includeChangedBy,
        });

        createdLogs.push(statusLog);
      }

      const identifiersChanged =
        (SalesOrderNumber !== undefined && (SalesOrderNumber || null) !== originalSalesOrder) ||
        (RMANumber !== undefined && (RMANumber || null) !== originalRmaNumber);

      if (identifiersChanged && updateEntries.length === 0) {
        const changes = [];
        if (SalesOrderNumber !== undefined && (SalesOrderNumber || null) !== originalSalesOrder) {
          changes.push(`SO: ${originalSalesOrder ?? "-"} -> ${SalesOrderNumber || "-"}`);
        }
        if (RMANumber !== undefined && (RMANumber || null) !== originalRmaNumber) {
          changes.push(`RMA: ${originalRmaNumber ?? "-"} -> ${RMANumber || "-"}`);
        }

        const identifierLog = await tx.actionLog.create({
          data: {
            CaseId: workOrder.caseinformation?.CaseID,
            ReferenceId: MOID,
            model: "Material Orders",
            dataOld: originalOrderStatus ?? "Unknown",
            dataNew: derivedOrderStatus ?? originalOrderStatus ?? "Unknown",
            changedBy: userId,
            logDescription: `Material Order ${MOID} identifiers updated (${changes.join(", ")})`,
          },
          include: includeChangedBy,
        });

        createdLogs.push(identifierLog);
      }

      const updatedLineItems = await tx.materialorderlineitems.findMany({ where: { MOID } });

      return {
        materialOrder: {
          ...updatedOrder,
          materialorderlineitems: updatedLineItems,
        },
        logs: createdLogs,
        caseId,
      };
    });

    const latestCaseInfo = result.caseId
      ? await prisma.caseinformation.findUnique({
          where: { CaseID: result.caseId },
          select: CASE_INFO_SELECT,
        })
      : null;

    let caseInfoForNotifications = latestCaseInfo;
    for (const log of result.logs ?? []) {
      const { caseInfo: updatedCaseInfo } = await handleActionLogNotifications({
        actionLog: log,
        caseInfo: caseInfoForNotifications,
      });

      if (updatedCaseInfo) {
        caseInfoForNotifications = updatedCaseInfo;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Batch update success!",
        data: result.materialOrder,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update Batch Material Order",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
