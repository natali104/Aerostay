"""Финансов модел на AeroStay: 36 месеца, три сценария, EUR, без ДДС.

Всички входове са в assumptions.csv (повечето са [ОЦЕНКА]). Продуктът се третира като готов
(по искане на основателя, 30.10.2026); разходът за довършване е отделен параметър.

Пускане:  python3 -I analysis/finance/financial_model.py
Изход:    analysis/finance/output/*.csv
"""
import csv
import math
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "output"
SCENARIOS = ("conservative", "base", "optimistic")
MONTHS = 36


def load_assumptions():
    a = {s: {} for s in SCENARIOS}
    with (HERE / "assumptions.csv").open() as f:
        for row in csv.DictReader(f):
            for s in SCENARIOS:
                a[s][row["param"]] = float(row[s])
    return a


def airports_live(a, m):
    """Брой SOF-еквивалентни летища на живо в месец m (линейно между целите, закръглено надолу)."""
    if m < a["first_live_month"]:
        return 0
    points = [(a["first_live_month"], 1), (12, a["airports_end_y1"]), (24, a["airports_end_y2"]), (36, a["airports_end_y3"])]
    points = sorted({p[0]: p for p in points}.values())
    for (m0, v0), (m1, v1) in zip(points, points[1:]):
        if m0 <= m <= m1:
            return max(1, math.floor(v0 + (v1 - v0) * (m - m0) / max(1, m1 - m0) + 1e-9))
    return int(points[-1][1])


def run(a, pricing="commission", fee_rn=6.0, saas=1500.0, hybrid_base=750.0, hybrid_rn=3.0):
    rows, golive = [], []
    receivables = {}  # месец на постъпване -> сума
    cash = a["starting_cash"]
    for m in range(1, MONTHS + 1):
        n = airports_live(a, m)
        new = n - len(golive)
        golive += [m] * max(0, new)

        # Обем: потенциал на летище / 12 × дял, който расте линейно до share_max.
        rn = 0.0
        for g in golive:
            ramp = min(1.0, (m - g + 1) / a["share_ramp_months"])
            rn += a["rn_potential_per_airport"] / 12 * a["share_max"] * ramp
        gmv = rn * a["adr_eur"]

        if pricing == "commission":
            pax_rev = gmv * a["commission_rate"]
        elif pricing == "fee_per_rn":
            pax_rev = rn * fee_rn
        elif pricing == "saas":
            pax_rev = n * saas
        else:  # hybrid
            pax_rev = n * hybrid_base + rn * hybrid_rn

        crew_rn = 0.0
        if m >= a["crew_start_month"] and a["crew_rn_per_month_y3"] > 0:
            crew_rn = a["crew_rn_per_month_y3"] * (m - a["crew_start_month"] + 1) / (MONTHS - a["crew_start_month"] + 1)
        crew_rev = crew_rn * a["crew_fee_per_rn"]
        revenue = pax_rev + crew_rev

        # Парични постъпления: комисионната от хотелите идва със закъснение и не цялата се събира.
        collected = a["commission_collected_share"] if pricing == "commission" else 1.0
        lag = round(a["hotel_payment_days"] / 30) if pricing == "commission" else 1
        bad_debt = pax_rev * (1 - collected)
        receivables[m + lag] = receivables.get(m + lag, 0) + pax_rev * collected
        receivables[m + 1] = receivables.get(m + 1, 0) + crew_rev
        cash_in = receivables.pop(m, 0.0)

        live = m >= a["first_live_month"]
        ops_fte = (a["ops_fte_y1"] + max(0, math.ceil((n - 1) / 3)) * a["ops_fte_per_3_airports"]) if live else 0
        cogs = {
            "ops_salaries": ops_fte * a["salary_ops"],
            "cloud_per_airport": n * a["cloud_per_airport"],
            "flight_data_api": a["flight_data_api"] if live else 0,
            "bad_debt": bad_debt,
        }
        opex = {
            "founder": a["salary_founder"],
            "developer": a["salary_dev"],
            "sales": a["salary_sales"] if m >= a["sales_hire_month"] else 0,
            "cloud_base": a["cloud_base"],
            "onboarding": max(0, new) * a["onboarding_per_airport"],
            "travel_sales": a["travel_sales"],
            "marketing": a["marketing_events"],
            "legal": a["legal_monthly"] + (a["legal_one_off"] if m == 1 else 0),
            "insurance": a["insurance_annual"] / 12,
            "admin": a["admin_accounting"],
            "product_readiness": a["product_readiness_one_off"] if m == 1 else 0,
        }
        cogs_t, opex_t = sum(cogs.values()), sum(opex.values())
        gross = revenue - cogs_t
        ebitda = gross - opex_t
        # Плащанията за разходи са в същия месец; лошите вземания не са паричен разход (просто не постъпват).
        cash_out = cogs_t - bad_debt + opex_t
        cash += cash_in - cash_out
        rows.append({
            "month": m, "airports_live": n, "new_airports": max(0, new),
            "pax_room_nights": round(rn), "gmv_eur": round(gmv), "crew_room_nights": round(crew_rn),
            "revenue_eur": round(revenue), "pax_revenue_eur": round(pax_rev), "crew_revenue_eur": round(crew_rev),
            "cogs_eur": round(cogs_t), "gross_profit_eur": round(gross), "opex_eur": round(opex_t),
            "ebitda_eur": round(ebitda), "cash_in_eur": round(cash_in), "cash_out_eur": round(cash_out),
            "cumulative_cash_eur": round(cash), "ops_fte": ops_fte,
        })
    return rows


def summarize(rows, a):
    out = []
    for y in (1, 2, 3):
        ys = rows[(y - 1) * 12: y * 12]
        rev = sum(r["revenue_eur"] for r in ys)
        gross = sum(r["gross_profit_eur"] for r in ys)
        out.append({
            "year": y,
            "airports_end": ys[-1]["airports_live"],
            "pax_room_nights": sum(r["pax_room_nights"] for r in ys),
            "gmv_eur": sum(r["gmv_eur"] for r in ys),
            "revenue_eur": rev,
            "gross_profit_eur": gross,
            "gross_margin_pct": round(100 * gross / rev, 1) if rev else None,
            "opex_eur": sum(r["opex_eur"] for r in ys),
            "ebitda_eur": sum(r["ebitda_eur"] for r in ys),
            "net_cash_flow_eur": sum(r["cash_in_eur"] - r["cash_out_eur"] for r in ys),
            "cash_end_eur": ys[-1]["cumulative_cash_eur"],
        })
    return out


def key_metrics(rows, a):
    min_cash = min(r["cumulative_cash_eur"] for r in rows)
    be = next((r["month"] for r in rows if r["ebitda_eur"] >= 0 and r["revenue_eur"] > 0), None)
    last = rows[-1]
    # Break-even при зрялото летище: фиксирани месечни разходи / принос на нощувка.
    contrib_rn = a["adr_eur"] * a["commission_rate"] * a["commission_collected_share"]
    fixed_m36 = last["opex_eur"] + last["cogs_eur"]  # всички разходи в м.36 (за справка)
    rn_per_mature_airport = a["rn_potential_per_airport"] / 12 * a["share_max"]
    # Повтарящи се фиксирани разходи: opex без onboarding + първият ops FTE + flight data API.
    fixed_recurring = (a["salary_founder"] + a["salary_dev"] + (a["salary_sales"] if a["sales_hire_month"] <= MONTHS else 0)
                       + a["cloud_base"] + a["travel_sales"] + a["marketing_events"] + a["legal_monthly"]
                       + a["insurance_annual"] / 12 + a["admin_accounting"] + a["ops_fte_y1"] * a["salary_ops"] + a["flight_data_api"])
    # Принос на зряло летище: събрана комисионна − облак на летище − пропорционален ops.
    contrib_airport = rn_per_mature_airport * contrib_rn - a["cloud_per_airport"] - a["salary_ops"] * a["ops_fte_per_3_airports"] / 3
    be_airports = fixed_recurring / contrib_airport if contrib_airport > 0 else None
    rn_be = be_airports * rn_per_mature_airport if be_airports else None
    burn_y1 = -sum(min(0, r["cash_in_eur"] - r["cash_out_eur"]) for r in rows[:12]) / 12
    return {
        "funding_need_eur (min cumulative cash)": -min_cash if min_cash < 0 else 0,
        "funding_need_with_6m_buffer_eur": (-min_cash if min_cash < 0 else 0) + 6 * burn_y1,
        "first_ebitda_positive_month": be or "няма до м.36",
        "avg_monthly_burn_y1_eur": round(burn_y1),
        "monthly_costs_m36_eur": round(fixed_m36),
        "fixed_recurring_costs_per_month_eur": round(fixed_recurring),
        "contribution_per_room_night_eur": round(contrib_rn, 2),
        "room_nights_per_mature_airport_per_month": round(rn_per_mature_airport),
        "contribution_per_mature_airport_eur": round(contrib_airport),
        "break_even_mature_airports": round(be_airports, 1) if be_airports else "няма: приносът на летище е ≤ 0",
        "break_even_room_nights_per_month": round(rn_be) if rn_be else "няма",
        "cash_end_m36_eur": last["cumulative_cash_eur"],
    }


def unit_economics(rows, a):
    """CAC на летище и payback. LTV не се смята: няма данни за churn."""
    new_y2 = sum(r["new_airports"] for r in rows[12:24])
    sales_cost_y2 = 12 * (a["travel_sales"] + a["marketing_events"]) + 12 * a["salary_founder"] * 0.5 + \
        sum(a["salary_sales"] for m in range(13, 25) if m >= a["sales_hire_month"])
    cac = (sales_cost_y2 / new_y2 if new_y2 else None)
    cac_total = cac + a["onboarding_per_airport"] if cac else None
    rn_m = a["rn_potential_per_airport"] / 12 * a["share_max"]
    contrib_m = rn_m * a["adr_eur"] * a["commission_rate"] * a["commission_collected_share"] - a["cloud_per_airport"] - a["salary_ops"] * a["ops_fte_per_3_airports"] / 3
    return {
        "new_airports_y2": new_y2,
        "cac_per_airport_eur (sales+50% founder / new airports y2)": round(cac) if cac else None,
        "cac_incl_onboarding_eur": round(cac_total) if cac_total else None,
        "contribution_per_mature_airport_per_month_eur": round(contrib_m),
        "payback_months_if_mature_from_day1": round(cac_total / contrib_m, 1) if cac_total and contrib_m > 0 else "не се изплаща",
        "payback_months_with_ramp": payback_with_ramp(a, cac_total, rn_m) if cac_total and contrib_m > 0 else "не се изплаща",
        "ltv": "не е изчислен: няма данни за churn",
    }


def payback_with_ramp(a, cac, rn_mature):
    """Месеци до възвръщане на CAC, като делът на летището расте за share_ramp_months."""
    cum, fixed_part = 0.0, a["cloud_per_airport"] + a["salary_ops"] * a["ops_fte_per_3_airports"] / 3
    for k in range(1, 121):
        rn = rn_mature * min(1.0, k / a["share_ramp_months"])
        cum += rn * a["adr_eur"] * a["commission_rate"] * a["commission_collected_share"] - fixed_part
        if cum >= cac:
            return k
    return "над 120 месеца"


def write(name, rows):
    OUT.mkdir(exist_ok=True)
    with (OUT / name).open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)


def main():
    A = load_assumptions()
    annual, keys, units = [], [], []
    for s in SCENARIOS:
        rows = run(A[s])
        write(f"monthly_{s}.csv", rows)
        for r in summarize(rows, A[s]):
            annual.append({"scenario": s, **r})
        keys.append({"scenario": s, **key_metrics(rows, A[s])})
        units.append({"scenario": s, **unit_economics(rows, A[s])})
    write("annual_summary.csv", annual)
    write("key_metrics.csv", keys)
    write("unit_economics.csv", units)

    # Модели на таксуване при базовия обем (година 3).
    pricing = []
    for label, kw in [("Комисионна 8% от хотела", {"pricing": "commission"}),
                      ("€6 на нощувка от авиокомпанията", {"pricing": "fee_per_rn", "fee_rn": 6.0}),
                      ("Абонамент €1 500 на летище месечно", {"pricing": "saas", "saas": 1500.0}),
                      ("Хибрид €750/летище + €3/нощувка", {"pricing": "hybrid"}),
                      ("Абонамент €4 500 на летище месечно", {"pricing": "saas", "saas": 4500.0}),
                      ("€10 на нощувка от авиокомпанията", {"pricing": "fee_per_rn", "fee_rn": 10.0}),
                      ("€11 на нощувка от авиокомпанията", {"pricing": "fee_per_rn", "fee_rn": 11.0})]:
        rows = run(A["base"], **kw)
        y = summarize(rows, A["base"])
        k = key_metrics(rows, A["base"])
        pricing.append({"model": label, "revenue_y3_eur": y[2]["revenue_eur"], "ebitda_y3_eur": y[2]["ebitda_eur"],
                        "first_ebitda_positive_month": k["first_ebitda_positive_month"],
                        "ebitda_m36_eur": rows[-1]["ebitda_eur"],
                        "cash_end_m36_eur": rows[-1]["cumulative_cash_eur"],
                        "funding_need_eur": k["funding_need_eur (min cumulative cash)"]})
    write("pricing_comparison.csv", pricing)

    # Варианти на базовия сценарий: хипотези, които не са в основните сценарии.
    variants = []
    for label, changes in [("Базов (основен)", {}),
                           ("+ crew поток: 1 500 нощувки/месец до м.36, €2/нощувка, от м.13 (хипотеза)", {"crew_rn_per_month_y3": 1500, "crew_start_month": 13}),
                           ("24/7 смени: 4,5 ops FTE от първото летище", {"ops_fte_y1": 4.5}),
                           ("Оптимистичен с 24/7 смени", "opt247")]:
        if changes == "opt247":
            a = dict(A["optimistic"]); a["ops_fte_y1"] = 4.5
        else:
            a = dict(A["base"]); a.update(changes)
        rows = run(a)
        y = summarize(rows, a)
        variants.append({"variant": label, "revenue_y3_eur": y[2]["revenue_eur"], "ebitda_y3_eur": y[2]["ebitda_eur"],
                         "cash_end_m36_eur": rows[-1]["cumulative_cash_eur"],
                         "funding_need_eur": key_metrics(rows, a)["funding_need_eur (min cumulative cash)"]})
    write("variants_base.csv", variants)

    # Чувствителност ±20% около базовия сценарий.
    sens = []
    params = {"rn_potential_per_airport": "Нощувки на летище", "share_max": "Пазарен дял", "adr_eur": "Цена на нощувка",
              "commission_rate": "Комисионна", "airports": "Брой летища", "salaries": "Заплати"}
    for p, label in params.items():
        for f in (0.8, 1.2):
            a = dict(A["base"])
            if p == "airports":
                for k in ("airports_end_y1", "airports_end_y2", "airports_end_y3"):
                    a[k] = max(1, a[k] * f)  # без закръгляне; airports_live() взема цяла част
            elif p == "salaries":
                for k in ("salary_founder", "salary_dev", "salary_ops", "salary_sales"):
                    a[k] *= f
            else:
                a[p] *= f
            rows = run(a)
            y = summarize(rows, a)
            sens.append({"parameter": label, "change": f"{round((f - 1) * 100):+d}%",
                         "ebitda_y3_eur": y[2]["ebitda_eur"], "cash_end_m36_eur": rows[-1]["cumulative_cash_eur"],
                         "funding_need_eur": key_metrics(rows, a)["funding_need_eur (min cumulative cash)"]})
    write("sensitivity_base.csv", sens)

    for k in keys:
        print(k)
    for r in annual:
        print(r)
    for u in units:
        print(u)
    for p in pricing:
        print(p)
    for s in sens:
        print(s)
    for v in variants:
        print(v)


if __name__ == "__main__":
    main()
