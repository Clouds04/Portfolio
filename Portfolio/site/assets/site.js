// Données du candidat : à modifier ici, elles s'appliquent à tout le site.
const SITE = {
  nom: 'Dicko Daouda Mahama',
  court: 'D. Mahama',
  email: 'dickodaouda2004@gmail.com',            // ex. 'prenom.nom@mail.com'
  linkedin: 'https://www.linkedin.com/in/daouda-mahama-dicko-',         // ex. 'https://www.linkedin.com/in/...'
  github: '',           // ex. 'https://github.com/...'
  cv: 'assets/docs/CV_Dicko_Daouda_Mahama.pdf',
};

const PAGES = [
  ['index.html', 'Accueil'],
  ['e5.html', 'E5'],
  ['e6.html', 'E6'],
  ['projets.html', 'Projets'],
  ['veille.html', 'Veille'],
  ['certifications.html', 'Certifications'],
];

(function () {
  const current = location.pathname.split('/').pop() || 'index.html';

  const links = PAGES.map(([href, label]) => {
    const on = href === current;
    return `<a href="${href}" class="px-3 py-2 rounded-lg text-sm font-medium ${on ? 'text-blue-700 bg-blue-100' : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'}">${label}</a>`;
  }).join('');

  document.getElementById('site-header').innerHTML = `
  <header id="hdr" class="sticky top-0 z-40 bg-white/75 backdrop-blur border-b border-blue-100">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="index.html" class="font-extrabold text-slate-900 tracking-tight">${SITE.court}<span class="text-blue-600"> · SISR</span></a>
      <nav class="hidden md:flex items-center gap-1" aria-label="Navigation principale">${links}</nav>
      <button id="menu-btn" class="md:hidden p-2 rounded-lg text-slate-700 hover:bg-blue-50" aria-label="Menu" aria-expanded="false">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
    <nav id="mobile-nav" class="hidden md:hidden border-t border-blue-100 px-4 py-3 flex flex-col">${links}</nav>
  </header>`;

  document.getElementById('site-footer').innerHTML = `
  <footer class="border-t border-blue-100 mt-24">
    <div class="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-4 justify-between text-sm text-slate-500">
      <p>© 2027 ${SITE.nom} — Portfolio BTS SIO option SISR · Ingétis</p>
      <p class="flex gap-4">
        ${SITE.email ? `<a class="hover:text-blue-700" href="mailto:${SITE.email}">Email</a>` : ''}
        ${SITE.linkedin ? `<a class="hover:text-blue-700" href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
        ${SITE.github ? `<a class="hover:text-blue-700" href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>` : ''}
        <a class="hover:text-blue-700" href="#top">Haut de page ↑</a>
      </p>
    </div>
  </footer>`;

  const btn = document.getElementById('menu-btn');
  const mnav = document.getElementById('mobile-nav');
  btn.addEventListener('click', () => {
    const open = mnav.classList.toggle('hidden') === false;
    btn.setAttribute('aria-expanded', open);
  });

  // Défilement fluide au clic sur une ancre (sans toucher au défilement à la molette)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (id === 'top') scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + id);
  });

  // Ombre du bandeau au défilement
  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Apparition en cascade des grilles
  document.querySelectorAll('.stagger').forEach(g => [...g.children].forEach((c, i) => {
    c.classList.add('reveal'); c.style.transitionDelay = (i * 90) + 'ms';
  }));

  // Apparition douce
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => rv.observe(el));

  // Images manquantes -> emplacement visuel
  document.querySelectorAll('img[data-ph]').forEach(img => {
    const swap = () => {
      const d = document.createElement('div');
      d.className = 'ph ' + (img.dataset.cls || '');
      d.innerHTML = `<span>🖼️ ${img.alt}<br><code class="text-slate-500">${img.getAttribute('src')}</code></span>`;
      img.replaceWith(d);
    };
    img.addEventListener('error', swap);
    if (img.complete && !img.naturalWidth) swap();
  });

  // Liens de téléchargement dont le fichier n'existe pas encore
  document.querySelectorAll('a[data-dl]').forEach(a => {
    fetch(a.getAttribute('href'), { method: 'HEAD' }).then(r => { if (!r.ok) throw 0; }).catch(() => {
      if (location.protocol === 'file:') return; // HEAD impossible en local
      a.classList.add('opacity-60');
      a.title = 'Fichier à déposer dans ' + a.getAttribute('href');
    });
  });
})();
