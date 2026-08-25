import { useState } from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/content';
import './Contact.css';

export default function Contact() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      e.target.reset();
    }, 1400);
  };

  return (
    <section id="contact" className="section contact">
      <div className="section-inner">
        <span className="eyebrow">06 &mdash; contact</span>
        <h2 className="section-title">Let&rsquo;s build something reliable.</h2>
        <p className="section-desc">
          Open to corporate engagements, technology consulting, and collaborative research.
        </p>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-line">
              <span className="mono contact-label">email</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
            <div className="contact-line">
              <span className="mono contact-label">phone</span>
              <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
            </div>
            <div className="contact-line">
              <span className="mono contact-label">linkedin</span>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                rishabh-karmakar
              </a>
            </div>
            <div className="contact-line">
              <span className="mono contact-label">github</span>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                rishabh-karmakar
              </a>
            </div>
          </div>

          <form className="contact-form mono" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                <span>name</span>
                <input type="text" required placeholder="john_doe" />
              </label>
              <label>
                <span>email</span>
                <input type="email" required placeholder="john@example.com" />
              </label>
            </div>
            <label>
              <span>subject</span>
              <input type="text" required placeholder="collaboration inquiry" />
            </label>
            <label>
              <span>message</span>
              <textarea rows="5" required placeholder="type your message ..." />
            </label>

            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'sending'}
              whileTap={{ scale: 0.97 }}
            >
              {status === 'idle' && 'send message ->'}
              {status === 'sending' && 'sending ...'}
              {status === 'sent' && 'message sent \u2713'}
            </motion.button>
          </form>
        </div>
      </div>
    </section>
  );
}
