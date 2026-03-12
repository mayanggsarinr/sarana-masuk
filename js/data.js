import { listenAssets } from "./firebase-config.js";

let semuaAssets = [];
let filterUlp = "semua";

// Hitung usia realtime dari tanggal masuk sampai HARI INI
function hitungUsia(tglUL, tglULP) {
  const tglRef = tglUL || tglULP;
  if (!tglRef) return null;
  const selisih = Math.floor((new Date() - new Date(tglRef)) / 86400000);
  return Math.max(0, selisih);
}

document.addEventListener("DOMContentLoaded", function () {
  listenAssets((assets) => {
    semuaAssets = assets;
    bangunFilterUlp();
    tampilData();
  });

  // Update waktu realtime setiap detik
  setInterval(() => {
    const el = document.getElementById("jamSekarang");
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    // Update usia & sisa di setiap baris tabel secara realtime
    semuaAssets.forEach((a) => {
      const usia = hitungUsia(a.tglUL, a.tglULP);
      const sisa =
        a.masaEkonomis != null && usia != null ? a.masaEkonomis - usia : null;
      const tr = document.querySelector(`tr[data-id="${a.id}"]`);
      if (tr) {
        tr.querySelector(".col-usia").textContent = usia ?? "—";
        tr.querySelector(".col-sisa").textContent = sisa ?? "—";
      }
    });
  }, 1000);
});

function sorot(teks, kata) {
  if (!kata) return String(teks);
  const regex = new RegExp(
    `(${kata.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  return String(teks).replace(regex, '<span class="highlight">$1</span>');
}

function bangunFilterUlp() {
  const ulps = [
    ...new Set(semuaAssets.map((a) => a.ulp).filter(Boolean)),
  ].sort();
  const container = document.getElementById("ulpFilters");
  container.innerHTML = `<button class="filter-chip ${filterUlp === "semua" ? "active" : ""}" onclick="setFilterUlp('semua',this)">Semua ULP</button>`;
  ulps.forEach((ulp) => {
    const btn = document.createElement("button");
    btn.className = "filter-chip" + (filterUlp === ulp ? " active" : "");
    btn.textContent = "📍 " + ulp;
    btn.onclick = function () {
      setFilterUlp(ulp, this);
    };
    container.appendChild(btn);
  });
}

function setFilterUlp(ulp, el) {
  filterUlp = ulp;
  document
    .querySelectorAll("#ulpFilters .filter-chip")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  tampilData();
}

function hapusCari() {
  document.getElementById("inputCari").value = "";
  document.getElementById("btnHapusCari").classList.add("d-none");
  tampilData();
}

function tampilData() {
  const kata = (document.getElementById("inputCari").value || "")
    .trim()
    .toLowerCase();
  const btnHapus = document.getElementById("btnHapusCari");
  kata ? btnHapus.classList.remove("d-none") : btnHapus.classList.add("d-none");

  const hasil = semuaAssets.filter((a) => {
    const cocokCari =
      !kata ||
      (a.nama || "").toLowerCase().includes(kata) ||
      (a.ulp || "").toLowerCase().includes(kata);
    const cocokUlp = filterUlp === "semua" || a.ulp === filterUlp;
    return cocokCari && cocokUlp;
  });

  document.getElementById("infoHasil").textContent =
    kata || filterUlp !== "semua"
      ? `Menampilkan ${hasil.length} dari ${semuaAssets.length} aset`
      : "";
  document.getElementById("jumlahAset").textContent =
    semuaAssets.length + " aset";

  const tbody = document.getElementById("tabelBody");

  if (!semuaAssets.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>Belum ada data<br>
      <small>Tambahkan melalui halaman Entry Data</small></td></tr>`;
    return;
  }

  if (!hasil.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-5 text-muted">
      <i class="bi bi-search fs-1 d-block mb-2"></i>Data tidak ditemukan</td></tr>`;
    return;
  }

  tbody.innerHTML = hasil
    .map((a, i) => {
      const usia = hitungUsia(a.tglUL, a.tglULP);
      const sisa =
        a.masaEkonomis != null && usia != null ? a.masaEkonomis - usia : null;
      const fotoInfo =
        a.fotoFiles && a.fotoFiles.length
          ? `<span class="badge bg-success">📷 ${a.fotoFiles.length}</span>`
          : '<span class="text-muted">—</span>';
      return `<tr onclick="bukaDetail('${a.id}')" data-id="${a.id}" style="cursor:pointer">
      <td class="text-muted small">${i + 1}</td>
      <td class="fw-semibold" style="min-width:130px">${sorot(a.nama, kata)}</td>
      <td><span class="badge bg-primary bg-opacity-10 text-primary">${sorot(a.ulp || "", kata)}</span></td>
      <td class="small">${a.tglUL || "—"}</td>
      <td class="small">${a.tglULP || "—"}</td>
      <td class="small text-center col-usia">${usia ?? "—"}</td>
      <td class="small text-center">${a.masaEkonomis || "—"}</td>
      <td class="small text-center fw-bold col-sisa">${sisa ?? "—"}</td>
      <td>${fotoInfo}</td>
    </tr>`;
    })
    .join("");
}

function bukaDetail(id) {
  const a = semuaAssets.find((x) => x.id === id);
  if (!a) return;

  const usia = hitungUsia(a.tglUL, a.tglULP);
  const sisa =
    a.masaEkonomis != null && usia != null ? a.masaEkonomis - usia : null;

  document.getElementById("detailNama").textContent = a.nama || "—";
  document.getElementById("detailUlp").textContent = "📍 ULP " + (a.ulp || "—");
  document.getElementById("detailTglUL").textContent = a.tglUL || "—";
  document.getElementById("detailTglULP").textContent = a.tglULP || "—";
  document.getElementById("detailMasa").textContent = a.masaEkonomis ?? "—";
  document.getElementById("detailUsia").textContent = usia ?? "—";
  document.getElementById("detailSisa").textContent = sisa ?? "—";

  const baEl = document.getElementById("detailBA");
  baEl.innerHTML =
    a.baFiles && a.baFiles.length
      ? a.baFiles
          .map(
            (f) =>
              `<span class="badge bg-secondary rounded-2 p-2">📄 ${f}</span>`,
          )
          .join("")
      : '<span class="text-muted small">Tidak ada file</span>';

  const fotoEl = document.getElementById("detailFoto");
  fotoEl.innerHTML =
    a.fotoFiles && a.fotoFiles.length
      ? a.fotoFiles
          .map(
            (f) =>
              `<span class="badge bg-success rounded-2 p-2">📷 ${f}</span>`,
          )
          .join("")
      : '<span class="text-muted small">Tidak ada foto</span>';

  new bootstrap.Modal(document.getElementById("modalDetail")).show();
}

window.tampilData = tampilData;
window.setFilterUlp = setFilterUlp;
window.hapusCari = hapusCari;
window.bukaDetail = bukaDetail;
