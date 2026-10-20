"use strict";
function readWebUrl(value) {
  const url = new URL(value.trim());
  if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) {
    throw new Error("https:// 또는 http://로 시작하는 웹 주소를 입력해 주세요.");
  }
  // Normalize non-ASCII paths and query values for portable QR encoding.
  return url.href.replace(/[^\x00-\x7F]/gu, (char) => encodeURIComponent(char));
}
function showStatus(message, error = false) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.classList.toggle("error", error);
}
