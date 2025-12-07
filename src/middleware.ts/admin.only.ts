import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const adminRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeaders.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token missing!",
    });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("role" in decoded)
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden!",
      });
    }

    return next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Invalid token!",
    });
  }
};
