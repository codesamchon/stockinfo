#!/usr/bin/env python3
"""
Automated Market & Macro Data Collector (Method A: GitHub Actions -> data/live_market.json)
Updates:
  1. USD/KRW, DXY & Foreign Exchange Rates (KRW, CNY, SAR, CHF, EUR, GBP, TWD)
  2. 6-Month Commodity History: Gold ($/oz), Copper ($/lb), WTI Crude Oil ($/bbl)
  3. Global Top 50 Companies Market Cap (USD Billions) & Daily Change (%)
  4. S&P 500 11 GICS Sectors Market Cap & Top 3 Companies
  5. KOSPI 200 10 Core Sectors Market Cap (KRW Trillions) & Top 3 Companies
  6. US & KR Macro Economic Indicators (Public FRED CSV + Optional FRED/ECOS API Keys)
"""

import csv
import io
import json
import os
from datetime import datetime, timedelta, timezone
from urllib.request import Request, urlopen

import yfinance as yf

KST = timezone(timedelta(hours=9))
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT_DIR, "data", "live_market.json")

# Global Top 50 Tracked Public Tickers (id -> Yahoo ticker, native currency)
GLOBAL_COMPANY_MAP = [
    ("apple", "AAPL", "USD"),
    ("microsoft", "MSFT", "USD"),
    ("nvidia", "NVDA", "USD"),
    ("alphabet", "GOOG", "USD"),
    ("amazon", "AMZN", "USD"),
    ("tsmc", "TSM", "USD"),          # NYSE ADR reflects USD market cap directly
    ("aramco", "2222.SR", "SAR"),
    ("broadcom", "AVGO", "USD"),
    ("meta", "META", "USD"),
    ("tesla", "TSLA", "USD"),
    ("lilly", "LLY", "USD"),
    ("berkshire", "BRK-B", "USD"),
    ("walmart", "WMT", "USD"),
    ("samsung", "005930.KS", "KRW"),
    ("jpmorgan", "JPM", "USD"),
    ("amd", "AMD", "USD"),
    ("micron", "MU", "USD"),
    ("visa", "V", "USD"),
    ("exxon", "XOM", "USD"),
    ("jnj", "JNJ", "USD"),
    ("skhynix", "000660.KS", "KRW"),
    ("mastercard", "MA", "USD"),
    ("asml", "ASML", "USD"),
    ("abbvie", "ABBV", "USD"),
    ("costco", "COST", "USD"),
    ("ccb", "601939.SS", "CNY"),
    ("tencent", "0700.HK", "HKD"),
    ("cocacola", "KO", "USD"),
    ("chevron", "CVX", "USD"),
    ("roche", "ROG.SW", "CHF"),
    ("palantir", "PLTR", "USD"),
    ("pg", "PG", "USD"),
    ("abc", "601288.SS", "CNY"),
    ("oracle", "ORCL", "USD"),
    ("cisco", "CSCO", "USD"),
    ("icbc", "601398.SS", "CNY"),
    ("unitedhealth", "UNH", "USD"),
    ("merck", "MRK", "USD"),
    ("bofa", "BAC", "USD"),
    ("boc", "601988.SS", "CNY"),
    ("homedepot", "HD", "USD"),
    ("ge", "GE", "USD"),
    ("pmi", "PM", "USD"),
    ("hsbc", "HSBC", "USD"),
    ("intel", "INTC", "USD"),
    ("novartis", "NVS", "USD"),
    ("morganstanley", "MS", "USD"),
]

# S&P 500 Sector ETFs (for accurate daily sector change %) + Top 3 constituent tickers
SP500_SECTOR_CONFIG = [
    ("it", "XLK", [("apple", "AAPL"), ("microsoft", "MSFT"), ("nvidia", "NVDA")]),
    ("financials", "XLF", [("berkshire", "BRK-B"), ("jpmorgan", "JPM"), ("visa", "V")]),
    ("consumer_disc", "XLY", [("amazon", "AMZN"), ("tesla", "TSLA"), ("homedepot", "HD")]),
    ("comm_services", "XLC", [("alphabet", "GOOG"), ("meta", "META"), ("netflix", "NFLX")]),
    ("healthcare", "XLV", [("lilly", "LLY"), ("jnj", "JNJ"), ("abbvie", "ABBV")]),
    ("industrials", "XLI", [("ge", "GE"), ("caterpillar", "CAT"), ("uber", "UBER")]),
    ("consumer_staples", "XLP", [("walmart", "WMT"), ("costco", "COST"), ("cocacola", "KO")]),
    ("energy", "XLE", [("exxon", "XOM"), ("chevron", "CVX"), ("conocophillips", "COP")]),
    ("utilities", "XLU", [("nextera", "NEE"), ("constellation", "CEG"), ("southern", "SO")]),
    ("real_estate", "XLRE", [("prologis", "PLD"), ("americantower", "AMT"), ("equinix", "EQIX")]),
    ("materials", "XLB", [("linde", "LIN"), ("sherwin", "SHW"), ("freeport", "FCX")]),
]

# KOSPI 200 10 Core Sectors + Top 3 constituent tickers (KRW Trillions)
KOSPI200_SECTOR_CONFIG = [
    ("kr_it", [("kr_samsung", "005930.KS"), ("kr_skhynix", "000660.KS"), ("kr_semco", "009150.KS")], 1.035),
    ("kr_industrials", [("kr_hanwhaaero", "012450.KS"), ("kr_hdhhi", "329180.KS"), ("kr_doosanenerbility", "034020.KS")], 3.12),
    ("kr_financials", [("kr_kbfg", "105560.KS"), ("kr_shinhan", "055550.KS"), ("kr_meritz", "138040.KS")], 2.65),
    ("kr_energy_chem", [("kr_lges", "373220.KS"), ("kr_samsungsdi", "006400.KS"), ("kr_skinnovation", "096770.KS")], 1.66),
    ("kr_consumer_disc", [("kr_hyundai", "005380.KS"), ("kr_kia", "000270.KS"), ("kr_mobis", "012330.KS")], 1.69),
    ("kr_healthcare", [("kr_sambaf", "207940.KS"), ("kr_celltrion", "068270.KS"), ("kr_yuhan", "000100.KS")], 1.31),
    ("kr_comm", [("kr_naver", "035420.KS"), ("kr_krafton", "259960.KS"), ("kr_kakao", "035720.KS")], 1.45),
    ("kr_materials", [("kr_posco", "005490.KS"), ("kr_koreazinc", "010130.KS"), ("kr_lgchem", "051910.KS")], 1.41),
    ("kr_staples", [("kr_ktng", "033780.KS"), ("kr_samyang", "003230.KS"), ("kr_amore", "090430.KS")], 2.01),
    ("kr_utilities", [("kr_kepco", "015760.KS"), ("kr_kogas", "036460.KS"), ("kr_kepcokps", "051600.KS")], 1.19),
]


def http_get_json(url: str, timeout: int = 15):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (StockInfoBot/1.0)"})
    with urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_fx_rates() -> dict:
    """Fetch USD exchange rates (keyless open.er-api.com + yfinance KRW=X backup)."""
    rates = {
        "USD": 1.0,
        "KRW": 1328.0,
        "CNY": 7.18,
        "HKD": 7.78,
        "SAR": 3.75,
        "CHF": 0.88,
        "EUR": 0.93,
        "GBP": 0.79,
        "TWD": 32.1,
    }
    try:
        data = http_get_json("https://open.er-api.com/v6/latest/USD")
        if data and isinstance(data.get("rates"), dict):
            for k in rates:
                if isinstance(data["rates"].get(k), (int, float)) and data["rates"][k] > 0:
                    rates[k] = float(data["rates"][k])
    except Exception as exc:
        print(f"[WARN] open.er-api FX fallback: {exc}")

    # Refine live intraday USD/KRW via Yahoo Finance KRW=X if available
    try:
        krw_hist = yf.Ticker("KRW=X").history(period="5d")
        closes = krw_hist["Close"].dropna().tolist()
        if len(closes) >= 1 and 800 < closes[-1] < 2500:
            rates["KRW"] = round(float(closes[-1]), 2)
            if len(closes) >= 2:
                rates["KRW_PREV"] = round(float(closes[-2]), 2)
    except Exception as exc:
        print(f"[WARN] yfinance KRW=X fallback: {exc}")

    return rates


def fetch_single_quote(symbol: str) -> dict:
    """Return {'market_cap': float|None, 'price': float|None, 'change_pct': float|None}."""
    out = {"market_cap": None, "price": None, "change_pct": None}
    try:
        tk = yf.Ticker(symbol)
        fi = tk.fast_info
        mcap = getattr(fi, "market_cap", None)
        if mcap and mcap > 0:
            out["market_cap"] = float(mcap)

        hist = tk.history(period="5d")
        closes = hist["Close"].dropna().tolist()
        if len(closes) >= 1:
            out["price"] = float(closes[-1])
        if len(closes) >= 2 and closes[-2] != 0:
            out["change_pct"] = round(((closes[-1] - closes[-2]) / closes[-2]) * 100.0, 2)
    except Exception as exc:
        print(f"[WARN] Quote fetch failed for {symbol}: {exc}")
    return out


def fetch_commodities_6m() -> list:
    """Fetch 6-month bi-weekly sampled history for Gold ($/oz), Copper ($/lb), WTI Oil ($/bbl)."""
    specs = [
        ("cmd_gold", "GC=F", 0),
        ("cmd_copper", "HG=F", 2),
        ("cmd_oil", "CL=F", 2),
    ]
    result = []
    for cid, ticker, decimals in specs:
        try:
            df = yf.Ticker(ticker).history(period="6mo", interval="1d")
            df = df.dropna(subset=["Close"])
            if len(df) < 10:
                continue
            # Sample ~13 evenly spaced points across 6 months + exact latest point
            total = len(df)
            indices = sorted(list({min(total - 1, round(i * (total - 1) / 12)) for i in range(13)}))
            pts = []
            for idx_pos, row_idx in enumerate(indices):
                dt = df.index[row_idx]
                val = float(df["Close"].iloc[row_idx])
                val_rounded = round(val, decimals) if decimals > 0 else round(val)
                if idx_pos == len(indices) - 1:
                    label = f"{dt.strftime('%y.%m')} 현재"
                else:
                    day_part = "초" if dt.day <= 10 else ("중" if dt.day <= 20 else "말")
                    label = f"{dt.strftime('%y.%m')} {day_part}"
                pts.append({"label": label, "val": val_rounded})
            result.append({"id": cid, "history": pts})
        except Exception as exc:
            print(f"[WARN] Commodity 6m fetch failed for {ticker}: {exc}")
    return result


def fetch_fred_series_csv(series_id: str, limit: int = 15) -> list:
    """Keyless public CSV reader from FRED (Federal Reserve Bank of St. Louis)."""
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}"
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (StockInfoBot/1.0)"})
    rows = []
    with urlopen(req, timeout=15) as resp:
        text = resp.read().decode("utf-8", errors="ignore")
    reader = csv.reader(io.StringIO(text))
    next(reader, None)  # header
    for row in reader:
        if len(row) >= 2 and row[1] not in (".", "", "NA"):
            try:
                rows.append((row[0], float(row[1])))
            except ValueError:
                continue
    return rows[-limit:]


def build_macro_updates(fx_rates: dict) -> list:
    """Fetch live US Treasury yields, Fed Funds, CPI, Unemployment, GDP & DXY/USDKRW."""
    updates = {}

    # 1. FX & Dollar Index (DXY)
    usd_krw = fx_rates["KRW"]
    prev_krw = fx_rates.get("KRW_PREV", usd_krw)
    krw_diff = round(usd_krw - prev_krw, 1)
    kr_dir = "up" if krw_diff > 0 else ("down" if krw_diff < 0 else "flat")
    kr_arrow = "▲ " if krw_diff > 0 else ("▼ " if krw_diff < 0 else "")
    kr_chg = f"{kr_arrow}{abs(krw_diff):.1f}원" if krw_diff != 0 else "보합 (0.0원)"

    dxy_quote = fetch_single_quote("DX-Y.NYB")
    dxy_val = dxy_quote["price"] or 104.2
    dxy_chg = dxy_quote["change_pct"] or 0.0
    us_fx_dir = "up" if dxy_chg > 0 else ("down" if dxy_chg < 0 else "flat")
    us_fx_arrow = "▲ " if dxy_chg > 0 else ("▼ " if dxy_chg < 0 else "")

    updates["fx_rate"] = {
        "id": "fx_rate",
        "usDisplay": f"{dxy_val:.1f}pt",
        "usNum": round(dxy_val, 2),
        "usChange": f"{us_fx_arrow}{abs(dxy_chg):.2f}%",
        "usDir": us_fx_dir,
        "krDisplay": f"{usd_krw:,.1f}원",
        "krNum": usd_krw,
        "krChange": kr_chg,
        "krDir": kr_dir,
        "gapText": f"원/달러 {usd_krw:,.1f}원 · DXY {dxy_val:.1f}pt",
    }

    # 2. US Policy Rate, 2Y, 10Y, 10Y-2Y Spread, Unemployment, CPI, Real GDP via FRED Public CSV
    us_2y = None
    us_10y = None
    try:
        dgs2 = fetch_fred_series_csv("DGS2", 5)
        if len(dgs2) >= 2:
            us_2y = dgs2[-1][1]
            diff_bp = round((dgs2[-1][1] - dgs2[-2][1]) * 100)
            updates["bond_2y"] = {
                "id": "bond_2y",
                "usDisplay": f"{us_2y:.2f}%",
                "usNum": round(us_2y, 2),
                "usChange": f"{'▲ ' if diff_bp > 0 else ('▼ ' if diff_bp < 0 else '')}{abs(diff_bp)}bp",
                "usDir": "up" if diff_bp > 0 else ("down" if diff_bp < 0 else "flat"),
            }
    except Exception as exc:
        print(f"[WARN] FRED DGS2 skipped: {exc}")

    try:
        dgs10 = fetch_fred_series_csv("DGS10", 5)
        if len(dgs10) >= 2:
            us_10y = dgs10[-1][1]
            diff_bp = round((dgs10[-1][1] - dgs10[-2][1]) * 100)
            updates["bond_10y"] = {
                "id": "bond_10y",
                "usDisplay": f"{us_10y:.2f}%",
                "usNum": round(us_10y, 2),
                "usChange": f"{'▲ ' if diff_bp > 0 else ('▼ ' if diff_bp < 0 else '')}{abs(diff_bp)}bp",
                "usDir": "up" if diff_bp > 0 else ("down" if diff_bp < 0 else "flat"),
            }
    except Exception as exc:
        print(f"[WARN] FRED DGS10 skipped: {exc}")

    if us_2y is not None and us_10y is not None:
        sp_bp = round((us_10y - us_2y) * 100)
        sign = "+" if sp_bp >= 0 else ""
        updates["yield_spread"] = {
            "id": "yield_spread",
            "usDisplay": f"{sign}{sp_bp}bp",
            "usNum": round((us_10y - us_2y), 2),
        }

    try:
        fed = fetch_fred_series_csv("DFEDTARU", 5)
        if len(fed) >= 1:
            f_val = fed[-1][1]
            updates["policy_rate"] = {
                "id": "policy_rate",
                "usDisplay": f"{f_val:.2f}%",
                "usNum": round(f_val, 2),
            }
    except Exception as exc:
        print(f"[WARN] FRED DFEDTARU skipped: {exc}")

    try:
        unrate = fetch_fred_series_csv("UNRATE", 3)
        if len(unrate) >= 2:
            u_val = unrate[-1][1]
            u_diff = round(u_val - unrate[-2][1], 1)
            updates["unemployment"] = {
                "id": "unemployment",
                "usDisplay": f"{u_val:.1f}%",
                "usNum": round(u_val, 1),
                "usChange": f"{'▲ ' if u_diff > 0 else ('▼ ' if u_diff < 0 else '보합 (')}{abs(u_diff):.1f}%p{'' if u_diff != 0 else ')'}",
                "usDir": "up" if u_diff > 0 else ("down" if u_diff < 0 else "flat"),
            }
    except Exception as exc:
        print(f"[WARN] FRED UNRATE skipped: {exc}")

    try:
        cpi_rows = fetch_fred_series_csv("CPIAUCSL", 14)
        if len(cpi_rows) >= 14:
            yoy_now = ((cpi_rows[-1][1] / cpi_rows[-13][1]) - 1.0) * 100.0
            yoy_prev = ((cpi_rows[-2][1] / cpi_rows[-14][1]) - 1.0) * 100.0
            c_diff = round(yoy_now - yoy_prev, 1)
            updates["cpi"] = {
                "id": "cpi",
                "usDisplay": f"{yoy_now:.1f}%",
                "usNum": round(yoy_now, 1),
                "usChange": f"{'▲ ' if c_diff > 0 else ('▼ ' if c_diff < 0 else '보합 (')}{abs(c_diff):.1f}%p{'' if c_diff != 0 else ')'}",
                "usDir": "up" if c_diff > 0 else ("down" if c_diff < 0 else "flat"),
            }
    except Exception as exc:
        print(f"[WARN] FRED CPIAUCSL skipped: {exc}")

    # Optional: Bank of Korea ECOS API if user adds BOK_ECOS_API_KEY in GitHub Secrets
    bok_key = os.environ.get("BOK_ECOS_API_KEY", "").strip()
    if bok_key:
        try:
            # 722Y001 / 0101000 = BOK Base Rate
            end_ym = datetime.now(KST).strftime("%Y%m")
            start_ym = (datetime.now(KST) - timedelta(days=120)).strftime("%Y%m")
            ecos_url = f"https://ecos.bok.or.kr/api/StatisticSearch/{bok_key}/json/kr/1/10/722Y001/M/{start_ym}/{end_ym}/0101000"
            ecos_data = http_get_json(ecos_url)
            rows = ecos_data.get("StatisticSearch", {}).get("row", [])
            if rows:
                kr_base = float(rows[-1]["DATA_VALUE"])
                pol_obj = updates.get("policy_rate", {"id": "policy_rate"})
                pol_obj["krDisplay"] = f"{kr_base:.2f}%"
                pol_obj["krNum"] = round(kr_base, 2)
                if "usNum" in pol_obj:
                    gap_bp = round((pol_obj["usNum"] - kr_base) * 100)
                    pol_obj["gapText"] = f"한·미 금리차 {abs(gap_bp)}bp ({'미국 우위' if gap_bp >= 0 else '한국 우위'})"
                updates["policy_rate"] = pol_obj
        except Exception as exc:
            print(f"[WARN] Optional BOK ECOS fetch skipped: {exc}")

    return list(updates.values())


def main():
    now_kst = datetime.now(KST)
    print(f"[INFO] Starting market data sync at {now_kst.isoformat()}")

    fx_rates = fetch_fx_rates()
    usd_krw = fx_rates["KRW"]
    print(f"[INFO] Live USD/KRW = {usd_krw}")

    # Cache quotes across Global, S&P 500, and KOSPI 200 to avoid duplicate Yahoo calls
    quote_cache = {}

    def get_cached_quote(sym: str) -> dict:
        if sym not in quote_cache:
            quote_cache[sym] = fetch_single_quote(sym)
        return quote_cache[sym]

    # 1. Global Top 50 Companies
    companies_out = []
    for cid, sym, ccy in GLOBAL_COMPANY_MAP:
        q = get_cached_quote(sym)
        if q["market_cap"]:
            fx_div = fx_rates.get(ccy, 1.0)
            cap_usd_b = round((q["market_cap"] / fx_div) / 1e9, 2)
            item = {"id": cid, "marketCapB": cap_usd_b}
            if q["change_pct"] is not None:
                item["changePct"] = q["change_pct"]
            companies_out.append(item)

    # 2. S&P 500 Sectors + Top 3
    sp500_out = []
    # Preload previous file to preserve baseline ratios if needed
    prev_sp_caps = {}
    if os.path.exists(OUT_PATH):
        try:
            with open(OUT_PATH, "r", encoding="utf-8") as pf:
                prev_json = json.load(pf)
                for s in prev_json.get("sp500Sectors", []):
                    prev_sp_caps[s["id"]] = s.get("marketCapB")
        except Exception:
            pass

    for sec_id, etf_sym, top3_list in SP500_SECTOR_CONFIG:
        etf_q = get_cached_quote(etf_sym)
        top3_items = []
        top3_sum_b = 0.0
        for tid, tsym in top3_list:
            tq = get_cached_quote(tsym)
            if tq["market_cap"]:
                cap_b = round(tq["market_cap"] / 1e9, 2)
                top3_sum_b += cap_b
                t_obj = {"id": tid, "ticker": tsym, "marketCapB": cap_b}
                if tq["change_pct"] is not None:
                    t_obj["changePct"] = tq["change_pct"]
                top3_items.append(t_obj)

        sec_obj = {"id": sec_id, "top3": top3_items}
        if etf_q["change_pct"] is not None:
            sec_obj["changePct"] = etf_q["change_pct"]
        # Scale sector marketCapB smoothly by ETF daily move if previous baseline exists
        if sec_id in prev_sp_caps and prev_sp_caps[sec_id] and etf_q["change_pct"] is not None:
            sec_obj["marketCapB"] = round(prev_sp_caps[sec_id] * (1.0 + etf_q["change_pct"] / 100.0), 1)
        elif top3_sum_b > 0:
            # Fallback sector cap floor > top3 sum
            sec_obj["marketCapB"] = round(max(top3_sum_b * 1.45, prev_sp_caps.get(sec_id, top3_sum_b * 1.6)), 1)
        sp500_out.append(sec_obj)

    # 3. KOSPI 200 Sectors + Top 3 (KRW Trillions)
    kospi_out = []
    for sec_id, top3_list, tail_mult in KOSPI200_SECTOR_CONFIG:
        top3_items = []
        top3_sum_jo = 0.0
        weighted_chg_sum = 0.0
        for tid, tsym in top3_list:
            tq = get_cached_quote(tsym)
            if tq["market_cap"]:
                cap_jo = round(tq["market_cap"] / 1e12, 2)
                top3_sum_jo += cap_jo
                chg = tq["change_pct"] if tq["change_pct"] is not None else 0.0
                weighted_chg_sum += cap_jo * chg
                top3_items.append({
                    "id": tid,
                    "ticker": tsym,
                    "marketCapJo": cap_jo,
                    "changePct": chg,
                })
        if top3_items and top3_sum_jo > 0:
            sec_cap_jo = round(top3_sum_jo * tail_mult, 1)
            sec_chg = round(weighted_chg_sum / top3_sum_jo, 2)
            kospi_out.append({
                "id": sec_id,
                "marketCapJo": sec_cap_jo,
                "changePct": sec_chg,
                "top3": top3_items,
            })

    # 4. Commodities 6-Month History
    commodities_out = fetch_commodities_6m()

    # 5. Macro Indicators
    macro_out = build_macro_updates(fx_rates)

    payload = {
        "isBootstrap": False,
        "updatedAt": now_kst.isoformat(),
        "updatedLabel": now_kst.strftime("%Y년 %m월 %d일 %H:%M 기준").replace(" 0", " "),
        "usdKrw": usd_krw,
        "companies": companies_out,
        "sp500Sectors": sp500_out,
        "kospi200Sectors": kospi_out,
        "commodities": commodities_out,
        "macroIndicators": macro_out,
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"[INFO] Wrote {OUT_PATH} successfully ({len(companies_out)} global firms, {len(commodities_out)} commodities).")


if __name__ == "__main__":
    main()
