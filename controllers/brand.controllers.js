import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";


const fetchBrandProducts = asynchandler(async (req, res) => {
    let { phoneNumber } = req.query;

    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    phoneNumber = phoneNumber.trim();

    if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
    }

    console.log("Normalized phoneNumber:", phoneNumber);

    const user = await User.findOne({ phoneNumber });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "Brand") {
        return res.status(403).json({ message: "Access denied: Not a brand user" });
    }

    const products = await Product.find({brandOwner: user?._id});

    return res.status(200).json({
        brandName: user.name,
        totalProducts: products.length,
        products,
    });
});



export {fetchBrandProducts}