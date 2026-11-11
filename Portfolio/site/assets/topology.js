// Mini topologie réseau isométrique (hero de l'accueil) : cloud, routeur, switch, serveur et PC.
(function () {
  const host = document.getElementById('topo');
  if (!host) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = (...a) => a.map(p => p.join(',')).join(' ');

  // Boîte isométrique centrée sur (cx, cy) au sol : demi-largeur w, hauteur h
  function box(cx, cy, w, h, c) {
    const d = w / 2;
    return `<polygon points="${P([cx - w, cy - h], [cx, cy + d - h], [cx, cy + d], [cx - w, cy])}" fill="${c[1]}"/>
      <polygon points="${P([cx, cy + d - h], [cx + w, cy - h], [cx + w, cy], [cx, cy + d])}" fill="${c[2]}"/>
      <polygon points="${P([cx, cy - d - h], [cx + w, cy - h], [cx, cy + d - h], [cx - w, cy - h])}" fill="${c[0]}"/>`;
  }
  const BLUE = ['#93c5fd', '#2563eb', '#1e40af'];
  const SLATE = ['#cbd5e1', '#64748b', '#334155'];
  const DARK = ['#94a3b8', '#334155', '#1e293b'];
  const label = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" class="topo-label">${t}</text>`;

  const cloud = (cx, cy) => `<g class="topo-node" style="--d:0s">
    <g fill="#fff" stroke="#60a5fa" stroke-width="2">
      <circle cx="${cx - 24}" cy="${cy + 2}" r="15"/><circle cx="${cx}" cy="${cy - 8}" r="20"/><circle cx="${cx + 25}" cy="${cy + 3}" r="14"/>
      <rect x="${cx - 24}" y="${cy + 2}" width="49" height="15" stroke="none"/>
    </g>
    <path d="M${cx - 38} ${cy + 17}h76" stroke="#60a5fa" stroke-width="2"/>
    <rect x="${cx - 23}" y="${cy + 1}" width="47" height="15" fill="#fff"/>
    ${label(cx, cy + 46, 'Internet')}</g>`;

  const router = (cx, cy) => `<g class="topo-node" style="--d:.6s">${box(cx, cy, 48, 16, BLUE)}
    <ellipse cx="${cx}" cy="${cy - 16}" rx="17" ry="8.5" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M${cx - 10} ${cy - 16}h20M${cx} ${cy - 21}v10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    ${label(cx, cy + 40, 'Routeur')}</g>`;

  const leds = (cx, cy, w, h, n) => Array.from({ length: n }, (_, i) => {
    const x = cx - w + 12 + i * ((w - 14) / (n - 1)), y = cy - h / 2 + (x - (cx - w)) / 2;
    return `<circle cx="${x}" cy="${y}" r="2.2" class="topo-led" style="--d:${(i * .3).toFixed(1)}s"/>`;
  }).join('');
  const sw = (cx, cy) => `<g class="topo-node" style="--d:1.2s">${box(cx, cy, 66, 13, SLATE)}${leds(cx, cy, 66, 13, 6)}${label(cx, cy + 44, 'Switch')}</g>`;

  const server = (cx, cy) => {
    const w = 34, h = 62, d = w / 2;
    const slots = [1, 2, 3].map(i => `<path d="M${cx - w + 5} ${cy - h + i * 15 + 3} L${cx - 5} ${cy - h + i * 15 + d - 2}" stroke="#0f172a" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>`).join('');
    return `<g class="topo-node" style="--d:1.8s">${box(cx, cy, w, h, DARK)}${slots}
      <circle cx="${cx - 9}" cy="${cy - h + 11}" r="2.2" class="topo-led"/>
      ${label(cx, cy + 36, 'Serveur AD · GLPI')}</g>`;
  };

  const pc = (cx, cy, delay) => `<g class="topo-node" style="--d:${delay}s">${box(cx, cy, 26, 5, SLATE)}
    <path d="M${cx} ${cy - 5}v-6" stroke="#475569" stroke-width="4"/>
    <polygon points="${P([cx - 28, cy - 46], [cx + 4, cy - 30], [cx + 4, cy - 8], [cx - 28, cy - 24])}" fill="#0f172a"/>
    <polygon points="${P([cx - 24, cy - 41], [cx, cy - 29], [cx, cy - 12], [cx - 24, cy - 24])}" fill="#3b82f6" opacity=".85"/>
    ${label(cx, cy + 30, 'PC')}</g>`;

  const links = [
    ['a', 'M240 62 L240 160'],
    ['b', 'M240 162 L240 262'],
    ['c', 'M240 266 L112 368'],
    ['d', 'M240 266 L240 396'],
    ['e', 'M240 266 L368 368'],
  ];
  const cables = links.map(([id, d]) => `<path id="topo-${id}" d="${d}" class="topo-cable"/>`).join('');
  const packets = reduce ? '' : links.map(([id], i) =>
    `<circle r="4" class="topo-packet" visibility="hidden"><set attributeName="visibility" to="visible" begin="${(i * .45).toFixed(2)}s"/><animateMotion dur="${2.6 + (i % 3) * .5}s" begin="${(i * .45).toFixed(2)}s" repeatCount="indefinite" ${i % 2 ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ''}><mpath href="#topo-${id}"/></animateMotion></circle>`).join('');

  host.innerHTML = `<svg viewBox="0 0 480 470" role="presentation" focusable="false" class="topo-svg ${reduce ? 'is-static' : ''}">
    <ellipse cx="240" cy="300" rx="230" ry="130" fill="#fff" opacity=".35"/>
    ${cables}${cloud(240, 56)}${router(240, 176)}${sw(240, 280)}${server(112, 388)}${pc(240, 408, 2.4)}${pc(368, 388, 3)}${packets}
  </svg>`;

  // Légère rotation 3D au survol
  if (reduce) return;
  const svg = host.firstElementChild;
  host.addEventListener('pointermove', e => {
    const r = host.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    svg.style.transform = `rotateY(${(x * 22).toFixed(1)}deg) rotateX(${(-y * 16).toFixed(1)}deg)`;
  });
  host.addEventListener('pointerleave', () => { svg.style.transform = ''; });
})();
