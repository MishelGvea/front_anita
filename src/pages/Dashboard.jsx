import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    // Verificar si hay sesión
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

  if (!usuario) return <div>Cargando...</div>

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Dashboard</h1>
        <div className="user-info">
          <p><strong>Usuario:</strong> {usuario.usuario}</p>
          <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellidos}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Teléfono:</strong> {usuario.telefono}</p>
        </div>
        
        <button onClick={cerrarSesion} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default Dashboard