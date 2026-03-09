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
    wrap.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-inbox fs-1 d-block mb-2"></i>Belum ada laporan</div>`;
    return;
  }

  const ulps = [...new Set(assets.map((a) => a.ulp).filter(Boolean))].sort();
  const kelompok = {};
  assets.forEach((a) => {
    if (!kelompok[a.nama])
      kelompok[a.nama] = { nama: a.nama, kontrakTotal: 0, dataUlp: {} };
    kelompok[a.nama].kontrakTotal++;
    if (!kelompok[a.nama].dataUlp[a.ulp])
      kelompok[a.nama].dataUlp[a.ulp] = {
        kontrak: 0,
        realisasi: 0,
        assetId: a.id,
      };
    kelompok[a.nama].dataUlp[a.ulp].kontrak++;
    kelompok[a.nama].dataUlp[a.ulp].realisasi += a.realisasi || 0;
    kelompok[a.nama].dataUlp[a.ulp].assetId = a.id;
  });

  const baris = Object.values(kelompok);
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

  const thStyle = "color:#ffffff !important;background:transparent";
  const lebarMin = 300 + ulps.length * 180;
  let html = `<div style="overflow-x:auto"><table class="table table-bordered table-sm mb-0 align-middle" style="min-width:${lebarMin}px;font-size:12px">
    <thead>
      <tr style="background:linear-gradient(135deg,#003087,#0057B8)">
        <th rowspan="2" class="align-middle" style="${thStyle}">No</th>
        <th rowspan="2" class="align-middle" style="min-width:130px;${thStyle}">Kendaraan / Peralatan</th>
        <th rowspan="2" class="align-middle text-center" style="${thStyle}">Jml Kontrak</th>
        ${ulps.map((u) => `<th colspan="3" class="text-center" style="${thStyle};border-left:2px solid rgba(255,255,255,0.3)">${u}</th>`).join("")}
      </tr>
      <tr style="background:#001a5e">
        ${ulps
          .map(
            () => `
          <th style="font-size:10px;${thStyle};border-left:2px solid rgba(255,255,255,0.2)">Kontrak</th>
          <th style="font-size:10px;${thStyle}">Realisasi</th>
          <th style="font-size:10px;${thStyle}">Selisih</th>`,
          )
          .join("")}
      </tr>
    </thead>
    <tbody>`;

  baris.forEach((b, i) => {
    html += `<tr>
      <td class="text-muted">${i + 1}</td>
      <td class="fw-semibold">${b.nama}</td>
      <td class="text-center fw-bold text-primary">${b.kontrakTotal}</td>
      ${ulps
        .map((ulp) => {
          const d = b.dataUlp[ulp];
          if (!d)
            return `<td colspan="3" class="text-center text-muted">—</td>`;
          const selisih = d.kontrak - d.realisasi;
          const warna =
            selisih < 0 ? "danger" : selisih === 0 ? "success" : "primary";
          const sudah = d.realisasi > 0;
          return `
          <td class="text-center">${d.kontrak}</td>
          <td class="text-center">
            <div class="fw-bold ${sudah ? "" : "text-muted"}">${sudah ? d.realisasi : "—"}</div>
            <button onclick="bukaModalRealisasi('${d.assetId}')"
              class="btn btn-${sudah ? "success" : "primary"} btn-sm py-0 px-2 mt-1"
              style="font-size:10px">${sudah ? "✏️ Edit" : "➕ Isi"}</button>
          </td>
          <td class="text-center fw-bold text-${warna}">${sudah ? selisih : "—"}</td>`;
        })
        .join("")}
    </tr>`;
  });

  const totalKontrak = baris.reduce((s, b) => s + b.kontrakTotal, 0);
  html += `<tr class="table-primary fw-bold">
    <td colspan="2">TOTAL</td>
    <td class="text-center">${totalKontrak}</td>
    ${ulps
      .map((ulp) => {
        const t = totalUlp[ulp];
        const selisih = t.kontrak - t.realisasi;
        const warna =
          selisih < 0 ? "danger" : selisih === 0 ? "success" : "primary";
        return `<td class="text-center">${t.kontrak}</td><td class="text-center text-success">${t.realisasi}</td><td class="text-center text-${warna}">${selisih}</td>`;
      })
      .join("")}
  </tr></tbody></table></div>`;

  wrap.innerHTML = html;
}

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
    "fw-bold fs-5 text-" +
    (selisih < 0 ? "danger" : selisih === 0 ? "success" : "primary");
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
