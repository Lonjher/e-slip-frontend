const API_BASE_URL = "https://e-slip-backend.vercel.app/api";
const form = document.getElementById("paymentForm");
const submitBtn = document.getElementById("submitBtn");
const spinner = submitBtn.querySelector(".loading-spinner");
const submitText = submitBtn.querySelector(".submit-text");

let currentUniqueCode = "000";
let isSubmitting = false;
/* ================= UTIL ================= */

function formatRupiahDenganKodeUnik(value, kodeUnik) {
  const angka = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
  const kode = String(kodeUnik).padStart(3, "0");

  // Format rupiah normal dulu
  const rupiah = angka.toLocaleString("id-ID");

  // Ganti .000 TERAKHIR dengan .kodeUnik
  return rupiah.replace(/\.000$/, `.${kode}`);
}

function formatRupiah(angka) {
  return angka
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function unformatRupiah(str) {
  return parseInt(str.replace(/\D/g, ""), 10) || 0;
}

/* ================= AMOUNT ================= */
function setupAmountInput() {
  const input = document.getElementById("amountInput");
  if (!input) return;

  input.addEventListener("input", () => {
    input.value = value ? formatRupiah(value) : "";
    calculateTotal();
  });

  input.addEventListener("blur", () => {
    let value = unformatRupiah(input.value);
    if (value < 100) {
      value = 0;
      showToast("Jumlah minimum Rp 100.000", "warning");
    }
    input.value = formatRupiah(value);
    calculateTotal();
  });

  input.addEventListener("focus", () => input.select());
}

/* ================= TOTAL ================= */

function calculateTotal() {
  const unique = parseInt(currentUniqueCode) || 0;
  const total = formatRupiahDenganKodeUnik(document.getElementById("amountInput").value, unique);

  document.getElementById("displayAmount").textContent = formatRupiah(document.getElementById("amountInput").value);
  document.getElementById("displayUniqueCode").textContent = currentUniqueCode;
  document.getElementById("displayTotal").textContent = total;
  document.getElementById("totalAmount").textContent = formatRupiah(document.getElementById("amountInput").value);
}

/* ================= UNIQUE CODE ================= */

async function generateNewCode() {
  try {
    const res = await fetch(`${API_BASE_URL}/generate-code`);
    const json = await res.json();

    if (json.success) {
      currentUniqueCode = json.data.kode_unik;
    } else {
      throw new Error();
    }
  } catch {}

  document.getElementById("kode_unik").value = currentUniqueCode;
  document.getElementById("timestamp").textContent = formatTimestamp();
  calculateTotal();
}

function formatTimestamp(date = new Date()) {
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

/* ================= FORM ================= */
async function submitPayment() {
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-70", "cursor-not-allowed");

  try {
    const form = document.getElementById("paymentForm");

    const rawData = Object.fromEntries(new FormData(form).entries());

    const payload = {
      nama: rawData.nama,
      email: rawData.email,
      nim: rawData.nim,
      prodi: rawData.prodi,
      semester: parseInt(rawData.semester), // ⬅️ FIX
      kode_unik: rawData.kode_unik, // ⬅️ FIX
      jumlah_pembayaran: parseInt(
        unformatRupiah(document.getElementById("amountInput").value),
      ),
    };

    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.errors?.join(", ") || result.message);
    }

    showToast("Data pembayaran berhasil dikirim", "success");
    if (result.data.redirect_url) {
      setTimeout(() => {
        window.location.href = result.data.redirect_url;
      }, 1200);
    } else {
      console.error("redirect_url tidak ada", result);
    }
  } catch (e) {
    showToast("Gagal mengirim data. Coba lagi.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
  }
}

/* ================= INIT ================= */
function init() {
  setupAmountInput();
  generateNewCode();
  calculateTotal();

  document
    .getElementById("generateCodeBtn")
    .addEventListener("click", generateNewCode);

  document.getElementById("paymentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submitPayment({
      nama: nama.value,
      email: email.value,
      nim: nim.value,
      prodi: prodi.value,
      semester: semester.value,
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
