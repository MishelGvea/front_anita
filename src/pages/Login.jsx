import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', formData)
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
      
      console.log('Login exitoso:', response.data)
      alert(`¡Bienvenido ${response.data.usuario.nombre}!`)
      
      // Redirigir al dashboard (lo crearemos después)
      navigate('/dashboard')
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.')
      }
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        <p className="subtitle">Ingresa tus credenciales</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder="Tu nombre de usuario"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="footer-links">
          <p>¿No tienes cuenta? <span onClick={() => navigate('/registro')} className="link">Regístrate</span></p>
          <p><span onClick={() => navigate('/')} className="link">← Volver al inicio</span></p>
        </div>
      </div>
    </div>
  )
}

export default Login