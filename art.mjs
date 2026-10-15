export function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export function pip(x, y) {
  return `
    <g class="pip" transform="translate(${x} ${y})">
      <line x1="18" y1="2" x2="18" y2="12" stroke="#333" stroke-width="2"/>
      <circle cx="18" cy="2" r="3.2" fill="#f4d35e" stroke="#333" stroke-width="1"/>
      <circle cx="18" cy="20" r="9" fill="#fff" stroke="#333" stroke-width="1.4"/>
      <circle cx="15" cy="19" r="1.3" fill="#222"/>
      <circle cx="21" cy="19" r="1.3" fill="#222"/>
      <path d="M14.5 22.5 Q18 25.5 21.5 22.5" fill="none" stroke="#333" stroke-width="1.2"/>
      <rect x="6" y="30" width="24" height="16" rx="6" fill="#4d90fe" stroke="#2d5cb8"/>
      <rect x="10" y="46" width="6" height="8" rx="2" fill="#333"/>
      <rect x="20" y="46" width="6" height="8" rx="2" fill="#333"/>
    </g>`;
}
