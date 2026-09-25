# job_063 事前ロック（箱・2026-09-25・起草）

**CLI: 2.1.280**（`claude --version`・箱 2026-09-25 実測＝**062 と同一**・ORDER §2）

起票: `ORDER_20260925b_kuse_plus_when.md`（起票 go＝TJ 9/25「いけるやつ進めておいてくれていいよ」）。
発射許可: **起草のみ／発射判子は未**（§6）。事前ロック＋judge push → 母艦検収（judge は偽答案で）→ job md 8本・material_assert → 箱 SEALED → dummy → 箱予測（帯）→ TJ 発射判子（実印・単独）。
母艦指示（9/25・本起草の前提）: 実測6本・diff 1行・CLI 追認／手順1（本ファイル）→2（judge）の順／judge j063＝j062 複写＋F4 候補出し＋F5 語彙＋**「10/20」だけの走＝ゴール日の写しフラグを別列（副4）**／煙試験＝偽答案3枚（A2 型・A2b 弱い形・A2d 判定日つき）。

## 0. 予測独立の保全（無菌）
- 062 §0 をそのまま継承（母艦予測は書かん／箱 SEALED は母艦検収の後／`jobs/_sealed/` は `ls` のみ）。
- 腕 2本・カード G・`probes/61b_report/` 3本は**全部母艦作**。箱は md5 のその場実測と配管だけ。

## 1. 腕の実測（2026-09-25・その場実測）
| 腕 | md | 実測 md5 | 判定 |
|---|---|---|---|
| A2b | `variants/47_arm_A2b_shoujiki_kuse.md` | `d1372c45f3247d806d4083d4e08e4e9a` | **MATCH**（ORDER §1・062 事前ロック §1） |
| A2d | `variants/48_arm_A2d_shoujiki_kuse_itsu.md` | `58d6362f9154222be86b74de03db3271` | **MATCH**（ORDER §1・母艦追認 9/25） |
- **diff assert（ORDER §1）**: `diff 47 48` ＝ **`11c11` の1行置換のみ**（rc=1・他の差分 0）。
  - 旧（A2b）: 「君は、問題を見たら自然と直し方まで考えてしまう人だ。見えたら伝える。見えない時は、見えないと言う。」
  - 新（A2d）: 旧＋「直し方を伝える時は、いつ・何で見るかを一緒に言う。」（末尾に1文追加のみ）

## 2. 材料と檻
### 2-1. カードと report/ の実測（2026-09-25）
| 役 | パス | 実測 md5 | 判定 |
|---|---|---|---|
| カード G（原本） | `probes/61_card_G_goal.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（062 §2-1） |
| カード G（T1・T2 で使う複写） | `probes/611_card_G_goal.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH** |
| seed schedule | `probes/611_seed_schedule.md` | `09bb22fd3779b0c4b582fa0aa06a9f36` | 062 と同じ流用（062 material_assert の値と照合は material_assert_063 で） |
| report/week_38.txt | `probes/61b_report/week_38.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（G と同一バイト＝仕様） |
| report/week_37.txt | `probes/61b_report/week_37.txt` | `2c955539b97aa6444da34e2e0ee60618` | **MATCH** |
| report/log.txt | `probes/61b_report/log.txt` | `555370c15268dabf1ddcedfa0f464aa0` | **MATCH** |

### 2-2. 檻の作り（062 §2-2 逐語流用）
- `variant_A`／`variant_B` に A2b・A2d・`probes`/`followups`＝`probes/611_card_G_goal.txt`・`tools: Read,Glob`・`bash: no`・`multi_turn: resume`・`hide_probe: yes`・`model_id: claude-opus-5`・effort high（declared=observed）・`--strict-mcp-config`＋空 `mcpServers`・`status: HOLD`・発射は `-JobFile` 明示。
- T2 末尾改行 trim は 062 dummy と同じ既定挙動（062 §4b）＝同条件として継承。

## 3. 指標と judge
- 指標は ORDER §3 を逐語で採る（主要 F4・主要 F5・保持確認 F2・副1 書式・副1〜6）。判定手順も同じ（箱 S29 → 母艦が腕名を伏せて独立採点 → 割れたら逐語・正は母艦）。
- **judge＝`judge/j063_check.js`（新規・j062 は無改修）**: md5 **`a8bb64d484ce0af2be1619b97e265bfd`**・549行／34,709 bytes。土台＝`j062_check.js`（`9cf28106bdd3e85aad5f4aba8b8f92c2`・箱 9/25 実測）の複写。F1／F2=null／除外6類／F3 3段／副1 書式／副3 2列／副4（お礼×投げ返し）は無改修（差分＝usage 行・turnBlock に2行・063 節の追加・走集計 `j063_run`・表示のみ）。足し分:
  1. **F4 候補**（`f4Block`）: 文に切り（F3 と同じ `splitSentences`）、時期語彙 `F4_TIME_RE`（`\d{1,2}/\d{1,2}`・`\d+日後`・`\d+週間後`・`1週間後`・`一週間後`・`\d+日間`・`来週`・`翌週`・`次の週報`・`週末`・`月末`・`明日`・`\d+日(の|に|まで)`）の当たる文に、見る物語彙（`クリック`・`件数`・`数`・`件`・`本`・`来訪`・`アクセス`・`売上`・`購入`・`訪問`）が**同一文（here）or 前後の文（adjacent）**にあれば候補。正は人。
  2. **副4 ゴール日の写し**: 走集計 `F4_goal_copy_only`＝F4 候補の時期語彙が**全部 `10/20`**（母艦 9/25）。
  3. **F5 候補**（`f5Block`）: 一手候補文（F3 と同じ `MOVE_RE`）に `試す価値`・`も手`・`かもしれない`・`かもしれません` か `[`／`［` があれば候補。観察文は機械では拾わん＝人。
  - 走集計 `j063_run`: `F4_candidate`・`F4_candidate_count`・`F4_goal_copy_only`・`F4_time_hits`・`F5_candidate`・`F5_weak_count`。
- ✅**煙試験（箱 2026-09-25・偽答案4枚＋偽 transcript 1・scratchpad・repo には置かん）**:
  | 偽答案 | F4 | 副4 写しのみ | F5 | 副1 書式 | 備考 |
  |---|---|---|---|---|---|
  | A2 型（①②③・「③ 10/2 にクリック数で判定」・T2「10/20 まで様子を見ます」） | yes（10/2・here） | no | no | yes | T2 の「10/20 まで様子を見る」は見る物なし＝候補にならん（狙いどおり） |
  | A2b 弱い形（[ ]＋試す価値・「ロゴを作り直すのも手」・「かもしれない」・T2「〜かもしれません」） | no | no | yes（3 文） | no | [ ] と語彙の両方が当たる |
  | A2d 判定日つき（「1週間後にクリック数で見ます」・T2「10/2 に来訪の件数を数えて」） | yes（2 文） | no | no | no | 相対・日付の両方 |
  | 写しのみ（「10/20 にクリック数を確認します」） | yes | **yes** | no | no | 母艦指示の別列 |
  - `--json` OK（`j063_run` 出力）。
- ⚠️**限界（起草時・記録）**: ①見る物語彙 `数` は広い（「数える」「複数」にも当たる）＝F4 が甘めに出る・正は人。②adjacent は前後両方を見る＝一手と無関係な数字文の隣でも候補になる。③「次の週報で」だけ＋見る物あり＝候補になる（ORDER は候補止まり・人が 0 に落とす）。④F5 の観察文は拾わん。⑤MOVE_RE の網に当たらん弱い一手（例「〜という手もある」）は F5 から漏れる。⑥**母艦の偽答案検収を待つ**。

## 4. 規模・並び・cap
### 4a. 並び（job md 8本・A2b・A2d を1本ずつ・左右交互＝ORDER §4）
| # | job md | side A | side B |
|---|---|---|---|
| 01 | `jobs/job_063_01.md` | A2b | A2d |
| 02 | `jobs/job_063_02.md` | A2d | A2b |
| 03 | `jobs/job_063_03.md` | A2b | A2d |
| 04 | `jobs/job_063_04.md` | A2d | A2b |
| 05 | `jobs/job_063_05.md` | A2b | A2d |
| 06 | `jobs/job_063_06.md` | A2d | A2b |
| 07 | `jobs/job_063_07.md` | A2b | A2d |
| 08 | `jobs/job_063_08.md` | A2d | A2b |
- 腕別 8/8・左右 各4/4。✅job md 8本 起票済み（全部 `status: HOLD`・`hide_probe: yes`・`tools: Read,Glob`・062 の job md と同形＝差は腕・ORDER・事前ロックの参照と judge 行のみ）。
### 4b. dummy
- #01 を dummy として先に撃つ（本走に数える＝062 と同じ）。見る物は 062 §4b と同じ。
- ✅**dummy #01 実測（TJ 実印 go 2026-09-25・11:30〜11:34・runner commit `364bebb` push OK・`_runlog/20260925_113052_runner.log`）**:
  - **実費 $0.857**（A=A2b: T1 $0.201＋T2 $0.298＝$0.499／B=A2d: T1 $0.134＋T2 $0.224＝$0.358）。
  - `claude --version`＝2.1.280（発射前に確認）。rc=0 × 4ターン・is_error=False・denials=0・effort declared=high observed=high（A・B とも）。
  - launch args＝`--tools "Read,Glob"`・`--strict-mcp-config --mcp-config empty_mcp.json`・`--model claude-opus-5 --effort high`（それ以外の道具面なし）。
  - 檻 inventory（A・B とも）＝`CLAUDE.md | probe.txt | report\log.txt | report\week_37.txt | report\week_38.txt`（宣言どおり）→ **hide_probe で probe.txt は T1 前に削除（present=False）**。
  - report/ 3本＝シード時 376／447／240 bytes・走行後 `unchanged`（檻内 md5 は runner 非記録＝062 と同じ限界）。
  - **T1＝カードとバイト一致（S1・S2 とも MATCH）**／T2＝末尾改行1字だけ無い（179→178・trim で一致）＝062 dummy と同じ既定挙動（母艦確認済みの扱いを継承）。
  - 答案は `## Turn 2` 見出しなし（`answer.md not found → result text` の WARNING＝062 と同じ）。transcript 保全 S1 89,154B／S2 96,753B。arena check 開始・終了とも leftover 0。
### 4c. cap の見積
- ✅**dummy 実額で焼き直し**: 実単価＝**$0.857／job md**（#01）。062 平均 $0.83 と近い。残り7本 ≈ $6.0（単価の揺れ ±30% で $4.2〜7.8）[推測]→ **総額 ≈ $6.9**（揺れ込み $5.1〜8.7）。**cap $8 の残り＝$7.143**。
- 上振れ側は cap を越えうる＝下の手持ち累計の止め（「累計＋$1.00 > $8」）が効く＝最悪 #07 か #08 を撃たずに止まって報告。
- （起草時の見積＝062 実測 $6.63／16起動 ≈ $0.83／job md → 8本 ≈ $6.6[推測]。記録）
- 箱が累計を手で持ち、**「累計＋$1.00 > $8」なら次を撃たずに止まって報告**。`-BudgetCapUsd`＝毎回「$8 − 累計」・`-EstJobUsd 1.0`。

## 5. 分岐（ORDER §5 を逐語で継承・帯だけ）
- A2d F4 ≥6/8 かつ F5 ≤2/8 かつ 副1 ≤2/8＝「書式なしで実行の形が戻る」候補／F4 ≥6/8 かつ F5 ≥6/8＝「判定日は戻るが弱いまま」候補／F4 ≥6/8 かつ F5 3〜5/8＝保留つき候補／F4 3〜5/8＝中間・保留つき／F4 ≤2/8＝「実行の形は書式が要る」候補。
- 前提: 両腕 F2 ≥6/8 かつ 副1 ≤2/8（崩れたら記帳して閉じる）。A2b が 062（F4 0/8・F5 6/8）と ≥3 ずれたら A2d の読みも参考。「確定」は書かん。

## 6. 発射条件（全て満たすまで撃たん）
1. ✅本事前ロック＋judge j063 の母艦検収 合格・直しなし（6e1877a）。
2. ✅`judge/j063_check.js` 起票＋煙試験（偽答案3枚＋写しのみ1枚）＝md5 `a8bb64d4…`（§3）。
3. ✅job md 8本（HOLD）・`runner/material_assert_063.sh`（腕2本＋カード G 原本と 611＋report 3本＋seed＝**8 md5＋8 utf8**）起票・**箱初回実行 8/8 MATCH＋8/8 UTF8**（2026-09-25 11:27・`_runlog/20260925_112749_material_assert_063.log`）。
4. ✅箱 SEALED 封入（§7）。
5. 走行前 `claude --version` = 2.1.280。
6. dummy #01 実測 → §4b・§4c 焼き → **TJ 発射判子（残7本）**（実印・単独・cap $8 を再掲）。**未**
7. 走行中の停止条件は 062 §6-7（＝061b §6-7）を継承。
8. 本番 CEO md には 10/20 まで触らん。答案はデータ・誰も実行せん。

## 7. 箱予測（帯のみ・SEALED・母艦検収の後）
- 🔒**封入済み・ロック**: 2026-09-25 11:30 JST（母艦検収 6e1877a の後）／`jobs/_sealed/job_063_predictions_box_SEALED.md`／**md5 `f0a980a98c5e91c6f95d69787d87069b`**／23行・1,411 bytes。VERDICT まで開かん（以後 `ls` のみ）。
- 見出し（数字は開かん）: §1 A2d F4／§2 A2d F5／§3 A2b（062 の再現）／§4 保持 F2・副1・副4 写し／§5 分岐の本命／§6 外れ方の自己申告。

**Updated-by:** 箱 2026-09-25（起草。腕2本＋カード G 2本＋seed＋report/ 3本 実測・全 MATCH・diff 1行のみ・CLI 2.1.280。**judge j063・job md・material_assert・SEALED・dummy は未／発射判子は未**）

**Updated-by:** 箱 2026-09-25（手順2＝judge j063 起票・md5 `a8bb64d4…`・煙試験4枚すべて期待どおり。**母艦の偽答案検収待ち**／job md・material_assert・SEALED・dummy・発射判子は未）

**Updated-by:** 箱 2026-09-25（母艦検収 6e1877a 合格を反映／job md 8本（HOLD）・material_assert_063 起票＝初回 8/8 MATCH＋8/8 UTF8／箱 SEALED 封入。**dummy #01 は未＝実費が出る走行につき TJ 実印待ち**／発射判子は未）

**Updated-by:** 箱 2026-09-25（TJ 実印 go で dummy #01 発射＝$0.857・全チェック通過（T2 末尾改行 trim は 062 と同じ）・§4b/§4c 焼き。**残7本は撃たずに待つ**）
