import React, {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchCommandBlock, SelectBarRelated } from "../../components/sc-select";
import { ArrowDownNarrowWideIcon, Car, Lock, Plus, RotateCw, Search } from "lucide-react";
import { CalendarDays } from "lucide-react";
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
import { Link } from "react-router";
import Swal from "sweetalert2";

import { useParams } from "react-router";
// import Select from 'react-select';
import debounce from 'lodash.debounce';
import ApiCustomer from "@/api";

import { CaseField } from "../../components/quick-wo-input";

import { TabsServiceMOLineItems } from "./service-case";
import { Description } from "@radix-ui/react-dialog";
import { useDraft } from "../../components/DraftContext";
export const ServiceMoDetail = () => {
  const { updateDraft } = useDraft(); // Access updateDraft from the DraftContext

  const { lineItemID } = useParams();

  const [moLineItems, setMoLineItems] = useState([])

  const [MODetailInput, setMODetailInput] = useState({
    MOID: '',
    moOrderName: '',
    salesOrderNumber: '',
    lineNumber: '',
    partNumber: '',
    description: '',
    rohs: false,
    returnabilityFlag: false,
    functionalEquivalence: '',
    mediaHandlingPart: '',
    pickPackInstructions: '',
    collectionInstructions: '',
    customerResponse: '',
    rejectedReason: '',
    otherReason: '',
    partAuthorizationReason: '',
    partAuthorizationDetail: '',
    originalPartNumber: '',
    offeredPartNumber: '',
    offeredPartDescription: '',
    mainComponent: '',
    gratisFlag: false,
    failureId: null,
    failureName: '',
    serialNumber: '',
    removedPartNumber: '',
    removedSerialNumber: '',
    removedPartDescription: '' 
  })
    
  const fetchMoLineItems = async () => {
    try {
    // Tampilkan loading SweetAlert
    Swal.fire({
      title: 'Loading...',
      text: 'Please wait a moment',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      customClass: {
        popup: 'z-[9999]',
      }
    });

      const res = await ApiCustomer.get(`/api/material-order/material-order-line-items/${lineItemID}`);
      const data = res.data.data;
  
      setMoLineItems(data);
      console.log(data)
  
      // Isi state MODetailInput berdasarkan data yang diambil
      setMODetailInput({
        MOID: data.MOID,
        moOrderName: data
          ? `${data.MOID} - ${data.LineNumber}`
          : null,
        salesOrderNumber: data.SalesOrderNumber || '',
        lineNumber: data.LineNumber?.toString() || '',
        partNumber: data.PartNumber || '',
        description: data.Description || '',
        rohs: data.servicecatalog_parts?.ROHS_Flag || false,
        returnabilityFlag: data.servicecatalog_parts?.Returnable_Flag || false,
        functionalEquivalence: data.FunctionalEquivalence || '',
        mediaHandlingPart: data.MediaHandlingPart || '',
        pickPackInstructions: data.PickPackInstructions || '',
        collectionInstructions: data.CollectionInstructions || '',
        customerResponse: data.CustomerResponse || '',
        rejectedReason: data.RejectedReason || '',
        otherReason: data.OtherReason || '',
        partAuthorizationReason: data.PartAuthorizationReason || '',
        partAuthorizationDetail: data.PartAuthorizationDetail || '',
        originalPartNumber: data.OriginalPartNumber || '',
        offeredPartNumber: data.OfferedPartNumber || '',
        offeredPartDescription: data.OfferedPartDescription || '',
        mainComponent: data.MainComponent || '',
        gratisFlag: data.GratisFlag || false,
        failureId: data.FailureId || null,
        failureName: data.Failure?.Name || '',
        atpStatus: data.ATPStatus || '',
        serialNumber: data.SerialNumber || '',
        removedPartNumber: data.RemovedPartNumber || '',
        removedSerialNumber: data.RemovedSerialNumber || '',
        removedPartDescription: data.RemovedPartDescription || ''
      });
      updateDraft('moliId',data.lineItemID)
    } catch (err) {
      console.error("Failed to fetch Material Line Items orders:", err);
    Swal.fire('Error', 'Failed to fetch Material Line Items', 'error');
  } finally {
    Swal.close();
    }
  };
  
  useEffect(() => {
    fetchMoLineItems()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMODetailInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleUpdate = async () => {
    try {
      await ApiCustomer.patch(`/api/material-order/material-order-line-items/${lineItemID}`, {
        Description: MODetailInput.description,
        PickPackInstructions: MODetailInput.pickPackInstructions,
        CollectionInstructions: MODetailInput.collectionInstructions,
        CustomerResponse: MODetailInput.customerResponse,
        RejectedReason: MODetailInput.rejectedReason,
        OtherReason: MODetailInput.otherReason,
      });
  
      console.log("Material Order Line Item updated successfully.");
    } catch (error) {
      console.error("Error updating Material Order Line Item:", error);
    }
  };
  
  
  return (
    <>
    {moLineItems.Status === 'Closed' && (
        <div className="p-4 my-2 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500">
          This material order line item is <strong>read-only</strong> because it is <strong>Closed</strong>.
        </div>
      )}
      {moLineItems.MOID ? (
        <TabsServiceMOLineItems MOLineDetails={MODetailInput} LineItemID={lineItemID} moLineItems={moLineItems}/>
      ) : ''}
    <Card className="mt-2 rounded-none">

      <CardContent className={'p-0'}>
        <Tabs>
            <Card className={'p-2'}>
              <CardTitle className="text-xl ">{moLineItems.MOID} - {moLineItems.LineItemID}</CardTitle>
              <CardTitle className="text-sm">Material Order Line Item . Information</CardTitle>
              <TabsList className="gap-2 bg-white">
                <TabsTrigger variant={'underline'} value="mo_details" className="cursor-pointer">
                  MO Details
                </TabsTrigger>
                <TabsTrigger variant={'underline'} value="mo_failure" className="cursor-pointer white">
                  Failure & Return Details
                </TabsTrigger>
                <TabsTrigger variant={'underline'} value="mo_attachments" className="cursor-pointer">
                  Attachments
                </TabsTrigger>
                <SelectBarRelated></SelectBarRelated>
              </TabsList>
            </Card>

          <TabsContent value="mo_details" className={'p-2 flex flex-col gap-2'}>
            <Card className="rounded-md ">
              <span className="ml-5 text-xl font-bold">MO Order Details</span>
              <CardContent className="grid grid-flow-col gap-5 grid-rows-8 ">
                <div className="flex font-bold">
                  <Lock className="mr-2 size-5"></Lock>
                  <span>MO Order Name</span>
                  <span className="ml-31">{MODetailInput.moOrderName}</span>
                </div>
                
                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>Sales Order Number</span>
                  <span className="ml-30.5">{MODetailInput.salesOrderNumber}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>Line Number</span>
                  <span className="ml-37">{MODetailInput.lineNumber}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>Part/Product Number</span>
                  <span className="ml-20">{MODetailInput.partNumber}</span>
                </div>

                <div className="flex font-bold">
                  <span className="ml-7">Description</span>
                  {/* <span className="ml-39">{MODetailInput.description}</span> */}
                  <textarea
                    className="ml-39"
                    name="description"
                    value={MODetailInput.description}
                    onChange={handleChange}
                    placeholder="Description"
                  />
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>RoHS</span>
                  <span className="ml-50">{MODetailInput.rohs ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>Returnability Flag</span>
                  <span className="ml-27">{MODetailInput.returnabilityFlag ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-blue-500 ml-7">Functional Equivalence</span>
                  <span className="ml-18">{MODetailInput.functionalEquivalence}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-yellow-500">Media Handling Part</span>
                  <span className="ml-30">{MODetailInput.mediaHandlingPart}</span>
                </div>

                <div className="flex font-bold">
                  <span className="ml-7">Pick Pack Instructions</span>
                  <input
                    type="text"
                    className="ml-28"
                    name="pickPackInstructions"
                    value={MODetailInput.pickPackInstructions}
                    onChange={handleChange}
                    placeholder="---"
                  />
                </div>

                <div className="flex font-bold">
                  <span className="ml-7">Collection Instructions</span>
                  <select
                    className="ml-27"
                    name="collectionInstructions"
                    value={MODetailInput.collectionInstructions}
                    onChange={handleChange}
                  >
                    <option value="None">None</option>
                    <option value="Pickup">Pick Up</option>
                    <option value="DropOff">Drop Off</option>
                    <option value="ThirdParty">Third Party</option>
                  </select>
                </div>

                <div className="flex font-bold">
                  <span className="ml-7">Customer Response</span>
                  <input
                    type="text"
                    className="ml-33"
                    name="customerResponse"
                    value={MODetailInput.customerResponse}
                    onChange={handleChange}
                    placeholder="---"
                  />
                </div>

                <div className="flex font-bold">
                  <span className="ml-7">Rejected Reason</span>
                  <input
                    type="text"
                    className="ml-39"
                    name="rejectedReason"
                    value={MODetailInput.rejectedReason}
                    onChange={handleChange}
                    placeholder="---"
                  />
                </div>

                <div className="flex font-bold">
                  <span className="text-red-500 ml-7">Other Reason</span>
                  <input
                    type="text"
                    className="ml-44"
                    name="otherReason"
                    value={MODetailInput.otherReason}
                    onChange={handleChange}
                    placeholder="---"
                  />
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>Part Authorization Reason</span>
                  <span className="ml-20">{MODetailInput.partAuthorizationReason}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>Part Authorization Detail</span>
                  <span className="ml-23">{MODetailInput.partAuthorizationDetail}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-red-500 ml-7">Functional Equivalent</span>
                  <span className="ml-30">{MODetailInput.functionalEquivalence}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-blue-500 ml-7">Original Part Number</span>
                  <span className="ml-30">{MODetailInput.originalPartNumber}</span>
                </div>
                
                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-blue-500 ml-7">Offered Part Number</span>
                  <span className="ml-31">{MODetailInput.offeredPartNumber}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-blue-500 ml-7">Offered Part Description</span>
                  <span className="ml-25">{MODetailInput.offeredPartDescription}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-blue-500 ml-7">Main Component</span>
                  <span className="ml-38.5">{MODetailInput.mainComponent}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span className="text-orange-500 ml-7">Gratis Flag</span>
                  <span className="ml-51.5">{MODetailInput.gratisFlag ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex font-bold">
                  <Lock className="mr-2 size-5" />
                  <span>ATP Status</span>
                  <span className="ml-51.5">{MODetailInput.atpStatus}</span>
                </div>
                
              </CardContent>
            </Card>

            <Card className="rounded-md ">
              <span className="ml-5 text-xl font-bold">Outbound to Customer</span>
              <CardContent className="grid h-10 grid-flow-col grid-rows-2 gap-5">
                <div className="flex font-bold">
                  <Lock className="mr-2 size-5"></Lock>
                  <span>Outbound to Customer</span>
                  <span className="ml-40">...</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mo_failure" className={"p-1 flex flex-col gap-4"}>
            <Card className="flex-col ">
              <CardHeader>
                <CardTitle className="text-lg">Failure & Usage Details</CardTitle>
                <hr/>
              </CardHeader>
              <CardContent className="grid items-center grid-cols-6 gap-10">
              
                <CaseField label="Failure Analysis" icon>
                  <Input variant="invisible" placeholder="---"/>
                </CaseField>
                  <FailureSelect
                    failureId={MODetailInput.failureId}
                    setMODetailInput={setMODetailInput}
                  />
                <CaseField label="Additional Failure Code" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                <CaseField label="Serial Number" icon>
                  <Input
                    variant="invisible"
                    name="serialNumber"
                    value={MODetailInput.serialNumber}
                    onChange={handleChange}
                    placeholder="---" 
                    />
                </CaseField>

               
                <CaseField label="Part Usage Code" icon>
                    <Input variant="invisible" placeholder="---" />
                </CaseField>

                <CaseField label="Part Consumption" icon>
                    <Input variant="invisible" placeholder="---" />
                </CaseField>

                <CaseField label="Part Order Consumption Comment" icon>
                    <Input variant="invisible" placeholder="---" />
                </CaseField>

                <CaseField label="Removed Part Number " icon>
                    <Input 
                    variant="invisible" 
                    name="removedPartNumber"
                    value={MODetailInput.removedPartNumber}
                    onChange={handleChange}
                    placeholder="---"
                    />
                </CaseField>


                <CaseField label="Removed Serial Number " icon>
                    <Input 
                    variant="invisible" 
                    name="removedSerialNumber"
                    value={MODetailInput.removedSerialNumber}
                    onChange={handleChange}
                    placeholder="---"
                    />
                </CaseField>


                
                <CaseField label="Removed Part Desc" icon>
                    <Input 
                    variant="invisible" 
                    name="removedPartDescription"
                    value={MODetailInput.removedPartDescription}
                    onChange={handleChange}
                    placeholder="---"
                    />
                </CaseField>

              </CardContent>
            </Card>

            <Card className="rounded-md "> 
              <CardHeader>
                <CardTitle className="text-lg">Part Return Details</CardTitle>
              </CardHeader>
              <CardContent className="grid items-center grid-cols-6 gap-10">

                <CaseField label="Returnable Code" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                <CaseField label="Return Type Code Identifier" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                 <CaseField label="Return Instructions" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                 <CaseField label="Return Tracking Number" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                  <CaseField label="Return Override Flag" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                 <CaseField label="Return Ovveride Reason" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>


                <CaseField label="RMA" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                
                <CaseField label="RMA Identifier" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>

                <CaseField label="Return Deadline" icon>
                  <Input variant="invisible" placeholder="---" />
                </CaseField>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mo_attachments">
            <Card className="flex-col mt-5">
              <CardContent className="grid gap-5">
                <span className="text-xl font-bold">Timeline</span>
                <div className="flex font-bold">
                  <Input placeholder="Search Timeline" className="text-sm font-medium"></Input>
                </div>
                <span className="text-xl font-bold">Create a note</span>
                <div className="">
                    <Input type="text" className="border-1" placeholder="Tittle" ></Input>
                    <textarea placeholder="Note" className="w-full h-20 pt-2 pl-3 mt-2 resize-none border-1"></textarea>
                    <Button variant="outline" className="mr-3">Add note</Button>
                    <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
    
    </>
  );
  
};

const FailureSelect = ({ failureId, setMODetailInput }) => {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false); // Track if input is focused

  useEffect(() => {    
    // Fetch default options once
    ApiCustomer.get('/api/failure/options').then((res) => {
      const defaultOptions = res.data.map(f => ({
        value: f.FailureId.toString(),
        label: `${f.Name} — ${f.Description ?? ''}`
      }));
      setSearchResults(defaultOptions);
    });
  if (failureId) {
    // Ambil data failure berdasarkan ID yang sudah ada
    ApiCustomer.get(`/api/failure/${failureId}`).then((res) => {
      const f = res.data.data;
      const label = `${f.Name} — ${f.Description ?? ''}`;
      setInputValue(f.FailureId);
    }).catch(() => {
      setInputValue(''); // Kosongkan jika tidak ditemukan
    });
  }
}, [failureId]);


  const fetchFailures = debounce((query) => {
      if (!query || query.length < 2) return;
    ApiCustomer.get(`/api/failure/options?q=${query}`).then((res) => {
      const limited = res.data.slice(0, 3).map(f => ({
        value: f.FailureId.toString(),
        label: `${f.Name} — ${f.Description ?? ''}`
      }));
      setSearchResults(limited);
    });
  }, 300);

  const handleInputChange = (value) => {
    setInputValue(value);
    fetchFailures(value);
    setMODetailInput((prev) => ({
      ...prev,
      failureId: value,
    }));
  };
  

  const handleSelect = (selected) => {
    setInputValue(selected.label);
    setSearchResults([
      selected,
      ...searchResults.filter((opt) => opt.value !== selected.value),

    ]);
    setMODetailInput((prev) => ({
      ...prev,
      failureId: selected.value,
      failureName: selected.label,
    }));
    console.log("selected.value",selected.value)
  };

  // Handle focus and blur events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 150); // Delay to allow click on dropdown
  };

  return (
    <CaseField label={"Failure Code"} star>
      <div className="relative w-full">
     
        <SearchCommandBlock
          name="failureId"
          value={String(inputValue) }
          onChange={handleInputChange}    
          placeholder="Search Failure..."
          options={searchResults}
        />

        {/* Show dropdown only if results exist and input is focused */}
        {isFocused && (
          <ul className="absolute z-10 w-full mt-1 overflow-y-auto transition-all duration-200 bg-white border rounded shadow-lg ">
            {searchResults.length > 0 ? (
              searchResults.map((opt) => (
                <li
                  key={opt.value}
                  className="p-3 cursor-pointer hover:bg-gray-200"
                  onMouseDown={() => handleSelect(opt)} // Use onMouseDown to prevent blur before click
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="p-3 text-gray-500">No results found</li>
            )}
          </ul>
        )}
      </div>
    </CaseField>
  );
};
