import React from "react";
import Card from "@splunk/react-ui/Card";
import P from '@splunk/react-ui/Paragraph'
import Heading from '@splunk/react-ui/Heading'
import Flask from '@splunk/react-icons/Flask'

export default function LabStep({title, subtitle, content: Content, type}) {


    return (
        <Card className={type === 'lab' ? 's4c-complete-lab' : undefined} style={{width: 900}}>
        <Card.Header title={title} subtitle={subtitle} />
        <Card.Body style={{maxWidth: 900, paddingTop: 5}}>
            {type === 'lab' && (
                <div className="s4c-lab-badge">
                    <Flask style={{width:15, height:15}} />
                    <span>Complete Lab</span>
                </div>
            )}
            <Content components={{
                // Map `h1` (`# heading`) to use `h2`s.
                h1: Heading,
                p: P
                }}
/*              table: (props) => <Table {...props} stripeRows />,
                thead: Table.Head,
                tbody: Table.Body,
                tr: Table.Row,
                td: Table.Cell,
                th: Table.HeadCell
*/
            ></Content>
        </Card.Body>
    </Card>

    )
}
