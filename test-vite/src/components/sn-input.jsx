import React, {useState, useEffect} from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
 } from '@/components/ui/select'

import ApiCustomer from '@/api'



export const SnInput = ({
  unownedAssets,
  setUnownedAssets,
  fetchUnownedAssets,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  //make form data for sending data to database
  const [formData, setFormData] = useState({
    SerialNumber: "",
    ProductNumber: "",
    ProductName: "",
    ProductLine: "",
    ProductTower: "",
    ProductGroup: "",
    ProductType: "",
    ProductTypeID: null,
    SiteAccountID: null,
    ContactID: null
  })

//handle input change
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    // ✅ Update the selected product type
    if (key === "ProductTypeID") {
      setSelectedProductType(value);
    }
  }
  
  //handle Check PN 
  const [checkPNTerm,setCheckPNTerm] = useState("");
  const [productResult, setProductResult] = useState([]);
  const handleCheckPN = async (e) => {
    const value = e.target.value;
    setCheckPNTerm(value);
    if(value.length > 2 ){
      try{
        const response = await ApiCustomer.get(`/api/product-information?search=${value}`)
        setProductResult(response.data.data)
      }catch(err){
        setProductResult([])
      }
    }else {
      setProductResult([]); // ✅ Clear dropdown when search is empty
    }
  }

  //getDataProducttype
  const [selectedProductTower, setSelectedProductTower] = useState("");
  const [selectedProductGroup, setSelectedProductGroup] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [productTypeList, setProductTypeList] = useState([]);

  // Fetch product types when both tower and group are selected
  useEffect(() => {
    if (selectedProductTower && selectedProductGroup) {
      fetchProductTypes(selectedProductTower, selectedProductGroup);
    }
  }, [selectedProductTower, selectedProductGroup]);
  const getDataProductType = async () => {
    const response = await ApiCustomer.get("/api/product-information/product-type")
    
  }

  // API Call to fetch product type 
  const fetchProductTypes = async (tower, group) => {
    try{
      const response = await ApiCustomer.get(`/api/product-information/product-type`, {
        params: { ProductTower: tower, ProductGroup: group },
      })
      setProductTypeList(response.data.data); // Update state
    }catch(err){
      console.error("Error fetching product types:", err);
      setProductTypeList([]); // Reset on error
    }
  }
  //submit data
  const handleSubmit = async () => {
    console.log("Form Data Submit SN Input : ",formData)
    try{

      // await ApiCustomer.post("/api/product-information/product-type", {
      //   ProductType: formData.ProductType,
      //   ProductTower: formData.ProductTower,
      //   ProductGroup: formData.ProductGroup,
      //   ProductTypeID: formData.ProductTypeID
      // })

      await ApiCustomer.post("/api/product-information", {
        ProductNumber: formData.ProductNumber,
        ProductName: formData.ProductName,
        ProductLine: formData.ProductLine,
        ProductTypeID: formData.ProductTypeID,
      });
      
      //set upsert, so wh
      await ApiCustomer.post("/api/asset-information", {
        SerialNumber: formData.SerialNumber,
        ProductNumber: formData.ProductNumber, // Reference from product_information
        SiteAccountID: formData.SiteAccountID || null,
        ContactID: formData.ContactID || null
      });


      alert("Asset successfully added!");
      setIsOpenModal(false);
      fetchUnownedAssets();
    }catch(err){
      console.error("Error adding asset:", err);
      alert("Failed to add asset. Please try again.");
    }
  }

  //handle create type :
  const [productDetails, setProductDetails] = useState({
    ProductNumber: "",
    ProductName: "",
    ProductLine: "",
    ProductType: "",
    ProductTower: "",
    ProductGroup: ""
  });
  

  
  return (
    <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
    <DialogTrigger asChild>
      <Button variant="link" className="ml-30">Serial Number</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[700px] ">
      <DialogHeader className="flex flex-row justify-between">
        <DialogTitle className='mt-1 font-bold'>Serial Number</DialogTitle>
        <Button variant="link">Clear All</Button>
      </DialogHeader>
      <div className="grid gap-4 py-4 grid-flow-col grid-rows-4 ">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="SerialNumber" className="text-right">
            Serial No
          </Label>
          <Input id="SerialNumber" onChange={(e) => handleChange("SerialNumber", e.target.value)} className="col-span-3"/>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="checkPN" className="text-right">
            Check P/N
          </Label>
          <Input 
            id="checkPN" 
            className="col-span-3" 
            type="search"
            value={checkPNTerm}
            onChange={handleCheckPN}
          />
          
        </div>
        {/* Dropdown List */}
        {productResult.length > 0 && (
              <ul className="  bg-white border border-gray-300  rounded-md absolute bottom-[5em]">
                  {productResult.map((product) => (
                      <li 
                          key={product.ProductNumber} 
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer "
                          onClick={async () => {
                              setCheckPNTerm(product.ProductTypeID); // ✅ Set input field
                              setProductResult([]); // ✅ Hide dropdown
                              console.log("Product Type Selected : ",product)
                              const productTower = product.product_type?.ProductTower || "";
                              const productGroup = product.product_type?.ProductGroup || "";
                              document.getElementById("ProductNumber").value = product.ProductNumber;
                              document.getElementById("ProductName").value = product.ProductName;
                              document.getElementById("ProductLine").value = product.ProductLine;

                              setSelectedProductTower(product.product_type?.ProductTower || "");
                              setSelectedProductGroup(product.product_type?.ProductGroup || "");
                              
                              await fetchProductTypes(product.product_type?.ProductTower, product.product_type?.ProductGroup);
                              
                              setSelectedProductType(product.ProductTypeID || "");
                              console.log(selectedProductType)
                              // document.getElementById("ProductType").value = product.product_type?.ProductType || "";

                              setFormData((prev) => ({
                                ...prev,
                                ProductNumber: product.ProductNumber,
                                ProductName: product.ProductName,
                                ProductLine: product.ProductLine,
                                ProductType: product.product_type?.ProductType || "",
                                ProductTower: product.product_type?.ProductTower || "",
                                ProductGroup: product.product_type?.ProductGroup || "",
                                ProductTypeID: product.ProductTypeID, // ✅ Ensure correct ProductTypeID is set
                              }));
                          }}
                      >
                          {product.ProductNumber} - {product.ProductName} ({product.product_type?.ProductType})
                      </li>
                  ))}
              </ul>
          )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ProductTower" className="text-right">
            Product tower
          </Label>
          {/* <Input id="ProductTower"  onChange={handleChange}  className="col-span-3" /> */}
          <Select onValueChange={setSelectedProductTower} id="ProductTower" value={selectedProductTower}>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Product tower"/>
            </SelectTrigger>
            <SelectContent >
              <SelectGroup>
                <SelectLabel>Product tower</SelectLabel>
                {/* <SelectItem value="">.</SelectItem> */}
                <SelectItem value="PSG">PSG</SelectItem>
                <SelectItem value="IPG">IPG</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ProductGroup" className="text-right">
            Product group
          </Label>
          {/* <Input id="ProductGroup"  onChange={handleChange}  className="col-span-3" /> */}
          <Select onValueChange={setSelectedProductGroup} id="ProductGroup" value={selectedProductGroup}>
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Product tower"/>
            </SelectTrigger>
            <SelectContent >
              <SelectGroup>
                <SelectLabel>Product group</SelectLabel>
                {/* <SelectItem value="">.</SelectItem> */}
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Consumer">Consumer</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ProductType" className="text-right">
            Product type
          </Label>
          {/* <Input id="ProductType"  onChange={handleChange}  className="col-span-3" /> */}
          <Select  disabled={!selectedProductTower || !selectedProductGroup} onValueChange={(value) => handleChange("ProductTypeID", value)} id="ProductType" value={selectedProductType}> 
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Product tower"/>
            </SelectTrigger>
            <SelectContent >
              <SelectGroup>
              {productTypeList.length > 0 ? (
                productTypeList.map((product) => (
                  <SelectItem key={product.ProductTypeID} value={product.ProductTypeID}>
                    {product.ProductType}
                    {/* {product.ProductTypeID} */}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled>No Product Types Available</SelectItem>
              )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ProductLine" className="text-right">
            Product line
          </Label>
          <Input id="ProductLine"  onChange={(e) => handleChange("ProductLine", e.target.value)}  className="col-span-3" />
        </div>
          <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ProductNumber" className="text-right">
            Product no.
          </Label>
          <Input id="ProductNumber"   onChange={(e) => handleChange("ProductNumber", e.target.value)}  className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ProductName" className="text-right">
            Product name
          </Label>
          <Input id="ProductName"  onChange={(e) => handleChange("ProductName", e.target.value)}  className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={handleSubmit}>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}
