import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const AddProduct = () => {

    const [image, setImage] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name:"",
        image:"",
        category:"women",
        new_price:"",
        old_price:""       
    })


    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    }
    const changeHandler = (e) => {
        setProductDetails({...productDetails, [e.target.name]:e.target.value});
    }
    const Add_Product = async () => {
        console.log(productDetails);
    
        // Sử dụng FormData để gửi cả file và dữ liệu text
        let formData = new FormData();
        formData.append("product", image);
        formData.append("name", productDetails.name);
        formData.append("category", productDetails.category);
        formData.append("new_price", productDetails.new_price);
        formData.append("old_price", productDetails.old_price);
    
        try {
            const response = await fetch("http://localhost:4000/addproduct", {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            if (data.success) {
                alert("Thêm sản phẩm thành công!");
                setProductDetails({
                    name:"",
                    image:"",
                    category:"women",
                    new_price:"",
                    old_price:""
                });
                setImage(false);
            } else {
                alert("Thêm sản phẩm thất bại!");
            }
        } catch (error) {
            console.error("Add product error:", error);
            alert("Đã xảy ra lỗi khi thêm sản phẩm!");
        }
    };
    

  return (
    <div className='add-product'>
        <div className='addproduct-itemfield'>
            <p>Tên sản phẩm</p>
            <input value={productDetails.name} onChange={changeHandler} type='text' name='name' placeholder='Nhập tên sản phẩm' />
        </div>

        <div className='addproduct-price'>
            <div className='addproduct-itemfield'>
                <p>Giá gốc</p>
                <input value={productDetails.old_price} onChange={changeHandler} type='text' name='old_price' placeholder='Nhập giá gốc' />
            </div>
            <div className='addproduct-itemfield'>
                <p>Giá khuyến mãi</p>
                <input value={productDetails.new_price} onChange={changeHandler} type='text' name='new_price' placeholder='Nhập giá khuyến mãi' />
            </div>
        </div>

        <div className="addproduct-itemfield">
            <p>Danh mục sản phẩm</p>
            <select value={productDetails.category} onChange={changeHandler} name='category' className='add-product-selector'>
                <option value='women'>Nữ (Women)</option>
                <option value='men'>Nam (Men)</option>
                <option value='kid'>Trẻ em (Kid)</option>
            </select>
        </div>

        <div className="addproduct-itemfield">
            <label htmlFor='file-input'>
                <img src={image? URL.createObjectURL(image): upload_area} className='addproduct-thumnail-img' alt="" />
            </label>
            <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
        </div>
        <button onClick={() => {Add_Product()}} className='addproduct-btn'>THÊM SẢN PHẨM</button>
    </div>
  )
}

export default AddProduct