import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectUrl);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password combination.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-bg-card border border-primary-gold/15 p-8 sm:p-10 rounded-2xl shadow-2xl space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-xs text-primary-gold uppercase tracking-widest font-semibold">Welcome Back</span>
          <h2 className="text-3xl font-playfair font-bold text-text-light">Sign In</h2>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-bg-deep border border-primary-gold/15 rounded-lg pl-10 pr-4 py-3 text-sm text-text-light focus:outline-none focus:border-primary-gold"
              />
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-deep border border-primary-gold/15 rounded-lg pl-10 pr-4 py-3 text-sm text-text-light focus:outline-none focus:border-primary-gold"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3.5 rounded-lg transition-colors duration-300 shadow-lg text-sm"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <div className="text-center pt-4 border-t border-primary-gold/5 text-xs sm:text-sm text-text-muted">
          <span>New to Aab-e-Hayat? </span>
          <Link to={`/register?redirect=${redirectUrl}`} className="text-primary-gold font-semibold hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
