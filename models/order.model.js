import mongoose, { Schema } from "mongoose";

const generateOrderId = () => {
    return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};
const orderSchema = new Schema({
    sku: { type: String, required: true, unique: true, uppercase: true },
    prodName: { type: String, required: true },
    orderID: {
        type: String,
        required: true,
        unique: true, 
        default: generateOrderId, 
    },
    quantity: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    status: {
        type: String,
        enum: ["created", "shipped", "cancelled", "refunded", "delivered"],
        default: "created",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expectedDeliveryDate: {
        type: Date,
        default: () => {
            const daysToAdd = Math.floor(Math.random() * 2) + 6;
            const date = new Date();
            date.setDate(date.getDate() + daysToAdd);
            return date;
        },
    },
});

export const Order = mongoose.model("Order", orderSchema);
