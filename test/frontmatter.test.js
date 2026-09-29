import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../src/frontmatter.js';

test('parses key/value pairs and returns the body', () => {
  const { frontmatter, body } = parseFrontmatter('---\ntitle: Hello\nlayout: Base\n---\n<h1>Hi</h1>\n');
  assert.deepEqual(frontmatter, { title: 'Hello', layout: 'Base' });
  assert.equal(body, '<h1>Hi</h1>\n');
});

test('a --- inside a value does not close the block', () => {
  const { frontmatter, body } = parseFrontmatter('---\ntitle: before --- after\n---\n<p>x</p>');
  assert.equal(frontmatter.title, 'before --- after');
  assert.equal(body, '<p>x</p>');
});

test('values keep colons after the first one', () => {
  const { frontmatter } = parseFrontmatter('---\nurl: https://example.com:8080/a\n---\n');
  assert.equal(frontmatter.url, 'https://example.com:8080/a');
});

test('only matching surrounding quotes are removed', () => {
  const { frontmatter } = parseFrontmatter(`---\na: "quoted"\nb: 'single'\nc: it's fine\nd: "mixed'\n---\n`);
  assert.equal(frontmatter.a, 'quoted');
  assert.equal(frontmatter.b, 'single');
  assert.equal(frontmatter.c, "it's fine");
  assert.equal(frontmatter.d, `"mixed'`);
});

test('handles CRLF, BOM, comments and blank lines', () => {
  const { frontmatter, body } = parseFrontmatter('﻿---\r\n# comment\r\n\r\ntitle: Win\r\n---\r\n<p>ok</p>');
  assert.deepEqual(frontmatter, { title: 'Win' });
  assert.equal(body, '<p>ok</p>');
});

test('hyphenated keys are allowed; invalid keys are ignored', () => {
  const { frontmatter } = parseFrontmatter('---\nog-image: /a.png\nbad key: x\n---\n');
  assert.deepEqual(frontmatter, { 'og-image': '/a.png' });
});

test('no frontmatter or an unclosed block returns the input untouched', () => {
  assert.deepEqual(parseFrontmatter('<p>plain</p>'), { frontmatter: {}, body: '<p>plain</p>' });
  const unclosed = '---\ntitle: x\n<p>no end</p>';
  assert.deepEqual(parseFrontmatter(unclosed), { frontmatter: {}, body: unclosed });
});
