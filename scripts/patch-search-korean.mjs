import fs from 'fs';
import path from 'path';

/**
 * 修補 @easyops-cn/docusaurus-search-local 在啟用 zh 語系時，
 * 僅匹配 \w+ 與 \p{Unified_Ideograph}+ 而遺漏韓文字母 (\p{Script=Hangul}) 的問題。
 * 本腳本具備冪等性 (idempotent)，可安全於 postinstall 重複執行。
 */
const ROOT = process.cwd();
const PKG_DIST = path.join(ROOT, 'node_modules', '@easyops-cn', 'docusaurus-search-local', 'dist');

const patches = [
  {
    file: path.join(PKG_DIST, 'server', 'server', 'utils', 'tokenizer.js'),
    replacements: [
      {
        from: 'const RegExpConsecutiveWord = /\\w+|\\p{Unified_Ideograph}+/u;',
        to: 'const RegExpConsecutiveWord = /[\\w\\p{Script=Hangul}]+|\\p{Unified_Ideograph}+/u;',
      },
      {
        from: 'if (/\\w/.test(word[0])) {',
        to: 'if (/[\\w\\p{Script=Hangul}]/u.test(word[0])) {',
      },
    ],
  },
  {
    file: path.join(PKG_DIST, 'client', 'client', 'utils', 'tokenize.js'),
    replacements: [
      {
        from: 'regExpMatchWords = /\\w+|\\p{Unified_Ideograph}+/gu;',
        to: 'regExpMatchWords = /[\\w\\p{Script=Hangul}]+|\\p{Unified_Ideograph}+/gu;',
      },
    ],
  },
  {
    file: path.join(PKG_DIST, 'client', 'client', 'utils', 'looseTokenize.js'),
    replacements: [
      {
        from: 'const singleMatchOfWord = /\\w+|\\p{Unified_Ideograph}/u;',
        to: 'const singleMatchOfWord = /[\\w\\p{Script=Hangul}]+|\\p{Unified_Ideograph}/u;',
      },
    ],
  },
  {
    file: path.join(PKG_DIST, 'server', 'shared', 'lunrLanguageZh.js'),
    replacements: [
      {
        from: '"\\\\u3400-\\\\u4DBF',
        to: '"\\\\u1100-\\\\u11FF\\\\u3130-\\\\u318F\\\\uAC00-\\\\uD7A3\\\\u3400-\\\\u4DBF',
      },
    ],
  },
  {
    file: path.join(PKG_DIST, 'client', 'shared', 'lunrLanguageZh.js'),
    replacements: [
      {
        from: '"\\\\u3400-\\\\u4DBF',
        to: '"\\\\u1100-\\\\u11FF\\\\u3130-\\\\u318F\\\\uAC00-\\\\uD7A3\\\\u3400-\\\\u4DBF',
      },
    ],
  },
];

let patchedCount = 0;

for (const { file, replacements } of patches) {
  if (!fs.existsSync(file)) {
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const { from, to } of replacements) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    patchedCount++;
  }
}

console.log(`[patch-search-korean] Done (${patchedCount} file(s) updated).`);
