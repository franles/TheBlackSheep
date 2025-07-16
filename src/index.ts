import { app } from "./app";
import config from "./config/config";

app.listen(config.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${config.PORT}`);
});
