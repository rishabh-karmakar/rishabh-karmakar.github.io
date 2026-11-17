/* Arrow-key handling shared by every tab strip on the page. */
export function tabKeys(e, index, count, select) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const next = (index + step + count) % count;
  select(next);
  e.currentTarget.parentElement.children[next]?.focus();
}
