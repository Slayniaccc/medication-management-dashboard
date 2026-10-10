#!/usr/bin/env bash
set -euo pipefail
claude -p "$1 Follow AGENTS.md." \
  --permission-mode acceptEdits \
  --allowedTools "Read,Edit,Bash(pnpm *),Bash(git *)"
pnpm check
