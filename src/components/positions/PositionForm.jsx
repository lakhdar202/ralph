import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const defaultAttribute = {
    name: '',
    type: 'number',
    weight: 0.2,
    beneficial: true,
    min: 0,
    max: 100,
};

export default function PositionForm({ onClose, editPosition = null }) {
    const createPosition = useMutation(api.positions.create);
    const updatePosition = useMutation(api.positions.update);

    const [name, setName] = useState(editPosition?.name || '');
    const [description, setDescription] = useState(editPosition?.description || '');
    const [attributes, setAttributes] = useState(
        editPosition?.attributes?.length > 0
            ? editPosition.attributes
            : [{ ...defaultAttribute }]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const totalWeight = attributes.reduce((sum, attr) => sum + attr.weight, 0);
    const isWeightValid = Math.abs(totalWeight - 1) < 0.01;

    const addAttribute = () => {
        const remainingWeight = Math.max(0, 1 - totalWeight);
        setAttributes([...attributes, { ...defaultAttribute, weight: Math.round(remainingWeight * 100) / 100 }]);
    };

    const removeAttribute = (index) => {
        if (attributes.length > 1) {
            setAttributes(attributes.filter((_, i) => i !== index));
        }
    };

    const updateAttribute = (index, field, value) => {
        const newAttributes = [...attributes];
        newAttributes[index] = { ...newAttributes[index], [field]: value };
        setAttributes(newAttributes);
    };

    const normalizeWeights = () => {
        if (totalWeight === 0) return;
        const normalized = attributes.map(attr => ({
            ...attr,
            weight: Math.round((attr.weight / totalWeight) * 100) / 100
        }));
        // Adjust last one to ensure sum is exactly 1
        const sum = normalized.reduce((s, a) => s + a.weight, 0);
        if (normalized.length > 0) {
            normalized[normalized.length - 1].weight = Math.round((normalized[normalized.length - 1].weight + (1 - sum)) * 100) / 100;
        }
        setAttributes(normalized);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Position name is required');
            return;
        }

        if (attributes.length === 0) {
            setError('At least one attribute is required');
            return;
        }

        if (attributes.some(attr => !attr.name.trim())) {
            setError('All attributes must have a name');
            return;
        }

        if (!isWeightValid) {
            setError('Attribute weights must sum to 1.0');
            return;
        }

        setIsSubmitting(true);

        try {
            const positionData = {
                name: name.trim(),
                description: description.trim(),
                attributes: attributes.map(attr => ({
                    name: attr.name.trim(),
                    type: attr.type,
                    weight: attr.weight,
                    beneficial: attr.beneficial,
                    min: attr.min,
                    max: attr.max,
                })),
            };

            if (editPosition) {
                await updatePosition({ id: editPosition._id, ...positionData });
            } else {
                await createPosition(positionData);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save position');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editPosition ? 'Edit Position' : 'Create New Position'}</h2>
                    <button className="btn-icon" onClick={onClose}><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-group">
                            <label className="form-label">Position Name *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Senior Software Developer"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="input textarea"
                                placeholder="Describe the position and requirements..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <h3>Evaluation Attributes</h3>
                            <div className="weight-indicator" data-valid={isWeightValid}>
                                Total: {(totalWeight * 100).toFixed(0)}%
                                {!isWeightValid && (
                                    <button type="button" className="btn-link" onClick={normalizeWeights}>
                                        Normalize
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="attributes-list">
                            {attributes.map((attr, index) => (
                                <div key={index} className="attribute-row">
                                    <div className="attr-name">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Attribute name"
                                            value={attr.name}
                                            onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                                        />
                                    </div>

                                    <div className="attr-type">
                                        <select
                                            className="input select"
                                            value={attr.type}
                                            onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                                        >
                                            <option value="number">Number</option>
                                            <option value="rating">Rating (1-10)</option>
                                        </select>
                                    </div>

                                    <div className="attr-weight">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={attr.weight * 100}
                                            onChange={(e) => updateAttribute(index, 'weight', parseInt(e.target.value) / 100)}
                                            className="weight-slider"
                                        />
                                        <span className="weight-value">{(attr.weight * 100).toFixed(0)}%</span>
                                    </div>

                                    <div className="attr-beneficial">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={attr.beneficial}
                                                onChange={(e) => updateAttribute(index, 'beneficial', e.target.checked)}
                                            />
                                            <span className="toggle-text">{attr.beneficial ? 'Higher is better' : 'Lower is better'}</span>
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-icon btn-danger"
                                        onClick={() => removeAttribute(index)}
                                        disabled={attributes.length === 1}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button type="button" className="btn btn-secondary add-attr-btn" onClick={addAttribute}>
                            <PlusIcon /> Add Attribute
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (editPosition ? 'Update Position' : 'Create Position')}
                        </button>
                    </div>
                </form>

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 1rem;
                        animation: fadeIn 0.2s ease-out;
                    }
                    .modal-content {
                        background: var(--bg-primary);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-xl);
                        width: 100%;
                        max-width: 800px;
                        max-height: 90vh;
                        overflow-y: auto;
                        animation: slideUp 0.3s ease-out;
                    }
                    .modal-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1.5rem;
                        border-bottom: 1px solid var(--border-color);
                        position: sticky;
                        top: 0;
                        background: var(--bg-primary);
                        z-index: 10;
                    }
                    .modal-header h2 {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    .form-section {
                        padding: 1.5rem;
                        border-bottom: 1px solid var(--border-color);
                    }
                    .form-group {
                        margin-bottom: 1rem;
                    }
                    .form-group:last-child {
                        margin-bottom: 0;
                    }
                    .form-label {
                        display: block;
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: var(--text-secondary);
                        margin-bottom: 0.5rem;
                    }
                    .textarea {
                        resize: vertical;
                        min-height: 80px;
                    }
                    .section-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 1rem;
                    }
                    .section-header h3 {
                        font-size: 1rem;
                        font-weight: 600;
                        color: var(--text-primary);
                    }
                    .weight-indicator {
                        font-size: 0.875rem;
                        padding: 0.375rem 0.75rem;
                        border-radius: var(--radius-md);
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }
                    .weight-indicator[data-valid="true"] {
                        background: rgba(34, 197, 94, 0.15);
                        color: #22c55e;
                    }
                    .weight-indicator[data-valid="false"] {
                        background: rgba(239, 68, 68, 0.15);
                        color: #ef4444;
                    }
                    .btn-link {
                        background: none;
                        border: none;
                        color: var(--color-primary-400);
                        cursor: pointer;
                        font-size: 0.75rem;
                        text-decoration: underline;
                    }
                    .attributes-list {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    .attribute-row {
                        display: grid;
                        grid-template-columns: 1fr 120px 160px 150px 40px;
                        gap: 0.75rem;
                        align-items: center;
                        padding: 1rem;
                        background: var(--bg-secondary);
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border-color);
                    }
                    .select {
                        cursor: pointer;
                    }
                    .attr-weight {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    .weight-slider {
                        flex: 1;
                        height: 6px;
                        -webkit-appearance: none;
                        background: var(--bg-tertiary);
                        border-radius: 3px;
                        outline: none;
                    }
                    .weight-slider::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 16px;
                        height: 16px;
                        background: var(--color-primary-500);
                        border-radius: 50%;
                        cursor: pointer;
                        transition: transform 0.15s;
                    }
                    .weight-slider::-webkit-slider-thumb:hover {
                        transform: scale(1.2);
                    }
                    .weight-value {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: var(--text-secondary);
                        min-width: 35px;
                        text-align: right;
                    }
                    .toggle-label {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                    }
                    .toggle-label input {
                        width: 16px;
                        height: 16px;
                        accent-color: var(--color-primary-500);
                    }
                    .btn-icon {
                        width: 36px;
                        height: 36px;
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
                    .btn-icon:hover {
                        background: var(--bg-secondary);
                        color: var(--text-primary);
                    }
                    .btn-icon.btn-danger:hover {
                        background: rgba(239, 68, 68, 0.15);
                        color: #ef4444;
                        border-color: rgba(239, 68, 68, 0.3);
                    }
                    .btn-icon:disabled {
                        opacity: 0.3;
                        cursor: not-allowed;
                    }
                    .add-attr-btn {
                        margin-top: 1rem;
                        width: 100%;
                    }
                    .error-message {
                        margin: 0 1.5rem;
                        padding: 0.75rem 1rem;
                        background: rgba(239, 68, 68, 0.15);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        border-radius: var(--radius-md);
                        color: #ef4444;
                        font-size: 0.875rem;
                    }
                    .modal-footer {
                        display: flex;
                        justify-content: flex-end;
                        gap: 0.75rem;
                        padding: 1.5rem;
                        background: var(--bg-secondary);
                    }
                    @media (max-width: 768px) {
                        .attribute-row {
                            grid-template-columns: 1fr;
                            gap: 0.5rem;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
