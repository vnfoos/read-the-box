async function askGeminiWeb(tabId, text) {
  const prompt = `Sửa lỗi chính tả cho nội dung sau, chỉ trả về nội dung đã sửa, không giải thích, không thêm bất kỳ nội dung nào khác:\n\n${text}`;

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (promptText) => {
      const p = document.querySelector('div[role="textbox"] p');
      p.focus();
      p.innerText = promptText;
      p.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        document.querySelector('button[aria-label="Send message"]')?.click();
      }, 500);
    },
    args: [prompt]
  });

  await new Promise(r => setTimeout(r, 3000));

  let response = "";
  for (let i = 0; i < 20; i++) {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const isLoading = !!document.querySelector('button[aria-label="Stop streaming"]');
        const responses = document.querySelectorAll('message-content .markdown');
        const lastText = responses[responses.length - 1]?.innerText ?? "";
        return { isLoading, text: lastText };
      }
    });

    const { isLoading, text } = results?.[0]?.result ?? {};
    console.log(`Poll ${i + 1}: loading=${isLoading}, text length=${text?.length}`);

    if (!isLoading && text) {
      response = text;
      break;
    }

    await new Promise(r => setTimeout(r, 1500));
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