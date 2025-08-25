import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import queryRoutes from "./routes/queryRoutes.js"; 
import authRoutes from "./routes/authRoutes.js"; 
import passport from "./config/passport.js";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET environment variable is not set. Using fallback secret for development.');
  process.env.JWT_SECRET = 'fallback-secret-for-development-only';
}

if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET environment variable is not set. Using fallback secret for development.');
  process.env.SESSION_SECRET = 'fallback-session-secret-for-development-only';
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you plan to use cookies/auth
  })
);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/queries", queryRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
