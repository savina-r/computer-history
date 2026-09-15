document.addEventListener('DOMContentLoaded', function () {
  const stage = document.querySelector('[data-stage]');
  if (!stage) return;

  const section = stage.closest('.chapter3');
  const pcScene = stage.querySelector('#pc-scene');
  if (!section || !pcScene) return;

  const layers = Array.from(pcScene.querySelectorAll('.layer'));
  const num = layers.length;

  function update() {
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalScroll = Math.max(section.offsetHeight - windowH, 1);
    const scrolled = Math.min(Math.max(-rect.top, 0), totalScroll);
    const progress = scrolled / totalScroll;

    let index = Math.floor(progress * num);
    if (index >= num) index = num - 1;
    if (index < 0) index = 0;

    layers.forEach((l, i) => l.classList.toggle('active', i === index));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// CLI → GUI → WORD Click Transform
document.addEventListener('DOMContentLoaded', function () {
  const cliToGui = document.querySelector('.cli-to-gui');

  if (cliToGui) {
    const cliScreen = cliToGui.querySelector('.cli-screen');
    const guiScreen = cliToGui.querySelector('.gui-screen');
    const wordScreen = cliToGui.querySelector('.word-screen');
    const transformBtn = cliToGui.querySelector('.transform-btn');
    
    if (!transformBtn) return;
    
    // Check which screens are currently active
    function getCurrentStage() {
        if (cliScreen.classList.contains('active')) return 'cli';
        if (guiScreen.classList.contains('active')) return 'gui';
        if (wordScreen.classList.contains('active')) return 'word';
        return 'cli'; // default
    }
    
    transformBtn.addEventListener('click', () => {
        const currentStage = getCurrentStage();
        
        if (currentStage === 'cli') {
            // CLI → GUI
            cliScreen.classList.remove('active');
            guiScreen.classList.add('active');
            wordScreen.classList.remove('active');
            transformBtn.textContent = 'Microsoft Word öffnen →';
        } else if (currentStage === 'gui') {
            // GUI → Word
            cliScreen.classList.remove('active');
            guiScreen.classList.remove('active');
            wordScreen.classList.add('active');
            transformBtn.textContent = '← Zurück zur Kommandozeile';
        } else {
            // Word → CLI (reset)
            cliScreen.classList.add('active');
            guiScreen.classList.remove('active');
            wordScreen.classList.remove('active');
            transformBtn.textContent = 'Grafische Oberfläche aktivieren →';
        }
    });
  }
});



// ------------------------------------------------------------
// Monitor text fitting
// ------------------------------------------------------------
function fitText(el, min = 8, max = 60) {
  // binary-search for maximum font-size that still fits.
  // keep track of the last size that fit to avoid overshoot due to rounding.
  let lo = min, hi = max;
  let best = lo;

  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    el.style.fontSize = mid + "px";

    const fits =
      el.scrollWidth <= el.clientWidth &&
      el.scrollHeight <= el.clientHeight;

    if (fits) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  el.style.fontSize = Math.max(min, best) + "px";
}

function refitAll() {
  document.querySelectorAll("[data-fit]").forEach(el => fitText(el, 8, 60));
}

// Observe size changes on screens and refit text when the available area changes
if (window.ResizeObserver) {
  const ro = new ResizeObserver(entries => {
    for (const e of entries) {
      try { fitText(e.target, 8, 60); } catch (err) { /* ignore */ }
    }
  });
  document.querySelectorAll('[data-fit]').forEach(el => ro.observe(el));
}

document.querySelectorAll('.c64, .ibm, .apple').forEach(screen => {
    screen.addEventListener('mousemove', (e) => {
        const rect = screen.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        screen.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    screen.addEventListener('mouseleave', () => {
        screen.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// ------------------------------------------------------------
// Timeline (ticks) + hover effects
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Fit monitor text on load/resize
  window.addEventListener("load", refitAll);
  window.addEventListener("resize", refitAll);
  refitAll();

  const timelineEl = document.getElementById("timeline");
  if (!timelineEl) return;

  const labels = [
    "Erste Schritte",
    "Große Fortschitte",
    "Computer für alle",
    "Netzzeitalter",
    "Heute",
  ];

  // fewer ticks to keep timeline compact
  const TICKS = 25;
  const step = (TICKS - 1) / (labels.length - 1);
  const milestones = new Map();
  // build a map from tick index -> label string and also store labelIndex
  labels.forEach((text, i) => {
    const idx = Math.round(i * step);
    milestones.set(idx, { text, labelIndex: i });
  });

  // Build ticks
  timelineEl.innerHTML = "";
  for (let i = 0; i < TICKS; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tick";
    btn.setAttribute("aria-label", `Zeitleisten-Markierung ${i + 1}`);
    btn.textContent = "0";

    if (milestones.has(i)) {
      const info = milestones.get(i);
      btn.classList.add("milestone");
      btn.dataset.label = info.text;
      btn.dataset.section = info.labelIndex; // link to sections by data-milestone
      btn.textContent = "0"; // milestones bleiben 0
    }

    timelineEl.appendChild(btn);
  }

  const ticks = Array.from(timelineEl.querySelectorAll(".tick"));

  // 0 -> 1 on hover for normal ticks only
  ticks.forEach((btn) => {
    btn.addEventListener("pointerenter", () => {
      if (!btn.classList.contains("milestone")) btn.textContent = "1";
    });
    btn.addEventListener("pointerleave", () => {
      if (!btn.classList.contains("milestone")) btn.textContent = "0";
    });
  });

  // Clickable milestones: scroll to the corresponding chapter/section
  const milestoneButtons = timelineEl.querySelectorAll('.milestone');
  milestoneButtons.forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      const idx = btn.dataset.section;
      if (typeof idx === 'undefined') return;
      const target = document.querySelector(`[data-milestone="${idx}"]`);
      if (!target) return;

      // compute sticky header height so the target doesn't hide underneath it
      const header = document.querySelector('header');
      const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
      const extraGap = 8; // small breathing room
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - extraGap;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  // Wave heights (keeps your existing look) + random neighbor bits
  const H1 = 42; // center
  const H2 = 28; // 1st neighbor
  const H3 = 20; // 2nd neighbor

  let rafWave = null;
  let lastIdx = -1;

  function setWaveAt(idx) {
    // reset heights
    for (const t of ticks) t.style.height = "";

    const set = (i, h) => {
      if (i < 0 || i >= ticks.length) return;
      ticks[i].style.height = h + "px";
    };

    set(idx, H1);
    set(idx - 1, H2); set(idx + 1, H2);
    set(idx - 2, H3); set(idx + 2, H3);

    // randomize ONLY neighbors' text (center tick stays as-is)
    const neighbors = [idx - 2, idx - 1, idx + 1, idx + 2];
    for (const i of neighbors) {
      if (i < 0 || i >= ticks.length) continue;
      const t = ticks[i];
      if (t.classList.contains("milestone")) continue;
      t.textContent = Math.random() > 0.5 ? "1" : "0";
    }
  }

  function findClosestIndex(clientX) {
    let best = 0;
    let bestD = Infinity;

    for (let i = 0; i < ticks.length; i++) {
      const r = ticks[i].getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const d = Math.abs(clientX - cx);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  timelineEl.addEventListener("pointermove", (e) => {
    if (rafWave) return;
    rafWave = requestAnimationFrame(() => {
      rafWave = null;
      const idx = findClosestIndex(e.clientX);
      if (idx !== lastIdx) {
        lastIdx = idx;
        setWaveAt(idx);
      }
    });
  });

  timelineEl.addEventListener("pointerleave", () => {
    lastIdx = -1;
    for (const t of ticks) {
      t.style.height = "";
    }
  });

  // Proximity background color for milestones only (your “near mouse” rectangle effect)
  const BLUE_FAR = [0, 0, 0];
  const BLUE_NEAR = [0, 255, 102];
  const RADIUS = 180;

  const milestoneBtns = () => Array.from(timelineEl.querySelectorAll(".milestone"));
  let rafColor = null;
  let lastEvt = null;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  function paint(e) {
    const mx = e.clientX, my = e.clientY;

    for (const btn of milestoneBtns()) {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const d = Math.hypot(mx - cx, my - cy);
      let t = clamp01(1 - d / RADIUS);
      t = t * t;

      if (btn.matches(":hover")) t = 1;

      if (t < 0.02) {
        btn.style.backgroundColor = "";
        continue;
      }

      const rr = Math.round(lerp(BLUE_FAR[0], BLUE_NEAR[0], t));
      const gg = Math.round(lerp(BLUE_FAR[1], BLUE_NEAR[1], t));
      const bb = Math.round(lerp(BLUE_FAR[2], BLUE_NEAR[2], t));
      btn.style.backgroundColor = `rgb(${rr} ${gg} ${bb})`;
    }
  }

  timelineEl.addEventListener("mousemove", (e) => {
    lastEvt = e;
    if (rafColor) return;
    rafColor = requestAnimationFrame(() => {
      rafColor = null;
      paint(lastEvt);
    });
  });

  timelineEl.addEventListener("mouseleave", () => {
    for (const btn of milestoneBtns()) btn.style.backgroundColor = "";
  });
});

// AUDIO PLAYER
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audioElement');
  if (!audio) return;

  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = playPauseBtn.querySelector('.play-icon');
  const pauseIcon = playPauseBtn.querySelector('.pause-icon');
  const muteBtn = document.getElementById('muteBtn');
  const volumeIcon = muteBtn.querySelector('.volume-icon');
  const muteIcon = muteBtn.querySelector('.mute-icon');
  const volumeSlider = document.getElementById('volumeSlider');
  const progressBar = document.querySelector('.progress-bar');
  const progressFill = document.querySelector('.progress-fill');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');

  // Set initial volume
  audio.volume = volumeSlider.value / 100;

  // Format time helper
  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Play/Pause toggle
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      audio.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  });

  // Update progress bar
  audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  // Set duration when loaded
  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  // Seek functionality
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  });

  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
    if (audio.volume === 0) {
      volumeIcon.style.display = 'none';
      muteIcon.style.display = 'block';
    } else {
      volumeIcon.style.display = 'block';
      muteIcon.style.display = 'none';
    }
  });

  // Mute toggle
  muteBtn.addEventListener('click', () => {
    if (audio.volume > 0) {
      audio.dataset.previousVolume = audio.volume;
      audio.volume = 0;
      volumeSlider.value = 0;
      volumeIcon.style.display = 'none';
      muteIcon.style.display = 'block';
    } else {
      const prevVolume = audio.dataset.previousVolume || 0.7;
      audio.volume = prevVolume;
      volumeSlider.value = prevVolume * 100;
      volumeIcon.style.display = 'block';
      muteIcon.style.display = 'none';
    }
  });

  // Reset play button when audio ends
  audio.addEventListener('ended', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });
});

// ------------------------------------------------------------
// ------------------------------------------------------------
// Magazine sheet-based page-turning (cover + sheets)
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  const magazineStage = document.querySelector('[data-magazine-stage]');
  if (!magazineStage) return;

  const section = magazineStage.closest('.magazine-section');
  const book = document.getElementById('magazine-book');
  if (!section || !book) return;

  const cover = book.querySelector('.sheet.cover');
  const sheets = Array.from(book.querySelectorAll('.sheet[data-sheet]'))
    .sort((a,b)=> Number(a.dataset.sheet) - Number(b.dataset.sheet));
  const sheet1 = book.querySelector('.sheet[data-sheet="1"]');
  const sheet1Back = sheet1 ? sheet1.querySelector('.back') : null;

  const totalTransitions = 1 + sheets.length; // cover + each sheet

  function updateMagazine() {
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalScroll = Math.max(section.offsetHeight - windowH, 1);
    const scrolled = Math.min(Math.max(-rect.top, 0), totalScroll);
    const progress = scrolled / totalScroll;

    const exact = progress * totalTransitions;
    const current = Math.floor(Math.min(Math.max(exact, 0), totalTransitions - 0.0001));
    const p = exact - current; // progress within current transition

    // Cover flip (index 0)
    if (cover) {
      if (current === 0) {
        cover.style.transform = `rotateY(${ -p * 180 }deg)`;
        cover.style.zIndex = 1000; // bring cover above while flipping
      } else {
        cover.style.transform = `rotateY(-180deg)`;
        // push cover behind sheets once flipped so turned pages remain visible
        cover.style.zIndex = 0;
      }

      // Hide the cover once the second sheet flip has finished
      // transition index 2 corresponds to the second sheet; hide after it completes
      const hideAfterTransition = 2;
      if (current > hideAfterTransition || (current === hideAfterTransition && p > 0.999)) {
        cover.style.visibility = 'hidden';
        cover.style.pointerEvents = 'none';
      } else {
        cover.style.visibility = 'visible';
        cover.style.pointerEvents = '';
      }
    }

    // Hide sheet1 back after the following sheet (sheet 2) has flipped
    if (sheet1Back) {
      // hide sheet1.back only after we've advanced past the third transition
      const hideAfter = 3;
      if (current > hideAfter) {
        sheet1Back.style.visibility = 'hidden';
        sheet1Back.style.pointerEvents = 'none';
      } else {
        sheet1Back.style.visibility = 'visible';
        sheet1Back.style.pointerEvents = '';
      }
    }

    // Sheets: transition index 1 -> sheet[0], index 2 -> sheet[1], etc.
    sheets.forEach((sheet, i) => {
      const idx = 1 + i;
      const baseZ = 200 - (i * 10);
      if (current > idx) {
        sheet.style.transform = 'rotateY(-180deg)';
        sheet.style.zIndex = baseZ - 50;
      } else if (current === idx) {
        sheet.style.transform = `rotateY(${ -p * 180 }deg)`;
        // raise while turning so it sits above others
        sheet.style.zIndex = 1000 + (sheets.length - i);
      } else {
        sheet.style.transform = 'rotateY(0deg)';
        sheet.style.zIndex = baseZ;
      }
    });
  }

  window.addEventListener('scroll', updateMagazine, { passive: true });
  window.addEventListener('resize', updateMagazine);
  updateMagazine();
});

// Back to Top Button
const backToTopBtn = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

