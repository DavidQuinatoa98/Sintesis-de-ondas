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

  const freqBase = parseFloat(document.getElementById("freq1").value);
  const freq = freqBase * Math.pow(2, offset / 12);  

  const ctx = window.audioCtx;
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc1.type = document.getElementById("wave1Type").value;
  osc2.type = document.getElementById("wave2Type").value;

  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 1.5;

  const vol = parseFloat(volumeSlider.value);
  gain1.gain.value = vol;
  gain2.gain.value = vol;

  const duration = 0.5;
  const now = ctx.currentTime;
  
  osc1.connect(gain1).connect(ctx.destination);
  osc2.connect(gain2).connect(ctx.destination);
  osc1.start();
  osc2.start();
  osc1.stop(ctx.currentTime + 0.5);
  osc2.stop(ctx.currentTime + 0.5);

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
  if (allKeys.includes(e.key)) playTune(e.key);
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