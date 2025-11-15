import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../firebase";
import "./ResetPassword.css";

function ResetPasswordComponent() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validatingCode, setValidatingCode] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    // Verificar que el código de reset sea válido
    if (!oobCode) {
      setError("Código de restablecimiento no encontrado. Por favor solicita un nuevo enlace.");
      setValidatingCode(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setValidatingCode(false);
      })
      .catch((error) => {
        console.error("Error validando código:", error);
        setError("El enlace de restablecimiento ha expirado o no es válido. Por favor solicita uno nuevo.");
        setValidatingCode(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Intentando resetear contraseña...");
      console.log("oobCode:", oobCode);
      console.log("Nueva contraseña length:", formData.password.length);
      
      await confirmPasswordReset(auth, oobCode, formData.password);
      
      console.log("✅ Contraseña restablecida exitosamente en Firebase");
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("❌ Error al restablecer contraseña:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      switch (error.code) {
        case "auth/expired-action-code":
          setError("El enlace ha expirado. Por favor solicita uno nuevo.");
          break;
        case "auth/invalid-action-code":
          setError("El enlace no es válido o ya fue usado.");
          break;
        case "auth/weak-password":
          setError("La contraseña es muy débil.");
          break;
        default:
          setError("Error al restablecer la contraseña. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== "";

  if (validatingCode) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1 className="reset-password-title">Validando enlace...</h1>
            <p className="reset-password-instructions">
              Por favor espera mientras verificamos tu enlace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !oobCode) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1 className="reset-password-title">Enlace inválido</h1>
            <p className="reset-password-instructions" style={{ color: "#ef4444" }}>
              {error}
            </p>
          </div>
          <Link to="/forgotPassword" className="reset-password-submit-button" style={{ textAlign: "center", textDecoration: "none" }}>
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1 className="reset-password-title">¡Contraseña actualizada!</h1>
            <p className="reset-password-instructions" style={{ color: "#22c55e" }}>
              Tu contraseña ha sido restablecida exitosamente. Serás redirigido al login en unos segundos...
            </p>
          </div>
          <Link to="/" className="reset-password-submit-button" style={{ textAlign: "center", textDecoration: "none" }}>
            Ir al login ahora
          </Link>
        </div>
      </div>
    );
  }

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

        {error && (
          <div className="reset-password-error-message" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

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
            disabled={!passwordsMatch || formData.password.length < 8 || loading}
          >
            {loading ? "Restableciendo..." : "Restablecer contraseña"}
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