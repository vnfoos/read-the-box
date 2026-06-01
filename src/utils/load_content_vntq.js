async function askGeminiWeb(tabId, text) {
  const prompt = `Sửa lỗi chính tả cho nội dung sau, chỉ trả về nội dung đã sửa, không giải thích, không thêm bất kỳ nội dung nào khác:\n\n${text}`;

  // Bước 1: Inject text và submit
  await chrome.scripting.executeScript({
    target: { tabId, frameIds: [0] },
    world: "MAIN",
    func: (promptText) => {
      const p = document.querySelector('div[role="textbox"] p');
      p.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, promptText);
      setTimeout(() => {
        document.querySelector('button[aria-label="Send message"]')?.click();
      }, 500);
    },
    args: [prompt]
  });

  // Bước 2: Đợi 5s cho Gemini bắt đầu respond
  await new Promise(r => setTimeout(r, 5000));

  // Bước 3: Poll đến khi không còn loading
  let response = "";
  for (let i = 0; i < 60; i++) {  // tối đa 60 x 2s = 2 phút
    const results = await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      world: "MAIN",
      func: () => {
        // Check loading bằng nút Stop streaming
        const isLoading = !!document.querySelector('button[aria-label="Stop streaming"]');
        const responses = document.querySelectorAll('div.markdown');
        const lastText = responses[responses.length - 1]?.innerText ?? "";
        return { isLoading, text: lastText };
      }
    });

    const { isLoading, text } = results?.[0]?.result ?? {};
    console.log(`Poll ${i + 1}: loading=${isLoading}, text length=${text?.length}`);

    // Chỉ lấy về khi Gemini đã done hoàn toàn
    if (!isLoading && text && text.length > 0) {
      response = text;
      break;
    }

    await new Promise(r => setTimeout(r, 2000));  // đợi 2s mỗi lần poll
  }

  return response || text;
}

export function load_content_vntq(on_done) {
  chrome.tabs.query({ url: "http://vietnamthuquan.eu/*" }, (vntqTabs) => {
    if (vntqTabs.length === 0) { on_done(""); return; }

    chrome.tabs.query({ url: "https://gemini.google.com/*" }, (geminiTabs) => {
      if (geminiTabs.length === 0) {
        console.error("Không tìm thấy tab Gemini");
        on_done("");
        return;
      }

      const geminiTabId = geminiTabs[0].id;

      chrome.scripting.executeScript({
        target: { tabId: vntqTabs[0].id },
        func: () => {
          const parts = [];
          const chuongso = document.querySelector(".chuongso");
          if (chuongso) parts.push(chuongso.innerText.trim());
          const tuahoi = document.querySelector(".tuahoi1");
          if (tuahoi) parts.push(tuahoi.innerText.trim());
          const noidung = document.querySelector(".chuhoavn");
          if (noidung) parts.push(noidung.innerText.trim());
          return parts.join("\n\n");
        }
      }, async (results) => {
        const raw = results?.[0]?.result ?? "";
        console.log("raw:", raw.slice(0, 100));

        const fixed = await askGeminiWeb(geminiTabId, raw);
        console.log("fixed:", fixed.slice(0, 100));

        on_done(fixed);
      });
    });
  });
}