import React, { useState, useEffect, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
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


export function BtnModal({
  handleCreateCase,
  selectedAssetForCase,
  selectedContactForCase,
  caseType,
  setCaseType,
  accessories,
  setAccessories
}) {
  
  const handleAccessoryChange = (index, field, value) => {
      const newAccessories = [...accessories];
      newAccessories[index][field] = value;
      setAccessories(newAccessories);
    };
  
    const addAccessory = (e) => {
      setAccessories([...accessories, { name: "", note: "", code: "" }]);
    };
  return (
    <Dialog>
    <DialogTrigger asChild>
      <Button 
        variant="outline" 
        disabled={!selectedAssetForCase || !selectedContactForCase}
        className={`mr-4 ${(!selectedAssetForCase || !selectedContactForCase) ? "bg-white cursor-not-allowed" : "bg-blue-500"}`}
      >
        <Plus className="mr-2" />Create Case
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-[700px] bg-white">
      <DialogHeader>
        <DialogTitle>Case Information</DialogTitle>
      </DialogHeader>

      <form className="space-y-5">
        {/* Subject & Type */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="CaseSubject">Case Subject<Label className="text-red-600">*</Label></Label>
            <Input id="CaseSubject" className="p-2 border" placeholder="Enter subject" />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="CaseType">Case Type<Label className="text-red-600">*</Label></Label>
            <SelectBar3
              value={caseType} 
              onChange={setCaseType} 
              id="CaseType"
              placeholder="Select CaseType"
              options={[
                { id: "Depot Repair", name: "Depot Repair" },
                { id: "Onsite", name: "Onsite" },
                { id: "Bench", name: "Bench" },
              ]}
            />
          </div>
        </div>

        {/* KCI Flag */}
        <div className="flex items-center space-x-2">
          <Checkbox id="KCI_Flag" />
          <Label
            htmlFor="KCI_Flag"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            KCI For this case?
          </Label>
        </div>

        {/* Problem Description */}
        <div className="flex flex-col">
          <Label htmlFor="ProblemDesc">Problem Description</Label>
          <textarea
            id="ProblemDesc"
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Describe the problem here..."
          />
        </div>

        {/* Case Note */}
        <div className="flex flex-col">
          <Label htmlFor="CaseNote">Case Note</Label>
          <textarea
            id="CaseNote"
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        {/* Accessories */}
        {accessories.map((acc, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-3">
            <Input placeholder="Accessory name" value={acc.name} onChange={(e) => handleAccessoryChange(index, "name", e.target.value)} />
            <Input placeholder="Note" value={acc.note} onChange={(e) => handleAccessoryChange(index, "note", e.target.value)} />
            <Input placeholder="CT / SN code" value={acc.code} onChange={(e) => handleAccessoryChange(index, "code", e.target.value)} />
          </div>
        ))}
        <Button variant="outline" type="button" onClick={addAccessory}>+ Add Accessory</Button>

        <DialogFooter>
          <Button type="submit" onClick={(e) => {
            e.preventDefault(); // Prevents form submission
            handleCreateCase();
          }}>DONE</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  );
}

export function BtnModalAccount({
  
})
{}
/**
 * TODO 
 * VALIDATION WHERE INPUTED CONTACT ALREADY AVAILABLE
 * CHECK EMAIL OR PHONE
 */

export function BtnModalContact({ 
  selectedCompany, 
  selectedContact, 
  setSelectedContact, 
  open : externalOpen, 
  onOpenChange : externalOnChange,
  companyData
  }) {

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);

  //set modal state 
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? externalOpen : internalOpen;

  const handleChange = (value) => {
    if (isControlled) {
      externalOnChange?.(value); // Don't force false always
    } else {
      setInternalOpen(value);
    }
  };


   const [formDataContact, setFormDataContact] = useState({
      Salutation: '',
      FirstName: '',
      LastName: '',
      Email: '',
      PreferredLanguage: '',
      Phone: '',
      Mobile: '',
      WorkPhone: '',
      WorkExtension: '',
      OtherPhone: '',
      OtherExtension: '',
      Fax: '',
      AddressLine1: '',
      AddressLine2: '',
      City: '',
      StateProvince: '',
      Country: 'Indonesia',
      ZipPostalCode: '',
      SiteAccountID: typeof selectedCompany === "object" 
      ? selectedCompany.SiteAccountID ?? "" 
      : selectedCompany
    });

    const isIndonesia =
      (formDataContact.Country || "").toLowerCase() === "indonesia";

    useEffect(() => {
      fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        .then((res) => res.json())
        .then(setProvinces)
        .catch(console.error);
    }, []);

    useEffect(() => {
      if (!isIndonesia) {
        setCities([]);
        return;
      }
      const selectedProvince = provinces.find(
        (p) => p.name === formDataContact.StateProvince
      );
      if (selectedProvince) {
        fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince.id}.json`
        )
          .then((res) => res.json())
          .then(setCities)
          .catch(console.error);
      } else {
        setCities([]);
      }
    }, [formDataContact.StateProvince, isIndonesia, provinces]);
    
    //handle input
    const handlerInputContactChange = (eOrId, value) => {
      if (typeof eOrId === 'string') {
        setFormDataContact((prev) => ({ ...prev, [eOrId]: value }));
      } else {
        const { id, value } = eOrId.target;
        setFormDataContact((prev) => ({ ...prev, [id]: value }));
      }
    };

    
    const handleClearAllContact = () => {
      setFormDataContact({
        Salutation: '',
        FirstName: '',
        LastName: '',
        Email: '',
        PreferredLanguage: '',
        Phone: '',
        Mobile: '',
        WorkPhone: '',
        WorkExtension: '',
        OtherPhone: '',
        OtherExtension: '',
        Fax: '',
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        StateProvince: '',
        Country: 'Indonesia',
        ZipPostalCode: '',
      })
    }

  // Function to fetch updated contacts
  const fetchContacts = async (companyId) => {
    try {
      const response = await ApiCustomer.get(`/api/contact-information?SiteAccountID=${companyId}`);
      return response.data.data; //  Return updated contacts
    } catch (error) {
      toast.error("Error fetching contacts:", error);
      return [];
    }
  };
  // Handle form submission
  const handlerContactSubmit = async () => {
    try {
        Swal.fire({
        title: 'Saving...',
        text: 'Please wait while we save your data.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      let responseMessage = '';
  
      if (formDataContact.ContactID) {
        //  Update existing contact
        await ApiCustomer.patch(`/api/contact-information/${formDataContact.ContactID}`, formDataContact);
        responseMessage = 'Kontak berhasil diperbarui!';
      } else {
        //  Add new contact
        await ApiCustomer.post("/api/contact-information", formDataContact);
        responseMessage = 'Kontak berhasil ditambahkan!';
      }
  
     if (!isControlled) {
      setInternalOpen(false);
     }
  
      setTimeout(async () => {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: responseMessage,
          confirmButtonText: 'OK',
          allowEscapeKey: false,
        });
  
        if (selectedCompany?.SiteAccountID) {
          const updatedContacts = await fetchContacts(selectedCompany.SiteAccountID);
          setSelectedContact(updatedContacts);
        }
      }, 300); 
  
    } catch (error) {
      toast.error("Error adding contact:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan kontak.',
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };

  // make the 'same in account information' button :
  const handleCopyFromAccount = () => {
    if (companyData == null) return;
    const fieldsToCopy = [
      "AddressLine1",
      "AddressLine2",
      "City",
      "StateProvince",
      "Country",
      "ZipPostalCode"
    ];
  
    fieldsToCopy.forEach((field) => {
      const value = companyData[field] || "";
      handlerInputContactChange({ target: { id: field, value } });
    });
  };
  

  // Edit function 
  //  Function to open Edit Modal
  const openEditModal = (contact) => {
    setFormDataContact(contact);
  };



  return (
    <Dialog open={open} onOpenChange={handleChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white mt-0.5">
          New Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px]  bg-white">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogDescription className="flex gap-2 text-xl font-semibold text-black"><PhoneCall></PhoneCall>Contact Information</DialogDescription>
            <Button 
            className="self-end mr-2" 
            variant="ghost"
            onClick={handleClearAllContact}
            >Clear All</Button>
          
        </DialogHeader>

        <DialogHeader>
          <DialogTitle className="text-md">Basic Information</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-6 gap-2">
          <div className="space-y-0.5 flex flex-col">
            <Label htmlFor="Salutation">Salutation</Label>
            <SelectBar 
              value={formDataContact.Salutation} 
              id="Salutation" 
              onChange={handlerInputContactChange} 
              placeholder="Select Salutation"
              options={[
                { id: "Mr. ", name: "Mr." },
                { id: "Mrs. ", name: "Mrs." },
              ]}
            />
          </div>
          <div className="space-y-0.5 flex flex-col"> 
            <Label htmlFor="PreferredLanguage" >Preferred Language</Label>
            <SelectBar2 
              value={formDataContact.PreferredLanguage} 
              id="PreferredLanguage" 
              onChange={handlerInputContactChange} 
              placeholder="Select Preferred Language"
              options={[
                { id: "English", name: "English" },
                { id: "Spanish", name: "Spanish" },
                { id: "Bahasa Indonesia", name: "Bahasa Indonesia" },
              ]}
            />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="FirstName">First Name</Label>
            <Input value={formDataContact.FirstName} id="FirstName" type="text" className="p-1 border-b-black " onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.5 ">
            <Label htmlFor="LastName">Last Name</Label>
            <Input value={formDataContact.LastName} id="LastName" type="text" className="p-1 border-b-black " onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.5 col-span-2">
            <Label htmlFor="Email">Email</Label>
            <Input value={formDataContact.Email} id="Email" type="email" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-md">Phone preferences</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-6 gap-2">
          <div className="space-y-0.4 col-span-2">
            <Label htmlFor="Phone">Phone</Label>
            <Input
             value={formDataContact.Phone} id="Phone" type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 col-span-2">
            <Label htmlFor="Mobile">Mobile</Label>
            <Input
             value={formDataContact.Mobile} id="Mobile" type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div> 
          <div className="space-y-0.4">
            <Label htmlFor="WorkPhone">Work</Label>
            <Input
             value={formDataContact.WorkPhone} id="WorkPhone" type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4">
            <Label htmlFor="WorkExtension">Work EXTN</Label>
            <Input value={formDataContact.WorkExtension} id="WorkExtension" type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4">
            <Label htmlFor="OtherPhone">Other</Label>
            <Input value={formDataContact.OtherPhone} id="OtherPhone" type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div> 
          <div className="space-y-0.4 ">
            <Label htmlFor="OtherExtension"> Other EXTN</Label>
            <Input value={formDataContact.OtherExtension} id="OtherExtension" type="text" className="p-1 text-sm border-b-black" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 col-span-2">
            <Label htmlFor="Fax">FAX</Label>
            <Input value={formDataContact.Fax} id="Fax" type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
        </div>

        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="text-md">Address</DialogTitle>
          <Button className="text-gray-400 bg-white " onClick={handleCopyFromAccount}><Copy></Copy>Same in Account Adress </Button>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-0.4">
            <Label htmlFor="AddressLine1">Address Line 1</Label>
            <Input id="AddressLine1" type="text" value={formDataContact.AddressLine1 || ""} className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 flex flex-col">
            <Label htmlFor="current">Country</Label>
            <SelectBar 
              id="Country" 
              value={formDataContact.Country || ""} 
              onChange={handlerInputContactChange}
              options={[
                { id: "id", name: "Indonesia" },
                { id: "my", name: "Malaysia" },
                { id: "sg", name: "Singapura" },
                { id: "uk", name: "Inggris" },
                { id: "cn", name: "Cina" }
              ]}
              placeholder="Select a Country"
            />
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="AddressL
            ine2">Address Line 2</Label>
            <Input id="AddressLine2" value={formDataContact.AddressLine2 || ""} type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="ZipPostalCode">Zip/Postal Code</Label>
            <Input id="ZipPostalCode" value={formDataContact.ZipPostalCode || ""} type="text" className="p-1 border-b-black" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="City">City</Label>
            {isIndonesia ? (
              <SelectBar 
                id="City" 
                value={formDataContact.City || ""} 
                className="p-1 text-sm border-b-black" 
                onChange={handlerInputContactChange} 
                options={cities} 
                placeholder="Select a City"
              />
            ) : (
              <Input
                id="City"
                value={formDataContact.City || ""}
                type="text"
                className="p-1 border-b-black"
                onChange={handlerInputContactChange}
                placeholder="Enter a City"
              />
            )}

            
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="StateProvince">State/Province</Label>
            {isIndonesia ? (
              <SelectBar 
                id="StateProvince" 
                value={formDataContact.StateProvince || ""} 
                className="p-1 text-sm border-b-black" 
                onChange={handlerInputContactChange} 
                options={provinces}
                placeholder="Select a Province"
              />
            ) : (
              <Input
                id="StateProvince"
                value={formDataContact.StateProvince || ""}
                type="text"
                className="p-1 border-b-black"
                onChange={handlerInputContactChange}
                placeholder="Enter a State/Province"
              />
            )}
              {/* Hidden Input for SiteAccountID */}
            <Input type="hidden" id="SiteAccountID" value={formDataContact.SiteAccountID || ""} onChange={handlerInputContactChange} />
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center space-x-2 ">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              KCI For this contact?
            </label>
          </div>
        <Button variant="secondary" className="text-xl bg-white cursor-pointer w-30 drop-shadow-md border-1" onClick={handlerContactSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * TODO 
 * MAKE ROUTE FOR PRODUCT
 */
export function BtnModalAsset({
  typeSearch,
  contactID, 
  siteAccountID, 
  selectedContactForCase,
 
  setSelectedAsset,
  selectedAsset,
  open : externalOpen,
  onOpenChange : externalOnChange,
}) {
  //set asset
  const [assets, setAssets] = useState([])
  //prevent infinite loop of calling fetchDataAssets
  useEffect(() => {
    fetchDataAssets();
    fetchUnownedAssets();
  }, []); 

  //set search state
  const [searchAsset, setSearchAsset] = useState("");

  const [currentPage, setCurrentPage] = useState(null);

  const [totalPages, setTotalPages] = useState(null);

  //handle Change Input
  const handleSearchInputAssetsChange = (e) =>{
    const searchQuery = e.target.value;
    setSearchAsset(searchQuery);
  }
  const filteredAssets = searchAsset !== "" ? assets.filter(
    (asset) => 
      asset.SerialNumber?.toLowerCase().includes(searchAsset.toLowerCase()) || 
      asset.product_information?.ProductName?.toLowerCase().includes(searchAsset.toLowerCase()) || 
      asset.ProductNumber?.toLowerCase().includes(searchAsset.toLowerCase())
  ) : [];


  //handling dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssetForCreatingAsset, setSelectedAssetForCreatingAsset] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 10;
  const [unownedAssets, setUnownedAssets] = useState([]);
  const [loadingUnowned, setLoadingUnowned] = useState(false);
  const [searchUnowned, setSearchUnowned] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const open = externalOpen || isOpen;

  const handleChange = (value) => {
    if (externalOpen !== undefined) {
      externalOnChange?.(false);
    } else {
      setIsOpen(value);
    }
  };
  
  useEffect(() => {
    if (!contactID) return;
    fetchUnownedAssets();
    fetchDataAssets();
  }, [contactID, currentPage, searchAsset]);

  const fetchDataAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get(`/api/asset-information/kepemilikan`, {
        params: { page: currentPage, limit: itemsPerPage, search: searchAsset, contactID },
      });

      setAssets(response.data.data);
      setTotalPages(response.data.totalPages);
      return response.data.data;
    } catch (error) {
      setError("Failed to load asset data.");
      toast.error("Error fetching assets:", error);
      return []; //  Return an empty array instead of `undefined`
    } finally{
      setLoading(false);
    }
  };

  const fetchAssetTable = async (companyID = null, contactID = null) => {
    try {
      let query = '';
      if(companyID !== null){
        query += `SiteAccountID=${companyID}`
      }
      if(contactID !== null){
        if(companyID !== null) query += `&`
        query += `ContactID=${contactID}`
      }
      const response = await ApiCustomer.get(`/api/asset-information?${query}`);
      return response.data.data; //  Return updated contacts
    } catch (error) {
      toast.error("Error fetching contacts:", error);
      return [];
    }
  }
  
  
  const fetchUnownedAssets = async () => {
    setLoadingUnowned(true);
    try {
      const response = await ApiCustomer.get(`/api/asset-information/kepemilikan/unowned`, {
        params: {page: 1, limit: 10, search: searchUnowned},
      });
      setUnownedAssets(response.data.data);
    } catch (error) {
      toast.error("Error fetching unowned assets:", error);
    }
    setLoadingUnowned(false);
  };

  const handleUpdateAsset = async () => {
    if (!selectedAssetForCreatingAsset) return;
  
    Swal.fire({
      title: 'Memperbarui asset...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    try {
      const response = await ApiCustomer.patch(`/api/asset-information/kepemilikan/${selectedAssetForCreatingAsset.AssetID}`, {
        contactID,
        siteAccountID
      });
  
      if (response.status === 200) {
        const updatedAssets = await fetchAssetTable(siteAccountID, contactID);
        setSelectedAsset(updatedAssets);
        setIsOpen(false);
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Asset berhasil diperbarui!',
          timer: 2000,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat memperbarui asset.',
        timer: 2000,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      toast.error("Terjadi kesalahan : ", error);
    }
  };
  
  
  
  const handleSearch = async () => {
    setIsSearching(true);
    setCurrentPage(1);
    await fetchDataAssets();
    setIsSearching(false);
    await fetchUnownedAssets();
  };

  //handler check for creating product with frontdesk
  const [isCheckedForCreateProduct, setIsCheckedForCreateProduct] = useState(false);

  return (
    <Dialog open={open} onOpenChange={handleChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`mt-0.5 ${(!selectedContactForCase && typeSearch !== 'individual') ? "bg-white cursor-not-allowed" : "bg-blue-500"}`} 
          onClick={() => setIsOpen(true)}
          disabled={!selectedContactForCase && typeSearch !== 'individual'} // Button disabled if no contact selected
        >
          New Asset
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Asset Information</DialogTitle>
          <DialogDescription>Add Asset</DialogDescription>
          <Button className="self-end mr-2" variant="ghost">Clear All</Button>
        </DialogHeader>

        <DialogHeader>
          <DialogTitle className="text-md">Serial Number</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center gap-3">
          <Input
            className="h-10 my-2 border-2 border-black rounded-2xl w-55 text-md"
            type="Search"
            value={searchUnowned}
            onChange={(e) => setSearchUnowned(e.target.value)}
          />
          <Button
            variant="search"
            className=""
            onClick={fetchUnownedAssets}
          >
            Search
          </Button>
          <div className="flex items-center mt-2">
          <Checkbox id="terms" className="w-5 h-5 border-2 border-black" checked={isCheckedForCreateProduct} onCheckedChange={setIsCheckedForCreateProduct} />
            <label
              htmlFor="terms"
              className="ml-2 font-medium leading-none text-md peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Not Available
            </label>
          </div>
          {isCheckedForCreateProduct && 
            <SnInput 
              unownedAssets={unownedAssets}
              setUnownedAssets={setUnownedAssets}
              fetchUnownedAssets={fetchUnownedAssets}
            />
          }
        </div>

        <Table className="mx-auto mt-2 table-fixed border-spacing-0">
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead>Serial Number</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Product Number</TableHead>
              <TableHead>Product Line</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingUnowned ? (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            ) : unownedAssets.length > 0 ? (
              unownedAssets.map((asset) => (
                <TableRow
                  key={asset.AssetID}
                  onClick={() => setSelectedAssetForCreatingAsset(asset)}
                  className={`cursor-pointer hover:bg-gray-200 ${
                    selectedAssetForCreatingAsset?.AssetID === asset.AssetID ? "bg-blue-300" : ""
                  }`}
                  
                >
                  <TableCell>{asset.SerialNumber}</TableCell>
                  <TableCell className={'whitespace-break-spaces'}>{asset.product_information?.ProductName}</TableCell>
                  <TableCell>{asset.ProductNumber}</TableCell>
                  <TableCell>{asset.product_information?.ProductLine}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No Unowned Assets Available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="search"
            className=""
            onClick={handleUpdateAsset}
            disabled={isUpdating || !selectedAssetForCreatingAsset}
          >
            {isUpdating ? "Processing..." : "Select"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
};

//Peoduct Selection
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { toast } from "sonner";
import { data } from "react-router";
import { id } from "date-fns/locale";


function GenericSelector({ 
  value = null, 
  onChange, 
  endpoint, 
  labelKey, 
  valueKey, 
  placeholder = "Search...", 
  label,
  helperText 
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  // ✅ Sync query dengan value dari luar (misalnya saat edit form)
  useEffect(() => {
    if (value && typeof value === "object") {
      setQuery(value[labelKey] || "");
    }
  }, [value, labelKey]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = endpoint;

        if (query.length >= 2) {
          url = `${endpoint}?search=${query}`;
        }

        const res = await ApiCustomer.get(url);
        setResults(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
    };

    if (query.length === 0 || query.length >= 2) {
      fetchData();
    }
  }, [query, endpoint]);


  const handleSelect = (item) => {
    onChange(item);
    setQuery(item[labelKey]); 
    setOpen(false); 
  };

  return (
    <div className="flex flex-col gap-1 relative">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 500)} // delay to allow click event on items
      />

      {/* Dropdown Results */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {results.map((item) => (
            <div
              key={item[valueKey]}
              onClick={() => handleSelect(item)}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${
                value?.[valueKey] === item[valueKey] ? "bg-blue-50 font-medium" : ""
              }`}
            >
              {item[labelKey]} <span className="text-gray-500 text-xs">({item[valueKey]})</span>
            </div>
          ))}
        </div>
      )}

      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}

export function AssetEdit({ assetId, onUpdate }) {
  const [asset, setAsset] = useState(null);
  const [formData, setFormData] = useState({
    SerialNumber: "",
    Product: null,       // object { ProductNumber, ProductName, ProductLine }
    SiteAccount: null,   // object { SiteAccountID, Company }
    Contact: null,       // object { ContactID, FirstName }
    Warranty: null,      // object { OTCCode, Description }
    EOW_Date: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const requiredFields = ["SerialNumber", "Product"];

  const fetchAsset = async () => {
    if (!assetId) return;
    try {
      const response = await ApiCustomer.get(`/api/asset-information/${assetId}`);
      const data = response.data.data;
      setAsset(data);

      setFormData({
        SerialNumber: data?.SerialNumber || "",
        Product: data?.product_information || null,
        SiteAccount: data?.site_account || null,
        Contact: data?.contact_information || null,
        Warranty: data?.WarrantyOTCCode || null,
        EOW_Date: data?.EOW_Date ? data.EOW_Date.split("T")[0] : "",
      });
    } catch (error) {
      toast.error("Error fetching asset information:", error);
    }
  };

  useEffect(() => {
    if (isOpen && assetId) {
      fetchAsset();
    }
  }, [isOpen, assetId]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    // validation
    for (let field of requiredFields) {
      if (!formData[field]) {
        Swal.fire({
          icon: "warning",
          title: "Warning!",
          text: `Field ${field} is required.`,
          timer: 1200,
          showConfirmButton: false,
        });
        return;
      }
    }

    try {
      const payload = {
        SerialNumber: formData.SerialNumber,
        ProductNumber: formData.Product?.ProductNumber || null,
        SiteAccountID: formData.SiteAccount?.SiteAccountID || null,
        ContactID: formData.Contact?.ContactID || null,
        Warranty_Status: formData.Warranty?.OTCCode || null,
        EOW_Date: formData.EOW_Date || null,
      };

      await ApiCustomer.patch(`/api/asset-information/${assetId}`, payload);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Asset information updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast.error("Error updating asset:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating the asset.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => { setIsOpen(true); fetchAsset(); }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Edit Asset Information</DialogTitle>
          <DialogDescription>
            Update the details of the asset. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-medium text-gray-700">Serial Number<Label className="text-red-600">*</Label></Label>
            <Input
              value={formData.SerialNumber}
              onChange={(e) => handleChange("SerialNumber", e.target.value)}
              placeholder="Enter Serial Number"
            />
          </div>

          <GenericSelector
            value={formData.Product}
            onChange={(p) => handleChange("Product", p)}
            endpoint="/api/product-information"
            labelKey="ProductName"
            valueKey="ProductNumber"
            placeholder="Search product..."
            label="Product*"
          />

          <GenericSelector
            value={formData.SiteAccount}
            onChange={(s) => handleChange("SiteAccount", s)}
            endpoint="/api/site_account"
            labelKey="Company"
            valueKey="SiteAccountID"
            placeholder="Search site account..."
            label="Site Account"
          />

          <GenericSelector
            value={formData.Contact}
            onChange={(c) => handleChange("Contact", c)}
            endpoint="/api/contact-information"
            labelKey="FirstName"
            valueKey="ContactID"
            placeholder="Search contact..."
            label="Contact"
          />
          <GenericSelector
            value={formData.Warranty}
            onChange={(w) => handleChange("Warranty", w)}
            endpoint="/api/otc-code"
            labelKey="Description"
            valueKey="OTCCode"
            placeholder="Select warranty status..."
            label="Warranty Status"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">End of Warranty Date</label>
            <Input
              type="date"
              value={formData.EOW_Date}
              onChange={(e) => handleChange("EOW_Date", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssetDelete ({ assetId }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/asset-information/${assetId}`);
  
        if (response.status === 409 || response.data.success === false) {
          return Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || 'Data ini memiliki keterkaitan dan tidak dapat dihapus.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        }).then(() => {
          window.location.reload();
        });
        
        if (onUpdate) onUpdate();
  
      } catch (error) {
        const message = error?.response?.data?.message;
        if (error?.response?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: message || 'Data ini memiliki keterkaitan dan tidak dapat dihapus.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        }
      }
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className="text-red-500 hover:text-red-700" 
      onClick={handleDelete} >
      <Trash />
    </Button>
  );  
};

export function CompanyEdit({ siteAccountId, onUpdate }) {
  const [formData, setFormData] = useState({
    Company: "",
    Email: "",
    PrimaryPhone: "",
    WhatsappNo: "",
    AddressLine1: "",
    AddressLine2: "",
    City: "",
    StateProvince: "",
    Country: "",
    ZipPostalCode: "",
    NPWP: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const requiredFields = ["Company", "Email", "PrimaryPhone", "AddressLine1", "City", "Country", "ZipPostalCode"];

  const fetchCompany = async () => {
    if (!siteAccountId) return;
    try {
      const response = await ApiCustomer.get(`/api/site_account/${siteAccountId}`);
      const data = response.data.data;
      setFormData({
        Company: data?.Company || "",
        Email: data?.Email || "",
        PrimaryPhone: data?.PrimaryPhone || "",
        WhatsappNo: data?.WhatsappNo || "",
        AddressLine1: data?.AddressLine1 || "",
        AddressLine2: data?.AddressLine2 || "",
        City: data?.City || "",
        StateProvince: data?.StateProvince || "",
        Country: data?.Country || "",
        ZipPostalCode: data?.ZipPostalCode || "",
        NPWP: data?.NPWP || "",
      });
    } catch (error) {
      toast.error("Error fetching company information:", error);
    }
  };

  useEffect(() => {
    if (siteAccountId && isOpen) {
      fetchCompany();
    }
  }, [siteAccountId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        Company: "",
        Email: "",
        PrimaryPhone: "",
        WhatsappNo: "",
        AddressLine1: "",
        AddressLine2: "",
        City: "",
        StateProvince: "",
        Country: "",
        ZipPostalCode: "",
        NPWP: "",
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleUpdate = async () => {
    const isFormValid = requiredFields.every(field => formData[field]);

    if (!isFormValid) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all required fields before submitting.",
        icon: "warning",
        timer: 1100,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }
  
    try {
      Swal.fire({
        title: 'Updating company information...',
        text: 'Mohon tunggu sebentar',
        didOpen: () => {
          Swal.showLoading();
        },
        showConfirmButton: false,
        allowOutsideClick: false,
      });
      await ApiCustomer.patch(`/api/site_account/${siteAccountId}`, formData);
  
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Company information updated successfully.',
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
  
      onUpdate();
      setIsOpen(false);
      
    } catch (error) {
      toast.error("Error updating company:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'An error occurred while updating company information.',
        allowEscapeKey: false,
        timer: 1500,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={() => { setIsOpen(true); }} 
          className="flex items-center gap-2"
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Company Information</DialogTitle>
          <DialogDescription>
            Update the details of the company. Fields marked with <span className="text-red-500">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-4">
          <CaseField label={"Companny Name"} star indent>
            <Input id="Company" autoComplete="organization" value={formData.Company} onChange={handleChange} />
          </CaseField>
          <CaseField label={"Email"} star indent>
            <Input id="Email" type="email" autoComplete="email" value={formData.Email} onChange={handleChange} />
          </CaseField>
          <CaseField label={"Primary Phone"} star indent>
            <Input id="PrimaryPhone" type="tel" autoComplete="tel" value={formData.PrimaryPhone} onChange={handleChange} />
          </CaseField>
          <CaseField label={"Whatsapp No"} indent>
            <Input id="WhatsappNo" type="tel" value={formData.WhatsappNo} onChange={handleChange} />
          </CaseField>
          <CaseField label={"Address Line 1"} star indent>
            <Input id="AddressLine1" value={formData.AddressLine1} onChange={handleChange} />
          </CaseField>
          <CaseField label={"Address Line 2"} indent>
            <Input id="AddressLine2" value={formData.AddressLine2} onChange={handleChange} />
          </CaseField>
          <CaseField label={"City"} star indent>
            <Input id="City" value={formData.City} onChange={handleChange} />
          </CaseField>
          <CaseField label={"State/Province"} star indent>
            <Input id="StateProvince" value={formData.StateProvince} onChange={handleChange} />
          </CaseField>
          <CaseField label={"Country"} star indent>
            <Input id="Country" value={formData.Country} onChange={handleChange} />
          </CaseField>
          <CaseField label={"Zip/Postal Code"} star indent>
            <Input id="ZipPostalCode" value={formData.ZipPostalCode} onChange={handleChange} />
          </CaseField>
          <CaseField label={"NPWP"} indent>
            <Input id="NPWP" value={formData.NPWP} onChange={handleChange} autoComplete="off"/>
          </CaseField>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function CompanyDelete ({ siteAccountId, isModalOpen, setIsModalOpen, onUpdate }) {
const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Data ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
  });

  if (result.isConfirmed) {
    try {
      const response = await ApiCustomer.delete(`/api/site_account/${siteAccountId}`);

      if (response.status === 409 || response.data.success === false) {
        return Swal.fire({
          icon: 'warning',
          title: 'Tidak Bisa Dihapus!',
          text: response.data.message || 'Data ini memiliki keterkaitan dan tidak dapat dihapus.',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil dihapus.',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      }).then(() => {
        window.location.reload();
      });
      
      if (onUpdate) onUpdate();

    } catch (error) {
      const message = error?.response?.data?.message;
      if (error?.response?.status === 409) {
        Swal.fire({
          icon: 'warning',
          title: 'Tidak Bisa Dihapus!',
          text: message || 'Data ini memiliki keterkaitan dan tidak dapat dihapus.',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus!',
          text: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      }
    }
  }
};

return (
  <Button 
    variant="outline" 
    className="text-red-500 hover:text-red-700" 
    onClick={handleDelete}
  >
    <Trash />
  </Button>
);

};

export function ContactEdit({ contactID, onUpdate }) {
  const [contact, setContact] = useState(null);
  const [salutation, setSalutation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [workExtension, setWorkExtension] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zipPostalCode, setZipPostalCode] = useState("");
  const [picName, setPicName] = useState("");
  const [picEmail, setPicEmail] = useState("");
  const [picPhone, setPicPhone] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  const fetchContact = async () => {
    if (!contactID) return;
    try {
      const response = await ApiCustomer.get(`/api/contact-information/${contactID}`);
      const data = response.data.data;
      setContact(data);
      setSalutation(data?.Salutation || "");
      setFirstName(data?.FirstName || "");
      setLastName(data?.LastName || "");
      setEmail(data?.Email || "");
      setPreferredLanguage(data?.PreferredLanguage || "");
      setPhone(data?.Phone || "");
      setMobile(data?.Mobile || "");
      setWorkPhone(data?.WorkPhone || "");
      setWorkExtension(data?.WorkExtension || "");
      setAddressLine1(data?.AddressLine1 || "");
      setAddressLine2(data?.AddressLine2 || "");
      setCity(data?.City || "");
      setStateProvince(data?.StateProvince || "");
      setCountry(data?.Country || "Indonesia");
      setZipPostalCode(data?.ZipPostalCode || "");
      setPicName(data?.PIC_Name || "");
      setPicEmail(data?.PIC_Email || "");
      setPicPhone(data?.PIC_Phone || "");
    } catch (error) {
      toast.error("Error fetching contact information:", error);
    }
  };
  const isIndonesia =
      (country || "").toLowerCase() === "indonesia";

  useEffect(() => {
    if (contactID && isOpen) {
      fetchContact();
    }
  }, [contactID, isOpen]);
  useEffect(() => {
      fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        .then((res) => res.json())
        .then(setProvinces)
        .catch(console.error);
    }, []);
    useEffect(() => {
      if (!isIndonesia) {
        setCities([]);
        return;
      }
      const selectedProvince = provinces.find(
        (p) => p.name === stateProvince
      );
      if (selectedProvince) {
        fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince.id}.json`
        )
          .then((res) => res.json())
          .then(setCities)
          .catch(console.error);
      } else {
        setCities([]);
      }
    }, [stateProvince, isIndonesia, provinces]);

  const handleUpdate = async () => {
    if (!firstName || !lastName || !email || !phone || !city || !country) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all required fields.",
        icon: "warning",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/contact-information/${contactID}`, {
        Salutation: salutation,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PreferredLanguage: preferredLanguage,
        Phone: phone,
        Mobile: mobile,
        WorkPhone: workPhone,
        WorkExtension: workExtension,
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        City: city,
        StateProvince: stateProvince,
        Country: country,
        ZipPostalCode: zipPostalCode,
        PIC_Name: picName,
        PIC_Email: picEmail,
        PIC_Phone: picPhone,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Contact information updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });

      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast.error("Error updating contact:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating contact information.",
        allowEscapeKey: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            setIsOpen(true);
            fetchContact();
          }}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Edit Contact Information</DialogTitle>
          <DialogDescription>
            Update the details of the contact. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable + Responsive Grid */}
        <div className="max-h-[70vh] overflow-y-auto p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Salutation</Label>
              <Input value={salutation} onChange={(e) => setSalutation(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">First Name <Label className="text-red-600">*</Label></Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Last Name <Label className="text-red-600">*</Label></Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Email <Label className="text-red-600">*</Label></Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Preferred Language</Label>
              <Input value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Phone <Label className="text-red-600">*</Label></Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Mobile</Label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Work Phone</Label>
              <Input value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Work Extension</Label>
              <Input value={workExtension} onChange={(e) => setWorkExtension(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Address Line 1</Label>
              <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Address Line 2</Label>
              <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
            </div>
        <div>
              <Label className="text-sm font-medium">Country <Label className="text-red-600">*</Label></Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          <div>
              <Label className="text-sm font-medium">State / Province <Label className="text-red-600">*</Label></Label>
              {/* TODO FOR PERID : DESAIN NIH BIAR GA TERLALU ILANG GARISNYA */}
              {isIndonesia ? (
                <SelectBar className="p-1 border-b-black" value={stateProvince} options={provinces} onChange={(e) => setStateProvince(e.target.value)} />
              ):(
                <Input value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} />
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">City <Label className="text-red-600">*</Label></Label>
              {isIndonesia ? (
                <SelectBar className="p-1 border-b-black" value={city} options={cities} onChange={(e) => setCity(e.target.value)} />
              ):(
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Zip / Postal Code <Label className="text-red-600">*</Label></Label>
              <Input value={zipPostalCode} onChange={(e) => setZipPostalCode(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">PIC Name</label>
              <Input value={picName} onChange={(e) => setPicName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">PIC Email</label>
              <Input value={picEmail} onChange={(e) => setPicEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">PIC Phone</label>
              <Input value={picPhone} onChange={(e) => setPicPhone(e.target.value)} />
            </div>
          </div>
        </div>
     
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContactDelete ({ contactID }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data kontak akan dihapus secara permanen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        await ApiCustomer.delete(`/api/contact-information/${contactID}`);
        await Swal.fire('Berhasil!', 'Kontak berhasil dihapus.', 'success');
        window.location.reload();
      } catch (error) {
        toast.error("Error deleting contact:", error);
        await Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
      }
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className="text-red-500 hover:text-red-700" 
      onClick={handleDelete}>
      <Trash />
    </Button>
  );
};

export function ProductAdd() {
    // Form Product
    const [formDataProduct, setFormDataProduct] = useState({
      ProductNumber: '',
      ProductLine: '',
      ProductName: '',
      ProductTypeID: '',
      HWPC: '', 
    });

    // List ProductType untuk dropdown
    const [productTypes, setProductTypes] = useState([]);

    // Ambil data product type saat pertama render
    useEffect(() => {
      async function fetchProductTypes() {
        try {
          const response = await ApiCustomer.get("/api/product-type");
          setProductTypes(response.data.data || []);
        } catch (err) {
          toast.error("Failed to fetch product types:", err);
        }
      }
      fetchProductTypes();
    }, []);

    // Input Handler
    const handlerInputProduct = (e) => {
      const { id, value } = e.target;
      setFormDataProduct(prev => ({ ...prev, [id]: value }));
    };

    // Submit Handler
    const handlerProduct = async () => {
      const { ProductNumber, ProductLine, ProductName, ProductTypeID } = formDataProduct;

      if (!ProductNumber || !ProductLine || !ProductName || !ProductTypeID) {
        Swal.fire({
          title: "Incomplete Data",
          text: "Please fill in all fields before submitting.",
          icon: "warning",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
        return;
      }

      try {
        const response = await ApiCustomer.post("/api/product-information", formDataProduct);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Product berhasil disimpan.',
          timer: 1200,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        }).then(() => window.location.reload());
      } catch (err) {
        toast.error("Error saving product:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to save Product. Please try again.",
          icon: "error",
          timer: 1200,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-sm">Product Add</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product Information</DialogTitle>
            <DialogDescription>Fields marked with * are required.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Product Number *</Label>
            <Input type="text" id="ProductNumber" value={formDataProduct.ProductNumber} onChange={handlerInputProduct} />

            <Label>Product Line *</Label>
            <Input type="text" id="ProductLine" value={formDataProduct.ProductLine} onChange={handlerInputProduct} />

            <Label>Product Name *</Label>
            <Input type="text" id="ProductName" value={formDataProduct.ProductName} onChange={handlerInputProduct} />

            <Label>Product Type *</Label>
            <Select
              value={formDataProduct.ProductTypeID?.toString() || ""}
              onValueChange={(value) =>
                setFormDataProduct((prev) => ({
                  ...prev,
                  ProductTypeID: parseInt(value),
                }))
            }>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Product Type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type.ProductTypeID} value={type.ProductTypeID.toString()}>
                    {type.ProductType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ✅ Tambahan Input HWPC */}
            <Label>HWPC</Label>
            <Input
              type="text"
              id="HWPC"
              value={formDataProduct.HWPC}
              onChange={handlerInputProduct}
              placeholder="Enter HWPC (optional)"
            />
          </div>

          <DialogFooter>
            <Button onClick={handlerProduct}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
};

export function ProductEdit({ ProductNumber, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [formDataProduct, setFormDataProduct] = useState({
    oldProductNumber: "",
    ProductNumber: "",
    ProductLine: "",
    ProductName: "",
    ProductTypeID: "",
    HWPC: "",
  });

  const [productTypes, setProductTypes] = useState([]);

  // ambil product detail saat modal dibuka
  useEffect(() => {
    if (!open) return;

    const fetchDetail = async () => {
      try {
        const res = await ApiCustomer.get(`/api/product-information/${ProductNumber}`);
        const data = res.data.data;
        setFormDataProduct({
          oldProductNumber: data.ProductNumber,
          ProductNumber: data.ProductNumber,
          ProductLine: data.ProductLine,
          ProductName: data.ProductName,
          ProductTypeID: data.ProductTypeID,
          HWPC: data.HWPC || "",
        });
      } catch (err) {
        toast.error("Error fetch product:", err);
      }
    };

    const fetchTypes = async () => {
      try {
        const res = await ApiCustomer.get("/api/product-type");
        setProductTypes(res.data.data || []);
      } catch (err) {
        toast.error("Error fetch product types:", err);
      }
    };

    fetchDetail();
    fetchTypes();
  }, [open, ProductNumber]);

  const handlerInputProduct = (e) => {
    const { id, value } = e.target;
    setFormDataProduct((prev) => ({ ...prev, [id]: value }));
  };

  const handlerSave = async () => {
    const { ProductNumber, ProductLine, ProductName, ProductTypeID, oldProductNumber, HWPC } = formDataProduct;
    if (!ProductNumber || !ProductLine || !ProductName || !ProductTypeID) {
      Swal.fire({ icon: "warning", title: "Incomplete", text: "Please fill all fields" });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/product-information/${oldProductNumber}`, {
        newProductNumber: ProductNumber, // kirim product number baru
        ProductLine,
        ProductName,
        ProductTypeID,
        HWPC,
      });
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Product updated successfully",
        confirmButtonText: "OK",
        timer: 1500,
        timerProgressBar: true,
}).then(() => {
  setOpen(false);
  onUpdate?.();
});


    } catch (err) {
      toast.error("Error update:", err);
      Swal.fire({ icon: "error", title: "Failed", text: "Update failed, please try again." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product fields below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Product Number <Label className="text-red-600">*</Label></Label>
          <Input
            type="text"
            id="ProductNumber"
            value={formDataProduct.ProductNumber}
            onChange={handlerInputProduct}
          />

          <Label>Product Line <Label className="text-red-600">*</Label></Label>
          <Input type="text" id="ProductLine" value={formDataProduct.ProductLine} onChange={handlerInputProduct} />

          <Label>Product Name <Label className="text-red-600">*</Label></Label>
          <Input type="text" id="ProductName" value={formDataProduct.ProductName} onChange={handlerInputProduct} />

          <Label>Product Type <Label className="text-red-600">*</Label></Label>
          <Select
            value={formDataProduct.ProductTypeID?.toString() || ""}
            onValueChange={(value) => setFormDataProduct((prev) => ({ ...prev, ProductTypeID: parseInt(value) }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Product Type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((t) => (
                <SelectItem key={t.ProductTypeID} value={t.ProductTypeID.toString()}>
                  {t.ProductType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>HWPC</Label>
          <Input
            type="text"
            id="HWPC"
            value={formDataProduct.HWPC}
            onChange={handlerInputProduct}
            placeholder="Enter HWPC"
          />
        </div>

        <DialogFooter>
          <Button onClick={handlerSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProductDelete ({ ProductNumber, isModalOpen, setIsModalOpen, onUpdate }) {
  //set modal
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Product ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/product-information/${ProductNumber}`);
        if (response.status === 409 || response.data.success === false) {
          //  Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Product ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Product berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          // Refresh table or take any action after successful deletion
          if (onUpdate) {
            onUpdate();
          }
        });
  
      } catch (error) {
        if (error.response && error.response.status === 409) {
          //  Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Product ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus product. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
};

export function ProductTypeAdd () {
  // Form ProductType
   const [formDataProductType, setFormDataProductType] = useState({
     ProductGroup: '',
     ProductTower: '',
     ProductType: '',
    })
    
    // Make Handler ProductType
    const handlerInputProductType = (e) => {
      const { id, value } = e.target
      setFormDataProductType(prevState => ({
        ...prevState,
        [id]:value
      }));
    };

    // Handler Submit
    const handlerProductType = async () => {
      const { ProductTower, ProductGroup, ProductType } = formDataProductType;
    
      if (!ProductTower || !ProductGroup || !ProductType) {
        Swal.fire({
          title: "Incomplete Data",
          text: "Please fill in all fields before submitting.",
          icon: "warning",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
        return;
      }
    
      try {
        const response = await ApiCustomer.post("/api/product-type", formDataProductType);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Product Type berhasil disimpan.',
          timer: 1200,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        }).then(() => {
          window.location.reload();
        });

      } catch (err) {
        toast.error("Error saving product type: ", err);
    
        Swal.fire({
          title: "Error!",
          text: "Failed to save ProductType. Please try again.",
          icon: "error",
          timer: 1200,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      }
    };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11"> ProductType Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add ProductType Information</DialogTitle>
          <DialogDescription>
            Add the productType Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
   
          <Label>Product Tower</Label>
          <Select  value={formDataProductType.ProductTower} onValueChange={(value) =>
    setFormDataProductType((prev) => ({ ...prev, ProductTower: value }))
  }>
                      <SelectTrigger className="w-full col-span-3">
                        <SelectValue placeholder="Product Tower"/>
                      </SelectTrigger>
                      <SelectContent >
                        <SelectGroup>
                          <SelectLabel>Product tower</SelectLabel>
                          <SelectItem value="PSG">PSG</SelectItem>
                          <SelectItem value="IPG">IPG</SelectItem>
                        </SelectGroup>
                      </SelectContent>
            </Select>

          <Label>Product Group</Label>
          <Select   value={formDataProductType.ProductGroup}
  onValueChange={(value) =>
    setFormDataProductType((prev) => ({ ...prev, ProductGroup: value }))
  }>
                      <SelectTrigger className="w-full col-span-3">
                        <SelectValue placeholder="Product Group"/>
                      </SelectTrigger>
                      <SelectContent >
                        <SelectGroup>
                          <SelectLabel>Product group</SelectLabel>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Consumer">Consumer</SelectItem>
                        </SelectGroup>
                      </SelectContent>
            </Select>

          <Label>Product Type</Label>
          <Input type="text" id="ProductType" className="p-2" value={formDataProductType.ProductType} onChange={handlerInputProductType} />
        </div>
        <DialogFooter>
          <Button onClick={handlerProductType}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export function ProductTypeEdit({ ProductTypeID, onUpdate }) {
  const [producttypes, setProductTypes] = useState(null);
  const [productTower, setProductTower] = useState("");
  const [productGroup, setProductGroup] = useState("");
  const [productType, setProductType] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchProductTypes = async () => {
    if (!ProductTypeID) return;
    try {
      const response = await ApiCustomer.get(`/api/product-type/${ProductTypeID}`);
      const data = response.data.data;
      setProductTypes(data);
      setProductTower(data?.ProductTower || "");
      setProductGroup(data?.ProductGroup || "");
      setProductType(data?.ProductType || "");
    } catch (error) {
      toast.error("Error fetching productType information:", error);
    }
  };

  useEffect(() => {
    if (ProductTypeID && isOpen) {
      fetchProductTypes();
    }
  }, [ProductTypeID, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setProductTower("");
      setProductGroup("");
      setProductType("");
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!productTower || !productGroup || !productType) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all fields before submitting.",
        icon: "warning",
        timer: 1100,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });  
      return;
    }
  
    try {
      await ApiCustomer.patch(`/api/product-type/${ProductTypeID}`, {
        ProductTower: productTower,
        ProductGroup: productGroup,
        ProductType: productType,
      });
  
     await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product type updated successfully.',
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
  
      onUpdate();      
      setIsOpen(false); 
  
    } catch (error) {
      toast.error("Error updating productType:", error);
  
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'An error occurred while updating product type.',
        allowEscapeKey: false, 
      });
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchProductTypes(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit ProductType Information</DialogTitle>
          <DialogDescription>
            Update the details of the productType Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
   
        <Label>Product Tower</Label>
        <Select
  value={productTower}
  onValueChange={(value) => setProductTower(value)}
>
  <SelectTrigger className="w-full col-span-3">
    <SelectValue placeholder="Product Tower" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Product Tower</SelectLabel>
      <SelectItem value="PSG">PSG</SelectItem>
      <SelectItem value="IPG">IPG</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

        <Label>Product Group</Label>
        <Select
  value={productGroup}
  onValueChange={(value) => setProductGroup(value)}
>
  <SelectTrigger className="w-full col-span-3">
    <SelectValue placeholder="Product Tower" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Product Group</SelectLabel>
      <SelectItem value="Commercial">Commercial</SelectItem>
      <SelectItem value="Consumer">Consumer</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>


        <Label>Product Type</Label>
        <Input type="text" id="ProductType" value={productType} onChange={(e) => setProductType(e.target.value)} />
      </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function ProductTypeDelete ({ ProductTypeID, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Product Type ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/product-type/${ProductTypeID}`);
        if (response.status === 409 || response.data.success === false) {
          //  Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "ProductType ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'ProductType berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          //  Close the modal if it's open
          window.location.reload();
          //  Refresh the table by calling `onUpdate()`
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          //  Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "ProductType ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus ProductType. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
};

export function WarrantyServiceAdd() {
  const [formDataWarrantyService, setFormDataWarrantyService] = useState({
    Service_offerID: "",
    Service_description: "",
    CTat_RTime: "",
    Price: "",
    Shipping_Fee: "",
    qty_ws: "",
    Tax: "",
    Total: "",
    WarrantyCondition: "",   
    CaseTypeServices: "",    
  });

  // Input handler
  const handlerInputWarrantyService = (e) => {
    const { id, value } = e.target;
    setFormDataWarrantyService((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Submit handler
  const handlerWarrantyService = async () => {
    const {
      Service_offerID,
      Service_description,
      CTat_RTime,
      Price,
      Shipping_Fee,
      qty_ws,
      Tax,
      Total,
      WarrantyCondition,
      CaseTypeServices,
    } = formDataWarrantyService;

    if (
      !Service_offerID ||
      !Service_description ||
      !CTat_RTime ||
      !Price ||
      !Shipping_Fee ||
      !qty_ws ||
      !Tax ||
      !Total ||
      !WarrantyCondition
    ) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all required fields before submitting.",
        icon: "warning",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }

    try {
      const response = await ApiCustomer.post(
        "/api/warranty-services",
        formDataWarrantyService
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Warranty Service berhasil disimpan.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (err) {
      toast.error("Error saving warranty service: ", err);

      Swal.fire({
        title: "Error!",
        text: "Failed to save warranty service. Please try again.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">
          Warranty Service Add
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Warranty Service Information</DialogTitle>
          <DialogDescription>
            Add the warranty service. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Service Offer ID <Label className="text-red-600">*</Label></Label>
          <Input
            type="text"
            id="Service_offerID"
            className="p-2"
            value={formDataWarrantyService.Service_offerID}
            onChange={handlerInputWarrantyService}
          />

          <Label htmlFor="Service_description">Service Description <Label className="text-red-600">*</Label></Label>
          <Textarea
            id="Service_description"
            placeholder="Masukkan deskripsi servis"
            className="mt-1"
            value={formDataWarrantyService.Service_description}
            onChange={handlerInputWarrantyService}
          />

          <Label>Customer TAT / Response Time <Label className="text-red-600">*</Label></Label>
          <Input
            type="text"
            id="CTat_RTime"
            className="p-2"
            value={formDataWarrantyService.CTat_RTime}
            onChange={handlerInputWarrantyService}
          />

          <Label>Price <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            id="Price"
            className="p-2"
            value={formDataWarrantyService.Price}
            onChange={handlerInputWarrantyService}
          />

          <Label>Shipping Fee <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            id="Shipping_Fee"
            className="p-2"
            value={formDataWarrantyService.Shipping_Fee}
            onChange={handlerInputWarrantyService}
          />

          <Label>Quantity <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            id="qty_ws"
            className="p-2"
            value={formDataWarrantyService.qty_ws}
            onChange={handlerInputWarrantyService}
          />

          <Label>Tax <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            id="Tax"
            className="p-2"
            value={formDataWarrantyService.Tax}
            onChange={handlerInputWarrantyService}
          />

          <Label>Total <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            id="Total"
            className="p-2"
            value={formDataWarrantyService.Total}
            onChange={handlerInputWarrantyService}
          />

          {/* ✅ Tambahan Field WarrantyCondition */}
          <Label>Warranty Condition <Label className="text-red-600">*</Label></Label>
          <select
            id="WarrantyCondition"
            className="w-full p-2 border rounded-lg"
            value={formDataWarrantyService.WarrantyCondition}
            onChange={handlerInputWarrantyService}
          >
            <option value="">-- Select Condition --</option>
            <option value="InWarranty">In Warranty</option>
            <option value="OutWarranty">Out of Warranty</option>
          </select>

          {/* ✅ Tambahan Field CaseTypeServices */}
          <Label>Case Type Services</Label>
          <Input
            type="text"
            id="CaseTypeServices"
            className="p-2"
            value={formDataWarrantyService.CaseTypeServices}
            onChange={handlerInputWarrantyService}
          />
        </div>

        <DialogFooter>
          <Button onClick={handlerWarrantyService}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WarrantyServiceEdit({ Service_offerID, onUpdate }) {
  const [WarrantyService, setWarrantyService] = useState(null);
  const [Service_offerIDState, setService_offerIDState] = useState("");
  const [Service_description, setService_description] = useState("");
  const [CTat_RTime, setCTat_RTime] = useState("");
  const [Price, setPrice] = useState("");
  const [Shipping_Fee, setShipping_Fee] = useState("");
  const [qty_ws, setQty_ws] = useState("");
  const [Tax, setTax] = useState("");
  const [Total, setTotal] = useState("");
  const [WarrantyCondition, setWarrantyCondition] = useState(""); // NEW
  const [CaseTypeServices, setCaseTypeServices] = useState("");   // NEW
  const [isOpen, setIsOpen] = useState(false);

  const fetchWarrantyService = async () => {
    if (!Service_offerID) return;
    try {
      const response = await ApiCustomer.get(
        `/api/warranty-services/${Service_offerID}`
      );
      const data = response.data.data;
      setWarrantyService(data);
      setService_offerIDState(data?.Service_offerID || "");
      setService_description(data?.Service_description || "");
      setCTat_RTime(data?.CTat_RTime || "");
      setPrice(data?.Price || "");
      setShipping_Fee(data?.Shipping_Fee || "");
      setQty_ws(data?.qty_ws || "");
      setTax(data?.Tax || "");
      setTotal(data?.Total || "");
      setWarrantyCondition(data?.WarrantyCondition || "");
      setCaseTypeServices(data?.CaseTypeServices || "");
    } catch (error) {
      toast.error("Error fetching Warranty Service information:", error);
    }
  };

  useEffect(() => {
    if (Service_offerID && isOpen) {
      fetchWarrantyService();
    }
  }, [Service_offerID, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setWarrantyService("");
      setService_description("");
      setCTat_RTime("");
      setPrice("");
      setShipping_Fee("");
      setQty_ws("");
      setTax("");
      setTotal("");
      setWarrantyCondition("");
      setCaseTypeServices("");
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!Service_offerIDState || !Service_description || !CTat_RTime) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in required fields.",
        icon: "warning",
        timer: 1100,
        showConfirmButton: false,
      });
      return;
    }

    try {
      Swal.fire({
        title: "Updating...",
        text: "Please wait while saving data.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await ApiCustomer.patch(`/api/warranty-services/${Service_offerID}`, {
        Service_description,
        CTat_RTime,
        Price: Price ? parseFloat(Price) : 0,
        Shipping_Fee: Shipping_Fee ? parseFloat(Shipping_Fee) : 0,
        qty_ws: qty_ws ? parseInt(qty_ws) : 0,
        Tax: Tax ? parseFloat(Tax) : 0,
        Total: Total ? parseFloat(Total) : 0,
        WarrantyCondition: WarrantyCondition || null,
        CaseTypeServices: CaseTypeServices || null, // boleh kosong
      });

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Warranty service updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast.error("Error updating Warranty Service:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating warranty service.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            setIsOpen(true);
            fetchWarrantyService();
          }}
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Warranty Service</DialogTitle>
          <DialogDescription>
            Update the details of the Warranty Service. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="Service_description">Service Description <Label className="text-red-600">*</Label></Label>
          <Textarea
            id="Service_description"
            value={Service_description}
            onChange={(e) => setService_description(e.target.value)}
          />

          <Label>Customer TAT / Response Time <Label className="text-red-600">*</Label></Label>
          <Input
            type="text"
            value={CTat_RTime}
            onChange={(e) => setCTat_RTime(e.target.value)}
          />

          <Label>Price <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            value={Price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Label>Shipping Fee <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            value={Shipping_Fee}
            onChange={(e) => setShipping_Fee(e.target.value)}
          />

          <Label>Quantity <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            value={qty_ws}
            onChange={(e) => setQty_ws(e.target.value)}
          />

          <Label>Tax <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            value={Tax}
            onChange={(e) => setTax(e.target.value)}
          />

          <Label>Total <Label className="text-red-600">*</Label></Label>
          <Input
            type="number"
            value={Total}
            onChange={(e) => setTotal(e.target.value)}
          />

          <Label>Warranty Condition</Label>
          <select
            className="border rounded p-2 w-full"
            value={WarrantyCondition}
            onChange={(e) => setWarrantyCondition(e.target.value)}
          >
            <option value="">-- Select Condition --</option>
            <option value="InWarranty">In Warranty</option>
            <option value="OutWarranty">Out of Warranty</option>
          </select>

          <Label>Case Type Services</Label>
          <Input
            type="text"
            value={CaseTypeServices}
            onChange={(e) => setCaseTypeServices(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WarrantyServiceDelete ({ Service_offerID, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Layanan Garansi ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/warranty-services/${Service_offerID}`);
        if (response.status === 409 || response.data.success === false) {
          //  Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Layanan Garansi ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Layanan Garansi berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          //  Close the modal if it's open
          window.location.reload();
          //  Refresh the table by calling `onUpdate()`
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          //  Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Layanan Garansi ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Layanan Garansi. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
};

export function MaterialOrderEdit({ MOID, onUpdate }) {
  const [MaterialOrder, setMaterialOrder] = useState(null);
  const [WOID,  setWOID] = useState("");
  const [OrderNumber,  setOrderNumber ] = useState("");
  const [OrderStatus, setOrderStatus] = useState("");
  const [OrderType, setOrderType] = useState("");
  const [CreatedOn, setCreatedOn] = useState("");
  const [SalesOrderNumber, setSalesOrderNumber] = useState("");
  const [RMANumber, setRMANumber] = useState("");
  const [ReadyForClosureDate,  setReadyForClosureDate] = useState("");
  const [Owner,  setOwner] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchMaterialOrder = async () => {
    if (!MOID) return;
    try {
      const response = await ApiCustomer.get(`/api/mo-detaill/${MOID}`);
      const data = response.data.data;
  
      // Fungsi bantu untuk konversi ke yyyy-MM-dd
      const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
      };
  
      setMaterialOrder(data);
      setWOID(data?.WOID || "");
      setOrderNumber(data?.OrderNumber || "");
      setOrderStatus(data?.OrderStatus || "");
      setOrderType(data?.OrderType || "");
      setCreatedOn(formatDate(data?.CreatedOn));
      setSalesOrderNumber(data?.SalesOrderNumber || "");
      setRMANumber(data?.RMANumber || "");
      setReadyForClosureDate(formatDate(data?.ReadyForClosureDate));
      setOwner(data?.Owner || "");
  
    } catch (error) {
      toast.error("Error fetching Material Order information:", error);
    }
  };
  

  useEffect(() => {
    if (MOID && isOpen) {
      fetchMaterialOrder();
    }
  }, [MOID, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMaterialOrder("");
      setWOID("");
      setOrderNumber("");
      setOrderStatus("");
      setOrderType("");
      setCreatedOn("");
      setSalesOrderNumber("");
      setRMANumber("");
      setReadyForClosureDate("");
      setOwner("");
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (
      !WOID || !OrderNumber || !OrderStatus || !OrderType ||
      !CreatedOn || !SalesOrderNumber || !RMANumber ||
      !ReadyForClosureDate || !Owner
    ) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all fields before submitting.",
        icon: "warning",
        timer: 1100,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }
  
    try {
      //  Tampilkan loading
      Swal.fire({
        title: "Updating...",
        text: "Please wait while saving data.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
  
      await ApiCustomer.patch(`/api/mo-detaill/${MOID}`, {
        WOID,
        OrderNumber,
        OrderStatus,
        OrderType,
        CreatedOn,
        SalesOrderNumber,
        RMANumber,
        ReadyForClosureDate,
        Owner,
      });
  
      Swal.close(); 
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Material Order updated successfully.",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
  
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast.error("Error updating Material Order:", error);
  
      Swal.close();
  
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating Material Order.",
        allowEscapeKey: false,
      });
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchMaterialOrder(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Material Order Information</DialogTitle>
          <DialogDescription>
            Update the details of the Material Order Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">


<Label>Order Number</Label>
<Input type="text" id="Order Number" className="p-2"  value={OrderNumber} onChange={(e) => setOrderNumber(e.target.value)} />

<Label>Order Status</Label>
<Input type="text" id="Order Status" className="p-2"  value={OrderStatus} onChange={(e) => setOrderStatus(e.target.value)} />

<Label>Order Type</Label>
<Input type="text" id="Order Type" className="p-2"  value={OrderType} onChange={(e) => setOrderType(e.target.value)} />
 
<Label>Created On</Label>
<Input type="date" id="Created On" className="p-2"  value={CreatedOn} onChange={(e) => setCreatedOn(e.target.value)} />

<Label>Sales Order Number</Label>
<Input type="text" id="Sales Order Number" className="p-2"  value={SalesOrderNumber} onChange={(e) => setSalesOrderNumber(e.target.value)}/>

<Label>RMANumber</Label>
<Input type="text" id="RMANumber" className="p-2"  value={RMANumber} onChange={(e) => setRMANumber(e.target.value)}/>

<Label>Ready For Closure Date</Label>
<Input type="date" id="Ready For Closure Date" className="p-2"  value={ReadyForClosureDate} onChange={(e) => setReadyForClosureDate(e.target.value)}/>

<Label>Owner</Label>
<Input type="text" id="Owner" className="p-2"  value={Owner} onChange={(e) => setOwner(e.target.value)}/>
</div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function MaterialOrderDelete ({ MOID, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Material Order ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/mo-detaill/${MOID}`);
        if (response.status === 409 || response.data.success === false) {
          //  Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Material Order ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Material Order berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
         window.location.reload();
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          //  Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Material Order ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Material Order. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
};

export function WorkOrderEdit({ WOID, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const defaultFormData = {
    WorkOrderType: "",
    Priority: "",
    SystemStatus: "",
    SubStatus: "",
    PreferredDay: "",
    PreferredTime: "",
    ShipmentCountry: "",
    ShipmentState: "",
    CreatedOn: "",
    Owner: "",
    SLAJeopardy: "",
    DueDateCustomer: "",
    CoverageWindow: "",
    Response: "",
    OTCCode: "",
    RequestedDateTimeCustomer: "",
    GuaranteedFixTimeCustomer: "",
    EarlyStartDateTimeCustomer: "",
    LatestStartDateTimeCustomer: "",
    SLAReschedule: "",
    ActiveScheduleDate: "",
    SLAErrorDescription: "",
    CasePriorityIndex: "",
    PartnerStatus: "",
    WorkOrderDescription: "",
    PartnerNotes: "",
    IncomingChannel: "",
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split("T")[0] : "";

  const fetchWorkOrder = async () => {
    if (!WOID) return;
    try {
      const response = await ApiCustomer.get(`/api/work-order/${WOID}`);
      const data = response.data.data || {};

      setFormData({
        WorkOrderType: data.WorkOrderType || "",
        Priority: data.Priority || "",
        SystemStatus: data.SystemStatus || "",
        SubStatus: data.SubStatus || "",
        PreferredDay: formatDate(data.PreferredDay),
        PreferredTime: formatDate(data.PreferredTime),
        ShipmentCountry: data.ShipmentCountry || "",
        ShipmentState: data.ShipmentState || "",
        CreatedOn: formatDate(data.CreatedOn),
        Owner: data.Owner || "",
        SLAJeopardy: data.SLAJeopardy || "",
        DueDateCustomer: formatDate(data.DueDateCustomer),
        CoverageWindow: data.CoverageWindow || "",
        Response: data.Response || "",
        OTCCode: data.OTCCode || "",
        RequestedDateTimeCustomer: formatDate(data.RequestedDateTimeCustomer),
        GuaranteedFixTimeCustomer: formatDate(data.GuaranteedFixTimeCustomer),
        EarlyStartDateTimeCustomer: formatDate(data.EarlyStartDateTimeCustomer),
        LatestStartDateTimeCustomer: formatDate(data.LatestStartDateTimeCustomer),
        SLAReschedule: data.SLAReschedule || "",
        ActiveScheduleDate: formatDate(data.ActiveScheduleDate),
        SLAErrorDescription: data.SLAErrorDescription || "",
        CasePriorityIndex: data.CasePriorityIndex || "",
        PartnerStatus: data.PartnerStatus || "",
        WorkOrderDescription: data.WorkOrderDescription || "",
        PartnerNotes: data.PartnerNotes || "",
        IncomingChannel: data.IncomingChannel || "",
      });
    } catch (error) {
      toast.error("Error fetching Work Order information:", error);
    }
  };

  const resetForm = () => setFormData(defaultFormData);

  useEffect(() => {
    if (WOID && isOpen) {
      fetchWorkOrder();
    }
  }, [WOID, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target ? e.target.value : e,
    }));
  };

  const handleUpdate = async () => {
    const { WorkOrderType, Priority, SystemStatus } = formData;
  
    if (!WorkOrderType || !Priority || !SystemStatus) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all required fields.",
        icon: "warning",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }
  
    try {
      Swal.fire({
        title: "Updating...",
        text: "Please wait while saving data.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
  
      await ApiCustomer.patch(`/api/work-order/${WOID}`, formData);
  
      Swal.close(); 
      Swal.fire({
        title: "Success!",
        text: "Data berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
  
      onUpdate();   
      setIsOpen(false); 
    } catch (error) {
      toast.error("Error updating Work Order:", error);
  
      Swal.close(); 
      Swal.fire({
        title: "Error",
        text: "Gagal memperbarui data!",
        icon: "error",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };
  
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchWorkOrder(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Order Information</DialogTitle>
          <DialogDescription>
            Update the details of the Work Order. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {[
            { label: "Work Order Type", id: "WorkOrderType", type: "text" },
            { label: "Priority", id: "Priority", type: "select", options: ["High", "Medium", "Low"] },
            { label: "System Status", id: "SystemStatus", type: "select", options: ["Open", "In Progress", "Closed"] },
            { label: "Sub Status", id: "SubStatus", type: "select", options: ["Pending", "Resolved", "Escalated"] },
            { label: "Preferred Day", id: "PreferredDay", type: "date" },
            { label: "Preferred Time", id: "PreferredTime", type: "datetime-local" },
            { label: "Shipment Country", id: "ShipmentCountry", type: "select", options: ["USA", "Canada", "Indonesia", "UK", "Germany", "France", "Japan", "China", "India", "Australia", "Brazil"] },
            { label: "Shipment State", id: "ShipmentState", type: "select", options: ["California", "Texas", "New York", "Florida"] },
            { label: "Created On", id: "CreatedOn", type: "date" },
            { label: "Owner", id: "Owner", type: "text" },
            { label: "SLA Jeopardy", id: "SLAJeopardy", type: "select", options: ["Yes", "No"] },
            { label: "Due Date Customer", id: "DueDateCustomer", type: "date" },
            { label: "Coverage Window", id: "CoverageWindow", type: "text" },
            { label: "Response", id: "Response", type: "text" },
            { label: "OTC Code", id: "OTCCode", type: "text" },
            { label: "Requested Date Time Customer", id: "RequestedDateTimeCustomer", type: "date" },
            { label: "Guaranteed Fix Time Customer", id: "GuaranteedFixTimeCustomer", type: "date" },
            { label: "Early Start Date Time Customer", id: "EarlyStartDateTimeCustomer", type: "date" },
            { label: "Latest Start Date Time Customer", id: "LatestStartDateTimeCustomer", type: "date" },
            { label: "SLA Reschedule", id: "SLAReschedule", type: "text" },
            { label: "Active Schedule Date", id: "ActiveScheduleDate", type: "date" },
            { label: "SLA Error Description", id: "SLAErrorDescription", type: "text" },
            { label: "Case Priority Index", id: "CasePriorityIndex", type: "text" },
            { label: "Partner Status", id: "PartnerStatus", type: "text" },
            { label: "Work Order Description", id: "WorkOrderDescription", type: "textarea" },
            { label: "Partner Notes", id: "PartnerNotes", type: "textarea" },
            { label: "Incoming Channel", id: "IncomingChannel", type: "select", options: ["Email", "Phone", "Chat"] },
          ].map(({ label, id, type, options }) => (
            <div key={id}>
              <Label>{label}</Label>
              {type === "select" ? (
                <Select onValueChange={handleChange(id)} value={formData[id]}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={`Select ${label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : type === "textarea" ? (
                <Textarea id={id} className="p-2" value={formData[id]} onChange={handleChange(id)} />
              ) : (
                <Input type={type} id={id} className="p-2" value={formData[id]} onChange={handleChange(id)} />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function WorkOrderDelete ({ WOID, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Work Order ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/work-order/${WOID}`);
        if (response.status === 409 || response.data.success === false) {
          // Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Work Order ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Work Order berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Work Order ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Work Order. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
};

export function UserAdd({ onAdd }) {
  const [formData, setFormData] = useState({
    Email: "",
    Username: "",
    Password: "",
    Name: "",
    Role: "",
    ResourceId: "",
    ProfilePhoto: "",
    Phone: "",
    Signature: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [signatureImage, setSignatureImage] = useState("");
  const [signature, setSignature] = useState("");
  useEffect(() => {
    fetchDataResource();
  }, []);
  
  useEffect(() => {
    const handleSignature = (event) => {
      if (event.data.type === "signature") {
        setSignatureImage(event.data.imageData);
        setFormData((prev) => ({
          ...prev,
          Signature: event.data.imageData,
        }));
      }
    };

    window.addEventListener("message", handleSignature);

    return () => {
      window.removeEventListener("message", handleSignature);
    };
  }, []);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };
  
  const [resource, setResource] = useState(null);
  const [resourceOptions, setResourceOptions] = useState([]);
  const fetchDataResource = async() => {
    try{
      const res = await ApiCustomer.get(`/api/resources`)
      const options = res.data.data.map((res) => ({
        label: res.Name,
        value: res.ResourceId,
        accounts: res.resourceAccounts, // kamu bisa pakai ini nanti kalau mau tampilkan info akun juga
      }));
      setResourceOptions(options);
    }catch(error){
      toast.error("Failed to fetch resources:", error);
    }

  } 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewPhoto(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!selectedFile) return "";
    const formDataUpload = new FormData();
    formDataUpload.append("file", selectedFile);
    try {
      const res = await ApiCustomer.post("/api/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (error) {
      toast.error("Upload failed:", error);
      return "";
    }
  };

  const handleSubmit = async () => {
    const { Email, Username, Password, Name, Role, ResourceId, Phone, } = formData;
    if (!Email || !Username || !Password || !Name) {
      Swal.fire({
        title: "Data tidak lengkap",
        text: "Silakan isi semua data wajib.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Email", Email);
      formDataToSend.append("Username", Username);
      formDataToSend.append("Password", Password);
      formDataToSend.append("Name", Name);
      formDataToSend.append("Role", Role);
      formDataToSend.append("ResourceId", ResourceId);
      formDataToSend.append("Phone", Phone);
      formDataToSend.append("Signature", signature);

      if (Password) formDataToSend.append("NewPassword", Password);

      // File upload (baru)
      if (selectedFile) {
        formDataToSend.append("ProfilePhoto", selectedFile);
      }

      const payload = {
        ...formDataToSend,
      };

      await ApiCustomer.post("/api/user", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "User berhasil ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      }).then(() => {
        window.location.reload();
      });

      onAdd?.();
      setIsOpen(false);
      setFormData({
        Email: "",
        Username: "",
        Password: "",
        Name: "",
        Role: "",
        ResourceId: "",
        ProfilePhoto: "",
        Phone: "",
        Signature: "",
      });
      setSelectedFile(null);
      setPreviewPhoto(null);
    } catch (err) {
      toast.error("Gagal tambah user:", err);
      Swal.fire({
        title: "Error! Gagal menambahkan user.",
        text: err.response.data.error,
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };

  const handleOpenSignaturePad = () => {
      const sigWindow = window.open("/signature-pad", "Signature Pad", "width=600,height=400");
  
      window.addEventListener("message", (event) => {
        if (event.data.type === "signature") {
          setSignature(event.data.signature); // save base64 signature
          toast.success("Signature captured successfully!",
            {
              description: "Signature Caputred Successfully",
              position:"top-center"
            }
          );
        }
      });
    };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">
          Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="h-[550px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data User</DialogTitle>
          <DialogDescription>
            Isikan semua data pengguna baru dengan benar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Email<Label className="text-red-600">*</Label></Label>
            <Input
              type="email"
              value={formData.Email}
              onChange={handleChange("Email")}
            />
          </div>
          <div>
            <Label>Username<Label className="text-red-600">*</Label></Label>
            <Input
              type="text"
              value={formData.Username}
              onChange={handleChange("Username")}
            />
          </div>
          <div>
            <Label>Password<Label className="text-red-600">*</Label></Label>
            <Input
              type="password"
              value={formData.Password}
              onChange={handleChange("Password")}
            />
          </div>
          <div>
            <Label>Nama <Label className="text-red-600">*</Label></Label>
            <Input
              type="text"
              value={formData.Name}
              onChange={handleChange("Name")}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input
              type="text"
              value={formData.Role}
              onChange={handleChange("Role")}
              placeholder="Contoh: admin / user"
            />
          </div>
          <div>
            <Label>
              Resource
            </Label>
              <SearchCommandBlock
                options={resourceOptions}
                value={formData.ResourceId}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    ResourceId: val,
                  }))
                }
                placeholder="Cari Resource..."
                renderLabel={(opt) => `${opt.label}`} // atau bisa tambah info akun di sini
              />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              value={formData.Phone}
              onChange={handleChange("Phone")}
            />
          </div>
          <div>
            <Label>Signature</Label>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleOpenSignaturePad}
            >
              Tulis Tanda Tangan
            </Button>

            {signatureImage && (
              <img
                src={signatureImage}
                alt="Signature Preview"
                className="mt-2 w-24 h-24 rounded-md"
              />
            )}
          </div>
          <div>
            <Label>Foto Profil</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {previewPhoto && (
              <img
                src={previewPhoto}
                alt="Preview"
                className="object-cover w-24 h-24 mt-2 rounded-md"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserEdit({ IDUser, onUpdate }) {
  const [formData, setFormData] = useState({});
  const formDataref = new FormData();

  const [isOpen, setIsOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [signatureImage, setSignatureImage] = useState("");
  const [signature, setSignature] = useState("");
  const [resource, setResource] = useState(null);
  const [resourceOptions, setResourceOptions] = useState([]);
  const fetchDataResource = async() => {
    try{
      const res = await ApiCustomer.get(`/api/resources`)
      const options = res.data.data.map((res) => ({
        label: res.Name,
        value: res.ResourceId,
        accounts: res.resourceAccounts, // kamu bisa pakai ini nanti kalau mau tampilkan info akun juga
      }));
      setResourceOptions(options);
    }catch(error){
      toast.error("Failed to fetch resources:", error );
    }

  } 

  const defaultFormData = {
    Email: "",
    Username: "",
    Password: "",
    Name: "",
    Role: "user",
    ResourceId: "",
    ProfilePhoto: "",
    Phone: "",
    Signature: "",
  };

  const fetchUser = async () => {
    if (!IDUser) return;
    try {
      const response = await ApiCustomer.get(`/api/user/${IDUser}`);
      const data = response.data.data || {};

      setFormData({
        Email: data.Email || "",
        Username: data.Username || "",
        Password: "",
        Name: data.Name || "",
        Role: data.Role || "user",
        ProfilePhoto: data.ProfilePhoto || "",
        Phone: data.Phone || "",
        ResourceId: data.ResourceId || "",
        Signature: data.Signature || "",
      });

      setPreviewPhoto(data.ProfilePhoto || "");
      setSignatureImage(data.Signature || "");
      setSignature(data.Signature || "");
    } catch (error) {
      toast.error("Error fetching User information:", error);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setPreviewPhoto(null);
    setSelectedFile(null);
    setSignatureImage("");
    setSignature("");
  };

  useEffect(() => {
    if (IDUser && isOpen) fetchUser();
    fetchDataResource();
  }, [IDUser, isOpen]);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewPhoto(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!selectedFile) return formData.ProfilePhoto;

    const formDataUpload = new FormData();
    formDataUpload.append("file", selectedFile);

    try {
      const res = await ApiCustomer.post("/api/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (error) {
      toast.error("Image upload failed:", error);
      return formData.ProfilePhoto;
    }
  };

  const handleOpenSignaturePad = () => {
    const sigWindow = window.open("/signature-pad", "Signature Pad", "width=600,height=400");
    window.addEventListener("message", (event) => {
      if (event.data.type === "signature") {
        setSignatureImage(event.data.signature);
        setSignature(event.data.signature);
        
        setFormData((prev) => ({
          ...prev,
          Signature: event.data.signature,
        }) );

        toast.success("Signature captured successfully!", {
          position: "top-center",
        });
      }
    });
  };

  const handleUpdate = async () => {
    const { Email, Username, Password, Name, Role, ResourceId, Phone, Signature } = formData;

    if (!Email || !Username || !Name) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all required fields.",
        icon: "warning",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }

    try {
      // kalau ada file → pakai FormData
      const formDataToSend = new FormData();
      formDataToSend.append("Email", Email);
      formDataToSend.append("Username", Username);
      formDataToSend.append("Name", Name);
      formDataToSend.append("Role", Role);
      formDataToSend.append("ResourceId", ResourceId);
      formDataToSend.append("Phone", Phone);
      formDataToSend.append("Signature", Signature);

      if (Password) formDataToSend.append("NewPassword", Password);

      // File upload (baru)
      if (selectedFile) {
        formDataToSend.append("ProfilePhoto", selectedFile);
      }
      
      await ApiCustomer.patch(`/api/user/${IDUser}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Success!",
        text: "Data berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });

      onUpdate?.();
      setIsOpen(false);
    } catch (error) {
      toast.error("Error updating user:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal memperbarui data!",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            setIsOpen(true);
            fetchUser();
          }}
        >
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Information</DialogTitle>
          <DialogDescription>
            Update the details of the user. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Email<Label className="text-red-600">*</Label></Label>
            <Input
              type="email"
              value={formData.Email}
              onChange={handleChange("Email")}
            />
          </div>
          <div>
            <Label>Username<Label className="text-red-600">*</Label></Label>
            <Input
              type="text"
              value={formData.Username}
              onChange={handleChange("Username")}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.Password}
              onChange={handleChange("Password")}
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
          </div>
          <div>
            <Label>Name<Label className="text-red-600">*</Label></Label>
            <Input
              type="text"
              value={formData.Name}
              onChange={handleChange("Name")}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input
              type="text"
              value={formData.Role}
              onChange={handleChange("Role")}
            />
          </div>
          <div>
            <Label>
              Resource
            </Label>
              <SearchCommandBlock
                options={resourceOptions}
                value={formData.ResourceId}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    ResourceId: val,
                  }))
                }
                placeholder="Cari Resource..."
                renderLabel={(opt) => `${opt.label}`} // atau bisa tambah info akun di sini
              />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              value={formData.Phone}
              onChange={handleChange("Phone")}
            />
          </div>
          <div>
            <Label>Signature</Label>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleOpenSignaturePad}
            >
              Open Signature Pad
            </Button>
            {signatureImage && (
              <img
                src={signatureImage}
                alt="Signature Preview"
                className="mt-2 w-24 h-24 rounded-md"
              />
            )}
          </div>
          <div>
            <Label>Profile Photo</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {previewPhoto && (
              <img
                src={previewPhoto}
                alt="Preview"
                className="object-cover w-24 h-24 mt-2 rounded-md"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserDelete ({ IDUser, isModalOpen, setIsModalOpen, onUpdate }) {
 
const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "User ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
  });

  if (result.isConfirmed) {
    try {
      const response = await ApiCustomer.delete(`/api/user/${IDUser}`);
      if (response.status === 409 || response.data.success === false) {
        //  Restriction triggered - Show alert message
        Swal.fire({
          icon: 'warning',
          title: 'Tidak Bisa Dihapus!',
          text: response.data.message || "User ini memiliki keterkaitan dan tidak dapat dihapus.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'User berhasil dihapus.',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload(); 
        if (onUpdate) {
          onUpdate();
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        //  Handle 409 Conflict error from backend
        Swal.fire({
          icon: 'warning',
          title: 'Tidak Bisa Dihapus!',
          text: error.response.data.message || "User ini memiliki keterkaitan dan tidak dapat dihapus.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus!',
          text: 'Terjadi kesalahan saat menghapus User. Silakan coba lagi.',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    }
  }
};

return (
  <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
    <Trash />
  </Button>
);
};

export function PartAdd ({ onReload = true, onSuccess }) {
  const [formData, setFormData] = useState({
    PartNumber: "",
    Keyword: "",
    PartDescription: "",
    RestrictionReason: "",
    Orderability: false,
    CSR_Flag: false,
    ROHS_Flag: false,
    Returnable_Flag: false,
    HardRoll_Flag: false,
    DangerousGoods_Flag: false,
    LithiumBattery_Flag: false,
    Oversize_Flag: false,
    Heavy_Flag: false,
    Price: 0,
    FreightPrice: 0,
    Shipping_Fee: 0,
    Tax: 0,
    Total: 0,
  });

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [id]: newValue }));
  };

  const handleSubmit = async () => {
    const { PartNumber, Keyword, PartDescription } = formData;

    if (!PartNumber || !Keyword || !PartDescription) {
      Swal.fire({
        title: "Incomplete Data",
        text: "PartNumber, Keyword, and PartDescription are required.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const payload = {
      ...formData,
      Orderability: Boolean(formData.Orderability),
      CSR_Flag: Boolean(formData.CSR_Flag),
      ROHS_Flag: Boolean(formData.ROHS_Flag),
      Returnable_Flag: Boolean(formData.Returnable_Flag),
      HardRoll_Flag: Boolean(formData.HardRoll_Flag),
      DangerousGoods_Flag: Boolean(formData.DangerousGoods_Flag),
      LithiumBattery_Flag: Boolean(formData.LithiumBattery_Flag),
      Oversize_Flag: Boolean(formData.Oversize_Flag),
      Heavy_Flag: Boolean(formData.Heavy_Flag),
      Price: Number(formData.Price),
      FreightPrice: Number(formData.FreightPrice),
      Shipping_Fee: Number(formData.Shipping_Fee),
      Tax: Number(formData.Tax),
      Total: Number(formData.Total),
    };

    try {
      const res = await ApiCustomer.post(`/api/service-log/parts-catalog`, payload);
      const createdPart = res.data?.data || res.data;
      Swal.fire({
        title: "Success!",
        text: "Part successfully added.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      }).then(async () => {
        if (onReload) {
          window.location.reload();
        } else {
          // new behavior: just tell parent “I’m done, refresh your list”
          if (typeof onSuccess === "function") {
            await onSuccess(createdPart);
          }
        }
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to add part.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">Add Part</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Part</DialogTitle>
          <DialogDescription>Fill in all part details below:</DialogDescription>
        </DialogHeader>

        {/* Grid layout untuk input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Part Number <Label className="text-red-600">*</Label></Label>
            <Input type="text" id="PartNumber" value={formData.PartNumber} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div>
            <Label>Keyword <Label className="text-red-600">*</Label></Label>
            <Input type="text" id="Keyword" value={formData.Keyword} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div className="sm:col-span-2">
            <Label>Part Description <Label className="text-red-600">*</Label></Label>
            <Input type="text" id="PartDescription" value={formData.PartDescription} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div className="sm:col-span-2">
            <Label>Restriction Reason</Label>
            <Input type="text" id="RestrictionReason" value={formData.RestrictionReason} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div>
            <Label>Price</Label>
            <Input type="number" id="Price" value={formData.Price} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div>
            <Label>Freight Price</Label>
            <Input type="number" id="FreightPrice" value={formData.FreightPrice} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div>
            <Label>Shipping Fee</Label>
            <Input type="number" id="Shipping_Fee" value={formData.Shipping_Fee} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div>
            <Label>Tax</Label>
            <Input type="number" id="Tax" value={formData.Tax} onChange={handleChange} className={"mt-2"}/>
          </div>

          <div className="sm:col-span-2">
            <Label>Total</Label>
            <Input type="number" id="Total" value={formData.Total} onChange={handleChange} className={"mt-2"}/>
          </div>
        </div>

        {/* Checkbox flags grid */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Flags</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              "Orderability", "CSR_Flag", "ROHS_Flag", "Returnable_Flag", "HardRoll_Flag",
              "DangerousGoods_Flag", "LithiumBattery_Flag", "Oversize_Flag", "Heavy_Flag"
            ].map((flag) => (
              <label key={flag} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  id={flag}
                  checked={formData[flag]}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>{flag.replace(/_/g, " ")}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleSubmit} className="w-full sm:w-auto">Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PartEdit({ PartNumber, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const defaultFormData = {
    PartNumber: "",
    Keyword: "",
    PartDescription: "",
    RestrictionReason: "",
    Orderability: false,
    CSR_Flag: false,
    ROHS_Flag: false,
    Returnable_Flag: false,
    HardRoll_Flag: false,
    DangerousGoods_Flag: false,
    LithiumBattery_Flag: false,
    Oversize_Flag: false,
    Heavy_Flag: false,
    Price: 0,
    FreightPrice: 0,
    Shipping_Fee: 0,
    Tax: 0,
    Total: 0,
  };

  // 🔹 Fetch data part berdasarkan PartNumber
  const fetchPart = async () => {
    try {
      const res = await ApiCustomer.get(`/api/service-log/parts-catalog/${PartNumber}`);
      setFormData(res.data.data || defaultFormData);
    } catch (e) {
      toast.error("Fetch failed", e);
    }
  };

  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [id]: newValue }));
  };

  const handleUpdate = async () => {
    const { PartNumber, Keyword, PartDescription } = formData;
    if (!PartNumber || !Keyword || !PartDescription) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "PartNumber, Keyword, dan PartDescription wajib diisi.",
        timer: 1200,
        showConfirmButton: false,
      });
      return;
    }

    const updatedData = {
      ...formData,
      Orderability: Boolean(formData.Orderability),
      CSR_Flag: Boolean(formData.CSR_Flag),
      ROHS_Flag: Boolean(formData.ROHS_Flag),
      Returnable_Flag: Boolean(formData.Returnable_Flag),
      HardRoll_Flag: Boolean(formData.HardRoll_Flag),
      DangerousGoods_Flag: Boolean(formData.DangerousGoods_Flag),
      LithiumBattery_Flag: Boolean(formData.LithiumBattery_Flag),
      Oversize_Flag: Boolean(formData.Oversize_Flag),
      Heavy_Flag: Boolean(formData.Heavy_Flag),
      Price: Number(formData.Price),
      FreightPrice: Number(formData.FreightPrice),
      Shipping_Fee: Number(formData.Shipping_Fee),
      Tax: Number(formData.Tax),
      Total: Number(formData.Total),
    };

    try {
      Swal.fire({
        title: "Updating...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await ApiCustomer.patch(`/api/service-log/parts-catalog/${PartNumber}`, updatedData);
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Part updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        onUpdate();
        setIsOpen(false);
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Failed to update part.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    if (isOpen && PartNumber) fetchPart();
    else if (!isOpen) setFormData(defaultFormData);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Part</DialogTitle>
          <DialogDescription>Update detail part di bawah ini:</DialogDescription>
        </DialogHeader>

        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Part Number <Label className="text-red-600">*</Label></Label>
            <Input type="text" id="PartNumber" value={formData.PartNumber || ""} readOnly />
          </div>

          <div>
            <Label>Keyword <Label className="text-red-600">*</Label></Label>
            <Input type="text" id="Keyword" value={formData.Keyword || ""} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <Label>Part Description <Label className="text-red-600">*</Label></Label>
            <Input type="text" id="PartDescription" value={formData.PartDescription || ""} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <Label>Restriction Reason</Label>
            <Input type="text" id="RestrictionReason" value={formData.RestrictionReason || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Price</Label>
            <Input type="number" id="Price" value={formData.Price || 0} onChange={handleChange} />
          </div>

          <div>
            <Label>Freight Price</Label>
            <Input type="number" id="FreightPrice" value={formData.FreightPrice || 0} onChange={handleChange} />
          </div>

          <div>
            <Label>Shipping Fee</Label>
            <Input type="number" id="Shipping_Fee" value={formData.Shipping_Fee || 0} onChange={handleChange} />
          </div>

          <div>
            <Label>Tax</Label>
            <Input type="number" id="Tax" value={formData.Tax || 0} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <Label>Total</Label>
            <Input type="number" id="Total" value={formData.Total || 0} onChange={handleChange} />
          </div>
        </div>

        {/* Flags grid */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Flags</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              "Orderability", "CSR_Flag", "ROHS_Flag", "Returnable_Flag", "HardRoll_Flag",
              "DangerousGoods_Flag", "LithiumBattery_Flag", "Oversize_Flag", "Heavy_Flag"
            ].map((flag) => (
              <label key={flag} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  id={flag}
                  checked={!!formData[flag]}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>{flag.replace(/_/g, " ")}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleUpdate} className="w-full sm:w-auto">Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PartDelete ({ PartNumber, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Part ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/service-log/parts-catalog/${PartNumber}`);
        if (response.status === 409 || response.data.success === false) {
          //  Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Part ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Part berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
         window.location.reload(); 
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Part ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Part. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function ResourceAdd () {
  const [formDataResource, setFormDataResource] = useState({
   ResourceId: '',
   Name: '',
   ServiceCenterName: '',
   ResourceCode: '',
   ResourceLogo: '',
   Phone: '',
   Mobile: '',
   Fax: '',
   Email: '',
   Country: '',
   StateProvince: '',
   City: '',
   ZipPostalCode: '',
   AddressLine: '',	
   })
   
   // Make Handler ProductType
   const handlerInputResource = (e) => {
     const { id, value } = e.target
     setFormDataResource(prevState => ({
       ...prevState,
       [id]:value
     }));
   };

   const handleLogoChange = (e) => {
     const file = e.target.files[0];
     if (!file) return;

     if (!file.type.startsWith("image/")) {
       Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: "Please select an image file.",
          timer: 1500,
          showConfirmButton: false,
          allowEscapeKey: false,
       });
       return;
     }
   const reader = new FileReader();
    reader.onloadend = () => {
      setFormDataResource((prev) => ({ ...prev, ResourceLogo: reader.result }));
    };
    reader.readAsDataURL(file);
   };

   const buildPayLoad = () => {
      const toNull = (v) => (v === "" || v === undefined ? null : v);
      return {
        ResourceId: formDataResource.ResourceId,
        Name: formDataResource.Name,
        ServiceCenterName: toNull(formDataResource.ServiceCenterName),
        ResourceCode:
          formDataResource.ResourceCode !== "" && formDataResource.ResourceCode !== null && formDataResource.ResourceCode !== undefined
            ? Number(formDataResource.ResourceCode)
            : null,
        ResourceLogo: toNull(formDataResource.ResourceLogo),
        Phone: toNull(formDataResource.Phone),
        Mobile: toNull(formDataResource.Mobile),
        Fax: toNull(formDataResource.Fax),
        Email: toNull(formDataResource.Email),
        Country: toNull(formDataResource.Country),
        StateProvince: toNull(formDataResource.StateProvince),
        City: toNull(formDataResource.City),
        ZipPostalCode: toNull(formDataResource.ZipPostalCode),
        AddressLine: toNull(formDataResource.AddressLine),
      };
   };

   // Handler Submit
   const handlerResource = async () => {
     const { 
       ResourceId, Name
     } = formDataResource;
   
     if (!ResourceId || !Name ) {
       Swal.fire({
         title: "Incomplete Data",
         text: "Please fill in all fields before submitting.",
         icon: "warning",
         timer: 1500,
         timerProgressBar: true,
         showConfirmButton: false,
         allowEscapeKey: false,
       });
       return;
     }  
     const payload = buildPayLoad();
     try {
       const response = await ApiCustomer.post("/api/resources", payload);
   
       Swal.fire({
         icon: 'success',
         title: 'Berhasil!',
         text: 'Resource berhasil disimpan.',
         timer: 1200,
         timerProgressBar: true,
         showConfirmButton: false,
         allowEscapeKey: false,
       }).then(() => {
         window.location.reload();
       });

     } catch (err) {
       toast.error("Error saving Resource", err);
   
       Swal.fire({
         title: "Error!",
         text: "Failed to save Resource. Please try again.",
         icon: "error",
         timer: 1200,
         timerProgressBar: true,
         showConfirmButton: false,
         allowEscapeKey: false,
       });
     }
   };
   const fields = [
    {
      id: 'ResourceId',
      label: 'Resource ID',
      type: 'text',
      required: true,
    },
    {
      id: 'Name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      id: 'ServiceCenterName',
      label: 'Service Center Name',
      type: 'text',
    },
    {
      id: 'ResourceCode',
      label: 'Resource Code',
      type: 'number',
    },
    {
      id: 'Phone',
      label: 'Phone',
      type: 'text',
    },
    {
      id: 'Mobile',
      label: 'Mobile',
      type: 'text',
    },
    {
      id: 'Fax',
      label: 'Fax',
      type: 'text',
    },
    {
      id: 'Email',
      label: 'Email',
      type: 'email',
    },
    {
      id: 'Country',
      label: 'Country',
      type: 'text',
    },
    {
      id: 'StateProvince',
      label: 'State/Province',
      type: 'text',
    },
    {
      id: 'City',
      label: 'City',
      type: 'text',
    },
    {
      id: 'ZipPostalCode',
      label: 'Zip/Postal Code',
      type: 'text',
    },
    {
      id: 'AddressLine',
      label: 'Address Line',
      type: 'text',
    },
   ];
 return (
   <Dialog>
     <DialogTrigger asChild>
       <Button variant="outline" className="ml-2 rounded-sm h-11"> Resource Add</Button>
     </DialogTrigger>
     <DialogContent className="w-full max-w-2xl md:max-w-3xl max-h-[80vh] overflow-y-auto">
       <DialogHeader>
         <DialogTitle>Add Resource Information</DialogTitle>
         <DialogDescription>
           Add the Resource Fields marked with * are required.
         </DialogDescription>
       </DialogHeader>
        <div className="space-y-4">
          {/* Grid dua kolom di layar besar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ id, label, type, required }) => (
              <div key={id}>
                <Label htmlFor={id}>
                  {label}{" "}
                  {required && <span className="text-red-600">*</span>}
                </Label>
                <Input
                  type={type}
                  id={id}
                  className="p-2"
                  value={formDataResource[id] ?? ""}
                  onChange={handlerInputResource}
                />
              </div>
            ))}
          </div>

          {/* Bagian logo: upload + preview */}
          <div className="space-y-2">
            <Label htmlFor="ResourceLogo">Resource Logo</Label>
            <Input
              id="ResourceLogo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />

            {formDataResource.ResourceLogo && (
              <div className="mt-2 flex items-center gap-4">
                <img
                  src={formDataResource.ResourceLogo}
                  alt="Resource logo preview"
                  className="h-16 md:h-20 object-contain border rounded-md p-1 bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormDataResource((prev) => ({
                      ...prev,
                      ResourceLogo: "",
                    }))
                  }
                >
                  Hapus logo
                </Button>
              </div>
            )}
          </div>
        </div>
       <DialogFooter>
         <Button onClick={handlerResource}>Add</Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
 );
}

export function ResourceEdit({ ResourceId, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const defaultFormData = {
    ResourceId: "",
    Name: "",
    ServiceCenterName: "",
    ResourceCode: "",
    ResourceLogo: "",
    Phone: "",
    Mobile: "",
    Fax: "",
    Email: "",
    City: "",
    StateProvince: "",
    Country: "",
    ZipPostalCode: "",
    AddressLine: "",
  };

  const fetchResource = async () => {
    try {
      const res = await ApiCustomer.get(`/api/resources/${ResourceId}`);
      const data = res.data.data || {};

      setFormData({
        ...defaultFormData,
        ...data,
        ResourceCode: data.ResourceCode != null ? String(data.ResourceCode): "",
      });
    } catch (e) {
      toast.error("Fetch failed", e);
      Swal.fire({
        icon: "error",
        title: "Fetch failed",
        text: "Failed to fetch resource data.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleChange = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Invalid file type",
        text: "Please select an image file.",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, ResourceLogo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const buildPayload = () => {
    const toNull = (v) => (v === "" || v === undefined ? null : v);

    return {
      Name: formData.Name,
      ServiceCenterName: toNull(formData.ServiceCenterName),
      ResourceCode: formData.ResourceCode !== "" && formData.ResourceCode !== null
          ? Number(formData.ResourceCode)
          : null,
      ResourceLogo: toNull(formData.ResourceLogo),
      Phone: toNull(formData.Phone),
      Mobile: toNull(formData.Mobile),
      Fax: toNull(formData.Fax),
      Email: toNull(formData.Email),
      Country: toNull(formData.Country),
      StateProvince: toNull(formData.StateProvince),
      City: toNull(formData.City),
      ZipPostalCode: toNull(formData.ZipPostalCode),
      AddressLine: toNull(formData.AddressLine),
    };
  };

  const handleUpdate = async () => {
    const { Name } = formData;

    if (!Name) {
      return Swal.fire({
        icon: "warning",
        text: "Lengkapi semua field wajib.",
        timer: 1200,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }

    const updatedData = buildPayload();

    try {
      await ApiCustomer.patch(`/api/resources/${ResourceId}`, updatedData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data diperbarui.",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      }).then(() => {
        onUpdate();
        setIsOpen(false);
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Perbaruan gagal!",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };

  useEffect(() => {
    if (ResourceId && isOpen) fetchResource();
    else if (!isOpen) setFormData(defaultFormData);
  }, [isOpen, ResourceId]);

  const fields = [
    { id: "ResourceId", label: "Resource Id", type: "text", required: true, readonly: true },
    { id: "Name", label: "Name", type: "text", required: true },
    { id: "ServiceCenterName", label: "Service Center Name", type: "text" },
    { id: "ResourceCode", label: "Resource Code", type: "number" },
    { id: "Phone", label: "Phone", type: "text" },
    { id: "Mobile", label: "Mobile", type: "text" },
    { id: "Fax", label: "Fax", type: "text" },
    { id: "Email", label: "Email", type: "text" },
    { id: "Country", label: "Country", type: "text" },
    { id: "StateProvince", label: "State/Province", type: "text" },
    { id: "City", label: "City", type: "text" },
    { id: "ZipPostalCode", label: "Zip/Postal Code", type: "text" },
    { id: "AddressLine", label: "Address Line", type: "text" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl md:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>Update data Resource. (*) wajib diisi.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 🔹 Grid 2 kolom di layar besar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ id, label, type, required, readonly }) => (
              <div key={id}>
                <Label htmlFor={id}>
                  {label}{" "}
                  {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  type={type}
                  id={id}
                  value={formData[id] ?? ""}
                  onChange={handleChange(id)}
                  readOnly={readonly}
                />
              </div>
            ))}
          </div>

          {/* 🔹 Khusus bagian Logo: upload + preview */}
          <div className="space-y-2">
            <Label htmlFor="ResourceLogo">Resource Logo</Label>
            <Input
              id="ResourceLogo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />

            {formData.ResourceLogo && (
              <div className="mt-2 flex items-center gap-4">
                <img
                  src={formData.ResourceLogo}
                  alt="Resource logo preview"
                  className="h-16 md:h-20 object-contain border rounded-md p-1 bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      ResourceLogo: "",
                    }))
                  }
                >
                  Hapus logo
                </Button>
              </div>
            )}
          </div>
        </div>


        <DialogFooter className="mt-4">
          <Button onClick={handleUpdate}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResourceDelete({ ResourceId, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Resource ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/resources/${ResourceId}`);
  
        if (response.status === 409 || response.data.success === false) {
          //  Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Resource ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Resource berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload(); 
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          //  Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Resource ini tidak bisa dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Resource. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function BtnModalsServiceCatalog({ 
  open, 
  setOpen, 
  caseDetails,
  serviceCatalogType,
  WOID = undefined
}) {
  const {user} = useAuth();
  useEffect(() => {
    // Resetting modal state when serviceCatalogType changes
    setCurrentStep(1);
    setStep(0);
    setSelectedWarrantyServices(null);
    setSelectedPartCatalog([]);
    setSubTotalConfirmServices(0);
    setTotalTaxConfirmServices(0);
    setTotalConfirmServices(0);
    setPartNumberSearch("");
    setKeywordSearch("");
    setDescriptionSearch("");

  }, [serviceCatalogType]);
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [currentStep, setCurrentStep] = useState(1);
  // If creating MO from WO, start directly at parts step
  useEffect(() => {
    if ((WOID || serviceCatalogType === 'wo-add-mo') && open) {
      setCurrentStep(2);
    }
  }, [WOID, serviceCatalogType, open]);
  const [assetForWorkOrderCreation, setAssetForWorkOrderCreation] = useState([]);
  const [modalPart, setModalPart] = useState(false);
  const [roleAssign, setRoleAssign] = useState([]);
  const [assignApo, setAssignApo] = useState(null);

  
  //product information
  const fetchDataAssets = async () => {
    try {
      const assetId = caseDetails?.AssetID;
      if (!assetId) return null;
      const response = await ApiCustomer.get(`/api/asset-information/${caseDetails.AssetID}`)
   
      return response.data.data
    }catch(e){
      toast.error("error fetching Asset: ", e)
    }
  }

  const fetchUserAssign = async (role) => {
    try {
      const res = await ApiCustomer.get(`/api/user?role=${role}`);
      setRoleAssign(res.data.data);
    } catch (err) {
      toast.error("Error fetching role: ", err);
    }
  };


  //waranty
  //warranty state
  const [warrantyOffer, setWarrantyOffer] = useState([])
  //fetching data function
  const fetchDataServiceOffer = async () => {
    setLoading(true);
    setError(null);
    try{
      const response = await ApiCustomer.get(`/api/service-log/warranty-services`)
      
      return response.data.data;
    }catch(e){
      setError("Failed to load Warranty Service")
      toast.error("error fetching Service Offer: ", e)
    }finally{
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchDataServiceOffer().then((data) => {
      if (data) setWarrantyOffer(data);
    });
    fetchDataAssets().then((data) => {
      if (data) setAssetForWorkOrderCreation(data);
    });
    fetchDataPartCatalog();
    fetchUserAssign("");
  }, [caseDetails])
  
  useEffect(() => {
    const fetchWarrantyFromWO = async () => {
      if (!WOID) return;

      try {
        const res = await ApiCustomer.get(`/api/work-order/${WOID}`);
        
        const woData = res.data.data;

        if (woData?.serviceCatalog?.warranty_services) {
          setWoWarrantyService(woData.serviceCatalog.warranty_services);
        }
      } catch (err) {
        toast.error("Error fetching WO Warranty:", err);
      }
    };

    fetchWarrantyFromWO();
  }, [WOID]);


  const [selected, setSelected] = useState("DepotRepair"); 
  
  const [selectedWarrantyServices, setSelectedWarrantyServices] = useState(null);
  const [woWarrantyService, setWoWarrantyService] = useState(null);

    const handlerWarrantyService = (service) => {
      setSelectedWarrantyServices(service);
    };

  useEffect(() => {
  }, [selectedWarrantyServices]);
  
  //search part handler
  const [partNumberSearch, setPartNumberSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [descriptionSearch, setDescriptionSearch] = useState("");

  //part state
  const [partCatalog, setPartCatalog] = useState([])
  //fetch data part catalog
  const fetchDataPartCatalog = useCallback(async ({ partNumber = "", keyword = "", description = "" } = {}) => {
    try{
      const params = new URLSearchParams()
      if (partNumber) params.set("partNumber", partNumber)
      if (keyword) params.set("keyword", keyword)
      if (description) params.set("description", description)
      params.set("limit", "100")

      const response = await ApiCustomer.get(`/api/service-log/parts-catalog?${params.toString()}`)
      setPartCatalog(response.data.data || [])
      return response.data.data
    }catch(e){
      toast.error("Err :",e)
    }
  }, [])

  const debouncedFetchPartCatalog = useMemo(() => {
    return debounce((params) => {
      fetchDataPartCatalog(params);
    }, 450);
  }, [fetchDataPartCatalog]);

  const handlePartAdded = async (createdPart) => {
    // 1) refresh catalog from backend (optional but recommended)
    await fetchDataPartCatalog({
      partNumber: partNumberSearch,
      keyword: keywordSearch,
      description: descriptionSearch,
    });

    // 2) auto-select the newly created part in selectedPartCatalog
    if (createdPart?.PartNumber) {
      setSelectedPartCatalog((prev) => {
        const alreadyExists = prev.some(
          (p) => p.PartNumber === createdPart.PartNumber
        );
        if (alreadyExists) return prev;

        const price = parseFloat(createdPart.Price) || 0;

        return [
          ...prev,
          {
            ...createdPart,
            qty: 1,
            Total: price.toFixed ? price.toFixed(2) : price,
          },
        ];
      });
    }
  };


  useEffect(() => {
    debouncedFetchPartCatalog({
      partNumber: partNumberSearch,
      keyword: keywordSearch,
      description: descriptionSearch,
    });
    return () => debouncedFetchPartCatalog.cancel();
  }, [partNumberSearch, keywordSearch, descriptionSearch, debouncedFetchPartCatalog]);

  //handler part
  const [selectedPartCatalog, setSelectedPartCatalog] = useState([])
  const handlerPartCatalog = (part, checked) => {
    if(checked){
      setSelectedPartCatalog((prev) => [
        ...prev,
        {
          ...part,
          qty: 1,
          Total: part.Price,
        }
      ])
    }else{
      setSelectedPartCatalog((prev) => 
        prev.filter((item) => item.PartNumber !== part.PartNumber)
      )
    }
  }
  useEffect(() => {
    handlerPriceConfirmServices();
  }, [selectedPartCatalog]);
  
  const warrantyCondition =
    assetForWorkOrderCreation?.AssetInformation?.WarrantyOTCCode?.WarrantyCondition;

  const isOutWarranty =
    assetForWorkOrderCreation?.Warranty_Status === "01T";
    
  const filteredWarrantyOffers = warrantyOffer.filter(
    (service) =>
      isOutWarranty
        ? service.WarrantyCondition === "OutWarranty"
        : service.WarrantyCondition === "InWarranty"
  );
  const filteredUserAssign = roleAssign.filter(
    (user) => isOutWarranty ? user.Role === "cm" : user.Role === "apo"
  )
  
  //hanlder confirm
  //handler qty price parts
  const handleQtyChangePartsCatalog = (partNumber, qty) => {
    setSelectedPartCatalog((prev) =>
      prev.map((item) => {
        if (item.PartNumber === partNumber) {
          const parsedQty = parseInt(qty) || 1;
          const price = parseFloat(item.Price) || 0;
          return {
            ...item,
            qty: parsedQty,
            Total: (parsedQty * price).toFixed(2)
          };
        }
        return item;
      })
    );
  };

  const handleRemovedPartNumberChange = (partNumber, value) => {
    setSelectedPartCatalog((prev) =>
      prev.map((item) => (
        item.PartNumber === partNumber ? { ...item, RemovedPartNumber: value } : item
      ))
    );
  };

  const handleUEFICodeChange = (partNumber, value) => {
    setSelectedPartCatalog((prev) =>
      prev.map((p) =>
        p.PartNumber === partNumber ? { ...p, UEFICode: value, UEFI_NO: "" } : p
      )
    );
  };

  const handleUEFINoChange = (partNumber, value) => {
    setSelectedPartCatalog((prev) =>
      prev.map((p) =>
        p.PartNumber === partNumber ? { ...p, UEFI_NO: value } : p
      )
    );
  };

  const showUEFINumberHeader = selectedPartCatalog.some(p => p.UEFICode === "FID");

  //handle add part in confirm services
  const [tempSelectedParts, setTempSelectedParts] = useState([]);
  

  //handler Total Subtotal Confirm Services
  const [subTotalConfirmServices, setSubTotalConfirmServices] = useState(0)
  const [TotalTaxConfirmServices, setTotalTaxConfirmServices] = useState(0)
  const [totalConfirmServices, setTotalConfirmServices] = useState(0)
  const effectiveWarrantyService = selectedWarrantyServices ?? woWarrantyService;
  const handlerPriceConfirmServices = () =>{
    let serviceTotal = selectedWarrantyServices ? (parseFloat(selectedWarrantyServices.Price) || 0) : 0;

  
    let partsTotal = selectedPartCatalog.reduce((acc, part) => {
      return acc + (parseFloat(part.Total) || 0);
    }, 0);
  
    if(assetForWorkOrderCreation?.WarrantyOTCCode?.WarrantyCondition === "OutWarranty"){
      const subTotal = serviceTotal + partsTotal;
      setSubTotalConfirmServices(subTotal.toFixed(2));
    }else{
      setSubTotalConfirmServices(0);
    }

  }
  
  //createorder
  const createOrder = async () => {
    const hasPart = selectedPartCatalog.length > 0;
    if (hasPart && !assignApo) {
       toast.warning("APO IS NOT ASSIGN YET", {
        description: "PLEASE CHOOSE THE APO PATNER BEFORE CREATING ORDER",
        position: 'top-center'
      })
      return
    } else {
      // cek apakah ada part yang belum diisi UEFI Code
      const partWithoutUEFICode = selectedPartCatalog.find(
        (p) => !p.UEFICode || p.UEFICode.trim() === ""
      );

      const partWithoutCT = selectedPartCatalog.find(
        (p) => !p.RemovedPartNumber || p.RemovedPartNumber.trim() === ""
      );

      if(partWithoutCT) {
        toast.warning(`CT BAD belum diisi untuk part ${partWithoutCT.PartNumber}`, {
          description: "PLEASE FILL TE CT BAD BEFORE CREATING ORDER",
          position: 'top-center'
        });
        return;
      }
      if (partWithoutUEFICode) {
        toast.warning(`UEFI Code belum diisi untuk part ${partWithoutUEFICode.PartNumber}`, {
          description: "PLEASE CHOOSE THE UEFI CODE BEFORE CREATING ORDER",
          position: 'top-center'
        });
        return;
      }
      
      try {
        Swal.fire({
          title: "Creating Order...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => Swal.showLoading()
        });
        const data = {
          user: getUserFromToken()
        }

        // If WOID present or special mode, create only MO for existing WO
        const isCreateMOOnly = !!WOID || serviceCatalogType === 'wo-add-mo';
        const res = isCreateMOOnly
          ? await (async () => {
              const createdMOIDs = [];
              for (const part of selectedPartCatalog) {
                const r = await ApiCustomer.post("/api/material-order", {
                  WOID: WOID,
                  selectedPartCatalog: [{ ...part, qty: part.qty || 1 }],
                  OwnerID: data.user.id,
                  assignApo: assignApo,
                });
                if (r?.data?.MOID) createdMOIDs.push(r.data.MOID);
              }
              return { data: { many: true, MOIDs: createdMOIDs } };
            })()
          : await ApiCustomer.post("/api/service-log/create-order", {
            /**
             * ASK : IF ORDER IS OUT WARRANTY, ARE THE WO / MO CREATED AUTOMATE TOO, BUT CLOSED IF CANCELLED, OR NEED APPROVE FIRST BY CM?
             */
              AssetID: assetForWorkOrderCreation.AssetID,
              CaseID: caseDetails.CaseID,
              selectedWarrantyServices,
              selectedPartCatalog,
              IncidentType: selected,
              OwnerID: data.user.id,
              assignApo: assignApo,
            });
        Swal.close(); 
        // Close loading after success
        await Swal.fire({
          title: "Success!",
          text:  "Order added successfully!",
          icon:  "success",
          timer: 1500,
          showConfirmButton: false,
          allowEscapeKey: false,
        }).then(()=>{
          setOpen(false);
          const WOIDRes = res.data.WOID
          const MOID = res.data.MOID
          if (isCreateMOOnly) {
            if (res.data?.many && Array.isArray(res.data.MOIDs) && res.data.MOIDs.length) {
              // could open the last MO, keep silent here per prior behavior
            } else if (MOID) {
              window.open(`/app/material-order/${MOID}`, '_blank');
            }
          } else {
            // handle multi-MO creation from create-order
            const manyCreate = res.data?.many && Array.isArray(res.data.MOIDs) && res.data.MOIDs.length;
            switch (serviceCatalogType) {
              case "CSR":
                if (manyCreate) {
                  // Open the last created MO or keep on WO page as desired
                } else if (MOID) {
                  window.open(`/app/material-order/${MOID}`, '_blank');
                }
                break;
              case "serviceorder":
                window.open(`/app/work/${WOIDRes}`, '_blank');  
                break;
              default:
                break;
            }
          }
        });
      } catch (err) {
        toast.error("Order Creation Failed:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to create order",
          icon: "error",
          timer: 1500,
          showConfirmButton: false,
          allowEscapeKey: false,
        });
      }
    };
  }  
  
  function renderStepContent() {
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 5;
    const filteredPartCatalog = partCatalog;
  const MAX_PAGES_SHOWN = 3;

    useEffect(() => {
      setCurrentPage(1);
    }, [partNumberSearch, keywordSearch, descriptionSearch]);

    const totalPages = Math.ceil(filteredPartCatalog.length / PAGE_SIZE);
    
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

    // Skip warranty step when creating MO from WO
    const effectiveStep = ((WOID || serviceCatalogType === 'wo-add-mo') && currentStep === 1) ? 2 : currentStep;
    switch (effectiveStep) {
      case 1:
        return (
          <DialogContent  className="
            w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-7xl
            max-h-[90vh] overflow-y-auto
            flex flex-col justify-center
            gap-0 p-0 bg-white
            [&>button]:hidden
          " >
            <DialogHeader>
              <div className="flex items-end justify-end ">
                {/* <Button className={'bg-transparent '}><ExternalLink color="black"></ExternalLink></Button> */}
                <DialogClose asChild>
                <Button type="button" variant="outline" className={'hover:bg-gray-200 active:bg-gray-700 border-none'}>
                  <XIcon/>
                </Button>
                </DialogClose>
              </div>
              <DialogDescription className={'bg-red-200 p-3 font-bold '}>Click Here to Show Service Catalog Error / Warnings</DialogDescription>
              <DialogTitle className={'text-blue-600 text-2xl'}>Service Catalog</DialogTitle>
            </DialogHeader>
            <div className="flex justify-between gap-4 p-2 my-2 ">
              <DialogTitle>Step 1: Select From List of Service Options</DialogTitle>
              <div className="grid grid-cols-2 p-2 bg-gray-300 gap-2">
                <CaseField label="Product Number">
                  <Input
                  value={assetForWorkOrderCreation?.ProductNumber || "-"}    
                  readOnly              
                  />
                </CaseField>
                <CaseField label="Product Name">
                  <Input
                  value={assetForWorkOrderCreation?.product_information?.ProductName || "-"}     
                  readOnly             
                  />
                </CaseField>
                <CaseField label="Serial Number">
                  <Input
                  value={assetForWorkOrderCreation?.SerialNumber || "-"}
                  readOnly             
                  />
                </CaseField>
                <CaseField label="Warranty Status">
                  <Input
                    value={`${assetForWorkOrderCreation?.Warranty_Status ?? ""} - ${assetForWorkOrderCreation?.WarrantyOTCCode?.Description ?? ""}`}
                  />
                </CaseField>
              </div>
            </div>
  
            <Table>
              <TableCaption className="caption-top bg-blue-500 p-2 text-2xl text-left text-black">
                Warranty Services
              </TableCaption>

              <TableHeader>
                <TableRow className="bg-gray-300">
                  <TableHead className="font-black text-black">Select</TableHead>
                  <TableHead className="font-black text-black">Service OfferID</TableHead>
                  <TableHead className="font-black text-black">Service Description</TableHead>
                  <TableHead className="font-black text-black">Customer TAT</TableHead>
                  <TableHead className="font-black text-black">Price</TableHead>
                  <TableHead className="font-black text-black">Tax</TableHead>
                  <TableHead className="font-black text-black">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredWarrantyOffers.map((service, index) => {
                  const selected =
                    selectedWarrantyServices?.Service_offerID === service.Service_offerID;

                  return (
                    <TableRow
                      key={service.Service_offerID ?? index}
                      onClick={() => handlerWarrantyService(service)}
                      onKeyDown={(e) => {
                        // allow Enter or Space to select row for keyboard users
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handlerWarrantyService(service);
                        }
                      }}
                      tabIndex={0} // make TR focusable for keyboard users
                      aria-selected={selected}
                      className={`cursor-pointer ${selected ? "bg-blue-100" : ""}`}
                    >
                      <TableCell>
                        <input
                          type="radio"
                          name="warrantyService" // same name groups radios
                          id={`service-${index}`}
                          value={service.Service_offerID}
                          checked={selected}
                          onChange={() => handlerWarrantyService(service)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select service ${service.Service_offerID}`}
                        />
                      </TableCell>

                      <TableCell>{service.Service_offerID}</TableCell>
                      <TableCell>{service.Service_description}</TableCell>
                      <TableCell>{service.CTat_RTime}</TableCell>
                      <TableCell>{service.Price}</TableCell>
                      <TableCell>{service.Tax}</TableCell>
                      <TableCell>{service.Total}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

  
            <DialogFooter className={'p-4'}>
             <Button  className="" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              
              onClick={() => setCurrentStep(2)} 
              disabled={!selectedWarrantyServices}
              className={!selectedWarrantyServices ? "opacity-50 cursor-not-allowed" : ""}
            >
              Next
            </Button>
            </DialogFooter>
          </DialogContent>
        );
  
      case 2:  
        return (
          <DialogContent
            className=" w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-7xl
    flex flex-col justify-center
    gap-0 p-0 bg-white
    [&>button]:hidden"
          >
            <DialogHeader>
              <div className="flex items-end justify-end">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={"hover:bg-gray-200 active:bg-gray-700  border-none"}
                  >
                    <XIcon />
                  </Button>
                </DialogClose>
              </div>
              <div className={"flex flex-col"}>
              <DialogTitle className={"text-blue-600 text-2xl"}>
                Service Catalog
              </DialogTitle>
              <DialogDescription>
                Select parts required for the repair.
              </DialogDescription>

              </div>
            </DialogHeader>
            <div className="">
              {/* Kolom kiri  */}
              <div className=" bg-gray-200 p-2">
                <div className="flex">
                  <p className="font-medium w-40">Service OfferID</p>
                  <p>: {effectiveWarrantyService?.Service_offerID ?? "-"}</p>
                </div>
                <div className="flex">
                  <p className="font-medium w-40">Service Description</p>
                  <p>
                    : {effectiveWarrantyService?.Service_description ?? "-"}
                  </p>
                </div>
              </div>

              {/* Kolom kanan  */}
              {/* <div className=" bg-gray-200 grid grid-cols-2 gap-x-2 gap-y-1 p-2">
                <p>Product Number</p>
                <p>: {assetForWorkOrderCreation?.ProductNumber || "-"}</p>
                <p>Product Name</p>
                <p>
                  :{" "}
                  {assetForWorkOrderCreation?.product_information
                    ?.ProductName || "-"}
                </p>
                <p>Serial Number</p>
                <p>: {assetForWorkOrderCreation?.SerialNumber || "-"}</p>
                <p>Warranty Status</p>
                <p>
                  : {assetForWorkOrderCreation?.Warranty_Status} -{" "}
                  {assetForWorkOrderCreation?.WarrantyOTCCode?.Description}
                </p>
                <p>Currency</p>
                <p>:</p>
              </div> */}
            </div>

            <Tabs defaultValue="parts" className={"h-[50vh] "}>
              <TabsList className={"py-5 px-0 bg-white"}>
                <TabsTrigger
                  variant={"fullsize"}
                  value="parts"
                  className={"cursor-pointer rounded-t-2xl"}
                  hidden
                >
                  Parts
                </TabsTrigger>
                <TabsTrigger
                  variant={"fullsize"}
                  value="snr"
                  className={"cursor-pointer  text-blue-500"}
                  hidden
                >
                  SNR
                </TabsTrigger>
              </TabsList>
              <TabsContent value="parts" className={"overflow-y-auto"}>
                <Table className={"max-h-[400px] overflow-y-auto "}>
                  <TableHeader>
                    <TableRow className={"bg-gray-300 hover:bg-gray-300"}>
                      <TableHead className={"font-black text-black"}>
                        Select
                      </TableHead>
                      <TableHead className={"font-black text-black p-2"}>
                        Parts #
                        <span className="flex items-center mt-1">
                          <Input
                            className={"bg-white font-medium"}
                            value={partNumberSearch}
                            onChange={(e) =>
                              setPartNumberSearch(e.target.value)
                            }
                          />
                          {/* <XIcon
                            className="cursor-pointer"
                            onClick={() => setPartNumberSearch("")}
                          /> */}
                        </span>
                      </TableHead>
                      <TableHead
                        className={
                          "whitespace-break-spaces font-black text-black"
                        }
                      >
                        Keyword
                        <span className="flex items-center mt-1">
                          <Input
                            className={
                              "  whitespace-break-spaces bg-white font-medium"
                            }
                            value={keywordSearch}
                            onChange={(e) => setKeywordSearch(e.target.value)}
                          />
                          {/* <XIcon
                            className="cursor-pointer"
                            onClick={() => setKeywordSearch("")}
                          /> */}
                        </span>
                      </TableHead>
                      <TableHead
                        className={
                          "whitespace-break-spaces font-black text-black"
                        }
                      >
                        Part Description
                        <span className="flex items-center mt-1">
                          <Input
                            className={
                              "whitespace-break-spaces bg-white font-medium"
                            }
                            value={descriptionSearch}
                            onChange={(e) =>
                              setDescriptionSearch(e.target.value)
                            }
                          />
                          {/* <XIcon
                            className="cursor-pointer"
                            onClick={() => setDescriptionSearch("")}
                          /> */}
                        </span>
                      </TableHead>
                      {/* <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        Orderability
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black "
                        }
                      >
                        Restriction Reason
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        CRS
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        ROHS
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        Retrunable
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black "
                        }
                      >
                        Hard roll
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black "
                        }
                      >
                        Dangerous Goods
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black "
                        }
                      >
                        Lithium Battery
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        Oversize
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        Heavy
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        Price
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black "
                        }
                      >
                        Friegh Price
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        Tax
                      </TableHead>
                      <TableHead
                        className={
                          "  whitespace-break-spaces font-black text-black"
                        }
                      >
                        Total
                      </TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageData.map((part, index) => {
                      const isChecked = selectedPartCatalog.some(
                        (item) => item.PartNumber === part.PartNumber
                      );

                      const toggleRow = () => {
                        handlerPartCatalog(part, !isChecked);
                      };

                      return (
                        <TableRow
                          key={index}
                          onClick={toggleRow}
                          className={`cursor-pointer ${
                            isChecked ? "bg-blue-100" : ""
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handlerPartCatalog(part, checked)
                              }
                              onClick={(e) => e.stopPropagation()} // prevent double toggle
                            />
                          </TableCell>
                          <TableCell>{part.PartNumber}</TableCell>
                          <TableCell>{part.Keyword}</TableCell>
                          <TableCell>{part.PartDescription}</TableCell>
                          {/* <TableCell>
                            {part.Orderability ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>{part.ResistrictionReason}</TableCell>
                          <TableCell>{part.Csr ? "Y" : "N"}</TableCell>
                          <TableCell>{part.Rohs}</TableCell>
                          <TableCell>
                            {part.Returnable_Flag ? "true" : "false"}
                          </TableCell>
                          <TableCell>{part.Hardrolls}</TableCell>
                          <TableCell>
                            {part.Dangerousgoods ? "true" : "false"}
                          </TableCell>
                          <TableCell>
                            {part.Lithiumbattry ? "true" : "false"}
                          </TableCell>
                          <TableCell>
                            {part.Oversize ? "true" : "false"}
                          </TableCell>
                          <TableCell>{part.Heavy ? "true" : "false"}</TableCell>
                          <TableCell>{part.Price}</TableCell>
                          <TableCell>{part.Freightprice}</TableCell>
                          <TableCell>{part.Tax}</TableCell>
                          <TableCell>{part.Total}</TableCell> */}
                        </TableRow>
                      );
                    })}

                    {/* pagination row */}
                    <TableRow>
                      <TableCell colSpan="100%">
                        <Pagination className="flex justify-start">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                placeholder="First"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(1);
                                }}
                              />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage - 1);
                                }}
                              />
                            </PaginationItem>

                            {paginationPages.map((pages) => (
                              <PaginationItem key={pages}>
                                <PaginationLink
                                  href="#"
                                  isActive={currentPage === pages}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(pages);
                                  }}
                                >
                                  {pages}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage + 1);
                                }}
                              />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationNext
                                placeholder="Last"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(totalPages);
                                }}
                              />
                            </PaginationItem>
                            <div className="flex gap-3 p-1 items-center">
                              Total Page
                              <span className="border-2 p-1 rounded-md shadow-2xl">
                                {totalPages}
                              </span>
                            </div>
                          </PaginationContent>
                        </Pagination>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="snr">
                <p>tes</p>
              </TabsContent>
            </Tabs>

            <DialogFooter className={"p-2"}>
              <Button
                className=""
                onClick={() => setCurrentStep(1)}
              >
                Previous
              </Button>
              <Button
                className=""
                onClick={() => setCurrentStep(3)}
              >
                Next
              </Button>
            </DialogFooter>
          </DialogContent>
        );
  
      case 3:
        return (
          <DialogContent className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-7xl
            max-h-[90vh] overflow-y-auto
            flex flex-col justify-center
            gap-0 p-0 bg-white
            [&>button]:hidden ">
            <DialogHeader>
              <div className="flex items-end justify-end">
                {/* <Button className={'bg-transparent '}><ExternalLink color="black"></ExternalLink></Button> */}
                <DialogClose asChild>
                  <Button type="button" variant="outline" className={'hover:bg-gray-200 active:bg-gray-700 border-none'}>
                  <XIcon/>
                  </Button>
                </DialogClose>
              </div>
              <div className="space-y-2 p-2">
              <DialogTitle className={'text-blue-600 text-2xl'}>Service Catalog</DialogTitle>
              <DialogDescription>SELECT PARTS REQUIRED FOR THE REPAIR.</DialogDescription>
              </div>

            </DialogHeader>
            <div className="flex justify-end gap-4 p-2 my-2">
              <div className="grid grid-cols-2 p-2 bg-gray-300 gap-2">
                <CaseField label="Product Number">
                  <Input
                  value={assetForWorkOrderCreation?.ProductNumber || "-"}    
                  readOnly              
                  />
                </CaseField>
                <CaseField label="Product Name">
                  <Input
                  value={assetForWorkOrderCreation?.product_information?.ProductName || "-"}     
                  readOnly             
                  />
                </CaseField>
                <CaseField label="Serial Number">
                  <Input
                  value={assetForWorkOrderCreation?.SerialNumber || "-"}
                  readOnly             
                  />
                </CaseField>
                <CaseField label="Warranty Status">
                  <Input
                    value={`${assetForWorkOrderCreation?.Warranty_Status ?? ""} - ${assetForWorkOrderCreation?.WarrantyOTCCode?.Description ?? ""}`}
                  />
                </CaseField>
              </div>
            </div>
            <div className="overflow-auto max-h-[30dvh]">
              <Table>
                <TableHeader>
                  <TableRow className={'bg-blue-400'}>
                    <TableHead className={'font-bold text-black'}>Service OfferID</TableHead>
                    <TableHead className={'font-bold text-black'}>Description</TableHead>
                    <TableHead className={'font-bold text-black'}>Unit Price</TableHead>
                    <TableHead className={'font-bold text-black'}>Shipping Fee</TableHead>
                    <TableHead className={'font-bold text-black'}>Qty</TableHead>
                    {/* <TableHead className={'font-bold text-black'}>Tax</TableHead> */}
                    <TableHead className={'font-bold text-black'} colSpan={5}>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      <TableRow>
                        <TableCell>{effectiveWarrantyService?.Service_offerID ?? '-'}</TableCell>
                        <TableCell>{effectiveWarrantyService.Service_description}</TableCell>
                        <TableCell>{effectiveWarrantyService.CTat_RTime}</TableCell>
                        <TableCell>{effectiveWarrantyService.Shipping_Fee}</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>{assetForWorkOrderCreation?.WarrantyOTCCode?.WarrantyCondition === "OutWarranty" ? effectiveWarrantyService.Price : 0}</TableCell>
                      </TableRow>
                    {/* )
                  })} */}
                </TableBody>
                <TableHeader>
                  <TableRow className={'bg-blue-400'}>
                    <TableHead className={'font-bold text-black'}>Select</TableHead>
                    <TableHead className={'font-bold text-black'}>Part #</TableHead>
                    <TableHead className={'font-bold text-black'}>Description</TableHead>
                    <TableHead className={'font-bold text-black'}>Unit Price</TableHead>
                    {/* <TableHead className={'font-bold text-black'}>Shipping Fee</TableHead> */}
                    <TableHead className={'font-bold text-black'}>Qty</TableHead>
                    <TableHead className={'font-bold text-black'}>CT KEY RETURN</TableHead>
                    <TableHead className={'font-bold text-black'}>UEFI CODE</TableHead>
                    {showUEFINumberHeader  && (
                      <TableHead className={'font-bold text-black'}>UEFI Number</TableHead>
                    )}
                    <TableHead  colSpan={2} className={'font-bold text-black'}>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPartCatalog.map((part, index) => {
                    const isChecked = selectedPartCatalog.some((item) => item.PartNumber === part.PartNumber)
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => handlerPartCatalog(part, checked)}
                          />
                        </TableCell>
                        <TableCell>{part.PartNumber}</TableCell>
                        <TableCell>{part.PartDescription}</TableCell>
                        <TableCell>{part.Shipping_Fee}</TableCell>
                        <TableCell>{part.qty} </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Enter Return CT Key"
                            className="bg-white"
                            value={part.RemovedPartNumber || ''}
                            onChange={(e) => handleRemovedPartNumberChange(part.PartNumber, e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={part.UEFICode || ""}
                            onValueChange={(val) => handleUEFICodeChange(part.PartNumber, val)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select code" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DHU">DHU</SelectItem>
                              <SelectItem value="FID">FID</SelectItem>
                              <SelectItem value="MPS">MPS</SelectItem>
                              <SelectItem value="PND">PND</SelectItem>
                              <SelectItem value="PPR">PPR</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                          {part.UEFICode === "FID" ? (
                            <TableCell>
                              <Input
                                placeholder="Enter UEFI No"
                                value={part.UEFI_NO || ""}
                                onChange={(e) =>
                                  handleUEFINoChange(part.PartNumber, e.target.value)
                                }
                                className="w-32"
                              />
                            </TableCell>
                          ): (
                            null
                          )}
                        <TableCell>{assetForWorkOrderCreation?.WarrantyOTCCode?.WarrantyCondition === "OutWarranty" ? part.Total : 0}</TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell colSpan={2}>Sub Total</TableCell>
                    <TableCell>{subTotalConfirmServices}</TableCell>
                  </TableRow>
                  <TableRow className={'bg-blue-400'}>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell>--</TableCell>
                    <TableCell>--</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
            </div>
            
  
            <DialogFooter className={' sm:justify-start p-2 items-center gap-10'}>
              <Button  className="" onClick={() => setCurrentStep(2)}>Previous</Button>
              <Button  className="" onClick={() => setOpen(false)}>Cancel</Button>
              <Button  className="" onClick={() => setModalPart(true)}>Add Part</Button>
              <Button  className="" onClick={createOrder}>Create Order</Button>
              
              <Label htmlFor="incident" className={'font-bold whitespace-nowrap'}>Incident Type</Label>
              
              <Select value={selected} onValueChange={setSelected} defaultValue="DepotRepair">
                <SelectTrigger className="w-fit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="CE Assist-APJ-Computing">CE Assist-APJ-Computing</SelectItem>
                    <SelectItem value="CE Assist-APJ-Printing">CE Assist-APJ-Printing</SelectItem>
                    <SelectItem value="Cust Sat-Issue-APJ-Computing">Cust Sat Issue-APJ-Computing</SelectItem>
                    <SelectItem value="Cust Sat-Issue-APJ-Printing">Cust Sat Issue-APJ-Printing</SelectItem>
                    <SelectItem value="IMACD-APJ-Computing">IMACD-APJ-Computing</SelectItem>
                    <SelectItem value="IMACD-APJ-Printing">IMACD-APJ-Printing</SelectItem>
                    <SelectItem value="Installation Only-APJ-Computing">Installation Only-APJ-Computing</SelectItem>
                    <SelectItem value="Installation Only-APJ-Printing">Installation Only-APJ-Printing</SelectItem>
                    <SelectItem value="PC Problem-APJ-Computing">PC Problem-APJ-Computing</SelectItem>
                    <SelectItem value="Print Problem-APJ-Printing">Print Problem-APJ-Printing</SelectItem>
                    <SelectItem value="Print Quality-APJ-Printing">Print Quality-APJ-Printing</SelectItem>
                    <SelectItem value="Prev Maint-APJ-Computing">Prev Maint-APJ-Computing</SelectItem>
                    <SelectItem value="Prev Maint-APJ-Printing">Prev Maint-APJ-Printing</SelectItem>
                    <SelectItem value="DepotRepair">Depot Repair</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedPartCatalog.length > 0 && (
              <div className={"flex gap-2"}>
                <Label htmlFor="Assign_APO" className={'font-bold whitespace-nowrap'}>SELECT {isOutWarranty ? "CM" : "APO"} : </Label>
                <SearchCommandBlock
                  value={assignApo}
                  onChange={(selectedID) =>{
                    if(!selectedID) {
                      setAssignApo(null);
                      return;
                    }
                    const selectedUser = filteredUserAssign.find(
                      (user) => user.IDUser === selectedID
                    );
                    if (selectedUser) {
                      setAssignApo(selectedUser.IDUser);
                    }
                  }}
                  placeholder="--Select--"
                  options={filteredUserAssign.map((user) =>({
                    label: user.Name,
                    value: user.IDUser,
                  }))}
                  renderLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value}
                  className={'border-2 ring-1 ring-gray-200 bg-slate-100'}
                />
              </div>
              )}
            </DialogFooter>
          </DialogContent>
        );

      default:
        return null;
    }
  }
  
  return (
    <>
    <Dialog open={open} onOpenChange={setOpen} >
      {renderStepContent()}
    <BtnModalsPartAdd 
      open2={modalPart} 
      setOpen2={setModalPart}
      partCatalog={partCatalog}
      selectedPartCatalog={selectedPartCatalog}
      setSelectedPartCatalog={setSelectedPartCatalog}

      onPartAdded={handlePartAdded}
      
    />
    </Dialog>
  </>
  );
}


export function ServiceCatalogPartAdd({ onAddSuccess, onClose, isOpen, setIsOpen  }) {
  const [formData, setFormData] = useState({
    PartNumber: "",
    Keyword: "",
    PartDescription: "",
    Orderability: "",
    RestrictionReason: "",
    Price: "",
    FreightPrice: "",
    Shipping_Fee: "",
    qty_parts: "",
    Tax: "",
    Total: "",
    CSR_Flag: false,
    ROHS_Flag: false,
    Returnable_Flag: false,
    HardRoll_Flag: false,
    DangerousGoods_Flag: false,
    LithiumBattery_Flag: false,
    Oversize_Flag: false,
    Heavy_Flag: false,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "PartNumber", "Keyword", "PartDescription", "Orderability",
      "Price", "qty_parts", "Tax", "Total"
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await ApiCustomer.post("/api/servicecatalog-parts", formData);
      alert("Service Catalog Part added successfully!");
      onAddSuccess && onAddSuccess();
      onClose && onClose();
    } catch (error) {
      console.error("Failed to add part:", error);
      alert("Failed to save service catalog part.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">Add Part</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Service Catalog Part</DialogTitle>
          <DialogDescription>
            Fill in the fields to add a new part. * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          <Label>Part Number<Label className="text-red-600">*</Label></Label>
          <Input id="PartNumber" value={formData.PartNumber} onChange={handleChange} />

          <Label>Keyword<Label className="text-red-600">*</Label></Label>
          <Input id="Keyword" value={formData.Keyword} onChange={handleChange} />

          <Label>Part Description<Label className="text-red-600">*</Label></Label>
          <Input id="PartDescription" value={formData.PartDescription} onChange={handleChange} />

          <Label>Orderability<Label className="text-red-600">*</Label></Label>
          <Input id="Orderability" value={formData.Orderability} onChange={handleChange} />

          <Label>Restriction Reason</Label>
          <Input id="RestrictionReason" value={formData.RestrictionReason} onChange={handleChange} />

          <Label>Price<Label className="text-red-600">*</Label></Label>
          <Input type="number" id="Price" value={formData.Price} onChange={handleChange} />

          <Label>Freight Price</Label>
          <Input type="number" id="FreightPrice" value={formData.FreightPrice} onChange={handleChange} />

          <Label>Shipping Fee</Label>
          <Input type="number" id="Shipping_Fee" value={formData.Shipping_Fee} onChange={handleChange} />

          <Label>Tax<Label className="text-red-600">*</Label></Label>
          <Input type="number" id="Tax" value={formData.Tax} onChange={handleChange} />

          <Label>Total<Label className="text-red-600">*</Label></Label>
          <Input type="number" id="Total" value={formData.Total} onChange={handleChange} />

          <div className="grid grid-cols-2 mt-4 gap-x-4 gap-y-2">
            <div><input type="checkbox" id="CSR_Flag" checked={formData.CSR_Flag} onChange={handleChange} /> <label htmlFor="CSR_Flag">CSR</label></div>
            <div><input type="checkbox" id="ROHS_Flag" checked={formData.ROHS_Flag} onChange={handleChange} /> <label htmlFor="ROHS_Flag">ROHS</label></div>
            <div><input type="checkbox" id="Returnable_Flag" checked={formData.Returnable_Flag} onChange={handleChange} /> <label htmlFor="Returnable_Flag">Returnable</label></div>
            <div><input type="checkbox" id="HardRoll_Flag" checked={formData.HardRoll_Flag} onChange={handleChange} /> <label htmlFor="HardRoll_Flag">Hard Roll</label></div>
            <div><input type="checkbox" id="DangerousGoods_Flag" checked={formData.DangerousGoods_Flag} onChange={handleChange} /> <label htmlFor="DangerousGoods_Flag">Dangerous Goods</label></div>
            <div><input type="checkbox" id="LithiumBattery_Flag" checked={formData.LithiumBattery_Flag} onChange={handleChange} /> <label htmlFor="LithiumBattery_Flag">Lithium Battery</label></div>
            <div><input type="checkbox" id="Oversize_Flag" checked={formData.Oversize_Flag} onChange={handleChange} /> <label htmlFor="Oversize_Flag">Oversize</label></div>
            <div><input type="checkbox" id="Heavy_Flag" checked={formData.Heavy_Flag} onChange={handleChange} /> <label htmlFor="Heavy_Flag">Heavy</label></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceCatalogPartEdit({ PartNumber, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [partData, setPartData] = useState({
    PartNumber: "",
    Keyword: "",
    PartDescription: "",
    Orderability: "",
    RestrictionReason: "",
    Price: "",
    FreightPrice: "",
    Shipping_Fee: "",
    Tax: "",
    Total: "",
    CSR_Flag: false,
    ROHS_Flag: false,
    Returnable_Flag: false,
    HardRoll_Flag: false,
    DangerousGoods_Flag: false,
    LithiumBattery_Flag: false,
    Oversize_Flag: false,
    Heavy_Flag: false,
  });

  const fetchPart = async () => {
    try {
      const response = await ApiCustomer.get(`/api/servicecatalog-parts/${PartNumber}`);
      const data = response.data.data;
      setPartData((prev) => ({
        ...prev,
        ...data,
      }));
    } catch (error) {
      toast.error("Error fetching part data:", error);
    }
  };

  useEffect(() => {
    if (PartNumber && isOpen) {
      fetchPart();
    }
  }, [PartNumber, isOpen]);

  const handleChange = (key, value) => {
    setPartData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    try {
      await ApiCustomer.patch(`/api/servicecatalog-parts/${PartNumber}`, partData);
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      toast.error("Error updating part:", error);
    }
  };

  const flagFields = [
    "CSR_Flag",
    "ROHS_Flag",
    "Returnable_Flag",
    "HardRoll_Flag",
    "DangerousGoods_Flag",
    "LithiumBattery_Flag",
    "Oversize_Flag",
    "Heavy_Flag",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchPart();}}>
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Service Catalog Part</DialogTitle>
          <DialogDescription>
            Update the part details and flags.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {/* Input fields */}
          {Object.entries(partData).map(([key, value]) => {
            if (flagFields.includes(key)) return null; // Skip flags here
            return (
              <Input
                key={key}
                value={value || ""}
                placeholder={key}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            );
          })}

          {/* Checkbox flags */}
          <div className="grid grid-cols-2 gap-2 pt-4">
            {flagFields.map((flag) => (
              <div key={flag} className="flex items-center space-x-2">
                <Checkbox
                  id={flag}
                  checked={!!partData[flag]}
                  onCheckedChange={(checked) => handleChange(flag, checked)}
                />
                <Label htmlFor={flag}>{flag.replace(/_/g, " ")}</Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceCatalogPartDelete({ PartNumber, onUpdate }) {
  const handleDelete = async () => {
    try {
      await ApiCustomer.delete(`/api/servicecatalog-parts/${PartNumber}`);
      if (onUpdate) {
        onUpdate(); 
      }
    } catch (error) {
      toast.error("Error deleting part:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-700">
          <Trash size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Part</DialogTitle>
          <DialogDescription>
            Konfirmasi penghapusan part dari katalog.
          </DialogDescription>
        </DialogHeader>
        <h1>Anda yakin ingin menghapus part ini?</h1>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BtnModalsPartAdd({
  open2,
  setOpen2,
  partCatalog,
  selectedPartCatalog,
  setSelectedPartCatalog,
  onPartAdded,
}) {
  const [tempSelectedParts, setTempSelectedParts] = useState([]);
  const [remotePartCatalog, setRemotePartCatalog] = useState(null);

  /* ==============================
     🔎 Debounced Search
  ============================== */

  const [partNumberInput, setPartNumberInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const fetchPartByNumber = useCallback(async (value) => {
    const partNumber = String(value?.partNumber || "").trim();
    const keyword = String(value?.keyword || "").trim();
    const description = String(value?.description || "").trim();
    if (!partNumber && !keyword && !description) {
      setRemotePartCatalog(null);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (partNumber) params.set("partNumber", partNumber);
      if (keyword) params.set("keyword", keyword);
      if (description) params.set("description", description);
      params.set("limit", "100");
      const res = await ApiCustomer.get(`/api/service-log/parts-catalog?${params.toString()}`);
      setRemotePartCatalog(res.data.data || []);
    } catch (e) {
      toast.error("Failed to search parts");
    }
  }, []);

  const debouncedFetch = useMemo(() => {
    return debounce((value) => {
      fetchPartByNumber(value);
    }, 450);
  }, [fetchPartByNumber]);

  useEffect(() => {
    debouncedFetch({
      partNumber: partNumberInput,
      keyword: keywordInput,
      description: descriptionInput,
    });
    return () => debouncedFetch.cancel();
  }, [partNumberInput, keywordInput, descriptionInput, debouncedFetch]);

  /* ==============================
     📄 Filtering
  ============================== */

  const filteredPartCatalog = useMemo(() => {
    const source = remotePartCatalog ?? partCatalog;
    return source.filter(
      (part) =>
        !selectedPartCatalog.some(
          (selected) => selected.PartNumber === part.PartNumber
        )
    );
  }, [partCatalog, remotePartCatalog, selectedPartCatalog]);

  /* ==============================
     📑 Pagination
  ============================== */

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const totalPages = Math.ceil(filteredPartCatalog.length / PAGE_SIZE);

  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPartCatalog.slice(start, start + PAGE_SIZE);
  }, [filteredPartCatalog, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [partNumberInput, keywordInput, descriptionInput, remotePartCatalog]);

  /* ==============================
     ✅ Selection Handler
  ============================== */

  const handlerPartCatalog = (part, checked) => {
    if (checked) {
      setTempSelectedParts((prev) => [...prev, part]);
    } else {
      setTempSelectedParts((prev) =>
        prev.filter((item) => item.PartNumber !== part.PartNumber)
      );
    }
  };

  /* ==============================
     🚀 Add To Parent
  ============================== */

  const handleAddParts = () => {
    setSelectedPartCatalog((prev) => [
      ...prev,
      ...tempSelectedParts
        .filter((part) => !prev.some((p) => p.PartNumber === part.PartNumber))
        .map((part) => ({
          ...part,
          qty: 1,
          Total: parseFloat(part.Price || 0).toFixed(2),
        })),
    ]);

    setTempSelectedParts([]);
    setOpen2(false);
  };

  return (
    <Dialog open={open2} onOpenChange={setOpen2}>
      <DialogContent className="sm:min-w-[60vw] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-blue-600 text-2xl">
            Add Part
          </DialogTitle>
        </DialogHeader>

        {/* ================= SEARCH ================= */}
        <div className="flex flex-wrap items-center gap-3">
          <DialogDescription>Part Number</DialogDescription>
          <Input
            value={partNumberInput}
            onChange={(e) => setPartNumberInput(e.target.value)}
            className="w-60"
          />
          <DialogDescription>Keyword</DialogDescription>
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="w-60"
          />
          <DialogDescription>Description</DialogDescription>
          <Input
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            className="w-60"
          />
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-y-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Part #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentPageData.map((part) => {
                const isChecked = tempSelectedParts.some(
                  (item) => item.PartNumber === part.PartNumber
                );

                return (
                  <TableRow
                    key={part.PartNumber}
                    className={`cursor-pointer ${
                      isChecked ? "bg-blue-100" : ""
                    }`}
                    onClick={() =>
                      handlerPartCatalog(part, !isChecked)
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handlerPartCatalog(part, checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>{part.PartNumber}</TableCell>
                    <TableCell>{part.PartDescription}</TableCell>
                    <TableCell>{part.Price}</TableCell>
                  </TableRow>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <TableRow>
                  <TableCell colSpan="100%">
                    <Pagination className="flex justify-start">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }}
                          />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === i + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ================= FOOTER ================= */}
        <DialogFooter>
          <Button onClick={handleAddParts}>
            Add Part
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setTempSelectedParts([]);
              setPartNumberInput("");
            }}
          >
            Clear
          </Button>
          <Button variant="outline" onClick={() => setOpen2(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function BtnModalsResourceAccountAdd({
  open,
  setOpen,
  resourceAccounts,
  selectedResourceAccounts,
  setSelectedResourceAccounts
}) {
  const [tempSelectedAccounts, setTempSelectedAccounts] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  const handleSelectAccount = (account, checked) => {
    if (checked) {
      setTempSelectedAccounts((prev) => [...prev, account]);
    } else {
      setTempSelectedAccounts((prev) =>
        prev.filter((item) => item.ResourceAccountId !== account.ResourceAccountId)
      );
    }
  };

  const filteredAccounts = resourceAccounts.filter(account =>
    account.Name.toLowerCase().includes(nameSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:min-w-[50vw] sm:min-h-[fit-content] flex flex-col justify-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-blue-600">Add Resource Account</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DialogDescription className="whitespace-nowrap">Name</DialogDescription>
            <Input
              className="ring-1 min-w-[10em] ring-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <Button variant="search" onClick={() => setNameSearch(nameInput)}>
              Search
            </Button>
          </span>
        </div>

        <div className="max-w-full mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Resource Account ID</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts
                .filter(account => !selectedResourceAccounts.some(sel => sel.ResourceAccountId === account.ResourceAccountId))
                .map((account, index) => {
                  const isChecked = tempSelectedAccounts.some(item => item.ResourceAccountId === account.ResourceAccountId);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => handleSelectAccount(account, checked)}
                        />
                      </TableCell>
                      <TableCell>{account.ResourceAccountId}</TableCell>
                      <TableCell>{account.Name}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-4 sm:justify-start">
          <Button
            variant="search"
            onClick={() => {
              setSelectedResourceAccounts((prev) => [
                ...prev,
                ...tempSelectedAccounts.filter(
                  (acc) => !prev.some((a) => a.ResourceAccountId === acc.ResourceAccountId)
                ),
              ]);
              setTempSelectedAccounts([]);
              Swal.fire({
                title: "Success!",
                text: "Resource Account(s) added successfully!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              }).then(() => {
                setOpen(false);
              });
            }}
          >
            Add Account
          </Button>
          <Button
            variant="search"
            onClick={() => {
              setTempSelectedAccounts([]);
              setNameInput("");
              setNameSearch("");
            }}
          >
            Clear
          </Button>
          <Button variant="search" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResourceAccountAdd() {
  const [formData, setFormData] = useState({
    ResourceAccountId: '',
    Name: '',
    ResourceId: '',
  });

  const [resources, setResources] = useState([]);

  useEffect(() => {
    // Fetch list of Resources untuk opsi select
    const fetchResources = async () => {
      try {
        const response = await ApiCustomer.get("/api/resources"); 
        setResources(response.data.data || []);
      } catch (error) {
        toast.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.ResourceAccountId || !formData.Name) {
      Swal.fire({
        title: "Incomplete Data",
        text: "ResourceAccountId and Name are required.",
        icon: "warning",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const response = await ApiCustomer.post("/api/resource-account", formData);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'ResourceAccount berhasil disimpan.',
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan ResourceAccount. Silakan coba lagi.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">Add Resource Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add ResourceAccount</DialogTitle>
          <DialogDescription>Fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>ResourceAccountId <Label className="text-red-600">*</Label></Label>
          <Input id="ResourceAccountId" value={formData.ResourceAccountId} onChange={handleInputChange} />

          <Label>Name <Label className="text-red-600">*</Label></Label>
          <Input id="Name" value={formData.Name} onChange={handleInputChange} />

          <Label>Resource (optional)</Label>
          <select
            id="ResourceId"
            value={formData.ResourceId || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Select Resource --</option>
            {resources.map((resource) => (
              <option key={resource.ResourceId} value={resource.ResourceId}>
                {resource.Name || resource.ResourceId}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResourceAccountEdit({ ResourceAccountId, onUpdate, resources }) {
  const [resourceAccount, setResourceAccount] = useState(null);
  const [name, setName] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchResourceAccount = async () => {
    if (!ResourceAccountId) return;
    try {
      const response = await ApiCustomer.get(`/api/resource-account/${ResourceAccountId}`);
      const data = response.data.data;
      setResourceAccount(data);
      setName(data?.Name || "");
      setResourceId(data?.ResourceId || "");
    } catch (error) {
      console.error("Error fetching ResourceAccount:", error);
    }
  };

  useEffect(() => {
    if (ResourceAccountId && isOpen) {
      fetchResourceAccount();
    }
  }, [ResourceAccountId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setResourceId("");
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!name) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Name is required.",
        icon: "warning",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/resource-account/${ResourceAccountId}`, {
        Name: name,
        ResourceId: resourceId || null,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "ResourceAccount has been updated.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        onUpdate(); 
        setIsOpen(false);
      })

    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: "Could not update ResourceAccount. Please try again.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchResourceAccount(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit ResourceAccount</DialogTitle>
          <DialogDescription>
            Update the details of the ResourceAccount. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Name <Label className="text-red-600">*</Label></Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name*"
          />
          <Label>Resource <Label className="text-red-600">*</Label></Label>
          <select
            value={resourceId || ""}
            onChange={(e) => setResourceId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Select Resource (optional) --</option>
            {resources.map((res) => (
              <option key={res.ResourceId} value={res.ResourceId}>
                {res.Name || res.ResourceId}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResourceAccountDelete({ ResourceAccountId, onUpdate }) {
 const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Resource ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await ApiCustomer.delete(`/api/resource-account/${ResourceAccountId}`);

      if (response.status === 409 || response.data.success === false) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal menghapus!',
          text: response.data.message || 'ResourceAccount tidak bisa dihapus karena ada relasi.',
        });
        return;
      }

      await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'ResourceAccount berhasil dihapus.',
          timer: 1100,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        if (onUpdate) onUpdate();
    } catch (error) {
      if (error.response?.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'Tidak bisa menghapus!',
          text: 'ResourceAccount ini memiliki relasi yang masih aktif di tabel lain. Harap hapus data terkait terlebih dahulu.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus ResourceAccount. Silakan coba lagi.',
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="text-red-500 hover:text-red-700"
      onClick={handleDelete}
    >
      <Trash />
    </Button>
  );
}

export function SubkTechnicianAdd() {
  const [formData, setFormData] = useState({
    SubkTechnicianId: '',
    Name: '',
    ResourceAccountId: '',
  });

  const [resourceAccounts, setResourceAccounts] = useState([])
  const fetchResourceAccounts = async () => {
    try {
      const res = await ApiCustomer.get("/api/resource-account?limit=1000"); 
      setResourceAccounts(res.data.data); 
    } catch (error) {
      toast.error("Failed to fetch resource accounts:", error);
    }
  };
  useEffect(() => {
    fetchResourceAccounts();
  }, []);


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.SubkTechnicianId || !formData.Name) {
      Swal.fire({
        title: "Incomplete Data",
        text: "SubkTechnicianId and Name are required.",
        icon: "warning",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const response = await ApiCustomer.post("/api/subk-technician", {
        SubkTechnicianId: formData.SubkTechnicianId,
        Name: formData.Name,
        ResourceAccountId: formData.ResourceAccountId || null,
      });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'SubkTechnician berhasil disimpan.',
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan SubkTechnician. Silakan coba lagi.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">Add Subk Technician</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add SubkTechnician</DialogTitle>
          <DialogDescription>Fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>SubkTechnicianId</Label>
          <Input id="SubkTechnicianId" value={formData.SubkTechnicianId} onChange={handleInputChange} />

          <Label>Name *</Label>
          <Input id="Name" value={formData.Name} onChange={handleInputChange} />

          <Label htmlFor="ResourceAccountId">Resource Account (optional)</Label>
          <select
            id="ResourceAccountId"
            value={formData.ResourceAccountId}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Select Resource Account --</option>
            {resourceAccounts.map((ra) => (
              <option key={ra.ResourceAccountId} value={ra.ResourceAccountId}>
                {ra.Name} ({ra.ResourceAccountId})
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubkTechnicianEdit({ SubkTechnicianId, onUpdate }) {
  const [subkTechnician, setSubkTechnician] = useState(null);
  const [name, setName] = useState("");
  const [resourceAccountId, setResourceAccountId] = useState("");
  const [resourceAccounts, setResourceAccounts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchSubkTechnician = async () => {
    if (!SubkTechnicianId) return;
    try {
      const response = await ApiCustomer.get(`/api/subk-technician/${SubkTechnicianId}`);
      const data = response.data.data;
      setSubkTechnician(data);
      setName(data?.Name || "");
      setResourceAccountId(data?.ResourceAccountId || "");
    } catch (error) {
      toast.error("Error fetching SubkTechnician:", error);
    }
  };

  
  const fetchResourceAccounts = async () => {
    try {
      const res = await ApiCustomer.get("/api/resource-account?limit=1000");
      setResourceAccounts(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch resource accounts:", error);
    }
  };


  useEffect(() => {
    if (SubkTechnicianId && isOpen) {
      Swal.fire({
        title: "Auto close alert!",
        html: "I will close in milliseconds.",
        didOpen: () => {
          Swal.showLoading();
        }
      })
      fetchSubkTechnician();
      fetchResourceAccounts();
      Swal.close();
    }
  }, [SubkTechnicianId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setResourceAccountId("");
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!name) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Name is required.",
        icon: "warning",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/subk-technician/${SubkTechnicianId}`, {
        Name: name,
        ResourceAccountId: resourceAccountId || null,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "SubkTechnician has been updated.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      onUpdate(); 
      setIsOpen(false);
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: "Could not update SubkTechnician. Please try again.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchSubkTechnician(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit SubkTechnician</DialogTitle>
          <DialogDescription>
            Update the details of the SubkTechnician. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
        <Label>Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name*"
          />
           <Label htmlFor="ResourceAccountId">Resource Account (optional)</Label>
          <select
            id="ResourceAccountId"
            value={resourceAccountId}
            onChange={(e) => setResourceAccountId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Select Resource Account --</option>
            {resourceAccounts.map((ra) => (
              <option key={ra.ResourceAccountId} value={ra.ResourceAccountId}>
                {ra.Name} ({ra.ResourceAccountId})
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubkTechnicianDelete({ SubkTechnicianId, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "SubkTechnician ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/subk-technician/${SubkTechnicianId}`);

        if (response.status === 409 || response.data.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "SubkTechnician ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'SubkTechnician berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          if (onUpdate) {
            onUpdate();
          } else {
            window.location.reload();
          }
        });
      } catch (error) {
        if (error.response?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "SubkTechnician ini tidak bisa dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus SubkTechnician. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function SymptomCodeAdd({ onUpdate }) {
  const [formData, setFormData] = useState({
    SymptomCode: '',
    TopCategory: '',
    SubCategory: '',
    QualityCodes: '',
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.SymptomCode || !formData.TopCategory || !formData.SubCategory) {
      Swal.fire({
        title: "Incomplete Data",
        text: "SymptomCode, TopCategory, and SubCategory are required.",
        icon: "warning",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const response = await ApiCustomer.post("/api/symptom-codes", formData);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Symptom Code berhasil disimpan.',
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        onUpdate?.();
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data. Silakan coba lagi.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">Add Symptom Code</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Symptom Code</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>SymptomCode <span className="text-red-500">*</span></Label>
          <Input id="SymptomCode" value={formData.SymptomCode} onChange={handleInputChange} />

          <Label>TopCategory <span className="text-red-500">*</span></Label>
          <Input id="TopCategory" value={formData.TopCategory} onChange={handleInputChange} />

          <Label>SubCategory <span className="text-red-500">*</span></Label>
          <Input id="SubCategory" value={formData.SubCategory} onChange={handleInputChange} />

          <Label>QualityCodes</Label>
          <Input id="QualityCodes" value={formData.QualityCodes} onChange={handleInputChange} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SymptomCodeEdit({ SymptomCodeID, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [symptomData, setSymptomData] = useState({
    SymptomCode: "",
    TopCategory: "",
    SubCategory: "",
    QualityCodes: "",
  });

  const fetchSymptomData = async () => {
    try {
      const response = await ApiCustomer.get(`/api/symptom-codes/${SymptomCodeID}`);
      const data = response.data.data;
      setSymptomData({
        SymptomCode: data?.SymptomCode || "",
        TopCategory: data?.TopCategory || "",
        SubCategory: data?.SubCategory || "",
        QualityCodes: data?.QualityCodes || "",
      });
    } catch (error) {
      toast.error("Error fetching Symptom Code:", error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSymptomData();
  }, [isOpen]);

  const handleUpdate = async () => {
    const { SymptomCode, TopCategory, SubCategory } = symptomData;
    if (!SymptomCode || !TopCategory || !SubCategory) {
      Swal.fire({
        title: "Incomplete Data",
        text: "SymptomCode, TopCategory, and SubCategory are required.",
        icon: "warning",
        timer: 1200,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/symptom-codes/${SymptomCodeID}`, symptomData);
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Symptom Code has been updated.",
        timer: 1200,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then( () => {
        setIsOpen(false);
        onUpdate?.();
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update Symptom Code.",
        timer: 1200,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSymptomData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Symptom Code</DialogTitle>
          <DialogDescription>Update the details of the symptom code. Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Symptom Code <span className="text-red-500">*</span></Label>
          <Input id="SymptomCode" value={symptomData.SymptomCode} onChange={handleChange} placeholder="SymptomCode *" />
          <Label>Top Category <span className="text-red-500">*</span></Label>
          <Input id="TopCategory" value={symptomData.TopCategory} onChange={handleChange} placeholder="TopCategory *" />
          <Label>Sub Category <span className="text-red-500">*</span></Label>
          <Input id="SubCategory" value={symptomData.SubCategory} onChange={handleChange} placeholder="SubCategory *" />
          <Label>Quality Codes</Label>
          <Input id="QualityCodes" value={symptomData.QualityCodes} onChange={handleChange} placeholder="QualityCodes" />
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SymptomCodeDelete({ SymptomCodeID, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Symptom Code ini akan dihapus dan tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/symptom-codes/${SymptomCodeID}`);

        if (response.status === 409 || response.data.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Symptom Code ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Symptom Code berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          if (onUpdate) {
            onUpdate();
          }
          setIsModalOpen(false);
        });
      } catch (error) {
        if (error.response?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Symptom Code ini memiliki relasi dan tidak bisa dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Symptom Code. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function BookingsAdd({ onUpdate }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    WOID: null,
    BookingStatus: null,
    ScheduleJeopardy: false,
    ScheduleJeopardyTime: "",
    DoNotDisturb: false,
    CeScheduleChange: false,
    TotalBillableDurationInMinutes: "",
    TotalInProgressDurationInMinutes: "",
    TotalBreakDurationInMinutes: "",
    CreatedBy: user?.id || "", // ✅ otomatis ambil dari auth user
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await ApiCustomer.get("/api/user");
        setUsers(res.data.data || []);
      } catch (error) {
        toast.error("Failed to load users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.WOID || !formData.CreatedBy) {
      Swal.fire({
        title: "Incomplete Data",
        text: "WOID and CreatedBy are required.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    const dataToSend = {
      WOID: formData.WOID?.WOID || null,
      BookingStatusId: formData.BookingStatus?.BookingStatusId || null,
      ScheduleJeopardy: formData.ScheduleJeopardy,
      ScheduleJeopardyTime: formData.ScheduleJeopardyTime ? new Date(formData.ScheduleJeopardyTime) : null,
      DoNotDisturb: formData.DoNotDisturb,
      CeScheduleChange: formData.CeScheduleChange,
      TotalBillableDurationInMinutes: formData.TotalBillableDurationInMinutes ? parseInt(formData.TotalBillableDurationInMinutes) : null,
      TotalInProgressDurationInMinutes: formData.TotalInProgressDurationInMinutes ? parseInt(formData.TotalInProgressDurationInMinutes) : null,
      TotalBreakDurationInMinutes: formData.TotalBreakDurationInMinutes ? parseInt(formData.TotalBreakDurationInMinutes) : null,
      CreatedBy: parseInt(formData.CreatedBy), // ✅ tetap kirim ID user
    };

    try {
      await ApiCustomer.post("/api/booking", dataToSend);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Booking berhasil disimpan.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        setOpen(false);
        onUpdate?.();
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data. Silakan coba lagi.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">Add Booking</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Booking</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="mb-6" relative>
            {/* ✅ WOID pakai GenericSelector */}
            <GenericSelector
              value={formData.WOID}
              onChange={(wo) => handleChange("WOID", wo)}
              endpoint="/api/work-order"
              labelKey="WOID"
              valueKey="WOID"
              placeholder="Search WOID..."
              label={<><span>WOID</span> <span className="text-red-500">*</span></>}
              className="z-50"
            />
          </div>

          {/* ✅ Booking Status pakai GenericSelector */}
          <GenericSelector
            value={formData.BookingStatus}
            onChange={(bs) => handleChange("BookingStatus", bs)}
            endpoint="/api/booking-status"
            labelKey="Description"
            valueKey="BookingStatusId"
            placeholder="Search booking status..."
            label="Booking Status"
          />

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="ScheduleJeopardy" checked={formData.ScheduleJeopardy} onChange={handleInputChange} />
            <Label htmlFor="ScheduleJeopardy">Schedule Jeopardy</Label>
          </div>

          <Label>Schedule Jeopardy Time</Label>
          <Input id="ScheduleJeopardyTime" type="datetime-local" value={formData.ScheduleJeopardyTime} onChange={handleInputChange} />

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="DoNotDisturb" checked={formData.DoNotDisturb} onChange={handleInputChange} />
            <Label htmlFor="DoNotDisturb">Do Not Disturb</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="CeScheduleChange" checked={formData.CeScheduleChange} onChange={handleInputChange} />
            <Label htmlFor="CeScheduleChange">CE Schedule Change</Label>
          </div>

          <Label>Total Billable Duration (minutes)</Label>
          <Input id="TotalBillableDurationInMinutes" type="number" value={formData.TotalBillableDurationInMinutes} onChange={handleInputChange} />

          <Label>Total In Progress Duration (minutes)</Label>
          <Input id="TotalInProgressDurationInMinutes" type="number" value={formData.TotalInProgressDurationInMinutes} onChange={handleInputChange} />

          <Label>Total Break Duration (minutes)</Label>
          <Input id="TotalBreakDurationInMinutes" type="number" value={formData.TotalBreakDurationInMinutes} onChange={handleInputChange} />

          {/* ✅ Created By (read-only, tampil nama user) */}
          <Label>Created By <span className="text-red-500">*</span></Label>
          <Input
            id="CreatedBy"
            type="text"
            value={user?.name || `User ${user?.id}`} // tampilkan nama user
            readOnly
            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingsEdit({ BookingId, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [bookingData, setBookingData] = useState({
    WOID: null,
    BookingStatus: null,
    ScheduleJeopardy: false,
    ScheduleJeopardyTime: "",
    DoNotDisturb: false,
    CeScheduleChange: false,
    TotalBillableDurationInMinutes: "",
    TotalInProgressDurationInMinutes: "",
    TotalBreakDurationInMinutes: "",
    CreatedBy: "",
  });

  // 🔹 Ambil daftar user untuk dropdown "CreatedBy"
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await ApiCustomer.get("/api/user");
        setUsers(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load users:", err);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 Ambil data booking berdasarkan ID
  const fetchBookingData = async () => {
    try {
      const res = await ApiCustomer.get(`/api/booking/${BookingId}`);
      const data = res.data.data;

      setBookingData({
        WOID: data.workorder
            ? { WOID: data.workorder.WOID, label: data.workorder.WOID }
            : null,
          BookingStatus: data.BookingStatus
            ? {
                BookingStatusId: data.BookingStatus.BookingStatusId,
                Description: data.BookingStatus.Description,
              }
            : null,
        ScheduleJeopardy: data.ScheduleJeopardy || false,
        ScheduleJeopardyTime: data.ScheduleJeopardyTime
          ? data.ScheduleJeopardyTime.slice(0, 16) // format untuk input datetime-local
          : "",
        DoNotDisturb: data.DoNotDisturb || false,
        CeScheduleChange: data.CeScheduleChange || false,
        TotalBillableDurationInMinutes: data.TotalBillableDurationInMinutes || "",
        TotalInProgressDurationInMinutes: data.TotalInProgressDurationInMinutes || "",
        TotalBreakDurationInMinutes: data.TotalBreakDurationInMinutes || "",
        CreatedBy: data.CreatedBy?.toString() || "", // supaya dropdown CreatedBy ke-select
      });
    } catch (error) {
      toast.error("Error fetching booking:", error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchBookingData();
  }, [isOpen]);

  // 🔹 Handler input
  const handleChange = (key, value) => {
    setBookingData((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Update Booking
  const handleUpdate = async () => {
    const dataToSend = {
      WOID: bookingData.WOID?.WOID || null,
      BookingStatusId: bookingData.BookingStatus?.BookingStatusId || null,
      ScheduleJeopardy: bookingData.ScheduleJeopardy,
      ScheduleJeopardyTime: bookingData.ScheduleJeopardyTime
        ? new Date(bookingData.ScheduleJeopardyTime)
        : null,
      DoNotDisturb: bookingData.DoNotDisturb,
      CeScheduleChange: bookingData.CeScheduleChange,
      TotalBillableDurationInMinutes: bookingData.TotalBillableDurationInMinutes
        ? parseInt(bookingData.TotalBillableDurationInMinutes)
        : null,
      TotalInProgressDurationInMinutes: bookingData.TotalInProgressDurationInMinutes
        ? parseInt(bookingData.TotalInProgressDurationInMinutes)
        : null,
      TotalBreakDurationInMinutes: bookingData.TotalBreakDurationInMinutes
        ? parseInt(bookingData.TotalBreakDurationInMinutes)
        : null,
      CreatedBy: parseInt(bookingData.CreatedBy),
    };

    try {
      await ApiCustomer.patch(`/api/booking/${BookingId}`, dataToSend);
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Booking has been updated.",
        timer: 1200,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setIsOpen(false);
      onUpdate?.();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update Booking.",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>Update booking details below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* ✅ WOID pakai GenericSelector */}
          <GenericSelector
            value={
              bookingData.WOID
                ? { WOID: bookingData.WOID.WOID, label: bookingData.WOID.WOID }
                : null
            }
            onChange={(wo) => handleChange("WOID", wo)}
            endpoint="/api/work-order"
            labelKey="WOID"
            valueKey="WOID"
            placeholder="Search WOID..."
            label={<><span>WOID</span> <span className="text-red-500">*</span></>}
          />

          <GenericSelector
            value={
              bookingData.BookingStatus
                ? {
                    BookingStatusId: bookingData.BookingStatus.BookingStatusId,
                    Description: bookingData.BookingStatus.Description,
                  }
                : null
            }
            onChange={(bs) => handleChange("BookingStatus", bs)}
            endpoint="/api/booking-status"
            labelKey="Description"
            valueKey="BookingStatusId"
            placeholder="Search booking status..."
            label="Booking Status"
          />
          

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ScheduleJeopardy"
              checked={bookingData.ScheduleJeopardy}
              onChange={handleInputChange}
            />
            <Label htmlFor="ScheduleJeopardy">Schedule Jeopardy</Label>
          </div>

          <Label>Schedule Jeopardy Time</Label>
          <Input
            id="ScheduleJeopardyTime"
            type="datetime-local"
            value={bookingData.ScheduleJeopardyTime}
            onChange={handleInputChange}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="DoNotDisturb"
              checked={bookingData.DoNotDisturb}
              onChange={handleInputChange}
            />
            <Label htmlFor="DoNotDisturb">Do Not Disturb</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="CeScheduleChange"
              checked={bookingData.CeScheduleChange}
              onChange={handleInputChange}
            />
            <Label htmlFor="CeScheduleChange">CE Schedule Change</Label>
          </div>

          <Label>Total Billable Duration (minutes)</Label>
          <Input
            id="TotalBillableDurationInMinutes"
            type="number"
            value={bookingData.TotalBillableDurationInMinutes}
            onChange={handleInputChange}
          />

          <Label>Total In Progress Duration (minutes)</Label>
          <Input
            id="TotalInProgressDurationInMinutes"
            type="number"
            value={bookingData.TotalInProgressDurationInMinutes}
            onChange={handleInputChange}
          />

          <Label>Total Break Duration (minutes)</Label>
          <Input
            id="TotalBreakDurationInMinutes"
            type="number"
            value={bookingData.TotalBreakDurationInMinutes}
            onChange={handleInputChange}
          />

          {/* Created By */}
          <Label>Created By <span className="text-red-500">*</span></Label>
          <Input
            id="CreatedBy"
            type="text"
            value={
              // tampilkan nama user dari daftar users
              users.find((u) => u.IDUser.toString() === bookingData.CreatedBy)?.Name || 
              `User ${bookingData.CreatedBy}`
            }
            readOnly
            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingsDelete({ BookingId, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Booking ini akan dihapus dan tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/booking/${BookingId}`);

        if (response.status === 409 || response.data.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Booking ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Booking berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          if (onUpdate) {
            onUpdate(); 
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Booking ini tidak bisa dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Booking. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function BookingDetailsAdd({ onUpdate }) {
  const [formData, setFormData] = useState({
    BookingId: "",
    ResourceId: "",
    ResourceAccountId: "",
    EngineerId: "",
    BookingStatusId: "",
    StartTimeCustomerTime: "",
    EndTimeCustomerTime: "",
    EstimatedArrivalTimeCustomerTime: "",
    ActualArrivalTimeCustomerTime: "",
    StartTimeUserTime: "",
    EndTimeUserTime: "",
    DurationInMinutesUserTime: "",
    EstimatedArrivalTimeUserTime: "",
    ActualArrivalTimeUserTime: "",
    ChangedBy: "",
  });

  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [bookingRes, resourceRes, accountRes, engineerRes, statusRes] = await Promise.all([
          ApiCustomer.get("/api/booking"),
          ApiCustomer.get("/api/resources"),
          ApiCustomer.get("/api/resource-account"),
          ApiCustomer.get("/api/user?role=ce"),
          ApiCustomer.get("/api/booking-status")
        ]);

        setBookings(bookingRes.data.data || []);
        setResources(resourceRes.data.data || []);
        setAccounts(accountRes.data.data || []);
        setEngineers(engineerRes.data.data || []);
        setStatuses(statusRes.data.data || []);
      } catch (error) {
        toast.error("Dropdown fetch failed:", error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const toFullISOString = (value) => {
    if (!value) return null;
    // Tambah ":00" jika hanya sampai menit
    return value.length === 16 ? value + ":00" : value;
  };
  
  const handleSubmit = async () => {
    const userSubmit = getUserFromToken();
    try {
      const payload = {
        ...formData,
        BookingId: parseInt(formData.BookingId),
        ResourceId: formData.ResourceId || null,
        ResourceAccountId: formData.ResourceAccountId || null,
        EngineerId: formData.EngineerId ? parseInt(formData.EngineerId) : null,
        BookingStatusId: formData.BookingStatusId ? parseInt(formData.BookingStatusId) : null,
        DurationInMinutesUserTime: formData.DurationInMinutesUserTime ? parseInt(formData.DurationInMinutesUserTime) : null,
        ChangedBy: userSubmit.id,
        StartTimeCustomerTime: toFullISOString(formData.StartTimeCustomerTime),
        EndTimeCustomerTime: toFullISOString(formData.EndTimeCustomerTime),
        EstimatedArrivalTimeCustomerTime: toFullISOString(formData.EstimatedArrivalTimeCustomerTime),
        ActualArrivalTimeCustomerTime: toFullISOString(formData.ActualArrivalTimeCustomerTime),
        StartTimeUserTime: toFullISOString(formData.StartTimeUserTime),
        EndTimeUserTime: toFullISOString(formData.EndTimeUserTime),
        EstimatedArrivalTimeUserTime: toFullISOString(formData.EstimatedArrivalTimeUserTime),
        ActualArrivalTimeUserTime: toFullISOString(formData.ActualArrivalTimeUserTime),
      };
  
      await ApiCustomer.post("/api/bookingDetails", payload);
      Swal.fire({
         icon: "success", 
         title: "Success", 
         text: "Booking detail saved", 
         timer: 1200, 
         showConfirmButton: false });
       onUpdate?.();
    } catch (error) {
      Swal.fire({ 
        icon: "error", 
        title: "Failed", 
        text: "Failed to save data", 
        timer: 1500, 
        showConfirmButton: false });
    }
  };
  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4 rounded-sm h-11">Add Booking Detail</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Booking Detail</DialogTitle>
          <DialogDescription>Lengkapi data berikut sesuai kebutuhan.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Booking Info */}
                   <div>
            <GenericSelector
              label={<><span>Booking</span> <span className="text-red-500">*</span></>}
              placeholder="Search Booking..."
              endpoint="/api/booking"
              value={bookings.find((b) => b.BookingId === formData.BookingId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, BookingId: item.BookingId }))}
              valueKey="BookingId"
              labelKey="BookingId"
            />
          </div>

          <div>
            <GenericSelector
              label={<><span>Resource</span> <span className="text-red-500">*</span></>}
              placeholder="Search Resource..."
              endpoint="/api/resources"
              value={resources.find((r) => r.ResourceId === formData.ResourceId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, ResourceId: item.ResourceId }))}
              valueKey="ResourceId"
              labelKey="Name"
            />
          </div>

          <div>
            <GenericSelector
              label={<><span>Resource Account</span> <span className="text-red-500">*</span></>}
              placeholder="Search Account..."
              endpoint="/api/resource-account"
              value={accounts.find((a) => a.ResourceAccountId === formData.ResourceAccountId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, ResourceAccountId: item.ResourceAccountId }))}
              valueKey="ResourceAccountId"
              labelKey="Name"
            />
          </div>

          <div>
            <GenericSelector
              label={<><span>Engineer</span> <span className="text-red-500">*</span></>}
              placeholder="Search Engineer..."
              endpoint="/api/user?role=ce"
              value={engineers.find((e) => e.IDUser === formData.EngineerId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, EngineerId: item.IDUser }))}
              valueKey="IDUser"
              labelKey="Name"
            />
          </div>

          <div>
            <GenericSelector
              label={<><span>Status</span> <span className="text-red-500">*</span></>}
              placeholder="Search Status..."
              endpoint="/api/booking-status"
              value={statuses.find((s) => s.BookingStatusId === formData.BookingStatusId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, BookingStatusId: item.BookingStatusId }))}
              valueKey="BookingStatusId"
              labelKey="Description"
            />
          </div>

          {/* Customer Time */}
          <div className="pt-2 border-t md:col-span-2">
            <p className="mb-1 font-semibold">Customer Time</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div><Label>Start Time</Label><Input type="datetime-local" id="StartTimeCustomerTime" value={formData.StartTimeCustomerTime} onChange={handleInputChange} /></div>
              <div><Label>End Time</Label><Input type="datetime-local" id="EndTimeCustomerTime" value={formData.EndTimeCustomerTime} onChange={handleInputChange} /></div>
              <div><Label>Estimated Arrival</Label><Input type="datetime-local" id="EstimatedArrivalTimeCustomerTime" value={formData.EstimatedArrivalTimeCustomerTime} onChange={handleInputChange} /></div>
              <div><Label>Actual Arrival</Label><Input type="datetime-local" id="ActualArrivalTimeCustomerTime" value={formData.ActualArrivalTimeCustomerTime} onChange={handleInputChange} /></div>
            </div>
          </div>

          {/* User Time */}
          <div className="pt-2 border-t md:col-span-2">
            <p className="mb-1 font-semibold">User Time</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div><Label>Start Time</Label><Input type="datetime-local" id="StartTimeUserTime" value={formData.StartTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>End Time</Label><Input type="datetime-local" id="EndTimeUserTime" value={formData.EndTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>Estimated Arrival</Label><Input type="datetime-local" id="EstimatedArrivalTimeUserTime" value={formData.EstimatedArrivalTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>Actual Arrival</Label><Input type="datetime-local" id="ActualArrivalTimeUserTime" value={formData.ActualArrivalTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>Duration (minutes)</Label><Input type="number" id="DurationInMinutesUserTime" value={formData.DurationInMinutesUserTime} onChange={handleInputChange} /></div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function BookingDetailsEdit({ BookingDetailId, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    BookingId: "",
    ResourceId: "",
    ResourceAccountId: "",
    EngineerId: "",
    BookingStatusId: "",
    StartTimeCustomerTime: "",
    EndTimeCustomerTime: "",
    EstimatedArrivalTimeCustomerTime: "",
    ActualArrivalTimeCustomerTime: "",
    StartTimeUserTime: "",
    EndTimeUserTime: "",
    DurationInMinutesUserTime: "",
    EstimatedArrivalTimeUserTime: "",
    ActualArrivalTimeUserTime: "",
    ChangedBy: "",
  });

  // Dropdown Data
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [bookingRes, resourceRes, accountRes, engineerRes, statusRes] = await Promise.all([
          ApiCustomer.get("/api/booking"),
          ApiCustomer.get("/api/resources"),
          ApiCustomer.get("/api/resource-account"),
          ApiCustomer.get("/api/user?role=ce"),
          ApiCustomer.get("/api/booking-status"),
        ]);

        setBookings(bookingRes.data.data || []);
        setResources(resourceRes.data.data || []);
        setAccounts(accountRes.data.data || []);
        setEngineers(engineerRes.data.data || []);
        setStatuses(statusRes.data.data || []);
      } catch (error) {
        toast.error("Dropdown fetch failed:", error);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch booking detail by ID
  const fetchDetail = async () => {
    try {
      const res = await ApiCustomer.get(`/api/bookingDetails/${BookingDetailId}`);
      const data = res.data.data;

      setFormData({
        BookingId: data.BookingId || "",
        ResourceId: data.ResourceId || "",
        ResourceAccountId: data.ResourceAccountId || "",
        EngineerId: data.EngineerId || "",
        BookingStatusId: data.BookingStatusId || "",
        StartTimeCustomerTime: data.StartTimeCustomerTime?.slice(0, 16) || "",
        EndTimeCustomerTime: data.EndTimeCustomerTime?.slice(0, 16) || "",
        EstimatedArrivalTimeCustomerTime: data.EstimatedArrivalTimeCustomerTime?.slice(0, 16) || "",
        ActualArrivalTimeCustomerTime: data.ActualArrivalTimeCustomerTime?.slice(0, 16) || "",
        StartTimeUserTime: data.StartTimeUserTime?.slice(0, 16) || "",
        EndTimeUserTime: data.EndTimeUserTime?.slice(0, 16) || "",
        EstimatedArrivalTimeUserTime: data.EstimatedArrivalTimeUserTime?.slice(0, 16) || "",
        ActualArrivalTimeUserTime: data.ActualArrivalTimeUserTime?.slice(0, 16) || "",
        DurationInMinutesUserTime: data.DurationInMinutesUserTime || "",
        ChangedBy: data.ChangedBy || "",
      });
    } catch (error) {
      toast.error("Error fetching booking detail:", error);
    }
  };

  useEffect(() => {
    if (isOpen && BookingDetailId) fetchDetail();
  }, [isOpen, BookingDetailId]);

  // Convert local datetime to full ISO
  const toFullISOString = (value) => {
    if (!value) return null;
    return value.length === 16 ? value + ":00" : value;
  };

  // Submit edited data
  const handleSubmit = async () => {
    const userSubmit = getUserFromToken();

    try {
      const payload = {
        BookingId: parseInt(formData.BookingId),
        ResourceId: formData.ResourceId || null,
        ResourceAccountId: formData.ResourceAccountId || null,
        EngineerId: formData.EngineerId ? parseInt(formData.EngineerId) : null,
        BookingStatusId: formData.BookingStatusId ? parseInt(formData.BookingStatusId) : null,
        DurationInMinutesUserTime: formData.DurationInMinutesUserTime ? parseInt(formData.DurationInMinutesUserTime) : null,
        ChangedBy: userSubmit.id,
        StartTimeCustomerTime: toFullISOString(formData.StartTimeCustomerTime),
        EndTimeCustomerTime: toFullISOString(formData.EndTimeCustomerTime),
        EstimatedArrivalTimeCustomerTime: toFullISOString(formData.EstimatedArrivalTimeCustomerTime),
        ActualArrivalTimeCustomerTime: toFullISOString(formData.ActualArrivalTimeCustomerTime),
        StartTimeUserTime: toFullISOString(formData.StartTimeUserTime),
        EndTimeUserTime: toFullISOString(formData.EndTimeUserTime),
        EstimatedArrivalTimeUserTime: toFullISOString(formData.EstimatedArrivalTimeUserTime),
        ActualArrivalTimeUserTime: toFullISOString(formData.ActualArrivalTimeUserTime),
      };

      await ApiCustomer.patch(`/api/bookingDetails/${BookingDetailId}`, payload);
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Booking detail has been updated.",
        timer: 1200,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setIsOpen(false);
      onUpdate?.();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update booking detail.",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)} aria-label="Edit booking detail">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Booking Detail</DialogTitle>
          <DialogDescription>Perbarui data booking detail di bawah ini.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Booking */}
          <div>
            <GenericSelector
              label={<><span>Booking</span> <span className="text-red-500">*</span></>}
              placeholder="Search Booking..."
              endpoint="/api/booking"
              value={bookings.find((b) => b.BookingId === formData.BookingId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, BookingId: item.BookingId }))}
              valueKey="BookingId"
              labelKey="BookingId"
            />
          </div>

          {/* Resource */}
          <div>
            <GenericSelector
              label={<><span>Resource</span> <span className="text-red-500">*</span></>}
              placeholder="Search Resource..."
              endpoint="/api/resources"
              value={resources.find((r) => r.ResourceId === formData.ResourceId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, ResourceId: item.ResourceId }))}
              valueKey="ResourceId"
              labelKey="Name"
            />
          </div>

          {/* Resource Account */}
          <div>
            <GenericSelector
              label={<><span>Resource Account</span> <span className="text-red-500">*</span></>}
              placeholder="Search Account..."
              endpoint="/api/resource-account"
              value={accounts.find((a) => a.ResourceAccountId === formData.ResourceAccountId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, ResourceAccountId: item.ResourceAccountId }))}
              valueKey="ResourceAccountId"
              labelKey="Name"
            />
          </div>

          {/* Engineer */}
          <div>
            <GenericSelector
              label={<><span>Engineer</span> <span className="text-red-500">*</span></>}
              placeholder="Search Engineer..."
              endpoint="/api/users?role=ce"
              value={engineers.find((e) => e.IDUser === formData.EngineerId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, EngineerId: item.IDUser }))}
              valueKey="IDUser"
              labelKey="Name"
            />
          </div>

          {/* Status */}
          <div>
            <GenericSelector
              label={<><span>Status</span> <span className="text-red-500">*</span></>}
              placeholder="Search Status..."
              endpoint="/api/booking-status"
              value={statuses.find((s) => s.BookingStatusId === formData.BookingStatusId)}
              onChange={(item) => setFormData((prev) => ({ ...prev, BookingStatusId: item.BookingStatusId }))}
              valueKey="BookingStatusId"
              labelKey="Description"
            />
          </div>

          {/* Customer Time */}
          <div className="pt-2 border-t md:col-span-2">
            <p className="mb-1 font-semibold">Customer Time</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div><Label>Start Time</Label><Input type="datetime-local" id="StartTimeCustomerTime" value={formData.StartTimeCustomerTime} onChange={handleInputChange} /></div>
              <div><Label>End Time</Label><Input type="datetime-local" id="EndTimeCustomerTime" value={formData.EndTimeCustomerTime} onChange={handleInputChange} /></div>
              <div><Label>Estimated Arrival</Label><Input type="datetime-local" id="EstimatedArrivalTimeCustomerTime" value={formData.EstimatedArrivalTimeCustomerTime} onChange={handleInputChange} /></div>
              <div><Label>Actual Arrival</Label><Input type="datetime-local" id="ActualArrivalTimeCustomerTime" value={formData.ActualArrivalTimeCustomerTime} onChange={handleInputChange} /></div>
            </div>
          </div>

          {/* User Time */}
          <div className="pt-2 border-t md:col-span-2">
            <p className="mb-1 font-semibold">User Time</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div><Label>Start Time</Label><Input type="datetime-local" id="StartTimeUserTime" value={formData.StartTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>End Time</Label><Input type="datetime-local" id="EndTimeUserTime" value={formData.EndTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>Estimated Arrival</Label><Input type="datetime-local" id="EstimatedArrivalTimeUserTime" value={formData.EstimatedArrivalTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>Actual Arrival</Label><Input type="datetime-local" id="ActualArrivalTimeUserTime" value={formData.ActualArrivalTimeUserTime} onChange={handleInputChange} /></div>
              <div><Label>Duration (minutes)</Label><Input type="number" id="DurationInMinutesUserTime" value={formData.DurationInMinutesUserTime} onChange={handleInputChange} /></div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingDetailsDelete({ BookingDetailId, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Booking detail ini akan dihapus dan tindakan ini tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/bookingDetails/${BookingDetailId}`);

        if (response.status === 409 || response.data.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Booking detail ini memiliki relasi dan tidak bisa dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Booking detail berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          if (onUpdate) onUpdate(); 
        });

      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Booking detail ini tidak bisa dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Booking detail. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function BookingStatusAdd({ onUpdate }) {
  const [formData, setFormData] = useState({
    Description: "",
  });

  // Input Handler
  const handlerInput = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Submit Handler
  const handlerSubmit = async () => {
    const { Description } = formData;

    if (!Description) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in Description before submitting.",
        icon: "warning",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
      return;
    }

    try {
      const response = await ApiCustomer.post("/api/booking-status", formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Booking Status berhasil disimpan.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      }).then(() => {
        if (onUpdate) onUpdate(); // ✅ refresh tabel, bukan reload halaman
        setFormData({ Description: "" }); // reset form
      });
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to save Booking Status. Please try again.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">
          Booking Status Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Booking Status</DialogTitle>
          <DialogDescription>
            Fields marked with <span className="text-red-500">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Description <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="Description"
            value={formData.Description}
            onChange={handlerInput}
          />
        </div>

        <DialogFooter>
          <Button onClick={handlerSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingStatusEdit({ BookingStatusId, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    BookingStatusId: "",
    Description: "",
  });

  // ✅ ambil detail booking status saat modal dibuka
  useEffect(() => {
    if (!open) return;
    const fetchDetail = async () => {
      try {
        const res = await ApiCustomer.get(`/api/booking-status/${BookingStatusId}`);
        const data = res.data.data;
        setFormData({
          BookingStatusId: data.BookingStatusId,
          Description: data.Description,
        });
      } catch (err) {
        console.error("Error fetch booking status:", err);
        Swal.fire({ icon: "error", title: "Error", text: "Failed to load data" });
      }
    };

    fetchDetail();
  }, [open, BookingStatusId]);

  const handlerInput = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlerSave = async () => {
    if (!formData.Description) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete",
        text: "Description is required",
      });
      return;
    }

    try {
      await ApiCustomer.put(`/api/booking-status/${formData.BookingStatusId}`, {
        Description: formData.Description,
      });
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Booking Status updated successfully",
        timer: 1200,
        showConfirmButton: false,
      });
      setOpen(false);
      onUpdate?.();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Update failed, please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Booking Status</DialogTitle>
          <DialogDescription>Update booking status description below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Description <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="Description"
            value={formData.Description}
            onChange={handlerInput}
          />
        </div>

        <DialogFooter>
          <Button onClick={handlerSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BookingStatusDelete({ BookingStatusId, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "BookingStatus ini akan dihapus dan tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/booking-status/${BookingStatusId}`);

        if (response.status === 409 || response.data?.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data?.message || "BookingStatus ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'BookingStatus berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          setIsModalOpen(false);
          if (onUpdate) {
            onUpdate();
          }
          window.location.reload();
        });
      } catch (error) {
        if (error.response?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data?.message || "BookingStatus tidak dapat dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus BookingStatus. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function RepairClassCodeAdd() {
  const [formData, setFormData] = useState({
    Code: "",
    Description: "",
    Definition: "",
    PaymentEligibility: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.Code || !formData.Description || !formData.PaymentEligibility) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Code, Description, and PaymentEligibility are required.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.post("/api/repairClassCode", formData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Repair Class Code saved",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to save data",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-sm ">Add Repair Class Code</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Repair Class Code</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Code <span className="text-red-500">*</span></Label>
          <Input id="Code" value={formData.Code} onChange={handleInputChange} maxLength={3} />

          <Label>Description <span className="text-red-500">*</span></Label>
          <Input id="Description" value={formData.Description} onChange={handleInputChange} maxLength={100} />

          <Label>Definition</Label>
          <Input id="Definition" value={formData.Definition} onChange={handleInputChange} maxLength={255} />

          <Label>Payment Eligibility <span className="text-red-500">*</span></Label>
          <select
            id="PaymentEligibility"
            value={formData.PaymentEligibility}
            onChange={handleInputChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Eligibility --</option>
            <option value="Eligible">Eligible</option>
            <option value="Not_Eligible">Not Eligible</option>
          </select>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RepairClassCodeEdit({ Code }) {
  const [description, setDescription] = useState("");
  const [definition, setDefinition] = useState("");
  const [paymentEligibility, setPaymentEligibility] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await ApiCustomer.get(`/api/repairClassCode/${Code}`);
      const data = response.data.data;
      setDescription(data.Description || "");
      setDefinition(data.Definition || "");
      setPaymentEligibility(data.PaymentEligibility || "");
    } catch (error) {
      toast.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!description || !definition || !paymentEligibility) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "All fields are required.",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/repairClassCode/${Code}`, {
        Description: description,
        Definition: definition,
        PaymentEligibility: paymentEligibility,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Repair Class Code has been updated.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update Repair Class Code. Please try again.",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Repair Class Code</DialogTitle>
          <DialogDescription>
            Update the repair class code data. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Description <span className="text-red-500">*</span></Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <Label>Definition <span className="text-red-500">*</span></Label>
          <Input
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Definition"
          />
          <Label>Payment Eligibility <span className="text-red-500">*</span></Label>
          <select
            value={paymentEligibility}
            onChange={(e) => setPaymentEligibility(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select Payment Eligibility --</option>
            <option value="Eligible">Eligible</option>
            <option value="Not_Eligible">Not Eligible</option>
          </select>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RepairClassCodeDelete({ Code, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Kode klasifikasi perbaikan ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/repairClassCode/${Code}`);

        if (response.status === 409 || response.data.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Data ini memiliki relasi dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data klasifikasi berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload(); 
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Data ini tidak bisa dihapus karena memiliki keterkaitan.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function ServiceCatalogAdd() {
  const [formData, setFormData] = useState({
    AssetID: '',
    Service_offerID: '',
    PartNumber: '',
    WarrantyStatus: '',
    Currency: '',
    Price: '',
    Tax: '',
    Total: ''
  });

  const [assets, setAssets] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [assetRes, warrantyRes, partRes] = await Promise.all([
          ApiCustomer.get("/api/asset-information"),
          ApiCustomer.get("/api/warranty-services"),
          ApiCustomer.get("/api/servicecatalog-parts")
        ]);
        setAssets(assetRes.data.data);
        setWarranties(warrantyRes.data.data);
        setParts(partRes.data.data);
      } catch (error) {
        toast.error("Failed to fetch dropdown data", error);
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {[]
    const { AssetID, Service_offerID } = formData;

    if (!AssetID || !Service_offerID) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Please fill in all required fields before submitting.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        AssetID: parseInt(formData.AssetID),
        Price: formData.Price ? parseFloat(formData.Price) : null,
        Tax: formData.Tax ? parseFloat(formData.Tax) : null,
        Total: formData.Total ? parseFloat(formData.Total) : null
      };

      await ApiCustomer.post("/api/service-log", payload);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Service Catalog berhasil disimpan.',
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });

    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to save Service Catalog. Please try again.",
        icon: "error",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-sm ml-2">Add Service Catalog</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service Catalog</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Asset <span className="text-red-500">*</span></Label>
          <Select onValueChange={handleSelectChange("AssetID")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Asset ID" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.AssetID} value={String(asset.AssetID)}>
                  {asset.AssetID} - {asset.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Service Offer <span className="text-red-500">*</span></Label>
          <Select onValueChange={handleSelectChange("Service_offerID")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Service Offer ID" />
            </SelectTrigger>
            <SelectContent>
              {warranties.map((w) => (
                <SelectItem key={w.Service_offerID} value={w.Service_offerID}>
                  {w.Service_offerID} - {w.Description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Part Number</Label>
          <Select onValueChange={handleSelectChange("PartNumber")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Part Number" />
            </SelectTrigger>
            <SelectContent>
              {parts.map((p) => (
                <SelectItem key={p.PartNumber} value={p.PartNumber}>
                  {p.PartNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Warranty Status</Label>
          <Input id="WarrantyStatus" value={formData.WarrantyStatus} onChange={handleChange} />

          <Label>Currency</Label>
          <Input id="Currency" value={formData.Currency} onChange={handleChange} />

          <Label>Price</Label>
          <Input id="Price" type="number" step="0.01" value={formData.Price} onChange={handleChange} />

          <Label>Tax</Label>
          <Input id="Tax" type="number" step="0.01" value={formData.Tax} onChange={handleChange} />

          <Label>Total</Label>
          <Input id="Total" type="number" step="0.01" value={formData.Total} onChange={handleChange} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceCatalogEdit({ ServiceCatalogID, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    AssetID: '',
    Service_offerID: '',
    PartNumber: '',
    WarrantyStatus: '',
    Currency: '',
    Price: '',
    Tax: '',
    Total: ''
  });

  const [assets, setAssets] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [parts, setParts] = useState([]);

  useEffect(() => {
    if (!open) return;

    const fetchAll = async () => {
      try {
        const [assetRes, warrantyRes, partRes, scRes] = await Promise.all([
          ApiCustomer.get("/api/asset-information"),
          ApiCustomer.get("/api/warranty-services"),
          ApiCustomer.get("/api/servicecatalog-parts"),
          ApiCustomer.get(`/api/service-log/${ServiceCatalogID}`),
        ]);

        setAssets(assetRes.data.data);
        setWarranties(warrantyRes.data.data);
        setParts(partRes.data.data);

        const data = scRes.data.data;
        setFormData({
          AssetID: data.AssetID?.toString() || '',
          Service_offerID: data.Service_offerID || '',
          PartNumber: data.PartNumber || '',
          WarrantyStatus: data.WarrantyStatus || '',
          Currency: data.Currency || '',
          Price: data.Price || '',
          Tax: data.Tax || '',
          Total: data.Total || ''
        });
      } catch (error) {
        toast.error("Failed to fetch edit data", error);
      }
    };

    fetchAll();
  }, [open, ServiceCatalogID]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        AssetID: parseInt(formData.AssetID),
        Price: formData.Price ? parseFloat(formData.Price) : null,
        Tax: formData.Tax ? parseFloat(formData.Tax) : null,
        Total: formData.Total ? parseFloat(formData.Total) : null
      };

      await ApiCustomer.patch(`/api/service-log/${ServiceCatalogID}`, payload);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Service Catalog berhasil diperbarui.",
        timer: 1200,
        showConfirmButton: false,
      });

      setOpen(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal memperbarui Service Catalog.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Catalog</DialogTitle>
          <DialogDescription>Update the selected service catalog entry.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Asset <span className="text-red-500">*</span></Label>
          <Select value={formData.AssetID} onValueChange={handleSelectChange("AssetID")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Asset ID" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.AssetID} value={String(asset.AssetID)}>
                  {asset.AssetID} - {asset.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Service Offer <span className="text-red-500">*</span></Label>
          <Select value={formData.Service_offerID} onValueChange={handleSelectChange("Service_offerID")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Service Offer ID" />
            </SelectTrigger>
            <SelectContent>
              {warranties.map((w) => (
                <SelectItem key={w.Service_offerID} value={w.Service_offerID}>
                  {w.Service_offerID} - {w.Description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Part Number</Label>
          <Select value={formData.PartNumber} onValueChange={handleSelectChange("PartNumber")}>
            <SelectTrigger>
              <SelectValue placeholder="Select Part Number" />
            </SelectTrigger>
            <SelectContent>
              {parts.map((p) => (
                <SelectItem key={p.PartNumber} value={p.PartNumber}>
                  {p.PartNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Warranty Status</Label>
          <Input id="WarrantyStatus" value={formData.WarrantyStatus} onChange={handleChange} />

          <Label>Currency</Label>
          <Input id="Currency" value={formData.Currency} onChange={handleChange} />

          <Label>Price</Label>
          <Input id="Price" type="number" step="0.01" value={formData.Price} onChange={handleChange} />

          <Label>Tax</Label>
          <Input id="Tax" type="number" step="0.01" value={formData.Tax} onChange={handleChange} />

          <Label>Total</Label>
          <Input id="Total" type="number" step="0.01" value={formData.Total} onChange={handleChange} />
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceCatalogDelete({ ServiceCatalogID, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data Service Catalog ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/service-log/${ServiceCatalogID}`);

        if (response.status === 409 || response.data.success === false) {
          Swal.fire({
            icon: "warning",
            title: "Tidak Bisa Dihapus!",
            text:
              response.data.message ||
              "Service Catalog ini memiliki keterkaitan data lain dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Service Catalog berhasil dihapus.",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          if (onUpdate) {
            onUpdate(); 
          }
        });
      } catch (error) {
        if (error.response?.status === 409) {
          Swal.fire({
            icon: "warning",
            title: "Tidak Bisa Dihapus!",
            text:
              error.response.data.message ||
              "Service Catalog ini tidak bisa dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Menghapus!",
            text: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="text-red-500 hover:text-red-700"
      onClick={handleDelete}
    >
      <Trash />
    </Button>
  );
}

export function ServiceTypeAdd() {
  const [formData, setFormData] = useState({
    ServiceTypeName: "",
    ProblemCategory: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.ServiceTypeName || !formData.ProblemCategory) {
      Swal.fire({
        title: "Incomplete Data",
        text: "Both Service Type Name and Problem Category are required.",
        icon: "warning",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const response = await ApiCustomer.post("/api/service-type", formData);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Service Type has been successfully added.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to save Service Type. Please try again.",
        icon: "error",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">
          Add Service Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Service Type</DialogTitle>
          <DialogDescription>
            Fields marked with <span className="text-red-500">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* ServiceTypeName */}
          <Label>
            Service Type Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="ServiceTypeName"
            value={formData.ServiceTypeName}
            onChange={handleInputChange}
          />

          {/* ProblemCategory */}
          <Label>
            Problem Category <span className="text-red-600">*</span>
          </Label>
          <select
            id="ProblemCategory"
            value={formData.ProblemCategory || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Select Problem Category --</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
          </select>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceTypeEdit({ ServiceTypeId, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    ServiceTypeName: "",
    ProblemCategory: "",
  });
  const [serviceType, setServiceType] = useState(null);

  // 🔹 Ambil data ServiceType by ID
  const fetchServiceType = async () => {
    if (!ServiceTypeId) return;
    try {
      const res = await ApiCustomer.get(`/api/service-type/${ServiceTypeId}`);
      const data = res.data.data;
      setServiceType(data);
      setFormData({
        ServiceTypeName: data?.ServiceTypeName || "",
        ProblemCategory: data?.ProblemCategory || "",
      });
    } catch (error) {
      toast.error("Error fetching ServiceType:", error);
    }
  };

  // 🔹 Jalankan fetch saat modal dibuka
  useEffect(() => {
    if (ServiceTypeId && isOpen) {
      fetchServiceType();
    }
  }, [ServiceTypeId, isOpen]);

  // 🔹 Reset field saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setFormData({ ServiceTypeName: "", ProblemCategory: "" });
    }
  }, [isOpen]);

  // 🔹 Handler untuk update ServiceType
  const handleUpdate = async () => {
    if (!formData.ServiceTypeName) {
      Swal.fire({
        title: "Incomplete Data",
        text: "ServiceType Name is required.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/service-type/${ServiceTypeId}`, {
        ServiceTypeName: formData.ServiceTypeName,
        ProblemCategory: formData.ProblemCategory || null,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "ServiceType updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        onUpdate?.();
        setIsOpen(false);
      });
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: "Could not update ServiceType. Please try again.",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchServiceType(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit ServiceType</DialogTitle>
          <DialogDescription>
            Update ServiceType details below. Fields marked with <span className="text-red-500">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Service Type Name <span className="text-red-500">*</span></Label>
          <Input
            value={formData.ServiceTypeName}
            onChange={(e) =>
              setFormData({ ...formData, ServiceTypeName: e.target.value })
            }
            placeholder="Service Type Name*"
          />
          <Label>Problem Category <span className="text-red-500">*</span></Label>
          <select
            value={formData.ProblemCategory || ""}
            onChange={(e) =>
              setFormData({ ...formData, ProblemCategory: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Select Problem Category --</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
          </select>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceTypeDelete({ ServiceTypeId, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "ServiceType ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await ApiCustomer.delete(`/api/service-type/${ServiceTypeId}`);

      if (response.status === 409 || response.data.success === false) {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: response.data.message || "ServiceType tidak bisa dihapus karena ada relasi.",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "ServiceType berhasil dihapus.",
        timer: 1100,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      if (onUpdate) onUpdate(); 
    } catch (error) {
      if (error.response?.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Tidak bisa menghapus!",
          text: "ServiceType ini memiliki relasi aktif di tabel lain. Harap hapus data terkait terlebih dahulu.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text:
            error.response?.data?.message ||
            "Terjadi kesalahan saat menghapus ServiceType. Silakan coba lagi.",
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="text-red-500 hover:text-red-700"
      onClick={handleDelete}
    >
      <Trash className="w-4 h-4" />
    </Button>
  );
}

export function OTCAdd({ onUpdate }) {
  const [formData, setFormData] = useState({
    OTCCode: "",
    Description: "",
    WarrantyCondition: "InWarranty",
  });

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.OTCCode || !formData.Description || !formData.WarrantyCondition) {
      Swal.fire({
        title: "Incomplete Data",
        text: "All fields are required.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return
    }

    try {
      await ApiCustomer.post("/api/otc-code", formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "OTC Code berhasil disimpan.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      })
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data. Silakan coba lagi.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 rounded-sm h-11">Add OTC Code</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add OTC Code</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>OTC Code <span className="text-red-500">*</span></Label>
          <Input id="OTCCode" value={formData.OTCCode} onChange={handleInputChange} />

          <Label>Description <span className="text-red-500">*</span></Label>
          <Input id="Description" value={formData.Description} onChange={handleInputChange} />

          <Label>Warranty Condition <span className="text-red-500">*</span></Label>
          <select
            id="WarrantyCondition"
            value={formData.WarrantyCondition}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
          >
            <option value="InWarranty">In Warranty</option>
            <option value="OutWarranty">Out Warranty</option>
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OTCEdit({ OTCCode, onUpdate }) {
  const [formData, setFormData] = useState({
    OTCCode: "",
    Description: "",
    WarrantyCondition: "",
  });
  const [open, setOpen] = useState(false);

  const fetchOTCCode = async () => {
    try {
      const res = await ApiCustomer.get(`/api/otc-code/${OTCCode}`);
      if (res.data.success) {
        setFormData({
          OTCCode: res.data.data.OTCCode,
          Description: res.data.data.Description,
          WarrantyCondition: res.data.data.WarrantyCondition || "",
        });
      } else {
        throw new Error("Failed to load data");
      }
    } catch (error) {
      console.error("Error fetching OTC Code:", error);
      Swal.fire("Error", "Gagal memuat data OTC Code.", "error");
    }
  };

  useEffect(() => {
    if (open) fetchOTCCode();
  }, [open]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.Description) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Description is required.",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/otc-code/${OTCCode}`, formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "OTC Code berhasil diperbarui.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        onUpdate?.();
        setOpen(false);
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal memperbarui data. Silakan coba lagi.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
        <Pencil/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit OTC Code</DialogTitle>
          <DialogDescription>Update the description for this OTC Code.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>OTC Code <span className="text-red-500">*</span></Label>
          <Input id="OTCCode" value={formData.OTCCode} disabled />

          <Label>Description <span className="text-red-500">*</span></Label>
          <Input id="Description" value={formData.Description} onChange={handleInputChange} />

          <Label>Warranty Condition <span className="text-red-500">*</span></Label>
          <select
            id="WarrantyCondition"
            value={formData.WarrantyCondition}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">-- Select Condition --</option>
            <option value="InWarranty">In Warranty</option>
            <option value="OutWarranty">Out of Warranty</option>
          </select>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OTCDelete({ OTCCode, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "OTCCode ini akan dihapus dan tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/otc-code/${OTCCode}`);

        if (response.status === 409 || response.data?.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data?.message || "OTCCode ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'OTCCode berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          setIsModalOpen(false);
          if (onUpdate) {
            onUpdate();
          }
          window.location.reload();
        });
      } catch (error) {
        if (error.response?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data?.message || "OTCCode tidak dapat dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus OTCCode. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };

  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}

export function CrsAdd() {
  const [formData, setFormData] = useState({
    caseResolutionCode: "",
    autoClose: "",
    caseReadyForClosure: "",
    readyForCloseDays: "",
    readyForClosureDate: "",
    pendingCustomerAction: "",
    customerRequestedCloseDate: "",
  });

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    // Validasi input
    if (!formData.caseResolutionCode || !formData.autoClose || !formData.caseReadyForClosure) {
      Swal.fire({
        title: "Incomplete Data",
        text: "All fields are required.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      return;
    }

    try {
      await ApiCustomer.post("/api/caseResolution", formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Case Resolution berhasil disimpan.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload(); 
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal menyimpan data. Silakan coba lagi.",
        icon: "error",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4 ml-2 rounded-sm h-11">Add Case Resolution</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Case Resolution</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Case Resolution Code</Label>
          <Input id="caseResolutionCode" value={formData.caseResolutionCode} onChange={handleInputChange} />

          <Label>Auto Close</Label>
          <SelectYN
          id="autoClose"
          value={formData.autoClose}
          onValueChange={(value) => handleInputChange({ target: { id: "autoClose", value } })}
        />

          <Label>Case Ready For Closure</Label>
          <SelectYN
            id="caseReadyForClosure"
            value={formData.caseReadyForClosure}
            onValueChange={(value) => handleInputChange({ target: { id: "caseReadyForClosure", value } })}
          />

          <Label>Ready For Close Days</Label>
          <Input id="readyForCloseDays" type="number" value={formData.readyForCloseDays} onChange={handleInputChange} />


          <Label>Ready For Closure Date</Label>
          <Input id="readyForClosureDate" type="datetime-local" value={formData.readyForClosureDate} onChange={handleInputChange} />

          <Label>Pending Customer Action</Label>
          <Input id="pendingCustomerAction" type="datetime-local" value={formData.pendingCustomerAction} onChange={handleInputChange} />

          <Label>Customer Requested Close Date</Label>
          <Input id="customerRequestedCloseDate" type="datetime-local" value={formData.customerRequestedCloseDate} onChange={handleInputChange} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CrsEdit({ id_csr, onUpdate }) {
  const [formData, setFormData] = useState({
    caseResolutionCode: "",
    autoClose: "",
    caseReadyForClosure: "",
    readyForCloseDays: "",
    readyForClosureDate: "",
    pendingCustomerAction: "",
    customerRequestedCloseDate: "",
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !id_csr) return;

    
    const fetchData = async () => {
      try {
        const response = await ApiCustomer.get(`/api/caseResolution/${id_csr}`);
        const data = response.data.data;

        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          const offset = date.getTimezoneOffset();
          const localDate = new Date(date.getTime() - offset * 60 * 1000);
          return localDate.toISOString().slice(0, 16); // ambil 'YYYY-MM-DDTHH:MM'
        };

        setFormData({
          caseResolutionCode: data.caseResolutionCode,
          autoClose: data.autoClose,
          caseReadyForClosure: data.caseReadyForClosure,
          readyForCloseDays: data.readyForCloseDays,
          readyForClosureDate: formatDateForInput(data.readyForClosureDate),
          pendingCustomerAction: formatDateForInput(data.pendingCustomerAction),
          customerRequestedCloseDate: formatDateForInput(data.customerRequestedCloseDate),
        });
      } catch (error) {
        Swal.fire({
           icon: 'error',
           title: 'Gagal Mengambil data',
           allowEscapekey: false,
           showConfirmButton: false,
           allowOutsideClick: false
        }).then(() => {
          window.location.reload;
        })
      }
    };

    fetchData();
  }, [id_csr, open]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.caseResolutionCode || !formData.autoClose || !formData.caseReadyForClosure) {
      Swal.fire("Incomplete", "Semua field wajib diisi", "warning");
      return;
    }

    try {
      await ApiCustomer.patch(`/api/caseResolution/${id_csr}`, formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Case Resoluution berhasil diperbarui.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
        allowEscapeKey: false
      }).then(() => {
          onUpdate?.();
        setOpen(false);
      });
    } catch (error) {
      Swal.fire("Error", "Gagal memperbarui data", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Case Resolution</DialogTitle>
          <DialogDescription>Update the fields below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Case Resolution Code</Label>
          <Input id="caseResolutionCode" value={formData.caseResolutionCode} onChange={handleInputChange} />

          <Label>Auto Close</Label>
          <SelectYN
            id="autoClose"
            value={formData.autoClose}
            onValueChange={(value) => handleInputChange({ target: { id: "autoClose", value } })}
          />

          <Label>Case Ready For Closure</Label>
          <SelectYN
            id="caseReadyForClosure"
            value={formData.caseReadyForClosure}
            onValueChange={(value) => handleInputChange({ target: { id: "caseReadyForClosure", value } })}
          />

          <Label>Ready For Close Days</Label>
          <Input id="readyForCloseDays" type="number" value={formData.readyForCloseDays} onChange={handleInputChange} />

          <Label>Ready For Closure Date</Label>
          <Input id="readyForClosureDate" type="datetime-local" value={formData.readyForClosureDate} onChange={handleInputChange} />

          <Label>Pending Customer Action</Label>
          <Input id="pendingCustomerAction" type="datetime-local" value={formData.pendingCustomerAction} onChange={handleInputChange} />

          <Label>Customer Requested Close Date</Label>
          <Input id="customerRequestedCloseDate" type="datetime-local" value={formData.customerRequestedCloseDate} onChange={handleInputChange} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CrsDelete({ id_csr, onDelete }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Case Resolution ini akan dihapus dan tidak dapat dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/caseResolution/${id_csr}`);

        if (response.status === 409 || response.data?.success === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data?.message || "Data memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Case Resolution berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
          if (onDelete) {
            onDelete();
          }
        });
      } catch (error) {
        if (error.response?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data?.message || "Data memiliki relasi dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
    return (
      <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
        <Trash />
      </Button>
    );
}

export function NmuAdd() {
  const [formData, setFormData] = useState({
    NMUDesc: "",
    ItemNeeded: false,
    VersionNeeded: false,
  });

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.NMUDesc) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "NMU Description is required.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.post("/api/nmu", formData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "NMU data saved",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to save data",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-sm">Add NMU</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add NMU</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>NMU Description <span className="text-red-500">*</span></Label>
          <Input
            id="NMUDesc"
            value={formData.NMUDesc}
            onChange={handleInputChange}
            maxLength={255}
          />

          <div className="flex items-center gap-2">
            <input
              id="ItemNeeded"
              type="checkbox"
              checked={formData.ItemNeeded}
              onChange={handleInputChange}
            />
            <Label htmlFor="ItemNeeded">Item Needed</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="VersionNeeded"
              type="checkbox"
              checked={formData.VersionNeeded}
              onChange={handleInputChange}
            />
            <Label htmlFor="VersionNeeded">Version Needed</Label>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NmuEdit({ NMUId, onUpdate }) {
  const [desc, setDesc] = useState("");
  const [itemNeeded, setItemNeeded] = useState(false);
  const [versionNeeded, setVersionNeeded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await ApiCustomer.get(`/api/nmu/${NMUId}`);
      const data = response.data.data;
      if (data) {
        setDesc(data.NMUDesc || "");
        setItemNeeded(Boolean(data.ItemNeeded));
        setVersionNeeded(Boolean(data.VersionNeeded));
      }
    } catch (error) {
      toast.error("Error fetching NMU data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!desc) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Description is required.",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/nmu/${NMUId}`, {
        NMUDesc: desc,
        ItemNeeded: itemNeeded,
        VersionNeeded: versionNeeded,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "NMU has been updated successfully.",
        timer: 1200,
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        setIsOpen(false); // Tutup modal setelah update
        if (onUpdate) onUpdate();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update NMU. Please try again.",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit NMU</DialogTitle>
          <DialogDescription>
            Update NMU data. Description is required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>NMU Description <span className="text-red-500">*</span></Label>
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="NMU Description"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={itemNeeded}
              onChange={(e) => setItemNeeded(e.target.checked)}
            />
            <label>Item Needed</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={versionNeeded}
              onChange={(e) => setVersionNeeded(e.target.checked)}
            />
            <label>Version Needed</label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NmuDelete({ NMUId, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data ini akan dihapus secara permanen dan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/nmu/${NMUId}`);

        // kalau backend kasih error 409 atau success=false
        if (response.status === 409 || response.data.success === false) {
          return Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || 'Data ini memiliki keterkaitan dan tidak dapat dihapus.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        }).then(() => {
          if (onUpdate) {
            onUpdate(); // refresh tabel parent
          } else {
            window.location.reload();
          }
        });

      } catch (error) {
        const message = error?.response?.data?.message;
        if (error?.response?.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: message || 'Data ini memiliki keterkaitan dan tidak dapat dihapus.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        }
      }
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className="text-red-500 hover:text-red-700" 
      onClick={handleDelete}
    >
      <Trash size={16} />
    </Button>
  );  
}

export function NmuItemAdd() {
  const [formData, setFormData] = useState({
    itemName: "",
    nmuId: "",
  });

  const [nmuList, setNmuList] = useState([]);

  // Ambil daftar NMU untuk dropdown
  useEffect(() => {
    const fetchNMU = async () => {
      try {
        const res = await ApiCustomer.get("/api/nmu", {
          params: { limit: 100 }, // ambil maksimal 100 record NMU
        });
        if (res.data.success) {
          setNmuList(res.data.data);
        }
      } catch (error) {
        console.error("Gagal ambil data NMU:", error);
      }
    };

    fetchNMU();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.itemName || !formData.nmuId) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Item Name dan NMU wajib diisi.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.post("/api/nmu/nmuitem", formData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "NMU Item berhasil disimpan",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Gagal menyimpan data",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 rounded-sm">Add NMU Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add NMU Item</DialogTitle>
          <DialogDescription>Fields marked with <span className="text-red-500">*</span> are required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Item Name <span className="text-red-500">*</span></Label>
          <Input
            id="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            maxLength={255}
          />

          <Label>Pilih NMU <span className="text-red-500">*</span></Label>
          <select
            id="nmuId"
            value={formData.nmuId}
            onChange={handleInputChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">-- Pilih NMU --</option>
            {nmuList.map((nmu) => (
              <option key={nmu.NMUId} value={nmu.NMUId}>
                {nmu.NMUDesc || `NMU ${nmu.NMUId}`}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NmuItemEdit({ id, onUpdate }) {
  const [formData, setFormData] = useState({
    itemName: "",
    nmuId: "",
  });

  const [nmuList, setNmuList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Ambil list NMU untuk dropdown
  const fetchNMU = async () => {
    try {
      const res = await ApiCustomer.get("/api/nmu", {
        params: { limit: 100 },
      });
      if (res.data.success) {
        setNmuList(res.data.data);
      }
    } catch (error) {
      toast.error("Gagal ambil data NMU:", error);
    }
  };

  // Ambil data NMUItem untuk edit
  const fetchNMUItem = async () => {
    try {
      const res = await ApiCustomer.get(`/api/nmu/nmuitem/${id}`);
      if (res.data.success) {
        setFormData({
          itemName: res.data.data.itemName,
          nmuId: res.data.data.nmuId,
        });
      }
    } catch (error) {
      toast.error("Gagal ambil data NMU Item:", error);
    }
  };

  // Load data ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchNMU();
      if (id) fetchNMUItem();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.itemName || !formData.nmuId) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Item Name dan NMU wajib diisi.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await ApiCustomer.patch(`/api/nmu/nmuitem/${id}`, formData);
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "NMU Item berhasil diperbarui.",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        setIsOpen(false);
        if (onUpdate) onUpdate();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Gagal mengupdate data.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit NMU Item</DialogTitle>
          <DialogDescription>Update data NMU Item sesuai kebutuhan.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Item Name <span className="text-red-500">*</span></Label>
          <Input
            id="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            maxLength={255}
          />

          <Label>Pilih NMU <span className="text-red-500">*</span></Label>
          <select
            id="nmuId"
            value={formData.nmuId}
            onChange={handleInputChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">-- Pilih NMU --</option>
            {nmuList.map((nmu) => (
              <option key={nmu.NMUId} value={nmu.NMUId}>
                {nmu.NMUDesc || `NMU ${nmu.NMUId}`}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NmuItemDelete({ id, itemName, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Item "${itemName}" akan dihapus secara permanen dan tidak bisa dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/nmu/nmuitem/${id}`);

        // Jika backend mengirim status gagal atau 409 (foreign key constraint)
        if (response.status === 409 || response.data.success === false) {
          return Swal.fire({
            icon: "warning",
            title: "Tidak Bisa Dihapus!",
            text:
              response.data.message ||
              "Data ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        }

        // ✅ Jika sukses hapus
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "NMU Item berhasil dihapus.",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          allowEscapeKey: false,
        }).then(() => {
          if (onUpdate) {
            onUpdate(); // refresh tabel parent tanpa reload halaman
          } else {
            window.location.reload();
          }
        });
      } catch (error) {
        const message = error?.response?.data?.message;
        if (error?.response?.status === 409) {
          Swal.fire({
            icon: "warning",
            title: "Tidak Bisa Dihapus!",
            text:
              message ||
              "Data ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal Menghapus!",
            text: "Terjadi kesalahan saat menghapus data. Silakan coba lagi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
          });
        }
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="text-red-500 hover:text-red-700"
      onClick={handleDelete}
    >
      <Trash size={16} />
    </Button>
  );
}

export function FailureAdd () {
  const [formDataFailure, setFormDataFailure] = useState({
   Name: '',	
   Description: '',
   })
   
   // Make Handler ProductType
   const handlerInputFailure = (e) => {
     const { id, value } = e.target
     setFormDataFailure(prevState => ({
       ...prevState,
       [id]:value
     }));
   };

   // Handler Submit
   const handlerFailure = async () => {
     const { 
       FailureId, Name, Description
     } = formDataFailure;
   
     if ( !Name ) {
       Swal.fire({
         title: "Incomplete Data",
         text: "Please fill in all fields before submitting.",
         icon: "warning",
         timer: 1500,
         timerProgressBar: true,
         showConfirmButton: false,
         allowEscapeKey: false,
       });
       return;
     }  
   
     try {
       const response = await ApiCustomer.post("/api/failure", formDataFailure);
       Swal.fire({
         icon: 'success',
         title: 'Berhasil!',
         text: 'Failure berhasil disimpan.',
         timer: 1200,
         timerProgressBar: true,
         showConfirmButton: false,
         allowEscapeKey: false,
       }).then(() => {
         window.location.reload();
       });

     } catch (err) {
       Swal.fire({
         title: "Error!",
         text: "Failed to save Failure. Please try again.",
         icon: "error",
         timer: 1200,
         timerProgressBar: true,
         showConfirmButton: false,
         allowEscapeKey: false,
       });
     }
   };
 return (
   <Dialog>
     <DialogTrigger asChild>
       <Button variant="outline" className="ml-2 rounded-sm h-11"> Failure Add</Button>
     </DialogTrigger>
     <DialogContent className="h-[300px] overflow-y-auto">
       <DialogHeader>
         <DialogTitle>Add Failure Information</DialogTitle>
         <DialogDescription>
           Add the Failure Fields marked with <span className="text-red-500">*</span> are required.
         </DialogDescription>
       </DialogHeader>
       <div className="space-y-2">
       <Label>Name <span className="text-red-500">*</span></Label>
       <Input type="text" id="Name" className="p-2" value={formDataFailure.Name} onChange={handlerInputFailure} />

       <Label>Description</Label>
       <Input type="text" id="Description" className="p-2" value={formDataFailure.Description} onChange={handlerInputFailure} />
       </div>
       <DialogFooter>
         <Button onClick={handlerFailure}>Add</Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
 )
};

export function FailureEdit({ FailureId, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const defaultFormData = {
    FailureId: "",
    Name: "",
    Description: ""
  };

  const fetchFailure = async () => {
    try {
      const res = await ApiCustomer.get(`/api/failure/${FailureId}`);
      setFormData(res.data.data || defaultFormData);
    } catch (e) {
      toast.error("Fetch failed", e);
    }
  };

  const handleChange = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleUpdate = async () => {
    const { Name, Description } = formData;

    if (!Name) {
      return Swal.fire({
        icon: "warning",
        text: "Lengkapi semua field wajib.",
        timer: 1200,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }

    const updatedData = { Name, Description };

    try {
      await ApiCustomer.patch(`/api/failure/${FailureId}`, updatedData);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data diperbarui.",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      }).then(() => {
        onUpdate();
        setIsOpen(false);
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Perbaruan gagal!",
        timer: 1500,
        showConfirmButton: false,
        allowEscapeKey: false,
      });
    }
  };

  useEffect(() => {
    if (FailureId && isOpen) fetchFailure();
    else if (!isOpen) setFormData(defaultFormData);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[300px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Failure</DialogTitle>
          <DialogDescription>Update data Failure. (<span className="text-red-500">*</span>) wajib diisi.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {[{ id: "FailureId", label: "Failure Id", type: "text", required: true, readonly: true },
            { id: "Name", label: "Name", type: "text", required: true },
            { id: "Description", label: "Description", type: "text" }].map(({ id, label, type, required, readonly }) => (
            <div key={id}>
              <Label htmlFor={id}>
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type={type}
                id={id}
                value={formData[id] || ""}
                onChange={handleChange(id)}
                readOnly={readonly}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleUpdate}>Simpan</Button>
 </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FailureDelete({ FailureId, isModalOpen, setIsModalOpen, onUpdate }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Failure ini akan dihapus dan perubahan tidak bisa dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

  
    if (result.isConfirmed) {
      try {
        const response = await ApiCustomer.delete(`/api/failure/${FailureId}`);
  
        if (response.status === 409 || response.data.success === false) {
          // Restriction triggered - Show alert message
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: response.data.message || "Failure ini memiliki keterkaitan dan tidak dapat dihapus.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Failure berhasil dihapus.',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload(); 
          if (onUpdate) {
            onUpdate();
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Handle 409 Conflict error from backend
          Swal.fire({
            icon: 'warning',
            title: 'Tidak Bisa Dihapus!',
            text: error.response.data.message || "Failure ini tidak bisa dihapus karena memiliki relasi.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus!',
            text: 'Terjadi kesalahan saat menghapus Failure. Silakan coba lagi.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    }
  };
  return (
    <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
      <Trash />
    </Button>
  );
}


export function FindCase() {
  const [openInfo, setOpenInfo] = useState(false);
  const [findingCase, setFindingCase] = useState({ Caseid: "", Phoneno: "" });
  const [caseData, setCaseData] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFindingCase((prev) => ({ ...prev, [id]: value }));
  };

  const findcase = async () => {
    const baseurl = `/api/case-information/${findingCase.Caseid}`;
    Swal.fire({
      title: "Memuat Data Case....",
      text: "Mohon Tunggu Sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await ApiCustomer.get(baseurl);
      if (response.data.success && response.data.data.contact_information.Mobile === findingCase.Phoneno) {
        setCaseData(response.data.data);
        setOpenInfo(true);
        Swal.close();
      } else {
        Swal.fire({
          title: "Error!",
          text: "Case Tidak Ditemukan",
          icon: "error",
          timer: 2000,
          timerProgressBar: true,

        });
      }

    } catch (err) {
      toast.error("Error fetching case data:", err);

      Swal.close();

      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data Case.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Dialog className={''}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 text-white hover:bg-emerald-700 ">
          🔍 Search Case
        </Button>
      </DialogTrigger>
      
      <DialogContent className="rounded-lg shadow-lg max-h-4/6 overflow-auto min-w-4/6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Search for a Case
          </DialogTitle>
          <DialogDescription>
            Enter the Case ID and Phone Number to find your case.
          </DialogDescription>
        </DialogHeader>

        {/* 🔎 Search Form */}
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="Caseid">Case ID</Label>
            <Input
              id="Caseid"
              value={findingCase.Caseid}
              onChange={handleInputChange}
              placeholder="e.g. C-0000"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="Phoneno">Phone Number</Label>
            <Input
              id="Phoneno"
              value={findingCase.Phoneno}
              onChange={handleInputChange}
              placeholder="e.g. +628123456789"
            />
          </div>

          <Button onClick={findcase} className="w-full bg-blue-600 hover:bg-blue-700">
            Find Case
          </Button>
        </div>

        {/* 📄 Case Info (only after found) */}
        {openInfo && (
          <div className="space-y-6 mt-6">
            {/* PDF Download */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📑 Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={async () => {
                    const blob = await pdf(
                      <ServiceRequestPDF caseDetails={caseData} />
                    ).toBlob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "Service_Request_Form.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              {/* Case Information */}
              <Card>
                <CardHeader>
                  <CardTitle>📂 Case Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-semibold">Case Status</div>
                    <div>{caseData?.CaseStatus || "N/A"}</div>
                    <div className="font-semibold">Case ID</div>
                    <div>{caseData?.CaseID || "N/A"}</div>
                    <div className="font-semibold">Reference Case</div>
                    <div>{caseData?.CaseSubject || "N/A"}</div>
                    <div className="font-semibold">Warranty</div>
                    <div>Out Warranty</div>
                    <div className="font-semibold">Customer Company</div>
                    <div>{caseData?.site_account?.Company || "N/A"}</div>
                    <div className="font-semibold">Customer Name</div>
                    <div>
                      {caseData?.contact_information
                        ? `${caseData?.contact_information?.FirstName ?? ""} ${caseData?.contact_information?.LastName ?? ""
                          }`.trim()
                        : "N/A"}
                    </div>
                    <div className="font-semibold">Received Date</div>
                    <div>
                      {caseData?.CreatedOn
                        ? new Date(caseData.CreatedOn).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle>🛠️ Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="font-semibold">Serial No.</div>
                    <div>{caseData?.asset_information?.SerialNumber ?? "N/A"}</div>
                    <div className="font-semibold">Product Type</div>
                    <div>
                      {caseData?.asset_information?.product_information?.product_type
                        ?.ProductType ?? "N/A"}
                    </div>
                    <div className="font-semibold">Product No.</div>
                    <div>{caseData?.asset_information?.ProductNumber ?? "N/A"}</div>
                    <div className="font-semibold">Product Name</div>
                    <div>
                      {caseData?.asset_information?.product_information
                        ?.ProductName ?? "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
