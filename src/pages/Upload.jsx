import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateUserPoints, POINTS } from '../utils/points';
import { Eye, Code, Layers, Save, Check, FileCode2, AlertCircle, X, Zap, Search, ChevronDown } from 'lucide-react';
import StyleCard from '../components/StyleCard';
import { CATEGORIES } from '../constants/categories';
import AdSlot from '../components/AdSlot';

const MAX_UPLOADS_PER_DAY = 5;

const Upload = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { id: editStyleId } = useParams();
  const isEditMode = !!editStyleId;
  
  const [isCombined, setIsCombined] = useState(false);
  const [cssCode, setCssCode] = useState('/* Add your CSS here */\n.box {\n  width: 100px;\n  height: 100px;\n  background: linear-gradient(45deg, #7c3aed, #06b6d4);\n  border-radius: 12px;\n  transition: all 0.3s ease;\n}\n\n.box:hover {\n  transform: translateY(-10px) rotate(5deg);\n  box-shadow: 0 10px 20px rgba(6, 182, 212, 0.5);\n}');
  const [htmlCode, setHtmlCode] = useState('<div class="box"></div>');
  const [jsCode, setJsCode] = useState('// Add interactive JavaScript here\nconsole.log("Loaded!");');
  const [combinedCode, setCombinedCode] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .box { width: 100px; height: 100px; background: linear-gradient(45deg, #7c3aed, #06b6d4); border-radius: 12px; transition: all 0.3s ease; }\n    .box:hover { transform: translateY(-10px) rotate(5deg); box-shadow: 0 10px 20px rgba(6, 182, 212, 0.5); }\n  </style>\n</head>\n<body>\n  <div class="box"></div>\n  <script>\n    console.log("Loaded!");\n  </script>\n</body>\n</html>');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState(['Animations']);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [previewBgColor, setPreviewBgColor] = useState('#0a0a0f');
  
  const [activeTab, setActiveTab] = useState('css');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [showTitleError, setShowTitleError] = useState(false);
  const titleInputRef = useRef(null);
  
  const [dailyUploads, setDailyUploads] = useState(0);
  const [dailyEdits, setDailyEdits] = useState(0);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const MAX_EDITS_PER_DAY = 5;

  // Fetch initial data if in edit mode
  useEffect(() => {
    const fetchEditData = async () => {
      if (!isEditMode || !currentUser) return;
      try {
        const docRef = doc(db, 'styles', editStyleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.authorId !== currentUser.uid) {
            alert('You can only edit your own styles.');
            navigate('/dashboard');
            return;
          }
          setTitle(data.title || '');
          setDescription(data.description || '');
          
          let initialCategories = [];
          if (data.categories && Array.isArray(data.categories)) {
            initialCategories = data.categories;
          } else if (data.category) {
            initialCategories = [data.category];
          } else {
            initialCategories = ['Animations'];
          }
          setCategories(initialCategories);
          setIsCombined(data.isCombined || false);
          setCssCode(data.cssCode || '');
          setHtmlCode(data.htmlCode || '');
          setJsCode(data.jsCode || '');
          setCombinedCode(data.combinedCode || '');
          setPreviewBgColor(data.previewBgColor || '#0a0a0f');
        }
      } catch (err) {
        console.error("Error fetching edit data:", err);
      }
    };
    fetchEditData();
  }, [isEditMode, editStyleId, currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  // Check upload limits
  useEffect(() => {
    const checkLimits = async () => {
      if (!currentUser) return;
      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const q = query(
          collection(db, 'styles'), 
          where('authorId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(q);
        let uploadCount = 0;
        let editCount = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.createdAt && data.createdAt.toDate && data.createdAt.toDate() >= startOfToday) {
            uploadCount++;
          }
          if (data.updatedAt && data.updatedAt.toDate && data.updatedAt.toDate() >= startOfToday && data.createdAt?.toMillis() !== data.updatedAt?.toMillis()) {
            editCount++;
          }
        });
        setDailyUploads(uploadCount);
        setDailyEdits(editCount);
      } catch (err) {
        console.error("Error checking limits:", err);
      } finally {
        setIsLoadingLimits(false);
      }
    };
    checkLimits();
  }, [currentUser]);

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
              background: ${previewBgColor};
              color: ${previewBgColor === '#ffffff' ? '#000000' : '#ffffff'};
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
  }, [cssCode, htmlCode, jsCode, combinedCode, isCombined, previewBgColor]);

  const handlePrePublish = () => {
    if (!title.trim()) {
      setShowTitleError(true);
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setShowFinalPreview(true);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setShowTitleError(true);
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const isLimitReached = isEditMode ? dailyEdits >= MAX_EDITS_PER_DAY : dailyUploads >= MAX_UPLOADS_PER_DAY;
    if (isLimitReached) {
      alert(`You've reached your daily limit of 5 ${isEditMode ? 'edits' : 'uploads'}.`);
      return;
    }
    
    setIsPublishing(true);
    try {
      const payload = {
        title,
        description,
        isCombined,
        cssCode: isCombined ? '' : cssCode,
        htmlCode: isCombined ? '' : htmlCode,
        jsCode: isCombined ? '' : jsCode,
        combinedCode: isCombined ? combinedCode : '',
        categories,
        category: categories.length > 0 ? categories[0] : 'Animations', // For backward compatibility
        previewBgColor,
        cssType: isCombined ? 'Combined Code' : 'Separated',
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'styles', editStyleId), payload);
      } else {
        await addDoc(collection(db, 'styles'), {
          ...payload,
          authorId: currentUser.uid,
          authorUsername: userData?.username,
          authorDisplayName: userData?.displayName,
          authorPhotoURL: userData?.photoURL,
          authorRankTier: userData?.rankTier,
          tags: [],
          likesCount: 0,
          downloadsCount: 0,
          viewsCount: 0,
          status: 'published',
          createdAt: serverTimestamp(),
          publishedAt: serverTimestamp(),
        });
        updateUserPoints(currentUser.uid, POINTS.UPLOAD);
      }
      
      setPublished(true);
      setShowFinalPreview(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error("Publish error:", err);
      alert('Error publishing style.');
      setIsPublishing(false);
    }
  };

  if (published) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-tr from-accent-purple/20 to-accent-cyan/20 text-accent-cyan mb-8 border border-accent-cyan/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-scale-in">
          <Check size={64} className="animate-pulse" />
        </div>
        <h2 className="text-5xl font-heading font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Masterpiece Live!</h2>
        <p className="text-text-primary/60 text-xl max-w-md mx-auto">Your CSS style has been successfully published to the OnlyCSS community.</p>
      </div>
    );
  }

  const mockStyleForPreview = {
    id: 'preview-id',
    authorId: currentUser?.uid,
    authorUsername: userData?.username,
    authorDisplayName: userData?.displayName,
    authorPhotoURL: userData?.photoURL,
    authorRankTier: userData?.rankTier,
    title: title || 'Untitled Style',
    description,
    isCombined,
    cssCode,
    htmlCode,
    jsCode,
    combinedCode,
    categories,
    category: categories.length > 0 ? categories[0] : 'Animations',
    previewBgColor,
    tags: [],
    likesCount: 0,
    viewsCount: 0,
    downloadsCount: 0
  };

  const isLimitReached = isEditMode ? dailyEdits >= MAX_EDITS_PER_DAY : dailyUploads >= MAX_UPLOADS_PER_DAY;

  if (isLimitReached) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-tr from-accent-pink/20 to-accent-purple/20 text-accent-pink mb-8 border border-accent-pink/30 shadow-[0_0_50px_rgba(236,72,153,0.2)] animate-scale-in">
          <Eye size={64} className="opacity-80" />
        </div>
        <h2 className="text-5xl md:text-6xl font-heading font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Limit Reached!</h2>
        <p className="text-text-primary/60 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          Whoa! You've successfully {isEditMode ? 'edited' : 'published'} <strong>5 amazing styles</strong> today. We limit daily actions to maintain exceptional quality on the platform and to prevent spam.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md inline-block">
          <p className="text-text-primary/80 font-bold mb-2">Come back tomorrow to share more magic.</p>
          <p className="text-sm text-text-primary/50">Your limit will automatically reset at midnight.</p>
        </div>
        <button onClick={() => navigate('/explore')} className="mt-10 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-white transition-all backdrop-blur-md">
          Explore Other Styles
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-text-primary/5 border border-text-primary/10 text-xs font-bold uppercase tracking-wider mb-4">
            <Code size={14} className="text-accent-cyan" /> Studio Editor
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-white mb-2">{isEditMode ? 'Edit Style' : 'Create Style'}</h2>
          <p className="text-text-primary/50 font-medium">{isEditMode ? 'Update your CSS masterpiece.' : 'Craft and share your CSS masterpiece with the community.'}</p>
        </div>
        
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          {!isLoadingLimits && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-text-primary/50">Daily Limit:</span>
              <div className="flex gap-1">
                {[...Array(isEditMode ? MAX_EDITS_PER_DAY : MAX_UPLOADS_PER_DAY)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-2 rounded-full ${i < (isEditMode ? dailyEdits : dailyUploads) ? 'bg-accent-purple' : 'bg-white/10'}`}
                  ></div>
                ))}
              </div>
              <span className={isLimitReached ? 'text-status-danger' : 'text-text-primary'}>
                {isEditMode ? dailyEdits : dailyUploads}/{isEditMode ? MAX_EDITS_PER_DAY : MAX_UPLOADS_PER_DAY}
              </span>
            </div>
          )}
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handlePrePublish} 
              disabled={isLimitReached || isLoadingLimits} 
              className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 shadow-lg shadow-accent-purple/20 hover:shadow-accent-purple/40 disabled:opacity-50 disabled:shadow-none"
            >
              {isLimitReached ? (
                <><AlertCircle size={18} /> Limit Reached</>
              ) : (
                <><Eye size={18} /> {isEditMode ? 'Review & Update' : 'Review & Publish'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      <AdSlot format="horizontal" className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Editor Side (Left 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl relative z-20">
            <h3 className="text-sm font-bold text-text-primary/40 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Layers size={16} /> Metadata
            </h3>
            <div className="space-y-5">
              <div className="relative">
                <label className="block text-sm font-medium text-text-primary/80 mb-2">Style Title</label>
                
                {/* Cartoon Character Error Animation */}
                {showTitleError && (
                  <div className="absolute -top-16 right-0 z-50 animate-bounce flex flex-col items-center pointer-events-none">
                    <div className="bg-gradient-to-r from-accent-pink to-accent-purple text-white text-sm font-black px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.6)] relative mb-2">
                      Hey! This is needed!
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent-purple transform rotate-45"></div>
                    </div>
                    <div className="text-4xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                      🤖👇
                    </div>
                  </div>
                )}

                <input 
                  ref={titleInputRef}
                  type="text" 
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (showTitleError) setShowTitleError(false);
                  }}
                  placeholder="e.g., Neon Glow Button" 
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all ${showTitleError ? 'border-accent-pink shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-white/10 focus:border-accent-purple'}`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-2">Categories</label>
                  <div className="relative">
                    <div 
                      className="min-h-[50px] w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus-within:border-accent-purple transition-all cursor-pointer flex flex-wrap gap-2 items-center"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    >
                      {categories.map(cat => (
                        <span key={cat} className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-sm hover:bg-status-danger/20 hover:text-status-danger transition-colors" onClick={(e) => {
                          e.stopPropagation();
                          setCategories(categories.filter(c => c !== cat));
                        }}>
                          {cat} <X size={12} />
                        </span>
                      ))}
                      {categories.length === 0 && <span className="text-white/30 px-1">Select categories...</span>}
                      <div className="ml-auto pointer-events-none text-white/30">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                    
                    {showCategoryDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-primary-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-2 border-b border-white/5 flex items-center bg-black/20">
                          <Search size={14} className="text-text-primary/50 mr-2" />
                          <input 
                            type="text" 
                            placeholder="Search categories..." 
                            className="bg-transparent w-full text-sm outline-none text-white placeholder-text-primary/30"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                          {CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 ? (
                            <div className="p-3 text-center text-sm text-text-primary/50">No categories found.</div>
                          ) : CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => {
                            const isSelected = categories.includes(cat);
                            return (
                              <div 
                                key={cat}
                                className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-accent-purple/20 text-accent-purple' : 'hover:bg-white/5 text-text-primary/80 hover:text-white'}`}
                                onClick={() => {
                                  if (isSelected) {
                                    setCategories(categories.filter(c => c !== cat));
                                  } else {
                                    setCategories([...categories, cat]);
                                  }
                                }}
                              >
                                {cat}
                                {isSelected && <Check size={14} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary/80 mb-2">Code Format</label>
                  <select 
                    value={isCombined ? 'combined' : 'separated'}
                    onChange={(e) => setIsCombined(e.target.value === 'combined')}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-purple focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="separated">Separate (HTML/CSS/JS)</option>
                    <option value="combined">Combined (Single HTML)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f13] border border-white/10 rounded-3xl flex flex-col flex-grow overflow-hidden shadow-2xl relative z-10">
            <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto custom-scrollbar">
              {isCombined ? (
                <button 
                  onClick={() => setActiveTab('combined')}
                  className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'combined' ? 'text-accent-purple border-b-2 border-accent-purple bg-accent-purple/5' : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-white/5'}`}
                >
                  <FileCode2 size={16} /> Combined HTML
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setActiveTab('html')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'html' ? 'text-accent-pink border-b-2 border-accent-pink bg-accent-pink/5' : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-white/5'}`}
                  >
                    <Layers size={16} /> HTML
                  </button>
                  <button 
                    onClick={() => setActiveTab('css')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'css' ? 'text-accent-cyan border-b-2 border-accent-cyan bg-accent-cyan/5' : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-white/5'}`}
                  >
                    <Code size={16} /> CSS
                  </button>
                  <button 
                    onClick={() => setActiveTab('js')}
                    className={`px-6 py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'js' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' : 'text-text-primary/50 hover:text-text-primary/80 hover:bg-white/5'}`}
                  >
                    <FileCode2 size={16} /> JS
                  </button>
                </>
              )}
            </div>
            
            <div className="flex-grow bg-[#1a1b26]">
              {activeTab === 'combined' ? (
                <CodeMirror value={combinedCode} height="500px" theme={oneDark} extensions={[html()]} onChange={setCombinedCode} className="text-[13px] font-mono" />
              ) : activeTab === 'css' ? (
                <CodeMirror value={cssCode} height="500px" theme={oneDark} extensions={[css()]} onChange={setCssCode} className="text-[13px] font-mono" />
              ) : activeTab === 'html' ? (
                <CodeMirror value={htmlCode} height="500px" theme={oneDark} extensions={[html()]} onChange={setHtmlCode} className="text-[13px] font-mono" />
              ) : (
                <CodeMirror value={jsCode} height="500px" theme={oneDark} extensions={[javascript()]} onChange={setJsCode} className="text-[13px] font-mono" />
              )}
            </div>
          </div>
        </div>

        {/* Preview Side (Right 5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col h-[700px] shadow-2xl backdrop-blur-xl overflow-hidden sticky top-28">
            <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center backdrop-blur-md">
              <h3 className="text-sm font-bold text-text-primary/80 flex items-center gap-2">
                <Eye size={16} className="text-accent-purple" /> Live Preview
              </h3>
              <div className="flex gap-2 p-1 bg-black/40 rounded-full border border-white/5">
                <button 
                  onClick={() => setPreviewBgColor('#0a0a0f')}
                  className={`w-6 h-6 rounded-full bg-[#0a0a0f] border-2 transition-all ${previewBgColor === '#0a0a0f' ? 'border-accent-purple scale-110' : 'border-white/20 hover:border-white/50'}`}
                  title="Dark Background"
                />
                <button 
                  onClick={() => setPreviewBgColor('#ffffff')}
                  className={`w-6 h-6 rounded-full bg-white border-2 transition-all ${previewBgColor === '#ffffff' ? 'border-accent-cyan scale-110' : 'border-white/20 hover:border-white/50'}`}
                  title="Light Background"
                />
                <button 
                  onClick={() => setPreviewBgColor('transparent')}
                  className={`w-6 h-6 rounded-full bg-checkered bg-[size:10px_10px] border-2 transition-all ${previewBgColor === 'transparent' ? 'border-amber-400 scale-110' : 'border-white/20 hover:border-white/50'}`} 
                  style={{ backgroundImage: 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%, #ddd), linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%, #ddd)', backgroundPosition: '0 0, 5px 5px' }}
                  title="Transparent Background"
                />
              </div>
            </div>
            
            <div className="flex-grow relative overflow-hidden flex items-center justify-center bg-checkered" style={{ backgroundColor: previewBgColor === 'transparent' ? '#fff' : previewBgColor, backgroundImage: previewBgColor === 'transparent' ? 'linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee)' : 'none', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}>
              <iframe 
                srcDoc={previewHtml} 
                title="preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Final Preview & Publish Modal */}
      {showFinalPreview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-primary-bg border border-white/10 rounded-[2rem] w-full max-w-5xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] animate-scale-in">
            
            {/* Left Side: Mock Style Card */}
            <div className="w-full md:w-1/2 p-8 bg-black/40 border-r border-white/5 flex flex-col items-center justify-center relative">
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-bold border border-accent-cyan/20">
                <Eye size={14} /> Final Feed Preview
              </div>
              <p className="text-text-primary/40 text-sm mb-6 mt-8 text-center">This is exactly how your style will appear to others.</p>
              
              <div className="w-full max-w-md">
                <StyleCard style={mockStyleForPreview} isPreview={true} />
              </div>
            </div>

            {/* Right Side: Publish Actions */}
            <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
              <button 
                onClick={() => setShowFinalPreview(false)}
                className="absolute top-6 right-6 text-text-primary/40 hover:text-white transition-colors p-2 bg-white/5 rounded-full"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-heading font-black mb-2 text-white">Ready to Publish?</h2>
              <p className="text-text-primary/50 mb-8">You are about to share <strong>{title}</strong> with the OnlyCSS community.</p>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-status-success/20 text-status-success flex items-center justify-center shrink-0">
                    <Check size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Code Validated</h4>
                    <p className="text-xs text-text-primary/50">Ready for production use.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Earn Points</h4>
                    <p className="text-xs text-text-primary/50">You'll receive +{POINTS.UPLOAD} points upon publishing.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan font-bold text-white text-lg shadow-lg shadow-accent-purple/20 hover:shadow-accent-cyan/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isPublishing ? 'Publishing...' : 'Publish to Feed'}
                </button>
                <button 
                  onClick={() => setShowFinalPreview(false)}
                  disabled={isPublishing}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-white transition-all disabled:opacity-50"
                >
                  Back to Editor
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Upload;
