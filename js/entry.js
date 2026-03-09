import { addAsset } from "./firebase-config.js";

function hitungUsia() {
  const tglUL = document.getElementById("f_tgl_ul").value;
  const tglULP = document.getElementById("f_tgl_ulp").value;
  const masaEkonomis =
    parseInt(document.getElementById("f_masa_ekonomis").value) || 0;
  const tglRef = tglUL || tglULP;
  if (!tglRef) return;

  const usia = Math.max(
    0,
    Math.floor((new Date() - new Date(tglRef)) / 86400000),
  );
  document.getElementById("calc_usia").textContent = usia + " hari";
  if (masaEkonomis > 0)
    document.getElementById("calc_sisa").textContent =
      masaEkonomis - usia + " hari";
}

function previewFiles(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  preview.innerHTML = "";
  Array.from(input.files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.className = "file-thumb";
        img.src = e.target.result;
        img.onclick = () => bukaFoto(e.target.result);
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      const div = document.createElement("div");
      div.className = "badge bg-primary rounded-2 p-2";
      div.textContent = "📄 " + file.name;
      preview.appendChild(div);
    }
  });
}

function bukaFoto(src) {
  document.getElementById("modalImg").src = src;
  new bootstrap.Modal(document.getElementById("imgModal")).show();
}

async function simpanEntry() {
  const nama = document.getElementById("f_nama").value.trim();
  const kndrn = document.getElementById("f_kndrn").value;
  const ulp = document.getElementById("f_ulp").value;
  const tglUL = document.getElementById("f_tgl_ul").value;
  const tglULP = document.getElementById("f_tgl_ulp").value;

  if (!nama || !ulp || (!tglUL && !tglULP)) {
    tampilToast("⚠️ Lengkapi nama, ULP, dan tanggal!");
    return;
  }

  const masaEkonomis =
    parseInt(document.getElementById("f_masa_ekonomis").value) || 0;
  const tglRef = tglUL || tglULP;
  const usia = Math.max(
    0,
    Math.floor((new Date() - new Date(tglRef)) / 86400000),
  );
  const sisa = masaEkonomis - usia;

  const baFiles = [],
    fotoFiles = [];

  function prosesFile(inputId, arr, callback) {
    const input = document.getElementById(inputId);
    let pending = input.files.length;
    if (!pending) {
      callback();
      return;
    }
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        arr.push({ name: file.name, data: e.target.result });
        if (--pending === 0) callback();
      };
      reader.readAsDataURL(file);
    });
  }

  const btn = document.getElementById("btnSimpan");
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
  btn.disabled = true;

  prosesFile("file_ba", baFiles, function () {
    prosesFile("file_foto", fotoFiles, async function () {
      await addAsset({
        no: document.getElementById("f_no").value.trim(),
        nama,
        tglUL,
        tglULP,
        ulp,
        masaEkonomis,
        usia,
        sisa,
        realisasi: 0,
        baFiles,
        fotoFiles,
        tglEntry: new Date().toISOString(),
      });
      resetForm();
      btn.innerHTML =
        '<i class="bi bi-check-circle me-1"></i> Simpan Data Aset';
      btn.disabled = false;
      tampilToast("✅ Data tersimpan!");
    });
  });
}

function resetForm() {
  ["f_no", "f_nama", "f_tgl_ul", "f_tgl_ulp", "f_masa_ekonomis"].forEach(
    (id) => (document.getElementById(id).value = ""),
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
  const toastEl = new bootstrap.Toast(document.getElementById("toast"), {
    delay: 3000,
  });
  toastEl.show();
}

window.hitungUsia = hitungUsia;
window.previewFiles = previewFiles;
window.simpanEntry = simpanEntry;
window.bukaFoto = bukaFoto;
