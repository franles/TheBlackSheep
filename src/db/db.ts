import { createPool } from "mysql2";
import config from "../config/config";

export const db = createPool({
  database: config.DB_NAME,
  host: config.DB_HOST,
  password: config.DB_PASSWORD,
  port: parseInt(config.PORT!),
  user: config.DB_USER,
  timezone: "-03:00",
}).promise();
