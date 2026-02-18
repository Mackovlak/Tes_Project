import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog'
import CaseField from '../CaseField'
import { SearchCommandBlock, SelectYN } from '../sc-select'
import { Input } from '../ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
 } from '../ui/table'
 import { format } from 'date-fns'
 import { parseNoteText } from "@/lib/utils.jsx";
 import { useServiceCaseStore } from '../../hooks/useServiceCaseStore'
import { Button } from '../ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { toast } from "sonner";
import { useCaseNotesStore,
  EMPTY_DRAFT,
  EMPTY_NOTES,
} from '@/hooks/useCaseNoteStore'
import { CaseNotetable } from '../table-data/CaseNotetable'


// export const QuickLogNote = ({ open, onOpenChange }) => {
//   const caseNoteFormData = useServiceCaseStore((s) => s.caseNoteFormData);
//   const setCaseNoteField = useServiceCaseStore((s) => s.setCaseNoteField); 
//   const saveAll = useServiceCaseStore((s) => s.saveAll);
//   const saveNoteOnly = useServiceCaseStore((s) => s.saveNoteOnly);
//   const notesList = useServiceCaseStore((s) => s.notesList);
//   const onChangeCaseNote = (field, value)  => setCaseNoteField(field, value);
//   const handleSave = (confirm = true) => saveNoteOnly({ confirm })
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 2;
//  console.log("CHECKING DATA LIST ",notesList)
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentData = notesList.slice(startIndex, startIndex + itemsPerPage) 
//   const totalPage = Math.ceil(notesList.length / itemsPerPage)
//
//   const handleClick = () => {
//     handleSave()
//   }
//   const [askConfirm, setAskConfirm] = useState(false);
//
// const noteText = (caseNoteFormData?.Note ?? "").toString().trim();
//
//
// const onConfirmSave = async () => {
//
//   if (!noteText) {
//     toast.info("Isi Note terlebih dahulu", { position: "top-center" });
//     return;
//   }
//   try {
//     const ok = await saveNoteOnly({ confirm: false }); // store has no UI confirm
//     if (ok) {
//       setConfirmOpen(false);
//       // optional: close modal after save
//       // onOpenChange(false);
//     }
//   } finally {
//     setAskConfirm(false);
//   }
// };
//
//   return (
//     <>
//     <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className={"min-w-5xl dark:bg-gray-800"}>
//           <DialogHeader className={"px-2 border-b-2 font-bold italic"}>
//             <DialogTitle>Modal Quick Log Note</DialogTitle>
//           </DialogHeader>
//           <div className="flex flex-col gap-2 ">  
//                           <div className="grid grid-cols-2 gap-4">
//                             <CaseField
//                               label="Log Type"
//                             >
//                               <SearchCommandBlock
//                                value={caseNoteFormData?.LogType}
//                                onChange={(val) => onChangeCaseNote("LogType", val)}
//                                options={[
//                                 "Notes Log",
//                                 "Phone Log"
//                                ]}
//                                 placeholder="--Select--"
//                                 className={"dark:ring-1 dark:bg-transparent"}
//                               />
//                             </CaseField>
//
//                             <CaseField
//                               label="Action Type"
//                             >
//                               <SearchCommandBlock
//                                 value={caseNoteFormData?.ActionType}
//                                 onChange={(val) => onChangeCaseNote("ActionType", val)}
//                                 placeholder="--Select--"
//                                 options={[
//                                   "Inbound Customer call",
//                                   "Action Plan",
//                                   "Administrative task",
//                                   "CE/Partner Assist",
//                                   "Customer Email",
//                                 ]}
//                                 className={"dark:ring-1 dark:bg-transparent"}
//
//                               />
//                             </CaseField>
//
//                             <CaseField
//                               label="Notes"
//                               star
//                             >
//                               <textarea
//                                 className="w-full h-full min-h-[100px] resize-none border rounded-md p-3 text-sm ring-1 ring-gray-300 shadow-sm"
//                                 value={caseNoteFormData?.Note || ""}
//                                 onChange={(e) => onChangeCaseNote("Note", e.target.value)}
//                                 placeholder="Write your note"
//                               />
//                             </CaseField>
//                           </div>
//                           <div className=" rounded-2xl shadow-xl">
//                             <Table >
//                               <TableHeader className={'bg-slate-300 dark:bg-slate-600'}>
//                                 <TableRow>
//                                   <TableHead className={"dark:text-white"}>Created On</TableHead>
//                                   <TableHead className={"dark:text-white"}>Created By</TableHead>
//                                   <TableHead className={"dark:text-white"}>Log Type</TableHead>
//                                   <TableHead className={"dark:text-white"}>Action Type</TableHead>
//                                   <TableHead className={"dark:text-white"}>Role</TableHead>
//                                   <TableHead className={"dark:text-white"}>Note</TableHead>
//                                 </TableRow>
//                               </TableHeader>
//                               <TableBody>
//                                 {Array.isArray(currentData) && currentData.length > 0 ? (
//                                   currentData.map((n,i) => (
//                                     <TableRow key={n.NoteID} className={"dark:text-gray-400"}>
//                                       <TableCell>{n.CreatedOn ? format(new Date(n.CreatedOn), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
//                                       <TableCell>{n.createdByUser?.Name || n.CreatedBy || '-'}</TableCell>
//                                       <TableCell>{n.LogType || '-'}</TableCell>
//                                       <TableCell>{n.ActionType || '-'}</TableCell>
//                                       <TableCell>{n.createdByUser?.Role || '-'}</TableCell>
//                                       <TableCell  colSpan="3" className="whitespace-pre-wrap max-w-xl">{parseNoteText(n.Note)}</TableCell>
//                                     </TableRow>
//                                   ))
//                                 ) : (
//                                   <TableRow>
//                                     <TableCell colSpan={4} className="text-center text-sm text-gray-500">No notes yet</TableCell>
//                                   </TableRow>
//                                 )}
//                               </TableBody>
//                             </Table>
//                           </div>
//           </div>  
//
//         <div className='flex justify-between'>
//         <div className='flex gap-2 items-center'>
//           <Button variant={"outline"} className={"cursor-pointer dark:bg-gradient-to-bl dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 dark:border-2"} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
//             Previous
//           </Button>
//
//           <span>Page {currentPage} of {totalPage}</span>
//
//           <Button  variant={"outline"} className={"cursor-pointer dark:bg-gradient-to-tl dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 dark:border-2"} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPage))} disabled={currentPage === totalPage}>Next</Button>
//         </div>
//     <div className="flex items-center gap-2">
//   {!askConfirm ? (
//     <Button variant="outline" onClick={() => setAskConfirm(true)}>
//       Save
//     </Button>
//   ) : (
//     <div className="flex items-center gap-2 rounded-md border p-2">
//       <span className="text-xs text-muted-foreground">Simpan note?</span>
//       <Button size="sm" variant="outline" onClick={() => setAskConfirm(false)}>
//         Batal
//       </Button>
//       <Button size="sm" onClick={onConfirmSave}>
//         Simpan
//       </Button>
//     </div>
//   )}
// </div>
//
//         </div>
//         </DialogContent>
//     </Dialog>
//     </>
//   )
// }


export const QuickLogNote = ({
  open,
  onOpenChange,
  caseId,
  createdBy,
  mode,
  onAfterSaveAll,
}) => {
  const fetchNotes = useCaseNotesStore((s) => s.fetchNotes);
  const saveNoteOnly = useCaseNotesStore((s) => s.saveNoteOnly);
  const setDraftField = useCaseNotesStore((s) => s.setDraftField);

  const notesList = useCaseNotesStore(
    (s) => (caseId ? s.notesByCaseId[caseId] : EMPTY_NOTES) ?? EMPTY_NOTES
  );

  const draft = useCaseNotesStore(
    (s) => (caseId ? s.draftByCaseId[caseId] : EMPTY_DRAFT) ?? EMPTY_DRAFT
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const [askConfirm, setAskConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!caseId) return;
    fetchNotes(caseId);
  }, [open, caseId, fetchNotes]);

  const totalPage = useMemo(() => {
    return Math.max(1, Math.ceil((notesList?.length ?? 0) / itemsPerPage));
  }, [notesList]);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPage));
  }, [totalPage]);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return notesList.slice(startIndex, startIndex + itemsPerPage);
  }, [notesList, currentPage]);

//  const onConfirmSave = async () => {
//    if (!caseId) {
//      toast.error("CaseID not available");
//      return;
//    }
//    try {
//      const ok = await saveNoteOnly({ caseId, createdBy, confirm: false });
//      if (ok) setAskConfirm(false);
//    } finally {
//      setAskConfirm(false);
//    }
//  };
//
  const onConfirmSave = async () => {
  if (!caseId) return toast.error("CaseID not available");

  const okNote = await saveNoteOnly({ caseId, createdBy, confirm: false });
  if (!okNote) return;

  if (mode === "saveAll") {
    const okAll = await onAfterSaveAll?.();
    if (!okAll) return; // keep modal open or show error
  }

  onOpenChange(false);
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"lg:min-w-5xl dark:bg-gray-800  max-h-180 sm:max-h-full transition-all overflow-auto"}>
        <DialogHeader className={"px-2 border-b-2 font-bold italic"}>
          <DialogTitle>Modal Quick Log Note</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="grid lg:grid-cols-2 gap-4">
            <CaseField label="Log Type">
              <SearchCommandBlock
                value={draft.LogType}
                onChange={(val) => caseId && setDraftField(caseId, "LogType", val)}
                options={["Notes Log", "Phone Log"]}
                placeholder="--Select--"
                className={"dark:ring-1 dark:bg-transparent"}
                disabled={!caseId}
              />
            </CaseField>

            <CaseField label="Action Type">
              <SearchCommandBlock
                value={draft.ActionType}
                onChange={(val) =>
                  caseId && setDraftField(caseId, "ActionType", val)
                }
                placeholder="--Select--"
                options={[
                  "Inbound Customer call",
                  "Action Plan",
                  "Administrative task",
                  "CE/Partner Assist",
                  "Customer Email",
                ]}
                className={"dark:ring-1 dark:bg-transparent"}
                disabled={!caseId}
              />
            </CaseField>

            <CaseField label="Notes" star>
              <textarea
                className="w-full h-full lg:min-h-[100px] resize-none border rounded-md p-3 text-sm ring-1 ring-gray-300 shadow-sm"
                value={draft.Note}
                onChange={(e) =>
                  caseId && setDraftField(caseId, "Note", e.target.value)
                }
                placeholder="Write your note"
                disabled={!caseId}
              />
            </CaseField>
          </div>

    <div className="grid grid-cols-1">
       <CaseNotetable notesList={notesList}/>
          </div>
        </div>

        <div className="flex justify-end">

          <div className="flex items-center gap-2">
            {!askConfirm ? (
              <Button variant="outline" onClick={() => setAskConfirm(true)} disabled={!caseId}>
                Save
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-md border p-2">
                <span className="text-xs text-muted-foreground">Simpan note?</span>
                <Button size="sm" variant="outline" onClick={() => setAskConfirm(false)}>
                  Batal
                </Button>
                <Button size="sm" onClick={onConfirmSave} disabled={!caseId}>
                  Simpan
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
