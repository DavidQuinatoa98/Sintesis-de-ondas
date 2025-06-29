const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let osc1, gain1, osc2, gain2, analyser, animationId;
let isPlaying = false;

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
  if (!isPlaying) {
    osc1 = audioCtx.createOscillator();
    gain1 = audioCtx.createGain();
    osc2 = audioCtx.createOscillator();
    gain2 = audioCtx.createGain();
    analyser = audioCtx.createAnalyser();

    osc1.type = document.getElementById('wave1Type').value;
    osc2.type = document.getElementById('wave2Type').value;

    osc1.frequency.value = freq1.value;
    gain1.gain.value = amp1.value;

    osc2.frequency.value = freq2.value;
    gain2.gain.value = amp2.value;

    const merger = audioCtx.createGain();

    osc1.connect(gain1).connect(merger);
    osc2.connect(gain2).connect(merger);

    merger.connect(analyser).connect(audioCtx.destination);

    osc1.start();
    osc2.start();

    drawOscilloscope();
    isPlaying = true;
  } else {
    osc1.stop();
    osc2.stop();
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isPlaying = false;
  }
};