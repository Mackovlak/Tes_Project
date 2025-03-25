import React, { useState, useEffect } from "react";
import ApiCustomer from "@/api"; 
import { ContactEdit, ContactDelete } from "@/components/sc-modal"

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
