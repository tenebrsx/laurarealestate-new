import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import './about.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <span className="text-eyebrow">Sobre Nosotros</span>
          <h1 className="about-title">Laura Alba <br/> <span className="text-gradient">Bienes Raíces Exclusivos</span></h1>
          <p className="about-description">
            Con más de 15 años de experiencia en el mercado inmobiliario dominicano, 
            ofrecemos un servicio personalizado y discreto para clientes que buscan lo mejor.
          </p>
        </div>
      </section>

      <section className="contact-section container">
        <div className="contact-grid">
          <div className="contact-info">
            <h2 className="section-title">Ponte en Contacto</h2>
            <p className="contact-intro">
              Estamos aquí para ayudarte a encontrar tu próxima inversión o el hogar de tus sueños.
            </p>
            
            <div className="contact-methods">
              <div className="contact-method-card glass-panel">
                <Mail className="icon-gold" size={24} />
                <div className="method-details">
                  <h3>Correo Electrónico</h3>
                  <a href="mailto:info@lauraalba.com">info@lauraalba.com</a>
                </div>
              </div>

              <div className="contact-method-card glass-panel">
                <Phone className="icon-gold" size={24} />
                <div className="method-details">
                  <h3>Teléfono</h3>
                  <a href="tel:+18092997077">+1 (809) 299-7077</a>
                </div>
              </div>

              <div className="contact-method-card glass-panel">
                <MapPin className="icon-gold" size={24} />
                <div className="method-details">
                  <h3>Ubicación</h3>
                  <p>Santo Domingo, Distrito Nacional</p>
                </div>
              </div>

              <div className="contact-method-card glass-panel">
                <Clock className="icon-gold" size={24} />
                <div className="method-details">
                  <h3>Horario</h3>
                  <p>Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper glass-panel">
            <h3 className="form-title">Envíanos un Mensaje</h3>
            <form className="about-contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" placeholder="Tu nombre" required />
                </div>
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" placeholder="tu@email.com" required />
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea rows={5} placeholder="¿En qué podemos ayudarte?" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-full">Enviar Mensaje</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
