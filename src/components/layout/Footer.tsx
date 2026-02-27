import Link from 'next/link';
import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <Link href="/" className="footer-logo">
                        LAURA ALBA
                    </Link>
                    <p className="footer-tagline">
                        Bienes Raíces Exclusivos. Tu puerta de entrada a los hogares más excepcionales de República Dominicana.
                    </p>
                </div>

                <div className="footer-links-grid">
                    <div className="footer-column">
                        <h4>Navegación</h4>
                        <Link href="/">Inicio</Link>
                        <Link href="/properties">Propiedades</Link>
                        <Link href="/mapa">Mapa interactivo</Link>
                        <Link href="/about">Nosotros</Link>
                    </div>

                    <div className="footer-column">
                        <h4>Contacto</h4>
                        <p className="footer-contact-item">info@lauraalba.com</p>
                        <p className="footer-contact-item">+1 (809) 299-7077</p>
                        <p className="footer-contact-item">Santo Domingo, D.N.</p>
                    </div>

                    <div className="footer-column">
                        <h4>Síguenos</h4>
                        <a href="https://www.instagram.com/lauraalba_realestate/?hl=en" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="https://do.linkedin.com/in/laura-alba-04738361" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {currentYear} Laura Alba Real Estate. Todos los derechos reservados.</p>
                    <div className="footer-legal">
                        <Link href="#">Políticas de Privacidad</Link>
                        <Link href="#">Términos de Servicio</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
