import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  const navigate = useNavigate();
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

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
    }
  };

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
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
          U
        </div>
        <div>
          <p className="navbar-user-name">Nombre Usuario</p>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;