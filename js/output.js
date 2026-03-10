import { listenAssets, updateAsset } from "./firebase-config.js";

let semuaAssets = [];
let idAsetDipilih = null;

document.addEventListener("DOMContentLoaded", function () {
  listenAssets((assets) => {
    semuaAssets = assets;
    tampilOutput();
  });
});

function tampilOutput() {
  const assets = semuaAssets;
  document.getElementById("sum_total").textContent = assets.length;

  const wrap = document.getElementById("outputTabelWrap");
  if (!assets.length) {
    wrap.innerHTML = `<div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>Belum ada laporan<br>
      <small>Entry data terlebih dahulu</small></div>`;
    return;
  }

  // Kumpulkan ULP unik dari data
  const ulps = [...new Set(assets.map((a) => a.ulp).filter(Boolean))].sort();

  // Kelompokkan berdasarkan nama aset
  const kelompok = {};
  assets.forEach((a) => {
    const key = a.nama;
    if (!kelompok[key]) {
      kelompok[key] = {
        nama: a.nama,
        kontrakTotal: 0,
        dataUlp: {},
      };
    }
    kelompok[key].kontrakTotal++;
    if (!kelompok[key].dataUlp[a.ulp]) {
      kelompok[key].dataUlp[a.ulp] = { kontrak: 0, realisasi: 0, assetIds: [] };
    }
    kelompok[key].dataUlp[a.ulp].kontrak++;
    kelompok[key].dataUlp[a.ulp].realisasi += a.realisasi || 0;
    kelompok[key].dataUlp[a.ulp].assetIds.push(a.id);
  });

  // Urutan tetap sesuai dropdown entry
  const urutanNama = [
    "Mobil Station 1500 CC",
    "Mobil Station 2500 CC",
    "Mobil Pickup 1500 CC",
    "Mobil Pickup 2500 CC",
    "Mobil Pickup 2500 CC Single Cabin 4WD",
    "Mobil Pickup 2500 CC Double Cabin 4WD",
    "Mobil Pickup 2500 CC Double Cabin 4WD (TL K3)",
    "Sepeda Motor Sport (Listrik)",
    "Sepeda Motor Trail",
    "Sepeda Motor Trail (TL K3)",
    "Truk Engkel",
    "Mobil Skylift - Crane",
    "Perahu mesin 100 HP",
    "Helm Safety",
    "Sepatu Kerja Safety",
    "Sarung Tangan Kulit",
    "Kacamata Safety/Sunglasses",
    "Jas Hujan Two Pieces",
    "Pakaian/Seragam Kerja",
    "Rompi Distribusi",
    "Tang Kombinasi",
    "Obeng Plus(+)",
    "Obeng Minus(-)",
    "Cutter Set",
    "Tas Perkakas",
    "Headlamp",
    "Tang Ampere (Clip on AVO Meter digital) 600 A",
    "Phase Sequence",
    "Alat Ukur Tahanan Isolasi type 10.000 Volt DC",
    "Wire Cutter s.d 240 mm^2",
    "Lampu Sorot 12 V ; 100 Watt",
    "Lampu Senter 6 Battery (Re-charger)",
    "Tool Set Mekanik Lengkap",
    "Chainsaw",
    "Angkus Isolasi",
    "Parang",
    "Tali Manila 12 mm2 (20m)",
    "Hidrolik Press (dies uk 35 s.d 300 mm2)",
    "Coffing Hoist/Rachet Puller 1,5 Ton",
    "Kotak Peralatan (Termasuk Arit)",
    "Tangga Fiber (2 Section Ladder)",
    "Smartphone + Power Bank (APKT Mobile)",
    "Telescopic Hotstick 20 kV ; 10,7 mtr",
    "Hand Press (dies uk 10 s.d 70 mm2)",
    "Hand Press Electric (dies uk 10 s.d 70 mm2)",
    "Tang Ampere 3 Phase",
    "Earth Tester",
    "Full Body Hardness + Double Lanyard",
    "Voltage Detector 20 kV",
    "Sarung Tangan 20 kV kelas 2",
    "Sepatu Berisolasi 20 kV kelas 2",
    "Sarung Tangan Tahan Tegangan 1kV (Karet)",
    "Radio Komunikasi Unit Lengkap dengan Antena VHF",
    "Radio Komunikasi HT",
    "Groundcluster Lengkap dengan Cable, Groundrod dan Kelengkapannya",
    "APAR",
    "Kotak P3K Jenis A",
    "Traffic Cone + Webbing",
    "Tanda Papan Peringatan Kerja",
    "LOTO",
  ];

  const baris = Object.values(kelompok).sort((a, b) => {
    const ia = urutanNama.indexOf(a.nama);
    const ib = urutanNama.indexOf(b.nama);
    if (ia === -1 && ib === -1) return a.nama.localeCompare(b.nama);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  // Hitung total per ULP
  const totalUlp = {};
  ulps.forEach((ulp) => {
    totalUlp[ulp] = { kontrak: 0, realisasi: 0 };
    baris.forEach((b) => {
      if (b.dataUlp[ulp]) {
        totalUlp[ulp].kontrak += b.dataUlp[ulp].kontrak;
        totalUlp[ulp].realisasi += b.dataUlp[ulp].realisasi;
      }
    });
  });

  const th = (txt, extra = "") =>
    `<th style="background:linear-gradient(135deg,#003087,#0057B8);color:#fff !important;font-size:11px;white-space:nowrap;${extra}">${txt}</th>`;
  const lebarMin = 350 + ulps.length * 160;

  let html = `<div style="overflow-x:auto">
  <table class="table table-bordered table-sm mb-0 align-middle" style="min-width:${lebarMin}px;font-size:12px">
    <thead>
      <tr>
        ${th("No", "width:40px")}
        ${th("Kendaraan / Peralatan", "min-width:160px")}
        ${th("Jml<br>Kontrak", "text-align:center")}
        ${ulps.map((u) => `<th colspan="3" style="background:linear-gradient(135deg,#003087,#0057B8);color:#fff !important;text-align:center;border-left:3px solid rgba(255,255,255,0.4)">${u}</th>`).join("")}
        ${th("Jumlah<br>Realisasi", "text-align:center;border-left:3px solid rgba(255,255,255,0.4)")}
      </tr>
      <tr>
        <th colspan="3" style="background:#001a5e;color:#fff !important"></th>
        ${ulps
          .map(
            () => `
          <th style="background:#001a5e;color:#fff !important;font-size:10px;border-left:3px solid rgba(255,255,255,0.3)">Kontrak</th>
          <th style="background:#001a5e;color:#fff !important;font-size:10px">Realisasi</th>
          <th style="background:#001a5e;color:#fff !important;font-size:10px">Selisih</th>`,
          )
          .join("")}
        <th style="background:#001a5e;color:#fff !important;font-size:10px;border-left:3px solid rgba(255,255,255,0.3)"></th>
      </tr>
    </thead>
    <tbody>`;

  baris.forEach((b, i) => {
    let totalRealisasiBaris = 0;
    ulps.forEach((ulp) => {
      if (b.dataUlp[ulp]) totalRealisasiBaris += b.dataUlp[ulp].realisasi;
    });

    html += `<tr>
      <td class="text-muted text-center">${i + 1}</td>
      <td class="fw-semibold">${b.nama}</td>
      <td class="text-center fw-bold text-primary">${b.kontrakTotal}</td>
      ${ulps
        .map((ulp) => {
          const d = b.dataUlp[ulp];
          if (!d)
            return `<td class="text-center text-muted" style="border-left:3px solid #dee2e6">—</td><td class="text-center text-muted">—</td><td class="text-center text-muted">—</td>`;
          const selisih = d.kontrak - d.realisasi;
          const wSelisih =
            selisih < 0 ? "#dc3545" : selisih === 0 ? "#198754" : "#0d6efd";
          const sudah = d.realisasi > 0;
          const assetId = d.assetIds[0];
          return `
          <td class="text-center fw-semibold" style="border-left:3px solid #dee2e6">${d.kontrak}</td>
          <td class="text-center">
            <div class="fw-bold ${sudah ? "" : "text-muted"}">${sudah ? d.realisasi : "—"}</div>
            <button onclick="bukaModalRealisasi('${assetId}')"
              class="btn btn-${sudah ? "outline-success" : "primary"} btn-sm py-0 px-2 mt-1"
              style="font-size:10px">${sudah ? "✏️ Edit" : "➕ Isi"}</button>
          </td>
          <td class="text-center fw-bold" style="color:${wSelisih}">${sudah ? selisih : "—"}</td>`;
        })
        .join("")}
      <td class="text-center fw-bold text-success" style="border-left:3px solid #dee2e6">${totalRealisasiBaris || "—"}</td>
    </tr>`;
  });

  // Baris TOTAL
  const grandTotal = ulps.reduce(
    (s, ulp) => s + (totalUlp[ulp]?.realisasi || 0),
    0,
  );
  const totalKontrak = baris.reduce((s, b) => s + b.kontrakTotal, 0);

  html += `<tr style="background:#EEF3FF;font-weight:800;border-top:2px solid #003087">
    <td colspan="2" style="color:#003087">TOTAL</td>
    <td class="text-center" style="color:#003087">${totalKontrak}</td>
    ${ulps
      .map((ulp) => {
        const t = totalUlp[ulp];
        const selisih = t.kontrak - t.realisasi;
        const warna =
          selisih < 0 ? "#dc3545" : selisih === 0 ? "#198754" : "#003087";
        return `<td class="text-center" style="color:#003087;border-left:3px solid #dee2e6">${t.kontrak}</td>
              <td class="text-center" style="color:#198754">${t.realisasi}</td>
              <td class="text-center" style="color:${warna}">${selisih}</td>`;
      })
      .join("")}
    <td class="text-center" style="color:#198754;border-left:3px solid #dee2e6">${grandTotal}</td>
  </tr>`;

  html += `</tbody></table></div>`;
  wrap.innerHTML = html;
}

// ===== MODAL REALISASI =====
function bukaModalRealisasi(assetId) {
  const aset = semuaAssets.find((a) => a.id === assetId);
  if (!aset) return;
  idAsetDipilih = assetId;

  const kontrak = semuaAssets.filter(
    (a) => a.nama === aset.nama && a.ulp === aset.ulp,
  ).length;
  document.getElementById("modalNamaAset").textContent = aset.nama;
  document.getElementById("modalUlpAset").textContent = "ULP " + aset.ulp;
  document.getElementById("modalJmlKontrak").textContent = kontrak;
  document.getElementById("inputRealisasi").value =
    aset.realisasi > 0 ? aset.realisasi : "";
  hitungSelisihModal();
  new bootstrap.Modal(document.getElementById("modalRealisasi")).show();
}

function tutupModalRealisasi() {
  bootstrap.Modal.getInstance(
    document.getElementById("modalRealisasi"),
  )?.hide();
}

function hitungSelisihModal() {
  const kontrak =
    parseInt(document.getElementById("modalJmlKontrak").textContent) || 0;
  const realisasi =
    parseInt(document.getElementById("inputRealisasi").value) || 0;
  const selisih = kontrak - realisasi;
  const el = document.getElementById("modalSelisih");
  el.textContent = selisih;
  el.className =
    "fw-bold fs-5 " +
    (selisih < 0
      ? "text-danger"
      : selisih === 0
        ? "text-success"
        : "text-primary");
}

async function simpanRealisasi() {
  const realisasi =
    parseInt(document.getElementById("inputRealisasi").value) || 0;
  const btn = document.getElementById("btnSimpanRealisasi");
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
  btn.disabled = true;

  await updateAsset(idAsetDipilih, { realisasi });

  btn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Simpan Realisasi';
  btn.disabled = false;
  tutupModalRealisasi();
  tampilToast("✅ Realisasi berhasil disimpan!");
}

function tampilToast(pesan) {
  document.getElementById("toastMsg").textContent = pesan;
  new bootstrap.Toast(document.getElementById("toast"), { delay: 3000 }).show();
}

window.bukaModalRealisasi = bukaModalRealisasi;
window.tutupModalRealisasi = tutupModalRealisasi;
window.hitungSelisihModal = hitungSelisihModal;
window.simpanRealisasi = simpanRealisasi;
