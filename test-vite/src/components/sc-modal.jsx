

import React, { useState, useEffect } from "react";

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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus,PhoneCall, Copy } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { SelectBar3, SelectBarContact4 } from "./sc-select";
import { 
  SelectBarContact, 
  SelectBarContact2,
  SelectBarContact3,
  SelectBar,
  SelectBar1,
  SelectBar2,
 } from "@/components/sc-select";
 import { SnInput } from "./sn-input";

import { Pencil, Trash } from "lucide-react";
//import API
import ApiCustomer from "@/api";
import axios from "axios";

// const assets = [
//   {
//     productname: "HP Victus 16 inch Gaming Laptop 16-r0555TX",
//     product: "9T92PA94-92",
//     HWPorfitCenter: "-",
//     contact: "Slamet Meisa Putra",
//   },
// ];

export function BtnModal({
  handleCreateCase,
  selectedAssetForCase,
  selectedContactForCase,
  caseType,
  setCaseType
}) {
  
  


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={handleCreateCase}
          disabled={!selectedAssetForCase || !selectedContactForCase } // 🔥 Button disabled if no asset selected
          className={`mr-4${(!selectedAssetForCase || !selectedContactForCase) ? "bg-white cursor-not-allowed" : "bg-blue-500"}`}
        >
          <Plus></Plus>Create Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle>Case Information</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-3">
          <div className="">
            <Label htmlFor="name" className="text-right">
              Case Subject
            </Label>
            <Input id="CaseSubject" className="col-span-3 border-b-black p-1" />
          </div>
          <div className="">
            <Label htmlFor="CaseType" className="text-right">
              Case Type
            </Label>
            <SelectBar3 value={caseType} onChange={setCaseType}></SelectBar3>
          </div>
          <div className="flex items-center space-x-2 mt-5">
            <Checkbox id="KCI_Flag" />
            <label
              htmlFor="KCI_Flag"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              KCI For this case?
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateCase}>DONE</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * TODO 
 * VALIDATION WHERE INPUTED CONTACT ALREADY AVAILABLE
 * CHECK EMAIL OR PHONE
 */

export function BtnModalContact({ selectedCompany, selectedContact, setSelectedContact }) {
  //set modal state 
  const [isModalContactSearchInput, setIsModalContactSearchInput] = useState(false);
  
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
      Country: '',
      ZipPostalCode: '',
      SiteAccountID: selectedCompany?.SiteAccountID || null
    });
    
    
    //handle input
    const handlerInputContactChange = (e) => {
      const { id, value } = e.target;
      setFormDataContact((prev) => ({ ...prev, [id]: value }));
    };
    
  // Function to fetch updated contacts
  const fetchContacts = async (companyId) => {
    try {
      console.log("Fetching contacts for Company ID:", companyId); // ✅ Debugging
      const response = await ApiCustomer.get(`/api/contact-information?SiteAccountID=${companyId}`);
      console.log("response Fetch Contacts: ", response.data)
      return response.data.data; // ✅ Return updated contacts
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  };
  // Handle form submission
  const handlerContactSubmit = async () => {
    console.log("formDataContact", formDataContact);
    try {
      if (formDataContact.ContactID) {
        // ✅ Update existing contact
        await ApiCustomer.patch(`/api/contact-information/${formDataContact.ContactID}`, formDataContact);
        setIsModalContactSearchInput(false)
        alert("Contact updated successfully!");
      } else {
        // ✅ Add new contact
        await ApiCustomer.post("/api/contact-information", formDataContact);
        setIsModalContactSearchInput(false)
        alert("Contact added successfully!");
      }

      // fetchContacts(); // ✅ Refresh contacts table

       // ✅ Ensure selectedCompany is not null before fetching contacts
    if (selectedCompany?.SiteAccountID) {
      console.log("Selected Company :",selectedCompany);
      const updatedContacts = await fetchContacts(selectedCompany.SiteAccountID);
      setSelectedContact(updatedContacts); // ✅ Update state so table refreshes
      console.log("Updated Selected Contacts:", updatedContacts);
    }

    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };

  

  // Edit function 

  // ✅ Function to open Edit Modal
  const openEditModal = (contact) => {
    setFormDataContact(contact);
  };


  return (
    <Dialog open={isModalContactSearchInput} onOpenChange={setIsModalContactSearchInput}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white mt-0.5">
          New Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] h-150 bg-white">
        <DialogHeader>
          <div className="flex justify-between">
            <DialogTitle className="text-xl flex gap-2"><PhoneCall></PhoneCall>Contact Information</DialogTitle>
            <DialogTitle className="flex justify-end text-sm mt-2.5">
              Clear All
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogHeader>
          <DialogTitle className="text-md">Basic Information</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 grid-cols-6">
          <div className="space-y-0.5 flex flex-col">
            <Label htmlFor="Salutation">Salutation</Label>
            <SelectBar1 id="Salutation" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.5 flex flex-col"> 
            <Label htmlFor="PreferredLanguage" >Preferred Language</Label>
            <SelectBar2 id="PreferredLanguage" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="FirstName">First Name</Label>
            <Input id="FirstName" type="text" className="border-b-black p-1 " onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.5 ">
            <Label htmlFor="LastName">Last Name</Label>
            <Input id="LastName" type="text" className="border-b-black p-1 " onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.5 col-span-2">
            <Label htmlFor="Email">Email</Label>
            <Input id="Email" type="email" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
          {/* <div className="space-y-0.4 ml-5">
            <Label htmlFor="new">EXTN</Label>
            <Input id="new" type="text" className="border-b-black p-1 w-73 h-8 text-sm" />
          </div> */}
        </div>

        <DialogHeader>
          <DialogTitle className="text-md">Phone preferences</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-6 gap-2">
          <div className="space-y-0.4 col-span-2">
            <Label htmlFor="Phone">Phone</Label>
            <Input id="Phone" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 col-span-2">
            <Label htmlFor="Mobile">Mobile</Label>
            <Input id="Mobile" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div> 
          <div className="space-y-0.4">
            <Label htmlFor="WorkPhone">Work</Label>
            <Input id="WorkPhone" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4">
            <Label htmlFor="WorkExtension">Work EXTN</Label>
            <Input id="WorkExtension" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4">
            <Label htmlFor="OtherPhone">Other</Label>
            <Input id="OtherPhone" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div> 
          <div className="space-y-0.4 ">
            <Label htmlFor="OtherExtension"> Other EXTN</Label>
            <Input id="OtherExtension" type="text" className="border-b-black p-1 text-sm" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 col-span-2">
            <Label htmlFor="Fax">FAX</Label>
            <Input id="Fax" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
        </div>

        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="text-md">Address</DialogTitle>
          <Button className="bg-white text-gray-400   "><Copy></Copy>Same in Account Adress </Button>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-0.4">
            <Label htmlFor="AddressLine1">Address Line 1</Label>
            <Input id="AddressLine1" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 flex flex-col">
            <Label htmlFor="current">Country</Label>
            <SelectBar id="Country" onChange={handlerInputContactChange}/>
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="AddressLine2">Address Line 2</Label>
            <Input id="AddressLine2" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="ZipPostalCode">Zip/Postal Code</Label>
            <Input id="ZipPostalCode" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="City">City</Label>
            <Input id="City" type="text" className="border-b-black p-1 text-sm" onChange={handlerInputContactChange} />

            
          </div>
          <div className="space-y-0.4 ">
            <Label htmlFor="StateProvince">State/Province</Label>
            <Input id="StateProvince" type="text" className="border-b-black p-1 text-sm" onChange={handlerInputContactChange} />

            
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
        <Button variant="secondary" className="bg-white w-30 drop-shadow-md border-1 cursor-pointer text-xl" onClick={handlerContactSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


/**
 * TODO 
 * MAKE ROUTE FOR PRODUCT
 */
export function BtnModalAsset() {
  //set asset
  const [assets, setAssets] = useState([])
  //fetchDAta
  const fetchDataAssets = async () => {
    try {
      const response = await ApiCustomer.get("/api/asset-information")
      setAssets(response.data.data);
    }catch (error)  {
      console.error("Error fetching assets: ", error)
    }
  }
  //prevent infinite loop of calling fetchDataAssets
  useEffect(() => {
    fetchDataAssets();
  }, []); 

  //set search state
  const [searchAsset, setSearchAsset] = useState("");
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

  //handling save button
  const [newSearchedAsset, setNewSearchedAsset] = useState({
    SerialNumber: "",
    ProductName: "",
    ProductNumber: "",
    HWProfitCenter: "",
    ContactFirstName: "",
    ContactLastName: "",
  })

  const handleNewAssetChange = (e) => {
    setNewSearchedAsset({
      ...newSearchedAsset,
      [e.target.name]: e.target.value,
    })
  }

  //TODO : Post new Save Asset after created the serial number file
  return (
    <Dialog
      open={isOpen} onOpenChange={setIsOpen}
    >
    <DialogTrigger asChild>
      <Button variant="outline" className="bg-white mt-0.5" onClick={() => setIsOpen(true)}>
        New Asset
      </Button>
    </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] bg-white">
        <DialogHeader>
          <div className="flex justify-between">
            <DialogTitle className="text-xl">Asset Information</DialogTitle>
            <DialogTitle className="flex justify-end text-sm mt-2.5">
              Clear All
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogHeader>
          <DialogTitle className="text-md">Serial Number</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">  
          <Input className="border-2 border-black rounded-2xl w-55 text-md h-10" type="Search" onChange={handleSearchInputAssetsChange}></Input>
          <Button variant="outline" className="w-30 rounded-2xl h-10 border-blue-600 border-2">Search</Button>
          <div className="mt-2">
          <Checkbox id="terms" className="w-5 h-5 border-2 border-black"/>
            <label
              htmlFor="terms"
              className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
            >
              Not Available
            </label>
          </div>
            <SnInput></SnInput>
        </div>


        <Table className="table-fixed border-spacing-0 mx-auto">
          <TableHeader>
            <TableRow className="bg-blue-200">
              <TableHead className="text-black">Product Name</TableHead>
              <TableHead className="text-black">Product Number</TableHead>
              <TableHead className="text-black">HW Profit Center</TableHead>
              <TableHead className="text-black">Contact</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody >
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <TableRow key={asset?.AssetID}>
                <TableCell className="whitespace-break-spaces ">{asset?.product_information?.ProductName}</TableCell>
                <TableCell>{asset?.product_information?.ProductNumber}</TableCell>
                <TableCell>{asset?.HWPorfitCenter ? asset?.HWPorfitCenter : '-' }</TableCell>
                <TableCell>{asset?.contact_information !== null ? asset?.contact_information?.FirstName + ' ' + asset?.contact_information?.LastName : '-'   }</TableCell>
              </TableRow>
              ))
            ) : assets.length > 0 ? ( assets.map((asset) => (
              <TableRow key={asset?.AssetID}>
                <TableCell className="whitespace-break-spaces ">{asset?.product_information?.ProductName}</TableCell>
                <TableCell>{asset?.product_information?.ProductNumber}</TableCell>
                <TableCell>{asset?.HWPorfitCenter ? asset?.HWPorfitCenter : '-' }</TableCell>
                <TableCell>{asset?.contact_information !== null ? asset?.contact_information?.FirstName + ' ' + asset?.contact_information?.LastName : '-'   }</TableCell>
              </TableRow>
             )) ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center font-medium whitespace-break-spaces"
                  >
                    Data Belum Tersedia
                  </TableCell>
                </TableRow>
             )}
          </TableBody>
          </Table>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="w-20 border-2 border-blue-500" onClick={() => setIsOpen(false)}>Back</Button>
            <Button variant="outline" className="w-20 bg-blue-700 text-white">Save</Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}

export function AssetEdit ({ assetId, onUpdate }) {
  const [asset, setAsset] = useState(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [productName, setProductName] = useState("");
  const [productNumber, setProductNumber] = useState("");
  const [productLine, setProductLine] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchAsset = async () => {
    if (!assetId) return; // Cegah fetch jika assetId tidak ada
    try {
      const response = await ApiCustomer.get(`/api/asset-information/${assetId}`);
      const data = response.data.data;
      setAsset(data);
      setSerialNumber(data?.SerialNumber || "");
      setProductName(data?.ProductName || "");
      setProductNumber(data?.ProductNumber || "");
      setProductLine(data?.ProductLine || "");
    } catch (error) {
      console.error("Error fetching asset information:", error);
    }
  };

  useEffect(() => {
    if (assetId && isOpen) { 
      fetchAsset();
    }
  }, [assetId, isOpen]);

  // Reset state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setSerialNumber("");
      setProductName("");
      setProductNumber("");
      setProductLine("");
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!serialNumber || !productName || !productNumber) {
      alert("Serial Number, Product Name dan Product Number wajib diisi!");
      return;
    }

    try {
      await ApiCustomer.patch(`/api/asset-information/${assetId}`, {
        SerialNumber: serialNumber,
        ProductName: productName,
        ProductNumber: productNumber,
        ProductLine: productLine,
      });
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button  variant="outline" onClick={() => { setIsOpen(true); fetchAsset(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Asset Information</DialogTitle>
          <DialogDescription>
            Update the details of the asset. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="Serial Number*" />
          <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Name*" />
          <Input value={productNumber} onChange={(e) => setProductNumber(e.target.value)} placeholder="Product Number*" />
          <Input value={productLine} onChange={(e) => setProductLine(e.target.value)} placeholder="Product Line" />
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function AssetDelete ({ assetId }) {
  const handleDelete = async () => {
    try {
      await ApiCustomer.delete(`/api/asset-information/${assetId}`);
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-700">
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Asset</DialogTitle>
          <DialogDescription>
            Delete asset confirm. 
          </DialogDescription>
        </DialogHeader>
        <h1>Anda yakin ingin menghapus data ini?</h1>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function CompanyEdit({ siteAccountId, onUpdate }) {
  const [company, setCompany] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zipPostalCode, setZipPostalCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchCompany = async () => {
    if (!siteAccountId) return;
    try {
      const response = await ApiCustomer.get(`/api/site_account/${siteAccountId}`);
      const data = response.data.data;
      setCompany(data);
      setCompanyName(data?.Company || "");
      setEmail(data?.Email || "");
      setPrimaryPhone(data?.PrimaryPhone || "");
      setAddressLine1(data?.AddressLine1 || "");
      setAddressLine2(data?.AddressLine2 || "");
      setCity(data?.City || "");
      setStateProvince(data?.StateProvince || "");
      setCountry(data?.Country || "");
      setZipPostalCode(data?.ZipPostalCode || "");
    } catch (error) {
      console.error("Error fetching company information:", error);
    }
  };

  useEffect(() => {
    if (siteAccountId && isOpen) {
      fetchCompany();
    }
  }, [siteAccountId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCompanyName("");
      setEmail("");
      setPrimaryPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setStateProvince("");
      setCountry("");
      setZipPostalCode("");
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!companyName || !email || !primaryPhone || !addressLine1 || !city || !country || !zipPostalCode) {
      alert("Fields marked with * are required!");
      return;
    }

    try {
      await ApiCustomer.patch(`/api/site_account/${siteAccountId}`, {
        Company: companyName,
        Email: email,
        PrimaryPhone: primaryPhone,
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        City: city,
        StateProvince: stateProvince,
        Country: country,
        ZipPostalCode: zipPostalCode,
      });
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchCompany(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company Information</DialogTitle>
          <DialogDescription>
            Update the details of the company. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name *" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" />
          <Input value={primaryPhone} onChange={(e) => setPrimaryPhone(e.target.value)} placeholder="Primary Phone *" />
          <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address Line 1 *" />
          <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address Line 2" />
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" />
          <Input value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} placeholder="State/Province" />
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country *" />
          <Input value={zipPostalCode} onChange={(e) => setZipPostalCode(e.target.value)} placeholder="Zip/Postal Code *" />
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CompanyDelete ({ siteAccountId, isModalOpen, setIsModalOpen, onUpdate }) {
    //set modal
  const handleDelete = async () => {
    try {
      const response = await ApiCustomer.delete(`/api/site_account/${siteAccountId}`);
      
      console.log("Server Response:", response.data);
      if (response.status === 409 || response.data.success === false) {
        // 🚨 Restriction triggered - Show alert message
        alert(response.data.message || "Cannot delete this company due to restrictions.");
        return;
      }
      
      alert("Site Account deleted successfully! ✅");
      // ✅ Close the modal if it's open
      setIsModalOpen(false);
      // ✅ Refresh the table by calling `onUpdate()`
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // 🚨 Handle 409 Conflict error from backend
        alert(error.response.data.message || "Cannot delete! This company has related Contacts or Assets.");
      } else {
        alert("Failed to delete site account. Please try again.");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-700">
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Asset</DialogTitle>
          <DialogDescription>
            Delete asset confirm. 
          </DialogDescription>
        </DialogHeader>
        <h1>Anda yakin ingin menghapus data ini?</h1>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [isOpen, setIsOpen] = useState(false);

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
      setCountry(data?.Country || "");
      setZipPostalCode(data?.ZipPostalCode || "");
    } catch (error) {
      console.error("Error fetching contact information:", error);
    }
  };

  useEffect(() => {
    if (contactID && isOpen) {
      fetchContact();
    }
  }, [contactID, isOpen]);

  const handleUpdate = async () => {
    if (!firstName || !lastName || !email || !phone || !city || !country) {
      alert("Fields marked with * are required!");
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
      });
      onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => { setIsOpen(true); fetchContact(); }}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact Information</DialogTitle>
          <DialogDescription>
            Update the details of the contact. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={salutation} onChange={(e) => setSalutation(e.target.value)} placeholder="Salutation" />
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name *" />
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name *" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" />
          <Input value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} placeholder="Preferred Language" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone *" />
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile" />
          <Input value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} placeholder="Work Phone" />
          <Input value={workExtension} onChange={(e) => setWorkExtension(e.target.value)} placeholder="Work Extension" />
          <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address Line 1" />
          <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address Line 2" />
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" />
          <Input value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} placeholder="State/Province" />
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country *" />
          <Input value={zipPostalCode} onChange={(e) => setZipPostalCode(e.target.value)} placeholder="Zip/Postal Code *" />
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
    try {
      await ApiCustomer.delete(`/api/contact-information/${contactID}`);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-700">
          <Trash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Asset</DialogTitle>
          <DialogDescription>
            Delete asset confirm. 
          </DialogDescription>
        </DialogHeader>
        <h1>Anda yakin ingin menghapus data ini?</h1>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
