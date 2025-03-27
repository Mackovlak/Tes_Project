import React, { useState, useEffect } from "react";
import ApiCustomer from "@/api"; 
import { ContactEdit, ContactDelete } from "@/components/sc-modal"
import { CompanyEdit, CompanyDelete } from "@/components/sc-modal"
import { ProductAdd, ProductEdit, ProductDelete } from "@/components/sc-modal";
import { BtnModalAsset, AssetEdit, AssetDelete } from "@/components/sc-modal"
import { useNavigate } from "react-router";

export const Contact_table = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Fungsi untuk mengambil data dari API
    const fetchContacts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiCustomer.get(`/api/contact-information?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
        setContacts(response.data.data); 
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error("Error fetching contact data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchContacts();
    }, [currentPage, searchTerm]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Contact Table</h2>

      {/* Input Pencarian */}
      <input
        type="text"
        placeholder="Search contacts..."
        className="mb-4 p-2 border border-gray-300 rounded w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset ke halaman pertama saat mencari
        }}
      />

      {/* Tampilkan loading jika sedang mengambil data */}
      {loading && <p>Loading data...</p>}

      {/* Tampilkan error jika terjadi kesalahan */}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-scroll ">
        <table className="border border-gray-300 shadow-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
              <th className="border p-2">No</th>
              <th className="border p-2">Contact ID</th>
              <th className="border p-2">Company</th>
              <th className="border p-2">Salutation</th>
              <th className="border p-2">First Name</th>
              <th className="border p-2">Last Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Preferred Language</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">Work Phone</th>
              <th className="border p-2">Work Extension</th>
              <th className="border p-2">Other Phone</th>
              <th className="border p-2">Other Extension</th>
              <th className="border p-2">Fax</th>
              <th className="border p-2">Address Line 1</th>
              <th className="border p-2">Address Line 2</th>
              <th className="border p-2">City</th>
              <th className="border p-2">State/Province</th>
              <th className="border p-2">Country</th>
              <th className="border p-2">Zip/Postal Code</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact, index) => (
              <tr key={contact.ContactID} className="hover:bg-gray-100 text-center">
                <td className="border p-2 text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="border p-2">{contact.ContactID}</td>
                <td className="border p-2">{contact.Company}</td>
                <td className="border p-2">{contact.Salutation}</td>
                <td className="border p-2">{contact.FirstName}</td>
                <td className="border p-2">{contact.LastName}</td>
                <td className="border p-2">{contact.Email}</td>
                <td className="border p-2">{contact.PreferredLanguage}</td>
                <td className="border p-2">{contact.Phone}</td>
                <td className="border p-2">{contact.Mobile}</td>
                <td className="border p-2">{contact.WorkPhone}</td>
                <td className="border p-2">{contact.WorkExtension}</td>
                <td className="border p-2">{contact.OtherPhone}</td>
                <td className="border p-2">{contact.OtherExtension}</td>
                <td className="border p-2">{contact.Fax}</td>
                <td className="border p-2">{contact.AddressLine1}</td>
                <td className="border p-2">{contact.AddressLine2}</td>
                <td className="border p-2">{contact.City}</td>
                <td className="border p-2">{contact.StateProvince}</td>
                <td className="border p-2">{contact.Country}</td>
                <td className="border p-2">{contact.ZipPostalCode}</td>
                <td className="border p-2 flex space-x-2">
                  <ContactEdit contactID={contact.ContactID} onUpdate={fetchContacts}/>
                  <ContactDelete contactID={contact.ContactID}/>
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export const Company_table = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  //set modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fungsi untuk mengambil data dari API
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get(`/api/site_account?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      setCompanies(response.data.data); 
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Company Table</h2>

      {/* Input Pencarian */}
      <input
        type="text"
        placeholder="Search companies..."
        className="mb-4 p-2 border border-gray-300 rounded w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset ke halaman pertama saat mencari
        }}
      />

      {/* Tampilkan loading jika sedang mengambil data */}
      {loading && <p>Loading data...</p>}

      {/* Tampilkan error jika terjadi kesalahan */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">No</th>
              <th className="border p-2">Company</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Primary Phone</th>
              <th className="border p-2">City</th>
              <th className="border p-2">Country</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length > 0 ? (
              companies.map((company, index) => (
                <tr key={company.SiteAccountID} className="hover:bg-gray-100">
                  <td className="border p-2 text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="border p-2">{company.Company}</td>
                  <td className="border p-2">{company.Email}</td>
                  <td className="border p-2">{company.PrimaryPhone}</td>
                  <td className="border p-2">{company.City}</td>
                  <td className="border p-2">{company.Country}</td>
                  <td className="border p-2 flex space-x-2">
                    <CompanyEdit siteAccountId={company.SiteAccountID} onUpdate={fetchCompanies}/>
                    <CompanyDelete 
                      siteAccountId={company.SiteAccountID}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      onUpdate={fetchCompanies}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export const Case_table = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data per halaman
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caseData, setCaseData] = useState([]);
  // const [casetable, setCaseTable] = useState([
  //   {
  //     CaseID: "51337",
  //     CreatedOn: "2025-03-20",
  //     CaseSubject: "ID/NBD/...",
  //     CustomerAccount: "Bank Indonesia",
  //     Primary: "Achnesia",
  //     HW: "PIL001",
  //     SerialNumber: "4CE310C...",
  //     ProductNumber: "4NF92AV",
  //     ProductName: "HP Z2 SE...",
  //     CreatedName: "Muhammad Arif",
  //     Owner: "Risa Martiana",
  //     WorkGroup: "IDY_SB Ja...",
  //   },
  //   {
  //     CaseID: "67890",
  //     CreatedOn: "2025-03-19",
  //     CaseSubject: "ID/NBD/...",
  //     CustomerAccount: "PT.JAVA ABADI",
  //     Primary: "Irma khainur",
  //     HW: "P5U00",
  //     SerialNumber: "1CZ9200",
  //     ProductNumber: "4HF92AV",
  //     ProductName: "HP ProDesk...",
  //     CreatedName: "Kamisyah...",
  //     Owner: "Kamisyah Ind...",
  //     WorkGroup: "IDY_SB Ja...",
  //   },
  // ]);

  const fetchCaseDataTable=async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get("/api/case-information");
      if (response.data.success) {
        setCaseData(response.data.data);
      } else {
        setError("Failed to fetch case data");
      }
    } catch (err) {
      console.error("Error fetching case data:", err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Load data when component mounts
  useEffect(() => {
    fetchCaseDataTable();
  }, []);

  // Filter data berdasarkan pencarian
  const filteredCaseTable = caseData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Hitung total halaman
  const totalPages = Math.ceil(filteredCaseTable.length / itemsPerPage);

  // Ambil data sesuai halaman saat ini
  const currentData = filteredCaseTable.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  //navigate
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ID Daily Aging Cases Javag FY</h2>
      <input
        type="text"
        placeholder="Search..."
        className="mb-4 p-2 border rounded w-1/3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      
      {/* 🔹 Loading & Error Messages */}
      {loading && <p>Loading cases...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 shadow-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
              <th className="border p-2">Case ID</th>
              <th className="border p-2">Created On</th>
              <th className="border p-2">Case Subject</th>
              <th className="border p-2">Customer Account</th>
              <th className="border p-2">Primary</th>
              <th className="border p-2">HW</th>
              <th className="border p-2">Serial Number</th>
              <th className="border p-2">Product Number</th>
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Created Name</th>
              <th className="border p-2">Owner</th>
              <th className="border p-2">WorkGroup</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((caseItem) => (
              <tr key={caseItem.CaseID} className="hover:bg-gray-100 text-center">
                <td className="border p-2 text-blue-500 cursor-pointer hover:underline" onClick={() => navigate(`/case/${caseItem.CaseID}`)} >{caseItem.CaseID}</td>
                <td className="border p-2">{caseItem.CreatedOn}</td>
                <td className="border p-2">{caseItem.CaseSubject}</td>
                <td className="border p-2">{caseItem.CustomerAccount}</td>
                <td className="border p-2">{caseItem.Primary}</td>
                <td className="border p-2">{caseItem.HW}</td>
                <td className="border p-2">{caseItem.SerialNumber}</td>
                <td className="border p-2">{caseItem.ProductNumber}</td>
                <td className="border p-2">{caseItem.ProductName}</td>
                <td className="border p-2">{caseItem.CreatedName}</td>
                <td className="border p-2">{caseItem.Owner}</td>
                <td className="border p-2">{caseItem.WorkGroup}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCaseTable.length === 0 && (
          <p className="text-center mt-4 text-gray-500">No cases found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          className="p-2 bg-gray-300 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="p-2 bg-gray-300 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const Assets_table = () => {  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
  }, [currentPage, searchTerm]);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiCustomer.get(`/api/asset-information?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      setAssets(response.data.data); 
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching asset data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Asset Information Table</h2>
      <div className="space-x-2">
      <BtnModalAsset />
        {/* Input Pencarian */}
      <input
        type="text"
        placeholder="Search asset... "
        className="mb-4 p-2 border border-gray-300 rounded w-1/3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset ke halaman pertama saat mencari
        }}
      />
      </div>      
      {/* Tampilkan loading jika sedang mengambil data */}
      {loading && <p>Loading data...</p>}

      {/* Tampilkan error jika terjadi kesalahan */}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">No</th>
              <th className="border p-2">Asset ID</th>
              <th className="border p-2">Serial Number</th>
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Product Number</th>
              <th className="border p-2">Product Line</th>
              <th className="border p-2">Site Account ID</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length > 0 ? (
              assets.map((asset, index) => (
                <tr key={asset.AssetID} className="hover:bg-gray-100">
                  <td className="border p-2 text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="border p-2">{asset.AssetID}</td>
                  <td className="border p-2">{asset.SerialNumber}</td>
                  <td className="border p-2">{asset.product_information?.ProductName}</td>
                  <td className="border p-2">{asset.ProductNumber}</td>
                  <td className="border p-2">{asset.product_information?.ProductLine}</td>
                  <td className="border p-2">{asset.SiteAccountID}</td>
                  <td className="border p-2 flex space-x-2">
                    <AssetEdit 
                    assetId={asset.AssetID} onUpdate={fetchAssets}/>
                    <AssetDelete assetId={asset.AssetID} />
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No data found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="p-2 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export const Product_table = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;
  
    //set modal
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    // Fungsi untuk mengambil data dari API
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiCustomer.get(`/api/product-information?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
        setProducts(response.data.data); 
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchProducts();
    }, [currentPage, searchTerm]);
  
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Product Table</h2>
  
        {/* Input Pencarian */}
        <input
          type="text"
          placeholder="Search product..."
          className="mb-4 p-2 border border-gray-300 rounded w-1/3"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset ke halaman pertama saat mencari
          }}
        />
  
        {/* Tampilkan loading jika sedang mengambil data */}
        {loading && <p>Loading data...</p>}
  
        {/* Tampilkan error jika terjadi kesalahan */}
        {error && <p className="text-red-500">{error}</p>}
        
        <ProductAdd></ProductAdd>
        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">No</th>
                <th className="border p-2">Product Number</th>
                <th className="border p-2">Product Line</th>
                <th className="border p-2">Product Name</th>
                <th className="border p-2">Product Type</th>
                <th className="border p-2">Product Group</th>
                <th className="border p-2">Product Tower</th>
                <th className="border p-2">Vendor</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>    
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product.ProductNumber} className="hover:bg-gray-100">
                    <td className="border p-2 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="border p-2">{product.ProductNumber}</td>
                    <td className="border p-2">{product.ProductLine}</td>
                    <td className="border p-2">{product.ProductName}</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2 flex space-x-2">
                      <ProductEdit ProductNumber={product.ProductNumber} onUpdate={fetchProducts}/>
                      <ProductDelete
                        ProductNumber={product.ProductNumber}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        onUpdate={fetchProducts}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              className="p-2 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="p-2 bg-gray-300 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
};

