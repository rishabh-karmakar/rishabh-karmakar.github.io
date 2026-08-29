import { useState } from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/content';
import './Contact.css';

const FORM_ENDPOINT = 'https://formspree.io/f/xgaewonq';

export default function Contact() {
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    const form = e.target;
    const data = new FormData(form);

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section contact">
      <div className="section-inner">
        <span className="eyebrow">07 &mdash; contact</span>
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
              {profile.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, '')}`}>
                  {p}
                </a>
              ))}
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
                <input type="text" name="name" required placeholder="Your name" />
              </label>
              <label>
                <span>email</span>
                <input type="email" name="email" required placeholder="you@domain.com" />
              </label>
            </div>
            <label>
              <span>subject</span>
              <input type="text" name="subject" required placeholder="What's this about?" />
            </label>
            <label>
              <span>message</span>
              <textarea rows="5" name="message" required placeholder="Tell me a bit about the opportunity or idea ..." />
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
              {status === 'error' && 'try again'}
            </motion.button>

            {status === 'error' && (
              <p className="form-error mono">
                Message couldn&rsquo;t be sent &mdash; email {profile.email} directly, or check the form setup.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}