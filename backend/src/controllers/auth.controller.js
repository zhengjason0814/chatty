import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;
  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    } else if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be longer than 6 characters.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existingUser = await User.findOne({ email });

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    } else if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered, login or create a new account." });
    }
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in sign-in controller method", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  res.send("Login Route");
}

export function logout(req, res) {
  res.send("Logout Route");
}
