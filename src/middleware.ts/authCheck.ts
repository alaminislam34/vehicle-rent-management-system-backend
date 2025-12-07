import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authCheck = (req: Request, res: Response, next: NextFunction) => {
  const accessHeader = req.headers.authorization;

  if (!accessHeader || !accessHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access token missing",
    });
  }

  const parts = accessHeader.split(" ");
  const accessToken = parts.length === 2 ? parts[1] : undefined;

  if (!accessToken || typeof accessToken !== "string") {
    return res.status(401).json({
      success: false,
      message: "Invalid access token format",
    });
  }

  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message:
            err.name === "TokenExpiredError"
              ? "Token expired"
              : "Token invalid",
        });
      }

      const payload = decoded as JwtPayload;

      req.user = {
        id: payload.id,
        role: payload.role,
        name: payload.name,
      };

      return next();
    }
  );
};
