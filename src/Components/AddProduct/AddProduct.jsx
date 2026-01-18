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
                alert("Product added successfully");
            } else {
                alert("Failed to add product");
            }
        } catch (error) {
            console.error("Add product error:", error);
        }
    };
    

  return (
    <div className='add-product'>
        <div className='addproduct-itemfield'>
            <p>Product title</p>
            <input value={productDetails.name} onChange={changeHandler} type='text' name='name' placeholder='Type here' />
        </div>

        <div className='addproduct-price'>
            <div className='addproduct-itemfield'>
                <p>Price</p>
                <input value={productDetails.old_price} onChange={changeHandler} type='text' name='old_price' placeholder='Type here' />
            </div>
            <div className='addproduct-itemfield'>
                <p>Offer Price</p>
                <input value={productDetails.new_price} onChange={changeHandler} type='text' name='new_price' placeholder='Type here' />
            </div>
        </div>

        <div className="addproduct-itemfield">
            <p>Product Category</p>
            <select value={productDetails.category} onChange={changeHandler} name='category' className='add-product-selector'>
                <option value='women'>Women</option>
                <option value='men'>Men</option>
                <option value='kid'>Kid</option>
            </select>
        </div>

        <div className="addproduct-itemfield">
            <label htmlFor='file-input'>
                <img src={image? URL.createObjectURL(image): upload_area} className='addproduct-thumnail-img' alt="" />
            </label>
            <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
        </div>
        <button onClick={() => {Add_Product()}} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct