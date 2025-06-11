import app from "./app.js";
import connectDB from "./db/index.js";
import { startLateOrderCron } from "./controllers/lateDelivery.controller.js";

app.on("error", (err) => {
    console.log("❌ Server Error:", err);
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`);
        });

        // startLateOrderCron();
        // console.log("🕒 Late order cron job scheduled.");
    })
    .catch((err) => {
        console.log("❌ MongoDB connection error:", err);
    });
