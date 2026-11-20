#!/usr/bin/env python3
"""
Automated Dynamic Market & Macro Data Collector (Method A: GitHub Actions -> data/live_market.json)
Updates:
  1. Dynamic Global Top 50 Publicly Listed Companies (Excludes unlisted/private firms):
     - Tier 1: Live global ranking table from CompaniesMarketCap (Top 100 listed stocks -> Top 50)
     - Tier 2: 90+ Global Mega-Cap Public Stock Pool via Yahoo Finance (yfinance) + live FX conversion
  2. USD/KRW, DXY & Global Foreign Exchange Rates
  3. 6-Month Commodity History: Gold ($/oz), Copper ($/lb), WTI Crude Oil ($/bbl)
  4. S&P 500 11 GICS Sectors Market Cap & Top 3 Companies
  5. KOSPI 200 10 Core Sectors Real-Time Intraday Market Cap & Daily Change via Naver Finance API
  6. Full US (FRED CSV) & KR (BOK ECOS API: Base Rate, 2Y/10Y KTB, CPI, Core CPI, PPI, Employment, Real GDP) Macro Sync
"""

import csv
import html as html_lib
import io
import json
import os
import re
from datetime import datetime, timedelta, timezone
from urllib.request import Request, urlopen

import yfinance as yf

KST = timezone(timedelta(hours=9))
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT_DIR, "data", "live_market.json")

# Strictly exclude genuinely unlisted / private companies (SpaceX SPCX, Anthropic ANT, CXMT 688825.SS are officially listed)
UNLISTED_TICKERS = {"OPENAI", "BYTEDANCE", "STRIPE"}
UNLISTED_NAMES = {"openai", "bytedance", "stripe"}

# Country Name -> ISO2 Code Mapping (for dynamic ranking parser)
COUNTRY_NAME_TO_CODE = {
    "usa": "US",
    "united states": "US",
    "china": "CN",
    "hong kong": "CN",
    "taiwan": "TW",
    "saudi arabia": "SA",
    "south korea": "KR",
    "korea": "KR",
    "japan": "JP",
    "france": "FR",
    "switzerland": "CH",
    "netherlands": "NL",
    "uk": "GB",
    "united kingdom": "GB",
    "germany": "DE",
    "denmark": "DK",
    "india": "IN",
    "canada": "CA",
    "australia": "AU",
    "spain": "ES",
    "ireland": "IE",
    "italy": "IT",
    "brazil": "BR",
}

# Suffix -> ISO2 Country Fallback
SUFFIX_TO_COUNTRY = {
    "KS": "KR",
    "KQ": "KR",
    "SS": "CN",
    "SZ": "CN",
    "HK": "CN",
    "TW": "TW",
    "SR": "SA",
    "T": "JP",
    "PA": "FR",
    "SW": "CH",
    "AS": "NL",
    "L": "GB",
    "DE": "DE",
    "F": "DE",
    "CO": "DK",
    "NS": "IN",
    "BO": "IN",
    "TO": "CA",
    "AX": "AU",
    "MC": "ES",
    "MI": "IT",
    "SA": "BR",
}

# Master Pool of 90+ Global Publicly Listed Mega-Caps (Used for Korean metadata + Tier-2 yfinance dynamic pool)
# Tuple: (id, en_name, ko_name, yahoo_ticker, currency, country, sector)
GLOBAL_PUBLIC_POOL = [
    ("apple", "Apple", "애플", "AAPL", "USD", "US", "IT·소비자기술"),
    ("microsoft", "Microsoft", "마이크로소프트", "MSFT", "USD", "US", "클라우드·AI 소프트웨어"),
    ("nvidia", "NVIDIA", "엔비디아", "NVDA", "USD", "US", "AI 반도체"),
    ("alphabet", "Alphabet", "알파벳(구글)", "GOOG", "USD", "US", "플랫폼·클라우드·AI"),
    ("amazon", "Amazon", "아마존", "AMZN", "USD", "US", "이커머스·클라우드"),
    ("spacex", "SpaceX", "스페이스X", "SPCX", "USD", "US", "우주항공·위성통신·AI"),
    ("anthropic", "Anthropic", "앤트로픽", "ANT", "USD", "US", "생성형 AI 모델·클라우드"),
    ("cxmt", "CXMT", "창신메모리(CXMT)", "688825.SS", "CNY", "CN", "DRAM 메모리 반도체"),
    ("aramco", "Saudi Aramco", "사우디 아람코", "2222.SR", "SAR", "SA", "에너지·석유화학"),
    ("meta", "Meta", "메타 플랫폼스", "META", "USD", "US", "소셜미디어·AI"),
    ("tsmc", "TSMC", "TSMC", "TSM", "USD", "TW", "파운드리 반도체"),
    ("berkshire", "Berkshire Hathaway", "버크셔 해서웨이", "BRK-B", "USD", "US", "복합금융·지주"),
    ("broadcom", "Broadcom", "브로드컴", "AVGO", "USD", "US", "맞춤형 AI 반도체·SW"),
    ("tesla", "Tesla", "테슬라", "TSLA", "USD", "US", "자율주행·전기차·로보틱스"),
    ("lilly", "Eli Lilly", "일라이 릴리", "LLY", "USD", "US", "제약·바이오"),
    ("walmart", "Walmart", "월마트", "WMT", "USD", "US", "필수소비재·유통"),
    ("jpmorgan", "J.P.Morgan", "JP모건 체이스", "JPM", "USD", "US", "글로벌 은행·투자금융"),
    ("visa", "Visa", "비자", "V", "USD", "US", "글로벌 결제 네트워크"),
    ("tencent", "Tencent", "텐센트", "0700.HK", "HKD", "CN", "게임·메신저·AI 클라우드"),
    ("mastercard", "Mastercard", "마스터카드", "MA", "USD", "US", "글로벌 결제·핀테크"),
    ("exxon", "ExxonMobil", "엑슨모빌", "XOM", "USD", "US", "에너지·석유가스"),
    ("unitedhealth", "UnitedHealth", "유나이티드헬스", "UNH", "USD", "US", "헬스케어·의료보험"),
    ("costco", "Costco", "코스트코", "COST", "USD", "US", "회원제 창고형 유통"),
    ("oracle", "Oracle", "오라클", "ORCL", "USD", "US", "클라우드 인프라·DB"),
    ("netflix", "Netflix", "넷플릭스", "NFLX", "USD", "US", "글로벌 스트리밍·미디어"),
    ("pg", "P&G", "프록터앤드갬블", "PG", "USD", "US", "생활용품·필수소비재"),
    ("jnj", "Johnson & Johnson", "존슨앤드존슨", "JNJ", "USD", "US", "제약·의료기기"),
    ("homedepot", "The Home Depot", "홈디포", "HD", "USD", "US", "주택개보수·건자재 유통"),
    ("abbvie", "AbbVie", "애브비", "ABBV", "USD", "US", "바이오·면역항암"),
    ("bofa", "BofA", "뱅크오브아메리카", "BAC", "USD", "US", "종합은행·자산관리"),
    ("icbc", "ICBC", "중국공상은행", "601398.SS", "CNY", "CN", "국유 상업은행"),
    ("cocacola", "Coca-Cola", "코카콜라", "KO", "USD", "US", "음료·필수소비재"),
    ("novonordisk", "Novo Nordisk", "노보 노디스크", "NVO", "USD", "DK", "제약·비만치료제"),
    ("samsung", "Samsung", "삼성전자", "005930.KS", "KRW", "KR", "메모리·종합반도체·모바일"),
    ("lvmh", "LVMH", "루이비통모에헤네시(LVMH)", "MC.PA", "EUR", "FR", "글로벌 럭셔리·패션"),
    ("sap", "SAP", "SAP", "SAP", "USD", "DE", "엔터프라이즈 ERP·클라우드"),
    ("asml", "ASML", "ASML", "ASML", "USD", "NL", "반도체 노광장비"),
    ("salesforce", "Salesforce", "세일즈포스", "CRM", "USD", "US", "기업용 CRM·AI 에이전트"),
    ("chevron", "Chevron", "셰브론", "CVX", "USD", "US", "종합 에너지"),
    ("toyota", "Toyota", "토요타자동차", "TM", "USD", "JP", "완성차·하이브리드 모빌리티"),
    ("hermes", "Hermès", "에르메스", "RMS.PA", "EUR", "FR", "하이엔드 럭셔리"),
    ("roche", "Roche", "로슈", "ROG.SW", "CHF", "CH", "제약·체외진단"),
    ("abc", "ABC", "중국농업은행", "601288.SS", "CNY", "CN", "국유 상업은행"),
    ("ccb", "CCB", "중국건설은행", "601939.SS", "CNY", "CN", "국유 상업은행"),
    ("merck", "Merck", "머크(MSD)", "MRK", "USD", "US", "제약·면역항암"),
    ("alibaba", "Alibaba", "알리바바", "BABA", "USD", "CN", "이커머스·클라우드·AI"),
    ("amd", "AMD", "AMD", "AMD", "USD", "US", "AI GPU·CPU 반도체"),
    ("cisco", "Cisco", "시스코 시스템즈", "CSCO", "USD", "US", "AI 네트워크·보안"),
    ("wells_fargo", "Wells Fargo", "웰스파고", "WFC", "USD", "US", "소매·기업금융 은행"),
    ("moutai", "Kweichow Moutai", "귀주모태주", "600519.SS", "CNY", "CN", "프리미엄 주류·필수소비재"),
    ("palantir", "Palantir", "팔란티어", "PLTR", "USD", "US", "AI 데이터 의사결정 SW"),
    ("pmi", "Philip Morris", "필립모리스 인터내셔널", "PM", "USD", "US", "무연담배·소비재"),
    ("ibm", "IBM", "IBM", "IBM", "USD", "US", "하이브리드 클라우드·양자컴퓨팅"),
    ("astrazeneca", "AstraZeneca", "아스트라제네카", "AZN", "USD", "GB", "항암·희귀질환 신약"),
    ("novartis", "Novartis", "노바티스", "NVS", "USD", "CH", "전문의약품·바이오"),
    ("boc", "BOC", "중국은행", "601988.SS", "CNY", "CN", "국유 외환·상업은행"),
    ("chinamobile", "China Mobile", "차이나모바일", "600941.SS", "CNY", "CN", "통신·클라우드 인프라"),
    ("linde", "Linde", "린데", "LIN", "USD", "GB", "산업용 가스·클린수소"),
    ("ge", "GE Aerospace", "GE 에어로스페이스", "GE", "USD", "US", "항공기 엔진·방산"),
    ("mcdonalds", "McDonald's", "맥도날드", "MCD", "USD", "US", "글로벌 외식 프랜차이즈"),
    ("shell", "Shell", "쉘(Shell)", "SHEL", "USD", "GB", "글로벌 LNG·종합에너지"),
    ("abbott", "Abbott", "애보트 래버러토리스", "ABT", "USD", "US", "연속혈당측정·의료기기"),
    ("morganstanley", "Morgan Stanley", "모건스탠리", "MS", "USD", "US", "자산관리·투자은행"),
    ("servicenow", "ServiceNow", "서비스나우", "NOW", "USD", "US", "기업 업무자동화·AI SW"),
    ("pepsico", "PepsiCo", "펩시코", "PEP", "USD", "US", "식음료·스낵 필수소비재"),
    ("hsbc", "HSBC", "HSBC 홀딩스", "HSBC", "USD", "GB", "글로벌 은행·자산관리"),
    ("petrochina", "PetroChina", "페트로차이나", "601857.SS", "CNY", "CN", "천연가스·석유 에너지"),
    ("accenture", "Accenture", "액센츄어", "ACN", "USD", "IE", "글로벌 IT 컨설팅·AI 구축"),
    ("skhynix", "SK hynix", "SK하이닉스", "000660.KS", "KRW", "KR", "AI HBM 메모리 반도체"),
    ("ThermoFisher", "Thermo Fisher", "써모피셔 사이언티픽", "TMO", "USD", "US", "생명과학 연구장비·CDMO"),
    ("disney", "Walt Disney", "월트 디즈니", "DIS", "USD", "US", "엔터테인먼트·테마파크"),
    ("caterpillar", "Caterpillar", "캐터필러", "CAT", "USD", "US", "중장비·데이터센터 발전기"),
    ("goldmansachs", "Goldman Sachs", "골드만삭스", "GS", "USD", "US", "글로벌 투자은행(IB)"),
    ("americanexpress", "American Express", "아메리칸 익스프레스", "AXP", "USD", "US", "프리미엄 결제·카드금융"),
    ("qualcomm", "Qualcomm", "퀄컴", "QCOM", "USD", "US", "모바일·온디바이스 AI 칩"),
    ("intuit", "Intuit", "인튜이트", "INTU", "USD", "US", "세무·회계 핀테크 SW"),
    ("reliance", "Reliance Industries", "릴라이언스 인더스트리", "RELIANCE.NS", "INR", "IN", "통신·유통·에너지 복합"),
    ("loreal", "L'Oréal", "로레알", "OR.PA", "EUR", "FR", "글로벌 뷰티·화장품"),
    ("siemens", "Siemens", "지멘스", "SIE.DE", "EUR", "DE", "스마트팩토리·전력 인프라"),
    ("texas_inst", "Texas Instruments", "텍사스 인스트루먼트", "TXN", "USD", "US", "아날로그·전장 반도체"),
    ("byd", "BYD", "비야디(BYD)", "1211.HK", "HKD", "CN", "전기차·배터리 수직계열화"),
    ("pdd", "PDD Holdings", "핀둬둬(테무)", "PDD", "USD", "CN", "글로벌 직구·소셜커머스"),
    ("arm", "Arm Holdings", "암 홀딩스(Arm)", "ARM", "USD", "GB", "반도체 설계 자산(IP)"),
    ("uber", "Uber", "우버", "UBER", "USD", "US", "모빌리티·배달 플랫폼"),
    ("inditex", "Inditex", "인디텍스(자라)", "ITX.MC", "EUR", "ES", "패스트패션·어패럴"),
    ("catl", "CATL", "CATL(닝더스다이)", "300750.SZ", "CNY", "CN", "전기차·ESS 배터리"),
    ("micron", "Micron", "마이크론 테크놀로지", "MU", "USD", "US", "AI 메모리 반도체"),
    ("applied_mat", "Applied Materials", "어플라이드 머티어리얼즈", "AMAT", "USD", "US", "반도체 전공정 장비"),
    ("totalenergies", "TotalEnergies", "토탈에너지스", "TTE", "USD", "FR", "종합 에너지·LNG·태양광"),
    ("sony", "Sony Group", "소니 그룹", "SONY", "USD", "JP", "게임·이미지센서·엔터"),
    ("mitsubishi_ufj", "Mitsubishi UFJ", "미쓰비시UFJ 파이낸셜", "MUFG", "USD", "JP", "글로벌 종합금융"),
    ("rbc", "Royal Bank of Canada", "캐나다왕립은행(RBC)", "RY", "USD", "CA", "북미 은행·자산관리"),
    ("bhp", "BHP Group", "BHP 그룹", "BHP", "USD", "AU", "구리·철광석 핵심광물"),
    ("cba", "Commonwealth Bank", "호주 커먼웰스은행", "CBA.AX", "AUD", "AU", "소매금융·모기지 은행"),
    ("nextera", "NextEra Energy", "넥스트에라 에너지", "NEE", "USD", "US", "친환경 발전·전력망"),
    ("intel", "Intel", "인텔", "INTC", "USD", "US", "CPU·파운드리 반도체"),
]

# Build fast lookup dictionaries by ticker / base ticker / normalized English name
META_BY_TICKER = {}
META_BY_NAME = {}
for _cid, _en, _ko, _tk, _ccy, _cnt, _sec in GLOBAL_PUBLIC_POOL:
    _entry = {"id": _cid, "name": _en, "koName": _ko, "ticker": _tk, "country": _cnt, "sector": _sec}
    META_BY_TICKER[_tk.upper()] = _entry
    META_BY_TICKER[_tk.upper().split(".")[0]] = _entry
    META_BY_NAME[re.sub(r"[^a-z0-9]", "", _en.lower())] = _entry

# Extra ticker aliases used on CompaniesMarketCap vs Yahoo Finance
CMC_TICKER_ALIASES = {
    "GOOGL": META_BY_TICKER["GOOG"],
    "BRK.A": META_BY_TICKER["BRK-B"],
    "BRK.B": META_BY_TICKER["BRK-B"],
    "TCEHY": META_BY_TICKER["0700.HK"],
    "0700": META_BY_TICKER["0700.HK"],
    "2330.TW": META_BY_TICKER["TSM"],
    "NOVO-B.CO": META_BY_TICKER["NVO"],
    "NESN.SW": {"id": "nestle", "name": "Nestlé", "koName": "네슬레", "ticker": "NESN.SW", "country": "CH", "sector": "글로벌 종합식품"},
    "7203.T": META_BY_TICKER["TM"],
    "6758.T": META_BY_TICKER["SONY"],
    "8306.T": META_BY_TICKER["MUFG"],
    "ASML.AS": META_BY_TICKER["ASML"],
    "SAP.DE": META_BY_TICKER["SAP"],
    "AZN.L": META_BY_TICKER["AZN"],
    "SHEL.L": META_BY_TICKER["SHEL"],
    "HSBA.L": META_BY_TICKER["HSBC"],
    "1398.HK": META_BY_TICKER["601398.SS"],
    "1288.HK": META_BY_TICKER["601288.SS"],
    "0939.HK": META_BY_TICKER["601939.SS"],
    "3988.HK": META_BY_TICKER["601988.SS"],
    "0941.HK": META_BY_TICKER["600941.SS"],
    "0857.HK": META_BY_TICKER["601857.SS"],
    "688825": META_BY_TICKER["688825.SS"],
}
META_BY_TICKER.update(CMC_TICKER_ALIASES)

# S&P 500 Sector ETFs + Top 3 constituent tickers
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


def http_get_text(url: str, timeout: int = 18) -> str:
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def http_get_json(url: str, timeout: int = 15):
    return json.loads(http_get_text(url, timeout=timeout))


def fetch_fx_rates() -> dict:
    """Fetch USD exchange rates across all major equity currencies."""
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
        "JPY": 152.0,
        "DKK": 6.94,
        "INR": 84.4,
        "CAD": 1.39,
        "AUD": 1.53,
    }
    try:
        data = http_get_json("https://open.er-api.com/v6/latest/USD")
        if data and isinstance(data.get("rates"), dict):
            for k in rates:
                if isinstance(data["rates"].get(k), (int, float)) and data["rates"][k] > 0:
                    rates[k] = float(data["rates"][k])
    except Exception as exc:
        print(f"[WARN] open.er-api FX fallback: {exc}")

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


def infer_country_from_ticker_or_text(ticker: str, country_text: str) -> str:
    c_norm = country_text.strip().lower()
    if c_norm in COUNTRY_NAME_TO_CODE:
        return COUNTRY_NAME_TO_CODE[c_norm]
    if "." in ticker:
        suf = ticker.split(".")[-1].upper()
        if suf in SUFFIX_TO_COUNTRY:
            return SUFFIX_TO_COUNTRY[suf]
    return "US"


def parse_cmc_market_cap_b(text: str):
    """Parse '$3.524 T' -> 3524.0 or '$845.12 B' -> 845.12."""
    clean = text.replace(",", "").strip()
    m = re.search(r"\$\s*([0-9]+(?:\.[0-9]+)?)\s*([TBM])", clean, re.IGNORECASE)
    if not m:
        return None
    val = float(m.group(1))
    unit = m.group(2).upper()
    if unit == "T":
        return round(val * 1000.0, 2)
    if unit == "B":
        return round(val, 2)
    if unit == "M":
        return round(val / 1000.0, 3)
    return None


def fetch_dynamic_top50_cmc() -> list:
    """
    Tier 1 Dynamic Top 50 Collector:
    Scrapes the live global top 100 publicly traded companies from CompaniesMarketCap.com.
    Automatically reflects newly entering / exiting stocks while excluding unlisted firms.
    """
    raw_html = http_get_text("https://companiesmarketcap.com/", timeout=20)
    tbody_match = re.search(r"<tbody[^>]*>([\s\S]*?)</tbody>", raw_html, re.IGNORECASE)
    if not tbody_match:
        raise ValueError("Could not locate ranking <tbody> on CompaniesMarketCap")

    rows = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", tbody_match.group(1), re.IGNORECASE)
    dynamic_items = []
    seen_ids = set()

    for tr in rows:
        name_m = re.search(r'class="company-name"[^>]*>([\s\S]*?)</div>', tr, re.IGNORECASE)
        code_m = re.search(r'class="company-code"[^>]*>([\s\S]*?)</div>', tr, re.IGNORECASE)
        if not name_m or not code_m:
            continue

        en_name = html_lib.unescape(re.sub(r"<[^>]+>", "", name_m.group(1))).strip()
        raw_ticker = html_lib.unescape(re.sub(r"<[^>]+>", "", code_m.group(1))).strip().upper()

        if not en_name or not raw_ticker:
            continue
        if raw_ticker in UNLISTED_TICKERS or en_name.lower() in UNLISTED_NAMES:
            continue

        # Parse Market Cap ($X.XX T / $XXX.XX B)
        cap_m = re.search(r"\$\s*[0-9]+(?:\.[0-9]+)?\s*[TB]", tr)
        if not cap_m:
            continue
        cap_b = parse_cmc_market_cap_b(cap_m.group(0))
        if not cap_b or cap_b < 50:
            continue

        # Parse Daily % Change (e.g., 1.24% with rh-up / rh-down / red / green)
        chg_pct = 0.0
        pct_m = re.search(r'class="([^"]*(?:rh-up|rh-down|green|red|percentage)[^"]*)"[^>]*>([\s\S]*?)</span>', tr, re.IGNORECASE)
        if pct_m:
            cls_str = pct_m.group(1).lower()
            pct_txt = re.sub(r"<[^>]+>", "", pct_m.group(2)).strip()
            num_m = re.search(r"([+-]?[0-9]+(?:\.[0-9]+)?)\s*%", pct_txt)
            if num_m:
                val = abs(float(num_m.group(1)))
                is_neg = ("down" in cls_str) or ("red" in cls_str) or ("-" in pct_txt)
                chg_pct = round(-val if is_neg else val, 2)
        else:
            fallback_pct = re.search(r"([+-]?[0-9]+\.[0-9]+)\s*%", tr)
            if fallback_pct:
                chg_pct = round(float(fallback_pct.group(1)), 2)

        # Parse Country Name if present in row
        country_spans = re.findall(r'class="responsive-hidden"[^>]*>([^<]+)</span>', tr, re.IGNORECASE)
        country_txt = country_spans[-1].strip() if country_spans else ""

        # Match against Korean Metadata Dictionary
        norm_name_key = re.sub(r"[^a-z0-9]", "", en_name.lower())
        meta = (
            META_BY_TICKER.get(raw_ticker)
            or META_BY_TICKER.get(raw_ticker.split(".")[0])
            or META_BY_NAME.get(norm_name_key)
        )

        cid = meta["id"] if meta else re.sub(r"[^a-z0-9]+", "_", en_name.lower()).strip("_")
        if cid in seen_ids:
            continue
        seen_ids.add(cid)

        country_code = meta["country"] if meta else infer_country_from_ticker_or_text(raw_ticker, country_txt)
        ko_name = meta["koName"] if meta else en_name
        clean_en_name = meta["name"] if meta else en_name
        sector_str = meta["sector"] if meta else "글로벌 상장 대기업"

        dynamic_items.append({
            "id": cid,
            "name": clean_en_name,
            "koName": ko_name,
            "ticker": raw_ticker,
            "country": country_code,
            "marketCapB": cap_b,
            "changePct": chg_pct,
            "sector": sector_str,
        })

        if len(dynamic_items) >= 50:
            break

    if len(dynamic_items) < 40:
        raise ValueError(f"CMC returned only {len(dynamic_items)} valid rows; triggering Tier-2 pool fallback")

    dynamic_items.sort(key=lambda x: x["marketCapB"], reverse=True)
    return dynamic_items[:50]


def parse_korean_market_cap_krw(val_str: str):
    """
    Parse Naver Finance Korean market cap strings into exact KRW float:
      - '1,307조 8,120억' -> 1307812000000000.0
      - '345조' -> 345000000000000.0
      - '9,850억' -> 985000000000.0
    """
    if not val_str:
        return None
    clean = str(val_str).replace(",", "").replace("원", "").strip()
    total_krw = 0.0
    matched_unit = False

    m_jo = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*조", clean)
    if m_jo:
        total_krw += float(m_jo.group(1)) * 1e12
        matched_unit = True

    m_eok = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*억", clean)
    if m_eok:
        total_krw += float(m_eok.group(1)) * 1e8
        matched_unit = True

    m_bm = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*백만", clean)
    if m_bm:
        total_krw += float(m_bm.group(1)) * 1e6
        matched_unit = True

    if matched_unit and total_krw > 0:
        return total_krw

    # Fallback if raw numeric string in 억원 is ever returned
    if re.fullmatch(r"[0-9]+(?:\.[0-9]+)?", clean):
        return float(clean) * 1e8
    return None


def fetch_korean_quote_naver(code: str) -> dict:
    """
    Fetch real-time KRX intraday price, daily % change, and market cap (KRW)
    directly from Naver Pay Securities Mobile JSON API (zero 1d-candle lag).
    """
    out = {"market_cap": None, "price": None, "change_pct": None}
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        ),
        "Referer": f"https://m.stock.naver.com/domestic/stock/{code}/total",
        "Accept": "application/json, text/plain, */*",
    }

    # 1. Live price & daily fluctuation ratio (/basic)
    basic_url = f"https://m.stock.naver.com/api/stock/{code}/basic"
    req_basic = Request(basic_url, headers=headers)
    with urlopen(req_basic, timeout=12) as resp:
        basic_data = json.loads(resp.read().decode("utf-8", errors="ignore"))

    raw_price = str(basic_data.get("closePrice", "")).replace(",", "").strip()
    if raw_price and raw_price not in ("-", "N/A"):
        out["price"] = float(raw_price)

    raw_ratio = str(basic_data.get("fluctuationsRatio", "")).replace(",", "").replace("%", "").strip()
    if raw_ratio and raw_ratio not in ("-", "N/A"):
        ratio_val = float(raw_ratio)
        cmp_info = basic_data.get("compareToPreviousPrice") or {}
        dir_name = str(cmp_info.get("name", "")).upper()
        dir_code = str(cmp_info.get("code", ""))
        if dir_name in ("FALLING", "LOWER_LIMIT") or dir_code in ("4", "5"):
            ratio_val = -abs(ratio_val)
        elif dir_name in ("RISING", "UPPER_LIMIT") or dir_code in ("1", "2"):
            ratio_val = abs(ratio_val)
        elif dir_name == "UNCHANGED" or dir_code == "3":
            ratio_val = 0.0
        out["change_pct"] = round(ratio_val, 2)

    # 2. Live intraday market capitalization (/integration -> totalInfos[marketValue])
    integ_url = f"https://m.stock.naver.com/api/stock/{code}/integration"
    req_integ = Request(integ_url, headers=headers)
    with urlopen(req_integ, timeout=12) as resp:
        integ_data = json.loads(resp.read().decode("utf-8", errors="ignore"))

    for info in integ_data.get("totalInfos", []):
        if info.get("code") == "marketValue" or "시총" in str(info.get("key", "")):
            mcap_krw = parse_korean_market_cap_krw(info.get("value", ""))
            if mcap_krw and mcap_krw > 0:
                out["market_cap"] = mcap_krw
                break

    return out


def fetch_single_quote(symbol: str) -> dict:
    """
    Return {'market_cap': float|None, 'price': float|None, 'change_pct': float|None}.
    - Korean stocks (.KS / .KQ): Primary real-time KRX feed via Naver Mobile API, fallback to yfinance intraday.
    - US / Global stocks: Primary fast_info real-time feed + history fallback via yfinance.
    """
    out = {"market_cap": None, "price": None, "change_pct": None}

    # Route Korean KRX stocks (.KS / .KQ) to Naver Finance Real-Time API first
    kr_match = re.match(r"^([0-9A-Z]{6})\.(KS|KQ)$", symbol.upper())
    if kr_match:
        kr_code = kr_match.group(1)
        try:
            naver_q = fetch_korean_quote_naver(kr_code)
            if naver_q["price"] is not None and naver_q["market_cap"] is not None:
                return naver_q
            # Keep partial fields if any succeeded before falling back
            out.update({k: v for k, v in naver_q.items() if v is not None})
        except Exception as nav_exc:
            print(f"[WARN] Naver real-time fetch fallback for {symbol}: {nav_exc}")

    # Global stocks (and backup for KR stocks) via Yahoo Finance
    try:
        tk = yf.Ticker(symbol)
        fi = tk.fast_info

        mcap = getattr(fi, "market_cap", None)
        if out["market_cap"] is None and mcap and mcap > 0:
            out["market_cap"] = float(mcap)

        last_p = getattr(fi, "last_price", None)
        prev_p = getattr(fi, "previous_close", None)
        if last_p and last_p > 0:
            if out["price"] is None:
                out["price"] = float(last_p)
            if out["change_pct"] is None and prev_p and prev_p > 0:
                out["change_pct"] = round(((float(last_p) - float(prev_p)) / float(prev_p)) * 100.0, 2)

        # History fallback if fast_info missed price or change_pct
        if out["price"] is None or out["change_pct"] is None:
            hist = tk.history(period="5d")
            closes = hist["Close"].dropna().tolist()
            if out["price"] is None and len(closes) >= 1:
                out["price"] = float(closes[-1])
            if out["change_pct"] is None and len(closes) >= 2 and closes[-2] != 0:
                out["change_pct"] = round(((closes[-1] - closes[-2]) / closes[-2]) * 100.0, 2)
    except Exception as exc:
        print(f"[WARN] Quote fetch failed for {symbol}: {exc}")
    return out


def fetch_dynamic_top50_from_pool(fx_rates: dict, get_cached_quote) -> list:
    """
    Tier 2 Dynamic Fallback:
    Evaluates all 90+ global mega-cap publicly listed stocks via Yahoo Finance,
    converts native market caps into USD Billions, sorts dynamically, and returns Top 50.
    """
    candidates = []
    for cid, en_name, ko_name, sym, ccy, country, sector in GLOBAL_PUBLIC_POOL:
        q = get_cached_quote(sym)
        if not q["market_cap"]:
            continue
        fx_div = fx_rates.get(ccy, 1.0)
        cap_usd_b = round((q["market_cap"] / fx_div) / 1e9, 2)
        if cap_usd_b < 40:
            continue
        candidates.append({
            "id": cid,
            "name": en_name,
            "koName": ko_name,
            "ticker": sym,
            "country": country,
            "marketCapB": cap_usd_b,
            "changePct": q["change_pct"] if q["change_pct"] is not None else 0.0,
            "sector": sector,
        })

    candidates.sort(key=lambda x: x["marketCapB"], reverse=True)
    return candidates[:50]



def fetch_korean_index_naver(index_code: str) -> dict:
    """
    Fetch real-time KRX intraday index level, point change, and % change
    from Naver Pay Securities Mobile Index API (KOSPI / KOSDAQ).
    """
    out = {"price": None, "change_pts": None, "change_pct": None}
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        ),
        "Referer": f"https://m.stock.naver.com/domestic/index/{index_code}/total",
        "Accept": "application/json, text/plain, */*",
    }
    url = f"https://m.stock.naver.com/api/index/{index_code}/basic"
    req = Request(url, headers=headers)
    with urlopen(req, timeout=12) as resp:
        data = json.loads(resp.read().decode("utf-8", errors="ignore"))

    raw_p = str(data.get("closePrice", "")).replace(",", "").strip()
    if raw_p and raw_p not in ("-", "N/A"):
        out["price"] = round(float(raw_p), 2)

    cmp_info = data.get("compareToPreviousPrice") or {}
    dir_name = str(cmp_info.get("name", "")).upper()
    dir_code = str(cmp_info.get("code", ""))
    is_neg = dir_name in ("FALLING", "LOWER_LIMIT") or dir_code in ("4", "5")
    is_flat = dir_name == "UNCHANGED" or dir_code == "3"

    raw_pts = str(data.get("compareToPreviousClosePrice", "")).replace(",", "").strip()
    if raw_pts and raw_pts not in ("-", "N/A"):
        pts_val = abs(float(raw_pts))
        out["change_pts"] = 0.0 if is_flat else round(-pts_val if is_neg else pts_val, 2)

    raw_pct = str(data.get("fluctuationsRatio", "")).replace(",", "").replace("%", "").strip()
    if raw_pct and raw_pct not in ("-", "N/A"):
        pct_val = abs(float(raw_pct))
        out["change_pct"] = 0.0 if is_flat else round(-pct_val if is_neg else pct_val, 2)

    return out


def fetch_korean_index_history_naver(index_code: str) -> list:
    """
    Backup 6-month daily history fetcher from Naver Mobile Index price endpoint.
    Returns chronological [(datetime_obj, close_float), ...].
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        ),
        "Referer": f"https://m.stock.naver.com/domestic/index/{index_code}/total",
        "Accept": "application/json, text/plain, */*",
    }
    rows_out = []
    for page in (1, 2, 3):
        url = f"https://m.stock.naver.com/api/index/{index_code}/price?pageSize=45&page={page}"
        req = Request(url, headers=headers)
        with urlopen(req, timeout=12) as resp:
            arr = json.loads(resp.read().decode("utf-8", errors="ignore"))
        if not isinstance(arr, list) or not arr:
            break
        for item in arr:
            dt_str = str(item.get("localTradedAt", "")).strip()
            cl_str = str(item.get("closePrice", "")).replace(",", "").strip()
            if not dt_str or not cl_str:
                continue
            try:
                dt_obj = datetime.strptime(dt_str[:10], "%Y-%m-%d")
                rows_out.append((dt_obj, float(cl_str)))
            except ValueError:
                continue
    rows_out.sort(key=lambda x: x[0])
    return rows_out


def fetch_market_indices_6m() -> list:
    """
    Fetch live level, daily point/% change, and 13-point 6-month history for:
      - S&P 500 (^GSPC)
      - NASDAQ Composite (^IXIC)
      - KOSPI (Naver real-time KOSPI + ^KS11 / Naver 6m history)
      - KOSDAQ (Naver real-time KOSDAQ + ^KQ11 / Naver 6m history)
    """
    specs = [
        ("idx_sp500", "^GSPC", None),
        ("idx_nasdaq", "^IXIC", None),
        ("idx_kospi", "^KS11", "KOSPI"),
        ("idx_kosdaq", "^KQ11", "KOSDAQ"),
    ]
    results = []

    for idx_id, yf_sym, naver_code in specs:
        live_price = None
        change_pts = None
        change_pct = None
        hist_pairs = []  # [(dt, float_val), ...]

        # 1. Korean indices: Primary intraday real-time quote from Naver
        if naver_code:
            try:
                nq = fetch_korean_index_naver(naver_code)
                live_price = nq["price"]
                change_pts = nq["change_pts"]
                change_pct = nq["change_pct"]
            except Exception as exc:
                print(f"[WARN] Naver live index fallback for {naver_code}: {exc}")

        # 2. Yahoo Finance quote (Primary for US indices, fallback for KR indices) & 6M daily history
        try:
            tk = yf.Ticker(yf_sym)
            if live_price is None or change_pct is None:
                fi = tk.fast_info
                lp = getattr(fi, "last_price", None)
                pp = getattr(fi, "previous_close", None)
                if lp and lp > 0:
                    if live_price is None:
                        live_price = round(float(lp), 2)
                    if pp and pp > 0:
                        if change_pts is None:
                            change_pts = round(float(lp) - float(pp), 2)
                        if change_pct is None:
                            change_pct = round(((float(lp) - float(pp)) / float(pp)) * 100.0, 2)

            df = tk.history(period="6mo", interval="1d").dropna(subset=["Close"])
            if len(df) >= 10:
                hist_pairs = [(dt, float(val)) for dt, val in zip(df.index, df["Close"].tolist())]
                if live_price is None:
                    live_price = round(hist_pairs[-1][1], 2)
                if len(hist_pairs) >= 2 and hist_pairs[-2][1] > 0:
                    if change_pts is None:
                        change_pts = round(hist_pairs[-1][1] - hist_pairs[-2][1], 2)
                    if change_pct is None:
                        change_pct = round(((hist_pairs[-1][1] - hist_pairs[-2][1]) / hist_pairs[-2][1]) * 100.0, 2)
        except Exception as exc:
            print(f"[WARN] yfinance index fetch failed for {yf_sym}: {exc}")

        # 3. Backup 6M history via Naver if Yahoo missed ^KS11 / ^KQ11
        if len(hist_pairs) < 10 and naver_code:
            try:
                hist_pairs = fetch_korean_index_history_naver(naver_code)
            except Exception as exc:
                print(f"[WARN] Naver 6m index history fallback failed for {naver_code}: {exc}")

        if live_price is None:
            continue

        sampled_pts = []
        if len(hist_pairs) >= 6:
            total = len(hist_pairs)
            sample_idx = sorted(list({min(total - 1, round(i * (total - 1) / 12)) for i in range(13)}))
            for pos, r_idx in enumerate(sample_idx):
                dt_obj, cl_val = hist_pairs[r_idx]
                if pos == len(sample_idx) - 1:
                    sampled_pts.append({
                        "label": f"{dt_obj.strftime('%y.%m')} 현재",
                        "val": round(live_price, 2),
                    })
                else:
                    day_part = "초" if dt_obj.day <= 10 else ("중" if dt_obj.day <= 20 else "말")
                    sampled_pts.append({
                        "label": f"{dt_obj.strftime('%y.%m')} {day_part}",
                        "val": round(cl_val, 2),
                    })

        entry = {
            "id": idx_id,
            "price": round(live_price, 2),
            "changePts": round(change_pts, 2) if change_pts is not None else 0.0,
            "changePct": round(change_pct, 2) if change_pct is not None else 0.0,
        }
        if len(sampled_pts) >= 4:
            entry["history"] = sampled_pts
        results.append(entry)

    return results


def fetch_commodities_6m() -> list:
    """Fetch 6-month sampled history for Gold ($/oz), Copper ($/lb), WTI Oil ($/bbl)."""
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


def fetch_fred_series_csv(series_id: str, limit: int = 30) -> list:
    """Keyless public CSV reader from FRED (Federal Reserve Bank of St. Louis)."""
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}"
    text = http_get_text(url, timeout=15)
    rows = []
    reader = csv.reader(io.StringIO(text))
    next(reader, None)
    for row in reader:
        if len(row) >= 2 and row[1] not in (".", "", "NA"):
            try:
                rows.append((row[0].strip(), float(row[1])))
            except ValueError:
                continue
    return rows[-limit:]


def format_pp_change(diff_val: float, decimals: int = 1, unit: str = "%p") -> tuple:
    """Return (formatted_change_str, dir_str) for percentage-point changes."""
    rounded = round(diff_val, decimals)
    if rounded > 0:
        return f"▲ {abs(rounded):.{decimals}f}{unit}", "up"
    if rounded < 0:
        return f"▼ {abs(rounded):.{decimals}f}{unit}", "down"
    return f"보합 (0.{'0' * decimals}{unit})", "flat"


def format_bp_change(diff_bp: int) -> tuple:
    """Return (formatted_bp_str, dir_str) for basis-point changes."""
    if diff_bp > 0:
        return f"▲ {abs(diff_bp)}bp", "up"
    if diff_bp < 0:
        return f"▼ {abs(diff_bp)}bp", "down"
    return "보합 (0bp)", "flat"


def compute_yoy_from_monthly(pairs: list) -> tuple:
    """
    Given chronological [(time_str, index_val), ...] where time_str starts with YYYY-MM or YYYYMM,
    compute exact Year-over-Year (%) for the latest month and previous month.
    Returns (ym_str_YYYYMM, yoy_now_1dec, diff_pp_1dec) or None if insufficient data.
    """
    by_ym = {}
    ordered_yms = []
    for raw_t, val in pairs:
        digits = re.sub(r"[^0-9]", "", raw_t)
        if len(digits) < 6 or val <= 0:
            continue
        ym = digits[:6]
        if ym not in by_ym:
            ordered_yms.append(ym)
        by_ym[ym] = val

    ordered_yms.sort()
    if len(ordered_yms) < 13:
        return None

    latest_ym = ordered_yms[-1]
    prev_yr_ym = f"{int(latest_ym[:4]) - 1:04d}{latest_ym[4:6]}"
    if prev_yr_ym not in by_ym:
        return None

    yoy_now = ((by_ym[latest_ym] / by_ym[prev_yr_ym]) - 1.0) * 100.0

    diff_pp = 0.0
    if len(ordered_yms) >= 14:
        prev_m = ordered_yms[-2]
        prev_m_yr = f"{int(prev_m[:4]) - 1:04d}{prev_m[4:6]}"
        if prev_m_yr in by_ym:
            yoy_prev = ((by_ym[prev_m] / by_ym[prev_m_yr]) - 1.0) * 100.0
            diff_pp = yoy_now - yoy_prev

    return latest_ym, round(yoy_now, 1), round(diff_pp, 1)


def shift_year_month(dt: datetime, delta_months: int) -> str:
    """Return YYYYMM shifted by delta_months from dt."""
    total_m = dt.year * 12 + (dt.month - 1) + delta_months
    y = total_m // 12
    m = (total_m % 12) + 1
    return f"{y:04d}{m:02d}"


def get_quarter_code(dt: datetime, delta_quarters: int = 0) -> str:
    """Return BOK ECOS quarterly date code like '2026Q3'."""
    q0 = (dt.month - 1) // 3
    total_q = dt.year * 4 + q0 + delta_quarters
    y = total_q // 4
    q = (total_q % 4) + 1
    return f"{y:04d}Q{q}"


def fetch_bok_ecos_rows(
    bok_key: str,
    stat_code: str,
    cycle: str,
    start_dt: str,
    end_dt: str,
    item_code1: str = "",
    item_code2: str = "",
    max_rows: int = 300,
) -> list:
    """
    Fetch rows from Bank of Korea ECOS Open API (StatisticSearch).
    Returns raw row dicts sorted chronologically by TIME.
    """
    url = (
        f"https://ecos.bok.or.kr/api/StatisticSearch/{bok_key}/json/kr/1/{max_rows}/"
        f"{stat_code}/{cycle}/{start_dt}/{end_dt}"
    )
    if item_code1:
        url += f"/{item_code1}"
        if item_code2:
            url += f"/{item_code2}"

    data = http_get_json(url, timeout=18)
    if "StatisticSearch" not in data:
        err_msg = data.get("RESULT", {}).get("MESSAGE", "No data returned")
        raise ValueError(f"ECOS {stat_code}/{item_code1}: {err_msg}")

    rows = data["StatisticSearch"].get("row", [])
    valid = []
    for r in rows:
        raw_val = str(r.get("DATA_VALUE", "")).replace(",", "").strip()
        time_str = str(r.get("TIME", "")).strip()
        if not raw_val or raw_val in ("-", ".", "N/A") or not time_str:
            continue
        try:
            r_copy = dict(r)
            r_copy["_float"] = float(raw_val)
            valid.append(r_copy)
        except ValueError:
            continue

    valid.sort(key=lambda x: x["TIME"])
    return valid


def build_macro_updates(fx_rates: dict) -> list:
    """
    Fetch live US (FRED public CSV) & South Korea (BOK ECOS Open API) macro indicators:
      - Policy Rate (Fed Funds Upper / BOK Base Rate 722Y001)
      - 2Y & 10Y Government Bond Yields + 10Y-2Y Yield Spread (FRED DGS2,DGS10 / BOK 817Y002)
      - Headline CPI, Core CPI, PPI YoY % (FRED CPIAUCSL,CPILFESL,PPIFIS / BOK 901Y009,901Y010,404Y014)
      - Unemployment & Employment Rate (FRED UNRATE,EMRATIO,PAYEMS / BOK 901Y027)
      - Real GDP Growth Rate (FRED A191RL1Q225SBEA / BOK 200Y102)
      - Dollar Index (DXY) & USD/KRW FX
    """
    now_kst = datetime.now(KST)
    updates = {}

    def ensure_item(item_id: str) -> dict:
        if item_id not in updates:
            updates[item_id] = {"id": item_id}
        return updates[item_id]

    # ------------------------------------------------------------------
    # 1. FX & Dollar Index (DXY & USD/KRW)
    # ------------------------------------------------------------------
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
        "usChange": f"{us_fx_arrow}{abs(dxy_chg):.2f}%" if dxy_chg != 0 else "보합 (0.00%)",
        "usDir": us_fx_dir,
        "krDisplay": f"{usd_krw:,.1f}원",
        "krNum": usd_krw,
        "krChange": kr_chg,
        "krDir": kr_dir,
        "gapText": f"원/달러 {usd_krw:,.1f}원 · DXY {dxy_val:.1f}pt",
    }

    # ------------------------------------------------------------------
    # 2. US Indicators via FRED Public CSV
    # ------------------------------------------------------------------
    us_pol = None
    us_2y = None
    us_2y_prev = None
    us_10y = None
    us_10y_prev = None
    us_cpi = None
    us_core_cpi = None
    us_ppi = None
    us_unemp = None
    us_gdp = None

    # US Policy Rate (DFEDTARU)
    try:
        fed_rows = fetch_fred_series_csv("DFEDTARU", 120)
        if fed_rows:
            us_pol = round(fed_rows[-1][1], 2)
            # Detect last rate change across recent history
            last_diff = 0.0
            for _, v in reversed(fed_rows[:-1]):
                if round(v, 2) != us_pol:
                    last_diff = round(us_pol - v, 2)
                    break
            pol_item = ensure_item("policy_rate")
            pol_item["usDisplay"] = f"{us_pol:.2f}%"
            pol_item["usNum"] = us_pol
            low_bound = max(0.0, us_pol - 0.25)
            pol_item["usPeriod"] = f"FOMC 상단 ({low_bound:.2f}~{us_pol:.2f}%)"
            if last_diff != 0:
                chg_s, dir_s = format_pp_change(last_diff, decimals=2, unit="%p")
                pol_item["usChange"] = chg_s
                pol_item["usDir"] = dir_s
    except Exception as exc:
        print(f"[WARN] FRED DFEDTARU skipped: {exc}")

    # US 2Y & 10Y Treasury Yields + 10Y-2Y Spread
    try:
        dgs2 = fetch_fred_series_csv("DGS2", 10)
        if len(dgs2) >= 2:
            us_2y = round(dgs2[-1][1], 2)
            us_2y_prev = round(dgs2[-2][1], 2)
            chg_s, dir_s = format_bp_change(round((us_2y - us_2y_prev) * 100))
            b2 = ensure_item("bond_2y")
            b2.update({
                "usDisplay": f"{us_2y:.2f}%",
                "usNum": us_2y,
                "usChange": chg_s,
                "usDir": dir_s,
                "usPeriod": f"시장 금리 ({dgs2[-1][0][5:].replace('-', '.')})",
            })
    except Exception as exc:
        print(f"[WARN] FRED DGS2 skipped: {exc}")

    try:
        dgs10 = fetch_fred_series_csv("DGS10", 10)
        if len(dgs10) >= 2:
            us_10y = round(dgs10[-1][1], 2)
            us_10y_prev = round(dgs10[-2][1], 2)
            chg_s, dir_s = format_bp_change(round((us_10y - us_10y_prev) * 100))
            b10 = ensure_item("bond_10y")
            b10.update({
                "usDisplay": f"{us_10y:.2f}%",
                "usNum": us_10y,
                "usChange": chg_s,
                "usDir": dir_s,
                "usPeriod": f"시장 금리 ({dgs10[-1][0][5:].replace('-', '.')})",
            })
    except Exception as exc:
        print(f"[WARN] FRED DGS10 skipped: {exc}")

    if us_2y is not None and us_10y is not None:
        sp_bp = round((us_10y - us_2y) * 100)
        sign = "+" if sp_bp >= 0 else ""
        ys = ensure_item("yield_spread")
        ys["usDisplay"] = f"{sign}{sp_bp}bp"
        ys["usNum"] = round(us_10y - us_2y, 2)
        ys["usPeriod"] = "정상 우상향 구간" if sp_bp >= 0 else "장단기 금리 역전"
        if us_2y_prev is not None and us_10y_prev is not None:
            prev_sp_bp = round((us_10y_prev - us_2y_prev) * 100)
            chg_s, dir_s = format_bp_change(sp_bp - prev_sp_bp)
            ys["usChange"] = chg_s
            ys["usDir"] = dir_s

    # US Headline CPI (CPIAUCSL), Core CPI (CPILFESL), PPI (PPIFIS)
    for fred_code, ind_id, period_suffix in [
        ("CPIAUCSL", "cpi", "전년동월비"),
        ("CPILFESL", "core_cpi", "식료품·에너지 제외"),
        ("PPIFIS", "ppi", "최종수요 전년동월비"),
    ]:
        try:
            m_rows = fetch_fred_series_csv(fred_code, 28)
            res = compute_yoy_from_monthly(m_rows)
            if res:
                ym, yoy_val, diff_pp = res
                chg_s, dir_s = format_pp_change(diff_pp, decimals=1, unit="%p")
                obj = ensure_item(ind_id)
                obj.update({
                    "usDisplay": f"{yoy_val:.1f}%",
                    "usNum": yoy_val,
                    "usChange": chg_s,
                    "usDir": dir_s,
                    "usPeriod": f"{ym[:4]}.{ym[4:6]}월 {period_suffix}",
                })
                if ind_id == "cpi":
                    us_cpi = yoy_val
                elif ind_id == "core_cpi":
                    us_core_cpi = yoy_val
                elif ind_id == "ppi":
                    us_ppi = yoy_val
        except Exception as exc:
            print(f"[WARN] FRED {fred_code} skipped: {exc}")

    # US Unemployment Rate (UNRATE) & Employment Rate / Payrolls (EMRATIO, PAYEMS)
    try:
        unrate = fetch_fred_series_csv("UNRATE", 6)
        if len(unrate) >= 2:
            us_unemp = round(unrate[-1][1], 1)
            u_diff = us_unemp - round(unrate[-2][1], 1)
            chg_s, dir_s = format_pp_change(u_diff, decimals=1, unit="%p")
            ym = re.sub(r"[^0-9]", "", unrate[-1][0])[:6]
            ensure_item("unemployment").update({
                "usDisplay": f"{us_unemp:.1f}%",
                "usNum": us_unemp,
                "usChange": chg_s,
                "usDir": dir_s,
                "usPeriod": f"{ym[:4]}.{ym[4:6]}월 계절조정",
            })
    except Exception as exc:
        print(f"[WARN] FRED UNRATE skipped: {exc}")

    try:
        em_rows = fetch_fred_series_csv("EMRATIO", 4)
        pay_rows = fetch_fred_series_csv("PAYEMS", 4)
        if len(em_rows) >= 2:
            em_val = round(em_rows[-1][1], 1)
            ym = re.sub(r"[^0-9]", "", em_rows[-1][0])[:6]
            emp_obj = ensure_item("employment_rate")
            emp_obj["usDisplay"] = f"{em_val:.1f}%"
            emp_obj["usNum"] = em_val
            emp_obj["usPeriod"] = f"{ym[:4]}.{ym[4:6]}월 16세 이상"
            if len(pay_rows) >= 2:
                # PAYEMS is in thousands -> convert to 만 명 (10,000s)
                nfp_man = (pay_rows[-1][1] - pay_rows[-2][1]) / 10.0
                sign = "+" if nfp_man >= 0 else ""
                emp_obj["usChange"] = f"비농업 {sign}{nfp_man:.1f}만 명"
                emp_obj["usDir"] = "up" if nfp_man >= 0 else "down"
    except Exception as exc:
        print(f"[WARN] FRED EMRATIO/PAYEMS skipped: {exc}")

    # US Real GDP Growth Rate (A191RL1Q225SBEA - QoQ Annualized %)
    try:
        gdp_rows = fetch_fred_series_csv("A191RL1Q225SBEA", 6)
        if len(gdp_rows) >= 2:
            us_gdp = round(gdp_rows[-1][1], 1)
            g_diff = us_gdp - round(gdp_rows[-2][1], 1)
            chg_s, dir_s = format_pp_change(g_diff, decimals=1, unit="%p")
            dt_str = gdp_rows[-1][0]
            q_num = (int(dt_str[5:7]) - 1) // 3 + 1
            ensure_item("real_gdp").update({
                "usDisplay": f"{us_gdp:.1f}%",
                "usNum": us_gdp,
                "usChange": chg_s,
                "usDir": dir_s,
                "usPeriod": f"{dt_str[:4]}년 {q_num}분기 전기비 연율",
            })
    except Exception as exc:
        print(f"[WARN] FRED Real GDP skipped: {exc}")

    # ------------------------------------------------------------------
    # 3. South Korea Indicators via Bank of Korea ECOS Open API
    # ------------------------------------------------------------------
    bok_key = os.environ.get("BOK_ECOS_API_KEY", "").strip()
    if bok_key:
        print("[INFO] BOK_ECOS_API_KEY detected -> syncing Korean rates, bonds, CPI, PPI, employment & GDP...")
        end_ymd = now_kst.strftime("%Y%m%d")
        start_ymd_45 = (now_kst - timedelta(days=45)).strftime("%Y%m%d")
        start_ymd_90 = (now_kst - timedelta(days=90)).strftime("%Y%m%d")
        end_ym = now_kst.strftime("%Y%m")
        start_ym_30 = shift_year_month(now_kst, -30)

        # (A) 한국은행 기준금리 (722Y001 / D & M / 0101000)
        try:
            kr_base = None
            kr_last_diff = 0.0
            m_rows = fetch_bok_ecos_rows(bok_key, "722Y001", "M", shift_year_month(now_kst, -24), end_ym, "0101000")
            if m_rows:
                kr_base = round(m_rows[-1]["_float"], 2)
            # Check daily series as well so same-day MPB rate decision reflects immediately
            try:
                d_rows = fetch_bok_ecos_rows(bok_key, "722Y001", "D", start_ymd_90, end_ymd, "0101000")
                if d_rows:
                    kr_base = round(d_rows[-1]["_float"], 2)
            except Exception:
                pass

            if kr_base is not None:
                for r in reversed(m_rows):
                    val_r = round(r["_float"], 2)
                    if val_r != kr_base:
                        kr_last_diff = round(kr_base - val_r, 2)
                        break
                pol_obj = ensure_item("policy_rate")
                pol_obj["krDisplay"] = f"{kr_base:.2f}%"
                pol_obj["krNum"] = kr_base
                pol_obj["krPeriod"] = "금통위 기준금리"
                if kr_last_diff != 0:
                    chg_s, dir_s = format_pp_change(kr_last_diff, decimals=2, unit="%p")
                    pol_obj["krChange"] = chg_s
                    pol_obj["krDir"] = dir_s
                if us_pol is not None:
                    gap_bp = round((us_pol - kr_base) * 100)
                    if gap_bp > 0:
                        pol_obj["gapText"] = f"한·미 역전폭 {gap_bp}bp (미국 우위)"
                    elif gap_bp < 0:
                        pol_obj["gapText"] = f"한·미 금리차 {abs(gap_bp)}bp (한국 우위)"
                    else:
                        pol_obj["gapText"] = "한·미 기준금리 동일"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 722Y001 (Policy Rate) failed: {exc}")

        # (B) 국고채 2년물(010195000) · 10년물(010210000) 및 장단기 금리차 (817Y002 / D)
        kr_2y = None
        kr_2y_prev = None
        kr_10y = None
        kr_10y_prev = None

        try:
            ktb2_rows = fetch_bok_ecos_rows(bok_key, "817Y002", "D", start_ymd_45, end_ymd, "010195000")
            if len(ktb2_rows) >= 2:
                kr_2y = round(ktb2_rows[-1]["_float"], 2)
                kr_2y_prev = round(ktb2_rows[-2]["_float"], 2)
                t_str = ktb2_rows[-1]["TIME"]
                chg_s, dir_s = format_bp_change(round((kr_2y - kr_2y_prev) * 100))
                b2_obj = ensure_item("bond_2y")
                b2_obj.update({
                    "krDisplay": f"{kr_2y:.2f}%",
                    "krNum": kr_2y,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"국고채 2년 ({t_str[4:6]}.{t_str[6:8]})",
                })
                if us_2y is not None:
                    diff_bp = round((us_2y - kr_2y) * 100)
                    b2_obj["gapText"] = f"금리차 {diff_bp:+d}bp ({'미 > 한' if diff_bp >= 0 else '한 > 미'})"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 817Y002 2Y Bond failed: {exc}")

        try:
            ktb10_rows = fetch_bok_ecos_rows(bok_key, "817Y002", "D", start_ymd_45, end_ymd, "010210000")
            if len(ktb10_rows) >= 2:
                kr_10y = round(ktb10_rows[-1]["_float"], 2)
                kr_10y_prev = round(ktb10_rows[-2]["_float"], 2)
                t_str = ktb10_rows[-1]["TIME"]
                chg_s, dir_s = format_bp_change(round((kr_10y - kr_10y_prev) * 100))
                b10_obj = ensure_item("bond_10y")
                b10_obj.update({
                    "krDisplay": f"{kr_10y:.2f}%",
                    "krNum": kr_10y,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"국고채 10년 ({t_str[4:6]}.{t_str[6:8]})",
                })
                if us_10y is not None:
                    diff_bp = round((us_10y - kr_10y) * 100)
                    b10_obj["gapText"] = f"금리차 {diff_bp:+d}bp ({'미 > 한' if diff_bp >= 0 else '한 > 미'})"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 817Y002 10Y Bond failed: {exc}")

        if kr_2y is not None and kr_10y is not None:
            kr_sp_bp = round((kr_10y - kr_2y) * 100)
            sign = "+" if kr_sp_bp >= 0 else ""
            ys_obj = ensure_item("yield_spread")
            ys_obj["krDisplay"] = f"{sign}{kr_sp_bp}bp"
            ys_obj["krNum"] = round(kr_10y - kr_2y, 2)
            ys_obj["krPeriod"] = "정상 우상향 구간" if kr_sp_bp >= 0 else "장단기 금리 역전"
            if kr_2y_prev is not None and kr_10y_prev is not None:
                prev_kr_sp = round((kr_10y_prev - kr_2y_prev) * 100)
                chg_s, dir_s = format_bp_change(kr_sp_bp - prev_kr_sp)
                ys_obj["krChange"] = chg_s
                ys_obj["krDir"] = dir_s
            if us_2y is not None and us_10y is not None:
                us_sp_bp = round((us_10y - us_2y) * 100)
                if us_sp_bp >= 0 and kr_sp_bp >= 0:
                    ys_obj["gapText"] = f"양국 정상 커브 (미 {us_sp_bp:+d}bp · 한 {kr_sp_bp:+d}bp)"
                else:
                    ys_obj["gapText"] = f"미국 {us_sp_bp:+d}bp · 한국 {kr_sp_bp:+d}bp"

        # (C) 한국 소비자물가지수 CPI (901Y009 / M / 0 총지수 -> 전년동월비 YoY %)
        try:
            cpi_kr_rows = fetch_bok_ecos_rows(bok_key, "901Y009", "M", start_ym_30, end_ym, "0")
            res = compute_yoy_from_monthly([(r["TIME"], r["_float"]) for r in cpi_kr_rows])
            if res:
                ym, kr_cpi_val, diff_pp = res
                chg_s, dir_s = format_pp_change(diff_pp, decimals=1, unit="%p")
                cpi_obj = ensure_item("cpi")
                cpi_obj.update({
                    "krDisplay": f"{kr_cpi_val:.1f}%",
                    "krNum": kr_cpi_val,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"{ym[:4]}.{ym[4:6]}월 전년동월비",
                })
                if us_cpi is not None:
                    gap = round(us_cpi - kr_cpi_val, 1)
                    cpi_obj["gapText"] = f"미국 {us_cpi:.1f}% vs 한국 {kr_cpi_val:.1f}% ({'미국 +' if gap >= 0 else '한국 +'}{abs(gap):.1f}%p)"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 901Y009 (KR CPI) failed: {exc}")

        # (D) 한국 근원 소비자물가 Core CPI (901Y010 / M / DB 농산물및석유류제외지수, 폴백 QB)
        try:
            core_kr_rows = []
            for candidate_code in ("DB", "QB"):
                try:
                    core_kr_rows = fetch_bok_ecos_rows(bok_key, "901Y010", "M", start_ym_30, end_ym, candidate_code)
                    if len(core_kr_rows) >= 13:
                        break
                except Exception:
                    continue

            if len(core_kr_rows) < 13:
                all_901 = fetch_bok_ecos_rows(bok_key, "901Y010", "M", start_ym_30, end_ym, max_rows=500)
                core_kr_rows = [r for r in all_901 if "농산물및석유류제외" in str(r.get("ITEM_NAME1", ""))]
                if len(core_kr_rows) < 13:
                    core_kr_rows = [r for r in all_901 if "식료품및에너지제외" in str(r.get("ITEM_NAME1", ""))]

            res = compute_yoy_from_monthly([(r["TIME"], r["_float"]) for r in core_kr_rows])
            if res:
                ym, kr_core_val, diff_pp = res
                chg_s, dir_s = format_pp_change(diff_pp, decimals=1, unit="%p")
                cc_obj = ensure_item("core_cpi")
                cc_obj.update({
                    "krDisplay": f"{kr_core_val:.1f}%",
                    "krNum": kr_core_val,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"{ym[:4]}.{ym[4:6]}월 농산물·석유류 제외",
                })
                if us_core_cpi is not None:
                    gap = round(us_core_cpi - kr_core_val, 1)
                    cc_obj["gapText"] = f"근원물가 격차 {'미국 +' if gap >= 0 else '한국 +'}{abs(gap):.1f}%p"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 901Y010 (KR Core CPI) failed: {exc}")

        # (E) 한국 생산자물가지수 PPI (404Y014 / M / *AA 총지수 -> 전년동월비 YoY %)
        try:
            ppi_kr_rows = []
            try:
                ppi_kr_rows = fetch_bok_ecos_rows(bok_key, "404Y014", "M", start_ym_30, end_ym, "*AA")
            except Exception:
                all_ppi = fetch_bok_ecos_rows(bok_key, "404Y014", "M", start_ym_30, end_ym, max_rows=500)
                ppi_kr_rows = [r for r in all_ppi if str(r.get("ITEM_NAME1", "")).strip() == "총지수"]

            res = compute_yoy_from_monthly([(r["TIME"], r["_float"]) for r in ppi_kr_rows])
            if res:
                ym, kr_ppi_val, diff_pp = res
                chg_s, dir_s = format_pp_change(diff_pp, decimals=1, unit="%p")
                ppi_obj = ensure_item("ppi")
                ppi_obj.update({
                    "krDisplay": f"{kr_ppi_val:.1f}%",
                    "krNum": kr_ppi_val,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"{ym[:4]}.{ym[4:6]}월 전년동월비",
                })
                if us_ppi is not None:
                    gap = round(us_ppi - kr_ppi_val, 1)
                    ppi_obj["gapText"] = f"미국 {us_ppi:.1f}% · 한국 {kr_ppi_val:.1f}% ({'미국 +' if gap >= 0 else '한국 +'}{abs(gap):.1f}%p)"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 404Y014 (KR PPI) failed: {exc}")

        # (F) 한국 실업률(I61BC) · 고용률(I61E) (901Y027 / M / 계절조정 I28B 폴백 I28A)
        try:
            u_kr_rows = []
            season_label = "계절조정"
            for s_code, s_lbl in [("I28B", "계절조정"), ("I28A", "원계열")]:
                try:
                    u_kr_rows = fetch_bok_ecos_rows(bok_key, "901Y027", "M", shift_year_month(now_kst, -12), end_ym, "I61BC", s_code)
                    if len(u_kr_rows) >= 2:
                        season_label = s_lbl
                        break
                except Exception:
                    continue
            if len(u_kr_rows) >= 2:
                kr_u = round(u_kr_rows[-1]["_float"], 1)
                kr_u_diff = kr_u - round(u_kr_rows[-2]["_float"], 1)
                ym = u_kr_rows[-1]["TIME"][:6]
                chg_s, dir_s = format_pp_change(kr_u_diff, decimals=1, unit="%p")
                u_obj = ensure_item("unemployment")
                u_obj.update({
                    "krDisplay": f"{kr_u:.1f}%",
                    "krNum": kr_u,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"{ym[:4]}.{ym[4:6]}월 {season_label}",
                })
                if us_unemp is not None:
                    u_obj["gapText"] = f"미국 {us_unemp:.1f}% · 한국 {kr_u:.1f}% (저실업 유지)"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 901Y027 (KR Unemployment) failed: {exc}")

        try:
            e_kr_rows = []
            season_label = "계절조정"
            for s_code, s_lbl in [("I28B", "계절조정"), ("I28A", "원계열")]:
                try:
                    e_kr_rows = fetch_bok_ecos_rows(bok_key, "901Y027", "M", shift_year_month(now_kst, -12), end_ym, "I61E", s_code)
                    if len(e_kr_rows) >= 2:
                        season_label = s_lbl
                        break
                except Exception:
                    continue
            if len(e_kr_rows) >= 2:
                kr_emp = round(e_kr_rows[-1]["_float"], 1)
                kr_emp_diff = kr_emp - round(e_kr_rows[-2]["_float"], 1)
                ym = e_kr_rows[-1]["TIME"][:6]
                chg_s, dir_s = format_pp_change(kr_emp_diff, decimals=1, unit="%p")
                ensure_item("employment_rate").update({
                    "krDisplay": f"{kr_emp:.1f}%",
                    "krNum": kr_emp,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"{ym[:4]}.{ym[4:6]}월 15세 이상 ({season_label})",
                })
        except Exception as exc:
            print(f"[WARN] BOK ECOS 901Y027 (KR Employment Rate) failed: {exc}")

        # (G) 한국 실질 GDP 성장률 (200Y102 / Q / 10111 실질 국내총생산 전기대비 %)
        try:
            start_q = get_quarter_code(now_kst, -10)
            end_q = get_quarter_code(now_kst, 0)
            gdp_kr_rows = fetch_bok_ecos_rows(bok_key, "200Y102", "Q", start_q, end_q, "10111")
            if len(gdp_kr_rows) >= 2:
                kr_gdp_qoq = round(gdp_kr_rows[-1]["_float"], 1)
                prev_gdp_qoq = round(gdp_kr_rows[-2]["_float"], 1)
                q_diff = kr_gdp_qoq - prev_gdp_qoq
                q_time = gdp_kr_rows[-1]["TIME"]  # e.g. "2026Q3"
                q_pretty = q_time.replace("Q", "년 ") + "분기" if "Q" in q_time else q_time
                chg_s, dir_s = format_pp_change(q_diff, decimals=1, unit="%p")
                kr_ann = round((((1.0 + kr_gdp_qoq / 100.0) ** 4) - 1.0) * 100.0, 1)

                gdp_obj = ensure_item("real_gdp")
                gdp_obj.update({
                    "krDisplay": f"{kr_gdp_qoq:.1f}%",
                    "krNum": kr_gdp_qoq,
                    "krChange": chg_s,
                    "krDir": dir_s,
                    "krPeriod": f"{q_pretty} 전기비 (연율환산 {kr_ann:.1f}%)",
                })
                if us_gdp is not None:
                    gdp_obj["gapText"] = f"미국 연율 {us_gdp:.1f}% · 한국 전기비 {kr_gdp_qoq:.1f}% (연율 {kr_ann:.1f}%)"
        except Exception as exc:
            print(f"[WARN] BOK ECOS 200Y102 (KR Real GDP) failed: {exc}")
    else:
        print("[INFO] BOK_ECOS_API_KEY is not set -> keeping baseline Korean macro figures.")

    return list(updates.values())


def main():
    now_kst = datetime.now(KST)
    print(f"[INFO] Starting dynamic market data sync at {now_kst.isoformat()}")

    fx_rates = fetch_fx_rates()
    usd_krw = fx_rates["KRW"]
    print(f"[INFO] Live USD/KRW = {usd_krw}")

    quote_cache = {}

    def get_cached_quote(sym: str) -> dict:
        if sym not in quote_cache:
            quote_cache[sym] = fetch_single_quote(sym)
        return quote_cache[sym]

    # 1. Dynamic Global Top 50 Listed Companies (Tier 1: Live CMC -> Tier 2: 90+ Yahoo/Naver Pool)
    try:
        companies_out = fetch_dynamic_top50_cmc()
        print(f"[INFO] Tier-1 CMC dynamic Top 50 loaded ({len(companies_out)} listed companies).")
        # Refresh Korean listed stocks (.KS/.KQ) in Global Top 50 with real-time Naver KRX quote
        kr_id_to_sym = {"samsung": "005930.KS", "skhynix": "000660.KS"}
        for item in companies_out:
            kr_sym = kr_id_to_sym.get(item["id"])
            if not kr_sym and item.get("country") == "KR" and str(item.get("ticker", "")).endswith((".KS", ".KQ")):
                kr_sym = item["ticker"]
            if kr_sym:
                kq = get_cached_quote(kr_sym)
                if kq["market_cap"] and usd_krw > 0:
                    item["marketCapB"] = round((kq["market_cap"] / usd_krw) / 1e9, 2)
                if kq["change_pct"] is not None:
                    item["changePct"] = kq["change_pct"]

        # Ensure 2026 mega-IPOs (Anthropic ANT, SpaceX SPCX, CXMT 688825.SS) are included even if external ranking lags IPO indexing
        existing_ids = {c["id"] for c in companies_out}
        recent_mega_ipos = [
            ("spacex", "SpaceX", "스페이스X", "SPCX", "USD", "US", "우주항공·위성통신·AI", 1912.0),
            ("anthropic", "Anthropic", "앤트로픽", "ANT", "USD", "US", "생성형 AI 모델·클라우드", 1271.6),
            ("cxmt", "CXMT", "창신메모리(CXMT)", "688825.SS", "CNY", "CN", "DRAM 메모리 반도체", 350.0),
        ]
        for r_id, r_en, r_ko, r_sym, r_ccy, r_cnt, r_sec, r_fallback_b in recent_mega_ipos:
            rq = get_cached_quote(r_sym)
            live_cap_b = None
            if rq["market_cap"]:
                fx_div = fx_rates.get(r_ccy, 1.0)
                live_cap_b = round((rq["market_cap"] / fx_div) / 1e9, 2)
            effective_cap_b = live_cap_b if (live_cap_b and live_cap_b > 50) else r_fallback_b
            effective_chg = rq["change_pct"] if rq["change_pct"] is not None else 0.0

            if r_id in existing_ids:
                for c in companies_out:
                    if c["id"] == r_id and live_cap_b and live_cap_b > 50:
                        c["marketCapB"] = live_cap_b
                        if rq["change_pct"] is not None:
                            c["changePct"] = rq["change_pct"]
            elif len(companies_out) < 50 or effective_cap_b > companies_out[-1]["marketCapB"]:
                companies_out.append({
                    "id": r_id,
                    "name": r_en,
                    "koName": r_ko,
                    "ticker": r_sym,
                    "country": r_cnt,
                    "marketCapB": effective_cap_b,
                    "changePct": effective_chg,
                    "sector": r_sec,
                })

        companies_out.sort(key=lambda x: x["marketCapB"], reverse=True)
        companies_out = companies_out[:50]
    except Exception as cmc_err:
        print(f"[WARN] Tier-1 CMC scrape fallback ({cmc_err}); running Tier-2 90+ Global Stock Pool...")
        companies_out = fetch_dynamic_top50_from_pool(fx_rates, get_cached_quote)
        print(f"[INFO] Tier-2 Global Pool dynamic Top 50 loaded ({len(companies_out)} listed companies).")

    # 2. S&P 500 Sectors + Top 3
    sp500_out = []
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
        if sec_id in prev_sp_caps and prev_sp_caps[sec_id] and etf_q["change_pct"] is not None:
            sec_obj["marketCapB"] = round(prev_sp_caps[sec_id] * (1.0 + etf_q["change_pct"] / 100.0), 1)
        elif top3_sum_b > 0:
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

    # 4. US & KR 4 Major Stock Market Indices (Live + 6-Month History)
    indices_out = fetch_market_indices_6m()
    print(f"[INFO] Loaded {len(indices_out)} major stock market indices (S&P 500, NASDAQ, KOSPI, KOSDAQ).")

    # 5. Commodities 6-Month History
    commodities_out = fetch_commodities_6m()

    # 6. Macro Indicators
    macro_out = build_macro_updates(fx_rates)

    payload = {
        "isBootstrap": False,
        "dynamicTop50": True,
        "updatedAt": now_kst.isoformat(),
        "updatedLabel": now_kst.strftime("%Y년 %m월 %d일 %H:%M 기준").replace(" 0", " "),
        "usdKrw": usd_krw,
        "marketIndices": indices_out,
        "companies": companies_out,
        "sp500Sectors": sp500_out,
        "kospi200Sectors": kospi_out,
        "commodities": commodities_out,
        "macroIndicators": macro_out,
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"[INFO] Wrote {OUT_PATH} successfully ({len(companies_out)} dynamic listed Top 50 firms).")

    # 7. Also refresh static backup data/insights.json for insights.html ("경제 이야기")
    try:
        from sync_insights import sync_insights_json
        sync_insights_json()
    except Exception as ins_exc:
        print(f"[WARN] Optional insights.json backup sync skipped: {ins_exc}")


if __name__ == "__main__":
    main()
