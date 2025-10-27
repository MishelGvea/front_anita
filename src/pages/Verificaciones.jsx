import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Verificaciones.css'

function Verificaciones() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [metodoActual, setMetodoActual] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const API_URL = 'http://127.0.0.1:8000'

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario')
    if (!usuarioData) {
      navigate('/login')
      return
    }
    setUsuario(JSON.parse(usuarioData))
  }, [navigate])

  // ====== 📧 FUNCIONES DE VERIFICACIÓN POR EMAIL ======
  const enviarCodigoEmail = async () => {
    setError('')
    setMensaje('')
    setEnviando(true)
    
    try {
      const response = await axios.post(`${API_URL}/api/verificacion/enviar-codigo-email`, {
        usuario_id: usuario.id
      })
      setMensaje(response.data.mensaje)
      setMetodoActual('email')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar código')
    } finally {
      setEnviando(false)
    }
  }

  const verificarCodigoEmail = async () => {
    if (codigo.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }

    setError('')
    setMensaje('')
    
    try {
      await axios.post(`${API_URL}/api/verificacion/verificar-codigo-email`, {
        usuario_id: usuario.id,
        codigo: codigo
      })
      
      alert('Email verificado exitosamente ✅')
      const usuarioActualizado = { ...usuario, email_verificado: true }
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
      setUsuario(usuarioActualizado)
      setMetodoActual(null)
      setCodigo('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al verificar código')
    }
  }

  // ====== 📱 FUNCIONES DE VERIFICACIÓN POR SMS ======
  const enviarCodigoSMS = async () => {
    setError('')
    setMensaje('')
    setEnviando(true)
    
    try {
      const response = await axios.post(`${API_URL}/api/verificacion/enviar-codigo-sms`, {
        usuario_id: usuario.id
      })
      setMensaje(response.data.mensaje)
      setMetodoActual('sms')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar código por SMS')
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
      await axios.post(`${API_URL}/api/verificacion/verificar-codigo-sms`, {
        usuario_id: usuario.id,
        codigo: codigo
      })
      
      alert('Teléfono verificado exitosamente ✅')
      const usuarioActualizado = { ...usuario, telefono_verificado: true }
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
      setUsuario(usuarioActualizado)
      setMetodoActual(null)
      setCodigo('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al verificar código')
    }
  }

  // ====== 🔐 MÉTODO TOTP ======
  const usarTOTP = () => {
    if (usuario.totp_habilitado) {
      // Si ya tiene activado el TOTP → simplemente navegar al login o verificación
      alert('Abre tu app de autenticación y usa el código al iniciar sesión.')
      navigate('/login')
    } else {      
      // Si no tiene configurado → ir a configurar
      navigate('/configurar-totp')
    }
  }

  const cerrarModal = () => {
    setMetodoActual(null)
    setCodigo('')
    setError('')
    setMensaje('')
  }

  if (!usuario) return <div>Cargando...</div>

  return (
    <div className="verificaciones-container">
      <div className="verificaciones-card">
        <h1>Métodos de Verificación</h1>
        <p className="subtitle">Selecciona o configura tus métodos de autenticación multifactor</p>

        <div className="metodos-grid">
          {/* 📧 CÓDIGO A GMAIL */}
          <div className="metodo-card">
            <div className="metodo-icon">📧</div>
            <h3>Código a Gmail</h3>
            <p>Verificación por correo electrónico</p>
            <span className="badge multifactor">Multifactor</span>
            {usuario.email_verificado ? (
              <button className="btn-metodo" onClick={() => alert('Tu email ya está verificado ✅')}>
                ✓ Verificado
              </button>
            ) : (
              <button 
                className="btn-metodo" 
                onClick={enviarCodigoEmail}
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Verificar ahora'}
              </button>
            )}
          </div>

          {/* 📱 CÓDIGO POR SMS */}
          <div className="metodo-card">
            <div className="metodo-icon">📱</div>
            <h3>Código a Teléfono</h3>
            <p>Verificación por SMS</p>
            <span className="badge multifactor">Multifactor</span>
            {usuario.telefono_verificado ? (
              <button className="btn-metodo" onClick={() => alert('Tu teléfono ya está verificado ✅')}>
                ✓ Verificado
              </button>
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

          {/* 🔐 APP AUTENTICADORA */}
          <div className="metodo-card">
            <div className="metodo-icon">🔐</div>
            <h3>App Autenticadora</h3>
            <p>Google Authenticator, Authy, Microsoft Authenticator, etc.</p>
            <span className="badge intermedio">Intermedio</span>
            <button 
              className="btn-metodo"
              onClick={usarTOTP}
            >
              {usuario.totp_habilitado ? 'Usar App Autenticadora' : 'Configurar App'}
            </button>
          </div>

          {/* ❓ PREGUNTA DE SEGURIDAD */}
          <div className="metodo-card">
            <div className="metodo-icon">❓</div>
            <h3>Pregunta de Seguridad</h3>
            <p>Responde una pregunta personal</p>
            <span className="badge intermedio">Intermedio</span>
            <button className="btn-metodo" disabled>Próximamente</button>
          </div>
        </div>

        {mensaje && <div className="mensaje-exito">{mensaje}</div>}
        {error && !metodoActual && <div className="mensaje-error">{error}</div>}

        <button onClick={() => navigate('/dashboard')} className="btn-continuar">
          Ir al Dashboard
        </button>
      </div>

      {/* 📦 MODAL EMAIL */}
      {metodoActual === 'email' && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Verificar Email</h2>
            <p>Revisa tu correo <strong>{usuario.email}</strong></p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Ingresa el código de 6 dígitos que te enviamos
            </p>
            
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
              <button onClick={verificarCodigoEmail} className="btn-verificar">
                Verificar Código
              </button>
              <button onClick={cerrarModal} className="btn-cancelar">
                Cancelar
              </button>
            </div>
            
            <p className="reenviar-texto">
              ¿No recibiste el código? 
              <span onClick={enviarCodigoEmail} className="link-reenviar"> Reenviar</span>
            </p>
          </div>
        </div>
      )}

      {/* 📦 MODAL SMS */}
      {metodoActual === 'sms' && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Verificar Teléfono</h2>
            <p>Revisa tu teléfono <strong>{usuario.telefono}</strong></p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Ingresa el código de 6 dígitos que te enviamos por SMS
            </p>
            
            <div className="info-sms">
              <p className="info-sms-text">
                📱 El código puede tardar unos segundos en llegar
              </p>
            </div>
            
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