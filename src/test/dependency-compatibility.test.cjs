const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const test = require('node:test');

const visualizationRequire = createRequire(require.resolve('@splunk/visualizations/package.json'));
const cloudAuthRequire = createRequire(require.resolve('@splunkdev/cloud-auth-client/package.json'));

test('patched CryptoJS preserves the cloud auth PKCE challenge', () => {
    const { createCodeChallenge, encodeCodeVerifier } = cloudAuthRequire('./src/common/util.js');
    assert.equal(cloudAuthRequire('crypto-js/package.json').version, '4.2.0');
    assert.equal(
        createCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'),
        'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    );
    assert.equal(encodeCodeVerifier('test?'), 'dGVzdD8');
});

test('patched d3-color interoperates with the Studio visualization dependencies', () => {
    const { interpolateRgb } = visualizationRequire('d3-interpolate');
    const { scaleLinear } = visualizationRequire('d3-scale');
    const { transition } = visualizationRequire('d3-transition');
    assert.equal(interpolateRgb('red', 'blue')(0.5), 'rgb(128, 0, 128)');
    assert.equal(
        scaleLinear().domain([0, 1]).range(['red', 'blue'])(0.5),
        'rgb(128, 0, 128)'
    );
    assert.equal(typeof transition, 'function');
});
