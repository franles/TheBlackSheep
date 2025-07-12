import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login"
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
//Acá vas a definir las rutas, navbar, layout, etc.

//Es el archivo que más vas a usar al principio.