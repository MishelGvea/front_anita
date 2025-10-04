import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Bienvenida from './pages/Bienvenida'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App