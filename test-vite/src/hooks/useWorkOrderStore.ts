// useWorkOrderStore.ts
import { create } from "zustand";
import ApiCustomer from "../api";
import { toast } from "sonner";
	
type SLAState = {
	slaJeopardy: string;
	dueDateCustomer: string;
	coverageWindow: string;
	response: string;
	otcCode: string;
	requestedDateTimeCustomer: string;
	guaranteedFixTimeCustomer: string;
	earlyStartDateTimeCustomer: string;
	latestStartDateTimeCustomer: string;
	slaReschedule: string;
	activeScheduleDate: string;
	slaErrorDescription: string;
	casePriorityIndex: string;
};

type WOGeneralState = {
	IncomingChannel: string;
	WorkOrderNumber: string;
	WorkOrderType: string;
	WorkOrderDescription: string;
	Priority: string;
	SystemStatus: string;
	SubStatus: string;
	BookableResourceBooking: string;
	ServiceOfferID: string;
	ServiceDescription: string;
	PatnerCaseID: string;
	PatnerStatus: string;
	RecommendedResource: string;
	ShipmentCountry: string;
	ShipmentState: string;
};

type MOLineGeneralState = { 
	moid: string;
	LineItemID: string;
	failureId: string | null;
	PartReturnStatusId: string;
	removedPartNumber: string;
	removedSerialNumber: string;
	CTValidation: boolean;
	QuantityUsed: boolean;
	DOAReason: string;
	PhotoPartUnit: string | null;
	GoodReturnReason: string;
	PartReturnDOA : boolean;
	isQuantityUsedDisabled: boolean;
	PartReturnStatusName: string;
}

type FailureOptions = {
	FailureId: number,
	Name: string,
	Description: string,
}

type PartReturnStatusOptions = {
	ReturnStatusId: number,
	StatusName: string,
	Doa: boolean
}

type CustomerDataState = { MainAccount: any | null; SiteAccount: any | null; Type: string | null };

type WorkOrderStore = {
	loading: boolean;
	error: string | null;
	workOrder: any | null;
	materialOrders: any[];
	caseInformation: any | null;
	bookings: any[];
	ownerWorkOrder: any | null;
	customerData: CustomerDataState;
	SLA: SLAState;
	WOGeneral: WOGeneralState;
	MOLineGeneral: MOLineGeneralState[];
	failureOptions: FailureOptions[];
	partReturnStatusOptions: PartReturnStatusOptions[];

	setSLA: (updater: SLAState | ((prev: SLAState) => SLAState)) => void;
	setWOGeneral: (updater: WOGeneralState | ((prev: WOGeneralState) => WOGeneralState)) => void;
	setSLAField: (field: keyof SLAState, value: any) => void;
	setWOGeneralField: (field: keyof WOGeneralState, value: any) => void;
	setMoLineGeneralField: (index: number, field: keyof MOLineGeneralState, value: any) => void;
	uploadMOLinePhoto: (index: number, file: File) => Promise<void>;
	removeMOLinePhoto: (index: number) => Promise<void>;

	fetchWorkOrderBundle: (woid: string) => Promise<void>;
	fetchFailureOptions: () => Promise<void>;
	fetchPartReturnStatusOptions: () => Promise<void>;
	saveWorkOrder: () => Promise<{ success: boolean; message?: string }>;
};

const initialSLA: SLAState = {
	slaJeopardy: "",
	dueDateCustomer: "",
	coverageWindow: "",
	response: "",
	otcCode: "",
	requestedDateTimeCustomer: "",
	guaranteedFixTimeCustomer: "",
	earlyStartDateTimeCustomer: "",
	latestStartDateTimeCustomer: "",
	slaReschedule: "",
	activeScheduleDate: "",
	slaErrorDescription: "",
	casePriorityIndex: "",
};

const initialWOGeneral: WOGeneralState = {
	IncomingChannel: "",
	WorkOrderNumber: "",
	WorkOrderType: "",
	WorkOrderDescription: "",
	Priority: "",
	SystemStatus: "",
	SubStatus: "",
	BookableResourceBooking: "",
	ServiceOfferID: "",
	ServiceDescription: "",
	PatnerCaseID: "",
	PatnerStatus: "",
	RecommendedResource: "",
	ShipmentCountry: "",
	ShipmentState: "",
};

export const useWorkOrderStore = create<WorkOrderStore>((set, get) => ({
	loading: false,
	error: null,

	workOrder: null,
	materialOrders: [],
	caseInformation: null,
	bookings: [],
	ownerWorkOrder: null,
	customerData: {
		MainAccount: null,
		SiteAccount: null,
		Type: null,
	},
	SLA: initialSLA,
	WOGeneral: initialWOGeneral,
	MOLineGeneral: [],
	failureOptions: [],
	partReturnStatusOptions: [],


	setSLA: (updater) =>
		set((state) => ({
			SLA: typeof updater === "function" ? (updater as any)(state.SLA) : updater,
		})),

	setWOGeneral: (updater) =>
		set((state) => ({
			WOGeneral:
				typeof updater === "function"
					? (updater as any)(state.WOGeneral)
					: updater,
		})),

	setSLAField: (field, value) =>
		set((state) => ({ SLA: { ...state.SLA, [field]: value } })),

	setWOGeneralField: (field, value) =>
		set((state) => ({ WOGeneral: { ...state.WOGeneral, [field]: value } })),

	setMoLineGeneralField: (index, field, value) =>set((state) => {const updated = [...state.MOLineGeneral];
		updated[index] = {
      ...updated[index],
      [field]: value,
    };return { MOLineGeneral: updated };}),

	uploadMOLinePhoto: async (index: number, file: File) => {
		const {MOLineGeneral} = get()
		const line = MOLineGeneral[index]

		if (!line.LineItemID) {
			toast.error("LineItemID Not Found");
			return;
		}

		const formData = new FormData();
		formData.append("file", file)

		if (typeof line.PhotoPartUnit === "string" && line.PhotoPartUnit.length > 0) {
			formData.append("existingPath", line.PhotoPartUnit);
		}

		 try {
			const res = await ApiCustomer.post(
			`/api/material-order/material-order-line-items/${line.LineItemID}/upload-photo`,
			formData,
			{
				headers: { "Content-Type": "multipart/form-data" },
			}
			);

			const uploadedPath = res.data?.data?.path;

			if (uploadedPath) {
			set((state) => {
				const updated = [...state.MOLineGeneral];
				updated[index] = {
				...updated[index],
				PhotoPartUnit: uploadedPath,
				};
				return { MOLineGeneral: updated };
			});
			}
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to upload unit photo");
			throw err;
		}
	},

	removeMOLinePhoto: async (index: number) => {
		const {MOLineGeneral} = get()
		const line = MOLineGeneral[index]
		if(!line?.LineItemID) return;
		
		const currentPath = line.PhotoPartUnit;

		set((state) => {
			const updated = [...state.MOLineGeneral];
			updated[index] = {
				...updated[index],
				PhotoPartUnit: null
			};
			return { MOLineGeneral: updated}
		});

		const isStoredPath = typeof currentPath === "string" && currentPath.startsWith("/uploads/");
		if (isStoredPath) {
    try {
      await ApiCustomer.delete(
        `/api/material-order/material-order-line-items/${line.LineItemID}/upload-photo`,
        { params: { path: currentPath } }
      );
    } catch (err) {
      toast.warning("Failed to delete PhotoPartUnit file");
    }
  }
	},

	saveWorkOrder: async () => {
		const { workOrder, SLA, WOGeneral, MOLineGeneral } = get();

		if (!workOrder?.WOID) {
			throw new Error("No Work Order loaded");
		}

		const WOID = workOrder.WOID;

		const payloadWO = {
			// WO GENERAL
			ShipmentCountry: WOGeneral.ShipmentCountry || undefined,
			IncomingChannel: WOGeneral.IncomingChannel || undefined,
			Priority: WOGeneral.Priority || undefined,
			SubStatus: WOGeneral.SubStatus || undefined,
			RecommendedResource: WOGeneral.RecommendedResource || undefined,
			WorkOrderDescription: WOGeneral.WorkOrderDescription || undefined,
			ShipmentState: WOGeneral.ShipmentState || undefined,
			SystemStatus: WOGeneral.SystemStatus || undefined,
			// SLA
			SLAJeopardy: SLA.slaJeopardy || undefined,
			DueDateCustomer: SLA.dueDateCustomer || undefined,
			CoverageWindow: SLA.coverageWindow || undefined,
			Response: SLA.response || undefined,
			OTCCode: SLA.otcCode || undefined,
			RequestedDateTimeCustomer: SLA.requestedDateTimeCustomer || undefined,
			GuaranteedFixTimeCustomer: SLA.guaranteedFixTimeCustomer || undefined,
			EarlyStartDateTimeCustomer: SLA.earlyStartDateTimeCustomer || undefined,
			LatestStartDateTimeCustomer: SLA.latestStartDateTimeCustomer || undefined,
			SLAReschedule: SLA.slaReschedule || undefined,
			ActiveScheduleDate: SLA.activeScheduleDate || undefined,
			SLAErrorDescription: SLA.slaErrorDescription || undefined,
			CasePriorityIndex:
				SLA.casePriorityIndex !== ""
					? parseInt(SLA.casePriorityIndex, 10)
					: undefined,
		};

		const payloadMOLines = MOLineGeneral.map((mo) => ({
			LineItemID: mo.LineItemID,
			FailureId: mo.failureId ? Number(mo.failureId) : null,
			PartReturnStatusId: mo.PartReturnStatusId,
			RemovedPartNumber: mo.removedPartNumber,
			RemovedSerialNumber: mo.removedSerialNumber,
			CTValidation: mo.CTValidation,
			QuantityUsed: mo.QuantityUsed,
			DOAReason: mo.DOAReason,
			PhotoPartUnit: mo.PhotoPartUnit,
			GoodReturnReason: mo.GoodReturnReason,
		}))

		const response = await ApiCustomer.patch(`/api/work-order/${WOID}`, payloadWO);
		const result = response.data;

		const ressMoLine = await Promise.all(payloadMOLines.map((line) =>
			ApiCustomer.patch(`/api/material-order/material-order-line-items/${line.LineItemID}`, line)
		)
		);
		console.log("OI",ressMoLine)


		// Optionally refresh store with returned WO if backend sends it
		if (result?.data) {
			set((state) => ({
				workOrder: {
					...state.workOrder,
					...result.data,
				},
			}));
		}

		return {
			success: Boolean(result?.success),
			message: result?.message,
		};
	},


	fetchFailureOptions: async () => {
		try {
			const res = await ApiCustomer.get(`/api/failure/options`);
			set({failureOptions:res.data || []})
		} catch (error) {
			toast.error("Error Fetching Failure Options")
		}
	},

	fetchPartReturnStatusOptions: async () => {
		try {
			const response = await ApiCustomer.get("/api/part-return-status");
			set({partReturnStatusOptions:response.data.data || []})
		} catch (error) {
			toast.error("Error Fetching Part Return Status Option")
		}
	},

	fetchWorkOrderBundle: async (woid: string) => {
		set({ loading: true, error: null });

		try {
			const resWO = await ApiCustomer.get(`/api/work-order/${woid}`);
			const workOrderData = resWO.data.data;
			const resMO = await ApiCustomer.get(`/api/material-order?WOID=${woid}`);
			const materialOrders = resMO.data.data || [];

			await Promise.all([
				get().fetchFailureOptions(),
				get().fetchPartReturnStatusOptions()
			])

			let caseInformation: any = null;
			let bookings: any[] = [];
			let ownerWorkOrder: any = null;
			let customerData: CustomerDataState = {
				MainAccount: null,
				SiteAccount: null,
				Type: null,
			};
			let newSLA: SLAState = initialSLA;
			let newWOGeneral: WOGeneralState = {
				...initialWOGeneral,
				WorkOrderNumber: woid || "",
			};
			let newMOLineGeneral: MOLineGeneralState[] = []

			if (workOrderData?.CaseID) {
				const resCI = await ApiCustomer.get(
					`/api/case-information/${workOrderData.CaseID}`
				);
				caseInformation = resCI.data.data;

				const resBooking = await ApiCustomer.get(`/api/bookings?WOID=${woid}`);
				bookings = resBooking.data.data || [];

				const resOwner = await ApiCustomer.get(
					`/api/user/${workOrderData.OwnerID}`
				);
				ownerWorkOrder = resOwner.data.data;

				const mainAccount = caseInformation.contact_information;

				customerData = {
					MainAccount: mainAccount,
					SiteAccount: caseInformation.site_account ?? null,
					Type: caseInformation.site_account ? "SiteAccount" : "Individual",
				};

				const svc = workOrderData.serviceCatalog;

				newWOGeneral = {
					IncomingChannel: workOrderData.IncomingChannel || "",
					WorkOrderNumber: woid || "",
					WorkOrderType: workOrderData.WorkOrderType || "",
					WorkOrderDescription: workOrderData.WorkOrderDescription || "",
					Priority: workOrderData.Priority || "",
					SystemStatus: workOrderData.SystemStatus || "",
					SubStatus: workOrderData.SubStatus || "",
					BookableResourceBooking:
						bookings?.[0]?.BookingDetails?.ResourceId || "",
					ServiceOfferID:
						svc?.warranty_services?.Service_offerID ||
						caseInformation.servicecatalog?.warranty_services?.Service_offerID ||
						"",
					ServiceDescription:
						svc?.warranty_services?.Service_description ||
						caseInformation.servicecatalog?.warranty_services?.Service_description ||
						"",
					PatnerCaseID: "",
					PatnerStatus: "",
					RecommendedResource: workOrderData.RecommendedResource || "",
					ShipmentCountry: workOrderData.ShipmentCountry || "",
					ShipmentState: workOrderData.ShipmentState || "",
				};

				newSLA = {
					...initialSLA,
					requestedDateTimeCustomer:
						workOrderData.RequestedDateTimeCustomer || "",
					slaJeopardy: workOrderData.SLAJeopardy || "",
					dueDateCustomer: workOrderData.DueDateCustomer || "",
					coverageWindow: workOrderData.CoverageWindow || "",
					response: workOrderData.Response || "",
					otcCode: workOrderData.OTCCode || "",
					guaranteedFixTimeCustomer:
						workOrderData.GuaranteedFixTimeCustomer || "",
					earlyStartDateTimeCustomer:
						workOrderData.EarlyStartDateTimeCustomer || "",
					latestStartDateTimeCustomer:
						workOrderData.LatestStartDateTimeCustomer || "",
					slaReschedule: workOrderData.SLAReschedule || "",
					activeScheduleDate: workOrderData.ActiveScheduleDate || "",
					slaErrorDescription: workOrderData.SLAErrorDescription || "",
					casePriorityIndex:
						workOrderData.CasePriorityIndex == null
							? ""
							: String(workOrderData.CasePriorityIndex),
				};
			}

			newMOLineGeneral = materialOrders.map((mo:any) => {
				return {
					moid: mo.MOID,
					LineItemID: mo.materialorderlineitems[0]?.LineItemID || null,
					failureId: mo.materialorderlineitems[0]?.FailureId ?  String(mo.materialorderlineitems[0].FailureId): null,
					PartReturnStatusId: mo.materialorderlineitems[0]?.PartReturnStatusId || null,
					PartReturnStatusName: mo.materialorderlineitems[0]?.partReturnStatus?.StatusName || "",
					removedPartNumber: mo.materialorderlineitems[0]?.RemovedPartNumber || "",
					removedSerialNumber: mo.materialorderlineitems[0]?.RemovedSerialNumber || "",
					CTValidation: mo.materialorderlineitems[0]?.CTValidation ?? true,
					QuantityUsed: mo.materialorderlineitems[0]?.QuantityUsed ?? true,
					isQuantityUsedDisabled: false,
					DOAReason: mo.materialorderlineitems[0]?.DOAReason || "",
					PhotoPartUnit: mo.materialorderlineitems[0]?.PhotoPartUnit || null,
					GoodReturnReason: mo.materialorderlineitems[0]?.GoodReturnReason || "",
					PartReturnDOA : mo.materialorderlineitems[0]?.partReturnStatus?.DOA || false,
				}
			})

			set({
				workOrder: workOrderData,
				materialOrders,
				caseInformation,
				bookings,
				ownerWorkOrder,
				customerData,
				SLA: newSLA,
				WOGeneral: newWOGeneral,
				MOLineGeneral: newMOLineGeneral,
				loading: false,
				error: null,
			});
		} catch (err: any) {
			toast.error("Failed to fetch work order bundle:", err);
			set({
				loading: false,
				error:
					err?.response?.data?.message ||
					"Failed to fetch work order bundle",
			});
		}
	},

}));
