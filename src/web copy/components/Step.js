import React from "react";
import Card from "@splunk/react-ui/Card";
import P from '@splunk/react-ui/Paragraph'
import Heading from '@splunk/react-ui/Heading'

export default function LabStep({title, subtitle, content: Content}) {


    return (
        <Card style={{width: 900}}>
        <Card.Header title={title} subtitle={subtitle} />
        <Card.Body style={{maxWidth: 900, paddingTop: 5}}>

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