import React, { useState } from 'react';
import Button from '@splunk/react-ui/Button';
import Hammer from '@splunk/react-icons/Hammer';

const LAB_SCHEME_EVENT = 's4c-lab-scheme-change';

function getSchemeFromBody() {
    if (typeof document === 'undefined') return 'blue';
    if (document.body.classList.contains('s4c-scheme-brownred')) return 'brownred';
    if (document.body.classList.contains('s4c-scheme-yellowbrown')) return 'yellowbrown';
    return 'blue';
}

export default function LabSchemeToggle() {
    const [scheme, setScheme] = useState(getSchemeFromBody);

    const updateScheme = (next) => {
        if (typeof window === 'undefined') return;
        window.dispatchEvent(new CustomEvent(LAB_SCHEME_EVENT, { detail: { scheme: next } }));
        setScheme(next);
    };

    return (
        <div className="displayModeToggle">
            <h3>Lab Highlight Colour Scheme</h3>
            <p>Choose the colour used for hands-on lab callouts and complete-lab cards.</p>
            <div className="displayModeToggleActions">
                <Button
                    appearance={scheme === 'blue' ? 'primary' : 'secondary'}
                    label="Blue / Navy (default)"
                    onClick={() => updateScheme('blue')}
                />
                <Button
                    appearance={scheme === 'brownred' ? 'primary' : 'secondary'}
                    label="Brown / Dark Red"
                    onClick={() => updateScheme('brownred')}
                />
                <Button
                    appearance={scheme === 'yellowbrown' ? 'primary' : 'secondary'}
                    label="Yellow / Brown"
                    onClick={() => updateScheme('yellowbrown')}
                />
            </div>

            <div className="s4c-scheme-preview">
                <p className="s4c-scheme-preview__caption">Preview — updates live as you switch:</p>
                <div className="s4c-scheme-preview__grid">
                    <div className="s4c-lab-block">
                        <div className="s4c-lab-block__header">
                            <span className="s4c-lab-block__icon"><Hammer /></span>
                            <span className="s4c-lab-block__label">Hands-on</span>
                        </div>
                        <div className="s4c-lab-block__body">
                            <p style={{ margin: 0 }}>Atomic exercise callout — used for inline tasks inside any subchapter.</p>
                        </div>
                    </div>

                    <div className="s4c-complete-lab">
                        <div style={{ padding: '12px 16px' }}>
                            <span className="s4c-lab-badge"><Hammer /> Complete Lab</span>
                            <div className="s4c-lab-summary">
                                <strong>End-to-end lab</strong> — opens with a summary card highlighting the goal of a multi-step walkthrough.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="displayModeHint">
                Scheme is saved in your browser and persists across sessions.
            </p>
        </div>
    );
}
