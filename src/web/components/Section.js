import React, { useEffect, useState } from 'react';
import Step from './Step';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

class SectionErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('Could not render workshop section.', error, info);
    }

    componentDidUpdate(previousProps) {
        if (previousProps.sectionId !== this.props.sectionId && this.state.error) {
            this.setState({ error: null });
        }
    }

    render() {
        if (this.state.error) {
            return (
                <Message type="error" role="alert">
                    <strong>This workshop section could not be rendered.</strong>
                    <p>{this.state.error.message || 'Unknown rendering error.'}</p>
                    <Button label="Retry section" onClick={() => this.setState({ error: null })} />
                    <p>If retrying does not help, reload the page or ask your trainer.</p>
                </Message>
            );
        }
        return this.props.children;
    }
}

export default function Section({ chapter, section }) {
    const steps = section.steps;

    // When a section contains a single step whose title equals the section
    // title, we suppress the duplicate title inside the card. The section tab
    // already names the step.
    const singleStepMatchesSectionTitle = steps.length === 1 && steps[0].title === section.title;

    return (
        <SectionErrorBoundary sectionId={`${chapter.id}${section.title}`}>
            <ColumnLayout gutter={8}>
                {steps.map((step, index) => (
                    <ColumnLayout.Row key={index}>
                        <ColumnLayout.Column span={1}/>
                        <ColumnLayout.Column span={10}>
                            <SectionStep key={step.content} step={step} suppressTitle={singleStepMatchesSectionTitle}/>
                        </ColumnLayout.Column>
                        <ColumnLayout.Column span={1}/>
                    </ColumnLayout.Row>
                ))}
            </ColumnLayout>
        </SectionErrorBoundary>
    );
}


export function SectionStep({ step, suppressTitle }) {
    const [LoadedContent, setLoadedContent] = useState(undefined);
    const [loadError, setLoadError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoadedContent(undefined);
        setLoadError(false);

        import(/* webpackMode: "eager" */ `../workshop/${step.content}`)
            .then((module) => {
                if (!cancelled) {
                    const page = module.default;
                    // useState treats a function argument as an updater and
                    // calls it. MDX pages are functions, so store the function
                    // itself instead of rendering it during setState.
                    setLoadedContent(() => page);
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error(`Could not load workshop lesson: ${step.content}`, error);
                    setLoadError(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [step.content, attempt]);

    if (LoadedContent) {
        return (
            <Step
                content={LoadedContent}
                title={step.title}
                subtitle={step.subtitle || ''}
                type={step.type || ''}
                suppressTitle={suppressTitle}
            />
        );
    }
    if (loadError) {
        return (
            <Message type="error" role="alert">
                <p>Could not load "{step.title}".</p>
                <Button label="Retry lesson" onClick={() => setAttempt((previous) => previous + 1)} />
                <p>If retrying does not help, reload the page or ask your trainer.</p>
            </Message>
        );
    }
    return (
        <div role="status" aria-live="polite">
            <WaitSpinner screenReaderText={null} /> Loading lesson: {step.title}
        </div>
    );
}
