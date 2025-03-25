import React, { useEffect, useState } from "react";
import ApiCustomer from "@/api";
import { BtnModalAsset, AssetEdit, AssetDelete } from "@/components/sc-modal"

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
