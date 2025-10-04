import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPasswordComponent() {
  const [formData, setFormData] = useState({
    email: "",
  });

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <Link to="/" className="forgot-password-back-button">
          <ArrowLeft size={16} className="forgot-password-back-icon" />
          Volver al login
        </Link>

        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Recuperar Contraseña</h1>
          <p className="forgot-password-instructions">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>
        </div>

        <div className="forgot-password-form">
          <div className="forgot-password-input-group">
            <Mail className="forgot-password-input-icon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="forgot-password-input"
            />
          </div>

          <button type="button" className="forgot-password-submit-button">
            Enviar enlace de recuperación
          </button>
        </div>

        <div className="forgot-password-footer">
          <p className="forgot-password-footer-text">
            ¿Recordaste tu contraseña?{" "}
            <Link to="/" className="forgot-password-login-link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordComponent;