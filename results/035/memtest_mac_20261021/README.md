# memtest_mac_20261021 — do the D1L05 auto-memory notes reach a later session? (Mac, `claude -p`, 2026-10-21)

Four runs on a Mac (Claude Code 2.1.293, `claude-opus-5`, effort high, tools Read/Write, empty MCP, `--setting-sources project`), same five cage files as 035 (byte-identical, md5 in `../run/probes_035/_expect_md5.tsv`), T1 then T2 via `--resume`.

- **C** = empty auto-memory. **S** = the three files D1L05 wrote (`../answers/D1L05_auto_memory_notes.md`, verbatim) placed in the cage's auto-memory directory before T1.
- `run1_nowrite/` = first pass, run by mistake without write permission (both C and S could not write files; judged from the reply text only). `run2_acceptEdits/` = second pass with `--permission-mode acceptEdits` (files written).
- Per run: `*_T1.json`/`*_T2.json` (reply text, turns, permission denials), `*_tool_calls.tsv` (every tool call from the transcript), `*_memory_index_loaded.txt` (whether the MEMORY.md index text appears in the transcript), `*_cage_after_T1/`・`*_cage_after_T2/` (cage files), `*_memory_after/` (auto-memory dir after T2), `log.txt`.
- Seen: the index was loaded in both S runs; S1 read both note bodies during T1 and filled 1,987 at T1; S2 read one body at T2 and filled at T2 ("ご判断は済んでいますので、作業はこれで完了です"); C2 filled at T2; C1 (no write) refused at T2. Neither C run wrote to auto-memory. n = 2 per condition; the connector (`-p` + `--resume`) and CLI version differ from 035 (TUI, 2.1.281).
- Paths are scrubbed (`/Users/<user>`). Scripts: `run_memtest.sh` (pass 1), `run_memtest2.sh` (pass 2).
