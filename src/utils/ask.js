// Lets any part of the page hand a question to the search console.
export const ASK_EVENT = 'ask-archive';

// usage: true asks where a skill was put to work, skipping the plain skill lists
export function askArchive(query, { usage = false } = {}) {
  window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: { q: query, usage } }));
}

// Scroll to a section, through the smooth scroller when it is running.
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -56 });
  else el.scrollIntoView();
}

// Reveal one item inside a tabbed section (a mission, a project row, a career
// waypoint) and scroll to it. The sections listen for this event.
export const OPEN_EVENT = 'open-item';

export function openItem(open) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: open }));
  const target = open.kind === 'project' ? `project-${open.id}` : open.kind === 'mission' ? 'work' : 'record';
  // after the section has re-rendered with the item showing
  setTimeout(() => scrollToSection(target), 90);
}
