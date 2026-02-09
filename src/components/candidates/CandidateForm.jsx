import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

function CandidateForm({ position, onClose, editCandidate = null }) {
    const createCandidate = useMutation(api.candidates.create);
    const updateCandidate = useMutation(api.candidates.update);

    const [name, setName] = useState(editCandidate?.name || '');
    const [attributeValues, setAttributeValues] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize attribute values from position attributes
    useEffect(() => {
        if (position?.attributes) {
            const initialValues = {};
            position.attributes.forEach(attr => {
                if (editCandidate) {
                    const existingData = editCandidate.data.find(d => d.attributeName === attr.name);
                    initialValues[attr.name] = existingData?.value ?? '';
                } else {
                    initialValues[attr.name] = '';
                }
            });
            setAttributeValues(initialValues);
        }
    }, [position, editCandidate]);

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Candidate name is required';
        }

        position?.attributes?.forEach(attr => {
            const value = attributeValues[attr.name];
            if (value === '' || value === undefined) {
                newErrors[attr.name] = `${attr.name} is required`;
            } else {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    newErrors[attr.name] = 'Must be a valid number';
                } else if (attr.min !== undefined && numValue < attr.min) {
                    newErrors[attr.name] = `Must be at least ${attr.min}`;
                } else if (attr.max !== undefined && numValue > attr.max) {
                    newErrors[attr.name] = `Must be at most ${attr.max}`;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const data = position.attributes.map(attr => ({
                attributeName: attr.name,
                value: parseFloat(attributeValues[attr.name]),
            }));

            if (editCandidate) {
                await updateCandidate({
                    id: editCandidate._id,
                    name: name.trim(),
                    data,
                });
            } else {
                await createCandidate({
                    positionId: position._id,
                    name: name.trim(),
                    data,
                });
            }

            onClose();
        } catch (error) {
            console.error('Error saving candidate:', error);
            setErrors({ submit: 'Failed to save candidate. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleValueChange = (attrName, value) => {
        setAttributeValues(prev => ({
            ...prev,
            [attrName]: value,
        }));
        // Clear error when user types
        if (errors[attrName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[attrName];
                return newErrors;
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content candidate-form-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editCandidate ? 'Edit Candidate' : 'Add New Candidate'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <XIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="candidateName">
                                <UserIcon /> Candidate Name
                            </label>
                            <input
                                id="candidateName"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) {
                                        setErrors(prev => ({ ...prev, name: undefined }));
                                    }
                                }}
                                placeholder="Enter candidate name"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                    </div>

                    {position?.attributes?.length > 0 && (
                        <div className="form-section">
                            <h3>Attribute Values</h3>
                            <p className="section-hint">Enter values for each evaluation attribute</p>

                            <div className="attributes-grid">
                                {position.attributes.map(attr => (
                                    <div key={attr.name} className="form-group">
                                        <label htmlFor={`attr-${attr.name}`}>
                                            {attr.name}
                                            <span className="attr-meta">
                                                {attr.type === 'rating' ? 'Rating' : 'Number'}
                                                {attr.min !== undefined && attr.max !== undefined && (
                                                    <> · {attr.min}-{attr.max}</>
                                                )}
                                            </span>
                                        </label>
                                        <div className="input-with-badge">
                                            <input
                                                id={`attr-${attr.name}`}
                                                type="number"
                                                step="any"
                                                min={attr.min}
                                                max={attr.max}
                                                value={attributeValues[attr.name] ?? ''}
                                                onChange={(e) => handleValueChange(attr.name, e.target.value)}
                                                placeholder={attr.min !== undefined && attr.max !== undefined
                                                    ? `${attr.min} - ${attr.max}`
                                                    : 'Enter value'}
                                                className={errors[attr.name] ? 'error' : ''}
                                            />
                                            <span className={`direction-badge ${attr.beneficial ? 'beneficial' : 'non-beneficial'}`}>
                                                {attr.beneficial ? '↑' : '↓'}
                                            </span>
                                        </div>
                                        {errors[attr.name] && <span className="error-text">{errors[attr.name]}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="error-banner">{errors.submit}</div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (editCandidate ? 'Save Changes' : 'Add Candidate')}
                        </button>
                    </div>
                </form>

                <style>{`
                    .candidate-form-modal {
                        max-width: 600px;
                        width: 100%;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    
                    .modal-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 1.5rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .modal-header h2 {
                        font-size: 1.375rem;
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    
                    .close-btn {
                        background: transparent;
                        border: none;
                        color: var(--text-muted);
                        cursor: pointer;
                        padding: 0.5rem;
                        border-radius: var(--radius-md);
                        transition: all var(--transition-fast);
                    }
                    
                    .close-btn:hover {
                        background: var(--bg-tertiary);
                        color: var(--text-primary);
                    }
                    
                    .form-section {
                        margin-bottom: 1.5rem;
                    }
                    
                    .form-section h3 {
                        font-size: 1rem;
                        font-weight: 600;
                        color: var(--text-primary);
                        margin-bottom: 0.25rem;
                    }
                    
                    .section-hint {
                        font-size: 0.875rem;
                        color: var(--text-muted);
                        margin-bottom: 1rem;
                    }
                    
                    .form-group {
                        margin-bottom: 1rem;
                    }
                    
                    .form-group label {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: var(--text-secondary);
                        margin-bottom: 0.5rem;
                    }
                    
                    .attr-meta {
                        font-size: 0.75rem;
                        color: var(--text-muted);
                        font-weight: 400;
                        margin-left: auto;
                    }
                    
                    .form-group input {
                        width: 100%;
                        padding: 0.75rem 1rem;
                        background: var(--bg-tertiary);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-md);
                        color: var(--text-primary);
                        font-size: 0.9375rem;
                        transition: all var(--transition-fast);
                    }
                    
                    .form-group input:focus {
                        outline: none;
                        border-color: var(--color-primary-500);
                        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
                    }
                    
                    .form-group input.error {
                        border-color: #ef4444;
                    }
                    
                    .error-text {
                        font-size: 0.75rem;
                        color: #ef4444;
                        margin-top: 0.25rem;
                        display: block;
                    }
                    
                    .error-banner {
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        color: #ef4444;
                        padding: 0.75rem 1rem;
                        border-radius: var(--radius-md);
                        margin-bottom: 1rem;
                        font-size: 0.875rem;
                    }
                    
                    .attributes-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 1rem;
                    }
                    
                    .input-with-badge {
                        position: relative;
                    }
                    
                    .input-with-badge input {
                        padding-right: 2.5rem;
                    }
                    
                    .direction-badge {
                        position: absolute;
                        right: 0.75rem;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 1.5rem;
                        height: 1.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: var(--radius-full);
                        font-size: 0.75rem;
                        font-weight: 600;
                    }
                    
                    .direction-badge.beneficial {
                        background: rgba(34, 197, 94, 0.15);
                        color: #22c55e;
                    }
                    
                    .direction-badge.non-beneficial {
                        background: rgba(234, 179, 8, 0.15);
                        color: #eab308;
                    }
                    
                    .form-actions {
                        display: flex;
                        gap: 0.75rem;
                        justify-content: flex-end;
                        padding-top: 1rem;
                        border-top: 1px solid var(--border-color);
                    }
                `}</style>
            </div>
        </div>
    );
}

export default CandidateForm;
