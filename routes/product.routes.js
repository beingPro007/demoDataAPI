import { Router } from "express";
import { addProduct, fetchAllProducts, fetchProduct } from "../controllers/product.controller.js"; // Adjust the path as needed
import { fetchSupplierProducts, notifySupplierForProduct, sendSupplierFeedback } from "../controllers/supplier.controller.js";

const router = Router();

router.get("/fetchAllProducts", fetchAllProducts);
router.get("/fetchProduct/:sku", fetchProduct);
router.post("/addProduct", addProduct);

export default router;
