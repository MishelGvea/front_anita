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

  // Validaciones
  if (formData.contrasena !== formData.confirmarContrasena) {
    setError('Las contraseñas no coinciden')
    return
  }

  if (formData.contrasena.length < 6) {
    setError('La contraseña debe tener al menos 6 caracteres')
    return
  }

  setLoading(true)

  try {
    const { confirmarContrasena: _, ...dataToSend } = formData
    
    const response = await axios.post('http://localhost:8000/api/auth/registro', dataToSend)
    
    console.log('Usuario registrado:', response.data)
    
    // Guardar datos del usuario en localStorage
    localStorage.setItem('usuario', JSON.stringify(response.data))
    
    alert('¡Registro exitoso! Configura tus métodos de verificación')
    
    // Redirigir a verificaciones (CAMBIAR ESTA LÍNEA)
    navigate('/verificaciones')
    
  } catch (err) {
    if (err.response && err.response.data && err.response.data.detail) {
      setError(err.response.data.detail)
    } else {
      setError('Error al registrar usuario. Intenta de nuevo.')
    }
    console.error('Error:', err)
  } finally {
    setLoading(false)
  }
}

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
                placeholder="Nombre de usuario"
                required
              />
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
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Tus apellidos"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="5512345678"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
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