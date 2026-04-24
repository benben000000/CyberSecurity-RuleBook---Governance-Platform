import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import frontMatter from 'front-matter';
import './index.css';

// Load markdown files eagerly
const mdFiles = import.meta.glob('./content/*.md', { query: '?raw', import: 'default', eager: true });

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [markdownContent, setMarkdownContent] = useState('');
  const [frontmatter, setFrontmatter] = useState({});
  const [siemLogs, setSiemLogs] = useState([]);
  const [doraAlert, setDoraAlert] = useState(false);

  useEffect(() => {
    if (activeTab === 'live-siem-feed') {
      fetch('/data/splunk_darkside_telemetry.json')
        .then(res => res.text())
        .then(text => {
          const lines = text.trim().split('\n').filter(l => l.length > 0);
          const parsedLogs = lines.map(line => {
            try {
              return JSON.parse(line);
            } catch(e) {
              return null;
            }
          }).filter(l => l !== null);
          
          setSiemLogs(parsedLogs);

          // Check for DORA Trigger (Event 4663 File Encryption or vssadmin execution)
          const isCritical = parsedLogs.some(log => 
            log.EventCode === "4663" || 
            (log.EventCode === "4688" && log.CommandLine.includes("vssadmin"))
          );
          if (isCritical) setDoraAlert(true);
        })
        .catch(err => console.error("Error fetching SIEM logs:", err));
      return;
    }

    if (activeTab === 'dashboard' || activeTab === 'risk-register') {
      setMarkdownContent('');
      setFrontmatter({});
      return;
    }

    // Try to find the matching file based on activeTab
    const matchPath = `./content/${activeTab}.md`;
    if (mdFiles[matchPath]) {
      const rawContent = mdFiles[matchPath];
      const parsed = frontMatter(rawContent);
      setFrontmatter(parsed.attributes);
      setMarkdownContent(parsed.body);
    } else {
      setMarkdownContent('## Content Not Found\nPlease create a markdown file in the `src/content` directory for this topic.');
      setFrontmatter({});
    }
  }, [activeTab]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--bg-panel)', padding: '20px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', marginBottom: '2rem' }}>CyberSecurity<br/>RuleBook</h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['dashboard', 'live-siem-feed', 'nist-800-53', 'pci-dss', 'dora', 'risk-register'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                color: activeTab === tab ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: 'none',
                textAlign: 'left',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              {tab.toUpperCase().replace(/-/g, ' ')}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <h2>{activeTab.toUpperCase().replace(/-/g, ' ')}</h2>
          <div style={{ background: doraAlert ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 211, 238, 0.1)', color: doraAlert ? 'var(--alert-red)' : 'var(--accent-cyan)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Threat Level: {doraAlert ? 'CRITICAL' : 'ELEVATED'}
          </div>
        </header>

        {doraAlert && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--alert-red)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <h3 style={{ color: 'var(--alert-red)', marginBottom: '10px' }}>⚠️ CRITICAL NOTIFICATION: DORA Article 19 Triggered</h3>
            <p style={{ color: 'var(--text-primary)' }}>A major ICT-related incident affecting critical functions has been detected (Ransomware Behavior / VSS Deletion). The 4-Hour mandatory reporting window to the competent authority has commenced.</p>
          </div>
        )}

        <section className="glass-panel" style={{ minHeight: '400px' }}>
          {activeTab === 'dashboard' && (
             <div>
               <h3 style={{ marginBottom: '15px', color: 'var(--accent-purple)' }}>System Overview</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Governance Platform. Select a framework from the sidebar to view control mappings, or monitor the Live SIEM Feed.</p>
             </div>
          )}

          {activeTab === 'live-siem-feed' && (
             <div>
               <h3 style={{ marginBottom: '15px', color: 'var(--accent-cyan)' }}>Splunk Universal Forwarder Feed</h3>
               <div style={{ background: '#000', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#0f0', overflowY: 'auto', maxHeight: '500px' }}>
                 {siemLogs.length === 0 ? <p>Waiting for telemetry...</p> : (
                   siemLogs.map((log, idx) => (
                     <div key={idx} style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                       <span style={{ color: '#888' }}>[{log.time}]</span> <strong style={{ color: log.EventCode === '4663' ? 'var(--alert-red)' : '#0f0' }}>EventID: {log.EventCode}</strong> - {log.ProcessName}<br/>
                       <span style={{ color: '#aaa' }}>Command: {log.CommandLine}</span><br/>
                       <span style={{ color: '#fff' }}>{log.Message}</span>
                     </div>
                   ))
                 )}
               </div>
             </div>
          )}
          
          {activeTab !== 'dashboard' && activeTab !== 'risk-register' && activeTab !== 'live-siem-feed' && markdownContent && (
             <div className="markdown-body">
               {frontmatter.title && (
                 <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                   <span style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 'bold' }}>{frontmatter.category}</span>
                   <h1 style={{ color: 'var(--text-primary)', marginTop: '5px', fontSize: '1.5rem' }}>{frontmatter.title}</h1>
                 </div>
               )}
               <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                 <ReactMarkdown>{markdownContent}</ReactMarkdown>
               </div>
             </div>
          )}
          
          {activeTab === 'risk-register' && (
             <div>
               <h3 style={{ marginBottom: '15px', color: 'var(--accent-cyan)' }}>FAIR Risk Register</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Quantitative risk modeling visualization goes here.</p>
             </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
