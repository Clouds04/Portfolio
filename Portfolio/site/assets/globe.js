// Globe terrestre de connexions (hero de l'accueil) : continents en points, arcs lumineux entre des villes, paquets en transit.
(function () {
  const host = document.getElementById('topo');
  if (!host) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'w-full block';
  host.appendChild(cv);
  const ctx = cv.getContext('2d');
  const RAD = Math.PI / 180;

  // Contours très simplifiés des continents [longitude, latitude]
  const LAND = [
    [[-168,66],[-140,70],[-95,72],[-80,68],[-62,58],[-55,48],[-67,44],[-76,35],[-81,25],[-90,29],[-97,26],[-97,20],[-88,16],[-83,9],[-77,8],[-86,11],[-92,15],[-105,20],[-117,32],[-124,40],[-125,49],[-140,60],[-165,60]],
    [[-77,8],[-60,10],[-50,0],[-35,-6],[-40,-22],[-48,-28],[-58,-38],[-65,-42],[-68,-52],[-74,-50],[-72,-30],[-70,-18],[-80,-5],[-80,0]],
    [[-10,36],[-9,43],[-1,46],[-5,48],[2,51],[8,54],[10,58],[5,62],[15,70],[30,71],[60,70],[80,73],[110,77],[140,72],[170,70],[180,66],[160,60],[155,50],[140,45],[130,35],[122,30],[121,22],[108,18],[105,10],[100,2],[104,1],[98,8],[93,18],[88,22],[80,15],[77,8],[72,20],[66,25],[57,25],[56,27],[50,30],[48,29],[51,25],[56,24],[59,22],[52,16],[43,13],[35,28],[34,31],[36,36],[27,37],[26,40],[23,37],[18,40],[13,38],[8,44],[3,43],[-5,36]],
    [[-17,21],[-10,30],[-5,36],[10,37],[11,33],[20,31],[32,31],[35,28],[43,12],[51,12],[41,-2],[40,-15],[35,-24],[32,-29],[20,-35],[18,-33],[12,-17],[13,-6],[9,4],[-8,4],[-13,8],[-17,15]],
    [[114,-22],[122,-18],[131,-12],[142,-11],[146,-19],[153,-26],[150,-37],[140,-38],[130,-32],[115,-34]],
    [[-55,60],[-45,60],[-20,70],[-20,82],[-60,82],[-70,76]],
    [[-5,50],[2,51],[0,58],[-6,58]],
    [[130,32],[134,34],[141,36],[142,44],[140,41],[136,36]],
  ];
  const inside = (lon, lat, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const vec = (lat, lon, r = 1) => [r * Math.cos(lat * RAD) * Math.sin(lon * RAD), r * Math.sin(lat * RAD), r * Math.cos(lat * RAD) * Math.cos(lon * RAD)];

  // Points de terre répartis régulièrement (spirale de Fibonacci)
  const dots = [];
  const M = 7000, ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < M; i++) {
    const y = 1 - (i + .5) * 2 / M, r = Math.sqrt(1 - y * y), th = i * ga;
    const lat = Math.asin(y) / RAD, lon = Math.atan2(r * Math.sin(th), r * Math.cos(th)) / RAD;
    if (LAND.some(p => inside(lon, lat, p))) dots.push(vec(lat, lon));
  }

  // Villes et liaisons
  const CITY = {
    Paris: [48.85, 2.35], Bamako: [12.64, -8.0], 'New York': [40.7, -74], 'São Paulo': [-23.5, -46.6],
    Tokyo: [35.7, 139.7], Sydney: [-33.9, 151.2], 'Le Cap': [-33.9, 18.4], Dubaï: [25.2, 55.3],
  };
  const LINKS = [['Paris', 'Bamako'], ['Paris', 'New York'], ['Paris', 'Dubaï'], ['Paris', 'Tokyo'], ['Bamako', 'São Paulo'], ['Bamako', 'Le Cap'], ['New York', 'São Paulo'], ['Dubaï', 'Sydney'], ['Tokyo', 'Sydney'], ['Le Cap', 'Dubaï']];
  const cities = Object.entries(CITY).map(([name, [la, lo]]) => ({ name, v: vec(la, lo) }));
  const arcs = LINKS.map(([a, b]) => {
    const A = vec(...CITY[a]), B = vec(...CITY[b]);
    const w = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
    const pts = Array.from({ length: 40 }, (_, k) => {
      const t = k / 39, s = Math.sin(w), p = [0, 1, 2].map(i => (Math.sin((1 - t) * w) * A[i] + Math.sin(t * w) * B[i]) / s);
      return p.map(c => c * (1 + .28 * Math.sin(Math.PI * t) * Math.min(1, w / 1.2)));
    });
    return { pts, t: Math.random(), v: .004 + Math.random() * .004 };
  });

  let W = 0, rot = .05, tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, visible = true, tick = 0;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = host.clientWidth;
    cv.width = W * dpr; cv.height = W * dpr; cv.style.height = W + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    tick++; cx += (tx - cx) * .06; cy += (ty - cy) * .06;
    if (!reduce) rot += .0022;
    const a = rot + cx * .5, b = .55 + cy * .3;
    const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    const R = W * .38, C = W / 2;
    const P = v => { // rotation puis projection : [x, y, z]
      const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca;
      return [C + x1 * R, C - (v[1] * cb - z1 * sb) * R, v[1] * sb + z1 * cb, x1, v[1] * cb - z1 * sb];
    };
    ctx.clearRect(0, 0, W, W);

    // Halo et corps de la sphère
    const halo = ctx.createRadialGradient(C, C, R * .9, C, C, R * 1.18);
    halo.addColorStop(0, 'rgba(56,189,248,.45)'); halo.addColorStop(.5, 'rgba(37,99,235,.15)'); halo.addColorStop(1, 'rgba(37,99,235,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(C, C, R * 1.18, 0, 7); ctx.fill();
    const body = ctx.createRadialGradient(C - R * .35, C - R * .4, R * .1, C, C, R);
    body.addColorStop(0, '#1e40af'); body.addColorStop(.6, '#0f2a6b'); body.addColorStop(1, '#071a45');
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(C, C, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(125,211,252,.55)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Quadrillage filaire (face visible)
    ctx.lineWidth = .7; ctx.strokeStyle = 'rgba(147,197,253,.2)';
    const line = pts => {
      ctx.beginPath(); let pen = false;
      pts.forEach(v => { const p = P(v); if (p[2] > 0) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; });
      ctx.stroke();
    };
    for (let lat = -60; lat <= 60; lat += 30) line(Array.from({ length: 73 }, (_, i) => vec(lat, i * 5)));
    for (let lon = 0; lon < 360; lon += 30) line(Array.from({ length: 37 }, (_, i) => vec(-90 + i * 5, lon)));

    // Continents en points
    dots.forEach(v => {
      const p = P(v);
      if (p[2] < 0) { ctx.fillStyle = 'rgba(56,189,248,.06)'; ctx.fillRect(p[0], p[1], 1, 1); return; }
      ctx.fillStyle = `rgba(103,232,249,${(.45 + .55 * p[2]).toFixed(2)})`;
      const s = 1.2 + p[2] * 1; ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
    });

    // Arcs lumineux et paquets
    const hidden = (p, v) => p[2] < 0 && (p[3] * p[3] + p[4] * p[4]) < 1;
    arcs.forEach(arc => {
      ctx.strokeStyle = 'rgba(251,146,60,.75)'; ctx.lineWidth = 1.3; ctx.beginPath(); let pen = false;
      arc.pts.forEach(v => { const p = P(v); if (hidden(p)) { pen = false; return; } pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; });
      ctx.stroke();
      if (reduce) return;
      arc.t = (arc.t + arc.v) % 1;
      const p = P(arc.pts[Math.min(39, arc.t * 40 | 0)]);
      if (hidden(p)) return;
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 8);
      g.addColorStop(0, 'rgba(254,243,199,1)'); g.addColorStop(.4, 'rgba(251,191,36,.8)'); g.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, 7); ctx.fill();
    });

    // Villes
    cities.forEach(c => {
      const p = P(c.v); if (p[2] < .02) return;
      const pulse = reduce ? 0 : (((tick * .02 + c.v[0] * 3) % 1) + 1) % 1;
      ctx.strokeStyle = `rgba(253,186,116,${(.6 * (1 - pulse)).toFixed(2)})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p[0], p[1], 3 + pulse * 9, 0, 7); ctx.stroke();
      ctx.fillStyle = '#fdba74'; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill();
    });

    if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame); else raf = 0;
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

  resize(); frame();
  addEventListener('resize', () => { resize(); if (reduce) frame(); });
  if (reduce) return;

  // Le globe s'incline vers la souris
  addEventListener('pointermove', e => {
    const r = host.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / innerWidth * 2));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / innerHeight * 2));
  }, { passive: true });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener('visibilitychange', start);
})();
