#!/usr/bin/env bash
set -uo pipefail
PROGRESS=.batch-progress
[[ -f $PROGRESS ]] || echo 0 > $PROGRESS
DONE=$(cat $PROGRESS)
N=0
while IFS= read -r task; do
  [[ -z "$task" || "$task" == \#* ]] && continue
  N=$((N+1))
  [[ $N -le $DONE ]] && continue
  echo "=== $(date +%H:%M) [task $N] $task"
  for attempt in 1 2 3; do
    claude -p "$task Follow AGENTS.md." \
      --permission-mode acceptEdits \
      --permission-prompts none \
      --allowedTools "Read,Edit,Bash(pnpm *),Bash(git *)" && break
    echo "attempt $attempt failed, waiting 30m before retry"
    sleep 1800
  done
  pnpm check || { echo "GATE FAILED at task $N"; exit 1; }
  echo $N > $PROGRESS
done < tasks.txt
