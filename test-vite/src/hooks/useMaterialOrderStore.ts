// hooks/useMaterialOrderStore.ts
import { create } from "zustand";
import ApiCustomer from "../api";

export type MaterialOrderInfoState = {
  MOID: string;
  orderNumber: string;
  serviceOfferID: string;
  serviceDescription: string;
  orderType: string;
  shippingPriority: string;
  ReadyForClosureDate: string | null;
  caseID: string;
  contact: string | null;
  DeliveryRequestedDate: string | null;
  CollectionRequestedDate: string | null;
  promoCode: string;
  customerInducedDamage: boolean;
  accidentalDamageProtection: boolean;
  defectiveMediaRetention: boolean;
  notificationNumber: string;
  SalesOrderNumber: string;
  resourceName: string;
  resourceId: string;
  workOrder: string | null;
  parentMO: string | null;
  isBCPOrder: boolean;
  materialOrderType: string;
  eotOrderNumber: string;
  AWB_InCode: string;
  AWB_OutCode: string;
  RMAStatus: string | null;
  RMANumber: string;
};

type MaterialOrderStore = {
  loading: boolean;
  error: string | null;

  materialOrder: any | null;
  lineItems: any[];
  materialInfo: MaterialOrderInfoState;
  updatedLineItems: Record<string, string>;

  fetchMaterialOrderBundle: (moid: string) => Promise<void>;
  setMaterialInfoField: (
    field: keyof MaterialOrderInfoState,
    value: any
  ) => void;
  setLineItemStatus: (lineItemId: string, status: string) => void;
  reset: () => void;
    saveMaterialOrder: (userId: string) => Promise<{
    success: boolean;
    message?: string;
    reason?:
      | "missingSalesRma"
      | "noMaterialOrder"
      | "requestError";
  }>;
};

const emptyMaterialInfo: MaterialOrderInfoState = {
  MOID: "",
  orderNumber: "",
  serviceOfferID: "",
  serviceDescription: "",
  orderType: "",
  shippingPriority: "",
  ReadyForClosureDate: null,
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
};

export const useMaterialOrderStore = create<MaterialOrderStore>((set, get) => ({
  loading: false,
  error: null,
  materialOrder: null,
  lineItems: [],
  materialInfo: emptyMaterialInfo,
  updatedLineItems: {},

  reset: () =>
    set({
      loading: false,
      error: null,
      materialOrder: null,
      lineItems: [],
      materialInfo: emptyMaterialInfo,
      updatedLineItems: {},
    }),

  setMaterialInfoField: (field, value) =>
    set((state) => ({
      materialInfo: {
        ...state.materialInfo,
        [field]: value,
      },
    })),

  setLineItemStatus: (lineItemId, status) =>
    set((state) => ({
      updatedLineItems: {
        ...state.updatedLineItems,
        [lineItemId]: status,
      },
      lineItems: state.lineItems.map((li) =>
        li.LineItemID === lineItemId ? { ...li, Status: status } : li
      ),
    })),

    saveMaterialOrder: async (userId: string) => {
    const { materialOrder, materialInfo, updatedLineItems } = get();
  
    if (!materialOrder?.MOID) {
      return {
        success: false,
        reason: "noMaterialOrder" as const,
        message: "No Material Order loaded",
      };
    }

    const hasShippingUpdate =
      updatedLineItems &&
      Object.values(updatedLineItems).some(
        (v) =>
          String(v).toLowerCase() === "shipped" ||
          String(v).toLowerCase() === "ordered"
      );

    const soNumber = (
      materialInfo?.SalesOrderNumber ??
      materialOrder?.SalesOrderNumber ??
      ""
    )
      .toString()
      .trim();

    const rmaNumber = (
      materialInfo?.RMANumber ??
      materialOrder?.RMANumber ??
      ""
    )
      .toString()
      .trim();

    if (hasShippingUpdate && (!soNumber || !rmaNumber)) {
      return {
        success: false,
        reason: "missingSalesRma" as const,
        message:
          "Before setting a line item to Shipped/Ordered, fill Sales Order Number and RMA Number.",
      };
    }

    // Since we already store ISO strings in materialInfo date fields,
    // we can send them directly as-is.
    const moUpdates = {
      ...materialInfo,
      DeliveryRequestedDate: materialInfo.DeliveryRequestedDate,
      CollectionRequestedDate: materialInfo.CollectionRequestedDate,
      ReadyForClosureDate: materialInfo.ReadyForClosureDate,
    };

    try {
      let res;

      if (!updatedLineItems || Object.keys(updatedLineItems).length === 0) {
        const payload = {
          SalesOrderNumber: soNumber || undefined,
          RMANumber: rmaNumber || undefined,
          moUpdates,
        };

        res = await ApiCustomer.patch(
          `/api/material-order/${materialOrder.MOID}`,
          payload
        );
      } else {
        const payload = {
          moUpdates,
          updates: updatedLineItems,
          MOID: materialOrder.MOID,
          WOID: materialOrder.WOID,
          userId,
          ResourceId: materialOrder.owner?.ResourceId,
          SalesOrderNumber: soNumber || null,
          RMANumber: rmaNumber || null,
        };

        res = await ApiCustomer.patch(
          `/api/material-order/batch-update`,
          payload
        );
      }

      const data = res.data;

      // Refresh store with latest MO after save
      await get().fetchMaterialOrderBundle(materialOrder.MOID);

      return {
        success: true,
        message: data?.message || "Material Order updated",
      };
    } catch (error: any) {
      console.error("saveMaterialOrder error:", error);
      return {
        success: false,
        reason: "requestError" as const,
        message: error?.message || "Failed to save Material Order",
      };
    }
  },

  fetchMaterialOrderBundle: async (moid: string) => {
    set({
      loading: true,
      error: null,
      materialOrder: null,
      lineItems: [],
      materialInfo: emptyMaterialInfo,
      updatedLineItems: {},
    });

    try {
      // 1. Main MO
      const res = await ApiCustomer.get(`/api/material-order/${moid}`);
      const data = res.data.data;

      // 2. Line items (in parallel if you want more requests later)
      const resLine = await ApiCustomer.get(
        `/api/material-order/material-order-line-items?MOID=${moid}`
      );
      const lineItems = resLine.data.data || [];

      const contactInfo =
        data.workorder?.caseinformation?.contact_information;

      const materialInfo: MaterialOrderInfoState = {
        MOID: data.MOID || "",
        orderNumber: data.MOID || "",
        serviceOfferID: data.ServiceOfferID || "",
        serviceDescription: data.ServiceDescription || "",
        orderType: data.OrderType || "",
        shippingPriority: data.ShippingPriority || "",
        ReadyForClosureDate: data.ReadyForClosureDate || null,
        caseID: data.workorder?.CaseID || "",
        contact: contactInfo
          ? `${contactInfo.FirstName} ${contactInfo.LastName}`
          : null,
        DeliveryRequestedDate: data.DeliveryRequestedDate || null,
        CollectionRequestedDate: data.CollectionRequestedDate || null,
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
      };

      set({
        materialOrder: data,
        lineItems,
        materialInfo,
        updatedLineItems: {},
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Failed to fetch material order bundle:", err);
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          "Failed to fetch material order bundle",
      });
    }
  },
}));

