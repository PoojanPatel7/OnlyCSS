import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { updateUserPoints, POINTS } from '../utils/points';
import { Eye, Code, Layers, Save, Check, FileCode2 } from 'lucide-react';

const Upload = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [isCombined, setIsCombined] = useState(false);
  const [cssCode, setCssCode] = useState('/* Add your CSS here */\n.box {\n  width: 100px;\n  height: 100px;\n  background: linear-gradient(45deg, #7c3aed, #06b6d4);\n  border-radius: 12px;\n  transition: all 0.3s ease;\n}\n\n.box:hover {\n  transform: translateY(-10px) rotate(5deg);\n  box-shadow: 0 10px 20px rgba(6, 182, 212, 0.5);\n}');
  const [htmlCode, setHtmlCode] = useState('<div class="box"></div>');
  const [jsCode, setJsCode] = useState('// Add interactive JavaScript here\nconsole.log("Loaded!");');
  const [combinedCode, setCombinedCode] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .box { width: 100px; height: 100px; background: red; }\n  </style>\n</head>\n<body>\n  <div class="box"></div>\n  <script>\n    console.log("Loaded!");\n  </script>\n</body>\n</html>');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Animations');
  
  const [activeTab, setActiveTab] = useState('css');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (isCombined) {
      setPreviewHtml(combinedCode);
      if (activeTab !== 'combined') setActiveTab('combined');
    } else {
      if (activeTab === 'combined') setActiveTab('css');
      const combined = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              margin: 0;
              background: transparent;
            }
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}</script>
        </body>
        </html>
      `;
      setPreviewHtml(combined);
    }
  }, [cssCode, htmlCode, jsCode, combinedCode, isCombined]);

  const handlePublish = async () => {
    if (!title) return alert('Title is required');
    
    setIsPublishing(true);
    try {
      await addDoc(collection(db, 'styles'), {
        authorId: currentUser.uid,
        authorUsername: userData?.username,
        authorDisplayName: userData?.displayName,
        authorPhotoURL: userData?.photoURL,
        authorRankTier: userData?.rankTier,
        title,
        description,
        isCombined,
        cssCode: isCombined ? '' : cssCode,
        htmlCode: isCombined ? '' : htmlCode,
        jsCode: isCombined ? '' : jsCode,
        combinedCode: isCombined ? combinedCode : '',
        category,
        tags: [],
        cssType: isCombined ? 'Combined Code' : 'Separated',
        likesCount: 0,
        downloadsCount: 0,
        viewsCount: 0,
        status: 'published',
        createdAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
      });
      
      updateUserPoints(currentUser.uid, POINTS.UPLOAD);
      
      setPublished(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error("Publish error:", err);
      alert('Error publishing style.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-status-success/20 text-status-success mb-6">
          <Check size={48} />
        </div>
        <h2 className="text-3xl font-heading font-bold mb-4">Successfully Published!</h2>
        <p className="text-text-muted">Your CSS style is now live on OnlyCSS.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold">Upload Style</h2>
          <p className="text-text-muted">Share your CSS masterpiece with the community.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="btn-outline flex-1 md:flex-none">Save Draft</button>
          <button onClick={handlePublish} disabled={isPublishing} className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2">
            {isPublishing ? 'Publishing...' : <><Save size={18} /> Publish Now</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Side */}
        <div className="flex flex-col gap-6">
          <div className="card p-6">
            <h3 className="text-xl font-heading font-bold mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Neon Glow Button" 
                  className="w-full bg-primary-bg border border-primary-border rounded-lg px-4 py-2 text-white focus:border-accent-purple focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-primary-bg border border-primary-border rounded-lg px-4 py-2 text-white focus:border-accent-purple focus:outline-none"
                  >
                    <option>Animations</option>
                    <option>Buttons</option>
                    <option>Cards</option>
                    <option>Loaders</option>
                    <option>Hover Effects</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Format</label>
                  <select 
                    value={isCombined ? 'combined' : 'separated'}
                    onChange={(e) => setIsCombined(e.target.value === 'combined')}
                    className="w-full bg-primary-bg border border-primary-border rounded-lg px-4 py-2 text-white focus:border-accent-purple focus:outline-none"
                  >
                    <option value="separated">Separate Files</option>
                    <option value="combined">Combined Single File</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card flex flex-col flex-grow overflow-hidden border border-primary-border">
            <div className="flex border-b border-primary-border bg-primary-surface overflow-x-auto custom-scrollbar">
              {isCombined ? (
                <button 
                  onClick={() => setActiveTab('combined')}
                  className={`px-6 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'combined' ? 'text-accent-purple border-b-2 border-accent-purple bg-white/5' : 'text-text-muted hover:text-white'}`}
                >
                  <FileCode2 size={16} /> Combined
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setActiveTab('html')}
                    className={`px-6 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'html' ? 'text-accent-pink border-b-2 border-accent-pink bg-white/5' : 'text-text-muted hover:text-white'}`}
                  >
                    <Layers size={16} /> HTML
                  </button>
                  <button 
                    onClick={() => setActiveTab('css')}
                    className={`px-6 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'css' ? 'text-accent-cyan border-b-2 border-accent-cyan bg-white/5' : 'text-text-muted hover:text-white'}`}
                  >
                    <Code size={16} /> CSS
                  </button>
                  <button 
                    onClick={() => setActiveTab('js')}
                    className={`px-6 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'js' ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5' : 'text-text-muted hover:text-white'}`}
                  >
                    <FileCode2 size={16} /> JS
                  </button>
                </>
              )}
            </div>
            
            <div className="flex-grow bg-[#282c34]">
              {activeTab === 'combined' ? (
                <CodeMirror value={combinedCode} height="400px" theme={oneDark} extensions={[html()]} onChange={setCombinedCode} className="text-sm" />
              ) : activeTab === 'css' ? (
                <CodeMirror value={cssCode} height="400px" theme={oneDark} extensions={[css()]} onChange={setCssCode} className="text-sm" />
              ) : activeTab === 'html' ? (
                <CodeMirror value={htmlCode} height="400px" theme={oneDark} extensions={[html()]} onChange={setHtmlCode} className="text-sm" />
              ) : (
                <CodeMirror value={jsCode} height="400px" theme={oneDark} extensions={[javascript()]} onChange={setJsCode} className="text-sm" />
              )}
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="flex flex-col">
          <div className="card flex flex-col h-[600px] border border-primary-border">
            <div className="p-4 border-b border-primary-border bg-primary-surface flex justify-between items-center">
              <h3 className="font-medium flex items-center gap-2 text-white">
                <Eye size={18} className="text-accent-purple" /> Live Preview
              </h3>
              <div className="flex gap-2">
                <button className="w-6 h-6 rounded-full bg-[#0a0a0f] border border-primary-border hover:ring-2 hover:ring-white transition-all"></button>
                <button className="w-6 h-6 rounded-full bg-white border border-primary-border hover:ring-2 hover:ring-accent-purple transition-all"></button>
                <button className="w-6 h-6 rounded-full bg-checkered bg-[size:10px_10px] border border-primary-border hover:ring-2 hover:ring-accent-cyan transition-all" style={{ backgroundImage: 'linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee)', backgroundPosition: '0 0, 5px 5px' }}></button>
              </div>
            </div>
            <div className="flex-grow bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center">
              <iframe 
                srcDoc={previewHtml} 
                title="preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
