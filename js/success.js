// ===== Ambil id dari URL =====
const params = new URLSearchParams(window.location.search);
console.log(params);
const paymentId = params.get("id");

// ===== Validasi akses =====
if (!paymentId) {
    document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 class="text-xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
        <p class="text-gray-600 mb-4">Data pembayaran tidak ditemukan.</p>
        <a href="/" class="text-blue-600 underline">Kembali ke halaman pembayaran</a>
      </div>
    </div>
  `;
    throw new Error("id tidak ditemukan");
}

// ===== Helper =====
function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID").format(value);
}

function formatTanggal(iso) {
    return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta",
    });
}

// ===== Load data dari backend =====
async function loadPaymentDetail() {
    try {
        const res = await fetch(`/api/payments/${paymentId}`);
        const result = await res.json();

        if (!result.success) {
            throw new Error("Data tidak ditemukan");
        }

        const data = result.data;
        console.log(data);

        // ===== Informasi Mahasiswa =====
        document.getElementById("detailNama").textContent = data.nama;
        document.getElementById("detailNim").textContent = data.nim;
        document.getElementById("detailEmail").textContent = data.email;
        document.getElementById("detailProdi").textContent = data.prodi;
        document.getElementById("detailSemester").textContent = `Semester ${data.semester}`;

        document.getElementById("detailId").textContent = paymentId;
        document.getElementById("detailJumlah").textContent = "Rp " + formatRupiah(data.jumlah_pembayaran);
        document.getElementById("detailKodeUnik").textContent = data.kodeUnik;
        document.getElementById("detailTotal").textContent = "Rp " + data.total_pembayaran;
        document.getElementById("detailTimestamp").textContent = data.timestamp;

        // Cegah back submit
        window.history.replaceState(null, "", window.location.href);
    } catch (err) {
        document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <h2 class="text-red-600 font-bold">Gagal memuat data pembayaran</h2>
      </div>
    `;
    }
}

loadPaymentDetail();
