import { listenAssets } from "./firebase-config.js";

let semuaAssets = [];
let filterUlp = "semua";

document.addEventListener("DOMContentLoaded", function () {
  listenAssets((assets) => {
    semuaAssets = assets;
    bangunFilterUlp();
    tampilData();
  });
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
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>Belum ada data<br>
      <small>Tambahkan melalui halaman Entry Data</small></td></tr>`;
    return;
  }

  if (!hasil.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-5 text-muted">
      <i class="bi bi-search fs-1 d-block mb-2"></i>Data tidak ditemukan</td></tr>`;
    return;
  }

  tbody.innerHTML = hasil
    .map((a, i) => {
      const fotoInfo =
        a.fotoFiles && a.fotoFiles.length
          ? `<span class="badge bg-success">📷 ${a.fotoFiles.length}</span>`
          : '<span class="text-muted">—</span>';
      const sisaWarna = "";
      return `<tr onclick="bukaDetail('${a.id}')" style="cursor:pointer" class="table-row-hover">
      <td class="text-muted small">${i + 1}</td>
      <td class="fw-semibold" style="min-width:130px">${sorot(a.nama, kata)}</td>
      <td><span class="badge bg-primary bg-opacity-10 text-primary">${sorot(a.ulp || "", kata)}</span></td>
      <td class="small">${a.tglUL || "—"}</td>
      <td class="small">${a.tglULP || "—"}</td>
      <td class="small text-center">${a.usia ?? "—"}</td>
      <td class="small text-center">${a.masaEkonomis || "—"}</td>
      <td class="small text-center fw-bold ${sisaWarna}">${a.sisa ?? "—"}</td>
      <td>${fotoInfo}</td>
    </tr>`;
    })
    .join("");
}

function bukaDetail(id) {
  const a = semuaAssets.find((x) => x.id === id);
  if (!a) return;

  document.getElementById("detailNama").textContent = a.nama || "—";
  document.getElementById("detailUlp").textContent = "📍 ULP " + (a.ulp || "—");
  document.getElementById("detailTglUL").textContent = a.tglUL || "—";
  document.getElementById("detailTglULP").textContent = a.tglULP || "—";
  document.getElementById("detailMasa").textContent = a.masaEkonomis ?? "—";
  document.getElementById("detailUsia").textContent = a.usia ?? "—";

  const sisa = a.sisa ?? null;
  const sisaEl = document.getElementById("detailSisa");
  sisaEl.textContent = sisa ?? "—";
  sisaEl.className = "fw-bold";

  // File BA
  const baEl = document.getElementById("detailBA");
  if (a.baFiles && a.baFiles.length) {
    baEl.innerHTML = a.baFiles
      .map(
        (f) => `<span class="badge bg-secondary rounded-2 p-2">📄 ${f}</span>`,
      )
      .join("");
  } else {
    baEl.innerHTML = '<span class="text-muted small">Tidak ada file</span>';
  }

  // File Foto
  const fotoEl = document.getElementById("detailFoto");
  if (a.fotoFiles && a.fotoFiles.length) {
    fotoEl.innerHTML = a.fotoFiles
      .map((f) => `<span class="badge bg-success rounded-2 p-2">📷 ${f}</span>`)
      .join("");
  } else {
    fotoEl.innerHTML = '<span class="text-muted small">Tidak ada foto</span>';
  }

  new bootstrap.Modal(document.getElementById("modalDetail")).show();
}

window.tampilData = tampilData;
window.setFilterUlp = setFilterUlp;
window.hapusCari = hapusCari;
window.bukaDetail = bukaDetail;
