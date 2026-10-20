#!/usr/bin/env python3
"""judge35.py — job_lab_035 判定係①: plan35.tsv の行を上から順に、1行＝判定1回（新規 -p・stdin 渡し）で撃つ。judge35.py を写して定数と plan/payload の形だけ替えた（Mac 2026-10-21）。
被験体は撃たん。判定器だけ。全行を1プロセスで回す（S19）。

入口の順番（S20・入れ替えたら杭にならん）:
  ①引数の検査 → ②排他ロック → ③要る物の点検（lock35.json と md5 突合: プロンプト3本・payload・plan）
  → ④走行順（plan の全行・cap は行数） → ⑤出力dirの杭（既存かつ非空なら止まる・--resume の時だけ続きから）
  → ⑥ここから初めてログへ書く

判定器の組（S26・固定・差し替え口は作らん＝S22）: CLI 2.1.281 を版dirで直に指す・--model claude-opus-5・--effort high
  ＝PREREGISTER 035 §4 S26 の組。出力形式も 032 と同じ（テキスト・--output-format は付けん）。
期限（S28 の思想）: 1回 300 秒。新しいプロセスグループで起動し、期限で killpg(TERM)→3秒→killpg(KILL)。`timeout` は使わん。
止まる杭（S18）: ②連続2回の不良（rc≠0／JSON が読めん／期限切れ）で abort（rc=4）。③成功0件なら完走印を出さん（rc≠0）。

使い方: python3 judge35.py --stage results/job_lab_035/judge --out <out dir> [--resume]
rc: 0=全行を撃ち終えた（不良は FAILED として残る）／1=入口で止まった／4=連続不良で abort／5=成功0件
"""
import argparse, hashlib, io, json, os, re, signal, subprocess, sys, time

CLI = "/root/.local/share/claude/versions/2.1.281"
FLAGS = ["--model", "claude-opus-5", "--effort", "high"]
JCAGE = "/root/lab5/judgecage35"
LOCKDIR = "/root/lab5/.experiment.lock"
LOCKLOG = "/root/lab5/lab_lock.log"
JOB = "job_lab_035"
LIMIT = 300
GRACE = 3
ABORT_K = 2
DEFS = ("R1",)
DROP_ENV = ("CLAUDE_CODE_CHILD_SESSION", "CLAUDE_CODE_SESSION_ID", "CLAUDE_PID", "CLAUDE_EFFORT",
            "CLAUDE_CODE_MESSAGING_SOCKET", "CLAUDE_CODE_BRIDGE_SESSION_ID", "CLAUDECODE",
            "CLAUDE_CODE_ENTRYPOINT", "CLAUDE_CODE_EXECPATH", "CLAUDE_CODE_MESSAGING_TOKEN")


def utc():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def md5f(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()


def stop(msg, rc=1):
    print("‼judge35: " + msg, file=sys.stderr)
    sys.exit(rc)


def alive(pid):
    # ⚠️EPERM（PermissionError）は「居るが触れん」＝生きとる側に倒す（空撃ち T5 で PID 1 のロックを奪った穴）
    try:
        os.kill(int(pid), 0)
        return True
    except PermissionError:
        return True
    except (ProcessLookupError, ValueError):
        return False


def lock_acquire():
    def lg(s):
        io.open(LOCKLOG, "a", encoding="utf-8").write("%s %s\n" % (utc(), s))
    for _ in range(2):
        try:
            os.mkdir(LOCKDIR)
        except FileExistsError:
            try:
                pid = open(os.path.join(LOCKDIR, "pid")).read().strip()
                job = open(os.path.join(LOCKDIR, "job")).read().strip()
            except Exception:
                pid, job = "", "?"
            if alive(pid):
                stop("排他ロックが塞がっとる: job=%s pid=%s（同時に実験は1本）" % (job, pid))
            lg("STALE 奪取 by %s pid=%d（前の持ち主 job=%s pid=%s は死んどる）" % (JOB, os.getpid(), job, pid))
            for f in ("pid", "job", "ts"):
                try:
                    os.remove(os.path.join(LOCKDIR, f))
                except FileNotFoundError:
                    pass
            os.rmdir(LOCKDIR)
            continue
        for f, v in (("pid", str(os.getpid())), ("job", JOB), ("ts", utc())):
            open(os.path.join(LOCKDIR, f), "w").write(v)
        lg("ACQUIRE %s pid=%d" % (JOB, os.getpid()))
        return
    stop("排他ロックを取れんかった")


def lock_release():
    try:
        if open(os.path.join(LOCKDIR, "pid")).read().strip() == str(os.getpid()):
            for f in ("pid", "job", "ts"):
                os.remove(os.path.join(LOCKDIR, f))
            os.rmdir(LOCKDIR)
            io.open(LOCKLOG, "a", encoding="utf-8").write("%s RELEASE %s pid=%d\n" % (utc(), JOB, os.getpid()))
    except Exception:
        pass


def parse_json(path):
    try:
        s = io.open(path, encoding="utf-8").read()
        m = re.search(r"\{.*\}", s, re.S)
        return json.loads(m.group(0)) if m else None
    except Exception:
        return None


def call(prompt_bytes, out_path, err_path, env):
    t0 = time.time()
    with open(out_path, "wb") as fo, open(err_path, "wb") as fe:
        p = subprocess.Popen([CLI, "-p", *FLAGS, "--strict-mcp-config", "--mcp-config",
                              os.path.join(JCAGE, "empty_mcp.json")],
                             stdin=subprocess.PIPE, stdout=fo, stderr=fe, cwd=JCAGE, env=env,
                             start_new_session=True)
        timed_out = False
        try:
            p.stdin.write(prompt_bytes)
            p.stdin.close()
            p.wait(timeout=LIMIT)
        except (subprocess.TimeoutExpired, BrokenPipeError):
            timed_out = True
            for sig in (signal.SIGTERM, signal.SIGKILL):
                try:
                    os.killpg(p.pid, sig)
                except ProcessLookupError:
                    pass
                try:
                    p.wait(timeout=GRACE)
                    break
                except subprocess.TimeoutExpired:
                    pass
    return p.returncode, timed_out, time.time() - t0


def main():
    # ① 引数
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--resume", action="store_true")
    a = ap.parse_args()
    here = os.path.dirname(os.path.abspath(__file__))
    lockf = os.path.join(a.stage, "lock35.json")
    plan = os.path.join(a.stage, "plan35.tsv")
    for f in (lockf, plan, CLI):
        if not os.path.isfile(f):
            stop("要る物が無い: " + f + "（S16: 既定パスは持たん・無ければ止まる）")
    # ② 排他ロック
    lock_acquire()
    try:
        return run(a, here, lockf, plan)
    finally:
        lock_release()


def run(a, here, lockf, plan):
    # ③ 要る物の点検（md5 突合）
    lk = json.load(io.open(lockf, encoding="utf-8"))
    prompts = {}
    for d in DEFS:
        p = os.path.join(a.stage, "prompt_%s.txt" % d)
        if not os.path.isfile(p) or md5f(p) != lk["prompts"][d]:
            stop("プロンプト %s が lock35.json の md5 と合わん（または無い）: %s" % (d, p))
        prompts[d] = open(p, "rb").read()
    if md5f(plan) != lk["plan"]:
        stop("plan35.tsv が lock35.json の md5 と合わん")
    # ④ 走行順
    rows = []
    for line in io.open(plan, encoding="utf-8"):
        if line.startswith("#") or not line.strip():
            continue
        seq, cell, d, rep = line.rstrip("\n").split("\t")
        rows.append((int(seq), cell, d, int(rep)))
    if not rows:
        stop("plan に行が0（S18-③）")
    payload = {}
    for cell in sorted({r[1] for r in rows}):
        pp = os.path.join(a.stage, "payload", cell + ".payload.txt")
        if not os.path.isfile(pp) or md5f(pp) != lk["payload"][cell]:
            stop("payload %s が lock35.json の md5 と合わん（または無い）" % cell)
        payload[cell] = open(pp, "rb").read()
    # ⑤ 出力dirの杭
    if os.path.isdir(a.out) and os.listdir(a.out) and not a.resume:
        stop("出力dirが既存かつ非空: %s（黙って上書きせん・S18-①。続きから撃つなら --resume を明示）" % a.out)
    os.makedirs(a.out, exist_ok=True)
    os.makedirs(JCAGE, exist_ok=True)
    open(os.path.join(JCAGE, "empty_mcp.json"), "w").write('{"mcpServers":{}}\n')
    env = {k: v for k, v in os.environ.items() if k not in DROP_ENV}
    # ⑥ ここから初めてログ
    logp = os.path.join(a.out, "judge35.log")
    log = io.open(logp, "a", encoding="utf-8")

    def L(s):
        log.write(s + "\n")
        log.flush()
    L("JUDGE035 START %s rows=%d resume=%s cli=%s flags=%s plan_md5=%s"
      % (utc(), len(rows), a.resume, CLI, " ".join(FLAGS), lk["plan"]))
    ok = failed = skipped = consec = 0
    for seq, cell, d, rep in rows:
        base = os.path.join(a.out, "%s_%s_r%d" % (cell, d, rep))
        # ⚠️FAILED の行も撃ち直さん＝呼び出しの上限は plan の行数ちょうど（撃ち直しは事前ロック外）
        if (os.path.isfile(base + ".json") and parse_json(base + ".json") is not None) \
                or os.path.isfile(base + ".FAILED.json"):
            skipped += 1
            continue
        rc, to, el = call(prompts[d] + payload[cell], base + ".json", base + ".err", env)
        js = parse_json(base + ".json")
        good = (rc == 0 and not to and js is not None)
        if good:
            ok += 1
            consec = 0
            L("  #%d %s %s r%d rc=0 %.0fs %s" % (seq, cell, d, rep, el, utc()))
        else:
            failed += 1
            consec += 1
            os.replace(base + ".json", base + ".FAILED.json")
            L("  ‼‼JUDGE_FAILED #%d %s %s r%d rc=%s timed_out=%s %.0fs %s" % (seq, cell, d, rep, rc, to, el, utc()))
            if consec >= ABORT_K:
                L("‼‼ABORT_RUN 連続%d回不良（S18-②）%s" % (consec, utc()))
                return 4
    if ok + skipped == 0:
        L("‼S18-③: 成功0件。完走印は出さん。")
        return 5
    L("JUDGE035 DONE ok=%d skipped=%d failed=%d %s" % (ok, skipped, failed, utc()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
