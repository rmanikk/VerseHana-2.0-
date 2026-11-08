
import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    const error = new Error("JWT_SECRET is not configured correctly.");
    error.statusCode = 500;
    throw error;
  }

  return secret;
}

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing.",
    });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === "string" ||
      payload.type !== "access" ||
      !payload.sub
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error) {
    return res.status(error.statusCode === 500 ? 500 : 401).json({
      success: false,
      message:
        error.statusCode === 500
          ? "Authentication service is not configured."
          : "Your session has expired. Please sign in again.",
    });
  }
}
