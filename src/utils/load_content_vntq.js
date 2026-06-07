async function askGeminiWeb(tabId, text) {
  let response = "Xảy ra lỗi!";

  let cleanRaw = '```' + text.replace(/[\r\n]+/g, " ") + '```';
  const prompt = `Bạn là một mô hình sửa lỗi chính tả, hãy sửa lỗi chính tả cho nội dung sau, nội dung sửa sẽ được dùng để đọc, nên hãy xoá bớt kí tự thừa thải không liên quan đến việc đọc, chỉ trả về nội dung đã sửa, không giải thích, không thêm bất kỳ nội dung nào khác: ${cleanRaw}`;

  console.log('%cprompt\n', 'color:#2c86e2;font:1rem bold;');
  console.log(prompt);

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

  // Bước 3: Poll liên tục đến khi văn bản không dài thêm nữa
  let lastLength = 0;
  let noChangeCount = 0;

  for (let i = 0; i < 90; i++) { // Tăng lên tối đa 3 phút cho chương truyện dài
    const results = await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      world: "MAIN",
      func: () => {
        // Kiểm tra nút Stop (Cả tiếng Anh và tiếng Việt)
        const stopBtn = document.querySelector('button[aria-label*="Dừng"]') ||
          document.querySelector('button[aria-label*="Stop"]') ||
          document.querySelector('button[aria-label="Stop streaming"]');

        const isLoading = !!stopBtn;

        // Lấy nội dung từ khối markdown cuối cùng
        const responses = document.querySelectorAll('div.markdown, message-content');
        const lastText = responses[responses.length - 1]?.innerText ?? "";

        return { isLoading, text: lastText };
      }
    });

    const { isLoading, text } = results?.[0]?.result ?? {};
    const currentLength = text ? text.trim().length : 0;

    console.log(`Poll ${i + 1}: loading=${isLoading}, text length=${currentLength}`);

    if (currentLength > 0) {
      response = text.trim();
    }

    // Cơ chế check thông minh:
    // Nếu nút Stop biến mất VÀ độ dài text không tăng thêm sau 2 lượt poll (4 giây)
    if (currentLength === lastLength && currentLength > 20) {
      noChangeCount++;
      if (!isLoading && noChangeCount >= 2) {
        console.log("Gemini đã viết xong hoàn toàn. Dừng poll.");
        break;
      }
    } else {
      noChangeCount = 0; // Nếu text vẫn tăng độ dài thì reset bộ đếm
    }

    lastLength = currentLength;
    await new Promise(r => setTimeout(r, 2000)); // Đợi 2 giây cho lượt poll tiếp theo
  }

  return response;
}

export async function load_content_vntq(on_done) {
  try {
    // 1. Tìm tab Vietnamthuquan
    const vntqTabs = await chrome.tabs.query({ url: "http://vietnamthuquan.eu/*" });
    if (!vntqTabs || vntqTabs.length === 0) {
      console.log("Không tìm thấy tab Nguồn");
      on_done("Không tìm thấy tab Nguồn");
      return;
    }

    // 2. Tìm tab Gemini
    const geminiTabs = await chrome.tabs.query({ url: "https://gemini.google.com/*" });
    if (!geminiTabs || geminiTabs.length === 0) {
      console.error("Không tìm thấy tab Gemini");
      on_done("Không tìm thấy tab Gemini");
      return;
    }

    // --- ĐÂY LÀ NƠI IN THÔNG BÁO THEO Ý BẠN ---
    const geminiTabId = geminiTabs[0].id;
    console.log(`%c[Success] Found Gemini Tab (ID: ${geminiTabId})\n`, 'color:#2c86e2;font:1.2rem bold;');

    // 3. Cào dữ liệu từ Vietnamthuquan
    const vntqResults = await chrome.scripting.executeScript({
      target: { tabId: vntqTabs[0].id },
      func: () => {
        const parts = [];
        const chuongso = document.querySelector(".chuongso");
        if (chuongso) parts.push(chuongso.innerText.trim());
        const tuahoi = document.querySelector(".tuahoi1");
        if (tuahoi) parts.push(tuahoi.innerText.trim());
        const noidung = document.querySelector(".chuhoavn");
        if (noidung) parts.push(noidung.innerText.trim());
        return parts.join("");
      }
    });

    const raw = vntqResults?.[0]?.result ?? "";

    console.log(`%c[Success] Raw Data: ${raw.slice(0, 100)})...\n`, 'color:#2c86e2;font:1.2rem bold;');

    if (!raw) {
      console.log("Không lấy được nội dung");
      on_done("Không lấy được nội dung");
      return;
    }

    // 4. Tiến hành gọi hàm gửi sang Gemini (Hàm await này giờ sẽ chạy đúng tuần tự)
    console.log("Đang gửi dữ liệu sang tab Gemini để sửa lỗi...");
    const fixed = await askGeminiWeb(geminiTabId, raw);
    console.log("Dữ liệu đã sửa từ Gemini:", fixed.slice(0, 100));

    // 5. Trả kết quả về qua callback
    on_done(fixed);

  } catch (error) {
    console.error("Đã xảy ra lỗi trong quá trình xử lý:", error);
    on_done("");
  }
}
