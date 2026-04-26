# WellFit AI Dimensions / Items / NFC / NFT Economy Architecture

## Ziel

WellFit soll perspektivisch nicht nur feste Missionen ausspielen. Das KI-/Leitsystem soll dynamisch Erlebnisraeume, Missionen, Raetsel, Hinweise, benoetigte Items und spaeter digitale Besitzobjekte erzeugen oder vorschlagen.

Der Buddy ist dabei die sichtbare Fuehrungsfigur fuer den Nutzer. Das Backend bleibt Autoritaet fuer Preise, Rewards, Items, Token-/WFT-Bezug, Missbrauchsschutz und Freischaltungen.

## Begriffstrennung

### NFC Tags

NFC-Tags sind physische Real-World-Trigger.

Beispiele:

- Sticker am Spielplatz
- Karte/Chip bei Partnern
- Baum-/Rallye-Station
- Event-Ort

NFC-Tags sind keine NFTs.

Sie koennen ausloesen:

- Item Grant
- Capability Unlock
- Mission Start
- Hint Reveal
- Partner Check-in

### Items / Gadgets

Items sind Ausruestung oder Werkzeuge fuer Buddy/Avatar/KI-Body.

Beispiele:

- Kletterseil
- Lupe
- Rucksack
- Greifhaken
- Schild
- Ruestung
- Schwert
- Spezialscanner

Items koennen Faehigkeiten freischalten:

- climbUp
- fetchClue
- scanObject
- revealHint
- carry
- protect

### NFTs / digitale Besitzobjekte

NFTs sind spaetere digitale Besitzobjekte. Sie duerfen nicht mit NFC-Tags verwechselt werden.

Moegliche spaetere Verwendung:

- seltene Buddy-Ausrustung
- Avatar-Skins
- Sammlerobjekte
- Event-Abzeichen
- besondere Missionstrophäen
- begrenzte digitale Partnerobjekte

Wichtig:

Mobile App darf keine App-Store-kritischen Token-, Trading-, Presale- oder NFT-Marktplatz-Funktionen enthalten.

NFT-/Token-/WFT-Funktionen bleiben spaeter im PC-Web-Dashboard oder einem getrennten Webbereich.

## KI-generierte Dimensionen

Eine Dimension ist ein dynamisch erzeugter Erlebnisraum oder Missionskontext.

Beispiele:

- Wald-Raetselrallye
- Spielplatz-Abenteuer
- Wohnzimmer-AR-Quest
- Stadtteil-Schnitzeljagd
- Familien-Challenge
- Lern-/Bewegungs-Parcours

Dimensionen koennen enthalten:

- Story
- Alterslevel
- Schwierigkeitsgrad
- Bewegungsziel
- AR-Orte/Anker
- Hinweise
- Auswahlfragen
- benoetigte Items
- optionale Items
- Rewards
- Sicherheitsgrenzen
- Plausibilitaetschecks
- Tageslimit
- maximale Verschachtelungstiefe

## KI-generierte Item-Bedarfe

Die KI darf vorschlagen:

- welches Item fuer eine Mission sinnvoll ist
- welches Item fehlt
- welches Item optional Vorteile bringt
- welche Alternative ohne Kauf moeglich ist
- welches Nebenraetsel ein fehlendes Item verdienen oder finden laesst

Die KI darf nicht final entscheiden:

- Preis
- Token-/WFT-Abzug
- NFT-Mint
- Reward-Auszahlung
- Mission Completion
- Leaderboard

Diese Entscheidungen liegen beim Backend.

## Item-Detours / Quest Chains

Fehlende oder zu teure Items duerfen nicht automatisch zu einem Kaufdruck fuehren. Das System soll zuerst spielerische Alternativen anbieten.

Grundsatz:

- Item fehlt nicht nur als Kaufblocker.
- Fehlendes Item kann eine neue Nebenmission ausloesen.
- Nebenmission fuehrt zu Bewegung, Raetseln, AR-Erkundung oder sozialem Spiel.
- Nutzer kann ein Item finden, verdienen oder temporaer ausleihen/freischalten.
- Danach kehrt der Nutzer zur urspruenglichen Mission zurueck und verwendet das Item dort.

Beispiel:

1. Hauptmission braucht `rope_001`.
2. Buddy sagt: "Dafuer brauchen wir ein Kletterseil. Wir koennen eines finden."
3. KI erzeugt eine kleine Nebenmission.
4. Nutzer loest ein Raetsel oder findet einen realen/NFC-/AR-Hinweis.
5. Backend validiert den Erfolg.
6. Nutzer erhaelt `rope_001` oder eine temporaere `climbUp`-Faehigkeit.
7. Nutzer kehrt zur Hauptmission zurueck.

## Begrenzung der Verschachtelung

KI-generierte Missionen duerfen nicht unendlich wachsen. Jede Dimension muss tagesfaehig bleiben.

Verbindliche Leitplanken:

- Eine Tagesdimension muss in der Regel am selben Tag abschliessbar sein.
- Maximal 1 bis 2 Nebenmissions-Ebenen pro Tagesmission.
- Jede Nebenmission braucht ein klares Ende.
- Der Buddy muss jederzeit erklaeren koennen: "Warum machen wir das gerade?"
- Nutzer muss jederzeit zur Hauptmission zurueckfinden.
- Kinder/Familien brauchen kurze, klare Loops.
- Keine endlosen Item-Ketten.
- Keine Paywall-Ketten.
- Keine Frustrationsspirale: Wenn Item fehlt, muss mindestens eine faire Alternative existieren.

## Preislogik / Economy Gateway

Preise duerfen nicht clientseitig berechnet werden.

Ein spaeteres Economy Gateway berechnet:

- interner Punktepreis
- XP-Kosten
- WFT-/Token-Bezug im Web-Dashboard
- Rabatt-/Eventlogik
- Seltenheit
- Nutzerlevel
- Anti-Farming-Risiko
- Angebot/Nachfrage
- Tageslimit
- Fairness fuer Kinder/Familien
- kostenlose oder erspielbare Alternative
- maximale Item-Ketten-Laenge

## Mobile-App-Regel

Mobile zeigt nur neutrale Produktlogik:

- Item benoetigt
- Item freigeschaltet
- Item nicht verfuegbar
- Alternative Mission starten
- Item durch Nebenraetsel finden
- Im Web-Dashboard verwalten

Mobile zeigt nicht:

- Token-Trading
- Presale
- Spekulation
- NFT-Marktplatz
- Finanzversprechen
- echte Token-Ausschuettung

## Beispiel-Flow

1. Nutzer startet Wald-Raetselrallye.
2. KI erzeugt Dimension `forest_riddle_001`.
3. Buddy sagt: "Da oben ist ein Hinweis. Ich brauche ein Kletterseil."
4. Backend prueft:
   - hat Nutzer rope_001?
   - ist climbUp freigeschaltet?
   - ist Mission altersgerecht?
   - ist Preis/Reward plausibel?
   - gibt es eine faire erspielbare Alternative?
5. Nutzer kann:
   - vorhandenes Item nutzen
   - alternatives kostenloses Ziel waehlen
   - Nebenmission starten und Item finden/verdienen
   - Item ueber erlaubten Flow freischalten
6. Unity fuehrt nur die validierte AR-Aktion aus.
7. Backend entscheidet Completion und Reward.

## Datenmodelle spaeter

### aiDimensions

- dimensionId
- userId
- ageBand
- storyType
- missionIds
- requiredItemIds
- optionalItemIds
- requiredCapabilityIds
- rewardPolicyId
- safetyPolicyId
- maxDepth
- estimatedMinutes
- dailyCompletionTarget
- createdByModel
- serverValidationStatus

### aiGeneratedItemOffers

- offerId
- userId
- dimensionId
- itemId
- reason
- pricePolicyId
- internalPointsPrice
- webOnlyTokenPrice optional
- freeAlternativeMissionId optional
- detourMissionId optional
- expiresAt
- serverValidationStatus

### aiQuestChains

- questChainId
- userId
- rootMissionId
- currentMissionId
- parentMissionId optional
- depth
- maxDepth
- requiredItemId optional
- rewardItemId optional
- status: active | completed | abandoned | expired
- estimatedMinutes
- createdByModel
- serverValidationStatus

### digitalOwnershipRecords

- ownershipId
- userId
- itemId
- ownershipType: internal | nft | partner | event
- chain optional
- contractAddress optional
- tokenId optional
- webOnly
- serverValidationStatus

## Sicherheitsregeln

- KI erstellt Vorschlaege, keine finale Autoritaet.
- Backend validiert Dimension, Itembedarf, Preise und Rewards.
- Backend begrenzt Quest-Chain-Tiefe und Tagesumfang.
- Client darf keine Item- oder NFT-Erzeugung final ausloesen.
- Unity darf nur validierte Items/Faehigkeiten darstellen.
- Mobile-App bleibt App-Store-konform.
- Token-/NFT-Funktionen nur Web/PC-Dashboard und erst nach Testphase.
