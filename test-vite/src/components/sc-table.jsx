import React, { useState } from "react";
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
import { BtnModal1 } from "./sc-modal";
import { BtnModal2 } from "./sc-modal";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { ContactRound } from "lucide-react";







export function TableCompany({ selectedAsset = [] }) {
  console.log("Received asset in TableCompany:", selectedAsset);
  const companies = selectedAsset?.site_account ? [
    {
      key: selectedAsset?.SiteAccountID,
      company: selectedAsset?.site_account?.Company,
    },
    {
      text: `${selectedAsset?.site_account?.AddressLine1} ${selectedAsset?.site_account?.City} ${selectedAsset?.site_account?.StateProvince} ${selectedAsset?.site_account?.Country}-${selectedAsset?.site_account?.ZipPostalCode} | Email: ${selectedAsset?.site_account?.Email} | Phone : ${selectedAsset?.site_account?.PrimaryPhone}`,
    },
  ] : null;
  console.log("Invoices")
  console.log(companies)
  return (
    <Table className="w-255 ml-7 flex-col justify-center items-center drop-shadow-md">
      <TableHeader className="bg-blue-400">
        <TableRow>
          <TableHead className="text-white text-xl ">
          <Checkbox className="border-black border-3 w-7.5 h-7 fixed"></Checkbox>
            { companies !== null ? companies[0].company : "" }
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-neutral-200">
        { companies !== null ? (
            <TableRow key={selectedAsset.SerialNumber}>
              <TableCell className="font-medium" colSpan={5}>{companies[1].text}</TableCell>
            </TableRow>
          
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center font-medium">
              No Company Available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
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
    <Table className="w-255 ml-7 drop-shadow-md">
        <TableHeader className="bg-blue-400">
        <TableRow>
          <TableHead className="text-white h-12 text-xl">
           Contact

          <Input placeholder="Search..." className="border-2 w-50 h-8 mt-2 p-2 border-black rounded-md"></Input>
       
          <BtnModal1></BtnModal1>
          </TableHead>
        
        </TableRow>
      </TableHeader>

      <TableHeader className="bg-neutral-300">
        <TableRow>
          <TableHead className="text-black">First Name</TableHead>
          <TableHead className="text-black">Last Name</TableHead>
          <TableHead className="text-black">Email</TableHead>
          <TableHead className="text-black">Phone</TableHead>
          <TableHead className="text-black">Country</TableHead>
          <TableHead className="text-black">Source</TableHead>
          <TableHead className="text-black">HP ID</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="bg-neutral-100">
        {contacts !== null ? contacts.map((contact) => (
          <TableRow key={contact.contactID}>
            <TableCell>{contact.firstname}</TableCell>
            <TableCell>{contact.lastname}</TableCell>
            <TableCell>{contact.email}</TableCell>
            <TableCell>{contact.phone}</TableCell>
            <TableCell>{contact.country}</TableCell>
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
  );
}

export function TableAsset({ selectedAsset }) {
  const assets = selectedAsset ? [
    {
      assetID : selectedAsset.AssetID,
      serialNumber : selectedAsset.SerialNumber,
      productName : selectedAsset.ProductName,
      productNumber : selectedAsset.ProductNumber,
      productLine : selectedAsset.ProductLine,
      // TODO : Search what tf is this mean
      isparent: "-",
      parentasset: "-",
      source: "CRM",
    },
  ] : null;
  return (
    <Table className="w-255 ml-7 drop-shadow-md">
        <TableHeader className="bg-blue-400">
        <TableRow>
          <TableHead className="text-white text-xl">
          Asset
          </TableHead>
          
        </TableRow>
        
      </TableHeader>

      <TableHeader className="bg-neutral-300">
        <TableRow>
          <TableHead className="text-black">Product Name</TableHead>
          <TableHead className="text-black">Product Number</TableHead>
          <TableHead className="text-black">Serial Number</TableHead>
          <TableHead className="text-black">Product Line</TableHead>
          <TableHead className="text-black">Is Parent</TableHead>
          <TableHead className="text-black">Parent Asset</TableHead>
          <TableHead className="text-black">Source</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="bg-neutral-100">
        {assets !== null? assets.map((asset) => (
          <TableRow key={asset.assetID}>
            <TableCell>{asset.productName}</TableCell>
            <TableCell>{asset.productNumber}</TableCell>
            <TableCell>{asset.serialNumber}</TableCell>
            <TableCell>{asset.productLine}</TableCell>
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
  );
}