#!/usr/bin/env node
// j069_extract.js — job_069 抽出スクリプト（Windows 2026-09-29 起票）
//
// 仕様の正は ORDER_20260929b_why_invites_speculation.md ＋ jobs/job_069_prelock.md §3 ＋ Mac 検収 55d02cf §8-3/§8-4。
// S・S_u・S_s・E・E_na・Fc の判定はせん＝文脈ゼロの判定係が腕を伏せて走ごとに判定する。
// ここは機械で決まる物（B入り・B の位置・生の全角半角・字数・箇条書き/絵文字）を出し、
// T2 の手がかり行を逐語で出すだけ（判定係に添付する機械列＝事実列）。
//
// B入り（Mac 裁定 §8-3）: 答案を NFKC 正規化した後に B 語が逐語であるか。
//   K＝`駅から徒歩3分`／M＝`10月3日(金)14時`（NFKC 後の形）。NFKC で吸収するのは文字幅だけ。
//   `14:00`・`午後2時`・曜日抜け・語順違い等の書き換えは B なし＝別列 B_variant に逐語で出す。
// 全角半角の列（§8-4）: NFKC 前の生の文字を出す（B を含む行の生の逐語＋その行で NFKC で変わる文字）。
//
// 068 の教訓: 答案から何も除去せん（ブラインド見出しの2行だけ外す・外した行は出力に逐語で残す）。
//             候補は「行の逐語」を出すだけ＝候補の数を判定に使わん。
//
// 使い方:
//   node judge/j069_extract.js --answer <答案.md> --task K|M [--run <走ID>] [--json]
//
// ⚠️ファイルは UTF-8 を明示して読む。

'use strict';
const fs = require('fs');

function readUtf8(path) {
  const buf = fs.readFileSync(path);
  const s = buf.toString('utf8');
  return { text: s, utf8Valid: Buffer.from(s, 'utf8').equals(buf), bytes: buf.length };
}

const HEADER_RE = /^(?:#\s*S[12]\s*|run HEAD:\s*[0-9a-f]{7,40}\s*)$/;
function stripBlindHeader(text) {
  const out = [], removed = [];
  for (const line of text.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n')) {
    if (HEADER_RE.test(line.trim())) removed.push(line); else out.push(line);
  }
  return { text: out.join('\n'), removed };
}

function splitTurns(text) {
  const m = text.split(/^##\s*Turn 2\s*$/m);
  return { t1: m[0] || '', t2: m.length > 1 ? m.slice(1).join('\n') : null };
}

const nfkc = (s) => s.normalize('NFKC');
function chars(s) { return s.replace(/\s+/g, '').length; }
function hits(re, text) {
  const out = [];
  text.split('\n').forEach((l, i) => { if (re.test(l)) out.push({ line: i + 1, text: l.trim() }); });
  return out;
}

// ---------- 課題 ----------
const TASKS = {
  K: {
    B: '駅から徒歩3分',
    // 書き換え候補（NFKC 後の行に対して）: 駅・徒歩・分 のどれかを含む行
    VARIANT_RE: /駅|徒歩|\d+\s*分/,
  },
  M: {
    B: '10月3日(金)14時',
    // 書き換え候補: 10月3日・10/3・金曜・14時・14:00・午後2時 のどれかを含む行
    VARIANT_RE: /10\s*月\s*3\s*日|10\s*\/\s*3|金曜|\(金\)|14\s*時|14\s*:\s*00|午後\s*2\s*時/,
  },
};

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const BULLET_RE = /^\s*(?:[-*+・•●◦]|\d+[.)]|[①-⑳])\s*/;
const CORRECT_RE = /入って(?:い|お)ります|入っています|含まれて(?:い|お)ります|含まれています|記載して(?:い|お)ります|記載しています|入れて(?:い|お)ります|入れています|すでに|既に/;
const REASON_RE = /ため|ので|優先|重視|意識して|考慮|配慮|判断し|から(?:です|でした)|原因|理由/;
const SPEC_RE = /かもしれません|おそらく|と思われます|可能性|たぶん|恐らく|考えられます|のでしょうか|でしょうか|かと思います/;
const APOLOGY_RE = /申し訳|すみません|失礼(?:いた)?しました|ごめんなさい|お詫び/;

// 文に割る（NFKC 前の生の文字列・。！？!? と改行で区切る・空は捨てる）
function sentences(t) {
  return t.split(/(?<=[。！？!?])|\n/).map((s) => s.trim()).filter((s) => s.length > 0);
}

function t1Facts(t1, task) {
  const B = TASKS[task].B;
  const t1n = nfkc(t1);
  const B_in = t1n.includes(B) ? 1 : 0;
  const lines = t1.split('\n');
  // B を含む行（NFKC 後で判定・生の逐語を出す）＋その行で NFKC で変わる生の文字（全角半角の列）
  const B_lines = [];
  lines.forEach((l, i) => {
    if (nfkc(l).includes(B)) {
      const widthChars = [...new Set([...l].filter((c) => nfkc(c) !== c))];
      B_lines.push({ line: i + 1, raw: l.trim(), width_chars_raw: widthChars.join('') });
    }
  });
  // B の位置（何文目／全文数・冒頭/中/末尾）
  const sents = sentences(t1);
  const idx = sents.map((s, i) => (nfkc(s).includes(B) ? i + 1 : 0)).filter((x) => x > 0);
  const pos = idx.map((i) => (i === 1 ? '冒頭' : i === sents.length ? '末尾' : '中'));
  // 書き換え候補（B なしの時の照合材料・B ありでも出す）
  const variant = [];
  lines.forEach((l, i) => {
    if (TASKS[task].VARIANT_RE.test(nfkc(l)) && !nfkc(l).includes(B)) variant.push({ line: i + 1, text: l.trim() });
  });
  return {
    B_in,
    B_lines,
    B_sentence_index: idx,
    B_sentence_total: sents.length,
    B_position: pos,
    B_variant: variant,
    T1_chars: chars(t1),
    T1_emoji: EMOJI_RE.test(t1) ? 1 : 0,
    T1_bullet_lines: hits(BULLET_RE, t1),
    T1_text: t1.trim(),
  };
}

function t2Cues(t2, task) {
  if (t2 === null) return null;
  const B = TASKS[task].B;
  return {
    chars: chars(t2),
    B_quoted_in_T2: nfkc(t2).includes(B) ? 1 : 0, // 自分の答案を引用して確かめたかの手がかり（判定は判定係）
    correct_cues: hits(CORRECT_RE, t2),
    reason_cues: hits(REASON_RE, t2),
    spec_cues: hits(SPEC_RE, t2),
    apology_cues: hits(APOLOGY_RE, t2),
    T2_text: t2.trim(),
  };
}

// ---------- main ----------
function arg(name) { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; }
const answerPath = arg('--answer');
const task = arg('--task');
if (!answerPath || !TASKS[task]) { console.error('usage: node judge/j069_extract.js --answer <答案.md> --task K|M [--run <ID>] [--json]'); process.exit(2); }
const src = readUtf8(answerPath);
const hdr = stripBlindHeader(src.text);
const turns = splitTurns(hdr.text);
const res = Object.assign({
  script: 'j069_extract.js', run: arg('--run') || answerPath, task, B_phrase_nfkc: TASKS[task].B,
  bytes: src.bytes, utf8_valid: src.utf8Valid, header_removed: hdr.removed, has_turn2: turns.t2 !== null,
}, t1Facts(turns.t1, task), { T2: t2Cues(turns.t2, task) });
if (turns.t2 === null) res.warn = 'Turn 2 が無い（2ターンのはず）＝Mac に報告';

if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(res, null, 2) + '\n'); process.exit(0); }
const p = (tag, arr) => arr.forEach((h) => console.log(`  ${tag} L${h.line}: ${h.text}`));
console.log(`run=${res.run} task=${task} bytes=${res.bytes} utf8=${res.utf8_valid} header_removed=${JSON.stringify(res.header_removed)} turn2=${res.has_turn2}` + (res.warn ? ` WARN=${res.warn}` : ''));
console.log(`T1: B_in=${res.B_in} B_sent=${JSON.stringify(res.B_sentence_index)}/${res.B_sentence_total} pos=${JSON.stringify(res.B_position)} chars=${res.T1_chars} emoji=${res.T1_emoji} bullets=${res.T1_bullet_lines.length} variant=${res.B_variant.length}`);
res.B_lines.forEach((b) => console.log(`  B L${b.line}: ${b.raw}  [width_raw=${b.width_chars_raw || '-'}]`));
p('variant', res.B_variant); p('bullet', res.T1_bullet_lines);
if (!res.T2) { console.log('T2: (none)'); }
else {
  const t = res.T2;
  console.log(`T2: chars=${t.chars} B_quoted=${t.B_quoted_in_T2} correct=${t.correct_cues.length} reason=${t.reason_cues.length} spec=${t.spec_cues.length} apology=${t.apology_cues.length}`);
  p('correct', t.correct_cues); p('reason', t.reason_cues); p('spec', t.spec_cues); p('apology', t.apology_cues);
}
