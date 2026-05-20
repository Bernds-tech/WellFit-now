# Beta-1 Test Users and Rollout Plan

Status: planning + placeholders only
Date: 2026-05-20
Branch context: `runtime/beta1-seed-demo-content-and-test-users`

## 1) Zielgruppe
- Wave 1: **25-50** Tester
- Wave 2 spaeter: bis **250**
- Fokus zuerst: Wien/Niederoesterreich, spaeter Oesterreichweit

## 2) Testrollen
- adult_tester
- guardian_parent
- child_profile_under_guardian_account
- admin_operator
- support_operator
- observer_read_only

## 3) Keine echten Daten
- keine echten E-Mails
- keine echten Namen
- keine echten Kinderprofile
- nur Platzhalter und Rollen-Schema

## 4) Tester-Schema (25 Platzhalter)

| testerKey | role | region | deviceNeeded | guardianRequired | focusArea | status |
| --- | --- | --- | --- | --- | --- | --- |
| beta1-tester-001 | adult_tester | vienna | android_chrome | false | mission_read_projection | planned |
| beta1-tester-002 | adult_tester | vienna | iphone_safari | false | mission_publish_visibility | planned |
| beta1-tester-003 | guardian_parent | vienna | iphone_safari | false | guardian_child_link | planned |
| beta1-tester-004 | child_profile_under_guardian_account | vienna | guardian_device_shared | true | child_safe_mission_visibility | planned |
| beta1-tester-005 | adult_tester | lower-austria | android_chrome | false | checkpoint_visibility | planned |
| beta1-tester-006 | adult_tester | lower-austria | iphone_safari | false | glitch_event_visibility | planned |
| beta1-tester-007 | guardian_parent | lower-austria | android_chrome | false | child_profile_boundary | planned |
| beta1-tester-008 | child_profile_under_guardian_account | lower-austria | guardian_device_shared | true | child_guardian_flow | planned |
| beta1-tester-009 | adult_tester | vienna | android_chrome | false | wallet_projection_read | planned |
| beta1-tester-010 | adult_tester | vienna | iphone_safari | false | ledger_projection_read | planned |
| beta1-tester-011 | adult_tester | lower-austria | android_chrome | false | inventory_projection_read | planned |
| beta1-tester-012 | adult_tester | lower-austria | iphone_safari | false | shop_projection_read | planned |
| beta1-tester-013 | support_operator | vienna | desktop_chrome | false | support_triage_template | planned |
| beta1-tester-014 | observer_read_only | vienna | desktop_chrome | false | read_only_observer_checks | planned |
| beta1-tester-015 | admin_operator | vienna | desktop_chrome | false | admin_manual_seed_checks | planned |
| beta1-tester-016 | adult_tester | vienna | android_chrome | false | error_message_quality | planned |
| beta1-tester-017 | adult_tester | lower-austria | iphone_safari | false | mission_detail_consistency | planned |
| beta1-tester-018 | guardian_parent | lower-austria | iphone_safari | false | consent_wording_review | planned |
| beta1-tester-019 | child_profile_under_guardian_account | vienna | guardian_device_shared | true | child_no_standalone_login | planned |
| beta1-tester-020 | adult_tester | vienna | android_chrome | false | active_break_flow | planned |
| beta1-tester-021 | adult_tester | lower-austria | iphone_safari | false | nutrition_mission_flow | planned |
| beta1-tester-022 | support_operator | lower-austria | desktop_chrome | false | safety_report_process | planned |
| beta1-tester-023 | observer_read_only | lower-austria | desktop_chrome | false | dashboard_projection_stability | planned |
| beta1-tester-024 | admin_operator | lower-austria | desktop_chrome | false | callable_validation_guard | planned |
| beta1-tester-025 | adult_tester | vienna | iphone_safari | false | beta_test_mission_feedback | planned |

## 5) Einschlusskriterien
- mindestens Android Chrome oder iPhone Safari (admin/support/observer optional desktop Chrome)
- Zustimmung zu Beta-Testbedingungen
- keine Erwartung auf Echtgeld/Cashout/Token
- Guardian notwendig fuer Kinder 8-13

## 6) Ausschlusskriterien
- keine Kinder ohne Guardian
- keine Real-Money-Testerwartung
- keine Crypto-/NFT-/Cashout-Erwartung
- keine sicherheitskritischen Orte
- keine sensiblen Gesundheitsdaten als Pflicht

## 7) Stop-Conditions
- Login instabil
- Missionen nicht sichtbar
- XP/Ledger inkonsistent
- Child/Guardian-Boundary unklar
- Permission denied leakt sensible Details
- Admin kann Missionen nicht vorbereiten
- Safety Report Prozess unklar
- Reality Glitch Sicherheitsrisiko
