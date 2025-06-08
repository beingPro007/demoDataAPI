import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            match: /^SKU\d{3}$/, // e.g., SKU123
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
        brandPhoneNumber: {
            type: String,
            required: true,
            trim: true,
            match: /^[\d+\-\s()]{7,20}$/, // Basic phone validation
        },
        brandOwner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        owned_by_supplier: {
            type: Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
