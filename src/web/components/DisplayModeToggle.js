import React, { useMemo, useState } from 'react';
import Button from '@splunk/react-ui/Button';

const DISPLAY_MODE_EVENT = 's4c-display-mode-change';
const LARGE_MODE_CLASS = 's4c-large-room';

function getModeFromBody() {
    if (typeof document === 'undefined') return 'default';
    return document.body.classList.contains(LARGE_MODE_CLASS) ? 'large' : 'default';
}

export default function DisplayModeToggle() {
    const [mode, setMode] = useState(getModeFromBody);

    const description = useMemo(() => (
        mode === 'large'
            ? 'Large Room Mode is ON (optimized for projector readability).'
            : 'Large Room Mode is OFF (standard workshop density).'
    ), [mode]);

    const updateMode = (nextMode) => {
        if (typeof window === 'undefined') return;
        window.dispatchEvent(new CustomEvent(DISPLAY_MODE_EVENT, { detail: { mode: nextMode } }));
        setMode(nextMode);
    };

    return (
        <div className="displayModeToggle">
            <h3>Trainer Display Mode</h3>
            <p>{description}</p>
            <div className="displayModeToggleActions">
                <Button
                    appearance={mode === 'default' ? 'primary' : 'secondary'}
                    label="Standard"
                    onClick={() => updateMode('default')}
                />
                <Button
                    appearance={mode === 'large' ? 'primary' : 'secondary'}
                    label="Large Room"
                    onClick={() => updateMode('large')}
                />
            </div>
            <p className="displayModeHint">
                Tip: Large Room mode is remembered in your browser and can be shared with <code>?view=large</code>.
            </p>
        </div>
    );
}
