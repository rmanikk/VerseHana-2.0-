import express from "express";
import { testDatabaseConnection } from "../config/database.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const database = await testDatabaseConnection();

    res.status(200).json({
      success: true,
      message: "VerseHana API is running.",
      services: {
        api: "ok",
        database: "connected",
      },
      timestamp: database.now,
    });
  } catch (error) {
    next(error);
  }
});

export default router;