import { Heart } from 'lucide-react'

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <span className="brand-icon">B</span>
                    <span>BEUBlog</span>
                </div>
                <p className="footer-text">
                    Modern blog platformu — Yazılarınızı paylaşın, keşfedin ve etkileşimde bulunun.
                </p>
                <p className="footer-copyright">
                    © {new Date().getFullYear()} BEUBlog. Tüm hakları saklıdır.
                    <span className="footer-heart"> <Heart size={14} fill="currentColor" /> ile yapıldı.</span>
                </p>
            </div>
        </footer>
    )
}

export default Footer
