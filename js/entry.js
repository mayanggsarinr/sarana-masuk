import { addAsset } from "./firebase-config.js";

function hitungUsia() {
  const tglUL = document.getElementById("f_tgl_ul").value;
  const tglULP = document.getElementById("f_tgl_ulp").value;
  const masa = parseInt(document.getElementById("f_masa_ekonomis").value) || 0;
  const tglRef = tglUL || tglULP;
  if (!tglRef) return;
  const usia = Math.max(
    0,
    Math.floor((new Date() - new Date(tglRef)) / 86400000),
  );
  document.getElementById("calc_usia").textContent = usia + " hari";
  if (masa > 0)
    document.getElementById("calc_sisa").textContent = masa - usia + " hari";
}

function previewFiles(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  preview.innerHTML = "";
  Array.from(input.files).forEach((file) => {
    const div = document.createElement("div");
    div.className = "badge bg-secondary rounded-2 p-2";
    div.textContent = "📄 " + file.name;
    preview.appendChild(div);
  });
}

async function simpanEntry() {
  const nama = document.getElementById("f_nama").value.trim();
  const ulp = document.getElementById("f_ulp").value;
  const tglUL = document.getElementById("f_tgl_ul").value;
  const tglULP = document.getElementById("f_tgl_ulp").value;

  if (!nama) {
    tampilToast("⚠️ Nama kendaraan/peralatan wajib diisi!");
    return;
  }
  if (!ulp) {
    tampilToast("⚠️ ULP Penerima wajib dipilih!");
    return;
  }
  if (!tglUL && !tglULP) {
    tampilToast("⚠️ Tanggal diterima wajib diisi!");
    return;
  }

  const masa = parseInt(document.getElementById("f_masa_ekonomis").value) || 0;
  const tglRef = tglUL || tglULP;
  const usia = Math.max(
    0,
    Math.floor((new Date() - new Date(tglRef)) / 86400000),
  );
  const sisa = masa - usia;

  // Ambil nama file saja (tidak simpan base64)
  const baNames = Array.from(document.getElementById("file_ba").files).map(
    (f) => f.name,
  );
  const fotoNames = Array.from(document.getElementById("file_foto").files).map(
    (f) => f.name,
  );

  const btn = document.getElementById("btnSimpan");
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
  btn.disabled = true;

  try {
    await addAsset({
      no: document.getElementById("f_no").value.trim(),
      nama: nama,
      tglUL: tglUL,
      tglULP: tglULP,
      ulp: ulp,
      masaEkonomis: masa,
      usia: usia,
      sisa: sisa,
      realisasi: 0,
      baFiles: baNames,
      fotoFiles: fotoNames,
      tglEntry: new Date().toISOString(),
    });
    resetForm();
    tampilToast("✅ Data berhasil disimpan!");
  } catch (e) {
    console.error(e);
    tampilToast("❌ Gagal menyimpan, coba lagi!");
  }

  btn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Simpan Data Aset';
  btn.disabled = false;
}

function resetForm() {
  ["f_no", "f_nama", "f_tgl_ul", "f_tgl_ulp", "f_masa_ekonomis"].forEach(
    (id) => {
      document.getElementById(id).value = "";
    },
  );
  document.getElementById("f_ulp").value = "";
  document.getElementById("calc_usia").textContent = "—";
  document.getElementById("calc_sisa").textContent = "—";
  document.getElementById("prev_ba").innerHTML = "";
  document.getElementById("prev_foto").innerHTML = "";
  document.getElementById("file_ba").value = "";
  document.getElementById("file_foto").value = "";
}

function tampilToast(pesan) {
  document.getElementById("toastMsg").textContent = pesan;
  new bootstrap.Toast(document.getElementById("toast"), { delay: 3000 }).show();
}

window.hitungUsia = hitungUsia;
window.previewFiles = previewFiles;
window.simpanEntry = simpanEntry;
