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
  Home
} from 'lucide-react';
import ChainLinkCalculator from './components/ChainLinkCalc';
import InventoryManager from './components/InventoryManager';

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
    </nav>

    <div className="sidebar-utils">
      <a href="https://www.fence360.net/login" target="_blank" rel="noreferrer" className="util-btn" title="Fence360">
        <ExternalLink />
      </a>
      <a href="https://live.sosinventory.com/" target="_blank" rel="noreferrer" className="util-btn" title="SOS Inventory">
        <Package />
      </a>
    </div>
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
          <button className="action-btn outline" onClick={() => setActiveSection('inventory')}>
            <TrendingUp size={18} /> SHIFT CHECKLIST
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

const Assistant = ({ aiStatus }) => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })).slice(-10)
        }),
      });

      const data = await response.json();
      const reply = data.reply || data.error || 'System error. Recalibrate and try again.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (error) {
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
        const [docsRes, toolsRes, statusRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/tools'),
          fetch('/api/status')
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

  const getSectionTitle = () => {
    switch(activeSection) {
      case 'dashboard': return 'COMMAND';
      case 'documents': return 'LIBRARY';
      case 'inventory': return 'LOGISTICS';
      case 'tools': return 'TOOLS';
      case 'assistant': return 'CONSULTATION';
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

          {activeSection === 'inventory' && (
            <div className="module active">
              <InventoryManager />
            </div>
          )}

          {activeSection === 'documents' && (
            <div className="module active">
              <div className="module-header">
                <h1 className="oswald-title">DOCUMENT LIBRARY</h1>
                <div className="utility-search">
                  <Search size={18} />
                  <input type="text" placeholder="Filter Superior SOPs..." />
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
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="mobile-app-bar">
        <button className={`m-btn ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}><Home /></button>
        <button className={`m-btn ${activeSection === 'documents' ? 'active' : ''}`} onClick={() => setActiveSection('documents')}><FolderKanban /></button>
        <button className={`m-btn ${activeSection === 'inventory' ? 'active' : ''}`} onClick={() => setActiveSection('inventory')}><Package /></button>
        <button className={`m-btn ${activeSection === 'tools' ? 'active' : ''}`} onClick={() => setActiveSection('tools')}><Hammer /></button>
        <button className={`m-btn ${activeSection === 'assistant' ? 'active' : ''}`} onClick={() => setActiveSection('assistant')}><MessageSquareQuote /></button>
      </nav>
    </div>
  );
}

export default App;
