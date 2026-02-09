import { Link } from 'react-router';

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
);

const RocketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    </svg>
);

function Analysis() {
    // Placeholder - will be replaced with Convex queries
    const positions = [];
    const recentAnalyses = [];

    return (
        <div className="analysis-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Analysis</h1>
                    <p className="page-description">Run TOPSIS analysis to rank candidates objectively</p>
                </div>
            </header>

            {positions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><ChartIcon /></div>
                    <h3>No positions to analyze</h3>
                    <p>Create a position and add candidates first to run TOPSIS analysis</p>
                    <Link to="/positions" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        <RocketIcon /> Create Position
                    </Link>
                </div>
            ) : (
                <>
                    <section className="section">
                        <h2 className="section-title">Select Position to Analyze</h2>
                        <div className="positions-grid">
                            {positions.map((p) => (
                                <button key={p.id} className="position-btn">{p.name}</button>
                            ))}
                        </div>
                    </section>

                    {recentAnalyses.length > 0 && (
                        <section className="section">
                            <h2 className="section-title">Recent Analyses</h2>
                            <div className="analyses-list">
                                {recentAnalyses.map((a) => (
                                    <div key={a.id} className="analysis-item">{a.positionName}</div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            <section className="info-section">
                <div className="info-card">
                    <h3>About TOPSIS</h3>
                    <p><strong>TOPSIS</strong> (Technique for Order of Preference by Similarity to Ideal Solution) is a multi-criteria decision analysis method that ranks alternatives based on their distance from the ideal best and worst solutions.</p>
                    <div className="formula">
                        <code>Score = Distance to Worst / (Distance to Best + Distance to Worst)</code>
                    </div>
                    <p>Higher scores indicate candidates closer to the ideal solution.</p>
                </div>
            </section>

            <style>{`
        .analysis-page { padding: 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
        .page-header { margin-bottom: 2rem; animation: slideDown 0.5s ease-out; }
        .page-title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
        .page-description { font-size: 1rem; color: var(--text-secondary); }
        .section { margin-bottom: 2rem; animation: slideUp 0.5s ease-out; }
        .section-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 2px dashed var(--border-color); border-radius: var(--radius-xl); animation: fadeIn 0.5s ease-out; }
        .empty-icon { width: 100px; height: 100px; background: var(--bg-secondary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 1.5rem; }
        .empty-state h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
        .empty-state p { font-size: 0.9375rem; color: var(--text-secondary); max-width: 400px; }
        .positions-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        .position-btn { padding: 1rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); color: var(--text-primary); font-size: 0.9375rem; font-weight: 500; cursor: pointer; transition: all var(--transition-fast); text-align: left; }
        .position-btn:hover { border-color: var(--color-primary-500); background: var(--bg-card-hover); }
        .info-section { margin-top: 3rem; animation: slideUp 0.5s ease-out 0.2s both; }
        .info-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; }
        .info-card h3 { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; }
        .info-card p { font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem; }
        .formula { background: var(--bg-secondary); border-radius: var(--radius-md); padding: 1rem; margin: 1rem 0; }
        .formula code { color: var(--color-accent-400); font-family: monospace; font-size: 0.875rem; }
      `}</style>
        </div>
    );
}

export default Analysis;
