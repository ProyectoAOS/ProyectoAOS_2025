import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import "./ForgotPassword.css";

function ForgotPasswordComponent() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Configuración para el correo de recuperación
      const actionCodeSettings = {
        url: window.location.origin + "/",
        handleCodeInApp: false,
      };
      
      await sendPasswordResetEmail(auth, formData.email, actionCodeSettings);
      setSuccess(true);
      setFormData({ email: "" });
    } catch (error) {
      console.error("Error enviando correo:", error);
      switch (error.code) {
        case "auth/user-not-found":
          setError("No existe una cuenta con este correo electrónico.");
          break;
        case "auth/invalid-email":
          setError("El correo electrónico no es válido.");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Intenta más tarde.");
          break;
        default:
          setError("Error al enviar el correo. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

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

        {success && (
          <div className="forgot-password-success-message" style={{ 
            backgroundColor: "#dcfce7", 
            color: "#166534", 
            padding: "0.75rem", 
            borderRadius: "0.5rem", 
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            ¡Correo enviado! Revisa tu bandeja de entrada.
          </div>
        )}

        {error && (
          <div className="forgot-password-error-message" style={{ 
            backgroundColor: "#fee2e2", 
            color: "#991b1b", 
            padding: "0.75rem", 
            borderRadius: "0.5rem", 
            marginBottom: "1rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
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
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="forgot-password-submit-button"
            disabled={loading || !formData.email}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

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