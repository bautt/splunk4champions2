import React, { useState } from 'react';
import Button from '@splunk/react-ui/Button';

const LAB_SCHEME_KEY = 's4c_lab_scheme';
const LAB_SCHEME_EVENT = 's4c-lab-scheme-change';
const VALID_SCHEMES = ['blue', 'brownred', 'yellowbrown'];

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
            <p className="displayModeHint">
                Scheme is saved in your browser and persists across sessions.
            </p>
        </div>
    );
}
