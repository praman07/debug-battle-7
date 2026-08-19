export interface JwtPayload {
  id: string;
  role: "user" | "admin";
}

// Augment Express's Request type globally so `req.user` is typed
// everywhere without needing to cast in every controller/middleware.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
