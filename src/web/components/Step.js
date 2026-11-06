import React from "react";
import Card from "@splunk/react-ui/Card";
import P from '@splunk/react-ui/Paragraph'
import Heading from '@splunk/react-ui/Heading'
import Flask from '@splunk/react-icons/Flask'
import Link from '@splunk/react-ui/Link'

import SplunkSearch from './SplunkSearch'
import SplunkPanel from './SplunkPanel'
import LabBlock from './LabBlock'
import WorkshopViz from './WorkshopViz'
import TokenKitchen from './TokenKitchen'

/**
 * MDX components available on every workshop page without an import.
 * Adding `WorkshopViz` here is what lets a lab drop in a live visualization
 * with no local import boilerplate.
 */
const MDX_COMPONENTS = {
    h1: Heading,
    p: P,
    Link,
    SplunkSearch,
    SplunkPanel,
    LabBlock,
    WorkshopViz,
    TokenKitchen,
};

export default function LabStep({ title, subtitle, content: Content, type, suppressTitle }) {
    const showHeader = !suppressTitle && (title || subtitle);

    return (
        <Card className={type === 'lab' ? 's4c-complete-lab' : undefined} style={{ width: '100%', maxWidth: 900, boxSizing: 'border-box' }}>
            {showHeader && <Card.Header title={title} subtitle={subtitle} />}
            <Card.Body style={{ maxWidth: 900, paddingTop: showHeader ? 5 : 12 }}>
                {type === 'lab' && (
                    <div className="s4c-lab-badge">
                        <Flask style={{ width: 15, height: 15 }} />
                        <span>Complete Lab</span>
                    </div>
                )}
                <Content components={MDX_COMPONENTS} />
            </Card.Body>
        </Card>
    );
}
