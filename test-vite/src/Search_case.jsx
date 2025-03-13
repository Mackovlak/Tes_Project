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

// import {
//   Sheet,
//   SheetTrigger,
//   SheetClose,
//   SheetContent,
//   SheetHeader,
//   SheetFooter,
//   SheetTitle,
//   SheetDescription 
// } from "@/components/ui/sheet"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


import TabsDialog from "@/components/Tabs-dialog"
import {DialogDemo} from "@/components/modals-dialog"
const data = {
  navMain: [
    {
      title: "Account info",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          value: "#",
        },
        {
          title: "Starred",
          value: "#",
        },
        {
          title: "Settings",
          value: "#",
        },
      ],
    },
    {
      title: "Contact info",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          value: "#",
        },
        {
          title: "Explorer",
          value: "#",
        },
        {
          title: "Quantum",
          value: "#",
        },
      ],
    },
    {
      title: "Asset info",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          value: "#",
        },
        {
          title: "Get Started",
          value: "#",
        },
        {
          title: "Tutorials",
          value: "#",
        },
        {
          title: "Changelog",
          value: "#",
        },
      ],
    },
    {
      title: "Entitlement info",
      icon: Settings2,
      items: [
        {
          title: "General",
          value: "#",
        },
        {
          title: "Team",
          value: "#",
        },
        {
          title: "Billing",
          value: "#",
        },
        {
          title: "Limits",
          value: "#",
        },
      ],
    },
  ],
}
const Search_case = () => {

  //create search state
  const [search, setSearch] = useState("");
  const [isModalAssetOpen, setIsModalAssetOpen] = useState(false);
  //tab

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
  
  const filteredAssets = assets.filter((asset) =>
    asset.SerialNumber?.toLowerCase().includes(search.toLowerCase()) ||
    asset.ProductName?.toLowerCase().includes(search.toLowerCase())
  );
  // console.log("filtered Asset")
  // console.log(filteredAssets);




  return (
    
    <div className="flex flex-1  gap-4 p-4 pt-0">
      <div className="flex  min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <Tabs defaultValue="search" value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className=" w-full flex justify-between h-[3em]">
            <div className="w-2xs">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="ci">Costumer Information</TabsTrigger>
            </div>
            <Button><span><Plus></Plus></span>Create Case</Button>

            {/* Modal/Dialog Assets */}
            <AlertDialog open={isModalAssetOpen} onOpenChange={setIsModalAssetOpen}>
              <AlertDialogTrigger asChild>
                <Button className="bg-black text-white" variant="outline">Assets</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-100 max-w-3xl w-full ">
                <AlertDialogHeader>
                  <AlertDialogTitle>Asset List</AlertDialogTitle>
                  <AlertDialogDescription className="max-h-[70vh] overflow-auto">
                    <Table>
                      <TableCaption>A list of your assets.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Serial Number</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Product Number</TableHead>
                          <TableHead>Product Line</TableHead>
                          <TableHead className="text-right">Site Account ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {
                          filteredAssets.length > 0 ? (
                            filteredAssets.map((asset) => (
                              <TableRow key={asset.AssetID}>
                                <TableCell className="font-medium">{asset.SerialNumber}</TableCell>
                                <TableCell>{asset.ProductName}</TableCell>
                                <TableCell>{asset.ProductNumber}</TableCell>
                                <TableCell>{asset.ProductLine}</TableCell>
                                <TableCell className="text-right">{asset.SiteAccountID}</TableCell>
                              </TableRow>
                            ))
                          ) : assets.length > 0 ? (
                            assets.map((asset) => (
                              <TableRow key={asset.AssetID}>
                                <TableCell className="font-medium">{asset.SerialNumber}</TableCell>
                                <TableCell>{asset.ProductName}</TableCell>
                                <TableCell>{asset.ProductNumber}</TableCell>
                                <TableCell>{asset.ProductLine}</TableCell>
                                <TableCell className="text-right">{asset.SiteAccountID}</TableCell>
                              </TableRow>
                            ))
                          ) 
                          :
                          <TableRow>
                              <TableCell className="font-medium">Data Belum Tersedia</TableCell>
                            </TableRow>
                        }
                      </TableBody>
                    </Table>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Modal/Dialog Contacts */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-black text-white" variant="outline">Contacts</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white shadow-lg rounded-lg w-full max-w-[85vw] max-h-[80vh] overflow-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-bold">Contact List</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableCaption>A list of your contacts.</TableCaption>
                        <TableHeader className="bg-gray-200">
                          <TableRow>
                            <TableHead className="w-[180px]">Name</TableHead>
                            <TableHead className="w-[200px]">Email</TableHead>
                            <TableHead className="w-[150px]">Phone</TableHead>
                            <TableHead className="w-[120px] text-right">City</TableHead>
                            <TableHead className="w-[150px] text-right">Country</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.map((contact) => (
                            <TableRow key={contact.ContactID} className="even:bg-gray-100 hover:bg-gray-200">
                              <TableCell className="font-medium">{contact.Salutation} {contact.FirstName} {contact.LastName}</TableCell>
                              <TableCell>{contact.Email}</TableCell>
                              <TableCell>{contact.Phone || contact.Mobile}</TableCell>
                              <TableCell className="text-right">{contact.City}</TableCell>
                              <TableCell className="text-right">{contact.Country}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="bg-gray-100 px-4 py-2">
                  <AlertDialogCancel className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Modal/Dialog siteAccounts */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-black text-white" variant="outline">
                  Site Accounts
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-100 max-w-5xl w-full ">
                <AlertDialogHeader>
                  <AlertDialogTitle>Site Accounts List</AlertDialogTitle>
                  <AlertDialogDescription className="max-h-[70vh] overflow-y-auto">
                    <Table>
                      <TableCaption>A list of registered site accounts.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Company</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead className="text-right">Country</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {siteAccounts.map((account) => (
                          <TableRow key={account.SiteAccountID}>
                            <TableCell className="font-medium">{account.Company}</TableCell>
                            <TableCell>{account.Email}</TableCell>
                            <TableCell>{account.PrimaryPhone}</TableCell>
                            <TableCell>
                              {account.AddressLine1}
                              {account.AddressLine2 ? `, ${account.AddressLine2}` : ""}, {account.City}
                              {account.StateProvince ? `, ${account.StateProvince}` : ""}
                              , {account.ZipPostalCode}
                            </TableCell>
                            <TableCell className="text-right">{account.Country}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>            

          </TabsList>

          {/* search tab */}
          <TabsContent value="search">
            <Card>
              <CardContent className="space-y-2 grid gap-1 grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email"  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="serialnumber">Serial Number</Label>
                  <Input id="serialnumber" onChange={handleInputChange}/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company"  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="zippostal">Zip/Postal</Label>
                  <Input id="zippostal" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone"  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assettag">Asset Tag</Label>
                  <Input id="assettag" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contrackid">Contrack Id</Label>
                  <Input id="contrackid" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="transactiontype">Transaction Type</Label>
                  <Input id="transactiontype"  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="transactiontid">Transaction Id</Label>
                  <Input id="transactiontid" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="opsi">Opsi</Label>
                  <Input id="opsi" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lisensekey">Lisense key</Label>
                  <Input id="lisensekey"  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pin">Pin</Label>
                  <Input id="pin" />
                </div>
                
              </CardContent>
              <CardFooter>
                <Button onClick={handleSearchClick}>Search</Button>
                {/* <TabsDialog/> */}
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="ci">
            <Card>
              <DialogDemo></DialogDemo>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex  flex-col min-h-[100vh]  rounded-xl bg-muted/50 md:min-h-min">
        <Sidebar side='right' className="relative" collapsible='icon'>
          <SidebarContent>
            <InfoSide items={data.navMain} />
          </SidebarContent>
        </Sidebar>
      </div>
    </div>
  )
}

export default Search_case
