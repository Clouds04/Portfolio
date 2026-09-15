/* ============================================================
   script.js — Animations et comportements du portfolio
   ============================================================ */


/* ── 1. ANIMATION AU SCROLL ───────────────────────────────── */
/*
   Tous les éléments avec la classe "cacher" sont invisibles
   au départ. Quand on défile et qu'ils apparaissent à l'écran,
   on leur ajoute la classe "montrer" pour les afficher.
*/

var elementsCaches = document.querySelectorAll('.cacher');

var observateur = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('montrer');
    }
  });
}, { threshold: 0.1 });

elementsCaches.forEach(function(el) {
  observateur.observe(el);
});


/* ── 2. ANIMATION DES BARRES DE COMPÉTENCES ───────────────── */
/*
   Les barres ont un attribut data-largeur (ex: "80%").
   Quand la barre est visible, on applique cette largeur
   pour déclencher l'animation CSS de remplissage.
*/

var barres = document.querySelectorAll('.barre-remplie[data-largeur]');

var observateurBarres = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.largeur;
      observateurBarres.unobserve(entry.target); /* on arrête d'observer */
    }
  });
}, { threshold: 0.5 });

barres.forEach(function(barre) {
  observateurBarres.observe(barre);
});


/* ── 3. LIEN ACTIF DANS LA NAVIGATION ────────────────────── */
/*
   On récupère le nom du fichier HTML actuel (ex: "parcours.html")
   et on ajoute la classe "active" sur le lien correspondant.
*/

var pageCourante = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('nav a, .mobile-nav a').forEach(function(lien) {
  if (lien.getAttribute('href') === pageCourante) {
    lien.classList.add('active');
  }
});


/* ── 4. MENU HAMBURGER (mobile) ────────────────────────────── */
/*
   Sur mobile, le bouton "☰" ouvre le menu plein écran.
   Le bouton "✕" ou un clic sur un lien le ferme.
*/

var boutonOuvrir = document.getElementById('menuBtn');
var menuMobile   = document.getElementById('mobileNav');
var boutonFermer = document.getElementById('fermerMenu');

if (boutonOuvrir) {
  boutonOuvrir.addEventListener('click', function() {
    menuMobile.classList.add('ouvert');
  });
}

if (boutonFermer) {
  boutonFermer.addEventListener('click', function() {
    menuMobile.classList.remove('ouvert');
  });
}

if (menuMobile) {
  menuMobile.querySelectorAll('a').forEach(function(lien) {
    lien.addEventListener('click', function() {
      menuMobile.classList.remove('ouvert');
    });
  });
}
