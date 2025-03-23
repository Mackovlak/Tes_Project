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
import { Company_table } from './Company_table';
import { Assets_table } from './Assets_table';
import { Contact_table } from './Contact_table';
import { Bookings } from './bookings';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<Landing />} /> 
          <Route path='/search_case' element={<Search_case />} /> 
          <Route path='/case' element={<Case />} /> 
          <Route path='/work' element={<Work />}/>
          <Route path='/material_order' element={<MaterialOrder />}/>
          <Route path='/mo_detail' element={<MoDetail />}/>
          <Route path='/bookings' element={<Bookings/>}/>
          <Route path='/master/Company_table' element={<Company_table />} /> 
          <Route path='/master/Assets_table' element={<Assets_table />} />
          <Route path='/master/Contact_table' element={<Contact_table />} />  
        </Route>
        <Route path="/lorem" element={<Lorem />}/>
      </Routes>
  </BrowserRouter>
  </StrictMode>,
)
