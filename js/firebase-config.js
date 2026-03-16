// ============================================
//  firebase-config.js
//  Konfigurasi Firebase & Firestore
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDq59vCXRF2DTu1TCSLrqbhufzAaG_mW0c",
  authDomain: "peralatan-masuk.firebaseapp.com",
  projectId: "peralatan-masuk",
  storageBucket: "peralatan-masuk.firebasestorage.app",
  messagingSenderId: "1030965034829",
  appId: "1:1030965034829:web:0e4b01af3c1a5221148104",
  measurementId: "G-TKX4CBZ7NF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== FUNGSI DATABASE =====

// Ambil semua aset (realtime)
function listenAssets(callback) {
  return onSnapshot(
    collection(db, "assets"),
    (snapshot) => {
      const assets = [];
      snapshot.forEach((d) => assets.push({ id: d.id, ...d.data() }));
      assets.sort((a, b) => (b.tglEntry || "").localeCompare(a.tglEntry || ""));
      const banner = document.getElementById("firestore-error-banner");
      if (banner) banner.style.display = "none";
      callback(assets);
    },
    (error) => {
      console.error("Firestore error:", error);
      let banner = document.getElementById("firestore-error-banner");
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "firestore-error-banner";
        banner.style.cssText =
          "position:fixed;top:60px;left:0;right:0;z-index:9999;background:#dc3545;color:white;text-align:center;padding:10px 16px;font-size:13px;font-weight:600";
        document.body.prepend(banner);
      }
      if (error.code === "permission-denied") {
        banner.innerHTML =
          "⚠️ Akses Firestore ditolak — Rules mungkin expired. <a href=\'https://console.firebase.google.com\' target=\'_blank\' style=\'color:#fff;text-decoration:underline\'>Buka Firebase Console → Firestore → Rules → perpanjang tanggal</a>";
      } else {
        banner.innerHTML = `⚠️ Gagal memuat data (${error.code}): cek koneksi internet lalu refresh halaman.`;
      }
      banner.style.display = "block";
    },
  );
}

// Tambah aset baru
async function addAsset(asset) {
  try {
    const docRef = await addDoc(collection(db, "assets"), asset);
    return docRef.id;
  } catch (e) {
    console.error("Error adding asset: ", e);
  }
}

// Update aset (misal isi realisasi)
async function updateAsset(id, data) {
  try {
    await updateDoc(doc(db, "assets", id), data);
  } catch (e) {
    console.error("Error updating asset: ", e);
  }
}

// Hapus aset
async function deleteAsset(id) {
  try {
    await deleteDoc(doc(db, "assets", id));
  } catch (e) {
    console.error("Error deleting asset: ", e);
  }
}

export { db, listenAssets, addAsset, updateAsset, deleteAsset };
