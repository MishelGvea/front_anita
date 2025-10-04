import { useNavigate } from 'react-router-dom'
import './Bienvenida.css'

function Bienvenida() {
  const navigate = useNavigate()

  return (
    <div className="bienvenida-container">
      <div className="bienvenida-card">
        <h1>¡HOLA BIENVENIDO!</h1>
        <p>Sistema de Autenticación Multifactor</p>
        
        <div className="botones">
          <button 
            className="btn btn-login"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </button>
          
          <button 
            className="btn btn-registro"
            onClick={() => navigate('/registro')}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  )
}

export default Bienvenida