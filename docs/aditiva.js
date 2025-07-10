window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
window.osc1 = null;
window.gain1 = null;
window.osc2 = null;
window.gain2 = null;
window.analyser = null;
window.isPlaying = false;
let animationId;

const freq1 = document.getElementById('freq1');
const freq2 = document.getElementById('freq2');
const amp1 = document.getElementById('amp1');
const amp2 = document.getElementById('amp2');

const freq1Val = document.getElementById('freq1Val');
const freq2Val = document.getElementById('freq2Val');
const amp1Val = document.getElementById('amp1Val');
const amp2Val = document.getElementById('amp2Val');

freq1.oninput = () => freq1Val.textContent = freq1.value;
freq2.oninput = () => freq2Val.textContent = freq2.value;
amp1.oninput = () => amp1Val.textContent = amp1.value;
amp2.oninput = () => amp2Val.textContent = amp2.value;

const canvas = document.getElementById('oscilloscope');
const ctx = canvas.getContext('2d');

function drawOscilloscope() {
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  window.analyser.getByteTimeDomainData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'lime';
  ctx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  animationId = requestAnimationFrame(drawOscilloscope);
}

document.getElementById('toggle').onclick = () => {
   if (!window.isPlaying) {
    window.osc1 = window.audioCtx.createOscillator();
    window.gain1 = window.audioCtx.createGain();
    window.osc2 = window.audioCtx.createOscillator();
    window.gain2 = window.audioCtx.createGain();
    window.analyser = window.audioCtx.createAnalyser();

    window.osc1.type = document.getElementById('wave1Type').value;
    window.osc2.type = document.getElementById('wave2Type').value;

    const now = audioCtx.currentTime;
    window.osc1.frequency.setTargetAtTime(freq1.value, now, 0.01);
    window.gain1.gain.setTargetAtTime(amp1.value, now, 0.01);
    window.osc2.frequency.setTargetAtTime(freq2.value, now, 0.01);
    window.gain2.gain.setTargetAtTime(amp2.value, now, 0.01);

    
    freq1.addEventListener("input", () => {
  freq1Val.textContent = freq1.value;
  if (window.osc1) {
    window.osc1.frequency.setTargetAtTime(freq1.value, audioCtx.currentTime, 0.01);
  }
});

freq2.addEventListener("input", () => {
  freq2Val.textContent = freq2.value;
  if (window.osc2) {
    window.osc2.frequency.setTargetAtTime(freq2.value, audioCtx.currentTime, 0.01);
  }
});

amp1.addEventListener("input", () => {
  amp1Val.textContent = amp1.value;
  if (window.gain1) {
    window.gain1.gain.setTargetAtTime(amp1.value, audioCtx.currentTime, 0.01);
  }
});

amp2.addEventListener("input", () => {
  amp2Val.textContent = amp2.value;
  if (window.gain2) {
    window.gain2.gain.setTargetAtTime(amp2.value, audioCtx.currentTime, 0.01);
  }
});


    const merger = window.audioCtx.createGain();
    window.osc1.connect(window.gain1).connect(merger);
    window.osc2.connect(window.gain2).connect(merger);
    merger.connect(window.analyser).connect(window.audioCtx.destination);

    window.osc1.start();
    window.osc2.start();

    drawOscilloscope();
    window.isPlaying = true;
  } else {
    window.osc1.stop();
    window.osc2.stop();
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.isPlaying = false;
  }
};