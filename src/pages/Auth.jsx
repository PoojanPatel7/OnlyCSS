import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const { loginWithGoogle, loginWithGithub, currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError('Failed to login with Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGithub();
    } catch (err) {
      setError('Failed to login with GitHub: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex p-0 bg-primary-bg">
      {/* Left side: CSS Showcase (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary-surface border-r border-primary-border items-center justify-center relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple opacity-20 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan opacity-20 blur-[100px] rounded-full mix-blend-screen"></div>
        
        <div className="z-10 text-center max-w-md">
          <div className="text-5xl font-heading font-bold mb-6 tracking-tight flex justify-center gap-2">
            <span className="text-accent-purple">{'{'}</span>
            <span className="text-white">CSSVault</span>
            <span className="text-accent-cyan">{'}'}</span>
          </div>
          <p className="text-lg text-text-muted mb-8">
            Join thousands of developers sharing and discovering the best CSS effects on the web.
          </p>
          
          {/* Animated CSS preview mock */}
          <div className="card p-6 inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-300 shadow-2xl shadow-accent-purple/20">
            <button className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-accent-purple to-accent-cyan hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all animate-pulse">
              Interactive CSS Button
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md card p-8 text-center bg-primary-surface/50 backdrop-blur-xl">
          <h2 className="text-3xl font-heading font-bold mb-2 text-white">Welcome back</h2>
          <p className="text-text-muted mb-8">Sign in to share your styles and join the community.</p>
          
          {error && <div className="bg-status-danger/10 border border-status-danger text-status-danger p-3 rounded-lg text-sm mb-6">{error}</div>}
          
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center gap-3 mb-4 disabled:opacity-50 py-3"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
            </div>
            <span className="font-medium text-lg">Continue with Google</span>
          </button>
          
          <p className="mt-8 text-sm text-text-muted">
            By continuing, you agree to CSSVault's <a href="#" className="text-accent-cyan hover:underline">Terms of Service</a> and <a href="#" className="text-accent-cyan hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
