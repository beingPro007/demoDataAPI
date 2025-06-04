import { Product } from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import sendEmail from "../utils/sendEmail.js";

const fetchAllSuppliersWithProducts = async (req, res) => {
    try {
        const suppliers = await Supplier.find({});
        const supplierList = await Promise.all(
            suppliers.map(async supplier => {
                const products = await Product.find({ owned_by: supplier._id });
                return {
                    id: supplier._id,
                    supplier_id: supplier.supplier_id,
                    name: supplier.name,
                    email: supplier.email,
                    products: products.map(p => ({
                        sku: p.sku,
                        name: p.name,
                        price: p.price,
                        inventory: p.inventory,
                        brand: p.brand
                    }))
                };
            })
        );
        return res.status(200).json({ suppliers: supplierList });
    } catch (error) {
        res.status(500).json({ message: "Error fetching suppliers", error: error.message });
    }
};

const addSupplier = async (req, res) => {
    const { supplier_id, name, email } = req.body;

    if (!supplier_id || !name || !email) {
        return res.status(400).json({ message: "Supplier ID, name, and email are required" });
    }

    try {
        const existingSupplier = await Supplier.findOne({ supplier_id });
        if (existingSupplier) {
            return res.status(409).json({ message: `Supplier with ID '${supplier_id}' already exists` });
        }

        const supplier = await Supplier.create({
            supplier_id,
            name,
            email
        });

        res.status(201).json({
            id: supplier._id,
            supplier_id: supplier.supplier_id,
            name: supplier.name,
            email: supplier.email
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating supplier", error: error.message });
    }
}

const fetchSupplierProducts = async (req, res) => {
    const { supplierId } = req.params;
    try {
        const supplier = await Supplier.findOne({ supplier_id: supplierId });
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        const products = await Product.find({ owned_by: supplier._id });
        return res.status(200).json({
            supplier: {
                id: supplier._id,
                supplier_id: supplier.supplier_id,
                name: supplier.name,
                email: supplier.email
            },
            products: products.map(p => ({
                sku: p.sku,
                name: p.name,
                price: p.price,
                inventory: p.inventory,
                brand: p.brand
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

const notifySupplierForProduct = async (req, res) => {
    const { sku, message } = req.body;
    try {
        const product = await Product.findOne({ sku: sku.toUpperCase() }).populate("owned_by");
        if (!product || !product.owned_by) {
            return res.status(404).json({ success: false, message: "Product or supplier not found" });
        }
        await sendEmail(product.owned_by.email, `Product Notification: ${sku}`, message);
        return res.status(200).json({ success: true, message: `Supplier notified for product ${sku}` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. General feedback to supplier
const sendSupplierFeedback = async (req, res) => {
    const { supplierId, feedback } = req.body;
    try {
        const supplier = await Supplier.findOne({ supplier_id: supplierId });
        if (!supplier) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }
        await sendEmail(supplier.email, "Feedback from Platform", feedback);
        return res.status(200).json({ success: true, message: "Feedback sent to supplier" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. General message to supplier
const sendSupplierMessage = async (req, res) => {
    const { supplierId, subject, message } = req.body;
    try {
        const supplier = await Supplier.findOne({ supplier_id: supplierId });
        if (!supplier) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }
        await sendEmail(supplier.email, subject || "Message from Platform", message);
        return res.status(200).json({ success: true, message: "Message sent to supplier" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { addSupplier, notifySupplierForProduct, fetchSupplierProducts, fetchAllSuppliersWithProducts, sendSupplierFeedback, sendSupplierMessage };