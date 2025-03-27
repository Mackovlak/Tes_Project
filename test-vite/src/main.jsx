import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App';
import Landing from './landing';
import Lorem from './Lorem';
import Search_case from './search_case';
import { Case } from './Case';
import { Work } from './work';
import { MaterialOrder } from './material_order';
import { MoDetail } from './mo_detail';
import { Company_table } from './master_table';
import { Assets_table } from './master_table';
import { Contact_table } from './master_table';
import { Case_table } from './master_table';
import { Product_table } from './master_table';
import { Bookings } from './bookings';
import { Product_type } from './Product_type';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<Landing />} /> 
          <Route path='/search_case' element={<Search_case />} /> 
          <Route path='/case/:caseId' element={<Case />} /> 
          <Route path='/work' element={<Work />}/>
          <Route path='/material_order' element={<MaterialOrder />}/>
          <Route path='/mo_detail' element={<MoDetail />}/>
          <Route path='/bookings' element={<Bookings/>}/>
          <Route path='/master/Company_table' element={<Company_table />} /> 
          <Route path='/master/Assets_table' element={<Assets_table />} />
          <Route path='/master/Contact_table' element={<Contact_table />} />
          <Route path='/master/Case_table' element={<Case_table />} />
          <Route path='/master/Product_table' element={<Product_table/>}/>
          <Route path='/master/Product_type' element={<Product_type/>}/>
        </Route>
        <Route path="/lorem" element={<Lorem />}/>
      </Routes>
  </BrowserRouter>
  </StrictMode>,
)
