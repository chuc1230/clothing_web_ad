import React from 'react'
import './Navbar.css'
import navlogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'

const Navbar = () => {
  return (
    <div className='navbar'>
        <h1>Admin</h1>
        <a href="http://localhost:3000/" className="nav-back-button">
          Quay lại trang bán hàng
        </a>
    </div>
  )
}

export default Navbar