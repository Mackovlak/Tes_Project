import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BtnModalContact } from "./sc-modal";
import { BtnModalAsset } from "./sc-modal";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { ContactRound, User,Search, Laptop } from "lucide-react";


import ApiCustomer from "@/api";





export function TableCompany({ 
  selectedAsset = [],
  selectedCompany = [],
  selectedContact = [],
  setSelectedAsset,
  setSelectedSiteAccounts,
  setSelectedContact,

  selectedAssetForCase,
  setSelectedAssetForCase,
  selectedContactForCase,
  setSelectedContactForCase,
  selectedCompanyForCase,
  setSelectedCompanyForCase,
  handleCreateCase,
  handleSelectedAssetForCaseRelated
}) {

  
  useEffect(() => {
    console.log("Updated selectedContact 123:", selectedContact);
  }, [selectedContact]); // ✅ Logs the updated value when `selectedAsset` changes

  const [checkedCompanies, setCheckedCompanies] = useState({});
  const [relatedData, setRelatedData] = useState({}); // Stores related contacts/assets
  /// Check if both `selectedAsset` and `selectedCompany` are empty
  const ifEmptyQuerySearch =
  (!selectedAsset || selectedAsset.length === 0) &&
  (!selectedCompany || Object.keys(selectedCompany).length === 0);


  if (ifEmptyQuerySearch) return <p>No Record Found</p>;


  // console.log("Received asset in TableCompany:", selectedAsset);

  //refactor any Data to Arry for accepting table
  const companyData = selectedCompany || selectedAsset?.site_account || null;
  console.log("Selected Asset : ", selectedAsset)

  const companies = companyData ? [
    {
      key: companyData.SiteAccountID,
      company: companyData.Company,
    },
    {
      text: `${companyData.AddressLine1} ${companyData.City} ${companyData.StateProvince} ${companyData.Country}-${companyData.ZipPostalCode} | Email: ${companyData.Email} | Phone : ${companyData.PrimaryPhone}`,
    },
  ] : null;


  //contacts
    const contacts = selectedContact 
    ? (Array.isArray(selectedContact) 
        ? selectedContact 
        : [selectedContact]) // ✅ Wrap object in an array if necessary
    .map((contact) => ({
        ContactID: contact.ContactID,
        FirstName: contact.FirstName,
        LastName: contact.LastName,
        Email: contact.Email,
        Phone: contact.Phone || contact.Mobile,
        Country: contact.Country,
        source: "CRM",
        hpID: "526291",
      }))
    : [];


  console.log("Final contact in TableCompany:", selectedContact); // ✅ Debugging log
  

  //asset
  // const assets = Array.isArray(selectedAsset) ? selectedAsset : [];
  const assets = Array.isArray(selectedAsset) && selectedAsset.length > 0 
  ? selectedAsset.map((asset) => ({
      AssetID: asset.AssetID,
      SerialNumber: asset.SerialNumber,
      ProductName: asset.product_information?.ProductName,
      ProductNumber: asset.ProductNumber,
      ProductLine: asset.product_information?.ProductLine,
      isparent: "-",
      parentasset: "-",
      source: "CRM",
    }))
  : [];



  
  // const [se, setSelectedAsset] = useState([]);

  //handle checkbox
  const handleCheckBoxCompanyChange = async (company, newCheckedState) => {

    setCheckedCompanies((prevChecked) => ({
      ...prevChecked,
      [company.key]: newCheckedState,
    }));
  
    if (newCheckedState) {
      try {
        const response = await ApiCustomer(`/api/site_account/check-company-affiliations?siteAccountId=${company.key}`);
        const result = response.data; // ✅ Ensure correct data extraction
  
        if (result.success) {
          setRelatedData((prev) => ({
            ...prev,
            [company.key]: result.data,
          }));
  
          // ✅ Ensure correct state updates
          if (result.data.assets.length > 0) {
            console.log("Fetched assets:", result.data.assets);
            setSelectedAsset(result.data.assets);
          } else {
            setSelectedAsset([]);
          }
  
          if (result.data.contacts.length > 0) {
            setSelectedContact(result.data.contacts);
          } else {
            setSelectedContact([]);
          }
  
          console.log(`Company ${company.company} has contact:`, result.data.contacts.length > 0);
          console.log(result.data.contacts);
        }
      } catch (err) {
        console.error("Error fetching company affiliations:", err);
      }
    } else {
      setSelectedAsset([]);
      setSelectedContact([]);

    }
  }

  
  // useEffect(() => {
  //   if (companies) {
  //      // ✅ Update company when it exists
  //   }
  // }, [companies]); // ✅ Run only when `companies` updates
  
  console.log("selectedAsset:", selectedAsset);
  console.log("selectedCompany:", selectedCompany);
  console.log("selectedContact:", selectedContact);


  


  return (
    // Company
      <Card className="m-0 p-0 gap-0">
        <CardHeader className="bg-blue-400 p-3 rounded-t-lg">
          <span className="flex items-center gap-2 text-xl">
            <Checkbox 
              className="border-black border-3 w-7.5 h-7 "
              checked={checkedCompanies[companies?.[0]?.key] ?? false}
              onCheckedChange={(checked) => handleCheckBoxCompanyChange(companies[0], checked)}
            ></Checkbox>
            { companies !== null ? companies[0].company : "" }
          </span>
        </CardHeader>
        <CardContent className=" p-3">
        { companies !== null ? (
          <div className="text-gray-500"key={selectedAsset?.SerialNumber}>
              <p>{companies[1].text}</p>
          </div>
          
        ) : (
          <div className="text-gray-500"key={selectedAsset?.SerialNumber}>
              <p>No Company Available</p>
          </div>
        )}
        </CardContent>

        {/* Contact */}
        <CardFooter className="p-0 flex flex-col">
            <div className=" bg-blue-200 p-3 text-black font-bold text-xl flex w-full justify-between  ">
              <div className="flex items-center gap-2">
                <User></User>
                Contact
                <span className="relative flex items-center">
                  <Search className="absolute right-1"/><Input className="bg-white ring-2 border-0 rounded-2xl pr-10"/>
                </span>
              </div>
              <BtnModalContact 
                className="" 
                selectedCompany={selectedCompany} 
                selectedContact={selectedContact}
                setSelectedContact={setSelectedContact}
              />
              </div>
          <Table> 
            <TableHeader className="bg-gray-400">
              <TableRow>
                <TableHead className=" text-black font-bold">First Name</TableHead>
                <TableHead className=" text-black font-bold">Last Name</TableHead>
                <TableHead className=" text-black font-bold">Email</TableHead>
                <TableHead className=" text-black font-bold">Phone</TableHead>
                <TableHead className=" text-black font-bold">Country</TableHead>
                <TableHead className=" text-black font-bold">Source</TableHead>
                <TableHead className=" text-black font-bold">HP ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length > 0 ? contacts.map((contact) => (
                <TableRow key={contact.ContactID}
                onClick={() => setSelectedContact(contact)}
                className={`cursor-pointer hover:bg-gray-200 ${selectedContact?.ContactID === contact.ContactID ? "bg-blue-300" : ""}`}>
                  <TableCell>{contact.FirstName}</TableCell>
                  <TableCell>{contact.LastName}</TableCell>
                  <TableCell>{contact.Email}</TableCell>
                  <TableCell>{contact.Phone}</TableCell>
                  <TableCell>{contact.Country}</TableCell>
                  <TableCell>{contact.source}</TableCell>
                  <TableCell>{contact.hpID}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7}>No Contact Available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Asset */}
            <div className=" bg-blue-200 p-3 text-black font-bold text-xl flex w-full justify-between">
              <div className="flex items-center gap-2">
                <Laptop></Laptop>
                Assets
                <span className="relative flex items-center">
                  <Search className="absolute right-1"/><Input className="bg-white ring-2 border-0 rounded-2xl pr-10"/>
                </span>
              </div>
              <BtnModalAsset contactID={selectedContact.ContactID}/>
              </div>
          <Table> 
            <TableHeader className="bg-gray-400 text-black font-bold">
              <TableRow>
                <TableHead className=" text-black font-bold">Product Name</TableHead>
                <TableHead className=" text-black font-bold">Product #</TableHead>
                <TableHead className=" text-black font-bold">Serial Number</TableHead>
                <TableHead className=" text-black font-bold">Product Line</TableHead>
                <TableHead className=" text-black font-bold">Is Parent</TableHead>
                <TableHead className=" text-black font-bold">Parent Asset</TableHead>
                <TableHead className=" text-black font-bold">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {assets.length > 0 ? assets.map((asset) => (
                  <TableRow 
                    key={asset.AssetID}
                    onClick={() => handleSelectedAssetForCaseRelated(asset)} // ✅ Set selected asset
                    className={`cursor-pointer hover:bg-gray-200 ${
                      selectedAssetForCase?.AssetID === asset.AssetID ? "bg-blue-300" : ""
                    }`}
                  >
                    <TableCell>{asset.ProductName}</TableCell>
                    <TableCell>{asset.ProductNumber}</TableCell>
                    <TableCell>{asset.SerialNumber}</TableCell>
                    <TableCell>{asset.ProductLine}</TableCell>
                    <TableCell>{asset.isparent}</TableCell>
                    <TableCell>{asset.parentasset}</TableCell>
                    <TableCell>{asset.source}</TableCell>
                  </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7}>No Assets Available</TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardFooter>
      </Card>
    
  );
}

export function TableContact({ selectedAsset = [] }) {
  // console.log("Received asset in TableCompany:", selectedAsset);
  const contacts = selectedAsset?.contact_information ? [
    {
      contactID: selectedAsset?.contact_information?.ContactID,
      firstname: selectedAsset?.contact_information?.FirstName,
      lastname: selectedAsset?.contact_information?.LastName,
      email: selectedAsset?.contact_information?.Email,
      phone: selectedAsset?.contact_information?.Phone || selectedAsset?.contact_information?.Mobile,
      country: selectedAsset?.contact_information?.Country ,
      source: "CRM",
      hpID: "526291",
    },
  ] : null;
  return (
    <div className="">
    </div>
  );
}

export function TableAsset({ selectedAsset }) {
  const assets = selectedAsset ? [
    {
      assetID : selectedAsset.AssetID,
      serialNumber : selectedAsset.SerialNumber,
      productName : selectedAsset.product_information?.ProductName,
      productNumber : selectedAsset.ProductNumber,
      productLine : selectedAsset.product_information?.ProductLine,
      // TODO : Search what tf is this mean
      isparent: "-",
      parentasset: "-",
      source: "CRM",
    },
  ] : null;
  return (
    <div className="">
    </div>
  );
}