import React, { useState, useEffect } from "react";
import ApiCustomer from "@/api"; 
import { CompanyEdit, CompanyDelete } from "@/components/sc-modal"

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
