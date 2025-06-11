import { Router } from "express";

import {
    addOrder,
    cancelOrder,
    fetchOrdersByPhone,
    getOrderStatusByPhone,
    lateOrders,
    refundOrder,
    updateShippingAddress,
} from "../controllers/order.controller.js";

const router = Router();

// Orders
router.get("/fetchOrder", fetchOrdersByPhone);
router.post("/createOrder", addOrder);
router.get("/orderStatus", getOrderStatusByPhone);
router.post('/cancelOrder', cancelOrder)
router.post('/refundOrder', refundOrder)
router.post("/updateShippingAddress", updateShippingAddress)
router.post("/lateOrders", lateOrders)

export default router;
