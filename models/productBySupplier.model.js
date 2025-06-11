import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            match: /^SKU\d{3}$/,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        inventory: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        supplierPhoneNumber: {
            type: String,
            required: true,
            trim: true,
            match: /^[\d+\-\s()]{7,20}$/,
        },
        supplier_id: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },   
    },
    {
        timestamps: true,
    }
);

const ProductBySupplier = mongoose.model("ProductBySupplier", productSchema);

export default ProductBySupplier;