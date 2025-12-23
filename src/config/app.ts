import express, { Request } from "express";
import config from "./config";
import cors from "cors";
import tripsRoutes from "../routes/trips.routes";
import financeRoutes from "../routes/finance.routes";
import servicesRoutes from "../routes/services.routes";
import authRoutes from "../routes/auth.routes";
import passport from "passport";
import { configurePassport } from "./passport.config";
import { isAuthenticate } from "../middlewares/isAuthtenticate";
import cookieParser from "cookie-parser";
import { errorHandler } from "../middlewares/errorHandler";
import compression from "compression";
import { httpLogger, logRequestBody } from "../middlewares/httpLogger";
import logger from "./logger.config";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { setupSwagger } from "./swagger.config";

export const app = express();

// ✅ Configurar Swagger
setupSwagger(app);

app.use(helmet());
// ✅ Logger HTTP debe ir primero para capturar todas las requests
app.use(httpLogger);

// ✅ Seguridad: Limitar tamaño de payload
app.use(
  express.json({
    limit: "10mb",
    verify: (req: Request, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        logger.warn("Invalid JSON in request body", {
          ip: req.ip,
          url: req.url,
        });
        throw new Error("JSON inválido");
      }
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 1000,
  })
);

// ✅ Log request body en desarrollo (después de parsear JSON)
if (config.NODE_ENV === "development") {
  app.use(logRequestBody);
}

// ✅ CORS configurado
app.use(
  cors({
    origin: [
      config.CLIENT_URL,
      "https://www.theblacksheeptravel.com",
      "https://theblacksheeptravel.com",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(passport.initialize());
configurePassport();

// ✅ Compresión optimizada
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
  })
);

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: "Demasiadas peticiones, intenta más tarde",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.error(
      `Rate limit excedido para ${req.ip}. Petición bloqueada: ${req.method} ${req.originalUrl}`
    );
    res.status(options.statusCode).send(options.message);
  },
});

// ✅ Rutas
app.use("/api", limiter);
app.use("/api/auth", authRoutes);
app.use("/api/trips", isAuthenticate, tripsRoutes);
app.use("/api/finance", isAuthenticate, financeRoutes);
app.use("/api/services", isAuthenticate, servicesRoutes);

// ✅ Manejo de errores al final
app.use(errorHandler);

// Log de inicio de aplicación
logger.info("Application initialized", {
  nodeEnv: config.NODE_ENV,
  port: config.PORT,
});
