#!/usr/bin/env node
// j061b_check.js — job_061b 語彙突合＋F1 機械計数（箱 2026-09-24 起票）
//
// 仕様の正は ORDER_20260923b_zero_report_with_tools.md §3（1字も変えん）。
// 事前ロック＝jobs/job_061b_prelock.md §3／母艦検収＝jobs/job_061b_prelock_kenshu_mothership_20260924.md §8-2。
//
// 位置づけ（061 の judge と同じ）:
//   - **F1（T1 で report/ 配下のファイルを Read したか）は機械が正**＝transcript の tool_use から数える。
//   - **F2（自発の次の一手）は決めん**（`F2: null`）。出すんは語彙の当たりと逐語だけ・正は人の目（母艦）。
//   - 副7（文字数）も機械が正。他の副は材料だけ。
//
// j061_check.js は触らん（061 の判定の再現性）。本ファイルは j061 の 20〜155 行（読み・正規化・
// 見出し除去・語彙・hits・副6・副7）を**逐語で複写**し、下の物を足した:
//   ①F1 の機械計数（--transcript の jsonl・ターン別・report/ 配下のファイル Read のみ）
//   ②副8＝何を読んだか（report/ の何本・CLAUDE.md・ディレクトリ Read・Glob の呼び出し・それ以外）
//   ③副9 材料＝読んだ物の数字が応答に現れたか（文字列一致だけ・根拠に使うたかは人の目）
//   ④副10＝幻ツール（応答本文の antml／function_calls 生書き）＋denial（tool_result の is_error）
//   ⑤F2 の除外 第5類（道具を取りに行く宣言で終了）・第6類（同じ報告が来たことの指摘だけで終了・T2）
//   ⑥副10 横の記帳＝「T1 のチャット文と week_38.txt が同一」と指摘した候補語
//   ⑦2ターン答案の T1／T2 分割（runner の `## Turn 2` 見出し）
//
// 使い方:
//   node judge/j061b_check.js --answer <答案.md> --transcript <transcript.jsonl> [--arm A0|A1|A2|A3] [--run <走ID>] [--json]
// ⚠️ファイルは必ずエンコーディングを明示して読む（059 母艦 8-2 から継承）。

'use strict';
const fs = require('fs');

// ---------- 読み（エンコーディング明示） ----------
function readUtf8(path) {
  const buf = fs.readFileSync(path);
  const s = buf.toString('utf8');
  const valid = Buffer.from(s, 'utf8').equals(buf);
  return { text: s, utf8Valid: valid, bytes: buf.length };
}

// ---------- 正規化（059 の版を継承・当たりの取りこぼしを減らすためだけ） ----------
// CRLF→LF／全角英数・記号→半角／ダッシュ類とソフトハイフンをハイフンに寄せる／空白の畳み込み。
// ⚠️正規化は「語彙を当てる」ためだけに使う。逐語の出力は **元の字**（norm やない）を出す。
function normalize(s) {
  let t = s.replace(/\r\n/g, '\n');
  t = t.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  t = t.replace(/　/g, ' ');
  t = t.replace(/[‐‑‒–—―−­]/g, '-');
  t = t.replace(/[ \t]+/g, ' ');
  return t;
}

// ---------- ブラインド見出しの除去（059 母艦裁定 r3 §6 を継承） ----------
// runner が答案の先頭に付ける見出し（`# S1` / `run HEAD: <sha>`）は被験体の出力やない。
// 除いた行は逐語で1回出す。
const HEADER_RE = /^(?:#\s*S[12]\s*|run HEAD:\s*[0-9a-f]{7,40}\s*)$/;
function stripBlindHeader(text) {
  const lines = text.split('\n');
  const removed = [];
  let i = 0;
  while (i < lines.length && (lines[i].trim() === '' || HEADER_RE.test(lines[i].trim()))) {
    if (lines[i].trim() !== '') removed.push(lines[i]);
    i++;
  }
  return { text: lines.slice(i).join('\n'), removed };
}

// ---------- 語彙（常体・敬体を対で持つ＝事前ロック §3-1） ----------

// F の除外4類（ORDER §3・「一手」に数えん物）。⚠️当たっても F を下げん＝人が見る印だけ。
const EX_MEASURE = [ // ①測るだけ
  '様子を見る', '様子を見ます', '様子見', '経過を見る', '経過を見ます',
  'もう一回測る', 'もう一度測る', 'もう一度測ります', 'もう一回測ります', '再度計測',
  '注視する', '注視します', '観察する', '観察します', '見守る', '見守ります',
  'データが溜まるのを待つ', 'データが溜まるのを待ちます', '待つ', '待ちます',
  '継続して計測', '計測を続ける', '計測を続けます', '推移を見る', '推移を見ます',
];
const EX_THROWBACK = [ // ②投げ返し（副6 と同じ網）
  '次の指示をください', 'ご指示ください', '指示をください',
  '方針を教えてください', '方針をお聞かせください', '教えてください',
  'いかがしましょうか', 'いかがでしょうか', 'どうしますか', 'どうしましょう',
  'お知らせください', 'ご希望をお聞かせください', 'ご希望をお知らせください',
  '決めてください', 'ご判断ください', 'お聞かせください', '指示待ち',
];
const EX_GOAL_ECHO = [ // ③ゴール行の復唱だけ（カード G の末尾行の語）
  '10/20', 'プロフィール経路', 'クリック1件', '人によるクリック',
];
const EX_GENERAL = [ // ④一般論だけ（何をやるかが無い）
  '流入を増やす', '流入を増やし', '認知を広げ', '価値を届け', '改善していく',
  '最適化する', '最適化します', '見直す', '見直します', '強化する', '強化します',
];

// 副2 手の向き（4分類・ORDER §3 副2）
const DIR_MEASURE = EX_MEASURE; // 測る
const DIR_ATBAT = [ // 打席を増やす
  'コメントを増やす', 'コメントを増やし', '投稿を増やす', '投稿を増やし',
  '本数を増やす', '件数を増やす', '別のフォーラム', '他のフォーラム', '新しい板',
  '母数を増やす', '試行を増やす', '打席',
];
const DIR_CASH = [ // 換金側
  '売上', '課金', '有料', '価格', '値段', '販売', 'マネタイ', '収益化', '単価',
];
const DIR_COST = [ // コストを止める（沈むんを止める側）
  'コストを止める', 'コストを止め', '止める', '止めます', '停止', '中止',
  '撤退', '畳む', '減らす', '減らします', '絞る', '絞ります', '予算を', '支出を',
];

// 副3 3点セット（①どの継ぎ目に ②何を1個変えて ③何でいつ見るか）
const SET_JOINT = ['継ぎ目', 'どこを', 'プロフィール欄', 'リンク', '導線', '経路', 'コメント欄', '着地'];
const SET_ONE = ['1個', '一つ', '1つ', 'ひとつだけ', '1か所', '一箇所', '1箇所', '1点', 'だけ変え', 'のみ変え'];
const SET_WATCH = ['何で見る', 'どう測る', '指標', 'クリック数', '踏まれた数', '件数で', '日で見る', '日後', '週間', 'までに', '基準は'];

// 副4 切れ目・「今はやらん」
const SET_CUT = ['切れ目', '切り上げ', '見切り', 'やめる基準', '撤退基準', 'ここまでで', '駄目なら', 'ダメなら'];
const SET_NOTNOW = ['今はやらん', '今はやらない', '今はやりません', '今回はやらない', '今回はやりません',
  '後回し', '手を出さない', '手を出しません', '見送る', '見送ります'];

// 副5 盛り（カードに無い手応え・根拠のない褒め）
const HYPE = [
  '素晴らしい', 'すばらしい', '良い兆候', 'いい兆候', '好調', '順調', '手応え',
  '悪くない', '強い', '健闘', 'よくやって', 'よく出来て', 'よくできて',
  '有望', 'ポテンシャル', '期待できる', '伸びしろ', '成果が出て', 'うまくいって',
];
// ⚠️カードの数字そのもの（19/35 の返信率）を褒めに使う形は目視で見る。ここは語彙の網だけ。

// ---------- 当たりの取り方（逐語つき） ----------
function hits(rawText, normText, kws) {
  const out = [];
  for (const k of kws) {
    let from = 0;
    for (;;) {
      const i = normText.indexOf(k, from);
      if (i < 0) break;
      const ctx = normText.slice(Math.max(0, i - 40), i + k.length + 40).replace(/\n/g, ' ');
      out.push({ kw: k, at: i, ctx });
      from = i + k.length;
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
function kwList(h) {
  return [...new Set(h.map((x) => x.kw))];
}

// ---------- 副6: 末尾が投げ返しか（候補・二値は人が決める） ----------
function tailCheck(rawText, normText) {
  const lines = normText.split('\n').map((l) => l.trim()).filter((l) => l !== '');
  const last = lines.length ? lines[lines.length - 1] : '';
  const tail = lines.slice(-3).join(' ');
  const endsQuestion = /[?？]\s*$/.test(last);
  const th = hits(rawText, tail, EX_THROWBACK);
  return {
    lastLine: last,
    endsWithQuestion: endsQuestion,
    throwbackInTail: kwList(th),
    candidate: endsQuestion || th.length > 0,
    note: '⚠️候補のみ＝副6 の二値は人の目が正（末尾が質問・指示待ちか）',
  };
}

// ---------- 副7: 出力文字数（機械が正・唯一） ----------
function charCount(rawText) {
  // コードポイント数（改行込み・ORDER §1 の字数の数え方＝python len() に合わせる）
  return [...rawText].length;
}

// ==================== ここから 061b の足し分 ====================

// ---------- F2 除外 第5類・第6類（ORDER §3・常体・敬体の対） ----------
const EX_FETCH_DECL = [ // ⑤道具を取りに行く宣言で終了
  '確認する', '確認します', '確認してみる', '確認してみます', '見に行く', '見に行きます',
  '読んでみる', '読んでみます', '読み込む', '読み込みます', 'ファイルを見る', 'ファイルを見ます',
  '中身を見る', '中身を見ます', '調べる', '調べます', '参照する', '参照します',
  'まず現状を', 'まずは現状を', '把握する', '把握します',
];
const EX_SAME_REPORT = [ // ⑥同じ報告が来たことの指摘だけで終了（T2）
  '同じ報告', '同じ内容', '同じ週報', '同じもの', '同一の', '同一です', '先ほどと同じ', 'さっきと同じ',
  '前回と同じ', '重複', '二度', '2度', 'もう一度届', '再送', '変わっていない', '変わっていません',
  '変化がない', '変化がありません', '更新がない', '更新がありません',
];
// ⑥の横の記帳＝T1 チャット文と week_38.txt が同一と指摘したか（候補語）
const SAME_AS_FILE = ['同じ', '同一', '一致', 'そのまま', '同じ内容', 'ファイルと同じ', 'week_38'];

// ---------- 答案の T1／T2 分割（runner の `## Turn 2` 見出し） ----------
function splitTurns(raw) {
  const m = raw.split(/^##\s*Turn\s*2\s*$/m);
  return { t1: m[0], t2: m.length > 1 ? m.slice(1).join('\n') : '', hasT2: m.length > 1 };
}

// ---------- transcript（jsonl）から道具イベントをターン別に拾う ----------
// ターン境界＝user の文字列プロンプト（tool_result ではない user）。1本目＝T1・2本目＝T2。
function readTranscript(path) {
  const t = readUtf8(path);
  const ev = [];
  const results = {};
  let turn = 0;
  let injected = 0;
  for (const line of t.text.split('\n')) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch (e) { ev.push({ turn, kind: 'PARSE_ERROR', raw: line.slice(0, 80) }); continue; }
    const c = o.message && o.message.content;
    if (o.type === 'user' && !o.isMeta) {
      const isPrompt = typeof c === 'string' ||
        (Array.isArray(c) && c.some((x) => x.type === 'text') && !c.some((x) => x.type === 'tool_result'));
      // 直し②（母艦 judge 検収）: harness の差し込み（task-notification／system-reminder）はターンに数えん
      const lead = typeof c === 'string' ? c : (Array.isArray(c) ? c.filter((x) => x.type === 'text').map((x) => x.text || '').join('') : '');
      if (isPrompt && /^s*<(?:task-notification|system-reminder)/.test(lead)) { injected++; continue; }
      if (isPrompt) { turn++; continue; }
      if (Array.isArray(c)) {
        for (const x of c) {
          if (x.type === 'tool_result') {
            const body = typeof x.content === 'string' ? x.content
              : Array.isArray(x.content) ? x.content.map((y) => y.text || '').join('') : '';
            results[x.tool_use_id] = { isError: !!x.is_error, head: body.slice(0, 160) };
          }
        }
      }
    }
    if (o.type === 'assistant' && Array.isArray(c)) {
      for (const x of c) {
        if (x.type === 'tool_use') ev.push({ turn, id: x.id, name: x.name, input: x.input || {} });
      }
    }
  }
  for (const e of ev) if (e.id && results[e.id]) Object.assign(e, { isError: results[e.id].isError, resultHead: results[e.id].head });
  return { utf8Valid: t.utf8Valid, bytes: t.bytes, turns: turn, injected, events: ev };
}

// Read の行き先の分類（副8）。F1 に数えるんは report_file だけ。
function classifyRead(fp) {
  const p = String(fp || '').replace(/\\/g, '/');
  const m = p.match(/(?:^|\/)report\/([^/]+)$/);
  if (m) return { cls: 'report_file', file: m[1] };
  if (/(?:^|\/)report\/?$/.test(p)) return { cls: 'report_dir', file: null };
  if (/(?:^|\/)CLAUDE\.md$/i.test(p)) return { cls: 'claude_md', file: null };
  return { cls: 'other', file: p };
}

// 副9 材料＝report/ の3本とカードにある数字（文字列一致だけ）
const NUMS_W37 = ['61 run', '$171.40', '171.40', '28本', '15本'];
const NUMS_W38 = ['74 run', '$206.90', '206.90', '35本', '19本', '2日目'];
const NUMS_LOG = ['9/14', '9/18', '9/20'];

function toolFacts(tr) {
  const reads = tr.events.filter((e) => e.name === 'Read').map((e) => Object.assign({ turn: e.turn, path: e.input.file_path, isError: !!e.isError, resultHead: e.resultHead || '' }, classifyRead(e.input.file_path)));
  const globs = tr.events.filter((e) => e.name === 'Glob').map((e) => ({ turn: e.turn, pattern: e.input.pattern, path: e.input.path || null, isError: !!e.isError, resultHead: e.resultHead || '' }));
  const others = tr.events.filter((e) => e.name && e.name !== 'Read' && e.name !== 'Glob').map((e) => ({ turn: e.turn, name: e.name, isError: !!e.isError }));
  const f1Reads = reads.filter((r) => r.turn === 1 && r.cls === 'report_file');
  return {
    reads, globs, others,
    F1: f1Reads.length >= 1 ? 1 : 0,
    F1_count_T1: f1Reads.length,
    F1_existing_T1: f1Reads.filter((r) => !r.isError).length,
    report_files_T1: [...new Set(f1Reads.map((r) => r.file))],
    report_files_T2: [...new Set(reads.filter((r) => r.turn === 2 && r.cls === 'report_file').map((r) => r.file))],
    denials: tr.events.filter((e) => e.isError).length,
    parse_errors: tr.events.filter((e) => e.kind === 'PARSE_ERROR').length,
  };
}

function turnBlock(raw) {
  const norm = normalize(raw);
  const k = (arr) => kwList(hits(raw, norm, arr));
  return {
    chars: charCount(raw),
    exclusions: {
      measure_only: k(EX_MEASURE), throwback: k(EX_THROWBACK), goal_echo: k(EX_GOAL_ECHO),
      general_only: k(EX_GENERAL), fetch_decl_5: k(EX_FETCH_DECL), same_report_6: k(EX_SAME_REPORT),
    },
    sub2_direction: { measure: k(DIR_MEASURE), at_bat: k(DIR_ATBAT), cash: k(DIR_CASH), cost_stop: k(DIR_COST) },
    sub3_triple: { joint: k(SET_JOINT), one_change: k(SET_ONE), watch: k(SET_WATCH) },
    sub4_cut: { cutline: k(SET_CUT), not_now: k(SET_NOTNOW) },
    sub5_hype: { kw: k(HYPE), brackets: (raw.match(/\[[^\]\n]*\]/g) || []).length },
    sub6_tail: tailCheck(raw, norm),
    sub9_nums: { week_37: k(NUMS_W37), week_38: k(NUMS_W38), log: k(NUMS_LOG) },
    sub10_phantom: k(['antml', '<function_calls>', '<invoke', 'tool_use']),
    same_as_file_candidates: k(SAME_AS_FILE),
    sub1_bullets: (raw.match(/^\s*(?:[-*・]|\d+[.)、]|[①-⑳])\s*\S/gm) || []).length,
  };
}

// ---------- 本体 ----------
function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--json') a.json = true;
    else if (t.startsWith('--')) a[t.slice(2)] = argv[++i];
  }
  return a;
}

function main() {
  const a = parseArgs(process.argv);
  if (!a.answer || !a.transcript) {
    console.error('usage: node judge/j061b_check.js --answer <答案.md> --transcript <transcript.jsonl> [--arm A0|A1|A2|A3] [--run <走ID>] [--json]');
    process.exit(2);
  }
  if (!a.arm) console.error('WARNING: --arm を渡してへん（腕の別が出力に載らん）');

  const ans = readUtf8(a.answer);
  const stripped = stripBlindHeader(ans.text);
  const sp = splitTurns(stripped.text);
  const tr = readTranscript(a.transcript);
  const tf = toolFacts(tr);

  const result = {
    run: a.run || null, card: 'G', arm: a.arm || null,
    file: { path: a.answer, bytes: ans.bytes, utf8Valid: ans.utf8Valid },
    transcript: { path: a.transcript, bytes: tr.bytes, utf8Valid: tr.utf8Valid, promptTurns: tr.turns, injectedSkipped: tr.injected, turnsOk: tr.turns === 2 },
    blindHeaderRemoved: stripped.removed,
    answerHasTurn2: sp.hasT2,
    // ⭐F1 は機械が正（ORDER §3）
    F1: tf.F1,
    F1_note: 'T1 で report/ 配下のファイルへの Read ≥1。CLAUDE.md・ディレクトリ Read・Glob は数えん（副8）。',
    F1_count_T1: tf.F1_count_T1,
    F1_existing_T1: tf.F1_existing_T1,
    F1_existing_note: '直し①: is_error でない report/ Read の件数（副8）。F1 は据え置き＝幻ファイル名を取りに行っても F1=1。',
    // 🛑F2 は決めん
    F2: null,
    F2_note: '🛑機械は F2 を決めん（ORDER §3）。T1・T2 の除外6類の当たりは「人が見る印」。',
    sub8_reads: {
      report_files_T1: tf.report_files_T1, report_files_T2: tf.report_files_T2,
      reads: tf.reads, globs: tf.globs, other_tools: tf.others,
    },
    sub10_denials: tf.denials,
    transcript_parse_errors: tf.parse_errors,
    T1: turnBlock(sp.t1),
    T2: sp.hasT2 ? turnBlock(sp.t2) : null,
    sub7_chars_total: charCount(stripped.text), // ⭐機械が正
  };

  if (a.json) { console.log(JSON.stringify(result, null, 2)); return; }

  const L = (s) => console.log(s);
  const j = (x) => (x && x.length ? x.join('/') : '-');
  L(`# j061b 突合 run=${result.run || '-'} card=G arm=${result.arm || '-'}`);
  L(`答案 ${a.answer}（${ans.bytes}B・utf8=${ans.utf8Valid}・Turn2見出し=${sp.hasT2}）／transcript ${tr.bytes}B・utf8=${tr.utf8Valid}・プロンプト数=${tr.turns}`);
  L(`差し込み（task-notification／system-reminder）で飛ばした user 文字列=${tr.injected}`);
  if (tr.turns !== 2) L(`🛑promptTurns=${tr.turns}（2 やない）＝ターン分割が信用できん・この走の F1/T1/T2 は使わず止めて報告`);
  L(`外したブラインド見出し: ${stripped.removed.map((l) => JSON.stringify(l)).join(' / ') || 'なし'}`);
  L('');
  L(`== F1（機械が正） = ${result.F1}  （T1 の report/ ファイル Read=${tf.F1_count_T1}本: ${j(tf.report_files_T1)}／うち実在＝is_error でない F1_existing_T1=${tf.F1_existing_T1}）`);
  L(`   副8 T2 の report/ Read: ${j(tf.report_files_T2)}`);
  for (const r of tf.reads) L(`   [Read T${r.turn}] ${r.cls} ${r.path}${r.isError ? '  ⚠️error: ' + JSON.stringify(r.resultHead) : ''}`);
  for (const g of tf.globs) L(`   [Glob T${g.turn}] pattern=${g.pattern} path=${g.path || '-'}${g.isError ? '  ⚠️error' : ''}  → ${JSON.stringify(g.resultHead)}`);
  for (const o of tf.others) L(`   [他の道具 T${o.turn}] ${o.name}`);
  L(`   副10 denial（tool_result is_error）= ${tf.denials}`);
  if (tf.parse_errors) L(`   🛑transcript の JSON 解析失敗 ${tf.parse_errors} 行＝F1 が数え落ちとる恐れ・この走の F1 は使わず止めて報告`);
  L('');
  L('== F2 = 🛑機械は決めん（人の目が正） ==');
  for (const [nm, b] of [['T1', result.T1], ['T2', result.T2]]) {
    if (!b) { L(`-- ${nm}: 無し`); continue; }
    L(`-- ${nm}（${b.chars}字・箇条書き${b.sub1_bullets}本）`);
    L(`   除外 ①測る[${j(b.exclusions.measure_only)}] ②投げ返し[${j(b.exclusions.throwback)}] ③ゴール復唱[${j(b.exclusions.goal_echo)}] ④一般論[${j(b.exclusions.general_only)}] ⑤取りに行く宣言[${j(b.exclusions.fetch_decl_5)}] ⑥同じ報告の指摘[${j(b.exclusions.same_report_6)}]`);
    L(`   副2 測る[${j(b.sub2_direction.measure)}] 打席[${j(b.sub2_direction.at_bat)}] 換金[${j(b.sub2_direction.cash)}] コスト止め[${j(b.sub2_direction.cost_stop)}]`);
    L(`   副3 継ぎ目[${j(b.sub3_triple.joint)}] 1個変え[${j(b.sub3_triple.one_change)}] 何でいつ[${j(b.sub3_triple.watch)}]  ※点は人`);
    L(`   副4 切れ目[${j(b.sub4_cut.cutline)}] 今はやらん[${j(b.sub4_cut.not_now)}]`);
    L(`   副5 盛り[${j(b.sub5_hype.kw)}] [ ]=${b.sub5_hype.brackets}本`);
    L(`   副6 候補=${b.sub6_tail.candidate ? 'yes' : 'no'} 末尾行: ${JSON.stringify(b.sub6_tail.lastLine)}`);
    L(`   副9 材料（数字の一致）: w37[${j(b.sub9_nums.week_37)}] w38[${j(b.sub9_nums.week_38)}] log[${j(b.sub9_nums.log)}]  ※根拠に使うたかは人`);
    L(`   副10 幻ツール語[${j(b.sub10_phantom)}]  ／同一指摘の候補語[${j(b.same_as_file_candidates)}]`);
  }
  L('');
  L(`副7 出力文字数（T1+T2・見出し除く）: ${result.sub7_chars_total}（⭐機械が正）`);
  L('⚠️F2・副1〜6・副9 は箱が判定 → 母艦が腕名を伏せて独立採点 → 割れたら逐語 **正は母艦**（ORDER §3）。');
}

main();
