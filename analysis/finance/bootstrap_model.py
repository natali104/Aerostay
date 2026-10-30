"""Bootstrap модел на AeroStay: основателят прави разработка, поддръжка и продажби без заплата,
хотелите плащат комисионна, летищата и авиокомпаниите ползват платформата безплатно,
наемане само когато приходите го позволят. 36 месеца, три сценария, EUR без ДДС.

Входове: assumptions_bootstrap.csv. Пускане: python3 -I analysis/finance/bootstrap_model.py
Изход:  analysis/finance/output/bootstrap_*.csv
"""
import csv
import math
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "output"
SCENARIOS = ("conservative", "base", "optimistic")
MONTHS = 36


def load():
    a = {s: {} for s in SCENARIOS}
    with (HERE / "assumptions_bootstrap.csv").open() as f:
        for row in csv.DictReader(f):
            for s in SCENARIOS:
                a[s][row["param"]] = float(row[s])
    return a


def airports_live(a, m):
    if m < a["first_live_month"]:
        return 0
    pts = sorted({p[0]: p for p in [(a["first_live_month"], 1), (12, a["airports_end_y1"]),
                                      (24, a["airports_end_y2"]), (36, a["airports_end_y3"])]}.values())
    for (m0, v0), (m1, v1) in zip(pts, pts[1:]):
        if m0 <= m <= m1:
            return max(1, math.floor(v0 + (v1 - v0) * (m - m0) / max(1, m1 - m0) + 1e-9))
    return int(pts[-1][1])


def run(a, commission=None):
    rate = a["commission_rate"] if commission is None else commission
    rows, golive, receivables, cash, hires, revenue_hist = [], [], {}, 0.0, 0, []
    for m in range(1, MONTHS + 1):
        n = airports_live(a, m)
        new = max(0, n - len(golive))
        golive += [m] * new
        rn = sum(a["rn_potential_per_airport"] / 12 * a["share_max"] * min(1.0, (m - g + 1) / a["share_ramp_months"]) for g in golive)
        gmv = rn * a["adr_eur"]
        revenue = gmv * rate
        bad_debt = revenue * (1 - a["commission_collected_share"])
        lag = round(a["hotel_payment_days"] / 30)
        receivables[m + lag] = receivables.get(m + lag, 0) + revenue - bad_debt
        cash_in = receivables.pop(m, 0.0)

        # Наемане от приходите: среден приход за последните 3 месеца над прага.
        revenue_hist.append(revenue)
        avg3 = sum(revenue_hist[-3:]) / min(3, len(revenue_hist))
        if hires == 0 and avg3 >= a["hire1_revenue_trigger"]:
            hires = 1
        if hires == 1 and avg3 >= a["hire2_revenue_trigger"]:
            hires = 2
        staff = (a["hire1_cost"] if hires >= 1 else 0) + (a["hire2_cost"] if hires >= 2 else 0)

        costs = {
            "founder": a["founder_salary"],
            "staff": staff,
            "cloud": a["cloud_base"] + n * a["cloud_per_airport"],
            "flight_data": a["flight_data"],
            "accounting": a["accounting"],
            "legal": a["legal_one_off"] if m == 1 else 0,
            "insurance": a["insurance_annual"] / 12,
            "travel_sales": a["travel_sales"],
            "onboarding": new * a["onboarding_per_airport"],
        }
        paid = sum(costs.values())
        profit = revenue - bad_debt - paid
        cash += cash_in - paid
        rows.append({"month": m, "airports_live": n, "room_nights": round(rn), "gmv_eur": round(gmv),
                     "revenue_eur": round(revenue), "costs_eur": round(paid + bad_debt), "staff_hired": hires,
                     "profit_eur": round(profit), "cash_in_eur": round(cash_in), "cumulative_cash_eur": round(cash)})
    return rows


def summary(rows):
    out = []
    for y in (1, 2, 3):
        ys = rows[(y - 1) * 12: y * 12]
        out.append({"year": y, "airports_end": ys[-1]["airports_live"],
                    "room_nights": sum(r["room_nights"] for r in ys), "gmv_eur": sum(r["gmv_eur"] for r in ys),
                    "revenue_eur": sum(r["revenue_eur"] for r in ys), "costs_eur": sum(r["costs_eur"] for r in ys),
                    "profit_eur": sum(r["profit_eur"] for r in ys), "staff_end": ys[-1]["staff_hired"],
                    "cash_end_eur": ys[-1]["cumulative_cash_eur"]})
    return out


def keys(rows):
    min_cash = min(r["cumulative_cash_eur"] for r in rows)
    first_profit = next((r["month"] for r in rows if r["profit_eur"] > 0), None)
    cash_be = next((r["month"] for r in rows[1:] if r["cumulative_cash_eur"] >= 0 and min(x["cumulative_cash_eur"] for x in rows[:r["month"]]) < 0), None)
    return {"own_money_needed_eur": -min_cash if min_cash < 0 else 0,
            "first_profitable_month": first_profit or "няма до м.36",
            "cash_back_to_zero_month": cash_be or ("няма до м.36" if rows[-1]["cumulative_cash_eur"] < 0 else "не пада под 0"),
            "monthly_profit_m36_eur": rows[-1]["profit_eur"],
            "cash_end_m36_eur": rows[-1]["cumulative_cash_eur"]}


def write(name, rows):
    OUT.mkdir(exist_ok=True)
    with (OUT / name).open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)


def main():
    A = load()
    ann, ks = [], []
    for s in SCENARIOS:
        rows = run(A[s])
        write(f"bootstrap_monthly_{s}.csv", rows)
        ann += [{"scenario": s, **r} for r in summary(rows)]
        ks.append({"scenario": s, **keys(rows)})
    write("bootstrap_annual.csv", ann)
    write("bootstrap_key_metrics.csv", ks)

    # Кой плаща: комисионна от хотела при различни нива (базов обем). Летища и авиокомпании: безплатно.
    comm = []
    for rate in (0.05, 0.08, 0.10, 0.12, 0.15):
        rows = run(A["base"], commission=rate)
        y = summary(rows)
        comm.append({"commission": f"{round(rate * 100)}%", "revenue_y3_eur": y[2]["revenue_eur"],
                     "profit_y3_eur": y[2]["profit_eur"], "cash_end_m36_eur": rows[-1]["cumulative_cash_eur"],
                     "own_money_needed_eur": keys(rows)["own_money_needed_eur"]})
    write("bootstrap_commission_levels.csv", comm)

    # Една SOF-еквивалентна летище в зряло състояние: месечна сметка.
    unit = []
    for s in SCENARIOS:
        a = A[s]
        rn = a["rn_potential_per_airport"] / 12 * a["share_max"]
        rev = rn * a["adr_eur"] * a["commission_rate"] * a["commission_collected_share"]
        fixed = a["cloud_base"] + a["cloud_per_airport"] + a["accounting"] + a["insurance_annual"] / 12 + a["travel_sales"]
        unit.append({"scenario": s, "room_nights_per_month": round(rn), "gmv_per_month_eur": round(rn * a["adr_eur"]),
                     "collected_commission_per_month_eur": round(rev), "fixed_costs_one_airport_eur": round(fixed),
                     "profit_one_airport_per_month_eur": round(rev - fixed)})
    write("bootstrap_unit.csv", unit)

    for x in ks + ann + comm + unit:
        print(x)


if __name__ == "__main__":
    main()
