import React, { useState } from "react";

export const Product_type = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data per halaman
  const [producttype, setProduct_type] = useState([
    {
      ProductTypeID: "230293754",
      ProductType: "Vritex",
      ProductTower: "PSG",
      ProductGroup: "Consumer",
    },
    {
      ProductTypeID: "27809765",
      ProductType: "Brodther",
      ProductTower: "PSG",
      ProductGroup: "Consumer",
    },
  ]);

  // Filter data berdasarkan pencarian
  const filteredProductType = producttype.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Hitung total halaman
  const totalPages = Math.ceil(filteredProductType.length / itemsPerPage);

  // Ambil data sesuai halaman saat ini
  const currentData = filteredProductType.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Product Type</h2>
      <input
        type="text"
        placeholder="Search..."
        className="mb-4 p-2 border rounded w-1/3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      /> 
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 bg-blue-500 text-white rounded"
        >
          + Add Product Type
        </button>      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 shadow-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
              <th className="border p-2 w-50">Product Type ID</th>
              <th className="border p-2 w-100">Product Type</th>
              <th className="border p-2 w-50" >Product Tower</th>
              <th className="border p-2">Product Group</th>
              <th className="border p-2">Actions </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((productTypes, index) => (
              <tr key={index} className="hover:bg-gray-100 text-center">
                <td className="border p-2">{productTypes.ProductTypeID}</td>
                <td className="border p-2">{productTypes.ProductType}</td>
                <td className="border p-2">{productTypes.ProductTower}</td>
                <td className="border p-2">{productTypes.ProductGroup}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProductType.length === 0 && (
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
    </div>
  );
};