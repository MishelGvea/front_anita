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
  const [esEmail, setEsEmail] = useState(false)
  const [esPregunta, setEsPregunta] = useState(false) // 🆕 Detectar pregunta de seguridad
  const [mensajeInfo, setMensajeInfo] = useState('')
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
    // Para pregunta de seguridad, permitir texto. Para código, solo números
    if (esPregunta) {
      setCodigoTOTP(e.target.value)
    } else {
      const valor = e.target.value.replace(/\D/g, '').slice(0, 6)
      setCodigoTOTP(valor)
    }
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
      
      // Verificar si requiere TOTP, Email o Pregunta
      if (response.data.requiere_totp) {
        setRequiereTOTP(true)
        const mensaje = response.data.mensaje || ''
        setMensajeInfo(mensaje)
        
        // 🆕 Detectar tipo de autenticación
        const mensajeLower = mensaje.toLowerCase()
        
        if (mensaje.startsWith('❓')) {
          // Es una pregunta de seguridad
          setEsPregunta(true)
          setEsEmail(false)
        } else if (mensajeLower.includes('email') || mensajeLower.includes('correo') || mensajeLower.includes('@')) {
          // Es verificación por email
          setEsEmail(true)
          setEsPregunta(false)
        } else {
          // Es TOTP (Google Authenticator)
          setEsEmail(false)
          setEsPregunta(false)
        }
        
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
    setEsEmail(false)
    setEsPregunta(false)
    setMensajeInfo('')
    setError('')
  }

  // 🆕 Función para extraer la pregunta del mensaje
  const obtenerPregunta = () => {
    if (esPregunta && mensajeInfo.startsWith('❓')) {
      return mensajeInfo.substring(2).trim() // Quitar el emoji y espacios
    }
    return mensajeInfo
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Iniciar Sesión</h1>
        <p className="subtitle">
          {requiereTOTP 
            ? (esPregunta 
                ? 'Pregunta de Seguridad' 
                : esEmail 
                  ? 'Verificación por Email' 
                  : 'Autenticación de dos factores')
            : 'Ingresa tus credenciales'
          }
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

          {/* Campo TOTP, Email o Pregunta de Seguridad */}
          {requiereTOTP && (
            <div className={esPregunta ? "pregunta-section" : esEmail ? "email-section" : "totp-section"}>
              <div className={esPregunta ? "pregunta-info" : esEmail ? "email-info" : "totp-info"}>
                <span className="totp-icon">
                  {esPregunta ? '❓' : esEmail ? '📧' : '🔒'}
                </span>
                <p>
                  {esPregunta 
                    ? obtenerPregunta()
                    : mensajeInfo || (esEmail 
                        ? 'Revisa tu correo electrónico' 
                        : 'Ingresa el código de 6 dígitos de tu aplicación de autenticación')}
                </p>
              </div>
              
              <div className="form-group">
                <label>
                  {esPregunta ? 'Tu respuesta' : 'Código de verificación'}
                </label>
                <input
                  type={esPregunta ? "text" : "text"}
                  value={codigoTOTP}
                  onChange={handleCodigoChange}
                  placeholder={esPregunta ? "Escribe tu respuesta" : "000000"}
                  maxLength={esPregunta ? undefined : "6"}
                  className={esPregunta ? "respuesta-input" : "totp-input"}
                  autoFocus
                  required
                />
                <small className="help-text">
                  {esPregunta 
                    ? '💡 Ingresa la respuesta que configuraste'
                    : esEmail 
                      ? '📬 Revisa tu correo y copia el código de 6 dígitos'
                      : '📱 Abre Google Authenticator o tu app de autenticación'
                  }
                </small>
              </div>

              {/* Ayuda adicional para email */}
              {esEmail && (
                <div className="email-ayuda">
                  <p className="texto-ayuda">
                    💡 Si no ves el correo, revisa tu carpeta de <strong>spam</strong>
                  </p>
                </div>
              )}

              {/* Ayuda adicional para pregunta */}
              {esPregunta && (
                <div className="pregunta-ayuda">
                  <p className="texto-ayuda">
                    🔐 La respuesta no distingue entre mayúsculas y minúsculas
                  </p>
                </div>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading || (requiereTOTP && !esPregunta && codigoTOTP.length !== 6)}
          >
            {loading 
              ? 'Verificando...' 
              : requiereTOTP 
                ? (esPregunta ? 'Verificar Respuesta' : 'Verificar Código')
                : 'Iniciar Sesión'
            }
          </button>

          {/* Botón volver */}
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