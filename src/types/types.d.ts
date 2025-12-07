import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        role: string;
      };
    }
  }
}
