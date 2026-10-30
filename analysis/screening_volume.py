"""Груба горна граница на passenger disruption обема и приходите от комисионна на едно летище (SOF).

Всички входове са [ОЦЕНКА] или непроверени leads; виж ASSUMPTIONS. Целта е порядък, не прогноза.
Пускане: python3 analysis/screening_volume.py
"""
import csv
from pathlib import Path

# Lead (непроверено): SOF 2025 = 65 764 movements (Wikipedia, цитирано в analysis/research/market-data.md).
SOF_MOVEMENTS_2025 = 65_764
DEPARTURES = SOF_MOVEMENTS_2025 / 2  # movements = излитания + кацания

ASSUMPTIONS = {
    # дял от излитанията с disruption, изискващо нощувка по EU261 чл. 9.
    # Горна котва: 1,23% от полетите с care/accommodation в ЕС 2010–2012 (BEUC/SWD(2013) 62, непроверено) —
    # включва и само храна, затова нощувките са под тази стойност.
    "overnight_share": {"low": 0.003, "base": 0.007, "high": 0.012},
    # пътници, които реално се нуждаят от хотел на събитие (местните пътници при SOF излитане често се прибират)
    "pax_needing_hotel": {"low": 50, "base": 80, "high": 110},
    "pax_per_room": {"low": 1.5, "base": 1.5, "high": 1.5},
    "nights": {"low": 1, "base": 1, "high": 1},
    "room_rate_eur": {"low": 70, "base": 85, "high": 100},  # без ДДС, неверифицирано
    "commission_rate": {"low": 0.08, "base": 0.08, "high": 0.08},  # 8% по подразбиране в кода
}


def scenario(name, overrides=None, fee_per_room_night=None):
    a = {k: v[name] for k, v in ASSUMPTIONS.items()}
    a.update(overrides or {})
    events = DEPARTURES * a["overnight_share"]
    room_nights = events * a["pax_needing_hotel"] / a["pax_per_room"] * a["nights"]
    gmv = room_nights * a["room_rate_eur"]
    revenue = room_nights * fee_per_room_night if fee_per_room_night else gmv * a["commission_rate"]
    return {
        "scenario": name,
        "departures": round(DEPARTURES),
        "overnight_events": round(events),
        "room_nights": round(room_nights),
        "gmv_eur": round(gmv),
        "aerostay_revenue_eur": round(revenue),
    }


if __name__ == "__main__":
    rows = [scenario(s) for s in ("low", "base", "high")]
    out = Path(__file__).parent / "output" / "screening_volume_sof.csv"
    with out.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)
    for r in rows:
        print(r)

    # Чувствителност около high сценария: по един параметър.
    sens = [
        ("high", scenario("high")),
        ("180 pax на събитие", scenario("high", {"pax_needing_hotel": 180})),
        ("дял нощувки 1,23%", scenario("high", {"overnight_share": 0.0123})),
        ("€15 на room night вместо 8%", scenario("high", fee_per_room_night=15)),
    ]
    out_s = Path(__file__).parent / "output" / "screening_volume_sof_sensitivity.csv"
    with out_s.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["case", "room_nights", "gmv_eur", "aerostay_revenue_eur"])
        for label, r in sens:
            w.writerow([label, r["room_nights"], r["gmv_eur"], r["aerostay_revenue_eur"]])
            print(label, r["aerostay_revenue_eur"])
