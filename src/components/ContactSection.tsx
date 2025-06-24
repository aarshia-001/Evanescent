import React from 'react';
import './ContactSection.css';

const ContactSection: React.FC = () => {
  return (
    <section className="contact-section">
      <div className="contact-content">
        <h2 className="contact-title">@evanescent</h2>
        <p className="contact-submitted">Submitted by: <span>aarshia</span></p>
      </div>
    </section>
  );
};

export default ContactSection;
