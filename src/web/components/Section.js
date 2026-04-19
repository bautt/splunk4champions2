import React, { useEffect, useState } from 'react';
import Step from './Step';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';

export default function Section({ chapter, section }) {
    const steps = section.steps

    return (
        <ColumnLayout gutter={8}>
            {steps.map((step, index) => (
                <ColumnLayout.Row key={index}>
                    <ColumnLayout.Column span={1}/>
                    <ColumnLayout.Column span={10}>
                        <SectionStep step={step}/>
                    </ColumnLayout.Column>
                    <ColumnLayout.Column span={1}/>
                </ColumnLayout.Row>
            ))}
        </ColumnLayout>
    )
}


export function SectionStep({ step }) {
    const [LoadedContent, setLoadedContent] = useState(undefined)

    useEffect(() => {
        import(/* webpackMode: "eager" */ `../workshop/${step.content}`).then(module => {
            setLoadedContent(module.default)
        })
    }, [step])

    if (LoadedContent) {
        return <Step content={() => (LoadedContent)} title={step.title} subtitle={step.subtitle || ''}/>
    }
    return <div/>
}
