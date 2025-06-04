import User from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";

const addUser = asynchandler(async (req, res) => {
  
    const { name, email } = req.body;

    if(!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    await User.findOne({ email }, async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
    });

    const user = await User.create({ name, email });
    if (!user) {
        return res.status(500).json({ message: "Failed to create user" });
    }

    res.status(201).json({ message: "User added successfully" });
});

export const fetchAllUsers = asynchandler(async (req, res) => {
    const users = await User.find({});
    if (!users) {
        return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
});

export const fetchUser = asynchandler(async (req, res) => {
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

export { addUser, fetchAllUsers, fetchUser }