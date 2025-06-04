import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        sku: {
            type: String,
            required: true,
            unique: true,
            index: true,
            uppercase: true,
            match: /^SKU\d{3}$/
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        inventory: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        brand: {
            type: String,
            required: true,
            trim: true
        },
        owned_by: {
            type: Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", productSchema);
