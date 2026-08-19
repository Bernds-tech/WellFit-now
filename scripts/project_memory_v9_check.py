#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT=Path(__file__).resolve().parents[1]
PM=ROOT/'project-memory'
errors=[]
for name in ['PROJECT_COORDINATION.json','REAL_WORK_BASELINE_2026-08-19.md','FINISHLINE_STATE.json','PROTOCOL.md']:
    p=PM/name
    if not p.exists() or not p.read_text(encoding='utf-8').strip(): errors.append('missing-or-empty:'+name)
try:
    c=json.loads((PM/'PROJECT_COORDINATION.json').read_text())
    if c.get('repository')!='Bernds-tech/WellFit-now': errors.append('coordination-repository-invalid')
    if c.get('program_master')!='Bernds-tech/WellFit:project-memory/WELLFIT_MASTER_STATE.json': errors.append('coordination-master-invalid')
    if c.get('local_role')!='technical_web_backend': errors.append('coordination-role-invalid')
    state=json.loads((PM/'FINISHLINE_STATE.json').read_text())
    if any(v.get('state')=='UNASSESSED' for v in state.get('gates',{}).values()): errors.append('real-finishline-still-unassessed')
except Exception as e: errors.append('coordination-or-state-json-invalid:'+str(e))
protocol=(PM/'PROTOCOL.md').read_text(encoding='utf-8') if (PM/'PROTOCOL.md').exists() else ''
for token in ['Protocol v9','V9 — Multi-repository orchestration','Never create a competing program-level master']:
    if token not in protocol: errors.append('protocol-v9-token-missing:'+token)
if errors:
    print('PROJECT_MEMORY_V9_RESULT=failed')
    [print('PROJECT_MEMORY_V9_ERROR='+e) for e in errors]
    sys.exit(1)
print('PROJECT_MEMORY_V9_RESULT=passed')
