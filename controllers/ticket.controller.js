import { Order } from "../models/order.model.js";
import Product from "../models/product.model.js";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";

const raiseTicket = asynchandler(async (req, res) => {
    const { orderId, issue } = req.body;
    let { phoneNumber } = req.query;

    console.log("raiseTicket body and params are:", req.body, req.query);

    // 1) Validate input
    if (!orderId || !issue) {
        return res.status(400).json({ message: "Order ID and issue are required" });
    }

    phoneNumber = phoneNumber.trim();
    if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
        return res.status(401).json({ message: "Not authorized: user not found" });
    }

    const userId = user._id;

    // 2) Validate the order exists and belongs to the user
    const order = await Order.findOne({ orderID: orderId, userId });
    if (!order) {
        return res.status(404).json({ message: "Order not found for this user" });
    }   

    // 3) Create the ticket
    const ticket = await Ticket.create({
        sku: order.sku,
        userId,
        orderId,
        issue: issue.trim(),
        status: "open",
    });

    // 4) Respond with the new ticket
    res.status(201).json({
        ticketId: ticket._id,
        productName: order.prodName,
        userId: ticket.userId,
        orderId: ticket.orderId,
        issue: ticket.issue,
        status: ticket.status,
        createdAt: ticket.createdAt,
    });
});

export { raiseTicket };
