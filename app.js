import { configDotenv } from "dotenv"
import express from "express"
import cors from "cors"

const app = express()

configDotenv()

app.use(cors({
    origin: "*"
}))
app.use(express.json());

import productRoutes from "./routes/product.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import orderRoutes from "./routes/order.routes.js"
import userRoutes from "./routes/user.routes.js"
import ticketRoutes from "./routes/ticket.routes.js"

app.use("/api/v1/product", productRoutes);
app.use("/api/v1/supplier", supplierRoutes);
app.use("/api/v1/order", orderRoutes)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/ticket", ticketRoutes)

export default app;