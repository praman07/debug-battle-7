import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "E-commerce backend is running" });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
