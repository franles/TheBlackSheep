import express, { Request, Response } from "express";
import config from "./config/config";
import cors from "cors";
import tripsRoutes from "./routes/trips.routes";
import financeRoutes from "./routes/finance.routes";
import servicesRoutes from "./routes/services.routes";
import authRoutes from "./routes/auth.routes";
import passport from "passport";
import { configurePassport } from "./config/passport";
import { isAuthenticate } from "./middlewares/isAuthtenticate";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());
configurePassport();

app.use("/api/auth", authRoutes);
app.use("/api/trips", isAuthenticate, tripsRoutes);
app.use("/api/finance", isAuthenticate, financeRoutes);
app.use("/api/services", isAuthenticate, servicesRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Hola" });
});

app.use(errorHandler);
