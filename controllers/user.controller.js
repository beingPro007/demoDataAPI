import User from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";

const addUser = asynchandler(async (req, res) => {
    const { name, email, phoneNumber, role, brandName, ownerName, brandId } = req.body;

    if (!name || !phoneNumber || !email  || !role) {
        return res.status(400).json({ message: "Name, phoneNumber and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, phoneNumber, email, role, brandId, ownerName });
    if (!user) {
        return res.status(500).json({ message: "Failed to create user" });
    }

    res.status(201).json({ message: "User added successfully", user });
});
  
const verifyPhoneNumber = asynchandler(async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }
    console.log("Phone number for verification", phoneNumber);

    const user = await User.findOne({ phoneNumber });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        verified: true,
        name: user.name,
        role: user.role,
        fullName: user.ownerName
    });
});


const fetchAllUsers = asynchandler(async (req, res) => {
    const users = await User.find({});
    if (!users) {
        return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
});

const fetchUser = asynchandler(async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
});

export { addUser, fetchAllUsers, fetchUser, verifyPhoneNumber }