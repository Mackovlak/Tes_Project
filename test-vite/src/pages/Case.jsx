import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import ApiCustomer from '../api'
import Swal from 'sweetalert2';
import { Skeleton } from '../components/ui/skeleton'
import { TabsService } from '../pages/services/service-case'
import { useDraft } from '../components/DraftContext';
import { useAuth } from '@/context/auth-context';
import { create } from 'zustand';
import { useServiceCaseStore } from '@/hooks/useServiceCaseStore';

//? This is the old case detail import just uncomment it if need to use it back
// import { TabsServiceCaseDetails } from './CaseDetail';

// export const Case = () => {
//   const { user } = useAuth();
//   const { caseId } = useParams(); // Get caseId from URL params
//   const { updateDraft } = useDraft(); // Access updateDraft from context
//   const [caseDetails, setCaseDetails] = useState(null);
//   const [caseNote, setCaseNote] = useState(null);
//   const [caseNoteFormData, setCaseNoteFormData] = useState({
//     LogType: "Notes Log",
//     ActionType: "Inbound Customer call",
//     Template: '',
//     VisibleExternally: null,
//     MinutesSpent: 0,
//     Note: ''
//   });

// useEffect(() => {
//   // Update draft when the user visits the case page
//   updateDraft('caseId', caseId); // Save the visited caseId to drafts

//   const loadCaseData = async () => {
//     try {
//       const response = await ApiCustomer.get(`/api/case-information/${caseId}`);
//       setCaseDetails(response.data.data);

//       // const res = await ApiCustomer.get(`/api/case-information/case-notes`);
//       // const notes = res.data.data;
//       // const existingNote = notes.find(note => note.CaseID === caseId);

//       // let noteID;
//       // if (existingNote) {
//       //   noteID = existingNote.NoteID;
//       // } else {
//       //   const createResponse = await ApiCustomer.post(`/api/case-information/case-notes`, {
//       //     LogType: "",
//       //     ActionType: "",
//       //     Template: "",
//       //     VisibleExternally: false,
//       //     MinutesSpent: 0,
//       //     Note: "",
//       //     CaseID: caseId
//       //   });
//       //   noteID = createResponse.data.data.NoteID;
//       // }

//       // const detailRes = await ApiCustomer.get(`/api/case-information/case-notes/${noteID}`);
//       // setCaseNote(detailRes.data.data);

//       // Delay sedikit agar UI sempat render dulu
//       await new Promise(resolve => setTimeout(resolve, 500));

//     } catch (error) {
//       console.error("Gagal memuat data:", error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Gagal memuat data',
//         text: 'Terjadi kesalahan saat mengambil data kasus atau catatan.',
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false
//       });
//     } finally {
//       Swal.close();
//     }
//   };

//   loadCaseData();
// }, [caseId]); // Only include caseId here, no need for updateDraft

//   if (!caseDetails) {
//     return (
//       <div className="p-2 space-y-6">
//         <Skeleton className="h-6 w-1/4"  />
//         <Skeleton className="w-1/1 h-30" />
//         <div className="grid grid-cols-2 gap-4">
//         <Skeleton className="h-116 w-full rounded-lg" />
//         <Skeleton className="h-116 w-full rounded-lg" />
//         </div>
//         <div className="space-y-2" hidden>
//           <Skeleton className="h-4 w-3/4" />
//           <Skeleton className="h-4 w-2/4" />
//           <Skeleton className="h-4 w-full" />
//         </div>
        
//       </div>
//     );
//   }
//   return (
//     <>
//     {/* {user.role === 'admin' ? (
//       <TabsService
//         caseDetails={caseDetails}
//         setCaseDetails={setCaseDetails}
//         caseNote={caseNote}
//         caseNoteFormData={caseNoteFormData}
//         setCaseNoteFormData={setCaseNoteFormData}
//       /> 
//     )  : ( */}
//       <TabsServiceCaseDetails
//           caseDetails={caseDetails}
//           setCaseDetails={setCaseDetails}
//           // caseNote={caseNote}
//           caseNoteFormData={caseNoteFormData}
//           setCaseNoteFormData={setCaseNoteFormData}
//       /> 
//     {/* )
//     } */}
//     </>
//   );
// };


//? This is the new one comment this when the old one is in use
import { TabsServiceCaseDetails } from './CaseDetailReimagined';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { useCaseNotesStore } from '@/hooks/useCaseNoteStore';
import { useMediaQuery } from 'react-responsive';

export const Case = () => {
  const { user } = useAuth();
  const { caseId } = useParams();
  const { updateDraft } = useDraft();
  const [loading, setLoading] = useState(false)
  const refreshFetchPage = useServiceCaseStore((s) => s.refreshFetchPage);
  const caseDetails = useServiceCaseStore((s) => s.caseDetails);
  const initFromCaseDetails = useServiceCaseStore(
    (s) => s.initFromCaseDetails
  );

  // optional: prefetch functions
  const fetchCustomerData = useServiceCaseStore((s) => s.fetchCustomerData);
  const fetchAssetInformation = useServiceCaseStore(
    (s) => s.fetchAssetInformation
  );
  const fetchCaseNotes = useServiceCaseStore((s) => s.fetchCaseNotes);
  const fetchOwnerUserData = useServiceCaseStore(
    (s) => s.fetchOwnerUserData
  );
  const fetchWorkOrders = useServiceCaseStore((s) => s.fetchWorkOrders);
  const fetchMaterialOrders = useServiceCaseStore(
    (s) => s.fetchMaterialOrders
  );
  const fetchGtc = useServiceCaseStore((s) => s.fetchGtc);
  const fetchCsr = useServiceCaseStore((s) => s.fetchCsr);
  const fetchProduct = useServiceCaseStore((s) => s.fetchProduct);
  const fetchActionLog = useServiceCaseStore((s) => s.fetchActionLog);
  const fetchOtcCode = useServiceCaseStore((s) => s.fetchOtcCode);
  const fetchInvoiceData = useServiceCaseStore((s) => s.fetchInvoiceData);
  const fetchDPData = useServiceCaseStore((s) => s.fetchDPData);
  const resetCaseScopedState = useServiceCaseStore(
  (s) => s.resetCaseScopedState
);

  const fetchNotes = useCaseNotesStore((s) => s.fetchNotes);
    useUnsavedChangesGuard();
 useEffect(() => {
  if (!caseId) return;
  resetCaseScopedState();
  // still okay to call this here
  updateDraft("caseId", caseId);
  const loadCaseData = async () => {
    try {
      setLoading(false)


      const response = await ApiCustomer.get(
        `/api/case-information/${caseId}`
      );
      const details = response.data.data;

      // put into zustand
      initFromCaseDetails(details);

      await Promise.allSettled([
        fetchCustomerData(),
        fetchAssetInformation(),
        fetchProduct(),
        fetchNotes(caseId),
        fetchOwnerUserData(),
        fetchWorkOrders(),
        // fetchMaterialOrders(),
        fetchGtc(),
        fetchCsr(),
        fetchActionLog(),
        fetchOtcCode(),
        fetchDPData(),
        fetchInvoiceData({force: true}),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: "Terjadi kesalahan saat mengambil data kasus.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setLoading(true)
    }
  };

  loadCaseData();



}, [caseId, refreshFetchPage]);


  const  isLarge  = useMediaQuery({query: '(max-width: 1024px)'})
  if (!loading) {
    return (
      <div className="p-2 space-y-6 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="w-full h-30" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-116 w-full rounded-lg" />
          <Skeleton className="h-116 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <TabsServiceCaseDetails />
  );
};

// export const useCaseStore = create((set) => ({
//   caseDetails: null,
//   setCaseDetails: (data) => set({ caseDetails: data }),
  
//   caseNote: null,
//   setCaseNote: (data) => set({ caseNote: data }),
  
//   caseNoteFormData: {
//     LogType: "Notes Log",
//     ActionType: "Inbound Customer call",
//     Template: '',
//     VisibleExternally: null,
//     MinutesSpent: 0,
//     Note: ''
//   },
//   setCaseNoteFormData: (data) => set({ caseNoteFormData: data }),
// }));
