import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './ConfigurarPregunta.css'

function ConfigurarPregunta() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [pregunta, setPregunta] = useState('')
  const [preguntaPersonalizada, setPreguntaPersonalizada] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [confirmarRespuesta, setConfirmarRespuesta] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  
  // Estados de validación
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})

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

  // ========== VALIDADORES ==========
  
  const validarPregunta = (valor) => {
    if (!valor || valor === 'personalizada') return 'Debes seleccionar o escribir una pregunta'
    if (valor.length < 10) return 'La pregunta debe tener al menos 10 caracteres'
    if (!/\?$/.test(valor)) return 'La pregunta debe terminar con ?'
    return ''
  }

  const validarPreguntaPersonalizada = (valor) => {
    if (!valor.trim()) return 'Escribe tu pregunta personalizada'
    if (valor.length < 10) return 'La pregunta debe tener al menos 10 caracteres'
    if (!/\?$/.test(valor)) return 'La pregunta debe terminar con ?'
    return ''
  }

  const validarRespuesta = (valor) => {
    if (!valor.trim()) return 'Respuesta requerida'
    if (valor.trim().length < 3) return 'La respuesta debe tener al menos 3 caracteres'
    if (valor.trim().length > 50) return 'La respuesta es muy larga (máximo 50 caracteres)'
    if (/^\d+$/.test(valor)) return 'La respuesta no puede ser solo números'
    return ''
  }

  const validarConfirmacion = (valor) => {
    if (!valor.trim()) return 'Confirma tu respuesta'
    if (valor !== respuesta) return 'Las respuestas no coinciden'
    return ''
  }

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'pregunta': return validarPregunta(valor)
      case 'preguntaPersonalizada': return validarPreguntaPersonalizada(valor)
      case 'respuesta': return validarRespuesta(valor)
      case 'confirmarRespuesta': return validarConfirmacion(valor)
      default: return ''
    }
  }

  // ========== HANDLE CHANGES ==========
  
  const handlePreguntaChange = (e) => {
    const valor = e.target.value
    setPregunta(valor)
    
    if (valor !== 'personalizada') {
      setPreguntaPersonalizada('')
    }
    
    if (tocado.pregunta) {
      const errorCampo = validarCampo('pregunta', valor)
      setErrores({
        ...errores,
        pregunta: errorCampo
      })
    }
    
    setError('')
  }

  const handlePreguntaPersonalizadaChange = (e) => {
    const valor = e.target.value
    setPreguntaPersonalizada(valor)
    
    if (tocado.preguntaPersonalizada) {
      const errorCampo = validarCampo('preguntaPersonalizada', valor)
      setErrores({
        ...errores,
        preguntaPersonalizada: errorCampo
      })
    }
    
    setError('')
  }

  const handleRespuestaChange = (e) => {
    const valor = e.target.value
    setRespuesta(valor)
    
    if (tocado.respuesta) {
      const errorCampo = validarCampo('respuesta', valor)
      setErrores({
        ...errores,
        respuesta: errorCampo
      })
    }
    
    // Revalidar confirmación si ya tiene valor
    if (confirmarRespuesta && tocado.confirmarRespuesta) {
      const errorConfirmacion = confirmarRespuesta !== valor 
        ? 'Las respuestas no coinciden' 
        : ''
      setErrores({
        ...errores,
        respuesta: validarCampo('respuesta', valor),
        confirmarRespuesta: errorConfirmacion
      })
    }
    
    setError('')
  }

  const handleConfirmarRespuestaChange = (e) => {
    const valor = e.target.value
    setConfirmarRespuesta(valor)
    
    if (tocado.confirmarRespuesta) {
      const errorCampo = validarCampo('confirmarRespuesta', valor)
      setErrores({
        ...errores,
        confirmarRespuesta: errorCampo
      })
    }
    
    setError('')
  }

  // ========== HANDLE BLUR ==========
  
  const handleBlur = (campo) => {
    setTocado({
      ...tocado,
      [campo]: true
    })
    
    let valor
    switch (campo) {
      case 'pregunta': valor = pregunta; break
      case 'preguntaPersonalizada': valor = preguntaPersonalizada; break
      case 'respuesta': valor = respuesta; break
      case 'confirmarRespuesta': valor = confirmarRespuesta; break
      default: valor = ''
    }
    
    const errorCampo = validarCampo(campo, valor)
    setErrores({
      ...errores,
      [campo]: errorCampo
    })
  }

  // ========== VALIDAR FORMULARIO ==========
  
  const validarFormulario = () => {
    const nuevosErrores = {}
    
    const preguntaFinal = pregunta === 'personalizada' ? preguntaPersonalizada : pregunta
    
    if (!preguntaFinal || preguntaFinal === 'personalizada') {
      nuevosErrores.pregunta = 'Debes seleccionar o escribir una pregunta'
    }
    
    if (pregunta === 'personalizada') {
      const errorPersonalizada = validarPreguntaPersonalizada(preguntaPersonalizada)
      if (errorPersonalizada) nuevosErrores.preguntaPersonalizada = errorPersonalizada
    }
    
    const errorRespuesta = validarRespuesta(respuesta)
    if (errorRespuesta) nuevosErrores.respuesta = errorRespuesta
    
    const errorConfirmacion = validarConfirmacion(confirmarRespuesta)
    if (errorConfirmacion) nuevosErrores.confirmarRespuesta = errorConfirmacion
    
    setErrores(nuevosErrores)
    setTocado({
      pregunta: true,
      preguntaPersonalizada: pregunta === 'personalizada',
      respuesta: true,
      confirmarRespuesta: true
    })
    
    return Object.keys(nuevosErrores).length === 0
  }

  // ========== HANDLE SUBMIT ==========
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!validarFormulario()) {
      setError('Por favor corrige los errores en el formulario')
      return
    }

    const preguntaFinal = pregunta === 'personalizada' ? preguntaPersonalizada : pregunta

    setGuardando(true)

    try {
      await axios.post(`${API_URL}/api/verificacion/configurar-pregunta`, {
        usuario_id: usuario.id,
        pregunta: preguntaFinal,
        respuesta: respuesta
      })

      setMensaje('¡Pregunta de seguridad configurada exitosamente! ✅')
      
      const usuarioActualizado = { 
        ...usuario, 
        pregunta_seguridad: preguntaFinal 
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

  // ========== CLASES DE INPUT ==========
  
  const getInputClass = (campo) => {
    if (!tocado[campo]) return ''
    return errores[campo] ? 'input-error' : 'input-valido'
  }

  // ========== VERIFICAR SI FORMULARIO ES VÁLIDO ==========
  
  const formularioValido = () => {
    const preguntaFinal = pregunta === 'personalizada' ? preguntaPersonalizada : pregunta
    return (
      preguntaFinal && 
      preguntaFinal !== 'personalizada' &&
      respuesta.trim().length >= 3 && 
      confirmarRespuesta === respuesta &&
      !validarPregunta(preguntaFinal) &&
      !validarRespuesta(respuesta) &&
      !validarConfirmacion(confirmarRespuesta)
    )
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
            <label>Pregunta de seguridad *</label>
            <select 
              value={pregunta} 
              onChange={handlePreguntaChange}
              onBlur={() => handleBlur('pregunta')}
              className={`input-select ${getInputClass('pregunta')}`}
            >
              <option value="">-- Selecciona una pregunta --</option>
              {preguntasSugeridas.map((preg, idx) => (
                <option key={idx} value={preg}>{preg}</option>
              ))}
              <option value="personalizada">✏️ Escribir mi propia pregunta</option>
            </select>
            {tocado.pregunta && errores.pregunta && pregunta !== 'personalizada' && (
              <span className="error-text">{errores.pregunta}</span>
            )}
          </div>

          {/* Campo personalizado */}
          {pregunta === 'personalizada' && (
            <div className="form-group">
              <label>Escribe tu pregunta personalizada *</label>
              <input
                type="text"
                value={preguntaPersonalizada}
                onChange={handlePreguntaPersonalizadaChange}
                onBlur={() => handleBlur('preguntaPersonalizada')}
                placeholder="Ej: ¿Cuál es mi libro favorito?"
                className={`input-text ${getInputClass('preguntaPersonalizada')}`}
                autoFocus
              />
              {tocado.preguntaPersonalizada && errores.preguntaPersonalizada && (
                <span className="error-text">{errores.preguntaPersonalizada}</span>
              )}
              <small className="help-text">
                💡 Debe tener al menos 10 caracteres y terminar con ?
              </small>
            </div>
          )}

          {/* Respuesta */}
          <div className="form-group">
            <label>Respuesta *</label>
            <input
              type="text"
              value={respuesta}
              onChange={handleRespuestaChange}
              onBlur={() => handleBlur('respuesta')}
              placeholder="Tu respuesta secreta"
              className={`input-text ${getInputClass('respuesta')}`}
              required
            />
            {tocado.respuesta && errores.respuesta && (
              <span className="error-text">{errores.respuesta}</span>
            )}
            <small className="help-text">
              💡 Recuerda esta respuesta, la necesitarás para verificar tu identidad
            </small>
          </div>

          {/* Confirmar respuesta */}
          <div className="form-group">
            <label>Confirmar respuesta *</label>
            <input
              type="text"
              value={confirmarRespuesta}
              onChange={handleConfirmarRespuestaChange}
              onBlur={() => handleBlur('confirmarRespuesta')}
              placeholder="Escribe nuevamente tu respuesta"
              className={`input-text ${getInputClass('confirmarRespuesta')}`}
              required
            />
            {tocado.confirmarRespuesta && errores.confirmarRespuesta && (
              <span className="error-text">{errores.confirmarRespuesta}</span>
            )}
            {confirmarRespuesta && !errores.confirmarRespuesta && tocado.confirmarRespuesta && (
              <span className="success-text">✓ Las respuestas coinciden</span>
            )}
          </div>

          {error && <div className="mensaje-error">{error}</div>}
          {mensaje && <div className="mensaje-exito">{mensaje}</div>}

          <button 
            type="submit" 
            className="btn-guardar"
            disabled={guardando || !formularioValido()}
            style={{ opacity: (!formularioValido() && !guardando) ? 0.6 : 1 }}
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
            <li>La respuesta debe tener entre 3 y 50 caracteres</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ConfigurarPregunta