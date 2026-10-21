#!/bin/bash
# memtest — 035 の檻（R1 腕・variant_L・T1→T2）を Mac の -p で 2 条件撃つ
#   C = メモリ空（素）／S = D1L05 が書いた 3 ファイルを自動メモリに置いた状態（＝1セッション目が書いた後）
#   問い: 自動メモリの申し送りは次のセッションに届いて挙動を変えるか
set -uo pipefail
SP=/private/tmp/claude-501/-Users-<user>/607852a0-4391-4c42-94de-f3eb804d970d/scratchpad
MT=$SP/memtest
PROBES=/Users/<user>/Documents/Claude/Projects/_Light_Projects/persona-ab-factory/results/035/run/probes_035
NOTES=/Users/<user>/Documents/Claude/Projects/_Light_Projects/persona-ab-factory/results/035/answers/D1L05_auto_memory_notes.md
OUT=$MT/out; mkdir -p "$OUT"
LOG=$OUT/log.txt
CE="env -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_SESSION_ID -u CLAUDE_PID -u CLAUDE_EFFORT -u CLAUDE_CODE_MESSAGING_SOCKET -u CLAUDE_CODE_BRIDGE_SESSION_ID -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_EXECPATH -u CLAUDE_CODE_MESSAGING_TOKEN"
FLAGS="--model claude-opus-5 --effort high --tools Read,Write --strict-mcp-config --mcp-config $SP/empty_mcp.json --setting-sources project --output-format json"

echo "start $(date '+%F %T') claude=$(claude --version 2>/dev/null | head -1)" > "$LOG"

build_cage(){ # $1=cage dir
  rm -rf "$1"; mkdir -p "$1"
  cp "$PROBES/variant_L.md" "$1/CLAUDE.md"
  for f in ledger_book.md report_2026-10.md tejun_getsuji.md uriage_2026-11.csv; do cp "$PROBES/$f" "$1/$f"; done
  (cd "$1" && md5 -q CLAUDE.md ledger_book.md tejun_getsuji.md uriage_2026-11.csv report_2026-10.md) > "$1/.md5_start.txt"
}
projdir_of(){ # $1=abs path → Claude Code projects dir
  local enc; enc=$(printf '%s' "$1" | sed 's#[^A-Za-z0-9]#-#g')
  printf '%s' "/Users/<user>/.claude/projects/$enc"
}
extract_md_block(){ # $1=notes file $2=heading substring → prints the fenced block body under that heading
  awk -v h="$2" '
    index($0,h)>0 && /^## /{f=1;next}
    f && /^```/{ if(inb){exit} inb=1; next }
    f && inb{print}
  ' "$1"
}
seed_memory(){ # $1=projdir
  mkdir -p "$1/memory"
  extract_md_block "$NOTES" "kitaguchi-raitensu-mishutoku.md" > "$1/memory/kitaguchi-raitensu-mishutoku.md"
  extract_md_block "$NOTES" "tejun-getsuji-shuno-5-saishiji.md" > "$1/memory/tejun-getsuji-shuno-5-saishiji.md"
  extract_md_block "$NOTES" "MEMORY.md" > "$1/memory/MEMORY.md"
  (cd "$1/memory" && wc -c *.md) >> "$LOG"
}
run_cell(){ # $1=tag $2=cage dir
  local tag=$1 cage=$2 pd sid
  pd=$(projdir_of "$cage")
  echo "[$tag] cage=$cage projdir=$pd" >> "$LOG"
  cd "$cage" || return 1
  echo "[$tag] T1 $(date '+%T')" >> "$LOG"
  $CE claude -p "$(cat "$PROBES/T1.txt")" $FLAGS > "$OUT/${tag}_T1.json" 2> "$OUT/${tag}_T1.err"
  sid=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(d.get("session_id",""))' "$OUT/${tag}_T1.json" 2>/dev/null)
  echo "[$tag] T1 done rc=$? sid=$sid $(date '+%T')" >> "$LOG"
  mkdir -p "$OUT/${tag}_cage_after_T1"; cp "$cage"/*.md "$cage"/*.csv "$OUT/${tag}_cage_after_T1/" 2>/dev/null
  if [ -z "$sid" ]; then echo "[$tag] ‼ no session_id — T2 skipped" >> "$LOG"; return 1; fi
  echo "[$tag] T2 $(date '+%T')" >> "$LOG"
  $CE claude -p "$(cat "$PROBES/T2.txt")" $FLAGS --resume "$sid" > "$OUT/${tag}_T2.json" 2> "$OUT/${tag}_T2.err"
  echo "[$tag] T2 done rc=$? $(date '+%T')" >> "$LOG"
  mkdir -p "$OUT/${tag}_cage_after_T2"; cp "$cage"/*.md "$cage"/*.csv "$OUT/${tag}_cage_after_T2/" 2>/dev/null
  # memory dir after the run + transcript
  mkdir -p "$OUT/${tag}_memory_after"; cp -R "$pd/memory" "$OUT/${tag}_memory_after/" 2>/dev/null
  ls -la "$pd" > "$OUT/${tag}_projdir_ls.txt" 2>&1
  cp "$pd/$sid.jsonl" "$OUT/${tag}_transcript.jsonl" 2>/dev/null
  echo "[$tag] saved $(date '+%T')" >> "$LOG"
}

# --- C: 素（メモリ空） ---
CAGE_C=$MT/cage35c; build_cage "$CAGE_C"; PD_C=$(projdir_of "$CAGE_C"); rm -rf "$PD_C"
run_cell C "$CAGE_C"

# --- S: D1L05 のメモを置いた状態 ---
CAGE_S=$MT/cage35s; build_cage "$CAGE_S"; PD_S=$(projdir_of "$CAGE_S"); rm -rf "$PD_S"; seed_memory "$PD_S"
run_cell S "$CAGE_S"

echo "MEMTEST_DONE $(date '+%F %T')" >> "$LOG"
