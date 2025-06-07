import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// --- Konfigurasi Klien Supabase ---
// Klien Supabase akan diinisialisasi setelah skrip CDN dimuat.
let supabase = null;

// **PENTING**: URL proyek Supabase Anda dan kunci anonim publik.
const supabaseUrl = 'https://iwvfqeahbjaogquqwagb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dmZxZWFoYmphb2dxdXF3YWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTE0NjEsImV4cCI6MjA2NDc2NzQ2MX0.QPhOsAE0W0aoOC3WDlrUEWrKn_pqOsmsV5uRyY8oAk0';

function FotoPage() {
  // State variables for form inputs, loading status, photo data, pagination, and modal view
  const [file, setFile] = useState(null);
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12); // Default 12 per page
  const [viewPhoto, setViewPhoto] = useState(null);
  const [message, setMessage] = useState(''); // State for displaying success/error messages
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [supabaseReady, setSupabaseReady] = useState(false); // State untuk melacak kesiapan Supabase
  const [hasDonated, setHasDonated] = useState(false); // State untuk simulasi donasi

  // Fungsi untuk menampilkan pesan sementara kepada pengguna
  const showNotification = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000); // Pesan menghilang setelah 3 detik
  }, []);

  // Efek untuk memuat Supabase CDN dan menginisialisasi klien
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
      // Pastikan window.supabase ada sebelum membuat klien
      if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        setSupabaseReady(true);
        console.log("Supabase client initialized for FotoPage.");
      } else {
        console.error("Supabase client not found on window object after CDN load in FotoPage.");
        showNotification("Gagal memuat Supabase client. Periksa koneksi atau URL CDN.", 'error');
      }
    };
    script.onerror = () => {
      console.error("Failed to load Supabase CDN script in FotoPage.");
      showNotification("Gagal memuat skrip Supabase.", 'error');
    };
    document.body.appendChild(script);

    // Cleanup function untuk menghapus script saat komponen unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [showNotification]); // Dependensi: showNotification

  // Fungsi untuk mengambil foto dari Supabase
  const fetchPhotos = useCallback(async () => {
    if (!supabaseReady || !supabase) { // Pastikan Supabase siap sebelum mengambil data
      console.warn("Supabase client belum siap. Tidak dapat mengambil foto.");
      return;
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    const { data, error } = await supabase
      .from('photos')
      .select('id, url, deskripsi, tanggal') // Pilih kolom yang diperlukan
      .order('tanggal', { ascending: false }) // Urutkan berdasarkan tanggal terbaru
      .range(from, to); // Ambil data sesuai paginasi

    if (error) {
      console.error("Fetch error:", error);
      showNotification("Gagal memuat foto: " + error.message, 'error'); // Menggunakan notifikasi
    } else {
      setPhotos(data);
    }
  }, [page, perPage, supabaseReady, showNotification]); // Dependensi: page, perPage, supabaseReady, showNotification

  // Efek hook untuk mengambil foto saat page atau perPage berubah
  useEffect(() => {
    if (supabaseReady) { // Hanya panggil fetchPhotos jika Supabase sudah siap
      fetchPhotos();
    }
  }, [page, perPage, supabaseReady, fetchPhotos]); // Tambahkan fetchPhotos ke dependensi

  // Handler untuk unggah file
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!supabaseReady || !supabase) { // Pastikan Supabase siap
      showNotification("Supabase client belum siap. Mohon tunggu.", 'error');
      return;
    }
    if (!file || !deskripsi) {
      showNotification("File dan deskripsi harus diisi!", 'error'); // Menggunakan notifikasi
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showNotification("Hanya menerima JPEG, PNG, atau GIF.", 'error'); // Menggunakan notifikasi
      return;
    }

    setLoading(true); // Mulai status loading
    try {
      const fileName = `${Date.now()}_${file.name}`; // Nama file unik
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file); // Unggah file
      if (uploadError) {
        showNotification("Gagal upload: " + uploadError.message, 'error'); // Menggunakan notifikasi
        return;
      }

      // Dapatkan URL publik dari file yang diunggah
      const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      const url = publicUrlData.publicUrl;

      // Sisipkan URL dan deskripsi ke tabel database
      const { error: insertError } = await supabase.from('photos').insert([
        { url, deskripsi, tanggal: new Date().toISOString() } // Simpan data
      ]);
      if (insertError) {
        showNotification("Gagal simpan data: " + insertError.message, 'error'); // Menggunakan notifikasi
        return;
      }

      setFile(null); // Reset input file
      setDeskripsi(''); // Reset deskripsi
      fetchPhotos(); // Muat ulang foto setelah unggah
      showNotification("Upload berhasil!", 'success'); // Menggunakan notifikasi
    } catch (err) {
      console.error("Terjadi kesalahan saat unggah:", err);
      showNotification("Terjadi kesalahan: " + (err.message || "Unknown error"), 'error'); // Menampilkan pesan error yang lebih baik
    } finally {
      setLoading(false); // Akhiri status loading
    }
  };

  // Handler untuk simulasi donasi
  const handleDonation = () => {
    setHasDonated(true);
    showNotification("Terima kasih atas donasi Anda!", 'success');
  };

  // Handler for downloading the photo
  const handleDownload = (url, description) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${description.replace(/\s/g, '_')}_GBK.jpg`); // Set filename for download
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        showNotification("Foto berhasil diunduh!", 'success');
      })
      .catch(error => {
        console.error("Error downloading image:", error);
        showNotification("Gagal mengunduh foto.", 'error');
      });
  };


  return (
    // Main container with elegant gradient background and padding, with pt-16 for header clearance
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white px-4 py-8 font-inter antialiased rounded-2xl pt-16">
      <div className="max-w-6xl mx-auto ">
        {/* Unified Title Section */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-purple-200 drop-shadow-lg animate-fade-in-down">
            📸 Galeri Indah GBK
          </h1>
          <p className="text-xl md:text-2xl mt-3 text-purple-300 opacity-90 animate-fade-in-up">
            Abadikan Momen, Berbagi Cerita, Berdonasi
          </p>
        </div>

        {/* Notification Message */}
        {message && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl z-50 transition-transform duration-300 ${messageType === 'success' ? 'bg-green-600' : 'bg-red-600'} transform translate-x-0`}>
            {message}
          </div>
        )}

        {/* Upload Form Section */}
        <form onSubmit={handleUpload} className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg mx-auto space-y-6 backdrop-blur-sm border border-purple-800">
          <h3 className="text-2xl font-semibold text-purple-300 mb-4 text-center">Unggah Foto Baru</h3>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={loading || !supabaseReady}
            className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-600 cursor-pointer transition-colors duration-200"
          />
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi foto Anda..."
            disabled={loading || !supabaseReady}
            rows="3"
            className="w-full p-3 bg-gray-700 bg-opacity-70 border border-purple-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition-colors duration-200"
          />
          <button
            type="submit"
            disabled={loading || !supabaseReady}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg tracking-wider transition transform duration-300 ease-out ${
              loading || !supabaseReady ? 'bg-gray-700 cursor-not-allowed opacity-70' : 'bg-purple-700 hover:bg-purple-600 active:scale-95 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengunggah...
              </span>
            ) : (
              'Unggah Foto'
            )}
          </button>
        </form>

        {/* Photo Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-16">
          {photos.length > 0 ? (
            photos.map((photo) => (
              <div key={photo.id} className="bg-gray-800 bg-opacity-70 p-4 rounded-xl shadow-lg border border-purple-800 transform hover:scale-103 transition-all duration-300 group">
                <img
                  src={photo.url}
                  alt={photo.deskripsi}
                  className="w-full h-52 object-cover rounded-lg mb-3 cursor-pointer group-hover:brightness-110 transition duration-300"
                  onClick={() => setViewPhoto(photo)}
                />
                <p className="text-base text-gray-200 font-medium truncate">{photo.deskripsi}</p>
                <small className="text-gray-400 text-xs mt-1 block">
                  {new Date(photo.tanggal).toLocaleString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </small>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400 text-lg py-8">
              {supabaseReady ? "Belum ada foto yang diunggah. Jadilah yang pertama!" : "Memuat data..."}
            </p>
          )}
        </div>

        {/* Pagination & Display Options Footer */}
        <div className="mt-12 p-6 border-t-2 border-purple-800 flex flex-col md:flex-row items-center justify-between gap-6 text-sm bg-gray-900 bg-opacity-70 rounded-xl shadow-inner">
          {/* Pagination Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || !supabaseReady}
              className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold disabled:bg-gray-600 disabled:text-gray-400 transition-colors duration-200 shadow-md"
            >
              ⬅ Sebelumnya
            </button>
            <span className="text-lg font-medium text-purple-300">Halaman {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!supabaseReady}
              className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-semibold transition-colors duration-200 shadow-md"
            >
              Berikutnya ➡
            </button>
          </div>

          {/* Items Per Page Select */}
          <div className="flex items-center gap-3">
            <label htmlFor="perPageSelect" className="text-purple-300 font-medium">Tampilkan:</label>
            <select
              id="perPageSelect"
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              disabled={!supabaseReady}
              className="bg-gray-700 border border-purple-600 p-2 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            >
              <option value={12}>12 Foto</option>
              <option value={24}>24 Foto</option>
              <option value={48}>48 Foto</option>
              <option value={96}>96 Foto</option>
            </select>
          </div>

          {/* Go To Page Input */}
          <div className="flex items-center gap-3">
            <label htmlFor="goToPageInput" className="text-purple-300 font-medium">Ke Halaman:</label>
            <input
              id="goToPageInput"
              type="number"
              min="1"
              value={page}
              onChange={(e) => {
                const newPage = parseInt(e.target.value, 10);
                if (!isNaN(newPage) && newPage >= 1) {
                  setPage(newPage);
                }
              }}
              disabled={!supabaseReady}
              className="w-20 p-2 rounded-lg bg-gray-700 border border-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-center"
            />
          </div>
        </div>
      </div>

      {/* Photo View Modal */}
      {viewPhoto && (
        <div
          onClick={() => setViewPhoto(null)}
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 bg-opacity-95 p-8 rounded-2xl shadow-xl max-w-3xl w-full text-center border border-purple-700 transform scale-95 animate-scale-in"
          >
            <h3 className="text-2xl font-bold mb-4 text-purple-300">{viewPhoto.deskripsi}</h3>
            <div className="relative w-full max-h-[75vh] mx-auto rounded-lg shadow-lg border border-purple-600 overflow-hidden">
                <img
                  src={viewPhoto.url}
                  alt={viewPhoto.deskripsi}
                  className="w-full h-full object-contain"
                />
                {!hasDonated && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
                    <span className="text-white text-5xl md:text-6xl font-extrabold opacity-75 transform -rotate-45 select-none tracking-wider">
                      DONASI DULU!
                    </span>
                  </div>
                )}
            </div>
            <p className="mt-4 text-gray-300 text-sm">
              Diunggah pada: {new Date(viewPhoto.tanggal).toLocaleString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
            {!hasDonated ? (
              <button
                className="mt-6 bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white py-3 px-6 rounded-full font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-fuchsia-500 transform hover:scale-105 transition-all duration-300"
                onClick={handleDonation}
              >
                🧾 Transfer ke 0895-331-699-681
              </button>
            ) : (
              <button
                className="mt-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 px-6 rounded-full font-semibold text-lg shadow-lg hover:from-teal-400 hover:to-cyan-500 transform hover:scale-105 transition-all duration-300"
                onClick={() => handleDownload(viewPhoto.url, viewPhoto.deskripsi)}
              >
                ⬇ Unduh Foto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS for animations (using keyframes as Tailwind doesn't have these by default) */}
      <style>
        {`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards 0.3s; }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        `}
      </style>
    </div>
  );
}

export default FotoPage;