const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');

const html = readFileSync(`${__dirname}/../assets/goatcounter.html`, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const location = new URL('https://connorb.github.io/cv.html?private=value');

test('PDF and external links use native GoatCounter events with clean destinations', () => {
  const cases = [
    ['/CBrown_CV.pdf?token=secret#page=2', 'download:/CBrown_CV.pdf'],
    ['https://journal.example/paper.PDF?token=secret', 'download:https://journal.example/paper.PDF'],
    ['https://github.com/ConnorB?tab=repositories#top', 'outbound:https://github.com/ConnorB'],
    ['//example.org/resource', 'outbound:https://example.org/resource'],
    ['/publications.html', undefined],
    ['/flowcam/', undefined],
    ['#top', undefined],
    ['mailto:connor@example.org', undefined],
    ['tel:+15555555555', undefined],
    ['javascript:void(0)', undefined],
  ];
  const links = cases.map(([href]) => Object.assign(new URL(href, location), {
    dataset: {}, textContent: ' Download PDF ',
    hasAttribute: () => false,
    getAttribute: () => null,
  }));
  links[2].getAttribute = name => name === 'aria-label' ? 'GitHub' : null;
  const custom = Object.assign(new URL('https://example.org/custom'), {
    dataset: { goatcounterClick: 'custom-event' },
    hasAttribute: name => name === 'data-goatcounter-click',
  });
  let ready, bindings = 0;
  const document = {
    addEventListener(name, callback) { assert.equal(name, 'DOMContentLoaded'); ready = callback; },
    querySelectorAll(selector) { assert.equal(selector, 'a[href]'); return [...links, custom]; },
  };
  const window = { goatcounter: { bind_events() { bindings++; } } };
  runInNewContext(script, { document, window, location });
  ready();
  cases.forEach(([, expected], i) => {
    assert.equal(links[i].dataset.goatcounterClick, expected);
    if (expected) {
      assert.equal(links[i].dataset.goatcounterReferrer, '/cv.html');
      assert.equal(links[i].dataset.goatcounterNoSession, '1');
    }
  });
  assert.equal(links[0].dataset.goatcounterTitle, 'Download PDF');
  assert.equal(links[2].dataset.goatcounterTitle, 'GitHub');
  assert.deepEqual(custom.dataset, { goatcounterClick: 'custom-event' });
  assert.equal(bindings, 1);
  delete window.goatcounter;
  assert.doesNotThrow(ready, 'a slow or blocked counter must not break links');
});
