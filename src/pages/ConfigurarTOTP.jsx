import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfigurarTOTP = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [paso, setPaso] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secreto, setSecreto] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [totpHabilitado, setTotpHabilitado] = useState(false);


  useEffect(() => {
    // Verificar si hay usuario logueado
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(usuarioData);
    setUsuario(user);
    verificarEstadoTOTP(user.email);
  }, [navigate]);

  // ✅ Verificar si el TOTP está activado
  const verificarEstadoTOTP = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL}/api/totp/estado/${email}`);
      setTotpHabilitado(response.data.totp_habilitado);
    } catch (err) {
      console.error('Error al verificar estado TOTP:', err);
    }
  };

  // ✅ Generar QR y secreto TOTP
  const generarQR = async () => {
    setCargando(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/totp/habilitar`, {
        email: usuario.email
      });

      setQrCode(response.data.qr_code);
      setSecreto(response.data.secreto);
      setMensaje(response.data.mensaje);
      setPaso(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al generar código QR');
    } finally {
      setCargando(false);
    }
  };

  // ✅ Verificar el código TOTP
  const verificarCodigo = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/totp/verificar`, {
        email: usuario.email,
        codigo: codigo
      });

      setMensaje(response.data.mensaje);
      setPaso(3);
      setTotpHabilitado(true);

      const usuarioActualizado = { ...usuario, totp_habilitado: true };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Código inválido');
    } finally {
      setCargando(false);
    }
  };

  // ✅ Desactivar TOTP
  const deshabilitarTOTP = async () => {
    if (!window.confirm('¿Estás seguro de desactivar la autenticación de dos factores?')) {
      return;
    }

    const codigoDesactivar = prompt('Ingresa tu código TOTP actual para confirmar:');
    if (!codigoDesactivar) return;

    setCargando(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_URL}/api/totp/deshabilitar`, {
        email: usuario.email,
        codigo: codigoDesactivar
      });

      setMensaje(response.data.mensaje);
      setTotpHabilitado(false);
      setPaso(1);
      setQrCode('');
      setSecreto('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al desactivar 2FA');
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Volver al Dashboard
        </button>
        <h1 style={styles.title}>🔐 Autenticación de Dos Factores</h1>
        <p style={styles.subtitle}>Usuario: {usuario.email}</p>
      </div>

      {/* Estado actual */}
      <div style={{ ...styles.card, ...styles.statusCard }}>
        <div style={styles.statusIndicator}>
          <span style={totpHabilitado ? styles.statusActive : styles.statusInactive}>
            {totpHabilitado ? '✓ Activo' : '○ Inactivo'}
          </span>
        </div>
        <p style={styles.statusText}>
          {totpHabilitado
            ? 'Tu cuenta está protegida con autenticación de dos factores'
            : 'Tu cuenta no tiene 2FA activado'}
        </p>
        {totpHabilitado && (
          <button onClick={deshabilitarTOTP} style={styles.disableButton} disabled={cargando}>
            {cargando ? 'Procesando...' : 'Desactivar 2FA'}
          </button>
        )}
      </div>

      {/* Configuración TOTP */}
      {!totpHabilitado && (
        <>
          {paso === 1 && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>¿Por qué activar 2FA?</h2>
              <ul style={styles.benefitsList}>
                <li>🛡️ Protección adicional contra accesos no autorizados</li>
                <li>🔒 Requiere tu teléfono además de tu contraseña</li>
                <li>📱 Compatible con Google Authenticator, Microsoft Authenticator y Authy</li>
                <li>⚡ Códigos que cambian cada 30 segundos</li>
              </ul>

              <button
                onClick={generarQR}
                disabled={cargando}
                style={styles.primaryButton}
              >
                {cargando ? 'Generando...' : 'Activar Autenticación 2FA'}
              </button>
            </div>
          )}

          {paso === 2 && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Configura tu aplicación</h2>

              <div style={styles.steps}>
                <div style={styles.step}>
                  <span style={styles.stepNumber}>1</span>
                  <p>Descarga una app de autenticación:</p>
                  <div style={styles.appButtons}>
                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                      target="_blank" rel="noopener noreferrer" style={styles.appLink}>
                      📱 Google Authenticator
                    </a>
                    <a href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
                      target="_blank" rel="noopener noreferrer" style={styles.appLink}>
                      🔷 Microsoft Authenticator
                    </a>
                  </div>
                </div>

                <div style={styles.step}>
                  <span style={styles.stepNumber}>2</span>
                  <p>Escanea este código QR con la app:</p>
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt="Código QR TOTP"
                      style={styles.qrImage}
                    />
                  )}
                </div>

                <div style={styles.step}>
                  <span style={styles.stepNumber}>3</span>
                  <p>O ingresa este código manualmente:</p>
                  <div style={styles.secretBox}>
                    <code style={styles.secretCode}>{secreto}</code>
                  </div>
                </div>

                <div style={styles.step}>
                  <span style={styles.stepNumber}>4</span>
                  <p>Ingresa el código de 6 dígitos que aparece en tu app:</p>

                  <form onSubmit={verificarCodigo} style={styles.form}>
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                      style={styles.codeInput}
                      autoFocus
                      required
                    />

                    <button
                      type="submit"
                      disabled={cargando || codigo.length !== 6}
                      style={styles.primaryButton}
                    >
                      {cargando ? 'Verificando...' : 'Verificar y Activar'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div style={styles.card}>
              <div style={styles.successContainer}>
                <span style={styles.successIcon}>✓</span>
                <h2 style={styles.successTitle}>¡Listo!</h2>
                <p style={styles.successText}>
                  La autenticación de dos factores está activada
                </p>
                <p style={styles.successSubtext}>
                  A partir de ahora necesitarás ingresar un código de tu app al iniciar sesión
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {error && <div style={styles.errorMessage}>{error}</div>}
      {mensaje && !error && paso !== 3 && <div style={styles.infoMessage}>{mensaje}</div>}
    </div>
  );
};


const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  backButton: {
    marginBottom: '20px',
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  title: {
    color: '#333',
    marginBottom: '10px',
    fontSize: '32px'
  },
  subtitle: {
    color: '#666',
    fontSize: '16px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  statusCard: {
    textAlign: 'center'
  },
  statusIndicator: {
    marginBottom: '15px'
  },
  statusActive: {
    display: 'inline-block',
    padding: '8px 20px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  statusInactive: {
    display: 'inline-block',
    padding: '8px 20px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  statusText: {
    color: '#666',
    marginBottom: '20px'
  },
  disableButton: {
    padding: '10px 24px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  cardTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '24px'
  },
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '30px'
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  step: {
    position: 'relative',
    paddingLeft: '50px'
  },
  stepNumber: {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '36px',
    height: '36px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  appButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  appLink: {
    padding: '8px 16px',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '14px'
  },
  qrImage: {
    maxWidth: '250px',
    margin: '20px auto',
    display: 'block',
    border: '2px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: 'white'
  },
  secretBox: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '6px',
    marginTop: '10px'
  },
  secretCode: {
    fontSize: '16px',
    color: '#333',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  form: {
    marginTop: '15px'
  },
  codeInput: {
    width: '100%',
    padding: '15px',
    fontSize: '28px',
    textAlign: 'center',
    border: '2px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px',
    letterSpacing: '12px',
    fontFamily: 'monospace',
    boxSizing: 'border-box'
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  successContainer: {
    textAlign: 'center',
    padding: '20px'
  },
  successIcon: {
    fontSize: '80px',
    color: '#4CAF50',
    display: 'block',
    marginBottom: '20px'
  },
  successTitle: {
    color: '#4CAF50',
    fontSize: '32px',
    marginBottom: '15px'
  },
  successText: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '10px'
  },
  successSubtext: {
    fontSize: '14px',
    color: '#666'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '500'
  },
  infoMessage: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666'
  }
};

export default ConfigurarTOTP;