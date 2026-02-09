import { useParams, Link } from 'react-router';

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);

function PositionDetail() {
    const { id } = useParams();

    // Placeholder - will be replaced with Convex query
    const position = null;
    const candidates = [];

    if (!position) {
        return (
            <div className="position-detail">
                <div className="not-found">
                    <h2>Position Not Found</h2>
                    <p>The position you're looking for doesn't exist or has been deleted.</p>
                    <Link to="/positions" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        <ArrowLeftIcon /> Back to Positions
                    </Link>
                </div>
                <style>{`
          .position-detail { padding: 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
          .not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); }
          .not-found h2 { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
          .not-found p { color: var(--text-secondary); }
        `}</style>
            </div>
        );
    }

    return (
        <div className="position-detail">
            <header className="page-header">
                <Link to="/positions" className="back-link"><ArrowLeftIcon /> Back to Positions</Link>
                <div className="header-content">
                    <h1 className="page-title">{position?.name || 'Position'}</h1>
                    <p className="page-description">{position?.description || 'No description'}</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">Edit Position</button>
                    <button className="btn btn-primary"><PlusIcon /> Add Candidate</button>
                </div>
            </header>

            <section className="attributes-section">
                <h2 className="section-title">Evaluation Attributes</h2>
                <div className="attributes-table">
                    <p className="empty-text">No attributes defined yet.</p>
                </div>
            </section>

            <section className="candidates-section">
                <h2 className="section-title">Candidates ({candidates.length})</h2>
                <div className="candidates-table">
                    <p className="empty-text">No candidates added yet.</p>
                </div>
            </section>

            <style>{`
        .position-detail { padding: 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
        .page-header { margin-bottom: 2rem; animation: slideDown 0.5s ease-out; }
        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem; text-decoration: none; transition: color var(--transition-fast); }
        .back-link:hover { color: var(--color-primary-400); }
        .page-title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
        .page-description { font-size: 1rem; color: var(--text-secondary); margin-bottom: 1.5rem; }
        .header-actions { display: flex; gap: 0.75rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
        .attributes-section, .candidates-section { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; margin-bottom: 1.5rem; animation: slideUp 0.5s ease-out; }
        .empty-text { color: var(--text-muted); font-size: 0.9375rem; text-align: center; padding: 2rem; }
      `}</style>
        </div>
    );
}

export default PositionDetail;
