import { useState } from 'react'

import './App.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Navbar from './layout/Navbar'
import Home from './pages/Home'
import { BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import AddUser from './users/AddUser'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route exact path='/adduser' element={<AddUser />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
