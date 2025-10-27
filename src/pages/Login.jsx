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
  const [esPregunta, setEsPregunta] = useState(false)
  const [mensajeInfo, setMensajeInfo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados de validación
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})

  // ========== VALIDADORES ==========
  
  const validarUsuario = (valor) => {
    if (!valor) return 'Usuario requerido'
    if (valor.length < 3) return 'Usuario inválido'
    return ''
  }

  const validarContrasena = (valor) => {
    if (!valor) return 'Contraseña requerida'
    if (valor.length < 6) return 'Contraseña muy corta'
    return ''
  }

  const validarCodigo = (valor) => {
    if (!valor) return 'Código requerido'
    if (!esPregunta && valor.length !== 6) return 'Debe tener 6 dígitos'
    if (esPregunta && valor.trim().length < 2) return 'Respuesta muy corta'
    return ''
  }

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'usuario': return validarUsuario(valor)
      case 'contrasena': return validarContrasena(valor)
      case 'codigo': return validarCodigo(valor)
      default: return ''
    }
  }

  // ========== HANDLE CHANGE ==========
  
  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Validar en tiempo real si ya fue tocado
    if (tocado[name]) {
      const errorCampo = validarCampo(name, value)
      setErrores({
        ...errores,
        [name]: errorCampo
      })
    }
    
    setError('')
  }

  const handleCodigoChange = (e) => {
    const valor = esPregunta 
      ? e.target.value 
      : e.target.value.replace(/\D/g, '').slice(0, 6)
    
    setCodigoTOTP(valor)
    
    // Validar en tiempo real si ya fue tocado
    if (tocado.codigo) {
      const errorCampo = validarCodigo(valor)
      setErrores({
        ...errores,
        codigo: errorCampo
      })
    }
    
    setError('')
  }

  // ========== HANDLE BLUR ==========
  
  const handleBlur = (e) => {
    const { name, value } = e.target
    
    setTocado({
      ...tocado,
      [name]: true
    })
    
    const errorCampo = validarCampo(name, value)
    setErrores({
      ...errores,
      [name]: errorCampo
    })
  }

  const handleCodigoBlur = () => {
    setTocado({
      ...tocado,
      codigo: true
    })
    
    const errorCampo = validarCodigo(codigoTOTP)
    setErrores({
      ...errores,
      codigo: errorCampo
    })
  }

  // ========== VALIDAR FORMULARIO ==========
  
  const validarFormulario = () => {
    if (requiereTOTP) {
      const errorCodigo = validarCodigo(codigoTOTP)
      if (errorCodigo) {
        setErrores({ codigo: errorCodigo })
        setTocado({ codigo: true })
        return false
      }
      return true
    }
    
    const nuevosErrores = {}
    if (!formData.usuario) nuevosErrores.usuario = 'Usuario requerido'
    if (!formData.contrasena) nuevosErrores.contrasena = 'Contraseña requerida'
    
    setErrores(nuevosErrores)
    setTocado({ usuario: true, contrasena: true })
    
    return Object.keys(nuevosErrores).length === 0
  }

  // ========== HANDLE SUBMIT ==========
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validarFormulario()) {
      setError('Por favor completa todos los campos correctamente')
      return
    }

    setLoading(true)

    try {
      const payload = {
        usuario: formData.usuario,
        contrasena: formData.contrasena,
        codigo_totp: codigoTOTP || null
      }

      const response = await axios.post('http://localhost:8000/api/auth/login', payload)
      
      if (response.data.requiere_totp) {
        setRequiereTOTP(true)
        const mensaje = response.data.mensaje || ''
        setMensajeInfo(mensaje)
        
        const mensajeLower = mensaje.toLowerCase()
        
        if (mensaje.startsWith('❓')) {
          setEsPregunta(true)
          setEsEmail(false)
        } else if (mensajeLower.includes('email') || mensajeLower.includes('correo') || mensajeLower.includes('@')) {
          setEsEmail(true)
          setEsPregunta(false)
        } else {
          setEsEmail(false)
          setEsPregunta(false)
        }
        
        // Limpiar validaciones anteriores
        setErrores({})
        setTocado({})
        
        setLoading(false)
        return
      }

      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
      
      console.log('Login exitoso:', response.data)
      alert(`¡Bienvenido ${response.data.usuario.nombre}!`)
      
      navigate('/verificaciones')
      
    } catch (err) {
      if (err.response?.data?.detail) {
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
    setErrores({})
    setTocado({})
  }

  const obtenerPregunta = () => {
    if (esPregunta && mensajeInfo.startsWith('❓')) {
      return mensajeInfo.substring(2).trim()
    }
    return mensajeInfo
  }

  // ========== CLASES DE INPUT ==========
  
  const getInputClass = (campo) => {
    if (!tocado[campo]) return ''
    return errores[campo] ? 'input-error' : 'input-valido'
  }

  // ========== VERIFICAR SI FORMULARIO ES VÁLIDO ==========
  
  const formularioValido = requiereTOTP 
    ? (esPregunta ? codigoTOTP.trim().length >= 2 : codigoTOTP.length === 6)
    : (formData.usuario && formData.contrasena && formData.usuario.length >= 3 && formData.contrasena.length >= 6)

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
          {!requiereTOTP && (
            <>
              <div className="form-group">
                <label>Usuario</label>
                <input
                  type="text"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre de usuario"
                  className={getInputClass('usuario')}
                  required
                  autoFocus
                />
                {tocado.usuario && errores.usuario && (
                  <span className="error-text">{errores.usuario}</span>
                )}
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu contraseña"
                  className={getInputClass('contrasena')}
                  required
                />
                {tocado.contrasena && errores.contrasena && (
                  <span className="error-text">{errores.contrasena}</span>
                )}
              </div>
            </>
          )}

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
                  type="text"
                  value={codigoTOTP}
                  onChange={handleCodigoChange}
                  onBlur={handleCodigoBlur}
                  placeholder={esPregunta ? "Escribe tu respuesta" : "000000"}
                  maxLength={esPregunta ? undefined : 6}
                  className={`${esPregunta ? "respuesta-input" : "totp-input"} ${getInputClass('codigo')}`}
                  autoFocus
                  required
                />
                {tocado.codigo && errores.codigo && (
                  <span className="error-text">{errores.codigo}</span>
                )}
                <small className="help-text">
                  {esPregunta 
                    ? '💡 Ingresa la respuesta que configuraste'
                    : esEmail 
                      ? '📬 Revisa tu correo y copia el código de 6 dígitos'
                      : '📱 Abre Google Authenticator o tu app de autenticación'
                  }
                </small>
              </div>

              {esEmail && (
                <div className="email-ayuda">
                  <p className="texto-ayuda">
                    💡 Si no ves el correo, revisa tu carpeta de <strong>spam</strong>
                  </p>
                </div>
              )}

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
            disabled={loading || !formularioValido}
            style={{ opacity: (!formularioValido && !loading) ? 0.6 : 1 }}
          >
            {loading 
              ? 'Verificando...' 
              : requiereTOTP 
                ? (esPregunta ? 'Verificar Respuesta' : 'Verificar Código')
                : 'Iniciar Sesión'
            }
          </button>

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