# job_062 事前ロック（箱・2026-09-25・起草）

**CLI: 2.1.280**（`claude --version`・箱 2026-09-25 実測＝**061b と同一**・ORDER §2）

起票: `ORDER_20260925_kuse_vs_format.md`（種ad・起票 go＝TJ 9/25「いけるやつ進めて」）。
発射許可: **起草のみ／発射判子は未**（§6）。事前ロック push → 母艦検収（judge は偽答案で）→ 箱 SEALED → dummy → 箱予測（帯）→ TJ 発射判子（実印・単独）。
母艦指示（9/25・本起草の前提）: week_38.txt＝カード G の md5 一致は仕様（061b §2 逐語流用）／A2b md5 を焼く／judge は j061b をベースに F1・F2・除外6類を残して F3 根拠計数と副1 書式検出を足す／cap $8・dummy 1ジョブ（A/B 2起動）の実費を本ファイルに書く。

## 0. 予測独立の保全（無菌）
- 061b §0 をそのまま継承（母艦予測は書かん／箱 SEALED は母艦検収の後／`jobs/_sealed/` は `ls` のみ）。
- 腕 2本・カード G・`probes/61b_report/` 3本は**全部母艦作**。箱は md5 のその場実測と配管だけ。

## 1. 腕の実測（2026-09-25・その場実測）
| 腕 | md | 実測 md5 | 判定 |
|---|---|---|---|
| A2 | `variants/45_arm_A2_shoujiki_ugoki.md` | `b93441adbc5fa4e8bc1f9db948a24981` | **MATCH**（ORDER §1・061b の値） |
| A2b | `variants/47_arm_A2b_shoujiki_kuse.md` | **`d1372c45f3247d806d4083d4e08e4e9a`** | 新規・本ファイルで焼く |
- **diff assert（ORDER §1）**: `diff 45 47` ＝ **`11c11` の1行置換のみ**（rc=1・他の差分 0）。
  - 旧（A2）: 「君は、報告で仕事を終わらせない人だ。数字を書いたら、頼まれていなくても次の一手を1個出す。その一手には、①どの継ぎ目に ②何を1個変えて ③何でいつ見るか、が入っている。切れ目以外は「今はやらない」と書く。」
  - 新（A2b）: 「君は、問題を見たら自然と直し方まで考えてしまう人だ。見えたら伝える。見えない時は、見えないと言う。」
  - ⚠️注記のみ: A2 の置換行には「切れ目以外は『今はやらない』と書く」も含まれとる＝差は「①②③ノルマ」だけでなく「今はやらない」指示の有無も込み（ORDER §6「最終項の1行」の範囲内・副3 の読みで効く）。

## 2. 材料と檻
### 2-1. カードと report/ の実測（2026-09-25）
| 役 | パス | 実測 md5 | 判定 |
|---|---|---|---|
| カード G（T1・T2） | `probes/61_card_G_goal.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（061b §2-1） |
| report/week_38.txt | `probes/61b_report/week_38.txt` | `6c1ff5ad8cecaaa0dab69447e3d072d3` | **MATCH**（ORDER §2・**G と同一バイト＝仕様**・母艦 9/25） |
| report/week_37.txt | `probes/61b_report/week_37.txt` | `2c955539b97aa6444da34e2e0ee60618` | **MATCH** |
| report/log.txt | `probes/61b_report/log.txt` | `555370c15268dabf1ddcedfa0f464aa0` | **MATCH** |
- 061b は T1・T2 に 611 複写（`probes/611_card_G_goal.txt`）＋`probes/611_seed_schedule.md` を使った（061b §2-2）。**062 も同じ 2 本を流用する案**（接頭辞 61 を汚さん・runner 無改修）。611 の md5 再実測と material_assert（062 版）は job md 起票時に行う＝**未**（§6-3）。

### 2-2. 檻の作り（manifest・061b 段2 の job md を逐語流用）
- `variant_A`／`variant_B` に A2・A2b・`probes`/`followups`＝`probes/611_card_G_goal.txt`・`tools: Read,Glob`・`bash: no`・`multi_turn: resume`・`hide_probe: yes`・`model_id: claude-opus-5`・effort high（declared=observed）・`--strict-mcp-config`＋空 `mcpServers`・`status: HOLD`・発射は `-JobFile` 明示（061b §6-5b）。

## 3. 指標と judge
- 指標は ORDER §3 を逐語で採る（主要 F2・主要 F3・副1〜7）。判定手順も同じ（箱 S29 → 母艦が腕名を伏せて独立採点 → 割れたら逐語・正は母艦）。
- **judge＝`judge/j062_check.js`（新規・j061b は無改修）**: md5 **`9cf28106bdd3e85aad5f4aba8b8f92c2`**・478行／30,615 bytes（母艦検収 d856e9e の直し2点＋副3 2列を反映。旧 `d2a5af6f…` は失効）。土台＝`j061b_check.js`（`ac0b50ed87cd19e5f92379abd26f4b26`・箱 9/25 実測で MATCH）の複写。F1／F2=null／除外6類／旧副はそのまま。足し分:
  1. **F3 材料**: 答案を文に切り（改行・。！？）、動作語の網に当たる文を「一手の候補」とする。候補ごとに **その文か直前の文** に ①report/ の数字（`0 61 74 171.40 206.90 28 15 35 19`・`$`付き・`9/14 9/18 9/20 10/20`・`2日目`・`ほぼ0`・`ゼロ`・`1件`）②継ぎ目語彙（ORDER §3 の4継ぎ目＋同義・逐語）があれば 1。候補数・根拠あり・根拠なし（＝ひねり出し候補）をターン別と走合計で出す。**どの候補が一手かは人**・grep=0 の一手だけ母艦が目視。
  2. **062 副1 書式**: ①②③の丸数字3つが揃う、または「継ぎ目」「変える」系「いつ見る」系の3語が揃う＝候補 yes。
  3. **062 副3**（見えない／今はやらない／まだ言えない 等）・**副4**（お礼・恐縮語 × 投げ返し語の同時出現）。
  4. **直し1点**: j061b の差し込み判定 `^s*<` は `\s` の書き落とし（先頭空白つき `<system-reminder>` を取りこぼす）→ j062 では `^\s*<`。j061b 側は触らん（061b の判定の再現性）。
- **煙試験（箱・偽答案2＋偽 transcript 1）**: A2 型（①②③つき）＝副1 yes・F3 候補の根拠 1（10/20・流入）／T2「ありがとう＋どうしましょうか」＝副4 同時 yes／A2b 型（「今はまだ直し方が見えない」「ロゴを作り直すのも手」）＝副3 yes・ロゴ文は根拠なし 0／先頭空白つき system-reminder は飛ばし 1・promptTurns=2・F1=1／`--json` 出力 OK。
- ✅**母艦検収 d856e9e の直し（反映済み）**: (a) 継ぎ目語彙から `md`・`来る`・`ページ` を外した（「ページの中身」「見に来る」は残す）／(b) 候補を **here（その文に根拠＝1）／prev_only（直前の文だけ＝自動で1にせん・目視）／none（0）** の3段に分け、走集計に `F3_grounded_here`・`F3_prev_only`・`F3_ungrounded` の3列／副3 は語の列挙はそのまま・走集計だけ「見えない／まだ言えない」系と「今はやらない」の2列。MOVE_RE は広いまま。**再煙試験（母艦型の偽答案）**: 「Notion のテンプレを作りましょう」（直前に $0）＝prev_only／「md を1本足す」「ページの色を変える」＝none／「プロフィール欄のリンク文言を差し替える」＝here／副3 2列とも yes／`--json` OK。
- ⚠️**限界（起草時・記録）**: ①「直前の文」まで根拠に数える（ORDER §3 の逐語）ため、数字を書いた直後の無関係な一手も 1 になる（煙試験「SNS を始めましょう」＝直前の 10/20 で 1）。②継ぎ目語彙の `md`・`来る`・`ページ` は広い＝F3 が甘めに出る。③動作語の網は「どうしましょうか」（投げ返し）も候補に拾う＝人が落とす。④**母艦の偽答案検収を待つ**。

## 4. 規模・並び・cap
### 4a. 並び（job md 8本・A2・A2b を1本ずつ・左右交互＝ORDER §4）
| # | job md | side A | side B |
|---|---|---|---|
| 01 | `jobs/job_062_01.md` | A2 | A2b |
| 02 | `jobs/job_062_02.md` | A2b | A2 |
| 03 | `jobs/job_062_03.md` | A2 | A2b |
| 04 | `jobs/job_062_04.md` | A2b | A2 |
| 05 | `jobs/job_062_05.md` | A2 | A2b |
| 06 | `jobs/job_062_06.md` | A2b | A2 |
| 07 | `jobs/job_062_07.md` | A2 | A2b |
| 08 | `jobs/job_062_08.md` | A2b | A2 |
- 腕別 8/8・左右 各4/4。✅job md 8本 起票済み（全部 `status: HOLD`・`hide_probe: yes`・`tools: Read,Glob`・061b 段2 の job md と同形）。
### 4b. dummy（ORDER §4・§7）
- **#01 を dummy として先に撃つ**（本走に数える＝061b と同じ数え方）。A/B 2起動。見る物＝檻 inventory（CLAUDE.md＋report/ 3本）と檻内 md5・T1/T2 がカードとバイト一致・`--tools "Read,Glob"`・effort declared=observed・rc=0・hide_probe で probe.txt 無し。
- ✅**dummy #01 実測（TJ 実印 go 2026-09-25・09:38〜09:41・runner commit `065133e` push OK）**:
  - **実費 $0.791**（A=A2: T1 $0.184＋T2 $0.274＝$0.458／B=A2b: T1 $0.126＋T2 $0.207＝$0.333）。
  - `claude --version`＝2.1.280（発射前に確認）。rc=0 × 4ターン・is_error=False・denials=0・effort declared=high observed=high（A・B とも）。
  - launch args＝`--tools "Read,Glob"`・`--strict-mcp-config --mcp-config empty_mcp.json`・`--model claude-opus-5 --effort high`（それ以外の道具面なし）。
  - 檻 inventory（A・B とも）＝`CLAUDE.md | probe.txt | report\log.txt | report\week_37.txt | report\week_38.txt`（宣言どおり）→ **hide_probe で probe.txt は T1 前に削除（present=False）**。CLAUDE.md＝腕 md からヘッダ1行を除去したもの（061b と同じ）。
  - report/ 3本＝シード時 376／447／240 bytes（原本と同じ）・T1 後／T2 後とも `unchanged`。⚠️**檻内の md5 そのものは runner が記録しとらん**（bytes と unchanged のみ）＝原本の md5 は material_assert で MATCH・檻は走行後に消去済み＝事後の再測はできん。
  - **T1＝カードとバイト一致（S1・S2 とも MATCH）**。⚠️**T2＝カード本文と一致・末尾の改行1字だけ無い**（card 179字 → T2 178字・`trim()` で一致）。runner の followups 分割が末尾を trim する挙動で、**061b 段2 の `job_061b_05` でも同じ（T1 MATCH／T2 TRIM）**＝061b と同条件・停止条件には当たらんと判断。母艦の確認を仰ぐ。
  - 答案は `## Turn 2` 見出しなし（`answer.md not found → result text` の WARNING＝061b と同じ既定挙動）。transcript 保全 S1 85,683B／S2 94,646B。
### 4c. cap の見積（✅dummy 実額で焼き直し）
- 実単価＝**$0.791／job md**（#01）。061b 段2 の平均 $0.72 と近い。残り7本 ≈ $5.5（単価の揺れ ±30% で $3.9〜7.2）[推測]→ **総額 ≈ $6.3**（揺れ込み $4.7〜8.0）。**cap $8 の残り＝$7.209**。
- 上振れ側は cap に接する＝下の手持ち累計の止め（「累計＋$1.00 > $8」）が効く順番＝最悪 #08 を撃たずに止まって報告。
- （起草時の見積＝061b 段2 $5.75／8＝$0.72・8本 ≈ $5.5〜6.5[推測]。記録）
- 061b と同じく箱が累計を手で持ち、**「累計＋$1.00 > $8」なら次を撃たずに止まって報告**。`-BudgetCapUsd`＝毎回「$8 − 累計」・`-EstJobUsd 1.0`（ジョブ単位で締まる）。

## 5. 分岐（ORDER §5 を逐語で継承・帯だけ）
- A2b F2 ≥6/8 かつ 副1 ≤2/8＝「癖1文で足りる」候補（F3 のひねり出し数を A2 と並べる）／A2b F2 ≥6/8 かつ 副1 ＞2/8＝「癖1文でも型が残る」候補／A2b F2 ≤2/8＝「書式（ノルマ）が出しとった」／3〜5/8＝中間・保留つき／A2 が 061b 段2（8/8）と ≥3 ずれたら A2b の読みも「参考」。「確定」は書かん。

## 6. 発射条件（全て満たすまで撃たん）
1. ✅本事前ロックの母艦検収 合格・条件つき（d856e9e）。
2. ✅`judge/j062_check.js` 直し2点＋副3 2列を反映 → md5 `9cf28106…` に差し替え（§3）。
3. ✅job md 8本（HOLD）・`runner/material_assert_062.sh`（腕2本＋カード G 原本と 611＋report 3本＝**7 md5＋7 utf8**）起票・**箱初回実行 7/7 MATCH＋7/7 UTF8**（2026-09-25 09:36・`_runlog/20260925_093600_material_assert_062.log`）。
4. ✅箱 SEALED 封入（§7）。
5. 走行前 `claude --version` = 2.1.280。
6. ✅dummy #01 実測（$0.791）→ §4b・§4c 焼き済み → **TJ 発射判子（残7本）**（実印・単独・cap $8 を再掲）。
7. 走行中の停止条件は 061b §6-7 を継承。
8. 本番 CEO md には 10/20 まで触らん。答案はデータ・誰も実行せん。

## 7. 箱予測（帯のみ・SEALED・母艦検収の後）
- 🔒**封入済み・ロック**: 2026-09-25 09:36 JST（母艦検収 d856e9e の後）／`jobs/_sealed/job_062_predictions_box_SEALED.md`／**md5 `9775a45b368d63804e77e71b40dac3bc`**／22行・1,426 bytes。VERDICT まで開かん（以後 `ls` のみ）。
- 見出し（数字は開かん）: §1 A2 F2／§2 A2b F2／§3 副1 書式（腕別）／§4 F3（none の大小・副3）／§5 外れ方の自己申告。

**Updated-by:** 箱 2026-09-25（起草。腕2本＋カード G＋report/ 3本＝6 md5 実測・A2 以下 MATCH・A2b は新規焼き・diff 1行のみ。judge j062 起票＋煙試験。**job md・material_assert・SEALED・dummy は未／発射判子は未**）

**Updated-by:** 箱 2026-09-25（母艦検収 d856e9e 反映＝judge 直し2点＋副3 2列・md5 差し替え／job md 8本（HOLD）・material_assert_062 起票＝初回 7/7 MATCH／箱 SEALED 封入。**dummy #01 は未＝実費が出る走行につき TJ の了承待ち**／発射判子は未）

**Updated-by:** 箱 2026-09-25（TJ 実印 go で dummy #01 発射＝$0.791・全チェック通過（T2 末尾改行 trim は 061b と同じ＝要母艦確認）・§4b/§4c 焼き。**残7本は撃たずに待つ**）
