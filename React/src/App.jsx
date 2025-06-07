import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FotoPage from './components/FotoPage.jsx';
import Header from './components/Header.jsx';
import DataDiriForm from './components/DataDiriForm.jsx';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwvfqeahbjaogquqwagb.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [currentDonation, setCurrentDonation] = useState(0);

  const initialPaid = 14549055;
  const targetDonation = 89012036;

  useEffect(() => {
    const fetchTotalDonation = async () => {
      const { data, error } = await supabase.from('donations').select('amount');
      if (error) {
        console.error('Error fetching donations:', error);
        return;
      }
      const total = data.reduce((sum, item) => sum + item.amount, 0);
      setCurrentDonation(total);
    };

    fetchTotalDonation();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchTotalDonation)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalCollected = currentDonation + initialPaid;
  const progressPercentage = (totalCollected / targetDonation) * 100;

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white px-4 pt-24 pb-10 font-inter antialiased">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-purple-100 drop-shadow-lg">
                  🤖 Milestone Irwan
                </h1>
                <p className="text-lg md:text-xl text-purple-300">
                  28 tahun • Lajang • Sedang bangkit
                </p>

                {/* Info Card */}
                <div className="bg-gray-900 bg-opacity-80 p-6 md:p-8 rounded-2xl shadow-lg text-left space-y-4 border border-purple-700 backdrop-blur-sm">
                  <p><strong>Hobi:</strong> Bulu tangkis, mengagumi kecantikan</p>
                  <p><strong>Kekuatan:</strong> Tahan banting, hidup di ekonomi sulit</p>
                  <p><strong>Kelemahan:</strong> Emosi & keuangan belum stabil</p>
                  <p><strong>Pengalaman:</strong> Trading, forex, betting</p>
                  
                  <p className="text-fuchsia-400 font-semibold text-xl mt-4">
                    🎯 Target: Lunasi utang Rp{targetDonation.toLocaleString('id-ID')} di 2026
                  </p>

                  {/* Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-purple-300 font-semibold">
                      <span>Terkumpul: Rp{totalCollected.toLocaleString('id-ID')}</span>
                      <span>Target: Rp{targetDonation.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-5 overflow-hidden border border-purple-600">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-700"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-sm font-bold text-white">
                      {progressPercentage.toFixed(2)}% Terkumpul
                    </div>
                  </div>

                  <p className="text-purple-300 text-lg mt-4 text-center">
                    💜 Setiap 1000 bantuan sangat berarti. Kamu bagian dari perjalanan ini.
                  </p>
                </div>

                {/* Donation Buttons */}
                <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
                  <a
                    href="https://saweria.co/irwanKNTL?amount=1000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-gradient-to-r from-teal-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition text-xl"
                  >
                    💪 Yakin Dia Bisa (Rp1.000)
                  </a>
                  <a
                    href="https://saweria.co/irwanKNTL?amount=10000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition text-xl"
                  >
                    😬 Mungkin Tidak Bisa (Rp10.000)
                  </a>
                </div>

                {/* Upload Foto */}
                <div className="mt-6">
                  <a
                    href="/foto"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition text-lg"
                  >
                    🚀 Lanjut Upload Foto
                  </a>
                </div>
              </div>
            </main>
          }
        />
        <Route path="/foto" element={<FotoPage />} />
        <Route path="/isi-data-diri" element={<DataDiriForm />} />
      </Routes>
    </Router>
  );
}

export default App;
