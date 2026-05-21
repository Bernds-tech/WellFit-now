# Beta-1 Pilot Evidence Pack Template

Status: template-only (no real tester data)
Date: 2026-05-21
Branch context: `readiness/beta1-human-evidence-capture`

Hinweis: Keine echten Namen, E-Mails, Telefonnummern, personenbezogenen Daten oder sensible Screenshots committen.

## Standardfelder (fuer alle Tabellen)

`evidenceId`, `date`, `device/browser`, `route`, `expected`, `actual`, `status pass/fail/blocked/pending`, `screenshotRef optional`, `noPiiConfirmed yes/no`, `notes`

## 1) Live Pages Device Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| live-pages-device-001 | YYYY-MM-DD | device_browser_placeholder | /, /dashboard, /missionen, /buddy, /shop, /leaderboard, /analytics, /marketplace | all key pages reachable, no P0/P1 | TBD | pending | optional-safe-ref | yes | fill after real human smoke |

## 2) /shop Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| shop-smoke-001 | YYYY-MM-DD | device_browser_placeholder | /shop | page loads, XP-only wording, no payment/cashout hints | TBD | pending | optional-safe-ref | yes | no real money data |

## 3) /leaderboard Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| leaderboard-smoke-001 | YYYY-MM-DD | device_browser_placeholder | /leaderboard | readonly leaderboard visible, no PII leaks | TBD | pending | optional-safe-ref | yes | fill after run |

## 4) /analytics Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| analytics-smoke-001 | YYYY-MM-DD | device_browser_placeholder | /analytics | own-view stats load, no sensitive data leak | TBD | pending | optional-safe-ref | yes | fill after run |

## 5) /marketplace Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| marketplace-smoke-001 | YYYY-MM-DD | device_browser_placeholder | /marketplace | preview page loads, no real trading/payment | TBD | pending | optional-safe-ref | yes | fill after run |

## 6) /marktplatz Alias Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| marktplatz-alias-smoke-001 | YYYY-MM-DD | device_browser_placeholder | /marktplatz | alias route resolves correctly and safely | TBD | pending | optional-safe-ref | yes | fill after run |

## 7) Desktop Responsive Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| desktop-responsive-001 | YYYY-MM-DD | desktop_browser_placeholder | key live pages | stable layout across target widths | TBD | pending | optional-safe-ref | yes | include tested widths |

## 8) Android Chrome Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| android-chrome-smoke-001 | YYYY-MM-DD | android_chrome_placeholder | key live pages | no crash, no sensitive leak, navigation works | TBD | pending | optional-safe-ref | yes | include OS/browser version |

## 9) iPhone Safari Smoke

| evidenceId | date | device/browser | route | expected | actual | status pass/fail/blocked/pending | screenshotRef optional | noPiiConfirmed yes/no | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| iphone-safari-smoke-001 | YYYY-MM-DD | iphone_safari_placeholder | key live pages | no crash, no sensitive leak, navigation works | TBD | pending | optional-safe-ref | yes | include iOS/Safari version |
