import { Router } from "express";
import { addProduct, fetchAllProducts, fetchProduct, getProductInfo } from "../controllers/product.controller.js"; // Adjust the path as needed
import { fetchBrandProducts } from "../controllers/brand.controllers.js";

const router = Router();

router.get("/fetchAllProducts", fetchAllProducts);
router.get("/fetchProduct/:sku", fetchProduct);
router.post("/addProduct", addProduct);
router.get("/fetchProductByBrand", fetchBrandProducts);
router.post("/getProductInfo", getProductInfo)

export default router;
