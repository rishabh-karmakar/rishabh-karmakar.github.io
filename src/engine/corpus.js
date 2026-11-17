import {
  abstract,
  achievements,
  caseStudies,
  domains,
  earlyInternships,
  galaxies,
  journey,
  projects,
  publications,
  scholarStats,
  skillGroups,
  spokenLanguages,
} from '../data/content';

/*
 * Everything on the site, cut into small passages. Each passage keeps a
 * source label and the section it came from, so every search hit can be cited.
 */
function build() {
  const out = [];
  // open: the tab, row or waypoint to reveal when this passage's source link is followed
  const add = (text, source, href, open = null) => out.push({ id: out.length, text, source, href, open });

  add(`${abstract.statement} ${abstract.body}`, 'About', '#about');
  abstract.points.forEach((p) => add(`${p.title}: ${p.desc}`, 'About', '#about'));

  caseStudies.forEach((c) => {
    // two short passages per mission retrieve better than one long one
    add(`${c.name}. ${c.approach} Technologies: ${c.tags.join(', ')}.`, `Mission: ${c.name}`, '#work', { kind: 'mission', id: c.id });
    add(`${c.headline} ${c.problem} ${c.result}`, `Mission: ${c.name}`, '#work', { kind: 'mission', id: c.id });
  });

  journey.forEach((j) => {
    const org = j.org.split(' · ')[0];
    j.points.forEach((pt) => add(`${j.role} at ${org}. ${pt}`, `${org}, ${j.role}`, '#record', { kind: 'waypoint', id: j.role + j.date }));
  });

  add(
    'Promoted twice in four years at Wells Fargo: joined as Program Associate in 2022, promoted to Software Engineer (AVP) in 2023 and to Senior Software Engineer (SAVP) in 2026.',
    'Wells Fargo, career progression',
    '#record',
  );

  earlyInternships.forEach((e) => add(`${e.role} at ${e.org}: ${e.note}.`, `Internship: ${e.org}`, '#record', { kind: 'internships' }));

  projects
    .filter((p) => p.id !== 'answer-eval')
    .forEach((p) => add(`${p.title}. ${p.desc} Technologies: ${p.tags.join(', ')}.`, `Project: ${p.title}`, '#archive-title', { kind: 'project', id: p.id }));

  galaxies.forEach((g) => add(`${g.label} skills: ${g.items.join(', ')}.`, `Skills: ${g.label}`, '#toolkit'));
  add(`Domains: ${domains.join(', ')}.`, 'Skills: Domains', '#toolkit');

  // the "Also worked with" tab: tools outside the core lists, and working style
  const core = new Set(galaxies.flatMap((g) => g.items.map((i) => i.toLowerCase())));
  const also = skillGroups
    .filter((g) => g.category === 'Industry Knowledge' || g.category === 'Tools & Technologies')
    .flatMap((g) => g.items)
    .filter((i) => !core.has(i.toLowerCase()));
  for (let i = 0; i < also.length; i += 12) {
    add(`Also worked with these tools and topics: ${also.slice(i, i + 12).join(', ')}.`, 'Skills: Also worked with', '#toolkit');
  }
  const soft = skillGroups.find((g) => g.category === 'Interpersonal Skills')?.items ?? [];
  if (soft.length) add(`Working style: ${soft.join(', ')}.`, 'Skills: Working style', '#toolkit');
  add(`Spoken languages: ${spokenLanguages.join(', ')}.`, 'Languages', '#toolkit');

  const certs = skillGroups.find((g) => g.category === 'Certifications')?.items ?? [];
  add(`Cloud certifications: ${certs.filter((c) => /azure|google|aws/i.test(c)).map((c) => c.trim()).join(', ')}.`, 'Certifications', '#toolkit');
  add(`Data science and programming certifications: ${certs.filter((c) => !/azure|google|aws/i.test(c)).map((c) => c.trim()).join(', ')}.`, 'Certifications', '#toolkit');

  publications.forEach((p) => add(`Peer-reviewed research paper, published: ${p.title}. ${p.venue}, ${p.year}. Cited ${p.citedBy} times.`, `Paper, ${p.year}`, '#papers'));
  add(`Published research: ${publications.length} peer-reviewed publications in machine learning, NLP, computer vision and blockchain, with ${scholarStats.citations} citations and an h-index of ${scholarStats.hIndex} on Google Scholar.`, 'Google Scholar', '#papers');

  achievements.forEach((a) => add(`${a.title}, ${a.org}, ${a.year}. ${a.desc}`, `Award: ${a.org}`, '#papers'));

  return out;
}

export const corpus = build();
