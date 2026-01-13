import React, { useState, useEffect , useMemo, use, useCallback} from "react";
import ApiCustomer from "@/api";
import { ContactEdit, ContactDelete } from "@/components/model/sc-modal";
import { CompanyEdit, CompanyDelete } from "@/components/model/sc-modal";
import { ProductAdd, ProductEdit, ProductDelete } from "@/components/model/sc-modal";
import { BtnModalAsset, AssetEdit, AssetDelete } from "@/components/model/sc-modal";
import {
  ProductTypeAdd,
  ProductTypeEdit,
  ProductTypeDelete,
} from "@/components/model/sc-modal";
import {
  WarrantyServiceAdd,
  WarrantyServiceEdit,
  WarrantyServiceDelete,
} from "@/components/model/sc-modal";
import { MaterialOrderEdit, MaterialOrderDelete } from "@/components/model/sc-modal";
import { WorkOrderDelete, WorkOrderEdit } from "@/components/model/sc-modal";
import { UserAdd, UserEdit, UserDelete } from "@/components/model/sc-modal";
import { PartAdd,PartEdit, PartDelete } from "@/components/model/sc-modal";
import { ResourceAdd, ResourceEdit, ResourceDelete } from "@/components/model/sc-modal";
import { ResourceAccountAdd, ResourceAccountEdit, ResourceAccountDelete } from "@/components/model/sc-modal";
import { SubkTechnicianAdd, SubkTechnicianEdit, SubkTechnicianDelete } from "@/components/model/sc-modal";
import { SymptomCodeAdd, SymptomCodeEdit, SymptomCodeDelete } from "@/components/model/sc-modal";
import { BookingsAdd, BookingsEdit, BookingsDelete } from "@/components/model/sc-modal";
import { BookingDetailsAdd, BookingDetailsEdit, BookingDetailsDelete } from "@/components/model/sc-modal";
import { BookingStatusAdd, BookingStatusEdit, BookingStatusDelete} from "@/components/model/sc-modal";
import { RepairClassCodeAdd, RepairClassCodeEdit, RepairClassCodeDelete } from "@/components/model/sc-modal";
import { ServiceCatalogAdd, ServiceCatalogEdit, ServiceCatalogDelete } from "@/components/model/sc-modal";
import { ServiceTypeAdd, ServiceTypeEdit, ServiceTypeDelete } from "@/components/model/sc-modal";
import { OTCAdd, OTCEdit, OTCDelete} from "@/components/model/sc-modal";
import { CrsAdd, CrsEdit, CrsDelete } from "@/components/model/sc-modal";
import { NmuAdd, NmuEdit, NmuDelete} from "@/components/model/sc-modal";
import { NmuItemAdd, NmuItemEdit, NmuItemDelete } from "@/components/model/sc-modal";
import { AssetTemplateButton, AssetImport } from "@/components/importFileComponent/AssetImport"
import { ProductTemplateButton, ProductImport } from "@/components/importFileComponent/ProductImport"
import { PartTemplateButton, PartImport } from "@/components/importFileComponent/PartImport"
import { FailureAdd, 
  FailureEdit, 
  FailureDelete } from "@/components/model/sc-modal";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ExportExcel } from "@/components/Export-Excel";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectGroup, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ComboboxDemo } from "@/components/sc-select";
import { Cancel } from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import { STATUS_ENUM_TO_LABEL } from "./CaseDetailReimagined";

export const Contact_table = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [goToPageInput, setGoToPageInput] = useState("");
  // Ubah dari konstanta menjadi state agar bisa diubah
  const [itemsPerPage, setItemsPerPage] = useState(10); 

  // Sort config (pakai style BookingsTable)
  const [sortConfig, setSortConfig] = useState({
    key: "ContactID",
    direction: "asc",
  });

  // Filters
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSalutation, setSelectedSalutation] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZipCode, setSelectedZipCode] = useState(null);
  const [picNameSearch, setPicNameSearch] = useState(null);
  const [picEmailSearch, setPicEmailSearch] = useState(null);
  const [picPhoneSearch, setPicPhoneSearch] = useState(null);
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch all contacts
  const fetchContacts = async () => {
    Swal.fire({
      title: "Memuat Data Kontak...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    setLoading(true);
    setError(null);

    try {
      const response = await ApiCustomer.get(`/api/contact-information`);
      setContacts(response.data.data || []);
    } catch (err) {
      toast.error("Error fetching contact data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Dropdown options
  const companyOptions = useMemo(() => {
    const companies = contacts
      .map((c) => c.Company)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(companies)]
    return unique.map((name, index) => ({
      id: `company-${index}`,
      name,
    }))
  }, [contacts])

  const salutationOptions = useMemo(() => {
    const salutations = contacts
      .map((c) => c.Salutation)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(salutations)]
    return unique.map((name, index) => ({
      id: `salutation-${index}`,
      name,
    }))
  }, [contacts])

  const languageOptions = useMemo(() => {
    const langs = contacts
      .map((c) => c.PreferredLanguage)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(langs)]
    return unique.map((name, index) => ({
      id: `lang-${index}`,
      name,
    }))
  }, [contacts])

  const countryOptions = useMemo(() => {
    const countries = contacts
      .map((c) => c.Country)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(countries)]
    return unique.map((name, index) => ({
      id: `country-${index}`,
      name,
    }))
  }, [contacts])

  const stateOptions = useMemo(() => {
    const states = contacts
      .filter(
        (c) => !selectedCountry?.name || c.Country === selectedCountry.name
      )
      .map((c) => c.StateProvince)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(states)]
    return unique.map((name, index) => ({
      id: `state-${index}`,
      name,
    }))
  }, [contacts, selectedCountry])

  const cityOptions = useMemo(() => {
    const cities = contacts
      .filter(
        (c) =>
          (!selectedCountry?.name || c.Country === selectedCountry.name) &&
          (!selectedState?.name || c.StateProvince === selectedState.name)
      )
      .map((c) => c.City)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(cities)]
    return unique.map((name, index) => ({
      id: `city-${index}`,
      name,
    }))
  }, [contacts, selectedCountry, selectedState])

  const zipCodeOptions = useMemo(() => {
    const zips = contacts
      .filter(
        (c) =>
          (!selectedCountry?.name || c.Country === selectedCountry.name) &&
          (!selectedState?.name || c.StateProvince === selectedState.name) &&
          (!selectedCity?.name || c.City === selectedCity.name)
      )
      .map((c) => c.ZipPostalCode)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(zips)]
    return unique.map((name, index) => ({
      id: `zip-${index}`,
      name,
    }))
  }, [contacts, selectedCountry, selectedState, selectedCity])

  // Filtering (search + dropdown)
  const filteredData = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = Object.values(contact).some((val) =>
        val?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );

      return (
        matchesSearch &&
        (!selectedCompany?.name || contact.Company === selectedCompany.name) &&
        (!selectedSalutation?.name || contact.Salutation === selectedSalutation.name) &&
        (!selectedLanguage?.name || contact.PreferredLanguage === selectedLanguage.name) &&
        (!selectedCountry?.name || contact.Country === selectedCountry.name) &&
        (!selectedState?.name || contact.StateProvince === selectedState.name) &&
        (!selectedCity?.name || contact.City === selectedCity.name) &&
        (!selectedZipCode?.name || contact.ZipPostalCode === selectedZipCode.name) &&
        (!picNameSearch || (contact.PIC_Name && contact.PIC_Name.toLowerCase().includes(picNameSearch.toLowerCase()))) &&
        (!picEmailSearch || (contact.PIC_Email && contact.PIC_Email.toLowerCase().includes(picEmailSearch.toLowerCase()))) &&
        (!picPhoneSearch || (contact.PIC_Phone && contact.PIC_Phone.toLowerCase().includes(picPhoneSearch.toLowerCase())))
      );
    });
  }, [
    debouncedSearchTerm,
    contacts,
    selectedCompany,
    selectedSalutation,
    selectedLanguage,
    selectedCountry,
    selectedState,
    selectedCity,
    selectedZipCode,
    picNameSearch,
    picEmailSearch,
    picPhoneSearch
  ]);

  // Sorting (pakai sortConfig)
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        // cek apakah numeric
        if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
          aVal = Number(aVal);
          bVal = Number(bVal);
        } else {
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedData, currentPage, itemsPerPage]); // Tambahkan itemsPerPage di dependency array

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Ubah fungsi getSortSymbol menjadi getSortIcon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // Tambahkan handler untuk Go to Page
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
    setGoToPageInput("");
  };

    const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCompany(null);
    setSelectedSalutation(null);
    setSelectedLanguage(null);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setSelectedZipCode(null);
    setSortConfig({ key: "Company", direction: "asc" });
    setCurrentPage(1);
  };

  return (
    <div className="grid p-6 grid-cols-1 w-full  rounded-2xl">
      <h2 className="mb-4 text-xl sm:text-2xl font-bold">📊 Contact Management</h2>

      {/* Search + Filters */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between w-full">
        <input
          type="text"
          placeholder="🔍 Search contacts..."
          className="w-full sm:w-1/3 lg:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
        {/* Dropdown filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 w-full">
       <ComboboxDemo
          id="company"
          value={selectedCompany}
          setValue={(val) => {
            setSelectedCompany(val?.name ? val : null)
            setCurrentPage(1)
          }}
          options={companyOptions}
          placeholder="🏢 All Companies"
          disabled={false}
        />

        {/* Salutation */}
        <ComboboxDemo
          id="salutation"
          value={selectedSalutation}
          setValue={(val) => {
            setSelectedSalutation(val?.name ? val : null)
            setCurrentPage(1)
          }}
          options={salutationOptions}
          placeholder="🙋 All Salutations"
          disabled={false}
        />

        {/* Language */}
        <ComboboxDemo
          id="language"
          value={selectedLanguage}
          setValue={(val) => {
            setSelectedLanguage(val?.name ? val : null)
            setCurrentPage(1)
          }}
          options={languageOptions}
          placeholder="🌐 All Languages"
          disabled={false}
        />

        {/* Country */}
        <ComboboxDemo
          id="country"
          value={selectedCountry}
          setValue={(val) => {
            setSelectedCountry(val?.name ? val : null)
            setSelectedState(null)
            setSelectedCity(null)
            setSelectedZipCode(null)
            setCurrentPage(1)
          }}
          options={countryOptions}
          placeholder="🌍 All Countries"
          disabled={false}
        />

        {/* State */}
        <ComboboxDemo
          id="state"
          value={selectedState}
          setValue={(val) => {
            setSelectedState(val?.name ? val : null)
            setSelectedCity(null)
            setSelectedZipCode(null)
            setCurrentPage(1)
          }}
          options={stateOptions}
          placeholder="🗺 All States"
          disabled={!selectedCountry?.name && contacts.length > 0}
        />

        {/* City */}
        <ComboboxDemo
          id="city"
          value={selectedCity}
          setValue={(val) => {
            setSelectedCity(val?.name ? val : null)
            setSelectedZipCode(null)
            setCurrentPage(1)
          }}
          options={cityOptions}
          placeholder="🏙 All Cities"
          disabled={
            ((!selectedCountry?.name && contacts.length > 0) ||
              (!selectedState?.name && contacts.length > 0))
          }
        />

        {/* Zip */}
        <ComboboxDemo
          id="zip"
          value={selectedZipCode}
          setValue={(val) => {
            setSelectedZipCode(val?.name ? val : null)
            setCurrentPage(1)
          }}
          options={zipCodeOptions}
          placeholder="📮 All Zip Codes"
          disabled={
            ((!selectedCountry?.name && contacts.length > 0) ||
              (!selectedState?.name && contacts.length > 0) ||
              (!selectedCity?.name && contacts.length > 0))
          }
        />
        <div className="flex item-center gap-1">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md
                       bg-slate-500 hover:bg-slate-600
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-600 dark:hover:bg-slate-500 dark:focus:ring-sky-500"
        >
          Reset Filters
        </button>
      </div>
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Table */}
      <div className="relative w-full max-h-[85vh] overflow-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <Table className=" min-w-full border-collapse text-[10px] leading-tight">
          <TableHeader className="sticky z-10 top-0 bg-gray-200/95 dark:bg-slate-900 text-[10px] leading-tight">
            <TableRow className="text-slate-800 dark:text-slate-100">
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border">No</TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("ContactID")}>
                Contact ID {getSortIcon("ContactID")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("Company")}>
                Company {getSortIcon("Company")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("Salutation")}>
                Salutation {getSortIcon("Salutation")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("FirstName")}>
                First Name {getSortIcon("FirstName")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("LastName")}>
                Last Name {getSortIcon("LastName")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("Email")}>
                Email {getSortIcon("Email")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("PreferredLanguage")}>
                Preferred Language {getSortIcon("PreferredLanguage")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("Phone")}>
                Phone {getSortIcon("Phone")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("Mobile")}>
                Mobile {getSortIcon("Mobile")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("WorkPhone")}>
                Work Phone {getSortIcon("WorkPhone")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("WorkExtension")}>
                Work Extension {getSortIcon("WorkExtension")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("OtherPhone")}>
                Other Phone {getSortIcon("OtherPhone")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("OtherExtension")}>
                Other Extension {getSortIcon("OtherExtension")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("Fax")}>
                Fax {getSortIcon("Fax")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("AddressLine1")}>
                Address Line 1 {getSortIcon("AddressLine1")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("AddressLine2")}>
                Address Line 2 {getSortIcon("AddressLine2")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("City")}>
                City {getSortIcon("City")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("StateProvince")}>
                State/Province {getSortIcon("StateProvince")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("Country")}>
                Country {getSortIcon("Country")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("ZipPostalCode")}>
                Zip/Postal Code {getSortIcon("ZipPostalCode")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("PIC_Name")}>
                PIC Name {getSortIcon("PIC_Name")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("PIC_Email")}>
                PIC Email {getSortIcon("PIC_Email")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center border cursor-pointer" onClick={() => handleSort("PIC_Phone")}>
                PIC Phone {getSortIcon("PIC_Phone")}
              </TableHead>
              <TableHead className="px-1 py-1 text-[10px] font-semiblod text-center ">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-auto max-h-[65vh]">
            {currentData.length > 0 ? (
              currentData.map((contact, index) => (
                <TableRow key={contact.ContactID} className={`hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.ContactID}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.Company}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.Salutation}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.FirstName}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.LastName}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.Email}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.PreferredLanguage}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.Phone}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.Mobile}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.WorkPhone}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.WorkExtension}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.OtherPhone}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.OtherExtension}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.Fax}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.AddressLine1}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.AddressLine2}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.City}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.StateProvince}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.Country}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.ZipPostalCode}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.PIC_Name}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.PIC_Email}</TableCell>
                  <TableCell className="px-1 py-1 text-[10px] border whitespace-nowrap border">{contact.PIC_Phone}</TableCell>
                  <TableCell className="p-1 border">
                    <div className="flex justify-center gap-1 scale">
                    <ContactEdit contactID={contact.ContactID} onUpdate={fetchContacts} />
                    <ContactDelete contactID={contact.ContactID} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="22" className="p-6 text-center text-gray-500">No data found 🚫</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:items-center sm:justify-between w-full">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> contacts
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const Company_table = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // sort
  const [sortConfig, setSortConfig] = useState({ key: "Company", direction: "asc" });

  // filter
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZipCode, setSelectedZipCode] = useState(null);

  const countryOptions = useMemo(() => {
    const countries = companies.map((c) => c.Country).filter(Boolean).sort()
      const unique = [...new Set(countries)]
        return unique.map((name, index) => ({
          id: `country-${index}`,
          name,
        }))
      }, [companies])

  const statesOptions = useMemo(() => {
    const states = companies
      .filter((c) => !selectedCountry?.name || c.Country === selectedCountry.name)
      .map((c) => c.StateProvince)
      .filter(Boolean)
      .sort()
        const unique = [...new Set(states)]
        return unique.map((name, index) => ({
          id: `state-${index}`,
          name,
        }))
      }, [companies, selectedCountry])

  const cityOptions = useMemo(() => {
    const cities = companies
      .filter((c) => (!selectedCountry?.name || c.Country === selectedCountry.name) &&
                     (!selectedState?.name || c.StateProvince === selectedState.name))
      .map((c) => c.City)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(cities)]
    return unique.map((name, index) => ({
      id: `city-${index}`,
      name,
    }))
  }, [companies, selectedCountry, selectedState])

  const zipCodeOptions = useMemo(() => {
    const zips = companies
      .filter((c) => (!selectedCountry?.name || c.Country === selectedCountry.name) && (!selectedState?.name || c.StateProvince === selectedState.name) && (!selectedCity?.name || c.City === selectedCity.name))
      .map((c) => c.ZipPostalCode)
      .filter(Boolean)
      .sort()
    const unique = [...new Set(zips)]
    return unique.map((name, index) => ({
      id: `zip-${index}`,
      name,
    }))
  }, [companies, selectedCountry, selectedState, selectedCity])

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // fetch
  const fetchCompanies = async () => {
    setError(null);
    setLoading(true);
    Swal.fire({
      title: "Memuat Data Company...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const res = await ApiCustomer.get(`/api/site_account`);
      setCompanies(res.data.data);
      Swal.close();
    } catch (err) {
      toast.error("Error fetching company data:", err);
      setError("Failed to fetch data");
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data perusahaan.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // filter + search
  const filteredData = companies.filter((c) => {
    const matchesSearch = Object.values(c).some((val) =>
      val?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    const matchesCountry = !selectedCountry?.name || c.Country === selectedCountry.name;
    const matchesState = !selectedState?.name || c.StateProvince === selectedState.name;
    const matchesCity = !selectedCity?.name || c.City === selectedCity.name;
    const matchesZipCode = !selectedZipCode?.name || c.ZipPostalCode === selectedZipCode.name;
    return matchesSearch && matchesCountry && matchesState && matchesCity && matchesZipCode;
  });

  // sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (aVal == null) aVal = "";
        if (bVal == null) bVal = "";
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600 dark:text-sky-300" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600 dark:text-sky-300 " />
    );
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCountry("null");
    setSelectedState("null");
    setSelectedCity("null");
    setSelectedZipCode("null");
    setSortConfig({ key: "Company", direction: "asc" });
    setCurrentPage(1);
  };

  return (
    <div className="p-6 grid grid-flow-row gap-4 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 rounded-2xl">
      <h2 className="mb-6 text-2xl font-bold">📊 Company Management</h2>

      {/* Kontainer Flexbox untuk pencarian dan tombol reset */}
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 Search companies..."
          className="w-full p-2 text-sm border rounded-lg shadow-sm sm:w-1/3
                     bg-white border-slate-300 text-slate-800 placeholder:text-slate-400
                     focus:outline-none focus:ring-2 focus:ring-sky-400
                     dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-sky-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      
      {/* Filters */}
      <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <ComboboxDemo
          id="country"
          value={selectedCountry}
          setValue={(val) => {
            setSelectedCountry(val?.name ?val : null)
            setSelectedState("null");
            setSelectedCity("null");
            setSelectedZipCode("null");
            setCurrentPage(1);
          }}
          options={countryOptions}
          placeholder="🌍 All Countries"
          disabled={false}
        />
        <ComboboxDemo
          id="state"
          value={selectedState}
          setValue={(val) => {
            setSelectedState(val?.name ?val : null)
            setSelectedCity("null");
            setSelectedZipCode("null");
            setCurrentPage(1);
          }}
          options={statesOptions}
          placeholder="🏞 All States "
          disabled={!selectedCountry?.name && companies.length > 0}
        />
        <ComboboxDemo
          id="city"
          value={selectedCity}
          setValue={(val) => {
            setSelectedCity(val?.name ?val : null)
            setSelectedZipCode("null");
            setCurrentPage(1);
          }}
          options={cityOptions}
          placeholder="🏙 All Cities"
          disabled={(!selectedCountry?.name && companies.length > 0) || (!selectedState?.name && companies.length > 0)}
        />
        <ComboboxDemo
          id="zip"
          value={selectedZipCode}
          setValue={(val) => {
            setSelectedZipCode(val?.name ?val : null)
            setCurrentPage(1);
          }}
          options={zipCodeOptions}
          placeholder="📮 All Zip Codes"
          disabled={(!selectedCountry?.name && companies.length > 0) || (!selectedState?.name && companies.length > 0) || (!selectedCity?.name && companies.length > 0)}
        />
        {/* Reset Filter Button */}
        <div className="flex items-center">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md
                       bg-slate-500 hover:bg-slate-600
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-600 dark:hover:bg-slate-500 dark:focus:ring-sky-500"
        >
          Reset Filters
        </button>
        </div>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Table */}
      <div className="relative w-full max-h-[600px] overflow-auto overscroll-contain
                      bg-white/95 dark:bg-slate-900/90
                      rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <Table className="min-w-full border-collapse text-[10.5px] leading-[1.15]">
          <TableHeader className="sticky z-10 top-0 bg-gray-100/95 dark:bg-slate-800/95">
            <TableRow className="text-slate-800 dark:text-slate-100">
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap">No</TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("Company")}>
                Company  {getSortIcon("Company")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("Email")}>
                Email {getSortIcon("Email")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("PrimaryPhone")}>
                Primary Phone {getSortIcon("PrimaryPhone")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("WhatsappNo")}>
                Whatsapp {getSortIcon("WhatsappNo")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("AddressLine1")}>
                Address Line 1 {getSortIcon("AddressLine1")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("AddressLine2")}>
                Address Line 2 {getSortIcon("AddressLine2")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("Country")}>
                Country {getSortIcon("Country")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("StateProvince")}>
                State/Province {getSortIcon("StateProvince")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("City")}>
                City {getSortIcon("City")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("ZipPostalCode")}>
                Zip/Postal Code {getSortIcon("ZipPostalCode")}
              </TableHead>
              <TableHead className="px-2 py-1 text-[11px] font-semibold text center border border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort("NPWP")}>
                NPWP {getSortIcon("NPWP")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border border-slate-200 dark:border-slate-700 whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className=" max-h-[65vh]">
            {currentData.length > 0 ? (
              currentData.map((c, i) => (
                <TableRow key={c.SiteAccountID}
                    className={`hover:bg-blue-50/70 dark:hover:bg-slate-700 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50 dark:bg-slate-800/80"}`}>
                  <TableCell className="px-2 py-1 text-[11px] text-center border border-slate-200 dark:border-slate-800">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.Company}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.Email}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.PrimaryPhone}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.WhatsappNo}</TableCell>
                  <TableCell className="px-2 py-[3px] text-[10.5px] border border-slate-200 dark:border-800 align-center"> <div className=" whitespace-normal break-words w-100 max-h-[8.4em] leading-[1.2] oferflow-hidden cursor-help" title={c.AddressLine1}>{c.AddressLine1}</div></TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.AddressLine2}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.Country}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.StateProvince}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.City}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.ZipPostalCode}</TableCell>
                  <TableCell className="px-2 py-[3px] text-center border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{c.NPWP}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border border-slate-200 dark:border-slate-800">
                    <CompanyEdit siteAccountId={c.SiteAccountID} onUpdate={fetchCompanies}/>
                    <CompanyDelete siteAccountId={c.SiteAccountID}
                                   isModalOpen={isModalOpen}
                                   setIsModalOpen={setIsModalOpen}
                                   onUpdate={fetchCompanies}/>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="12" className="p-6 text-center text-sm text-gray-500 dark:text-slate-300">No data found 🚫</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-sky-500"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-700 dark:text-slate-300">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> companies
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300
                         disabled:opacity-50
                         dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300
                         disabled:opacity-50
                         dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg
                           bg-white border-slate-300 text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-sky-400
                           dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-sky-500"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white rounded-lg
                           bg-blue-500 hover:bg-blue-600
                           focus:outline-none focus:ring-2 focus:ring-sky-400
                           dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus:ring-sky-500"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const getToday = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getOneYearAgo = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split("T")[0];
};

export const Case_table = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // ⬅️ Tambahan fitur 1
  const [goToPageInput, setGoToPageInput] = useState(""); // ⬅️ Tambahan fitur 2
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caseData, setCaseData] = useState([]);
  const [openClose, setOpenClose] = useState("All");

  // 🔹 Filter states
  const [selectedHW, setSelectedHW] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCreatedName, setSelectedCreatedName] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState(null);
  const [selectedCaseType, setSelectedCaseType] = useState(null);
  const [selectedWarrantyType, setSelectedWarrantyType] = useState(null);
  const [selectedWarrantyStatus, setSelectedWarrantyStatus] = useState(null);
  const [startDate, setStartDate] = useState(getOneYearAgo);
  const [endDate, setEndDate] = useState(getToday);

  // 🔹 Sort state
  const [sortConfig, setSortConfig] = useState({
    key: "CaseID",
    direction: "asc",
  });

  // 🔹 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 🔹 Fetch data
  const fetchCaseDataTable = async () => {
    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);

    //   const oneYearMs = 365 * 24 * 60 * 60 * 1000;

    //   if (end - start > oneYearMs) {
    //     Swal.fire({
    //       icon: "warning",
    //       title
    //     })
    //   }
    // }
    /**
     * THIS IS THE TEMPORARY FIX
     * THE RESOURCE ID IS EXPOSED WHILE DOING THIS
     * I TRY ANOTHER METHOD WHEN THIS IS DONE
     *  -miku21
     */
    const isAgreeAllResource = user?.role === 'admin' || user?.role === 'apo' || user?.role === 'cm';
    const savedTeamId = localStorage.getItem("activeTeamId");
    const baseurl = `/api/case-information`;
    const params = new URLSearchParams();
    if (openClose !== "All") {
      params.append("CaseStatus", openClose);
    }

    if (!isAgreeAllResource) {
      params.append("resource", savedTeamId);
    }

    if (startDate) {
      params.append("startDate", startDate);
    }

    if (endDate) {
      params.append("endDate", endDate);
    }

    const url = params.toString() ? `${baseurl}?${params.toString()}` : baseurl;

    Swal.fire({
      title: "Memuat Data Case....",
      text: "Mohon Tunggu Sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setError(null);

    try {
      const response = await ApiCustomer.get(url);
      if (response.data.success) {
        setCaseData(response.data.data);
      } else {
        setError("Failed to fetch case data");
      }
      Swal.close();
    } catch (err) {
      Swal.close();

      // 👉 cek apakah error dari backend
      if (err.response) {
        const message = err.response.data?.message || "Terjadi kesalahan";

        toast.error(message);

        Swal.fire({
          title: "Range melebihi batas",
          text: message,
          icon: "info",
          confirmButtonText: "OK",
        });
      } else {
        // 👉 error jaringan / timeout / dll
        toast.error("Network error");

        Swal.fire({
          title: "Error!",
          text: "Gagal terhubung ke server.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  useEffect(() => {
    fetchCaseDataTable();
  }, [openClose, startDate, endDate]);

  // 🔹 Unique dropdown values
  const uniqueHW = ["All", ...new Set(caseData.map((c) => c.HW))];
  const uniqueProduct = ["All", ...new Set(caseData.map((c) => c.ProductName))];
  const uniqueCreatedName = ["All", ...new Set(caseData.map((c) => c.CreatedName))];
  const uniqueOwner = ["All", ...new Set(caseData.map((c) => c.Owner))];
  const uniqueWorkGroup = ["All", ...new Set(caseData.map((c) => c.WorkGroup))];
  const uniqueCaseType = [
  "All",
  ...new Set(
    caseData
        .map((c) => c.caseinformation?.CaseType)
        .filter(Boolean)
    ),
  ];
  const uniqueWarrantyType = [
  "All",
  ...new Set(
    caseData
      .map(
        (c) =>
          c.caseinformation?.asset_information?.WarrantyOTCCode?.WarrantyCondition
      )
      .filter(Boolean)
    ),
  ];

  const uniqueWarrantyStatus = [
    "All",
    ...new Set(
      caseData
        .map(
          (c) =>
            c.caseinformation?.asset_information?.WarrantyOTCCode?.Description
        )
        .filter(Boolean)
    ),
  ];

  const hwOptions = useMemo(
    () =>
      uniqueHW
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: 1, name: v})),
    [caseData]
  );
  const productOptions = useMemo(
    () =>
      uniqueProduct
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: i, name: v })),
    [caseData]
  );
    const createdNameOptions = useMemo(
    () =>
      uniqueCreatedName
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: i, name: v })),
    [caseData]
  );
    const ownerOptions = useMemo(
    () =>
      uniqueOwner
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: i, name: v })),
    [caseData]
  );
    const workGroupOptions = useMemo(
    () =>
      uniqueWorkGroup
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: i, name: v })),
    [caseData]
  );
    const caseTypeOptions = useMemo(
    () =>
      uniqueCaseType
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: i, name: v })),
    [caseData]
  );
    const warrantyTypeOptions = useMemo(
    () =>
      uniqueWarrantyType
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: i, name: v })),
    [caseData]
  );
    const warrantyStatusOptions = useMemo(
    () =>
      uniqueWarrantyStatus
      .filter((v) => v && v !== "All")
      .map((v, i) => ({ id: i, name: v })),
    [caseData]
  );

  // 🔹 Filtering
  const filteredData = caseData
    .filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    )
    .filter((item) => 
      selectedHW ? item.HW === selectedHW.name :true
    )
    .filter((item) =>
      selectedProduct ? item.ProductName === selectedProduct.name : true
    )
    .filter((item) =>
      selectedCreatedName ? item.CreatedName === selectedCreatedName : true
    )
    .filter((item) => 
      selectedOwner ? item.Owner === selectedOwner.name : true
    )
    .filter((item) =>
      selectedWorkGroup ? item.WorkGroup === selectedWorkGroup.name : true
    )
    .filter((item) => {
    if (!selectedWarrantyType) return true;
    const wType =
      item.caseinformation?.asset_information?.WarrantyOTCCode?.WarrantyCondition;
    return wType === selectedWarrantyType.name;
    })
    .filter((item) => {
    if (!selectedCaseType) return true;
      const cType = item.caseinformation?.CaseType;
      return cType === selectedCaseType.name;
    })
    // ➕ Filter Warranty Status
    .filter((item) => {
      if (!selectedWarrantyStatus) return true;
      const wStatus =
        item.caseinformation?.asset_information?.WarrantyOTCCode?.Description;
      return wStatus === selectedWarrantyStatus.name;
    });
  
    // 🔹 Parser khusus tanggal format "dd/MM/yyyy, HH.mm.ss"
  const parseCustomDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(", ");
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(".").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

const sortedData = useMemo(() => {
  const sorted = [...filteredData];
  if (sortConfig.key) {
    sorted.sort((a, b) => {
      let aVal, bVal;

      // 🔹 Deteksi nested path manual
      switch (sortConfig.key) {
        case "CaseID_Manual":
          aVal = a.caseinformation?.CaseID_Manual;
          bVal = b.caseinformation?.CaseID_Manual;
          break;
        case "CaseID_Manual_Date":
          aVal = a.caseinformation?.CaseID_Manual_Date;
          bVal = b.caseinformation?.CaseID_Manual_Date;
          break;
        case "WarrantyType":
          aVal = a.caseinformation?.asset_information?.WarrantyOTCCode?.WarrantyCondition;
          bVal = b.caseinformation?.asset_information?.WarrantyOTCCode?.WarrantyCondition;
          break;
        case "CaseType":
          aVal = a.caseinformation?.CaseType;
          bVal = b.caseinformation?.CaseType;
          break;
        case "WarrantyStatus":
          aVal = a.caseinformation?.asset_information?.WarrantyOTCCode?.Description;
          bVal = b.caseinformation?.asset_information?.WarrantyOTCCode?.Description;
          break;
        default:
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
      }

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";
      // 🔹 Parse tanggal khusus
      if (sortConfig.key === "CreatedOn") {
        const dateA =
          aVal instanceof Date
            ? aVal
            : typeof aVal === "string"
            ? parseCustomDate(aVal)
            : null;
        const dateB =
          bVal instanceof Date
            ? bVal
            : typeof bVal === "string"
            ? parseCustomDate(bVal)
            : null;

        if (dateA && dateB) {
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
      }

      // 🔹 Coba numeric sort
      const numA = parseFloat(aVal);
      const numB = parseFloat(bVal);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortConfig.direction === "asc" ? numA - numB : numB - numA;
      }

      // 🔹 String fallback
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }
  return sorted;
}, [filteredData, sortConfig]);

  // 🔹 Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  // 🔹 Reset filters
  const resetFilters = () => {
    setSelectedHW(null);
    setSelectedProduct(null);
    setSelectedCreatedName(null);
    setSelectedOwner(null);
    setSelectedWorkGroup(null);
    setSelectedCaseType(null);
    setSelectedWarrantyType(null);     
    setSelectedWarrantyStatus(null);
    setStartDate(getOneYearAgo());
    setEndDate(getToday());
  };

  // 🔹 Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortSymbol = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600 dark:text-sky-300" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600 dark:text-sky-300" />
    );
  };

  // 🔹 Handle Go to Page
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };


  return (
    <div id="view-all-case" className="grid p-6 grid-cols-1 w-full rounded-2xl
                    bg-slate-50 text-slate-800
                    dark:bg-slate-900/60 dark:text-slate-100">  
      <h2 className="mb-4 text-2xl font-semibold">View All The Case</h2>

      {/* Search */}
      <input
        type="text" id='search-case'
        placeholder="Search..."
        className="w-full sm:w-1/3 p-2 mb-4 text-sm border rounded-lg
                   bg-white border-slate-300 text-slate-800 placeholder:text-slate-400
                   focus:outline-none focus:ring-2 focus:ring-sky-400
                   dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-gray-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-4 items-end" id='filter-case'>
        {/* HW */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by HW</label>
          <ComboboxDemo 
            id="hw"
            value={selectedHW}
            setValue={setSelectedHW}
            options={hwOptions}
            placeholder="All HW"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>
        {/* Product */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by Product Name</label>
          <ComboboxDemo
            id="product"
            value={selectedProduct}
            setValue={setSelectedProduct}
            options={productOptions}
            placeholder="All Product Name"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>
        {/* Created Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by Created Name</label>
          <ComboboxDemo
            id="createdName"
            value={selectedCreatedName}
            setValue={setSelectedCreatedName}
            options={createdNameOptions}
            placeholder="All Created Name"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>
        {/* Owner */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by Owner</label>
          <ComboboxDemo
            id="owner"
            value={selectedOwner}
            setValue={setSelectedOwner}
            options={ownerOptions}
            placeholder="All Owner"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>
        {/* WorkGroup */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by WorkGroup</label>
          <ComboboxDemo
            id="workgroup"
            value={selectedWorkGroup}
            setValue={setSelectedWorkGroup}
            options={workGroupOptions}
            placeholder="All Work Group"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by Case Type</label>
          <ComboboxDemo
            id="caseType"
            value={selectedCaseType}
            setValue={setSelectedCaseType}
            options={caseTypeOptions}
            placeholder="All Case Type"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>
        {/* Warranty Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by Warranty Type</label>
          <ComboboxDemo
            id="warrantyType"
            value={selectedWarrantyType}
            setValue={setSelectedWarrantyType}
            options={warrantyTypeOptions}
            placeholder="All Warranty Type"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>

        {/* Warranty Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter by Warranty Status</label>
          <ComboboxDemo
            id="warrantyStatus"
            value={selectedWarrantyStatus}
            setValue={setSelectedWarrantyStatus}
            options={warrantyStatusOptions}
            placeholder="All Warranty Status"
            className="p-2 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Created Date (From)</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 text-sm border rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Created Date (To)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 text-sm border rounded-lg"
          />
        </div>

         {/* Toggle status */}
      <div className="flex flex-col" id='case-status-toggle'>
        <label htmlFor="status" className="mb-2 text-sm font-medium">Toggle Status Of Case :</label>
        <Select defaultValue="All" value={openClose} onValueChange={setOpenClose}>
          <SelectTrigger id="status" className="w-48 p-2 text-sm border rounded-lg
                         bg-white border-slate-300 text-slate-800
                         focus:outline-none focus:ring-2 focus:ring-sky-400
                         dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500">
            <SelectValue>{openClose}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 dark:text-slate-100">
            <SelectGroup>
              <SelectItem value="Open">Open Case Status</SelectItem>
              <SelectItem value="Close">Close Case Status</SelectItem>
              <SelectItem value="InActive">InActive Case Status</SelectItem>
              <SelectItem value="Cancel">Cancel Case Status</SelectItem>
              <SelectItem value="All">ALL Case Status</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
  {/* Reset */}
        <div className="flex  gap-2" id='case-actionbuttons'>
          <Button id='case-reset-filters'
            onClick={resetFilters}
            className={"bg-blue-500 text-white hover:bg-blue-400 dark:bg-sky-600 dark:hover:bg-sky-400"}
          >
            Reset Filters
          </Button>
           {user?.role === 'admin' || user?.role === 'fd' ||  user?.role === 'celead' ? 
          <ExportExcel caseData={caseData} />
          : null}
        </div>
      </div>

      {/* Loading & Error */}
      {loading && <p className="mb-2 text-sm text-gray-700 dark:text-slate-300">Loading cases...</p>}
      {error && <p className="mb-2 text-sm text-red-500 dark:text-red-400">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto
                      rounded-2xl border border-slate-200 shadow-md
                      bg-white/95 dark:bg-slate-900/90 dark:border-slate-700">
        <Table className="min-w-full border-collapse text-xs sm:text-sm" id='case-table'>
          <TableHeader className="sticky top-0 bg-gray-200/95 dark:bg-slate-800/95">
            <TableRow className="text-sm text-gray-700 uppercase bg-gray-200 dark:bg-slate-800 dark:text-slate-100">
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CaseID")}>
                Case ID {getSortSymbol("CaseID")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CaseID_Manual")}>
                Case ID MANUAL {getSortSymbol("CaseID_Manual")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CaseSubject")}>
                Case Subject {getSortSymbol("CaseSubject")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CustomerAccount")}>
                Customer Company {getSortSymbol("CustomerAccount")}
              </TableHead>
               <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("SerialNumber")}>
                Serial No {getSortSymbol("SerialNumber")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("ProductNumber")}>
                Product No {getSortSymbol("ProductNumber")}
              </TableHead>
                <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("ProductName")}>
                Product Name {getSortSymbol("ProductName")}
              </TableHead>
                <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("WarrantyType")}>
                Warranty Type {getSortSymbol("WarrantyType")}
              </TableHead>
                <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("WarrantyStatus")}>
                Warranty Status {getSortSymbol("WarrantyStatus")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CaseType")}>
                Case Type {getSortSymbol("CaseType")}
              </TableHead>
                <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CreatedOn")}>
                Created On {getSortSymbol("CreatedOn")}
              </TableHead>
                <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CaseID_Manual_Date")}>
                Case ID Manual Date {getSortSymbol("CaseID_Manual_Date")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("Primary")}>
                Customer Name {getSortSymbol("Primary")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CreatedName")}>
                Created Name {getSortSymbol("CreatedName")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("Owner")}>
                Owner {getSortSymbol("Owner")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleSort("CaseStatus")}>
                Case Status {getSortSymbol("CaseStatus")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((caseItem, index) => (
              <TableRow key={caseItem.CaseID} className={cn(
                  "text-center hover:bg-blue-50/70 dark:hover:bg-slate-700",
                  index % 2 === 0
                    ? "bg-white dark:bg-slate-900"
                    : "bg-gray-50 dark:bg-slate-800/80"
                 )}
              >
                <TableCell
                  className="p-2 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-sky-300 cursor-pointer hover:underline"
                  onClick={() => navigate(`/app/case/${caseItem.CaseID}`)}
                >
                  {caseItem.CaseID}
                </TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.caseinformation?.CaseID_Manual}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.CaseSubject}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.CustomerAccount}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.SerialNumber}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.ProductNumber}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.ProductName}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.caseinformation?.asset_information?.WarrantyOTCCode?.WarrantyCondition}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.caseinformation?.asset_information?.WarrantyOTCCode?.Description}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.caseinformation?.CaseType}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.CreatedOn}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.caseinformation?.CaseID_Manual_Date ? new Date(caseItem.caseinformation?.CaseID_Manual_Date).toLocaleString() : "N/A"}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.Primary}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.CreatedName}</TableCell>
                <TableCell className="p-2 border border-slate-200 dark:border-slate-800">{caseItem.Owner}</TableCell>
                <TableCell
                  className={cn(
                    "p-2 border border-slate-200 dark:border-slate-800",
                    "text-xs font-semibold text-slate-800 dark:text-slate-900",
                    "rounded-full text-center",
                    "bg-emerald-300/80 border-emerald-400",
                    caseItem.CaseStatus === "Close" &&
                      "bg-red-300/80 border-red-400",
                    caseItem.CaseStatus === "InActive" &&
                      "bg-sky-300/80 border-sky-400",
                    caseItem.CaseStatus === "Cancel" &&
                      "bg-amber-300/80 border-amber-400 text-amber-900 font-extrabold shadow-sm dark:bg-amber-600/80 dark:border-amber-500 dark:text-amber-100"
                  )}
                >
                 {STATUS_ENUM_TO_LABEL[caseItem.CaseStatus]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sortedData.length === 0 && (
          <p className="mt-4 text-center text-gray-500 dark:text-slate-300">No cases found.</p>
        )}
      </div>
      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between" id='case-pagination'>
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-700 dark:text-slate-300">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> cases
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300
                         disabled:opacity-50
                         dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300
                         disabled:opacity-50
                         dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg
                           bg-white border-slate-300 text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-sky-400
                           dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-gray-500"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white rounded-lg
                           bg-blue-500 hover:bg-blue-600
                           focus:outline-none focus:ring-2 focus:ring-sky-400
                           dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus:ring-sky-500"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const Assets_table = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // dropdown filters
  const [selectedProductLine, setSelectedProductLine] = useState(null);
  const [selectedWarrantyStatus, setSelectedWarrantyStatus] = useState(null);
  const [selectedProductNumber, setSelectedProductNumber] = useState(null);

  // sorting
  const [sortConfig, setSortConfig] = useState({ key: "AssetID", direction: "asc" });

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // fetch ALL assets
  const fetchAllAssets = async () => {
    Swal.fire({
      title: "Memuat Data Asset...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

      setLoading(true);
      setError(null);

      try {
      const LIMIT = 1000;
      const first = await ApiCustomer.get(`/api/asset-information?page=1&limit=${LIMIT}`);
      const firstData = first?.data?.data || [];
      const totalPages = first?.data?.totalPages ?? 1;

      let all = [...firstData];
      for (let p = 2; p <= totalPages; p++) {
        const res = await ApiCustomer.get(`/api/asset-information?page=${p}&limit=${LIMIT}`);
        all = all.concat(res?.data?.data || []);
      }
      if (totalPages === 1 && Array.isArray(first?.data) && !first?.data?.data) {
        all = first.data;
      }
      setAssets(all);
      setFilteredAssets(all);
        } catch (err) {
          toast.error("Error fetching asset data:", err);
          setError("Failed to fetch data");
        } finally {
          setLoading(false);
          Swal.close();
        }
      };

  useEffect(() => {
    fetchAllAssets();
  }, []);

  // unique filters
  const uniqueProductLines = useMemo(
    () => ["", ...new Set(assets.map(a => a?.product_information?.ProductLine).filter(Boolean).sort())],
    [assets]
  );
  const uniqueWarrantyStatus = useMemo(
    () => ["", ...new Set(assets.map(a => a?.Warranty_Status).filter(Boolean).sort())],
    [assets]
  );
  const uniqueProductNumbers = useMemo(
  () => [
    ...new Set(
      assets
        ?.map(a => a?.ProductNumber)
        .filter(Boolean)
        .sort()
    )
  ].map((v, i) => ({ id: i, name: v })),
  [assets]
);

  const productLineOptions = useMemo(() =>
    uniqueProductLines
      .filter(v => v !== "")
      .map((v, index) => ({ id: index + 1, name: v })),
    [uniqueProductLines]
  );

  const warrantyStatusOptions = useMemo(() =>
    uniqueWarrantyStatus
      .filter(v => v !== "")
      .map((v, index) => ({ id: index + 1, name: v })),
    [uniqueWarrantyStatus]
  );



  useEffect(() => {
  const q = debouncedSearchTerm.trim().toLowerCase();

  const next = assets.filter(a => {
    const productLine = a?.product_information?.ProductLine ?? "";
    const warranty = a?.Warranty_Status ?? "";
    const serial = a?.SerialNumber ?? "";
    const productName = a?.product_information?.ProductName ?? "";
    const productNumber = a?.ProductNumber ?? "";

    // FILTER: Product Line
    const fLine = !selectedProductLine || productLine === selectedProductLine.name;

    // FILTER: Warranty
    const fWarranty = !selectedWarrantyStatus || warranty === selectedWarrantyStatus.name;
    const fProductNumber = !selectedProductNumber || productNumber === selectedProductNumber.name;

    if (!(fLine && fWarranty && fProductNumber)) return false;

    // SEARCH
    if (!q) return true;

    const haystack = [
      a?.AssetID,
      a?.SerialNumber,
      a?.ProductNumber,
      productLine,
      warranty,
      productName,
      productNumber,
      a?.site_account?.Company,
      `${a?.contact_information?.FirstName ?? ""} ${a?.contact_information?.LastName ?? ""}`,
    ]
      .map(v => (v ?? "").toString().toLowerCase())
      .join(" ");

    return haystack.includes(q);
  });

    setFilteredAssets(next);
    setCurrentPage(1);
  }, [debouncedSearchTerm, assets, selectedProductLine, selectedWarrantyStatus, selectedProductNumber]);


  // sorting function
  const sortedAssets = useMemo(() => {
    if (!sortConfig.key) return filteredAssets;
    return [...filteredAssets].sort((a, b) => {
      let valA, valB;
      switch (sortConfig.key) {
        case "ProductName":
          valA = a?.product_information?.ProductName ?? "";
          valB = b?.product_information?.ProductName ?? "";
          break;
        case "ProductLine":
          valA = a?.product_information?.ProductLine ?? "";
          valB = b?.product_information?.ProductLine ?? "";
          break;
        case "Warranty_Status":
        valA = a?.Warranty_Status ?? "";
        valB = b?.Warranty_Status ?? "";
        break;
        case "EOW_Date":
        valA = a?.EOW_Date ? new Date(a.EOW_Date).getTime() : 0;
        valB = b?.EOW_Date ? new Date(b.EOW_Date).getTime() : 0;
        break;
        default:
          valA = a?.[sortConfig.key] ?? "";
          valB = b?.[sortConfig.key] ?? "";
      }

      const numA = Number(valA);
      const numB = Number(valB);
      const bothNumeric = !isNaN(numA) && !isNaN(numB);

      if (bothNumeric) {
        if (numA < numB) return sortConfig.direction === "asc" ? -1 : 1;
        if (numA > numB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }

      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortConfig]);

  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedAssets.slice(start, start + itemsPerPage);
  }, [sortedAssets, currentPage, itemsPerPage]);

  // handle sort
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    if (sortConfig.direction === "asc") return <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600 dark:text-sky-300" />;
    return <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600 dark:text-sky-300" />;
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  const resetFilters = () => {
    setSelectedProductLine("");
    setSelectedWarrantyStatus("");
    setSelectedProductNumber(null);
    setSearchTerm("");
    setCurrentPage(1);
    setSortConfig({ key: "AssetID", direction: "asc" });
  };

  return (
    <div className="grid p-6 grid-flow-row gap-4 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 rounded-2xl">
      <h2 className="mb-2 text-2xl font-bold">📦 Asset Information</h2>

      {/* Search + Reset */}
      <div className="flex items-center gap-2 ">
        <input
          type="text"
          placeholder="🔍 Search asset..."
          className="p-2 text-sm border rounded min-w-[280px]
                     bg-white border-slate-300 text-slate-800 placeholder:text-slate-400
                     focus:outline-none focus:ring-2 focus:ring-sky-400
                     dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-sky-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AssetImport/>
        <AssetTemplateButton/>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="w-[220px]">
        <ComboboxDemo
          id="productline"
          value={selectedProductLine}
          setValue={setSelectedProductLine}
          options={productLineOptions}
          placeholder="Filter by Product Line"
          disabled={false}
        />
        </div>
        <div className="w-[220px]">
        <ComboboxDemo
          id="warrantystatus"
          value={selectedWarrantyStatus}
          setValue={setSelectedWarrantyStatus}
          options={warrantyStatusOptions}
          placeholder="Filter by Warranty Status"
          disabled={false}
        />
        </div>
        <div className="w-[220px]">
        <ComboboxDemo
          id="productnumber"
          value={selectedProductNumber}
          setValue={setSelectedProductNumber}
          options={uniqueProductNumbers}
          placeholder="Filter by Product Number"
          disabled={false}
        />
        </div>
        <button
          onClick={resetFilters}
          className="px-3 py-2 text-sm font-semibold text-white rounded shadow-md
                     bg-slate-500 hover:bg-slate-600
                     focus:outline-none focus:ring-2 focus:ring-sky-400
                     dark:bg-slate-600 dark:hover:bg-slate-500 dark:focus:ring-sky-500"
        >
          Reset Filter
        </button>
      </div>

      {error && <p className="mb-2 text-red-500 dark:text-red-400">{error}</p>}

      {/* Table */}
      <div className="relative w-full overflow-x-auto overflow-y-auto max-h-[75vh]
                      bg-white/95 dark:bg-slate-900/90
                      rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
        <Table className="w-full border-collapse text-xs sm:text-sm">
          <TableHeader className="sticky top-0 z-10 bg-gray-100/95 dark:bg-slate-800/95">
            <TableRow className="text-slate-800 dark:text-slate-100">
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 text-center">No</TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("AssetID")}>
                Asset ID {renderSortIcon("AssetID")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("SerialNumber")}>
                Serial Number {renderSortIcon("SerialNumber")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("ProductName")}>
                Product Name {renderSortIcon("ProductName")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("ProductNumber")}>
                Product Number {renderSortIcon("ProductNumber")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("ProductLine")}>
                Product Line {renderSortIcon("ProductLine")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("SiteAccountID")}>
                Site Account ID {renderSortIcon("SiteAccountID")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("ContactID")}>
                Contact ID {renderSortIcon("ContactID")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("Warranty_Status")}>
                Warranty Status {renderSortIcon("Warranty_Status")}
              </TableHead>
              <TableHead className="p-2 border border-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center" onClick={() => handleSort("EOW_Date")}>
                EOW Date {renderSortIcon("EOW_Date")}
              </TableHead>
              <TableHead className="p-2 borderborder-slate-200 dark:border-slate-700 cursor-pointer whitespace-nowrap text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan="9" className="p-4 text-sm text-center text-gray-600 dark:text-slate-300">Loading...</TableCell></TableRow>
            ) : currentData.length > 0 ? (
              currentData.map((a, idx) => (
                <TableRow key={a.AssetID} className={`hover:bg-blue-50 ${idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50 dark:bg-slate-800/80"}`}>
                  <TableCell className="p-2 text-center border">{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a.AssetID}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a.SerialNumber}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a?.product_information?.ProductName}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a?.ProductNumber}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a?.product_information?.ProductLine}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a?.site_account?.Company}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a?.contact_information?.FirstName} {a?.contact_information?.LastName}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{a?.Warranty_Status}</TableCell>
                  <TableCell className="p-2 border border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                    {a?.EOW_Date
                      ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(a.EOW_Date))
                      : "—"}
                  </TableCell>
                  <TableCell className="flex p-2 gap-2 border border-slate-200 dark:border-slate-800 justify-center">
                    <AssetEdit assetId={a.AssetID} onUpdate={fetchAllAssets} />
                    <AssetDelete assetId={a.AssetID} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan="9" className="p-4 text-center text-gray-500 dark:text-slate-300">No data found 🚫</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div> 

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg
                       bg-white border-slate-300 text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-400
                       dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-sky-500"
            value={itemsPerPage === sortedAssets.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedAssets.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-700 dark:text-slate-300">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> – {" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedAssets.length)}</b> of {" "}
          <b>{sortedAssets.length}</b> assets
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300
                         disabled:opacity-50
                         dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >⬅ Prev</button>

            <span className="px-3 py-1">Page <b>{currentPage}</b> of {totalPages}</span>

            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300
                         disabled:opacity-50
                         dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >Next ➡</button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg
                           bg-white border-slate-300 text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-sky-400
                           dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-sky-500"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white rounded-lg
                           bg-blue-500 hover:bg-blue-600
                           focus:outline-none focus:ring-2 focus:ring-sky-400
                           dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus:ring-sky-500"
              >Go</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const Product_table = () => {
  const [products, setProducts] = useState([]);
  const [filterSource, setFilterSource] = useState([]); // sumber unik filter
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // search + pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");

  // filters
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTower, setSelectedTower] = useState(null);

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // sorting → default ProductNumber ASC
  const [sortConfig, setSortConfig] = useState({
    key: "ProductNumber",
    direction: "asc",
  });

  // total info dari server
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch data utama (per page) dari server
  const fetchProducts = async (pageToLoad = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await ApiCustomer.get("/api/product-information", {
        params: {
          page: pageToLoad,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
          line: selectedLine?.name || "",
          type: selectedType?.name || "",
          group: selectedGroup?.name || "",
          tower: selectedTower?.name || "",
        },
      });

      const data = res?.data?.data ?? [];
      const totalPagesFromApi = res?.data?.totalPages ?? 1;
      const totalCountFromApi = res?.data?.totalCount ?? data.length;

      setProducts(data);
      setTotalPages(totalPagesFromApi);
      setTotalCount(totalCountFromApi);
      setCurrentPage(pageToLoad);
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError("Failed to fetch data");
      setProducts([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sumber filter (sekali saja, limit besar tapi 1x request)
  const fetchFilterSource = async () => {
    try {
      const res = await ApiCustomer.get("/api/product-information", {
        params: {
          page: 1,
          limit: 1000, // ambil max 1000 pertama sebagai sumber filter
        },
      });

      const data = res?.data?.data ?? [];
      setFilterSource(data);
    } catch (err) {
      console.error("Error fetching filter source:", err);
      // kalau gagal, fallback: pakai products sebagai source filter
      setFilterSource([]);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts(1);
    fetchFilterSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload kalau search / filter / itemsPerPage berubah
  useEffect(() => {
    // Reset ke page 1 setiap ada perubahan filter / search / limit
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedLine, selectedType, selectedGroup, selectedTower, itemsPerPage]);

  // Sumber untuk unique values filter (kalau kosong, pakai products page sekarang)
  const filterBase = filterSource.length > 0 ? filterSource : products;

  const uniqueLines = useMemo(
    () => [...new Set(filterBase.map((item) => item.ProductLine || ""))],
    [filterBase]
  );

  const uniqueTypes = useMemo(
    () => [...new Set(filterBase.map((item) => item.product_type?.ProductType || ""))],
    [filterBase]
  );

  const uniqueGroups = useMemo(
    () => [...new Set(filterBase.map((item) => item.product_type?.ProductGroup || ""))],
    [filterBase]
  );

  const uniqueTowers = useMemo(
    () => [...new Set(filterBase.map((item) => item.product_type?.ProductTower || ""))],
    [filterBase]
  );
  // unique filters
  const lineOptions = useMemo(
    () => uniqueLines.map((v, i) => ({ id: i, name: v || "-"})),
    [uniqueLines]
  );
  const typeOptions = useMemo(
    () => uniqueTypes.map((v, i) => ({ id: i, name: v || "-"})),
    [uniqueTypes]
  );
  const groupOptions = useMemo(
    () => uniqueGroups.map((v, i) => ({ id: i, name: v || "—" })),
    [uniqueGroups]
  );
  const towerOptions = useMemo(
    () => uniqueTowers.map((v, i) => ({ id: i, name: v || "—" })),
    [uniqueTowers]
  );

  // Sorting hanya untuk data 1 page (di client)
  const sortedProducts = useMemo(() => {
    const sortable = [...products];

    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aVal =
          (a && a[sortConfig.key]) ||
          (a && a.product_type && a.product_type[sortConfig.key]) ||
          "";
        const bVal =
          (b && b[sortConfig.key]) ||
          (b && b.product_type && b.product_type[sortConfig.key]) ||
          "";

        const aNum = Number(aVal);
        const bNum = Number(bVal);

        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return sortable;
  }, [products, sortConfig]);

  const hasData = sortedProducts.length > 0;

  const resetFilters = () => {
    setSelectedLine(null);
    setSelectedType(null);
    setSelectedGroup(null);
    setSelectedTower(null);
    setSearchTerm("");
    setCurrentPage(1);
    // itemsPerPage biarkan, user mungkin sudah pilih
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) {
      fetchProducts(page);
    }
    setGoToPageInput("");
  };

  const startIndex = totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = totalCount > 0 ? Math.min(currentPage * itemsPerPage, totalCount) : 0;

  return (
    <div className="p-6 grid grid-flow-row">
      <h2 className="mb-6 text-2xl font-bold">📊 Product Management</h2>

      {/* search + add */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 Search products..."
          className=" p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ProductAdd onAdded={() => fetchProducts(currentPage)} />
        <ProductImport/>
        <ProductTemplateButton/>
    </div>

      {/* Filters */}
      <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <ComboboxDemo
          id="line"
          placeholder="All Product Line"
          value={selectedLine}
          setValue={(val) => setSelectedLine(val)}
          options={lineOptions}
        />
        <ComboboxDemo
          id="type"
          placeholder="All Product Type"
          value={selectedType}
          setValue={(val) => setSelectedType(val)}
          options={typeOptions}
        />
        <ComboboxDemo
          id="group"
          placeholder="All Product Group"
          value={selectedGroup}
          setValue={(val) => setSelectedGroup(val)}
          options={groupOptions}
        />
        <ComboboxDemo
          id="tower"
          placeholder="All Product Tower"
          value={selectedTower}
          setValue={(val) => setSelectedTower(val)}
          options={towerOptions}
        />
        <button
          onClick={resetFilters}
          className="px-3 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500"
        >
          Reset Filter
        </button>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Table */}
      <div className="relative w-full overflow-x-auto overflow-y-auto max-h-[75vh] bg-white rounded-2xl shadow-md border">
        <Table className="min-w-full border-collapse">
          <TableHeader className="sticky z-10 top-0 bg-gray-100">
            <TableRow>
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("ProductNumber")}
              >
                Product Number {getSortIcon("ProductNumber")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("ProductLine")}
              >
                Product Line {getSortIcon("ProductLine")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("ProductName")}
              >
                Product Name {getSortIcon("ProductName")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("ProductType")}
              >
                Product Type {getSortIcon("ProductType")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("ProductGroup")}
              >
                Product Group {getSortIcon("ProductGroup")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("ProductTower")}
              >
                Product Tower {getSortIcon("ProductTower")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("HWPC")}
              >
                HWPC {getSortIcon("HWPC")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="p-4 text-center text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !hasData ? (
              <TableRow>
                <TableCell colSpan={9} className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((p, idx) => (
                <TableRow
                  key={p.ProductNumber}
                  className={`hover:bg-blue-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </TableCell>
                  <TableCell className="p-3 border">{p.ProductNumber}</TableCell>
                  <TableCell className="p-3 border">{p.ProductLine}</TableCell>
                  <TableCell className="p-3 border">{p.ProductName}</TableCell>
                  <TableCell className="p-3 border">{p.product_type?.ProductType}</TableCell>
                  <TableCell className="p-3 border">{p.product_type?.ProductGroup}</TableCell>
                  <TableCell className="p-3 border">{p.product_type?.ProductTower}</TableCell>
                  <TableCell className="p-3 border">{p.HWPC}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <ProductEdit ProductNumber={p.ProductNumber} onUpdate={() => fetchProducts(currentPage)} />
                    <ProductDelete
                      ProductNumber={p.ProductNumber}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={() => fetchProducts(currentPage)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage}
            onChange={(e) => {
              const value = Number(e.target.value);
              setItemsPerPage(value || 10);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          {totalCount > 0 ? (
            <>
              Showing <b>{startIndex}</b> – <b>{endIndex}</b> of <b>{totalCount}</b> products
            </>
          ) : (
            <>Showing 0 – 0 of 0 products</>
          )}
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => {
                if (currentPage > 1) {
                  fetchProducts(currentPage - 1);
                }
              }}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => {
                if (currentPage < totalPages) {
                  fetchProducts(currentPage + 1);
                }
              }}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductType_table = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // ✅ MODIFIED: Dari const ke state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ProductTypeData, setProductTypeData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState(""); // ✅ ADDED: State untuk input "Go to page"

  // ✅ Default sort langsung ke ProductTypeID asc
  const [sortConfig, setSortConfig] = useState({
    key: "ProductTypeID",
    direction: "asc",
  });

  const fetchProductTypeDataTable = async () => {
    setLoading(true);
    setError(null);
    Swal.fire({
      title: "Memuat Data Tipe Produk...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await ApiCustomer.get("/api/product-type");
      if (response.data.success) {
        setProductTypeData(response.data.data);
        Swal.close();
      } else {
        setError("Failed to fetch ProductType data");
        Swal.fire("Error!", "Gagal mengambil data tipe produk.", "error");
      }
    } catch (err) {
      console.error("Error fetching ProductType data:", err);
      setError("Error fetching data");
      Swal.fire("Error!", "Gagal mengambil data tipe produk.", "error");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchProductTypeDataTable();
  }, []);

  const filteredProductTypeTable = ProductTypeData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredProductTypeTable].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;
    let aValue = a[key];
    let bValue = b[key];
    if (!isNaN(aValue) && !isNaN(bValue)) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else {
      aValue = aValue?.toString().toLowerCase();
      bValue = bValue?.toString().toLowerCase();
    }
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // ✅ ADDED: Handler untuk "Go to page"
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
    setGoToPageInput("");
  };

  return (
    <div className="p-6 grid grid-flow-row">
      <h2 className="mb-4 text-xl font-bold">Product Type Table</h2>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Kembali ke halaman 1 saat search
          }}
        />
        <ProductTypeAdd onUpdate={fetchProductTypeDataTable} />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ MODIFIED: Table wrapper for scrolling */}
      <div className="relative w-full overflow-x-auto max-h-[60vh] bg-white rounded-2xl shadow-md border">
        <Table className="w-full border-collapse">
          {/* ✅ MODIFIED: Sticky header */}
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="text-sm text-gray-700 uppercase bg-gray-200">
              <TableHead className="p-3 font-semibold text-center border">No</TableHead> {/* ✅ ADDED: Kolom Nomor */}
              <TableHead
                className="p-3 font-semibold text-center border cursor-pointer"
                onClick={() => requestSort("ProductTypeID")}
              >
                ProductType ID {renderSortArrow("ProductTypeID")}
              </TableHead>
              <TableHead
                className="p-3 font-semibold text-center border cursor-pointer"
                onClick={() => requestSort("ProductTower")}
              >
                Product Tower {renderSortArrow("ProductTower")}
              </TableHead>
              <TableHead
                className="p-3 font-semibold text-center border cursor-pointer"
                onClick={() => requestSort("ProductGroup")}
              >
                Product Group {renderSortArrow("ProductGroup")}
              </TableHead>
              <TableHead
                className="p-3 font-semibold text-center border cursor-pointer"
                onClick={() => requestSort("ProductType")}
              >
                Product Type {renderSortArrow("ProductType")}
              </TableHead>
              <TableHead className="p-3 font-semibold text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <TableRow
                  key={item.ProductTypeID}
                  className={`hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell
                    className="p-3 text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/case/${item.ProductTypeID}`)}
                  >
                    {item.ProductTypeID}
                  </TableCell>
                  <TableCell className="p-3 border">{item.ProductTower}</TableCell>
                  <TableCell className="p-3 border">{item.ProductGroup}</TableCell>
                  <TableCell className="p-3 border">{item.ProductType}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <ProductTypeEdit
                      ProductTypeID={item.ProductTypeID}
                      onUpdate={fetchProductTypeDataTable}
                    />
                    <ProductTypeDelete
                      ProductTypeID={item.ProductTypeID}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchProductTypeDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="6" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ MODIFIED: Pagination controls yang lebih lengkap */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> entries
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>
            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>
            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const WarrantyService_table = () => {
  // === State Management ===
  const [WarrantyServiceData, setWarrantyServiceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");

  const [selectedWarrantyCondition, setSelectedWarrantyCondition] = useState(null);
  const [selectedCaseType, setSelectedCaseType] = useState(null);
  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "Service_offerID",
    direction: "asc",
  });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === Data Fetching ===
  const fetchWarrantyServiceDataTable = async () => {
    setLoading(true);
    setError(null);

    Swal.fire({
      title: "Memuat Data Warranty Service...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await ApiCustomer.get("/api/warranty-services");
      if (response.data.success) {
        setWarrantyServiceData(response.data.data);
      } else {
        setError("Failed to fetch Warranty Service data");
        Swal.fire({
          title: "Error!",
          text: "Gagal mengambil data Warranty Service.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Error fetching Warranty Service data:", err);
      setError("Error fetching data");
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data Warranty Service.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchWarrantyServiceDataTable();
  }, []);

    const caseTypeOptions = useMemo(() => {
      const unique = Array.from(
        new Set(
          WarrantyServiceData
          .map(item => item.CaseTypeServices)
          .filter(Boolean)
        )
      );
      return unique.map((name, i) => ({ id: i, name }));
    }, [WarrantyServiceData]);

    const warrantyConditionOptions = useMemo(() => {
      const unique = Array.from(
        new Set(WarrantyServiceData.map(item => item.WarrantyCondition))
      )
      return unique.map((name, i) => ({ id: i, name }))
    }, [WarrantyServiceData])
  // === Filtering & Sorting Logic ===
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortedData = useMemo(() => {
    const filteredData = WarrantyServiceData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    const WarrantyConditionFiltered = filteredData.filter(item =>
      selectedWarrantyCondition ? item.WarrantyCondition === selectedWarrantyCondition.name : true
    );

    const caseTypeFiltered = WarrantyConditionFiltered.filter(item =>
      selectedCaseType ? item.CaseTypeServices === selectedCaseType.name : true
    );

    const sorted = [...caseTypeFiltered];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (!isNaN(valA) && !isNaN(valB)) {
          return sortConfig.direction === "asc"
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }
        return sortConfig.direction === "asc"
          ? valA?.toString().localeCompare(valB?.toString())
          : valB?.toString().localeCompare(valA?.toString());
      });
    }
    return sorted;
  }, [WarrantyServiceData, searchTerm, sortConfig, selectedWarrantyCondition, selectedCaseType]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // === Pagination Logic ===
  const totalPages = Math.ceil(getSortedData.length / itemsPerPage) || 1;
  const currentData = getSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedWarrantyCondition(null);
    setSelectedCaseType(null);
    setSortConfig({ key: "Service_offerID", direction: "asc"});
    setCurrentPage(1);
  }
  // === Render Section ===
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Warranty Service Table</h2>

      {/* Search and Add Button */}
      <div className="flex flex-warp items-center gap-2 mb-4"> {/* Mengubah mb-6 di sini */}
        <input
          type="text"
          placeholder="🔍 Search..."
          className="w-full p-2 border rounded-lg shadow-sm sm:w-1/3 focus:ring-2 focus:ring-blue-400" // Menggunakan flex-grow agar input mengambil sisa ruang
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <WarrantyServiceAdd /> {/* Tombol Add di samping input search */}
      </div>
        <div className="flex gap-4 mb-4">
          <ComboboxDemo
          id="warranty-condition"
          value={selectedWarrantyCondition}
          setValue={setSelectedWarrantyCondition}
          options={warrantyConditionOptions}
          placeholder="filter by Warranty Conditions"
          className="w-full sm:w-1/3"
          />
          <ComboboxDemo 
          id="case-type"
          value={selectedCaseType}
          setValue={setSelectedCaseType}
          options={caseTypeOptions}
          placeholder="filter by Case Type"
          className="w-full sm:w-1/3"
          />
          <div className="flex item-center gap-1">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md
                          bg-slate-500 hover:bg-slate-600
                          focus:outline-none focus:ring-2 focus:ring-sky-400
                          dark:bg-slate-600 dark:hover:bg-slate-500 dark:focus:ring-sky-500"
            >
              Reset Filters
            </button>
          </div>
        </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-2xl shadow overflow-scroll max-h-[600px]">
        <Table className="w-full relative border-collapse">
          <TableHeader className="sticky z-10 top-0 bg-gray-100">
            <TableRow>
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Service_offerID")}
              >
                Service offerID {renderSortIcon("Service_offerID")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Service_description")}
              >
                Service description {renderSortIcon("Service_description")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("CTat_RTime")}
              >
                Customer Tat {renderSortIcon("CTat_RTime")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Price")}
              >
                Price {renderSortIcon("Price")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Shipping_Fee")}
              >
                Shipping Fee {renderSortIcon("Shipping_Fee")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("qty_ws")}
              >
                Quantity {renderSortIcon("qty_ws")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Tax")}
              >
                Tax {renderSortIcon("Tax")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Total")}
              >
                Total {renderSortIcon("Total")}
              </TableHead>
              <TableHead onClick={() => handleSort("WarrantyCondition")} className="p-3 text-sm font-semibold text-center border cursor-pointer">
                Warranty Condition {renderSortIcon("WarrantyCondition")}
              </TableHead>
              <TableHead onClick={() => handleSort("CaseTypeServices")} className="p-3 text-sm font-semibold text-center border cursor-pointer">
                Case Type {renderSortIcon("CaseTypeServices")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((WarrantyServiceItem, i) => (
                <TableRow
                  key={WarrantyServiceItem.Service_offerID}
                  className={`hover:bg-blue-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-3 border text-blue-500 cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/app/case/${WarrantyServiceItem.Service_offerID}`)
                    }
                  >
                    {WarrantyServiceItem.Service_offerID}
                  </TableCell>
                  <TableCell className="p-3 border">
                    {WarrantyServiceItem.Service_description}
                  </TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.CTat_RTime}</TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.Price}</TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.Shipping_Fee}</TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.qty_ws}</TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.Tax}</TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.Total}</TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.WarrantyCondition}</TableCell>
                  <TableCell className="p-3 border">{WarrantyServiceItem.CaseTypeServices}</TableCell>
                  <TableCell className="flex p-3 space-x-2 border justify-center">
                    <WarrantyServiceEdit
                      Service_offerID={WarrantyServiceItem.Service_offerID}
                      onUpdate={fetchWarrantyServiceDataTable}
                    />
                    <WarrantyServiceDelete
                      Service_offerID={WarrantyServiceItem.Service_offerID}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchWarrantyServiceDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === getSortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(getSortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, getSortedData.length)}</b>{" "}
          of <b>{getSortedData.length}</b> services
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const Mo_table = () => {
  const [MaterialOrderData, setMaterialOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "MOID",
    direction: "asc",
  });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === Data Fetching ===
  const fetchMaterialOrderDataTable = async () => {
    setLoading(true);
    setError(null);

    Swal.fire({
      title: "Memuat Data Material Order...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await ApiCustomer.get("/api/mo-detaill");
      if (response.data.success) {
        setMaterialOrderData(response.data.data);
      } else {
        setError("Failed to fetch Material Order data");
        Swal.fire({
          title: "Error!",
          text: "Gagal mengambil data Material Order.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Error fetching Material Order data:", err);
      setError("Error fetching data");
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data Material Order.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchMaterialOrderDataTable();
  }, []);

  // === Filtering & Sorting Logic ===
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={16} />;
    if (sortConfig.direction === "asc") return <ArrowUp size={16} />;
    return <ArrowDown size={16} />;
  };

  const getSortedData = useMemo(() => {
    const filteredData = MaterialOrderData.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesStatus = selectedStatus 
        ? item.OrderStatus === selectedStatus.name 
        : true;
      const matchesType = selectedType 
        ? item.OrderType === selectedType.name 
        : true;
      return matchesSearch && matchesStatus && matchesType;
    });

    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (!isNaN(valA) && !isNaN(valB)) {
          return sortConfig.direction === "asc"
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }
        return sortConfig.direction === "asc"
          ? valA?.toString().localeCompare(valB?.toString())
          : valB?.toString().localeCompare(valA?.toString());
      });
    }
    return sorted;
  }, [MaterialOrderData, searchTerm, selectedStatus, selectedType, sortConfig]);

  // Dropdown values
  const uniqueStatuses = useMemo(() => [
    ...new Set(MaterialOrderData.map((item) => item.OrderStatus)),
  ].filter(Boolean).sort(), [MaterialOrderData]);
  
  const uniqueTypes = useMemo(() => [
    ...new Set(MaterialOrderData.map((item) => item.OrderType)),
  ].filter(Boolean).sort(), [MaterialOrderData]);

  const statusOptions = useMemo(() => {
    return uniqueStatuses.map((status, index) => ({
      id: index + 1,
      name: status,
    }));
  }, [uniqueStatuses]);

  const typeOptions = useMemo(() => {
    return uniqueTypes.map((type, index) => ({
      id: index + 1,
      name: type,
    }));
  }, [uniqueTypes]);

  // === Pagination Logic ===
  const totalPages = Math.ceil(getSortedData.length / itemsPerPage) || 1;
  const currentData = getSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus(null);
    setSelectedType(null);
    setCurrentPage(1);
  };

  // === Render Section ===
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    if (!dateString) return "-"; 
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // fallback jika bukan format valid

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Material Order Table</h2>

      {/* Filters */}
      <div className="flex flex-col mb-6 space-y-4 ">
        <input
          type="text"
          placeholder="🔍 Search..."
          className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-48">
        <ComboboxDemo 
          id="orderStatusFilter"
          value={selectedStatus}
          setValue={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          options={statusOptions}
          placeholder="Filter By Order Status"
        />
        </div>
        <div className="w-full sm:w-48">
        <ComboboxDemo
          id="orderTypeFilter"
          value={selectedType}
          setValue={(val) => {
            setSelectedType(val);
            setCurrentPage(1);
          }}
          options={typeOptions}
          placeholder="Filter By Order type"
        />
        </div>
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-white bg-gray-500 rounded-lg shadow-sm hover:bg-gray-600"
        >
          Reset Filters
        </button>
        </div>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Table with Sticky Header and Scroll */}
      <div className="bg-white rounded-2xl shadow overflow-scroll max-h-[800px]">
        <Table className="w-full relative border-collapse">
          <TableHeader className="sticky z-10 top-0 bg-gray-100">
            <TableRow>
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("MOID")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>MO ID</span> {renderSortIcon("MOID")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("WOID")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>WO ID</span> {renderSortIcon("WOID")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("OrderNumber")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Order Number</span> {renderSortIcon("OrderNumber")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("OrderStatus")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Order Status</span> {renderSortIcon("OrderStatus")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("OrderType")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Order Type</span> {renderSortIcon("OrderType")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("CreatedOn")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Created On</span> {renderSortIcon("CreatedOn")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("SalesOrderNumber")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Sales Order Number</span> {renderSortIcon("SalesOrderNumber")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("RMANumber")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>RMA Number</span> {renderSortIcon("RMANumber")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("ReadyForClosureDate")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Ready For Closure Date</span> {renderSortIcon("ReadyForClosureDate")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Owner")}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Owner</span> {renderSortIcon("Owner")}
                </div>
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((MaterialOrderItem, i) => (
                <TableRow
                  key={MaterialOrderItem.MOID}
                  className={`text-center hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-3 text-blue-500 border cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/app/material-order/${MaterialOrderItem.MOID}`)
                    }
                  >
                    {MaterialOrderItem.MOID}
                  </TableCell>
                  <TableCell
                    className="p-3 text-blue-500 border cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/app/work/${MaterialOrderItem.WOID}`)
                    }
                  >
                    {MaterialOrderItem.WOID}
                  </TableCell>
                  <TableCell className="p-3 border">{MaterialOrderItem.OrderNumber}</TableCell>
                  <TableCell className="p-3 border">{MaterialOrderItem.OrderStatus}</TableCell>
                  <TableCell className="p-3 border">{MaterialOrderItem.OrderType}</TableCell>
                  <TableCell className="p-3 border">{formatDate(MaterialOrderItem.CreatedOn)}</TableCell>
                  <TableCell className="p-3 border">
                    {MaterialOrderItem.SalesOrderNumber}
                  </TableCell>
                  <TableCell className="p-3 border">{MaterialOrderItem.RMANumber}</TableCell>
                  <TableCell className="p-3 border">{formatDate(MaterialOrderItem.ReadyForClosureDate)}</TableCell>
                  <TableCell className="p-3 border">{MaterialOrderItem.Owner}</TableCell>
                  <TableCell className="flex items-center justify-center p-3 space-x-2 border">
                    <MaterialOrderEdit
                      MOID={MaterialOrderItem.MOID}
                      onUpdate={fetchMaterialOrderDataTable}
                    />
                    <MaterialOrderDelete
                      MOID={MaterialOrderItem.MOID}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchMaterialOrderDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="11" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === getSortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(getSortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, getSortedData.length)}</b>{" "}
          of <b>{getSortedData.length}</b> orders
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>
            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>
            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const Wo_table = () => {
  const [WorkOrderData, setWorkOrderData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // 🔹 filter states
  const [selectedWorkOrderType, setSelectedWorkOrderType] = useState(null);
  const [selectedSystemStatus, setSelectedSystemStatus] = useState(null);
  const [selectedShipmentCountry, setSelectedShipmentCountry] = useState(null);
  const [selectedShipmentState, setSelectedShipmentState] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // 🔹 sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "WOID",
    direction: "asc",
  });

  const formatDate = (value) => {
    if (!value) return "-";


    const date = new Date(value);

    // Cek apakah valid date
    if (isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const navigate = useNavigate();

  // Ambil unique values untuk dropdown filter, menggunakan useMemo untuk performa
  const workOrderTypeOptions = useMemo(
    () => [...new Set(WorkOrderData.map(d => d.WorkOrderType || ""))]
      .map((v, i) => ({
        id: i,
        name: v || "-",
      })),
    [WorkOrderData]
  );
  const systemStatusOptions = useMemo(
    () => [...new Set(WorkOrderData.map(d => d.SystemStatus || ""))]
      .map((v, i) => ({ 
        id: i, 
        name: v || "-"
      })),
    [WorkOrderData]
  );
  const shipmentCountryOptions = useMemo(
    () => [...new Set(WorkOrderData.map(d => d.ShipmentCountry || ""))]
      .map((v, i) => ({
        id: i,
        name: v || "-"
      })),
    [WorkOrderData]
  );
  const shipmentStateOptions = useMemo(
    () => [...new Set(WorkOrderData.map(d => d.ShipmentState || ""))]
      .map((v, i) => ({
        id: i,
        name: v || "-"
      })),
    [WorkOrderData]
  );
  const ownerOptions = useMemo(
    () => [...new Set(WorkOrderData.map(d => d.owner?.Name || ""))]
      .map((v, i) => ({
        id: i,
        name: v || "-"
      })),
    [WorkOrderData]
  );

  // 🔹 Debounce untuk search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchWorkOrderDataTable = async () => {
    setLoading(true);
    setError(null);

    Swal.fire({
      title: "Memuat Data Work Order...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await ApiCustomer.get("/api/work-order");
      if (response.data.success) {
        setWorkOrderData(response.data.data);
        Swal.close();
      } else {
        setError("Failed to fetch Work Order data");
        Swal.close();
        Swal.fire({
          title: "Error!",
          text: "Gagal mengambil data Work Order.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Error fetching Work Order data:", err);
      setError("Error fetching data");
      Swal.close();
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data Work Order.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchWorkOrderDataTable();
  }, []);

  // 🔹 Filter & Search logic, menggunakan useMemo
  const filteredWorkOrderTable = useMemo(() => {
    return WorkOrderData.filter((item) => {
      const matchSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ) || 
      item.owner?.Name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchWorkOrderType = selectedWorkOrderType?.name 
        ? item.WorkOrderType === selectedWorkOrderType.name : true;
      const matchSystemStatus = selectedSystemStatus?.name 
        ? item.SystemStatus === selectedSystemStatus.name : true;
      const matchShipmentCountry = selectedShipmentCountry?.name 
        ? item.ShipmentCountry === selectedShipmentCountry.name : true;
      const matchShipmentState = selectedShipmentState ?.name
        ? item.ShipmentState === selectedShipmentState.name : true;
      const matchOwner = selectedOwner?.name 
        ? item.owner?.Name === selectedOwner.name : true;

      return (
        matchSearch &&
        matchWorkOrderType &&
        matchSystemStatus &&
        matchShipmentCountry &&
        matchShipmentState &&
        matchOwner
      );
    });
  }, [
    WorkOrderData,
    debouncedSearchTerm,
    selectedWorkOrderType,
    selectedSystemStatus,
    selectedShipmentCountry,
    selectedShipmentState,
    selectedOwner,
  ]);

  // 🔹 Sorting logic, menggunakan useMemo
  const sortedData = useMemo(() => {
    const sorted = [...filteredWorkOrderTable];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
      if (sortConfig.key === "ownerName") {
        return sortConfig.direction === "asc"
          ? a.owner?.Name?.localeCompare(b.owner?.Name)
          : b.owner?.Name?.localeCompare(a.owner?.Name);
      }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (String(aVal) < String(bVal)) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (String(aVal) > String(bVal)) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredWorkOrderTable, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  const resetWoFilters = () => {
    setSelectedWorkOrderType(null);
    setSelectedSystemStatus(null);
    setSelectedShipmentCountry(null);
    setSelectedShipmentState(null);
    setSelectedOwner(null);
    setCurrentPage(1);
  }
  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Work Order Table</h2>

      {/* 🔹 Search & Filters */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
        <input
          type="text"
          placeholder="🔍 Search..."
          className="p-2 border rounded-lg shadow-sm w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />     
        </div>
        <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <ComboboxDemo
            id="workOrderType"
            placeholder="all work Order Types"
            value={selectedWorkOrderType}
            setValue={(v) => {
              setSelectedWorkOrderType(v);
              setCurrentPage(1);
            }}
            options={workOrderTypeOptions}
          />
          <ComboboxDemo
            id="systemStatus"
            placeholder="all System Status"
            value={selectedSystemStatus}
            setValue={(v) => {
              setSelectedSystemStatus(v);
              setCurrentPage(1);
            }}
            options={systemStatusOptions}
          />
          <ComboboxDemo
            id="shipmentCountry"
            placeholder="all shipment Countries"
            value={selectedShipmentCountry}
            setValue={(v) => {
              setSelectedShipmentCountry(v);
              setCurrentPage(1);
            }}
            options={shipmentCountryOptions}
          />
          <ComboboxDemo
            id="shipmentState"
            placeholder="all shipment State"
            value={selectedShipmentState}
            setValue={(v) => {
              setSelectedShipmentState(v);
              setCurrentPage(1);
            }}
            options={shipmentStateOptions}
          />
          <ComboboxDemo
            id="owner"
            placeholder="all owner"
            value={selectedOwner}
            setValue={(v) => {
              setSelectedOwner(v);
              setCurrentPage(1);
            }}
            options={ownerOptions}
          />
          <button
            onClick={resetWoFilters}
            className="px-3 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500"
          >
            Reset Filter
          </button>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* 🔹 Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("WOID")}
              >
                WOID {getSortIcon("WOID")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("CaseID")}
              >
                Case ID {getSortIcon("CaseID")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("WorkOrderType")}
              >
                Work Order Type {getSortIcon("WorkOrderType")}
              </TableHead>
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Priority")}
              >
                Priority {getSortIcon("Priority")}
              </TableHead> */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SystemStatus")}
              >
                System Status {getSortIcon("SystemStatus")}
              </TableHead>
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SubStatus")}
              >
                Sub Status {getSortIcon("SubStatus")}
              </TableHead> */}
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("PreferredDay")}
              >
                Preferred Day {getSortIcon("PreferredDay")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("PreferredTime")}
              >
                Preferred Time {getSortIcon("PreferredTime")}
              </TableHead> */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ShipmentCountry")}
              >
                Shipment Country {getSortIcon("ShipmentCountry")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ShipmentState")}
              >
                Shipment State {getSortIcon("ShipmentState")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("CreatedOn")}
              >
                Created On {getSortIcon("CreatedOn")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ownerName")}
              >
                Owner {getSortIcon("ownerName")}
              </TableHead>
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SLAJeopardy")}
              >
                SLAJeopardy {getSortIcon("SLAJeopardy")}
              </TableHead> */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("DueDateCustomer")}
              >
                DueDate Customer {getSortIcon("DueDateCustomer")}
              </TableHead>
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("CoverageWindow")}
              >
                Coverage Window {getSortIcon("CoverageWindow")}
              </TableHead> */}
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Response")}
              >
                Response {getSortIcon("Response")}
              </TableHead> */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("OTCCode")}
              >
                OTCCode {getSortIcon("OTCCode")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("RequestedDateTimeCustomer")}
              >
                Requested DateTime Customer {getSortIcon("RequestedDateTimeCustomer")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("GuaranteedFixTimeCustomer")}
              >
                Guaranteed FixTime Customer {getSortIcon("GuaranteedFixTimeCustomer")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("EarlyStartDateTimeCustomer")}
              >
                Early Start DateTime Customer {getSortIcon("EarlyStartDateTimeCustomer")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("LatestStartDateTimeCustomer")}
              >
                Latest Start DateTime Customer {getSortIcon("LatestStartDateTimeCustomer")}
              </TableHead>
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SLAReschedule")}
              >
                SLAReschedule {getSortIcon("SLAReschedule")}
              </TableHead> */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ActiveScheduleDate")}
              >
                Active Schedule Date {getSortIcon("ActiveScheduleDate")}
              </TableHead>
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SLAErrorDescription")}
              >
                SLA Error Description {getSortIcon("SLAErrorDescription")}
              </TableHead> */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("CasePriorityIndex")}
              >
                Case Priority Index {getSortIcon("CasePriorityIndex")}
              </TableHead>
              {/* <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("PartnerStatus")}
              >
                Partner Status {getSortIcon("PartnerStatus")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("WorkOrderDescription")}
              >
                WorkOrder Description {getSortIcon("WorkOrderDescription")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("PartnerNotes")}
              >
                PartnerNotes {getSortIcon("PartnerNotes")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("IncomingChannel")}
              >
                Incoming Channel {getSortIcon("IncomingChannel")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("MaterialOrder")}
              >
                Material Order {getSortIcon("MaterialOrder")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("CaseInformation")}
              >
                Case Information {getSortIcon("CaseInformation")}
              </TableHead> */}
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((WorkOrderItem, i) => (
                <TableRow
                  key={WorkOrderItem.WOID}
                  className={`text-center hover:bg-gray-100 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-2 text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/work/${WorkOrderItem.WOID}`)}
                  >
                    {WorkOrderItem.WOID}
                  </TableCell>
                  <TableCell
                    className="p-2 text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/case/${WorkOrderItem.CaseID}`)}
                  >
                    {WorkOrderItem.CaseID}
                  </TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.WorkOrderType}</TableCell>
                  {/* <TableCell className="p-2 border">{WorkOrderItem.Priority}</TableCell> */}
                  <TableCell className="p-2 border">{WorkOrderItem.SystemStatus}</TableCell>
                  {/* <TableCell className="p-2 border">{WorkOrderItem.SubStatus}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.PreferredDay}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.PreferredTime}</TableCell> */}
                  <TableCell className="p-2 border">{WorkOrderItem.ShipmentCountry}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.ShipmentState}</TableCell>
                  <TableCell className="p-2 border">{formatDate(WorkOrderItem.CreatedOn)}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.owner?.Name}</TableCell>
                  {/* <TableCell className="p-2 border">{WorkOrderItem.SLAJeopardy}</TableCell> */}
                  <TableCell className="p-2 border">{formatDate(WorkOrderItem.DueDateCustomer)}</TableCell>
                  {/* <TableCell className="p-2 border">{WorkOrderItem.CoverageWindow}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.Response}</TableCell> */}
                  <TableCell className="p-2 border">{WorkOrderItem.OTCCode}</TableCell>
                  <TableCell className="p-2 border">{formatDate(WorkOrderItem.RequestedDateTimeCustomer)}</TableCell>
                  <TableCell className="p-2 border">{formatDate(WorkOrderItem.GuaranteedFixTimeCustomer)}</TableCell>
                  <TableCell className="p-2 border">{formatDate(WorkOrderItem.EarlyStartDateTimeCustomer)}</TableCell>
                  <TableCell className="p-2 border">{formatDate(WorkOrderItem.LatestStartDateTimeCustomer)}</TableCell>
                  {/* <TableCell className="p-2 border">{WorkOrderItem.SLAReschedule}</TableCell> */}
                  <TableCell className="p-2 border">{formatDate(WorkOrderItem.ActiveScheduleDate)}</TableCell>
                  {/* <TableCell className="p-2 border">{WorkOrderItem.SLAErrorDescription}</TableCell> */}
                  <TableCell className="p-2 border">{WorkOrderItem.CasePriorityIndex}</TableCell>
                  {/* <TableCell className="p-2 border">{WorkOrderItem.PartnerStatus}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.WorkOrderDescription}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.PartnerNotes}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.IncomingChannel}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.MaterialOrder}</TableCell>
                  <TableCell className="p-2 border">{WorkOrderItem.CaseInformation}</TableCell> */}
                  <TableCell className="flex items-center justify-center gap-2 p-2 border">
                    <WorkOrderEdit WOID={WorkOrderItem.WOID} onUpdate={fetchWorkOrderDataTable} />
                    <WorkOrderDelete
                      MOID={WorkOrderItem.MOID}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchWorkOrderDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="32" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔹 Bottom controls (Pagination) */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> work orders
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const User_table = () => {
  const [UserData, setUserData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [filterSource, setFilterSource] = useState([]);

  const handleViewSignature = (signature) => {
    setSelectedSignature(signature);
    setShowSignatureModal(true);
  };

  // 🔹 sort state
  const [sortConfig, setSortConfig] = useState({
    key: "IDUser",
    direction: "asc",
  });

  const navigate = useNavigate();

  // 🔹 Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUserDataTable = async () => {
    setLoading(true);
    setError(null);

    Swal.fire({
      title: "Memuat Data User...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await ApiCustomer.get("/api/user", {
        params: {
          search: debouncedSearchTerm,
          role: selectedRole?.name || "",
          resource: selectedResource?.id ||"",
        },
      });
      if (response.data.success) {
        setUserData(response.data.data);
        Swal.close();
      } else {
        setError("Failed to fetch User data");
        Swal.close();
        Swal.fire({
          title: "Error!",
          text: "Gagal mengambil data User.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Error fetching User data:", err);
      setError("Error fetching data");
      Swal.close();
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data User.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataTable();
  }, [debouncedSearchTerm, selectedResource, selectedRole]);

  const roleOptions = useMemo (() => {
    const uniqueRoles = [...new Set(UserData.map((u) => u.Role || ""))].filter(
      (r) => r
    );
    return uniqueRoles.map((r, idx) => ({ id: idx, name: r }));
  }, [UserData]);

  const resourceOptions = useMemo(() => {
    const map = new Map();
    UserData.forEach((u) => {
      if (u.resource?.ResourceId) {
        map.set(u.resource.ResourceId, u.resource.Name || u.resource.ResourceId);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [UserData]);

  // 🔹 Filter data based on debounced search
  const filteredUserTable = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    if (!term) return UserData;

    return UserData.filter((item) => {
      const fields = [
        item.IDUser,
        item.Email,
        item.Username,
        item.Name,
        item.Role,
        item.Phone,
        item.resource?.Name,
      ];
      
      return fields.some((value) =>
        value?.toString().toLowerCase().includes(term)
      );
    });
  }, [UserData, debouncedSearchTerm]);

  // 🔹 Sorting logic
const sortedData = useMemo(() => {
  let sortableItems = [...filteredUserTable];
  if (sortConfig.key !== null) {
    sortableItems.sort((a, b) => {
      let aVal, bVal;

      // ✅ khusus untuk field nested Resources
      if (sortConfig.key === "Resources") {
        aVal = a.resource?.Name || "";
        bVal = b.resource?.Name || "";
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }
      // Handle null/undefined
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      // Case-insensitive untuk string
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }
  return sortableItems;
}, [filteredUserTable, sortConfig]);  
  // 🔹 Calculate total pages
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));

  // 🔹 Get current page data
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔹 Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔹 Sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };
  
  // 🔹 Go to page handler
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

  return `${day}-${month}-${year}`;
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 User Table</h2>

      {/* Flexbox container for search input and Add button */}
      <div className="flex flex-warp items-center gap-2 mb-4 ">
        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 Search users..."
          className="w-full p-2 border rounded-lg shadow-sm sm:w-1/3 focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Add User Button */}
        <UserAdd />
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ComboboxDemo
          id="role-filter"
          value={selectedRole}
          setValue={setSelectedRole}
          options={roleOptions}
          placeholder="All Roles"
          className="w-full sm:w-56 p-2 border rounded-lg shadow-sm"
          />
        <ComboboxDemo
          id="resource-filter"
          value={selectedResource}
          setValue={setSelectedResource}
          options={resourceOptions}
          placeholder="All Resource"
          className="w-full sm:w-56 p-2 border rounded-lg shadow-sm"
        />
        <button
          onClick={() => {
            setSelectedRole(null);
            setSelectedResource(null);
            setSearchTerm("");
            setCurrentPage(1);
          }}
          className="px-3 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500"
        >
          Reset Filter
        </button>
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("IDUser")}
              >
                ID User {getSortIcon("IDUser")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Email")}
              >
                Email {getSortIcon("Email")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Username")}
              >
                Username {getSortIcon("Username")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Name")}
              >
                Name {getSortIcon("Name")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Role")}
              >
                Role {getSortIcon("Role")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Resources")}
              >
                Resources {getSortIcon("Resources")}
              </TableHead>
              {/* Tambahkan kolom Phone di sini */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Phone")}
              >
                Phone {getSortIcon("Phone")}
              </TableHead>
              {/* Tambahkan kolom Signature di sini */}
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Signature")}
              >
                Signature {getSortIcon("Signature")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ProfilePhoto")}
              >
                Profil Photo {getSortIcon("ProfilePhoto")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("CreatedAt")}
              >
                CreatedAt {getSortIcon("CreatedAt")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("UpdatedAt")}
              >
                UpdatedAt {getSortIcon("UpdatedAt")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((UserItem, i) => (
                <TableRow
                  key={UserItem.IDUser}
                  className={`text-center text-sm hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell className="p-2 text-blue-500 border cursor-pointer hover:underline">
                    {UserItem.IDUser}
                  </TableCell>
                  <TableCell className="p-2 border">{UserItem.Email}</TableCell>
                  <TableCell className="p-2 border">{UserItem.Username}</TableCell>
                  <TableCell className="p-2 border">{UserItem.Name}</TableCell>
                  <TableCell className="p-2 border">{UserItem.Role}</TableCell>
                  <TableCell className="p-2 border">{UserItem.resource?.Name}</TableCell>
                  {/* Tampilkan data Phone di sini */}
                  <TableCell className="p-2 border">{UserItem.Phone}</TableCell>
                  {/* Tampilkan data Signature di sini */}
                  <TableCell className="p-2 border">{UserItem.Signature ? (
                    <button
                      className="text-blue-600 underline text-xs"
                      onClick={() => handleViewSignature(
                        UserItem.Signature.startsWith("data:image")
                          ? UserItem.Signature
                        : `data:image/png;base64,${UserItem.Signature}`)} 
                      >View Signature</button>
                      ) :("-")}
                      </TableCell>
                  <TableCell className="p-2 border">
                    {/* {console.log(preview?.ProfilePhoto)} */}
                    {UserItem?.ProfilePhoto ? (
                      <img src={`${import.meta.env.VITE_API_BASE_URL}${UserItem.ProfilePhoto}`} alt="Profile" className="w-10 h-10 object-cover rounded-full mx-auto" />
                    ) : (
                      "No Photo"
                    )}
                  </TableCell>
                  <TableCell className="p-2 border">{formatDate(UserItem.CreatedAt)}</TableCell>
                  <TableCell className="p-2 border">{formatDate(UserItem.UpdatedAt)}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-2 border">
                    <UserEdit
                      IDUser={UserItem.IDUser}
                      onUpdate={fetchUserDataTable}
                    />
                    <UserDelete
                      IDUser={UserItem.IDUser}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchUserDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="11" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {showSignatureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-lg p-6">
              <h3 className="mb-4 text-lg font-semibold text-center">🖋 Signature</h3>
              <div className="flex justify-center mb-4">
                <img
                  src={selectedSignature}
                  alt="Signature"
                  className="max-w-full max-h-[300px] object-contain border rounded-lg"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* 🔹 Bottom controls (Pagination) */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> users
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const Part_table = () => {
  const [PartData, setPartData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 🔹 Updated state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState(""); // 🔹 New state for "Go to"

  const [selectedKeyword, setSelectedKeyword] = useState(null);

  // 🔹 state sorting
  const [sortConfig, setSortConfig] = useState({
    key: "PartNumber",
    direction: "asc",
  });
  
  // 🔹 Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchPartDataTable = async () => {
    setLoading(true);
    setError(null);

    Swal.fire({
      title: "Memuat Data Part...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await ApiCustomer.get("/api/service-log/parts-catalog");
      if (response.data.success) {
        setPartData(response.data.data);
        Swal.close();
      } else {
        setError("Failed to fetch Part data");
        Swal.close();
        Swal.fire({
          title: "Error!",
          text: "Gagal mengambil data Part.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Error fetching Part data:", err);
      setError("Error fetching data");
      Swal.close();
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data Part.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartDataTable();
  }, []);
  const keywordOptions = useMemo (() => {
    return [
      ...new Set(
        PartData.map((p) => p.Keyword)
        .filter(Boolean)
        .sort()
      )
    ].map((v, i) => ({
      id: i + 1,
      name: v,
    }));
  }, [PartData]);

  // 🔹 Filter data berdasarkan pencarian (using debounced search term)
  const filteredPartTable = useMemo(() => {
    const q = debouncedSearchTerm.toLowerCase();
    return PartData.filter((item) => {
      const keywordMatch =
        !selectedKeyword || item.Keyword === selectedKeyword.name;

      if (!keywordMatch) return false;
      if (!q) return true;
    
     return Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(q)
      );
    });
  }, [PartData, debouncedSearchTerm, selectedKeyword]);

  // 🔹 Sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredPartTable];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredPartTable, sortConfig]);

  // 🔹 Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔹 Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔹 Icon indikator sort (using Lucide-React icons)
  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // 🔹 "Go to page" handler
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedKeyword(null);
    setCurrentPage(1);
    setSortConfig({ key: "PartNumber", direction: "asc" });
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Part Table</h2>

      {/* Flexbox container for search input and Add button */}
      <div className="flex flex-wrap items-center gap-2 mb-2 ">
        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 Search parts..."
          className="w-full p-2 border rounded-lg shadow-sm sm:w-1/3 focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Add Part Button */}

          <PartAdd />
        <PartImport />
        <PartTemplateButton />
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="w-[220px]">
          <ComboboxDemo
            id="keyword"
            value={selectedKeyword}
            setValue={setSelectedKeyword}
            options={keywordOptions}
            placeholder="All Keywords"
            className="w-full p-2 border rounded-lg shadow-sm"
          />
        </div>
          <button
            onClick={resetFilters}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Reset Filters
          </button>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* 🔹 Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("PartNumber")}>
                Part Number {getSortIcon("PartNumber")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Keyword")}>
                Keyword {getSortIcon("Keyword")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("PartDescription")}>
                Part Description {getSortIcon("PartDescription")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Orderability")}>
                Orderability {getSortIcon("Orderability")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("RestrictionReason")}>
                Restriction Reason {getSortIcon("RestrictionReason")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("CSR_Flag")}>
                CSR Flag {getSortIcon("CSR_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("ROHS_Flag")}>
                ROHS Flag {getSortIcon("ROHS_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Returnable_Flag")}>
                Returnable Flag {getSortIcon("Returnable_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("HardRoll_Flag")}>
                HardRoll Flag {getSortIcon("HardRoll_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("DangerousGoods_Flag")}>
                DangerousGoods Flag {getSortIcon("DangerousGoods_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("LithiumBattery_Flag")}>
                LithiumBattery Flag {getSortIcon("LithiumBattery_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Oversize_Flag")}>
                Oversize Flag {getSortIcon("Oversize_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Heavy_Flag")}>
                Heavy Flag {getSortIcon("Heavy_Flag")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Price")}>
                Price {getSortIcon("Price")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("FreightPrice")}>
                Freight Price {getSortIcon("FreightPrice")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Tax")}>
                Tax {getSortIcon("Tax")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Total")}>
                Total {getSortIcon("Total")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Shipping_Fee")}>
                Shipping Fee {getSortIcon("Shipping_Fee")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((PartItem, i) => (
                <TableRow key={PartItem.PartNumber} className={`text-center text-sm hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell className="p-2 text-blue-500 border cursor-pointer hover:underline">
                    {PartItem.PartNumber}
                  </TableCell>
                  <TableCell className="p-2 border">{PartItem.Keyword}</TableCell>
                  <TableCell className="p-2 border">{PartItem.PartDescription}</TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.Orderability ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.Orderability ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">{PartItem.RestrictionReason}</TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.CSR_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.CSR_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.ROHS_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.ROHS_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.Returnable_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.Returnable_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.HardRoll_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.HardRoll_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.DangerousGoods_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.DangerousGoods_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.LithiumBattery_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.LithiumBattery_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.Oversize_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.Oversize_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-white text-sm ${PartItem.Heavy_Flag ? "bg-green-500" : "bg-red-500"}`}>
                      {PartItem.Heavy_Flag ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 border">{PartItem.Price}</TableCell>
                  <TableCell className="p-2 border">{PartItem.FreightPrice}</TableCell>
                  <TableCell className="p-2 border">{PartItem.Tax}</TableCell>
                  <TableCell className="p-2 border">{PartItem.Total}</TableCell>
                  <TableCell className="p-2 border">{PartItem.Shipping_Fee}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-2 border">
                    <PartEdit PartNumber={PartItem.PartNumber} onUpdate={fetchPartDataTable} />
                    <PartDelete
                      PartNumber={PartItem.PartNumber}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchPartDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="19" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔹 Bottom controls (Pagination) */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> parts
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const Resource_table = () => {
  const [ResourceData, setResourceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // 🔹 sort config
  const [sortConfig, setSortConfig] = useState({
    key: "ResourceId",
    direction: "asc",
  });

  const navigate = useNavigate();

  // 🔹 Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchResourceDataTable = useCallback(async () => {
    setLoading(true);
    setError(null);

    Swal.fire({
      title: "Memuat Data Resources...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await ApiCustomer.get("/api/resources", {
        params: {
          keyword: debouncedSearchTerm,
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      if (response.data.success) {
        const resources = response.data.data;          // array
        const meta = response.data.meta;               // pagination

        setResourceData(resources || []);
        setTotalCount(meta?.totalCount || 0);
        setTotalPages(meta?.totalPages || 1);

        Swal.close();
      } else {
        setError("Failed to fetch Resource data");
        Swal.close();
        Swal.fire({
          title: "Error!",
          text: "Gagal mengambil data Resources.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setError("An error occurred while fetching Resource data");
      Swal.close();
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat mengambil data Resources.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, currentPage, itemsPerPage]);

  // Panggil fetch saat dependency berubah
  useEffect(() => {
    fetchResourceDataTable();
  }, [fetchResourceDataTable]);

    const sortedData = useMemo(() => {
      const sorted = [...ResourceData];
      if (sortConfig.key) {
        sorted.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];

          if (aVal === null || aVal === undefined) aVal = "";
          if (bVal === null || bVal === undefined) bVal = "";

          if (typeof aVal === "string") aVal = aVal.toLowerCase();
          if (typeof bVal === "string") bVal = bVal.toLowerCase();

          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }
      return sorted;
    }, [ResourceData, sortConfig]);

    const handleSort = (key) => {
      setSortConfig((prev) => {
        if (prev.key === key) {
          return {
            key,
            direction: prev.direction === "asc" ? "desc" : "asc",
          };
        }
        return {
          key,
          direction: "asc",
        };
      });
    };

    const getSortIcon = (key) => {  
      if (sortConfig.key !== key)
        return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;

      return sortConfig.direction === "asc" ? (
        <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
      ) : (
        <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
      );
    };

    const handleGoToPage = (e) => {
      e.preventDefault();
      const page = Number(goToPageInput);
      if (page >= 1 && page <= totalPages) setCurrentPage(page);
      setGoToPageInput("");
    };
    const currentData = sortedData;

    const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Resource Table</h2>

      {/* Kontainer Flexbox untuk pencarian dan tombol Add */}
      <div className="flex flex-warp items-center gap-2 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 Search..."
          className="w-full p-2 border rounded-lg shadow-sm sm:w-1/3 focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Add Button */}
        <ResourceAdd />
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ResourceId")}
              >
                Resource ID {getSortIcon("ResourceId")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Name")}
              >
                Name {getSortIcon("Name")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ServiceCenterName")}
              >
                Service Center Name {getSortIcon("ServiceCenterName")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ResourceCode")}
              >
                ResourceCode {getSortIcon("ResourceCode")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer">
                Logo
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Phone")}
              >
                Phone {getSortIcon("Phone")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Mobile")}
              >
                Mobile {getSortIcon("Mobile")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Fax")}
              >
                Fax {getSortIcon("Fax")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Email")}
              >
                Email {getSortIcon("Email")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("Country")}
              >
                Country {getSortIcon("Country")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("StateProvince")}
              >
                State/Province {getSortIcon("StateProvince")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("City")}
              >
                City {getSortIcon("City")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ZipPostalCode")}
              >
                Zip/Postal Code {getSortIcon("ZipPostalCode")}
              </TableHead>
              <TableHead 
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("AddressLine")}
              >
                Address Line {getSortIcon("AddressLine")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((ResourceItem, i) => (
                <TableRow
                  key={ResourceItem.ResourceId}
                  className={`text-center hover:bg-gray-100 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell className="p-2 text-blue-500 border cursor-pointer hover:underline">
                    {ResourceItem.ResourceId}
                  </TableCell>
                  <TableCell className="p-2 border">{ResourceItem.Name}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.ServiceCenterName}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.ResourceCode}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.ResourceLogo ? (<img src={ResourceItem.ResourceLogo} alt="Resource Logo" className="h-8 mx-auto object-contain" />) : ("-")}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.Phone}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.Mobile}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.Fax}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.Email}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.Country}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.StateProvince}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.City}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.ZipPostalCode}</TableCell>
                  <TableCell className="p-2 border">{ResourceItem.AddressLine}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-2 border">
                    <ResourceEdit
                      ResourceId={ResourceItem.ResourceId}
                      onUpdate={fetchResourceDataTable}
                    />
                    <ResourceDelete
                      ResourceId={ResourceItem.ResourceId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchResourceDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="3" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔹 Bottom controls (Pagination) */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{startIndex}</b> – <b>{endIndex}</b> of{" "}
          <b>{totalCount}</b> resources
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResourceAccountTable = () => {
  const [resourceAccounts, setResourceAccounts] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [resourceFilter, setResourceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // SORTING STATE
  const [sortConfig, setSortConfig] = useState({
    key: "ResourceAccountId",
    direction: "asc",
  });

  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  const fetchResources = async () => {
    try {
      const response = await ApiCustomer.get("/api/resources");
      if (response.data.success) {
        setResources(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
    }
  };

  const fetchResourceAccounts = async () => {
    setLoading(true);
    setError(null);
    Swal.fire({
      title: "Memuat Data Resource Account...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await ApiCustomer.get("/api/resource-account");
      if (response.data.success) {
        setResourceAccounts(response.data.data);
      } else {
        setError("Failed to fetch resource accounts");
      }
    } catch (err) {
      console.error("Error fetching resource accounts:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchResources();
    fetchResourceAccounts();
  }, []);

  // Unique ResourceIds for filter
  const uniqueResourceIds = useMemo(() => {
    return [
      ...new Set(resourceAccounts.map((item) => item.ResourceId).filter((v) => v)),
    ].sort();
  }, [resourceAccounts]);

  // Filtering logic (using debounced search term)
  const filteredAccounts = useMemo(() => {
    return resourceAccounts.filter((item) => {
      const matchSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      const matchResource = !resourceFilter || item.ResourceId === resourceFilter;
      return matchSearch && matchResource;
    });
  }, [resourceAccounts, debouncedSearchTerm, resourceFilter]);

  // SORTING applied here
  const sortedAccounts = useMemo(() => {
    let sortable = [...filteredAccounts];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aVal = a?.[sortConfig.key] ?? "";
        const bVal = b?.[sortConfig.key] ?? "";

        if (!isNaN(aVal) && !isNaN(bVal)) {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return sortable;
  }, [filteredAccounts, sortConfig]);

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage) || 1;
  const currentData = sortedAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // "Go to page" handler
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Resource Accounts</h2>

      {/* NEW: Search Input + Add button in one row */}
      <div className="flex flex-col items-start gap-4 mb-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="🔍 Search accounts..."
          className="w-full p-2 border rounded-lg shadow-sm sm:w-1/3 focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ResourceAccountAdd onAdd={fetchResourceAccounts} />
      </div>

      {/* NEW: Filters + Reset button below */}
      <div className="flex flex-col items-start gap-4 mb-4 sm:flex-row sm:items-center">
        <select
          className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={resourceFilter}
          onChange={(e) => {
            setResourceFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Resources</option>
          {uniqueResourceIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <button
          className="px-4 py-2 text-white bg-gray-500 rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={() => {
            setSearchTerm("");
            setResourceFilter("");
            setCurrentPage(1);
          }}
        >
          Reset Filters
        </button>
      </div>
      
      {loading && <p>Loading accounts...</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead className="p-3 text-center border cursor-pointer max-w-20" onClick={() => handleSort("ResourceAccountId")}>
                Resource Account ID {getSortIcon("ResourceAccountId")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Name")}>
                Name {getSortIcon("Name")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("ResourceId")}>
                Resource ID {getSortIcon("ResourceId")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((account, i) => (
                <TableRow
                  key={account.ResourceAccountId}
                  className={`text-sm hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-3 text-center text-blue-500 border cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/app/resource-account/${account.ResourceAccountId}`)
                    }
                  >
                    {account.ResourceAccountId}
                  </TableCell>
                  <TableCell className="p-3 border text-center">{account.Name}</TableCell>
                  <TableCell className="p-3 border text-center">{account.ResourceId || "-"}</TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <ResourceAccountEdit
                      ResourceAccountId={account.ResourceAccountId}
                      resources={resources}
                      onUpdate={fetchResourceAccounts}
                    />
                    <ResourceAccountDelete
                      ResourceAccountId={account.ResourceAccountId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchResourceAccounts}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="p-6 text-center text-gray-500">
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls (Pagination) */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedAccounts.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedAccounts.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedAccounts.length)}</b> of{" "}
          <b>{sortedAccounts.length}</b> accounts
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const SubkTechnician_table = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceAccountFilter, setResourceAccountFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subkTechnicianData, setSubkTechnicianData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // SORTING STATE
  const [sortConfig, setSortConfig] = useState({
    key: "SubkTechnicianId",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  const fetchSubkTechnicianData = async () => {
    Swal.fire({
      title: "Memuat Data Subk Technician...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/subk-technician");
      if (response.data.success) {
        setSubkTechnicianData(response.data.data);
      } else {
        setError("Failed to fetch Subk Technician data");
      }
    } catch (err) {
      console.error("Error fetching SubkTechnician data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchSubkTechnicianData();
  }, []);

  // Ambil unique Resource Account untuk filter
  const uniqueResourceAccounts = useMemo(() => {
    return [
      ...new Set(
        subkTechnicianData
          .map((item) => item.resourceAccount?.Name)
          .filter((v) => v)
      ),
    ].sort();
  }, [subkTechnicianData]);

  // Filtering logic (search + filter resource account)
  const filteredData = useMemo(() => {
    return subkTechnicianData.filter((item) => {
      const matchSearch = Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      const matchResource =
        !resourceAccountFilter ||
        item.resourceAccount?.Name === resourceAccountFilter;

      return matchSearch && matchResource;
    });
  }, [subkTechnicianData, debouncedSearchTerm, resourceAccountFilter]);

  // APPLY SORTING DI SINI
  const sortedData = useMemo(() => {
    let sortable = [...filteredData];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === "ResourceAccount") {
          aVal = a?.resourceAccount?.Name ?? "";
          bVal = b?.resourceAccount?.Name ?? "";
        } else {
          aVal = a?.[sortConfig.key] ?? "";
          bVal = b?.[sortConfig.key] ?? "";
        }

        if (!isNaN(aVal) && !isNaN(bVal)) {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return sortable;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  // Handle "Go to page" input
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Subk Technician Table</h2>

      {/* Search and Add Button on the same row */}
      <div className="flex flex-col items-center justify-between gap-4 mb-4 sm:flex-row">
        <div className="flex items-center w-full gap-2">
          <input
            type="text"
            placeholder="🔍 Search technicians..."
            className="w-full p-2 border rounded-lg shadow-sm sm:w-1/3 focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SubkTechnicianAdd onUpdate={fetchSubkTechnicianData} />
        </div>
      </div>

      {/* Filter and Reset Button on a new row */}
      <div className="flex flex-col items-center justify-between gap-4 mb-4 sm:flex-row">
        <div className="flex items-center w-full gap-2">
          <select
            className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            value={resourceAccountFilter}
            onChange={(e) => {
              setResourceAccountFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Resource Accounts</option>
            {uniqueResourceAccounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>

          <button
            className="px-4 py-2 text-white bg-gray-500 rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={() => {
              setSearchTerm("");
              setResourceAccountFilter("");
              setCurrentPage(1);
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("SubkTechnicianId")}>
                Subk Technician ID {getSortIcon("SubkTechnicianId")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Name")}>
                Name {getSortIcon("Name")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("ResourceAccount")}>
                Resource Account {getSortIcon("ResourceAccount")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow
                  key={item.SubkTechnicianId}
                  className={`text-sm hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-3 text-center text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/subk-technician/${item.SubkTechnicianId}`)}
                  >
                    {item.SubkTechnicianId}
                  </TableCell>
                  <TableCell className="p-3 border text-center">{item.Name}</TableCell>
                  <TableCell className="p-3 border text-center">
                    {item.resourceAccount?.Name || "N/A"}
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <SubkTechnicianEdit
                      SubkTechnicianId={item.SubkTechnicianId}
                      onUpdate={fetchSubkTechnicianData}
                    />
                    <SubkTechnicianDelete
                      SubkTechnicianId={item.SubkTechnicianId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchSubkTechnicianData}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="p-6 text-center text-gray-500">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls (Pagination) */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> technicians
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const SymptomCodeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [symptomCodeData, setSymptomCodeData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // SORTING STATE
  const [sortConfig, setSortConfig] = useState({
    key: "SymptomCodeID",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  const fetchSymptomCodeData = async () => {
    Swal.fire({
      title: "Memuat Data Symptom Codes...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/symptom-codes");
      if (response.data.success) {
        setSymptomCodeData(response.data.data);
      } else {
        setError("Failed to fetch SymptomCode data");
      }
    } catch (err) {
      console.error("Error fetching SymptomCode data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchSymptomCodeData();
  }, []);

  // Filtering logic
  const filteredData = useMemo(() => {
    return symptomCodeData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [symptomCodeData, debouncedSearchTerm]);

  // APPLY SORTING DI SINI
  const sortedData = useMemo(() => {
    const sortable = [...filteredData];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" || typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }

        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    return sortable;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  // Handle "Go to page" input
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-bold">Symptom Code Table</h2>

      {/* Search + Add Button (row 1) */}
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <input
        type="text"
        placeholder="🔍 Search symptom codes..."
        className="w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
        <SymptomCodeAdd onUpdate={fetchSymptomCodeData} />
    </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SymptomCodeID")}
              >
                Symptom Code ID {getSortIcon("SymptomCodeID")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SymptomCode")}
              >
                Symptom Code {getSortIcon("SymptomCode")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("TopCategory")}
              >
                Top Category {getSortIcon("TopCategory")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("SubCategory")}
              >
                Sub Category {getSortIcon("SubCategory")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("QualityCodes")}
              >
                Quality Codes {getSortIcon("QualityCodes")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("CreatedOn")}
              >
                Created On {getSortIcon("CreatedOn")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow key={item.SymptomCodeID} className={`text-sm hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-3 text-center text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/symptom-code/${item.SymptomCodeID}`)}
                  >
                    {item.SymptomCodeID}
                  </TableCell>
                  <TableCell className="p-3 border text-center">{item.SymptomCode}</TableCell>
                  <TableCell className="p-3 border text-center">{item.TopCategory}</TableCell>
                  <TableCell className="p-3 border text-center">{item.SubCategory}</TableCell>
                  <TableCell className="p-3 border text-center">{item.QualityCodes || "N/A"}</TableCell>
                  <TableCell className="p-3 border text-center">
                    {new Date(item.CreatedOn).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <SymptomCodeEdit
                      SymptomCodeID={item.SymptomCodeID}
                      onUpdate={fetchSymptomCodeData}
                    />
                    <SymptomCodeDelete
                      SymptomCodeID={item.SymptomCodeID}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchSymptomCodeData}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="p-6 text-center text-gray-500">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls (Pagination) */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> symptom codes
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const BookingsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // filters
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedJeopardy, setSelectedJeopardy] = useState(null);
  const [selectedCreatedBy, setSelectedCreatedBy] = useState(null);

  // sort config (default: BookingId DESC)
  const [sortConfig, setSortConfig] = useState({
    key: "BookingId",
    direction: "asc",
  });

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchBookingData = async () => {
    Swal.fire({
      title: "Memuat Data Bookings...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/booking");
      if (response.data.success) {
        console.log("Data Response Booking", response.data.data);
        setBookingData(response.data.data);
      } else {
        setError("Failed to fetch booking data");
      }
    } catch (err) {
      console.error("Error fetching booking data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchBookingData();
  }, []);

  // derive unique options
  const statusOptions = useMemo(() => {
    const all = bookingData.map(b => b.BookingStatus?.Description).filter(Boolean);
    return [...new Set(all)].map((v, i) => ({
      id: i,
      name: v,
    }));
  }, [bookingData]);

  const jeopardyOptions = [
    { id: 1, name: "Yes" },
    { id: 2, name: "No" },
  ];

  const createdByOptions = useMemo(() => {
    const all = bookingData.map(b => b.createdByUser?.Username).filter(Boolean);
    return [...new Set(all)].map((v, i) => ({
      id: i,
      name: v,
    }));
  }, [bookingData]);

  // filter + search
  const filteredData = useMemo(() => {
    return bookingData.filter((item) => {
      const status = item.BookingStatus ?.Description ?? "";
      const jeopardy = item.ScheduleJeopardy ? "Yes" : "No";
      const createdBy = item.createdByUser?.Username ?? "";

      const fStatus = !selectedStatus || status === selectedStatus.name;
      const fJeopardy = !selectedJeopardy || jeopardy === selectedJeopardy.name;
      const fCreated = !selectedCreatedBy || createdBy === selectedCreatedBy.name;
      if (!(fStatus && fJeopardy && fCreated)) return false;

      // search
      const haystack = Object.values(item).join(" ").toLowerCase();
      return haystack.includes(debouncedSearchTerm.toLowerCase());
    });
  }, [bookingData, debouncedSearchTerm, selectedStatus, selectedJeopardy, selectedCreatedBy]);

  // sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // handle nested fields
        if (sortConfig.key === "Username") {
          aVal = a.createdByUser?.Username ?? "";
          bVal = b.createdByUser?.Username ?? "";
        }
        if (sortConfig.key === "ScheduleJeopardy") {
          aVal = a.ScheduleJeopardy ? "Yes" : "No";
          bVal = b.ScheduleJeopardy ? "Yes" : "No";
        }

        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSelectedStatus(null);
    setSelectedJeopardy(null);
    setSelectedCreatedBy(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const navigate = useNavigate();

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Bookings Table</h2>

      {/* Search & Add */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 Search bookings..."
          className="w-full sm:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BookingsAdd onUpdate={fetchBookingData} />
      </div>

      {/* Filters */}
      <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <ComboboxDemo
          id="status"
          placeholder="All Status"
          value={selectedStatus}
          setValue={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          options={statusOptions}
        />

        <ComboboxDemo
          id="jeopardy"
          placeholder="All Jeopardy"
          value={selectedJeopardy}
          setValue={(val) => {
            setSelectedJeopardy(val);
            setCurrentPage(1);
          }}
          options={jeopardyOptions}
        />

        <ComboboxDemo
          id="createdBy"
          placeholder="All Created By"
          value={selectedCreatedBy}
          setValue={(val) => {
            setSelectedCreatedBy(val);
            setCurrentPage(1);
          }}
          options={createdByOptions}
        />

        <button
          onClick={resetFilters}
          className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
        >
          Reset Filter
        </button>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table with fixed header and scrollable body */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("BookingId")}>
                Booking ID {getSortIcon("BookingId")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("WOID")}>
                WOID {getSortIcon("WOID")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("BookingStatus")}>
                Status {getSortIcon("BookingStatus")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("ScheduleJeopardy")}>
                Schedule Jeopardy {getSortIcon("ScheduleJeopardy")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("ScheduleJeopardyTime")}>
                Jeopardy Time {getSortIcon("ScheduleJeopardyTime")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("DoNotDisturb")}>
                Do Not Disturb {getSortIcon("DoNotDisturb")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("CeScheduleChange")}>
                CE Schedule Change {getSortIcon("CeScheduleChange")}
              </TableHead>
              <TableHead className="p-3 text-center border">Durations (min)</TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("Username")}>
                Created By {getSortIcon("Username")}
              </TableHead>
              <TableHead className="p-3 text-center border cursor-pointer" onClick={() => handleSort("CreatedAt")}>
                Created At {getSortIcon("CreatedAt")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow key={item.BookingId} className={`text-center hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-3 text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/bookings/${item.BookingId}`)}
                  >
                    {item.BookingId}
                  </TableCell>
                  <TableCell className="p-3 border text-center" onClick={() => navigate(`/app/work/${item.WOID}`)}>{item.WOID}</TableCell>
                  <TableCell className="p-3 border text-center">{item.BookingStatus?.Description}</TableCell>
                  <TableCell className="p-3 border text-center">{item.ScheduleJeopardy ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 border text-center">
                    {item.ScheduleJeopardyTime
                      ? new Date(item.ScheduleJeopardyTime).toLocaleString("id-ID")
                      : "-"}
                  </TableCell>
                  <TableCell className="p-3 border text-center">{item.DoNotDisturb ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 border text-center">{item.CeScheduleChange ? "Yes" : "No"}</TableCell>
                  <TableCell className="p-3 border text-center">
                    Total Billable: {item.TotalBillableDurationInMinutes || 0} <br />
                    Total In Progress: {item.TotalInProgressDurationInMinutes || 0} <br />
                    Total Break: {item.TotalBreakDurationInMinutes || 0}
                  </TableCell>
                  <TableCell className="p-3 border text-center">{item.createdByUser?.Username || "-"}</TableCell>
                  <TableCell className="p-3 border text-center">
                    {new Date(item.CreatedAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="flex justify-center p-3 space-x-2 border">
                    <BookingsEdit BookingId={item.BookingId} onUpdate={fetchBookingData} />
                    <BookingsDelete
                      BookingId={item.BookingId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchBookingData}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="11" className="p-6 text-center text-gray-500">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> bookings
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const BookingDetailsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingDetailsData, setBookingDetailsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");
  const navigate = useNavigate();

  // filters
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedChangedBy, setSelectedChangedBy] = useState(null);

  // sorting config
  const [sortConfig, setSortConfig] = useState({
    key: "BookingDetailId",
    direction: "asc",
  });

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchBookingDetails = async () => {
    Swal.fire({
      title: "Memuat Data Booking Details...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/bookingDetails");
      if (response.data.success) {
        console.log("Data Response BookingDetails", response.data.data);
        setBookingDetailsData(response.data.data);
      } else {
        setError("Failed to fetch booking details data");
      }
    } catch (err) {
      console.error("Error fetching booking details data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };
  
  const [users, setUsers] = useState([]);
  // fetching user data for createdBy filter
  const fetchUsers = async () => {
    try {
      const response = await ApiCustomer.get("/api/user");
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        console.error("Failed to fetch users");
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
    fetchUsers();
  }, []);

  // derive unique options
  // const uniqueStatus = useMemo(() => {
  //   const all = bookingDetailsData.map((b) => b.Status).filter(Boolean);
  //   return ["", ...Array.from(new Set(all)).sort()];
  // }, [bookingDetailsData]);

  const uniqueStatus = useMemo(() => {
  const unique = Object.values(
    bookingDetailsData.reduce((acc, item) => {
       const status = item?.Status;
      if (status?.BookingStatusId && status?.Description) {
        acc[status.BookingStatusId] = {
          BookingStatusId: status.BookingStatusId,
          Description: status.Description,
        };
      }
      return acc;
    }, {})
  );

  // Optional: sort alphabetically by description
  return unique.sort((a, b) => a.Description.localeCompare(b.Description));
}, [bookingDetailsData]);
  const statusOptions = useMemo(() => 
    uniqueStatus.map((s) => ({
      id: s.BookingStatusId,
      name: s.Description,
    })),
    [uniqueStatus]
  );

  console.log("bookingDetailsData :", bookingDetailsData);
  console.log("Unique Status:", uniqueStatus);

  const changedByOptions = useMemo(() => 
    users.map((u) => ({
      id: u.IDUser,
      name: u.Username,
    })),
    [users]
  );

  console.log("Unique ChangedBy:", changedByOptions);


  // filter + search
  const filteredData = bookingDetailsData.filter((item) => {
    const statusId = item.BookingStatusId ?? item.Status?.BookingStatusId ?? "";
    const changedBy = item.ChangedBy ?? "";

    const fStatus = 
      !selectedStatus || String(statusId) === String(selectedStatus.id);
    const fChangedBy =
      !selectedChangedBy || String(changedBy) === String(selectedChangedBy.id);

    if (!(fStatus && fChangedBy)) return false;

    // search with debounced term
    const haystack = [
      item.BookingDetailId,
      item.BookingId,
      item.ResourceId,
      item.ResourceAccountId,
      item.Status?.Description,
      item.ChangedBy,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(debouncedSearchTerm.toLowerCase());
  });

  // sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // default value handling
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSelectedStatus(null);
    setSelectedChangedBy(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // sort handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortSymbol = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Booking Details Management</h2>

      {/* Search & Add */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search..."
          className="w-full sm:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BookingDetailsAdd onUpdate={fetchBookingDetails} />
      </div>

      {/* Filters */}
      <div className="grid gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <ComboboxDemo
          id="status"
          placeholder="All Status"
          value={selectedStatus}
          setValue={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          options={statusOptions}
        />

        <ComboboxDemo
          id="changedBy"
          placeholder="All Changed By"
          value={selectedChangedBy}
          setValue={(val) => {
            setSelectedChangedBy(val);
            setCurrentPage(1);
          }}
          options={changedByOptions}
        />

        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
        >
          Reset Filter
        </button>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow overflow-auto max-h-[600px] relative">
        <Table className="w-full relative border-collapse">
          <TableHeader className="sticky top-0 bg-gray-100 z-10">
            <TableRow className="text-gray-700 uppercase text-sm text-center">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("BookingDetailId")}>
                Booking Detail ID {getSortSymbol("BookingDetailId")}
              </TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("BookingId")}>
                Booking ID {getSortSymbol("BookingId")}
              </TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("ResourceId")}>
                Resource ID {getSortSymbol("ResourceId")}
              </TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("ResourceAccountId")}>
                Resource Account ID {getSortSymbol("ResourceAccountId")}
              </TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("EngineerId")}>
                Engineer ID {getSortSymbol("EngineerId")}
              </TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("Status")}>
                Status {getSortSymbol("Status")}
              </TableHead>
              <TableHead className="border p-3">Customer Time</TableHead>
              <TableHead className="border p-3">User Time</TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("ChangedBy")}>
                Changed By {getSortSymbol("ChangedBy")}
              </TableHead>
              <TableHead className="border p-3 cursor-pointer" onClick={() => handleSort("ChangedAt")}>
                Changed At {getSortSymbol("ChangedAt")}
              </TableHead>
              <TableHead className="border p-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow key={item.BookingDetailId} className={`hover:bg-gray-100 text-center text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="border p-2 text-blue-500 cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/bookings/${item.BookingDetailId}`)}
                  >
                    {item.BookingDetailId}
                  </TableCell>
                  <TableCell className="border p-2">{item.BookingId}</TableCell>
                  <TableCell className="border p-2">{item.ResourceId}</TableCell>
                  <TableCell className="border p-2">{item.ResourceAccountId}</TableCell>
                  <TableCell className="border p-2">{item.engineer ? item.engineer.Name : "-"}</TableCell>
                  <TableCell className="border p-2">{item.Status?.Description || "-"}</TableCell>
                  <TableCell className="p-2 text-left border">
                    <div>
                      Start:{" "}
                      {item.StartTimeCustomerTime
                        ? new Date(item.StartTimeCustomerTime).toLocaleString()
                        : "-"}
                    </div>
                    <div>
                      End:{" "}
                      {item.EndTimeCustomerTime
                        ? new Date(item.EndTimeCustomerTime).toLocaleString()
                        : "-"}
                    </div>
                    <div>
                      Est. Arrival:{" "}
                      {item.EstimatedArrivalTimeCustomerTime
                        ? new Date(item.EstimatedArrivalTimeCustomerTime).toLocaleString()
                        : "-"}
                    </div>
                    <div>
                      Actual Arrival:{" "}
                      {item.ActualArrivalTimeCustomerTime
                        ? new Date(item.ActualArrivalTimeCustomerTime).toLocaleString()
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 text-left border">
                    <div>
                      Start:{" "}
                      {item.StartTimeUserTime
                        ? new Date(item.StartTimeUserTime).toLocaleString()
                        : "-"}
                    </div>
                    <div>
                      End:{" "}
                      {item.EndTimeUserTime
                        ? new Date(item.EndTimeUserTime).toLocaleString()
                        : "-"}
                    </div>
                    <div>Duration: {item.DurationInMinutesUserTime || 0} min</div>
                    <div>
                      Est. Arrival:{" "}
                      {item.EstimatedArrivalTimeUserTime
                        ? new Date(item.EstimatedArrivalTimeUserTime).toLocaleString()
                        : "-"}
                    </div>
                    <div>
                      Actual Arrival:{" "}
                      {item.ActualArrivalTimeUserTime
                        ? new Date(item.ActualArrivalTimeUserTime).toLocaleString()
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 border">
                    {/* {console.log("users :", users)} */}
                    {
                    users.find((u) => u.IDUser === item.ChangedBy)?.Username || "-"
                    }</TableCell>
                  <TableCell className="p-2 border">
                    {new Date(item.ChangedAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2 p-2 border">
                    <BookingDetailsEdit
                      BookingDetailId={item.BookingDetailId}
                      onUpdate={fetchBookingDetails}
                    />
                    <BookingDetailsDelete
                      BookingDetailId={item.BookingDetailId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchBookingDetails}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="12" className="p-4 text-center text-gray-500">
                  No entries found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> booking details
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const BookingStatusTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");
  const navigate = useNavigate();

  const [sortConfig, setSortConfig] = useState({
    key: "Description",
    direction: "asc",
  });

  // 🔍 Debounce pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 🚀 Fetch data
  const fetchBookingStatus = async () => {
    Swal.fire({
      title: "Memuat Data Booking Status...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/booking-status");
      if (response.data.success) {
        setBookingStatusData(response.data.data);
      } else {
        setError("Failed to fetch Booking Status data");
      }
    } catch (err) {
      console.error("Error fetching BookingStatus Table:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchBookingStatus();
  }, []);

  // 📌 Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔍 Filter + search
  const filteredData = useMemo(() => {
    return bookingStatusData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [bookingStatusData, debouncedSearchTerm]);

  // 📊 Sorting data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={16} />;
    return sortConfig.direction === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📋 Booking Status Table</h2>

      {/* 🔍 Search + Add */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search..."
          className="w-full sm:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <BookingStatusAdd onUpdate={fetchBookingStatus} />
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* 📑 Table */}
      <div className="bg-white rounded-2xl shadow overflow-auto max-h-[600px] relative">
        <Table className="w-full border-collapse">
          <TableHeader className="sticky top-0 bg-gray-100 z-10">
            <TableRow className="text-sm text-gray-700 uppercase bg-gray-200">
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-left border cursor-pointer"
                onClick={() => handleSort("BookingStatusId")}
              >
                <div className="flex items-center justify-center gap-1">
                  Booking StatusID {getSortIcon("BookingStatusId")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-left border cursor-pointer"
                onClick={() => handleSort("Description")}
              >
                <div className="flex items-center justify-center gap-1">
                  Description {getSortIcon("Description")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-left border cursor-pointer"
                onClick={() => handleSort("CreatedOn")}
              >
                <div className="flex items-center justify-center gap-1">
                  Created At {getSortIcon("CreatedOn")}
                </div>
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow
                  key={item.BookingStatusId}
                  className={`hover:bg-gray-100 text-center text-sm ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell className="p-3 border">
                    {item.BookingStatusId}
                  </TableCell>
                  <TableCell className="p-3 border">{item.Description}</TableCell>
                  <TableCell className="p-3 border">
                    {new Date(item.CreatedOn).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="border p-2 flex space-x-2 justify-center">
                    <BookingStatusEdit
                      BookingStatusId={item.BookingStatusId}
                      onUpdate={fetchBookingStatus}
                    />
                    <BookingStatusDelete
                      BookingStatusId={item.BookingStatusId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchBookingStatus}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="p-4 text-center text-gray-500">
                  No entries found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔻 Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> entries
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const RepairClassCodeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk menunda pencarian (debounce)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  // Default 10 item per halaman, dapat diubah
  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State untuk input "Go to page"
  const [goToPageInput, setGoToPageInput] = useState("");
  const navigate = useNavigate();

  // 🔹 sort config
  const [sortConfig, setSortConfig] = useState({
    key: "Code",
    direction: "asc",
  });

  // Efek untuk menunda (debounce) pencarian selama 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = async () => {
    Swal.fire({
      title: "Memuat Data Repair Class Code...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/repairClassCode");
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("Failed to fetch repair class code data");
      }
    } catch (err) {
      console.error("Error fetching repair class code data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 filter search menggunakan debouncedSearchTerm
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );

  // 🔹 sorting
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔹 sort handlers
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };
  
  // Fungsi untuk menangani "Go to page"
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Repair Class Code Management</h2>

      {/* Kontainer untuk Search dan Tombol Add yang sejajar dan sama tinggi */}
      <div className="flex flex-wrap items-center  gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search codes..."
          className="w-full sm:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* RepairClassCodeAdd akan sejajar dengan input berkat flexbox */}
        <RepairClassCodeAdd onUpdate={fetchData} />
      </div>
      
      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Kontainer tabel dengan gulir dan header tetap */}
      <div className="bg-white rounded-2xl shadow overflow-auto max-h-[600px] relative">
        <Table className="w-full relative border-collapse">
          {/* Header tabel dengan sticky class */}
          <TableHeader className="sticky top-0 bg-gray-100 z-10">
            <TableRow className="bg-gray-200 text-gray-700 uppercase text-sm text-center">
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Code")}
              >
                Code {getSortIcon("Code")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Description")}
              >
                Description {getSortIcon("Description")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Definition")}
              >
                Definition {getSortIcon("Definition")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("PaymentEligibility")}
              >
                Payment Eligibility {getSortIcon("PaymentEligibility")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("CreatedOn")}
              >
                Created On {getSortIcon("CreatedOn")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow key={item.Code} className={`hover:bg-gray-100 text-center text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell
                    className="border p-2 text-blue-500 cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/repair-class-code/${item.Code}`)}
                  >
                    {item.Code}
                  </TableCell>
                  <TableCell className="border p-2">{item.Description}</TableCell>
                  <TableCell className="border p-2">{item.Definition}</TableCell>
                  <TableCell className="border p-2">{item.PaymentEligibility}</TableCell>
                  <TableCell className="border p-2">
                    {item.CreatedOn
                      ? new Date(item.CreatedOn).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="border p-2 flex justify-center gap-2">
                    <RepairClassCodeEdit Code={item.Code} onUpdate={fetchData} />
                    <RepairClassCodeDelete
                      Code={item.Code}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchData}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="p-4 text-center text-gray-500">
                  No entries found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> codes
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const ServiceCatalogTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk menunda pencarian (debounce)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  // Default 10 item per halaman, dapat diubah
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceCatalogData, setServiceCatalogData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State untuk input "Go to page"
  const [goToPageInput, setGoToPageInput] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "ServiceCatalogID", direction: "desc" });
  const navigate = useNavigate();

  // Efek untuk menunda (debounce) pencarian selama 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchServiceCatalog = async () => {
    Swal.fire({
      title: "Memuat Data Service Catalog...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/service-log");
      if (response.data.success) {
        setServiceCatalogData(response.data.data);
      } else {
        setError("Failed to fetch service catalog data");
      }
    } catch (err) {
      console.error("Error fetching service catalog data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchServiceCatalog();
  }, []);

  // fungsi sorting dengan useMemo untuk performa lebih baik
  const sortedData = useMemo(() => {
    const sorted = [...serviceCatalogData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";

        if (!isNaN(parseFloat(aVal)) && !isNaN(parseFloat(bVal))) {
          const numA = parseFloat(aVal);
          const numB = parseFloat(bVal);
          return sortConfig.direction === "asc" ? numA - numB : numB - numA;
        }

        const strA = aVal.toString().toLowerCase();
        const strB = bVal.toString().toLowerCase();

        if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
        if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [serviceCatalogData, sortConfig]);

  // filter search menggunakan debouncedSearchTerm
  const filteredData = sortedData.filter((item) =>
    Object.values(item).some((value) =>
      value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // Fungsi untuk menangani "Go to page"
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">📊 Service Catalog Table</h2>

      {/* Kontainer untuk Search dan Tombol Add yang sejajar dan sama tinggi */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search..."
          className="w-full sm:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* ServiceCatalogAdd akan sejajar dengan input berkat flexbox */}
        <ServiceCatalogAdd onUpdate={fetchServiceCatalog} />
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Kontainer tabel dengan gulir dan header tetap */}
      <div className="bg-white rounded-2xl shadow overflow-auto max-h-[600px] relative">
        <Table className="w-full relative border-collapse">
          {/* Header tabel dengan sticky class */}
          <TableHeader className="sticky top-0 bg-gray-100 z-10">
            <TableRow className="bg-gray-200 text-gray-700 uppercase text-sm text-center">
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("ServiceCatalogID")}>
                Service Catalog ID {renderSortIcon("ServiceCatalogID")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("AssetID")}>
                Asset ID {renderSortIcon("AssetID")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("Service_offerID")}>
                Service Offer ID {renderSortIcon("Service_offerID")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("PartNumber")}>
                Part Number {renderSortIcon("PartNumber")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("WarrantyStatus")}>
                Warranty Status {renderSortIcon("WarrantyStatus")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("Currency")}>
                Currency {renderSortIcon("Currency")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("Price")}>
                Price {renderSortIcon("Price")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("Tax")}>
                Tax {renderSortIcon("Tax")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border cursor-pointer" onClick={() => requestSort("Total")}>
                Total {renderSortIcon("Total")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow key={item.ServiceCatalogID} className={`hover:bg-gray-100 text-center text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell
                    className="border p-2 text-blue-500 cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/service-log/${item.ServiceCatalogID}`)}
                  >
                    {item.ServiceCatalogID}
                  </TableCell>
                  <TableCell className="border p-2">{item.AssetID}</TableCell>
                  <TableCell className="border p-2">{item.Service_offerID}</TableCell>
                  <TableCell className="border p-2">{item.PartNumber || "-"}</TableCell>
                  <TableCell className="border p-2">{item.WarrantyStatus || "-"}</TableCell>
                  <TableCell className="border p-2">{item.Currency || "-"}</TableCell>
                  <TableCell className="border p-2">
                    {item.Price ? parseFloat(item.Price).toFixed(2) : "-"}
                  </TableCell>
                  <TableCell className="border p-2">
                    {item.Tax ? parseFloat(item.Tax).toFixed(2) : "-"}
                  </TableCell>
                  <TableCell className="border p-2">
                    {item.Total ? parseFloat(item.Total).toFixed(2) : "-"}
                  </TableCell>
                  <TableCell className="border p-2 flex justify-center gap-2">
                    <ServiceCatalogEdit
                      ServiceCatalogID={item.ServiceCatalogID}
                      onUpdate={fetchServiceCatalog}
                    />
                    <ServiceCatalogDelete
                      ServiceCatalogID={item.ServiceCatalogID}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchServiceCatalog}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="11" className="p-4 text-center text-gray-500">
                  No entries found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === filteredData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(filteredData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, filteredData.length)}</b> of{" "}
          <b>{filteredData.length}</b> entries
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const ServiceTypeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceTypeData, setServiceTypeData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // sorting
  const [sortConfig, setSortConfig] = useState({
    key: "ServiceTypeId",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  // Fetch Data
  const fetchServiceTypeData = async () => {
    Swal.fire({
      title: "Memuat Data Service Type...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    setLoading(true);
    setError(null);

    try {
      const response = await ApiCustomer.get("/api/service-type");
      if (response.data.success) {
        setServiceTypeData(response.data.data);
      } else {
        setError("Gagal memuat data Service Type");
      }
    } catch (err) {
      console.error("Error fetching ServiceType data:", err);
      setError("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchServiceTypeData();
  }, []);

  // Filtering
  const filteredData = useMemo(() => {
    return serviceTypeData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [serviceTypeData, debouncedSearchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    const sortable = [...filteredData];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" || typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }

        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    return sortable;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  

  const navigate = useNavigate();

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-bold">Service Type Table</h2>

      {/* Search + Add Button */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 Search Service Type..."
          className="w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ServiceTypeAdd onUpdate={fetchServiceTypeData} />
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-center border">No</TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ServiceTypeId")}
              >
                ID {getSortIcon("ServiceTypeId")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ServiceTypeName")}
              >
                Service Type Name {getSortIcon("ServiceTypeName")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ProblemCategory")}
              >
                Problem Category {getSortIcon("ProblemCategory")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created At {getSortIcon("createdAt")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow
                  key={item.ServiceTypeId}
                  className={`text-sm hover:bg-gray-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell className="p-3 text-center border text-blue-500 cursor-pointer hover:underline">
                    {item.ServiceTypeId}
                  </TableCell>
                  <TableCell className="p-3 text-center border">
                    {item.ServiceTypeName || "-"}
                  </TableCell>
                  <TableCell className="p-3 text-center border">
                    {item.ProblemCategory || "-"}
                  </TableCell>
                  <TableCell className="p-3 text-center border">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <ServiceTypeEdit
                      ServiceTypeId={item.ServiceTypeId}
                      onUpdate={fetchServiceTypeData}
                    />
                    <ServiceTypeDelete
                      ServiceTypeId={item.ServiceTypeId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchServiceTypeData}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="6" className="p-6 text-center text-gray-500">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> Service Type entries
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const OTCCodeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otcCodeData, setOTCCodeData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");
  const navigate = useNavigate();

  // state sorting
  const [sortConfig, setSortConfig] = useState({
    key: "OTCCode",
    direction: "asc",
  });

  // ✅ state baru untuk filter WarrantyCondition
  const [warrantyFilter, setWarrantyFilter] = useState("all");

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchOTCCode = async () => {
    Swal.fire({
      title: "Memuat Data OTC Code...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/otc-code");
      if (response.data.success) {
        setOTCCodeData(response.data.data);
      } else {
        setError("Failed to fetch OTC Code data");
      }
    } catch (err) {
      console.error("Error fetching OTC Code Table:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchOTCCode();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // ✅ Filter by search + warranty condition
  const filteredData = useMemo(() => {
    return otcCodeData
      .filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      )
      .filter((item) => {
        if (warrantyFilter === "all") return true;
        return item.WarrantyCondition === warrantyFilter;
      });
  }, [otcCodeData, debouncedSearchTerm, warrantyFilter]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={16} />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📊 OTC Codes Table</h2>

      {/* 🔍 Search + Add + Filter Warranty */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search..."
          className="w-full sm:w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <OTCAdd onUpdate={fetchOTCCode} />

        {/* ✅ Filter WarrantyCondition */}
        <select
          className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={warrantyFilter}
          onChange={(e) => {
            setWarrantyFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Warranty</option>
          <option value="InWarranty">In Warranty</option>
          <option value="OutWarranty">Out Warranty</option>
        </select>

      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Kontainer tabel dengan gulir dan header tetap */}
      <div className="bg-white rounded-2xl shadow overflow-auto max-h-[600px] relative">
        <Table className="w-full relative border-collapse">
          {/* Header tabel dengan sticky class */}
          <TableHeader className="sticky top-0 bg-gray-100 z-10">
            <TableRow className="text-sm text-gray-700 uppercase bg-gray-200">
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead className="p-3 text-sm font-semibold text-left border cursor-pointer" onClick={() => handleSort("OTCCode")}>
                <div className="flex items-center justify-center gap-1">
                  OTC Code {getSortIcon("OTCCode")}
                </div>
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-left border cursor-pointer" onClick={() => handleSort("Description")}>
                <div className="flex items-center justify-center gap-1">
                  Description {getSortIcon("Description")}
                </div>
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-left border cursor-pointer"
                onClick={() => handleSort("WarrantyCondition")}
              >
                <div className="flex items-center justify-center gap-1">
                  Warranty Condition {getSortIcon("WarrantyCondition")}
                </div>
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-left border cursor-pointer" onClick={() => handleSort("CreatedOn")}>
                <div className="flex items-center justify-center gap-1">
                  Created At {getSortIcon("CreatedOn")}
                </div>
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow key={item.OTCCode} className={`hover:bg-gray-100 text-center text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell className="p-3 text-blue-500 border cursor-pointer hover:underline">
                    {item.OTCCode}
                  </TableCell>
                  <TableCell className="p-3 border">{item.Description}</TableCell>
                  <TableCell className="p-3 border">
                    {item.WarrantyCondition ? item.WarrantyCondition : "—"}
                  </TableCell>
                  <TableCell className="p-3 border">
                    {new Date(item.CreatedOn).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="border p-2 flex space-x-2 justify-center">
                    <OTCEdit OTCCode={item.OTCCode} onUpdate={fetchOTCCode} />
                    <OTCDelete
                      OTCCode={item.OTCCode}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchOTCCode}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="p-4 text-center text-gray-500">
                  No entries found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom controls */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> entries
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const CrsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Menambahkan itemsPerPage
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [CrsData, setCrsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState(""); // Menambahkan goToPageInput

  // state sorting
  const [sortConfig, setSortConfig] = useState({
    key: "caseResolutionCode",
    direction: "asc",
  });

  const fetchCrs = async () => {
    Swal.fire({
      title: "Memuat Data CRS",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/caseResolution");
      if (response.data.success) {
        setCrsData(response.data.data);
      } else {
        setError("Failed to fetch CRS data");
      }
    } catch (err) {
      console.error("Error fetching CRS data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchCrs();
  }, []);

  // Sorting function
  const sortedData = useMemo(() => {
    const sorted = [...CrsData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle null/undefined values
        if (aVal == null) aVal = "";
        if (bVal == null) bVal = "";

        // Tipe data date
        const aIsDate = !isNaN(Date.parse(aVal));
        const bIsDate = !isNaN(Date.parse(bVal));

        if (aIsDate && bIsDate) {
          const dateA = new Date(aVal);
          const dateB = new Date(bVal);
          return sortConfig.direction === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }

        // Tipe data string
        if (typeof aVal === "string") {
            const result = aVal.localeCompare(bVal);
            return sortConfig.direction === "asc" ? result : -result;
        }

        // Tipe data angka
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortConfig.direction === "asc" ? result : -result;
      });
    }
    return sorted;
  }, [CrsData, sortConfig]);

  // Filtering function
  const filteredData = useMemo(() => {
    return sortedData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sortedData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  // handle click sort
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // render icon sort
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    if (sortConfig.direction === "asc")
      return <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />;
    return <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />;
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Case Resolution Table</h2>
      <input
        type="text"
        placeholder="Search..."
        className="w-1/3 p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset halaman ke 1 saat mencari
        }}
      />

      <CrsAdd />

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Kontainer untuk tabel yang bisa digulir */}
      <div className="bg-white rounded-2xl shadow overflow-scroll max-h-300">
        <Table className="min-w-full border border-gray-300 border-collapse">
          <TableHeader className="sticky z-10 top-0 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("id_csr")}>
                <div className="flex items-center justify-center gap-1">
                  ID Csr {renderSortIcon("id_csr")}
                </div>
              </TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("caseResolutionCode")}>
                <div className="flex items-center justify-center gap-1">
                  Case Resolution Code {renderSortIcon("caseResolutionCode")}
                </div>
              </TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("autoClose")}>
                <div className="flex items-center justify-center gap-1">
                  Auto Close {renderSortIcon("autoClose")}
                </div>
              </TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("caseReadyForClosure")}>
                <div className="flex items-center justify-center gap-1">
                  Case Ready For Closure {renderSortIcon("caseReadyForClosure")}
                </div>
              </TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("readyForCloseDays")}>
                <div className="flex items-center justify-center gap-1">
                  Ready For Close Days {renderSortIcon("readyForCloseDays")}
                </div>
              </TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("readyForClosureDate")}>
                <div className="flex items-center justify-center gap-1">
                  Ready For Closure Date {renderSortIcon("readyForClosureDate")}
                </div>
              </TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("pendingCustomerAction")}>
                <div className="flex items-center justify-center gap-1">
                  Pending Customer Action {renderSortIcon("pendingCustomerAction")}
                </div>
              </TableHead>
              <TableHead className="p-2 border cursor-pointer" onClick={() => handleSort("customerRequestedCloseDate")}>
                <div className="flex items-center justify-center gap-1">
                  Customer Requested CloseDate {renderSortIcon("customerRequestedCloseDate")}
                </div>
              </TableHead>
              <TableHead className="p-2 border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow key={item.id_csr} className={`text-center hover:bg-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-2 text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/case-resolution/${item.id_csr}`)}
                  >
                    {item.id_csr}
                  </TableCell>
                  <TableCell className="p-2 text-blue-500 border">{item.caseResolutionCode}</TableCell>
                  <TableCell className="p-2 border">{item.autoClose}</TableCell>
                  <TableCell className="p-2 border">{item.caseReadyForClosure}</TableCell>
                  <TableCell className="p-2 border">{item.readyForCloseDays}</TableCell>
                  <TableCell className="p-2 border">
                    {item.readyForClosureDate ? new Date(item.readyForClosureDate).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell className="p-2 border">
                    {item.pendingCustomerAction ? new Date(item.pendingCustomerAction).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell className="p-2 border">
                    {item.customerRequestedCloseDate ? new Date(item.customerRequestedCloseDate).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell className="border p-2 flex space-x-2 justify-center">
                    <CrsEdit id_csr={item.id_csr} onUpdate={fetchCrs} />
                    <CrsDelete
                      id_csr={item.id_csr}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchCrs}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9" className="p-4 text-center text-gray-500">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination dan Rows per page */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, filteredData.length)}</b> of{" "}
          <b>{filteredData.length}</b> entries
        </div>

        {/* Tombol Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const NmuTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nmuData, setNmuData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // SORTING STATE
  const [sortConfig, setSortConfig] = useState({
    key: "NMUId",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  const fetchNmuData = async () => {
    Swal.fire({
      title: "Memuat Data NMU...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/nmu");
      if (response.data.success) {
        setNmuData(response.data.data);
      } else {
        setError("Failed to fetch NMU data");
      }
    } catch (err) {
      console.error("Error fetching NMU data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchNmuData();
  }, []);

  // Filtering logic
  const filteredData = useMemo(() => {
    return nmuData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [nmuData, debouncedSearchTerm]);

  // Sorting logic
  const sortedData = useMemo(() => {
    const sortable = [...filteredData];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" || typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }

        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    return sortable;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  // Go to page
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-bold">NMU Master Table</h2>

      {/* Search + Add Button */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 Search NMU..."
          className="w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <NmuAdd onUpdate={fetchNmuData} />
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("NMUId")}
              >
                NMU ID {getSortIcon("NMUId")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("NMUDesc")}
              >
                Description {getSortIcon("NMUDesc")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("ItemNeeded")}
              >
                Item Needed {getSortIcon("ItemNeeded")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("VersionNeeded")}
              >
                Version Needed {getSortIcon("VersionNeeded")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created At {getSortIcon("createdAt")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow
                  key={item.NMUId}
                  className={`text-sm hover:bg-gray-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell
                    className="p-3 text-center text-blue-500 border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/nmu/${item.NMUId}`)}
                  >
                    {item.NMUId}
                  </TableCell>
                  <TableCell className="p-3 border text-center">{item.NMUDesc || "-"}</TableCell>
                  <TableCell className="p-3 border text-center">
                    {item.ItemNeeded ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="p-3 border text-center">
                    {item.VersionNeeded ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="p-3 border text-center">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <NmuEdit NMUId={item.NMUId} onUpdate={fetchNmuData} />
                    <NmuDelete
                      NMUId={item.NMUId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchNmuData}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="p-6 text-center text-gray-500">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> NMU entries
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const NmuItemTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nmuItemData, setNmuItemData] = useState([]);
  const [goToPageInput, setGoToPageInput] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // SORTING STATE
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  const fetchNmuItemData = async () => {
    Swal.fire({
      title: "Memuat Data NMU Item...",
      text: "Mohon tunggu sebentar...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/nmu/nmuitem");
      if (response.data.success) {
        setNmuItemData(response.data.data);
      } else {
        setError("Failed to fetch NMU Item data");
      }
    } catch (err) {
      console.error("Error fetching NMU Item data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchNmuItemData();
  }, []);

  // Filtering logic
  const filteredData = useMemo(() => {
    return nmuItemData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [nmuItemData, debouncedSearchTerm]);

  // Sorting logic
  const sortedData = useMemo(() => {
    const sortable = [...filteredData];
    const getNestedValue = (obj, key) => {
      return key.split(".").reduce((acc, part) => acc && acc[part], obj);
    };
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" || typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }

        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      });
    }
    return sortable;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  // Go to page
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-bold">NMU Item Master Table</h2>

      {/* Search + Add Button */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 Search NMU Item..."
          className="w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <NmuItemAdd onUpdate={fetchNmuItemData} />
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto max-h-[70vh]">
        <Table className="min-w-full relative border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-gray-200">
            <TableRow className="text-sm text-gray-700 uppercase">
              <TableHead className="p-3 text-sm font-semibold text-left border">No</TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("id")}
              >
                Item ID {getSortIcon("id")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("itemName")}
              >
                Item Name {getSortIcon("itemName")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("nmuId")}
              >
                NMU ID {getSortIcon("nmuId")}
              </TableHead>
              <TableHead
                className="p-3 border cursor-pointer text-center"
                onClick={() => handleSort("nmu.NMUDesc")}
              >
                NMU Desc {getSortIcon("nmu.NMUDesc")}
              </TableHead>
              <TableHead
                className="p-3 text-center border cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created At {getSortIcon("createdAt")}
              </TableHead>
              <TableHead className="p-3 text-center border">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, i) => (
                <TableRow
                  key={item.id}
                  className={`text-sm hover:bg-gray-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <TableCell className="p-3 text-center border">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </TableCell>
                  <TableCell className="p-3 text-center border">{item.id}</TableCell>
                  <TableCell className="p-3 text-center border">{item.itemName}</TableCell>
                  <TableCell className="p-3 text-center border">{item.nmuId}</TableCell>
                  <TableCell className="p-3 text-center border">
                    {item.nmu?.NMUDesc || "-"}
                  </TableCell>
                  <TableCell className="p-3 border text-center">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2 p-3 border">
                    <NmuItemEdit id={item.id} onUpdate={fetchNmuItemData} />
                    <NmuItemDelete id={item.id} itemName={item.itemName} onUpdate={fetchNmuItemData} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="p-6 text-center text-gray-500">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> NMU Item entries
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export const FailureTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Mengubah default itemsPerPage menjadi 10
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [FailureData, setFailureData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goToPageInput, setGoToPageInput] = useState(""); // Menambahkan state untuk "Go to page"

  // 🔹 State untuk sorting
  const [sortConfig, setSortConfig] = useState({
    key: "FailureId",
    direction: "asc",
  });

  const fetchFailureDataTable = async () => {
    setLoading(true);
    setError(null);
    Swal.fire({
      title: "Memuat Data Failure...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await ApiCustomer.get("/api/failure");
      if (response.data.success) {
        setFailureData(response.data.data);
      } else {
        setError("Failed to fetch Failure data");
      }
    } catch (err) {
      console.error("Error fetching Failure data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  useEffect(() => {
    fetchFailureDataTable();
  }, []);

  // 🔹 Fungsi sorting
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // 🔹 Menggunakan useMemo untuk sorting dan filtering
  const sortedAndFilteredData = useMemo(() => {
    const filtered = FailureData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const sorted = [...filtered].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const valueA = a[sortConfig.key] ?? "";
      const valueB = b[sortConfig.key] ?? "";
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [FailureData, searchTerm, sortConfig]);

  // Hitung total halaman
  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage) || 1;

  // Ambil data sesuai halaman saat ini
  const currentData = sortedAndFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  // 🔹 Ikon sort dinamis
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="inline w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="inline w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // 🔹 Fungsi untuk "Go to page"
  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = Number(goToPageInput);
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPageInput("");
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Failure Management</h2>
      <input
        type="text"
        placeholder="🔍 Search failures..."
        className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 mb-4 w-full md:w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <FailureAdd />
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Kontainer untuk tabel yang bisa digulir */}
      <div className="bg-white rounded-2xl shadow overflow-scroll max-h-300">
        <Table className="w-full relative border-collapse">
          <TableHeader className="sticky z-10 top-0 bg-gray-100">
            <TableRow>
              <TableHead className="p-3 text-sm font-semibold text-center border">No</TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("FailureId")}
              >
                Failure ID {renderSortIcon("FailureId")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Name")}
              >
                Name {renderSortIcon("Name")}
              </TableHead>
              <TableHead
                className="p-3 text-sm font-semibold text-center border cursor-pointer"
                onClick={() => handleSort("Description")}
              >
                Description {renderSortIcon("Description")}
              </TableHead>
              <TableHead className="p-3 text-sm font-semibold text-center border">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((FailureItem, i) => (
                <TableRow
                  key={FailureItem.FailureId}
                  className={`hover:bg-blue-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <TableCell className="p-3 text-center border">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                  <TableCell
                    className="p-3 text-blue-500 text-center border cursor-pointer hover:underline"
                    onClick={() => navigate(`/app/failure/${FailureItem.FailureId}`)}
                  >
                    {FailureItem.FailureId}
                  </TableCell>
                  <TableCell className="p-3 border">{FailureItem.Name}</TableCell>
                  <TableCell className="p-3 border">{FailureItem.Description}</TableCell>
                  <TableCell className="flex p-3 space-x-2 justify-center border">
                    <FailureEdit
                      FailureId={FailureItem.FailureId}
                      onUpdate={fetchFailureDataTable}
                    />
                    <FailureDelete
                      FailureId={FailureItem.FailureId}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchFailureDataTable}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="p-6 text-center text-gray-500">
                  No data found 🚫
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Kontrol di bagian bawah tabel */}
      <div className="flex flex-col w-full gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="p-1 text-sm border rounded-lg"
            value={itemsPerPage === sortedAndFilteredData.length ? "all" : itemsPerPage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setItemsPerPage(sortedAndFilteredData.length);
                setCurrentPage(1);
              } else {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Info total data */}
        <div className="text-sm text-gray-600">
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> –{" "}
          <b>{Math.min(currentPage * itemsPerPage, sortedAndFilteredData.length)}</b> of{" "}
          <b>{sortedAndFilteredData.length}</b> entries
        </div>

        {/* Pagination + Go to page */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span className="px-3 py-1 text-sm">
              Page <b>{currentPage}</b> of {totalPages}
            </span>

            <button
              className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Go to"
                className="w-16 p-1 text-sm text-center border rounded-lg"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-2 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
