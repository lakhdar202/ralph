import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState } from 'react';
import PositionForm from '../components/positions/PositionForm';
import CandidateForm from '../components/candidates/CandidateForm';
import CandidateTable from '../components/candidates/CandidateTable';
import BulkImport from '../components/candidates/BulkImport';

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

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
        <path d="m7 11 4-4 4 4 6-6" />
    </svg>
);

function PositionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const deletePosition = useMutation(api.positions.remove);

    const position = useQuery(api.positions.get, id ? { id } : "skip");
    const candidates = useQuery(api.candidates.listByPosition, id ? { positionId: id } : "skip");

    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCandidateForm, setShowCandidateForm] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);

    const handleDelete = async () => {
        await deletePosition({ id });
        navigate('/positions');
    };

    const handleEditCandidate = (candidate) => {
        setEditingCandidate(candidate);
        setShowCandidateForm(true);
    };

    const handleCloseCandidateForm = () => {
        setShowCandidateForm(false);
        setEditingCandidate(null);
    };

    // Loading state
    if (position === undefined) {
        return (
            <div className="position-detail">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading position...</p>
                </div>
                <style>{`
                    .position-detail { padding: 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
                    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; gap: 1rem; }
                    .spinner { width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--color-primary-500); border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    .loading-state p { color: var(--text-secondary); }
                `}</style>
            </div>
        );
    }

    // Not found state
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

    const candidateCount = candidates?.length || 0;
    const hasAttributes = position.attributes?.length > 0;
    const canAddCandidates = hasAttributes;

    return (
        <div className="position-detail">
            <header className="page-header">
                <Link to="/positions" className="back-link"><ArrowLeftIcon /> Back to Positions</Link>
                <div className="header-content">
                    <h1 className="page-title">{position.name}</h1>
                    <p className="page-description">{position.description || 'No description provided'}</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setShowEditForm(true)}>
                        <EditIcon /> Edit Position
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                        <TrashIcon /> Delete
                    </button>
                </div>
            </header>

            {/* Attributes Section */}
            <section className="attributes-section">
                <h2 className="section-title">Evaluation Attributes ({position.attributes?.length || 0})</h2>
                {position.attributes?.length > 0 ? (
                    <div className="attributes-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Attribute Name</th>
                                    <th>Type</th>
                                    <th>Weight</th>
                                    <th>Direction</th>
                                    <th>Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {position.attributes.map((attr, index) => (
                                    <tr key={index}>
                                        <td className="attr-name">{attr.name}</td>
                                        <td>
                                            <span className="badge badge-type">{attr.type}</span>
                                        </td>
                                        <td>
                                            <div className="weight-bar">
                                                <div className="weight-fill" style={{ width: `${attr.weight * 100}%` }}></div>
                                                <span className="weight-text">{(attr.weight * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${attr.beneficial ? 'badge-success' : 'badge-warning'}`}>
                                                {attr.beneficial ? <><CheckIcon /> Higher is better</> : <><XIcon /> Lower is better</>}
                                            </span>
                                        </td>
                                        <td className="range-cell">
                                            {attr.min !== undefined && attr.max !== undefined
                                                ? `${attr.min} - ${attr.max}`
                                                : '—'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="empty-text">No attributes defined. Edit the position to add evaluation criteria.</p>
                )}
            </section>

            {/* Candidates Section */}
            <section className="candidates-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <UsersIcon /> Candidates ({candidateCount})
                    </h2>
                    {canAddCandidates && (
                        <div className="section-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkImport(true)}>
                                <UploadIcon /> Bulk Import
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowCandidateForm(true)}>
                                <PlusIcon /> Add Candidate
                            </button>
                        </div>
                    )}
                </div>

                {!canAddCandidates ? (
                    <div className="empty-state">
                        <p className="empty-text">Add evaluation attributes first before adding candidates.</p>
                    </div>
                ) : candidateCount === 0 ? (
                    <div className="empty-state">
                        <UsersIcon className="empty-icon" />
                        <h3>No Candidates Yet</h3>
                        <p>Add candidates manually or bulk import from a spreadsheet.</p>
                        <div className="empty-actions">
                            <button className="btn btn-secondary" onClick={() => setShowBulkImport(true)}>
                                <UploadIcon /> Bulk Import
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowCandidateForm(true)}>
                                <PlusIcon /> Add First Candidate
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="section-hint">Double-click any cell to edit. Press Enter to save, Escape to cancel.</p>
                        <CandidateTable
                            candidates={candidates}
                            position={position}
                            onEdit={handleEditCandidate}
                        />

                        {candidateCount >= 2 && (
                            <div className="analysis-cta">
                                <ChartIcon />
                                <div>
                                    <p><strong>Ready for TOPSIS Analysis</strong></p>
                                    <p className="hint">You have enough candidates to run the ranking algorithm.</p>
                                </div>
                                <Link to={`/analysis?position=${id}`} className="btn btn-primary btn-sm">
                                    Run Analysis →
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Position?</h3>
                        <p>This will permanently delete "{position.name}" and all {candidateCount} associated candidates. This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Delete Position</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Position Form Modal */}
            {showEditForm && (
                <PositionForm
                    onClose={() => setShowEditForm(false)}
                    editPosition={position}
                />
            )}

            {/* Candidate Form Modal */}
            {showCandidateForm && (
                <CandidateForm
                    position={position}
                    editCandidate={editingCandidate}
                    onClose={handleCloseCandidateForm}
                />
            )}

            {/* Bulk Import Modal */}
            {showBulkImport && (
                <BulkImport
                    position={position}
                    onClose={() => setShowBulkImport(false)}
                    onSuccess={(count) => console.log(`Imported ${count} candidates`)}
                />
            )}

            <style>{`
                .position-detail { padding: 2rem; max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
                .page-header { margin-bottom: 2rem; animation: slideDown 0.5s ease-out; }
                .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem; text-decoration: none; transition: color var(--transition-fast); }
                .back-link:hover { color: var(--color-primary-400); }
                .page-title { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
                .page-description { font-size: 1rem; color: var(--text-secondary); margin-bottom: 1.5rem; max-width: 600px; }
                .header-actions { display: flex; gap: 0.75rem; }
                
                .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
                .section-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
                .section-actions { display: flex; gap: 0.5rem; }
                .section-hint { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.5rem; }
                
                .attributes-section, .candidates-section { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 1.5rem; margin-bottom: 1.5rem; animation: slideUp 0.5s ease-out; }
                
                .attributes-table-wrapper { overflow-x: auto; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
                .data-table td { padding: 1rem; border-bottom: 1px solid var(--border-color); }
                .data-table tr:last-child td { border-bottom: none; }
                .data-table tr:hover { background: var(--bg-secondary); }
                .attr-name { font-weight: 500; color: var(--text-primary); }
                
                .badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.625rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 500; }
                .badge-type { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
                .badge-success { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .badge-warning { background: rgba(234, 179, 8, 0.15); color: #eab308; }
                
                .weight-bar { position: relative; width: 100px; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
                .weight-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500)); border-radius: 4px; transition: width 0.3s ease; }
                .weight-text { position: absolute; right: -40px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
                .range-cell { color: var(--text-muted); font-size: 0.875rem; }
                
                .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; text-align: center; }
                .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin: 1rem 0 0.5rem; }
                .empty-state p { color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 1.5rem; }
                .empty-actions { display: flex; gap: 0.75rem; }
                .empty-text { color: var(--text-muted); font-size: 0.9375rem; text-align: center; padding: 2rem; }
                
                .analysis-cta { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; padding: 1rem 1.25rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: var(--radius-lg); }
                .analysis-cta p { margin: 0; }
                .analysis-cta p strong { color: var(--text-primary); }
                .analysis-cta .hint { font-size: 0.8125rem; color: var(--text-muted); }
                .analysis-cta .btn { margin-left: auto; white-space: nowrap; }
                
                .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
                .btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); border-color: transparent; color: white; }
                .btn-danger:hover { background: linear-gradient(135deg, #dc2626, #b91c1c); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; animation: fadeIn 0.2s ease-out; }
                .modal-content { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 2rem; animation: slideUp 0.3s ease-out; }
                .confirm-modal { max-width: 400px; text-align: center; }
                .confirm-modal h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem; }
                .confirm-modal p { color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; }
                .modal-actions { display: flex; gap: 0.75rem; justify-content: center; }
            `}</style>
        </div>
    );
}

export default PositionDetail;
