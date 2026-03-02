import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import CreatePost from './pages/CreatePost.jsx'
import EditPost from './pages/EditPost.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/giris" element={<Login />} />
                    <Route path="/kayit" element={<Register />} />
                    <Route path="/yazi-olustur" element={<CreatePost />} />
                    <Route path="/yazi-duzenle/:slug" element={<EditPost />} />
                    <Route path="/yazi/:slug" element={<PostDetail />} />
                    <Route path="/panel" element={<Dashboard />} />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
