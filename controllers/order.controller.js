import { Order } from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import sendEmail from "../utils/sendEmail.js";
/**
 * Fetch order by ID or by user info
 */


const fetchOrdersByPhone = asynchandler(async (req, res) => {
    const { phoneNumber } = req.query;
    console.log("Phone number is:", phoneNumber);

    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }
    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    // Find user by phoneNumber
    const user = await User.findOne({
        phoneNumber: { $regex: new RegExp(normalizedPhone + '$') } // ends with normalizedPhone
    });      

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Fetch all orders by user._id
    const orders = await Order.find({ userId: user._id });

    res.status(200).json({
        phoneNumber: user.phoneNumber,
        totalOrders: orders.length,
        orders,
    });
});

const getOrderStatusByPhone = asynchandler(async (req, res) => {
    const { phoneNumber, orderName } = req.query;
    console.log("Fetching status for:", phoneNumber, orderName);

    if (!phoneNumber || !orderName) {
        return res.status(400).json({ message: "Phone number and order name are required" });
    }

    // Normalize phoneNumber
    const user = await User.findOne({ phoneNumber });
    console.log("User data is:", user);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Find order belonging to the user by product name (case-insensitive)
    const order = await Order.findOne({
        userId: user._id,
        prodName: new RegExp(`^${orderName}$`, 'i')
    });

    if (!order) {
        return res.status(404).json({ message: "Order not found for this user" });
    }

    res.status(200).json({
        phoneNumber: user.phoneNumber,
        prodName: order.prodName,
        status: order.status,
        lastUpdated: order.updatedAt,
    });
});
  
const addOrder = asynchandler(async (req, res) => {
    const { phoneNumber, sku, quantity, shippingAddress } = req.body;

    if (!phoneNumber || !sku || !quantity || !shippingAddress) {
        return res.status(400).json({ message: "phoneNumber, sku, quantity, and shippingAddress are required" });
    }

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Find product by SKU
    const product = await Product.findOne({ sku: sku.toUpperCase() });
    if (!product) {
        return res.status(404).json({ message: "Product with given SKU not found" });
    }

    // Create order
    const order = await Order.create({
        sku: sku,
        prodName: product.name,
        quantity,
        shippingAddress,
        userId: user._id,
    });

    if (!order) {
        return res.status(500).json({ message: "Failed to create order" });
    }

    // Update user
    user.orders.push(order._id);
    await user.save();

    res.status(201).json({ message: "Order created successfully", order });
});

const fetchOrdersByBrand = asynchandler(async (req, res) => {
    const { phoneNumber } = req.query;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number required" });

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "Brand") return res.status(403).json({ message: "Access denied: Not a brand" });

    // Find orders for this brand's products
    const orders = await Order.find({ brandId: user._id }).populate("products");

    return res.status(200).json({
        brandName: user.name,
        totalOrders: orders.length,
        orders,
    });
});
  
const cancelOrder = asynchandler(async (req, res) => {
    const { phoneNumber, sku } = req.body;

    if (!phoneNumber || !sku) {
        return res.status(400).json({ message: "phoneNumber and sku are required" });
    }

    // Find user by phoneNumber
    const user = await User.findOne({ phoneNumber: phoneNumber.trim() });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const order = await Order.findOne({
        userId: user._id,
        sku: sku.toUpperCase(),
        status: { $in: ["created", "shipped"] } // Only cancel if not already cancelled/delivered/refunded
    });

    if (!order) {
        return res.status(404).json({ message: "Order not found or cannot be cancelled" });
    }

    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
});
  
const refundOrder = asynchandler(async (req, res) => {
    const { phoneNumber, sku } = req.body;

    if (!phoneNumber || !sku) {
        return res.status(400).json({ message: "phoneNumber and sku are required" });
    }

    // Find user by phoneNumber
    const user = await User.findOne({ phoneNumber: phoneNumber.trim() });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Find product by SKU
    const product = await Product.findOne({ sku: sku.toUpperCase() });
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    // Find order for this user and product (sku)
    const order = await Order.findOne({
        userId: user._id,
        prodName: product.name,
        status: { $ne: "refunded" }, 
    });

    if (!order) {
        return res.status(404).json({ message: "Order not found or already refunded" });
    }

    // Update order status to refunded
    order.status = "refunded";
    await order.save();

    res.status(200).json({ message: "Order refunded successfully", order });
});


/**
 * Update ticket status or add notes
 */
const updateSupportTicket = async (req, res) => {
    const { ticketId } = req.params;
    const { status, notes } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        if (status) ticket.status = status;
        if (notes) {
            ticket.notes = ticket.notes || [];
            ticket.notes.push({ note: notes, date: new Date() });
        }
        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Error updating ticket", error: error.message });
    }
};

/**
 * List tickets for user or order
 */
const listSupportTickets = async (req, res) => {
    const { orderId, userId, status } = req.query;
    try {
        let query = {};
        if (orderId) query.order = orderId;
        if (userId) query.customer = userId;
        if (status) query.status = status;

        const tickets = await Ticket.find(query).sort({ created_at: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error: error.message });
    }
};

/**
 * View user info (read-only)
 */
const fetchUserInfo = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

/**
 * Send communication (email) to user or supplier
 */
const sendCommunication = async (req, res) => {
    const { toType, toId, subject, message } = req.body;

    if (!toType || !toId || !message) {
        return res.status(400).json({ message: "toType, toId and message are required" });
    }

    try {
        let emailAddress;

        if (toType === "user") {
            const user = await User.findById(toId);
            if (!user) return res.status(404).json({ message: "User not found" });
            emailAddress = user.email;
        } else if (toType === "supplier") {
            const { Supplier } = await import("../models/supplier.model.js");
            const supplier = await Supplier.findById(toId);
            if (!supplier) return res.status(404).json({ message: "Supplier not found" });
            emailAddress = supplier.email;
        } else {
            return res.status(400).json({ message: "Invalid toType" });
        }

        await sendEmail(emailAddress, subject || "Message from Support Team", message);
        res.status(200).json({ success: true, message: `Message sent to ${toType}` });
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
};

/**
 * Track shipment (dummy placeholder)
 */
const trackShipment = async (req, res) => {
    const { trackingNumber } = req.params;
    try {
        const shipmentStatus = {
            trackingNumber,
            status: "In Transit",
            expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            lastLocation: "Distribution Center",
        };
        res.status(200).json(shipmentStatus);
    } catch (error) {
        res.status(500).json({ message: "Error fetching shipment status", error: error.message });
    }
};

/**
 * View payment status
 */
const viewPaymentStatus = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ paymentStatus: order.paymentStatus });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payment status", error: error.message });
    }
};

export {
    fetchOrdersByPhone,
    addOrder,
    getOrderStatusByPhone,
    fetchOrdersByBrand,
    cancelOrder,
    refundOrder
};
