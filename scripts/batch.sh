#!/usr/bin/env bash
set -uo pipefail
while IFS= read -r task; do
  [[ -z "$task" || "$task" == \#* ]] && continue
  echo "=== $(date +%H:%M) $task"
  claude -p "$task Follow AGENTS.md." \
    --permission-mode acceptEdits \
    --permission-prompts none \
    --allowedTools "Read,Edit,Bash(pnpm *),Bash(git *)"
  pnpm check || { echo "GATE FAILED: $task"; exit 1; }
done < tasks.txt
