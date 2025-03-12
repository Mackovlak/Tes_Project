import { React } from 'react'
import  { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { InfoSide } from './components/info-sidebar'
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from './components/ui/sidebar' 

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
 
const assets = [
  {
    AssetID: 1,
    SerialNumber: "SN123456",
    ProductName: "Laptop X100",
    ProductNumber: "PX100-2024",
    ProductLine: "Laptops",
    SiteAccountID: 101,
  },
  {
    AssetID: 2,
    SerialNumber: "SN654321",
    ProductName: "Smartphone Z5",
    ProductNumber: "SZ5-2024",
    ProductLine: "Smartphones",
    SiteAccountID: 102,
  },
  {
    AssetID: 3,
    SerialNumber: "SN789012",
    ProductName: "Tablet A10",
    ProductNumber: "TA10-2024",
    ProductLine: "Tablets",
    SiteAccountID: 103,
  },
  {
    AssetID: 4,
    SerialNumber: "SN345678",
    ProductName: "Monitor UltraWide",
    ProductNumber: "MUW-2024",
    ProductLine: "Monitors",
    SiteAccountID: 104,
  },
  {
    AssetID: 5,
    SerialNumber: "SN567890",
    ProductName: "Gaming Mouse GX500",
    ProductNumber: "GMGX500-2024",
    ProductLine: "Accessories",
    SiteAccountID: 105,
  },
  {
    AssetID: 6,
    SerialNumber: "SN908172",
    ProductName: "Mechanical Keyboard MK700",
    ProductNumber: "MKMK700-2024",
    ProductLine: "Accessories",
    SiteAccountID: 106,
  },
  {
    AssetID: 7,
    SerialNumber: "SN382910",
    ProductName: "External Hard Drive 1TB",
    ProductNumber: "EHD1TB-2024",
    ProductLine: "Storage",
    SiteAccountID: 107,
  },
];

const contacts = [
  {
    ContactID: 1,
    SiteAccountID: 201,
    Salutation: "Mr.",
    FirstName: "John",
    LastName: "Doe",
    Email: "john.doe@example.com",
    PreferredLanguage: "English",
    Phone: "+1-123-456-7890",
    Mobile: "+1-987-654-3210",
    WorkPhone: "+1-555-123-4567",
    WorkExtension: "101",
    OtherPhone: null,
    OtherExtension: null,
    Fax: "+1-555-987-6543",
    AddressLine1: "123 Main St",
    AddressLine2: "Suite 400",
    City: "New York",
    StateProvince: "NY",
    Country: "USA",
    ZipPostalCode: "10001",
  },
  {
    ContactID: 2,
    SiteAccountID: 202,
    Salutation: "Ms.",
    FirstName: "Jane",
    LastName: "Smith",
    Email: "jane.smith@example.com",
    PreferredLanguage: "French",
    Phone: "+33-123-456-789",
    Mobile: "+33-987-654-321",
    WorkPhone: "+33-555-123-456",
    WorkExtension: "102",
    OtherPhone: null,
    OtherExtension: null,
    Fax: "+33-555-987-654",
    AddressLine1: "456 Rue de Paris",
    AddressLine2: null,
    City: "Paris",
    StateProvince: "Île-de-France",
    Country: "France",
    ZipPostalCode: "75001",
  },
  {
    ContactID: 3,
    SiteAccountID: 203,
    Salutation: "Dr.",
    FirstName: "Alice",
    LastName: "Brown",
    Email: "alice.brown@example.com",
    PreferredLanguage: "Spanish",
    Phone: "+34-123-456-789",
    Mobile: "+34-987-654-321",
    WorkPhone: "+34-555-123-456",
    WorkExtension: "103",
    OtherPhone: "+34-111-222-333",
    OtherExtension: "104",
    Fax: "+34-555-987-654",
    AddressLine1: "789 Calle Mayor",
    AddressLine2: "Piso 2",
    City: "Madrid",
    StateProvince: "Madrid",
    Country: "Spain",
    ZipPostalCode: "28001",
  },
  {
    ContactID: 4,
    SiteAccountID: 204,
    Salutation: "Mr.",
    FirstName: "Michael",
    LastName: "Johnson",
    Email: "michael.johnson@example.com",
    PreferredLanguage: "German",
    Phone: "+49-123-456-789",
    Mobile: "+49-987-654-321",
    WorkPhone: "+49-555-123-456",
    WorkExtension: "105",
    OtherPhone: null,
    OtherExtension: null,
    Fax: "+49-555-987-654",
    AddressLine1: "101 Berliner Straße",
    AddressLine2: "Apt 12",
    City: "Berlin",
    StateProvince: "Berlin",
    Country: "Germany",
    ZipPostalCode: "10115",
  },
  {
    ContactID: 5,
    SiteAccountID: 205,
    Salutation: "Mrs.",
    FirstName: "Emma",
    LastName: "Williams",
    Email: "emma.williams@example.com",
    PreferredLanguage: "Japanese",
    Phone: "+81-123-456-789",
    Mobile: "+81-987-654-321",
    WorkPhone: "+81-555-123-456",
    WorkExtension: "106",
    OtherPhone: "+81-111-222-333",
    OtherExtension: "107",
    Fax: "+81-555-987-654",
    AddressLine1: "5-1-1 Ginza",
    AddressLine2: "Chuo-ku",
    City: "Tokyo",
    StateProvince: "Tokyo",
    Country: "Japan",
    ZipPostalCode: "104-0061",
  },
];

const siteAccounts = [
  {
    SiteAccountID: 1,
    Company: "Tech Solutions Inc.",
    Email: "contact@techsolutions.com",
    PrimaryPhone: "+1 555-1234",
    AddressLine1: "123 Innovation Drive",
    AddressLine2: "Suite 200",
    City: "San Francisco",
    StateProvince: "CA",
    Country: "USA",
    ZipPostalCode: "94107",
  },
  {
    SiteAccountID: 2,
    Company: "Global Logistics Ltd.",
    Email: "info@globallogistics.com",
    PrimaryPhone: "+44 20 7946 0123",
    AddressLine1: "456 Supply Chain Ave",
    AddressLine2: null,
    City: "London",
    StateProvince: null,
    Country: "UK",
    ZipPostalCode: "SW1A 1AA",
  },
  {
    SiteAccountID: 3,
    Company: "Green Energy Corp.",
    Email: "support@greenenergy.com",
    PrimaryPhone: "+33 1 23 45 67 89",
    AddressLine1: "789 Renewable Street",
    AddressLine2: "Building A",
    City: "Paris",
    StateProvince: null,
    Country: "France",
    ZipPostalCode: "75001",
  },
  {
    SiteAccountID: 4,
    Company: "Cyber Security Experts",
    Email: "security@cyberexperts.com",
    PrimaryPhone: "+49 30 9876 5432",
    AddressLine1: "321 Firewall Blvd",
    AddressLine2: "Floor 5",
    City: "Berlin",
    StateProvince: null,
    Country: "Germany",
    ZipPostalCode: "10115",
  },
  {
    SiteAccountID: 5,
    Company: "NextGen AI Solutions",
    Email: "hello@nextgenai.com",
    PrimaryPhone: "+81 3-1234-5678",
    AddressLine1: "101 AI Plaza",
    AddressLine2: "Room 303",
    City: "Tokyo",
    StateProvince: null,
    Country: "Japan",
    ZipPostalCode: "100-0001",
  },
  {
    SiteAccountID: 6,
    Company: "Cloud Storage Unlimited",
    Email: "sales@cloudstorage.com",
    PrimaryPhone: "+61 2 9876 5432",
    AddressLine1: "222 Cloud Lane",
    AddressLine2: null,
    City: "Sydney",
    StateProvince: "NSW",
    Country: "Australia",
    ZipPostalCode: "2000",
  },
  {
    SiteAccountID: 7,
    Company: "FinTech Innovators",
    Email: "finance@fintech.com",
    PrimaryPhone: "+1 212-555-6789",
    AddressLine1: "876 Wall Street",
    AddressLine2: "Suite 10",
    City: "New York",
    StateProvince: "NY",
    Country: "USA",
    ZipPostalCode: "10005",
  },
];

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

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  // const [search, setSearch] = useState("");
  
  // // Filtered Data
  // const filteredData = data.filter((item) =>
  //   item.name.toLowerCase().includes(search.toLowerCase()) || 
  //   item.email.toLowerCase().includes(search.toLowerCase())
  // );

  return (
    
    <div className="flex flex-1  gap-4 p-4 pt-0">
      <div className="flex  min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className=" w-full flex justify-between h-[3em]">
            <div className="w-2xs">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="ci">Costumer Information</TabsTrigger>
            </div>
            <Button><span><Plus></Plus></span>Create Case</Button>

            {/* Modal/Dialog Assets */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-black text-white" variant="outline">Assets</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-100 max-w-3xl w-full max-w-[90vw]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Asset List</AlertDialogTitle>
                  <AlertDialogDescription className="max-h-[70vh] overflow-y-auto">
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
                        {assets.map((asset) => (
                          <TableRow key={asset.AssetID}>
                            <TableCell className="font-medium">{asset.SerialNumber}</TableCell>
                            <TableCell>{asset.ProductName}</TableCell>
                            <TableCell>{asset.ProductNumber}</TableCell>
                            <TableCell>{asset.ProductLine}</TableCell>
                            <TableCell className="text-right">{asset.SiteAccountID}</TableCell>
                          </TableRow>
                        ))}
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
              <AlertDialogContent className="bg-gray-100 max-w-5xl w-full max-w-[90vw]">
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
          <TabsContent value="search">
            <Card>
              <CardContent className="space-y-2 grid gap-1 grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email"  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="serialnumber">Serial Number</Label>
                  <Input id="serialnumber" />
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
                <Button>Save changes</Button>
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
          <SidebarTrigger />
          <SidebarContent>
            <InfoSide items={data.navMain} />
          </SidebarContent>
        </Sidebar>
      </div>
    </div>
  )
}

export default Search_case
