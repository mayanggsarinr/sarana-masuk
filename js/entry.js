import { addAsset } from "./db.js";

const IMGBB_KEY = "1d89132b268e6e26a863a10a364cc693";

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

// Upload gambar ke ImgBB, kembalikan URL
async function uploadKeImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!json.success)
    throw new Error("Gagal upload ke ImgBB: " + json.error?.message);
  return {
    nama: file.name,
    url: json.data.display_url || json.data.url,
    thumb: json.data.thumb?.url || json.data.url,
  };
}

function previewFiles(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  preview.innerHTML = "";
  Array.from(input.files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.style =
        "max-height:60px;border-radius:8px;margin-top:4px;margin-right:4px";
      img.src = URL.createObjectURL(file);
      preview.appendChild(img);
    } else {
      const div = document.createElement("div");
      div.className = "badge bg-secondary rounded-2 p-2 me-1";
      div.textContent = "📄 " + file.name;
      preview.appendChild(div);
    }
  });
}

function ubahJumlah(delta) {
  const input = document.getElementById("f_jumlah");
  const val = Math.max(1, Math.min(500, (parseInt(input.value) || 1) + delta));
  input.value = val;
}

async function simpanEntry() {
  const nama = document.getElementById("f_kndrn").value;
  const ulp = document.getElementById("f_ulp").value;
  const tglUL = document.getElementById("f_tgl_ul").value;
  const tglULP = document.getElementById("f_tgl_ulp").value;
  const jumlah = Math.max(
    1,
    parseInt(document.getElementById("f_jumlah").value) || 1,
  );

  if (!nama) {
    tampilToast("⚠️ Nama kendaraan/peralatan wajib dipilih!");
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

  const masa = masaEkonomisMap[nama] || 0;
  const tglRef = tglUL || tglULP;
  const usia = Math.max(
    0,
    Math.floor((new Date() - new Date(tglRef)) / 86400000),
  );
  const sisa = masa - usia;

  const kondisi =
    document.querySelector('input[name="f_kondisi"]:checked')?.value || "Baik";
  const ket = document.getElementById("f_ket").value.trim();

  const btn = document.getElementById("btnSimpan");
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Mengupload foto...`;
  btn.disabled = true;

  try {
    // Upload foto BA dan foto aset ke ImgBB
    const baFotoFiles = Array.from(document.getElementById("file_ba").files);
    const fotoFiles = Array.from(document.getElementById("file_foto").files);

    const baFotos = await Promise.all(baFotoFiles.map((f) => uploadKeImgBB(f)));
    const fotos = await Promise.all(fotoFiles.map((f) => uploadKeImgBB(f)));

    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan ${jumlah} item...`;

    const promises = [];
    for (let i = 0; i < jumlah; i++) {
      promises.push(
        addAsset({
          nama,
          tglUL,
          tglULP,
          ulp,
          masaEkonomis: masa,
          usia,
          sisa,
          kondisi,
          ket,
          realisasi: 0,
          baFotos, // foto BA (array URL ImgBB)
          fotos, // foto aset (array URL ImgBB)
          tglEntry: new Date().toISOString(),
        }),
      );
    }
    await Promise.all(promises);

    resetForm();
    tampilToast(`✅ ${jumlah} item berhasil disimpan!`);
  } catch (e) {
    console.error(e);
    tampilToast("❌ Gagal menyimpan: " + e.message);
  }

  btn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Simpan Data Aset';
  btn.disabled = false;
}

function resetForm() {
  document.getElementById("f_kndrn").value = "";
  document.getElementById("f_ulp").value = "";
  document.getElementById("f_tgl_ul").value = "";
  document.getElementById("f_tgl_ulp").value = "";
  document.getElementById("prev_ba").innerHTML = "";
  document.getElementById("prev_foto").innerHTML = "";
  document.getElementById("f_jumlah").value = "1";
  document.getElementById("f_ket").value = "";
  document.querySelector('input[name="f_kondisi"][value="Baik"]').checked =
    true;
  document.getElementById("file_ba").value = "";
  document.getElementById("file_foto").value = "";
}

function tampilToast(pesan) {
  document.getElementById("toastMsg").textContent = pesan;
  new bootstrap.Toast(document.getElementById("toast"), { delay: 3000 }).show();
}

window.previewFiles = previewFiles;
window.simpanEntry = simpanEntry;
window.ubahJumlah = ubahJumlah;
window.hitungUsia = function () {};
