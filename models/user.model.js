import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["Customer", "Brand", "Admin"],
        default: "Customer",
    },
    // Customer-specific
    orders: [{
        type: Schema.Types.ObjectId,
        ref: "Order",
    }],

    // Brand-specific
    brandId: {
        type: String,
        required: function () {
            return this.role === "Brand";
        },
    },

    ownerName: {
        type: String,
        required: function(){
            return this.role === "Brand"
        }
    },

    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
    }],
    suppliers: [{
        type: Schema.Types.ObjectId,
        ref: "Supplier",
    }],
});

const User = mongoose.model("User", userSchema);
export default User;
