import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

//Componentes
import LoginComponent from "./pages/loginPage/login.jsx";
import RegisterComponent from "./pages/registerPage/Register.jsx";
import ForgotPasswordComponent from "./pages/PasswordPage/ForgotPassword.jsx";
import ResetPasswordComponent from "./pages/PasswordPage/ResetPassword.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import ProductsComponent from "./pages/ProductsPage/products.jsx";
import ProviderPage from "./pages/ProviderPage/Provider.jsx";
import ClientPage from "./pages/ClientPage/Client.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginComponent></LoginComponent>}></Route>
        <Route
          path="/register"
          element={<RegisterComponent></RegisterComponent>}
        ></Route>
        <Route
          path="/forgotPassword"
          element={<ForgotPasswordComponent></ForgotPasswordComponent>}
        ></Route>
        <Route
          path="/resetPassword"
          element={<ResetPasswordComponent></ResetPasswordComponent>}
        ></Route>
        <Route path="/dashboard" element={<Dashboard></Dashboard>}>
        {/* Rutas hijas del dashboard */}
          <Route
            path="products"
            element={<ProductsComponent></ProductsComponent>}
          ></Route>
          <Route
            path="clients"
            element={<ClientPage></ClientPage>}
          ></Route>
          <Route
            path="providers"
            element={<ProviderPage></ProviderPage>}
          ></Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
