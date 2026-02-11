import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { topsis, validateCandidateData } from '../lib/topsis';
import ResultsCharts from '../components/analysis/ResultsCharts';
import ScoreBreakdown from '../components/analysis/ScoreBreakdown';
import ExportResults from '../components/analysis/ExportResults';

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

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

function Analysis() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedPositionId = searchParams.get('positionId');

    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all positions
    const positions = useQuery(api.positions.list) || [];

    // Fetch candidates for selected position
    const candidates = useQuery(
        api.candidates.listByPosition,
        selectedPositionId ? { positionId: selectedPositionId } : "skip"
    ) || [];

    // Fetch selected position details
    const selectedPosition = useQuery(
        api.positions.get,
        selectedPositionId ? { id: selectedPositionId } : "skip"
    );

    // Fetch latest analysis for selected position
    const latestAnalysis = useQuery(
        api.analysis.getLatest,
        selectedPositionId ? { positionId: selectedPositionId } : "skip"
    );

    // Fetch recent analyses for the sidebar
    const recentAnalyses = useQuery(api.analysis.listRecent, { limit: 5 }) || [];

    // Mutation to save analysis
    const saveAnalysis = useMutation(api.analysis.create);

    const handleSelectPosition = (positionId) => {
        setSearchParams({ positionId });
        setError(null);
    };

    const handleRunAnalysis = async () => {
        if (!selectedPosition || candidates.length < 2) {
            setError("Need at least 2 candidates to run TOPSIS analysis");
            return;
        }

        // Validate candidate data
        const validation = validateCandidateData(candidates, selectedPosition.attributes);
        if (!validation.valid) {
            setError(`Data validation failed:\n${validation.errors.join('\n')}`);
            return;
        }

        setIsRunning(true);
        setError(null);

        try {
            // Run TOPSIS algorithm
            const result = topsis(candidates, selectedPosition.attributes);

            // Save to database
            await saveAnalysis({
                positionId: selectedPositionId,
                results: result.rankings,
                idealBest: result.idealBest,
                idealWorst: result.idealWorst,
            });

        } catch (err) {
            setError(`Analysis failed: ${err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score) => {
        if (score >= 0.7) return 'var(--color-success-400)';
        if (score >= 0.4) return 'var(--color-warning-400)';
        return 'var(--color-error-400)';
    };

    const getRankMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="analysis-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">TOPSIS Analysis</h1>
                    <p className="page-description">Rank candidates objectively using multi-criteria decision analysis</p>
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
                <div className="analysis-layout">
                    {/* Left: Position selector & Recent analyses */}
                    <aside className="analysis-sidebar">
                        <div className="sidebar-section">
                            <h3 className="sidebar-title">Select Position</h3>
                            <div className="position-list">
                                {positions.map((p) => {
                                    const isSelected = p._id === selectedPositionId;
                                    return (
                                        <button
                                            key={p._id}
                                            className={`position-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelectPosition(p._id)}
                                        >
                                            <span className="position-name">{p.name}</span>
                                            <span className="position-attrs">{p.attributes.length} attributes</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {recentAnalyses.length > 0 && (
                            <div className="sidebar-section">
                                <h3 className="sidebar-title">Recent Analyses</h3>
                                <div className="recent-list">
                                    {recentAnalyses.map((a) => (
                                        <button
                                            key={a._id}
                                            className="recent-item"
                                            onClick={() => handleSelectPosition(a.positionId)}
                                        >
                                            <span className="recent-position">{a.positionName}</span>
                                            <span className="recent-date">
                                                <ClockIcon /> {formatDate(a.createdAt)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Right: Analysis area */}
                    <main className="analysis-main">
                        {!selectedPositionId ? (
                            <div className="select-prompt">
                                <ChartIcon />
                                <h3>Select a Position</h3>
                                <p>Choose a position from the left panel to run or view TOPSIS analysis</p>
                            </div>
                        ) : selectedPosition === undefined ? (
                            <div className="loading-state">Loading position...</div>
                        ) : !selectedPosition ? (
                            <div className="error-state">Position not found</div>
                        ) : (
                            <>
                                {/* Position header with Run button */}
                                <div className="analysis-header">
                                    <div className="analysis-position-info">
                                        <h2>{selectedPosition.name}</h2>
                                        <div className="position-meta">
                                            <span><UsersIcon /> {candidates.length} candidates</span>
                                            <span>•</span>
                                            <span>{selectedPosition.attributes.length} attributes</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-run"
                                        onClick={handleRunAnalysis}
                                        disabled={isRunning || candidates.length < 2}
                                    >
                                        {isRunning ? (
                                            <>
                                                <span className="spinner"></span>
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon /> Run TOPSIS
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="error-banner">
                                        {error}
                                    </div>
                                )}

                                {/* Warning if not enough candidates */}
                                {candidates.length < 2 && (
                                    <div className="warning-banner">
                                        Need at least 2 candidates to run analysis.
                                        <Link to={`/positions/${selectedPositionId}`}> Add candidates →</Link>
                                    </div>
                                )}

                                {/* No analysis yet */}
                                {!latestAnalysis && candidates.length >= 2 && (
                                    <div className="no-analysis">
                                        <TrophyIcon />
                                        <h3>Ready to Analyze</h3>
                                        <p>Click "Run TOPSIS" to rank your {candidates.length} candidates</p>
                                    </div>
                                )}

                                {/* Analysis results */}
                                {latestAnalysis && (
                                    <div className="results-container">
                                        <div className="results-header">
                                            <h3>Ranking Results</h3>
                                            <span className="results-date">
                                                <ClockIcon /> {formatDate(latestAnalysis.createdAt)}
                                            </span>
                                        </div>

                                        {/* Winner card */}
                                        {latestAnalysis.results.length > 0 && (
                                            <div className="winner-card">
                                                <div className="winner-medal">🏆</div>
                                                <div className="winner-info">
                                                    <span className="winner-label">Top Candidate</span>
                                                    <h4 className="winner-name">{latestAnalysis.results[0].candidateName}</h4>
                                                    <div className="winner-score">
                                                        Closeness Score: <strong>{(latestAnalysis.results[0].closenessScore * 100).toFixed(1)}%</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rankings table */}
                                        <div className="rankings-table-container">
                                            <table className="rankings-table">
                                                <thead>
                                                    <tr>
                                                        <th>Rank</th>
                                                        <th>Candidate</th>
                                                        <th>Score</th>
                                                        <th>Distance to Best</th>
                                                        <th>Distance to Worst</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {latestAnalysis.results.map((result) => (
                                                        <tr key={result.candidateId} className={result.rank <= 3 ? 'top-rank' : ''}>
                                                            <td className="rank-cell">
                                                                <span className={`rank-badge rank-${result.rank}`}>
                                                                    {getRankMedal(result.rank)}
                                                                </span>
                                                            </td>
                                                            <td className="candidate-cell">{result.candidateName}</td>
                                                            <td className="score-cell">
                                                                <div className="score-bar-container">
                                                                    <div
                                                                        className="score-bar"
                                                                        style={{
                                                                            width: `${result.closenessScore * 100}%`,
                                                                            backgroundColor: getScoreColor(result.closenessScore)
                                                                        }}
                                                                    />
                                                                    <span className="score-value">
                                                                        {(result.closenessScore * 100).toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="distance-cell">{result.distanceToBest.toFixed(4)}</td>
                                                            <td className="distance-cell">{result.distanceToWorst.toFixed(4)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Ideal solutions */}
                                        <div className="ideal-solutions">
                                            <div className="ideal-card ideal-best">
                                                <h4>Ideal Best (A+)</h4>
                                                <div className="ideal-values">
                                                    {selectedPosition.attributes.map((attr, i) => (
                                                        <span key={attr.name} className="ideal-value">
                                                            <span className="attr-name">{attr.name}:</span>
                                                            <span className="attr-val">{latestAnalysis.idealBest[i]?.toFixed(4) || 'N/A'}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="ideal-card ideal-worst">
                                                <h4>Ideal Worst (A-)</h4>
                                                <div className="ideal-values">
                                                    {selectedPosition.attributes.map((attr, i) => (
                                                        <span key={attr.name} className="ideal-value">
                                                            <span className="attr-name">{attr.name}:</span>
                                                            <span className="attr-val">{latestAnalysis.idealWorst[i]?.toFixed(4) || 'N/A'}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visual Charts */}
                                        <ResultsCharts
                                            results={latestAnalysis.results}
                                            candidates={candidates}
                                            attributes={selectedPosition.attributes}
                                        />

                                        {/* Score Breakdown Per Candidate */}
                                        <ScoreBreakdown
                                            results={latestAnalysis.results}
                                            candidates={candidates}
                                            attributes={selectedPosition.attributes}
                                        />

                                        {/* Export Results */}
                                        <ExportResults
                                            positionName={selectedPosition.name}
                                            results={latestAnalysis.results}
                                            candidates={candidates}
                                            attributes={selectedPosition.attributes}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            )}

            {/* Info section */}
            <section className="info-section">
                <div className="info-card">
                    <h3>How TOPSIS Works</h3>
                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-num">1</div>
                            <div className="step-content">
                                <strong>Normalize</strong>
                                <p>Convert values to a comparable scale using vector normalization</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-num">2</div>
                            <div className="step-content">
                                <strong>Weight</strong>
                                <p>Apply attribute weights based on their importance</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-num">3</div>
                            <div className="step-content">
                                <strong>Find Ideals</strong>
                                <p>Determine the ideal best (A+) and ideal worst (A-) solutions</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-num">4</div>
                            <div className="step-content">
                                <strong>Calculate Distance</strong>
                                <p>Measure Euclidean distance from each candidate to A+ and A-</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-num">5</div>
                            <div className="step-content">
                                <strong>Rank</strong>
                                <p>Score = D- / (D+ + D-) — Higher score = Better candidate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .analysis-page { padding: 2rem; max-width: 1600px; margin: 0 auto; position: relative; z-index: 1; }
                .page-header { margin-bottom: 2rem; animation: slideDown 0.5s ease-out; }
                .page-title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
                .page-description { font-size: 1rem; color: var(--text-secondary); }
                
                .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 2px dashed var(--border-color); border-radius: var(--radius-xl); animation: fadeIn 0.5s ease-out; }
                .empty-icon { width: 100px; height: 100px; background: var(--bg-secondary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 1.5rem; }
                .empty-state h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
                .empty-state p { font-size: 0.9375rem; color: var(--text-secondary); max-width: 400px; }
                
                .analysis-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; animation: fadeIn 0.5s ease-out; }
                
                .analysis-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
                .sidebar-section { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1rem; }
                .sidebar-title { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; padding: 0 0.5rem; }
                
                .position-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .position-item { display: flex; flex-direction: column; align-items: flex-start; padding: 0.75rem 1rem; background: var(--bg-secondary); border: 1px solid transparent; border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); text-align: left; }
                .position-item:hover { background: var(--bg-card-hover); border-color: var(--border-color); }
                .position-item.selected { background: rgba(99, 102, 241, 0.1); border-color: var(--color-primary-500); }
                .position-name { font-size: 0.9375rem; font-weight: 500; color: var(--text-primary); }
                .position-attrs { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }
                
                .recent-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .recent-item { display: flex; flex-direction: column; align-items: flex-start; padding: 0.75rem 1rem; background: var(--bg-secondary); border: none; border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); text-align: left; }
                .recent-item:hover { background: var(--bg-card-hover); }
                .recent-position { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
                .recent-date { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem; }
                
                .analysis-main { flex: 1; min-width: 0; }
                
                .select-prompt { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); color: var(--text-muted); }
                .select-prompt h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin: 1rem 0 0.5rem; }
                .select-prompt p { font-size: 0.9375rem; color: var(--text-secondary); }
                
                .loading-state, .error-state { padding: 2rem; text-align: center; color: var(--text-secondary); }
                
                .analysis-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); margin-bottom: 1.5rem; }
                .analysis-position-info h2 { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
                .position-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); }
                .position-meta span { display: flex; align-items: center; gap: 0.25rem; }
                
                .btn-run { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-size: 1rem; }
                .btn-run:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                .error-banner { padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--color-error-500); border-radius: var(--radius-lg); color: var(--color-error-400); margin-bottom: 1.5rem; white-space: pre-line; }
                
                .warning-banner { padding: 1rem; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--color-warning-500); border-radius: var(--radius-lg); color: var(--color-warning-400); margin-bottom: 1.5rem; }
                .warning-banner a { color: var(--color-primary-400); text-decoration: underline; }
                
                .no-analysis { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); }
                .no-analysis svg { color: var(--color-accent-400); margin-bottom: 1rem; }
                .no-analysis h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; }
                .no-analysis p { font-size: 0.9375rem; color: var(--text-secondary); }
                
                .results-container { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; animation: slideUp 0.5s ease-out; }
                .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .results-header h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
                .results-date { font-size: 0.875rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
                
                .winner-card { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-xl); margin-bottom: 1.5rem; }
                .winner-medal { font-size: 3rem; }
                .winner-info { flex: 1; }
                .winner-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
                .winner-name { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0.25rem 0 0.5rem; }
                .winner-score { font-size: 0.9375rem; color: var(--text-secondary); }
                .winner-score strong { color: var(--color-success-400); }
                
                .rankings-table-container { overflow-x: auto; margin-bottom: 1.5rem; }
                .rankings-table { width: 100%; border-collapse: collapse; }
                .rankings-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }
                .rankings-table td { padding: 1rem; border-bottom: 1px solid var(--border-color); }
                .rankings-table tr:last-child td { border-bottom: none; }
                .rankings-table tr.top-rank { background: rgba(99, 102, 241, 0.05); }
                
                .rank-cell { width: 60px; }
                .rank-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; font-size: 1.25rem; }
                .rank-badge.rank-1, .rank-badge.rank-2, .rank-badge.rank-3 { font-size: 1.5rem; }
                
                .candidate-cell { font-weight: 500; color: var(--text-primary); }
                
                .score-cell { min-width: 200px; }
                .score-bar-container { display: flex; align-items: center; gap: 0.75rem; }
                .score-bar { height: 8px; border-radius: 4px; transition: width 0.5s ease-out; }
                .score-value { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); min-width: 50px; }
                
                .distance-cell { font-size: 0.875rem; color: var(--text-secondary); font-family: monospace; }
                
                .ideal-solutions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .ideal-card { padding: 1rem; border-radius: var(--radius-lg); }
                .ideal-card h4 { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; }
                .ideal-best { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); }
                .ideal-best h4 { color: var(--color-success-400); }
                .ideal-worst { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
                .ideal-worst h4 { color: var(--color-error-400); }
                .ideal-values { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .ideal-value { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; background: var(--bg-secondary); border-radius: var(--radius-sm); font-size: 0.75rem; }
                .attr-name { color: var(--text-muted); }
                .attr-val { color: var(--text-primary); font-family: monospace; }
                
                .info-section { margin-top: 3rem; animation: slideUp 0.5s ease-out 0.2s both; }
                .info-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; }
                .info-card h3 { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1.5rem; }
                
                .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .step { display: flex; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-lg); }
                .step-num { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--color-primary-500); color: white; font-weight: 700; border-radius: var(--radius-full); flex-shrink: 0; }
                .step-content strong { display: block; color: var(--text-primary); margin-bottom: 0.25rem; }
                .step-content p { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }
                
                @media (max-width: 900px) {
                    .analysis-layout { grid-template-columns: 1fr; }
                    .analysis-sidebar { order: 2; }
                    .ideal-solutions { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}

export default Analysis;
