import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Sample Data
const data = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com" },
];

export default function SearchWithModal() {
  const [activeTab, setActiveTab] = useState(1); // 1: Form, 2: Search Results
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (search.trim() !== "") {
      setActiveTab(2); // Switch to Tab 2
      setIsModalOpen(true); // Open modal
    }
  };

  // Filtered Data
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button 
          className={`px-4 py-2 ${activeTab === 1 ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab(1)}
        >
          Tab 1: Search
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 2 ? "border-b-2 border-blue-500 font-bold" : "text-gray-500"}`}
          onClick={() => setActiveTab(2)}
        >
          Tab 2: Results
        </button>
      </div>

      {/* Tab 1: Form */}
      {activeTab === 1 && (
        <div className="mt-4">
          <Input 
            placeholder="Enter name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button className="mt-2 w-full" onClick={handleSearch}>Search</Button>
        </div>
      )}

      {/* Tab 2: Results */}
      {activeTab === 2 && (
        <div className="mt-4">
          <p className="text-gray-600">Click the button below to view results.</p>
          <Button className="mt-2" onClick={() => setIsModalOpen(true)}>View Search Results</Button>
        </div>
      )}

      {/* Search Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No results found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Button className="mt-2 w-full" onClick={() => setIsModalOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
