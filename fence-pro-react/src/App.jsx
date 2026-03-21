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
  Calendar
} from 'lucide-react';
import ChainLinkCalculator from './components/ChainLinkCalc';
import InventoryManager from './components/InventoryManager';
import BlindCountBoard from './components/BlindCountBoard';

// ── APP COMPONENTS ──

const Sidebar = ({ activeSection, setActiveSection }) => (
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
        <span>DASHBOARD</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'documents' ? 'active' : ''}`}
        onClick={() => setActiveSection('documents')}
      >
        <FolderKanban />
        <span>SOP LIBRARY</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'inventory' ? 'active' : ''}`}
        onClick={() => setActiveSection('inventory')}
      >
        <Package />
        <span>INVENTORY</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'tools' ? 'active' : ''}`}
        onClick={() => setActiveSection('tools')}
      >
        <Calculator />
        <span>SHOP TOOLS</span>
      </button>
      <button
        className={`menu-item assistant-trigger ${activeSection === 'assistant' ? 'active' : ''}`}
        onClick={() => setActiveSection('assistant')}
      >
        <MessageSquareQuote />
        <span>ASK BOB</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'yardcrew' ? 'active' : ''}`}
        onClick={() => setActiveSection('yardcrew')}
      >
        <ClipboardList />
        <span>YARD CREW</span>
      </button>
      <button
        className={`menu-item ${activeSection === 'calendar' ? 'active' : ''}`}
        onClick={() => setActiveSection('calendar')}
      >
        <Calendar />
        <span>CALENDAR</span>
      </button>

      <div className="menu-divider" style={{ borderTop: '1px solid var(--border-color)', margin: '10px 0', opacity: 0.2 }}></div>

      <a href="https://live.sosinventory.com/" target="_blank" rel="noreferrer" className="menu-item">
        <img src="https://www.google.com/s2/favicons?domain=sosinventory.com&sz=128" alt="SOS Inventory" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
        <span>SOS INVENTORY</span>
      </a>
      <a href="https://www.fence360.net/login" target="_blank" rel="noreferrer" className="menu-item">
        <img src="https://www.google.com/s2/favicons?domain=fence360.net&sz=128" alt="Fence 360" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
        <span>FENCE 360</span>
      </a>
    </nav>
  </aside>
);

const Topbar = ({ sectionTitle, aiStatus, time }) => (
  <header className="app-topbar">
    <div className="topbar-left">
      <h2 className="current-module-title oswald-title">
        <span className="brand-text-accent">FENCE-PRO</span> {sectionTitle}
      </h2>
    </div>
    <div className="topbar-right">
      <div className="status-badge">
        <span className="status-pulse" style={{
          backgroundColor: aiStatus === 'ACTIVE' ? '#10b981' : '#f59e0b',
          boxShadow: aiStatus === 'ACTIVE' ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
        }}></span>
        <span id="ai-status-text">FENCE-PRO {aiStatus}</span>
      </div>
      <div className="topbar-clock oswald-title">{time}</div>
    </div>
  </header>
);

const Dashboard = ({ setActiveSection, docCount, aiStatus }) => (
  <div className="dashboard-content">
    <div className="dashboard-head">
      <div className="greeting-box">
        <h1 className="oswald-title">GOOD AFTERNOON</h1>
        <p>ESTABLISHED STANDARDS. SUPERIOR RESULTS.</p>
        <div className="session-info">FENCE-PRO CONSOLE // SESSION ACTIVE</div>
      </div>
    </div>

    <div className="widget-grid">
      <div className="widget stat-widget maroon">
        <span className="w-val">100%</span>
        <span className="w-label">QUALITY COMPLIANT</span>
      </div>
      <div className="widget stat-widget gray">
        <span className="w-val">20+</span>
        <span className="w-label">YRS VETERAN TECH</span>
      </div>
      <div className="widget stat-widget green">
        <span className="w-val" style={{ color: aiStatus === 'ACTIVE' ? '#689689' : '#821302' }}>
          {aiStatus === 'ACTIVE' ? 'READY' : 'OFFLINE'}
        </span>
        <span className="w-label">BIG BOB STATUS</span>
      </div>
      <div className="widget stat-widget beige">
        <span className="w-val">{docCount}</span>
        <span className="w-label">SYNCED DOCS</span>
      </div>

      <div className="widget big-widget">
        <h3 className="widget-title oswald-title">DIRECT COMMANDS</h3>
        <div className="button-rack">
          <button className="action-btn green-solid" onClick={() => setActiveSection('assistant')}>
            <MessageCircle size={18} /> CHAT WITH BOB
          </button>
          <button className="action-btn maroon-solid" onClick={() => setActiveSection('documents')}>
            <Files size={18} /> BROWSE LIBRARY
          </button>
          <button className="action-btn outline" onClick={() => setActiveSection('yardcrew')}>
            <ClipboardList size={18} /> YARD CREW
          </button>
          <button className="action-btn outline" onClick={() => setActiveSection('tools')}>
            <Calculator size={18} /> MATERIAL CALC
          </button>
        </div>
      </div>

      <div className="widget big-widget">
        <h3 className="widget-title oswald-title">OPERATIONAL ADVISORY</h3>
        <div className="advisory-feed">
          <div className="adv-card">
            <ShieldAlert size={20} />
            <div className="adv-info">
              <strong>PPE PROTOCOL</strong>
              <p>Confirming eye and ear protection across all vinyl routing stations.</p>
            </div>
          </div>
          <div className="adv-card">
            <Truck size={20} />
            <div className="adv-info">
              <strong>LOAD SEQUENCE</strong>
              <p>Trailers must be verified and strapped by 06:30 AM local time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Assistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Listen up! 👋 I'm Big Bob. I run this shop and make sure we build 'em right and build 'em safe. What do you need?" }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })).slice(-10)
        }),
      });

      const data = await response.json();
      const reply = data.reply || data.error || 'System error. Recalibrate and try again.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'No handshake with Superior Core. Connection failed.' }]);
    }
  };

  return (
    <div className="assistant-ui">
      <div className="assistant-pane-left">
        <div className="bob-card">
          <div className="bob-avatar">BB</div>
          <h3 className="oswald-title">THE SHOP BOSS</h3>
          <p>Big Bob</p>
        </div>
        <div className="quick-prompts">
          <span className="label">QUICK TASKS</span>
          <button className="p-btn" onClick={() => setInput("Show morning loading sequence.")}>TRUCK LOADING</button>
          <button className="p-btn" onClick={() => setInput("What is the vinyl staging color code?")}>STAGING CODES</button>
          <button className="p-btn" onClick={() => setInput("What PPE is needed for routing?")}>PPE REQS</button>
        </div>
      </div>
      <div className="assistant-pane-main">
        <div className="chat-header-bar">
          <h3 className="oswald-title">VETERAN CONSULTATION</h3>
        </div>
        <div className="chat-viewport">
          <div className="message-stack">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role === 'user' ? 'outgoing' : 'incoming'}`}>
                <div className="bubble">
                  {m.text}
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
              placeholder="Type command here..."
              rows="1"
            />
            <button className="btn-send" onClick={handleSend}><Send size={18} /></button>
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

  // Document Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', category: 'Standard Operating Procedures', file: null });
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

    fetchData();
    return () => clearInterval(timer);
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
      setUploadData({ name: '', category: 'Standard Operating Procedures', file: null });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'COMMAND';
      case 'documents': return 'LIBRARY';
      case 'inventory': return 'LOGISTICS';
      case 'tools': return 'TOOLS';
      case 'assistant': return 'CONSULTATION';
      case 'yardcrew': return 'DIGITAL CLIPBOARD';
      case 'calendar': return 'SCHEDULE';
      default: return 'COMMAND';
    }
  };

  return (
    <div className="app-workspace">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="app-main">
        <Topbar sectionTitle={getSectionTitle()} aiStatus={aiStatus} time={time} />

        <div className="app-viewport">
          {activeSection === 'dashboard' && (
            <div className="module active">
              <Dashboard setActiveSection={setActiveSection} docCount={docCount} aiStatus={aiStatus} />
            </div>
          )}

          {activeSection === 'assistant' && (
            <div className="module active">
              <Assistant aiStatus={aiStatus} />
            </div>
          )}

          {activeSection === 'yardcrew' && (
            <div className="module active" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="module-header">
                <h1 className="oswald-title">YARD CREW DIGITAL CLIPBOARD</h1>
              </div>
              <BlindCountBoard counterName="Yard Supervisor" />
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
                <h1 className="oswald-title">DOCUMENT LIBRARY</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="action-btn green-solid" onClick={() => setShowUploadModal(true)}>
                    <Upload size={18} /> UPLOAD DOC
                  </button>
                  <div className="utility-search">
                    <Search size={18} />
                    <input type="text" placeholder="Filter Superior SOPs..." />
                  </div>
                </div>
              </div>
              <div className="app-grid">
                {documents.map((doc, i) => (
                  <div key={i} className="widget" style={{ cursor: 'pointer' }} onClick={() => window.open(doc.url, '_blank')}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <Files color="#821302" size={24} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ textTransform: 'uppercase', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>{doc.name}</strong>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>SOP REFERENCE • {doc.status}</p>
                      </div>
                      <ArrowRight size={16} color="#ccc" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Modal */}
              {showUploadModal && (
                <div className="modal-overlay">
                  <div className="modal-content" style={{ maxWidth: '500px' }}>
                    <div className="modal-header">
                      <h2 className="oswald-title">UPLOAD NEW DOCUMENT</h2>
                      <button className="icon-btn" onClick={() => setShowUploadModal(false)}>
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="form-group">
                        <label>DOCUMENT NAME</label>
                        <input
                          type="text"
                          required
                          value={uploadData.name}
                          onChange={e => setUploadData({ ...uploadData, name: e.target.value })}
                          placeholder="e.g. New Safety Protocol"
                        />
                      </div>
                      <div className="form-group">
                        <label>CATEGORY</label>
                        <select
                          value={uploadData.category}
                          onChange={e => setUploadData({ ...uploadData, category: e.target.value })}
                        >
                          <option value="Standard Operating Procedures">Standard Operating Procedures</option>
                          <option value="Training & Onboarding">Training & Onboarding</option>
                          <option value="CMM Documents">CMM Documents</option>
                          <option value="Reference">Reference</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>FILE</label>
                        <input
                          type="file"
                          required
                          onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })}
                        />
                      </div>
                      <div className="button-rack" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="button" className="action-btn outline" onClick={() => setShowUploadModal(false)}>
                          CANCEL
                        </button>
                        <button type="submit" className="action-btn green-solid" disabled={uploading}>
                          {uploading ? 'UPLOADING...' : 'UPLOAD'}
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
                    <h1 className="oswald-title">SHOP TOOLS</h1>
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

          {activeSection === 'calendar' && (
            <div className="module active" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
              <div className="module-header pb-4 border-b border-gray-200 mb-6 flex justify-between items-end">
                <div>
                  <h1 className="oswald-title text-3xl font-black text-gray-900 uppercase">COMMAND CENTER</h1>
                  <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mt-1">Calendar & Fence 360 Integration</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '600px' }}>
                {/* Google Calendar Panel */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
                  <div className="bg-gray-900 text-white px-4 py-2 font-black uppercase text-sm flex items-center justify-between">
                    <span>SHOP CALENDAR</span>
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <iframe
                    src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showPrint=0&src=aHVkc29udmFsbGV5cHJvZHVjdGlvbkBzdXBlcmlvcmZlbmNlYW5kcmFpbC5jb20&src=Y18zMDZmYTQ4MGU4ZWU0OTMzYzQxODAwNmRlMDliZjY3OGE2Yjg2N2NmNWQzMDk2M2E0NWVhZWQyOTJjYjdmNDlhQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19mM2U4MWM0NzQyNTU4OTcwZjU2ZmY1ZjU1MzgwYWM2MWQwM2M5YzFhNGQxN2MwNjUzMDZiM2NjNzVlNjA4NjY1QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y182MTQ4YTE1ZDlhMDAzMWZjODA0N2RmNTIwZGZkMzU3ZDI3ZmJlMjM3YzgyYjFhNDEyMjVjNDlkNzc5ZTI2NmY1QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19mNWI5NjMwNDU2M2M2NzM3NDczZjJhNDQyZGE5ZDc3ZjhmOGQxNDIzMGQ3OGY5MmY2ZjFmZTg3MzFkZmI4OWU4QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19mODI0YTE1YzhjNDQ0NTY3ZTVlN2I3YmExYjYxM2I4MTFhOGVjMjhmNmQ5MTc5NWFmOWRkYmQwNDRlM2E1MzBlQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y18zMzU2ODgyMDUwZDkzY2U2ODNiZjc1NDAzZDA2MDhhY2RkNDYzOTcxYTRkNmZmMjg3ZTBkMTliN2RkNWY5ZTRiQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19kMzIxY2Y5MGVhZWZlZGE1NTM3Y2JlZDA3MzVjM2UyZDM2ODI1Y2RjODZkNjMxNzg4YmNmNDBkOTg3ZTAxNGZiQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=Y19jNzgyZTllNjk3NmE2MTA0NDFjYmI1OGM5M2E2ZDAxOWExYzZmZTE3YzdmNmJjZTg5OGExODc3NjhhZWYyODQ2QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&src=YXJ0LmZpc2hlckBzdXBlcmlvcmZlbmNlYW5kcmFpbC5jb20&src=Y19iZThjMGZhYWU2NzZlZGEzODFlMmY4M2UwY2FkNDA0ZTkzZjhlMmNkNjRkYmEzMGRmMWM4Y2YxNTI2OWFmZDIxQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23039be5&color=%233f51b5&color=%23e9e7e4&color=%23795548&color=%23c0ca33&color=%23ad1457&color=%23e4c441&color=%23d50000&color=%23ad1457&color=%238e24aa&color=%23616161"
                    style={{ border: 0, width: '100%', flex: 1 }}
                    frameBorder="0"
                    scrolling="auto"
                    title="Google Calendar"
                  ></iframe>
                </div>

                {/* Fence 360 Panel */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
                  <div className="bg-amber-600 text-white px-4 py-2 font-black uppercase text-sm flex items-center justify-between">
                    <span>FENCE 360 CRM</span>
                    <span className="w-4 h-4 rounded-sm bg-white flex items-center justify-center">
                      <img src="https://www.google.com/s2/favicons?domain=fence360.net&sz=32" alt="F360" style={{ width: '12px', height: '12px' }} />
                    </span>
                  </div>
                  <iframe
                    src="https://www.fence360.net/login"
                    style={{ border: 0, width: '100%', flex: 1 }}
                    frameBorder="0"
                    scrolling="auto"
                    title="Fence 360"
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="mobile-app-bar">
        <button className={`m-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}><Home /></button>
        <button className={`m-btn ${activeSection === 'inventory' ? 'active' : ''}`} onClick={() => setActiveSection('inventory')}><Package /></button>
        <button className={`m-btn ${activeSection === 'yardcrew' ? 'active' : ''}`} onClick={() => setActiveSection('yardcrew')}><ClipboardList /></button>
        <button className={`m-btn ${activeSection === 'calendar' ? 'active' : ''}`} onClick={() => setActiveSection('calendar')}><Calendar /></button>
        <button className={`m-btn ${activeSection === 'documents' ? 'active' : ''}`} onClick={() => setActiveSection('documents')}><FolderKanban /></button>
        <button className={`m-btn ${activeSection === 'tools' ? 'active' : ''}`} onClick={() => setActiveSection('tools')}><Hammer /></button>
      </nav>
    </div>
  );
}

export default App;
