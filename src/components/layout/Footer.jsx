import { Link } from 'react-router-dom';
import { ArrowRight, Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-[#050508] pt-20 pb-10 overflow-hidden border-t border-white/5 mt-auto">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent-purple/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="col-span-1 md:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="text-transparent bg-clip-text bg-gradient-to-br from-accent-purple to-accent-cyan text-3xl font-heading font-black transition-transform group-hover:-rotate-12 duration-300">
                {'{'}
              </div>
              <span className="text-2xl font-heading font-black tracking-tight text-white flex items-center">
                Only<span className="text-accent-cyan ml-0.5">CSS</span>
              </span>
              <div className="text-transparent bg-clip-text bg-gradient-to-br from-accent-cyan to-accent-purple text-3xl font-heading font-black transition-transform group-hover:rotate-12 duration-300">
                {'}'}
              </div>
            </Link>
            <p className="text-text-muted text-lg max-w-sm mb-8 leading-relaxed">
              Where CSS becomes art. Discover, copy, and share beautiful premium CSS effects created by developers worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-white hover:border-accent-cyan transition-all hover:-translate-y-1">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-white hover:border-accent-purple transition-all hover:-translate-y-1">
                <Github size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-white hover:border-accent-pink transition-all hover:-translate-y-1">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/explore" className="text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /> Explore Styles</Link></li>
              <li><Link to="/leaderboard" className="text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /> Leaderboard</Link></li>
              <li><Link to="/upload" className="text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /> Submit CSS</Link></li>
              <li><a href="#" className="text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /> Weekly Challenge</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4">
            <h4 className="text-white font-bold mb-6 text-lg">Join the Elite</h4>
            <p className="text-text-muted mb-4 leading-relaxed">Get weekly premium CSS inspiration and tutorials straight to your inbox.</p>
            <div className="flex gap-2 relative">
              <input 
                type="email" 
                placeholder="developer@example.com" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-purple w-full placeholder:text-white/30 backdrop-blur-sm transition-colors"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-white text-primary-bg px-5 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted font-medium">
            © {new Date().getFullYear()} OnlyCSS. Built with ❤️ by the CSS community.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-text-muted hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-text-muted hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-text-muted hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
