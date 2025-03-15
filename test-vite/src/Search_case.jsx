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

import { DialogCloseButton } from './components/assets-modal'
import { SelectBar } from './components/sc-select'
import { SelectBar1 } from './components/sc-select'
import { SelectBar2 } from './components/sc-select'
import { BtnModal } from './components/sc-modal'
import { TableCompany } from './components/sc-table'
import { TableContact } from './components/sc-table'
import { TableAsset } from './components/sc-table'

const Search_case = () => {

  //create search state
  const [search, setSearch] = useState("");
  
  const [isModalAssetOpen, setIsModalAssetOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("search"); // Default active tab

  const handleSearchClick = () => {
    console.log("BeforeChange" + activeTab)
    setIsModalAssetOpen(true); // Open modal
    setActiveTab('ci'); // Switch tab to target
  };
  useEffect(() => {
    console.log("Updated Active Tab:", activeTab);
  }, [activeTab]); // This runs every time activeTab changes
  
  const handleInputChange = (e) =>{
    // if (search.trim() !== "") { 
      const searchQuery = e.target.value;
      setSearch(searchQuery);
      console.log("search" + search)
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
    console.log(formDataContact);
    console.log("formDataContact");
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
  const [selectedAsset, setSelectedAsset] = useState(null); // Store selected asset data

  const handleSelectedAsset = (asset) => {
    console.log("Asset received in parent:", asset);
    setSelectedAsset(asset);
  };
  

  return (
    <div className="flex flex-1 mt-2  gap-4 p-4 pt-0">
      <div className="flex min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <Tabs defaultValue="search" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="drop-shadow-xl bg-sky-700 w-full h-15 flex justify-between">
            <div className="w-2xs p-2 text-white ">
              <TabsTrigger value="search" className="cursor-pointer">Search</TabsTrigger>
              <TabsTrigger value="ci" className="cursor-pointer">Costumer Information</TabsTrigger>
            </div>
            {/* <Button className="ml-50 cursor-pointer "><span></span>Customer Complaint</Button>
            <Button className="cursor-pointer"><span></span>Customer Complaint Legal</Button> */}
            {/* <Button className="mr-1.5 cursor-pointer"><span><Plus></Plus></span>Create Case</Button> */}
            <BtnModal></BtnModal>
          </TabsList>

          {/* search tab */}
          <TabsContent value="search">
            <Card className="drop-shadow-md">
              <CardContent className="grid gap-5 grid-cols-3">
                <div className="space-y-0.5"> 
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" className="border-b-black p-1 "  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="serialnumber">Serial Number</Label>
                  <Input id="serialnumber" onChange={handleInputChange} className="border-b-black p-1"/>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="country">Country</Label>
                  <SelectBar></SelectBar>
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" className="border-b-black p-1"   />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="zippostal">Zip/Postal</Label>
                  <Input id="zippostal" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" className="border-b-black p-1"   />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="assettag">Asset Tag</Label>
                  <Input id="assettag" className="border-b-black p-1" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="contrackid">Contrack Id</Label>
                  <Input id="contrackid" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="transactiontype">Transaction Type</Label>
                  <Input id="transactiontype" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="transactiontid">Transaction Id</Label>
                  <Input id="transactiontid" className="border-b-black p-1" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="opsi">Opsi</Label>
                  <Input id="opsi" className="border-b-black p-1" />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="lisensekey">Lisense key</Label>
                  <Input id="lisensekey" className="border-b-black p-1"  />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="pin">Pin</Label>
                  <Input id="pin" className="border-b-black p-1" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="secondary" className="bg-white drop-shadow-md border-1 cursor-pointer w-40 h-11"><p className='text-2xl mb-1' onClick={handleSearchClick}>Search</p></Button>
              </CardFooter>
            </Card>
          </TabsContent>  
          
          <TabsContent value="ci">
          <TabsList className="bg-white float-right mr-5">   
              <TabsTrigger value="Account" className="cursor-pointer"><span><Plus></Plus></span>Create New</TabsTrigger>
              <DialogCloseButton 
                isModalAssetOpen={isModalAssetOpen} 
                setIsModalAssetOpen={setIsModalAssetOpen} 
                search={search} 
                setSearch={setSearch} 
                onSelectAsset={handleSelectedAsset} 
              />
          </TabsList>
          <div className='mb-5'>
            {/* TODO : Change this Variable Name */}
            <TableCompany selectedAsset={selectedAsset} />
            <TableContact selectedAsset={selectedAsset}></TableContact>
            <TableAsset selectedAsset={selectedAsset}></TableAsset>
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
              <CardHeader>
                <CardTitle className="flex justify-end">
                  
                </CardTitle>
                <CardTitle >
                  Basic Information
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
                  <SelectBar></SelectBar>
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
              <CardHeader>
              <CardTitle className="flex justify-end">
                  Clear All
                </CardTitle>  
                <CardTitle>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 grid-cols-3">
                <div className="space-y-0.5">
                  <Label htmlFor="Salutation">Salutation</Label>
                  <SelectBar1 id="Salutation" onChange={handlerInputContactChange} />
                  <Label htmlFor="PreferredLanguage" className="mt-2">Preferred Language</Label>
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
              </CardContent>
              <CardHeader className="mt-2">
                <CardTitle>Phone Preferences</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 grid-cols-3">
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
                  <Label htmlFor="WorkExtension">EXTN</Label>
                  <Input id="WorkExtension" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="OtherPhone">Other</Label>
                  <Input id="OtherPhone" type="text" className="border-b-black p-1" onChange={handlerInputContactChange} />
                </div>
                <div className="space-y-0.5">
                  <Label htmlFor="OtherExtension">EXTN</Label>
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
                  <SelectBar onChange={handlerInputContactChange}/>
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
