import { useMemo } from 'react';
import './App.css';
import { navSections } from './data/content';
import { useActiveSection } from './hooks/useActiveSection';
import { useTheme } from './hooks/useTheme';
import Gutter from './components/Gutter';
import Nav from './components/Nav';
import Cursor from './components/Cursor';
import Hero from './components/Hero';
import About from './components/About';
import Journey from './components/Journey';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const ids = useMemo(() => navSections.map((s) => s.id), []);
  const active = useActiveSection(ids);
  const [theme, toggleTheme] = useTheme();

  return (
    <>
      <Cursor />
      <Gutter activeSection={active} />
      <Nav activeSection={active} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Journey />
        <Skills />
        <Projects />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
