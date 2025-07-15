import { checkSchema, Schema } from "express-validator";

const servicesPostSchemaValidator: Schema = {
  viaje_id: {
    in: ["body"],
    isString: {
      errorMessage: "El ID del viaje debe ser una cadena de texto",
      bail: true,
    },
    trim: true,
  },
  servicio_id: {
    in: ["body"],
    isInt: {
      errorMessage: "El ID del servicio debe ser un número entero",
      bail: true,
    },
    trim: true,
  },
  valor: {
    in: ["body"],
    isInt: {
      options: { min: 0 },
      errorMessage: "El valor debe ser un número entero mayor a 0",
      bail: true,
    },
    trim: true,
    toInt: true,
  },
  pagado_por: {
    in: ["body"],
    isIn: {
      options: [["mariana", "pablo", "soledad"]],
      errorMessage: "El pagado por debe ser 'mariana', 'pablo' o 'soledad'",
      bail: true,
    },
    trim: true,
  },
};

const servicesPatchSchemaValidator: Schema = {
  tid: {
    in: ["params"],
    isString: {
      errorMessage: "El ID del viaje debe ser una cadena de texto",
      bail: true,
    },
    trim: true,
  },
  sid: {
    in: ["params"],
    isInt: {
      errorMessage: "El ID del servicio debe ser un número entero",
      bail: true,
    },
    trim: true,
    toInt: true,
  },
  valor: {
    in: ["body"],
    optional: true,
    isInt: {
      options: { min: 0 },
      errorMessage: "El valor debe ser un número entero mayor a 0",
      bail: true,
    },
    trim: true,
    toInt: true,
  },
  pagado_por: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["mariana", "pablo", "soledad"]],
      errorMessage: "El pagado por debe ser 'mariana', 'pablo' o 'soledad'",
      bail: true,
    },
    trim: true,
  },
};

const servicesDeleteSchemaValidator: Schema = {
  tid: {
    in: ["params"],
    isString: {
      errorMessage: "El ID del viaje debe ser una cadena de texto",
      bail: true,
    },
    trim: true,
  },
  sid: {
    in: ["params"],
    isInt: {
      errorMessage: "El ID del servicio debe ser un número entero",
      bail: true,
    },
    trim: true,
    toInt: true,
  },
};

export const servicesPostSchema = checkSchema(servicesPostSchemaValidator);
export const servicesPatchSchema = checkSchema(servicesPatchSchemaValidator);
export const servicesDeleteSchema = checkSchema(servicesDeleteSchemaValidator);
