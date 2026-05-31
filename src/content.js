// Lắng nghe lệnh từ popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_TEXT') {
    const text = extractStoryText();
    sendResponse({ text });
  }
});

function extractStoryText() {
  // Thử các selector phổ biến của trang truyện VN
  const selectors = [
    '#chapter-content', '.chapter-content', '#content',
    'article', '.truyen-content', '.reading-content'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el.innerText.trim();
  }
  return document.body.innerText.trim();
}