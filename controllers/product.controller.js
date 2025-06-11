
import Product from "../models/product.model.js";
import ProductBySupplier from "../models/productBySupplier.model.js";
import Supplier from "../models/supplier.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import { fetchAllSuppliersWithProducts } from "./supplier.controller.js";

// GET /product/fetchAllProducts
const fetchAllProducts = asynchandler(async (req, res) => {
    // Fetch all products and populate full supplier info
    const products = await Product.find()
        .populate("owned_by_supplier"); // Populate full supplier data

    // console.log("Product", products);
    

    const result = products.map(product => ({
        sku: product.sku,
        name: product.name,
        price: product.price,
        inventory: product.inventory,
        brandPhoneNumber: product.brandPhoneNumber,
        brandOwner: product.brandOwner, // optional: include if needed
        owned_by_supplier: product.owned_by_supplier ? {
            _id: product.owned_by_supplier._id,
            supplier_id: product.owned_by_supplier.supplier_id,
            name: product.owned_by_supplier.name,
            email: product.owned_by_supplier.email,
            // Add other supplier fields if needed
        } : null
    }));      
    // console.log("result", result);
    

    res.status(200).json({ products: result });
});
  
// GET /product/:sku
const fetchProduct = asynchandler(async (req, res) => {
    const { sku } = req.params;

    // Find the product by SKU and populate supplier info
    const product = await Product.findOne({ sku: sku.toUpperCase() })
        .populate("owned_by", "supplier_id name")
        .populate("brandOwner", "supplier_id name");

    if (!product) {
        return res.status(404).json({ message: `Product with SKU '${sku}' not found` });
    }

    res.status(200).json({
        sku: product.sku,
        name: product.name,
        price: product.price,
        inventory: product.inventory,
        brand: product.brand,
        supplier_id: product.owned_by ? product.owned_by.supplier_id : null,
        supplier_name: product.owned_by ? product.owned_by.name : null
    });
});

// POST /product/addProduct
const addProduct = asynchandler(async (req, res) => {
    const { sku, price, inventory, brandPhoneNumber, owned_by, name } = req.body;

    console.log("body data", req.body);
    
    if (!sku || price === undefined || inventory === undefined || !brandPhoneNumber || !owned_by) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const supplier = await Supplier.findOne({ _id: owned_by });
    if (!supplier) {
        return res.status(400).json({ message: "Supplier not found" });
    }

    const normalizedPhone = brandPhoneNumber.replace(/\D/g, ''); // Removes non-digits

    const brandOwner = await User.findOne({
        phoneNumber: { $regex: new RegExp(`^\\D*${normalizedPhone}\\D*$`, 'i') },
    });

    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
        return res.status(409).json({ message: `Product with SKU '${sku}' already exists` });
    }

    const product = await Product.create({
        sku: sku.toUpperCase(),
        name,
        price,
        inventory,
        brandPhoneNumber,
        brandOwner: brandOwner._id,
        owned_by_supplier: supplier._id,
    });

    res.status(201).json({
        sku: product.sku,
        price: product.price,
        inventory: product.inventory,
        brandPhoneNumber,
        supplier_id: supplier.supplier_id,
        supplier_name: supplier.name,
    });
});

const getProductInfo = asynchandler(async (req, res) => {
    const { phoneNumber, sku } = req.query;

    if (!phoneNumber || !sku) {
        return res.status(400).json({ message: "Phone number and SKU are required" });
    }

    console.log("Product info body", req.query);
    
    let normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");

    if (!normalizedPhone.startsWith("+")) {
        normalizedPhone = "+" + normalizedPhone;
    }
    const normalizedSku = sku.trim().toUpperCase();

    const user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user || user.role !== "Brand") {
        return res.status(403).json({ message: "Access denied: Invalid brand user" });
    }

    const product = await Product.findOne({ sku: normalizedSku });
    if (!product) {
        return res.status(404).json({ message: `Product with SKU ${normalizedSku} not found` });
    }

    if (!product.brandOwner.equals(user._id)) {
        return res.status(403).json({ message: "This product does not belong to your brand" });
    }

    return res.status(200).json({ product });
});

const addProductBySupplier = asynchandler(async (req, res) =>  {
    const { sku, name, price, inventory, supplier_id, phoneNumber } = req.body;

    const supplier = await Supplier.findOne({ supplier_id: supplier_id });
    if (!supplier) {
        return res.status(400).json({ message: "Supplier not found" });
    }

    const productToAdd  = await ProductBySupplier.create({
        sku: sku,
        price: price,
        inventory: inventory,
        supplierPhoneNumber: phoneNumber,
        name: name,
        supplier_id: supplier_id
    })

    if(!productToAdd){
        throw new ApiError(500, "Product Add Cant be created");
    }

    return res.status(200, "Product to add added to the supplier", productToAdd)
});

export { fetchProduct, addProduct, fetchAllProducts, getProductInfo, addProductBySupplier };
