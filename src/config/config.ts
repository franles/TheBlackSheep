import { Command, Option } from "commander";
import dotenv from "dotenv";
import fs from "fs";

const program = new Command();

program.addOption(
  new Option("-m, --mode <MODE>", "Modo de ejecucion del servidor")
    .choices(["prod", "dev"])
    .default("dev")
);
program.allowUnknownOption();
program.allowExcessArguments();

program.parse();
const { mode } = program.opts();

const envFile = mode === "prod" ? ".env" : ".env.dev";
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  console.warn(`⚠️  Archivo ${envFile} no encontrado, usando variables de entorno del sistema`);
  dotenv.config();
}

const config = {
  NODE_ENV: mode === "prod" ? "production" : "development",
  PORT: process.env.PORT || "8080",
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_USER: process.env.DB_USER,
  DB_PORT: process.env.DB_PORT,
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK: process.env.GOOGLE_CALLBACK,
  API_URL: process.env.API_URL || `http://localhost:${process.env.PORT || 8080}`,
};

// Validar variables críticas
const requiredVars = [
  'DB_NAME',
  'DB_HOST',
  'DB_USER',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_SECRET',
];

const missingVars = requiredVars.filter(varName => !config[varName as keyof typeof config]);

if (missingVars.length > 0) {
  console.error('❌ Faltan variables de entorno críticas:', missingVars.join(', '));
  process.exit(1);
}

export default config;
