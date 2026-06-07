
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"
import { Plus,PhoneCall, Copy, ExternalLink, XIcon, ArchiveIcon, User } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { SearchCommandBlock, SelectBar3, SelectBarContact4, SelectYN } from "../sc-select";
import { 
  SelectBarContact,
  SelectBarContact2,
  SelectBarContact3,
  SelectBar,
  SelectBar1,
  SelectBar2,
 } from "@/components/sc-select";
 import { 
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectLabel,
   SelectTrigger,
   SelectValue,
  } from '@/components/ui/select'
  
  import CaseField from "../CaseField";

 import { SnInput } from "../sn-input";
import { Textarea } from "../ui/textarea";
import { Pencil, Trash } from "lucide-react";
//import API
import ApiCustomer from "@/api";

import Swal from "sweetalert2";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { getUserFromToken } from "@/lib/utils/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ServiceRequestPDF from "../service-request-form";
import { pdf } from '@react-pdf/renderer';

import { cn } from "@/lib/utils";

import { useAuth } from "@/context/auth-context";
import { ServiceCatalogWarrantyTable } from "../table-data/ServiceCatalogWarranty";
import { PartAdd } from "./MastertabelAdd/PartAdd";
import { PartCatalogPaginated } from "../table-data/PartCatalogTable";

export function CreateNewPartModal({
  open2, 
  setOpen2,
  partCatalog,
  selectedPartCatalog,
  setSelectedPartCatalog,
  onPartAdded,
  hook,
}){
  const [tempSelectedParts, setTempSelectedParts] = useState([]);
  const handlerPartCatalog = (part, checked) => {
    if (checked) {
      setTempSelectedParts((prev) => [...prev, part]);
    } else {
      setTempSelectedParts((prev) =>
        prev.filter((item) => item.PartNumber !== part.PartNumber)
      );
    }
  };

  //search
  const [partNumberInput, setPartNumberInput] = useState("");
  const [partNumberSearch, setPartNumberSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  const filteredPartCatalog = partCatalog.filter(part => {
    return (
      part.PartNumber?.toLowerCase().includes(partNumberSearch.toLowerCase())
    );
  });
    const MAX_PAGES_SHOWN = 3;
 const getPaginationPages = () => {
    if (totalPages <= MAX_PAGES_SHOWN) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 2) {
      return [1, 2, 3];
    }
    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 1, currentPage, currentPage + 1];
  };
  const totalPages = Math.ceil(filteredPartCatalog.length / PAGE_SIZE);
  const paginationPages = getPaginationPages();
  
  
  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPartCatalog.slice(start, start + PAGE_SIZE);
  }, [filteredPartCatalog, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return(
    <>
    <Dialog open={open2} onOpenChange={setOpen2}>
      <DialogContent className={' sm:min-w-[58vw] sm:min-h-[fit-content] flex flex-col justify-center overflow-y-auto'}>
        <DialogHeader className={''}>
          <DialogTitle className={'text-blue-600 text-2xl '}>Add Part</DialogTitle>
          <DialogDescription className={'whitespace-nowrap'}>Adding Another Part To WO</DialogDescription>
        </DialogHeader>
          <div className="flex items-center justify-between sm:max-w-full">
            <span className="flex items-center gap-2">
              <h1 className={'whitespace-nowrap'}>Create New Part</h1>
              {/* <Input  */}
              {/*   className={'ring-1 min-w-[10em] ring-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500'} */}
              {/*   value={partNumberInput} */}
              {/*   onChange={(e) => setPartNumberInput(e.target.value)} */}
              {/* /> */}
              {/* <Button  */}
              {/*   variant={'search'} */}
              {/*   onClick={(e) => setPartNumberSearch(partNumberInput)} */}
              {/* >Search</Button> */}
              <PartAdd
                onReload={false}
                onSuccess={async(createdPart) =>{
                  if(typeof onPartAdded === "function"){
                    await onPartAdded();
                  }
                }}
              />
            </span>
          </div>
                 <PartCatalogPaginated setSelectedPartCatalog={setSelectedPartCatalog} selectedPartCatalog={selectedPartCatalog} hook={hook} />
          <DialogFooter className={'sm:justify-start'}>
            <Button 
              variant={'search'}
              onClick={() => {
                setSelectedPartCatalog((prev) => [
                  ...prev,
                  ...tempSelectedParts.filter(
                    (part) => !prev.some((p) => p.PartNumber === part.PartNumber)
                  ),
                ]);
                setTempSelectedParts([]); //  clear after adding
                Swal.fire({
                  title: "Success!",
                  text: "Part(s) added successfully!",
                  icon: "success",
                  timer: 1500,
                  showConfirmButton: false,
                }).then(()=>{
                  setOpen2(false);
                });

              }}
            >Add Part</Button>
            <Button variant={'search'} onClick={() => { setTempSelectedParts([]); 
            setPartNumberInput("");
            setPartNumberSearch(""); }}>Clear</Button>
            <Button variant={'search'} onClick={() => setOpen2(false)}>Cancel</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
