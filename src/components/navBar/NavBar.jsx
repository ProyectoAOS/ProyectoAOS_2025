import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import './NavBar.css';

function NavBar() {
  const navigate = useNavigate();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    // Obtener el usuario del localStorage o sessionStorage
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'Usuario');
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
  }, []);

  const services = [
    'Productos',
    'Clientes',
    'Proveedores',
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setIsServicesOpen(false);
    console.log('Servicio seleccionado:', service);
    // Seleccion de servicio:
    if (service === 'Productos') {
      navigate('/dashboard/products'); // Ruta anidada
    } else if (service === 'Clientes') {
      navigate('/dashboard/clients');
    } else if (service === 'Proveedores') {
      navigate('/dashboard/providers');
    }
  };

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

  const handleLogout = () => {
    // Limpiar el almacenamiento
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    // Redirigir al login
    navigate('/');
  };

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <ul className="navbar-options">
          <li className="navbar-service-container">
            <button
              className="navbar-service-button"
              onClick={toggleServices}
            >
              Servicios
              <span className={`navbar-dropdown-arrow ${isServicesOpen ? 'navbar-dropdown-arrow--open' : ''}`}>
                ▼
              </span>
            </button>
            
            {isServicesOpen && (
              <div className="navbar-dropdown">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`navbar-dropdown-item ${
                      index === services.length - 1 ? 'navbar-dropdown-item--last' : ''
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    {service}
                  </div>
                ))}
              </div>
            )}
          </li>
          
          <li className="navbar-contact-item">
            Contacto
          </li>
        </ul>
      </div>
      
      <div className="navbar-user-info">
        <div className="navbar-user-image">
          {getInitials(userName)}
        </div>
        <div>
          <p className="navbar-user-name">{userName}</p>
        </div>
        <button 
          className="navbar-logout-button"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}

export default NavBar;