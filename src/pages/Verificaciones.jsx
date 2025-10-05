import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Verificaciones.css'

function Verificaciones() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [metodoActual, setMetodoActual] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [codigoPrueba, setCodigoPrueba] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario')
    if (!usuarioData) {
      navigate('/login')
      return
    }
    setUsuario(JSON.parse(usuarioData))
  }, [navigate])

  const enviarCodigoSMS = async () => {
    setError('')
    setMensaje('')
    setEnviando(true)
    
    try {
      const response = await axios.post('http://localhost:8000/api/verificacion/enviar-codigo-sms', {
        usuario_id: usuario.id
      })
      setMensaje(response.data.mensaje)
      setCodigoPrueba(response.data.codigo_prueba) // Guardar código de prueba
      setMetodoActual('sms')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar código')
    } finally {
      setEnviando(false)
    }
  }

  const verificarCodigoSMS = async () => {
    if (codigo.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }

    setError('')
    setMensaje('')
    
    try {
      await axios.post('http://localhost:8000/api/verificacion/verificar-codigo-sms', {
        usuario_id: usuario.id,
        codigo: codigo
      })
      
      alert('Teléfono verificado exitosamente')
      
      const usuarioActualizado = { ...usuario, telefono_verificado: true }
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
      setUsuario(usuarioActualizado)
      
      setMetodoActual(null)
      setCodigo('')
      setCodigoPrueba('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al verificar código')
    }
  }

  const cerrarModal = () => {
    setMetodoActual(null)
    setCodigo('')
    setCodigoPrueba('')
    setError('')
    setMensaje('')
  }

  if (!usuario) return <div>Cargando...</div>

  return (
    <div className="verificaciones-container">
      <div className="verificaciones-card">
        <h1>Métodos de Verificación</h1>
        <p className="subtitle">Configura tus métodos de autenticación multifactor</p>

        <div className="metodos-grid">
          <div className="metodo-card">
            <div className="metodo-icon">📧</div>
            <h3>Código a Gmail</h3>
            <p>Verificación por correo electrónico</p>
            <span className="badge multifactor">Multifactor</span>
            {usuario.email_verificado ? (
              <div className="verificado">✓ Verificado</div>
            ) : (
              <button className="btn-metodo" disabled>Próximamente</button>
            )}
          </div>

          <div className="metodo-card">
            <div className="metodo-icon">📱</div>
            <h3>Código a Teléfono</h3>
            <p>Verificación por SMS</p>
            <span className="badge multifactor">Multifactor</span>
            {usuario.telefono_verificado ? (
              <div className="verificado">✓ Verificado</div>
            ) : (
              <button 
                className="btn-metodo" 
                onClick={enviarCodigoSMS}
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Verificar ahora'}
              </button>
            )}
          </div>

          <div className="metodo-card">
            <div className="metodo-icon">❓</div>
            <h3>Pregunta de Seguridad</h3>
            <p>Responde una pregunta personal</p>
            <span className="badge intermedio">Intermedio</span>
            <button className="btn-metodo" disabled>Próximamente</button>
          </div>

          <div className="metodo-card">
            <div className="metodo-icon">🔐</div>
            <h3>App Autenticadora</h3>
            <p>Google Authenticator, Authy, etc</p>
            <span className="badge intermedio">Intermedio</span>
            <button className="btn-metodo" disabled>Próximamente</button>
          </div>
        </div>

        {mensaje && <div className="mensaje-exito">{mensaje}</div>}
        {error && !metodoActual && <div className="mensaje-error">{error}</div>}

        <button onClick={() => navigate('/dashboard')} className="btn-continuar">
          Continuar al Dashboard
        </button>
      </div>

      {metodoActual === 'sms' && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Verificar Teléfono</h2>
            <p>Ingresa el código de 6 dígitos</p>
            
            {/* MOSTRAR CÓDIGO DE PRUEBA */}
            {codigoPrueba && (
              <div className="codigo-prueba-box">
                <p className="codigo-prueba-label">Código de prueba:</p>
                <p className="codigo-prueba-valor">{codigoPrueba}</p>
                <p className="codigo-prueba-nota">Este código también aparece en la consola del backend</p>
              </div>
            )}
            
            <input
              type="text"
              placeholder="000000"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="input-codigo"
              autoFocus
            />
            
            {error && <div className="mensaje-error">{error}</div>}
            
            <div className="modal-buttons">
              <button onClick={verificarCodigoSMS} className="btn-verificar">
                Verificar Código
              </button>
              <button onClick={cerrarModal} className="btn-cancelar">
                Cancelar
              </button>
            </div>
            
            <p className="reenviar-texto">
              ¿No recibiste el código? 
              <span onClick={enviarCodigoSMS} className="link-reenviar"> Reenviar</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Verificaciones