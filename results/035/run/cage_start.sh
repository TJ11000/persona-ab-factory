#!/bin/bash
# cage_start.sh — 檻の起動を1箇所に括る（母艦承認 2026-09-05・025検収 §5-3）
#
# なぜ要るか:
#   025 run1（2026-09-04）で **CLI 2.1.259 が信頼ダイアログの選択肢の並びを反転させた**。
#   駆動は起動32秒後に**盲目Enter**を撃つ設計やったので、新版では「❯ No, exit」を選んで
#   claude が自分で終了し、檻が消えた。⇒ capture-pane が0バイト → "esc to interrupt" が
#   永遠に出ん → FAILED_SUBMIT。**12セル全部を焼くところやった。**
#   直したのは driver25.sh 1本だけで、`/root/lab5` の**19本中18本は盲目Enterのまま**残った。
#   ∴ 起動処理を**共有ファイルへ括り出す**——派生時に持って行き忘れる、が構造的に起きんくなる。
#   （`lab_lock.sh` と同じ発想。母艦裁定 2026-09-05 §5-3 で承認）
#
# ⚠️S16（HANREI・2026-09-05）に従い、**既定値は一切持たん。**
#   要る変数が無かったら**黙って動かずに止まる**。「無ければ別の候補へ」は S12 の事故装置や。
#
# 呼び手が用意するもの（変数）:
#   CLAUDE          claude の実体パス
#   MCPCFG          囮MCPの設定ファイル
#   CLEANENV        親のCLAUDE_CODE_*を剥がす env -u 列
#   HONEYPOT_LOG    囮ログの出力先
#   CAGE_CLI_FLAGS  ⭐CLIのピン（例: --model claude-opus-5 --effort high）
#                   **既定値は置かん**——S15（CLI版＝レジーム変数）で各ジョブが明示する物やから
#   LOG             駆動のログ
#   OUT             出力ディレクトリ
#   TMPPANE         snap の一時ファイル
# 呼び手が用意するもの（関数）:
#   snap <session>  ペインを $TMPPANE へ落とす
#   has  <文字列>   $TMPPANE に含まれるか
#   abort_run <理由> 走行全体を止める
#
# 使い方:
#   source /root/lab5/cage_start.sh
#   cage_start "$S" "$CAGE" "$PROJDIR" "$BASE/variant_A.md" "$CELL" || return 1

_cs_need_var(){
  local n=$1
  if [ -z "${!n+x}" ]; then
    echo "‼cage_start: 変数 $n が要る。既定値は持たん（S16）。走らずに止まる。" >&2
    return 1
  fi
}
_cs_need_fn(){
  local n=$1
  if ! declare -F "$n" >/dev/null 2>&1; then
    echo "‼cage_start: 関数 $n が要る。呼び手の駆動が持っとるはずや。走らずに止まる。" >&2
    return 1
  fi
}

cage_start(){
  local S=${1:?セッション名が要る}
  local CAGE=${2:?檻ディレクトリが要る}
  local PROJDIR=${3:?プロジェクトディレクトリが要る}
  local CLAUDEMD=${4:?装備(CLAUDE.md)の元ファイルが要る}
  local TAG=${5:?セルのタグが要る}

  local v f
  for v in CLAUDE MCPCFG CLEANENV HONEYPOT_LOG CAGE_CLI_FLAGS LOG OUT TMPPANE; do
    _cs_need_var "$v" || return 1
  done
  for f in snap has abort_run; do
    _cs_need_fn "$f" || return 1
  done
  [ -f "$CLAUDEMD" ] || { echo "  ‼MISSING_VARIANT $TAG ($CLAUDEMD)" >> "$LOG"; return 1; }

  tmux kill-session -t "$S" 2>/dev/null
  rm -rf "$CAGE"; mkdir -p "$CAGE"
  cp "$CLAUDEMD" "$CAGE/CLAUDE.md"
  rm -rf "$PROJDIR"

  # ★★版腕の受け口（母艦承認 2026-09-05・05b裁定②／028検収 §5-4 で「026の前に」と順番確定）
  #   版腕ジョブ（029）は旧版 2.1.232 を**隔離した設定**で撃つ必要がある。
  #   駆動ごとに書いたら 025 の「19本中18本が古いまま」と同じ穴が空く ⇒ ここに1回だけ置く。
  #   ⚠️**未設定なら空文字に展開される**＝既定経路のコマンド文字列は**1バイトも変わらん**。
  #     （配管REPORTで old/new の生成文字列を cmp して同一を示しとる）
  #   使い方（版腕の旧版側の例）:
  #     CAGE_CONFIG_DIR=/root/lab5/cfg_2.1.232
  #     CAGE_EXTRA_ENV="DISABLE_AUTOUPDATER=1"
  #     CLAUDE=/root/.local/share/claude/versions/2.1.232
  #   ⚠️`CLAUDE`（実体パス）と `PROJDIR`（transcriptの出先）は**元から呼び手の持ち物**や。
  #     版腕では PROJDIR を隔離側（cfg_*/projects/...）に向けること——ここでは面倒見ん。
  local _cfg="" _extra=""
  [ -n "${CAGE_CONFIG_DIR:-}" ] && _cfg="CLAUDE_CONFIG_DIR=$CAGE_CONFIG_DIR "
  [ -n "${CAGE_EXTRA_ENV:-}" ]  && _extra="$CAGE_EXTRA_ENV "
  [ -n "${_cfg}${_extra}" ] && echo "  CAGE_ENV $TAG: ${_cfg}${_extra}" >> "$LOG"

  tmux new -d -s "$S" -x 200 -y 50 \
    "cd $CAGE && HONEYPOT_LOG=$HONEYPOT_LOG ${_cfg}${_extra}$CLEANENV $CLAUDE $CAGE_CLI_FLAGS --strict-mcp-config --mcp-config $MCPCFG"
  sleep 32

  # ★★信頼ダイアログ: 盲目Enterは撃たん。カーソル（❯）が「Yes」の行に載っとることを確かめてから撃つ。
  #   （2.1.259 で既定が「❯ No, exit」に反転しとる＝盲目Enterは檻を殺す）
  # ⚠️版によってダイアログの形が違う（実測・2026-09-06）:
  #   2.1.259: 「❯ No, exit」が既定・**番号なし**   → Down 1回で Yes に載る
  #   2.1.232: 「❯ 1. Yes, I trust this folder」   → **番号付き・Yesが先頭**（移動不要）
  #   ∴ カーソル判定は `❯` と文言が**同じ行に在るか**で見る（`❯ *文言` やと `1. ` に阻まれる）。
  #   ⭐旧版で最初にこれを踏んだ時、ガードは Down で Yes を外した上で
  #     「載ってへん」と判断して**Enterを撃たずに止めた**＝盲目Enter禁止が効いた実例や。
  local TRUSTLINE="Yes, I trust this folder"
  local t=0 dlg=0
  while [ $t -lt 60 ]; do
    snap "$S"
    if has "$TRUSTLINE"; then dlg=1; break; fi
    if has "for shortcuts"; then break; fi     # 既に信頼済みで素通りした場合
    sleep 5; t=$((t+5))
  done
  if [ $dlg = 1 ]; then
    local d=0
    while [ $d -lt 4 ]; do
      snap "$S"
      grep -q "❯.*$TRUSTLINE" "$TMPPANE" && break
      tmux send-keys -t "$S" Down; sleep 2; d=$((d+1))
    done
    snap "$S"
    if grep -q "❯.*$TRUSTLINE" "$TMPPANE"; then
      tmux send-keys -t "$S" Enter; sleep 10
      echo "  TRUST accepted $TAG (moves=$d)" >> "$LOG"
    else
      tmux capture-pane -t "$S" -p -S -80 > "$OUT/${TAG}_TRUST_FAIL.txt"
      echo "  ‼‼TRUST_CURSOR_LOST $TAG — 「Yes」にカーソルが載らん。Enterは撃たん。" >> "$LOG"
      abort_run "信頼ダイアログでカーソルを「Yes」に載せられんかった（$TAG）。盲目Enterは撃たん。"
      return 1
    fi
  fi
  tmux send-keys -t "$S" Escape; sleep 4

  # ★★檻の生存ガード。檻が死んどるのに走り続けるのは、セッション上限と**同じ型の異常**や。
  #   「1セル不良や、次行こか」で済ませたらあかん——不良セルの量産と枠の空焼きになる。
  if ! tmux has-session -t "$S" 2>/dev/null; then
    echo "  ‼‼CAGE_DEAD $TAG — 檻が起動直後に死んどる。" >> "$LOG"
    abort_run "檻が起動直後に死んだ（$TAG）。残りのセルは走らせん——不良セルの量産を避ける。"
    return 1
  fi
  tmux capture-pane -t "$S" -p > "$OUT/${TAG}_00ready.txt"
  if [ ! -s "$OUT/${TAG}_00ready.txt" ]; then
    echo "  ‼‼CAGE_EMPTY $TAG — 檻のペインが空や。" >> "$LOG"
    abort_run "檻のペインが空（$TAG）。残りのセルは走らせん。"
    return 1
  fi

  # ★★準備完了ガード（母艦承認 2026-09-06・条件付き）
  #   ⚠️生存ガード（has-session＋ペイン非空）は**檻が使えん時でも通ってまう**。
  #     実例: 旧版 2.1.232 を隔離した新設定dirで起動すると初回オンボーディング
  #     （テーマ選択→ログイン方法の選択）に入る。セッションは生きとるしペインも空やない。
  #     ∴ rc=0 が返り、駆動はプローブを撃ちに行って全セル不良にする——025の盲目Enterと同型や。
  #   ∴ **入力欄が実際に出とるか**を確かめてから返す。
  #   目印は両版の実物から採った（推測やない）:
  #     2.1.259: `❯ Try "how do I log an error?"` / `⏵⏵ auto mode on … · ← for agents`
  #     2.1.232: `❯ Try "how do I log an error?"` / `⏸ manual mode on · ? for shortcuts · ← for agents`
  #   詰まっとるペイン（テーマ選択・ログイン選択・信頼ダイアログ）には**どれも出てへん**。
  local rdy=0 rt=0
  while [ $rt -lt 60 ]; do
    snap "$S"
    if has 'Try "' || has "for agents" || has "for shortcuts"; then rdy=1; break; fi
    sleep 5; rt=$((rt+5))
  done
  if [ $rdy != 1 ]; then
    tmux capture-pane -t "$S" -p -S -120 > "$OUT/${TAG}_NOT_READY.txt"
    echo "  ‼‼CAGE_NOT_READY $TAG — 檻は生きとるが入力欄が出とらん（オンボーディング等で詰まっとる）。" >> "$LOG"
    abort_run "檻が使える状態にならん（$TAG）。残りのセルは走らせん——不良セルの量産を避ける。"
    return 1
  fi
  return 0
}
