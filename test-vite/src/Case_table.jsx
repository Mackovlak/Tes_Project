import React, { useState } from "react";

export const Case_table = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data per halaman
  const [casetable, setCaseTable] = useState([
    {
      CaseID: "51337",
      CreatedOn: "2025-03-20",
      CaseSubject: "ID/NBD/...",
      CustomerAccount: "Bank Indonesia",
      Primary: "Achnesia",
      HW: "PIL001",
      SerialNumber: "4CE310C...",
      ProductNumber: "4NF92AV",
      ProductName: "HP Z2 SE...",
      CreatedName: "Muhammad Arif",
      Owner: "Risa Martiana",
      WorkGroup: "IDY_SB Ja...",
    },
    {
      CaseID: "67890",
      CreatedOn: "2025-03-19",
      CaseSubject: "ID/NBD/...",
      CustomerAccount: "PT.JAVA ABADI",
      Primary: "Irma khainur",
      HW: "P5U00",
      SerialNumber: "1CZ9200",
      ProductNumber: "4HF92AV",
      ProductName: "HP ProDesk...",
      CreatedName: "Kamisyah...",
      Owner: "Kamisyah Ind...",
      WorkGroup: "IDY_SB Ja...",
    },
  ]);

  // Filter data berdasarkan pencarian
  const filteredCaseTable = casetable.filter((item) =>
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
                <td className="border p-2">{caseItem.CaseID}</td>
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