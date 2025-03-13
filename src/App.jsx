import { useState } from 'react'

import './App.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Navbar from './layout/Navbar'
import Home from './pages/Home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Home />
    </>
  )
}

export default App
