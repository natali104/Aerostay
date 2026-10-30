# AeroStay — Product/code readiness audit (Разширение 4)

Дата: 2026-10-30 · Обхват: репо `natali104/Aerostay`, commit `915b4d2` (последен код от 2026-05-07) · Метод: статичен преглед на кода, `tsc --noEmit`, `eslint`. Нищо не е изпълнявано срещу Supabase/Resend/Vercel; не са използвани credentials; кодът не е променян.

## Отговорът

**[ОЦЕНКА] Продуктът е кликаем демо прототип, не е готов за пилот.** Има реален скелет за един workflow (линк с token → заявка към хотел → потвърждение → комисионна → ваучери), но:
- **Ключовата стойност — автоматичното откриване на disruption — е симулирана** (`Math.random`).
- Хотелската страна на workflow-а пише в друга таблица от API-то.
- Booking API-то приема цената от клиента без автентикация.
- Няма schema/миграции, тестове, privacy policy и terms.

Минималният път до пилот е **[ОЦЕНКА] 6–10 седмици за един разработчик**, ако пилотът е ръчно задействан (диспечерът въвежда disruption) и с 1 авиокомпания + 2–3 хотела на едно летище. Не е нужна интеграция с flight data за първия пилот. Най-евтиният тест **не изисква код** (виж края).

## Архитектура и stack [ФАКТ]

| Слой | Какво има | Доказателство |
|---|---|---|
| Framework | Next.js 16.2.3, React 19.2.4, TypeScript 5 | `package.json` |
| DB/Auth/Realtime | Supabase (`@supabase/ssr`, anon key) | `src/lib/supabase/*` |
| Email | Resend, `notifications@aerostay.app` | `src/lib/resend.ts` |
| Cron | Vercel cron 1×/ден за layovers и pricing | `vercel.json` |
| PDF ваучери | jsPDF + QRCode + JSZip в браузъра | `layover-detail.tsx` |
| Schema/миграции | **НЕ Е НАМЕРЕНО** — 14 таблици са описани само в README; няма `.sql` и в git историята | `git ls-files`, `git log --diff-filter=D` |
| Тестове/CI | **НЕ Е НАМЕРЕНО** | няма test файлове или `.github/` |
| Type check | минава (exit 0), но Supabase клиентът не е типизиран, така че грешни имена на таблици не се хващат | `npx tsc --noEmit` |
| Lint | 38 проблема (24 errors, 14 warnings), основно React hooks | `npx eslint src` |

## Функции: статус с доказателство

| Функция | Статус | Доказателство | Коментар |
|---|---|---|---|
| Откриване на disruption/layover | **MOCKED** | `api/cron/check-layovers/route.ts:52-80` — 0–2 случайни полета от твърд списък | Няма flight data източник (FlightAware, OAG, Cirium, AODB и т.н.) |
| Cron честота | PARTIAL | `vercel.json` — `0 0 * * *` (1×/ден) | „Real-time“ от README не съответства на дневен cron |
| Синхронизация на цени с Booking.com | **MOCKED** | `api/cron/sync-pricing/route.ts:237-240` — ±5% случайна вариация | Няма Booking.com/channel manager интеграция |
| Известяване на авиокомпанията по email + token линк | IMPLEMENTED (непроверено end-to-end) | `check-layovers/route.ts:153-217` | Зависи от симулираните събития |
| Валидиране на token | PARTIAL | `api/auth/token/route.ts:50-58` | Маркира `used_at`, но не отказва повторна употреба; bearer линк за 48 ч |
| Списък хотели в booking engine | **BROKEN** | `book/page.tsx:215` вика `/api/hotels?airport_id=`, а такъв route няма (има само `api/hotels/[id]/availability`) | Грешката се поглъща тихо; стъпка 2 остава празна |
| Наличност на хотел | IMPLEMENTED (непроверено) | `api/hotels/[id]/availability/route.ts` | |
| Създаване на booking request | PARTIAL, **риск за сигурността** | `api/bookings/route.ts:67-68` — сумата се смята от `price_per_night`, изпратен от клиента; не се изисква token или сесия | Възможна е манипулация на цената и спам заявки (зависи от RLS, който не е в репото) |
| Потвърждение от хотела (API) | PARTIAL, **риск за сигурността** | `api/bookings/[id]/confirm/route.ts` — няма проверка за потребител/роля; `/api` е публичен в `lib/supabase/middleware.ts:43` | Създава комисионна; кой може да потвърди зависи изцяло от RLS |
| Потвърждение от хотела (UI на детайлна страница) | **BROKEN / несъвместимо** | `hotel/bookings/[id]/booking-actions.tsx:35,45` пише в таблица `bookings`; API и README използват `booking_requests` | Заобикаля confirm API → без комисионна. Полетата за negotiation също се различават (`booking_id/sender_id/proposed_amount` срещу `booking_request_id/proposed_by/proposed_price`) |
| Потвърждение от live feed | IMPLEMENTED (непроверено) | `hotel/bookings/live-booking-feed.tsx:186` вика confirm API | Два различни пътя за една и съща операция |
| Negotiation | PARTIAL | `api/bookings/[id]/negotiate/route.ts`; UI-то ползва друга schema | Същият проблем със сигурността като confirm |
| Комисионна (по подразбиране 8%) | PARTIAL | `confirm/route.ts:72-74` | Само се записва; няма фактуриране, плащане или reconciliation. Бутоните `/api/commissions/bulk-bill` и `bulk-pay` водят към несъществуващи routes (`admin/commissions/page.tsx:127,135`) |
| Passenger manifest CSV + разпределяне по стаи | IMPLEMENTED (client-side) | `layover-detail.tsx:144-275`, записва в `passengers` (`:314-315`) | Обработва имена и последните 4 цифри на паспорт — лични данни |
| PDF ваучери с QR | IMPLEMENTED (client-side) | `layover-detail.tsx:324-424` | Текстът „Issued in compliance with EU Regulation 261/2004“ (`:396`) е твърдение без правна основа; QR не се валидира от хотелска страна |
| Email „ваучерите са готови“ | IMPLEMENTED | `api/vouchers/send/route.ts` | Без auth: всеки може да изпрати email от домейна на AeroStay до произволен адрес (риск за злоупотреба/spam) |
| Hotel settings, rooms, calendar | **MOCKED (само UI)** | `hotel/settings/page.tsx:41-44` (`setTimeout`), `hotel/calendar/page.tsx:87-90` (само local state), `hotel/rooms/page.tsx:9,48` (демо данни, празен onClick) | Хотелът не може реално да управлява наличност/цени |
| Airline dashboard, contacts, preferences, settings | **MOCKED (само UI)** | `airline/page.tsx:21,48,79`, `airline/contacts/page.tsx:14`, `airline/preferences/page.tsx:6`, `airline/settings/page.tsx:55-61` | Контактите за известяване (ключови за workflow-а) не се записват от UI |
| Admin страници | PARTIAL | Четат от Supabase, при грешка показват демо (`admin/hotels/page.tsx:75`) | `DEMO_MODE = true` е твърдо зададено (`lib/demo.ts:1`) |
| Crew accommodation | **NOT FOUND** като функция | Единствено споменаване: текст „Crew rest time exceeded“ в симулацията и маркетингов текст | Няма crew roster, contract rates, allotments, recurring layovers, crew pairing |
| Ground handler роля | **NOT FOUND** | Ролите са само admin/hotel/airline (`lib/supabase/middleware.ts`) | |
| Транспорт летище–хотел, хранене (EU261 чл. 9) | **NOT FOUND** | — | Право на грижа включва и тях |
| Плащания/фактуриране | **NOT FOUND** | — | Кой плаща на хотела, кога, в каква валута — не е моделирано |
| Privacy policy / Terms | **PLANNED** („coming soon“) | `app/privacy/page.tsx`, `app/terms/page.tsx` | Блокер за обработка на лични данни на пътници |

## Надеждност, сигурност, наблюдаемост

| Тема | Състояние | Доказателство |
|---|---|---|
| Auth/роли | Supabase Auth + пренасочване по роля за `/dashboard`; **всички `/api/*` са публични** | `lib/supabase/middleware.ts:43` |
| RLS | **НЕ МОЖЕ ДА СЕ ПРОВЕРИ** — политиките не са в репото | — |
| Cron с anon клиент | Коментарът признава, че трябва service role (`check-layovers/route.ts:88`, `sync-pricing/route.ts:18`); с anon ключ и без сесия записите вероятно се блокират от RLS [ХИПОТЕЗА] | |
| Input validation | Ръчни проверки; няма schema валидатор | grep за zod/валидатори: няма |
| Idempotency / retries | **НЕ Е НАМЕРЕНО**; booking insert и booking_rooms insert не са в транзакция (`api/bookings/route.ts:72-114`, грешката за rooms само се логва) | |
| Rate limiting | **НЕ Е НАМЕРЕНО** | |
| Logging/monitoring | само `console.error` | |
| Secrets | Няма hardcoded ключове в `src/` (grep); `.env*` е в `.gitignore` | |
| Backups | **НЕ МОЖЕ ДА СЕ ПРОВЕРИ** (Supabase настройки) | |
| Счупени линкове в emails | `/dashboard/bookings/{id}` не съществува (`api/bookings/route.ts:144`, `negotiate/route.ts:90`) | |
| Демо данни с реални марки | Hyatt Regency Sofia, Hilton, Bulgaria Air, Wizz Air, Ryanair и др. в `lib/demo.ts` и dashboard-ите | Риск от подвеждащо впечатление за партньорства при демо пред купувачи |

## Минимален checklist за пилот (1 авиокомпания, 1 летище, 2–3 хотела, ръчно задействане)

**Blockers (задължителни):**
1. Schema + миграции + RLS политики във version control; една таблица за резервации (`booking_requests`) навсякъде.
2. Auth на всички mutating API routes; цената да се взема от сървъра (договорена тарифа), не от клиента; еднократни tokens с по-кратък срок.
3. Ръчно създаване на disruption събитие от диспечер (вместо `Math.random`) — по-евтино и по-реалистично за пилот от flight data интеграция.
4. Хотелски UI, който реално записва наличност/тарифи, или договорени фиксирани тарифи, въведени от админ.
5. Записване на airline контакти.
6. Privacy policy, terms, DPA шаблон (AeroStay като processor на авиокомпанията — виж regulatory map), минимизиране на данните (нужни ли са последните 4 цифри на паспорт?).
7. Премахване на текста „compliance with EU 261/2004“ от ваучерите или замяна с неутрален.
8. Фактуриране/reconciliation: поне CSV експорт на потвърдени нощувки по хотел и авиокомпания.

**Силно препоръчани:** структурирани логове + alerting (провалени emails), smoke tests на основния workflow, idempotency key при създаване на резервация, премахване на `DEMO_MODE` от production или ясна демо маркировка.

**Effort [ОЦЕНКА]:** blockers 1–8 ≈ 6–10 седмици за един опитен full-stack разработчик (допускане: Supabase проектът вече съществува; без PMS/channel manager и flight data интеграции). Flight data интеграция: +2–4 седмици плюс лицензионни разходи (не са проверени). PMS/channel manager интеграции: зависи от доставчика — [НЕ Е НАМЕРЕНО], за проверка с конкретен хотел.

## Приоритетна roadmap [ОЦЕНКА]

1. **Седмици 0–2 — без код:** discovery интервюта (Разширение 3). Concierge пилот: AeroStay обработва disruption заявки ръчно (email/телефон/таблица) за 1 авиокомпания или ground handler. Мерим time-to-confirm и дали има готовност за плащане.
2. **Седмици 2–8:** blockers 1–8 само ако discovery даде реален сигнал (предоставени процесни данни, участие на budget owner).
3. **След платен пилот:** flight data trigger, PMS/channel manager, crew модул (ако сегментът се потвърди).

## Ограничения

- Не е пускан `next build`, не е тестван срещу реален Supabase; статусите „IMPLEMENTED (непроверено)“ означават, че кодът съществува, но end-to-end поведението не е доказано.
- RLS, данните в production и Vercel настройките не са видими.
- `aerostay.app` не е достъпен от тази сесия (мрежова политика) — публичният сайт не е сравнен с кода.

## Най-евтин тест

Concierge пилот без нов код за 2–4 седмици: една авиокомпания или ground handler на SOF изпраща реални disruption заявки, AeroStay ги обработва ръчно с 2–3 хотела. **Успех:** ≥5 реални заявки, медианно time-to-confirm под това, което клиентът сам отчита като текущо, и писмено съгласие да се обсъдят платени условия. **Провал:** няма реални заявки или клиентът не предоставя данни за текущия процес.
