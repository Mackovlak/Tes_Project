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
    // handleSelectedAssetForCaseRelated

    searchByEmailPhoneForGlobalSearch,
    setSearchByEmailPhoneForGlobalSearch,
    assetBasedOnContactsSearch,
    contactsBasedOnContactsSearch,
    companyBasedOnContactsSearch
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


  if (ifEmptyQuerySearch && searchByEmailPhoneForGlobalSearch !== true) return <p>No Record Found</p>;


  // console.log("Received asset in TableCompany:", selectedAsset);

  //modify any setSelected type for searchByEmailPhoneForGlobalSearch


  //refactor any Data to Arry for accepting table
  // const companyData = selectedCompany || selectedAsset?.site_account || [];
  
  console.log("Final company in TableCompany:", companyBasedOnContactsSearch); // ✅ Debugging log
  const companyData = Array.isArray(selectedCompany) && selectedCompany.length > 0
  ? selectedCompany[0] // Take the first company from array
  : selectedCompany && Object.keys(selectedCompany).length > 0
  ? selectedCompany
  : selectedAsset?.site_account && Object.keys(selectedAsset.site_account).length > 0
  ? selectedAsset.site_account
  : Array.isArray(companyBasedOnContactsSearch) && companyBasedOnContactsSearch.length > 0
  ? companyBasedOnContactsSearch[0] // Take the first company from array
  : null;


  console.log("Selected Asset : ", selectedAsset)

  // const companies = companyData ? [
  //   {
  //     key: companyData.SiteAccountID,
  //     company: companyData.Company,
  //   },
  //   {
  //     text: `${companyData.AddressLine1} ${companyData.City} ${companyData.StateProvince} ${companyData.Country}-${companyData.ZipPostalCode} | Email: ${companyData.Email} | Phone : ${companyData.PrimaryPhone}`,
  //   },
  // ] : [];


  //contacts
    const contacts = selectedContact 
    ? (Array.isArray(selectedContact) 
        ? selectedContact 
        : [selectedContact]) // ✅ Wrap object in an array if necessary
    .map((contact) => ({
        ContactID: contact.ContactID,
        SiteAccountID: contact.SiteAccountID,
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
  console.log("Final contact in TableCompany:", contactsBasedOnContactsSearch); // ✅ Debugging log
  
  // const contactData = contacts.length > 0 ? contacts[0] : contactsBasedOnContactsSearch.length > 0 ? contactsBasedOnContactsSearch : [];
  const contactData = Array.isArray(contacts) && contacts.length > 0
  ? contacts
  : Array.isArray(contactsBasedOnContactsSearch) && contactsBasedOnContactsSearch.length > 0
  ? contactsBasedOnContactsSearch
  : [];

  // Create the companies array (use contact as a fallback)
  // const companies = companyData ? [
  //   {
  //     key: companyData.SiteAccountID,
  //     company: companyData.Company,
  //   },
  //   {
  //     text: `${companyData.AddressLine1} ${companyData.City} ${companyData.StateProvince} ${companyData.Country}-${companyData.ZipPostalCode} | Email: ${companyData.Email} | Phone: ${companyData.PrimaryPhone}`,
  //   },
  // ] : contactData ? [
  //   {
  //     key: contactData.ContactID,  // Use ContactID as key when no company
  //     company: `${contactData.FirstName} ${contactData.LastName} (Contact)`, // Placeholder with Contact Name
  //   },
  //   {
  //     text: `Email: ${contactData.Email} | Phone: ${contactData.Phone} | Country: ${contactData.Country}`,
  //   },
  // ] : []; // Empty if no company and no contacts
  // const companies = companyData && Object.keys(companyData).length > 0 
  // ? [{
  //     key: companyData.SiteAccountID,
  //     company: companyData.Company,
  //     text: `${companyData.AddressLine1} ${companyData.City} ${companyData.StateProvince} ${companyData.Country}-${companyData.ZipPostalCode} | Email: ${companyData.Email} | Phone: ${companyData.PrimaryPhone}`,
  //   }]
  // : Array.isArray(contactData) && contactData.length > 0
  // ? contactData.map(contact => ({
  //     key: contact.ContactID,
  //     company: `${contact.FirstName} ${contact.LastName} (Contact)`,
  //     text: `Email: ${contact.Email} | Phone: ${contact.Phone} | Country: ${contact.Country}`,
  //   }))
  // : [];
  const companies = []
  if (companyData && Object.keys(companyData).length > 0) {
    companies.push({
      key: companyData.SiteAccountID,
      company: companyData.Company,
      type: 'siteAccount',
      text: `${companyData.AddressLine1} ${companyData.City} ${companyData.StateProvince} ${companyData.Country}-${companyData.ZipPostalCode} | Email: ${companyData.Email} | Phone: ${companyData.PrimaryPhone}`,
    });
  }
  
  if (Array.isArray(contactData) && contactData.length > 0) {
    contactData.forEach(contact => {
      const isRelatedToCompany = companyData && contact.SiteAccountID === companyData.SiteAccountID;

      if (isRelatedToCompany) {
        // If contact is related to the displayed company, mark it but do not push separately
        companies.forEach(cmp => {
          if (cmp.key === contact.SiteAccountID) {
            cmp.type = "individualAndCompany"; // Mark as having a related contact
          }
        })
      } else {
        // If the contact is NOT related to the displayed company, push it separately
        companies.push({
          key: contact.ContactID,
          company: `${contact.FirstName} ${contact.LastName} (Contact)`,
          type: 'individual', // Standalone contact
          text: `Email: ${contact.Email} | Phone: ${contact.Phone} | Country: ${contact.Country}`,
        });
      }
    })
    // companies.push(...contactData.map(contact => ({
    //   key: contact.ContactID,
    //   company: `${contact.FirstName} ${contact.LastName} (Contact)`,
    //   type: 'contacts',
    //   text: `Email: ${contact.Email} | Phone: ${contact.Phone} | Country: ${contact.Country}`,
    // })));
  }
  console.log("Company Data : ",companyData)
  console.log("Contact Data : ",contactData)
  console.log("Total Companies Checkbox Data : ",companies)


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
      ContactID: asset.ContactID,
      SiteAccountID: asset.SiteAccountID,
    }))
  : [];



  
  // const [se, setSelectedAsset] = useState([]);

  //handle checkbox
  const handleCheckBoxCompanyChange = async (company, newCheckedState) => {

    setCheckedCompanies((prevChecked) => ({
      ...prevChecked,
      [company.key]: newCheckedState,
    }));
    
    console.log("company variable checked : ",checkedCompanies)
    if (newCheckedState) {
      try {
        //check the type of search checked
        // console.log("Type after checked company",company.type)
        // console.log("Key after checked company",company.key)
        let response = [];
        if(company.type == 'individual'){
          response = await ApiCustomer(`/api/contact-information/check-contacts-affiliation?contactID=${company.key}`);
        }else{
          response = await ApiCustomer(`/api/site_account/check-company-affiliations?siteAccountId=${company.key}`);
        }
        const result = response.data; // ✅ Ensure correct data extraction
  
        if (result.success) {
          setRelatedData((prev) => ({
            ...prev,
            [company.key]: result.data,
          }));
  
          // ✅ Ensure correct state updates
          console.log("Fetched Checking:", result.data);
          if (result.data.assets.length > 0) {
            setSelectedAsset(result.data.assets);
          } else {
            setSelectedAsset([]);
          }
  
          if (result.data.contacts.length > 0) {
            setSelectedContact(result.data.contacts);
          } else {
            setSelectedContact([]);
          }
          // if (result.data.company.length > 0) {
          //   setSelectedContact(result.data.company);
          // } else {
          //   setSelectedContact([]);
          // }
  
          console.log(`Company ${company.company} has contact:`, result.data.contacts.length > 0);
          // console.log(result.data.contacts);
        }
      } catch (err) {
        console.error("Error fetching company affiliations:", err);
      }
    } else {
      setSelectedAsset([]);
      setSelectedContact([]);

    }
  }
   const handleSelectedAssetForCaseRelated = async (asset) => {
    setSelectedAssetForCase(asset);
    console.log("Asset in Selected Asset For Case Related : ", asset);
    try{
      const response = await ApiCustomer(`/api/asset-information/${asset.AssetID}`)
      const assetRelated = response.data.data;
      console.log("Asset in ApiCustomer Asset For Case Related : ", assetRelated);
  
      if (assetRelated.contactID !== null) {
        setSelectedContact(assetRelated.contact_information); // 🔥 Auto-select related contact
        setSelectedContactForCase(assetRelated.contact_information ); // 🔥 Auto-select related contact
      }
    }catch (error){
      console.error("Error fetching asset details:", error);
    }
  
    // if (assetRelated.site_account !== null) {
    //   setSelectedSiteAccounts(assetRelated.site_account); // 🔥 Auto-select related company
    // }
  };

  
  // useEffect(() => {
  //   console.log("Checked Companies : ",checkedCompanies);
  // }, [checkedCompanies]); // ✅ Run only when `companies` updates
  
  console.log("selectedAsset:", selectedAsset);
  console.log("selectedCompany:", selectedCompany);
  console.log("selectedContact:", selectedContact);


  console.log("selectedContactForCase in BtnModalAsset:", selectedContactForCase);

  // Ensure checkbox is checked if a company or at least one contact exists
  
  const isChecked = checkedCompanies[companies?.[0]?.key] ?? (contacts.length > 0);
  //checkedCompanies[company.key] || false
  // const isChecked = checkedCompanies[company.key] ?? false;
  



  return (
    // Company
    <>
    { companies?.map((company, index) => (
      <Card key={index} className="m-0 p-0 gap-0">
        <CardHeader className="bg-blue-400 p-3 rounded-t-lg">
          <span className="flex items-center gap-2 text-xl">
            <Checkbox 
        
              className="border-black border-3 w-7.5 h-7 "
              checked={isChecked}
              onCheckedChange={(checked) => handleCheckBoxCompanyChange(company, checked)}
            ></Checkbox>
            { company !== null ? company.company : "" }
          </span>
        </CardHeader>
        <CardContent className=" p-3">
        { company !== null ? (
          <div className="text-gray-500"key={selectedAsset?.SerialNumber}>
              <p>{company.key}</p>
              <p>{company.text}</p>
              <p>Type : {company.type}</p>
          </div>
          
        ) : (
          <div className="text-gray-500"key={selectedAsset?.SerialNumber}>
              <p>No Company Available</p>
          </div>
        )}
        </CardContent>

        {(isChecked || selectedAsset.length !== 0)  && (
        <CardFooter className="p-0 flex flex-col">
          {/* Contact */}
            <div className={`bg-blue-200 p-3 text-black font-bold text-xl flex w-full justify-between ${company.type == 'individual' ? 'hidden' : ''}`}>
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
          <Table className={`${company.type == 'individual' ? 'hidden' : ''}`}> 
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
                onClick={() => {
                  setSelectedContact(contact)
                  setSelectedContactForCase(contact);
                }
              }
                className={`cursor-pointer hover:bg-gray-200 ${selectedContactForCase ?.ContactID === contact.ContactID ? "bg-blue-300" : "bg-white"}`}>
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
              <BtnModalAsset 
                typeSearch={company.type}
                contactID={selectedContact.ContactID || (company.type=='individual' ? company.key : null)}
                siteAccountID={selectedContact.SiteAccountID || (company.type=='individualAndCompany' || company.type == 'siteAccounts' ? company.key : null) }
                selectedContactForCase={selectedContactForCase}
                selectedCompany={companyData}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
              />
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
      )}
      </Card>
    ))}
      
    </>
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