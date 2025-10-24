import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/userService";
import "./Login.css";

function LoginComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validar que los campos no estén vacíos
      if (!formData.email || !formData.password) {
        setError("Por favor, completa todos los campos");
        setLoading(false);
        return;
      }

      // Intentar iniciar sesión
      const user = await loginUser(formData.email, formData.password);
      
      // Guardar datos del usuario en localStorage si seleccionó "Recordarme"
      if (formData.remember) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="login-error-message">
              {error}
            </div>
          )}

          <div className="login-input-group">
            <Mail className="login-input-icon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="login-input"
              disabled={loading}
            />
          </div>

          <div className="login-input-group">
            <Lock className="login-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="login-input"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-password-toggle"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="login-checkbox-row">
            <label className="login-checkbox-label">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={(e) =>
                  setFormData({ ...formData, remember: e.target.checked })
                }
                className="login-checkbox"
                disabled={loading}
              />
              <span className="login-checkbox-text">Recordarme</span>
            </label>
            <Link
              to="/forgotPassword"
              className="login-forgot-link"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="login-submit-button" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="login-register-link">
              Regístrate
            </Link>
          </p>
        </div>

        <div className="login-divider">
          <div className="login-divider-line">
            <div className="login-divider-border"></div>
            <span className="login-divider-text">O continúa con</span>
            <div className="login-divider-border"></div>
          </div>

          <div className="login-social-buttons">
            <button className="login-social-button">
              Google
            </button>
            <button className="login-social-button">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;