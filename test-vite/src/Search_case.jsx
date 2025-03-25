import { React, useState, useEffect } from 'react'
import  { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { InfoSide } from './components/info-sidebar'
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from './components/ui/sidebar' 


//importing API
import ApiCustomer from './api'

import { Button } from "@/components/ui/button"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Eye,
  Frame,
  GalleryVerticalEnd,
  Home,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Plus,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { DialogCloseButton, DialogCompanyBtn, DialogContactBtn } from './components/assets-modal'
import { SelectBar } from './components/sc-select'
import { SelectBar1 } from './components/sc-select'
import { SelectBar2 } from './components/sc-select'
import { BtnModal, BtnModalContact, BtnModalAsset } from './components/sc-modal'
import { TableContact, TableCompany, TableAsset } from './components/sc-table'

const Search_case = () => {

  //create search state
  const [search, setSearch] = useState({
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

  
  //state modal
  const [isModalAssetOpen, setIsModalAssetOpen] = useState(false);
  const [isModalCompanyOpen, setIsModalCompanyOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState("search"); // Default active tab
  
  const handleSearchClick = () => {
    console.log("BeforeChange:", activeTab);
    console.log("Search Data:", search);
    console.log(search);
    // setIsModalAssetOpen(true); // Open modal
    if(search.SerialNumber !== ""){
      setIsModalAssetOpen(true);
      setActiveTab('ci'); // Switch tab to target
    }else if(search.Company !== ""){
      setIsModalCompanyOpen(true);
      setActiveTab('ci'); // Switch tab to target
    }
    
  };
  useEffect(() => {
    console.log("Updated Active Tab:", activeTab);
  }, [activeTab]); // This runs every time activeTab changes
  
  const handleInputChange = (e) =>{
    // if (search.trim() !== "") { 
      const { id, value } = e.target; // Get input field ID and value
      setSearch((prev) => ({
        ...prev,
        [id]: value, // Update the corresponding field
      }));
      console.log(`Updated searchData:`, search);
      // }
      // console.log(search)
      
    }
    
    //creating Asset Data
    const [assets, setAssets] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [siteAccounts, setSiteAccounts] = useState([]);
    
    
    //define method
    const fetchDataAssets = async () => {
      
      //fetch data from API with Axios
      await ApiCustomer.get('/api/asset-information')
      .then(response => {
        // console.log("Asset");
        // console.log(response.data.data)
        //assign response data to state "asset"
        setAssets(response.data.data);
      })
      
    }
    
        const fetchDataContacts = async () => {
          //fetch data from API with Axios
          await ApiCustomer.get('/api/contact-information')
          .then(response => {
            // console.log("Contact");
            // console.log(response.data.data)
            //assign response data to state "asset"
            setContacts(response.data.data);
          })
        }
        
        const fetchDataSiteAccounts = async () => {
          //fetch data from API with Axios
          await ApiCustomer.get('/api/site_account')
          .then(response => {
            // console.log("Site Account");
            // console.log(response.data.data)
            //assign response data to state "asset"
            setSiteAccounts(response.data.data);
          })
        }
        
  //run hook useEffect
  useEffect(() => {
    //call method
    fetchDataAssets();
    fetchDataContacts();
    fetchDataSiteAccounts();
  }, []);
  
  //resetData Search
  useEffect(() => {
    if (!isModalAssetOpen) {
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
    }
  }, [isModalAssetOpen]); // Runs whenever modal state changes
  useEffect(() => {
    if (!isModalCompanyOpen) {
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
    }
  }, [isModalCompanyOpen]); // Runs whenever modal state changes

  //filter item
  // const filteredAssets = assets.filter((asset) =>
    //   asset.SerialNumber?.toLowerCase().includes(search.toLowerCase()) ||
  //   asset.ProductName?.toLowerCase().includes(search.toLowerCase())
  // );
  // console.log("filtered Asset")
  // console.log(filteredAssets);
  
  
  
  
  //form section
  // section account
  //set Form Data
  const [formDataSiteAccount, setFormDataSiteAccount] = useState({
    Company: '',
    Email: '',
    PrimaryPhone: '',
    AddressLine1: '',
    AddressLine2: '',
    City: '',
    StateProvince: '',
    Country: '',
    ZipPostalCode: ''
  })
  
  //make handler
  const handlerInputSiteAccountChange = (e) => {
    const { id, value } = e.target
    setFormDataSiteAccount(prevState => ({
      ...prevState,
      [id]:value
    }))
  }

  //handler submit
  // console.log(formData)
  const handlerSiteAccountSubmit = async () => {
    // console.log(formDataSiteAccount)
    try {
      const response = await ApiCustomer.post("/api/site_account", formDataSiteAccount);
      console.log("Success:", response.data);
      alert("Customer Saved successfully")
    } catch (err){
      console.error("Error saving customer: ", err)
      alert("Failed to save customer")
    }
  }

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
    ZipPostalCode: ''
  });
  
  const handlerInputContactChange = (e) => {
    const { id, value } = e.target;
    setFormDataContact(prevState => ({
      ...prevState,
      [id]: value
    }));
  };
  
  const handlerContactSubmit = async () => {
    console.log("formDataContact");
    console.log(formDataContact);
    try {
      const response = await ApiCustomer.post("/api/contact-information", formDataContact);
      console.log("Success:", response.data);
      alert("Contact Information Saved Successfully");
    } catch (err) {
      console.error("Error saving contact information: ", err);
      alert("Failed to save contact information");
    }
  };

  //handler table selected
  const [selectedAsset, setSelectedAsset] = useState([]); // Store selected asset data

  const handleSelectedAsset = (asset) => {
    if (Array.isArray(asset)) {
      setSelectedAsset(asset);
      setSelectedSiteAccounts(asset[0]?.site_account || null); // Update affiliated company
      setSelectedContact(asset[0]?.contact_information || null); // Update affiliated contact
    } else if (asset) {
      setSelectedAsset([asset]);
      setSelectedSiteAccounts(asset.site_account || null);
      setSelectedContact(asset.contact_information || null)
    } else {
      setSelectedAsset([]);
      setSelectedSiteAccounts(null);
      setSelectedContact(null);
    }
  };

  useEffect(() => {
    console.log("Updated selectedAsset:", selectedAsset);
  }, [selectedAsset]); // Runs when `selectedAsset` updates
  
  

  useEffect(() => {
    console.log("Updated selectedAsset:", selectedAsset);
  }, [selectedAsset]); // Runs when `selectedAsset` updates
  

  //handler site accunt
  const [selectedSiteAccounts, setSelectedSiteAccounts] = useState([]);
  
  const handleSelectedSiteAccount = (company) => {
    setSelectedSiteAccounts(company);
    console.log("Company Selected:", selectedSiteAccounts);
  };
  

  //todo : handler selected contact
  const [selectedContact, setSelectedContact] = useState([]);


  return (
    <div className="flex flex-1 mt-2  gap-4 p-4 pt-0">
      <div className="flex min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <Tabs defaultValue="search" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="drop-shadow-xl bg-sky-700 w-full h-15 flex justify-between">
            <div className="w-2xs p-2 text-white ">
              <TabsTrigger value="search" className="cursor-pointer">Search</TabsTrigger>
              <TabsTrigger value="ci" className="cursor-pointer">Costumer Information</TabsTrigger>
            </div>

            <BtnModal></BtnModal>
          </TabsList>

          {/* search tab */}
          <TabsContent value="search">
            <Card className="drop-shadow-md">
              <CardContent className="grid gap-5 grid-cols-3">
                <div className="space-y-0.5"> 
                  <Label htmlFor="Email">Email</Label>
                  <Input id="Email" className="border-b-black p-1 "  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="SerialNumber">Serial Number</Label>
                  <Input id="SerialNumber" onChange={handleInputChange} className="border-b-black p-1"/>
                </div>
                <div className="space-y-0.5 flex flex-col">
                  <Label htmlFor="Country">Country</Label>
                  <SelectBar id="Country" onChange={handleInputChange}></SelectBar>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="Company">Company</Label>
                  <Input id="Company" className="border-b-black p-1"   onChange={handleInputChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="ZipPostalCode">Zip/Postal</Label>
                  <Input id="ZipPostalCode" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="City">City</Label>
                  <Input id="City" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="Phone">Phone</Label>
                  <Input id="Phone" className="border-b-black p-1"   />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="AssetTag">Asset Tag</Label>
                  <Input id="AssetTag" className="border-b-black p-1" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="ContractID">Contrack Id</Label>
                  <Input id="ContractID" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="TransactionType">Transaction Type</Label>
                  <Input id="TransactionType" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="TransactiontID">Transaction Id</Label>
                  <Input id="TransactiontID" className="border-b-black p-1" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="Opsi">Opsi</Label>
                  <Input id="Opsi" className="border-b-black p-1" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="LicenseKey">Lisense key</Label>
                  <Input id="LicenseKey" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="PIN">Pin</Label>
                  <Input id="PIN" className="border-b-black p-1" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="secondary" className="bg-white drop-shadow-md border-1 cursor-pointer w-40 h-11" onClick={handleSearchClick}><p className='text-2xl mb-1'>Search</p></Button>
              </CardFooter>
            </Card>
          </TabsContent>  
          
          <TabsContent value="ci" className="flex flex-col gap-1">
          <TabsList className="bg-white float-right mr-5 self-end">   
              <TabsTrigger value="Account" className="cursor-pointer"><span><Plus></Plus></span>Create New</TabsTrigger>
              <DialogCloseButton 
                isModalAssetOpen={isModalAssetOpen} 
                setIsModalAssetOpen={setIsModalAssetOpen} 
                search={search} 
                setSearch={setSearch} 
                onSelectAsset={handleSelectedAsset} 
              />
              <DialogCompanyBtn 
                isModalCompanyOpen={isModalCompanyOpen}
                setIsModalCompanyOpen={setIsModalCompanyOpen}
                search={search}
                setSearch={setSearch}
                onSelectCompany={handleSelectedSiteAccount}
              />
              <DialogContactBtn>
                
              </DialogContactBtn>
          </TabsList>
          <div className='mb-5'>
            {/* TODO : Change this Variable Name */}
            <TableCompany 
              selectedAsset={selectedAsset} 
              selectedCompany={selectedSiteAccounts} 
              selectedContact={selectedContact}
              setSelectedAsset={setSelectedAsset}
              setSelectedSiteAccounts={setSelectedSiteAccounts}
              setSelectedContact={setSelectedContact}
            />
            {/* <TableContact selectedAsset={selectedAsset} selectedCompany={selectedSiteAccounts} ></TableContact>
            <TableAsset selectedAsset={selectedAsset} selectedCompany={selectedSiteAccounts} ></TableAsset> */}
          </div>
          </TabsContent>

         
          <TabsContent value="Account">
          <TabsList className="flex h-[3em] bg-white">
            <div className="w-2xs p-2 text-black">
              <TabsTrigger value="Account" className="cursor-pointer" >Account</TabsTrigger>
              <TabsTrigger value="Contact" className="ml-2 cursor-pointer">Contact</TabsTrigger>
            </div>
          </TabsList>
            <Card className="drop-shadow-md">
              {/* <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you'll be logged out.
                </CardDescription>
              </CardHeader> */}
           
                  
                <CardHeader className="flex-row justify-between">
              <CardTitle>
                  Basic Information
                </CardTitle>  
                <CardTitle>
                  Clear All
                </CardTitle>
              </CardHeader>
              
              <CardContent className="grid gap-5 grid-cols-3">
              <div className="space-y-0.5">
                  <Label htmlFor="Company">Company</Label>
                  <Input id="Company" className="border-b-black p-1" onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.Company}/>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="Email">Email</Label>
                  <Input id="Email" type="email" className="border-b-black p-1" onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.Email}/>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="PrimaryPhone">Primary Phone</Label>
                  <Input id="PrimaryPhone" type="text" className="border-b-black p-1" onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.PrimaryPhone}/>
                </div>
              </CardContent>

              <CardHeader className="mt-4">
                <CardTitle>
                  Address
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5 grid-cols-3">
              <div className="space-y-0.5">
                  <Label htmlFor="AddressLine1">Addres Line 1</Label>
                  <Input id="AddressLine1" type="email" className="border-b-black p-1" onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.AddressLine1} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="AddressLine2">Addres Line 2</Label>
                  <Input id="AddressLine2" type="email" className="border-b-black p-1" onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.AddressLine2}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="City">City</Label>
                  <Input id="City" type="text" className="border-b-black p-1"  onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.City}/>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="StateProvince">State/Province</Label>
                  <Input id="StateProvince" type="text" className="border-b-black p-1" onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.StateProvince}/>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="current">Country</Label>
                  <SelectBar onChange={handlerInputContactChange}></SelectBar>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="ZipPostalCode">Zip/Postal Code</Label>
                  <Input id="ZipPostalCode" type="text" className="border-b-black p-1" onChange={handlerInputSiteAccountChange} value={formDataSiteAccount.ZipPostalCode}/>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="secondary" className="bg-white drop-shadow-md border-1 cursor-pointer" onClick={handlerSiteAccountSubmit}>Verify & Save</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="Contact">
            <TabsList className="flex h-[3em] bg-white">
              <div className="w-2xs p-2 text-black">
                <TabsTrigger value="Account" className="cursor-pointer">Account</TabsTrigger>
                <TabsTrigger value="Contact" className="ml-2 cursor-pointer">Contact</TabsTrigger>
              </div>
            </TabsList>
            <Card className="drop-shadow-md">
              <CardHeader className="flex-row justify-between">
              <CardTitle>
               Basic Information
                </CardTitle>  
                <CardTitle>
                  Clear All
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 grid-cols-5">
                <div className="space-y-0.5 grid grid-cols-2 gap-x-2.5 col-span-2">
                  <Label htmlFor="Salutation">Salutation</Label>
                  <Label htmlFor="PreferredLanguage" >Preferred Language</Label>
                  <SelectBar1 id="Salutation" onChange={handlerInputContactChange} />
                  <SelectBar2 id="PreferredLanguage" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="FirstName">First Name</Label>
                  <Input id="FirstName" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="LastName">Last Name</Label>
                  <Input id="LastName" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="Email">Email</Label>
                  <Input id="Email" type="email" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
              </CardContent>
              <CardHeader className="mt-2">
                <CardTitle>Phone Preferences</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 grid-cols-4">
                <div className="space-y-0.5">
                  <Label htmlFor="Phone">Phone</Label>
                  <Input id="Phone" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="Mobile">Mobile</Label>
                  <Input id="Mobile" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="WorkPhone">Work</Label>
                  <Input id="WorkPhone" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="WorkExtension">Work EXTN</Label>
                  <Input id="WorkExtension" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="OtherPhone">Other</Label>
                  <Input id="OtherPhone" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="OtherExtension"> Other EXTN</Label>
                  <Input id="OtherExtension" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="Fax">FAX</Label>
                  <Input id="Fax" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
              </CardContent>
              <CardHeader className="mt-2">
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 grid-cols-3">
                <div className="space-y-0.5">
                  <Label htmlFor="AddressLine1">Address Line 1</Label>
                  <Input id="AddressLine1" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="AddressLine2">Address Line 2</Label>
                  <Input id="AddressLine2" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="City">City</Label>
                  <Input id="City" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="StateProvince">State/Province</Label>
                  <Input id="StateProvince" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="current">Country</Label>
                  <SelectBar id="Country" onChange={handlerInputContactChange}/>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="ZipPostalCode">Zip/Postal Code</Label>
                  <Input id="ZipPostalCode" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />

                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-4">
              <Button variant="secondary" className="bg-white drop-shadow-md border-1 cursor-pointer w-20" onClick={handlerContactSubmit}>Save</Button>
                <Button variant="secondary" className="bg-white drop-shadow-md border-1 cursor-pointer" onClick={handlerContactSubmit}>Verify & Save</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* <div className="flex  flex-col min-h-[100vh]  rounded-xl bg-muted/50 md:min-h-min">
        <Sidebar side='right' className="relative" collapsible='icon'>
          <SidebarContent>
            <InfoSide items={data.navMain} />
          </SidebarContent>
        </Sidebar>
      </div> */}
    </div>
  )
}

export default Search_case
