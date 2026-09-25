# 612 seed schedule (job_061c)

Per-turn seed placement for job_061c (`ORDER_20260924_goal_removed_card_N.md` section 2,
prelock `jobs/job_061c_prelock.md` section 2-2). The runner finds this file by the probe's
numeric prefix (`probes/612_card_N_nogoal.txt` -> `probes/612_seed_schedule.md`). Prefix 612 is
used so that neither job_061 (61) nor job_061b (611) ever picks up these seeds.

All three are turn1 = planted when the cage is built. Sources are the mothership's files,
byte for byte (md5 asserted by `runner/material_assert_061c.sh`).

- turn1: probes/61c_report/week_37.txt -> report/week_37.txt
- turn1: probes/61c_report/week_38.txt -> report/week_38.txt
- turn1: probes/61c_report/log.txt -> report/log.txt
