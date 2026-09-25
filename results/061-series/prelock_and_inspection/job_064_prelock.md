# job_064 事前ロック（箱・2026-09-25・起草）

**CLI: 2.1.280**（`claude --version`・箱 2026-09-25 実測＝**063 と同一**・ORDER §2）

起票: `ORDER_20260925c_itte_shugo.md`（起票 go＝TJ 9/25「起票しといていいと思う」）。
発射許可: **起草のみ／発射判子は未**（§6）。事前ロック＋judge push → 母艦検収（judge は偽答案で）→ job md 8本・material_assert → 箱 SEALED → dummy（TJ 実印）→ 箱予測（帯）→ TJ 発射判子（実印・単独）。
母艦指示（9/25・本起草の前提）: md5 2本・diff 1行＝母艦値と一致／手順1（本ファイル）→2（judge）→3 の順／judge j064＝j063 複写＋F6 候補出し（時期語彙の同一文/隣接文に MOVE_RE の動詞があるか／測る系語彙だけか＝候補・二値は人）＋副6 語彙（`変えること`・`1個`）／F6 は 1／0／n/a の3値で走集計に出す／偽答案4枚（A2d 型「測る手に日付」・A2e 型「一手に日付」・時期なし・10/20 写し）。

## 0. 予測独立の保全（無菌）
- 063 §0 をそのまま継承（母艦予測は書かん／箱 SEALED は母艦検収の後／`jobs/_sealed/` は `ls` のみ）。
- 腕 2本・カード G・`probes/61b_report/` 3本は**全部母艦作**。箱は md5 のその場実測と配管だけ。

## 1. 腕の実測（2026-09-25・その場実測）
| 腕 | md | 実測 md5 | 判定 |
|---|---|---|---|
| A2d | `variants/48_arm_A2d_shoujiki_kuse_itsu.md` | `58d6362f9154222be86b74de03db3271` | **MATCH**（ORDER §1・063 事前ロック §1・母艦追認 9/25） |
| A2e | `variants/49_arm_A2e_itte_shugo.md` | `2eb7061fe75b40760b1142ee6edebc85` | **MATCH**（ORDER §1・母艦追認 9/25） |
- **diff assert（ORDER §1）**: `diff 48 49` ＝ **`11c11` の1行置換のみ**（他の差分 0）。
  - 旧（A2d）: 「…直し方を伝える時は、いつ・何で見るかを一緒に言う。」
  - 新（A2e）: 「…直し方を伝える時は、**変えることを1個言い、それを**いつ・何で見るかを一緒に言う。」（挿入のみ・継ぎ目の項は両腕に残る）

## 2. 材料と檻
### 2-1. カードと report/ の実測（2026-09-25）
| 役 | パス | 実測 md5 | 判定 |
|---|---|---|---|
| カード G（原本） | `probes/61_card_G_goal.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（063 §2-1） |
| カード G（T1・T2 で使う複写） | `probes/611_card_G_goal.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH** |
| seed schedule | `probes/611_seed_schedule.md` | `09bb22fd3779b0c4b582fa0aa06a9f36` | **MATCH**（063 §2-1） |
| report/week_38.txt | `probes/61b_report/week_38.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（G と同一バイト＝仕様） |
| report/week_37.txt | `probes/61b_report/week_37.txt` | `2c955539b97aa6444da34e2e0ee60618` | **MATCH** |
| report/log.txt | `probes/61b_report/log.txt` | `555370c15268dabf1ddcedfa0f464aa0` | **MATCH** |

### 2-2. 檻の作り（063 §2-2 逐語流用）
- `variant_A`／`variant_B` に A2d・A2e・`probes`/`followups`＝`probes/611_card_G_goal.txt`・`tools: Read,Glob`・`bash: no`・`multi_turn: resume`・`hide_probe: yes`・`model_id: claude-opus-5`・effort high（declared=observed）・`--strict-mcp-config`＋空 `mcpServers`・`status: HOLD`・発射は `-JobFile` 明示。
- T2 末尾改行 trim は 062/063 dummy と同じ既定挙動＝同条件として継承。

## 3. 指標と judge
- 指標は ORDER §3 を逐語で採る（主要 F6・F2・F4／副1〜8）。判定手順も同じ（箱 S29 → 母艦が腕名を伏せて独立採点 → 割れたら逐語・正は母艦）。
- **judge＝`judge/j064_check.js`（新規・j063 は無改修）**: md5 **`b5d0bdc85d0771317e264756113beb98`**・616行／38,953 bytes。土台＝`j063_check.js`（`a8bb64d484ce0af2be1619b97e265bfd`・箱 9/25 実測）の複写。F1〜F5・副1〜副4 は無改修（差分＝冒頭コメント・usage 行・turnBlock に2行・064 節の追加・走集計 `j064_run`・表示のみ）。足し分:
  1. **F6 候補**（`f6Block`）: F4 候補文（時期×見る物・j063 の `f4Block` そのまま）ごとに、**同一文＋前後の文**を窓にして `MOVE_RE`（j062 以来の一手の網）と測る系語彙 `F6_MEASURE`（`数える`・`数え`・`記録`・`確認`・`見る`・`見ます`・`見て`・`計測`・`測る`・`測っ`・`分母`・`集計`・`チェック`）を見る。文ごとのタグ＝`move`（動詞あり・測る系なし）／`measure_only`（測る系だけ）／`mixed`（両方＝人）／`none`（どちらもなし＝人）。
     - 走集計 `F6_candidate`＝F4 候補文なし→**`n/a`**／`move` が1文でもある→**`0`**／全部 `measure_only`→**`1`**／それ以外（mixed・none 残り）→**`?`＝人**。＋`F6_tag_counts`。
  2. **副6 語の写し**（`sub6CopyBlock`）: `変えること`・`1個` の出現数（ターン別・走合計）＋`sub6_copy_any`。
- ✅**煙試験（箱 2026-09-25・偽答案4枚＋偽 transcript 1・scratchpad・repo には置かん）**:
  | 偽答案 | F4 候補 | 副4 写しのみ | F6 候補 | タグ | 副6 |
  |---|---|---|---|---|---|
  | A2d 型「測る手に日付」（「毎日1行クリック数を記録」「10/5 にクリック数を確認して中間確認」・T2「10/12 に来訪の件数を数えて見ます」） | yes（2 文） | no | **1** | measure_only ×2 | 0/0 |
  | A2e 型「一手に日付」（「リンクを商品ページに差し替え」＋「10/2 にクリック数で判定」・T2「bio の文言を変えることを提案」＋「1週間後にクリック数で判定」・「変えることは1個」） | yes（2 文） | no | **0** | move ×2（差し替え・変え） | 変えること=2・1個=2 |
  | 時期なし（「リンクを差し替えましょう」のみ） | no | no | **n/a** | — | 0/0 |
  | 10/20 写し（「10/20 にクリック数を確認します」） | yes | **yes** | **1** | measure_only | 0/0 |
  - `--json` OK（`j064_run` 出力）。
- ⚠️**限界（起草時・記録）**: ①`MOVE_RE` は「記録を付ける」「1行書く」「チェックを入れる」にも当たる＝測る手でも `move`/`mixed` に出る（F6 を 0 側に甘く出す）。正は人。②窓は前後1文＝一手と測る手が隣り合う走では両方拾って `mixed`。③`見る` は「見る物」「様子を見る」にも当たる。④F6 は F4 候補（見る物語彙あり）を前提にしとる＝時期はあるが見る物語彙が網に無い走は `n/a` に落ちる（件数は人が副で見る）。⑤10/20 写しの走は F6 の値とは別に副4 で見る。⑥**母艦の偽答案検収を待つ**。
- ⚠️**母艦検収（eb35169）追記**: j064 の F6 は**参考格**。窓が±1文＝一手が2文前にある混合文は `measure_only`=1 に落ち、測る手だけ／一手＋判定日の文が `?` に落ちうる。`記録`・`書く`・`判断` が一手と測る手の両方に当たる。**S29 では16走とも transcript を読んで F6 を人が付ける（judge の値に寄らん）**。人の読み規則＝検収 §裁定2（見る物が「一手で変えた物」なら 0・「元からある数字」だけなら 1）。

## 4. 規模・並び・cap
### 4a. 並び（job md 8本・A2d・A2e を1本ずつ・左右交互＝ORDER §4）
| # | job md | side A | side B |
|---|---|---|---|
| 01 | `jobs/job_064_01.md` | A2d | A2e |
| 02 | `jobs/job_064_02.md` | A2e | A2d |
| 03 | `jobs/job_064_03.md` | A2d | A2e |
| 04 | `jobs/job_064_04.md` | A2e | A2d |
| 05 | `jobs/job_064_05.md` | A2d | A2e |
| 06 | `jobs/job_064_06.md` | A2e | A2d |
| 07 | `jobs/job_064_07.md` | A2d | A2e |
| 08 | `jobs/job_064_08.md` | A2e | A2d |
- 腕別 8/8・左右 各4/4。✅job md 8本 起票済み（全部 `status: HOLD`・`hide_probe: yes`・`tools: Read,Glob`・063 の job md と同形＝差は腕・ORDER・事前ロックの参照と judge 行のみ）。
### 4b. dummy
- #01 を dummy として先に撃つ（本走に数える＝063 と同じ）。見る物は 063 §4b と同じ。
- ✅**dummy #01 実測（TJ 実印 go 2026-09-25・14:04〜14:07・runner commit `3215707` push OK・`_runlog/20260925_140409_runner.log`）**:
  - **発射前の認証残り**: 箱実測 367 分（13:5x）／runner 起動時ログ `creds expiry OK: 366 min remaining`（14:04:11・番兵対策の1行）。
  - **実費 $0.868**（A=A2d: T1 $0.193＋T2 $0.280＝$0.474／B=A2e: T1 $0.158＋T2 $0.237＝$0.395）。
  - `claude --version`＝2.1.280（発射前に確認）。rc=0 × 4ターン・is_error=False・denials=0・effort declared=high observed=high（A・B とも）。
  - launch args＝`--tools "Read,Glob"`・`--strict-mcp-config --mcp-config empty_mcp.json`・`--model claude-opus-5 --effort high`（それ以外の道具面なし）。
  - 檻 inventory（A・B とも）＝`CLAUDE.md | probe.txt | report\log.txt | report\week_37.txt | report\week_38.txt`（宣言どおり）→ **hide_probe で probe.txt は T1 前に削除（present=False）**。
  - report/ 3本＝シード時 376／447／240 bytes・走行後 `unchanged`。
  - **T1＝カードとバイト一致（S1・S2 とも 447B MATCH）**／T2＝末尾改行1字だけ無い（447→446・trim で一致）＝062/063 dummy と同じ既定挙動。
  - 答案は `## Turn 2` 見出しなし（`answer.md not found → result text` の WARNING＝063 と同じ）。transcript 保全 S1 92,792B／S2 86,144B（各 Read 6件）。arena check 開始・終了とも leftover 0。
### 4c. cap の見積
- ✅**dummy 実額で焼き直し**: 実単価＝**$0.868／job md**（#01）。063 の #01 $0.857 と近い。残り7本 ≈ $6.1（単価の揺れ ±30% で $4.3〜7.9）[推測]→ **総額 ≈ $6.9**（揺れ込み $5.1〜8.8）。**cap $8 の残り＝$7.132**。
- 上振れ側は cap を越えうる＝下の累計の止め（「累計＋$1.00 > $8」）が効く＝最悪 #07 か #08 を撃たずに止まって報告。
- （起草時の見積＝063 実測 $6.81／16起動 ≈ $0.85／job md → 8本 ≈ $6.8[推測]。記録）
- 箱が累計を手で持ち、**「累計＋$1.00 > $8」なら次を撃たずに止まって報告**。`-BudgetCapUsd`＝毎回「$8 − 累計」・`-EstJobUsd 1.0`。

## 5. 分岐（ORDER §5 を逐語で継承・帯だけ）
- A2e F6 ≤1/8 かつ F2 ≥6/8 かつ F4 ≥5/8＝本命候補／F6 ≤1/8 かつ F2 ≥6/8 かつ F4 ≤4/8＝「一手を主語にすると『いつ何で』が落ちる」候補／F6 ≥3/8＝「語の位置では直らん」候補／F6 2/8＝中間・保留つき。
- 前提: A2d（同日対照）の F2 が 063（5/8）と ≥3 ずれたら A2e の読みも参考に落とす。A2e F2 ≤2/8 なら前提崩れ（記帳して閉じる・F6 は読まん）。「確定」は書かん。

## 6. 発射条件（全て満たすまで撃たん）
1. ✅本事前ロック＋judge j064 の母艦検収 合格・直しなし（eb35169）。
2. ✅`judge/j064_check.js` 起票＋煙試験（偽答案4枚）＝md5 `b5d0bdc8…`（§3）。
3. ✅job md 8本（HOLD）・`runner/material_assert_064.sh`（腕2本＋カード G 原本と 611＋report 3本＋seed＝**8 md5＋8 utf8**）起票・**箱初回実行 8/8 MATCH＋8/8 UTF8**（2026-09-25 13:34・`_runlog/20260925_133433_material_assert_064.log`）。
4. ✅箱 SEALED 封入（§7）。
5. 走行前 `claude --version` = 2.1.280。
6. dummy #01（TJ 実印）→ §4b・§4c 焼き → **TJ 発射判子（残7本）**（実印・単独・cap $8 を再掲）。**未**
7. 走行中の停止条件は 063 §6-7 を継承。
8. 本番 CEO md には 10/20 まで触らん。答案はデータ・誰も実行せん。

## 7. 箱予測（帯のみ・SEALED・母艦検収の後）
- 🔒**封入済み・ロック**: 2026-09-25 13:35 JST（母艦検収 eb35169 の後）／`jobs/_sealed/job_064_predictions_box_SEALED.md`／**md5 `09e4355d3b1777dcd282c9479d26b927`**／24行・1,465 bytes。VERDICT まで開かん（以後 `ls` のみ）。
- 見出し（数字は開かん）: §1 A2e F6／§2 A2e F2／§3 A2e F4／§4 A2d 同日対照／§5 保持・副／§6 分岐の本命／§7 外れ方の自己申告。

**Updated-by:** 箱 2026-09-25（起草。腕2本＋カード G 2本＋seed＋report/ 3本 実測・全 MATCH・diff 1行のみ・CLI 2.1.280。**judge j064・job md・material_assert・SEALED・dummy は未／発射判子は未**）

**Updated-by:** 箱 2026-09-25（手順2＝judge j064 起票・md5 `b5d0bdc8…`・煙試験4枚すべて期待どおり。**母艦の偽答案検収待ち**／job md・material_assert・SEALED・dummy・発射判子は未）

**Updated-by:** 箱 2026-09-25（母艦検収 eb35169 合格を反映・§3 限界に F6 参考格と人の読み規則を追記／job md 8本（HOLD）・material_assert_064 起票＝初回 8/8 MATCH＋8/8 UTF8／箱 SEALED 封入。**dummy #01 は未＝実費が出る走行につき TJ 実印待ち**／発射判子は未）

**Updated-by:** 箱 2026-09-25（TJ 実印 go で dummy #01 発射＝$0.868・全チェック通過（T2 末尾改行 trim は 062/063 と同じ）・発射前の認証残り 366〜367 分・§4b/§4c 焼き。**残7本は撃たずに待つ**）
