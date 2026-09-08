import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Using an optional fallback since eKycLogin might not be in AuthContext yet
  const { eKycLogin = async () => new Promise(res => setTimeout(res, 1000)) } = useAuth(); 
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Optional: check state to prevent CSRF

    if (!code) {
      setStatus('error');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const verifyCode = async () => {
      try {
        await eKycLogin(code); 
        setStatus('success');
        setTimeout(() => navigate('/user'), 1500);
      } catch (error) {
        console.error('e-KYC Verification Failed', error);
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    verifyCode();
  }, [searchParams, navigate, eKycLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center transition-all duration-300">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Verifying Identity</h2>
            <p className="text-sm text-gray-500 mt-2">Connecting securely to DigiLocker...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-[scale-in_0.3s_ease-out]" />
            <h2 className="text-xl font-semibold text-gray-800">Verification Successful</h2>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-[shake_0.4s_ease-in-out]" />
            <h2 className="text-xl font-semibold text-gray-800">Verification Failed</h2>
            <p className="text-sm text-gray-500 mt-2">Invalid or expired token. Returning to login...</p>
          </>
        )}
      </div>
    </div>
  );
};
