#!/bin/bash
echo "=== DATA FLOW A: Document Upload ==="
grep -rn -A 5 "runFullAnalysis" components/FileUpload.tsx components/DocumentManager.tsx App.tsx

echo "=== DATA FLOW B: Archive Click ==="
grep -rn -A 5 "onSelect=" App.tsx components/ArchiveView.tsx

echo "=== DATA FLOW C: Legal Pipeline ==="
grep -rn -A 5 "runFullPipeline" components/LegalPipelineView.tsx lib/LegalPipelineService.ts

echo "=== DATA FLOW D: Economic Data ==="
grep -rn -A 5 "economicService.add" components/EconomicDashboard.tsx components/EconomicForms.tsx

echo "=== MISSING IMPORTS ==="
grep -rn "import .* from '.*'" src/ components/ lib/ services/ App.tsx 2>/dev/null | grep "not found" || echo "No explicit missing imports found by grep."
