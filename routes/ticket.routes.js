import { Router } from "express";
import { fetchTicketsBySupplierId, raiseTicket } from "../controllers/ticket.controller.js";

const router = Router()

router.post("/raiseTicket", raiseTicket)
router.post("/fetchSupTickets", fetchTicketsBySupplierId);

export default router;