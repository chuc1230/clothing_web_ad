import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'

const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

const Navbar = () => {
  return (
    <div className='navbar'>
        <h1>Admin</h1>
        <a href={`${FRONTEND_URL}/`} className="nav-back-button">
          Quay lại trang bán hàng
        </a>
    </div>
  )
}

export default Navbar