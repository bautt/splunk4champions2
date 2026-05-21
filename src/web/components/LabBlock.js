import React from 'react';
import Hammer from '@splunk/react-icons/Hammer';

export default function LabBlock({ title, children }) {
    return (
        <div className="s4c-lab-block">
            <div className="s4c-lab-block__header">
                <span className="s4c-lab-block__icon"><Hammer /></span>
                <span className="s4c-lab-block__label">{title || 'Hands-on'}</span>
            </div>
            <div className="s4c-lab-block__body">
                {children}
            </div>
        </div>
    );
}
