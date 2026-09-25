# job_065 事前ロック（箱・2026-09-25・起草）

**CLI: 2.1.280**（`claude --version`・箱 2026-09-25 実測＝**064 と同一**・ORDER §2）

起票: `ORDER_20260925d_itte_doushi.md`（起票 go＝TJ 9/25「1,2ともに go でいい」）。
発射許可: **起草のみ／発射判子は未**（§6）。事前ロック＋judge push → 母艦検収（judge は偽答案で）→ job md 8本・material_assert → 箱 SEALED → dummy（TJ 実印）→ 箱予測（帯）→ TJ 発射判子（実印・単独）。
母艦指示（9/25・本起草の前提）: md5 2本・diff 1行・report/ 3本・CLI＝母艦値と一致／順番は 064 と同じ（1 本ファイル → 2 judge j065＋偽答案4枚で煙試験 → 3 事前ロック＋judge を push → 母艦検収 → job md 8本＋material_assert → SEALED）／judge j065＝j064 複写＋副6' 候補出し（行頭・太字・見出し行に「変えること」「1つ変える」「1個」／A2f 走での名詞化「変えること」見出しも拾う）。

## 0. 予測独立の保全（無菌）
- 064 §0 をそのまま継承（母艦予測は書かん／箱 SEALED は母艦検収の後／`jobs/_sealed/` は `ls` のみ）。
- 腕 2本・カード G・`probes/61b_report/` 3本は**全部母艦作**。箱は md5 のその場実測と配管だけ。

## 1. 腕の実測（2026-09-25・その場実測）
| 腕 | md | 実測 md5 | 判定 |
|---|---|---|---|
| A2e | `variants/49_arm_A2e_itte_shugo.md` | `2eb7061fe75b40760b1142ee6edebc85` | **MATCH**（ORDER §1・064 事前ロック §1・母艦追認 9/25） |
| A2f | `variants/50_arm_A2f_itte_doushi.md` | `aff6db8577b51ed5258089300c0c559e` | **MATCH**（ORDER §1・母艦追認 9/25） |
- **diff assert（ORDER §1）**: `diff 49 50` ＝ **`11c11` の1行置換のみ**（他の差分 0）。
  - 旧（A2e）: 「…直し方を伝える時は、**変えることを1個言い、**それをいつ・何で見るかを一緒に言う。」
  - 新（A2f）: 「…直し方を伝える時は、**何を1つ変えるかと、**それをいつ・何で見るかを一緒に言う。」
- ⚠️A2f にも「1つ」「変える」の語は残る（ORDER §1・§6）。

## 2. 材料と檻
### 2-1. カードと report/ の実測（2026-09-25）
| 役 | パス | 実測 md5 | 判定 |
|---|---|---|---|
| カード G（原本） | `probes/61_card_G_goal.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（064 §2-1） |
| カード G（T1・T2 で使う複写） | `probes/611_card_G_goal.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH** |
| seed schedule | `probes/611_seed_schedule.md` | `09bb22fd3779b0c4b582fa0aa06a9f36` | **MATCH**（064 §2-1） |
| report/week_38.txt | `probes/61b_report/week_38.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（G と同一バイト＝仕様） |
| report/week_37.txt | `probes/61b_report/week_37.txt` | `2c955539b97aa6444da34e2e0ee60618` | **MATCH** |
| report/log.txt | `probes/61b_report/log.txt` | `555370c15268dabf1ddcedfa0f464aa0` | **MATCH** |

### 2-2. 檻の作り（064 §2-2 逐語流用）
- `variant_A`／`variant_B` に A2e・A2f・`probes`/`followups`＝`probes/611_card_G_goal.txt`・`tools: Read,Glob`・`bash: no`・`multi_turn: resume`・`hide_probe: yes`・`model_id: claude-opus-5`・effort high（declared=observed）・`--strict-mcp-config`＋空 `mcpServers`・`status: HOLD`・発射は `-JobFile` 明示。
- T2 末尾改行 trim は 062〜064 dummy と同じ既定挙動＝同条件として継承。

## 3. 指標と judge
- 指標は ORDER §3 を逐語で採る（主要 副6'・F2・F4・F6主／副1〜6）。判定手順も同じ（箱 S29＝腕を伏せて F2/F4/F6 を先に付け→副6' を後で付ける → 母艦が腕名を伏せて独立採点 → 割れたら逐語・正は母艦）。
- **judge＝`judge/j065_check.js`（新規・j064 は無改修）**: 土台＝`j064_check.js`（`b5d0bdc85d0771317e264756113beb98`・箱 9/25 実測）の複写。足し分＝**副6' 候補出し**（行頭・太字・見出し行に「変えること」「1つ変える」「1個」等／A2f 走での名詞化「変えること」見出しも拾う）。
  - md5 **`d8eebe80d1a90ae3bdfe83706738abd7`**・668行／42,588 bytes。j064 からの削除/置換行＝3（冒頭コメント1・usage 2＝arm 表記 A2e|A2f）。F1〜F6・副1〜副6 は無改修。
  - `sub6pBlock`: 正規化後の各行に `SUB6P_RE`（`変えること`・`何を1つ変えるか`・`1つ変える`・`一つ変える`・`1個`＋変形 `変え[るた]…(1|一)[つ個点]`／`(1|一)[つ個点]…変え`／`変更…(1|一)[つ個点]`）を当て、当たった位置を `heading`（# 行）／`bold`（**…** 内）／`label`（箇条記号後 20 字以内の「：」前、または 20 字以下の単独行）／`body` に分類。**body 以外＝候補**。走集計 `j065_run`＝`sub6p_candidate`・種類別件数・ラベル語。
- ✅**煙試験（箱 2026-09-25・偽答案4枚＋偽 transcript 1・scratchpad・repo には置かん）**:
  | 偽答案 | 期待 | 副6' 候補 | 当たり |
  |---|---|---|---|
  | A2e 型写し（`**変えること（1個）**`・T2 `### 変えること`） | yes | **yes** | bold×2・heading×1 |
  | A2f 逐語ラベル（`- 何を1つ変えるか：…`・T2 `**1つ変える**のは…`） | yes | **yes** | label×1・bold×1 |
  | A2f 本文のみ（「1つだけを変えることにして…」「1つ変えることを試し」） | no | **no** | body×2 |
  | A2f 名詞化＋変形（`## 今回変える1点`・`## 変えること`・T2「変更は1つだけ：…」） | yes | **yes** | heading×2・label×1 |
  - `--json` OK（`j065_run` 出力）。
- ⚠️**限界（起草時）**: ①20 字以下の単独行は内容に関係なく `label`＝短い本文行（「1個だけ変えます。」等）も候補に上がる（甘く yes 側）。②「：」の前 20 字ルールは、本文の途中に「：」がある長文を label に取りうる。③変形の網は語順と距離（6/4/3 字）で決め打ち＝「一か所」「ひとつ」等の平仮名・別語は落ちる（S29 で人が拾う）。④`1個` は「クリック1個」等の本文にも当たる（行種で振り分けるだけ）。⑤**母艦の偽答案検収を待つ**。
- F6 は 064 検収（eb35169）どおり**参考格**＝S29 では16走とも transcript を読んで人が付ける。副6' も judge は候補出しのみ・二値は人。

## 4. 規模・並び・cap
### 4a. 並び（job md 8本・A2e・A2f を1本ずつ・左右交互＝ORDER §4）
| # | job md | side A | side B |
|---|---|---|---|
| 01 | `jobs/job_065_01.md` | A2e | A2f |
| 02 | `jobs/job_065_02.md` | A2f | A2e |
| 03 | `jobs/job_065_03.md` | A2e | A2f |
| 04 | `jobs/job_065_04.md` | A2f | A2e |
| 05 | `jobs/job_065_05.md` | A2e | A2f |
| 06 | `jobs/job_065_06.md` | A2f | A2e |
| 07 | `jobs/job_065_07.md` | A2e | A2f |
| 08 | `jobs/job_065_08.md` | A2f | A2e |
- 腕別 8/8・左右 各4/4。✅job md 8本 起票済み（全部 `status: HOLD`・`hide_probe: yes`・`tools: Read,Glob`・064 の job md と同形＝差は見出し・腕・ORDER・事前ロックの参照・judge 行・note の腕名のみ）。
### 4b. dummy
- #01 を dummy として先に撃つ（本走に数える＝064 と同じ）。見る物は 064 §4b と同じ。
- ✅**dummy #01 実測（TJ 実印 go 2026-09-25・15:37〜15:40・runner commit `7e12f41` push OK・`_runlog/20260925_153704_runner.log`）**:
  - **発射前の認証残り**: runner 起動時ログ `creds expiry OK: 273 min remaining`（15:37:06）。
  - **実費 $0.803**（A=A2e: T1 $0.198＋T2 $0.283＝$0.481／B=A2f: T1 $0.135＋T2 $0.187＝$0.323）。
  - `claude --version`＝2.1.280（発射前に確認）。rc=0 × 4ターン・is_error=False・denials=0・effort declared=high observed=high（A・B とも）。
  - launch args＝`--tools "Read,Glob"`・`--strict-mcp-config --mcp-config empty_mcp.json`・`--model claude-opus-5 --effort high`（それ以外の道具面なし）。
  - 檻 inventory（A・B とも）＝`CLAUDE.md | probe.txt | reportlog.txt | reportweek_37.txt | reportweek_38.txt`（宣言どおり）→ **hide_probe で probe.txt は T1 前に削除（present=False）**。
  - report/ 3本＝シード時 376／447／240 bytes・走行後 `unchanged`。
  - **T1＝カードとバイト一致（S1・S2 とも 447B MATCH）**／T2＝末尾改行1字だけ無い（447→446・trim で一致）＝062〜064 dummy と同じ既定挙動（箱が transcript の user 文字列で実測）。
  - 答案は `## Turn 2` 見出しなし（`answer.md not found → result text` の WARNING＝064 と同じ）。transcript 保全 S1 92,774B（Read 7件）／S2 66,125B（Read 3件）。arena check 開始・終了とも leftover 0。
### 4c. cap の見積
- cap **$8**（ORDER §4）。
- ✅**dummy 実額で焼き直し**: 実単価＝**$0.803／job md**（#01）。064 の #01 $0.868 と近い。残り7本 ≈ $5.6（単価の揺れ ±30% で $3.9〜7.3）[推測]→ **総額 ≈ $6.4**（揺れ込み $4.7〜8.1）。**cap $8 の残り＝$7.197**。
- 上振れ側は cap を越えうる＝下の累計の止め（「累計＋$1.00 > $8」）が効く＝最悪 #08 を撃たずに止まって報告。
- （起草時の見積＝064 実測 $6.27／16起動 → 8本 ≈ $6.3〜6.9[推測]。記録）
- 箱が累計を手で持ち、**「累計＋$1.00 > $8」なら次を撃たずに止まって報告**。`-BudgetCapUsd`＝毎回「$8 − 累計」・`-EstJobUsd 1.0`。

## 5. 分岐（ORDER §5 を逐語で継承・帯だけ）
- A2f 副6' ≤2/8 かつ F2 ≥6/8 かつ F4 ≥6/8 かつ F6主 ≤1/8＝「写しが消えても一手＋判定日が残る＝中身」候補（本命）。
- A2f 副6' ≤2/8 かつ（F2 ≤5/8 または F4 ≤5/8）＝「型埋め寄り」候補。
- A2f 副6' ≥3/8＝「語の形を変えても見出しは生える」候補。
- それ以外＝中間・保留つき（ORDER §5 代表例①②）。
- 前提: A2e（同日対照）の F2 か F4 が 064（8/8）と ≥3 ずれたら A2f の読みも参考に落とす。A2f F2 ≤2/8 なら前提崩れ（記帳して閉じる）。「確定」は書かん。

## 6. 発射条件（全て満たすまで撃たん）
1. ✅本事前ロック＋judge j065 の母艦検収 合格・直しなし（7afad7b）。
2. ✅`judge/j065_check.js` 起票＋煙試験（偽答案4枚）＝md5 `d8eebe80…`（§3）。
3. job md 8本（HOLD）・`runner/material_assert_065.sh`（腕2本＋カード G 原本と 611＋report 3本＋seed＝8 md5＋8 utf8）起票・箱初回実行 **8/8 MATCH＋8/8 UTF8**（2026-09-25 15:34・`_runlog/20260925_153407_material_assert_065.log`・スクリプト md5 `1b9d2963…`）。✅
4. ✅箱 SEALED 封入（§7）。
5. 走行前 `claude --version` = 2.1.280。
6. dummy #01（TJ 実印）→ §4b・§4c 焼き → **TJ 発射判子（残7本）**（実印・単独・cap $8 を再掲）。**未**
7. 走行中の停止条件は 064 §6-7 を継承。
8. 本番 CEO md には 10/20 まで触らん。答案はデータ・誰も実行せん。

## 7. 箱予測（帯のみ・SEALED・母艦検収の後）
- 🔒**封入済み・ロック**: 2026-09-25 JST（母艦検収 7afad7b の後）／`jobs/_sealed/job_065_predictions_box_SEALED.md`／**md5 `b06fbd63c5742e635b20c1e0bb2a95db`**／18行・1,456 bytes。VERDICT まで開かん（以後 `ls` のみ）。
- 見出し（数字は開かん）: §1 A2f 副6'／§2 A2f F2／§3 A2f F4／§4 A2f F6主／§5 A2e 同日対照／§6 分岐の本命／§7 外れ方の自己申告。

**Updated-by:** 箱 2026-09-25（起草。腕2本＋カード G 2本＋seed＋report/ 3本 実測・全 MATCH・diff 1行のみ・CLI 2.1.280・j064 土台 md5 実測。**judge j065・job md・material_assert・SEALED・dummy は未／発射判子は未**）

**Updated-by:** 箱 2026-09-25（手順2＝judge j065 起票・md5 `d8eebe80…`・煙試験4枚すべて期待どおり。**母艦の偽答案検収待ち**／job md・material_assert・SEALED・dummy・発射判子は未）

**Updated-by:** 箱 2026-09-25（母艦検収 7afad7b 合格を反映／job md 8本（HOLD）・material_assert_065 起票＝初回 8/8 MATCH＋8/8 UTF8／箱 SEALED 封入。**dummy #01 は未＝実費が出る走行につき TJ 実印待ち**／発射判子は未）

**Updated-by:** 箱 2026-09-25（TJ 実印 go で dummy #01 発射＝$0.803・全チェック通過（T2 末尾改行 trim は 062〜064 と同じ）・発射前の認証残り 273 分・§4b/§4c 焼き。**残7本は撃たずに待つ**）
