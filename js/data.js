import { listenAssets, updateAsset, deleteAsset } from "./db.js";

let semuaAssets = [];
let filterUlp = "semua";

const masaEkonomisMap = {
  "Mobil Station 1500 CC": 1095,
  "Mobil Station 2500 CC": 1095,
  "Mobil Pickup 1500 CC": 1095,
  "Mobil Pickup 2500 CC": 1095,
  "Mobil Pickup 2500 CC Single Cabin 4WD": 1095,
  "Mobil Pickup 2500 CC Double Cabin 4WD": 1095,
  "Mobil Pickup 2500 CC Double Cabin 4WD (TL K3)": 1095,
  "Sepeda Motor Sport (Listrik)": 1095,
  "Sepeda Motor Trail": 1095,
  "Sepeda Motor Trail (TL K3)": 1095,
  "Truk Engkel": 1095,
  "Mobil Skylift - Crane": 1095,
  "Perahu mesin 100 HP": 1095,
  "Helm Safety": 365,
  "Sepatu Kerja Safety": 365,
  "Sarung Tangan Kulit": 365,
  "Kacamata Safety/Sunglasses": 365,
  "Jas Hujan Two Pieces": 365,
  "Pakaian/Seragam Kerja": 365,
  "Rompi Distribusi": 365,
  "Tang Kombinasi": 365,
  "Obeng Plus(+)": 365,
  "Obeng Minus(-)": 365,
  "Cutter Set": 365,
  "Tas Perkakas": 365,
  Headlamp: 365,
  "Tang Ampere (Clip on AVO Meter digital) 600 A": 365,
  "Phase Sequence": 730,
  "Alat Ukur Tahanan Isolasi type 10.000 Volt DC": 730,
  "Wire Cutter s.d 240 mm^2": 730,
  "Lampu Sorot 12 V ; 100 Watt": 365,
  "Lampu Senter 6 Battery (Re-charger)": 365,
  "Tool Set Mekanik Lengkap": 365,
  Chainsaw: 730,
  "Angkus Isolasi": 365,
  Parang: 183,
  "Tali Manila 12 mm2 (20m)": 365,
  "Hidrolik Press (dies uk 35 s.d 300 mm2)": 730,
  "Coffing Hoist/Rachet Puller 1,5 Ton": 730,
  "Kotak Peralatan (Termasuk Arit)": 730,
  "Tangga Fiber (2 Section Ladder)": 548,
  "Smartphone + Power Bank (APKT Mobile)": 730,
  "Telescopic Hotstick 20 kV ; 10,7 mtr": 548,
  "Hand Press (dies uk 10 s.d 70 mm2)": 730,
  "Hand Press Electric (dies uk 10 s.d 70 mm2)": 730,
  "Tang Ampere 3 Phase": 730,
  "Earth Tester": 1095,
  "Full Body Hardness + Double Lanyard": 730,
  "Voltage Detector 20 kV": 730,
  "Sarung Tangan 20 kV kelas 2": 1095,
  "Sepatu Berisolasi 20 kV kelas 2": 1095,
  "Sarung Tangan Tahan Tegangan 1kV (Karet)": 365,
  "Radio Komunikasi Unit Lengkap dengan Antena VHF": 1095,
  "Radio Komunikasi HT": 730,
  "Groundcluster Lengkap dengan Cable, Groundrod dan Kelengkapannya": 730,
  APAR: 730,
  "Kotak P3K Jenis A": 365,
  "Traffic Cone + Webbing": 913,
  "Tanda Papan Peringatan Kerja": 730,
  LOTO: 365,
};

function hitungUsia(tglUL, tglULP) {
  const tglRef = tglUL || tglULP;
  if (!tglRef) return null;
  return Math.max(0, Math.floor((new Date() - new Date(tglRef)) / 86400000));
}

document.addEventListener("DOMContentLoaded", function () {
  listenAssets((assets) => {
    semuaAssets = assets;
    bangunFilterUlp();
    tampilData();
  });

  setInterval(() => {
    const el = document.getElementById("jamSekarang");
    if (el) {
      el.textContent = new Date().toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
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
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>Belum ada data</td></tr>`;
    return;
  }
  if (!hasil.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-5 text-muted"><i class="bi bi-search fs-1 d-block mb-2"></i>Data tidak ditemukan</td></tr>`;
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
      return `<tr data-id="${a.id}" style="cursor:pointer">
      <td class="text-muted small" onclick="bukaDetail('${a.id}')">${i + 1}</td>
      <td class="fw-semibold" style="min-width:130px" onclick="bukaDetail('${a.id}')">${sorot(a.nama, kata)}</td>
      <td onclick="bukaDetail('${a.id}')"><span class="badge bg-primary bg-opacity-10 text-primary">${sorot(a.ulp || "", kata)}</span></td>
      <td class="small" onclick="bukaDetail('${a.id}')">${a.tglUL || "—"}</td>
      <td class="small" onclick="bukaDetail('${a.id}')">${a.tglULP || "—"}</td>
      <td class="small text-center col-usia" onclick="bukaDetail('${a.id}')">${usia ?? "—"}</td>
      <td class="small text-center" onclick="bukaDetail('${a.id}')">${a.masaEkonomis || "—"}</td>
      <td class="small text-center fw-bold col-sisa" onclick="bukaDetail('${a.id}')">${sisa ?? "—"}</td>
      <td onclick="bukaDetail('${a.id}')">${fotoInfo}</td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-outline-primary btn-sm py-0 px-2" style="font-size:10px" onclick="bukaEdit('${a.id}')">✏️</button>
          <button class="btn btn-outline-danger btn-sm py-0 px-2" style="font-size:10px" onclick="konfirmasiHapus('${a.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
    })
    .join("");
}

// ===== DETAIL =====
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

  // Kondisi
  const kondisiEl = document.getElementById("detailKondisi");
  if (kondisiEl) {
    kondisiEl.textContent = a.kondisi || "Baik";
    kondisiEl.className =
      "fw-bold " +
      (a.kondisi === "Kurang Baik" ? "text-warning" : "text-success");
  }
  // Keterangan
  const ketEl = document.getElementById("detailKet");
  if (ketEl) ketEl.textContent = a.ket || "—";

  const renderFiles = (files, el) => {
    if (!files || !files.length) {
      el.innerHTML = '<span class="text-muted small">Tidak ada file</span>';
      return;
    }
    el.innerHTML = files
      .map((f) => {
        if (
          typeof f === "object" &&
          f.data &&
          f.tipe &&
          f.tipe.startsWith("image/")
        )
          return `<div class="mb-1"><img src="${f.data}" style="max-width:100%;max-height:150px;border-radius:8px;object-fit:cover"><div class="text-muted" style="font-size:10px">${f.nama}</div></div>`;
        if (typeof f === "object" && f.nama)
          return `<span class="badge bg-secondary rounded-2 p-2">📄 ${f.nama}</span>`;
        return `<span class="badge bg-secondary rounded-2 p-2">📄 ${f}</span>`;
      })
      .join("");
  };
  renderFiles(a.baFiles, document.getElementById("detailBA"));
  renderFiles(a.fotoFiles, document.getElementById("detailFoto"));

  new bootstrap.Modal(document.getElementById("modalDetail")).show();
}

// ===== EDIT =====
function bukaEdit(id) {
  const a = semuaAssets.find((x) => x.id === id);
  if (!a) return;

  document.getElementById("editId").value = a.id;
  document.getElementById("editNama").value = a.nama || "";
  document.getElementById("editUlp").value = a.ulp || "";
  document.getElementById("editTglUL").value = a.tglUL || "";
  document.getElementById("editTglULP").value = a.tglULP || "";
  document.getElementById("editKet").value = a.ket || "";
  const kondisiVal = a.kondisi || "Baik";
  const kondisiRadio = document.querySelector(
    `input[name="editKondisi"][value="${kondisiVal}"]`,
  );
  if (kondisiRadio) kondisiRadio.checked = true;

  new bootstrap.Modal(document.getElementById("modalEdit")).show();
}

async function simpanEdit() {
  const id = document.getElementById("editId").value;
  const nama = document.getElementById("editNama").value;
  const ulp = document.getElementById("editUlp").value;
  const tglUL = document.getElementById("editTglUL").value;
  const tglULP = document.getElementById("editTglULP").value;

  if (!nama || !ulp) {
    tampilToast("⚠️ Nama dan ULP wajib diisi!");
    return;
  }

  const kondisi =
    document.querySelector('input[name="editKondisi"]:checked')?.value ||
    "Baik";
  const ket = document.getElementById("editKet").value.trim();

  const masa = masaEkonomisMap[nama] || 0;
  const tglRef = tglUL || tglULP;
  const usia = tglRef
    ? Math.max(0, Math.floor((new Date() - new Date(tglRef)) / 86400000))
    : 0;
  const sisa = masa - usia;

  const btn = document.getElementById("btnSimpanEdit");
  btn.disabled = true;
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-1"></span>Menyimpan...';

  await updateAsset(id, {
    nama,
    ulp,
    tglUL,
    tglULP,
    masaEkonomis: masa,
    usia,
    sisa,
    kondisi,
    ket,
  });

  btn.disabled = false;
  btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Simpan';
  bootstrap.Modal.getInstance(document.getElementById("modalEdit"))?.hide();
  tampilToast("✅ Data berhasil diupdate!");
}

// ===== HAPUS =====
function konfirmasiHapus(id) {
  const a = semuaAssets.find((x) => x.id === id);
  if (!a) return;
  document.getElementById("hapusNama").textContent = a.nama + " — ULP " + a.ulp;
  document.getElementById("btnKonfirmasiHapus").onclick = () =>
    eksekusiHapus(id);
  new bootstrap.Modal(document.getElementById("modalHapus")).show();
}

async function eksekusiHapus(id) {
  await deleteAsset(id);
  bootstrap.Modal.getInstance(document.getElementById("modalHapus"))?.hide();
  tampilToast(" Data berhasil dihapus!");
}

function tampilToast(pesan) {
  document.getElementById("toastMsg").textContent = pesan;
  new bootstrap.Toast(document.getElementById("toast"), { delay: 3000 }).show();
}

window.tampilData = tampilData;
window.setFilterUlp = setFilterUlp;
window.hapusCari = hapusCari;
window.bukaDetail = bukaDetail;
window.bukaEdit = bukaEdit;
window.simpanEdit = simpanEdit;
window.konfirmasiHapus = konfirmasiHapus;
