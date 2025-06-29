const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let noiseSource, filter, analyser, animationId;
let isPlaying = false;

const noiseType = document.getElementById('noiseType');
const cutoff = document.getElementById('cutoff');
const resonance = document.getElementById('resonance');
const freqVal = document.getElementById('freqVal');
const qVal = document.getElementById('qVal');

cutoff.oninput = () => freqVal.textContent = cutoff.value;
resonance.oninput = () => qVal.textContent = resonance.value;

const canvas = document.getElementById('oscilloscope');
const ctx = canvas.getContext('2d');

function createWhiteNoiseBuffer() {
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createPinkNoiseBuffer() {
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

function drawOscilloscope() {
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'lime';
  ctx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  animationId = requestAnimationFrame(drawOscilloscope);
}

document.getElementById('toggle').onclick = () => {
  if (!isPlaying) {
    const buffer = noiseType.value === 'pink'
      ? createPinkNoiseBuffer()
      : createWhiteNoiseBuffer();

    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff.value;
    filter.Q.value = resonance.value;

    cutoff.oninput = () => filter.frequency.value = cutoff.value;
    resonance.oninput = () => filter.Q.value = resonance.value;

    analyser = audioCtx.createAnalyser();

    noiseSource.connect(filter).connect(analyser).connect(audioCtx.destination);
    noiseSource.start();

    drawOscilloscope();
    isPlaying = true;
  } else {
    noiseSource.stop();
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isPlaying = false;
  }
};