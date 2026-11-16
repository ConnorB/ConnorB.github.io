const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');

const html = readFileSync(`${__dirname}/../assets/goatcounter.html`, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const location = new URL('https://connorb.github.io/cv.html?private=value');

test('referrers share readable labels without merging unrelated sites or losing internal paths', () => {
  const settings = { allow_frame: true };
  const window = { goatcounter: settings };
  runInNewContext(script, { window, location, URL, document: { addEventListener() {} } });
  assert.equal(window.goatcounter, settings);
  assert.equal(window.goatcounter.allow_frame, true);
  for (const referrer of ['bing.com', 'www.bing.com', 'https://bing.com/', 'https://www.bing.com/search?q=streams', 'http://www.bing.com/', 'https://WWW.BING.COM/']) {
    assert.equal(window.goatcounter.referrer(referrer), 'Bing');
  }
  const cases = [
    ['https://www.google.com/', 'Google'], ['https://www.google.co.uk/search', 'Google'],
    ['https://duckduckgo.com/?q=streams', 'DuckDuckGo'], ['https://chat.openai.com/', 'ChatGPT'],
    ['https://chatgpt.com/', 'ChatGPT'], ['https://gemini.google.com/', 'Gemini'],
    ['https://l.facebook.com/redirect', 'Facebook'], ['FB', 'Facebook'], ['ig', 'Instagram'],
    ['https://m.instagram.com/', 'Instagram'], ['https://t.co/abc', 'X'],
    ['https://www.twitter.com/search?q=streams', 'X'], ['threads', 'Threads'], ['bsky', 'Bluesky'],
    ['mstdn', 'Mastodon'], ['https://fediscience.org/@connor', 'Mastodon'], ['fediverse', 'Fediverse'],
    ['https://teams.public.onecdn.static.microsoft/', 'Microsoft Teams'],
    ['https://WWW.AOCR.ORG/page?tracking=value#section', 'aocr.org'],
    ['//www.example.org/page', 'example.org'], ['www.example.org/page', 'example.org'],
    ['https://bing.com.example.org/', 'bing.com.example.org'], ['https://example.org/?ref=bing.com', 'example.org'],
    ['https://google.example.org/', 'google.example.org'],
    ['https://connorb.github.io/streamMetabolizer/articles/get_started.html', 'https://connorb.github.io/streamMetabolizer/articles/get_started.html'],
    ['/cv.html', '/cv.html'], ['', ''], ['Bing', 'Bing'], ['Research newsletter', 'Research newsletter'],
    ['Newsletter_2026', 'Newsletter_2026'], ['https://[invalid', 'https://[invalid'],
    ['android-app://com.example.app', 'android-app://com.example.app'],
  ];
  for (const [referrer, expected] of cases) {
    assert.equal(window.goatcounter.referrer(referrer), expected, referrer);
  }
});

test('campaign sources are normalized before the first visible pageview and events retain their source', () => {
  const listeners = new Map();
  const document = {
    readyState: 'loading', visibilityState: 'hidden',
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
    },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
    querySelectorAll() { return []; },
  };
  const query = '?utm_source=ig&ref=FB&src=bsky&source=chatgpt.com&utm_campaign=Research_2026&campaign=fall&page=2';
  const counter = { get_data(vars = {}) { return { r: '/cv.html', e: !!vars.event, q: query }; }, bind_events() {} };
  const hits = [];
  counter.count = () => hits.push(counter.get_data());
  const context = { window: { goatcounter: counter }, document, location, URL, URLSearchParams };
  runInNewContext(script, context);
  assert.equal(counter.no_onload, true);
  context.startGoatCounter();
  assert.equal(hits.length, 0);
  document.readyState = 'complete';
  for (const callback of [...listeners.get('DOMContentLoaded')]) callback();
  assert.equal(hits.length, 0);
  document.visibilityState = 'visible';
  for (const callback of [...listeners.get('visibilitychange')]) callback();
  assert.equal(hits.length, 1);
  assert.equal(listeners.get('visibilitychange').size, 0);
  assert.deepEqual(Object.fromEntries(new URLSearchParams(hits[0].q)), {
    utm_source: 'Instagram', ref: 'Facebook', src: 'Bluesky', source: 'ChatGPT',
    utm_campaign: 'Research_2026', campaign: 'fall', page: '2',
  });
  assert.deepEqual(counter.get_data({ event: true }), { r: '/cv.html', e: true, q: query });
});

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
  runInNewContext(script, { document, window, location, URL });
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
