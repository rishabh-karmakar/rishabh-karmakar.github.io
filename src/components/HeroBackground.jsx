import './HeroBackground.css';

export default function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="hero-bg-glow hero-bg-glow-a" />
      <div className="hero-bg-glow hero-bg-glow-b" />
      <div className="hero-bg-sweep" />
      <svg className="hero-bg-radar" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="80" className="radar-ring" />
        <circle cx="200" cy="200" r="150" className="radar-ring" />
        <circle cx="200" cy="200" r="220" className="radar-ring" />
      </svg>
    </div>
  );
}
