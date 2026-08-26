// Lightweight tokenizer/highlighter for a JS object-literal snippet.
// Returns HTML with span classes; safe because input is a fixed local constant, not user data.
export function highlightSnippet(text) {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // strings first, so later regexes don't reach inside them
  html = html.replace(/"([^"]*)"/g, '<span class="tok-string">"$1"</span>');
  // keywords
  html = html.replace(/\b(const)\b/g, '<span class="tok-keyword">$1</span>');
  // object keys (identifier immediately followed by a colon)
  html = html.replace(/([a-zA-Z_$][\w$]*)(?=:)/g, '<span class="tok-key">$1</span>');
  // bare numbers (not inside strings, already wrapped)
  html = html.replace(/\b(\d+)\b(?![^<]*<\/span>)/g, '<span class="tok-number">$1</span>');
  // punctuation
  html = html.replace(/([{}[\]:,])/g, '<span class="tok-punct">$1</span>');

  return html;
}
