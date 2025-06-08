import Product from "../models/product.model.js";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";

const raiseTicket = asynchandler(async (req, res) => {
    const { sku, issue } = req.body;
    let {phoneNumber} = req.query;

    console.log("raiseTicket body and params are:", req.body, req.query);

    // 1) Validate required fields
    if (!sku || !issue) {
        return res.status(400).json({ message: "SKU and issue are required" });
    }

    phoneNumber = phoneNumber.trim();

    if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
    }

    console.log("Normalized phoneNumber:", phoneNumber);

    const user = await User.findOne({ phoneNumber });
    const userId = user._id;

    if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
    }

    // 3) Normalize SKU and check product existence
    const normalizedSku = sku.trim().toUpperCase();
    const product = await Product.findOne({ sku: normalizedSku });
    if (!product) {
        return res
            .status(404)
            .json({ message: `Product with SKU '${normalizedSku}' not found` });
    }

    // 4) Create the ticket
    const ticket = await Ticket.create({
        userId,
        sku: normalizedSku,
        issue: issue.trim(),
        status: "open",
    });

    // 5) Respond with the new ticket
    res.status(201).json({
        ticketId: ticket._id,
        userId: ticket.userId,
        prodName: product.name,
        sku: ticket.sku,
        issue: ticket.issue,
        status: ticket.status,
        createdAt: ticket.createdAt,
    });
});

export { raiseTicket };
  