import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function CandidateTable({ candidates, position, onEdit }) {
    const updateCandidate = useMutation(api.candidates.update);
    const deleteCandidate = useMutation(api.candidates.remove);

    const [editingCell, setEditingCell] = useState(null); // { candidateId, field }
    const [editValue, setEditValue] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleCellDoubleClick = (candidate, field, currentValue) => {
        setEditingCell({ candidateId: candidate._id, field });
        setEditValue(String(currentValue));
    };

    const handleSaveCell = async (candidate) => {
        if (!editingCell) return;

        try {
            if (editingCell.field === 'name') {
                // Update candidate name
                await updateCandidate({
                    id: candidate._id,
                    name: editValue.trim(),
                    data: candidate.data,
                });
            } else {
                // Update attribute value
                const newData = candidate.data.map(d =>
                    d.attributeName === editingCell.field
                        ? { ...d, value: parseFloat(editValue) }
                        : d
                );
                await updateCandidate({
                    id: candidate._id,
                    name: candidate.name,
                    data: newData,
                });
            }
        } catch (error) {
            console.error('Error updating candidate:', error);
        } finally {
            setEditingCell(null);
            setEditValue('');
        }
    };

    const handleCancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const handleKeyDown = (e, candidate) => {
        if (e.key === 'Enter') {
            handleSaveCell(candidate);
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleDelete = async (candidateId) => {
        try {
            await deleteCandidate({ id: candidateId });
        } catch (error) {
            console.error('Error deleting candidate:', error);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const getCellValue = (candidate, attrName) => {
        const data = candidate.data.find(d => d.attributeName === attrName);
        return data?.value ?? '-';
    };

    const isEditing = (candidateId, field) =>
        editingCell?.candidateId === candidateId && editingCell?.field === field;

    if (!candidates || candidates.length === 0) {
        return null;
    }

    return (
        <div className="candidate-table-wrapper">
            <table className="data-table candidate-table">
                <thead>
                    <tr>
                        <th className="name-col">Candidate Name</th>
                        {position.attributes.map(attr => (
                            <th key={attr.name} className="attr-col">
                                <span>{attr.name}</span>
                                <span className={`direction-indicator ${attr.beneficial ? 'up' : 'down'}`}>
                                    {attr.beneficial ? '↑' : '↓'}
                                </span>
                            </th>
                        ))}
                        <th className="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map(candidate => (
                        <tr key={candidate._id}>
                            {/* Name Cell */}
                            <td
                                className="name-cell"
                                onDoubleClick={() => handleCellDoubleClick(candidate, 'name', candidate.name)}
                            >
                                {isEditing(candidate._id, 'name') ? (
                                    <div className="inline-edit">
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, candidate)}
                                            autoFocus
                                        />
                                        <button className="edit-btn save" onClick={() => handleSaveCell(candidate)}>
                                            <CheckIcon />
                                        </button>
                                        <button className="edit-btn cancel" onClick={handleCancelEdit}>
                                            <XIcon />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="editable-cell">{candidate.name}</span>
                                )}
                            </td>

                            {/* Attribute Cells */}
                            {position.attributes.map(attr => (
                                <td
                                    key={attr.name}
                                    className="value-cell"
                                    onDoubleClick={() => handleCellDoubleClick(candidate, attr.name, getCellValue(candidate, attr.name))}
                                >
                                    {isEditing(candidate._id, attr.name) ? (
                                        <div className="inline-edit">
                                            <input
                                                type="number"
                                                step="any"
                                                min={attr.min}
                                                max={attr.max}
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, candidate)}
                                                autoFocus
                                            />
                                            <button className="edit-btn save" onClick={() => handleSaveCell(candidate)}>
                                                <CheckIcon />
                                            </button>
                                            <button className="edit-btn cancel" onClick={handleCancelEdit}>
                                                <XIcon />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="editable-cell">{getCellValue(candidate, attr.name)}</span>
                                    )}
                                </td>
                            ))}

                            {/* Actions Cell */}
                            <td className="actions-cell">
                                <button
                                    className="action-btn edit"
                                    onClick={() => onEdit(candidate)}
                                    title="Edit candidate"
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => setDeleteConfirm(candidate._id)}
                                    title="Delete candidate"
                                >
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay small" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Candidate?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .candidate-table-wrapper {
                    overflow-x: auto;
                    margin-top: 1rem;
                }
                
                .candidate-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .candidate-table th {
                    text-align: left;
                    padding: 0.75rem 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid var(--border-color);
                    white-space: nowrap;
                }
                
                .candidate-table th .direction-indicator {
                    margin-left: 0.5rem;
                    font-size: 0.625rem;
                    padding: 0.125rem 0.375rem;
                    border-radius: var(--radius-full);
                }
                
                .direction-indicator.up {
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                }
                
                .direction-indicator.down {
                    background: rgba(234, 179, 8, 0.15);
                    color: #eab308;
                }
                
                .candidate-table td {
                    padding: 0.875rem 1rem;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .candidate-table tr:last-child td {
                    border-bottom: none;
                }
                
                .candidate-table tr:hover {
                    background: var(--bg-secondary);
                }
                
                .name-col {
                    min-width: 180px;
                }
                
                .attr-col {
                    min-width: 120px;
                }
                
                .actions-col {
                    width: 100px;
                    text-align: center;
                }
                
                .name-cell {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                
                .value-cell {
                    color: var(--text-secondary);
                    font-variant-numeric: tabular-nums;
                }
                
                .editable-cell {
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    margin: -0.25rem -0.5rem;
                    border-radius: var(--radius-sm);
                    transition: background var(--transition-fast);
                }
                
                .editable-cell:hover {
                    background: var(--bg-tertiary);
                }
                
                .inline-edit {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }
                
                .inline-edit input {
                    flex: 1;
                    min-width: 80px;
                    padding: 0.375rem 0.5rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--color-primary-500);
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                }
                
                .inline-edit input:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
                }
                
                .edit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border: none;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .edit-btn.save {
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                }
                
                .edit-btn.save:hover {
                    background: rgba(34, 197, 94, 0.25);
                }
                
                .edit-btn.cancel {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }
                
                .edit-btn.cancel:hover {
                    background: rgba(239, 68, 68, 0.25);
                }
                
                .actions-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                
                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .action-btn.edit {
                    background: rgba(139, 92, 246, 0.1);
                    color: var(--color-primary-400);
                }
                
                .action-btn.edit:hover {
                    background: rgba(139, 92, 246, 0.2);
                }
                
                .action-btn.delete {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
                
                .action-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                }
                
                .modal-overlay.small {
                    z-index: 1001;
                }
                
                .confirm-modal {
                    max-width: 360px;
                    text-align: center;
                }
                
                .confirm-modal h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                
                .confirm-modal p {
                    color: var(--text-secondary);
                    margin-bottom: 1.5rem;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                }
                
                .btn-danger {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    border-color: transparent;
                    color: white;
                }
                
                .btn-danger:hover {
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                }
            `}</style>
        </div>
    );
}

export default CandidateTable;
