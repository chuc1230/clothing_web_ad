import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import ListUser from '../../Components/ListUsers/ListUser'
import ListOrder from '../../Components/ListOrder/ListOrder'
import Stats from '../../Components/Stats/Stats'

const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar/>
      <Routes>
        <Route path='/addproduct' element={<AddProduct/>}/>
        <Route path='/listproduct' element={<ListProduct/>}/>
        <Route path='/listusers' element={<ListUser/>}/>
        <Route path='/listorder' element={<ListOrder/>}/>
        <Route path='/stats' element={<Stats/>}/>
        <Route path='/' element={<Navigate to="/stats" replace/>}/>
      </Routes>
    </div>
  )
}

export default Admin