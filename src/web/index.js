import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import layout from '@splunk/react-page';
import { SplunkThemeProvider } from '@splunk/themes';

import ChapterBar from './components/ChapterBar';
import TabLayout from '@splunk/react-ui/TabLayout'

import workshop from './workshop/workshop'
import Section from './components/Section';

import "./components/SectionBar.css";
import "./components/workshop.css";
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages'
import Toaster, { makeCreateToast } from '@splunk/react-toast-notifications/Toaster';
import ToastContext from './context'

// ── Helpers ───────────────────────────────────────────────────────────────────

const chapters = workshop.chapters
const DISPLAY_MODE_KEY = 's4c_display_mode';
const DISPLAY_MODE_EVENT = 's4c-display-mode-change';
const LARGE_MODE_CLASS = 's4c-large-room';

// Build a flat ordered list of {chapterId, sectionId} for prev/next navigation
const allSections = chapters.flatMap(ch =>
    ch.sections.map(sec => ({
        chapterId: ch.id,
        sectionId: ch.id + sec.title,
    }))
)

function sectionPanelId(chapter, section) {
    return chapter.id + section.title
}

function defaultSectionFor(chapterId) {
    const ch = chapters.find(c => c.id === chapterId)
    if (!ch) return null
    return sectionPanelId(ch, ch.sections[0])
}

function parseHash() {
    const hash = window.location.hash.replace('#', '')
    const params = new URLSearchParams(hash)
    return {
        chapterId: params.get('ch') || null,
        sectionId: params.get('sec') || null,
    }
}

function buildHash(chapterId, sectionId) {
    const params = new URLSearchParams()
    params.set('ch', chapterId)
    params.set('sec', sectionId)
    return '#' + params.toString()
}

function pushHash(chapterId, sectionId) {
    window.history.pushState(null, '', buildHash(chapterId, sectionId))
}

function replaceHash(chapterId, sectionId) {
    window.history.replaceState(null, '', buildHash(chapterId, sectionId))
}

function validChapterId(id) {
    return chapters.some(c => c.id === id)
}

function validSectionId(chapterId, sectionId) {
    const ch = chapters.find(c => c.id === chapterId)
    if (!ch) return false
    return ch.sections.some(s => sectionPanelId(ch, s) === sectionId)
}

function navBtnStyle(disabled) {
    return {
        width: 22,
        height: 22,
        padding: 0,
        border: '1px solid #bbb',
        borderRadius: 4,
        background: disabled ? 'transparent' : '#fff',
        color: disabled ? '#ccc' : '#444',
        fontSize: 16,
        lineHeight: '20px',
        textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.15s',
    }
}

function readDisplayModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'large' ? 'large' : null;
}

function readStoredDisplayMode() {
    try {
        const value = window.localStorage.getItem(DISPLAY_MODE_KEY);
        return value === 'large' ? 'large' : value === 'default' ? 'default' : null;
    } catch (error) {
        return null;
    }
}

function applyDisplayMode(mode) {
    document.body.classList.toggle(LARGE_MODE_CLASS, mode === 'large');
}

function persistDisplayMode(mode) {
    try {
        window.localStorage.setItem(DISPLAY_MODE_KEY, mode);
    } catch (error) {
        // Ignore storage failures (private browsing or blocked local storage)
    }
}

function syncDisplayModeInUrl(mode) {
    const url = new URL(window.location.href);
    if (mode === 'large') {
        url.searchParams.set('view', 'large');
    } else {
        url.searchParams.delete('view');
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
    const createToast = makeCreateToast(Toaster)

    // Initialise from URL hash if present, otherwise default to first chapter
    const initState = () => {
        const { chapterId, sectionId } = parseHash()
        const ch = chapterId && validChapterId(chapterId) ? chapterId : chapters[0].id
        const sec = sectionId && validSectionId(ch, sectionId) ? sectionId : defaultSectionFor(ch)
        return { chapterId: ch, sectionId: sec }
    }

    const [activeChapterId, setActiveChapterId] = useState(() => initState().chapterId)

    // Track active section per chapter so switching back restores position
    const [activeSections, setActiveSections] = useState(() => {
        const { chapterId, sectionId } = initState()
        const map = {}
        chapters.forEach(ch => { map[ch.id] = defaultSectionFor(ch.id) })
        map[chapterId] = sectionId
        return map
    })

    useEffect(() => {
        const initialMode = readDisplayModeFromUrl() || readStoredDisplayMode() || 'default';
        applyDisplayMode(initialMode);
        persistDisplayMode(initialMode);
        syncDisplayModeInUrl(initialMode);

        const onModeChange = (event) => {
            const nextMode = event?.detail?.mode === 'large' ? 'large' : 'default';
            applyDisplayMode(nextMode);
            persistDisplayMode(nextMode);
            syncDisplayModeInUrl(nextMode);
        };

        window.addEventListener(DISPLAY_MODE_EVENT, onModeChange);
        return () => window.removeEventListener(DISPLAY_MODE_EVENT, onModeChange);
    }, []);

    // isMounted: false on first effect run (initial mount → replaceState, no new history entry)
    // isHashNav: true when hashchange fired the state update (URL already correct, skip push)
    const isMounted = useRef(false)
    const isHashNav = useRef(false)

    // Sync state → hash whenever navigation changes
    useEffect(() => {
        if (isHashNav.current) {
            // Browser back/forward already set the URL — just clear the flag
            isHashNav.current = false
            return
        }
        if (!isMounted.current) {
            // Initial mount: normalise the URL without adding a history entry
            isMounted.current = true
            replaceHash(activeChapterId, activeSections[activeChapterId])
            return
        }
        // User-initiated navigation: add a history entry so back/forward works
        pushHash(activeChapterId, activeSections[activeChapterId])
    }, [activeChapterId, activeSections])

    // Sync hash → state on browser back/forward
    useEffect(() => {
        const onHashChange = () => {
            const { chapterId, sectionId } = parseHash()
            if (chapterId && validChapterId(chapterId)) {
                // Mark as hash-driven so the state effect skips pushState
                isHashNav.current = true
                setActiveChapterId(chapterId)
                if (sectionId && validSectionId(chapterId, sectionId)) {
                    setActiveSections(prev => ({ ...prev, [chapterId]: sectionId }))
                }
            }
        }
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const changeChapter = useCallback((e, { activePanelId: chapterId }) => {
        setActiveChapterId(chapterId)
    }, [])

    const changeSection = useCallback((chapterId) => (e, { activePanelId: sectionId }) => {
        setActiveSections(prev => ({ ...prev, [chapterId]: sectionId }))
    }, [])

    // Prev / Next navigation (global index used only for button enable/disable)
    const currentIndex = allSections.findIndex(
        s => s.chapterId === activeChapterId && s.sectionId === activeSections[activeChapterId]
    )

    const navigateTo = useCallback((index) => {
        if (index < 0 || index >= allSections.length) return
        const { chapterId, sectionId } = allSections[index]
        setActiveChapterId(chapterId)
        setActiveSections(prev => ({ ...prev, [chapterId]: sectionId }))
    }, [])

    const renderedChapters = chapters.map((chapter, chapterIndex) => (
        <TabLayout.Panel key={chapterIndex} label={chapter.title} panelId={chapter.id} icon={chapter.icon}>
            <div style={{ position: 'relative' }}>
                <TabLayout
                    activePanelId={activeSections[chapter.id]}
                    onChange={changeSection(chapter.id)}
                    className="sectionBar"
                >
                    {chapter.sections.map((section, sIndex) => (
                        <TabLayout.Panel
                            key={sIndex}
                            label={section.title}
                            panelId={sectionPanelId(chapter, section)}
                            style={{ marginBottom: 15 }}
                        >
                            <ToastContext.Provider value={createToast}>
                                <div className="workshopContent">
                                    <Section chapter={chapter} section={section} />
                                </div>
                            </ToastContext.Provider>
                        </TabLayout.Panel>
                    ))}
                </TabLayout>

                {/* Prev / Next nav — floated into the right side of the section tab strip */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 8,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    zIndex: 10,
                }}>
                    <button
                        onClick={() => navigateTo(currentIndex - 1)}
                        disabled={currentIndex <= 0}
                        title="Previous section"
                        style={navBtnStyle(currentIndex <= 0)}
                    >‹</button>
                    <span style={{
                        fontSize: 11,
                        color: '#666',
                        minWidth: 36,
                        textAlign: 'center',
                        userSelect: 'none',
                    }}>
                        {chapterIndex + 1}/{chapter.sections.findIndex(s => sectionPanelId(chapter, s) === activeSections[chapter.id]) + 1}
                    </span>
                    <button
                        onClick={() => navigateTo(currentIndex + 1)}
                        disabled={currentIndex >= allSections.length - 1}
                        title="Next section"
                        style={navBtnStyle(currentIndex >= allSections.length - 1)}
                    >›</button>
                </div>
            </div>
        </TabLayout.Panel>
    ))

    return (
        <>
            <ChapterBar activeChapter={activeChapterId} onChapterChange={changeChapter}>
                {renderedChapters}
            </ChapterBar>
        </>
    )
}

layout(
    <SplunkThemeProvider family="enterprise" colorScheme="light" density="compact">
        <ToastMessages />
        <App></App>
    </SplunkThemeProvider>
    , { hideFooter: false, hideAppBar: false });
