import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  FolderKanban,
  Calculator,
  MessageSquareQuote,
  ExternalLink,
  Package,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  Search,
  Send,
  ShieldAlert,
  Truck,
  MessageCircle,
  Files,
  ArrowRight,
  Hammer,
  Home,
  ClipboardList,
  Upload,
  X,
  Calendar,
  Globe
} from 'lucide-react';
import ChainLinkCalculator from './components/ChainLinkCalc';
import InventoryManager from './components/InventoryManager';
import BlindCountBoard from './components/BlindCountBoard';
import WeightCalculator from './components/WeightCalculator';
import WeatherWidget from './components/WeatherWidget';
import { useI18n } from './i18n';

// ── APP COMPONENTS ──

const Sidebar = ({ activeSection, setActiveSection }) => {
  const { t } = useI18n();
  return (
  <aside className="sidebar-app">
    <div className="sidebar-brand-box">
      <img src="https://d1qpm27e29dlmy.cloudfront.net/wp-content/uploads/2025/05/22130933/logoV2.webp" alt="Superior Logo" />
    </div>

    <nav className="sidebar-menu">
      <button
        className={`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveSection('dashboard')}
      >
        <LayoutGrid />
        <span>{t('sidebar_dashboard')}</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'documents' ? 'active' : ''}`}
        onClick={() => setActiveSection('documents')}
      >
        <FolderKanban />
        <span>{t('sidebar_sop_library')}</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'inventory' ? 'active' : ''}`}
        onClick={() => setActiveSection('inventory')}
      >
        <Package />
        <span>{t('sidebar_inventory')}</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'tools' ? 'active' : ''}`}
        onClick={() => setActiveSection('tools')}
      >
        <Calculator />
        <span>{t('sidebar_shop_tools')}</span>
      </button>
      <button
        className={`menu-item assistant-trigger ${activeSection === 'assistant' ? 'active' : ''}`}
        onClick={() => setActiveSection('assistant')}
      >
        <MessageSquareQuote />
        <span>{t('sidebar_ask_bob')}</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'yardcrew' ? 'active' : ''}`}
        onClick={() => setActiveSection('yardcrew')}
      >
        <ClipboardList />
        <span>{t('sidebar_yard_crew')}</span>
      </button>

      <div className="menu-divider" style={{ borderTop: '1px solid var(--border-color)', margin: '10px 0', opacity: 0.2 }}></div>

      <a href="https://live.sosinventory.com/" target="_blank" rel="noreferrer" className="menu-item">
        <img src="https://www.google.com/s2/favicons?domain=sosinventory.com&sz=128" alt="SOS Inventory" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
        <span>{t('sidebar_sos_inventory')}</span>
      </a>
      <a href="https://www.fence360.net/login" target="_blank" rel="noreferrer" className="menu-item">
        <img src="https://www.google.com/s2/favicons?domain=fence360.net&sz=128" alt="Fence 360" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
        <span>{t('sidebar_fence360')}</span>
      </a>
    </nav>
  </aside>
  );
};

const Topbar = ({ sectionTitle, aiStatus, time, weather }) => {
  const { t, lang, toggleLang } = useI18n();
  return (
  <header className="app-topbar">
    <div className="topbar-left">
      <h2 className="current-module-title oswald-title">
        <span className="brand-text-accent">{t('topbar_fence_pro')}</span> {sectionTitle}
      </h2>
    </div>
    <div className="topbar-right">
      {weather && (
        <div className="topbar-weather">
          <div className="weather-item">
            <span className="weather-val">{Math.round(weather.current.temperature_2m)}°</span>
            <span className="weather-label">{t('topbar_temp')}</span>
          </div>
          <div className="weather-item hidden-mobile">
            <span className="weather-val">{Math.round(weather.current.wind_speed_10m)}</span>
            <span className="weather-label">{t('topbar_mph')}</span>
          </div>
        </div>
      )}
      <button
        onClick={toggleLang}
        className="status-badge"
        style={{ cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)' }}
        title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
      >
        <Globe size={14} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em' }}>{t('lang_label')}</span>
      </button>
      <div className="status-badge">
        <span className="status-pulse" style={{
          backgroundColor: aiStatus === 'ACTIVE' ? '#10b981' : '#f59e0b',
          boxShadow: aiStatus === 'ACTIVE' ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
        }}></span>
        <span id="ai-status-text">{t('topbar_fence_pro')} {aiStatus}</span>
      </div>
      <div className="topbar-clock oswald-title">{time}</div>
    </div>
  </header>
  );
};

const Dashboard = ({ setActiveSection, docCount, aiStatus }) => {
  const [panelTab, setPanelTab] = useState('calendar');
  const { t } = useI18n();

  return (
  <div className="dashboard-content">
    <div className="dashboard-head">
      <div className="greeting-box">
        <h1 className="oswald-title">{t('dash_good_afternoon')}</h1>
        <p>{t('dash_tagline')}</p>
        <div className="session-info">{t('dash_session_info')}</div>
      </div>
    </div>

    <div className="widget-grid">
      <div className="widget stat-widget maroon">
        <span className="w-val">100%</span>
        <span className="w-label">{t('dash_quality_compliant')}</span>
      </div>
      <div className="widget stat-widget gray">
        <span className="w-val">20+</span>
        <span className="w-label">{t('dash_yrs_veteran_tech')}</span>
      </div>
      <div className="widget stat-widget green">
        <span className="w-val" style={{ color: aiStatus === 'ACTIVE' ? '#689689' : '#821302' }}>
          {aiStatus === 'ACTIVE' ? t('dash_ready') : t('dash_offline')}
        </span>
        <span className="w-label">{t('dash_big_bob_status')}</span>
      </div>
      <div className="widget stat-widget beige">
        <span className="w-val">{docCount}</span>
        <span className="w-label">{t('dash_synced_docs')}</span>
      </div>

      <div className="widget big-widget">
        <h3 className="widget-title oswald-title">{t('dash_direct_commands')}</h3>
        <div className="button-rack">
          <button className="action-btn green-solid" onClick={() => setActiveSection('assistant')}>
            <MessageCircle size={18} /> {t('dash_chat_with_bob')}
          </button>
          <button className="action-btn maroon-solid" onClick={() => setActiveSection('documents')}>
            <Files size={18} /> {t('dash_browse_library')}
          </button>
          <button className="action-btn outline" onClick={() => setActiveSection('yardcrew')}>
            <ClipboardList size={18} /> {t('dash_yard_crew')}
          </button>
          <button className="action-btn outline" onClick={() => setActiveSection('tools')}>
            <Calculator size={18} /> {t('dash_material_calc')}
          </button>
        </div>
      </div>

      <div className="widget big-widget" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="flex bg-gray-100 border-b border-gray-200">
          <button 
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-colors ${panelTab === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-200'}`}
            onClick={() => setPanelTab('calendar')}
          >
            {t('dash_shop_calendar')}
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-colors ${panelTab === 'fence360' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-200'}`}
            onClick={() => setPanelTab('fence360')}
          >
            {t('dash_fence_360_crm')}
          </button>
        </div>
        <div className="flex-1 w-full relative" style={{ minHeight: '450px' }}>
          {panelTab === 'calendar' ? (
            <iframe
              src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showPrint=0&src=aHVkc29udmFsbGV5cHJvZHVjdGlvbkBzdXBlcmlvcmZlbmNlYW5kcmFpbC5jb20&src=Y18zMDZmYTQ4MGU4ZWU0OTMzYzQxODAwNmRlMDliZjY3OGE2Yjg2N2NmNWQzMDk2M2E0NWVhZWQyOTJjYjdmNDlhQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19mM2U4MWM0NzQyNTU4OTcwZjU2ZmY1ZjU1MzgwYWM2MWQwM2M5YzFhNGQxN2MwNjUzMDZiM2NjNzVlNjA4NjY1QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y182MTQ4YTE1ZDlhMDAzMWZjODA0N2RmNTIwZGZkMzU3ZDI3ZmJlMjM3YzgyYjFhNDEyMjVjNDlkNzc5ZTI2NmY1QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19mNWI5NjMwNDU2M2M2NzM3NDczZjJhNDQyZGE5ZDc3ZjhmOGQxNDIzMGQ3OGY5MmY2ZjFmZTg3MzFkZmI4OWU4QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19mODI0YTE1YzhjNDQ0NTY3ZTVlN2I3YmExYjYxM2I4MTFhOGVjMjhmNmQ5MTc5NWFmOWRkYmQwNDRlM2E1MzBlQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y18zMzU2ODgyMDUwZDkzY2U2ODNiZjc1NDAzZDA2MDhhY2RkNDYzOTcxYTRkNmZmMjg3ZTBkMTliN2RkNWY5ZTRiQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19kMzIxY2Y5MGVhZWZlZGE1NTM3Y2JlZDA3MzVjM2UyZDM2ODI1Y2RjODZkNjMxNzg4YmNmNDBkOTg3ZTAxNGZiQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19jNzgyZTllNjk3NmE2MTA0NDFjYmI1OGM5M2E2ZDAxOWExYzZmZTE3YzdmNmJjZTg5OGExODc3NjhhZWYyODQ2QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=YXJ0LmZpc2hlckBzdXBlcmlvcmZlbmNlYW5kcmFpbC5jb20&src=Y19iZThjMGZhYWU2NzZlZGEzODFlMmY4M2UwY2FkNDA0ZTkzZjhlMmNkNjRkYmEzMGRmMWM4Y2YxNTI2OWFmZDIxQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23039be5&color=%233f51b5&color=%23e9e7e4&color=%23795548&color=%23c0ca33&color=%23ad1457&color=%23e4c441&color=%23d50000&color=%23ad1457&color=%238e24aa&color=%23616161"
              style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              frameBorder="0"
              scrolling="auto"
              title="Google Calendar"
            ></iframe>
          ) : (
            <iframe
              src="https://www.fence360.net/login"
              style={{ border: 0, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              frameBorder="0"
              scrolling="auto"
              title="Fence 360 CRM"
            ></iframe>
          )}
        </div>
      </div>

      <div className="widget big-widget" style={{ padding: 0 }}>
         <WeightCalculator />
      </div>
    </div>
  </div>
  );
};

const Assistant = ({ aiStatus, pendingMessage, clearPendingMessage }) => {
  const { t } = useI18n();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: t('asst_intro') }
  ]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const speak = (text) => {
    window.speechSynthesis.cancel();

    // Clean out markdown and typographical symbols so he speaks naturally
    const cleanText = text.replace(/[*_#`]/g, '').replace(/\[|\]|\(|\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Find a deeper/gruffer voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.toLowerCase().includes('en-us') && v.name.toLowerCase().includes('male')) 
      || voices.find(v => v.name.includes('Google US English')) 
      || voices[0];
      
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = 0.6; // Even lower pitch for a gruff voice
    utterance.rate = 0.85; // Speak more deliberately
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideMsg) => {
    const msgToSend = overrideMsg || input.trim();
    if (!msgToSend) return;

    if (!overrideMsg) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msgToSend }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
          message: msgToSend,
          history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })).slice(-10)
        }),
      });

      const data = await response.json();
      const reply = data.reply || data.error || t('asst_system_error');
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      
      // Auto-read if it's an SOP explanation (optional improvement)
      // speak(reply); 
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: t('asst_connection_failed') }]);
    }
  };

  // Handle message from document library
  useEffect(() => {
    if (pendingMessage) {
      handleSend(pendingMessage);
      clearPendingMessage();
    }
  }, [pendingMessage]);

  return (
    <div className="assistant-ui">
      <div className="assistant-pane-left">
        <div className="bob-card">
          <div className="bob-avatar" onClick={() => speak(messages[messages.length-1].text)}>BB</div>
          <h3 className="oswald-title">{t('asst_shop_boss')}</h3>
          <p>{t('asst_big_bob')}</p>
          {isSpeaking && <div className="speaking-indicator">{t('asst_voice_active')}</div>}
        </div>
        <div className="quick-prompts">
          <span className="label">{t('asst_quick_tasks')}</span>
          <button className="p-btn" onClick={() => handleSend(t('asst_prompt_loading'))}>{t('asst_truck_loading')}</button>
          <button className="p-btn" onClick={() => handleSend(t('asst_prompt_staging'))}>{t('asst_staging_codes')}</button>
          <button className="p-btn" onClick={() => handleSend(t('asst_prompt_ppe'))}>{t('asst_ppe_reqs')}</button>
        </div>
      </div>
      <div className="assistant-pane-main">
        <div className="chat-header-bar">
          <h3 className="oswald-title">{t('asst_veteran_consultation')}</h3>
           <button 
            className="action-btn outline btn-sm" 
            onClick={() => window.speechSynthesis.cancel()}
            style={{ fontSize: '10px', height: '24px' }}
          >
            {t('asst_mute_bob')}
          </button>
        </div>
        <div className="chat-viewport">
          <div className="message-stack">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role === 'user' ? 'outgoing' : 'incoming'}`}>
                <div className="bubble">
                  {m.text}
                  {m.role === 'assistant' && (
                    <button className="speak-msg-btn" onClick={() => speak(m.text)}>
                      <MessageSquareQuote size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
        <div className="chat-input-row">
          <div className="input-shell">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={t('asst_type_command')}
              rows="1"
            />
            <button className="btn-send" onClick={() => handleSend()}><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP SHELL ──

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [time, setTime] = useState('--:-- --');
  const [aiStatus, setAiStatus] = useState('ACTIVE');
  const [docCount, setDocCount] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [tools, setTools] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  const [pendingBobMessage, setPendingBobMessage] = useState(null);
  const [weather, setWeather] = useState(null);

  const { t } = useI18n();

  // Document Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', category: t('doc_cat_sop'), file: null });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Clock
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toUpperCase());
    }, 1000);

    // Initial Data
    const fetchData = async () => {
      try {
        const headers = { 'Bypass-Tunnel-Reminder': 'true' };
        const [docsRes, toolsRes, statusRes] = await Promise.all([
          fetch('/api/documents', { headers }),
          fetch('/api/tools', { headers }),
          fetch('/api/status', { headers })
        ]);

        const docsData = await docsRes.json();
        const toolsData = await toolsRes.json();
        const statusData = await statusRes.json();

        const flatDocs = docsData.categories.flatMap(c => c.docs);
        setDocuments(flatDocs);
        setDocCount(flatDocs.length);
        setTools(toolsData.tools);
        setAiStatus(statusData.aiConfigured ? 'ACTIVE' : 'OFFLINE');
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };

    // Weather
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=41.9270&longitude=-73.9974&current=temperature_2m,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York`);
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Weather failed", err);
      }
    };

    fetchData();
    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.name) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('name', uploadData.name);
    formData.append('category', uploadData.category);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Bypass-Tunnel-Reminder': 'true'
        }
      });
      const data = await res.json();
      if (data.categories) {
        const flatDocs = data.categories.flatMap(c => c.docs);
        setDocuments(flatDocs);
        setDocCount(flatDocs.length);
      }
      setShowUploadModal(false);
      setUploadData({ name: '', category: t('doc_cat_sop'), file: null });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return t('section_command');
      case 'documents': return t('section_library');
      case 'inventory': return t('section_logistics');
      case 'tools': return t('section_tools');
      case 'assistant': return t('section_consultation');
      case 'yardcrew': return t('section_digital_clipboard');
      case 'calendar': return t('section_schedule');
      default: return t('section_command');
    }
  };

  return (
    <div className="app-workspace">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="app-main">
        <Topbar sectionTitle={getSectionTitle()} aiStatus={aiStatus} time={time} weather={weather} />

        <div className="app-viewport">
          {activeSection === 'dashboard' && (
            <div className="module active">
              <Dashboard setActiveSection={setActiveSection} docCount={docCount} aiStatus={aiStatus} />
            </div>
          )}

          {activeSection === 'assistant' && (
            <div className="module active">
              <Assistant 
                aiStatus={aiStatus} 
                pendingMessage={pendingBobMessage} 
                clearPendingMessage={() => setPendingBobMessage(null)}
              />
            </div>
          )}

          {activeSection === 'yardcrew' && (
            <div className="module active" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="module-header">
                <h1 className="oswald-title">{t('yard_digital_clipboard')}</h1>
              </div>
              <BlindCountBoard counterName={t('yard_supervisor')} />
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className="module active">
              <InventoryManager />
            </div>
          )}

          {activeSection === 'documents' && (
            <div className="module active">
              <div className="module-header">
                <h1 className="oswald-title">{t('doc_document_library')}</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="action-btn green-solid" onClick={() => setShowUploadModal(true)}>
                    <Upload size={18} /> {t('doc_upload_doc')}
                  </button>
                  <div className="utility-search">
                    <Search size={18} />
                    <input type="text" placeholder={t('doc_filter_sops')} />
                  </div>
                </div>
              </div>
              <div className="app-grid">
                {documents.map((doc, i) => (
                  <div key={i} className="widget" style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <Files color="#821302" size={24} onClick={() => window.open(doc.url, '_blank')} />
                      <div style={{ flex: 1 }} onClick={() => window.open(doc.url, '_blank')}>
                        <strong style={{ textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>{doc.name}</strong>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{t('doc_sop_reference')} • {doc.status}</p>
                      </div>
                      <button 
                        className="action-btn outline btn-sm" 
                        style={{ fontSize: '10px', padding: '4px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingBobMessage(t('doc_explain_prompt', { name: doc.name }));
                          setActiveSection('assistant');
                        }}
                      >
                        {t('doc_ask_bob')}
                      </button>
                      <ArrowRight size={16} color="#ccc" onClick={() => window.open(doc.url, '_blank')} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Modal */}
              {showUploadModal && (
                <div className="modal-overlay">
                  <div className="modal-content" style={{ maxWidth: '500px' }}>
                    <div className="modal-header">
                      <h2 className="oswald-title">{t('doc_upload_new')}</h2>
                      <button className="icon-btn" onClick={() => setShowUploadModal(false)}>
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="form-group">
                        <label>{t('doc_document_name')}</label>
                        <input
                          type="text"
                          required
                          value={uploadData.name}
                          onChange={e => setUploadData({ ...uploadData, name: e.target.value })}
                          placeholder={t('doc_name_placeholder')}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('doc_category')}</label>
                        <select
                          value={uploadData.category}
                          onChange={e => setUploadData({ ...uploadData, category: e.target.value })}
                        >
                          <option value={t('doc_cat_sop')}>{t('doc_cat_sop')}</option>
                          <option value={t('doc_cat_training')}>{t('doc_cat_training')}</option>
                          <option value={t('doc_cat_cmm')}>{t('doc_cat_cmm')}</option>
                          <option value={t('doc_cat_reference')}>{t('doc_cat_reference')}</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t('doc_file')}</label>
                        <input
                          type="file"
                          required
                          onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })}
                        />
                      </div>
                      <div className="button-rack" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="button" className="action-btn outline" onClick={() => setShowUploadModal(false)}>
                          {t('doc_cancel')}
                        </button>
                        <button type="submit" className="action-btn green-solid" disabled={uploading}>
                          {uploading ? t('doc_uploading') : t('doc_upload')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'tools' && (
            <div className="module active">
              {!activeTool ? (
                <>
                  <div className="module-header">
                    <h1 className="oswald-title">{t('tools_shop_tools')}</h1>
                  </div>
                  <div className="app-grid">
                    {tools.map((tool, i) => (
                      <div
                        key={i}
                        className="widget"
                        style={{ cursor: tool.id === 'material-calc' ? 'pointer' : 'default' }}
                        onClick={() => tool.id === 'material-calc' && setActiveTool('chain-link')}
                      >
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <Hammer color="#689689" size={24} />
                          <div style={{ flex: 1 }}>
                            <strong style={{ textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>{tool.name}</strong>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{tool.category}</p>
                          </div>
                          {tool.id === 'material-calc' && <ArrowRight size={16} color="var(--superior-green)" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <ChainLinkCalculator onBack={() => setActiveTool(null)} />
              )}
            </div>
          )}


        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="mobile-app-bar">
        <button className={`m-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}><Home /></button>
        <button className={`m-btn ${activeSection === 'inventory' ? 'active' : ''}`} onClick={() => setActiveSection('inventory')}><Package /></button>
        <button className={`m-btn ${activeSection === 'yardcrew' ? 'active' : ''}`} onClick={() => setActiveSection('yardcrew')}><ClipboardList /></button>

        <button className={`m-btn ${activeSection === 'documents' ? 'active' : ''}`} onClick={() => setActiveSection('documents')}><FolderKanban /></button>
        <button className={`m-btn ${activeSection === 'tools' ? 'active' : ''}`} onClick={() => setActiveSection('tools')}><Hammer /></button>
      </nav>
    </div>
  );
}

export default App;
