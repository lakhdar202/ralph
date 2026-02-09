import { useParams, Link, useNavigate } from 'react-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState } from 'react';
import PositionForm from '../components/positions/PositionForm';

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

function PositionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const deletePosition = useMutation(api.positions.remove);

    const position = useQuery(api.positions.get, id ? { id } : "skip");
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        await deletePosition({ id });
        navigate('/positions');
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

            {/* Candidates Section - Placeholder for Milestone 3 */}
            <section className="candidates-section">
                <div className="section-header">
                    <h2 className="section-title">Candidates (0)</h2>
                    <button className="btn btn-primary btn-sm" disabled>
                        <PlusIcon /> Add Candidate
                    </button>
                </div>
                <p className="empty-text">Candidate management will be available in the next update.</p>
            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Position?</h3>
                        <p>This will permanently delete "{position.name}" and all associated candidates. This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Delete Position</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form Modal */}
            {showEditForm && (
                <PositionForm
                    onClose={() => setShowEditForm(false)}
                    editPosition={position}
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
                
                .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
                .section-title { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
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
                
                .empty-text { color: var(--text-muted); font-size: 0.9375rem; text-align: center; padding: 2rem; }
                
                .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
                .btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); border-color: transparent; color: white; }
                .btn-danger:hover { background: linear-gradient(135deg, #dc2626, #b91c1c); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; animation: fadeIn 0.2s ease-out; }
                .confirm-modal { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 2rem; max-width: 400px; text-align: center; animation: slideUp 0.3s ease-out; }
                .confirm-modal h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem; }
                .confirm-modal p { color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; }
                .modal-actions { display: flex; gap: 0.75rem; justify-content: center; }
            `}</style>
        </div>
    );
}

export default PositionDetail;
