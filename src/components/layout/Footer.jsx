import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-primary-border bg-primary-bg pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-heading font-bold tracking-wide">
                CSS<span className="text-text-muted font-normal">Vault</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm max-w-sm mb-6">
              Where CSS becomes art. Discover, copy, and share beautiful CSS effects created by developers worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-primary-surface border border-primary-border flex items-center justify-center text-text-muted hover:text-white hover:border-text-muted transition-all">
                𝕏
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-surface border border-primary-border flex items-center justify-center text-text-muted hover:text-white hover:border-text-muted transition-all">
                GH
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-surface border border-primary-border flex items-center justify-center text-text-muted hover:text-white hover:border-text-muted transition-all">
                DC
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/explore" className="text-sm text-text-muted hover:text-accent-cyan transition-colors">Explore Styles</Link></li>
              <li><Link to="/leaderboard" className="text-sm text-text-muted hover:text-accent-cyan transition-colors">Leaderboard</Link></li>
              <li><Link to="/upload" className="text-sm text-text-muted hover:text-accent-cyan transition-colors">Submit CSS</Link></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-accent-cyan transition-colors">Weekly Challenge</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Newsletter</h4>
            <p className="text-sm text-text-muted mb-4">Get weekly CSS inspiration straight to your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-primary-surface border border-primary-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-purple w-full"
              />
              <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} CSSVault. Made with ❤️ by the CSS community.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-text-muted hover:text-white">Privacy Policy</a>
            <a href="#" className="text-xs text-text-muted hover:text-white">Terms of Service</a>
            <a href="#" className="text-xs text-text-muted hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
