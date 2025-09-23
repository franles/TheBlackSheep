import swaggerJSDoc from "swagger-jsdoc";
import config from "./config";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    servers: [
      {
        url: "http://localhost:8080",
        description: "Desarrollo",
      },
    ],
    info: {
      title: "API TheBlackSheep",
      version: "1.0.0",
    },
  },
  apis: ["./src/docs/*.yaml"],
};

export const swaggerDocs = swaggerJSDoc(swaggerOptions);
