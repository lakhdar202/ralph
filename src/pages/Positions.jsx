import { useState } from 'react';
import { Link } from 'react-router';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);

function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-icon"><BriefcaseIcon /></div>
            <h3>No positions yet</h3>
            <p>Create your first position to start evaluating candidates</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}><PlusIcon /> Create Position</button>
        </div>
    );
}

function Positions() {
    const [searchQuery, setSearchQuery] = useState('');
    const positions = [];

    return (
        <div className="positions-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Positions</h1>
                    <p className="page-description">Manage job positions and their evaluation criteria</p>
                </div>
                <button className="btn btn-primary"><PlusIcon /> New Position</button>
            </header>

            {positions.length > 0 && (
                <div className="toolbar">
                    <div className="search-wrapper">
                        <SearchIcon />
                        <input type="text" className="input" placeholder="Search positions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
                    </div>
                </div>
            )}

            {positions.length === 0 ? <EmptyState /> : (
                <div className="positions-grid">
                    {positions.map((p) => <Link key={p.id} to={`/positions/${p.id}`} className="glass-card" style={{ padding: '1.5rem' }}>{p.name}</Link>)}
                </div>
            )}

            <style>{`
        .positions-page { padding: 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 2rem; margin-bottom: 2rem; animation: slideDown 0.5s ease-out; }
        .page-title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
        .page-description { font-size: 1rem; color: var(--text-secondary); }
        .toolbar { margin-bottom: 2rem; }
        .search-wrapper { position: relative; max-width: 400px; }
        .search-wrapper svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); z-index: 1; }
        .positions-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 2px dashed var(--border-color); border-radius: var(--radius-xl); animation: fadeIn 0.5s ease-out; }
        .empty-icon { width: 80px; height: 80px; background: var(--bg-secondary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 1.5rem; }
        .empty-state h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
        .empty-state p { font-size: 0.9375rem; color: var(--text-secondary); max-width: 400px; }
      `}</style>
        </div>
    );
}

export default Positions;
