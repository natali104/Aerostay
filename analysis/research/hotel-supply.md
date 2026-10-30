# AeroStay — Hotel supply около летищата (SOF; сравнение OTP, FRA)

Дата на проучване/проверка: 2026-10-30
Изследовател: subagent (research), тема „HOTEL SUPPLY около летищата“

---

## 0. КРИТИЧНО ОГРАНИЧЕНИЕ — ниво на проверка

**В тази сесия WebFetch не можа да отвори нито един източник.** Опитите за отваряне завършиха с DNS/egress грешка (`getaddrinfo ENOTFOUND`, т.е. хостът е извън разрешените мрежови домейни на сесията):

| хост | цел на опита | резултат |
|---|---|---|
| all.accor.com | официална страница на ibis Sofia Airport | блокиран (ENOTFOUND) |
| www.hotelpremiersofia.com | официален сайт на Hotel Premier Sofia Airport | блокиран (ENOTFOUND) — не значи, че сайтът не съществува |
| www.nsi.bg | годишна публикация на НСИ „Места за настаняване – 2025“ | блокиран (ENOTFOUND) |

Proxy status-ът показва и други отказани CONNECT заявки (403) към europa.eu домейни от тази сесия. Според правилата на сесията след повторни блокирания на хостове не опитвах повече сайтове и не заобикалях proxy-то.

**Последствие:** по метода на проекта („Не цитирай от snippet, който не си отворил“) **нито един ред по-долу не е потвърден факт**. Всичко е **LEAD (непроверено)**: URL-ите идват от резултати на WebSearch, а стойностите са от обобщенията на търсачката. Те служат като списък за проверка, не като данни. Надеждността е „ниска“ навсякъде, докато източникът не бъде отворен. За да се затвори проверката, трябва да се разрешат хостовете: nsi.bg, insse.ro, statistik.hessen.de / visitfrankfurt.travel, partner.booking.com / developers.booking.com, ihg.com, all.accor.com, hotelpremiersofia.com, frankfurt-airport.com.

### Обхват на търсенето (WebSearch, 2026-10-30)
Заявки (EN/BG/RO/DE):
1. "hotel near Sofia Airport shuttle airline crew"
2. "Sofia airport hotel official site rooms free airport shuttle Brussels Blvd"
3. "НСИ места за настаняване София-град легла 2025"
4. "Booking.com commission percentage partner hub official"
5. "INS Romania capacitate de cazare turistica Bucuresti Ilfov locuri 2025"
6. "Hessisches Statistisches Landesamt Beherbergungsbetriebe Frankfurt am Main Betten 2025"
7. "Booking.com Connectivity Partner Programme requirements become a connectivity provider"
8. "distressed passenger rate hotel airline contract crew accommodation invoicing"
9. "Holiday Inn Sofia Business Park rooms airport distance; Metropolitan Hotel Sofia ..."
10. "хотел летище София екипажи авиокомпании договор crew"
11. "hotel PMS Bulgaria market share Clock PMS channel manager Bulgarian hotels"
12. "Expo Hotel Sofia official rooms airport shuttle Tsarigradsko"
13. "partner.booking.com help commission ..."
14. "Frankfurt Airport hotels Sheraton ... ; Otopeni airport hotel ..."
15. "Sofia hotel "airline crew" OR "crew rates" OR "aircrew" Sofia airport hotel"

Домейни в резултатите: nsi.bg, insse.ro, visitfrankfurt.travel, frankfurt.de, ihg.com, frankfurt-airport.com, developers.booking.com, partnerhelp.booking.com, booking.com, expedia/hotels.com/trip.com/priceline (OTA), vendor блогове (guesty, lodgify, hospitable, smoobu, hotelrunner), apiglobalsolutions.com, get-e.com, phocuswire.com, hsma.de, capital.bg, Wikipedia.

---

## 1. Хотели в радиус ~10 км от SOF

Колона „класификация“ спрямо AeroStay: хотелите са **потенциален партньор** (supply side). Никой от тях не е конкурент на софтуера.

| хотел | официален сайт | звезди | брой стаи | разстояние/транспорт до SOF | публично доказателство за airline/crew business | директен URL (lead) | дата публ. | дата проверка | пазар | надеждност | ограничения | класификация |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ibis Sofia Airport (Accor), ул. „Мими Балканска“ 132 (по OTA) | [НЕ Е ПОТВЪРДЕН] — all.accor.com е блокиран, точният URL на хотела не е проверен | 3* (според priceline, не е проверено) | [НЕ Е НАМЕРЕНО официално] | OTA обобщения: ~0,5–1 км; безплатен shuttle; ревю споменава shuttle на всеки 20 мин (форумен/ревю сигнал) | [НЕ Е НАМЕРЕНО] | https://www.priceline.com/hotel-deals/en-us/P5000263867/H13683903/ibis-sofia-airport.ssp ; https://booking.com/hotel/bg/ibis-sofia-airport.en-gb.html | неизв. | 2026-10-30 | BG/SOF | ниска | само OTA snippet; не е отворен | потенциален партньор — най-близкият верижен хотел до SOF |
| Hotel Premier Sofia Airport (по-рано Best Western Premier Sofia Airport), бул. „Брюксел“ 11 (по OTA) | www.hotelpremiersofia.com (според OTA листинг; DNS отказан в сесията, не е проверен) | 4* (OTA) | 185 по един OTA/агрегатор — **не е официално** | OTA: двупосочен безплатен scheduled shuttle до T1 и T2; един листинг казва 24 ч | [НЕ Е НАМЕРЕНО] — няма намерена crew-rates страница | https://www.expedia.com.au/Sofia-Hotels-Premier-Sofia-Airport-Hotel.h15292076.Hotel-Information ; https://www.booking.com/hotel/bg/hotel-premier-airport-sofia.html | неизв. | 2026-10-30 | BG/SOF | ниска | смяна на бранда (BW → независим?) не е потвърдена; броят стаи е от агрегатор | потенциален партньор — airport hotel с shuttle |
| Expo Hotel Sofia (по-рано Best Western Plus Expo), бул. „Цариградско шосе“ 149, до Интер Експо Център | [НЕ Е НАМЕРЕН] официален сайт в резултатите | 4* (priceline) | 99 по hotelplanner — **не е официално** | OTA: ~4–5,9 км; безплатен shuttle при пристигане / по заявка (OTA листингите си противоречат); платен трансфер обратно „20 BGN“ по един листинг; метростанция „Цариградско шосе“ пред хотела (viamichelin) | [НЕ Е НАМЕРЕНО] | https://www.priceline.com/hotel-deals/en-us/P5000263867/H6072803/expo-sofia-hotel-free-arrival-shuttle-bus-free-parking-free-compliments-free-wi-fi.ssp ; https://hotelplanner.com/Hotels/95007/Reservations-Expo-Hotel-Sofia-149-Tsarigradsko-Shose-Blv-1784 | неизв. | 2026-10-30 | BG/SOF | ниска | противоречиви OTA данни; цената от 20 BGN е стара и непроверена (BG е в еврозоната от 2026) | потенциален партньор |
| Holiday Inn Sofia (IHG), Бизнес парк София / бул. „Ал. Малинов“ (Младост) | ihg.com страница: https://www.ihg.com/holidayinn/hotels/gb/en/sofia/sofbg/hoteldetail/directions | [НЕ Е ПОТВЪРДЕНО] | [НЕ Е НАМЕРЕНО] | Snippet от **официалната** IHG directions страница: „There is no Airport Shuttle available at this hotel“; агрегатори: 6–8 км / ~10 мин с кола | [НЕ Е НАМЕРЕНО] | https://www.ihg.com/holidayinn/hotels/gb/en/sofia/sofbg/hoteldetail/directions | неизв. | 2026-10-30 | BG/SOF | ниска (официален домейн, но не е отворен) | агрегатори твърдят, че има shuttle, а IHG snippet го отрича | потенциален партньор |
| Metropolitan Hotel Sofia, бул. „Цариградско шосе“ (по агрегатори) | [НЕ Е НАМЕРЕН] | [НЕ Е НАМЕРЕНО] | [НЕ Е НАМЕРЕНО] | агрегатори: shuttle безплатен „при заявка и наличност“ срещу платен в друг листинг; уебит.bg (2018) споменава „airport transportation“ | [НЕ Е НАМЕРЕНО] | https://webit.bg/2018/accommodation.php | 2018 | 2026-10-30 | BG/SOF | ниска | стар събитиен сайт; противоречия | потенциален партньор |
| Family Hotel 007 | [НЕ Е НАМЕРЕН] | [НЕ Е НАМЕРЕНО] | [НЕ Е НАМЕРЕНО] | OTA: 4 км срещу 7,4 км (противоречие); shuttle по заявка срещу доплащане | [НЕ Е НАМЕРЕНО] | https://www.frommers.com/destinations/sofia/hotels/hotel-007 | неизв. | 2026-10-30 | BG/SOF | ниска | малък семеен хотел; противоречия | потенциален партньор (малък капацитет — не е проверено) |
| Novotel Sofia, Hotel Akord | [НЕ Е НАМЕРЕН] | — | — | споменати от OTA агрегатори като „близо до летището“ | [НЕ Е НАМЕРЕНО] | https://www.kayak.ie/Sofia-Airport-Hotels.SOF.aph.ksp | неизв. | 2026-10-30 | BG/SOF | ниска | само споменаване | потенциален партньор |
| Централна София (Sofia Hotel Balkan, Hilton Sofia, InterContinental, Radisson Blu и др.) | [НЕ Е ПРОВЕРЕНО] | — | — | — | [НЕ Е НАМЕРЕНО] — не беше намерена публична crew/airline страница | — | — | 2026-10-30 | BG | — | не е търсено поотделно поради мрежовото ограничение | потенциален партньор |

**Обобщение за crew/airline business при хотелите около SOF:** заявка 15 („airline crew“/„crew rates“/„aircrew“) и заявка 10 (БГ) не върнаха нито една публична crew-rates страница или споменат договор с airline за хотел в София. **[НЕ Е НАМЕРЕНО]** в WebSearch EN/BG. Свързан lead (не е за хотели): Capital.bg (21.08.2026) пише, че Aviapartner поема обслужването на пътниците на Летище София — https://www.capital.bg/biznes/kompanii/2026/08/21/4946400_aviapartner_shte_obslujva_putnicite_na_letishte_sofiia/ (не е отворен; релевантно за ground handler страната, а не за hotel supply).

---

## 2. Официална статистика за местата за настаняване

| въпрос | факт/число (LEAD, непроверено) | директен URL | дата публ. | дата проверка | пазар | надеждност | ограничения |
|---|---|---|---|---|---|---|---|
| НСИ — София (столица), месечно | Snippet: януари 2025 — 176 обекта с 10+ легла; 9,3 хил. стаи; 16,5 хил. легла; заетост на леглата 30,2% | https://old.nsi.bg/tsb/wp-content/uploads/2025/03/MN_SOF_01.25-SOF.pdf | ~03.2025 (по пътя на URL) | 2026-10-30 | BG / обл. София (столица) | ниска (първичен източник, но не е отворен) | само обекти с 10+ легла; месечно, не годишно |
| НСИ — София (столица), юни 2025 | Snippet: 181 обекта; заетост 41,9% | https://www.nsi.bg/tsb/wp-content/uploads/2025/08/MESTAN-ZA-NASTANIAVANE-SOF-06.2025_1.pdf | ~08.2025 | 2026-10-30 | BG / София (столица) | ниска | не е отворен; броят легла не е в snippet-а |
| НСИ — София (столица), септември 2025 | Snippet: 180 обекта; нощувките +17,3% на годишна база | https://www.nsi.bg/tsb/wp-content/uploads/2025/11/SOF-hoteli-septemvri-2025_2.pdf | ~11.2025 | 2026-10-30 | BG / София (столица) | ниска | не е отворен |
| НСИ — други месечни файлове за София | 04.2025, 08.2025 (MESTA-NASTAN-SOF-2025_2), 11.2024, 11.2023 | https://old.nsi.bg/tsb/wp-content/uploads/2025/06/MESTA-ZA-NASTAN.SOF04.2025_2.pdf ; https://www.nsi.bg/tsb/wp-content/uploads/2025/10/MESTA-NASTAN-SOF-2025_2.pdf ; https://www.nsi.bg/tsb/wp-content/uploads/2025/01/MN_SOF_11.24.pdf | 2024–2025 | 2026-10-30 | BG | ниска | не са отворени |
| НСИ — национално, годишно 2025 | Snippet: 4 102 места за настаняване с 10+ легла (национално) | https://www.nsi.bg/file/34477/Места за настаняване - 2025.pdf | неизв. (вероятно 2026) | 2026-10-30 | BG (страна) | ниска | опитах да го отворя — nsi.bg е блокиран; разбивката за София не е видяна |
| НСИ — годишно за София-град 2025 | [НЕ Е НАМЕРЕНО] като отделно число | търсено в nsi.bg чрез WebSearch | — | 2026-10-30 | BG | — | вижте ТСБ Югозапад / ИС „Инфостат“ |
| INS (RO) — București-Ilfov, sem. I 2025 | Snippet: капацитет в действие 4 437 055 locuri-zile за региона, от тях 4 106 651 в Municipiul București (хотели 3 398 021) и 330 404 в Ilfov | https://insse.ro/cms/sites/default/files/field/publicatii/seria_turism_sem1_2025.pdf | 2025 | 2026-10-30 | RO / București, Ilfov | ниска | **locuri-zile (bed-days), не брой легла**; структури с 10+ легла; не е отворен |
| INS (RO) — капацитет към 31.07.2025 | Snippet: 14 325 структури, 464 354 легла (национално); делът на Букурещ не е директно потвърден (търсачката е изчислила ~6%, това е изведено, не е данни) | https://ptir.ro/wp-content/uploads/2025/10/capac_ro31iul2025.pdf (огледало на INS прессъобщение на сайт на трета страна) | 10.2025 | 2026-10-30 | RO | ниска | вторично хостване; трябва INS TEMPO (TUR101x) за Букурещ/Илфов |
| Destatis/Hessen — Франкфурт на Майн 2025 | Snippet: месечни „Beherbergungsgewerbe“ (visitfrankfurt, източник Hessisches Statistisches Landesamt): ~282–284 отворени обекта и ~63 700–65 000 предлагани легла; октомври 2025: 283 обекта / 65 031 легла (етикетите в PDF-а са частично нечетими) | https://www.visitfrankfurt.travel/fileadmin/Mediendatenbank/Dokumente/Publikationen/Beherbergungsgewerbe_Oktober_2025.pdf | ~11–12.2025 | 2026-10-30 | DE / Frankfurt am Main | ниска | вторично (градски DMO, преразпространява HSL); предварителни стойности; не е отворен |
| Hessen — данни за цялата провинция | [НЕ Е НАМЕРЕНО] | търсено с DE заявка; statistik.hessen.de не излезе в резултатите | — | 2026-10-30 | DE / Hessen | — | нужна е GENESIS заявка в Destatis (таблица 45412) или Statistik Hessen |
| Франкфурт — исторически baseline | Snippet: 298 Beherbergungsbetriebe в края на 2018 (по HSL) | https://frankfurt.de/-/media/frankfurtde/service-und-rathaus/daten-informationen-wissen/pdf/pdf-fsa/2020/2020_01-beherbergungsgewerbe.pdf | 2020 | 2026-10-30 | DE / Frankfurt | ниска | стари данни |

---

## 3. Как хотелите продават на airlines (distressed pax, crew contracts, allotments, payment terms, OTA комисиони)

| въпрос | факт/твърдение (LEAD, непроверено) | директен URL | дата публ. | дата проверка | пазар | надеждност | ограничения | класификация (ако е фирма) |
|---|---|---|---|---|---|---|---|---|
| Определение за „distressed passengers“ | PhocusWire статия за цената на distressed passengers / walked guests (заглавие и snippet) | https://www.phocuswire.com/The-true-cost-of-distressed-passengers-walked-guests-and-poor-customer-service | неизв. | 2026-10-30 | глобален | ниска | не е отворен; отраслова медия | — |
| Структура на crew agreement | Snippet от презентация на HSMA (DE hotel sales association): стойността на crew agreement зависи от прогнозните годишни приходи, броя договорни години и дали тарифата е фиксирана или сезонна; blackout dates | https://www.hsma.de/storage/app/media/Regionen/Regionalevents%202022/Mitte/prasentation-leonie-godard-hsmanov.pdf | 2022 | 2026-10-30 | DE | ниска (отраслова асоциация, не е отворен) | една презентация; не е стандарт | — |
| Crew sourcing/contracting и DPAX като услуга | API Global Solutions: crew sourcing, contracting и disrupted passenger (DPAX) services; пресъобщение за Air Belgium; reconciliation („airline pays only for contracted lodging“) | https://www.apiglobalsolutions.com/sourcing-and-contracting ; https://www.apiglobalsolutions.com/?p=3583 ; https://www.apiglobalsolutions.com/2021/03/12/saving-is-not-just-driven-by-hotel-negotiations-automate-your-entire-hotel-spend-reconciliation-and-payment-process/ | 2021 / неизв. | 2026-10-30 | глобален | ниска | vendor marketing; не е отворен | **директен конкурент** — продава crew hotel sourcing и DPAX настаняване на airlines |
| Crew hotel sourcing и reconciliation | GET-E: страници „airline crew accommodation“, „crew hotels sourcing“, „reconciliation“ | https://get-e.com/airline-crew-accommodation ; https://get-e.com/airline-solutions/crew-hotels/sourcing/ ; https://get-e.com/reconciliation | неизв. | 2026-10-30 | глобален | ниска | vendor marketing; не е отворен | **директен конкурент** (crew hotels) / adjacent (crew transport) — по описанието в snippet-а |
| Allotments, payment terms (напр. net 30) | [НЕ Е НАМЕРЕНО] — няма официален или надежден отраслов източник за стандартни airline-hotel payment terms или allotment условия | заявки 8, 10, 15 | — | 2026-10-30 | — | — | обикновено е в частни договори; не се публикува | — |
| Booking.com стандартна комисия — официален източник | [НЕ Е НАМЕРЕНО като отворен официален документ]. Има официален help URL slug „understanding-our-commission“ (виден само през огледален/неофициален хост — **да не се цитира**). Partnerhelp community постове (напр. „commission rate increased for all Greek properties“) = форумен сигнал. Vendor блогове (Guesty, Lodgify, PriceLabs) дават 10–25% / ~15% средно / Preferred Partner +~3 pp — **вторични, не са официални** | https://partnerhelp.booking.com/hc/ar/community/posts/360029911594-commission-rate-increased-for-all-Greek-properties- (форум) ; https://www.guesty.com/blog/how-much-does-booking-com-charge-hosts (vendor) | неизв. | 2026-10-30 | глобален / по държави | ниска | официалната ставка е в Accommodation Agreement / extranet; варира по държава и тип имот | Booking.com: **substitute** (за самостоятелни резервации от пътници) / **adjacent vendor** |
| Fáilte Ireland — Booking.com research summary | PDF, в който Booking.com е контрибутор (снипет без цифри) | https://www.failteireland.ie/FailteIreland/media/WebsiteStructure/Documents/Channel%20research/Contributor%20summaries/Booking-com-Research-Summary.pdf | неизв. | 2026-10-30 | IE | ниска | не е отворен | — |

---

## 4. Хотелски системи/интеграции (PMS, channel managers, API)

| въпрос | факт/твърдение (LEAD, непроверено) | директен URL | дата публ. | дата проверка | пазар | надеждност | ограничения | класификация |
|---|---|---|---|---|---|---|---|---|
| Доминиращи PMS/channel managers в BG/RO | [НЕ Е НАМЕРЕНО] — няма надежден източник за пазарни дялове. IBISWorld (платен) дава само размера на индустрията; Pro-Consulting (UA) продава доклад за BG хотелиерството | https://www.ibisworld.com/bulgaria/industry/hotels-holiday-accommodation/200252/ | 2026 | 2026-10-30 | BG | ниска | paywall | — |
| Clock Software (Clock PMS+) | Snippet от Wikipedia: основана 1994 г. във Варна, България; Clock PMS+ с клиенти в 65+ държави (към края на 2018) | https://en.wikipedia.org/wiki/Clock_Software | неизв. | 2026-10-30 | BG / глобален | ниска (Wikipedia, не е отворен) | не дава пазарен дял | **adjacent vendor** / потенциален партньор за интеграция — PMS с български произход |
| Booking.com Connectivity API — документация | Официална документация на developers.booking.com/connectivity/docs; snippet: доставчиците стават автоматично „Standard“ partner; нива Advanced/Premier чрез точки; очаква се поддържане на промените в API | https://developers.booking.com/connectivity/docs | неизв. („Last updated“ не се вижда в snippet-а) | 2026-10-30 | глобален | ниска (официален домейн, не е отворен) | конкретните onboarding изисквания не се виждат в snippet-а | Booking.com: adjacent vendor |
| Ниво Premier Plus (2026) | Vendor източник (Hospitable) твърди, че Premier Plus е въведено през 2026; Smoobu обявява, че е Premier (Plus) Connectivity Partner за 2026 | https://hospitable.com/booking-com-connectivity-partners ; https://www.smoobu.com/de/blog/smoobu-ist-booking-com-premiere-connectivity-partner-in-2026/ | 2026 | 2026-10-30 | глобален | ниска | vendor marketing | — |
| Примери за connectivity partners | HotelRunner (Premier Connectivity Partner 2022), Hotel Link (2020), RateGain (NSE filings), PriceLabs | https://hotelrunner.com/en/news/bookingcom-recognizes-hotelrunner-as-its-premier-connectivity-partner-and-the-top-connectivity-performer/ ; https://nsearchives.nseindia.com/corporate/RATEGAIN_06072023090401_RG_PR_july06.pdf | 2020–2023 | 2026-10-30 | глобален | ниска | регионалното присъствие в BG/RO не е установено | adjacent vendors (channel managers) |
| Публични API на PMS (Clock, Mews, Opera и др.) | [НЕ Е НАМЕРЕНО] — не е търсено поотделно поради мрежовото ограничение | — | — | 2026-10-30 | — | — | — | — |

---

## 5. Кратко сравнение — OTP и FRA hotel supply

| въпрос | факт (LEAD) | URL | дата публ. | дата проверка | пазар | надеждност | ограничения |
|---|---|---|---|---|---|---|---|
| FRA — хотели на летището (официален списък) | Fraport има страница за хотелите, напр. Sheraton Frankfurt Airport Hotel & Conference Center (snippet: директно свързан с терминала, по OMAAT) | https://www.frankfurt-airport.com/en/services/hotels/sheraton-frankfurt-airport-hotel-and-conference-center.html | неизв. | 2026-10-30 | DE/FRA | ниска (официален летищен домейн, не е отворен) | брой стаи и crew business не са видени |
| FRA — други airport hotels | Hilton Frankfurt Airport (The Squaire), Hilton Garden Inn, Hampton by Hilton, Marriott (блог ревюта) | https://thepointsguy.com/reviews/frankfurt-airport-hotel-roundup | 2022 | 2026-10-30 | DE/FRA | ниска | блог; споменаване на crew е само форумен анекдот |
| OTP — хотели около летището | [НЕ Е НАМЕРЕНО] — заявката не върна резултати за Otopeni | заявка 14 | — | 2026-10-30 | RO/OTP | — | нужно е отделно търсене (bucharestairports.ro) |

---

## Сигурно
- Нищо не е потвърдено от отворен първичен източник в тази сесия (WebFetch е блокиран за nsi.bg, all.accor.com, hotelpremiersofia.com).
- Потвърдено е само, че съществуват URL-и на първични източници (по резултати от търсачката): месечни бюлетини на НСИ ТСБ за София (столица), INS „Seria Turism sem. I 2025“, Booking.com connectivity docs, IHG directions страницата на Holiday Inn Sofia, Fraport страницата за хотели.

## Несигурно
- Всички числа (НСИ 176 обекта / 9,3 хил. стаи / 16,5 хил. легла за 01.2025; INS locuri-zile; Франкфурт ~283 обекта / ~65 хил. легла) са от snippet-и, не са проверени срещу документа.
- Брой стаи за хотелите (Premier 185, Expo 99) идва от агрегатори, не от официални сайтове.
- Shuttle условията се различават между OTA листингите (Expo, Metropolitan, 007); за Holiday Inn официалният IHG snippet противоречи на агрегаторите.
- Booking.com комисиони (10–25%, ~15%, +3 pp Preferred) са само от vendor блогове.
- Класификацията на API Global Solutions и GET-E като директни конкуренти се базира на vendor snippet-и.

## Липсва
- Официални звезди/брой стаи за хотелите около SOF → да се отворят официалните сайтове (след разрешаване на домейните) или да се провери Министерството на туризма (Национален туристически регистър) за категоризация и капацитет.
- Публично доказателство за airline/crew договори на хотели в София → **[НЕ Е НАМЕРЕНО]**; за събиране: интервюта с hotel sales мениджъри, ground handlers (Aviapartner, Swissport/Sofia), airline crew planning; RFP/tender платформи (ЦАИС ЕОП за Bulgaria Air/държавни поръчки, TED).
- Payment terms / allotments / distressed rates → не са публични; събират се чрез интервюта и примерни договори.
- Годишно число легла за София-град 2025 (НСИ), легла за Букурещ/Илфов (INS TEMPO TUR102x), Hessen/Frankfurt (Destatis GENESIS 45412) → директно извличане от базите данни след разрешаване на домейните.
- Пазарни дялове на PMS/channel managers в BG/RO → платени доклади или проучване/интервюта с хотелиерски асоциации (БХРА, БАЗ).
- OTP airport hotels → отделно търсене + bucharestairports.ro.
