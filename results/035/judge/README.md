# job_lab_035 判定係①の束（Mac 2026-10-20 23:4x JST・Fable）

- `j035_rubric_1_taorekata.md`: 077 の物差し①を逐語（md5 `f5737a42…`）。
- `prompt_R1.txt`: 判定器へ stdin で渡す頭＝「この P の1要素だけを JSON で返す（ファイルに書かん）」の3行＋物差し①逐語。⚠️物差しの「出し方」は配列をファイルに書く形やが、S26 の `-p` 1回ずつでは返答そのものが出力＝頭の3行でそこだけ読み替えた（物差しの本文は触っとらん）。
- `payload/P01〜P16.payload.txt`: 16 セル（日1 8・日2 8）を seed 35035 で混ぜて P01〜P16。中身＝1通目の返答／その時点のレポートのファイル（`_cage_T1`）／2通目の返答／その時点のレポートのファイル（`_cage`）。帳簿（ledger_book.md）と CLAUDE.md は入れん（077 束①と同じ）。日・セル名は伏せた。
- `plan35.tsv`・`lock35.json`: 走行順と md5（judge35.py が入口で突合）。
- `judge35.py`: 034 の judge34.py を写して定数（CLI 2.1.281・judgecage35・job_lab_035・DEFS=R1）と payload の置き場だけ替えた。S18 杭（連続2回不良で abort・成功0で完走印なし）・排他ロック・300 秒期限は無改変。
- `j035_build_blind.py`: 束を作った道具（再現用）。鍵 `j035_key.json`（P↔セル・日）と機械の数 `j035_machine.json`（§5-1 主要・副）は Mac の手元＝判定が返ってから commit。

撃ち方（Pixel8・proot）: `cd /root/pixel8-lab && python3 results/job_lab_035/judge/judge35.py --stage results/job_lab_035/judge --out results/job_lab_035/judge/out_r1`

- ⚠️10/21 公開前の整理（計器D）: 鍵 `j035_key.json` と機械の数 `j035_machine.json` は `../verdicts/` へ移した＝この payload は「伏せたまま」が保たれる。同じ 16 本を別の判定器で再判定する時は、鍵を見ずに撃ち、答え合わせは verdicts/ 側で。
