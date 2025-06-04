import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./db/index.js";

app.on("error", (err) => {
    console.log("Error in server:", err);
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    })
    .catch((err) => {
        console.log("Error in creating the connection with mongoDB:", err);
    });
