import React, { useState, useEffect, useCallback, useRef } from 'react';
import layout from '@splunk/react-page/18';
import { SplunkThemeProvider } from '@splunk/themes';

import ChapterBar from './components/ChapterBar';
import TabLayout from '@splunk/react-ui/TabLayout';
import DocumentDrawer from '@splunk/react-icons/DocumentDrawer';

import workshop from './workshop/workshop';
import Section from './components/Section';

import './components/SectionBar.css';
import './components/workshop.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

/*
 * The chapter bar is the live path, then Legacy, then Setup.
 * A chapter marked `shelf: "overflow"` leaves the primary strip and appears
 * as an inner tab inside one Legacy tab. Deep links such as `#ch=four`
 * keep working: the dispatcher opens Legacy with Metrics selected inside it.
 *
 * Setup (id "zero") is pinned to the end of the primary strip.
 * Large Room and the colour scheme live on that page.
 */

const chapters = workshop.chapters;
const OVERFLOW_ID = '__overflow';
const SETUP_ID = 'zero';

const liveChapters = chapters.filter(
    (c) => c.shelf !== 'overflow' && c.id !== SETUP_ID
);
const overflowChapters = chapters.filter((c) => c.shelf === 'overflow');
const setupChapter = chapters.find((c) => c.id === SETUP_ID);

const DISPLAY_MODE_KEY = 's4c_display_mode';
const DISPLAY_MODE_EVENT = 's4c-display-mode-change';
const LARGE_MODE_CLASS = 's4c-large-room';

function sectionPanelId(chapter, section) {
    return chapter.id + section.title;
}

/** Old bookmarks / links (#sec=threeQuiz) after section was renamed to "Search recap". */
const LEGACY_SECTION_IDS = {
    threeQuiz: 'threeSearch recap',
    'sevenMobile Links': 'sevenUseful Links',
    zeroWorkshop: 'zeroSetup',
    zeroSettings: 'zeroSetup',
    sixTutorial: 'sixOverview',
    'sixData Sources': 'sixChain Searches',
    sixInteractivity: 'sixToken Kitchen',
    'sixToken kitchen': 'sixToken Kitchen',
    'sixLayout & Visualizations': 'sixImage Upload',
    'sixCustom Visualizations': 'sixCustom Viz',
    'sixCanvas Viz Library': 'sixCustom Viz',
    'sixSharing & Security': 'sixSharing',
};

function normalizeSectionId(chapterId, sectionId) {
    if (!chapterId || !sectionId) return sectionId;
    const mapped = LEGACY_SECTION_IDS[sectionId];
    if (!mapped) return sectionId;
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return sectionId;
    const ok = ch.sections.some((s) => sectionPanelId(ch, s) === mapped);
    return ok ? mapped : sectionId;
}

function defaultSectionFor(chapterId) {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return null;
    return sectionPanelId(ch, ch.sections[0]);
}

function parseHash() {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(hash);
    let chapterId = params.get('ch') || null;
    let sectionId = params.get('sec') || null;
    // The custom-viz lab used to be its own overflow chapter.
    if (chapterId === 'viz') {
        chapterId = 'six';
        sectionId = 'sixCustom Viz';
    }
    if (chapterId && sectionId) sectionId = normalizeSectionId(chapterId, sectionId);
    return { chapterId, sectionId };
}

function buildHash(chapterId, sectionId) {
    const params = new URLSearchParams();
    params.set('ch', chapterId);
    params.set('sec', sectionId);
    return '#' + params.toString();
}

function pushHash(chapterId, sectionId) {
    window.history.pushState(null, '', buildHash(chapterId, sectionId));
}

function replaceHash(chapterId, sectionId) {
    window.history.replaceState(null, '', buildHash(chapterId, sectionId));
}

function validChapterId(id) {
    return chapters.some((c) => c.id === id);
}

function validSectionId(chapterId, sectionId) {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return false;
    return ch.sections.some((s) => sectionPanelId(ch, s) === sectionId);
}

function isOverflowChapter(chapterId) {
    return overflowChapters.some((c) => c.id === chapterId);
}

/** Which primary tab is the given chapter under: itself, Legacy, or Setup. */
function primaryTabFor(chapterId) {
    if (chapterId === SETUP_ID) return SETUP_ID;
    if (isOverflowChapter(chapterId)) return OVERFLOW_ID;
    return chapterId;
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

// ── Lab colour scheme ─────────────────────────────────────────────────────
const LAB_SCHEME_KEY = 's4c_lab_scheme';
const LAB_SCHEME_EVENT = 's4c-lab-scheme-change';
const VALID_SCHEMES = ['blue', 'brownred', 'blueyellow', 'pinkorange'];
const ALL_SCHEME_CLASSES = [
    's4c-scheme-blue',
    's4c-scheme-brownred',
    's4c-scheme-blueyellow',
    's4c-scheme-pinkorange',
];

function readStoredLabScheme() {
    try {
        const v = window.localStorage.getItem(LAB_SCHEME_KEY);
        return VALID_SCHEMES.includes(v) ? v : 'blue';
    } catch {
        return 'blue';
    }
}

function applyLabScheme(scheme) {
    document.body.classList.remove(...ALL_SCHEME_CLASSES);
    const next = VALID_SCHEMES.includes(scheme) ? scheme : 'blue';
    document.body.classList.add(`s4c-scheme-${next}`);
}

function persistLabScheme(scheme) {
    try {
        window.localStorage.setItem(LAB_SCHEME_KEY, scheme);
    } catch {}
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
    // Initialise from URL hash if present, otherwise default to first live chapter.
    const initState = () => {
        const { chapterId, sectionId } = parseHash();
        const ch = chapterId && validChapterId(chapterId) ? chapterId : liveChapters[0].id;
        const sec = sectionId && validSectionId(ch, sectionId) ? sectionId : defaultSectionFor(ch);
        return { chapterId: ch, sectionId: sec };
    };

    const [activeChapterId, setActiveChapterId] = useState(() => initState().chapterId);

    // Track active section per chapter so switching back restores position.
    const [activeSections, setActiveSections] = useState(() => {
        const { chapterId, sectionId } = initState();
        const map = {};
        chapters.forEach((ch) => {
            map[ch.id] = defaultSectionFor(ch.id);
        });
        map[chapterId] = sectionId;
        return map;
    });

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

    useEffect(() => {
        const scheme = readStoredLabScheme();
        applyLabScheme(scheme);

        const onSchemeChange = (event) => {
            const next = VALID_SCHEMES.includes(event?.detail?.scheme) ? event.detail.scheme : 'blue';
            applyLabScheme(next);
            persistLabScheme(next);
        };

        window.addEventListener(LAB_SCHEME_EVENT, onSchemeChange);
        return () => window.removeEventListener(LAB_SCHEME_EVENT, onSchemeChange);
    }, []);

    const isMounted = useRef(false);
    const isHashNav = useRef(false);

    // Sync state → hash whenever navigation changes.
    useEffect(() => {
        if (isHashNav.current) {
            isHashNav.current = false;
            return;
        }
        if (!isMounted.current) {
            isMounted.current = true;
            replaceHash(activeChapterId, activeSections[activeChapterId]);
            return;
        }
        pushHash(activeChapterId, activeSections[activeChapterId]);
    }, [activeChapterId, activeSections]);

    // Sync hash → state on browser back/forward.
    useEffect(() => {
        const onHashChange = () => {
            const { chapterId, sectionId } = parseHash();
            if (chapterId && validChapterId(chapterId)) {
                isHashNav.current = true;
                setActiveChapterId(chapterId);
                if (sectionId && validSectionId(chapterId, sectionId)) {
                    setActiveSections((prev) => ({ ...prev, [chapterId]: sectionId }));
                }
            }
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // Change primary tab. A click on Legacy opens the previously-active
    // legacy chapter (or Metrics by default); Setup opens that chapter.
    const changePrimaryTab = useCallback((e, { activePanelId }) => {
        if (activePanelId === OVERFLOW_ID) {
            // If the current chapter is already an overflow chapter, keep it.
            const current = isOverflowChapter(activeChapterId) ? activeChapterId : overflowChapters[0]?.id;
            if (current) setActiveChapterId(current);
            return;
        }
        setActiveChapterId(activePanelId);
    }, [activeChapterId]);

    const changeOverflowChapter = useCallback((e, { activePanelId }) => {
        if (chapters.some((c) => c.id === activePanelId && c.shelf === 'overflow')) {
            setActiveChapterId(activePanelId);
        }
    }, []);

    const changeSection = useCallback((chapterId) => (e, { activePanelId: sectionId }) => {
        setActiveSections((prev) => ({ ...prev, [chapterId]: sectionId }));
    }, []);

    // Flat list of all steps for prev/next, only inside the currently rendered
    // chapter (so Next from the last section of Settings goes to the first
        // section of Data, not of Legacy).
    const flatForChapter = (chapterId) => {
        const ch = chapters.find((c) => c.id === chapterId);
        if (!ch) return [];
        return ch.sections.map((s) => ({
            chapterId,
            sectionId: sectionPanelId(ch, s),
            label: s.title,
        }));
    };

    const activeSectionId = activeSections[activeChapterId];
    const chapterSteps = flatForChapter(activeChapterId);
    const localIndex = chapterSteps.findIndex((s) => s.sectionId === activeSectionId);

    const goToIndex = useCallback((index) => {
        if (index < 0 || index >= chapterSteps.length) return;
        const target = chapterSteps[index];
        setActiveSections((prev) => ({ ...prev, [activeChapterId]: target.sectionId }));
    }, [chapterSteps, activeChapterId]);

    const prevStep = localIndex > 0 ? chapterSteps[localIndex - 1] : null;
    const nextStep = localIndex >= 0 && localIndex < chapterSteps.length - 1 ? chapterSteps[localIndex + 1] : null;

    const renderChapterPanel = (chapter) => (
        <div className="s4c-chapter-panel-inner">
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
                        <div className="workshopContent">
                            <Section chapter={chapter} section={section} />
                        </div>
                    </TabLayout.Panel>
                ))}
            </TabLayout>

            <div className="s4c-section-nav" role="navigation" aria-label="Section navigation">
                <button
                    type="button"
                    className="s4c-section-nav__btn"
                    onClick={() => goToIndex(localIndex - 1)}
                    disabled={!prevStep}
                    title={prevStep ? `Previous: ${prevStep.label}` : 'Previous'}
                >
                    <span className="s4c-section-nav__arrow" aria-hidden="true">‹</span>
                    <span className="s4c-section-nav__btn-label">
                        {prevStep ? `Previous: ${prevStep.label}` : 'Previous'}
                    </span>
                </button>
                <span className="s4c-section-nav__counter" aria-label="Section position">
                    {localIndex >= 0 ? `${localIndex + 1} of ${chapterSteps.length}` : ''}
                </span>
                <button
                    type="button"
                    className="s4c-section-nav__btn"
                    onClick={() => goToIndex(localIndex + 1)}
                    disabled={!nextStep}
                    title={nextStep ? `Next: ${nextStep.label}` : 'Next'}
                >
                    <span className="s4c-section-nav__btn-label">
                        {nextStep ? `Next: ${nextStep.label}` : 'Next'}
                    </span>
                    <span className="s4c-section-nav__arrow" aria-hidden="true">›</span>
                </button>
            </div>
        </div>
    );

    const renderedPrimary = [];

    liveChapters.forEach((chapter, chapterIndex) => {
        renderedPrimary.push(
            <TabLayout.Panel
                key={`live-${chapterIndex}`}
                label={chapter.title}
                panelId={chapter.id}
                icon={chapter.icon}
            >
                {renderChapterPanel(chapter)}
            </TabLayout.Panel>
        );
    });

    if (overflowChapters.length > 0) {
        renderedPrimary.push(
            <TabLayout.Panel
                key="overflow"
                label="Legacy"
                panelId={OVERFLOW_ID}
                icon={<DocumentDrawer />}
            >
                <TabLayout
                    activePanelId={isOverflowChapter(activeChapterId) ? activeChapterId : overflowChapters[0].id}
                    onChange={changeOverflowChapter}
                    className="overflowBar"
                >
                    {overflowChapters.map((chapter, idx) => (
                        <TabLayout.Panel
                            key={`of-${idx}`}
                            label={chapter.title}
                            panelId={chapter.id}
                            icon={chapter.icon}
                        >
                            {renderChapterPanel(chapter)}
                        </TabLayout.Panel>
                    ))}
                </TabLayout>
            </TabLayout.Panel>
        );
    }

    if (setupChapter) {
        renderedPrimary.push(
            <TabLayout.Panel
                key="setup"
                label={setupChapter.title}
                panelId={setupChapter.id}
                icon={setupChapter.icon}
            >
                {renderChapterPanel(setupChapter)}
            </TabLayout.Panel>
        );
    }

    return (
        <div className="s4c-shell">
            <ChapterBar
                activeChapter={primaryTabFor(activeChapterId)}
                onChapterChange={changePrimaryTab}
            >
                {renderedPrimary}
            </ChapterBar>
        </div>
    );
}

layout(
    <SplunkThemeProvider family="enterprise" colorScheme="light" density="compact">
        <App />
    </SplunkThemeProvider>,
    { hideFooter: false, hideAppBar: false }
);
