import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const adminOrOwn = async (
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
    return res
      .status(401)
      .json({ success: false, message: "Access denied. Token missing!" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("role" in decoded) ||
      !("id" in decoded)
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    req.user = {
      id: decoded.id as number,
      role: decoded.role as string,
      name: (decoded.name as string) || "",
    };

    const userIdParam = req.params.userId ? Number(req.params.userId) : null;

    if (req.user.role === "admin") return next();

    if (userIdParam && req.user.id === userIdParam) return next();

    return res.status(403).json({
      success: false,
      message: "Access forbidden!",
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
};
