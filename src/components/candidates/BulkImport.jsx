import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
);

const TableIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" />
    </svg>
);

function BulkImport({ position, onClose, onSuccess }) {
    const createMany = useMutation(api.candidates.createMany);

    const [pastedData, setPastedData] = useState('');
    const [parsedCandidates, setParsedCandidates] = useState([]);
    const [parseErrors, setParseErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState('paste'); // 'paste' or 'preview'

    const parseCSVData = (data) => {
        const lines = data.trim().split(/\r?\n/);
        const errors = [];
        const candidates = [];

        if (lines.length === 0) {
            setParseErrors(['No data provided']);
            return;
        }

        // Check if first line is a header (contains text like "Name" or attribute names)
        const firstLine = lines[0].split(/[,\t]/);
        let startIndex = 0;

        // Detect header row
        const hasHeader = firstLine.some(cell =>
            isNaN(parseFloat(cell.trim())) &&
            cell.trim().toLowerCase() !== ''
        );

        if (hasHeader) {
            startIndex = 1;
        }

        // Expected format: Name, Attr1, Attr2, ...
        const expectedColumns = 1 + position.attributes.length;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Split by comma or tab
            const cells = line.split(/[,\t]/).map(c => c.trim());

            if (cells.length < expectedColumns) {
                errors.push(`Row ${i + 1}: Expected ${expectedColumns} columns, got ${cells.length}`);
                continue;
            }

            const name = cells[0];
            if (!name) {
                errors.push(`Row ${i + 1}: Candidate name is empty`);
                continue;
            }

            const data = [];
            let rowValid = true;

            for (let j = 0; j < position.attributes.length; j++) {
                const attr = position.attributes[j];
                const valueStr = cells[j + 1];
                const value = parseFloat(valueStr);

                if (isNaN(value)) {
                    errors.push(`Row ${i + 1}: "${attr.name}" must be a number (got "${valueStr}")`);
                    rowValid = false;
                    break;
                }

                if (attr.min !== undefined && value < attr.min) {
                    errors.push(`Row ${i + 1}: "${attr.name}" must be at least ${attr.min}`);
                    rowValid = false;
                    break;
                }

                if (attr.max !== undefined && value > attr.max) {
                    errors.push(`Row ${i + 1}: "${attr.name}" must be at most ${attr.max}`);
                    rowValid = false;
                    break;
                }

                data.push({
                    attributeName: attr.name,
                    value: value,
                });
            }

            if (rowValid) {
                candidates.push({ name, data });
            }
        }

        setParsedCandidates(candidates);
        setParseErrors(errors);

        if (candidates.length > 0) {
            setStep('preview');
        }
    };

    const handleParse = () => {
        parseCSVData(pastedData);
    };

    const handleImport = async () => {
        if (parsedCandidates.length === 0) return;

        setIsSubmitting(true);

        try {
            await createMany({
                positionId: position._id,
                candidates: parsedCandidates,
            });
            onSuccess?.(parsedCandidates.length);
            onClose();
        } catch (error) {
            console.error('Error importing candidates:', error);
            setParseErrors(['Failed to import candidates. Please try again.']);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        setStep('paste');
        setParsedCandidates([]);
        setParseErrors([]);
    };

    const generateTemplate = () => {
        const headers = ['Name', ...position.attributes.map(a => a.name)];
        const sampleRow = ['John Doe', ...position.attributes.map(a =>
            a.min !== undefined && a.max !== undefined
                ? Math.round((a.min + a.max) / 2)
                : '0'
        )];
        return `${headers.join('\t')}\n${sampleRow.join('\t')}`;
    };

    const copyTemplate = () => {
        navigator.clipboard.writeText(generateTemplate());
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content bulk-import-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <UploadIcon /> Bulk Import Candidates
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <XIcon />
                    </button>
                </div>

                {step === 'paste' && (
                    <div className="paste-step">
                        <div className="format-info">
                            <h3>Expected Format</h3>
                            <p>Paste data in CSV or tab-separated format:</p>
                            <div className="format-columns">
                                <span className="col-name">Name</span>
                                {position.attributes.map(attr => (
                                    <span key={attr.name} className="col-attr">
                                        {attr.name}
                                        {attr.min !== undefined && attr.max !== undefined && (
                                            <small>{attr.min}-{attr.max}</small>
                                        )}
                                    </span>
                                ))}
                            </div>
                            <button className="btn btn-sm btn-secondary" onClick={copyTemplate}>
                                Copy Template
                            </button>
                        </div>

                        <div className="paste-area">
                            <label htmlFor="pasteData">
                                <TableIcon /> Paste your data here
                            </label>
                            <textarea
                                id="pasteData"
                                value={pastedData}
                                onChange={(e) => setPastedData(e.target.value)}
                                placeholder="Name    Experience    Skills    Education
John Doe    5    8    7
Jane Smith    3    9    8
..."
                                rows={10}
                            />
                        </div>

                        {parseErrors.length > 0 && step === 'paste' && (
                            <div className="error-list">
                                <h4>Errors Found:</h4>
                                <ul>
                                    {parseErrors.slice(0, 5).map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                    {parseErrors.length > 5 && (
                                        <li>... and {parseErrors.length - 5} more errors</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleParse}
                                disabled={!pastedData.trim()}
                            >
                                Parse Data
                            </button>
                        </div>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="preview-step">
                        <div className="preview-summary">
                            <div className="summary-stat success">
                                <span className="stat-value">{parsedCandidates.length}</span>
                                <span className="stat-label">Candidates to import</span>
                            </div>
                            {parseErrors.length > 0 && (
                                <div className="summary-stat warning">
                                    <span className="stat-value">{parseErrors.length}</span>
                                    <span className="stat-label">Rows with errors (skipped)</span>
                                </div>
                            )}
                        </div>

                        <div className="preview-table-wrapper">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        {position.attributes.map(attr => (
                                            <th key={attr.name}>{attr.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedCandidates.slice(0, 10).map((candidate, i) => (
                                        <tr key={i}>
                                            <td className="name-cell">{candidate.name}</td>
                                            {candidate.data.map((d, j) => (
                                                <td key={j}>{d.value}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {parsedCandidates.length > 10 && (
                                <p className="preview-more">
                                    ... and {parsedCandidates.length - 10} more candidates
                                </p>
                            )}
                        </div>

                        {parseErrors.length > 0 && (
                            <details className="error-details">
                                <summary>View {parseErrors.length} errors</summary>
                                <ul>
                                    {parseErrors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </details>
                        )}

                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={handleBack}>
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleImport}
                                disabled={isSubmitting || parsedCandidates.length === 0}
                            >
                                {isSubmitting ? 'Importing...' : `Import ${parsedCandidates.length} Candidates`}
                            </button>
                        </div>
                    </div>
                )}

                <style>{`
                    .bulk-import-modal {
                        max-width: 700px;
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
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
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
                    
                    .format-info {
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-lg);
                        padding: 1rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .format-info h3 {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: var(--text-primary);
                        margin-bottom: 0.25rem;
                    }
                    
                    .format-info p {
                        font-size: 0.8125rem;
                        color: var(--text-muted);
                        margin-bottom: 0.75rem;
                    }
                    
                    .format-columns {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    }
                    
                    .col-name, .col-attr {
                        padding: 0.375rem 0.75rem;
                        border-radius: var(--radius-full);
                        font-size: 0.75rem;
                        font-weight: 500;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .col-name {
                        background: rgba(139, 92, 246, 0.15);
                        color: var(--color-primary-400);
                    }
                    
                    .col-attr {
                        background: var(--bg-tertiary);
                        color: var(--text-secondary);
                    }
                    
                    .col-attr small {
                        font-size: 0.625rem;
                        color: var(--text-muted);
                    }
                    
                    .btn-sm {
                        padding: 0.375rem 0.75rem;
                        font-size: 0.75rem;
                    }
                    
                    .paste-area {
                        margin-bottom: 1rem;
                    }
                    
                    .paste-area label {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: var(--text-secondary);
                        margin-bottom: 0.5rem;
                    }
                    
                    .paste-area textarea {
                        width: 100%;
                        padding: 1rem;
                        background: var(--bg-tertiary);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-md);
                        color: var(--text-primary);
                        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                        font-size: 0.8125rem;
                        line-height: 1.5;
                        resize: vertical;
                    }
                    
                    .paste-area textarea:focus {
                        outline: none;
                        border-color: var(--color-primary-500);
                        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
                    }
                    
                    .paste-area textarea::placeholder {
                        color: var(--text-muted);
                        opacity: 0.7;
                    }
                    
                    .error-list, .error-details {
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        border-radius: var(--radius-md);
                        padding: 1rem;
                        margin-bottom: 1rem;
                    }
                    
                    .error-list h4, .error-details summary {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #ef4444;
                        margin-bottom: 0.5rem;
                        cursor: pointer;
                    }
                    
                    .error-list ul, .error-details ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    
                    .error-list li, .error-details li {
                        font-size: 0.8125rem;
                        color: var(--text-secondary);
                        padding: 0.25rem 0;
                    }
                    
                    .preview-summary {
                        display: flex;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .summary-stat {
                        flex: 1;
                        padding: 1rem;
                        border-radius: var(--radius-lg);
                        text-align: center;
                    }
                    
                    .summary-stat.success {
                        background: rgba(34, 197, 94, 0.1);
                        border: 1px solid rgba(34, 197, 94, 0.3);
                    }
                    
                    .summary-stat.warning {
                        background: rgba(234, 179, 8, 0.1);
                        border: 1px solid rgba(234, 179, 8, 0.3);
                    }
                    
                    .stat-value {
                        display: block;
                        font-size: 2rem;
                        font-weight: 700;
                    }
                    
                    .summary-stat.success .stat-value {
                        color: #22c55e;
                    }
                    
                    .summary-stat.warning .stat-value {
                        color: #eab308;
                    }
                    
                    .stat-label {
                        font-size: 0.75rem;
                        color: var(--text-muted);
                    }
                    
                    .preview-table-wrapper {
                        overflow-x: auto;
                        margin-bottom: 1rem;
                    }
                    
                    .preview-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.8125rem;
                    }
                    
                    .preview-table th {
                        text-align: left;
                        padding: 0.5rem 0.75rem;
                        font-size: 0.6875rem;
                        font-weight: 600;
                        color: var(--text-muted);
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .preview-table td {
                        padding: 0.5rem 0.75rem;
                        border-bottom: 1px solid var(--border-color);
                        color: var(--text-secondary);
                    }
                    
                    .preview-table .name-cell {
                        font-weight: 500;
                        color: var(--text-primary);
                    }
                    
                    .preview-more {
                        text-align: center;
                        font-size: 0.8125rem;
                        color: var(--text-muted);
                        padding: 0.5rem 0;
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

export default BulkImport;
