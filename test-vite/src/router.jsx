// router.tsx
import React, { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { Loader2 } from "lucide-react";

// --- Lazy pages (same as you had) ---
const Landing = lazy(() => import("./pages/landing"));
const Lorem = lazy(() => import("./pages/Lorem"));
const Search_case = lazy(() => import("./pages/Search_case"));
const SearchCaseProto2 = lazy(() => import("./pages/SearchCase_V3"));
const Case = lazy(() => import("./pages/Case").then((m) => ({ default: m.Case })));
const Work = lazy(() => import("./pages/work").then((m) => ({ default: m.Work })));
const MaterialOrder = lazy(() =>
  import("./pages/material_order").then((m) => ({ default: m.MaterialOrder }))
);
const MoDetail = lazy(() =>
  import("./pages/material_order").then((m) => ({ default: m.MoDetail }))
);
const FlowCase = lazy(() =>
  import("./pages/FlowCase").then((m) => ({ default: m.FlowCase }))
);
const ErfCase = lazy(() =>
  import("./pages/ErfCase").then((m) => ({ default: m.ErfCase }))
);

const Bookings = lazy(() =>
  import("./bookings").then((m) => ({ default: m.Bookings }))
);
const Labor = lazy(() => import("./labor"));
const SignatureWrite = lazy(() => import("@/components/SignaturePad"));
const Auditwindows = lazy(() => import("./components/audit-windows"));
const Home = lazy(() => import("./Home").then((m) => ({ default: m.Home })));
const GenerateTicket = lazy(() => import("./pages/GenerateTicket").then((m) => ({ default: m.GenerateTicket })));
const GateKeepingRouting = lazy(() =>
  import("./components/GateKeepingRouting").then((m) => ({
    default: m.GateKeepingRouting,
  }))
);
const MasterGateKeeping = lazy(() =>
  import("./components/MasterGateKeeping").then((m) => ({
    default: m.MasterGateKeeping,
  }))
);
const UserProfile = lazy(() =>
  import("./components/user-profile").then((m) => ({
    default: m.UserProfile,
  }))
);

const Forbidden = lazy(() => import("./pages/forbidden"));
const FrontDesk_Page = lazy(() => import("./layout/FrontDesk_Page"));
// Master Table 
const ContactTable = lazy(() =>
  import("./components/table-data/ContactTable")
    .then(m => ({ default: m.ContactTable }))
);
const CompanyTable = lazy(() =>
  import("./components/table-data/CompanyTable")
    .then(m => ({ default: m.CompanyTable}))
)
const AssetTable = lazy(() =>
  import("./components/table-data/AssetTable")
    .then(m => ({ default: m.AssetTable}))
)
const CaseTable = lazy(() =>
  import("./components/table-data/CaseTable")
    .then(m => ({ default: m.CaseTable}))
)
const ProductTable = lazy(() =>
  import("./components/table-data/ProductTable")
    .then(m => ({ default: m.ProductTable}))
)
const ProductTypeTable = lazy(() =>
  import("./components/table-data/ProductTypeTable")
    .then(m => ({ default: m.ProductTypeTable}))
)
const WarrantyServiceTable = lazy(() =>
  import("./components/table-data/WarrantyService")
    .then(m => ({ default: m.WarrantyServiceTable}))
)
const MaterialOrderTable = lazy(() =>
  import("./components/table-data/MaterialOrderTable")
    .then(m => ({ default: m.MaterialOrderTable}))
)
const WorkOrderTable = lazy(() =>
  import("./components/table-data/WorkOrderTable")
    .then(m => ({ default: m.WorkOrderTable}))
)
const ResourceTable = lazy(() =>
  import("./components/table-data/ResourceTable")
    .then(m => ({ default: m.ResourceTable}))
)
const ResourceAccountTable = lazy(() =>
  import("./components/table-data/ResourceAccountTable")
    .then(m => ({ default: m.ResourceAccountTable}))
)
const SubkTechnicianTable = lazy(() =>
  import("./components/table-data/SubkTechinicianTable")
    .then(m => ({ default: m.SubkTechnicianTable}))
)
const SymptomCodeTable = lazy(() =>
  import("./components/table-data/SymptomCodeTable")
    .then(m => ({ default: m.SymptomCodeTable}))
)
const BookingTable = lazy(() =>
  import("./components/table-data/BookingTable")
    .then(m => ({ default: m.BookingTable}))
)
const BookingDetailsTable = lazy(() =>
  import("./components/table-data/BookingDetailsTable")
    .then(m => ({ default: m.BookingDetailsTable}))
)
const BookingStatusTable = lazy(() =>
  import("./components/table-data/BookingStatusTable")
    .then(m => ({ default: m.BookingStatusTable}))
)
const UsersTable = lazy(() =>
  import("./components/table-data/UsersTable")
    .then(m => ({ default: m.UsersTable}))
)
const PartTable = lazy(() =>
  import("./components/table-data/PartTable")
    .then(m => ({ default: m.PartTable}))
)
const RepairClassCodeTable = lazy(() =>
  import("./components/table-data/RepairClassCodeTable")
    .then(m => ({ default: m.RepairClassCodeTable}))
)
const ServiceCatalogTable = lazy(() =>
  import("./components/table-data/ServiceCatalogTable")
    .then(m => ({ default: m.ServiceCatalogTable}))
)
const ServiceCatalogTypeTable = lazy(() =>
  import("./components/table-data/ServiceCatalogTypeTable")
    .then(m => ({ default: m.ServiceCatalogTypeTable}))
)
const OTCCodeTable = lazy(() =>
  import("./components/table-data/OTCCodeTable")
    .then(m => ({ default: m.OTCCodeTable}))
)
const CrsTable = lazy(() =>
  import("./components/table-data/CaseResolutionTable")
    .then(m => ({ default: m.CaseResolutionTable}))
)
const NmuTable = lazy(() =>
  import("./components/table-data/NMUTable")
    .then(m => ({ default: m.NmuTable}))
)
const NmuItemTable = lazy(() =>
  import("./components/table-data/NMUItemTable")
    .then(m => ({ default: m.NMUItemTable}))
)
const FailureTable = lazy(() =>
  import("./components/table-data/FailureTable")
    .then(m => ({ default: m.FailureTable}))
)
const TicketTable = lazy(() =>
  import("./components/table-data/TicketTable")
    .then(m => ({ default: m.TicketTable}))
)

import { ViewCase } from "./pages/ViewCase";
import { UploadRma } from "./pages/uploadRMA";
import ErrorPage from "./lib/error/Errorpage";
// --- Master tables (same as before) ---
// const masterTables = {
//   Company_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Company_table }))
//   ),
//   Assets_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Assets_table }))
//   ),
//   Contact_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Contact_table }))
//   ),
//   Case_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Case_table }))
//   ),
//   Product_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Product_table }))
//   ),
//   ProductType_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.ProductType_table,
//     }))
//   ),
//   WarrantyService_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.WarrantyService_table,
//     }))
//   ),
//   Mo_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Mo_table }))
//   ),
//   Wo_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Wo_table }))
//   ),
//   ResourceAccount_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.ResourceAccount_Table,
//     }))
//   ),
//   SubkTechnician_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.SubkTechnician_table,
//     }))
//   ),
//   SymptomCode_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.SymptomCode_Table,
//     }))
//   ),
//   Bookings_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.BookingsTable,
//     }))
//   ),
//   BookingDetails_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.BookingDetails_Table,
//     }))
//   ),
//   User_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.User_table }))
//   ),
//   Part_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Part_table }))
//   ),
//   Resource_table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Resource_table }))
//   ),
//   RepairClassCode_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.RepairClassCode_Table,
//     }))
//   ),
//   ServiceCatalog_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.ServiceCatalog_Table,
//     }))
//   ),
//   ServiceType_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.ServiceType_Table,
//     }))
//   ),
//   OTCCode_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.OTCCode_Table,
//     }))
//   ),
//   Crs_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Crs_Table }))
//   ),
//   Nmu_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Nmu_Table }))
//   ),
//   NmuItem_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.NmuItem_Table }))
//   ),
//   Failure_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({ default: m.Failure_Table }))
//   ),
//   BookingStatus_Table: lazy(() =>
//     import("./pages/master_table").then((m) => ({
//       default: m.BookingStatus_Table,
//     }))
//   ),
// };

// const {
//   Company_table,
//   Assets_table,
//   Contact_table,
//   Case_table,
//   Product_table,
//   ProductType_table,
//   WarrantyService_table,
//   Mo_table,
//   Wo_table,
//   ResourceAccount_Table,
//   SubkTechnician_table,
//   SymptomCode_Table,
//   Bookings_Table,
//   BookingDetails_Table,
//   User_table,
//   Part_table,
//   Resource_table,
//   RepairClassCode_Table,
//   ServiceCatalog_Table,
//   ServiceType_Table,
//   OTCCode_Table,
//   Crs_Table,
//   Nmu_Table,
//   NmuItem_Table,
//   Failure_Table,
//   BookingStatus_Table,
// } = masterTables;

// --- Simple components reused ---
const NotFound = () => (
  <div style={{ padding: 40, textAlign: "center" }}>
    <h2>404 - Page Not Found</h2>
  </div>
);

export const Loading = () => (
  <div
    style={{
      padding: 40,
      textAlign: "center",
      fontSize: 40,
    }}
  >
    <h2>Loading...</h2>
    <Loader2 className="h-20 w-50 animate-spin inline-block mr-2" />
  </div>
);

function WithSuspense({ children }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}


// --- THE DATA ROUTER ---
export const router = createBrowserRouter([
  // /app layout and children
  {
    path: "/app",
    element: <GateKeepingRouting />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Landing /> },

      { path: "profiles", element: <UserProfile /> },
      { path: "frontdesk", element: <FrontDesk_Page /> },
      { path: "forbidden", element: <Forbidden /> },
      { path: "search_case", element: <Search_case /> },
      { path: "searchcaseproto2", element: <SearchCaseProto2 /> },
      { path: "case/:caseId", element: <Case /> },
      { path: "work/:woid", element: <Work /> },
      { path: "material-order/:moid", element: <MaterialOrder /> },
      { path: "mo_detail/:lineItemID", element: <MoDetail /> },
      { path: "bookings", element: <Bookings /> },
      { path: "bookings/:bookingid", element: <Bookings /> },
      { path: "labor", element: <Labor /> },
      { path: "flowcase", element: <FlowCase /> },
      { path: "ErfCase", element: <ErfCase /> },
      { path: "viewcase", element: <ViewCase /> },
      { path: "uploadRMA", element: <UploadRma /> },

      // --- Master routes (note: NO leading /app here, they are relative) ---
      {
        path: "master/Company_table",
        element: (
          <MasterGateKeeping allow={["admin", "fd", "spv"]}>
            <CompanyTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Assets_table",
        element: (
          <MasterGateKeeping allow={["admin", "fd", "spv"]}>
            <AssetTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Contact_table",
        element: (
          <MasterGateKeeping allow={["admin", "fd", "spv"]}>
            <ContactTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Case_table",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <CaseTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Product_table",
        element: (
          <MasterGateKeeping allow={["admin", "spv"]}>
            <ProductTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/ProductType_table",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <ProductTypeTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/WarrantyService_table",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <WarrantyServiceTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Mo_table",
        element: (
          <MasterGateKeeping allow={["admin", "spv"]}>
            <MaterialOrderTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Wo_table",
        element: (
          <MasterGateKeeping allow={["admin", "spv"]}>
            <WorkOrderTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Resource_table",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <ResourceTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/ResourceAccount",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <ResourceAccountTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/SubkTechnician",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <SubkTechnicianTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/symptom_codes",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <SymptomCodeTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Bookings",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <BookingTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/BookingDetails",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <BookingDetailsTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/BookingStatus",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <BookingStatusTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/User_table",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <UsersTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Part_table",
        element: (
          <MasterGateKeeping allow={["admin", "spv"]}>
            <PartTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/repairClassCode",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <RepairClassCodeTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/ServiceCatalog",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <ServiceCatalogTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/ServiceType",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <ServiceCatalogTypeTable/>
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/OTC_Code",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <OTCCodeTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/CrsTable",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <CrsTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/NmuTable",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <NmuTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/NmuItemTable",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <NmuItemTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Failure",
        element: (
          <MasterGateKeeping allow={["admin"]}>
            <FailureTable />
          </MasterGateKeeping>
        ),
      },
      {
        path: "master/Ticket_Table",
        element: (
          <MasterGateKeeping allow={["admin", "fd"]}>
            <TicketTable />
          </MasterGateKeeping>
        ),
      },

      // catch-all under /app
      { path: "*", element: <NotFound /> },
    ],
  },

  // top-level routes
  { path: "/", element: <Home /> },
  { path: "/generateticket", element: <GenerateTicket/> },
  { path: "/auditwindows", element: <Auditwindows /> },
  { path: "/lorem", element: <Lorem /> },
  { path: "/signature-pad", element: <SignatureWrite /> },

  // global catch-all
  { path: "*", element: <NotFound /> },
]);

