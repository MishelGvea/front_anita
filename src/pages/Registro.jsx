import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Registro.css'

function Registro() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    apellidos: '',
    email: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: ''
  })
  
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})
  const [fuerzaContrasena, setFuerzaContrasena] = useState({ nivel: 0, texto: '', color: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ========== VALIDADORES (SINCRONIZADOS CON BACKEND) ==========
  
  const validarUsuario = (valor) => {
    if (!valor) return 'Usuario requerido'
    if (valor.length < 3) return 'Mínimo 3 caracteres'
    if (valor.length > 20) return 'Máximo 20 caracteres'
    if (!/^[a-zA-Z0-9_]+$/.test(valor)) return 'Solo letras, números y guión bajo'
    return ''
  }

  const validarNombre = (valor) => {
    if (!valor) return 'Nombre requerido'
    if (valor.length < 2) return 'Mínimo 2 caracteres'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) return 'Solo letras y espacios'
    return ''
  }

  const validarApellidos = (valor) => {
    if (!valor) return 'Apellidos requeridos'
    if (valor.length < 2) return 'Mínimo 2 caracteres'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) return 'Solo letras y espacios'
    return ''
  }

  const validarEmail = (valor) => {
    if (!valor) return 'Email requerido'
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(valor)) return 'Email inválido'
    return ''
  }

  const validarTelefono = (valor) => {
    if (!valor) return 'Teléfono requerido'
    const soloNumeros = valor.replace(/\D/g, '')
    if (soloNumeros.length !== 10) return 'Debe tener 10 dígitos'
    return ''
  }

  const calcularFuerzaContrasena = (valor) => {
    if (!valor) return { nivel: 0, texto: '', color: '' }
    
    let fuerza = 0
    
    // Criterios actualizados
    if (valor.length >= 8) fuerza++
    if (valor.length >= 12) fuerza++
    if (/[a-z]/.test(valor)) fuerza++
    if (/[A-Z]/.test(valor)) fuerza++
    if (/[0-9]/.test(valor)) fuerza++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(valor)) fuerza++ // Símbolos especiales
    
    if (fuerza <= 3) return { nivel: 1, texto: 'Débil', color: '#ef4444' }
    if (fuerza <= 5) return { nivel: 2, texto: 'Media', color: '#f59e0b' }
    return { nivel: 3, texto: 'Fuerte', color: '#10b981' }
  }

  // ✅ VALIDACIÓN SINCRONIZADA CON BACKEND
  const validarContrasena = (valor) => {
    if (!valor) return 'Contraseña requerida'
    
    // Mínimo 8 caracteres (igual que backend)
    if (valor.length < 8) return 'Mínimo 8 caracteres'
    
    // Debe incluir mayúscula
    if (!/[A-Z]/.test(valor)) return 'Debe incluir al menos una mayúscula'
    
    // Debe incluir minúscula
    if (!/[a-z]/.test(valor)) return 'Debe incluir al menos una minúscula'
    
    // Debe incluir número
    if (!/[0-9]/.test(valor)) return 'Debe incluir al menos un número'
    
    // Debe incluir símbolo especial (NUEVO - igual que backend)
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(valor)) {
      return 'Debe incluir al menos un símbolo especial (!@#$%...)'
    }
    
    return ''
  }

  const validarConfirmacion = (valor) => {
    if (!valor) return 'Confirma tu contraseña'
    if (valor !== formData.contrasena) return 'Las contraseñas no coinciden'
    return ''
  }

  // ========== VALIDAR CAMPO ==========
  
  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'usuario': return validarUsuario(valor)
      case 'nombre': return validarNombre(valor)
      case 'apellidos': return validarApellidos(valor)
      case 'email': return validarEmail(valor)
      case 'telefono': return validarTelefono(valor)
      case 'contrasena': return validarContrasena(valor)
      case 'confirmarContrasena': return validarConfirmacion(valor)
      default: return ''
    }
  }

  // ========== HANDLE CHANGE ==========
  
  const handleChange = (e) => {
    const { name, value } = e.target
    
    let valorFinal = value
    if (name === 'telefono') {
      valorFinal = value.replace(/\D/g, '').slice(0, 10)
    }
    
    setFormData({
      ...formData,
      [name]: valorFinal
    })
    
    if (tocado[name]) {
      const errorCampo = validarCampo(name, valorFinal)
      setErrores({
        ...errores,
        [name]: errorCampo
      })
    }
    
    if (name === 'contrasena') {
      setFuerzaContrasena(calcularFuerzaContrasena(valorFinal))
    }
    
    if (name === 'contrasena' && formData.confirmarContrasena && tocado.confirmarContrasena) {
      const errorConfirmacion = formData.confirmarContrasena !== valorFinal 
        ? 'Las contraseñas no coinciden' 
        : ''
      setErrores({
        ...errores,
        [name]: '',
        confirmarContrasena: errorConfirmacion
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

  // ========== VALIDAR FORMULARIO COMPLETO ==========
  
  const validarFormulario = () => {
    const nuevosErrores = {}
    
    Object.keys(formData).forEach(campo => {
      const error = validarCampo(campo, formData[campo])
      if (error) nuevosErrores[campo] = error
    })
    
    setErrores(nuevosErrores)
    setTocado({
      usuario: true,
      nombre: true,
      apellidos: true,
      email: true,
      telefono: true,
      contrasena: true,
      confirmarContrasena: true
    })
    
    return Object.keys(nuevosErrores).length === 0
  }

  // ========== HANDLE SUBMIT ==========
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validarFormulario()) {
      setError('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const { confirmarContrasena: _, ...dataToSend } = formData
      
      const response = await axios.post('http://127.0.0.1:8000/api/auth/registro', dataToSend)
      
      localStorage.setItem('usuario', JSON.stringify(response.data))
      
      alert('¡Registro exitoso! Configura tus métodos de verificación')
      navigate('/verificaciones')
      
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Error al registrar usuario. Intenta de nuevo.')
      }
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ========== DETERMINAR CLASE DE INPUT ==========
  
  const getInputClass = (campo) => {
    if (!tocado[campo]) return ''
    return errores[campo] ? 'input-error' : 'input-valido'
  }

  // ========== VERIFICAR SI FORMULARIO ES VÁLIDO ==========
  
  const formularioValido = Object.keys(formData).every(campo => {
    return formData[campo] && !validarCampo(campo, formData[campo])
  })

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h1>Crear Cuenta</h1>
        <p className="subtitle">Completa el formulario para registrarte</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Usuario *</label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nombre de usuario"
                className={getInputClass('usuario')}
                required
              />
              {tocado.usuario && errores.usuario && (
                <span className="error-text">{errores.usuario}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tu nombre"
                className={getInputClass('nombre')}
                required
              />
              {tocado.nombre && errores.nombre && (
                <span className="error-text">{errores.nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tus apellidos"
                className={getInputClass('apellidos')}
                required
              />
              {tocado.apellidos && errores.apellidos && (
                <span className="error-text">{errores.apellidos}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="tu@email.com"
              className={getInputClass('email')}
              required
            />
            {tocado.email && errores.email && (
              <span className="error-text">{errores.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="5512345678"
              className={getInputClass('telefono')}
              required
            />
            {tocado.telefono && errores.telefono && (
              <span className="error-text">{errores.telefono}</span>
            )}
            {formData.telefono && !errores.telefono && tocado.telefono && (
              <span className="info-text">✓ Formato válido</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mínimo 8 caracteres con símbolos"
                className={getInputClass('contrasena')}
                required
              />
              {tocado.contrasena && errores.contrasena && (
                <span className="error-text">{errores.contrasena}</span>
              )}
              
              {/* Requisitos de contraseña */}
              {tocado.contrasena && (
                <div className="password-requirements">
                  <small style={{ color: formData.contrasena.length >= 8 ? '#10b981' : '#6b7280' }}>
                    {formData.contrasena.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                  </small>
                  <small style={{ color: /[A-Z]/.test(formData.contrasena) ? '#10b981' : '#6b7280' }}>
                    {/[A-Z]/.test(formData.contrasena) ? '✓' : '○'} Una mayúscula
                  </small>
                  <small style={{ color: /[a-z]/.test(formData.contrasena) ? '#10b981' : '#6b7280' }}>
                    {/[a-z]/.test(formData.contrasena) ? '✓' : '○'} Una minúscula
                  </small>
                  <small style={{ color: /[0-9]/.test(formData.contrasena) ? '#10b981' : '#6b7280' }}>
                    {/[0-9]/.test(formData.contrasena) ? '✓' : '○'} Un número
                  </small>
                  <small style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(formData.contrasena) ? '#10b981' : '#6b7280' }}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(formData.contrasena) ? '✓' : '○'} Un símbolo (!@#$...)
                  </small>
                </div>
              )}
              
              {formData.contrasena && !errores.contrasena && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${(fuerzaContrasena.nivel / 3) * 100}%`,
                        backgroundColor: fuerzaContrasena.color
                      }}
                    />
                  </div>
                  <span style={{ color: fuerzaContrasena.color, fontSize: '12px' }}>
                    {fuerzaContrasena.texto}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Repite tu contraseña"
                className={getInputClass('confirmarContrasena')}
                required
              />
              {tocado.confirmarContrasena && errores.confirmarContrasena && (
                <span className="error-text">{errores.confirmarContrasena}</span>
              )}
              {formData.confirmarContrasena && !errores.confirmarContrasena && tocado.confirmarContrasena && (
                <span className="info-text">✓ Las contraseñas coinciden</span>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading || !formularioValido}
            style={{ opacity: (!formularioValido && !loading) ? 0.6 : 1 }}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="footer-links">
          <p>¿Ya tienes cuenta? <span onClick={() => navigate('/login')} className="link">Inicia sesión</span></p>
          <p><span onClick={() => navigate('/')} className="link">← Volver al inicio</span></p>
        </div>
      </div>
    </div>
  )
}

export default Registro