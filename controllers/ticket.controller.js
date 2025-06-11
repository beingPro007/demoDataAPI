import { Order } from "../models/order.model.js";
import Ticket from "../models/ticket.model.js";
import Supplier from "../models/supplier.model.js"; // Import Supplier model
import User from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import Product from "../models/product.model.js";

const raiseTicket = asynchandler(async (req, res) => {
    const { orderId, issue } = req.body;
    let { phoneNumber } = req.query;

    console.log("raiseTicket body and params are:", req.body, req.query);

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

    const order = await Order.findOne({ orderID: orderId, userId });
    if (!order) {
        return res.status(404).json({ message: "Order not found for this user" });
    }

    // 3) Fetch the product to get the supplier_id
    const product = await Product.findOne({ sku: order.sku });
    if (!product) {
        return res.status(404).json({ message: "Product not found for this order" });
    }
    console.log("Prodduct", product);
    
    // 4) Find the supplier for this product
    const supplier = await Supplier.findOne({ _id: product.owned_by_supplier }); // Adjust field as per your Product schema
    if (!supplier) {
        return res.status(404).json({ message: "Supplier not found for this product" });
    }

    // 5) Create the ticket with supplier_id
    const ticket = await Ticket.create({
        sku: order.sku,
        supplier_id: supplier.supplier_id,
        orderId,
        issue: issue.trim(),
        status: "open",
    });

    // 6) Respond with the new ticket
    res.status(201).json({
        ticketId: ticket._id,
        productName: order.prodName,
        supplier_id: ticket.supplier_id,
        orderId: ticket.orderId,
        issue: ticket.issue,
        status: ticket.status,
        createdAt: ticket.createdAt,
    });
});

const fetchTicketsBySupplierId = asynchandler(async (req, res) => {
    const { supplier_id } = req.body;

    if (!supplier_id) {
        return res.status(400).json({ message: "supplier_id is required" });
    }

    const tickets = await Ticket.find({ supplier_id: supplier_id.trim().toUpperCase() });

    res.status(200).json({
        supplier_id: supplier_id.trim().toUpperCase(),
        tickets,
    });
});

export { raiseTicket, fetchTicketsBySupplierId };
