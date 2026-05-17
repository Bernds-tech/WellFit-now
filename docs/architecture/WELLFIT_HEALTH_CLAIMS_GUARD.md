# WellFit Health Claims Guard

Status: active governance guardrail  
Updated: 2026-05-17  
Register: `project-register/health-claims-guard.json`  
Validator: `scripts/wellfit-dev-agent/src/health-claims-guard-check.mjs`

## Purpose

This guard keeps WellFit health-adjacent copy cautious, motivational, and non-medical. It applies to movement missions, AI buddy language, learning recommendations, onboarding, marketing, mobile screens, dashboards, challenge text, and future copy reviews.

WellFit may encourage movement, learning breaks, routines, motivation, and general wellbeing. WellFit must not present itself as a medical product, diagnostic tool, therapy replacement, or source of guaranteed health outcomes.

## Connected guardrails and registers

This file is linked to and must stay consistent with:

- `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`
- `project-register/risk-classifier.json`
- `project-register/product-rules.json`

The privacy guard already requires minimal, consent-aware handling for health, watch, camera, AR, and location data. The risk classifier treats medical-adjacent, protected data, child-safety, and compliance-sensitive work as high or critical risk. Product rules already block client-side final authority for rewards and mission completion and require safe MVP boundaries.

## Forbidden claims

The following claim types are forbidden in beta-facing or user-facing WellFit wording unless a separate human medical/legal/product review explicitly approves exact wording and evidence. In most MVP contexts, they should remain blocked:

1. **Medizinische Heilversprechen** — no claims that WellFit, missions, movement, rewards, the buddy, or AR experiences cure, heal, reverse, eliminate, prevent, or treat medical conditions.
2. **Diagnose** — no diagnosis, disease inference, medical labeling, or presentation of app, watch, camera, location, or questionnaire signals as diagnostic output.
3. **Therapieersatz** — no implication that WellFit replaces doctors, therapists, medication, prescribed treatment, rehabilitation, emergency care, or professional medical advice.
4. **Garantierte Gesundheitswirkung** — no guarantees of weight loss, pain relief, stress reduction, sleep improvement, recovery, symptom improvement, disease prevention, or other health effects.
5. **Krankheitsbezogene Aussagen ohne Prüfung** — no disease-, symptom-, recovery-, injury-, mental-health-, or treatment-related claims without prior evidence and human review.

## Allowed cautious language

WellFit copy may use careful, non-clinical wording such as:

- **Bewegung kann unterstützen** — movement can support routines, active breaks, energy, learning breaks, and a more active day when suitable for the user.
- **Motivation** — WellFit can help motivate users through missions, reminders, streaks, playful feedback, buddy encouragement, and optional social support.
- **Allgemeines Wohlbefinden** — use broad wellbeing language such as general wellbeing, confidence, enjoyment, focus, balanced routines, or feeling active without promising medical outcomes.
- **Keine medizinische Beratung** — clearly state that WellFit does not provide medical advice, diagnosis, or treatment and that users should consult qualified professionals for medical questions.

## Review rules

- Use cautious, non-guaranteed wording for movement, motivation, and general wellbeing.
- Mark wording as `review_required` if it mentions disease, symptoms, injury, recovery, therapy, diagnosis, treatment, medication, pain, mental health, biometric interpretation, or guaranteed outcomes.
- Do not use health, watch, camera, AR, or location signals as medical authority.
- Do not pressure users with fear, urgency, shame, or certainty around health outcomes.
- Keep rewards, XP, points, mission completion, anti-cheat, and rare-item grants separate from medical claims and final client-side authority.
- Escalate exact copy, evidence, and release context before publishing any claim that could be read as medical, disease-related, or therapeutic.

## Safe examples

- "WellFit kann dich motivieren, mehr Bewegung in deinen Alltag einzubauen."
- "Kurze Bewegungspausen koennen deine Lernroutine unterstuetzen."
- "Diese Mission ist ein spielerischer Impuls fuer Aktivitaet und allgemeines Wohlbefinden."
- "WellFit bietet keine medizinische Beratung, Diagnose oder Behandlung. Bei medizinischen Fragen wende dich bitte an qualifizierte Fachpersonen."

## Unsafe examples to block or rewrite

- "Diese Mission heilt Rueckenschmerzen."
- "Deine Watch-Daten zeigen, dass du eine Krankheit hast."
- "WellFit ersetzt deine Therapie."
- "Garantiert weniger Stress und besserer Schlaf in sieben Tagen."
- "Diese Challenge verhindert Diabetes."

## Agent and release workflow

1. Run `node scripts/wellfit-dev-agent/src/health-claims-guard-check.mjs` after editing the guard or when preparing health-adjacent copy review.
2. If a copy change includes medical-adjacent terms, classify it as `review_required` before release.
3. Keep runtime behavior unchanged unless a future task explicitly approves implementation scope, exact files, and tests.
4. Do not alter legal/privacy texts, medical messaging, protected data flows, reward authority, or mission completion authority as part of this guard without explicit review.

## Non-goals

This document is not medical advice, not a user-facing privacy policy, not a diagnosis policy, and not approval to collect or process new health data. It is a governance guardrail for cautious copy, review escalation, and agent checks.
