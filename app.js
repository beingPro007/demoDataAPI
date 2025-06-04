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

app.use("/api/v1/product", productRoutes);
app.use("/api/v1/supplier", supplierRoutes);

export default app;