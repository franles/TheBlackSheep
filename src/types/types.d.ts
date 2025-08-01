export type GetTripsResponse = {
  data: Trip[];
  total: number;
};

export type Trip = {
  id: string;
  estado: "pendiente" | "finalizado";
  fecha: Date;
  moneda: "ARS" | "USD";
  destino: "internacional" | "nacional";
  apellido: string;
  valor_total: number;
  ganancia: number;
  costo: number;
  servicios: {
    id: number;
    valor: number;
    nombre: string;
    pagado_por: "pendiente" | "pablo" | "soledad" | "mariana";
  }[];
};

export type User = {
  auth: boolean;
  email: string;
  nombre: string;
  avatar: string;
};
