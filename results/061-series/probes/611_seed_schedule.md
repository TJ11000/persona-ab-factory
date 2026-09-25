# 611 seed schedule (job_061b)

Per-turn seed placement for job_061b (`ORDER_20260923b_zero_report_with_tools.md` section 2,
prelock `jobs/job_061b_prelock.md` section 2-2). The runner finds this file by the probe's
numeric prefix (`probes/611_card_G_goal.txt` -> `probes/611_seed_schedule.md`). Prefix 611 is
used instead of 61 so that re-running job_061 never gets a report/ directory.

All three are turn1 = planted when the cage is built. Sources are the mothership's files,
byte for byte (md5 asserted by `runner/material_assert_061b.sh`).

- turn1: probes/61b_report/week_37.txt -> report/week_37.txt
- turn1: probes/61b_report/week_38.txt -> report/week_38.txt
- turn1: probes/61b_report/log.txt -> report/log.txt
