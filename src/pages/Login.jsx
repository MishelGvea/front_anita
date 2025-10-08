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
  const [codigoTOTP, setCodigoTOTP] = useState('')
  const [requiereTOTP, setRequiereTOTP] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleCodigoChange = (e) => {
    // Solo permite números y máximo 6 dígitos
    const valor = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCodigoTOTP(valor)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        usuario: formData.usuario,
        contrasena: formData.contrasena,
        codigo_totp: codigoTOTP || null
      }

      const response = await axios.post('http://localhost:8000/api/auth/login', payload)
      
      // Verificar si requiere TOTP
      if (response.data.requiere_totp) {
        setRequiereTOTP(true)
        setLoading(false)
        return
      }

      // ✅ Login exitoso
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
      
      console.log('Login exitoso:', response.data)
      alert(`¡Bienvenido ${response.data.usuario.nombre}!`)
      
      // Redirigir al dashboard
      navigate('/verificaciones')
      
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

  const handleVolver = () => {
    setRequiereTOTP(false)
    setCodigoTOTP('')
    setError('')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        <p className="subtitle">
          {requiereTOTP ? 'Autenticación de dos factores' : 'Ingresa tus credenciales'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Campos de usuario y contraseña */}
          {!requiereTOTP && (
            <>
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
            </>
          )}

          {/* Campo TOTP (solo si es requerido) */}
          {requiereTOTP && (
            <div className="totp-section">
              <div className="totp-info">
                <span className="totp-icon">🔒</span>
                <p>Ingresa el código de 6 dígitos de tu aplicación de autenticación</p>
              </div>
              
              <div className="form-group">
                <label>Código de verificación</label>
                <input
                  type="text"
                  value={codigoTOTP}
                  onChange={handleCodigoChange}
                  placeholder="000000"
                  maxLength="6"
                  className="totp-input"
                  autoFocus
                  required
                />
                <small className="help-text">
                  Abre Google Authenticator o tu app de autenticación
                </small>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading || (requiereTOTP && codigoTOTP.length !== 6)}
          >
            {loading 
              ? 'Verificando...' 
              : requiereTOTP 
                ? 'Verificar Código' 
                : 'Iniciar Sesión'
            }
          </button>

          {/* Botón volver (solo en modo TOTP) */}
          {requiereTOTP && (
            <button 
              type="button" 
              onClick={handleVolver}
              className="btn-back"
            >
              ← Volver
            </button>
          )}
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