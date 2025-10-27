import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './ConfigurarPregunta.css'

function ConfigurarPregunta() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [confirmarRespuesta, setConfirmarRespuesta] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const API_URL = 'http://127.0.0.1:8000'

  const preguntasSugeridas = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿En qué ciudad naciste?",
    "¿Cuál es el nombre de soltera de tu madre?",
    "¿Cuál es tu comida favorita?",
    "¿Cuál fue el nombre de tu primera escuela?",
    "¿Cuál es tu película favorita?",
    "¿Cuál es el nombre de tu mejor amigo de la infancia?",
    "¿En qué calle vivías cuando eras niño?"
  ]

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario')
    if (!usuarioData) {
      navigate('/login')
      return
    }
    setUsuario(JSON.parse(usuarioData))
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    // Validaciones
    if (!pregunta.trim()) {
      setError('Debes seleccionar o escribir una pregunta')
      return
    }

    if (respuesta.length < 3) {
      setError('La respuesta debe tener al menos 3 caracteres')
      return
    }

    if (respuesta !== confirmarRespuesta) {
      setError('Las respuestas no coinciden')
      return
    }

    setGuardando(true)

    try {
      await axios.post(`${API_URL}/api/verificacion/configurar-pregunta`, {
        usuario_id: usuario.id,
        pregunta: pregunta,
        respuesta: respuesta
      })

      setMensaje('¡Pregunta de seguridad configurada exitosamente! ✅')
      
      // Actualizar usuario en localStorage
      const usuarioActualizado = { 
        ...usuario, 
        pregunta_seguridad: pregunta 
      }
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
      
      setTimeout(() => {
        navigate('/verificaciones')
      }, 2000)

    } catch (err) {
      setError(err.response?.data?.detail || 'Error al configurar pregunta')
    } finally {
      setGuardando(false)
    }
  }

  if (!usuario) return <div>Cargando...</div>

  return (
    <div className="configurar-pregunta-container">
      <div className="configurar-pregunta-card">
        <button className="btn-volver" onClick={() => navigate('/verificaciones')}>
          ← Volver
        </button>

        <div className="header-icon">❓</div>
        <h1>Configurar Pregunta de Seguridad</h1>
        <p className="subtitle">
          Esta pregunta te ayudará a recuperar tu cuenta en caso de olvido
        </p>

        <form onSubmit={handleSubmit}>
          {/* Seleccionar o escribir pregunta */}
          <div className="form-group">
            <label>Pregunta de seguridad</label>
            <select 
              value={pregunta} 
              onChange={(e) => setPregunta(e.target.value)}
              className="input-select"
            >
              <option value="">-- Selecciona una pregunta --</option>
              {preguntasSugeridas.map((preg, idx) => (
                <option key={idx} value={preg}>{preg}</option>
              ))}
              <option value="personalizada">✏️ Escribir mi propia pregunta</option>
            </select>
          </div>

          {/* Campo personalizado si elige escribir su propia pregunta */}
          {pregunta === 'personalizada' && (
            <div className="form-group">
              <label>Escribe tu pregunta personalizada</label>
              <input
                type="text"
                placeholder="Ej: ¿Cuál es mi libro favorito?"
                onChange={(e) => setPregunta(e.target.value)}
                className="input-text"
                autoFocus
              />
            </div>
          )}

          {/* Respuesta */}
          <div className="form-group">
            <label>Respuesta</label>
            <input
              type="text"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Tu respuesta secreta"
              className="input-text"
              required
            />
            <small className="help-text">
              💡 Recuerda esta respuesta, la necesitarás para verificar tu identidad
            </small>
          </div>

          {/* Confirmar respuesta */}
          <div className="form-group">
            <label>Confirmar respuesta</label>
            <input
              type="text"
              value={confirmarRespuesta}
              onChange={(e) => setConfirmarRespuesta(e.target.value)}
              placeholder="Escribe nuevamente tu respuesta"
              className="input-text"
              required
            />
          </div>

          {error && <div className="mensaje-error">{error}</div>}
          {mensaje && <div className="mensaje-exito">{mensaje}</div>}

          <button 
            type="submit" 
            className="btn-guardar"
            disabled={guardando || !pregunta || !respuesta || !confirmarRespuesta}
          >
            {guardando ? 'Guardando...' : 'Guardar Pregunta de Seguridad'}
          </button>
        </form>

        <div className="info-box">
          <p className="info-title">📌 Importante:</p>
          <ul>
            <li>La respuesta NO distingue mayúsculas de minúsculas</li>
            <li>Guarda tu respuesta en un lugar seguro</li>
            <li>No podrás cambiarla después de configurarla</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ConfigurarPregunta