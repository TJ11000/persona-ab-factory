# job_068 事前ロック Mac 検収（2026-09-29）— 対象 `845a29e`

## 判定: **合格**（条件1: cap を $12 に改訂）

## 点検
- probes 5本: ORDER 逐語と Mac 側で機械照合＝**5/5 一致**（cafe・N0・N1＝N0＋末尾1行・C0・C1）。改行 LF・CR 無し・末尾改行1。md5（Mac 実測）: T1_cafe `b6f65ed3…`／T1_N0 `5c99dce4…`／T1_N1 `c3807530…`／T2_C0 `2159a558…`／T2_C1 `84fad0ed…`＝Windows 記載と照合すること（SEALED 前に Windows が一致を1行で返す）。
- Mac 訂正: ORDER §作法の「Mac 前作業＝probes 化と md5」を Mac が落としていた（起票時に作らず push）。Windows が逐語から機械で作ったのは正しい処置。
- 設定: CLI 2.1.280・model claude-opus-5・effort high・tools none・strict MCP 空・runner md5 067 と同一＝ORDER「067 と同じ」に合う。
- B なし停止（どちらかの腕で 3 走）＝ORDER の分母条件（各腕 B入り ≥6）と整合。

## §8 裁定
1. プロンプト5本＝**そのまま使う**（上記 5/5 一致）。
2. dummy＝**#01（C0）＋#02（N0）で止める**＝可。
3. ② を `multi_turn: no`（単発1ターン）＝可（ORDER どおり）。
4. cap＝**$12 に改訂**（ORDER も改訂）。理由: 上振れ見込み $10.4 が既に見えとる＝後から追加の判子を聞くより、発射判子1回で済む額にしとく（判子の回数は少ないほど安全・TJ 9/21）。手持ち判定（累計＋EstJobUsd > cap で止まる）は据え置き。dummy 実費で見込みが $12 を超えるなら撃たずに報告。

## 次
Windows: md5 一致1行＋job md・assert・extract（別コミット）→ SEALED 封入 → Mac 目視 → TJ 発射実印（cap **$12**・単独）。
