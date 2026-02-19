import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Icons } from '../../components/Icons';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="w-full max-w-md card p-8 text-center">
      {status === 'loading' && <Icons.Loader className="animate-spin mx-auto" size={48} />}
      {status === 'success' && (
        <>
          <Icons.Check className="mx-auto mb-4 text-green-500" size={48} />
          <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
          <p className="text-[var(--text-secondary)] mb-6">Your email has been verified successfully.</p>
          <Link to="/login" className="btn-primary">Continue to Login</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <Icons.X className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-[var(--text-secondary)] mb-6">The link may have expired or is invalid.</p>
          <Link to="/login" className="btn-primary">Go to Login</Link>
        </>
      )}
    </div>
  );
}