import express, { Request, Response } from "express";
import config from "./config/config";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);
app.listen(config.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${config.PORT}`);
});

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Hola" });
});
