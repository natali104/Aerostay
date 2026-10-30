# AeroStay — входни данни за размер на пазара (bottom-up TAM/SAM/SOM)

**Статус: НЕПРОВЕРЕНО / BLOCKED.** Дата на опита: 2026-10-30.

В тази сесия не можах да отворя нито един първичен източник. Не се резолвират `ec.europa.eu` (Eurostat, EUR-Lex), `ansperformance.eu` (EUROCONTROL CODA) и `www.bts.gov`. Curl към `ec.europa.eu` получава 403 от egress proxy. Средата инструктира да спра опитите след повторни DNS грешки, затова не тествах другите домейни (eurocontrol.int, transtats.bts.gov, sofia-airport.eu, bucharestairports.ro, adv.aero, munich-airport.de, data.consilium.europa.eu, steergroup.com).

По метода стойности от search snippets, които не са отворени, **не се цитират като факти**. Таблицата по-долу е **само списък с насоки (leads) за проверка**. Всяка стойност е от обобщение на WebSearch и не е сверена с документа. Надеждността на всички редове е „ниска (непроверено)“, докато съответният URL не бъде отворен.

## Обхват на търсенето (2026-10-30)
- WebSearch (EN/BG/RO/DE): "Eurostat air passenger transport 2025 by country"; "EUROCONTROL CODA digest 2025 annual delays cancellations"; "BTS airline on-time performance 2025 annual cancellation rate"; "Commission impact assessment revision Regulation 261/2004 cost of care assistance accommodation"; "Sofia Airport 2025 passengers flights statistics"; "CNAB Aeroportul Henri Coanda 2025 pasageri trafic statistici"; "ADV Verkehrsbericht 2025 Passagiere Flugbewegungen"; "Steer study ... cost of care accommodation per passenger".
- WebFetch (неуспешни): Eurostat API avia_paoc, Eurostat Statistics Explained, ansperformance.eu CODA digest, bts.gov.
- Curl (неуспешен, 403): Eurostat API.

## Таблица A — Leads (НЕПРОВЕРЕНИ)

| въпрос | lead стойност (от search summary) | кандидат-URL за проверка | период | пазар | надеждност | ограничения |
|---|---|---|---|---|---|---|
| Пътници ЕС | 1 035,1 млн пътници (по Eurostat avia_paoc, обновен 24.09.2026) | https://airadvisor.com/en/statistics/european-passenger-airlines (вторичен); първичен: Eurostat avia_paoc | 2025 | EU27 | ниска (непроверено, вторичен) | snippet; сайтът не е отварян |
| Пътници Германия | 207,2 млн (Eurostat, по вторичен източник) | същия като горния | 2025 | DE | ниска | snippet; не е сверено с Eurostat |
| Пътници Германия (ADV) | 219,58 млн пътници (an+ab), януари–декември 2025 | https://www.adv.aero/wp-content/uploads/2015/11/12.2025-ADV-Monatsstatistik.pdf | 2025 | DE | ниска (непроверено, първичен) | методиката на ADV се различава от Eurostat (броене по летища) |
| Граждански flight movements Германия (DFS) | 3,071 млн (+3,5%) | цитирано през deutsche-wirtschafts-nachrichten.de; първичен: DFS | 2025 | DE | ниска | IFR контролирани полети, не летищни movements |
| Munich movements | 337 438 (+3,1%) | https://www.munich-airport.de/_b/0000000000000039238972bb69c102a5/statistischer-jahresbericht-2025.pdf | 2025 | DE/MUC | ниска (непроверено, първичен) | snippet |
| Пътници Летище София | 8 413 762; aircraft movements 65 764 | https://en.wikipedia.org/wiki/Vasil_Levski_Sofia_Airport (вторичен); първичен: sofia-airport.eu | 2025 | BG/SOF | ниска | Wikipedia; не е сверено |
| SOF: airlines/месец | 40 airlines, 5 920 полета, 102 дестинации (септември 2025) | https://www.bta.bg/en/news/758378-sofia-airport-handled-5-920-flights-in-september-with-london-as-most-frequent-de | 09.2025 | BG/SOF | ниска | месечни данни; snippet |
| Пътници OTP | 17 005 524 (+6,64%) | https://agerpres.ro/english/2026/01/20/record-passenger-traffic-for-bucharest-airports-in-2025-10-26pct-increase-on-2024--1520369 (цитира CNAB) | 2025 | RO/OTP | ниска | медия, цитираща CNAB; snippet |
| Пътници Bucharest (OTP+BBU) | 17 700 242 (+10,26%) | същия като горния; https://www.romania-insider.com/society/traffic-bucharest-airports-2025 | 2025 | RO | ниска | snippet |
| OTP movements | 118 693 (за 2025 не е намерено) | https://agerpres.ro/english/2025/01/16/capital-airports-witness-record-air-traffic-in-2024-exceeding-historic-maximum-of-2019--1413146 | 2024 | RO/OTP | ниска | стара година; snippet |
| EU261: директен разход на засегнат пътник (Steer) | €89,3 (2011), €138,3 (2018) на засегнат пътник; €1,8 / €4,4 на пътник (всички пътници) | https://data.consilium.europa.eu/doc/document/WK-650-2020-INIT/en/pdf | 2011, 2018 | ЕС | ниска (непроверено, първичен Council doc) | общ директен разход (компенсации + грижа + rerouting); не е разбит само за хотели |
| EU261: административен разход (индустрия, цитира Steer) | ~0,6% от оперативните разходи ≈ ~€1,5 млрд | https://www.eraa.org/wp-content/uploads/2025/10/Joint-Industry-Position-EU261-revision_15102025.pdf | неясен | ЕС | ниска (индустриална позиция) | заинтересована страна; snippet |
| Care/accommodation честота | care и assistance (вкл. accommodation) на 1,23% от полетите, 2010–2012 (по доклад на ЕК, цитиран от BEUC) | https://www.beuc.eu/sites/default/files/publications/beuc-x-2013-065_air_passengers_rights_factsheet.pdf; първичен: SWD(2013) 62 / https://ec.europa.eu/smart-regulation/impact/ia_carried_out/docs/ia_2013/sec_2013_0150_en.pdf | 2010–2012 | ЕС | ниска | стари данни; вторичен; snippet |
| Таван за accommodation в реформата | €100 cap (обсъждан в Council) | https://data.consilium.europa.eu/doc/document/WK-318-2025-ADD-5/en/pdf | 2025 | ЕС | ниска | работен документ, не е действащо право |
| Реформа 261: текуща фаза | регламент за изменение от 2026 г., цитира Steer | https://eur-lex.europa.eu/eli/C/2026/3701/oj/eng/pdf ; https://data.europarl.europa.eu/distribution/doc/TA-10-2026-0009_en.docx | 2026 | ЕС | ниска | статусът на процедурата не е проверен |

## Таблица B — [НЕ Е НАМЕРЕНО] (дори като lead)

| въпрос | статус | къде е търсено / къде да се търси |
|---|---|---|
| Eurostat avia_paoc по страна (BG, RO) | [НЕ Е НАМЕРЕНО] | Eurostat API блокиран; да се изтегли avia_paoc / avia_paoa (passengers carried), avia_tf_cm (commercial flights) |
| Летища с редовен трафик (BG, RO, DE, US) | [НЕ Е НАМЕРЕНО] | Eurostat avia_paoa (airport level), ГД ГВА, AACR, ADV членове, FAA CY passenger boarding (commercial service airports) |
| Летища Варна, Бургас (2025) | [НЕ Е НАМЕРЕНО] | Fraport Twin Star Airport Management (fraport-bulgaria.com), Министерство на транспорта |
| Fraport/FRA 2025 | [НЕ Е НАМЕРЕНО] | Fraport traffic figures (fraport.com IR) |
| US passengers/flights (BTS T-100, Air Traffic) | [НЕ Е НАМЕРЕНО] | bts.gov блокиран; transtats.bts.gov, BTS "Air Traffic Data" press release |
| US cancellation rate и брой отменени полети, 2025 | [НЕ Е НАМЕРЕНО] (само частични медийни числа от Kiplinger за янв.–юли: 1,72% средно; не е BTS и не е проверено) | BTS Air Travel Consumer Report / On-Time Statistics |
| EUROCONTROL CODA 2025: дял отменени полети, закъснения >3 ч | [НЕ Е НАМЕРЕНО] | ansperformance.eu и eurocontrol.int; последният annual digest в резултатите е за 2024 (публикуван 25.07.2025 по ansperformance листинга, не е отворен) |
| Дял на нощувки/overnight disruptions | [НЕ Е НАМЕРЕНО] | вероятно не се публикува официално; интервюта с airlines/ground handlers, данни от claim агенции (само като сигнал) |
| Разход само за хотели/care (EU261), отделно от компенсации | [НЕ Е НАМЕРЕНО] | пълен Steer доклад (2020) за ЕК, SWD(2013) 62, annual reports на airlines (напр. Lufthansa, Ryanair, Wizz Air: ред "EU261 costs") |
| Crew hotel spend | [НЕ Е НАМЕРЕНО] | airline annual reports, IATA/A4A не са проверени; интервюта, tender документация |
| AOC holders по страна | [НЕ Е НАМЕРЕНО] | ГД ГВА (caa.bg), AACR (caa.ro), LBA (lba.de), FAA (Part 121/135 certificate holders) |
| Брой airlines с бази в SOF, OTP | [НЕ Е НАМЕРЕНО] | официалните сайтове на летищата, разписания на airlines |
| Hotel ADR около летищата | [НЕ Е НАМЕРЕНО] | няма надежден публичен източник в търсенето; STR/CoStar (платени), национални статистики за нощувки (НСИ, INS, Destatis) не са региони около летищата |

## Сигурно
- Нищо не е потвърдено от отворен първичен източник в тази сесия.

## Несигурно
- Всички стойности в Таблица A са от обобщения на WebSearch, често от вторични медии или Wikipedia. Сред тях са SOF 2025, OTP 2025, ADV 2025, Steer €/пътник, BEUC 1,23% и €1,5 млрд от индустрията.
- Разминаване по методика: ADV (219,58 млн) срещу Eurostat (207,2 млн) за DE 2025. Вероятната причина е различно броене, но това не е проверено.

## Липсва
- Достъп до мрежата за: ec.europa.eu, ansperformance.eu, eurocontrol.int, bts.gov, transtats.bts.gov, data.consilium.europa.eu, сайтовете на летищата и авиационните власти. След като бъдат разрешени, трябва да се повтори WebFetch по кандидат-URL от Таблица A и да се попълни Таблица B.
- Разходи само за хотели/care: от пълния Steer доклад, SWD(2013) 62 и airline annual reports. Ако не са публикувани, чрез интервюта с airlines или ground handlers.
- Crew hotel spend и ADR около летищата: интервюта, tender документация, платени данни (STR/CoStar).
