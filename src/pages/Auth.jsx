import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Sparkles } from 'lucide-react';

const Auth = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err) {
      setError('Failed to authenticate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#050508] text-text-primary relative overflow-hidden font-sans">
      {/* Background Animated Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent-purple/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent-cyan/15 blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
      </div>

      {/* Left Panel: Artistic CSS Showcase */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10 border-r border-text-primary/5 bg-black/30 backdrop-blur-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-purple/20">
            <span className="font-bold text-xl">{'{'}</span>
          </div>
          <span className="text-2xl font-heading font-bold tracking-wide">
            Only<span className="text-text-primary/50 font-normal">CSS</span>
          </span>
        </div>

        <div className="relative w-full max-w-lg mx-auto flex items-center justify-center h-[500px]">
          {/* Floating UI Elements */}
          <div className="relative w-full h-full perspective-1000 flex items-center justify-center">
            {/* Main Center Card */}
            <div className="absolute w-72 h-80 bg-white/[0.03] border border-text-primary/10 rounded-3xl backdrop-blur-md p-6 shadow-2xl shadow-black/80 transform -rotate-3 hover:rotate-0 transition-transform duration-700 animate-float z-20">
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-text-primary/10 rounded-md"></div>
                <div className="h-4 w-1/2 bg-text-primary/10 rounded-md"></div>
                <div className="h-4 w-5/6 bg-text-primary/10 rounded-md"></div>
                
                <div className="mt-8 pt-8 border-t border-text-primary/10">
                  <div className="w-full h-12 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan opacity-80 shadow-[0_0_20px_rgba(124,58,237,0.3)] animate-pulse-slow"></div>
                </div>
              </div>
            </div>
            
            {/* Top Right Float */}
            <div className="absolute top-16 right-0 p-5 bg-text-primary/5 border border-text-primary/10 rounded-2xl backdrop-blur-xl animate-float-delayed shadow-xl z-30 transform rotate-6">
              <Code2 className="text-accent-cyan mb-3" size={28} />
              <p className="text-sm font-medium text-text-primary/90">Pristine CSS</p>
            </div>
            
            {/* Bottom Left Float */}
            <div className="absolute bottom-16 left-4 p-5 bg-text-primary/5 border border-text-primary/10 rounded-2xl backdrop-blur-xl animate-float shadow-xl z-10 transform -rotate-12" style={{ animationDelay: '1.5s' }}>
              <Sparkles className="text-accent-pink mb-3" size={28} />
              <p className="text-sm font-medium text-text-primary/90">Pixel Perfect</p>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-heading font-bold mb-5 leading-tight tracking-tight">
            Elevate your <br/> UI development.
          </h1>
          <p className="text-text-primary/60 text-lg max-w-md font-medium leading-relaxed">
            Join the premier community for frontend developers. Discover, share, and implement beautiful CSS into your projects seamlessly.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-sm py-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-purple/30">
              <span className="font-bold text-xl">{'{'}</span>
            </div>
            <span className="text-2xl font-heading font-bold tracking-wide">
              Only<span className="text-text-primary/50 font-normal">CSS</span>
            </span>
          </div>

          <div className="bg-white/[0.03] border border-text-primary/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
            {/* Subtle top highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-text-primary/30 to-transparent"></div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-heading font-bold mb-3 text-text-primary tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-text-primary/50 text-sm font-medium">
                {isLogin ? 'Sign in to continue to OnlyCSS' : 'Join the OnlyCSS community'}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                <span className="leading-tight">{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
              <div>
                <input 
                  type="email" 
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-text-primary/10 rounded-xl px-4 py-3 text-text-primary placeholder-text-primary/30 focus:border-accent-purple focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-text-primary/10 rounded-xl px-4 py-3 text-text-primary placeholder-text-primary/30 focus:border-accent-purple focus:outline-none transition-colors"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan font-medium text-text-primary shadow-lg shadow-accent-purple/20 hover:shadow-accent-cyan/40 transition-all duration-300"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-text-primary/10 flex-1"></div>
              <span className="text-xs text-text-primary/40 uppercase tracking-widest font-medium">Or</span>
              <div className="h-px bg-text-primary/10 flex-1"></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              type="button"
              disabled={loading}
              className="relative w-full group/btn flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-text-primary/5 border border-text-primary/10 hover:bg-text-primary/10 hover:border-text-primary/20 transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-lg"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg viewBox="0 0 24 24" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
              </div>
              <span className="font-medium text-text-primary/90 text-sm">Continue with Google</span>
            </button>

            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-text-primary/60 hover:text-text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-text-primary/5 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-text-primary/40">
              <a href="#" className="hover:text-text-primary/80 transition-colors">Terms of Service</a>
              <span className="hidden sm:inline">•</span>
              <a href="#" className="hover:text-text-primary/80 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
