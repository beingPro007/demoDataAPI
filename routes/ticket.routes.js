import { Router } from "express";
import { raiseTicket } from "../controllers/ticket.controller.js";

const router = Router()

router.post("/raiseTicket", raiseTicket)

export default router;