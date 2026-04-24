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

  useEffect(() => {
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
          {['dashboard', 'nist-800-53', 'pci-dss', 'dora', 'risk-register'].map(tab => (
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
              {tab.toUpperCase().replace('-', ' ')}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <h2>{activeTab.toUpperCase().replace('-', ' ')}</h2>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--alert-red)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Threat Level: ELEVATED
          </div>
        </header>

        <section className="glass-panel" style={{ minHeight: '400px' }}>
          {activeTab === 'dashboard' && (
             <div>
               <h3 style={{ marginBottom: '15px', color: 'var(--accent-purple)' }}>System Overview</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Governance Platform. Select a framework from the sidebar to view control mappings.</p>
             </div>
          )}
          
          {activeTab !== 'dashboard' && activeTab !== 'risk-register' && markdownContent && (
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
