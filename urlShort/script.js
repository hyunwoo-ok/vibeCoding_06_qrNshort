"use strict";
const input = document.getElementById("url");
const button = document.getElementById("shorten");
const result = document.getElementById("short-result");
const cache = new Map();
let busy = false;
let retryAfter = 0;
function updateButton() {
  button.disabled = busy || !input.value.trim();
}
input.addEventListener("input", () => {
  result.hidden = true;
  showStatus("");
  updateButton();
});
async function requestShortUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch("https://spoo.me/", {
      method: "POST",
      headers: {Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({url}),
      signal: controller.signal
    });
    if (response.status === 429) {
      retryAfter = Date.now() + 60000;
      throw new Error("요청이 많습니다. 1분 후 다시 시도해 주세요.");
    }
    if (!response.ok) throw new Error("단축 서비스가 요청을 처리하지 못했습니다. 주소를 확인하고 잠시 후 다시 시도해 주세요.");
    const data = await response.json();
    const short = new URL(data.short_url);
    if (!["http:", "https:"].includes(short.protocol) || short.hostname !== "spoo.me" || short.username || short.password || short.pathname === "/") {
      throw new Error("올바른 단축 URL을 받지 못했습니다.");
    }
    short.protocol = "https:";
    return short.href;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
    if (error instanceof TypeError) throw new Error("단축 서비스에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.");
    throw error;
  } finally { clearTimeout(timer); }
}
document.getElementById("short-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  result.hidden = true;
  let original;
  try { original = readWebUrl(input.value); }
  catch { showStatus("https:// 또는 http://로 시작하는 올바른 웹 주소를 입력해 주세요.", true); return; }
  if (Date.now() < retryAfter) {
    showStatus("서비스 요청 제한으로 잠시 기다려야 합니다. 1분 후 다시 시도해 주세요.", true);
    return;
  }
  busy = true;
  input.disabled = true;
  button.textContent = "단축 중…";
  updateButton();
  showStatus("단축 링크를 만들고 있습니다.");
  try {
    const short = cache.get(original) || await requestShortUrl(original);
    cache.set(original, short);
    document.getElementById("short-output").value = short;
    document.getElementById("original").textContent = `원본 URL: ${original}`;
    document.getElementById("visit").href = short;
    result.hidden = false;
    showStatus("단축 URL이 생성되었습니다.");
  } catch (error) { showStatus(error.message, true); }
  finally {
    busy = false;
    input.disabled = false;
    button.textContent = "단축하기";
    updateButton();
  }
});
document.getElementById("copy").addEventListener("click", async () => {
  const output = document.getElementById("short-output");
  try {
    await navigator.clipboard.writeText(output.value);
    showStatus("복사하였습니다.");
    alert("복사하였습니다.");
  } catch {
    output.focus();
    output.select();
    showStatus("자동 복사를 사용할 수 없습니다. 선택된 주소를 Ctrl+C 또는 길게 눌러 복사해 주세요.", true);
  }
});
