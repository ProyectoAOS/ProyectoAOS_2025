import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "./ResetPassword.css";

function ResetPasswordComponent() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para restablecer la contraseña
    console.log("Restableciendo contraseña...", formData);
  };

  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== "";

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <Link to="/" className="reset-password-back-button">
          <ArrowLeft size={16} className="reset-password-back-icon" />
          Volver al login
        </Link>

        <div className="reset-password-header">
          <h1 className="reset-password-title">Restablecer Contraseña</h1>
          <p className="reset-password-instructions">
            Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="reset-password-input-group">
            <Lock className="reset-password-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="reset-password-input"
              required
            />
            <button
              type="button"
              className="reset-password-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="reset-password-input-group">
            <Lock className="reset-password-input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar nueva contraseña"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className={`reset-password-input ${
                formData.confirmPassword && !passwordsMatch ? "reset-password-input--error" : ""
              } ${
                formData.confirmPassword && passwordsMatch ? "reset-password-input--success" : ""
              }`}
              required
            />
            <button
              type="button"
              className="reset-password-toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {formData.confirmPassword && !passwordsMatch && (
            <p className="reset-password-error-message">
              Las contraseñas no coinciden
            </p>
          )}

          <div className="reset-password-password-requirements">
            <h3 className="reset-password-requirements-title">Tu contraseña debe contener:</h3>
            <ul className="reset-password-requirements-list">
              <li className={formData.password.length >= 8 ? "reset-password-requirement--valid" : ""}>
                Al menos 8 caracteres
              </li>
              <li className={/[A-Z]/.test(formData.password) ? "reset-password-requirement--valid" : ""}>
                Una letra mayúscula
              </li>
              <li className={/[a-z]/.test(formData.password) ? "reset-password-requirement--valid" : ""}>
                Una letra minúscula
              </li>
              <li className={/\d/.test(formData.password) ? "reset-password-requirement--valid" : ""}>
                Un número
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="reset-password-submit-button"
            disabled={!passwordsMatch || formData.password.length < 8}
          >
            Restablecer contraseña
          </button>
        </form>

        <div className="reset-password-footer">
          <p className="reset-password-footer-text">
            ¿Recordaste tu contraseña?{" "}
            <Link to="/" className="reset-password-login-link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordComponent;