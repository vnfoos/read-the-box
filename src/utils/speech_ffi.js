let currentAudio = null;
let chunks = [];
let chunkIndex = 0;
let currentRate = 1;

function splitText(text, maxLen = 200) {
  const sentences = text.match(/[^.!?,]+[.!?,]*/g) || [text];
  const result = [];
  let current = "";

  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      if (current) result.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current) result.push(current.trim());
  return result;
}

function buildUrl(text) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
}

function playChunk(index) {
  if (index >= chunks.length) return;

  currentAudio = new Audio(buildUrl(chunks[index]));
  currentAudio.playbackRate = currentRate;
  currentAudio.onerror = (e) => console.error("Audio error:", currentAudio.error);
  currentAudio.onended = () => playChunk(index + 1);
  currentAudio.play().catch(e => console.error("Play error:", e));
  chunkIndex = index;
}

export function play(text, rate) {
  stop();
  currentRate = rate;
  chunks = splitText(text);
  console.log("chunks:", chunks);
  console.log("url:", buildUrl(chunks[0]));
  playChunk(0);
}

export function pause_speech() {
  currentAudio?.pause();
}

export function resume_speech() {
  currentAudio?.play();
}

export function stop() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  chunks = [];
  chunkIndex = 0;
}