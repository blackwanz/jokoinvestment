import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient'; // Import client lokal

const DataDiriForm = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const showNotification = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setCurrentUser(session.user);
        navigate('/foto');
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        showNotification('Anda telah logout.', 'success');
      }
      setIsLoadingAuth(false);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setIsLoggedIn(true);
          setCurrentUser(session.user);
          navigate('/foto');
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
        setIsLoadingAuth(false);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setIsLoadingAuth(false);
      });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [navigate, showNotification]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/isi-data-diri',
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in with Google:', error.message);
      showNotification('Gagal login dengan Google: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white px-4 py-8 font-inter antialiased flex flex-col items-center justify-center pt-24">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl z-50 transition-transform duration-300 ${messageType === 'success' ? 'bg-green-600' : 'bg-red-600'} transform translate-x-0`}>
          {message}
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg mx-auto space-y-6 backdrop-blur-sm border border-purple-800 w-full">
        <h2 className="text-3xl font-extrabold text-purple-300 mb-6 text-center drop-shadow-lg">Masuk / Daftar</h2>

        {isLoadingAuth ? (
          <div className="flex flex-col items-center justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-purple-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-purple-300">Memuat...</p>
          </div>
        ) : (
          !isLoggedIn ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-300 text-center">Silakan login atau daftar dengan Google:</p>
              <button
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg text-white font-bold text-lg tracking-wider transition transform duration-300 ease-out flex items-center justify-center gap-2 ${
                  isSubmitting ? 'bg-gray-700 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengarahkan...
                  </span>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 9.5C28.53 9.5 32.26 11.23 34.94 13.71L41.38 7.28C36.98 3.23 30.75 0 24 0C14.77 0 6.78 5.48 3.32 13.41L10.36 18.66C12.18 14.54 17.51 9.5 24 9.5Z" fill="#EA4335"/>
                      <path d="M46.72 24.53C46.72 23.36 46.61 22.19 46.41 21H24V29H37.58C37.05 31.78 35.25 34.02 32.78 35.63L39.81 40.94C44.02 36.88 46.72 30.93 46.72 24.53Z" fill="#4285F4"/>
                      <path d="M10.36 29.34L3.32 34.59C6.78 42.52 14.77 48 24 48C30.75 48 36.98 44.77 41.38 40.72L34.94 38.29C32.26 40.77 28.53 42.5 24 42.5C17.51 42.5 12.18 37.46 10.36 33.34L10.36 29.34Z" fill="#FBBC05"/>
                      <path d="M24 9.5C28.53 9.5 32.26 11.23 34.94 13.71L41.38 7.28C36.98 3.23 30.75 0 24 0C14.77 0 6.78 5.48 3.32 13.41L10.36 18.66C12.18 14.54 17.51 9.5 24 9.5Z" fill="#34A853"/>
                    </svg>
                    Login dengan Google
                  </>
                )}
              </button>
            </div>
          ) : (
            <p className="text-gray-300 text-center">Anda sudah login. Mengarahkan ke galeri...</p>
          )
        )}

        <Link
          to="/foto"
          className="mt-6 block text-center py-3 px-6 rounded-full font-semibold text-lg transition-all duration-300
                     bg-gray-600 hover:bg-gray-500 text-white shadow-lg hover:shadow-xl w-fit mx-auto"
        >
          Kembali ke Galeri
        </Link>
      </div>
    </div>
  );
};

export default DataDiriForm;
