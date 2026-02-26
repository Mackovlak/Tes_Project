import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Swal from "sweetalert2";

import { useWorkOrderStore } from "@/hooks/useWorkOrderStore";
import { getUserFromToken } from "@/lib/utils/auth";
import { useDraft } from "@/components/DraftContext";

//? OLD Service WORK
// import { ServiceWork } from "./services/service-work";
// export const Work = () => {
//   return (
//     <div>
//       <ServiceWork></ServiceWork>
//     </div>
//   )
// }



import { ServiceWork } from "./services/ServiceWorkReimagined";
import { Skeleton } from "../components/ui/skeleton";
import { useServiceCaseStore } from "@/hooks/useServiceCaseStore";
export const Work = () => {
  const { woid } = useParams();
  const user = getUserFromToken();
  const { updateDraft } = useDraft();

  const [loading, setLoading] = useState(true)
//  const loading = useWorkOrderStore((s) => s.loading);
  const error = useWorkOrderStore((s) => s.error);
  const workOrder = useWorkOrderStore((s) => s.workOrder);
  const caseInformation = useWorkOrderStore((s) => s.caseInformation);
  const fetchWorkOrderBundle = useWorkOrderStore(
    (s) => s.fetchWorkOrderBundle
  );

  useEffect(() => {
    if (!woid) return;

    // this is fine to call once when WOID changes
    updateDraft("woid", woid);

    const run = async () => {
      // Swal.fire({
      //   title: "Please wait...",
      //   text: "Loading Work Order Details...",
      //   allowOutsideClick: false,
      //   didOpen: () => Swal.showLoading(),
      // });

  try {
    setLoading(true);
    await  fetchWorkOrderBundle(woid);

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal memuat data",
      text: "Terjadi kesalahan saat mengambil data kasus",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  } finally {
    setLoading(false);
  }
    };

    run();
  }, [woid]); 

  // ---- status gates ----
  if (!woid) {
    return <div className="p-4">WOID is missing in the URL.</div>;
  }
  if (loading) {
    return (
      <div className="p-2 space-y-6 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="w-full h-30" />
        <Skeleton className="h-55 w-full rounded-lg" />
        <Skeleton className="h-55 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Failed to load Work Order: {error}
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Work Order not found.
      </div>
    );
  }

  return <ServiceWork />;
};

