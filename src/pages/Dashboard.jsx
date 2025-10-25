import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    // 🔐 Verificar si hay sesión guardada
    const token = localStorage.getItem('token')
    const usuarioData = localStorage.getItem('usuario')
    
    if (!token || !usuarioData) {
      navigate('/login')
      return
    }
    
    setUsuario(JSON.parse(usuarioData))
  }, [navigate])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const configurar2FA = () => {
    navigate('/verificaciones') // 🔄 Ir a la pantalla de métodos de autenticación
  }

  if (!usuario) return <div>Cargando...</div>

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Bienvenido, {usuario.nombre} 👋</h1>

        <div className="user-info">
          <p><strong>Usuario:</strong> {usuario.usuario}</p>
          <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellidos}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Teléfono:</strong> {usuario.telefono}</p>
        </div>

        {/* 🔐 Estado de autenticaciones */}
        <div className="auth-status">
          <h2>Estado de Autenticación</h2>
          <ul>
             <li>
              📧 <strong>Verificación por Email (Gmail):</strong>{' '}
              {usuario.email_verificado ? (
                <span className="status success">✅ Verificado</span>
              ) : (
                <span className="status warning">⚠️ No verificado</span>
              )}
            </li>
            <li>
              📱 <strong>Verificación por SMS:</strong>{' '}
              {usuario.telefono_verificado ? (
                <span className="status success">✅ Verificado</span>
              ) : (
                <span className="status warning">⚠️ No verificado</span>
              )}
            </li>
            <li>
              🔐 <strong>App Autenticadora (TOTP):</strong>{' '}
              {usuario.totp_habilitado ? (
                <span className="status success">✅ Activado</span>
              ) : (
                <span className="status warning">⚠️ No activado</span>
              )}
            </li>
            <li>
              ❓ <strong>Pregunta de Seguridad:</strong>{' '}
              {usuario.pregunta_seguridad ? (
                <span className="status success">✅ Configurada</span>
              ) : (
                <span className="status warning">⚠️ No configurada</span>
              )}
            </li>
          </ul>
        </div>

        <div className="actions">
          <button onClick={configurar2FA} className="btn-2fa">
            🔧 Gestionar Métodos de Autenticación
          </button>

          <button onClick={cerrarSesion} className="btn-logout">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
