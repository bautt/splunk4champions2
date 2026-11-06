import { VisualizationAPI } from '@splunk/dashboard-studio-extension';
import './visualization.css';

const container = document.createElement('div');
container.className = 'workshop-bars';
document.getElementById('root').appendChild(container);

const state = {
    data: null,
    loading: false,
    options: {},
    theme: 'light',
    dataReady: false,
    optionsReady: false,
};

function readRows(data) {
    if (data == null) return [];
    if (!Array.isArray(data.fields) || !Array.isArray(data.columns)) {
        throw new Error('The search data is not a valid table.');
    }
    if (data.fields.length === 0 && data.columns.length === 0) return [];
    const names = data.fields.map(field => typeof field === 'string' ? field : field.name);
    for (const name of ['label', 'value']) {
        if (names.filter(field => field === name).length !== 1) {
            throw new Error(`The search must return exactly one column named "${name}".`);
        }
    }
    const labels = data.columns[names.indexOf('label')];
    const values = data.columns[names.indexOf('value')];
    if (!Array.isArray(labels) || !Array.isArray(values) || labels.length !== values.length) {
        throw new Error('Labels and values have different row counts.');
    }
    return labels.map((label, row) => {
        const raw = values[row];
        const value = Number(raw);
        if (!['string', 'number'].includes(typeof raw) ||
            String(raw).trim() === '' || !Number.isFinite(value) || value < 0) {
            throw new Error(`Row ${row + 1}: value must be a non-negative number.`);
        }
        if (label == null || String(label).trim() === '') {
            throw new Error(`Row ${row + 1}: label must not be empty.`);
        }
        return { label: String(label), value };
    });
}

function showMessage(text) {
    const message = document.createElement('p');
    message.setAttribute('role', 'status');
    message.textContent = text;
    container.appendChild(message);
}

function render() {
    container.replaceChildren();
    container.dataset.theme = state.theme;
    VisualizationAPI.clearError();

    if (!state.dataReady || !state.optionsReady || state.loading) {
        showMessage('Loading data...');
        return;
    }

    let rows;
    let maxBarWidth;
    let barColor;
    try {
        rows = readRows(state.data);
        maxBarWidth = Number(state.options.maxBarWidth ?? 400);
        barColor = state.options.barColor ?? '#1768ab';
        if (!Number.isFinite(maxBarWidth) || maxBarWidth <= 0) {
            throw new Error('Maximum bar width must be a number greater than 0.');
        }
        if (typeof barColor !== 'string' || !CSS.supports('color', barColor)) {
            throw new Error('Choose a valid bar color.');
        }
    } catch (error) {
        if (!(error instanceof Error)) throw error;
        showMessage(error.message);
        VisualizationAPI.setError(error.message);
        return;
    }

    if (rows.length === 0) {
        showMessage('No data in the selected time range.');
        return;
    }

    const largest = rows.reduce((maximum, row) => Math.max(maximum, row.value), 0);
    const list = document.createElement('ul');
    list.className = 'bar-list';
    list.setAttribute('aria-label', 'Values as a bar chart');

    for (const { label, value } of rows) {
        const row = document.createElement('li');
        row.className = 'bar-row';

        const name = document.createElement('span');
        name.className = 'bar-label';
        name.textContent = label;
        name.title = label;

        const track = document.createElement('span');
        track.className = 'bar-track';
        track.style.width = `${maxBarWidth}px`;
        track.setAttribute('aria-hidden', 'true');
        const bar = document.createElement('span');
        bar.className = 'bar-fill';
        bar.style.width = `${largest > 0 ? value / largest * 100 : 0}%`;
        bar.style.backgroundColor = barColor;
        track.appendChild(bar);

        const number = document.createElement('span');
        number.className = 'bar-value';
        number.textContent = new Intl.NumberFormat('en-US').format(value);

        row.append(name, track, number);
        list.appendChild(row);
    }
    container.appendChild(list);
}

const lifetime = new AbortController();
const listenerOptions = { invokeImmediately: true, signal: lifetime.signal };

VisualizationAPI.addDataSourcesListener(({ dataSources, loading }) => {
    state.dataReady = true;
    state.loading = loading;
    state.data = dataSources?.primary?.data ?? null;
    render();
}, listenerOptions);

VisualizationAPI.addOptionsListener(({ options }) => {
    state.optionsReady = true;
    state.options = options ?? {};
    render();
}, listenerOptions);

VisualizationAPI.addThemeListener(({ theme }) => {
    state.theme = theme;
    render();
}, listenerOptions);

window.addEventListener('pagehide', () => lifetime.abort(), { once: true });
