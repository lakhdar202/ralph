import { NavLink, Outlet } from 'react-router';

// Icon Components for Navigation
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);

const PositionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const AnalysisIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
    </svg>
);

const Logo = () => (
    <div className="logo">
        <div className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
            </svg>
        </div>
        <div className="logo-text">
            <span className="logo-title">TOPSIS</span>
            <span className="logo-subtitle">Recruit</span>
        </div>
    </div>
);

const navItems = [
    { path: '/', label: 'Dashboard', icon: DashboardIcon },
    { path: '/positions', label: 'Positions', icon: PositionsIcon },
    { path: '/analysis', label: 'Analysis', icon: AnalysisIcon },
];

function Layout() {
    return (
        <div className="app-layout">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Logo />
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                    end={item.path === '/'}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="version-badge">
                        <span>v1.0.0</span>
                    </div>
                    <p className="footer-text">Powered by TOPSIS Algorithm</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Styles */}
            <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }
        
        .sidebar {
          width: 260px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
        }
        
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .logo-icon {
          width: 44px;
          height: 44px;
          background: var(--gradient-primary);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        
        .logo-title {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-primary-400), var(--color-accent-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }
        
        .logo-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0.75rem;
          overflow-y: auto;
        }
        
        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-secondary);
          border-radius: var(--radius-lg);
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        
        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }
        
        .nav-link.active {
          color: white;
          background: var(--gradient-primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        
        .nav-link.active:hover {
          background: var(--gradient-primary);
        }
        
        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        
        .version-badge {
          display: inline-flex;
          padding: 0.25rem 0.75rem;
          background: var(--bg-card);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        
        .footer-text {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .main-content {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          background: var(--bg-primary);
          position: relative;
        }
        
        /* Decorative background elements */
        .main-content::before {
          content: '';
          position: fixed;
          top: -50%;
          right: -20%;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        
        .main-content::after {
          content: '';
          position: fixed;
          bottom: -30%;
          left: 10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(20, 184, 166, 0.06) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .sidebar {
            width: 220px;
          }
          
          .main-content {
            margin-left: 220px;
          }
        }
        
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
        </div>
    );
}

export default Layout;
