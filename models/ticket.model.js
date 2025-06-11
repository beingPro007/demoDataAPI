import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema({
    supplier_id: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    sku: { type: String, required: true },
    issue: { type: String, required: true },
    status: {
        type: String,
        enum: ["open", "resolved", "closed"],
        default: "open",
    },
    createdAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
