import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createUser } from "../../services/userService";
import "./Register.css";

function RegisterComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    correo: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  //Validaciones de campos
  const validateName = (name) => {
    if (!name) return "El nombre es obligatorio";
    if (name.length < 2 || name.length > 100)
      return "El nombre debe tener mas de 2 y menos de 100 caracteres";
    if (!/^[a-zA-Z\s]*$/.test(name))
      return "El nombre solo debe contener letras";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "El correo es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "El correo no es válido";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "La contraseña es requerida";
    if (password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres";
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Debe confirmar la contraseña";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
    return "";
  };

  const handleRegister = async () => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.correo);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    setErrors({
      name: nameError,
      correo: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    setError("");
    //Verificar todos los campos
    if (nameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    //Verficiar que coincidan las contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError("Contraseñas no coinciden");
      return;
    }

    if (!formData.acceptTerms) {
      setError("Debes aceptar los terminos para seguir");
      return;
    }

    try {
      setLoading(true);

      //Enviar datos a fireStore con el servicio
      const newUserId = await createUser({
        name: formData.name,
        correo: formData.correo,
        password: formData.password,
        createdAt: new Date(),
      });

      console.log("Usuario creado, id = ", newUserId);
      Swal.fire({
        title: "Registrado",
        text: "Redireccionando al login...",
        icon: "success",
      });

      navigate("/");
    } catch (error) {
      console.error("Error al registrar usuario", error);
      Swal.fire({
        title: "Error",
        text: "Error al registrarse, intente de nuevo",
        icon: "error",
      });
      setError("Error al registrar cuenta de usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <Link to="/" className="register-back-button">
          <ArrowLeft size={16} className="register-back-icon" />
          Volver al login
        </Link>

        <div className="register-header">
          <h1 className="register-title">Crear Cuenta</h1>
          <p className="register-subtitle">Regístrate para comenzar</p>
        </div>

        {error && <div className="register-error">{error}</div>}

        <div className="register-form">
          <div className="register-input-group">
            <User className="register-input-icon" />
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`register-input ${errors.name ? "register-input--error" : ""}`}
            />
            {errors.name && <span className="register-field-error">{errors.name}</span>}
          </div>

          <div className="register-input-group">
            <Mail className="register-input-icon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
              className={`register-input ${errors.correo ? "register-input--error" : ""}`}
            />
            {errors.correo && <span className="register-field-error">{errors.correo}</span>}
          </div>

          <div className="register-input-group">
            <Lock className="register-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`register-input ${errors.password ? "register-input--error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="register-password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <span className="register-field-error">{errors.password}</span>}
          </div>

          <div className="register-input-group">
            <Lock className="register-input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className={`register-input ${errors.confirmPassword ? "register-input--error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="register-password-toggle"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && <span className="register-field-error">{errors.confirmPassword}</span>}
          </div>

          <label className="register-checkbox-label">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) =>
                setFormData({ ...formData, acceptTerms: e.target.checked })
              }
              className="register-checkbox"
            />
            <span className="register-checkbox-text">
              Acepto los{" "}
              <a href="#" className="register-terms-link">
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a href="#" className="register-terms-link">
                política de privacidad
              </a>
            </span>
          </label>

          <button
            type="button"
            className="register-submit-button"
            disabled={loading}
            onClick={handleRegister}
          >
            {loading ? "Creando..." : "Crear Cuenta"}
          </button>
        </div>

        <div className="register-footer">
          <p className="register-footer-text">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/" className="register-login-link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterComponent;