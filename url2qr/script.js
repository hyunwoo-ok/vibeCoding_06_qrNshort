"use strict";
const input = document.getElementById("url");
const generate = document.getElementById("generate");
const result = document.getElementById("qr-result");
input.addEventListener("input", () => {
  generate.disabled = !input.value.trim();
  result.hidden = true;
  showStatus("");
});
document.addEventListener("pointermove", (event) => {
  document.body.style.setProperty("--mx", `${Math.round(event.clientX / innerWidth * 100)}%`);
  document.body.style.setProperty("--my", `${Math.round(event.clientY / innerHeight * 100)}%`);
});
document.getElementById("qr-form").addEventListener("submit", (event) => {
  event.preventDefault();
  result.hidden = true;
  try {
    const url = readWebUrl(input.value);
    if (typeof qrcode !== "function") throw new Error("QR코드 파일을 불러오지 못했습니다. 페이지를 새로고침해 주세요.");
    const qr = qrcode(0, "M");
    qr.addData(url, "Byte");
    qr.make();
    const count = qr.getModuleCount();
    const scale = Math.max(4, Math.floor(320 / (count + 8)));
    const canvas = document.getElementById("qr-canvas");
    canvas.width = canvas.height = (count + 8) * scale;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) context.fillRect((col + 4) * scale, (row + 4) * scale, scale, scale);
      }
    }
    const image = canvas.toDataURL("image/jpeg", 1);
    document.getElementById("qr-download").href = image;
    document.getElementById("download-button").href = image;
    document.getElementById("qr-url").textContent = url;
    result.hidden = false;
    showStatus("QR코드가 생성되었습니다. 스캔하거나 JPG로 저장해 보세요.");
  } catch (error) {
    showStatus(error instanceof TypeError ? "올바른 웹 주소를 입력해 주세요." :
      typeof error === "string" ? "주소가 너무 깁니다. 더 짧은 주소로 다시 시도해 주세요." : error.message, true);
  }
});
