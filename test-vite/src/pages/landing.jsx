import { useAuth } from "@/context/auth-context";
import { lazy, Suspense } from "react";

const AdminLanding = lazy(() => import("../layout/SupervisorLanding"));
const WorkerLanding = lazy(() => import("../layout/FrontDesk_Page"));
const ApoLanding = lazy(() => import("../layout/Apo_Page"));
const ProductStorageLanding = lazy(() => import("../layout/Ps_Page"));
const LogistikLanding = lazy(() => import("../layout/Logistic_Page"))
const CashMLanding = lazy(() => import ("../layout/Cm_Page"))
const ApprovelLanding = lazy(() => import ("../layout/Apv_page"));
// const UserLanding = lazy(() => import("../pages/user/Dashboard"));
// const CeLeadLanding = lazy(() => import("../layout/CeLead_Page") )
// const CeLanding = lazy(() => import("../layout/Ce_Page"))

export default function Landing() {
  const { user } = useAuth();
  const Allrole = ["user","fd","ce","celead",]
  const adminroles = ["admin","spv"]
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      {adminroles?.includes(user?.role) && <AdminLanding />}
      {Allrole?.includes(user?.role) && <WorkerLanding />}
      {user?.role === "apo" && <ApoLanding/>}
      {user?.role === "ps" && <ProductStorageLanding/>}
      {user?.role === "lg" && <LogistikLanding/>}
      {user?.role === "cm" && <CashMLanding/>}
      {user?.role === "apv" && <ApprovelLanding/>}
      {/* {user?.role === "manager" && <ManagerLanding />} */}
      {/* {user?.role === "fd" && <WorkerLanding />} */}
      {/* {user?.role === "ce" && <WorkerLanding/>} */}
      {/* {user?.role === "celead" && <WorkerLanding/>} */}
    </Suspense>
  );
}
