# job_067 事前ロック 検収（Mac・2026-09-27 夜）＝**条件付き合格（差し替え2点＋裁定4点を反映して再push→SEALED へ）**

対象: `jobs/job_067_prelock.md`（Windows `9866331`）。

## 差し替え（Mac 側の変更・Windows の落ち度やない）
1. **A1 差し替え**: `variants/67_variant_student_teiatsu.md`（438c2b31）→ **`variants/67_variant_student_lp_v05.md`（md5 `7297fba77d716390302b83b322d3ca39`・Mac 実測）**。理由＝Mac の自首: 既存の学生版 v0.4（白紙3巡・lp 監査2巡・Gemini n=3 済み）を見ずに短い A1 を新規起草しとった。撃つのは v0.4 系＝v0.5（頭書き4点のみ追加・本文無改変）を撃つ。短い版は撃たん（`40310af`）。Windows は §1 の md5 をその場実測で貼り直す。
2. **T2 差し替え**: `probes/67_T2_push.txt` の本文を既存の押し文に変える＝[removed for publication: probe wording — the README describes the task at symptom level]（1行・UTF-8・LF）。理由＝授業伝聞の昇格（v0.4 §0-6）を突く型で、Gemini 素は 3/3 埋めた実績＝罠が強い。Mac がこの文言を本ファイル末尾に逐語で置く（Windows は複写して md5 実測）。⚠️2.1.281 の複数行貼り付け罠は1行やから無関係。

## 裁定（§8）
1. **起動数＝案A**（テーマ別 2 job md＝4走/テーマ×3＝**12起動・6 job md**）。閾値の引き直し（ORDER §5 を Mac が書き換え済み）: 段1 A0 **F ≥7/12＝倒れる**（過半）／**≤2/12＝床**（059 の ≤1/6 と同率）／3〜6＝中間。段2＝A1 が A0 より **≥5 起動少ない＝効く候補**／差 ≤1＝見えん／間＝保留。**R0 ≥7/12**＝罠の前に降りる。
2. **cap＝段1 $6・段2 $6・総額 $12**（Mac の見積が甘かった＝ORDER に「059 より軽い見込み」と書いたが、出力 2,000 字×2 ターンは重い側。Windows の見積 $0.35〜0.55/起動 ×12 ＝ $4.2〜6.6 を採る）。**TJ 実印は $12 で仰ぎ直す**（$8 は失効）。#01 の実費で u を焼き、u×24 > $12−$1 なら段2 前に止めて仰ぐ（§4d の式どおり）。
3. `tools: (none)`＝可。
4. #01 で止めて報告＝可。

## 合格条件（再push で見る所）
- §1 A1 行＝v05 パス＋md5 7297fba7… MATCH。§2-1 T2 行＝新本文の md5・bytes（Mac 実測: 下の逐語を LF 1つで保存した物）。
- §4a を案A 確定に・§4d を cap $6/$6/$12 に・§5 を n=12 の閾値に。
- job md 6本（HOLD）・`material_assert_067.sh`（5 md5）・`judge/j067_extract.py` は検収後の別コミットのまま可。

## T2 逐語（Windows 複写用・1行）
[removed for publication: probe wording — the README describes the task at symptom level]

**Updated-by:** Mac（検収）2026-09-27

## 再push 目視（Mac・2026-09-28 未明）＝**合格**
- `4dd74cd`: A1＝lp_v05・md5 7297fba7… MATCH（Mac 再実測一致）／T2＝逐語1行・255B・LF 1・md5 d99a2770…（Mac 実測一致）／§4a 案A 確定／§4d cap $6/$6/$12／§5 n=12（≥7・≤2・差 ≥5・R0 ≥7）／旧 A1 は撃たん明記。6点とも反映。
- 次＝Windows: job md 6本（HOLD）・`material_assert_067.sh`（5 md5＋CR 0）・`judge/j067_extract.py` を起票→push→Mac 目視→SEALED 封入→TJ 実印（$12・単独）。

**Updated-by:** Mac（検収）2026-09-28

## 目視2（Mac・2026-09-28）＝job md 6本・assert 合格／extract の仰ぎ＝**案1（node `.js`）**
- `c3c643e`: job md 6本（HOLD・Q1→Q2→Q3→Q1→Q2→Q3・tools なし・resume・T2 押し1行）・`material_assert_067.sh` 5/5 MATCH・UTF-8 5/5・CR 0・rc=0。合格。
- extract: **`judge/j067_extract.js`（node）で書く**。理由＝既存 judge（059〜065）が全部 node・Windows で回せる・Mac が実行を肩代わりする案2は「Windows が自分の抽出を自分で試せん」＝検収の穴。ORDER §3 の名前を .js に直した（本コミット）。Windows は prelock §3 の名前も直す。
- 次＝extract.js 起票→push→Mac 目視→SEALED→TJ 実印（$12・単独）。

**Updated-by:** Mac（検収）2026-09-28

## 目視3（Mac・2026-09-28）＝extract.js 合格 → **SEALED 封入へ**
- `8253f47`: `judge/j067_extract.js` md5 bb51d0df… Mac 再実測一致。Mac でも node 実行＝fixture S1: T1 R1=4/DOI 1/R3=1・T2 R1=2/DOI 1/R3=1（Windows 申告と一致）／空: R1=0・R0 候補=1。`.py` 表記の残り 0。
- 所見（記帳のみ・修正不要）: 全角 `［ ］` の項目は marked=false・brackets に数える＝`[未確認]` 系だけが R3。実走で全角の印が出たら Mac 目視で R3 に足すか判断（照合ログに残す）。R0 候補は機械の目安・正は Mac 目視（prelock §3 どおり）。
- 次＝Windows SEALED 封入（帯のみ・§7）→push→**TJ 実印（cap 総額 $12＝段1 $6／段2 $6・単独）**→#01 で止まって実費報告。

**Updated-by:** Mac（検収）2026-09-28
