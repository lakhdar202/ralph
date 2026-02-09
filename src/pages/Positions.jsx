import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PositionForm from '../components/positions/PositionForm';

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

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
    </svg>
);

function EmptyState({ onCreateClick }) {
    return (
        <div className="empty-state">
            <div className="empty-icon"><BriefcaseIcon /></div>
            <h3>No positions yet</h3>
            <p>Create your first position to start evaluating candidates using TOPSIS</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={onCreateClick}>
                <PlusIcon /> Create Position
            </button>
        </div>
    );
}

function PositionCard({ position, onEdit, onDelete }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const attributeCount = position.attributes?.length || 0;
    const createdDate = new Date(position.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const handleDelete = () => {
        onDelete(position._id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="position-card glass-card">
            <div className="card-header">
                <div className="card-icon">
                    <BriefcaseIcon />
                </div>
                <div className="card-actions">
                    <button className="btn-icon-sm" onClick={() => onEdit(position)} title="Edit">
                        <EditIcon />
                    </button>
                    <button className="btn-icon-sm btn-danger" onClick={() => setShowDeleteConfirm(true)} title="Delete">
                        <TrashIcon />
                    </button>
                </div>
            </div>

            <Link to={`/positions/${position._id}`} className="card-body">
                <h3 className="card-title">{position.name}</h3>
                <p className="card-description">{position.description || 'No description'}</p>
            </Link>

            <div className="card-footer">
                <div className="card-stat">
                    <ChartIcon />
                    <span>{attributeCount} attributes</span>
                </div>
                <div className="card-stat">
                    <UsersIcon />
                    <span>0 candidates</span>
                </div>
                <span className="card-date">{createdDate}</span>
            </div>

            {showDeleteConfirm && (
                <div className="delete-confirm">
                    <p>Delete this position?</p>
                    <div className="confirm-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Positions() {
    const positions = useQuery(api.positions.list) || [];
    const deletePosition = useMutation(api.positions.remove);

    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPosition, setEditingPosition] = useState(null);

    const filteredPositions = positions.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (position) => {
        setEditingPosition(position);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        await deletePosition({ id });
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingPosition(null);
    };

    const isLoading = positions === undefined;

    return (
        <div className="positions-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Positions</h1>
                    <p className="page-description">Manage job positions and their evaluation criteria</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <PlusIcon /> New Position
                </button>
            </header>

            {positions.length > 0 && (
                <div className="toolbar">
                    <div className="search-wrapper">
                        <SearchIcon />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search positions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '2.75rem' }}
                        />
                    </div>
                    <div className="position-count">
                        {filteredPositions.length} of {positions.length} positions
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading positions...</p>
                </div>
            ) : positions.length === 0 ? (
                <EmptyState onCreateClick={() => setShowForm(true)} />
            ) : filteredPositions.length === 0 ? (
                <div className="no-results">
                    <p>No positions match "{searchQuery}"</p>
                    <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>Clear search</button>
                </div>
            ) : (
                <div className="positions-grid">
                    {filteredPositions.map((p) => (
                        <PositionCard
                            key={p._id}
                            position={p}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <PositionForm
                    onClose={handleCloseForm}
                    editPosition={editingPosition}
                />
            )}

            <style>{`
                .positions-page {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }
                .page-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 2rem;
                    margin-bottom: 2rem;
                    animation: slideDown 0.5s ease-out;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .page-description {
                    font-size: 1rem;
                    color: var(--text-secondary);
                }
                .toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .search-wrapper {
                    position: relative;
                    max-width: 400px;
                    flex: 1;
                }
                .search-wrapper svg {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    z-index: 1;
                }
                .position-count {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }
                .positions-grid {
                    display: grid;
                    gap: 1.5rem;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                }
                .position-card {
                    padding: 0;
                    overflow: hidden;
                    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
                    position: relative;
                }
                .position-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid var(--border-color);
                }
                .card-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .card-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-icon-sm {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                .btn-icon-sm:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .btn-icon-sm.btn-danger:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.3);
                }
                .card-body {
                    display: block;
                    padding: 1.25rem;
                    text-decoration: none;
                    transition: background var(--transition-fast);
                }
                .card-body:hover {
                    background: var(--bg-secondary);
                }
                .card-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .card-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .card-footer {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                }
                .card-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .card-date {
                    margin-left: auto;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .delete-confirm {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    animation: fadeIn 0.2s ease-out;
                }
                .delete-confirm p {
                    color: var(--text-primary);
                    font-weight: 500;
                }
                .confirm-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                }
                .btn-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    border-color: transparent;
                }
                .btn-danger:hover {
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                }
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    gap: 1rem;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-color);
                    border-top-color: var(--color-primary-500);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .loading-state p {
                    color: var(--text-secondary);
                }
                .no-results {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 4rem 2rem;
                }
                .no-results p {
                    color: var(--text-secondary);
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 4rem 2rem;
                    background: var(--bg-card);
                    border: 2px dashed var(--border-color);
                    border-radius: var(--radius-xl);
                    animation: fadeIn 0.5s ease-out;
                }
                .empty-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }
                .empty-state h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .empty-state p {
                    font-size: 0.9375rem;
                    color: var(--text-secondary);
                    max-width: 400px;
                }
            `}</style>
        </div>
    );
}

export default Positions;
