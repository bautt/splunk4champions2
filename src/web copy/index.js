import React, { createContext, useState } from 'react';
import layout from '@splunk/react-page';
import { SplunkThemeProvider } from '@splunk/themes';

import ChapterBar from './components/ChapterBar';
import TabLayout from '@splunk/react-ui/TabLayout'

import workshop from './workshop/workshop'
import Section from './components/Section';

import Heading from '@splunk/react-ui/Heading'
import "./components/SectionBar.css";
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages'
import Toaster, { makeCreateToast } from '@splunk/react-toast-notifications/Toaster';
import ToastContext from './context'

function App() {
    const createToast = makeCreateToast(Toaster)
    const [activeChapterId, setActiveChapterId] = useState("one")

    const changeChapter = (e, { activePanelId: chapterId }) => {
        setActiveChapterId(chapterId)
    }

    const chapters = workshop.chapters

    const renderedChapters = chapters.map((chapter, index) => {
        const firstSectionId = chapter.id + chapter.sections[0].title
        return (
                <TabLayout.Panel key={index} label={chapter.title} panelId={chapter.id} icon={chapter.icon}>
                    <TabLayout defaultActivePanelId={firstSectionId} className="sectionBar">
                        {
                            chapter.sections.map((section, index) => (
                                <TabLayout.Panel key={index} label={section.title} panelId={chapter.id + section.title} style={{ marginBottom: 20 }}>
                                    <ToastContext.Provider value={createToast}>
                                        <Section chapter={chapter} section={section}></Section>
                                    </ToastContext.Provider>
                                </TabLayout.Panel>
                            ))
                        }
                    </TabLayout>
                </TabLayout.Panel>
    )}
    )

    return (
        <>  
            <div style={{"backgroundColor": "#3C444D", height: "0px", width: "100%"}}>
            </div>
            <ChapterBar activeChapter={activeChapterId} onChapterChange={changeChapter}>
                {renderedChapters}
            </ChapterBar>
        </>
    )
}


layout(
    <SplunkThemeProvider family="enterprise" colorScheme="light">
        <ToastMessages />
        <App></App>
    </SplunkThemeProvider>
    , { hideFooter: true, hideAppBar: true });
