const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');

const Button = ({ label, children, ...props }) => React.createElement('button', props, label || children);
const Message = ({ children, ...props }) => React.createElement('aside', props, children);
const ColumnLayout = ({ children }) => React.createElement('div', null, children);
ColumnLayout.Row = ColumnLayout;
ColumnLayout.Column = ColumnLayout;

const compiled = new Map();
function loadComponent(name, mocks = {}, globals = {}) {
    if (!compiled.has(name)) {
        compiled.set(name, babel.transformFileSync(path.join(__dirname, '../web/components', name), {
            babelrc: false,
            configFile: false,
            presets: ['@babel/preset-react'],
            plugins: [
                '@babel/plugin-transform-modules-commonjs',
                () => ({
                    visitor: {
                        CallExpression(nodePath) {
                            if (nodePath.node.callee.type === 'Import') {
                                nodePath.node.callee = babel.types.identifier('__loadLesson');
                            }
                        },
                    },
                }),
            ],
        }).code);
    }
    const module = { exports: {} };
    vm.runInNewContext(compiled.get(name), {
        module,
        exports: module.exports,
        require: (id) => {
            if (Object.hasOwn(mocks, id)) return mocks[id];
            if (id === '@splunk/react-ui/Button') return Button;
            if (id === '@splunk/react-ui/Message') return Message;
            if (id === '@splunk/react-ui/ColumnLayout') return ColumnLayout;
            if (id === '@splunk/react-ui/WaitSpinner') return () => null;
            return require(id);
        },
        console: { warn() {}, error() {} },
        setTimeout,
        clearTimeout,
        AbortController,
        ...globals,
    }, { filename: name });
    return module.exports;
}

function response(content, status = 200) {
    return {
        status,
        ok: status >= 200 && status < 300,
        json: async () => ({ entry: [{ content }] }),
    };
}

function text(renderer) {
    const collect = (node) => {
        if (typeof node === 'string') return node;
        if (!node) return '';
        return (Array.isArray(node) ? node : node.children || []).map(collect).join('');
    };
    return collect(renderer.toJSON());
}

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

test('index checks distinguish populated, empty, missing, and malformed responses', async () => {
    let next = response({ totalEventCount: '42' });
    const { fetchIndexInfo } = loadComponent('IndexHealth.js', {}, { fetch: async () => next });
    assert.equal((await fetchIndexInfo('de-DE', 's4c_www')).hasData, true);
    next = response({ totalEventCount: '0' });
    const empty = await fetchIndexInfo('de-DE', 's4c_www');
    assert.equal(empty.exists, true);
    assert.equal(empty.hasData, false);
    next = response(null, 404);
    const missing = await fetchIndexInfo('de-DE', 's4c_www');
    assert.equal(missing.exists, false);
    assert.equal(missing.count, null);
    for (const count of [undefined, '', 'not-a-count', '10x', null, -1]) {
        next = response({ totalEventCount: count });
        await assert.rejects(fetchIndexInfo('de-DE', 's4c_www'), /invalid event count/);
    }
    next = { ok: true, status: 200, json: async () => ({ entry: [] }) };
    await assert.rejects(fetchIndexInfo('de-DE', 's4c_www'), /unexpected API response/);
    next = { ok: true, status: 200, json: async () => { throw new SyntaxError('HTML login page'); } };
    await assert.rejects(fetchIndexInfo('de-DE', 's4c_www'), /Check your session/);
});

test('permission, session, API, connection and timeout failures have actionable messages', async () => {
    let next;
    const { fetchIndexInfo } = loadComponent('IndexHealth.js', {}, {
        fetch: async () => {
            if (next instanceof Error) throw next;
            return next;
        },
    });
    for (const [status, message] of [[401, /Session expired/], [403, /Permission denied/], [503, /API error.*503/]]) {
        next = response(null, status);
        await assert.rejects(fetchIndexInfo('en-US', 's4c_www'), message);
    }
    next = new TypeError('Failed to fetch');
    await assert.rejects(fetchIndexInfo('en-US', 's4c_www'), /Connection failed/);

    let expire;
    let cleared = false;
    const timed = loadComponent('IndexHealth.js', {}, {
        setTimeout: (callback, delay) => { assert.equal(delay, 15000); expire = callback; return 1; },
        clearTimeout: () => { cleared = true; },
        fetch: (url, { signal }) => new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('Aborted')));
        }),
    });
    const pending = timed.fetchIndexInfo('en-US', 's4c_www');
    expire();
    await assert.rejects(pending, /timed out/);
    assert.equal(cleared, true);
});

test('a failed version request preserves the other version and exposes its error', async () => {
    const { fetchVersions } = loadComponent('IndexHealth.js', {}, {
        fetch: async (url) => url.includes('server/info')
            ? response(null, 403)
            : response({ version: '2.15.0' }),
    });
    const versions = await fetchVersions('en-GB');
    assert.equal(versions.appVersion, '2.15.0');
    assert.equal(versions.splunkVersion, 'Unavailable');
    assert.match(versions.errors[0], /Splunk version: Permission denied/);
});

test('Health Check never labels request errors as missing indexes and recovers on refresh', async () => {
    let fail = true;
    const requests = [];
    const { default: IndexHealth } = loadComponent('IndexHealth.js', {}, {
        window: { location: { pathname: '/de-DE/app/splunk4champions2/lab' } },
        fetch: async (url, options) => {
            requests.push({ url, options });
            if (fail && url.includes('server/info')) throw new TypeError('Offline');
            if (fail && url.includes('data/indexes')) return response(null, 403);
            return response(url.includes('data/indexes')
                ? { totalEventCount: '42', minTime: '1700000000', maxTime: '1700000001' }
                : { version: '10.6.0' });
        },
    });
    let renderer;
    await act(async () => { renderer = create(React.createElement(IndexHealth)); });
    assert.match(text(renderer), /Check failed/);
    assert.match(text(renderer), /Permission denied/);
    assert.match(text(renderer), /Connection failed/);
    assert.doesNotMatch(text(renderer), /Index not found or|ALL OK/);
    assert.equal(renderer.root.findAllByProps({ role: 'alert' }).length > 0, true);
    assert.equal(requests.every(({ url, options }) => url.startsWith('/de-DE/') && options.credentials === 'include'), true);

    fail = false;
    await act(async () => {
        renderer.root.findByType('button').props.onClick();
    });
    assert.match(text(renderer), /ALL OK/);
    assert.doesNotMatch(text(renderer), /Check failed|Permission denied|Unavailable/);
    act(() => renderer.unmount());
});

test('Health Check shows loading, then missing and empty data hints separately', async () => {
    const pending = deferred();
    const { default: IndexHealth } = loadComponent('IndexHealth.js', {}, {
        window: { location: { pathname: '/en-US/app/splunk4champions2/lab' } },
        fetch: async (url) => {
            await pending.promise;
            if (url.includes('data/indexes/s4c_www?')) return response(null, 404);
            if (url.includes('data/indexes')) return response({ totalEventCount: '0' });
            return response({ version: '10.6.0' });
        },
    });
    let renderer;
    act(() => { renderer = create(React.createElement(IndexHealth)); });
    assert.match(text(renderer), /Checking workshop health/);
    assert.equal(renderer.root.findByType('button').props.disabled, true);
    await act(async () => { pending.resolve(); });
    assert.match(text(renderer), /Index not found or not visible/);
    assert.match(text(renderer), /Index exists but has no data/);
    assert.doesNotMatch(text(renderer), /Check failed|ALL OK/);
    act(() => renderer.unmount());
});

function clipboardFixture(clipboard) {
    const { default: SplunkSearch } = loadComponent('SplunkSearch.js', {
        '@splunk/react-icons/Clipboard': () => null,
        '@splunk/react-search/components/Bar': ({ options }) => options.componentAppendToInput,
        '@splunk/react-search/utils/searchBNFs': async () => ({}),
    }, { navigator: { clipboard } });
    return { SplunkSearch };
}

test('copy shows success only after the actual clipboard write completes', async () => {
    const pending = deferred();
    let copied;
    const { SplunkSearch } = clipboardFixture({
        writeText: (value) => { copied = value; return pending.promise; },
    });
    let renderer;
    await act(async () => { renderer = create(React.createElement(SplunkSearch, { spl: 'index=s4c_www' })); });
    let copying;
    act(() => { copying = renderer.root.findByType('button').props.onClick(); });
    assert.equal(copied, 'index=s4c_www');
    assert.doesNotMatch(text(renderer), /Search copied to clipboard/);
    assert.equal(renderer.root.findByType('button').props.disabled, true);
    await act(async () => { pending.resolve(); await copying; });
    assert.equal(renderer.root.findByType(Message).props.type, 'success');
    assert.match(text(renderer), /Search copied to clipboard/);
    assert.equal(renderer.root.findByProps({ role: 'status' }).props['aria-live'], 'polite');
    assert.equal(renderer.root.findByType('button').props.disabled, false);
    await act(async () => {});
    assert.match(text(renderer), /Search copied to clipboard/);
    act(() => renderer.root.findByType(Message).props.onRequestRemove());
    assert.doesNotMatch(text(renderer), /Search copied to clipboard/);
    act(() => renderer.unmount());
});

test('denied and unavailable clipboard access show errors, never success', async () => {
    for (const clipboard of [undefined, { writeText: async () => { throw new Error('Permission denied'); } }]) {
        const { SplunkSearch } = clipboardFixture(clipboard);
        let renderer;
        await act(async () => { renderer = create(React.createElement(SplunkSearch, { spl: '| makeresults' })); });
        await act(async () => { await renderer.root.findByType('button').props.onClick(); });
        assert.equal(renderer.root.findByType(Message).props.type, 'error');
        assert.match(text(renderer), /copy it manually/);
        assert.doesNotMatch(text(renderer), /Search copied to clipboard/);
        assert.equal(renderer.root.findByProps({ role: 'alert' }).props['aria-live'], 'assertive');
        assert.equal(renderer.root.findByType('button').props.disabled, false);
        act(() => renderer.unmount());
    }
});

test('a later copy attempt replaces stale feedback and copies the edited SPL', async () => {
    let write = 0;
    const copied = [];
    const { default: SplunkSearch } = loadComponent('SplunkSearch.js', {
        '@splunk/react-icons/Clipboard': () => null,
        '@splunk/react-search/components/Bar': ({ options, onOptionsChange }) => React.createElement(
            React.Fragment,
            null,
            options.componentAppendToInput,
            React.createElement('input', { onChange: () => onOptionsChange({ search: '| makeresults count=2' }) })
        ),
        '@splunk/react-search/utils/searchBNFs': async () => ({}),
    }, { navigator: { clipboard: { writeText: async (value) => {
        copied.push(value);
        if (++write === 1) throw new Error('Permission denied');
    } } } });
    let renderer;
    await act(async () => { renderer = create(React.createElement(SplunkSearch, { spl: '| makeresults' })); });
    await act(async () => { await renderer.root.findByType('button').props.onClick(); });
    assert.match(text(renderer), /Could not copy/);
    act(() => renderer.root.findByType('input').props.onChange());
    await act(async () => { await renderer.root.findByType('button').props.onClick(); });
    assert.deepEqual(copied, ['| makeresults', '| makeresults count=2']);
    assert.match(text(renderer), /Search copied to clipboard/);
    assert.doesNotMatch(text(renderer), /Could not copy/);
    act(() => renderer.unmount());
});

function lessonFixture(loader) {
    return loadComponent('Section.js', {
        './Step': ({ content: Content }) => React.createElement(Content),
    }, { __loadLesson: loader });
}

test('lessons announce loading, expose a failed import, and can retry successfully', async () => {
    const pending = deferred();
    let calls = 0;
    const { SectionStep } = lessonFixture(() => ++calls === 1
        ? pending.promise
        : Promise.resolve({ default: () => React.createElement('p', null, 'Lesson ready') }));
    let renderer;
    act(() => {
        renderer = create(React.createElement(SectionStep, { step: { title: 'Search', content: 'search.mdx' } }));
    });
    assert.match(text(renderer), /Loading lesson:.*Search/);
    assert.equal(renderer.root.findByProps({ role: 'status' }).props['aria-live'], 'polite');
    await act(async () => { pending.reject(new Error('Import failed')); });
    assert.match(text(renderer), /Could not load "Search"/);
    assert.equal(renderer.root.findAllByProps({ role: 'alert' }).length > 0, true);
    await act(async () => { renderer.root.findByType('button').props.onClick(); });
    assert.equal(calls, 2);
    assert.match(text(renderer), /Lesson ready/);
    act(() => renderer.unmount());
});

test('a late lesson load cannot overwrite a more recently selected lesson', async () => {
    const pending = deferred();
    const { SectionStep } = lessonFixture((name) => name.endsWith('first.mdx')
        ? pending.promise
        : Promise.resolve({ default: () => React.createElement('p', null, 'Second lesson') }));
    let renderer;
    act(() => {
        renderer = create(React.createElement(SectionStep, { step: { title: 'First', content: 'first.mdx' } }));
    });
    await act(async () => {
        renderer.update(React.createElement(SectionStep, { step: { title: 'Second', content: 'second.mdx' } }));
    });
    await act(async () => {
        pending.resolve({ default: () => React.createElement('p', null, 'First lesson') });
    });
    assert.match(text(renderer), /Second lesson/);
    assert.doesNotMatch(text(renderer), /First lesson/);
    act(() => renderer.unmount());
});

test('render failures offer a section retry and remount the lesson', async (t) => {
    t.mock.method(console, 'error', () => {});
    let broken = true;
    const { default: Section } = lessonFixture(async () => ({
        default: () => {
            if (broken) throw new Error('Rendering failed');
            return React.createElement('p', null, 'Recovered lesson');
        },
    }));
    let renderer;
    await act(async () => {
        renderer = create(React.createElement(Section, {
            chapter: { id: 'one' },
            section: { title: 'Search', steps: [{ title: 'Search', content: 'search.mdx' }] },
        }));
    });
    assert.match(text(renderer), /could not be rendered/);
    broken = false;
    await act(async () => { renderer.root.findByType('button').props.onClick(); });
    assert.match(text(renderer), /Recovered lesson/);
    act(() => renderer.unmount());
});
