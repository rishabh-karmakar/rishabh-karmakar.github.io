import { renderToString } from 'react-dom/server';
import App from './App.jsx';

// Used only at build time: the page's HTML is written into index.html so that
// crawlers and link previews get real content without running JavaScript.
export const render = () => renderToString(<App />);
