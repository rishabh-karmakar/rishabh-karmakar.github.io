import { useMemo } from 'react';
import './App.css';
import { marqueeItems, navSections } from './data/content';
import { useActiveSection } from './hooks/useActiveSection';
import { useLenis } from './hooks/useLenis';
import { useTheme } from './hooks/useTheme';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Featured from './components/Featured';
import Ask from './components/Ask';
import { Abstract, Archive, Contact, Footer, Papers, Rail, Record, Toolkit } from './components/Sections';

function App() {
  const ids = useMemo(() => ['home', 'about', ...navSections.map((s) => s.id)], []);
  const active = useActiveSection(ids);
  const [theme, toggleTheme] = useTheme();
  useLenis();

  return (
    <>
      <a href="#work" className="skip-link">Skip to work</a>
      <Nav activeSection={active} theme={theme} onToggleTheme={toggleTheme} />
      <Rail active={active} />
      <main>
        <Hero />
        <Marquee items={marqueeItems} />
        <Abstract />
        <Ask />
        <Featured />
        <Archive />
        <Record />
        <Toolkit />
        <Papers />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
