import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT,
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_USER: process.env.DB_USER,
  DB_PORT: process.env.DB_PORT,
  CLIENT_URL: process.env.CLIENT_URL,
};

export default config;
