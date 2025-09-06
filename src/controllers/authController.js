// src/controllers/authController.js
import prisma from "../config/ prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: "email",
        googleId: null, 
      },
    });

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};


export const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

   
    const existingUserWithGoogleId = await prisma.user.findFirst({ 
      where: { googleId } 
    });

    if (existingUserWithGoogleId) {
      return res.status(400).json({ message: "Google account already linked to another user" });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // If user exists with email, link googleId
      user = await prisma.user.update({
        where: { email },
        data: { googleId, provider: "google" },
      });
    } else {
      // Otherwise create new Google user
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          provider: "google",
          password: null, 
        },
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ user, token });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};


export const googleOAuthCallback = async (req, res) => {
  try {

    const user = req.user;
    
    if (!user) {
      return res.redirect('/api/auth/google/failure');
    }

 
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.redirect('/api/auth/google/failure');
  }
};


export const googleOAuthFailure = (req, res) => {
  res.status(401).json({
    error: 'Google OAuth authentication failed',
    message: 'Unable to authenticate with Google'
  });
};


export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to get profile" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};


export const logout = async (req, res) => {
  try {
  
    res.json({
      message: "Logged out successfully",
      success: true
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};
