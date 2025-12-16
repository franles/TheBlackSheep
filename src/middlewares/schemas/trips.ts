import { checkSchema, Schema } from "express-validator";

const tripPostSchemaValidator: Schema = {
  apellido: {
    in: ["body"],
    isString: {
      errorMessage: "El apellido debe ser una cadena de texto",
      bail: true,
    },
    notEmpty: {
      errorMessage: "El apellido es obligatorio",
      bail: true,
    },
    trim: true,
  },
  valor_total: {
    in: ["body"],
    isInt: {
      errorMessage: "El valor total debe ser un número",
      bail: true,
    },
    notEmpty: {
      errorMessage: "El valor total es obligatorio",
      bail: true,
    },
    trim: true,
  },
  destino: {
    in: ["body"],
    isIn: {
      options: [["internacional", "nacional"]],
      errorMessage: "El destino debe ser 'internacional' o 'nacional'",
      bail: true,
    },
    isString: true,
    notEmpty: {
      errorMessage: "El destino es obligatorio",
      bail: true,
    },
    trim: true,
  },
  valor_tasa_cambio: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isFloat: {
      errorMessage: "El valor de la tasa de cambio debe ser un número decimal",
      bail: true,
    },
    toFloat: true,
  },
};

const tripPatchSchemaValidator: Schema = {};

for (const key in tripPostSchemaValidator) {
  tripPatchSchemaValidator[key] = {
    ...tripPostSchemaValidator[key],
    optional: true,
  };
}

const tripDeleteSchemaValidator: Schema = {
  tid: {
    in: ["params"],
    isString: {
      errorMessage: "El ID del viaje debe ser una cadena de texto",
      bail: true,
    },
    trim: true,
  },
};
export const tripPostSchema = checkSchema(tripPostSchemaValidator);
export const tripPatchSchema = checkSchema(tripPatchSchemaValidator);
export const tripDeleteSchema = checkSchema(tripDeleteSchemaValidator);
