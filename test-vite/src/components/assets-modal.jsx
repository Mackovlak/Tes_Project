import { Copy } from "lucide-react";

import React, { useState, useEffect, use } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Search } from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

const contacts = [
  {
    ContactID: "INV001",
    SiteAccountID: "Paid",
    Salution: "$250.00",
    Name: "Credit Card",
    Email: "Pakrt556@gmail.com",
    PreferredLanguage: "Indonesia",
    Phone: "089677544227",
    Mobile: "089677544227",
    WorkPhone: "2498910048",
    AddressLine: "Jakarta",
    City: "DKI Jakarta",
    StateProvince: "Jakarta",
    Country: "Indonesia",
    ZipPostalCode: "08972",
  },
]

//importing API
import ApiCustomer from "@/api";

export function DialogCloseButton({
  isModalAssetOpen,
  setIsModalAssetOpen,
  search,
  setSearch,
  onSelectAsset,
}) {
  // console.log(isModalAssetOpen);

  // create search state
  const [searchAsset, setSearchAsset] = useState("");
  const [searchedAssets, setSearchedAssets] = useState([]);

  //creating Asset Data
  const [assets, setAssets] = useState([]);
  const [contacts, setContacts] = useState([]);

  //set asset selected data
  const [selectedAsset, setSelectedAsset] = useState(null);
  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset); 
    console.log("Selected asset in modal:", asset);
  };

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onSelectAsset(selectedAsset)
      setIsModalAssetOpen(false);
    }
  };
  
  //run hook useEffect
  useEffect(() => {
    //call method
    const fetchDataAssets = async () => {
      try {
        const response = await ApiCustomer.get("/api/asset-information");
        setAssets(response.data.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };
    fetchDataAssets();
  }, []);
  
  //filter item
  
  const filteredAssets = search.SerialNumber ? assets.filter(
    (asset) =>
      asset.SerialNumber?.toLowerCase().includes(search?.SerialNumber?.toLowerCase()) ||
    asset.ProductName?.toLowerCase().includes(search?.SerialNumber?.toLowerCase())
  ) : [];
  const filteredSearchAssets = searchAsset !== "" ? assets.filter(
    (asset) =>
      asset.SerialNumber?.toLowerCase().includes(searchAsset.toLowerCase()) ||
    asset.ProductName?.toLowerCase().includes(searchAsset.toLowerCase())
  ) : [];
 
  
  return (
    <Dialog open={isModalAssetOpen} onOpenChange={setIsModalAssetOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
          }}
        >
          Assets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl gap-y-10 shadow-white">
        <DialogHeader>
          <DialogTitle className="mb-5">Assets</DialogTitle>
          <DialogDescription className="text-black  gap-1">
            <span className="flex items-center w-[20em]  gap-2 relative">
              Search Assets
              <Search className="absolute right-1" />
              <Input
                className=" flex-1 ring-2 border-0 rounded-2xl pr-10"
                value={searchAsset}
                onChange={(e) => setSearchAsset(e.target.value)}
              />
            </span>
          </DialogDescription>
        </DialogHeader>

        <Table className="table-fixed border-spacing-0 mx-auto">
          <TableHeader>
            <TableRow className="text-xl bg-blue-200">
              {/* <TableHead></TableHead> */}
              <TableHead>Assets</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Product No</TableHead>
              <TableHead>Product Line</TableHead>
              <TableHead>Site Account ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSearchAssets.length > 0 ? (
              filteredSearchAssets.map((asset) => (
                <TableRow 
                  key={asset.AssetID}
                  onClick={()=>handleSelectAsset(asset)}
                  className={`cursor-pointer hover:bg-gray-200 ${selectedAsset?.AssetID === asset.AssetID ? "bg-blue-300" : ""}`}
                >
                  {/* <TableCell></TableCell> */}
                  <TableCell className="font-medium whitespace-break-spaces">
                    
                    {asset.ProductName}
                  </TableCell>
                  <TableCell>{asset.SerialNumber}</TableCell>
                  <TableCell>{asset.ProductNumber}</TableCell>
                  <TableCell>{asset.ProductLine}</TableCell>
                  <TableCell className="text-right">
                    {asset.site_account?.Company}
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <TableRow 
                  key={asset.AssetID}
                  className={`cursor-pointer hover:bg-gray-200 ${selectedAsset?.AssetID === asset.AssetID ? "bg-blue-300" : ""}`}
                  onClick={()=>handleSelectAsset(asset)}
                >
                    
                  <TableCell className="font-medium whitespace-break-spaces">
                    
                    {asset.ProductName}
                  </TableCell>
                  <TableCell>{asset.SerialNumber}</TableCell>
                  <TableCell>{asset.ProductNumber}</TableCell>
                  <TableCell>{asset.ProductLine}</TableCell>
                  <TableCell className="text-right">
                    {asset.site_account?.Company}
                  </TableCell>
                </TableRow>
              ))
            ) : assets.length > 0 ? (
              assets.map((asset) => (
                <TableRow 
                  key={asset.AssetID}
                  className={`cursor-pointer hover:bg-gray-200 ${selectedAsset?.AssetID === asset.AssetID ? "bg-blue-300" : ""}`}
                  onClick={()=>handleSelectAsset(asset)}
                >
                  <TableCell>
                  <input type="checkbox"/>
                  </TableCell>
                  <TableCell className="font-medium whitespace-break-spaces">
                    {asset.ProductName}
                  </TableCell>
                  <TableCell>{asset.SerialNumber}</TableCell>
                  <TableCell>{asset.ProductNumber}</TableCell>
                  <TableCell>{asset.ProductLine}</TableCell>
                  <TableCell className="text-right">
                    {asset.site_account?.Company}
                  </TableCell>
                </TableRow>
              ))
            ) : (
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
        <DialogFooter className="sm:justify-end">
          <Button 
            type="button" 
            variant="secondary"
            onClick={handleConfirmSelection}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DialogCompanyBtn({ 
    isModalCompanyOpen,
    setIsModalCompanyOpen,
    search,
    setSearch,
    onSelectCompany
  }) {
  //set State Company
  const [siteAccounts, setSiteAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSiteAccounts, setSelectedSiteAccounts] = useState(null)

  //fetch data
  useEffect(() => {
    const fetchDataSiteAccounts = async () => {
        try{
          const response = await ApiCustomer.get("/api/site_account")
          setSiteAccounts(response.data.data);
        }catch (err) {
          console.error("error fetching ",err)
        }
      }
      fetchDataSiteAccounts();
    }, [])

    useEffect(() => {
      console.log("Updated search state:", search);
    }, [search]); // Logs every time `search` changes
    
    //filter based on search in search_case
    //TODO : WHY TF THE FILTEREDSITEACCOUNT GIVE ALL MF DATA, FUCK
    const [filteredSiteAccount, setFilteredSiteAccount] = useState([]);
    useEffect(() => {
      if (search.Company?.trim()) {
        setFilteredSiteAccount(
          siteAccounts.filter((company) =>
            company.Company?.toLowerCase().trim() === search.Company.toLowerCase().trim()
          )
        );
      } else {
        setFilteredSiteAccount([]); // Reset when search is empty
      }
    }, [search.Company, siteAccounts]);
    useEffect(() => {
      console.log("Updated search state:", search);
      console.log("search.Company:", search.Company);
    }, [search]); // Logs every time `search` changes

    //filter based on search in modal
    const filteredSiteAccountSearched = searchQuery !== "" ? siteAccounts.filter((company) =>
      company.Company?.toLowerCase().includes(searchQuery.toLowerCase())
    ): [];

    console.log(filteredSiteAccount)
    

    //handle selection
    const handleSelectSiteAccount = (company) => {
      setSelectedSiteAccounts(company)
      // onSelectCompany(company)
    }

    //handle confirm 
    const handleConfirmSelection = () => {
      if(selectedSiteAccounts){
        onSelectCompany(selectedSiteAccounts)
        setIsModalCompanyOpen(false);
        // Reset search AFTER selection is confirmed
        setTimeout(() => {
          setSearch({
            Email: "",
            SerialNumber: "",
            Country: "",
            Company: "",
            ZipPostalCode: "",
            City: "",
            Phone: "",
            AssetTag: "",
            ContractID: "",
            TransactionType: "",
            TransactionID: "",
            Opsi: "",
            LicenseKey: "",
            PIN: ""
          });
        }, 300);
        // console.log("Company Selected:", selectedSiteAccounts);
      }
    }
    useEffect(() => {
      console.log("Company Selected (Updated):", selectedSiteAccounts);
    }, [selectedSiteAccounts]); // Runs when `selectedSiteAccounts` updates
  return (
    <Dialog open={isModalCompanyOpen} onOpenChange={setIsModalCompanyOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Companny</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl gap-y-10 shadow-white">
        <DialogHeader>
          <DialogTitle className="mb-5">Companny</DialogTitle>
          <DialogDescription className="text-black  gap-1">
            <span className="flex items-center w-[20em]  gap-2 relative">Search Account
            <Search className="absolute right-1"/>
            <Input className=" flex-1 ring-2 border-0 rounded-2xl pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            /></span>
          </DialogDescription>
        </DialogHeader>
        
        <Table className="table-fixed border-spacing-0 mx-auto">
            <TableHeader>
                <TableRow className="text-md bg-blue-200">
                    <TableHead>Account Name</TableHead>
                    <TableHead>Address Line 1</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Province</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Zip</TableHead>
                    <TableHead>Opsi</TableHead>
                    <TableHead>Source</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredSiteAccountSearched.length > 0 ? (
                  filteredSiteAccountSearched.map((company) =>(
                    <TableRow
                      key={company.SiteAccountID}
                      onClick={() => handleSelectSiteAccount(company)}
                      className={`cursor-pointer hover:bg-gray-200 ${
                        selectedSiteAccounts?.SiteAccountID === company.SiteAccountID
                          ? "bg-blue-300"
                          : ""
                      }`}
                    >
                      <TableCell>{company.Company}</TableCell>
                      <TableCell>{company.AddressLine1}</TableCell>
                      <TableCell>{company.City}</TableCell>
                      <TableCell>{company.StateProvince}</TableCell>
                      <TableCell>{company.Country}</TableCell>
                      <TableCell>{company.ZipPostalCode}</TableCell>
                      <TableCell>{company.Source || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : filteredSiteAccount.length > 0 ? (
                  filteredSiteAccount.map((company) => (
                    <TableRow
                      key={company.SiteAccountID}
                      onClick={() => handleSelectSiteAccount(company)}
                      className={`cursor-pointer hover:bg-gray-200 ${
                        selectedSiteAccounts?.SiteAccountID === company.SiteAccountID
                          ? "bg-blue-300"
                          : ""
                      }`}
                    >
                      <TableCell>{company.Company}</TableCell>
                      <TableCell>{company.AddressLine1}</TableCell>
                      <TableCell>{company.City}</TableCell>
                      <TableCell>{company.StateProvince}</TableCell>
                      <TableCell>{company.Country}</TableCell>
                      <TableCell>{company.ZipPostalCode}</TableCell>
                      <TableCell>{company.Source || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : siteAccounts.length > 0 ? (
                  siteAccounts.map((company) => (
                    <TableRow
                      key={company.SiteAccountID}
                      onClick={() => handleSelectSiteAccount(company)}
                      className={`cursor-pointer hover:bg-gray-200 ${
                        selectedSiteAccounts?.SiteAccountID === company.SiteAccountID
                          ? "bg-blue-300"
                          : ""
                      }`}
                    >
                      <TableCell>{company.Company}</TableCell>
                      <TableCell>{company.AddressLine1}</TableCell>
                      <TableCell>{company.City}</TableCell>
                      <TableCell>{company.StateProvince}</TableCell>
                      <TableCell>{company.Country}</TableCell>
                      <TableCell>{company.ZipPostalCode}</TableCell>
                      <TableCell>{company.Source || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No Companies Found
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
        </Table>
        <DialogFooter className="sm:justify-end">
        <Button onClick={handleConfirmSelection}>Select</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DialogContactBtn() {
  return (
    <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Contact</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-4xl gap-y-10 shadow-white">
      <DialogHeader>
          <DialogTitle className="mb-5">Contact</DialogTitle>
          <DialogDescription className="text-black  gap-1">
            <span className="flex items-center w-[20em]  gap-2 relative">Search Contact
            <Search className="absolute right-1"/>
            <Input className=" flex-1 ring-2 border-0 rounded-2xl pr-10"
            /></span>
          </DialogDescription>
        </DialogHeader>

        <Table className="table-fixed border-spacing-0 mx-auto">
            <TableHeader className="flex">
                <TableRow className="text-md bg-blue-200">
                    <TableHead>ContactID</TableHead>
                    <TableHead>SiteAccountID</TableHead>
                    <TableHead>Salution</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>PreferredLanguage</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>WorkPhone</TableHead>
                    <TableHead>AddressLine</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>StateProvince</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>ZipPostalCode</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="flex">
            {contacts.map((contact) => (
              <TableRow key={contact. ContactID}>
                <TableCell className="font-medium">{contact.ContactID}</TableCell>
                <TableCell>{contact.SiteAccountID}</TableCell>
                <TableCell>{contact.Salution}</TableCell>
                <TableCell>{contact.Name}</TableCell>
                <TableCell>{contact.Email}</TableCell>
                <TableCell>{contact.PreferredLanguage}</TableCell>
                <TableCell>{contact.Phone}</TableCell>
                <TableCell>{contact.Mobile}</TableCell>
                <TableCell>{contact.WorkPhone}</TableCell>
                <TableCell>{contact.AddressLine}</TableCell>
                <TableCell>{contact.City}</TableCell>
                <TableCell>{contact.StateProvince}</TableCell>
                <TableCell>{contact.Country}</TableCell>
                <TableCell>{contact.ZipPostalCode}</TableCell>
              </TableRow>
             ))}   
            </TableBody>
        </Table>
    </DialogContent>
  </Dialog>
  )
}