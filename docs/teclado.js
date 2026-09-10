const pianoKeys = document.querySelectorAll(".piano-keys .key"),
      volumeSlider = document.querySelector(".volume-slider input"),
      keysCheckbox = document.querySelector(".keys-checkbox input");

let allKeys = [];

const keyOffsetMap = {
  'a': 0,
  'w': 1,
  's': 2,
  'e': 3,
  'd': 4,
  'f': 5,
  't': 6,
  'g': 7,
  'y': 8,
  'h': 9,
  'u': 10,
  'j': 11,
  'k': 12,
  'o': 13,
  'l': 14,
  'p': 15,
  'ñ': 16
};

const playTune = (key) => {
  const offset = keyOffsetMap[key];
  if (offset === undefined) return;

  // Reanudar AudioContext si el navegador lo suspendió por falta de interacción
  const ctx = window.audioCtx;
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const freq1Input = document.getElementById("freq1");
  const freqBase = freq1Input ? parseFloat(freq1Input.value) : 440;
  const freq = freqBase * Math.pow(2, offset / 12);

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  const wave1 = document.getElementById("wave1Type");
  const wave2 = document.getElementById("wave2Type");
  osc1.type = wave1 ? wave1.value : "sine";
  osc2.type = wave2 ? wave2.value : "sine";

  osc1.frequency.setValueAtTime(freq, ctx.currentTime);
  osc2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);

  // Margen dinámico para evitar clipping al sumar ondas o tocar acordes
  const vol = parseFloat(volumeSlider.value) || 0.5;
  const voiceGain = vol * 0.25;

  const now = ctx.currentTime;
  const attackTime = 0.015;
  const duration = 0.45;

  // Envolvente rápida para osc1
  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.linearRampToValueAtTime(voiceGain, now + attackTime);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Envolvente rápida para osc2
  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.linearRampToValueAtTime(voiceGain, now + attackTime);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Conexiones al destino
  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration + 0.05);
  osc2.stop(now + duration + 0.05);

  const clickedKey = document.querySelector(`[data-key="${key}"]`);
  if (clickedKey) {
    clickedKey.classList.add("active");
    setTimeout(() => clickedKey.classList.remove("active"), 150);
  }
};

pianoKeys.forEach(key => {
  allKeys.push(key.dataset.key);
  key.addEventListener("click", () => playTune(key.dataset.key));
});

document.addEventListener("keydown", (e) => {
  const pressedKey = e.key.toLowerCase();
  if (allKeys.includes(pressedKey) && !e.repeat) {
    playTune(pressedKey);
  }
});

volumeSlider.addEventListener("input", (e) => {
  if (window.gain1 && window.gain2) {
    window.gain1.gain.value = e.target.value;
    window.gain2.gain.value = e.target.value;
  }
});

keysCheckbox.addEventListener("click", () => {
  pianoKeys.forEach(key => key.classList.toggle("hide"));
});