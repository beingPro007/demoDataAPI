import { Router } from "express";
import { addUser, verifyPhoneNumber } from "../controllers/user.controller.js";

const router = Router()

router.post("/addUser", addUser)
router.post("/verifyPhoneNumber", verifyPhoneNumber)

export default router;