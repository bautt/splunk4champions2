import React, { useState } from 'react';
import TabLayout from '@splunk/react-ui/TabLayout';

import "./ChapterBar.css";


export default function ChapterBar({children, onChapterChange, activeChapter}) {

    return (
        <TabLayout autoActivate={true} activePanelId={activeChapter} onChange={onChapterChange} iconSize="small" className='chapterBar'>
            {children}
        </TabLayout>)
}