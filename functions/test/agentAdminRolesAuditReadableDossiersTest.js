const assert = require('assert');
const {
  getFirstRunCandidateCollections,
  buildReadableDecisionDossierLookup,
  findReadableDecisionDossierForItem,
  overlayReadableDecisionDossierFields,
} = require('../lib/agentAdminRolesAudit');

const registerSnapshot = {
  decisionDossiers: [
    {
      sourceDossierId: 'docs/architecture/WELLFIT_AGENT_PRODUCT_EVOLUTION_FIRST_RUN_ANALYSIS.md',
      dossierId: 'PE-DOSSIER-01',
      title: 'Produktentwicklung: erste Analyse als Entscheidungsvorlage',
      summary: 'AR-lite Missionen mit groben Ortsbereichen als Pruefthema.',
      whatWillChange: 'Nur Research-Dossier, keine Runtime-Produktlogik.',
      whySuggested: 'Privacy-safe AR-lite zuerst pruefen.',
      wellFitBenefit: 'Sichere Roadmap.',
      userBenefit: 'Verstaendliche sichere Discovery Missionen.',
      economyImpact: 'Interne Beta-XP nur als Konzept.',
      riskSummary: 'Location sensitivity.',
      recommendation: 'research_more',
      recommendationLabel: 'Weiter pruefen',
      recommendationText: 'Weiter pruefen – noch nicht umsetzen.',
      allowedFiles: ['docs/**'],
      blockedFiles: ['app/**', 'functions/**'],
      requiredChecks: ['npm run agent:validate'],
      detailStatus: 'structured',
    },
  ],
  generatedDossiers: ['docs/architecture/WELLFIT_AGENT_PRODUCT_EVOLUTION_FIRST_RUN_ANALYSIS.md'],
  recommendedResearchMore: [
    {
      sourceDossierId: 'PE-20260523-03',
      title: 'PE-20260523-03',
      summary: 'Dossier fuer AR-lite Mission-Blueprint mit coarse location boundaries.',
      whatWillChange: 'Planungsdossier fuer privacy-safe AR-lite Discovery Missions ohne Unity-Abhaengigkeit.',
      whySuggested: 'Web-Beta Story vorbereiten, waehrend Unity isoliert bleibt.',
      recommendation: 'research_more',
      allowedFiles: ['docs/**'],
      blockedFiles: ['app/**'],
      requiredChecks: ['npm run agent:validate'],
    },
  ],
};

const collections = getFirstRunCandidateCollections(registerSnapshot);
assert.equal(collections[0].listType, 'decisionDossiers', 'decisionDossiers must be synced before generated/legacy lists');

const lookup = buildReadableDecisionDossierLookup(collections);
assert.equal(lookup.readableDossiers.length, 1, 'structured readable decision dossiers must be indexed');

const generatedItem = { sourceDossierId: registerSnapshot.generatedDossiers[0], title: registerSnapshot.generatedDossiers[0] };
const generatedMatch = findReadableDecisionDossierForItem(generatedItem, 'generatedDossiers', lookup);
assert(generatedMatch, 'generatedDossiers with the same sourceDossierId must match readable dossiers');
const generatedOverlay = overlayReadableDecisionDossierFields(generatedItem, 'generatedDossiers', generatedMatch);
assert.equal(generatedOverlay.recommendationLabel, 'Weiter pruefen', 'readable label must be retained on legacy generated entries');
assert.equal(generatedOverlay.supersededByReadableDecisionDossier, true, 'legacy generated entry must be marked as superseded by readable dossier');
assert.equal(generatedOverlay.adminCenterSourcePriority, 90, 'legacy generated entry must be sorted below readable decision dossiers');
assert.equal(generatedOverlay.recommendation, 'research_more', 'technical value remains available for debug and is not auto-approved');

const legacyResearch = registerSnapshot.recommendedResearchMore[0];
const researchMatch = findReadableDecisionDossierForItem(legacyResearch, 'recommendedResearchMore', lookup);
assert(researchMatch, 'legacy recommendedResearchMore AR-lite item must infer the readable dossier relationship');
const researchOverlay = overlayReadableDecisionDossierFields(legacyResearch, 'recommendedResearchMore', researchMatch);
assert.equal(researchOverlay.recommendationLabel, 'Weiter pruefen', 'legacy research item must not overwrite readable German label');
assert.equal(researchOverlay.recommendationText, 'Weiter pruefen – noch nicht umsetzen.', 'legacy research item must not overwrite readable German text');
assert.notEqual(researchOverlay.recommendation, 'approve', 'readable overlay must not auto-approve research_more items');

console.log('agentAdminRolesAuditReadableDossiersTest passed');
