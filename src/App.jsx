import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";

//componentes
import RegisterComponent from "./pages/registerPage/Register.jsx";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterComponent></RegisterComponent>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
