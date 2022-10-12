import React, { useEffect, useState } from 'react';
import Step from './Step';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

export default function Section({ chapter, section }) {
    const steps = section.steps

    return (
        <ColumnLayout gutter={8}>
            {
                steps.map((step, index) => (
                    <ColumnLayout.Row key={index}>
                        <ColumnLayout.Column span={2}/>
                        <ColumnLayout.Column span={10}>
                            <SectionStep step={step}></SectionStep>
                        </ColumnLayout.Column>
                        <ColumnLayout span={2}/>
                    </ColumnLayout.Row>
                ))
            }
        </ColumnLayout>
    )
}


export function SectionStep({ step }) {

    const [LoadedContent, setLoadedContent] = useState(undefined)

    //const LoadedContent = require().default    

    useEffect(() => {
        import(/* webpackMode: "eager" */ `../workshop/${step.content}`).then(module => {
            setLoadedContent(module.default)
        })
    }, [step])

    let res;

    if (LoadedContent) {
        res = <Step content={() => (LoadedContent)} title={step.title} subtitle={step.subtitle || ''}/>
    } else {
        res = <div></div>
    }

    return (
        res
    )

}