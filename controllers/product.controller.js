import { Product } from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import { asynchandler } from "../utils/asynchandler.js";

// GET /product/fetchAllProducts
const fetchAllProducts = asynchandler(async (req, res) => {
    // Fetch all products and populate supplier info
    const products = await Product.find({}, "sku name price inventory brand owned_by")
        .populate("owned_by", "supplier_id name");

    res.status(200).json({
        products: products.map(product => ({
            sku: product.sku,
            name: product.name,
            price: product.price,
            inventory: product.inventory,
            brand: product.brand,
            supplier_id: product.owned_by ? product.owned_by.supplier_id : null,
            supplier_name: product.owned_by ? product.owned_by.name : null
        }))
    });
});

// GET /product/:sku
const fetchProduct = asynchandler(async (req, res) => {
    const { sku } = req.params;

    // Find the product by SKU and populate supplier info
    const product = await Product.findOne({ sku: sku.toUpperCase() })
        .populate("owned_by", "supplier_id name");

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
    const { sku, name, price, inventory, brand, owned_by } = req.body;

    if (!sku || !name || price === undefined || inventory === undefined || !brand || !owned_by) {
        return res.status(400).json({ message: "All product fields and owned_by (supplier) are required" });
    }

    // Check if supplier exists
    const supplier = await Supplier.findById(owned_by);
    if (!supplier) {
        return res.status(400).json({ message: "Supplier not found" });
    }

    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
        return res.status(409).json({ message: `Product with SKU '${sku}' already exists` });
    }

    const product = await Product.create({
        sku: sku.toUpperCase(),
        name,
        price,
        inventory,
        brand,
        owned_by: supplier._id
    });

    res.status(201).json({
        sku: product.sku,
        name: product.name,
        price: product.price,
        inventory: product.inventory,
        brand: product.brand,
        supplier_id: supplier.supplier_id,
        supplier_name: supplier.name
    });
});

export { fetchProduct, addProduct, fetchAllProducts };
