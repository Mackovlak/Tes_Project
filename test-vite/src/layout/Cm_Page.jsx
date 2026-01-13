import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import ApiCustomer from "@/api";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { NotificationCard } from "@/components/NotificationCard";
import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import QuotationDialog from "@/components/model/QuotationModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { STATUS_ENUM_TO_LABEL } from "@/pages/CaseDetail";


export default function CashManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState([]);
    const [preview, setPreview] = useState({
        ProfilePhoto: null,
        Signature: null,
    });
    const [selectedCase, setSelectedCase] = useState(null);
    const [showQuotationDialog, setShowQuotationDialog] = useState(false);
    const [quotationInitialData, setQuotationInitialData] = useState(null);
    const [quotationMaterialItems, setQuotationMaterialItems] = useState([]);
    const [quotationLoading, setQuotationLoading] = useState(false);
    const [quotationSubmitting, setQuotationSubmitting] = useState(false);

    const [caseData, setCaseData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resCaseData = await ApiCustomer.get('/api/case-information')
            const fecthUserData = await ApiCustomer.get(`/api/user/${user.id}`)
            const resFetchUserData = fecthUserData.data.data;

            setUserData({
                ...userData,
                Username: resFetchUserData.Username,
                Name: resFetchUserData.Name,
                Email: resFetchUserData.Email,
                Phone: resFetchUserData.Phone || "",
                ProfilePhoto: resFetchUserData.ProfilePhoto,
                Signature: resFetchUserData.Signature,
            })
            setPreview({
                ProfilePhoto: fecthUserData.data.data.ProfilePhoto ? `${import.meta.env.VITE_API_BASE_URL}${fecthUserData.data.data.ProfilePhoto}` : null,
                Signature: fecthUserData.data.data.Signature ? `${import.meta.env.VITE_API_BASE_URL}${fecthUserData.data.data.Signature}` : null,
            });        

            const filtercases = resCaseData.data.data.filter(c => c?.CaseStatus !== 'Close' && c?.caseinformation?.Owner == user.id);
            const sortedCases = filtercases.sort((a, b) => {
                const dateAraw = a.UpdateOn;
                const dateBraw = b.UpdateOn;

                const dateA = dateAraw ? (dateAraw instanceof Date ? dateAraw : new Date(dateAraw)) : new Date(0);
                const dateB = dateBraw ? (dateBraw instanceof Date ? dateBraw : new Date(dateBraw)) : new Date(0);

                return dateB - dateA; // newest first
            });
            const recentCases = sortedCases.slice(0, 5);
            setCaseData(recentCases);
            return resCaseData.data.data;
        } catch (err) {
            toast.error("Failed fetching data");
        } finally {
            setLoading(false)
        }
    }
    useEffect(() =>{
        fetchData();
    },[])

    useEffect(() => {
        if (!showQuotationDialog || !selectedCase) return;

        let cancelled = false;
        const baseLineItems = extractMaterialOrderLineItems(selectedCase);
        setQuotationMaterialItems(baseLineItems);
        setQuotationInitialData(null);
        setQuotationLoading(true);

        const loadQuotation = async () => {
            try {
                const response = await ApiCustomer.get(`/api/quotation-information?caseId=${selectedCase.CaseID}`);
                if (cancelled) return;
                const quotationPayload = response.data?.data;
                if (quotationPayload) {
                    setQuotationInitialData(mapQuotationInitialData(quotationPayload));
                    setQuotationMaterialItems((prev) =>
                        mergeLineItemsWithQuotation(prev, quotationPayload.lineItems || []),
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error.response?.data?.message ?? "Gagal mengambil data quotation.",
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
    }, [showQuotationDialog, selectedCase]);

    const handleQuotationOpenChange = (nextOpen) => {
        setShowQuotationDialog(nextOpen);
        if (!nextOpen) {
            setQuotationInitialData(null);
            setQuotationMaterialItems([]);
            setQuotationLoading(false);
            setQuotationSubmitting(false);
            setSelectedCase(null);
        }
    };

    const handleQuotationSubmit = async (payload) => {
        if (!selectedCase) return;
        if (!user?.id) {
            toast.error("User tidak valid. Silakan login kembali.");
            return;
        }
        try {
            setQuotationSubmitting(true);
            const targetAssignUser = payload.quoteDecision === "Rejected" ? selectedCase.caseinformation.workorder[0].OwnerID : user.id !== payload?.userAssign ? payload.userAssign : user.id
            const apiPayload = {
                ...payload,
                userAssign: targetAssignUser,
            };
            console.log("Sending payload:", apiPayload);
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
                    : "Quotation berhasil dibuat.",
            );

            await fetchData();
            handleQuotationOpenChange(false);
        } catch (error) {
            console.error("Failed to save quotation:", error);
            const message =
                error.response?.data?.message ?? "Gagal menyimpan quotation.";
            toast.error(message);
        } finally {
            setQuotationSubmitting(false);
        }
    };

    const extractMaterialOrderLineItems = (caseData) => {
        const workorders = caseData?.caseinformation?.workorder || [];
        const allLineItems = [];

        workorders.forEach((wo) => {
            (wo.materialorder || []).forEach((mo) => {
                (mo.materialorderlineitems || []).forEach((line) => {
                    const quotationEntry = Array.isArray(line.quotation_lineitem) && line.quotation_lineitem.length > 0
                        ? line.quotation_lineitem[0]
                        : undefined;

                    const initialApproved = quotationEntry?.Approved;
                    const approvedValue =
                        initialApproved === undefined || initialApproved === null
                            ? ""
                            : initialApproved
                                ? "yes"
                                : "no";

                    const linePrice =
                        quotationEntry?.Price ?? line.Price ?? "";

                    allLineItems.push({
                        lineItemId: line.LineItemID,
                        moid: mo.MOID,
                        woid: wo.WOID,
                        partNumber: line.PartNumber,
                        description: line.Description,
                        quantity: line.Quantity ?? "",
                        price:
                            linePrice === null || linePrice === undefined
                                ? ""
                                : String(linePrice),
                        partApproved: approvedValue,
                    });
                });
            });
        });

        return allLineItems;
    };

    const mergeLineItemsWithQuotation = (baseItems, quotationLineItems = []) => {
        if (!Array.isArray(baseItems)) return [];
        const quotationMap = new Map();
        quotationLineItems.forEach((item) => {
            if (!item || item.lineItemId === undefined || item.lineItemId === null) return;
            quotationMap.set(item.lineItemId, item);
        });

        return baseItems.map((item) => {
            const override = quotationMap.get(item.lineItemId);
            if (!override) return item;

            const priceOverride =
                override.price === undefined || override.price === null
                    ? item.price
                    : String(override.price);
            const approvedOverride =
                override.approved === undefined || override.approved === null
                    ? item.partApproved
                    : override.approved
                        ? "yes"
                        : "no";

            return {
                ...item,
                price: priceOverride,
                partApproved: approvedOverride,
            };
        });
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


    return (
    <div className="bg-gradient-to-t dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1% h-full" id='dashboard'>
      <div className="grid mt-4 m-5 gap-5 max-h-[calc(100vh-15px)] grid-rows-2 grid-cols-3 ">
        <Card className={"rounded-sm dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-700 dark:to-slate-900"} id='profile'>
          <CardHeader className={"grid grid-cols-2 items-start"}>
            {!preview.ProfilePhoto && (
              <div className="flex justify-start">
                <div className="w-30 h-30 rounded-full border-4 border-white shadow-md text-center">
                  <span className="text-3xl font-bold">?</span>
                </div>
              </div>
            )}
            {preview.ProfilePhoto && (
              <div className="flex justify-start">
                <img
                  src={preview.ProfilePhoto}
                  alt="Profile Preview"
                  className="w-30 h-30 rounded-full border-4 border-white shadow-md text-center"
                />
              </div>
            )}
            <div className="flex justify-end">
              <Badge
                variant={"outline"}
              >
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className={"ml-4 flex gap-1 flex-col"}>
            <CardTitle className={"text-xl"}>{user?.name || "User"}</CardTitle>
            <span className="text-gray-400 dark:text-gray-300">{user?.email}</span>
            <span className="text-sm text-gray-500 dark:text-gray-300">{userData.Phone}</span>
          </CardContent>
          <span className="text-xs text-center text-gray-500 dark:text-gray-400">
            Latest Login: {new Date().toLocaleString()}
          </span>
        </Card>

        <Card className={"rounded-sm col-span-2 row-span-2 dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-700 dark:to-slate-800"} id='quotation'>
          <CardHeader>
            <CardTitle className={"text-2xl"}>Quotation</CardTitle>

            <hr className="dark:border-gray-400"/>
          </CardHeader>
          <CardContent className={"grid gap-3 overflow-y-auto"}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600 dark:border-2" />
                ))
              : caseData.map((c) => (
                  <Card
                    key={c.CaseID}
                    className="p-3 border-l-4 hover:scale-[0.99] rounded-lg shadow-sm hover:shadow-lg transition-all border-2 bg-white cursor-pointer dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600 dark:border-2 dark:hover:border-teal-600"
                    onClick={() => navigate(`/app/case/${c.CaseID}`)}
                  >
                    <div className="flex flex-wrap items-center gap-2 ">
                      <Badge
                        className={`px-2 py-1 rounded-md text-xs font-medium
                                    ${
                                      c.caseinformation.CasePriority === "High"
                                        ? "bg-orange-100 text-orange-700"
                                        : c.caseinformation.CasePriority ===
                                          "Critical"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                                >
                                    {c?.caseinformation.CasePriority || "Low"}
                                </Badge>
                                <Badge className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                                    {STATUS_ENUM_TO_LABEL[c.CaseStatus]}
                                </Badge>
                                <p className='ml-auto text-xs text-gray-500 dark:text-gray-300'>{c.CreatedOn}</p>
                                </div>
                                <p className={cn("font-medium truncate mt-1 text-wrap", !c.CaseSubject && 'text-red-500')}>{c.CaseSubject || "No Subject"}</p>
                                <div className=" text-gray-500 mt-1 flex justify-between">
                                <p className='text-md dark:text-gray-300'>{c.CaseID}</p>
                                <p className='text-md  font-semibold dark:text-gray-300'>{c.UpdateOn ? new Date(c.UpdateOn).toLocaleString("id-ID") : "No Update"}</p>
                                </div>
                            </Card>
                        )
                    )}
                </CardContent>
            </Card>

        <Card className={"rounded-sm dark:border-slate-600 dark:border-r-6 dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-700 dark:to-slate-900"} id='notifications'>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className={"overflow-y-auto space-y-3"}>
            <NotificationCard />
          </CardContent>
        </Card>

            {selectedCase && (
                <QuotationDialog
                    open={showQuotationDialog}
                    onOpenChange={handleQuotationOpenChange}
                    materialItems={quotationMaterialItems}
                    caseId={selectedCase.CaseID}
                    status={selectedCase.CaseStatus}
                    initialData={quotationInitialData || {}}
                    loading={quotationLoading}
                    submitting={quotationSubmitting}
                    onSubmit={handleQuotationSubmit}
                    createdBy={user}
                />
            )}

      </div>
    </div>
    )
}
