import React, { useEffect, useMemo, useState } from "react";
import ApiCustomer from "@/api";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash-es";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, Image as ImageIcon, Search, Building, User, File, LucideLaptop } from "lucide-react";
import { format } from "date-fns";
import { ComboboxDemo, SearchCommandBlock, SelectBarState } from "@/components/sc-select";
import { toast } from "sonner";
import { formatDateForInput,formatDate } from "@/lib/utils";
import Swal from "sweetalert2";
import { extractRoleFromStatus, STATUS_ENUM_TO_LABEL } from "@/hooks/useCaseStatus";
import CaseField from "@/components/CaseField";
import { useAuth } from "@/context/auth-context";
import DatePicker from "@/components/date-picker";
/**
 * @fileoverview Create Case page (SearchCase_V3)
 * A single-page flow to create a Case with auto-fill from Asset, Contact, Company, and Product.
 * Includes debounced search helpers, EMSIFA region lookups, accessory and photo handling,
 * and final payload submission to `/api/case-information`.
 */


// ----------------------------
// Typedefs
// ----------------------------

/**
 * @typedef {Object} ProductInfo
 * @property {string} ProductNumber
 * @property {string} ProductName
 * @property {string} [ProductLine]
 * @property {string} [vendor]
 * @property {number} [ProductTypeID]
 */

/**
 * @typedef {Object} AssetInfo
 * @property {number} AssetID
 * @property {string} SerialNumber
 * @property {string} ProductNumber
 * @property {ProductInfo} [product_information]
 * @property {number|null} [ContactID]
 * @property {number|null} [SiteAccountID]
 */
/**
 * @typedef {Object} ContactInfo
 * @property {number} ContactID
 * @property {string} FirstName
 * @property {string} LastName
 * @property {string|null} [Email]
 * @property {string|null} [Phone]
 * @property {string|null} [Mobile]
 * @property {string|null} [Country]
 * @property {string|null} [StateProvince]
 * @property {string|null} [City]
 * @property {string|null} [ZipPostalCode]
 * @property {number|null} [SiteAccountID]
 * @property {{Company:string}|null} [site_account]
 */

/**
 * @typedef {Object} SiteAccount
 * @property {number} SiteAccountID
 * @property {string} Company
 * @property {string|null} [Email]
 * @property {string|null} [PrimaryPhone]
 * @property {string|null} [WhatsappNo]
 * @property {string} AddressLine1
 * @property {string|null} [AddressLine2]
 * @property {string} City
 * @property {string|null} [StateProvince]
 * @property {string} Country
 * @property {string} ZipPostalCode
 */

/**
 * @typedef {Object} AccessoryRow
 * @property {string} id
 * @property {string} name
 * @property {string} note
 * @property {string} code
 */

/**
 * @typedef {Object} ProductType
 * @property {number} ProductTypeID
 * @property {string} ProductTower
 * @property {string} ProductGroup
 * @property {string} ProductType
 */

/**
 * Province/City option used by EMSIFA helpers and SelectBarState.
 * @typedef {Object} ProvinceOption
 * @property {string} id
 * @property {string} name
 */

/**
 * Payload sent to create a Case.
 * @typedef {Object} CaseCreatePayload
 * @property {number} AssetID
 * @property {number} ContactID
 * @property {number|null} SiteAccountID
 * @property {string} CaseSubject
 * @property {string} CaseID_Manual
 * @property {date} CaseID_Manual_Date
 * @property {string} CaseType
 * @property {boolean} KCI_Flag
 * @property {"Email"|"Phone"|"WalkIn"} IncomingChannel
 * @property {"Open"|"Close"|string} CaseStatus
 * @property {"Low"|"Medium"|"Important"|string} CasePriority
 * @property {string} CustomerSeverity
 * @property {string|null} CaseClosedDate
 * @property {number|null} CaseNote
 * @property {number|null} SymptomCode
 * @property {string|null} CaseResolution
 * @property {number} CreatedBy
 * @property {string} ProblemDescription
 * @property {string} CaseNoteProduct
 * @property {AccessoryRow[]} [accessories]
 */



// ----------------------------
// Types (Work on TSX Only)
// ----------------------------

// type ProductInfo = {
//   ProductNumber: string;
//   ProductName: string;
//   ProductLine?: string;
//   vendor?: string;
//   ProductTypeID?: number;
// };

// type AssetInfo = {
//   AssetID: number;
//   SerialNumber: string;
//   ProductNumber: string;
//   product_information?: ProductInfo;
//   ContactID?: number | null;
//   SiteAccountID?: number | null;
// };

// type ContactInfo = {
//   ContactID: number;
//   FirstName: string;
//   LastName: string;
//   Email?: string | null;
//   Phone?: string | null;
//   Mobile?: string | null;
//   Country?: string | null;
//   StateProvince?: string | null;
//   City?: string | null;
//   ZipPostalCode?: string | null;
//   SiteAccountID?: number | null;
//   site_account?: { Company: string } | null;
// };

// type SiteAccount = {
//   SiteAccountID: number;
//   Company: string;
//   Email?: string | null;
//   PrimaryPhone?: string | null;
//   WhatsappNo?: string | null;
//   AddressLine1: string;
//   AddressLine2?: string | null;
//   City: string;
//   StateProvince?: string | null;
//   Country: string;
//   ZipPostalCode: string;
// };

// type AccessoryRow = { id: string; name: string; note: string; code: string };

// ----------------------------
// Constants (Business Rules)
// ----------------------------

const CASE_TYPES = ["Bench", "Onsite", "DOA","Express","Depot Repair"];
const CASE_STATUS = [
  "NEW_AssignCE",
  "NEW_AssignPS",
  "NEW_AssignAPO",
  "New",
  "Open",
  "Close",
  "InActive",
  "NEW_POPDoc"
];
const WARRANTY_STATUS = ["In Warranty", "Out Warranty"];

const LABEL_TO_STATUS_ENUM = Object.entries(STATUS_ENUM_TO_LABEL).reduce((acc, [key, val]) => {
  acc[val] = key;
  return acc;
}, {});

// ----------------------------
// Helpers
// ----------------------------

/**
 * Join class names, filtering falsy values.
 * @param {...(string|false|undefined)} s
 * @returns {string}
 */
function classNames(...s) {
  return s.filter(Boolean).join(" ");
}

/**
 * Safely parse user id from JWT stored in localStorage under 'token'.
 * Returns null if token absent/invalid.
 * @returns {{id: any}|null}
 */
function getUserFromTokenSafe() {
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return null;
    const payload = JSON.parse(atob(raw.split(".")[1]));
    return { id: payload?.id ?? payload?.userId,
      user: payload
     };
  } catch {
    return null;
  }
}

/**
 * Utility object for formatting and parsing dates between UI and DB formats.
 */
const DateHelper = {
  /**
   * Converts a database date string into a UI-compatible format.
   *
   * @param {string} dateStr - The ISO date string from the database.
   * @returns {string} The formatted string for input fields.
   */
  fromDB(dateStr) {
    // DB → UI
    return formatDateForInput(dateStr);
  },

  /**
   * Converts a UI input date string into an ISO format suitable for databases.
   *
   * @param {string} dateStr - The input date string (e.g., from a datetime-local input).
   * @returns {string | null} The ISO-formatted date string, or null if input is empty.
   */
  toDB(dateStr) {
    // UI → DB
    return dateStr ? new Date(dateStr).toISOString() : null;
  },
};
// ----------------------------
// Component
// ----------------------------

/**
 * NewCaseForm - one page create-case form with auto-fill from asset/customer/product.
 * Manages local state for lookups, conditional auto-fill behaviors, and submit flow.
 * @component
 * @returns {JSX.Element}
 */
export default function NewCaseForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Global state
  const [loading, setLoading] = useState(false);
  const savedTeamId = localStorage.getItem("activeTeamId");

  // Step toggles (cards on a single page)
  const [showCustomerCard, setShowCustomerCard] = useState(false);
  const [showCompanySection, setShowCompanySection] = useState(false);
  const [showProductCard, setShowProductCard] = useState(false);
  const [showWarrantyCard, setShowWarrantyCard] = useState(false);
  const [showAccessoryCard, setShowAccessoryCard] = useState(false);
  const [showPhotoCard, setShowPhotoCard] = useState(false);
  const [showLogCard, setShowLogCard] = useState(false);

  // Case fields
  const [receivedDate, setReceivedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [caseID_Manual_Date, setcaseID_Manual_Date] = useState();
  const [caseSubject, setCaseSubject] = useState("");
  const [caseID_Manual, setcaseID_Manual] = useState("");
  const [referenceCase, setReferenceCase] = useState("");
  const [caseStatus, setCaseStatus] = useState("New");
  const [hideAssignTo, setHideAssignTo] = useState(false);
  const [caseType, setCaseType] = useState("Bench");
  const [problemDesc, setProblemDesc] = useState("");
  const [caseNote, setCaseNote] = useState("");
  const [kciFlag, setKciFlag] = useState(false);

  const [roleAssign, setRoleAssign] = useState([]);
  const [caseAssign, setCaseAssign] = useState(null)

  // Lookup: Asset by serial
  /** @type {[string, (val: string) => void]} */
  const [serialQuery, setSerialQuery] = useState("");

  /** @type {[AssetInfo[], (val: AssetInfo[]) => void]} */
  const [assetResults, setAssetResults] = useState([]);

  const [assetNotFound, setAssetNotFound] = useState(false);

  /** @type {[AssetInfo|null, (val: AssetInfo|null) => void]} */
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Lookup: Customer / Contact / Company
  const [customerQuery, setCustomerQuery] = useState("");

  /** @type {[ContactInfo[], (val: ContactInfo[]) => void]} */
  const [contactResults, setContactResults] = useState([]);

  const [contactNotFound, setContactNotFound] = useState(false);

  /** @type {[SiteAccount[], (val: SiteAccount[]) => void]} */
  const [companyResults, setCompanyResults] = useState([]);
  const [companyNotFound, setCompanyNotFound] = useState(false);
  const [ProductNotFound, setProductNotFound] = useState(false);

  /** @type {[ContactInfo|null, (val: ContactInfo|null) => void]} */
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactSalutation, setContactSalutation] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactAddressLine1, setContactAddressLine1] = useState("");
  const [contactStateProvince, setContactStateProvince] = useState("");
  const [contactCity, setContactCity] = useState("");
  const [contactCountry, setContactCountry] = useState("Indonesia");
  const [contactZipPostalCode, setContactZipPostalCode] = useState("");

  const [usePIC, setUsePIC] = useState(false);
  const [contactPICName, setContactPICName] = useState("");
  const [contactPICEmail, setContactPICEmail] = useState("");
  const [contactPICPhone, setContactPICPhone] = useState("");

  const [provContact, setProvContact] = useState([]);
  const [cityContact, setCityContact] = useState([]);

  /** @type {[SiteAccount|null, (val: SiteAccount|null) => void]} */
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWhatsapp, setCompanyWhatsapp] = useState("");
  const [companyAddressLine1, setCompanyAddressLine1] = useState(""); 
  const [companyStateProvince, setCompanyStateProvince] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyCountry, setCompanyCountry] = useState("Indonesia");
  const [companyZipPostalCode, setCompanyZipPostalCode] = useState("");
  const [companyNPWP, setCompanyNPWP] = useState("");

  const [provCompany, setProvCompany] = useState([]);
  const [cityCompany, setCityCompany] = useState([]);


  // Product fields
  const [productQuery, setProductQuery] = useState("");

  /** @type {[ProductInfo[], (val: ProductInfo[]) => void]} */
  const [productResults, setProductResults] = useState([]);

  const [productTypeList, setProductTypeList] = useState([]);

  /** @type {[ProductInfo|null, (val: ProductInfo|null) => void]} */
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productTower, setProductTower] = useState(""); // IPG/PSG
  const [productGroup, setProductGroup] = useState(""); // Commercial/Consumer
  const [productTypeId, setProductTypeId] = useState(undefined);
  const [productLine, setProductLine] = useState("");
  const [productNo, setProductNo] = useState("");
  const [productName, setProductName] = useState("");
  const [vendor, setVendor] = useState("");

  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isNewAsset, setIsNewAsset] = useState(false);
  const [isNewContact, setIsNewContact] = useState(false);
  const [isNewCompany, setIsNewCompany] = useState(false);

  const [needWarrantyApproval, setNeedWarrantyApproval] = useState(false);
  const [isVoidWarranty, setIsVoidWarranty] = useState(false);


  // Warranty
  const [warrantySearchValue, setWarrantySearchValue] = useState("");
  const [warrantyOptions, setWarrantyOptions] = useState([]);

  const [selectWarrantyCodeStatus, setSelectWarrantyCodeStatus] = useState("")
  const [selectWarrantyStatus, setSelectWarrantyStatus] = useState("")
  const [warrantyStatus, setWarrantyStatus] = useState("");
  const [eowDate, setEowDate] = useState("");

  // Accessories
  /** @type {[AccessoryRow[], (val: AccessoryRow[]) => void]} */
  const [accessories, setAccessories] = useState([
    { id: crypto.randomUUID(), name: "", note: "", code: "" },
  ]);


  // Photos
  /** @type {[File[], (val: File[]) => void]} */
  const [photos, setPhotos] = useState([]);

  // Log notes (optional extra note besides CaseNote)
  const [logNote, setLogNote] = useState("");

  // ----------------------------
  // Debounced search handlers
  // ----------------------------

  /**
   * Search asset by serial (debounced).
   * Will set assetResults and show product card on success.
   * @param {string} q
   */
  const searchAsset = useMemo(
    () =>
      debounce(async (q) => {
        if (!q || q.length < 2) {
          setAssetResults([]);
          setAssetNotFound(false);
          return;
        }
        try {
          const res = await ApiCustomer.get(`/api/asset-information`, {
            params: { search: q },
          });
          const list = res.data?.data || [];
          setAssetResults(list);
          setAssetNotFound(list.length === 0);
          setShowProductCard(true);
        } catch (e) {
          console.error("Search asset failed", e);
          setAssetResults([]);
          setAssetNotFound(true);
        }
      }, 400),
    []
  );

  /**
   * Search contacts and companies (debounced).
   * @param {string} q
   */
  const searchCustomer = useMemo(
    () =>
      debounce(async (q) => {
        if (!q || q.length < 2) {
          setContactResults([]);
          setCompanyResults([]);

          setContactNotFound(false);
          setCompanyNotFound(false);
          return;
        }
        try {
          // Try both contact & company search
          const [contacts, companies] = await Promise.all([
            ApiCustomer.get(`/api/contact-information`, { params: { search: q } }),
            ApiCustomer.get(`/api/site_account`, { params: { search: q } }),
          ]);
          setContactResults(contacts.data?.data || []);
          setCompanyResults(companies.data?.data || []);

          const contactList = contacts.data?.data || [];
          const companyList = companies.data?.data || [];

          setContactResults(contactList);
          setCompanyResults(companyList);
          setContactNotFound(contactList.length === 0 && companyList.length === 0);
          setCompanyNotFound(companyList.length === 0);
        } catch (e) {
          console.error("Search customer failed", e);
          setContactResults([]);
          setCompanyResults([]);

          setContactNotFound(true);
          setCompanyNotFound(true);
        }
      }, 400),
    []
  );

  /**
   * Search products (debounced).
   * @param {string} q
   */
  const searchProduct = useMemo(
    () =>
      debounce(async (q) => {
        if (!q || q.length < 2) {
          setProductResults([]);
          setProductNotFound(false);
          return;
        }
        try {
          const res = await ApiCustomer.get(`/api/product-information`, {
            params: { search: q },
          });
          const list = res.data?.data || [];
          setProductResults(list);
          setProductNotFound(list.length === 0 );
        } catch (e) {
          console.error("Search product failed", e);
          setProductResults([]);
          setProductNotFound(true)
        }
      }, 400),
    []
  );

  // ------ fetch assignable users by role when needed ------
  const fetchUserAssign = async (role) => {
    try {
      const res = await ApiCustomer.get(`/api/user?role=${role}`);
      const FetchAllUserByRole = res.data.data || [];
      const FilterAllUserByRole = FetchAllUserByRole.filter(u => u.ResourceId === user.resource)
      setRoleAssign(FilterAllUserByRole);
    } catch (err) {
      console.error(err)
      toast.error("Error fetching role");
    }
  };

  /**
   * Search Warranty OTC Code (debounced).
   * @param {string} q
   */
  const fetchWarrantyStatus = useMemo(
    () => 
      debounce(async (q) => {
        try {
          const response = await ApiCustomer.get(`/api/otc-code`,{
            params: { search: q}
          })
          const list = response.data?.data || []
          const option = response.data?.data.map((res)=>({
            label: res.Description,
            value: res.OTCCode
          }))
          setWarrantyOptions(option);
        } catch (error) {
          toast.error("Failed fetch warranty:",error)
          setWarrantyOptions([]);
        }
      }, 400)
    , []
  )

  /**
   * Search products type.
   * @param {string} q
   */

  // List ProductType untuk dropdown
  const [productTypes, setProductTypes] = useState([]);

  // Fetch product types when tower/group changes
  useEffect(() => {
    if (productTower && productGroup) {
      fetchProductTypes(productTower, productGroup);
    } else {
      setProductTypeList([]);
    }
  }, [productTower, productGroup]);

  // Fetch product types from API
  /**
   * Fetch and populate Product Types based on tower and group.
   * @param {string} tower
   * @param {string} group
   * @returns {Promise<void>}
   */
  const fetchProductTypes = async (tower, group) => {
    try {
      const response = await ApiCustomer.get(`/api/product-type`, {
        params: { ProductTower: tower, ProductGroup: group },
      });
      setProductTypeList(response.data.data || []);
    } catch (err) {
      toast.error("Fetching product type error:",err)
      setProductTypeList([]);
    }
  };

  // ----------------------------
  // Effects
  // ----------------------------

  useEffect(() => {
    if (warrantyOptions.length > 0 && warrantySearchValue) {
      const matched = warrantyOptions.find(
        (opt) => opt.value === warrantySearchValue
      );
      if (!matched) {
        // Option tidak ditemukan, bisa auto-add atau log warning
        console.warn("Warranty option not found:", warrantySearchValue);
      }
    }
  }, [warrantyOptions, warrantySearchValue]);

  // Auto-fill company when company field selected
  useEffect(() => {
    if (selectedCompany?.Company) {
      setShowCompanySection(true);
      const cm = selectedCompany;
      setCompanyName(cm.Company);
      setCompanyEmail(cm.Email);
      setCompanyPhone(cm.PrimaryPhone);
      setCompanyWhatsapp(cm.WhatsappNo);
      setCompanyAddressLine1(cm.AddressLine1);
      
      //emsifa reverse engineer
      // Province (convert string -> object)
      const provObj = provCompany.find((p) => p.name === cm.StateProvince);
      setCompanyStateProvince(provObj ? provObj : { id: "", name: cm.StateProvince });
      
      // City (convert string -> object) -> city list harus sesuai province id
      if (provObj?.id) {
        (async () => {
          const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provObj.id}.json`);
          const cityList = await res.json();
          const cityObj = cityList.find((c) => c.name === cm.City);
          setCompanyCity(cityObj ? cityObj : { id: "", name: cm.City });
        })();
      } else {
        setCompanyCity({ id: "", name: cm.City });
      }
      
      setCompanyCountry(cm.Country);
      setCompanyZipPostalCode(cm.ZipPostalCode);
      setCompanyNPWP(cm.NPWP)
    }
  }, [selectedCompany])

  // Auto-fill Contact when Company field selected 
  useEffect(() => {
    (async () => {
      if (!selectedCompany) return;
      try {
        const resContactAffiliated = await ApiCustomer.get(`/api/contact-information?SiteAccountID=${selectedCompany.SiteAccountID}`);
        const listContactAffiliated = resContactAffiliated.data.data || []
        setContactResults(listContactAffiliated);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedCompany])

  // Auto-fill product when asset selected
  useEffect(() => {
    if (selectedAsset?.product_information) {
      const p = selectedAsset.product_information;
      setSelectedProduct(p);
      setProductNo(p.ProductNumber);
      setProductName(p.ProductName);
      setProductLine(p.ProductLine || "");
      setVendor(p.vendor || "");
      if (p.product_type) {
        setProductTower(p.product_type.ProductTower || "");
        setProductGroup(p.product_type.ProductGroup || "");
        setProductTypeId(p.product_type.ProductTypeID?.toString() || "");
      } else {
        setProductTypeId(p.ProductTypeID?.toString() || "");
      }
      setShowProductCard(true);
    }
  }, [selectedAsset]);

  //auto fill waranty when asset selected
  useEffect(() => {
    if(selectedAsset?.Warranty_Status){
      if (selectedAsset.EOW_Date) {
        setEowDate(formatDateForInput(selectedAsset.EOW_Date));
      }

      // Fetch warranty options, lalu set value
      const warrantyCode = selectedAsset.Warranty_Status;
      fetchWarrantyStatus(warrantyCode); // << fetch list berdasarkan kode yang sudah ada
      setWarrantySearchValue(warrantyCode);
    }
  }, [selectedAsset])

  // Auto-fill customer when asset selected (if asset has owner)
  useEffect(() => {
    (async () => {
      if (!selectedAsset) return;
      if (selectedAsset?.ContactID) {
        try {
          const [cRes] = await Promise.all([
            ApiCustomer.get(`/api/contact-information/${selectedAsset.ContactID}`),
          ]);
          const c = cRes.data?.data;
          if (c) {
            setSelectedContact(c);
            if (c.SiteAccountID) {
              setShowCompanySection(true);
              const sa = await ApiCustomer.get(`/api/site_account/${c.SiteAccountID}`);
              const comp = sa.data?.data;

              if (comp) setSelectedCompany(comp);
            } else {
              setSelectedCompany([]);
            }
          }
        } catch (e) {
          console.error("Autofill customer failed", e);
        }
      }
    })();
  }, [selectedAsset]);

  // Enforce rerepair if another open case exists for the same asset
  const [mustRerepair, setMustRerepair] = useState(false);
  const [lastCase, setLastCase] = useState([]);
  
  // Function to check rerepair count in the last 90 days
  const getReRepairCount = async (assetID) => {
    try {
      const res = await ApiCustomer.get(`/api/case-information`, {
        params: {
          AssetID: assetID,
          excludeStatuses: ['FinishRepair','Void'], // atau ambil semua status, tergantung kebutuhan
        },
      });

      const allCases = res.data?.data ?? [];

      const now = new Date();
      const past90Days = new Date(now);
      past90Days.setDate(now.getDate() - 90);

      const count = allCases.filter((c) => {
        const createdDate = new Date(c.caseinformation.CreatedOn); 
        return createdDate >= past90Days && createdDate <= now;
      }).length;
      return count;
    } catch (e) {
      console.error("Failed to fetch rerepair count", e);
      return 0;
    }
  };

  useEffect(() => {
    (async () => {
      if (!selectedAsset) return;
      try {
        const res = await ApiCustomer.get(`/api/case-information`, {
          params: { excludeStatuses: ['FinishRepair', 'Void'] },
        });
        const list = res.data?.data ?? [];

        // Filter berdasarkan asset yang dipilih
        const openCasesForAsset = list.filter(
          (c) => c?.caseinformation?.AssetID === selectedAsset.AssetID
        );
        if (openCasesForAsset.length > 0) {
          // Urutkan berdasarkan tanggal dibuat (pastikan pakai field yang sesuai)
          const sortedCases = openCasesForAsset.sort((a, b) =>
            new Date(b.caseinformation.CreatedOn) - new Date(a.caseinformation.CreatedOn)
          );

          const latestCase = sortedCases[0]; // Ambil yang terbaru

          setLastCase(latestCase); // Simpan ke state
          setMustRerepair(true);
        } else {
          setMustRerepair(false);
          setLastCase([]); // Clear last case jika tidak ada case terbuka
        }
      } catch (e) {
        toast.error("Check open case failed",e)
      }
    })();
  }, [selectedAsset]);

  // Auto-fill customer when customer field selected
  useEffect(() => {
    if (selectedContact?.ContactID) {
      const ct = selectedContact;
      setContactSalutation(ct.Salutation);
      setContactFirstName(ct.FirstName);
      setContactLastName(ct.LastName);
      setContactEmail(ct.Email);
      setContactPhone(ct.Phone);
      setContactMobile(ct.Mobile);
      setContactAddressLine1(ct.AddressLine1);

      if(ct.PIC_Name){
        setUsePIC(true);
        setContactPICName(ct.PIC_Name)
        setContactPICEmail(ct.PIC_Email)
        setContactPICPhone(ct.PIC_Phone)
      }


      // setContactStateProvince(ct.StateProvince || "");
      // setContactCity(ct.City || "");

      const provObj = provContact.find((p) => p.name === ct.StateProvince);
      setContactStateProvince(provObj ? provObj : { id: "", name: ct.StateProvince });

      // City (convert string -> object) -> city list harus sesuai province id
      if (provObj?.id) {
        (async () => {
          const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provObj.id}.json`);
          const cityList = await res.json();
          const cityObj = cityList.find((c) => c.name === ct.City);
          setContactCity(cityObj ? cityObj : { id: "", name: ct.City });
        })();
      } else {
        setContactCity({ id: "", name: ct.City });
      }


      setContactCountry(ct.Country);
      setContactZipPostalCode(ct.ZipPostalCode);
    }
  }, [selectedContact])

  // Auto-fill Company when contact selected (if any)
  useEffect(() => {
    (async () => {
      if (!selectedContact) return;
      try {
        if (selectedContact?.SiteAccountID) {
          setShowCompanySection(true);
          const sa = await ApiCustomer.get(`/api/site_account/${selectedContact.SiteAccountID}`);
          const comp = sa.data?.data;

          if (comp) setSelectedCompany(comp);
        } else {
          setSelectedCompany([]);
        }
      } catch (err) {
        console.error(err);

      }
    })();
  }, [selectedContact])

  // Auto-fill product when contact selected (asset owned by contact)
  useEffect(() => {
    (async () => {
      if (!selectedContact) return;
      try {
        const checkAssetAffiliatedContact = await ApiCustomer.get(`/api/asset-information?ContactID=${selectedContact.ContactID}`)
        const listAffiliatedAsset = checkAssetAffiliatedContact.data.data || [];
        setAssetResults(listAffiliatedAsset);
      } catch (err) {
        console.error(err);
        toast.error("Select contact failed:",err)
      }
    })()
  }, [selectedContact]);

  // ----------------------------
  // EMSIFA Province / City (ID only)
  // ----------------------------
  /** @type {[any[], (val: any[]) => void]} */
  const [prov, setProv] = useState([]);

  /** @type {[any[], (val: any[]) => void]} */
  const [city, setCity] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const json = await res.json();
        setProvContact(json ?? []);
        setProvCompany(json ?? []);
      } catch (e) {
        toast.warning("EMSIFA provinces fetch failed")
      }
    })();
    fetchWarrantyStatus("");
  }, []);

  useEffect(() => {
    (async () => {
      if (!contactStateProvince?.id) {
        setCityContact([]);
        return;
      }
      try {
        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${contactStateProvince.id}.json`
        );
        const json = await res.json();
        setCityContact(json ?? []);
      } catch {
        setCityContact([]);
      }
    })();
  }, [contactStateProvince]);

  useEffect(() => {
    (async () => {
      if (!companyStateProvince?.id) {
        setCityCompany([]);
        return;
      }
      try {
        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${companyStateProvince.id}.json`
        );
        const json = await res.json();
        setCityCompany(json ?? []);
      } catch {
        setCityCompany([]);
      }
    })();
  }, [companyStateProvince]);

  // ----------------------------
  // Accessory handlers
  // ----------------------------

  /**
   * Add an empty accessory row.
   */
  const addAccessory = () =>
    setAccessories((s) => [...s, { id: crypto.randomUUID(), name: "", note: "", code: "" }]);

  /**
   * Remove accessory row by id. Keeps at least one row.
   * @param {string} id
   */
  const removeAccessory = (id) =>
    setAccessories((s) => (s.length === 1 ? s : s.filter((r) => r.id !== id)));

  /**
   * Update accessory field.
   * @param {string} id
   * @param {"id"|"name"|"note"|"code"} key
   * @param {string} val
   */
  const updateAccessory = (id, key, val) =>
    setAccessories((s) => s.map((r) => (r.id === id ? { ...r, [key]: val } : r)));

  // ----------------------------
  // Photo handlers
  // ----------------------------

  /**
   * Handle file input change for photos.
   * @param {FileList|null} files
   */
  const onPickPhotos = (files) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.warning(`${f.name} lebih dari 5MB, tidak bisa diupload`);
        return false;
      }
      if (!f.type.startsWith("image/")) {
        toast.warning(`${f.name} bukan file gambar`);
        return false;
      }
      return true;
    });
    setPhotos(validFiles);
  };

  // ----------------------------
  // Company <- Contact copier
  // ----------------------------
  const copyCompanyFromContact = () => {
    // Basic fields
    setCompanyEmail(contactEmail || "");
    setCompanyPhone(contactPhone || "");
    setCompanyWhatsapp(contactMobile || "");
    setCompanyAddressLine1(contactAddressLine1 || "");
    setCompanyCountry(contactCountry || "");
    setCompanyZipPostalCode(contactZipPostalCode || "");

    // Province/City are objects used by ComboboxDemo; reuse the selected contact objects
    // This also triggers city list fetch effect for company when province has an id
    setCompanyStateProvince(contactStateProvince || { id: "", name: "" });
    setCompanyCity(contactCity || { id: "", name: "" });
  };

  // ----------------------------
  // PIC <- Contact copier
  // ----------------------------
  const copyPICFromContact = () => {
    setContactPICName(`${contactFirstName} ${contactLastName}`.trim());
    setContactPICEmail(contactEmail || "");
    setContactPICPhone(contactPhone || "");
  };

  // ----------------------------
  // Create Case
  // ----------------------------

  /**
   * Create a new case using selected asset/contact and other form fields.
   * Performs optional photo upload and action log creation.
   * @returns {Promise<void>}
   */

  // useEffect(() => {
  //     if (warrantySearchValue !== "01T" && needWarrantyApproval) {
  //   setNeedWarrantyApproval(false);
  // }
  //   needWarrantyApproval ? setCaseStatus("NEW_POPDoc") : setCaseStatus(caseStatus ?? "New");
  // }, [warrantySearchValue, needWarrantyApproval])

  useEffect(() => {
    if (warrantySearchValue !== "01T" && needWarrantyApproval) {
      setNeedWarrantyApproval(false);
    }
  }, [warrantySearchValue, needWarrantyApproval]);

  useEffect(() => {
    if (needWarrantyApproval) {
      setCaseStatus("NEW_POPDoc");
    } else {
      setCaseStatus((prevStatus) => prevStatus ?? "New");
    }
  }, [needWarrantyApproval]);

  const onCreateCase = async () => {
    if ((!selectedAsset && !isNewAsset) || (!selectedContact && !isNewContact)) {
      toast.warning("Please select or Create both an Asset and a Contact before creating a case.");
      return;
    }
    if(isNewAsset && (!isNewProduct && !selectedProduct)){
      toast.warning("Please select or Create Product No before creating new asset")
      return
    }
    if (usePIC && (!contactPICName || !contactPICEmail || !contactPICPhone)) {
      toast.warning("Mohon lengkapi data PIC jika checkbox 'Tambahkan PIC' dicentang.");
      return;
    }
    if (!problemDesc || !caseSubject) {
      toast.custom((id) => (
        <div style={{ padding: "1rem", background: "#333", color: "#fff", borderRadius: "8px" }}>
          <strong>!! Problem description or casesubject undefined</strong>
          <p>Please fill the require column.</p>
          <button onClick={() => toast.dismiss(id)}>Close</button>
        </div>
      ));

      return;
    }
    //failsafe is warranty
    if(!warrantySearchValue) {
      toast("Warranty tidak valid")
      return;
    }
    /**
     * TODO : (FOR SLAMET)
     * ADDING A In Warranty Group
     */
    if(warrantySearchValue === "02N"){
      const today = new Date();
      const eow = new Date(eowDate);

      if (eow < today.setHours(0, 0, 0, 0)) {
        toast.warning("Warranty tidak valid: EOW date sudah lewat.");
        return;
      }
    }
    
    setLoading(true);
    try {

      const pickLabel = (value) => {
        if (value && typeof value === "object") {
          return value.name ?? value.label ?? value.value ?? "";
        }
        return value ?? "";
      };

      // Filter out empty accessories (all empty fields)
      const filteredAccessories = accessories.filter(
        (a) => a.name.trim() || a.note.trim() || a.code.trim()
      );

      const assetSN = selectedAsset?.SerialNumber;
      const normalizedEowDate = eowDate ? new Date(eowDate).toISOString() : null;
      const existingCompanyId = selectedCompany?.SiteAccountID ?? null;
      const finalProductNumber = selectedProduct?.ProductNumber || productNo || null;
      const needsNewCompany = isNewContact && showCompanySection && !selectedCompany;
      const companyPayload = needsNewCompany
        ? {
            Company: companyName,
            Email: companyEmail,
            PrimaryPhone: companyPhone,
            WhatsappNo: companyWhatsapp,
            AddressLine1: companyAddressLine1,
            AddressLine2: "",
            City: pickLabel(companyCity),
            StateProvince: pickLabel(companyStateProvince),
            Country: companyCountry,
            ZipPostalCode: companyZipPostalCode,
            NPWP: companyNPWP,
          }
        : null;

      const productPayload = isNewProduct
        ? {
            ProductNumber: productNo,
            ProductName: productName,
            ProductLine: productLine,
            ProductTypeID: productTypeId ? parseInt(productTypeId, 10) : null,
            vendor,
          }
        : null;

      const contactPayload = isNewContact
        ? {
            Salutation: contactSalutation,
            FirstName: contactFirstName,
            LastName: contactLastName,
            Email: contactEmail,
            Phone: contactPhone,
            Mobile: contactMobile,
            AddressLine1: contactAddressLine1,
            AddressLine2: "",
            City: pickLabel(contactCity),
            StateProvince: pickLabel(contactStateProvince),
            Country: contactCountry,
            ZipPostalCode: contactZipPostalCode,
            PIC_Name: usePIC ? contactPICName : null,
            PIC_Email: usePIC ? contactPICEmail : null,
            PIC_Phone: usePIC ? contactPICPhone : null,
          }
        : null;

      const contactPicPayload = !isNewContact && usePIC
          ? {
              PIC_Name: contactPICName,
              PIC_Email: contactPICEmail,
              PIC_Phone: contactPICPhone,
            }
          : null;

      const caseStatusValue = needWarrantyApproval ? "NEW_POPDoc" : caseStatus;

      /** @type {CaseCreatePayload} */
      const casePayload = {
        CaseSubject: caseSubject,
        CaseID_Manual: caseID_Manual,
        CaseID_Manual_Date: caseID_Manual_Date,
        CaseType: caseType,
        KCI_Flag: kciFlag,
        IncomingChannel: "Email",
        CaseStatus: caseStatus,
        CasePriority: "Medium",
        CustomerSeverity: "Normal",
        CaseClosedDate: null,
        CaseNote: null,
        SymptomCode: null,
        CaseResolution: null,
        CreatedBy: user?.id,
        Owner: caseAssign ?? user?.id,
        ProblemDescription: problemDesc,
        CaseNoteProduct: caseNote,
        ReferenceCase: referenceCase
      };

      const references = {
        productNumber: isNewProduct ? null : finalProductNumber,
        companyId: needsNewCompany ? null : existingCompanyId,
        contactId: isNewContact ? null : selectedContact?.ContactID ?? null,
        assetId: isNewAsset ? null : selectedAsset?.AssetID ?? null,
      };

      const flags = {
        isNewProduct,
        isNewCompany: Boolean(companyPayload),
        isNewContact,
        isNewAsset,
        needWarrantyApproval,
        isVoidWarranty,
        usePIC,
        assignCompanyToExistingContact:!isNewContact &&
          Boolean((companyPayload || existingCompanyId) && selectedContact) &&
          selectedContact?.SiteAccountID == null,
        attachContactToExistingAsset:
          !isNewAsset && selectedAsset?.ContactID == null,
        attachCompanyToExistingAsset:
          !isNewAsset &&
          Boolean(companyPayload || existingCompanyId) &&
          selectedAsset?.SiteAccountID == null,
      };

      const compositePayload = {
        caseData: casePayload,
        accessories: filteredAccessories,
        product: productPayload,
        company: companyPayload,
        contact: contactPayload,
        contactPIC: contactPicPayload,
        asset: isNewAsset ? { SerialNumber: serialQuery } : null,
        warranty: { status: warrantySearchValue, eowDate: normalizedEowDate },
        flags,
        references,
        resources: savedTeamId
      };

      const confirmcreate = await Swal.fire({
        title: "Apakah data sudah benar ?",
        text: "Tolong check kembali data yang telah di input!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak"
      })

      if (!confirmcreate.isConfirmed) return;

      const res = await ApiCustomer.post("/api/case-information/create-case",compositePayload);
      const createdCase = res.data?.data?.case;
      const caseId = createdCase?.CaseID;
      const createdCaseStatus = createdCase?.CaseStatus;

      if (!caseId) {
        throw new Error("Case creation failed. Missing CaseID from response.");
      }

      // Optional: upload photos to a local endpoint if present
      if (photos.length > 0) {
        try {
          const fd = new FormData();
          photos.forEach((f) => fd.append("files", f));
          fd.append("caseId", caseId);
          await ApiCustomer.post("/api/case-information/upload-case", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (e) {
          toast.warning("Photo upload skipped/failed", e);
        }
      }

      // ActionLog
      try {
        await ApiCustomer.post("/api/actionlog", {
          CaseId: `${caseId}`,
          ReferenceId: `${caseId}`,
          model: "Case",
          dataOld: "New",
          dataNew: createdCaseStatus,
          changedBy: user?.id,
          logDescription: `New Case : ${caseId}`,
        });
      } catch (e) {
        toast.warning("ActionLog failed",e)
      }

      //case note
      try {
        const userData = user?.user;
        await ApiCustomer.post("/api/case-information/case-notes", {
          CaseID: `${caseId}`,
          LogTye: 'NotesLog',
          ActionType: 'Initial',
          VisibleExternally: false,
          MinutesSpent: 0,
          Note: `${problemDesc}`,
          CreatedBy: user?.id
        })
      } catch (error) {
        toast.warning("Case Note failed,",error)
      }

      
      
      //if rerepair, add note
      if(mustRerepair){
        try {
          const rerepairCount = await getReRepairCount(selectedAsset.AssetID);
          await ApiCustomer.post("/api/case-information/case-notes",{
            CaseID: `${caseId}`,
            LogTye: 'NotesLog',
            ActionType: 'Initial',
            VisibleExternally: false,
            MinutesSpent: 0,
            Note: `[WARNING]! SN# ${assetSN} has been rerepair ${rerepairCount} times in the last 90 day. Last case ID : ${lastCase.caseinformation.CaseID} received on ${formatDate(lastCase.caseinformation.CreatedOn)}, closed on .`,
            CreatedBy: user?.id
          })
        } catch (e) {
          toast.warning("Case Note failed")
          
        }
      }

      toast.success("Succcess",{
        description: "Case has been created successfully"
      });
      // Navigate detail
      navigate(`/app/case/${caseId}`);
    } catch (e) {
      if (e.response?.status === 400 || e.response?.status === 409) {
        const msg = e.response?.data?.message || "Invalid input";
        toast.warning(msg, {
          position: "top-center",
        });
      } else {
        toast.warning("Something went wrong", {
          description: e.response?.data?.message || e.message,
          position: "top-center",
        });
      }

    } finally {
      setLoading(false);
    }
  };
const photoUrls = useMemo(() => photos.map(f => URL.createObjectURL(f)), [photos]);
useEffect(() => () => photoUrls.forEach(URL.revokeObjectURL), [photoUrls]);
  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div  className="bg-[#e8eaeb] p-2 space-y-2 dark:bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%">
      {/* Header */}
        {/* Quick Search */}
        <Card className={'w-full dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:border-b-slate-600 dark:border-purple-700'} id="quickSearch">
          <CardContent className="flex w-full gap-6 flex-col lg:flex-row">
            {/* Serial Number Search */}
            <div className="space-y-2 flex-1">
            <Label className={'text-md lg:text-lg'}>Serial Number</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type serial number..."
                  value={serialQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSerialQuery(v);
                    searchAsset(v);
                  }}
                  className={"dark:text-white dark:border-gray-400 ring-1 ring-gray-400"}
                />
                <Button variant="outline" type="button" onClick={() => searchAsset.flush()} className={"dark:bg-cyan-700 cursor-pointer dark:border-gray-400"}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Results */}
              {assetResults.length > 0 ? (
                <div className="mt-2 divide-y rounded-md border bg-card max-h-40 overflow-auto">
                  {assetResults.map((a) => (
                    <button
                      key={a.AssetID}
                      type="button"
                      className={classNames(
                        "w-full text-left px-3 py-2 hover:bg-accent/40",
                        selectedAsset?.AssetID === a.AssetID && "bg-accent/70"
                      )}
                      onClick={() => {
                        setSelectedAsset(a)
                        setSerialQuery(a.SerialNumber)
                      }}
                    >
                      <div className="font-medium">{a.SerialNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.product_information?.ProductName} · PN {a.ProductNumber}
                      </div>
                    </button>
                  ))}
                </div>
              ) : assetNotFound ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  ❌ Data asset tidak ditemukan
                </div>
              ) : null}

              {/* Checkbox */}
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="isNewAsset"
                  checked={isNewAsset}
                  className={"m-1 ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}
                  onCheckedChange={(v) => {
                    setIsNewAsset(Boolean(v));
                  }
                  }
                />
                <Label htmlFor="isNewAsset" className={'font-[700]'}>Buat Asset Baru</Label>
              </div>
            </div>

            {/* Customer Search */}
            <div className="space-y-2 flex-1">
              <Label className={'text-md lg:text-lg'}>Customer (name/email/phone/company)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search customer or company..."
                  value={customerQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomerQuery(v);
                    searchCustomer(v);
                  }}
                  className={"dark:text-white dark:border-gray-400 ring-1 ring-gray-400"}
                />
                <Button variant="outline" type="button" onClick={() => searchCustomer.flush()} className={"dark:bg-cyan-700 cursor-pointer dark:border-gray-400"}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Results */}
              {(contactResults.length > 0 || companyResults.length > 0) ? (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Contacts */}
                  <div className="rounded-md border bg-card max-h-40 overflow-auto divide-y">
                    <div className="px-2 py-1 text-xs font-medium">Contacts</div>
                    {contactResults.map((c) => (
                      <button
                        key={c.ContactID}
                        type="button"
                        className={classNames(
                          "w-full text-left px-3 py-2 hover:bg-accent/40",
                          selectedContact?.ContactID === c.ContactID && "bg-accent/70"
                        )}
                        onClick={() => setSelectedContact(c)}
                      >
                        <div className="font-medium">
                          {c.FirstName} {c.LastName}
                          {c.site_account?.Company && (
                            <span className="text-xs text-muted-foreground"> · {c.site_account.Company}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{c.Email || c.Phone || "-"}</div>
                      </button>
                    ))}
                  </div>

                  {/* Companies */}
                  <div className="rounded-md border bg-card max-h-40 overflow-auto divide-y">
                    <div className="px-2 py-1 text-xs font-medium">Companies</div>
                    {companyResults.map((s) => (
                      <button
                        key={s.SiteAccountID}
                        type="button"
                        className={classNames(
                          "w-full text-left px-3 py-2 hover:bg-accent/40",
                          selectedCompany?.SiteAccountID === s.SiteAccountID && "bg-accent/70"
                        )}
                        onClick={() => setSelectedCompany(s)}
                      >
                        <div className="font-medium">{s.Company}</div>
                        <div className="text-xs text-muted-foreground">{s.City}, {s.Country}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : contactNotFound ? (
                <div className="mt-2 text-sm text-muted-foreground dark:text-white">
                  ❌ Customer / Company tidak ditemukan
                </div>
              ) : null}

              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="createCustomer"
                  checked={isNewContact}
                  className={"m-1  ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}
                  onCheckedChange={(v) => {
                    setIsNewContact(Boolean(v));
                  }
                  }
                />
                <Label htmlFor="createCustomer" className={'font-[700]'}>Buat customer baru (jika tidak ditemukan)</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      
      {/* LEFT MAIN FORM */}
      <div className="lg:columns-2 space-y-2 md:columns-1 ">

        {/* 1) Case Section */}
        <Card className="rounded-2xl p-[20px]  shadow-2xl   break-inside-avoid dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50% dark:border-purple-700" id='case'>
          <CardHeader>
            <CardTitle>1) Case</CardTitle>
            <CardDescription>Diisi setelah pilih serial/customer.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Received Date <Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
              <Input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} className={"ring-1 ring-gray-400 dark:text-white  mt-2 rounded-md dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2 "}/>

              <Label>Case ID Manual</Label>
              <Input value={caseID_Manual} onChange={(e) => setcaseID_Manual(e.target.value)} className={"ring-1 ring-gray-400 dark:text-white  mt-2 rounded-md dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2 "}/>
            </div>

            <div className="space-y-2">
              <Label>Case ID Manual Date</Label>
              <Input type="datetime-local" value={caseID_Manual_Date}  onChange={(e) => setcaseID_Manual_Date(e.target.value)} className={"ring-1 ring-gray-400 dark:text-white  mt-2 rounded-md dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2 "}/>

              <Label>Reference Case</Label>
              <Input value={referenceCase} onChange={(e) => setReferenceCase(e.target.value)} className={"ring-1 ring-gray-400 dark:text-white  mt-2 rounded-md dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label>Case Status <Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
              <Select 
                value={caseStatus} 
                onValueChange={async (label) => {
                  const enumValue = label
                  setCaseStatus(enumValue ?? caseStatus)
                  const isNewAssign = typeof enumValue === "string" && enumValue?.startsWith("NEW_Assign");
                  setHideAssignTo(isNewAssign);
                  if(isNewAssign){
                    const role = extractRoleFromStatus(enumValue);
                    if(role){
                      try {
                        fetchUserAssign(role)
                      } catch (err) {
                        toast.error("Error fetcing role")
                      }
                    }
                  } else {
                    setRoleAssign([])
                    setCaseAssign(null)
                  }
                }}
              >
                <SelectTrigger className={"ring-1 ring-gray-400 rounded-sm w-full dark:ring-gray-400 dark:focus:ring-[#1776bb]"}>
                  <SelectValue placeholder="Select Case Status" />
                </SelectTrigger>
                <SelectContent>
                  {CASE_STATUS.map((s) => (
                    <SelectItem value={s} key={s}>{STATUS_ENUM_TO_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
              <Label>Case Type <Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger className={"ring-1 ring-gray-400  rounded-sm w-full  dark:ring-gray-400 dark:focus:ring-[#1776bb]"}>
                  <SelectValue placeholder="Select Case Type" />
                </SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map((t) => (
                    <SelectItem value={t} key={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mustRerepair && (
                <div>
                  <p className="text-xs text-amber-600 mt-1">Ada case OPEN untuk asset ini. Case akan berubah status menjadi re repair</p>
                  <p>Last open case ID: {lastCase.caseinformation.CaseID}</p>
                  <p>Case created at: {formatDate(lastCase.caseinformation.CreatedOn)}</p>
                </div>
              )}
            </div>

            <div className=" space-y-2 col-span-2 lg:col-span-3">
              <CaseField
                label="Assign To"
                hide={!hideAssignTo}
                indent
              >
                <SearchCommandBlock
                  value={caseAssign || null}
                  onChange={(selectedID) => {
                    if (!selectedID) {
                      setCaseAssign(null)
                      return
                    }
                    const selectedUser = roleAssign.find(
                      (user) => user.IDUser === selectedID
                    )
                    if (selectedUser) {
                      setCaseAssign(selectedUser.IDUser)
                    }
                  }}
                  placeholder="--Select--"
                  options={roleAssign.map((user) => ({
                    label: user.Name,
                    value: user.IDUser,
                  }))}
                  renderLabel={(opt) => opt.label}
                  getValue={(opt) => opt.value}
                  className="dark:bg-transparent dark:ring-1 dark:ring-gray-400 ring-1"
                />
              </CaseField>
           </div> 

            <div className=" space-y-2 col-span-2 lg:col-span-1">
              <Label>Case Subject <Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
              <Textarea type="text" rows={3} value={caseSubject} onChange={(e) => setCaseSubject(e.target.value)} className={"ring-1 ring-gray-400  dark:bg-gray-500/10 dark:border-gray-400"}/>
            </div>

            <div className="space-y-2 col-span-2 lg:col-span-1">
              <Label>Problem Description <Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
              <Textarea rows={3} value={problemDesc} onChange={(e) => setProblemDesc(e.target.value)} className={"ring-1 ring-gray-400  dark:bg-gray-500/10 dark:border-gray-400"}/>
            </div>

            <div className="md:col-span-3 col-span-2 space-y-2">
              <Label>Case Note <Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
              <Textarea rows={3} value={caseNote} onChange={(e) => setCaseNote(e.target.value)} className={"ring-1 ring-gray-400  dark:bg-gray-500/10 dark:border-gray-400"}/>
            </div>

            <div className="md:col-span-3">
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="kci" checked={kciFlag} onCheckedChange={(v) => setKciFlag(Boolean(v))} className={"ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}/>
                <Label htmlFor="kci">KCI Flag</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2) Customer / Company */}
        <Card className="rounded-2xl p-[20px]  shadow-2xl   break-inside-avoid dark:bg-gradient-to-tr dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50% dark:border-purple-700" id='customer'>
          <CardHeader>
            <CardTitle>2) Customer / Company</CardTitle>
            <CardDescription>Isi data customer baru. Centang untuk include ke Company.</CardDescription>
            <div className="flex items-center gap-2">
              <Checkbox
                id="incCompany"
                checked={showCompanySection}
                onCheckedChange={(v) => {
                  const checked = Boolean(v);
                  if (!contactFirstName) {
                    toast.info("Tolong lengkapilah data customer terlebih dahulu",{position: 'top-center'})
                  } else {
                    setShowCompanySection(checked);
                    copyCompanyFromContact();
                  }
                }}
                className={"ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}
              />
              <Label htmlFor="incCompany" className={'font-[700]'}>Termasuk dalam company</Label>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-flow-row  gap-4 ">
              {/* Customer */}
              <div className="space-y-2  p-2 dark:border-gray-400 dark:rounded-sm">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">Salutation<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <div className="col-span-2">
                    <Select value={contactSalutation} onValueChange={setContactSalutation}>
                      <SelectTrigger className={"ring-1 ring-gray-400 rounded-sm"}>
                        <SelectValue placeholder="Mr / Mrs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr.">Mr</SelectItem>
                        <SelectItem value="Mrs.">Mrs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {showCompanySection && (
                <div className="grid grid-cols-3 gap-2 items-center ">
                  <Label className="col-span-1">Nama Company<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input className={"dark:text-white col-span-2 ring-1 rounded-sm ring-gray-400 dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                )}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">Nama Customer<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <Input placeholder="First Name" value={contactFirstName} onChange={(e) => setContactFirstName(e.target.value)} className={"dark:text-white ring-1 rounded-sm ring-gray-400  dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                    <Input placeholder="Last Name" value={contactLastName} onChange={(e) => setContactLastName(e.target.value)} className={"dark:text-white  ring-1 rounded-sm  ring-gray-400  dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">No. Telepon<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input className={"dark:text-white ring-1 rounded-sm col-span-2 dark:hover:border-transparent dark:focus:border-transparent  ring-gray-400  dark:focus:rounded-lg dark:p-2"} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">No. Whatsapp</Label>
                  <Input className={"dark:text-white ring-1 rounded-sm col-span-2 dark:hover:border-transparent dark:focus:border-transparent  ring-gray-400  dark:focus:rounded-lg dark:p-2"} value={contactMobile} onChange={(e) => setContactMobile(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">Email<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input className={"dark:text-white ring-1 rounded-sm col-span-2 dark:hover:border-transparent dark:focus:border-transparent  ring-gray-400  dark:focus:rounded-lg dark:p-2"} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">Alamat<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input className={"dark:text-white ring-1 rounded-sm col-span-2  dark:hover:border-transparent dark:focus:border-transparent  ring-gray-400  dark:focus:rounded-lg dark:p-2"} value={contactAddressLine1} onChange={(e) => setContactAddressLine1(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">Country<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input className={"dark:text-white  col-span-2 ring-1 rounded-sm dark:hover:border-transparent dark:focus:border-transparent  ring-gray-400  dark:focus:rounded-lg dark:p-2"} placeholder="Indonesia / other" value={contactCountry} onChange={(e) => setContactCountry(e.target.value)} />
                </div>
                {/* Province/City (Indonesia via EMSIFA) */}
                {contactCountry.toLowerCase() === 'indonesia' ? (
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label className="col-span-1">Province<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                    <div className="col-span-2">
                      <ComboboxDemo
                        id="contactStateProvince"
                        value={contactStateProvince}
                        setValue={setContactStateProvince}
                        options={provContact}
                        placeholder="Select a Province"
                        className={" dark:bg-transparent ring-1 ring-gray-400 rounded-sm"}
                        />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label className="col-span-1">
                      State / Region<Label className="text-red-600 dark:text-[#FF8A80]">*</Label>
                    </Label>
                    <Input
                      className={"dark:text-white ring-1 ring-gray-400 rounded-sm col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      value={contactStateProvince}
                      onChange={(e) => setContactStateProvince(e.target.value)}
                      placeholder="e.g. Tokyo, California, etc."
                    />
                  </div>
                )}

                {contactCountry.toLowerCase() === "indonesia" ? (
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label className="col-span-1">City<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                    <div className="col-span-2 overflow-hidden">
                      <ComboboxDemo
                        id="contactCity"
                        value={contactCity}
                        setValue={setContactCity}
                        options={cityContact}
                        placeholder="Select a City"
                        disabled={!contactStateProvince || cityContact.length === 0}
                        className={"border-1 border-gray-400 rounded-sm dark:bg-transparent"}
                      />
                    </div>
                  </div>
                ): (
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <Label className="col-span-1">
                      City / Area <Label className="text-red-600 dark:text-[#FF8A80]">*</Label>
                    </Label>
                    <Input
                      className={"dark:text-white ring-1 ring-gray-400 ronded-sm col-span-2  dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                      value={contactCity}
                      onChange={(e) => setContactCity(e.target.value)}
                      placeholder="e.g. Jakarta, Berlin, New York..."
                    />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label className="col-span-1">Zip Code<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input className={"col-span-2 dark:text-white ring-1 ring-gray-400 rounded-sm dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={contactZipPostalCode} onChange={(e) => setContactZipPostalCode(e.target.value)} />
                </div>

                {showCompanySection && (
                <div className="grid grid-cols-3 gap-2 items-center">
                    <Label className="col-span-1">NPWP<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                    <Input className={"dark:text-white ring-1 ring-gray-400 rounded-sm col-span-2 dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={companyNPWP} onChange={(e) => setCompanyNPWP(e.target.value)} />
                </div>
                )}

                {/* PIC Information */}
                <div className="space-y-2 border-2 p-2 rounded dark:border-gray-400 dark:rounded-sm">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="usePIC"
                        checked={usePIC}
                        onCheckedChange={(v) => setUsePIC(Boolean(v))}
                        className={"ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}  
                      />
                      <Label htmlFor="usePIC" className={'text-[10px] lg:text-sm'}>Tambahkan PIC</Label>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={copyPICFromContact} disabled={!usePIC} className={'cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50% text-[10px] lg:text-sm'}>
                      Same as Contact Information
                    </Button>
                  </div>
                </div>
                
                {usePIC && (
                  <>  
                    <div className="grid grid-cols-3 gap-2 items-center pt-4 border-t">
                      <Label className="col-span-1">Nama PIC<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input
                        className={"dark:text-white ring-gray-400 ring-1 dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        placeholder="Nama PIC"
                        value={contactPICName}
                        onChange={(e) => setContactPICName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Email PIC<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input
                        className={"dark:text-white ring-gray-400 ring-1 dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                        placeholder="Email PIC"
                        type="email"
                        value={contactPICEmail}
                        onChange={(e) => setContactPICEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">No. Telepon PIC<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input className={"dark:text-white ring-gray-400 ring-1 dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={contactPICPhone} onChange={(e) => setContactPICPhone(e.target.value)} />
                    </div>
                  </>
                )}

              </div>

              {/* Company (optional) */}
                {showCompanySection && (
                <div className="space-y-2 border-2 p-2 dark:border-gray-400 dark:rounded-sm">
                  <div className="flex justify-end" hidden>
                    <Button type="button" variant="outline" size="sm" onClick={copyCompanyFromContact} className={'cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}>
                      Same as contact information
                    </Button>
                  </div>

                  <div className="space-y-2 w-full">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Email Company<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Nomor Telepon<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Nomor WA</Label>
                      <Input className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={companyWhatsapp} onChange={(e) => setCompanyWhatsapp(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Alamat<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={companyAddressLine1} onChange={(e) => setCompanyAddressLine1(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Country<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} />
                    </div>
                    {companyCountry.toLowerCase() === 'indonesia' ? (
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Province (ID)<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <div className="col-span-2">
                        <ComboboxDemo
                          id="CompanyStateProvince"
                          value={companyStateProvince}
                          setValue={setCompanyStateProvince}
                          options={provCompany}
                          placeholder="Select a Province"
                          className={"dark:border-gray-400 dark:bg-transparent"}
                        />
                      </div>
                    </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <Label className="col-span-1">
                          State / Region<Label className="text-red-600 dark:text-[#FF8A80]">*</Label>
                        </Label>
                        <Input
                          className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={companyStateProvince}
                          onChange={(e) => setCompanyStateProvince(e.target.value)}
                          placeholder="e.g. Tokyo, California, etc."
                        />
                      </div>
                    )}

                    {companyCountry.toLowerCase() === "indonesia" ? (
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <Label className="col-span-1">City (ID)<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                        <div className="col-span-2">
                          <ComboboxDemo
                            id="CompanyCity"
                            value={companyCity}
                            setValue={setCompanyCity}
                            options={cityCompany}
                            placeholder="Select a City"
                            className={"dark:border-gray-400 dark:bg-transparent"}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <Label className="col-span-1">
                          City / Area<Label className="text-red-600 dark:text-[#FF8A80]">*</Label>
                        </Label>
                        <Input
                          className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                          value={companyCity}
                          onChange={(e) => setCompanyCity(e.target.value)}
                          placeholder="e.g. Jakarta, Berlin, New York..."
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label className="col-span-1">Zip Code<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                      <Input className={"dark:text-white dark:border-b-gray-400 col-span-2 dark:rounded-none dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"} value={companyZipPostalCode} onChange={(e) => setCompanyZipPostalCode(e.target.value)} />
                    </div>
                  </div>
                </div>
                )}
            </div>
          </CardContent>
        </Card>
      
        {/* 3) Product */}
        <Card className="rounded-2xl p-[20px]  shadow-2xl   break-inside-avoid dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%  dark:border-purple-700" id='product'>
          <CardHeader>
            <CardTitle>3) Product</CardTitle>
            <CardDescription>
              Auto dari Asset; atau cari Product Number/Name jika tidak ada Asset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Serial No.<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                <Input value={serialQuery} onChange={(e) => {
                  setSelectedAsset(null)
                  setSerialQuery(e.target.value)
                }
                } className={"dark:text-white ring-1 ring-gray-400 rounded-sm dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                <Button variant="outline" asChild className={'w-full dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'}>
                  <a
                    href="https://support.hp.com/id-en/check-warranty"
                    target="_blank"
                    rel="noopener noreferrer"
                    
                  >
                    Check Warranty
                  </a>
                </Button>

              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Check Product (Number/Name)</Label>
                <Input
                  placeholder="Type product number or name..."
                  value={productQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setProductQuery(v);
                    searchProduct(v);
                  }}
                  className={"dark:text-white ring-1 ring-gray-400 rounded-sm dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}
                />
                {ProductNotFound ?  
                   <div className="mt-2 text-sm text-muted-foreground dark:text-white">
                    ❌ Product Number Tidak Ditemukan
                </div>
                : ""}
                <div className="mt-2 flex items-center gap-2">
                  <Checkbox
                    id="isNewProduct"
                    checked={isNewProduct}
                    onCheckedChange={(v) => setIsNewProduct(Boolean(v))}
                    className={"ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}
                  />
                  <Label htmlFor="isNewProduct" className={'font-[700]'}>Buat Product Baru</Label>
                </div>
                {productResults.length > 0 && (
                  <div className="mt-2 rounded-xl border p-2 max-h-40 overflow-auto">
                    {productResults.map((p) => (
                      <button
                        key={p.ProductNumber}
                        type="button"
                        className={classNames(
                          "w-full text-left px-2 py-1.5 rounded hover:bg-muted",
                          selectedProduct?.ProductNumber === p.ProductNumber && "bg-muted"
                        )}
                        onClick={() => {
                          setSelectedProduct(p);
                          setProductNo(p.ProductNumber);
                          setProductName(p.ProductName);
                          setProductLine(p.ProductLine || "");
                          setVendor(p.vendor || "");
                          setProductTypeId(p.ProductTypeID);
                        }}
                      >
                        <div className="font-medium">{p.ProductName}</div>
                        <div className="text-xs text-muted-foreground">PN {p.ProductNumber} · {p.ProductLine || "-"}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Product Tower<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Select value={productTower} onValueChange={setProductTower}>
                    <SelectTrigger className={"ring-1 ring-gray-400 rounded-sm w-full dark:ring-gray-400 dark:focus:ring-[#1776bb]"}>
                      <SelectValue placeholder="IPG / PSG" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IPG">IPG</SelectItem>
                      <SelectItem value="PSG">PSG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Product Group<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Select value={productGroup} onValueChange={setProductGroup}>
                    <SelectTrigger className={"ring-1 ring-gray-400  rounded-sm w-full dark:ring-gray-400 dark:focus:ring-[#1776bb]"}>
                      <SelectValue placeholder="Commercial / Consumer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Consumer">Consumer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {productTower && productGroup && (
                  <div className="flex flex-col gap-2">
                    <Label>Product Type <Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                    <Select
                      value={productTypeId || null}
                      onValueChange={setProductTypeId}
                    >
                      <SelectTrigger className="w-full ring-1 ring-gray-400 rounded-sm dark:ring-gray-400 dark:focus:ring-[#1776bb]">
                        <SelectValue placeholder="Select Product Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypeList.map((type) => (
                          <SelectItem key={type.ProductTypeID} value={type.ProductTypeID.toString()}>
                            {type.ProductType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Product Line<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input value={productLine} onChange={(e) => setProductLine(e.target.value)} className={"dark:text-white ring-1 ring-gray-400 mt-2 rounded-sm dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                </div>
                <div>
                  <Label>Product No<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input value={productNo} onChange={(e) => setProductNo(e.target.value)} className={"dark:text-white ring-1 ring-gray-400 mt-2 rounded-sm dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                </div>
                <div>
                  <Label>Product Name<Label className="text-red-600 dark:text-[#FF8A80]">*</Label></Label>
                  <Input value={productName} onChange={(e) => setProductName(e.target.value)} className={"dark:text-white ring-1 ring-gray-400 mt-2 rounded-sm dark:hover:border-transparent dark:focus:border-transparent dark:focus:rounded-lg dark:p-2"}/>
                </div>
              </div>
            </CardContent>
        </Card>

          {/* 4) Warranty */}
          <Card className="rounded-2xl space-y-0.5 p-[17px]  shadow-2xl break-inside-avoid col-span-3 dark:bg-gradient-to-l dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%  dark:border-purple-700  scroll-mt-[120px] " id='warranty'>
            <CardHeader>
              <CardTitle>4) Warranty</CardTitle>
              <CardDescription>
                Mengikuti Asset Information; jika tidak ada, isi manual.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Warranty Status</Label>
                <SearchCommandBlock
                  options={warrantyOptions}
                  value={warrantySearchValue}
                  onChange={(val) => setWarrantySearchValue(val)}
                  onSearchInputChange={(val) => {
                    setWarrantySearchValue(val);   // update field search
                    fetchWarrantyStatus(val); // trigger fetch API
                  }}
                  className={"dark:bg-transparent ring-1 ring-gray-400 "}
                  placeholder="Warranty Option..."
                />
              </div>
              <div>
                <Label>EOW Date</Label>
                <Input type="date" variant={"default"} value={eowDate} onChange={(e) => setEowDate(e.target.value)} className={"mt-2 ring-1 ring-gray-400 dark:text-white"} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Is Void Warranty?</Label>
                <Checkbox 
                  id="isVoidWarranty"
                  checked={isVoidWarranty}
                  onCheckedChange={(v) => setIsVoidWarranty(Boolean(v))}
                  className={"ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}
                />
              </div>
              {
              warrantySearchValue === "01T" &&
              (
            <div >
                <Label className={"whitespace-nowrap"}>Need Warranty Approval</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="needWarrantyApproval"
                    checked={needWarrantyApproval}
                    onCheckedChange={(v) => setNeedWarrantyApproval(Boolean(v))}
                    className={"ring-2 bg-gray-100 dark:bg-transparent dark:data-[state=checked]:bg-white"}
                  />
                  <Label htmlFor="needWarrantyApproval" className={'font-[700]'}>Yes</Label>
                </div>
            </div>
              )
              }
            </CardContent>
          </Card>

          {/* 5) Accessory */}
          <Card className="rounded-2xl p-[20px]  shadow-2xl break-inside-avoid col-span-3   scroll-mt-[120px] dark:bg-gradient-to-l dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%  dark:border-purple-700" id='accessories'>
            <CardHeader>
              <CardTitle>5) Accessory</CardTitle>
              <CardDescription>Opsional. Tambahkan baris sesuai kebutuhan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {accessories.map((row, idx) => (
                  <React.Fragment key={row.id || idx}>
                <div  className="grid grid-cols-10 gap-2 items-center ring-1 p-3 rounded-2xl">
                  <div className="col-span-5 lg:col-span-4">
                    <Label className="text-xs flex-1">Accessory Name</Label>
                    <SearchCommandBlock
                      value={row.name}
                      onChange={(v) => updateAccessory(row.id, "name", v)}
                      placeholder="Type to search accessory..."
                      options={[
                        "Adaptor",
                        "Battery",
                        "Carrying Case",
                        "Floppy Disk Drive",
                        "Harddisk",
                        "Ink Catridge",
                        "Jet Direct Card",
                        "Keyboard",
                        "Memory",
                        "Mouse",
                        "Optical Disc Drive",
                        "Others",
                        "Paper Tray",
                        "PCMCIA Card",
                        "Power Cable",
                        "Power Supply Unit",
                        "Stylus Pen",
                        "Toner Catridge"
                      ]}
                      className={"dark:bg-transparent ring-gray-400 ring-1 mt-2"}
                    />
                  </div>
                  <div className="col-span-5 lg:col-span-6">
                    <Label className="text-xs">Note</Label>
                    <Input
                      className={"ring-gray-400 ring-1 mt-2 dark:text-white dark:p-2"}
                      value={row.note}
                      onChange={(e) => updateAccessory(row.id, "note", e.target.value)}
                    />
                  </div>
                  <div className="col-span-10 md:col-span-10">
                    <Label className="text-xs">CT/SN</Label>
                    <Input value={row.code} onChange={(e) => updateAccessory(row.id, "code", e.target.value)} className={"ring-gray-400 ring-1 mt-2 dark:text-white dark:p-2"}/>
                  </div>
                  <div className="flex col-span-10 justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAccessory(row.id)} disabled={accessories.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                  <Separator className="w-full border-2"/>
                </React.Fragment>
                
              ))}
              <Button type="button" variant="outline" className={'cursor-pointer dark:bg-gradient-to-bl dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%'} onClick={addAccessory}>
                <Plus className="w-4 h-4 mr-2" /> Add Row
              </Button>
            </CardContent>
          </Card>

          {/* 6) Photos */}
          <Card className="rounded-2xl p-[20px]  shadow-2xl break-inside-avoid col-span-3   scroll-mt-[120px] dark:bg-gradient-to-l dark:from-slate-800 dark:via-slate-600 dark:to-slate-700 dark:border-b-slate-600 dark:to-60% dark:via-100% dark:from-50%  dark:border-purple-700" id='photos'>
            <CardHeader>
              <CardTitle>6) Foto</CardTitle>
              <CardDescription>Opsional. Disimpan lokal via endpoint upload.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input type="file" multiple accept="image/*" onChange={(e) => onPickPhotos(e.target.files)} className={"dark:border-b-slate-400 dark:rounded-none dark:text-gray-400"}/>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> {photos.length} selected
                </Badge>
              </div>
              {/* preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {photos.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={photoUrls}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <p className="text-xs truncate mt-1">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      {/* RIGHT SUMMARY PANEL */}

      {/* Footer */}
      <div className="sticky bottom-0 bg-background/90 py-3 dark:bg-slate-700  dark:backdrop-blur dark:supports-[backdrop-filter]:bg-background/20">
        <div className="max-w-7xl mx-auto flex justify-end gap-3 px-4 dark:text-white">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={onCreateCase} disabled={loading || (!selectedAsset && !isNewAsset) || (!selectedContact && !isNewContact)}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              "Create Case"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}







