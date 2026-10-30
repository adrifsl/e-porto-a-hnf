// E-Portofolio PPG - versi publik (statis). Seluruh konten dibaca dari assets/js/data.js
const D = siteData;
const U = u => /^\s*(javascript|vbscript):/i.test(u || "") ? "" : (u || "").trim();
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ph = t => `<p class="ph">[${esc(t)}]</p>`;
const txt = (s, p) => s && s.trim() ? `<p>${esc(s).replace(/\n/g, "<br>")}</p>` : ph(p || "Tambahkan isi di sini");
const sec = (h, t) => `<section class="blk fade-up"><h3>${h}</h3>${txt(t)}</section>`;

const tile = (icon, label) => `<div class="card-media"><div class="media-tile"><span class="mt-ic">${icon}</span><span class="mt-lb">${label}</span></div></div>`;

// HP / layar sentuh: pratinjau berupa GAMBAR (ringan). Desktop: iframe hidup yang dimuat bertahap.
const LITE = window.matchMedia ? window.matchMedia('(max-width: 768px), (pointer: coarse)').matches : false;
const FALLBACK = "this.onerror=null;this.outerHTML='<div class=media-tile><span class=mt-ic>📄</span><span class=mt-lb>Ketuk untuk membuka</span></div>'";

// thumb = alamat gambar pratinjau (untuk HP), src = alamat embed (untuk desktop)
const frame = (u, src, thumb) => LITE && thumb
  ? `<div class="card-media has-pv" data-modal-pv="${esc(u)}"><img class="gthumb" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${esc(thumb)}" alt="Pratinjau" onerror="${FALLBACK}"></div>`
  : LITE
    ? tile("📕", "Ketuk untuk membuka")
    : `<div class="card-media has-pv" data-modal-pv="${esc(u)}"><iframe class="lazy-pv" data-src="${esc(src)}" title="Pratinjau" tabindex="-1" allowfullscreen></iframe></div>`;

const gThumb = id => `https://drive.google.com/thumbnail?id=${id}&sz=w800`;

function getMediaThumbnail(u) {
  u = U(u);
  if (!u) return `<div class="card-media"><div class="media-tile"><span class="mt-lb">[Tanpa Media]</span></div></div>`;
  let m;
  if (m = u.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/)) return frame(u, `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`, gThumb(m[1]));
  if (m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/)) return frame(u, `https://drive.google.com/file/d/${m[1]}/preview`, gThumb(m[1]));
  if (m = u.match(/docs\.google\.com\/(?:document|spreadsheets)\/d\/([\w-]+)/)) return frame(u, `https://docs.google.com/document/d/${m[1]}/preview`, gThumb(m[1]));
  if (m = u.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/)) return frame(u, `https://www.youtube.com/embed/${m[1]}`, `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`);
  if (/^data:image|\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(u)) {
    return `<div class="card-media"><img decoding="async" src="${esc(u)}" alt="Gambar"></div>`;
  }
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u) || /^data:video/i.test(u)) {
    return `<div class="card-media"><video controls preload="none" playsinline src="${esc(u)}"></video></div>`;
  }
  if (/\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(u) || /^data:audio/i.test(u)) {
    return `<div class="card-media audio-only" style="background:#f1f5f9;"><audio controls preload="none" style="width:80%;" src="${esc(u)}"></audio></div>`;
  }
  if (/\.pdf(\?|$)/i.test(u)) return frame(u, u, null);
  return tile("🔗", "Tautan Eksternal");
}

// Muat iframe pratinjau hanya ketika sudah dekat dengan layar
function initLazyFrames() {
  const frames = document.querySelectorAll('iframe.lazy-pv[data-src]');
  const load = f => { if (f.dataset.src) { f.src = f.dataset.src; f.removeAttribute('data-src'); } };
  if (!('IntersectionObserver' in window)) { frames.forEach(load); return; }
  const timers = new WeakMap();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      const f = en.target;
      if (en.isIntersecting) {
        if (timers.has(f)) return;
        timers.set(f, setTimeout(() => { timers.delete(f); load(f); io.unobserve(f); }, 400));
      } else if (timers.has(f)) {
        clearTimeout(timers.get(f)); timers.delete(f);
      }
    });
  }, { rootMargin: '0px', threshold: 0.1 });
  frames.forEach(f => io.observe(f));
}

function media(u, t = "") {
  u = U(u);
  if (!u) return `<div class="empty">[Belum ada media atau tautan terlampir]</div>`;
  let m; const T = esc(t);

  if (m = u.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/)) {
    return `<div class="media-container"><iframe class="pv" loading="lazy" src="https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000" title="${T}" allowfullscreen="true"></iframe></div>`;
  }
  if (m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/)) {
    return `<div class="media-container"><iframe class="pv" loading="lazy" src="https://drive.google.com/file/d/${m[1]}/preview" title="${T}" allowfullscreen></iframe></div>`;
  }
  if (m = u.match(/docs\.google\.com\/(?:document|spreadsheets)\/d\/([\w-]+)/)) {
    return `<div class="media-container"><iframe class="pv" loading="lazy" src="https://docs.google.com/document/d/${m[1]}/preview" title="${T}" allowfullscreen></iframe></div>`;
  }
  if (m = u.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/)) {
    return `<div class="media-container"><iframe class="pv" loading="lazy" src="https://www.youtube.com/embed/${m[1]}" title="${T}" allowfullscreen></iframe></div>`;
  }
  if (/^data:image|\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/i.test(u)) {
    return `<div class="media-container" style="background:#0f172a; text-align:center;"><img class="gi" loading="lazy" src="${esc(u)}" alt="${T}" data-z="1" title="Klik untuk memperbesar"></div>`;
  }
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u) || /^data:video/i.test(u)) {
    return `<div class="media-container"><video class="pv" controls preload="metadata" src="${esc(u)}"></video></div>`;
  }
  if (/\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(u) || /^data:audio/i.test(u)) {
    return `<div class="media-container" style="padding:1.5rem; background:#f8fafc; text-align:center;"><audio class="pv" controls src="${esc(u)}">Browser tidak mendukung audio.</audio></div>`;
  }
  if (/\.pdf(\?|$)/i.test(u)) {
    return `<div class="media-container"><iframe class="pv" loading="lazy" src="${esc(u)}" title="${T}"></iframe></div>`;
  }
  return `<div class="blk" style="background:rgba(255,255,255,0.8); text-align:center; padding:2rem;">
    <p style="margin-bottom:1rem; font-weight:600;">Tautan Eksternal / Berkas Terlampir:</p>
    <a class="btn" href="${esc(u)}" target="_blank" rel="noopener">Buka Tautan &rarr;</a>
  </div>`;
}

function docCard(d) {
  const u = U(d.url);
  const mediaThumb = getMediaThumbnail(d.url);
  
  return `<article class="card fade-up">
    ${mediaThumb}
    <div class="card-content">
      <span class="tag">${esc(d.kategori || "Umum")}${d.siklus ? " • Siklus " + esc(d.siklus) : ""}</span>
      <h3 style="margin-top:0.5rem; font-size:1.1rem; color:var(--primary);">${esc(d.judul)}</h3>
      ${d.deskripsi ? `<p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.5rem; line-height:1.5;">${esc(d.deskripsi)}</p>` : ""}
      
      <div class="ac">
        ${u ? `<button class="btn" data-modal-pv="${esc(u)}" data-modal-title="${esc(d.judul)}" style="width:100%;">🔍 Tampilkan Fokus</button>
               <a class="btn s" target="_blank" rel="noopener" href="${esc(u)}" style="flex:1;">Buka Tab Baru</a>` : '<span class="ph">[Belum ada tautan]</span>'}
      </div>
    </div>
  </article>`;
}

const allDocs = () => D.dokumen.concat(D.nonmengajar.map(n => ({ judul: n.nama, kategori: "Kegiatan Nonmengajar", deskripsi: n.deskripsi, url: n.url })));

function fillDocs() {
  const qEl = $("#q"), fkEl = $("#fk"), fsEl = $("#fs"), dlEl = $("#dl");
  if (!dlEl) return;
  const q = qEl ? qEl.value.toLowerCase() : ""; const k = fkEl ? fkEl.value : ""; const s = fsEl ? fsEl.value : "";
  const L = allDocs().filter(d => (!k || d.kategori == k) && (!s || String(d.siklus) == s) && (!q || ((d.judul || "") + " " + d.kategori + " " + (d.deskripsi || "")).toLowerCase().includes(q)));
  dlEl.innerHTML = L.length ? L.map(docCard).join("") : '<p class="empty fade-up" style="grid-column:1/-1">Tidak ada dokumen atau media yang cocok.</p>';
  initScrollAnimations();
}

function renderOnePage() {
  const app = $("#app"); if (!app) return;
  const i = D.identitas, p = D.profil, k = D.kesimpulan;

  let siklusTabsHtml = `<div class="siklus-tabs">`;
  let siklusContentHtml = ``;

  D.siklus.forEach((s, idx) => {
    const activeClass = idx === 0 ? 'active' : '';
    const displayStyle = idx === 0 ? 'block' : 'none';
    
    // Buat Tombol Tab
    siklusTabsHtml += `<button class="siklus-tab-btn ${activeClass}" onclick="switchSiklus('${s.id}')">${esc(s.judul)}</button>`;

    const ds = D.dokumen.filter(d => d.siklus == s.id);
    const renderBlock = (title, uVal) => {
      const u = U(uVal);
      if (!u) return sec(title, "");
      const thumb = getMediaThumbnail(uVal);
      return `<section class="blk fade-up">
        <h3>${title}</h3>
        <div class="card-media" style="margin-top:1.2rem; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.4); box-shadow: 0 10px 25px rgba(0,0,0,0.05); height:240px; width:100%;">
            ${thumb.replace('class="card-media', 'style="width:100% !important; height:100% !important;" class="card-media')}
        </div>
        <div class="ac" style="margin-top:1.2rem;">
          <button class="btn" data-modal-pv="${esc(u)}" data-modal-title="${esc(title)}">🔍 Layar Penuh</button>
          <a class="btn s" target="_blank" rel="noopener" href="${esc(u)}">Buka Eksternal</a>
        </div>
      </section>`;
    };
    
    // Buat Konten Pembungkus per Siklus
    siklusContentHtml += `
    <div id="siklus-pane-${s.id}" class="siklus-pane" style="display: ${displayStyle};">
      <h2 class="fade-up" style="margin-top:1rem;">${esc(s.judul)}</h2>
      ${sec("Tujuan & Deskripsi Pembelajaran", s.tujuan)}
      ${renderBlock("Rancangan Pembelajaran (Modul Ajar / Slide)", s.rancangan)}
      ${renderBlock("Media Pembelajaran & LKPD", s.media)}
      ${sec("Asesmen & Hasil Pembelajaran", s.asesmen)}
      <section class="blk fade-up">
        <h3>Dokumentasi Praktik</h3>
        ${ds.length ? `<div class="grid">${ds.map(docCard).join("")}</div>` : ph("Belum ada dokumentasi praktik.")}
      </section>
      ${sec("Tantangan Selama Pembelajaran", s.tantangan)}
      ${sec("Refleksi Pembelajaran", s.refleksi)}
      ${sec("Tindak Lanjut", s.tindak)}
    </div>`;
  });
  siklusTabsHtml += `</div>`;

  app.innerHTML = `
    <div id="beranda" class="page-section">
      <section class="hero fade-up">
        <div>
          <span class="ey">${esc(i.program)}</span>
          <h1>${esc(i.nama)}</h1>
          <p class="lead">${esc(i.deskripsi)}</p>
          <dl class="id">
            <dt>NIM</dt><dd>${esc(i.nim)}</dd>
            <dt>Bidang Studi</dt><dd>${esc(i.bidang)}</dd>
            <dt>Perguruan Tinggi</dt><dd>${esc(i.kampus)}</dd>
            <dt>Sekolah PPL</dt><dd>${esc(i.sekolah)}</dd>
          </dl>
          <div class="ac">
            <a class="btn" href="#dokumen">Jelajahi Portofolio &rarr;</a>
            <a class="btn s" href="#profil">Profil Lengkap</a>
          </div>
        </div>
        <div class="pf">${i.foto ? `<img src="${esc(U(i.foto))}" alt="Foto Profil">` : "<span>[Foto Profil]</span>"}</div>
      </section>
    </div>

    <div id="profil" class="page-section">
      <h1 class="fade-up">Profil & Konteks PPL</h1>
      ${sec("Profil Singkat", p.ringkasan)}
      ${sec("Latar Belakang", p.latar)}
      ${sec("Konteks PPL", p.konteks)}
      ${sec("Peran Praktikan", p.peran)}
      ${sec("Target Kompetensi", p.target)}
    </div>

    <div id="siklus" class="page-section">
      <h1 class="fade-up">Praktik Pembelajaran</h1>
      <p class="lead fade-up" style="margin-bottom:2rem;">Pilih siklus pembelajaran di bawah ini untuk melihat detailnya:</p>
      ${siklusTabsHtml}
      ${siklusContentHtml}
    </div>

    <div id="asesmen" class="page-section">
      <h1 class="fade-up">Asesmen Pembelajaran</h1>
      ${AK.map(k => {
        const L = D.asesmen.filter(a => a.kategori == k);
        return `<div style="margin-top:3rem;"><h2 class="fade-up">${k}</h2>${L.length ? `<div class="grid">${L.map(docCard).join("")}</div>` : ph("Belum ada dokumen.")}</div>`;
      }).join("")}
    </div>

    <div id="nonmengajar" class="page-section">
      <h1 class="fade-up">Kegiatan Nonmengajar</h1>
      ${D.nonmengajar.length ? `<div class="grid">${D.nonmengajar.map(n => docCard({judul: n.nama, kategori: "Nonmengajar", deskripsi: n.deskripsi, url: n.url})).join("")}</div>` : '<p class="empty fade-up">Belum ada kegiatan nonmengajar.</p>'}
    </div>

    <div id="umpanbalik" class="page-section">
      <h1 class="fade-up">Umpan Balik</h1>
      ${D.umpanbalik.length ? D.umpanbalik.map(u => {
        const thumb = getMediaThumbnail(u.url);
        return `<article class="blk fade-up">
        <h3>Sumber: ${esc(u.sumber)}</h3>
        <div class="fx">
          <div style="margin-top:0.5rem;">
            ${u.url ? `
              <div class="card-media" style="border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,0.4); height:240px; width:100%; box-shadow:0 8px 20px rgba(0,0,0,0.05);">
                  ${thumb.replace('class="card-media', 'style="width:100% !important; height:100% !important;" class="card-media')}
              </div>
              <div class="ac"><button class="btn" data-modal-pv="${esc(u.url)}" data-modal-title="${esc(u.sumber)}">🔍 Tampilkan Fokus</button></div>
            ` : '<div class="empty">Tidak ada lampiran</div>'}
          </div>
          <div>
            <h4>Masukan</h4>${txt(u.komentar, "Komentar kosong")}
            <h4 style="margin-top:1.5rem;">Refleksi</h4>${txt(u.refleksi, "Refleksi kosong")}
          </div>
        </div>
      </article>`}).join("") : '<p class="empty fade-up">Belum ada umpan balik.</p>'}
    </div>

    <div id="refleksi" class="page-section">
      <h1 class="fade-up">Refleksi Diri</h1>
      ${Object.keys(RL).map(k => sec(RL[k], D.refleksi[k])).join("")}
    </div>

    <div id="dokumen" class="page-section">
      <h1 class="fade-up">Pusat Dokumen</h1>
      <div class="flt fade-up">
        <div><label>Cari</label><input id="q" type="search" placeholder="Ketik kata kunci..."></div>
        <div><label>Kategori</label><select id="fk"><option value="">Semua Kategori</option>${CATS.map(x => `<option>${x}</option>`).join("")}</select></div>
        <div><label>Siklus</label><select id="fs"><option value="">Semua Siklus</option>${D.siklus.map(s => `<option value="${esc(s.id)}">${esc(s.judul)}</option>`).join("")}</select></div>
      </div>
      <div class="grid" id="dl"></div>
    </div>

    <div id="kesimpulan" class="page-section" style="margin-bottom:3rem;">
      <h1 class="fade-up">Kesimpulan</h1>
      ${sec("Perkembangan Kompetensi Calon Guru", k.perkembangan)}
      ${sec("Tantangan & Evaluasi Berkelanjutan", k.tantangan)}
      ${sec("Komitmen Peningkatan Kualitas", k.komitmen)}
    </div>
  `;
  fillDocs();
  setupScrollSpy();
  initScrollAnimations();
}

// Fungsi untuk Ganti Tab Siklus Tanpa Scroll Jauh
function switchSiklus(id) {
  document.querySelectorAll('.siklus-pane').forEach(pane => pane.style.display = 'none');
  document.querySelectorAll('.siklus-tab-btn').forEach(btn => btn.classList.remove('active'));
  
  const targetPane = document.getElementById(`siklus-pane-${id}`);
  if (targetPane) targetPane.style.display = 'block';
  
  // Tandai tombol aktif
  event.currentTarget.classList.add('active');
  initScrollAnimations();
}

function initScrollAnimations() {
  initLazyFrames();
  const elements = document.querySelectorAll('.fade-up:not(.visible)');
  if (!('IntersectionObserver' in window)) { elements.forEach(el => el.classList.add('visible')); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); 
      }
    });
  }, { rootMargin: '200px 0px 200px 0px', threshold: 0 });
  elements.forEach(el => observer.observe(el));
}

// Perbaikan ScrollSpy Berbasis Posisi Murni (Akurat untuk Beranda & Menu Lain)
function setupScrollSpy() {
  const sections = Array.from(document.querySelectorAll('.page-section'));
  const navLinks = Array.from(document.querySelectorAll('#nav a'));
  let ticking = false, last = '';

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    let current = 'beranda';
    if (y >= 150) {
      const pos = y + 200;
      for (const sc of sections) {
        if (pos >= sc.offsetTop && pos < sc.offsetTop + sc.offsetHeight) { current = sc.id; break; }
      }
    }
    if (current === last) return;   // tidak menyentuh DOM kalau tidak berubah
    last = current;
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

function chrome() {
  const i = D.identitas; const lg = $("#lg"), bt = $("#bt"), ft = $("#ft"), nav = $("#nav");
  if (lg) lg.innerHTML = i.logo ? `<img src="${esc(U(i.logo))}" alt="Logo">` : "IF";
  if (bt) bt.textContent = i.judul; if (ft) { ft.textContent = i.footer; const v = document.createElement("small"); v.style.cssText = "display:block;opacity:.5;margin-top:.5rem"; v.textContent = "build 8 \u2022 " + (LITE ? "mode ringan" : "mode penuh"); ft.appendChild(v); } document.title = i.judul;
  if (nav) nav.innerHTML = NAV.map(n => `<a href="${n[0].endsWith('.html') ? n[0] : '#' + n[0]}" data-n="${n[0]}">${n[1]}</a>`).join("");
}

document.addEventListener("click", e => {
  const t = e.target;
  if (t.id == "mb") { const nav = $("#nav"); if (nav) nav.classList.toggle("o"); return; }
  if (t.tagName === 'A' && t.getAttribute('href').startsWith('#') && t.closest('#nav')) {
    const nav = $("#nav"); if (nav) nav.classList.remove("o"); return;
  }
  if (t.dataset.z) {
    const lbImg = $("#lb img"), lb = $("#lb");
    if (lbImg && lb) { lbImg.src = t.src; lb.removeAttribute("hidden"); } return;
  }
  if (t.closest("#lb")) {
    const lb = $("#lb"); if (lb) lb.setAttribute("hidden", "true"); return;
  }
  const pvBtn = t.closest("[data-modal-pv]");
  if (pvBtn) { openModal(pvBtn.dataset.modalPv, pvBtn.dataset.modalTitle || "Pratinjau"); return; }
  if (t.closest("#modal-close") || t.id == "modal-view") { closeModal(); return; }
  if (t.id == "top" || t.closest("#top")) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
});

function openModal(url, title) {
  let modal = $("#modal-view");
  if (!modal) {
    modal = document.createElement("div"); modal.id = "modal-view";
    modal.innerHTML = `<div class="modal-box"><div class="modal-header"><h3 id="modal-title">Pratinjau</h3><button class="modal-close" id="modal-close">&times;</button></div><div class="modal-body" id="modal-body-content"></div></div>`;
    document.body.appendChild(modal);
  }
  $("#modal-title").textContent = title;
  $("#modal-body-content").innerHTML = media(url, title);
  document.body.classList.add("modal-open");
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeModal() {
  const modal = $("#modal-view");
  if (modal) {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
    setTimeout(() => { const body = $("#modal-body-content"); if (body) body.innerHTML = ""; }, 400);
  }
}

document.addEventListener("input", e => { if (e.target.closest(".flt")) fillDocs(); });
document.addEventListener("keydown", e => { if (e.key == "Escape") { const lb = $("#lb"); if (lb) lb.setAttribute("hidden", "true"); closeModal(); } });
let topTick = false;
window.addEventListener("scroll", () => {
  if (topTick) return; topTick = true;
  requestAnimationFrame(() => {
    topTick = false;
    const topBtn = $("#top");
    if (topBtn) topBtn.classList.toggle("show", window.scrollY > 500);
  });
}, { passive: true });
document.addEventListener("DOMContentLoaded", () => {
  chrome(); renderOnePage();
  if (window.location.hash) {
    setTimeout(() => { const target = document.querySelector(window.location.hash); if (target) target.scrollIntoView({ behavior: 'smooth' }); }, 100);
  }
});