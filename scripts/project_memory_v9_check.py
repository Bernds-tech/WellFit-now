#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
ROOT=Path(__file__).resolve().parents[1]
PM=ROOT/'project-memory'
errors=[]
for name in ['PROJECT_COORDINATION.json','REAL_WORK_BASELINE_2026-08-19.md','FINISHLINE_STATE.json','PROTOCOL.md','AUTO_HANDOFF.md','NEXT_BEST_ACTION.md','CURRENT_STATE.md']:
    p=PM/name
    if not p.exists() or not p.read_text(encoding='utf-8').strip(): errors.append('missing-or-empty:'+name)
try:
    c=json.loads((PM/'PROJECT_COORDINATION.json').read_text())
    if c.get('repository')!='Bernds-tech/WellFit-now': errors.append('coordination-repository-invalid')
    if c.get('program_master')!='Bernds-tech/WellFit:project-memory/WELLFIT_MASTER_STATE.json': errors.append('coordination-master-invalid')
    if c.get('local_role')!='technical_product': errors.append('coordination-role-invalid')
    state=json.loads((PM/'FINISHLINE_STATE.json').read_text())
    if state.get('project_role')!='technical_product': errors.append('finishline-role-invalid')
    if any(v.get('state')=='UNASSESSED' for v in state.get('gates',{}).values()): errors.append('real-finishline-still-unassessed')
except Exception as e: errors.append('coordination-or-state-json-invalid:'+str(e))
protocol=(PM/'PROTOCOL.md').read_text(encoding='utf-8') if (PM/'PROTOCOL.md').exists() else ''
for token in ['Protocol v9','V9 — Multi-repository orchestration','Never create a competing program-level master']:
    if token not in protocol: errors.append('protocol-v9-token-missing:'+token)

handoff=(PM/'AUTO_HANDOFF.md').read_text(encoding='utf-8') if (PM/'AUTO_HANDOFF.md').exists() else ''
for token in ['Role: technical product authority','Program master: `Bernds-tech/WellFit:project-memory/WELLFIT_MASTER_STATE.json`','Before answering project-state questions or proposing/executing work, read Project Memory first','Chat memory or claims from another session are navigation hints only, never Source of Truth','General technical application/mobile logic remains here']:
    if token not in handoff: errors.append('auto-handoff-v9-token-missing:'+token)
next_action=(PM/'NEXT_BEST_ACTION.md').read_text(encoding='utf-8') if (PM/'NEXT_BEST_ACTION.md').exists() else ''
m=re.search(r"Selected action: `([^`]+)`", next_action)
if not m or f"Current next action: `{m.group(1)}`" not in handoff: errors.append('auto-handoff-next-action-stale')
current_state=(PM/'CURRENT_STATE.md').read_text(encoding='utf-8') if (PM/'CURRENT_STATE.md').exists() else ''
state_action=re.search(r"(?m)^- Selected local action: `([^`]+)`\s*$", current_state)
if not state_action:
    errors.append('current-state-selected-action-missing')
elif not m or state_action.group(1)!=m.group(1):
    errors.append('current-state-next-action-mismatch')
agents=(ROOT/'AGENTS.md').read_text(encoding='utf-8') if (ROOT/'AGENTS.md').exists() else ''
for token in ['## 0. Mandatory project-memory preflight','Before answering project-state questions','project-memory/AUTO_HANDOFF.md','This repository is the WellFit technical-product authority','Chat memory is a navigation hint only','Do not infer general technical mobile/application ownership from the Buddy repository']:
    if token not in agents: errors.append('agents-project-memory-entry-token-missing:'+token)

if errors:
    print('PROJECT_MEMORY_V9_RESULT=failed')
    [print('PROJECT_MEMORY_V9_ERROR='+e) for e in errors]
    sys.exit(1)
print('PROJECT_MEMORY_V9_RESULT=passed')
