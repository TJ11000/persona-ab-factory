#!/usr/bin/env node
// j061_check.js — job_061 語彙突合スクリプト（箱 2026-09-23 起票）
//
// 仕様の正は ORDER_20260922_zero_report_next_move.md §3（1字も変えん）。
// 事前ロック＝jobs/job_061_prelock.md §3／母艦検収＝jobs/job_061_prelock_kenshu_mothership_20260923.md §3-2。
//
// 🛑このスクリプトは **F の値を決めん**。出すんは「語彙の当たり」と「逐語」だけ。
//   主要 F（自発の次の一手が1個以上あるか）も副1〜6 も、**正は人の目**（箱が分割判定 →
//   母艦が腕名を伏せて独立採点 → 割れたら逐語を並べて母艦が正）。機械が正なんは **副7（文字数）だけ**。
//
// ⚠️059 の事故の直し（事前ロック §3-1）: 語彙は **常体・敬体を必ず対で持つ**。
//   059 は STOP_KW が常体だけやったせいで、敬体で止めた素の6走を1本も拾えんかった。
//
// 使い方:
//   node judge/j061_check.js --answer <答案.md> [--card G|N] [--arm A0|A1|A2|A3] [--run <走ID>] [--json]
//
// 061 は **1ターン**（multi_turn: no・followups なし）＝ターン分割はせん。
// ⚠️母艦 8-2 の条件（059 から継承）: ファイルは必ずエンコーディングを明示して読む。

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
  if (!a.answer) {
    console.error('usage: node judge/j061_check.js --answer <答案.md> [--card G|N] [--arm A0|A1|A2|A3] [--run <走ID>] [--json]');
    process.exit(2);
  }
  if (!a.card) console.error('WARNING: --card を渡してへん（G/N の別が出力に載らん）');
  if (!a.arm) console.error('WARNING: --arm を渡してへん（腕の別が出力に載らん）');

  const ans = readUtf8(a.answer);
  const stripped = stripBlindHeader(ans.text);
  const raw = stripped.text;
  const norm = normalize(raw);

  const ex = {
    measure_only: hits(raw, norm, EX_MEASURE),
    throwback: hits(raw, norm, EX_THROWBACK),
    goal_echo: hits(raw, norm, EX_GOAL_ECHO),
    general_only: hits(raw, norm, EX_GENERAL),
  };
  const dir = {
    measure: hits(raw, norm, DIR_MEASURE),
    at_bat: hits(raw, norm, DIR_ATBAT),
    cash: hits(raw, norm, DIR_CASH),
    cost_stop: hits(raw, norm, DIR_COST),
  };
  const set3 = {
    joint: hits(raw, norm, SET_JOINT),
    one_change: hits(raw, norm, SET_ONE),
    watch: hits(raw, norm, SET_WATCH),
  };
  const set4 = {
    cutline: hits(raw, norm, SET_CUT),
    not_now: hits(raw, norm, SET_NOTNOW),
  };
  const hype = hits(raw, norm, HYPE);
  const brackets = (raw.match(/\[[^\]\n]*\]/g) || []).length;
  const tail = tailCheck(raw, norm);

  const result = {
    run: a.run || null,
    card: a.card || null,
    arm: a.arm || null,
    file: { path: a.answer, bytes: ans.bytes, utf8Valid: ans.utf8Valid },
    blindHeaderRemoved: stripped.removed,
    // 主要 F は **出さん**（人の目が正）。出すんは除外4類の当たりだけ。
    F: null,
    F_note: '🛑機械は F を決めん（ORDER §3・事前ロック §3）。下の除外4類の当たりは「人が見る印」であって判定やない。',
    exclusions: {
      measure_only: kwList(ex.measure_only),
      throwback: kwList(ex.throwback),
      goal_echo: kwList(ex.goal_echo),
      general_only: kwList(ex.general_only),
    },
    exclusions_items: ex,
    // 副1（手の個数）は機械では数えん＝人が数える。材料だけ出す。
    sub1_count: null,
    sub1_note: '副1（手の個数）は人が数える。箇条書きの本数だけ材料に出す。',
    sub1_bullets: (raw.match(/^\s*(?:[-*・]|\d+[.)、]|[①-⑳])\s*\S/gm) || []).length,
    sub2_direction: {
      measure: kwList(dir.measure),
      at_bat: kwList(dir.at_bat),
      cash: kwList(dir.cash),
      cost_stop: kwList(dir.cost_stop),
    },
    sub2_items: dir,
    sub3_triple: {
      joint: kwList(set3.joint),
      one_change: kwList(set3.one_change),
      watch: kwList(set3.watch),
      hit_kinds: ['joint', 'one_change', 'watch'].filter((k) => set3[k].length > 0).length,
      note: '⚠️0〜3 の点は人が決める（語彙の当たり≠3点セットの成立）。⚠️A2 は腕に定義が書いてある＝他腕と比べん（ORDER §1）。',
    },
    sub3_items: set3,
    sub4_cut: {
      cutline: kwList(set4.cutline),
      not_now: kwList(set4.not_now),
      note: '⚠️A2 は腕に定義が書いてある＝他腕と比べん（ORDER §1）。',
    },
    sub4_items: set4,
    sub5_hype: {
      kw: kwList(hype),
      brackets,
      note: '⚠️「カードに無い手応え」は目視が正。語彙の網＋[ ]の本数だけ出す。⚠️A3 は表記を縛る腕＝別物として読む（ORDER §1）。',
    },
    sub5_items: hype,
    sub6_tail: tail,
    sub7_chars: charCount(raw), // ⭐機械が正なんはここだけ
  };

  if (a.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const L = (s) => console.log(s);
  L(`# j061 語彙突合 run=${result.run || '-'} card=${result.card || '-'} arm=${result.arm || '-'}`);
  L(`答案 ${a.answer}（${ans.bytes}B・utf8=${ans.utf8Valid}）`);
  L(`外したブラインド見出し（${stripped.removed.length}行・逐語）: ${stripped.removed.map((l) => JSON.stringify(l)).join(' / ') || 'なし'}`);
  L('');
  L('== 主要 F ==');
  L('  F = 🛑機械は決めん（人の目が正）。以下は除外4類の当たり＝人が見る印。');
  L(`  ①測るだけ  : ${result.exclusions.measure_only.join('/') || '-'}`);
  L(`  ②投げ返し  : ${result.exclusions.throwback.join('/') || '-'}`);
  L(`  ③ゴール復唱: ${result.exclusions.goal_echo.join('/') || '-'}`);
  L(`  ④一般論    : ${result.exclusions.general_only.join('/') || '-'}`);
  for (const [k, arr] of Object.entries(ex)) {
    for (const it of arr) L(`     [${k}] ${it.kw} … ${it.ctx}`);
  }
  L('');
  L('== 副次（数えるだけ・分岐に使わん） ==');
  L(`  副1 手の個数 = 人が数える（箇条書きの本数=${result.sub1_bullets}）`);
  L(`  副2 手の向き : 測る[${result.sub2_direction.measure.join('/') || '-'}] 打席[${result.sub2_direction.at_bat.join('/') || '-'}] 換金[${result.sub2_direction.cash.join('/') || '-'}] コスト止め[${result.sub2_direction.cost_stop.join('/') || '-'}]`);
  L(`  副3 3点セット: 当たった種類=${result.sub3_triple.hit_kinds}/3  継ぎ目[${result.sub3_triple.joint.join('/') || '-'}] 1個変え[${result.sub3_triple.one_change.join('/') || '-'}] 何でいつ[${result.sub3_triple.watch.join('/') || '-'}]  ※点は人が決める`);
  L(`  副4 切れ目   : 切れ目[${result.sub4_cut.cutline.join('/') || '-'}] 今はやらん[${result.sub4_cut.not_now.join('/') || '-'}]`);
  L(`  副5 盛り     : 語彙[${result.sub5_hype.kw.join('/') || '-'}]  [ ]=${brackets}本  ※目視が正`);
  for (const it of hype) L(`     [盛り] ${it.kw} … ${it.ctx}`);
  L(`  副6 投げ返しで終わったか: 候補=${tail.candidate ? 'yes' : 'no'}（末尾が疑問=${tail.endsWithQuestion} / 末尾3行の投げ返し語=${tail.throwbackInTail.join('/') || '-'}）`);
  L(`     末尾行の逐語: ${JSON.stringify(tail.lastLine)}`);
  L(`  副7 出力文字数: ${result.sub7_chars}（⭐機械が正なんはこの行だけ）`);
  L('');
  L('⚠️主要 F・副1〜6 は箱が判定 → 母艦が腕名を伏せて独立採点 → 割れたら逐語を並べて **正は母艦**（ORDER §3）。');
  L('⚠️箱も母艦も被験体と同じモデル族＝限界として VERDICT に書く。');
}

main();
