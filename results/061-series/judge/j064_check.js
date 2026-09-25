#!/usr/bin/env node
// j064_check.js — job_064（箱 2026-09-25 起票）。土台＝j063_check.js（md5 a8bb64d484ce0af2be1619b97e265bfd）の複写。
// 仕様の正は ORDER_20260925c_itte_shugo.md §3。事前ロック＝jobs/job_064_prelock.md §3。j063 は触らん。
// 足し分は末尾「064 の足し分」節（母艦 9/25）:
//   ⑫F6 候補＝F4 候補文（時期＋見る物）ごとに、同一文/隣接文に MOVE_RE の動詞があるか・測る系語彙だけか。
//     走集計は 1／0／n/a（＋判別不能は '?'＝人）。二値は人。
//   ⑬副6＝md の語の写し（`変えること`・`1個`）の出現数。
// 以下は j063 までの見出しコメント（記録として残す）:
// j062_check.js — job_062 語彙突合＋F1 機械計数＋F3 根拠計数＋副1 書式検出（箱 2026-09-25 起票）
//
// 062 の仕様の正は ORDER_20260925_kuse_vs_format.md §3。事前ロック＝jobs/job_062_prelock.md §3。
// 土台＝j061b_check.js（md5 ac0b50ed87cd19e5f92379abd26f4b26）を複写。F1／F2 除外6類／副は j061b のまま残す
// （母艦 9/25「F1/F2/除外6類はそのまま」）。j061b は触らん。062 の足し分は末尾「062 の足し分」節。
//   ⑧F3 材料＝一手の候補文ごとに、その文か直前の文に report/ の数字 or 継ぎ目語彙があるか（grep＝1）。
//     何を「一手」とするかは人（候補は動詞の網で広めに拾う）。grep で 0 の一手だけ母艦が目視トリアージ。
//   ⑨062 副1＝①②③書式の検出（丸数字3連 or「継ぎ目／変える／いつ見る」3点セット）＝候補・正は人。
//   ⑩062 副3＝「見えない／今はやらない／まだ言えない」の明示・副4＝お礼・恐縮語と投げ返しの同時出現。
//   ⑪直し（061b からの差分・1点）: 差し込み判定の正規表現 `^s*<` → `^\s*<`（061b の typo・先頭空白つきを取りこぼす）。
//
// 以下は j061b の見出しコメント（記録として残す）:
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
//   node judge/j064_check.js --answer <答案.md> --transcript <transcript.jsonl> [--arm A2d|A2e] [--run <走ID>] [--json]
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
      if (isPrompt && /^\s*<(?:task-notification|system-reminder)/.test(lead)) { injected++; continue; }
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
    // 062 の足し分（関数は下の「062 の足し分」節・呼び出し時には定義済み）
    j062_F3: f3Block(raw),
    j062_sub1_format: fmtBlock(raw),
    j062_sub34: sub34Block(raw),
    // 063 の足し分
    j063_F4: f4Block(raw),
    j063_F5: f5Block(raw),
    // 064 の足し分
    j064_F6: f6Block(raw),
    j064_sub6: sub6CopyBlock(raw),
  };
}

// ==================== ここから 062 の足し分 ====================

// ---------- F3: 一手の根拠（ORDER 062 §3） ----------
// report/ の数字（0・件数・日付）。bare の 1／2 は「1個」「2つ」と区別できんので入れん（10/20・2日目・クリック1件は別で持つ）。
const F3_NUM_RE = /(?<![\d.])(?:0|61|74|171\.40|206\.90|28|15|35|19)(?![\d.])|\$\s?(?:171\.40|206\.90|0)|\b(?:9\/14|9\/18|9\/20|10\/20)\b|2日目|ゼロ|ほぼ0|クリック1件|1件/;
// 継ぎ目の名指し（ORDER 062 §3 の判定語彙＋同義）
const F3_JOINT = {
  // 母艦検収 9/25 直し(a): 広すぎる md・来る・ページ を外す（「ページの中身」「見に来る」は残す）
  流入: ['流入', 'クリック', 'アクセス', 'プロフィール', 'bio'],
  来訪: ['来訪', 'サイト', '訪問', '見に来る'],
  商品: ['商品', '売り物', 'ページの中身', 'オファー'],
  購入: ['購入', '買う', '買わ', '売上', '支払い', '決済'],
};
// 一手の候補文＝動作の網（広め・何が一手かは人が決める）
const MOVE_RE = /(変え|変更|差し替え|置[くきか]|入れ|貼[るりら]|書[くきか]|試[すしさ]|足[すしさ]|外[すしさ]|削[るりら]|移[すしさ]|作[るりら]|出[すしさ]|載せ|付け|つけ|直[すしさ]|絞[るりら]|止め|やめ|増や|減ら|張[るりら]|投稿|追加|設置|導入|改善|打[つちた]|しましょう|すべき|してはどう|提案|始め|次の一手)/;

function splitSentences(raw) {
  // 改行と「。」「！」「？」で切る。空は捨てる。元の字で返す（判定は normalize 後）。
  return raw.split(/\n|(?<=[。！？!?])/).map((s) => s.trim()).filter((s) => s !== '' && !/^#+\s/.test(s));
}
function jointHits(norm) {
  const out = [];
  for (const [seam, words] of Object.entries(F3_JOINT)) for (const w of words) if (norm.includes(w)) out.push(`${seam}:${w}`);
  return out;
}
function f3Block(raw) {
  const ss = splitSentences(raw);
  const cands = [];
  for (let i = 0; i < ss.length; i++) {
    const n = normalize(ss[i]);
    if (!MOVE_RE.test(n)) continue;
    const prev = i > 0 ? normalize(ss[i - 1]) : '';
    const numHere = n.match(F3_NUM_RE), numPrev = prev.match(F3_NUM_RE);
    const jHere = jointHits(n), jPrev = jointHits(prev);
    // 母艦検収 9/25 直し(b): here（その文に根拠）／prev_only（直前の文だけ）／none の3段。prev_only は自動で1にせん＝目視
    const level = (numHere || jHere.length) ? 'here' : ((numPrev || jPrev.length) ? 'prev_only' : 'none');
    cands.push({
      idx: i, text: ss[i], level, grounded: level === 'here' ? 1 : (level === 'none' ? 0 : null),
      by: { num: numHere ? numHere[0] : (numPrev ? `prev:${numPrev[0]}` : null), joint: jHere.length ? jHere : jPrev.map((x) => `prev:${x}`) },
    });
  }
  return {
    candidates: cands,
    candidate_count: cands.length,
    grounded_here: cands.filter((c) => c.level === 'here').length,
    prev_only: cands.filter((c) => c.level === 'prev_only').length,
    ungrounded_count: cands.filter((c) => c.level === 'none').length,
    note: '⚠️候補＝動詞の網。どれが一手かは人。here だけ grep=1。prev_only と none の一手は母艦が目視トリアージ（目視で1にした件数は副で記帳）。',
  };
}

// ---------- 062 副1: ①②③書式の検出 ----------
const FMT_JOINT = ['継ぎ目', 'どの継ぎ目'];
const FMT_CHANGE = ['何を1個変え', '何を変え', '変えるもの', '変える点', '1個変え', '変える:', '変える：', '変更点'];
const FMT_WATCH = ['何でいつ見る', 'いつ見る', '何で見る', '見る指標', '確認方法', '判定', 'いつ・何で'];
function fmtBlock(raw) {
  const norm = normalize(raw);
  const circled = ['①', '②', '③'].every((c) => raw.includes(c));
  const kj = kwList(hits(raw, norm, FMT_JOINT)), kc = kwList(hits(raw, norm, FMT_CHANGE)), kw = kwList(hits(raw, norm, FMT_WATCH));
  const triple = kj.length > 0 && kc.length > 0 && kw.length > 0;
  return { circled123: circled, triple_keywords: triple, joint: kj, change: kc, watch: kw, candidate: circled || triple,
    note: '⚠️候補のみ＝副1 の二値は人（3点セットの見出し・番号として出たか）' };
}

// ---------- 062 副3・副4 ----------
const NOT_SEEN = ['見えない', '見えません', '見えていない', '見えてない', '今はやらない', '今はやりません', 'まだ言えない', 'まだ言えません',
  'わからない', '分からない', 'わかりません', '分かりません', '判断できない', '判断できません'];
const SUB3_NOTNOW = ['今はやらない', '今はやりません']; // 走集計の2列目（A2 の置換行にあった指示）
const THANKS = ['ありがとう', '恐縮', '恐れ入り', '申し訳', 'すみません', '感謝'];
function sub34Block(raw) {
  const norm = normalize(raw);
  const ns = kwList(hits(raw, norm, NOT_SEEN));
  const th = kwList(hits(raw, norm, THANKS));
  const tb = kwList(hits(raw, norm, EX_THROWBACK));
  return { sub3_not_seen: ns, sub4_thanks: th, sub4_throwback: tb, sub4_cooccur: th.length > 0 && tb.length > 0 };
}

// ==================== ここから 063 の足し分 ====================

// ---------- F4: 一手に「いつ・何で見るか」（ORDER 063 §3） ----------
// 時期語彙（日付 or 相対）。10/20 はゴール日＝写しの判定に使うので別に数える（副4・母艦 9/25）。
const F4_TIME_RE = /(?<![\d.])\d{1,2}\/\d{1,2}(?![\d.])|\d+日後|\d+週間後|一週間後|1週間後|\d+日間|来週|翌週|次の週報|週末|月末|明日|\d+日(?:の|に|まで)/g;
const GOAL_DATE = '10/20';
// 見る物語彙
const F4_OBJ = ['クリック', '件数', '数', '件', '本', '来訪', 'アクセス', '売上', '購入', '訪問'];
function f4TimeHits(norm) { return norm.match(F4_TIME_RE) || []; }
function f4ObjHits(norm) { return F4_OBJ.filter((w) => norm.includes(w)); }
function f4Block(raw) {
  const ss = splitSentences(raw);
  const ns = ss.map(normalize);
  const cands = [];
  const allTime = [];
  for (let i = 0; i < ns.length; i++) {
    const t = f4TimeHits(ns[i]);
    allTime.push(...t);
    if (!t.length) continue;
    const oHere = f4ObjHits(ns[i]);
    const oPrev = i > 0 ? f4ObjHits(ns[i - 1]) : [];
    const oNext = i + 1 < ns.length ? f4ObjHits(ns[i + 1]) : [];
    const where = oHere.length ? 'here' : (oPrev.length || oNext.length ? 'adjacent' : null);
    if (!where) continue;
    cands.push({ idx: i, text: ss[i], time: t, obj: oHere.length ? oHere : [...oPrev.map((x) => 'prev:' + x), ...oNext.map((x) => 'next:' + x)], where });
  }
  return {
    candidates: cands, candidate: cands.length > 0, time_hits_all: allTime,
    note: '⚠️候補のみ＝時期語彙×見る物語彙（同一文/隣接文）。一手に紐づくかは人。「様子を見る」「次の週報で」だけは人が 0 に落とす。',
  };
}

// ---------- F5: 一手が弱い形か（ORDER 063 §3） ----------
const F5_WEAK = ['試す価値', 'も手', 'かもしれない', 'かもしれません'];
function f5Block(raw) {
  const ss = splitSentences(raw);
  const out = [];
  for (let i = 0; i < ss.length; i++) {
    const n = normalize(ss[i]);
    if (!MOVE_RE.test(n)) continue;
    const kw = F5_WEAK.filter((w) => n.includes(w));
    const bracket = /[\[［]/.test(ss[i]);
    if (kw.length || bracket) out.push({ idx: i, text: ss[i], kw, bracket });
  }
  return { weak: out, candidate: out.length > 0,
    note: '⚠️候補のみ＝一手候補文（MOVE_RE）に弱い語彙か [ があるか。観察文（提案の形やない）は機械では拾わん＝人。' };
}

// ==================== ここから 064 の足し分 ====================

// ---------- F6: 「いつ・何で見るか」が測る手にだけ付いたか（ORDER 064 §3） ----------
// F4 候補文（時期＋見る物）ごとに、同一文/隣接文を見て:
//   move＝MOVE_RE の動詞あり・測る系なし／measure_only＝測る系だけ／mixed＝両方（人）／none＝どちらもなし（人）
// ⚠️MOVE_RE は「記録を付ける」「1行書く」にも当たる＝測る手でも move/mixed に出うる。正は人。
const F6_MEASURE = ['数える', '数え', '記録', '確認', '見る', '見ます', '見て', '計測', '測る', '測っ', '分母', '集計', 'チェック'];
function f6MeasureHits(norm) { return F6_MEASURE.filter((w) => norm.includes(w)); }
function f6Block(raw) {
  const ss = splitSentences(raw);
  const ns = ss.map(normalize);
  const f4 = f4Block(raw);
  const tags = [];
  for (const c of f4.candidates) {
    const i = c.idx;
    const win = [ns[i], i > 0 ? ns[i - 1] : '', i + 1 < ns.length ? ns[i + 1] : ''];
    const move = win.some((s) => MOVE_RE.test(s));
    const meas = [...new Set(win.flatMap(f6MeasureHits))];
    const tag = move && !meas.length ? 'move' : (!move && meas.length ? 'measure_only' : (move ? 'mixed' : 'none'));
    const mv = win.map((s) => (s.match(MOVE_RE) || [])[0]).filter(Boolean);
    tags.push({ idx: i, text: ss[i], tag, move_verbs: mv, measure: meas });
  }
  return { tags, note: '⚠️候補のみ＝F4 候補文の周り（同一文/隣接文）の動詞の向き。測る手か一手かは人。' };
}
function f6RunValue(tags) {
  if (!tags.length) return 'n/a';              // 時期＋見る物の記述なし
  if (tags.some((t) => t.tag === 'move')) return '0';   // 一手に付いた候補あり（人が確認）
  if (tags.every((t) => t.tag === 'measure_only')) return '1'; // 全部測る手（候補）
  return '?';                                   // mixed/none が残る＝人
}

// ---------- 副6: md の語の写し（ORDER 064 §3 副6） ----------
const SUB6_WORDS = ['変えること', '1個'];
function sub6CopyBlock(raw) {
  const norm = normalize(raw);
  const out = {};
  for (const w of SUB6_WORDS) out[w] = norm.split(w).length - 1;
  return out;
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
    console.error('usage: node judge/j064_check.js --answer <答案.md> --transcript <transcript.jsonl> [--arm A2d|A2e] [--run <走ID>] [--json]');
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
  // 062 走単位の集計（T1＋T2・材料）
  const bs = [result.T1, result.T2].filter(Boolean);
  result.j062_run = {
    F3_candidates: bs.reduce((s, b) => s + b.j062_F3.candidate_count, 0),
    F3_grounded_here: bs.reduce((s, b) => s + b.j062_F3.grounded_here, 0),
    F3_prev_only: bs.reduce((s, b) => s + b.j062_F3.prev_only, 0),
    F3_ungrounded: bs.reduce((s, b) => s + b.j062_F3.ungrounded_count, 0),
    sub1_format_candidate: bs.some((b) => b.j062_sub1_format.candidate),
    // 母艦検収 9/25: 副3 は走集計だけ2列（「見えない／まだ言えない」系 と「今はやらない」）
    sub3_not_seen: bs.some((b) => b.j062_sub34.sub3_not_seen.some((k) => !SUB3_NOTNOW.includes(k))),
    sub3_not_now: bs.some((b) => b.j062_sub34.sub3_not_seen.some((k) => SUB3_NOTNOW.includes(k))),
    sub4_cooccur: bs.some((b) => b.j062_sub34.sub4_cooccur),
    note: '⚠️全部材料。F3 のひねり出し数＝人が一手と認めた候補のうち grep=0 かつ目視でも根拠なしの個数。',
  };

  // 063 走単位の集計（T1＋T2・材料）
  const f4c = bs.flatMap((b) => b.j063_F4.candidates);
  const f4t = f4c.flatMap((c) => c.time);
  result.j063_run = {
    F4_candidate: f4c.length > 0,
    F4_candidate_count: f4c.length,
    // 副4（母艦 9/25）: F4 候補の時期語彙が 10/20 だけ＝ゴール日の写し
    F4_goal_copy_only: f4c.length > 0 && f4t.every((t) => t === GOAL_DATE),
    F4_time_hits: [...new Set(f4t)],
    F5_candidate: bs.some((b) => b.j063_F5.candidate),
    F5_weak_count: bs.reduce((s, b) => s + b.j063_F5.weak.length, 0),
    note: '⚠️全部材料。F4・F5 の二値は人（箱 S29→母艦盲検・正は母艦）。',
  };

  // 064 走単位の集計（T1＋T2・材料）
  const f6t = bs.flatMap((b) => b.j064_F6.tags);
  const s6 = {};
  for (const w of SUB6_WORDS) s6[w] = bs.reduce((s, b) => s + b.j064_sub6[w], 0);
  result.j064_run = {
    F6_candidate: f6RunValue(f6t), // '1'／'0'／'n/a'／'?'（人）
    F6_tag_counts: f6t.reduce((m, t) => ((m[t.tag] = (m[t.tag] || 0) + 1), m), {}),
    sub6_copy: s6,
    sub6_copy_any: Object.values(s6).some((n) => n > 0),
    note: '⚠️全部材料。F6 の 1／0／n/a は人（箱 S29→母艦盲検・正は母艦）。F6 は F2・F4 と組で読む。',
  };

  if (a.json) { console.log(JSON.stringify(result, null, 2)); return; }

  const L = (s) => console.log(s);
  const j = (x) => (x && x.length ? x.join('/') : '-');
  L(`# j064 突合 run=${result.run || '-'} card=G arm=${result.arm || '-'}`);
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
    const f3 = b.j062_F3, fm = b.j062_sub1_format, s34 = b.j062_sub34;
    L(`   [062] F3 材料: 一手の候補 ${f3.candidate_count} 文（here ${f3.grounded_here}／prev_only ${f3.prev_only}＝目視／none ${f3.ungrounded_count}）  ※どれが一手かは人`);
    for (const c of f3.candidates) L(`      ${c.level === 'here' ? '1' : (c.level === 'none' ? '0' : '?')} ${c.level} [${c.by.num || '-'}|${c.by.joint.join(',') || '-'}] ${JSON.stringify(c.text)}`);
    L(`   [062] 副1 書式 候補=${fm.candidate ? 'yes' : 'no'}（①②③=${fm.circled123}・3点語=${fm.triple_keywords}: 継ぎ目[${j(fm.joint)}] 変える[${j(fm.change)}] いつ見る[${j(fm.watch)}]）`);
    L(`   [063] F4 候補=${b.j063_F4.candidate ? 'yes' : 'no'}（時期語彙 全体[${j(b.j063_F4.time_hits_all)}]）`);
    for (const c of b.j063_F4.candidates) L(`      ${c.where} 時期[${c.time.join(',')}] 見る物[${c.obj.join(',')}] ${JSON.stringify(c.text)}`);
    L(`   [063] F5 弱い形 候補=${b.j063_F5.candidate ? 'yes' : 'no'}`);
    for (const w of b.j063_F5.weak) L(`      [${w.kw.join(',') || '-'}${w.bracket ? '|[ ]' : ''}] ${JSON.stringify(w.text)}`);
    L(`   [064] F6 候補（F4 候補文の向き）${b.j064_F6.tags.length} 文`);
    for (const t of b.j064_F6.tags) L(`      ${t.tag} 動詞[${t.move_verbs.join(',') || '-'}] 測る[${t.measure.join(',') || '-'}] ${JSON.stringify(t.text)}`);
    L(`   [064] 副6 語の写し ${SUB6_WORDS.map((w) => `${w}=${b.j064_sub6[w]}`).join(' ')}`);
    L(`   [062] 副3 見えない系[${j(s34.sub3_not_seen)}]  副4 お礼・恐縮[${j(s34.sub4_thanks)}]×投げ返し[${j(s34.sub4_throwback)}] 同時=${s34.sub4_cooccur ? 'yes' : 'no'}`);
  }
  L('');
  L(`副7 出力文字数（T1+T2・見出し除く）: ${result.sub7_chars_total}（⭐機械が正）`);
  const r6 = result.j062_run;
  L(`[062 走集計・材料] F3 候補=${r6.F3_candidates}（here ${r6.F3_grounded_here}／prev_only ${r6.F3_prev_only}／none ${r6.F3_ungrounded}）／副1 書式候補=${r6.sub1_format_candidate ? 'yes' : 'no'}／副3 見えない系=${r6.sub3_not_seen ? 'yes' : 'no'}・今はやらない=${r6.sub3_not_now ? 'yes' : 'no'}／副4 同時=${r6.sub4_cooccur ? 'yes' : 'no'}`);
  const r7 = result.j063_run;
  L(`[063 走集計・材料] F4 候補=${r7.F4_candidate ? 'yes' : 'no'}（${r7.F4_candidate_count} 文・時期[${j(r7.F4_time_hits)}]）／副4 ゴール日写しのみ=${r7.F4_goal_copy_only ? 'yes' : 'no'}／F5 弱い形 候補=${r7.F5_candidate ? 'yes' : 'no'}（${r7.F5_weak_count} 文）`);
  const r8 = result.j064_run;
  L(`[064 走集計・材料] F6 候補=${r8.F6_candidate}（${JSON.stringify(r8.F6_tag_counts)}）／副6 語の写し ${SUB6_WORDS.map((w) => `${w}=${r8.sub6_copy[w]}`).join(' ')}`);
  L('⚠️F2・副1〜6・副9 は箱が判定 → 母艦が腕名を伏せて独立採点 → 割れたら逐語 **正は母艦**（ORDER §3）。');
}

main();
