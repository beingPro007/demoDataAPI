import { Router } from "express";
import { addSupplier, fetchAllSuppliersWithProducts, fetchSupplierProducts, notifySupplierForProduct, sendSupplierFeedback, sendSupplierMessage } from "../controllers/supplier.controller.js";

const router = Router()

router.get("/fetchAllSuppliers", fetchAllSuppliersWithProducts)
router.post("/addSupplier", addSupplier)
router.get("/fetchSupplierProducts/:supplierId", fetchSupplierProducts);
router.get("/fetchAllSuppliersWithProducts", fetchAllSuppliersWithProducts)
router.post("/notifySupplierForProduct", notifySupplierForProduct)
router.post("/sendSupplierFeedback", sendSupplierFeedback)
router.post("/sendSupplierMessage", sendSupplierMessage)

export default router;