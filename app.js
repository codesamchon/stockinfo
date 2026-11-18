(() => {
  "use strict";

  // Country Configuration (Global Top 50)
  const COUNTRY_META = {
    US: { ko: "미국", color: "#4472C4", order: 0 },
    CN: { ko: "중국", color: "#D9483B", order: 1 },
    TW: { ko: "대만", color: "#E3B341", order: 2 },
    SA: { ko: "사우디아라비아", color: "#6BB662", order: 3 },
    KR: { ko: "대한민국", color: "#259B8E", order: 4 },
    CH: { ko: "스위스", color: "#E5538B", order: 5 },
    NL: { ko: "네덜란드", color: "#31B0D5", order: 6 },
    GB: { ko: "영국", color: "#8B65C7", order: 7 }
  };

  const PAGE_COPY = {
    global: {
      docTitle: "전세계 가장 큰 기업들 (Top 50) | 실시간 글로벌 시가총액 인포그래픽",
      kicker: "전 세계 상위 50대 기업",
      mainTitle: "전세계 가장 큰 기업들",
      footnotePrefix: "미국 달러(USD) 시가총액 기준,",
      footnoteSource: "출처: CompaniesMarketCap, 각국 거래소 실시간 공시",
      href: "./index.html"
    },
    sp500: {
      docTitle: "S&P 500 섹터별 시가총액 & Top 3 | 실시간 글로벌 시가총액 인포그래픽",
      kicker: "미국 S&P 500 지수 · GICS 11개 섹터 그룹합 기준",
      mainTitle: "S&P 500 섹터별 시가총액",
      footnotePrefix: "미국 S&P 500 구성 종목 GICS 11개 섹터 합산 시가총액(USD) 기준,",
      footnoteSource: "출처: S&P Dow Jones Indices, CompaniesMarketCap, 미국 거래소 공시",
      searchPlaceholder: "섹터명 또는 Top 3 기업·티커 검색 (예: 정보기술, 금융, NVDA)",
      colPrimary: "섹터 합산 시총 (USD)",
      colSecondary: "원화 환산 추정",
      indexLabel: "S&P 500",
      subClassLabel: "GICS 공식 산업분류 기준",
      href: "./sp500.html"
    },
    kospi200: {
      docTitle: "KOSPI 200 섹터별 시가총액 & Top 3 | 실시간 글로벌 시가총액 인포그래픽",
      kicker: "한국거래소 KOSPI 200 지수 · 10개 핵심 섹터 그룹합 기준",
      mainTitle: "KOSPI 200 섹터별 시가총액",
      footnotePrefix: "한국거래소(KRX) KOSPI 200 구성 종목 섹터별 합산 시가총액(KRW) 기준,",
      footnoteSource: "출처: 한국거래소(KRX) 정보데이터시스템, 네이버페이 증권, DART 공시",
      searchPlaceholder: "섹터명 또는 Top 3 기업·종목코드 검색 (예: 정보기술, 삼성전자, 005930)",
      colPrimary: "섹터 합산 시총 (KRW)",
      colSecondary: "달러 환산 추정 (USD)",
      indexLabel: "KOSPI 200",
      subClassLabel: "KRX 섹터지수 분류 기준",
      href: "./kospi200.html"
    },
    macro: {
      docTitle: "한·미 핵심 거시지표 비교 | 실시간 글로벌 시가총액 인포그래픽",
      kicker: "미국(US) · 대한민국(KR) 핵심 거시경제 지표 한눈에 비교",
      mainTitle: "한·미 핵심 거시지표",
      footnotePrefix: "각국 중앙은행·통계청 최근 공식 발표치 및 시장 기준금리·환율 데이터,",
      footnoteSource: "출처: 미 연준(Fed)·노동통계국(BLS)·상무부(BEA), 한국은행(BOK)·통계청(KOSTAT)",
      href: "./macro.html"
    }
  };

  const TOP_LIMIT = 50;
  const DEFAULT_USD_KRW = 1398.5;

  // Baseline Top 50 Global Companies Dataset (Market Cap in Billions USD)
  const INITIAL_COMPANIES = [
    { id: "apple", name: "Apple", koName: "애플", ticker: "AAPL", country: "US", marketCapB: 5097.0, changePct: -1.12, sector: "IT·소비자기술", summary: "아이폰 AI 슈퍼사이클 및 서비스 생태계 확장으로 글로벌 시가총액 5조 달러 시대를 연 선두 기업." },
    { id: "microsoft", name: "Microsoft", koName: "마이크로소프트", ticker: "MSFT", country: "US", marketCapB: 3726.0, changePct: -0.84, sector: "클라우드·AI 소프트웨어", summary: "Azure 클라우드 및 기업용 Copilot AI 확산에 힘입어 안정적인 엔터프라이즈 매출 성장을 기록 중." },
    { id: "nvidia", name: "NVIDIA", koName: "엔비디아", ticker: "NVDA", country: "US", marketCapB: 3714.0, changePct: -2.45, sector: "AI 반도체", summary: "데이터센터용 차세대 AI 가속기 독점적 지위를 유지하며 마이크로소프트와 시총 2위권을 다투는 핵심 기업." },
    { id: "alphabet", name: "Alphabet", koName: "알파벳(구글)", ticker: "GOOG", country: "US", marketCapB: 3429.0, changePct: -0.65, sector: "플랫폼·클라우드·AI", summary: "검색·유튜브 광고 수익성과 Gemini 기반 구글 클라우드 AI 인프라 수요 확대로 견조한 실적 지속." },
    { id: "amazon", name: "Amazon", koName: "아마존", ticker: "AMZN", country: "US", marketCapB: 2785.0, changePct: -0.52, sector: "이커머스·클라우드", summary: "AWS 클라우드 자체 AI 칩 도입과 북미 물류 자동화를 통한 영업이익률 개선세가 뚜렷함." },
    { id: "spacex", name: "SpaceX", koName: "스페이스X", ticker: "SPCX", country: "US", marketCapB: 1912.0, changePct: 1.18, sector: "우주항공·위성통신·AI", summary: "xAI·X 합병 이후 나스닥에 상장하여 스타링크 글로벌 통신망과 우주 발사체 시장을 주도 중." },
    { id: "tsmc", name: "TSMC", koName: "TSMC", ticker: "TSM", country: "TW", marketCapB: 1867.0, changePct: -1.95, sector: "파운드리 반도체", summary: "첨단 2나노 공정 및 CoWoS 패키징 독점력을 바탕으로 글로벌 AI 반도체 생산을 전담하는 대만 대표 기업." },
    { id: "aramco", name: "Saudi Aramco", koName: "사우디 아람코", ticker: "2222.SR", country: "SA", marketCapB: 1701.0, changePct: 0.24, sector: "에너지·석유화학", summary: "세계 최대 원유 매장량과 저원가 생산 역량을 보유한 사우디아라비아 국영 종합 에너지 기업." },
    { id: "broadcom", name: "Broadcom", koName: "브로드컴", ticker: "AVGO", country: "US", marketCapB: 1615.0, changePct: -1.62, sector: "맞춤형 AI 반도체·SW", summary: "빅테크 맞춤형 AI ASIC 칩(XPU) 설계와 VMware 인프라 소프트웨어 시너지로 초고속 성장." },
    { id: "meta", name: "Meta", koName: "메타 플랫폼스", ticker: "META", country: "US", marketCapB: 1583.0, changePct: -0.78, sector: "소셜미디어·AI", summary: "AI 기반 정밀 광고 타겟팅 고도화 및 오픈소스 Llama 생태계와 스마트글래스 하드웨어 확장." },
    { id: "tesla", name: "Tesla", koName: "테슬라", ticker: "TSLA", country: "US", marketCapB: 1504.0, changePct: 0.92, sector: "자율주행·전기차·로보틱스", summary: "완전자율주행(FSD) 로보택시 상용화 기대감과 휴머노이드 로봇 옵티머스·에너지저장장치(ESS) 성장 반영." },
    { id: "anthropic", name: "Anthropic", koName: "앤스로픽", ticker: "ANT", country: "US", marketCapB: 1400.0, changePct: 0.0, sector: "생성형 AI 모델", summary: "Claude 기반 기업용 AI 에이전트 및 코딩·클라우드 AI 생태계 확장을 주도하며 시가총액 1.4조 달러 규모의 빅테크 대열에 합류한 생성형 AI 기업." },
    { id: "lilly", name: "Eli Lilly", koName: "일라이 릴리", ticker: "LLY", country: "US", marketCapB: 1260.0, changePct: 0.45, sector: "제약·바이오", summary: "비만·당뇨 치료제 마운자로·젭바운드 및 경구용 GLP-1 신약 파이프라인으로 글로벌 제약 시총 1위 수성." },
    { id: "berkshire", name: "Berkshire Hathaway", koName: "버크셔 해서웨이", ticker: "BRK-B", country: "US", marketCapB: 1255.0, changePct: 0.31, sector: "복합금융·지주", summary: "보험·철도·에너지 실물 사업과 막대한 현금성 자산을 바탕으로 시장 변동성 국면에서 방어력을 발휘." },
    { id: "walmart", name: "Walmart", koName: "월마트", ticker: "WMT", country: "US", marketCapB: 1013.0, changePct: 0.64, sector: "필수소비재·유통", summary: "옴니채널 이커머스 자동화와 고마진 리테일 미디어 광고 사업 성장으로 시가총액 1조 달러 안착." },
    { id: "samsung", name: "Samsung", koName: "삼성전자", ticker: "005930.KS", country: "KR", marketCapB: 935.13, changePct: -2.85, sector: "메모리·종합반도체·모바일", summary: "차세대 HBM4 및 고대역폭 AI 메모리 호황에 힘입어 글로벌 15위권 시가총액을 기록 중인 대한민국 대표 기업." },
    { id: "jpmorgan", name: "J.P.Morgan", koName: "JP모건 체이스", ticker: "JPM", country: "US", marketCapB: 876.32, changePct: 0.18, sector: "글로벌 은행·투자금융", summary: "대형 IPO 주관 수수료 증가와 견조한 순이자이익을 기록 중인 미국 최대 금융지주회사." },
    { id: "amd", name: "AMD", koName: "AMD", ticker: "AMD", country: "US", marketCapB: 810.07, changePct: -2.14, sector: "AI GPU·CPU 반도체", summary: "Instinct MI 시리즈 AI 가속기와 서버용 EPYC 프로세서 점유율 확대로 데이터센터 매출 급증." },
    { id: "micron", name: "Micron", koName: "마이크론 테크놀로지", ticker: "MU", country: "US", marketCapB: 786.80, changePct: -3.10, sector: "AI 메모리 반도체", summary: "AI 서버용 HBM 및 고용량 DDR5·저전력 메모리 공급 부족 수혜로 시가총액이 급성장한 미국 메모리 제조사." },
    { id: "visa", name: "Visa", koName: "비자", ticker: "V", country: "US", marketCapB: 783.33, changePct: 0.29, sector: "글로벌 결제 네트워크", summary: "전 세계 크로스보더 결제 트래픽 증가와 스테이블코인·실시간 정산 솔루션 결합으로 안정적 수익 창출." },
    { id: "exxon", name: "ExxonMobil", koName: "엑슨모빌", ticker: "XOM", country: "US", marketCapB: 681.61, changePct: 0.41, sector: "에너지·석유가스", summary: "퍼미안 분지 및 가이아나 광구 증산과 탄소포집·데이터센터 전력 공급 사업 확장을 추진 중." },
    { id: "jnj", name: "Johnson & Johnson", koName: "존슨앤드존슨", ticker: "JNJ", country: "US", marketCapB: 673.58, changePct: 0.53, sector: "제약·의료기기", summary: "항암·면역학 전문의약품과 심혈관·로봇수술 의료기기 중심 포트폴리오 재편으로 안정적 성장." },
    { id: "skhynix", name: "SK hynix", koName: "SK하이닉스", ticker: "000660.KS", country: "KR", marketCapB: 584.28, changePct: -3.25, sector: "AI HBM 메모리 반도체", summary: "AI 가속기용 HBM 시장 선도적 공급 지위를 바탕으로 글로벌 메모리 수익성 1위를 달성한 한국 반도체 기업." },
    { id: "mastercard", name: "Mastercard", koName: "마스터카드", ticker: "MA", country: "US", marketCapB: 565.01, changePct: 0.33, sector: "글로벌 결제·핀테크", summary: "글로벌 소비 결제망과 사이버보안·데이터 분석 부가서비스 매출 고성장이 지속됨." },
    { id: "asml", name: "ASML", koName: "ASML", ticker: "ASML", country: "NL", marketCapB: 525.47, changePct: -2.40, sector: "반도체 노광장비", summary: "초미세 반도체 공정 필수 장비인 EUV 및 High-NA EUV 노광장비를 전 세계 독점 공급하는 네덜란드 기업." },
    { id: "abbvie", name: "AbbVie", koName: "애브비", ticker: "ABBV", country: "US", marketCapB: 517.83, changePct: 0.48, sector: "바이오·면역항암", summary: "스카이리치·린버크 등 차세대 자가면역질환 치료제가 특허만료 영향을 완전히 상쇄하며 고성장." },
    { id: "costco", name: "Costco", koName: "코스트코", ticker: "COST", country: "US", marketCapB: 494.52, changePct: 0.56, sector: "회원제 창고형 유통", summary: "높은 유료 멤버십 갱신율과 자체 브랜드 커클랜드 경쟁력을 기반으로 글로벌 매장 확장 지속." },
    { id: "ccb", name: "CCB", koName: "중국건설은행", ticker: "601939.SS", country: "CN", marketCapB: 482.06, changePct: 0.62, sector: "국유 상업은행", summary: "인프라 금융과 안정적인 배당 수익률을 바탕으로 중국 은행주 중 시가총액 선두를 기록." },
    { id: "tencent", name: "Tencent", koName: "텐센트", ticker: "TCEHY", country: "CN", marketCapB: 429.42, changePct: -0.74, sector: "게임·메신저·AI 클라우드", summary: "위챗 생태계 미니프로그램 광고·핀테크 수익과 글로벌 게임 흥행, 자체 AI 모델 상용화를 결합." },
    { id: "cocacola", name: "Coca-Cola", koName: "코카콜라", ticker: "KO", country: "US", marketCapB: 427.06, changePct: 0.39, sector: "음료·필수소비재", summary: "강력한 브랜드 가격 결정력과 신흥국 판매량 증가로 견고한 현금흐름과 배당 성장을 유지." },
    { id: "chevron", name: "Chevron", koName: "셰브론", ticker: "CVX", country: "US", marketCapB: 421.51, changePct: 0.28, sector: "종합 에너지", summary: "북미 및 카자흐스탄·남미 해양 유전 개발과 주주환원 중심 자본 배분을 지속하는 메이저 정유사." },
    { id: "cxmt", name: "CXMT", koName: "창신메모리(CXMT)", ticker: "688825.SS", country: "CN", marketCapB: 408.50, changePct: -2.90, sector: "DRAM 메모리 반도체", summary: "상하이 커창반 상장 이후 중국 내수 AI 서버 및 모바일용 DRAM 국산화 수요를 흡수하며 급부상." },
    { id: "roche", name: "Roche", koName: "로슈", ticker: "ROG.SW", country: "CH", marketCapB: 395.10, changePct: 0.22, sector: "제약·체외진단", summary: "표적항암제·신경과학 신약 및 글로벌 체외진단 시장 1위 역량을 보유한 스위스 바이오헬스케어 기업." },
    { id: "palantir", name: "Palantir", koName: "팔란티어", ticker: "PLTR", country: "US", marketCapB: 392.40, changePct: -1.45, sector: "AI 데이터 의사결정 SW", summary: "AIP 플랫폼을 통한 미국 민간 기업 및 국방·공공 부문 AI 운영체제 도입 확산으로 고속 성장." },
    { id: "pg", name: "P&G", koName: "프록터앤드갬블", ticker: "PG", country: "US", marketCapB: 391.80, changePct: 0.35, sector: "생활용품·필수소비재", summary: "글로벌 생활필수품 프리미엄 제품군 중심의 높은 마진율과 방어적 실적을 시현." },
    { id: "abc", name: "ABC", koName: "중국농업은행", ticker: "601288.SS", country: "CN", marketCapB: 388.90, changePct: 0.51, sector: "국유 상업은행", summary: "중국 전역의 광범위한 소매금융 예금 기반과 농촌·지역 인프라 여신 성장을 기록." },
    { id: "oracle", name: "Oracle", koName: "오라클", ticker: "ORCL", country: "US", marketCapB: 384.20, changePct: -1.08, sector: "클라우드 인프라·DB", summary: "초대형 AI 학습용 OCI 클라우드 클러스터 수주 잔고 급증과 미션크리티컬 데이터베이스 클라우드 전환." },
    { id: "cisco", name: "Cisco", koName: "시스코 시스템즈", ticker: "CSCO", country: "US", marketCapB: 374.60, changePct: -0.42, sector: "AI 네트워크·보안", summary: "AI 데이터센터 이더넷 스위칭 장비 수요와 Splunk 인수를 통한 보안·관제 구독 매출 확대." },
    { id: "icbc", name: "ICBC", koName: "중국공상은행", ticker: "601398.SS", country: "CN", marketCapB: 363.40, changePct: 0.44, sector: "국유 상업은행", summary: "자산 규모 기준 세계 최대 상업은행으로 기업금융과 국채·인프라 자금 공급의 핵심 축 담당." },
    { id: "unitedhealth", name: "UnitedHealth", koName: "유나이티드헬스", ticker: "UNH", country: "US", marketCapB: 362.10, changePct: 0.19, sector: "헬스케어·의료보험", summary: "미국 최대 민간 건강보험과 Optum 의료 서비스·약국급여관리(PBM) 수직계열화 운영." },
    { id: "merck", name: "Merck", koName: "머크(MSD)", ticker: "MRK", country: "US", marketCapB: 359.80, changePct: 0.37, sector: "제약·면역항암", summary: "면역항암제 키트루다 적응증 확대 및 심폐질환·ADC 항암 신약 파이프라인 강화." },
    { id: "bofa", name: "BofA", koName: "뱅크오브아메리카", ticker: "BAC", country: "US", marketCapB: 349.50, changePct: 0.25, sector: "종합은행·자산관리", summary: "미국 전역의 리테일 뱅킹 디지털화와 메릴 자산관리·글로벌 마켓 부문 호조." },
    { id: "boc", name: "BOC", koName: "중국은행", ticker: "601988.SS", country: "CN", marketCapB: 348.70, changePct: 0.49, sector: "국유 외환·상업은행", summary: "위안화 국제 결제 및 해외 지점망에 강점을 지닌 중국 4대 국유 상업은행." },
    { id: "homedepot", name: "The Home Depot", koName: "홈디포", ticker: "HD", country: "US", marketCapB: 346.20, changePct: -0.18, sector: "주택개보수·건자재 유통", summary: "북미 주택 리모델링 및 전문 시공업자(Pro) 대상 자재 공급망 확장." },
    { id: "ge", name: "GE Aerospace", koName: "GE 에어로스페이스", ticker: "GE", country: "US", marketCapB: 341.90, changePct: 0.81, sector: "항공기 엔진·방산", summary: "민항기 엔진 인도 증가와 고수익 장기 유지보수(MRO) 서비스 매출 급성장." },
    { id: "pmi", name: "Philip Morris", koName: "필립모리스 인터내셔널", ticker: "PM", country: "US", marketCapB: 311.40, changePct: 0.47, sector: "무연담배·소비재", summary: "아이코스(IQOS) 및 니코틴 파우치 ZYN 등 비연소 제품 비중이 전체 매출의 핵심 성장동력으로 안착." },
    { id: "hsbc", name: "HSBC", koName: "HSBC 홀딩스", ticker: "HSBC", country: "GB", marketCapB: 307.20, changePct: 0.34, sector: "글로벌 은행·자산관리", summary: "아시아·중동 자산관리 및 글로벌 무역금융에 집중하며 높은 자본수익률을 기록 중인 영국계 금융그룹." },
    { id: "intel", name: "Intel", koName: "인텔", ticker: "INTC", country: "US", marketCapB: 304.80, changePct: -1.85, sector: "CPU·파운드리 반도체", summary: "미국 내 첨단 파운드리 생산기지 가동 및 AI PC 프로세서 점유율 방어 추진." },
    { id: "novartis", name: "Novartis", koName: "노바티스", ticker: "NVS", country: "CH", marketCapB: 301.60, changePct: 0.29, sector: "전문의약품·바이오", summary: "심혈관·면역·방사성 리간드 표적항암제에 집중하는 스위스 순수 혁신신약 기업." },
    { id: "morganstanley", name: "Morgan Stanley", koName: "모건스탠리", ticker: "MS", country: "US", marketCapB: 296.80, changePct: 0.55, sector: "자산관리·투자은행", summary: "초고액자산가 자산관리(WM) 수수료 기반과 대형 테크 IPO 주관 실적이 돋보이는 글로벌 IB." }
  ];

  // Baseline S&P 500 11 GICS Sectors Dataset (USD Billions primary)
  const INITIAL_SP500_SECTORS = [
    {
      id: "it",
      koName: "정보기술",
      enName: "Information Technology",
      color: "#3B6FD8",
      companyCount: 69,
      marketCapB: 19850.0,
      changePct: -1.42,
      top3: [
        { id: "apple", name: "Apple", koName: "애플", ticker: "AAPL", country: "US", marketCapB: 5097.0, changePct: -1.12, sector: "정보기술 (S&P 500)", summary: "아이폰 AI 슈퍼사이클 및 서비스 생태계 확장으로 S&P 500 정보기술 섹터와 전체 지수 비중 1위를 차지하는 핵심 기업." },
        { id: "microsoft", name: "Microsoft", koName: "마이크로소프트", ticker: "MSFT", country: "US", marketCapB: 3726.0, changePct: -0.84, sector: "정보기술 (S&P 500)", summary: "Azure 클라우드 및 기업용 Copilot AI 확산에 힘입어 견조한 엔터프라이즈 구독 성장을 이어가는 소프트웨어 리더." },
        { id: "nvidia", name: "NVIDIA", koName: "엔비디아", ticker: "NVDA", country: "US", marketCapB: 3714.0, changePct: -2.45, sector: "정보기술 (S&P 500)", summary: "데이터센터용 AI 가속기 생태계를 독점하며 반도체 및 정보기술 섹터 시가총액 성장을 견인하는 대표 기업." }
      ]
    },
    {
      id: "financials",
      koName: "금융",
      enName: "Financials",
      color: "#25857A",
      companyCount: 72,
      marketCapB: 8150.0,
      changePct: 0.34,
      top3: [
        { id: "berkshire", name: "Berkshire Hathaway", koName: "버크셔 해서웨이", ticker: "BRK-B", country: "US", marketCapB: 1255.0, changePct: 0.31, sector: "금융 (S&P 500)", summary: "보험·철도·에너지 실물 자회사 수익과 대규모 현금성 국채 운용으로 S&P 500 금융 섹터 부동의 1위 지주사." },
        { id: "jpmorgan", name: "J.P.Morgan", koName: "JP모건 체이스", ticker: "JPM", country: "US", marketCapB: 876.32, changePct: 0.18, sector: "금융 (S&P 500)", summary: "투자은행(IB) 수수료 회복과 안정적 예대마진을 바탕으로 미국 상업·투자은행 부문을 선도하는 금융그룹." },
        { id: "visa", name: "Visa", koName: "비자", ticker: "V", country: "US", marketCapB: 783.33, changePct: 0.29, sector: "금융 (S&P 500)", summary: "글로벌 카드 결제 네트워크와 크로스보더 정산 트래픽 증가로 높은 영업이익률을 기록하는 결제 인프라 기업." }
      ]
    },
    {
      id: "consumer_disc",
      koName: "자유소비재",
      enName: "Consumer Discretionary",
      color: "#E07A38",
      companyCount: 51,
      marketCapB: 6580.0,
      changePct: 0.14,
      top3: [
        { id: "amazon", name: "Amazon", koName: "아마존", ticker: "AMZN", country: "US", marketCapB: 2785.0, changePct: -0.52, sector: "자유소비재 (S&P 500)", summary: "북미 물류 자동화 기반의 이커머스 수익성 개선과 AWS 클라우드 고성장으로 자유소비재 섹터의 절대 비중을 차지." },
        { id: "tesla", name: "Tesla", koName: "테슬라", ticker: "TSLA", country: "US", marketCapB: 1504.0, changePct: 0.92, sector: "자유소비재 (S&P 500)", summary: "완전자율주행(FSD) 로보택시 상용화와 휴머노이드 로봇·에너지저장장치(ESS) 사업 확장 기대감이 반영된 기업." },
        { id: "homedepot", name: "The Home Depot", koName: "홈디포", ticker: "HD", country: "US", marketCapB: 346.20, changePct: -0.18, sector: "자유소비재 (S&P 500)", summary: "북미 최대 주택 개보수·인테리어 유통망과 전문 시공업자(Pro) 공급 생태계를 보유한 소비재 강자." }
      ]
    },
    {
      id: "comm_services",
      koName: "커뮤니케이션 서비스",
      enName: "Communication Services",
      color: "#7C58C9",
      companyCount: 22,
      marketCapB: 6420.0,
      changePct: -0.58,
      top3: [
        { id: "alphabet", name: "Alphabet", koName: "알파벳(구글)", ticker: "GOOG", country: "US", marketCapB: 3429.0, changePct: -0.65, sector: "커뮤니케이션 서비스 (S&P 500)", summary: "검색·유튜브 디지털 광고 지배력과 Gemini 기반 클라우드 AI 모델 경쟁력을 결합한 플랫폼 기업." },
        { id: "meta", name: "Meta", koName: "메타 플랫폼스", ticker: "META", country: "US", marketCapB: 1583.0, changePct: -0.78, sector: "커뮤니케이션 서비스 (S&P 500)", summary: "AI 추천 알고리즘을 통한 인스타그램·릴스 광고 단가 상승과 스마트글래스 웨어러블 시장을 선도." },
        { id: "netflix", name: "Netflix", koName: "넷플릭스", ticker: "NFLX", country: "US", marketCapB: 465.20, changePct: 0.68, sector: "커뮤니케이션 서비스 (S&P 500)", summary: "광고형 요금제 가입자 급증과 글로벌 라이브 스포츠·오리지널 콘텐츠 흥행으로 스트리밍 수익성 1위를 유지." }
      ]
    },
    {
      id: "healthcare",
      koName: "헬스케어",
      enName: "Health Care",
      color: "#D64D73",
      companyCount: 62,
      marketCapB: 6120.0,
      changePct: 0.42,
      top3: [
        { id: "lilly", name: "Eli Lilly", koName: "일라이 릴리", ticker: "LLY", country: "US", marketCapB: 1260.0, changePct: 0.45, sector: "헬스케어 (S&P 500)", summary: "비만·대사질환 치료제 마운자로·젭바운드 수요 폭발과 차세대 경구용 GLP-1 파이프라인으로 헬스케어 1위 등극." },
        { id: "jnj", name: "Johnson & Johnson", koName: "존슨앤드존슨", ticker: "JNJ", country: "US", marketCapB: 673.58, changePct: 0.53, sector: "헬스케어 (S&P 500)", summary: "소비재 분사 이후 면역·항암 전문의약품과 첨단 심혈관·수술용 의료기기 중심으로 재편된 글로벌 헬스케어 리더." },
        { id: "abbvie", name: "AbbVie", koName: "애브비", ticker: "ABBV", country: "US", marketCapB: 517.83, changePct: 0.48, sector: "헬스케어 (S&P 500)", summary: "스카이리치와 린버크 두 자가면역질환 블록버스터 신약의 가파른 매출 성장으로 견조한 현금흐름을 창출." }
      ]
    },
    {
      id: "industrials",
      koName: "산업재",
      enName: "Industrials",
      color: "#4B86B4",
      companyCount: 78,
      marketCapB: 4950.0,
      changePct: 0.51,
      top3: [
        { id: "ge", name: "GE Aerospace", koName: "GE 에어로스페이스", ticker: "GE", country: "US", marketCapB: 341.90, changePct: 0.81, sector: "산업재 (S&P 500)", summary: "차세대 항공기 엔진 출하 확대와 고마진 장기 엔진 정비(MRO) 서비스 호황으로 S&P 500 산업재 시총 1위를 기록." },
        { id: "caterpillar", name: "Caterpillar", koName: "캐터필러", ticker: "CAT", country: "US", marketCapB: 248.60, changePct: 0.44, sector: "산업재 (S&P 500)", summary: "북미 인프라 투자 및 AI 데이터센터용 비상 발전기·전력 장비 수주 확대로 사상 최대 이익률을 경신 중인 중장비 기업." },
        { id: "uber", name: "Uber", koName: "우버 테크놀로지스", ticker: "UBER", country: "US", marketCapB: 232.40, changePct: 0.63, sector: "산업재 (S&P 500)", summary: "모빌리티·배달 플랫폼 잉여현금흐름 급증과 자율주행 로보택시 네트워크 파트너십 허브 전략으로 성장 지속." }
      ]
    },
    {
      id: "consumer_staples",
      koName: "필수소비재",
      enName: "Consumer Staples",
      color: "#5EA352",
      companyCount: 38,
      marketCapB: 3680.0,
      changePct: 0.49,
      top3: [
        { id: "walmart", name: "Walmart", koName: "월마트", ticker: "WMT", country: "US", marketCapB: 1013.0, changePct: 0.64, sector: "필수소비재 (S&P 500)", summary: "식료품 가격 경쟁력과 AI 물류 자동화·리테일 광고 사업 고성장으로 필수소비재 최초 시총 1조 달러를 돌파." },
        { id: "costco", name: "Costco", koName: "코스트코", ticker: "COST", country: "US", marketCapB: 494.52, changePct: 0.56, sector: "필수소비재 (S&P 500)", summary: "90% 이상의 충성도 높은 멤버십 갱신율과 커클랜드 PB 상품 경쟁력을 앞세운 글로벌 창고형 유통 강자." },
        { id: "cocacola", name: "Coca-Cola", koName: "코카콜라", ticker: "KO", country: "US", marketCapB: 427.06, changePct: 0.39, sector: "필수소비재 (S&P 500)", summary: "독보적인 글로벌 음료 브랜드 포트폴리오와 가격 전가력을 바탕으로 60년 이상 배당을 늘려온 대표 배당왕." }
      ]
    },
    {
      id: "energy",
      koName: "에너지",
      enName: "Energy",
      color: "#C98A2C",
      companyCount: 22,
      marketCapB: 2140.0,
      changePct: 0.36,
      top3: [
        { id: "exxon", name: "ExxonMobil", koName: "엑슨모빌", ticker: "XOM", country: "US", marketCapB: 681.61, changePct: 0.41, sector: "에너지 (S&P 500)", summary: "퍼미안 분지 셰일 통합과 가이아나 심해 유전 저원가 증산으로 압도적인 현금창출력을 유지하는 미국 최대 에너지 기업." },
        { id: "chevron", name: "Chevron", koName: "셰브론", ticker: "CVX", country: "US", marketCapB: 421.51, changePct: 0.28, sector: "에너지 (S&P 500)", summary: "안정적인 업스트림 생산 포트폴리오와 적극적인 자사주 매입·배당 주주환원 정책을 지속하는 종합 정유·가스사." },
        { id: "conocophillips", name: "ConocoPhillips", koName: "코노코필립스", ticker: "COP", country: "US", marketCapB: 168.40, changePct: 0.33, sector: "에너지 (S&P 500)", summary: "마라톤오일 인수 시너지와 북미·LNG 핵심 광구 중심의 낮은 손익분기점 구조를 갖춘 독립계 원유·가스 탐사 기업." }
      ]
    },
    {
      id: "utilities",
      koName: "유틸리티",
      enName: "Utilities",
      color: "#2E9CCA",
      companyCount: 31,
      marketCapB: 1520.0,
      changePct: 0.72,
      top3: [
        { id: "nextera", name: "NextEra Energy", koName: "넥스트에라 에너지", ticker: "NEE", country: "US", marketCapB: 198.50, changePct: 0.78, sector: "유틸리티 (S&P 500)", summary: "플로리다 전력망과 북미 최대 태양광·풍력·ESS 재생에너지 발전 역량으로 AI 데이터센터 전력 수요의 최대 수혜주." },
        { id: "constellation", name: "Constellation Energy", koName: "컨스텔레이션 에너지", ticker: "CEG", country: "US", marketCapB: 142.80, changePct: 1.15, sector: "유틸리티 (S&P 500)", summary: "미국 최대 무탄소 원자력 발전소 운영사로 빅테크 하이퍼스케일 데이터센터와 장기 전력구매계약(PPA)을 확대." },
        { id: "southern", name: "Southern Company", koName: "서던 컴퍼니", ticker: "SO", country: "US", marketCapB: 118.20, changePct: 0.45, sector: "유틸리티 (S&P 500)", summary: "신규 원전 보글(Vogtle) 상업운전 안착과 미국 남동부 제조업·데이터센터 전력 수요 증가로 안정적 이익 성장." }
      ]
    },
    {
      id: "real_estate",
      koName: "부동산",
      enName: "Real Estate",
      color: "#8E6C5E",
      companyCount: 31,
      marketCapB: 1340.0,
      changePct: 0.21,
      top3: [
        { id: "prologis", name: "Prologis", koName: "프롤로지스", ticker: "PLD", country: "US", marketCapB: 134.60, changePct: 0.26, sector: "부동산 (S&P 500)", summary: "글로벌 핵심 물류 허브 창고 리츠 1위 기업으로 이커머스 물류센터 및 데이터센터 부지 전환 사업을 병행." },
        { id: "americantower", name: "American Tower", koName: "아메리칸 타워", ticker: "AMT", country: "US", marketCapB: 112.40, changePct: 0.19, sector: "부동산 (S&P 500)", summary: "전 세계 5G 통신 타워와 CoreSite 데이터센터 자산을 운영하는 대표 디지털 인프라 리츠(REITs)." },
        { id: "equinix", name: "Equinix", koName: "에퀴닉스", ticker: "EQIX", country: "US", marketCapB: 106.80, changePct: 0.38, sector: "부동산 (S&P 500)", summary: "글로벌 주요 대도시 망중립 코로케이션 데이터센터와 엔터프라이즈 AI 상호연결 인프라를 제공하는 리츠." }
      ]
    },
    {
      id: "materials",
      koName: "소재",
      enName: "Materials",
      color: "#6C7A89",
      companyCount: 28,
      marketCapB: 1190.0,
      changePct: -0.15,
      top3: [
        { id: "linde", name: "Linde", koName: "린데", ticker: "LIN", country: "US", marketCapB: 238.50, changePct: 0.12, sector: "소재 (S&P 500)", summary: "반도체·수소·의료·화학 공정용 산업용 가스 세계 1위 공급사로 장기 계약 기반의 안정적 마진을 기록." },
        { id: "sherwin", name: "Sherwin-Williams", koName: "셔윈-윌리엄스", ticker: "SHW", country: "US", marketCapB: 104.20, changePct: -0.22, sector: "소재 (S&P 500)", summary: "북미 건축·산업용 도료 및 코팅 시장 압도적 직영 유통망을 보유한 대표 특수화학 기업." },
        { id: "freeport", name: "Freeport-McMoRan", koName: "프리포트 맥모란", ticker: "FCX", country: "US", marketCapB: 86.50, changePct: -0.64, sector: "소재 (S&P 500)", summary: "전력망 확충·전기차·데이터센터 필수 원자재인 구리 및 금 광산을 운영하는 글로벌 비철금속 선두 기업." }
      ]
    }
  ];

  // Baseline KOSPI 200 10 Core Sectors Dataset (KRW Trillions 'marketCapJo' primary; total 200 companies)
  const INITIAL_KOSPI200_SECTORS = [
    {
      id: "kr_it",
      koName: "정보기술",
      enName: "Information Technology",
      color: "#259B8E",
      companyCount: 26,
      marketCapJo: 2195.0,
      changePct: -2.92,
      top3: [
        { id: "kr_samsung", name: "Samsung Electronics", koName: "삼성전자", ticker: "005930.KS", country: "KR", marketCapJo: 1307.8, changePct: -2.85, sector: "정보기술 (KOSPI 200)", summary: "차세대 HBM4 양산 및 온디바이스 AI 스마트폰 생태계 확장에 힘입어 KOSPI 200 전체 시가총액 부동의 1위를 지키는 대표 기업." },
        { id: "kr_skhynix", name: "SK hynix", koName: "SK하이닉스", ticker: "000660.KS", country: "KR", marketCapJo: 817.1, changePct: -3.25, sector: "정보기술 (KOSPI 200)", summary: "글로벌 AI 가속기용 고대역폭메모리(HBM) 핵심 공급사로서 사상 최고 영업이익률과 시총 성장을 달성한 반도체 선두 기업." },
        { id: "kr_semco", name: "Samsung Electro-Mechanics", koName: "삼성전기", ticker: "009150.KS", country: "KR", marketCapJo: 14.8, changePct: -1.40, sector: "정보기술 (KOSPI 200)", summary: "AI 서버·전장용 초고용량 적층세라믹콘덴서(MLCC) 및 고성능 반도체 패키지 기판(FC-BGA) 공급을 확대 중인 핵심 부품사." }
      ]
    },
    {
      id: "kr_industrials",
      koName: "산업재·조선·방산",
      enName: "Industrials",
      color: "#3B6FD8",
      companyCount: 44,
      marketCapJo: 342.0,
      changePct: 1.14,
      top3: [
        { id: "kr_hanwhaaero", name: "Hanwha Aerospace", koName: "한화에어로스페이스", ticker: "012450.KS", country: "KR", marketCapJo: 48.5, changePct: 1.65, sector: "산업재 (KOSPI 200)", summary: "K9 자주포·천무 다연장로켓의 유럽·중동 수출 확대와 항공엔진·우주발사체 사업 호조로 산업재 시총 선두를 기록." },
        { id: "kr_hdhhi", name: "HD Hyundai Heavy Industries", koName: "HD현대중공업", ticker: "329180.KS", country: "KR", marketCapJo: 36.2, changePct: 1.28, sector: "산업재 (KOSPI 200)", summary: "고부가 LNG 운반선·친환경 암모니아 추진선 수주 잔고와 미 해군 함정 유지·보수·정비(MRO) 진출로 수익성 급증." },
        { id: "kr_doosanenerbility", name: "Doosan Enerbility", koName: "두산에너빌리티", ticker: "034020.KS", country: "KR", marketCapJo: 24.6, changePct: 0.94, sector: "산업재 (KOSPI 200)", summary: "글로벌 대형 원전 주기기 및 소형모듈원전(SMR) 파운드리 수주와 AI 데이터센터용 가스터빈 공급 확대로 주목받는 에너지 기기 기업." }
      ]
    },
    {
      id: "kr_financials",
      koName: "금융",
      enName: "Financials",
      color: "#2E7D6B",
      companyCount: 23,
      marketCapJo: 268.0,
      changePct: 0.78,
      top3: [
        { id: "kr_kbfg", name: "KB Financial Group", koName: "KB금융", ticker: "105560.KS", country: "KR", marketCapJo: 44.2, changePct: 0.85, sector: "금융 (KOSPI 200)", summary: "견고한 보통주자본비율(CET1)을 바탕으로 자사주 매입·소각 및 분기 배당 등 밸류업 주주환원 정책을 선도하는 대한민국 대장 금융지주." },
        { id: "kr_shinhan", name: "Shinhan Financial Group", koName: "신한지주", ticker: "055550.KS", country: "KR", marketCapJo: 31.8, changePct: 0.62, sector: "금융 (KOSPI 200)", summary: "은행·카드·증권·생명 다각화된 비은행 포트폴리오와 글로벌 법인 이익 성장, 적극적인 주주환원율 확대를 추진 중." },
        { id: "kr_meritz", name: "Meritz Financial Group", koName: "메리츠금융지주", ticker: "138040.KS", country: "KR", marketCapJo: 24.9, changePct: 1.10, sector: "금융 (KOSPI 200)", summary: "화재·증권 완전자회사 통합 이후 연결 순이익의 50% 이상을 자사주 매입·소각과 배당에 투입하며 자본효율성 모델로 자리매김." }
      ]
    },
    {
      id: "kr_energy_chem",
      koName: "에너지·2차전지·화학",
      enName: "Energy & Battery",
      color: "#E07A38",
      companyCount: 24,
      marketCapJo: 234.0,
      changePct: -0.92,
      top3: [
        { id: "kr_lges", name: "LG Energy Solution", koName: "LG에너지솔루션", ticker: "373220.KS", country: "KR", marketCapJo: 96.4, changePct: -1.15, sector: "에너지·2차전지 (KOSPI 200)", summary: "북미 전기차 배터리 합작공장 가동 및 AI 전력망용 에너지저장장치(ESS)·46시리즈 원통형 배터리 수주 다변화를 추진하는 2차전지 선두 기업." },
        { id: "kr_samsungsdi", name: "Samsung SDI", koName: "삼성SDI", ticker: "006400.KS", country: "KR", marketCapJo: 24.8, changePct: -1.42, sector: "에너지·2차전지 (KOSPI 200)", summary: "프리미엄 각형 배터리와 전력용 ESS 솔루션, 차세대 전고체 배터리 양산 로드맵에 집중하는 배터리·전자재료 제조사." },
        { id: "kr_skinnovation", name: "SK Innovation", koName: "SK이노베이션", ticker: "096770.KS", country: "KR", marketCapJo: 19.5, changePct: 0.35, sector: "에너지·2차전지 (KOSPI 200)", summary: "SK E&S 합병을 통해 정유·석유화학부터 LNG 발전·배터리까지 아우르는 아시아·태평양 민간 종합 에너지 기업으로 재편." }
      ]
    },
    {
      id: "kr_consumer_disc",
      koName: "경기소비재·자동차",
      enName: "Consumer Discretionary",
      color: "#4B6CB7",
      companyCount: 25,
      marketCapJo: 218.0,
      changePct: 0.68,
      top3: [
        { id: "kr_hyundai", name: "Hyundai Motor", koName: "현대차", ticker: "005380.KS", country: "KR", marketCapJo: 58.6, changePct: 0.74, sector: "경기소비재 (KOSPI 200)", summary: "하이브리드(HEV)·제네시스 고수익 차종 판매 호조와 인도 법인 성장, 자율주행·로보틱스 미래 모빌리티 투자를 병행하는 글로벌 완성차 탑티어." },
        { id: "kr_kia", name: "Kia", koName: "기아", ticker: "000270.KS", country: "KR", marketCapJo: 45.2, changePct: 0.91, sector: "경기소비재 (KOSPI 200)", summary: "북미·유럽 RV·친환경차 중심의 높은 영업이익률과 목적기반모빌리티(PBV) 라인업 확장, 강력한 자사주 소각 정책을 지속." },
        { id: "kr_mobis", name: "Hyundai Mobis", koName: "현대모비스", ticker: "012330.KS", country: "KR", marketCapJo: 25.4, changePct: 0.48, sector: "경기소비재 (KOSPI 200)", summary: "전동화 핵심 부품 및 첨단운전자보조시스템(ADAS) 논캡티브 수주 확대와 A/S 부품 사업의 안정적 현금창출력을 보유." }
      ]
    },
    {
      id: "kr_healthcare",
      koName: "헬스케어·바이오",
      enName: "Health Care",
      color: "#D64D73",
      companyCount: 16,
      marketCapJo: 176.0,
      changePct: 0.61,
      top3: [
        { id: "kr_sambaf", name: "Samsung Biologics", koName: "삼성바이오로직스", ticker: "207940.KS", country: "KR", marketCapJo: 78.5, changePct: 0.66, sector: "헬스케어 (KOSPI 200)", summary: "제2바이오캠퍼스 5·6공장 증설과 글로벌 빅파마 대규모 위탁생산(CDMO)·ADC 수주 잔고 확대로 고성장을 이어가는 바이오 대장주." },
        { id: "kr_celltrion", name: "Celltrion", koName: "셀트리온", ticker: "068270.KS", country: "KR", marketCapJo: 43.8, changePct: 0.52, sector: "헬스케어 (KOSPI 200)", summary: "미국 직판 짐펜트라 및 자가면역·항암 바이오시밀러 포트폴리오 처방 확대와 신약 CDMO 진출을 추진하는 종합 바이오 기업." },
        { id: "kr_yuhan", name: "Yuhan", koName: "유한양행", ticker: "000100.KS", country: "KR", marketCapJo: 12.4, changePct: 1.18, sector: "헬스케어 (KOSPI 200)", summary: "비소세포폐암 신약 렉라자(레이저티닙)의 글로벌 병용요법 상업화 로열티 유입과 후속 면역·알레르기 파이프라인으로 도약 중." }
      ]
    },
    {
      id: "kr_comm",
      koName: "커뮤니케이션 서비스",
      enName: "Communication Services",
      color: "#7C58C9",
      companyCount: 11,
      marketCapJo: 108.0,
      changePct: 0.12,
      top3: [
        { id: "kr_naver", name: "NAVER", koName: "NAVER", ticker: "035420.KS", country: "KR", marketCapJo: 36.8, changePct: -0.45, sector: "커뮤니케이션 서비스 (KOSPI 200)", summary: "검색·커머스 AI 개인화 고도화와 중동 소버린 AI 클라우드 수출, 웹툰 글로벌 IP 수익화를 결합한 국내 대표 플랫폼 기업." },
        { id: "kr_krafton", name: "KRAFTON", koName: "크래프톤", ticker: "259960.KS", country: "KR", marketCapJo: 19.2, changePct: 1.32, sector: "커뮤니케이션 서비스 (KOSPI 200)", summary: "PUBG: 배틀그라운드 IP의 PC·모바일 글로벌 장기 흥행과 인조이(inZOI) 등 AI NPC 적용 신작 라인업으로 높은 이익률을 시현." },
        { id: "kr_kakao", name: "Kakao", koName: "카카오", ticker: "035720.KS", country: "KR", marketCapJo: 18.4, changePct: -0.82, sector: "커뮤니케이션 서비스 (KOSPI 200)", summary: "카카오톡 메신저 기반 비즈보드·선물하기 수익과 대화형 AI 메이트 서비스 통합 및 핵심 계열사 체질 개선을 진행 중." }
      ]
    },
    {
      id: "kr_materials",
      koName: "철강·소재",
      enName: "Materials",
      color: "#6C7A89",
      companyCount: 14,
      marketCapJo: 104.0,
      changePct: -0.34,
      top3: [
        { id: "kr_posco", name: "POSCO Holdings", koName: "POSCO홀딩스", ticker: "005490.KS", country: "KR", marketCapJo: 29.6, changePct: -0.54, sector: "철강·소재 (KOSPI 200)", summary: "수소환원제철 전환을 추진하는 철강 본업과 아르헨티나 염호 리튬·니켈 등 이차전지 원료 밸류체인을 구축한 소재 지주사." },
        { id: "kr_koreazinc", name: "Korea Zinc", koName: "고려아연", ticker: "010130.KS", country: "KR", marketCapJo: 22.8, changePct: 0.75, sector: "철강·소재 (KOSPI 200)", summary: "아연·연·은·전략광물 세계 1위 비철금속 제련 기술력과 신재생에너지·자원순환·이차전지 소재 신사업(트로이카 드라이브)을 전개." },
        { id: "kr_lgchem", name: "LG Chem", koName: "LG화학", ticker: "051910.KS", country: "KR", marketCapJo: 21.2, changePct: -0.95, sector: "철강·소재 (KOSPI 200)", summary: "고부가 석유화학 스페셜티 전환과 하이니켈 양극재·친환경 소재·항암 신약 등 3대 신성장동력 중심 포트폴리오 재편을 추진." }
      ]
    },
    {
      id: "kr_staples",
      koName: "필수소비재·식품·화장품",
      enName: "Consumer Staples",
      color: "#5EA352",
      companyCount: 12,
      marketCapJo: 72.0,
      changePct: 0.71,
      top3: [
        { id: "kr_ktng", name: "KT&G", koName: "KT&G", ticker: "033780.KS", country: "KR", marketCapJo: 17.6, changePct: 0.42, sector: "필수소비재 (KOSPI 200)", summary: "해외 궐련 및 전자담배(NGP) 글로벌 침투율 상승과 공격적인 자사주 소각·고배당 주주환원으로 재평가받는 소비재 대표주." },
        { id: "kr_samyang", name: "Samyang Foods", koName: "삼양식품", ticker: "003230.KS", country: "KR", marketCapJo: 9.8, changePct: 1.85, sector: "필수소비재 (KOSPI 200)", summary: "불닭볶음면 시리즈의 북미·유럽·중국 메인스트림 유통망 입점 확대와 밀양 수출 전용 공장 증설로 K-푸드 고성장을 견인." },
        { id: "kr_amore", name: "Amorepacific", koName: "아모레퍼시픽", ticker: "090430.KS", country: "KR", marketCapJo: 8.4, changePct: 0.28, sector: "필수소비재 (KOSPI 200)", summary: "라네즈·코스알엑스(COSRX)를 앞세운 북미·유럽·일본 서구권 K-뷰티 매출 비중 확대로 수익 구조를 다변화한 화장품 선두 기업." }
      ]
    },
    {
      id: "kr_utilities",
      koName: "유틸리티",
      enName: "Utilities",
      color: "#2E9CCA",
      companyCount: 5,
      marketCapJo: 28.0,
      changePct: 0.84,
      top3: [
        { id: "kr_kepco", name: "KEPCO", koName: "한국전력", ticker: "015760.KS", country: "KR", marketCapJo: 16.9, changePct: 0.92, sector: "유틸리티 (KOSPI 200)", summary: "산업용 전기요금 현실화와 연료비 안정에 따른 영업흑자 기조 정착 및 반도체 클러스터·AI 데이터센터 송배전망 투자를 담당." },
        { id: "kr_kogas", name: "KOGAS", koName: "한국가스공사", ticker: "036460.KS", country: "KR", marketCapJo: 4.3, changePct: 0.55, sector: "유틸리티 (KOSPI 200)", summary: "천연가스 도매 요금 미수금 회수 진전과 해외 LNG 광구 배당 수익을 바탕으로 재무구조 개선을 이어가는 에너지 공기업." },
        { id: "kr_kepcokps", name: "KEPCO KPS", koName: "한전KPS", ticker: "051600.KS", country: "KR", marketCapJo: 2.4, changePct: 0.31, sector: "유틸리티 (KOSPI 200)", summary: "국내외 원자력·화력 발전설비 계획예방정비 전문 공기업으로 해외 원전 수주 확대와 안정적인 배당 매력을 보유." }
      ]
    }
  ];

  const MACRO_CATEGORIES = {
    ALL: { ko: "전체", color: "var(--all-swatch)" },
    rates: { ko: "금리·환율", color: "#3B6FD8" },
    inflation: { ko: "물가 (CPI·PPI)", color: "#D96B27" },
    labor_growth: { ko: "고용·성장", color: "#259B8E" }
  };

  const INITIAL_MACRO_INDICATORS = [
    {
      id: "policy_rate",
      category: "rates",
      koName: "기준금리",
      enName: "Central Bank Policy Rate",
      usDisplay: "4.25%",
      usNum: 4.25,
      usChange: "▼ 0.25%p",
      usDir: "down",
      usPeriod: "FOMC 상단 (4.00~4.25%)",
      usSource: "연준(Fed)",
      krDisplay: "2.75%",
      krNum: 2.75,
      krChange: "▼ 0.25%p",
      krDir: "down",
      krPeriod: "금통위 기준",
      krSource: "한국은행",
      gapText: "한·미 역전폭 150bp (미국 우위)",
      scaleMax: 6.0,
      summary: "통화정책의 기준이 되는 핵심 정책금리입니다. 미국의 기준금리가 한국보다 1.50%p(150bp) 높은 역전 구간이 이어지고 있어 외국인 자금 흐름과 원/달러 환율 하단을 지지하는 핵심 변수로 작용합니다."
    },
    {
      id: "bond_2y",
      category: "rates",
      koName: "국채 2년물 금리",
      enName: "2-Year Government Bond Yield",
      usDisplay: "4.12%",
      usNum: 4.12,
      usChange: "▼ 4bp",
      usDir: "down",
      usPeriod: "시장 금리",
      usSource: "US Treasury",
      krDisplay: "2.82%",
      krNum: 2.82,
      krChange: "▼ 3bp",
      krDir: "down",
      krPeriod: "국고채 2년",
      krSource: "금융투자협회",
      gapText: "금리차 +130bp (미 > 한)",
      scaleMax: 6.0,
      summary: "향후 1~2년 내 중앙은행의 기준금리 경로 기대를 가장 민감하게 선반영하는 단기 벤치마크 국채 금리입니다. 성장주·기술주 밸류에이션 할인율 변화의 선행 지표로 활용됩니다."
    },
    {
      id: "bond_10y",
      category: "rates",
      koName: "국채 10년물 금리",
      enName: "10-Year Government Bond Yield",
      usDisplay: "4.38%",
      usNum: 4.38,
      usChange: "▲ 3bp",
      usDir: "up",
      usPeriod: "시장 금리",
      usSource: "US Treasury",
      krDisplay: "2.98%",
      krNum: 2.98,
      krChange: "▲ 2bp",
      krDir: "up",
      krPeriod: "국고채 10년",
      krSource: "금융투자협회",
      gapText: "금리차 +140bp (미 > 한)",
      scaleMax: 6.0,
      summary: "글로벌 자산 가격의 할인율 기준점이자 장기 경제성장률·기대인플레이션·재정적자 수급을 반영하는 핵심 장기 금리입니다. 기업 대출금리 및 주택담보대출 금리와 직결됩니다."
    },
    {
      id: "yield_spread",
      category: "rates",
      koName: "장단기 금리차 (10Y-2Y)",
      enName: "10Y-2Y Yield Curve Spread",
      usDisplay: "+26bp",
      usNum: 0.26,
      usChange: "▲ 7bp",
      usDir: "up",
      usPeriod: "정상 우상향 구간",
      usSource: "FRED",
      krDisplay: "+16bp",
      krNum: 0.16,
      krChange: "▲ 5bp",
      krDir: "up",
      krPeriod: "완만한 우상향",
      krSource: "한국은행",
      gapText: "양국 모두 역전 해소 (+)",
      scaleMax: 1.0,
      summary: "10년물 금리에서 2년물 금리를 뺀 스프레드로 경기 침체 및 회복 국면을 가늠하는 대표 지표입니다. 단기 금리 인하 반영으로 양국 모두 장단기 역전에서 벗어나 플러스(+) 정상 커브를 회복했습니다."
    },
    {
      id: "fx_rate",
      category: "rates",
      koName: "통화가치 · 원/달러 환율",
      enName: "Dollar Index (DXY) & USD/KRW",
      usDisplay: "104.2pt",
      usNum: 104.2,
      usChange: "▲ 0.35%",
      usDir: "up",
      usPeriod: "주요 6개국 통화 대비",
      usSource: "ICE (DXY)",
      krDisplay: "1,398.5원",
      krNum: 1398.5,
      krChange: "▲ 4.2원",
      krDir: "up",
      krPeriod: "서울외환시장 기준",
      krSource: "서울외국환중개",
      gapText: "강달러 기조 속 1,400원선 등락",
      scaleMax: 0,
      summary: "미국 달러인덱스(DXY)는 유로·엔 등 6개 주요 통화 대비 달러 가치를 나타내며, 원/달러 환율은 국내 수출기업 채산성(반도체·자동차 수혜)과 외국인 증시 수급을 좌우하는 핵심 지표입니다."
    },
    {
      id: "cpi",
      category: "inflation",
      koName: "소비자물가지수 (CPI)",
      enName: "Headline Consumer Price Index (YoY)",
      usDisplay: "2.4%",
      usNum: 2.4,
      usChange: "▼ 0.1%p",
      usDir: "down",
      usPeriod: "전년동월비 (목표 2.0%)",
      usSource: "미 노동통계국(BLS)",
      krDisplay: "1.8%",
      krNum: 1.8,
      krChange: "▼ 0.2%p",
      krDir: "down",
      krPeriod: "전년동월비 (목표 2.0%)",
      krSource: "통계청(KOSTAT)",
      gapText: "미국 +0.6%p 높음 (한국 1%대 진입)",
      scaleMax: 5.0,
      summary: "가계가 구입하는 상품과 서비스의 전반적인 물가 상승률입니다. 한국은 국제유가 안정과 내수 둔화로 중앙은행 목표치(2.0%)를 하회한 반면, 미국은 서비스 물가 영향으로 2% 초중반에서 완만히 둔화 중입니다."
    },
    {
      id: "core_cpi",
      category: "inflation",
      koName: "근원 소비자물가 (Core CPI)",
      enName: "Core CPI ex. Food & Energy (YoY)",
      usDisplay: "3.2%",
      usNum: 3.2,
      usChange: "보합 (0.0%p)",
      usDir: "flat",
      usPeriod: "식료품·에너지 제외",
      usSource: "미 노동통계국(BLS)",
      krDisplay: "1.9%",
      krNum: 1.9,
      krChange: "▼ 0.1%p",
      krDir: "down",
      krPeriod: "농산물·석유류 제외",
      krSource: "통계청(KOSTAT)",
      gapText: "미국 주거비 경직성으로 +1.3%p 격차",
      scaleMax: 5.0,
      summary: "계절·대외 충격에 민감한 식료품과 에너지를 제외해 기조적인 물가 흐름을 보여주는 지표입니다. 연준과 한국은행이 통화정책 기조 전환 속도를 결정할 때 헤드라인 CPI보다 더 중시합니다."
    },
    {
      id: "ppi",
      category: "inflation",
      koName: "생산자물가지수 (PPI)",
      enName: "Producer Price Index (YoY)",
      usDisplay: "2.1%",
      usNum: 2.1,
      usChange: "▲ 0.2%p",
      usDir: "up",
      usPeriod: "최종수요 전년동월비",
      usSource: "미 노동통계국(BLS)",
      krDisplay: "1.4%",
      krNum: 1.4,
      krChange: "▼ 0.1%p",
      krDir: "down",
      krPeriod: "전년동월비",
      krSource: "한국은행",
      gapText: "생산원가 압력 완만한 안정세",
      scaleMax: 5.0,
      summary: "국내 생산자가 시장에 출하하는 상품·서비스의 도매 단계 물가로, 보통 1~3개월 시차를 두고 소비자물가(CPI)와 기업 영업이익 마진에 전가되는 선행 인플레이션 지표입니다."
    },
    {
      id: "unemployment",
      category: "labor_growth",
      koName: "실업률",
      enName: "Unemployment Rate (Seasonally Adjusted)",
      usDisplay: "4.1%",
      usNum: 4.1,
      usChange: "보합 (0.0%p)",
      usDir: "flat",
      usPeriod: "계절조정 기준",
      usSource: "미 노동통계국(BLS)",
      krDisplay: "2.7%",
      krNum: 2.7,
      krChange: "▲ 0.1%p",
      krDir: "up",
      krPeriod: "계절조정 기준",
      krSource: "통계청(KOSTAT)",
      gapText: "양국 모두 역사적 저실업 구간",
      scaleMax: 6.0,
      summary: "경제활동인구 중 구직 활동을 했으나 일자리를 찾지 못한 비율입니다. 미국의 연준은 물가 안정과 함께 완전고용(실업률 4% 내외 유지)을 양대 책무(Dual Mandate)로 삼고 있습니다."
    },
    {
      id: "employment_rate",
      category: "labor_growth",
      koName: "고용률 및 신규 취업자 증감",
      enName: "Employment Rate & Monthly Payrolls",
      usDisplay: "60.1%",
      usNum: 60.1,
      usChange: "비농업 +16.5만 명",
      usDir: "up",
      usPeriod: "16세 이상 고용률",
      usSource: "미 노동통계국(BLS)",
      krDisplay: "63.0%",
      krNum: 63.0,
      krChange: "취업자 +14.2만 명",
      krDir: "up",
      krPeriod: "15세 이상 고용률",
      krSource: "통계청(KOSTAT)",
      gapText: "고용 탄력성 유지 · 증가폭은 완만화",
      scaleMax: 75.0,
      summary: "실업률의 착시(구직단념자 이탈)를 보완하기 위해 생산가능인구 대비 실제 취업자 비중을 측정하는 지표입니다. 월간 비농업 신규고용(미국) 및 취업자수 증감(한국)과 함께 소비 여력을 판단합니다."
    },
    {
      id: "real_gdp",
      category: "labor_growth",
      koName: "실질 GDP 성장률",
      enName: "Real Gross Domestic Product Growth",
      usDisplay: "2.8%",
      usNum: 2.8,
      usChange: "잠정치 부합",
      usDir: "up",
      usPeriod: "전기비 연율 (QoQ Ann.)",
      usSource: "미 상무부(BEA)",
      krDisplay: "2.2%",
      krNum: 2.2,
      krChange: "▲ 0.1%p",
      krDir: "up",
      krPeriod: "전년동기비 (YoY)",
      krSource: "한국은행",
      gapText: "미국 소비·AI 설비투자 견조 vs 한국 수출 주도",
      scaleMax: 5.0,
      summary: "물가 상승분을 제거한 국가 경제의 실질 성장 속도입니다. 미국은 민간 소비와 빅테크 AI 인프라 투자가 성장을 견인하고 있으며, 한국은 반도체·조선·자동차 수출 호조가 내수 부진을 방어하고 있습니다."
    }
  ];

  function normalizePageType(raw) {
    if (raw === "sp500" || raw === "kospi200" || raw === "macro") return raw;
    return "global";
  }

  // Application State
  const state = {
    currentPage: normalizePageType(document.body?.dataset?.page),
    companies: INITIAL_COMPANIES.map((c) => ({ ...c })),
    sp500Sectors: INITIAL_SP500_SECTORS.map((s) => ({
      ...s,
      top3: s.top3.map((c) => ({ ...c }))
    })),
    kospi200Sectors: INITIAL_KOSPI200_SECTORS.map((s) => ({
      ...s,
      top3: s.top3.map((c) => ({ ...c }))
    })),
    usdKrw: DEFAULT_USD_KRW,
    viewMode: "poster",
    selectedCountries: new Set(),
    countryMenuOpen: true,
    darkMode: false,
    searchQuery: "",
    sortKey: "rank",
    sortDir: "asc",
    // Per-page isolated state for sector views (sp500 & kospi200)
    sectorPages: {
      sp500: {
        viewMode: "bar",
        scaleMode: "compressed",
        expandedSectors: new Set(["it"]),
        searchQuery: "",
        sortKey: "rank",
        sortDir: "asc"
      },
      kospi200: {
        viewMode: "bar",
        scaleMode: "compressed",
        expandedSectors: new Set(["kr_it"]),
        searchQuery: "",
        sortKey: "rank",
        sortDir: "asc"
      }
    },
    macroIndicators: INITIAL_MACRO_INDICATORS.map((m) => ({ ...m })),
    macroViewMode: "cards",
    macroCategory: "ALL",
    macroSearchQuery: "",
    macroSortKey: "default",
    macroSortDir: "asc",
    activeCompanyObj: null,
    activeMacroObj: null,
    baseDateObj: new Date()
  };

  // Safe Storage Helpers
  function safeGetStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_err) {
      return null;
    }
  }

  function safeSetStorage(key, val) {
    try {
      window.localStorage.setItem(key, val);
    } catch (_err) {
      // Ignore storage quota or local file restrictions
    }
  }

  function safeRemoveStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_err) {
      // Ignore
    }
  }

  // Theme Helpers
  let themeAnimTimer = null;
  function applyTheme(isDark, animate = false) {
    state.darkMode = Boolean(isDark);
    const rootEl = document.documentElement;

    if (animate) {
      rootEl.classList.add("theme-animating");
      if (themeAnimTimer) clearTimeout(themeAnimTimer);
      themeAnimTimer = setTimeout(() => {
        rootEl.classList.remove("theme-animating");
      }, 240);
    }

    rootEl.setAttribute("data-theme", state.darkMode ? "dark" : "light");

    const btn = document.getElementById("btnThemeToggle");
    const moon = document.getElementById("iconMoon");
    const sun = document.getElementById("iconSun");
    const label = document.getElementById("themeToggleLabel");

    if (btn) btn.setAttribute("aria-pressed", String(state.darkMode));
    if (moon) moon.classList.toggle("hidden", state.darkMode);
    if (sun) sun.classList.toggle("hidden", !state.darkMode);
    if (label) label.textContent = state.darkMode ? "라이트 모드" : "다크 모드";
  }

  function loadInitialPreferences() {
    const savedTheme = safeGetStorage("VC_THEME_MODE");
    applyTheme(savedTheme === "dark", false);

    const savedCountryMenu = safeGetStorage("VC_COUNTRY_MENU_OPEN");
    if (savedCountryMenu === "false") {
      state.countryMenuOpen = false;
    }
  }

  // Date Formatters
  function getTodayISO(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatKoreanDate(d = new Date()) {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  // Currency & Market Cap Formatters
  function formatMarketCapPoster(capB) {
    if (capB >= 1000) {
      return `$${(capB / 1000).toFixed(1)}T`;
    }
    return `$${Math.round(capB)}B`;
  }

  function formatMarketCapDetail(capB) {
    if (capB >= 1000) {
      return `$${(capB / 1000).toFixed(2)}T`;
    }
    return `$${capB.toFixed(2)}B`;
  }

  function formatMarketCapExact(capB) {
    if (capB >= 1000) {
      return `$${(capB / 1000).toFixed(3)}T`;
    }
    return `$${capB.toFixed(2)}B`;
  }

  function formatKrwFromJo(jo, withApprox = false) {
    const prefix = withApprox ? "약 " : "";
    if (jo >= 10000) {
      const gyeong = Math.floor(jo / 10000);
      const remJo = Math.round(jo % 10000);
      return `${prefix}${gyeong}경 ${remJo.toLocaleString("ko-KR")}조 원`;
    }
    if (jo >= 100) {
      return `${prefix}${Math.round(jo).toLocaleString("ko-KR")}조 원`;
    }
    return `${prefix}${jo.toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}조 원`;
  }

  function formatKrwCompactJo(jo) {
    if (jo >= 100) {
      return `${Math.round(jo).toLocaleString("ko-KR")}조`;
    }
    return `${jo.toFixed(1)}조`;
  }

  function formatKrwEstimate(capB, usdKrw) {
    const jo = (capB * usdKrw) / 1000;
    return formatKrwFromJo(jo, true);
  }

  function formatUsdFromJo(jo, usdKrw, exact = false) {
    const capB = (jo * 1000) / Math.max(1, usdKrw);
    return `약 ${exact ? formatMarketCapExact(capB) : formatMarketCapDetail(capB)}`;
  }

  // SVG Flag Generator
  function getFlagSVG(countryCode, width = 28) {
    const h = Math.round(width * 0.66);
    switch (countryCode) {
      case "US":
        return `<svg width="${width}" height="${h}" viewBox="0 0 30 20" aria-label="미국 국기">
          <rect width="30" height="20" fill="#B22234"/>
          <path d="M0 2.3h30M0 5.4h30M0 8.5h30M0 11.5h30M0 14.6h30M0 17.7h30" stroke="#FFF" stroke-width="1.5"/>
          <rect width="13" height="10.8" fill="#3C3B6E"/>
          <circle cx="3" cy="2.7" r="0.8" fill="#FFF"/><circle cx="6.5" cy="2.7" r="0.8" fill="#FFF"/><circle cx="10" cy="2.7" r="0.8" fill="#FFF"/>
          <circle cx="4.7" cy="5.4" r="0.8" fill="#FFF"/><circle cx="8.2" cy="5.4" r="0.8" fill="#FFF"/>
          <circle cx="3" cy="8.1" r="0.8" fill="#FFF"/><circle cx="6.5" cy="8.1" r="0.8" fill="#FFF"/><circle cx="10" cy="8.1" r="0.8" fill="#FFF"/>
        </svg>`;
      case "CN":
        return `<svg width="${width}" height="${h}" viewBox="0 0 30 20" aria-label="중국 국기">
          <rect width="30" height="20" fill="#DE2910"/>
          <polygon points="6,2.5 7,5.5 10,5.5 7.5,7.3 8.5,10.2 6,8.4 3.5,10.2 4.5,7.3 2,5.5 5,5.5" fill="#FFDE00"/>
          <circle cx="12" cy="2.8" r="0.9" fill="#FFDE00"/><circle cx="13.8" cy="5" r="0.9" fill="#FFDE00"/>
          <circle cx="13.8" cy="8" r="0.9" fill="#FFDE00"/><circle cx="12" cy="10.2" r="0.9" fill="#FFDE00"/>
        </svg>`;
      case "TW":
        return `<svg width="${width}" height="${h}" viewBox="0 0 30 20" aria-label="대만 국기">
          <rect width="30" height="20" fill="#FE0000"/>
          <rect width="15" height="10" fill="#000095"/>
          <circle cx="7.5" cy="5" r="2.6" fill="#FFF"/>
        </svg>`;
      case "SA":
        return `<svg width="${width}" height="${h}" viewBox="0 0 30 20" aria-label="사우디아라비아 국기">
          <rect width="30" height="20" fill="#006C35"/>
          <path d="M7 9h16M9 13.5h12" stroke="#FFF" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`;
      case "KR":
        return `<svg width="${width}" height="${h}" viewBox="0 0 30 20" aria-label="대한민국 국기">
          <rect width="30" height="20" fill="#FFFFFF"/>
          <circle cx="15" cy="10" r="4.8" fill="#CD2E3A"/>
          <path d="M10.2 10a4.8 4.8 0 0 0 9.6 0 2.4 2.4 0 0 0-4.8 0 2.4 2.4 0 0 1-4.8 0z" fill="#0047A0"/>
          <path d="M6.5 5.5l2-2M21.5 16.5l2-2M21.5 3.5l2 2M6.5 14.5l2 2" stroke="#111" stroke-width="1.3"/>
        </svg>`;
      case "CH":
        return `<svg width="${Math.round(h)}" height="${h}" viewBox="0 0 20 20" aria-label="스위스 국기">
          <rect width="20" height="20" fill="#D52B1E"/>
          <rect x="8" y="4" width="4" height="12" fill="#FFF"/>
          <rect x="4" y="8" width="12" height="4" fill="#FFF"/>
        </svg>`;
      case "NL":
        return `<svg width="${width}" height="${h}" viewBox="0 0 30 20" aria-label="네덜란드 국기">
          <rect width="30" height="6.7" fill="#AE1C28"/>
          <rect y="6.7" width="30" height="6.6" fill="#FFFFFF"/>
          <rect y="13.3" width="30" height="6.7" fill="#21468B"/>
        </svg>`;
      case "GB":
        return `<svg width="${width}" height="${h}" viewBox="0 0 30 20" aria-label="영국 국기">
          <rect width="30" height="20" fill="#012169"/>
          <path d="M0 0l30 20M30 0L0 20" stroke="#FFF" stroke-width="3.6"/>
          <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.8"/>
          <path d="M15 0v20M0 10h30" stroke="#FFF" stroke-width="5.6"/>
          <path d="M15 0v20M0 10h30" stroke="#C8102E" stroke-width="3.2"/>
        </svg>`;
      default:
        return "";
    }
  }

  // Custom Vector Brand Wordmarks / Logos matching Poster Style
  function renderCompanyBrandHTML(c, boxW, boxH) {
    const minDim = Math.min(boxW, boxH);
    const scale = Math.max(0.52, Math.min(1.85, boxW / 150));

    if (boxW < 46 || boxH < 36) {
      return `<span class="tile-wordmark" style="font-size:${Math.max(9, Math.min(13, boxW * 0.22))}px">${c.ticker.split(".")[0]}</span>`;
    }

    switch (c.id) {
      case "apple":
        return `<div class="tile-logo-wrap" style="gap:${Math.round(8 * scale)}px">
          <svg width="${Math.round(36 * scale)}" height="${Math.round(42 * scale)}" viewBox="0 0 38 44" fill="#FFF">
            <path d="M29.6 23.3c0-5 4.1-7.5 4.3-7.6-2.3-3.4-6-3.9-7.3-4-3.1-.3-6.1 1.8-7.7 1.8-1.6 0-4-1.8-6.6-1.7-3.4.1-6.5 2-8.3 5-3.5 6.1-.9 15.2 2.5 20.1 1.7 2.4 3.7 5.1 6.3 5 2.5-.1 3.5-1.6 6.5-1.6 3 0 3.9 1.6 6.6 1.6 2.7 0 4.5-2.5 6.1-4.9 1.9-2.8 2.7-5.5 2.8-5.7-.1-.1-5.2-2-5.2-8zM24.6 8.5c1.4-1.7 2.3-4 2.1-6.3-2 .1-4.5 1.3-5.9 3-1.3 1.5-2.4 3.9-2.1 6.1 2.3.2 4.5-1.1 5.9-2.8z"/>
          </svg>
          <span class="tile-wordmark" style="font-size:${Math.round(34 * scale)}px;font-weight:600">Apple</span>
        </div>`;
      case "nvidia":
        return `<div class="tile-logo-wrap" style="gap:${Math.round(6 * scale)}px">
          <svg width="${Math.round(34 * scale)}" height="${Math.round(24 * scale)}" viewBox="0 0 36 26" fill="none">
            <path d="M3 13c4.5-6.5 12-9 20-5.5 4.5 2 7.5 5.5 10 5.5-3.5 5.5-11 8.5-19 5.5C9 16.5 5.5 14.5 3 13z" stroke="#FFF" stroke-width="2.6"/>
            <circle cx="18" cy="13" r="4.2" fill="#FFF"/>
          </svg>
          <span class="tile-wordmark" style="font-size:${Math.round(23 * scale)}px;letter-spacing:0.04em;font-weight:800">NVIDIA</span>
        </div>`;
      case "microsoft":
        return `<div class="tile-logo-wrap" style="gap:${Math.round(7 * scale)}px">
          <svg width="${Math.round(26 * scale)}" height="${Math.round(26 * scale)}" viewBox="0 0 26 26" fill="#FFF">
            <rect width="11.5" height="11.5"/><rect x="14" width="11.5" height="11.5"/>
            <rect y="14" width="11.5" height="11.5"/><rect x="14" y="14" width="11.5" height="11.5"/>
          </svg>
          <span class="tile-wordmark" style="font-size:${Math.round(23 * scale)}px;font-weight:700">Microsoft</span>
        </div>`;
      case "alphabet":
        return `<span class="tile-wordmark" style="font-size:${Math.round(28 * scale)}px;font-weight:600">Alphabet</span>`;
      case "amazon":
        return `<div class="tile-logo-wrap" style="flex-direction:column">
          <span class="tile-wordmark" style="font-size:${Math.round(27 * scale)}px;font-weight:800;letter-spacing:-0.03em">amazon</span>
          <svg width="${Math.round(76 * scale)}" height="${Math.round(14 * scale)}" viewBox="0 0 90 16" fill="none">
            <path d="M8 3c22 11 50 11 72 1" stroke="#FFF" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M74 1l8 2-4 7" stroke="#FFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>`;
      case "spacex":
        return `<span class="tile-wordmark" style="font-size:${Math.round(19 * scale)}px;letter-spacing:0.18em;font-weight:800">SPACEX</span>`;
      case "broadcom":
        return `<span class="tile-wordmark" style="font-size:${Math.round(15 * scale)}px;letter-spacing:0.05em;font-weight:800">● BROADCOM</span>`;
      case "meta":
        return `<span class="tile-wordmark" style="font-size:${Math.round(23 * scale)}px;font-weight:700">∞ Meta</span>`;
      case "tesla":
        return `<span class="tile-wordmark" style="font-size:${Math.round(19 * scale)}px;letter-spacing:0.24em;font-weight:700">TESLA</span>`;
      case "anthropic":
        return `<span class="tile-wordmark" style="font-size:${Math.round(17 * scale)}px;letter-spacing:0.09em;font-weight:800">ANTHROP&#92;C</span>`;
      case "tsmc":
        return `<span class="tile-wordmark" style="font-size:${Math.round(30 * scale)}px;font-weight:900;letter-spacing:0.02em">tsmc</span>`;
      case "aramco":
        return `<div class="tile-logo-wrap" style="flex-direction:column;gap:2px">
          <span class="tile-wordmark" style="font-size:${Math.round(15 * scale)}px;font-weight:700">أرامكو السعودية</span>
          <span class="tile-wordmark" style="font-size:${Math.round(15 * scale)}px;font-weight:700">Saudi Aramco</span>
        </div>`;
      case "samsung":
        return `<span class="tile-wordmark" style="font-size:${Math.round(20 * scale)}px;letter-spacing:0.09em;font-weight:900">SAMSUNG</span>`;
      case "skhynix":
        return `<span class="tile-wordmark" style="font-size:${Math.round(16 * scale)}px;font-weight:800">SK hynix</span>`;
      case "berkshire":
        return `<div class="tile-logo-wrap" style="flex-direction:column">
          <span class="tile-wordmark" style="font-size:${Math.round(28 * scale)}px;font-family:Georgia,serif;font-weight:700">BH</span>
          <span class="tile-wordmark" style="font-size:${Math.round(11 * scale)}px;font-weight:600">Berkshire</span>
        </div>`;
      case "lilly":
        return `<span class="tile-wordmark" style="font-size:${Math.round(26 * scale)}px;font-style:italic;font-family:Georgia,serif">Lilly</span>`;
      case "walmart":
        return `<span class="tile-wordmark" style="font-size:${Math.round(19 * scale)}px;font-weight:800">Walmart ✳</span>`;
      case "asml":
        return `<span class="tile-wordmark" style="font-size:${Math.round(22 * scale)}px;letter-spacing:0.06em;font-weight:900">ASML</span>`;
      default: {
        const fontSize = Math.max(10.5, Math.min(22, Math.min(boxW * 0.17, minDim * 0.26)));
        return `<span class="tile-wordmark" style="font-size:${Math.round(fontSize)}px">${c.name}</span>`;
      }
    }
  }

  // Update Top Page Navigation State (disables active page link completely)
  function syncNavLinkState() {
    const navItems = [
      { id: "navGlobal", page: "global" },
      { id: "navSp500", page: "sp500" },
      { id: "navKospi200", page: "kospi200" },
      { id: "navMacro", page: "macro" }
    ];

    navItems.forEach(({ id, page }) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (state.currentPage === page) {
        el.removeAttribute("href");
        el.classList.add("active", "is-disabled");
        el.setAttribute("aria-current", "page");
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("tabindex", "-1");
      } else {
        el.setAttribute("href", PAGE_COPY[page].href);
        el.classList.remove("active", "is-disabled");
        el.removeAttribute("aria-current");
        el.removeAttribute("aria-disabled");
        el.removeAttribute("tabindex");
      }
    });

    const isGlobal = state.currentPage === "global";
    const isSector = state.currentPage === "sp500" || state.currentPage === "kospi200";
    const isMacro = state.currentPage === "macro";

    document.getElementById("globalViewGroup")?.classList.toggle("hidden", !isGlobal);
    document.getElementById("globalFilterInner")?.classList.toggle("hidden", !isGlobal);
    document.getElementById("globalContentWrap")?.classList.toggle("hidden", !isGlobal);

    document.getElementById("sectorViewGroup")?.classList.toggle("hidden", !isSector);
    document.getElementById("sectorFilterInner")?.classList.toggle("hidden", !isSector);
    document.getElementById("sectorContentWrap")?.classList.toggle("hidden", !isSector);

    document.getElementById("macroViewGroup")?.classList.toggle("hidden", !isMacro);
    document.getElementById("macroFilterInner")?.classList.toggle("hidden", !isMacro);
    document.getElementById("macroContentWrap")?.classList.toggle("hidden", !isMacro);

    if (isMacro) {
      document.getElementById("btnViewMacroCards")?.classList.toggle("active", state.macroViewMode === "cards");
      document.getElementById("btnViewMacroTable")?.classList.toggle("active", state.macroViewMode === "table");
      const mSearch = document.getElementById("macroSearchInput");
      if (mSearch && mSearch.value !== state.macroSearchQuery) {
        mSearch.value = state.macroSearchQuery;
      }
    }

    if (isSector) {
      const secState = state.sectorPages[state.currentPage];
      const copy = PAGE_COPY[state.currentPage];

      document.getElementById("btnViewSectorBar")?.classList.toggle("active", secState.viewMode === "bar");
      document.getElementById("btnViewSectorTable")?.classList.toggle("active", secState.viewMode === "table");

      document.getElementById("btnScaleCompressed")?.classList.toggle("active", secState.scaleMode === "compressed");
      document.getElementById("btnScaleLinear")?.classList.toggle("active", secState.scaleMode === "linear");

      const searchEl = document.getElementById("sectorSearchInput");
      if (searchEl) {
        searchEl.placeholder = copy.searchPlaceholder;
        if (searchEl.value !== secState.searchQuery) {
          searchEl.value = secState.searchQuery;
        }
      }

      const thPri = document.getElementById("thSectorPrimaryCap");
      const thSec = document.getElementById("thSectorSecondaryCap");
      if (thPri) thPri.textContent = copy.colPrimary;
      if (thSec) thSec.textContent = copy.colSecondary;
    }
  }

  // Seamless In-Place Page Switcher (eliminates full-page reload flicker)
  function switchPage(targetPage, pushHistory = true) {
    if (!PAGE_COPY[targetPage]) return;
    if (targetPage === state.currentPage) return;

    hideTooltip();
    state.currentPage = targetPage;
    document.body.dataset.page = targetPage;
    document.title = PAGE_COPY[targetPage].docTitle;

    if (pushHistory) {
      try {
        window.history.pushState({ page: targetPage }, "", PAGE_COPY[targetPage].href);
      } catch (_err) {
        // Ignore history restrictions on strict local file:// environments
      }
    }

    syncNavLinkState();
    updateAllViews();
  }

  // Render Shared Header Dates & Copy
  function renderHeaderAndFootnotes() {
    const koDate = formatKoreanDate(state.baseDateObj);
    const copy = PAGE_COPY[state.currentPage];

    const posterDateEl = document.getElementById("posterDateLabel");
    const posterBaseNoteEl = document.getElementById("posterBaseDateNote");
    const syncDateEl = document.getElementById("syncDateLabel");
    const posterSubEl = document.getElementById("posterSubLabel");
    const posterTitleEl = document.getElementById("posterMainTitle");
    const fnPrefixEl = document.getElementById("posterFootnotePrefix");
    const fnSourceEl = document.getElementById("posterFootnoteSource");

    if (posterDateEl) posterDateEl.textContent = koDate;
    if (posterBaseNoteEl) posterBaseNoteEl.textContent = koDate;
    if (syncDateEl && !document.getElementById("syncStatusBadge")?.classList.contains("syncing")) {
      syncDateEl.textContent = `${koDate} 기준`;
    }
    if (posterSubEl) posterSubEl.textContent = copy.kicker;
    if (posterTitleEl) posterTitleEl.textContent = copy.mainTitle;
    if (fnPrefixEl) fnPrefixEl.textContent = copy.footnotePrefix;
    if (fnSourceEl) fnSourceEl.textContent = copy.footnoteSource;
  }

  // =========================================================
  // GLOBAL TOP 50 PAGE LOGIC (index.html)
  // =========================================================
  function getActiveRankedCompanies() {
    return state.companies
      .slice()
      .sort((a, b) => b.marketCapB - a.marketCapB)
      .slice(0, TOP_LIMIT)
      .map((c, idx) => ({ ...c, rank: idx + 1 }));
  }

  function matchesFilterAndSearch(c) {
    if (state.selectedCountries.size > 0 && !state.selectedCountries.has(c.country)) {
      return false;
    }
    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.trim().toLowerCase();
      const hay = `${c.name} ${c.koName} ${c.ticker} ${COUNTRY_META[c.country].ko}`.toLowerCase();
      return hay.includes(q);
    }
    return true;
  }

  function renderCountryControls(ranked) {
    const counts = { ALL: ranked.length };
    ranked.forEach((c) => {
      counts[c.country] = (counts[c.country] || 0) + 1;
    });

    const availableCodes = Object.keys(COUNTRY_META).filter((code) => counts[code] > 0);

    const toggleBtn = document.getElementById("btnToggleCountryMenu");
    const toggleLabel = document.getElementById("countryToggleLabel");
    const chipsWrap = document.getElementById("countryChips");

    const selectedCount = state.selectedCountries.size;
    toggleBtn.setAttribute("aria-expanded", String(state.countryMenuOpen));
    toggleLabel.textContent = selectedCount > 0 ? `국가 선택 (${selectedCount})` : "국가 선택";
    chipsWrap.classList.toggle("hidden", !state.countryMenuOpen);

    const isAllActive = selectedCount === 0;
    const chipItems = [
      {
        code: "ALL",
        label: `전체 (${counts.ALL})`,
        color: "var(--all-swatch)",
        active: isAllActive
      },
      ...availableCodes.map((code) => ({
        code,
        label: `${COUNTRY_META[code].ko} (${counts[code]})`,
        color: COUNTRY_META[code].color,
        active: state.selectedCountries.has(code)
      }))
    ];

    chipsWrap.innerHTML = chipItems
      .map(
        (item) => `<button type="button" class="chip ${item.active ? "active" : ""}" data-country="${item.code}" aria-pressed="${item.active}">
          <span class="chip-swatch" style="background:${item.color}"></span>
          <span>${item.label}</span>
        </button>`
      )
      .join("");

    chipsWrap.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-country");
        if (code === "ALL") {
          state.selectedCountries.clear();
        } else {
          if (state.selectedCountries.has(code)) {
            state.selectedCountries.delete(code);
          } else {
            state.selectedCountries.add(code);
          }
          if (state.selectedCountries.size === availableCodes.length) {
            state.selectedCountries.clear();
          }
        }
        updateAllViews();
      });
    });

    const legendEl = document.getElementById("posterLegend");
    const legendItems = availableCodes.map(
      (code) => `<span class="legend-item">
        <span class="legend-dot" style="background:${COUNTRY_META[code].color}"></span>
        <span>${COUNTRY_META[code].ko} (${counts[code]})</span>
      </span>`
    );
    legendEl.innerHTML = legendItems.join("");
  }

  function renderTreemap(ranked) {
    if (typeof window.d3 === "undefined") return;

    const stage = document.getElementById("treemapStage");
    const usCol = document.getElementById("usColumn");
    const intlCol = document.getElementById("intlColumn");

    const stageWidth = stage.clientWidth || 1140;
    const isMobile = window.innerWidth <= 960;

    const usItems = ranked.filter((c) => c.country === "US");
    const intlItems = ranked.filter((c) => c.country !== "US");

    const usSum = d3.sum(usItems, (d) => d.marketCapB);
    const intlSum = d3.sum(intlItems, (d) => d.marketCapB);
    const totalSum = Math.max(1, usSum + intlSum);

    const gap = 10;
    const totalHeight = 1220;

    let usW;
    let intlW;
    let usH;
    let intlTotalH;

    if (isMobile) {
      usW = stageWidth;
      intlW = stageWidth;
      usH = Math.max(580, Math.round(totalHeight * (usSum / totalSum)));
      intlTotalH = Math.max(320, Math.round(totalHeight * (intlSum / totalSum)) + 120);
    } else {
      const intlRatio = Math.max(0.175, Math.min(0.26, intlSum / totalSum));
      intlW = Math.round((stageWidth - gap) * intlRatio);
      usW = stageWidth - gap - intlW;
      usH = totalHeight;
      intlTotalH = totalHeight;
    }

    usCol.style.width = `${usW}px`;
    usCol.style.height = `${usH}px`;
    intlCol.style.width = `${intlW}px`;
    intlCol.style.minHeight = `${intlTotalH}px`;

    const usFrag = document.createDocumentFragment();
    if (usItems.length > 0) {
      const rootUS = d3
        .hierarchy({ children: usItems })
        .sum((d) => d.marketCapB)
        .sort((a, b) => b.value - a.value);

      d3.treemap().size([usW, usH]).paddingInner(2).round(true).tile(d3.treemapSquarify.ratio(1.12))(rootUS);

      const topUSId = usItems[0].id;
      rootUS.leaves().forEach((leaf) => {
        const el = createTileElement(leaf.data, leaf.x0, leaf.y0, leaf.x1 - leaf.x0, leaf.y1 - leaf.y0, leaf.data.id === topUSId);
        usFrag.appendChild(el);
      });
    }
    usCol.replaceChildren(usFrag);

    const intlFrag = document.createDocumentFragment();
    const countryGroups = d3
      .groups(intlItems, (d) => d.country)
      .sort((a, b) => COUNTRY_META[a[0]].order - COUNTRY_META[b[0]].order);

    const clusterGap = 9;
    const availableIntlH = Math.max(260, intlTotalH - clusterGap * Math.max(0, countryGroups.length - 1));

    const rawHeights = countryGroups.map(([, list]) => {
      const gSum = d3.sum(list, (d) => d.marketCapB);
      return Math.max(82, (gSum / Math.max(1, intlSum)) * availableIntlH);
    });
    const rawSum = d3.sum(rawHeights);
    const normFactor = availableIntlH / Math.max(1, rawSum);

    countryGroups.forEach(([, list], idx) => {
      const cHeight = Math.max(78, Math.round(rawHeights[idx] * normFactor));
      const clusterDiv = document.createElement("div");
      clusterDiv.className = "country-cluster";
      clusterDiv.style.height = `${cHeight}px`;

      const rootC = d3
        .hierarchy({ children: list })
        .sum((d) => d.marketCapB)
        .sort((a, b) => b.value - a.value);

      d3.treemap().size([intlW, cHeight]).paddingInner(2).round(true).tile(d3.treemapSquarify.ratio(1.15))(rootC);

      const leaderId = list[0].id;
      rootC.leaves().forEach((leaf) => {
        const el = createTileElement(leaf.data, leaf.x0, leaf.y0, leaf.x1 - leaf.x0, leaf.y1 - leaf.y0, leaf.data.id === leaderId);
        clusterDiv.appendChild(el);
      });

      intlFrag.appendChild(clusterDiv);
    });
    intlCol.replaceChildren(intlFrag);
  }

  function createTileElement(c, x, y, w, h, showFlag) {
    const div = document.createElement("div");
    const isMatched = matchesFilterAndSearch(c);
    const hasFilter = state.selectedCountries.size > 0 || state.searchQuery.trim() !== "";

    div.className = "company-tile";
    if (hasFilter) {
      div.classList.add(isMatched ? "highlighted" : "dimmed");
    }

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.width = `${Math.max(0, w)}px`;
    div.style.height = `${Math.max(0, h)}px`;
    div.style.backgroundColor = COUNTRY_META[c.country].color;

    const valFontSize = Math.max(11, Math.min(34, Math.round(Math.min(w * 0.16, h * 0.22))));
    const rankFontSize = Math.max(10, Math.min(18, Math.round(Math.min(w * 0.12, h * 0.16))));
    const showMarketCapSub = c.rank === 1 && w > 160 && h > 140;

    const flagSize = Math.max(18, Math.min(40, Math.round(w * 0.16)));
    const flagHTML = showFlag && w > 58 && h > 48 ? `<div class="tile-flag">${getFlagSVG(c.country, flagSize)}</div>` : "";

    div.innerHTML = `
      <div class="tile-val" style="font-size:${valFontSize}px">
        ${formatMarketCapPoster(c.marketCapB)}
        ${showMarketCapSub ? '<span class="tile-val-sub">MARKET CAP</span>' : ""}
      </div>
      ${flagHTML}
      <div class="tile-center">
        ${renderCompanyBrandHTML(c, w, h)}
      </div>
      <div class="tile-rank" style="font-size:${rankFontSize}px">#${c.rank}</div>
    `;

    div.addEventListener("mouseenter", (ev) => showTooltip(ev, c));
    div.addEventListener("mousemove", (ev) => moveTooltip(ev));
    div.addEventListener("mouseleave", hideTooltip);
    div.addEventListener("click", () => openCompanyModal(c));

    return div;
  }

  function showTooltip(ev, c) {
    const tip = document.getElementById("tileTooltip");
    if (!tip) return;
    const chgSign = c.changePct > 0 ? "+" : "";
    tip.innerHTML = `
      <div style="font-weight:800;font-size:13.5px">#${c.rank} ${c.koName} (${c.name})</div>
      <div style="opacity:0.82;font-size:11.5px;margin-bottom:4px">${c.ticker} · ${COUNTRY_META[c.country].ko} · ${c.sector}</div>
      <div>시가총액: <strong>${formatMarketCapExact(c.marketCapB)}</strong></div>
      <div>원화 추정: <strong>${formatKrwEstimate(c.marketCapB, state.usdKrw)}</strong></div>
      <div>일간 변동: <strong>${chgSign}${c.changePct.toFixed(2)}%</strong></div>
    `;
    tip.classList.remove("hidden");
    moveTooltip(ev);
  }

  function moveTooltip(ev) {
    const tip = document.getElementById("tileTooltip");
    if (!tip) return;
    const pad = 14;
    const maxLeft = window.innerWidth - (tip.offsetWidth || 240) - 12;
    const maxTop = window.innerHeight - (tip.offsetHeight || 110) - 12;
    tip.style.left = `${Math.min(maxLeft, ev.clientX + pad)}px`;
    tip.style.top = `${Math.min(maxTop, ev.clientY + pad)}px`;
  }

  function hideTooltip() {
    const tip = document.getElementById("tileTooltip");
    if (tip) tip.classList.add("hidden");
  }

  function renderTable(ranked) {
    const filtered = ranked.filter(matchesFilterAndSearch);

    const totalCapB = filtered.reduce((acc, d) => acc + d.marketCapB, 0);
    const usCount = filtered.filter((d) => d.country === "US").length;
    const krCapB = filtered.filter((d) => d.country === "KR").reduce((acc, d) => acc + d.marketCapB, 0);

    document.getElementById("kpiStrip").innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">표시 기업 합산 시가총액</div>
        <div class="kpi-value">$${(totalCapB / 1000).toFixed(2)}T</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">미국 기업 비중</div>
        <div class="kpi-value">${usCount}개사 (${filtered.length ? Math.round((usCount / filtered.length) * 100) : 0}%)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">대한민국 포함 시총 합계</div>
        <div class="kpi-value">$${(krCapB / 1000).toFixed(2)}T</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">적용 원/달러 환율</div>
        <div class="kpi-value">${state.usdKrw.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}원</div>
      </div>
    `;

    const sorted = filtered.slice().sort((a, b) => {
      const dir = state.sortDir === "asc" ? 1 : -1;
      switch (state.sortKey) {
        case "name":
          return a.koName.localeCompare(b.koName, "ko") * dir;
        case "ticker":
          return a.ticker.localeCompare(b.ticker) * dir;
        case "country":
          return COUNTRY_META[a.country].ko.localeCompare(COUNTRY_META[b.country].ko, "ko") * dir;
        case "marketCapB":
        case "krwCap":
          return (a.marketCapB - b.marketCapB) * dir;
        case "changePct":
          return (a.changePct - b.changePct) * dir;
        case "rank":
        default:
          return (a.rank - b.rank) * dir;
      }
    });

    const tbody = document.getElementById("rankingTableBody");
    tbody.innerHTML = sorted
      .map((c) => {
        const chgClass = c.changePct > 0 ? "chg-up" : c.changePct < 0 ? "chg-down" : "";
        const chgPrefix = c.changePct > 0 ? "+" : "";
        const pillColor = COUNTRY_META[c.country].color;
        return `<tr data-id="${c.id}">
          <td><strong>#${c.rank}</strong></td>
          <td>
            <strong>${c.koName}</strong>
            <span class="company-en-sub">${c.name}</span>
          </td>
          <td>${c.ticker}</td>
          <td><span class="country-pill" style="background:${pillColor}">${COUNTRY_META[c.country].ko}</span></td>
          <td class="num"><strong>${formatMarketCapExact(c.marketCapB)}</strong></td>
          <td class="num">${formatKrwEstimate(c.marketCapB, state.usdKrw)}</td>
          <td class="num ${chgClass}">${chgPrefix}${c.changePct.toFixed(2)}%</td>
          <td><button type="button" class="btn-ghost" style="padding:3px 8px;font-size:11.5px">요약</button></td>
        </tr>`;
      })
      .join("");

    tbody.querySelectorAll("tr").forEach((row) => {
      row.addEventListener("click", () => {
        const target = ranked.find((item) => item.id === row.getAttribute("data-id"));
        if (target) openCompanyModal(target);
      });
    });
  }

  // =========================================================
  // UNIFIED SECTOR PAGE ENGINE (sp500.html & kospi200.html)
  // =========================================================
  function isKrwSectorPage(pageKey = state.currentPage) {
    return pageKey === "kospi200";
  }

  function getSectorPrimaryVal(item, pageKey = state.currentPage) {
    return isKrwSectorPage(pageKey) ? item.marketCapJo : item.marketCapB;
  }

  function formatSectorPrimary(val, pageKey = state.currentPage, exact = false) {
    if (isKrwSectorPage(pageKey)) {
      return formatKrwFromJo(val, false);
    }
    return exact ? formatMarketCapExact(val) : formatMarketCapDetail(val);
  }

  function formatSectorSecondary(val, pageKey = state.currentPage) {
    if (isKrwSectorPage(pageKey)) {
      return formatUsdFromJo(val, state.usdKrw, false);
    }
    return formatKrwEstimate(val, state.usdKrw);
  }

  function formatSectorCompact(val, pageKey = state.currentPage) {
    if (isKrwSectorPage(pageKey)) {
      return formatKrwCompactJo(val);
    }
    return formatMarketCapPoster(val);
  }

  function getRankedSectors(pageKey = state.currentPage) {
    const rawList = pageKey === "kospi200" ? state.kospi200Sectors : state.sp500Sectors;
    const totalVal = Math.max(
      1,
      rawList.reduce((sum, s) => sum + getSectorPrimaryVal(s, pageKey), 0)
    );

    return rawList
      .slice()
      .sort((a, b) => getSectorPrimaryVal(b, pageKey) - getSectorPrimaryVal(a, pageKey))
      .map((s, idx) => {
        const pVal = getSectorPrimaryVal(s, pageKey);
        return {
          ...s,
          primaryVal: pVal,
          rank: idx + 1,
          weightPct: (pVal / totalVal) * 100,
          top3: s.top3
            .slice()
            .sort((a, b) => getSectorPrimaryVal(b, pageKey) - getSectorPrimaryVal(a, pageKey))
            .slice(0, 3)
            .map((c, cIdx) => ({
              ...c,
              primaryVal: getSectorPrimaryVal(c, pageKey),
              isKrwPrimary: isKrwSectorPage(pageKey),
              rank: cIdx + 1,
              color: s.color
            }))
        };
      });
  }

  function matchesSectorSearch(sector, pageKey = state.currentPage) {
    const q = state.sectorPages[pageKey].searchQuery.trim().toLowerCase();
    if (!q) return true;
    const topHay = sector.top3.map((c) => `${c.koName} ${c.name} ${c.ticker}`).join(" ");
    const hay = `${sector.koName} ${sector.enName} ${topHay}`.toLowerCase();
    return hay.includes(q);
  }

  function renderSectorKpis(rankedSectors, pageKey = state.currentPage) {
    const kpiEl = document.getElementById("sectorKpiStrip");
    if (!kpiEl) return;

    const copy = PAGE_COPY[pageKey];
    const totalVal = rankedSectors.reduce((sum, s) => sum + s.primaryVal, 0);
    const totalFirms = rankedSectors.reduce((sum, s) => sum + s.companyCount, 0);
    const leader = rankedSectors[0];
    const upSectors = rankedSectors.filter((s) => s.changePct > 0).length;

    const totalPrimaryStr = isKrwSectorPage(pageKey)
      ? formatKrwFromJo(totalVal, false)
      : `$${(totalVal / 1000).toFixed(2)}T`;
    const totalSecondaryStr = formatSectorSecondary(totalVal, pageKey);

    kpiEl.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">${copy.indexLabel} 합산 시가총액 (${totalFirms}개사)</div>
        <div class="kpi-value">${totalPrimaryStr}</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">${totalSecondaryStr}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">최대 비중 섹터</div>
        <div class="kpi-value">${leader ? `${leader.koName} (${leader.weightPct.toFixed(1)}%)` : "-"}</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">${leader ? formatSectorPrimary(leader.primaryVal, pageKey, false) : ""}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">일간 상승 / 전체 섹터</div>
        <div class="kpi-value">${upSectors} / ${rankedSectors.length}개 섹터</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">${copy.subClassLabel}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">적용 원/달러 환율</div>
        <div class="kpi-value">${state.usdKrw.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}원</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">${isKrwSectorPage(pageKey) ? "달러 환산 추정치 적용" : "원화 환산 추정치 적용"}</div>
      </div>
    `;
  }

  function computeSectorBarWidth(val, maxVal, scaleMode) {
    if (maxVal <= 0) return 0;
    if (scaleMode === "linear") {
      return Math.max(3.5, (val / maxVal) * 100);
    }
    const ratio = val / maxVal;
    const compressed = Math.pow(ratio, 0.54) * 100;
    return Math.max(14, Math.min(100, compressed));
  }

  function renderSectorBars(rankedSectors, pageKey = state.currentPage) {
    const listEl = document.getElementById("sectorBarList");
    const scaleNoteEl = document.getElementById("scaleModeNote");
    const toggleAllBtn = document.getElementById("btnToggleAllAccordions");
    if (!listEl) return;

    const secState = state.sectorPages[pageKey];
    const filtered = rankedSectors.filter((s) => matchesSectorSearch(s, pageKey));
    const maxVal = rankedSectors[0]?.primaryVal || 1;
    const secondVal = rankedSectors[1]?.primaryVal || maxVal;

    if (scaleNoteEl) {
      scaleNoteEl.textContent =
        secState.scaleMode === "compressed"
          ? "※ 초대형 섹터 편중 완화를 위해 막대 길이가 완만하게 보정(≈)되어 표시됩니다."
          : "※ 각 막대 길이가 실제 시가총액에 100% 정비례하여 표시됩니다.";
    }

    const allExpanded =
      filtered.length > 0 && filtered.every((s) => secState.expandedSectors.has(s.id));
    if (toggleAllBtn) {
      toggleAllBtn.textContent = allExpanded ? "Top 3 전체 접기" : "Top 3 전체 펼치기";
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="kpi-card" style="text-align:center;padding:28px;color:var(--ink-muted)">검색 조건에 일치하는 섹터나 Top 3 기업이 없습니다.</div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((s) => {
        const isExpanded = secState.expandedSectors.has(s.id) || secState.searchQuery.trim() !== "";
        const widthPct = computeSectorBarWidth(s.primaryVal, maxVal, secState.scaleMode);
        const isOversizedBreak =
          secState.scaleMode === "compressed" && s.primaryVal > secondVal * 1.65;
        const chgClass = s.changePct > 0 ? "chg-up" : s.changePct < 0 ? "chg-down" : "";
        const chgSign = s.changePct > 0 ? "+" : "";

        const top3CardsHTML = s.top3
          .map((c, idx) => {
            const cChgClass = c.changePct > 0 ? "chg-up" : c.changePct < 0 ? "chg-down" : "";
            const cChgSign = c.changePct > 0 ? "+" : "";
            const shareInSector = ((c.primaryVal / Math.max(0.1, s.primaryVal)) * 100).toFixed(1);
            const displayTicker = c.ticker.replace(".KS", "");
            return `
              <div class="top3-card" data-sector-id="${s.id}" data-company-id="${c.id}" role="button" tabindex="0" aria-label="${c.koName} 상세 브리핑 열기">
                <div class="top3-card-top">
                  <span class="top3-medal" style="background:${s.color}">TOP ${idx + 1}</span>
                  <span class="top3-ticker">${displayTicker}</span>
                </div>
                <div class="top3-name">${c.koName}<span>${c.name}</span></div>
                <div class="top3-cap-row">
                  <span class="top3-cap-usd">${formatSectorPrimary(c.primaryVal, pageKey, true)}</span>
                  <span class="top3-cap-krw">${formatSectorSecondary(c.primaryVal, pageKey)}</span>
                </div>
                <div class="top3-sub-row">
                  <span>섹터 내 비중 <strong>${shareInSector}%</strong></span>
                  <span class="${cChgClass}">${cChgSign}${c.changePct.toFixed(2)}% · 상세 &rsaquo;</span>
                </div>
              </div>
            `;
          })
          .join("");

        return `
          <div class="sector-item ${isExpanded ? "expanded" : ""}" data-sector-id="${s.id}">
            <button type="button" class="sector-bar-trigger" aria-expanded="${isExpanded}">
              <div class="sector-bar-header">
                <div class="sector-title-group">
                  <span class="sector-rank-badge">#${s.rank}</span>
                  <span class="sector-ko-name">${s.koName}</span>
                  <span class="sector-en-name">${s.enName}</span>
                  <span class="sector-count-pill">${s.companyCount}개사</span>
                </div>
                <div class="sector-metrics-inline">
                  <span class="sector-usd-val">${formatSectorPrimary(s.primaryVal, pageKey, false)}</span>
                  <span class="sector-krw-val">${formatSectorSecondary(s.primaryVal, pageKey)}</span>
                  <span class="sector-weight-badge">비중 ${s.weightPct.toFixed(1)}%</span>
                  <span class="sector-chg-val ${chgClass}">${chgSign}${s.changePct.toFixed(2)}%</span>
                  <svg class="sector-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <div class="sector-bar-track">
                <div class="sector-bar-fill ${isOversizedBreak ? "compressed-break" : ""}" style="width:${widthPct.toFixed(2)}%;background:${s.color}">
                  <span>${s.weightPct.toFixed(1)}%</span>
                </div>
              </div>
            </button>

            <div class="sector-accordion-body ${isExpanded ? "" : "hidden"}">
              <div class="top3-heading">
                <span>${s.koName} 섹터 시가총액 Top 3 대표 기업</span>
                <span>카드를 클릭하면 기업 핵심 요약이 열립니다</span>
              </div>
              <div class="top3-grid">
                ${top3CardsHTML}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll(".sector-bar-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const parent = btn.closest(".sector-item");
        const sectorId = parent.getAttribute("data-sector-id");
        if (secState.expandedSectors.has(sectorId)) {
          secState.expandedSectors.delete(sectorId);
        } else {
          secState.expandedSectors.add(sectorId);
        }
        renderSectorBars(rankedSectors, pageKey);
      });
    });

    listEl.querySelectorAll(".top3-card").forEach((card) => {
      const openCardModal = () => {
        const sId = card.getAttribute("data-sector-id");
        const cId = card.getAttribute("data-company-id");
        const sec = rankedSectors.find((item) => item.id === sId);
        const comp = sec?.top3.find((item) => item.id === cId);
        if (comp) openCompanyModal(comp);
      };
      card.addEventListener("click", openCardModal);
      card.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openCardModal();
        }
      });
    });
  }

  function renderSectorTable(rankedSectors, pageKey = state.currentPage) {
    const tbody = document.getElementById("sectorTableBody");
    if (!tbody) return;

    const secState = state.sectorPages[pageKey];
    const filtered = rankedSectors.filter((s) => matchesSectorSearch(s, pageKey));
    const sorted = filtered.slice().sort((a, b) => {
      const dir = secState.sortDir === "asc" ? 1 : -1;
      switch (secState.sortKey) {
        case "name":
          return a.koName.localeCompare(b.koName, "ko") * dir;
        case "count":
          return (a.companyCount - b.companyCount) * dir;
        case "primaryCap":
        case "secondaryCap":
        case "weightPct":
          return (a.primaryVal - b.primaryVal) * dir;
        case "changePct":
          return (a.changePct - b.changePct) * dir;
        case "rank":
        default:
          return (a.rank - b.rank) * dir;
      }
    });

    tbody.innerHTML = sorted
      .map((s) => {
        const chgClass = s.changePct > 0 ? "chg-up" : s.changePct < 0 ? "chg-down" : "";
        const chgPrefix = s.changePct > 0 ? "+" : "";
        const top3Pills = s.top3
          .map(
            (c, idx) =>
              `<button type="button" class="top3-mini-pill" data-sector-id="${s.id}" data-company-id="${c.id}" title="${c.koName} (${formatSectorPrimary(c.primaryVal, pageKey, true)}) 브리핑 보기">
                <span style="color:${s.color};font-weight:900">${idx + 1}.</span> ${c.koName} <span style="color:var(--ink-muted);font-weight:600">(${formatSectorCompact(c.primaryVal, pageKey)})</span>
              </button>`
          )
          .join("");

        return `<tr data-sector-row="${s.id}">
          <td><strong>#${s.rank}</strong></td>
          <td>
            <span class="country-pill" style="background:${s.color};margin-right:6px">${s.koName}</span>
            <span class="company-en-sub">${s.enName}</span>
          </td>
          <td class="num">${s.companyCount}개</td>
          <td class="num"><strong>${formatSectorPrimary(s.primaryVal, pageKey, false)}</strong></td>
          <td class="num">${formatSectorSecondary(s.primaryVal, pageKey)}</td>
          <td class="num"><strong>${s.weightPct.toFixed(2)}%</strong></td>
          <td class="num ${chgClass}">${chgPrefix}${s.changePct.toFixed(2)}%</td>
          <td><div class="top3-inline-pills">${top3Pills}</div></td>
        </tr>`;
      })
      .join("");

    tbody.querySelectorAll(".top3-mini-pill").forEach((pill) => {
      pill.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const sId = pill.getAttribute("data-sector-id");
        const cId = pill.getAttribute("data-company-id");
        const sec = rankedSectors.find((item) => item.id === sId);
        const comp = sec?.top3.find((item) => item.id === cId);
        if (comp) openCompanyModal(comp);
      });
    });

    tbody.querySelectorAll("tr[data-sector-row]").forEach((row) => {
      row.addEventListener("click", () => {
        const sId = row.getAttribute("data-sector-row");
        secState.expandedSectors.add(sId);
        secState.viewMode = "bar";
        document.getElementById("btnViewSectorBar")?.classList.add("active");
        document.getElementById("btnViewSectorTable")?.classList.remove("active");
        updateAllViews();
      });
    });
  }

  // =========================================================
  // US & KR ECONOMIC INDICATORS PAGE ENGINE (macro.html)
  // =========================================================
  function getEffectiveMacroIndicators() {
    return state.macroIndicators.map((m, idx) => {
      if (m.id === "fx_rate") {
        const krStr = `${state.usdKrw.toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}원`;
        return { ...m, order: idx, krDisplay: krStr, krNum: state.usdKrw };
      }
      return { ...m, order: idx };
    });
  }

  function matchesMacroFilter(m) {
    if (state.macroCategory !== "ALL" && m.category !== state.macroCategory) {
      return false;
    }
    const q = state.macroSearchQuery.trim().toLowerCase();
    if (!q) return true;
    const catKo = MACRO_CATEGORIES[m.category]?.ko || "";
    const hay = `${m.koName} ${m.enName} ${catKo} ${m.usSource} ${m.krSource} ${m.gapText}`.toLowerCase();
    return hay.includes(q);
  }

  function renderMacroCategoryChips(allItems) {
    const wrap = document.getElementById("macroCategoryChips");
    if (!wrap) return;

    const counts = { ALL: allItems.length };
    allItems.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });

    wrap.innerHTML = Object.keys(MACRO_CATEGORIES)
      .map((catKey) => {
        const meta = MACRO_CATEGORIES[catKey];
        const active = state.macroCategory === catKey;
        return `<button type="button" class="chip ${active ? "active" : ""}" data-macro-cat="${catKey}" aria-pressed="${active}">
          <span class="chip-swatch" style="background:${meta.color}"></span>
          <span>${meta.ko} (${counts[catKey] || 0})</span>
        </button>`;
      })
      .join("");

    wrap.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-macro-cat");
        state.macroCategory = state.macroCategory === key && key !== "ALL" ? "ALL" : key;
        updateAllViews();
      });
    });
  }

  function renderMacroKpis(allItems) {
    const kpiEl = document.getElementById("macroKpiStrip");
    if (!kpiEl) return;

    const byId = new Map(allItems.map((m) => [m.id, m]));
    const pol = byId.get("policy_rate");
    const b10 = byId.get("bond_10y");
    const cpi = byId.get("cpi");
    const fx = byId.get("fx_rate");

    const polSpreadBp = pol ? Math.round((pol.usNum - pol.krNum) * 100) : 150;
    const b10SpreadBp = b10 ? Math.round((b10.usNum - b10.krNum) * 100) : 140;

    kpiEl.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">한·미 기준금리 (미 / 한)</div>
        <div class="kpi-value">${pol ? `${pol.usDisplay} / ${pol.krDisplay}` : "-"}</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">금리 격차 ${polSpreadBp >= 0 ? "+" : ""}${polSpreadBp}bp</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">국채 10년물 금리 (미 / 한)</div>
        <div class="kpi-value">${b10 ? `${b10.usDisplay} / ${b10.krDisplay}` : "-"}</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">장기물 격차 ${b10SpreadBp >= 0 ? "+" : ""}${b10SpreadBp}bp</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">소비자물가 CPI (미 / 한)</div>
        <div class="kpi-value">${cpi ? `${cpi.usDisplay} / ${cpi.krDisplay}` : "-"}</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">전년동월비 (YoY) 기준</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">원/달러 환율 · 달러인덱스</div>
        <div class="kpi-value">${fx ? fx.krDisplay : "-"}</div>
        <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px">DXY ${fx ? fx.usDisplay : "-"}</div>
      </div>
    `;
  }

  function getDirClass(dir) {
    if (dir === "up") return "chg-up";
    if (dir === "down") return "chg-down";
    return "";
  }

  function renderMacroCards(allItems) {
    const listEl = document.getElementById("macroCardList");
    if (!listEl) return;

    const filtered = allItems.filter(matchesMacroFilter);
    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="kpi-card" style="text-align:center;padding:28px;color:var(--ink-muted)">검색 조건에 일치하는 거시지표가 없습니다.</div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((m) => {
        const catMeta = MACRO_CATEGORIES[m.category] || MACRO_CATEGORIES.rates;
        const usChgCls = getDirClass(m.usDir);
        const krChgCls = getDirClass(m.krDir);

        let usBarPct = 62;
        let krBarPct = 58;
        if (m.scaleMax > 0) {
          usBarPct = Math.max(8, Math.min(100, (Math.abs(m.usNum) / m.scaleMax) * 100));
          krBarPct = Math.max(8, Math.min(100, (Math.abs(m.krNum) / m.scaleMax) * 100));
        }

        return `
          <div class="macro-item-card" data-macro-id="${m.id}" role="button" tabindex="0" aria-label="${m.koName} 상세 해설 보기">
            <div class="macro-card-head">
              <div class="macro-title-wrap">
                <span class="macro-cat-pill" style="background:${catMeta.color}">${catMeta.ko}</span>
                <span class="macro-ko-title">${m.koName}</span>
                <span class="macro-en-title">${m.enName}</span>
              </div>
              <div class="macro-gap-badge">
                <span>${m.gapText}</span>
                <span style="color:var(--ink-muted);font-weight:700">해설 &rsaquo;</span>
              </div>
            </div>

            <div class="macro-compare-grid">
              <div class="macro-country-box us-box">
                <div class="macro-country-top">
                  <span class="macro-country-name">${getFlagSVG("US", 22)} <span>미국 (US)</span></span>
                  <span class="macro-period-tag">${m.usSource} · ${m.usPeriod}</span>
                </div>
                <div class="macro-val-row">
                  <span class="macro-main-val">${m.usDisplay}</span>
                  <span class="macro-chg-chip ${usChgCls}">${m.usChange}</span>
                </div>
                <div class="macro-mini-bar">
                  <div class="macro-mini-fill" style="width:${usBarPct.toFixed(1)}%;background:var(--c-us)"></div>
                </div>
              </div>

              <div class="macro-country-box kr-box">
                <div class="macro-country-top">
                  <span class="macro-country-name">${getFlagSVG("KR", 22)} <span>대한민국 (KR)</span></span>
                  <span class="macro-period-tag">${m.krSource} · ${m.krPeriod}</span>
                </div>
                <div class="macro-val-row">
                  <span class="macro-main-val">${m.krDisplay}</span>
                  <span class="macro-chg-chip ${krChgCls}">${m.krChange}</span>
                </div>
                <div class="macro-mini-bar">
                  <div class="macro-mini-fill" style="width:${krBarPct.toFixed(1)}%;background:var(--c-kr)"></div>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll(".macro-item-card").forEach((card) => {
      const openHandler = () => {
        const id = card.getAttribute("data-macro-id");
        const target = allItems.find((item) => item.id === id);
        if (target) openMacroModal(target);
      };
      card.addEventListener("click", openHandler);
      card.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openHandler();
        }
      });
    });
  }

  function renderMacroTable(allItems) {
    const tbody = document.getElementById("macroTableBody");
    if (!tbody) return;

    const filtered = allItems.filter(matchesMacroFilter);
    const sorted = filtered.slice().sort((a, b) => {
      const dir = state.macroSortDir === "asc" ? 1 : -1;
      switch (state.macroSortKey) {
        case "category":
          return a.category.localeCompare(b.category) * dir;
        case "name":
          return a.koName.localeCompare(b.koName, "ko") * dir;
        case "usVal":
          return (a.usNum - b.usNum) * dir;
        case "krVal":
          return (a.krNum - b.krNum) * dir;
        default:
          return (a.order - b.order) * dir;
      }
    });

    tbody.innerHTML = sorted
      .map((m) => {
        const catMeta = MACRO_CATEGORIES[m.category] || MACRO_CATEGORIES.rates;
        const usChgCls = getDirClass(m.usDir);
        const krChgCls = getDirClass(m.krDir);
        return `<tr data-macro-row="${m.id}">
          <td><span class="country-pill" style="background:${catMeta.color}">${catMeta.ko}</span></td>
          <td>
            <strong>${m.koName}</strong>
            <span class="company-en-sub">${m.enName}</span>
          </td>
          <td class="num"><strong>${m.usDisplay}</strong></td>
          <td class="num ${usChgCls}">${m.usChange}</td>
          <td class="num"><strong>${m.krDisplay}</strong></td>
          <td class="num ${krChgCls}">${m.krChange}</td>
          <td>${m.gapText}</td>
          <td style="font-size:12px;color:var(--ink-muted)">${m.usSource} / ${m.krSource}</td>
          <td><button type="button" class="btn-ghost" style="padding:3px 8px;font-size:11.5px">요약</button></td>
        </tr>`;
      })
      .join("");

    tbody.querySelectorAll("tr[data-macro-row]").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-macro-row");
        const target = allItems.find((item) => item.id === id);
        if (target) openMacroModal(target);
      });
    });
  }

  function openMacroModal(item) {
    state.activeMacroObj = item;
    state.activeCompanyObj = null;

    const catMeta = MACRO_CATEGORIES[item.category] || MACRO_CATEGORIES.rates;
    document.getElementById("modalHeaderBadge").innerHTML = `
      <span class="country-pill" style="background:${catMeta.color}">${catMeta.ko}</span>
      <span class="chip" style="cursor:default">미국(US) vs 대한민국(KR) 거시지표</span>
    `;
    document.getElementById("modalCompanyTitle").textContent = `${item.koName} (${item.enName})`;
    document.getElementById("modalCompanySub").textContent = `발표 기관: 미국 ${item.usSource} · 한국 ${item.krSource} | 조회 기준일: ${formatKoreanDate(state.baseDateObj)}`;

    document.getElementById("modalMetricsGrid").innerHTML = `
      <div class="metric-box">
        <span>미국 (US) 현재치</span>
        <strong>${item.usDisplay} <span style="font-size:12.5px;font-weight:700;color:var(--ink-muted)">(${item.usChange})</span></strong>
      </div>
      <div class="metric-box">
        <span>대한민국 (KR) 현재치</span>
        <strong>${item.krDisplay} <span style="font-size:12.5px;font-weight:700;color:var(--ink-muted)">(${item.krChange})</span></strong>
      </div>
      <div class="metric-box">
        <span>한·미 격차 및 흐름</span>
        <strong style="font-size:14.5px">${item.gapText}</strong>
      </div>
      <div class="metric-box">
        <span>세부 기준</span>
        <strong style="font-size:13.5px">${item.usPeriod}</strong>
      </div>
    `;

    const headingEl = document.getElementById("modalBriefingHeading");
    if (headingEl) headingEl.textContent = "지표 핵심 해설";

    document.getElementById("modalBriefingContent").textContent = item.summary;
    document.getElementById("companyModal").classList.remove("hidden");
  }

  // =========================================================
  // SHARED COMPANY BRIEFING MODAL & AUTO-SYNC ENGINE
  // =========================================================
  function openCompanyModal(company) {
    state.activeCompanyObj = company;
    state.activeMacroObj = null;
    const headingEl = document.getElementById("modalBriefingHeading");
    if (headingEl) headingEl.textContent = "기업 핵심 요약";
    const countryMeta = COUNTRY_META[company.country] || COUNTRY_META.US;
    const pillColor = company.color || countryMeta.color;
    const rankLabel =
      state.currentPage === "global" ? `글로벌 #${company.rank}위` : `섹터 내 #${company.rank}위`;

    document.getElementById("modalHeaderBadge").innerHTML = `
      <span class="country-pill" style="background:${pillColor}">${countryMeta.ko}</span>
      <span class="chip" style="cursor:default">${rankLabel} · ${company.sector}</span>
    `;
    document.getElementById("modalCompanyTitle").textContent = `${company.koName} (${company.name})`;
    document.getElementById("modalCompanySub").textContent = `종목코드/티커: ${company.ticker} | 기준일: ${formatKoreanDate(state.baseDateObj)}`;

    const chgSign = company.changePct > 0 ? "+" : "";
    let capMetricsHTML;

    if (company.isKrwPrimary) {
      capMetricsHTML = `
        <div class="metric-box">
          <span>원화 시가총액</span>
          <strong>${formatKrwFromJo(company.marketCapJo, false)}</strong>
        </div>
        <div class="metric-box">
          <span>달러 환산 추정치</span>
          <strong>${formatUsdFromJo(company.marketCapJo, state.usdKrw, true)}</strong>
        </div>
      `;
    } else {
      capMetricsHTML = `
        <div class="metric-box">
          <span>달러 시가총액</span>
          <strong>${formatMarketCapExact(company.marketCapB)}</strong>
        </div>
        <div class="metric-box">
          <span>원화 환산 추정치</span>
          <strong>${formatKrwEstimate(company.marketCapB, state.usdKrw)}</strong>
        </div>
      `;
    }

    document.getElementById("modalMetricsGrid").innerHTML = `
      ${capMetricsHTML}
      <div class="metric-box">
        <span>일간 주가 등락률</span>
        <strong>${chgSign}${company.changePct.toFixed(2)}%</strong>
      </div>
      <div class="metric-box">
        <span>상태 구분</span>
        <strong>정식 상장 거래 중</strong>
      </div>
    `;

    document.getElementById("modalBriefingContent").textContent = company.summary;
    document.getElementById("companyModal").classList.remove("hidden");
  }

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    const banner = document.getElementById("toastBanner");
    if (!banner) return;
    banner.textContent = msg;
    banner.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      banner.classList.add("hidden");
    }, 4500);
  }

  // Master Render Orchestrator
  function updateAllViews() {
    renderHeaderAndFootnotes();

    if (state.currentPage === "macro") {
      const allMacro = getEffectiveMacroIndicators();
      renderMacroCategoryChips(allMacro);
      renderMacroKpis(allMacro);

      const cardsSec = document.getElementById("macroCardsView");
      const tblSec = document.getElementById("macroTableView");

      if (state.macroViewMode === "cards") {
        cardsSec?.classList.remove("hidden");
        tblSec?.classList.add("hidden");
        renderMacroCards(allMacro);
      } else {
        cardsSec?.classList.add("hidden");
        tblSec?.classList.remove("hidden");
        renderMacroTable(allMacro);
      }
      return;
    }

    if (state.currentPage === "sp500" || state.currentPage === "kospi200") {
      const pageKey = state.currentPage;
      const secState = state.sectorPages[pageKey];
      const rankedSectors = getRankedSectors(pageKey);
      renderSectorKpis(rankedSectors, pageKey);

      const barSec = document.getElementById("sectorBarView");
      const tblSec = document.getElementById("sectorTableView");

      if (secState.viewMode === "bar") {
        barSec?.classList.remove("hidden");
        tblSec?.classList.add("hidden");
        renderSectorBars(rankedSectors, pageKey);
      } else {
        barSec?.classList.add("hidden");
        tblSec?.classList.remove("hidden");
        renderSectorTable(rankedSectors, pageKey);
      }
      return;
    }

    // Global Top 50 Page
    const ranked = getActiveRankedCompanies();
    renderCountryControls(ranked);

    const treemapSec = document.getElementById("treemapView");
    const tableSec = document.getElementById("tableView");

    if (state.viewMode === "poster") {
      treemapSec.classList.remove("hidden");
      tableSec.classList.add("hidden");
      renderTreemap(ranked);
    } else {
      treemapSec.classList.add("hidden");
      tableSec.classList.remove("hidden");
      renderTable(ranked);
    }
  }

  // Event Listeners Binding
  function bindEvents() {
    // Top Page Navigation (Seamless instant switch + disabled self-link)
    ["navGlobal", "navSp500", "navKospi200", "navMacro"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", (ev) => {
        const targetPage = ev.currentTarget.getAttribute("data-target-page");
        if (!targetPage || targetPage === state.currentPage) {
          ev.preventDefault();
          return;
        }
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
          return;
        }
        ev.preventDefault();
        switchPage(targetPage, true);
      });
    });

    window.addEventListener("popstate", (ev) => {
      const statePage = ev.state?.page;
      if (statePage && PAGE_COPY[statePage]) {
        switchPage(statePage, false);
      } else if (window.location.pathname.endsWith("sp500.html")) {
        switchPage("sp500", false);
      } else if (window.location.pathname.endsWith("kospi200.html")) {
        switchPage("kospi200", false);
      } else if (window.location.pathname.endsWith("macro.html")) {
        switchPage("macro", false);
      } else {
        switchPage("global", false);
      }
    });

    // Dark Mode Toggle
    document.getElementById("btnThemeToggle")?.addEventListener("click", () => {
      const nextDark = !state.darkMode;
      applyTheme(nextDark, true);
      safeSetStorage("VC_THEME_MODE", nextDark ? "dark" : "light");
    });

    // Global Page Controls
    document.getElementById("btnViewPoster")?.addEventListener("click", () => {
      state.viewMode = "poster";
      document.getElementById("btnViewPoster")?.classList.add("active");
      document.getElementById("btnViewTable")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnViewTable")?.addEventListener("click", () => {
      state.viewMode = "table";
      document.getElementById("btnViewTable")?.classList.add("active");
      document.getElementById("btnViewPoster")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnToggleCountryMenu")?.addEventListener("click", () => {
      state.countryMenuOpen = !state.countryMenuOpen;
      safeSetStorage("VC_COUNTRY_MENU_OPEN", String(state.countryMenuOpen));
      renderCountryControls(getActiveRankedCompanies());
    });

    document.getElementById("searchInput")?.addEventListener("input", (ev) => {
      state.searchQuery = ev.target.value || "";
      updateAllViews();
    });

    document.querySelectorAll("#rankingTable thead th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort");
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = key === "marketCapB" || key === "krwCap" || key === "changePct" ? "desc" : "asc";
        }
        updateAllViews();
      });
    });

    // Sector Pages Controls (S&P 500 & KOSPI 200)
    document.getElementById("btnViewSectorBar")?.addEventListener("click", () => {
      if (state.currentPage === "global") return;
      state.sectorPages[state.currentPage].viewMode = "bar";
      document.getElementById("btnViewSectorBar")?.classList.add("active");
      document.getElementById("btnViewSectorTable")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnViewSectorTable")?.addEventListener("click", () => {
      if (state.currentPage === "global") return;
      state.sectorPages[state.currentPage].viewMode = "table";
      document.getElementById("btnViewSectorTable")?.classList.add("active");
      document.getElementById("btnViewSectorBar")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnScaleCompressed")?.addEventListener("click", () => {
      if (state.currentPage === "global") return;
      state.sectorPages[state.currentPage].scaleMode = "compressed";
      document.getElementById("btnScaleCompressed")?.classList.add("active");
      document.getElementById("btnScaleLinear")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnScaleLinear")?.addEventListener("click", () => {
      if (state.currentPage === "global") return;
      state.sectorPages[state.currentPage].scaleMode = "linear";
      document.getElementById("btnScaleLinear")?.classList.add("active");
      document.getElementById("btnScaleCompressed")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnToggleAllAccordions")?.addEventListener("click", () => {
      if (state.currentPage === "global") return;
      const pageKey = state.currentPage;
      const secState = state.sectorPages[pageKey];
      const ranked = getRankedSectors(pageKey).filter((s) => matchesSectorSearch(s, pageKey));
      const allOpen = ranked.length > 0 && ranked.every((s) => secState.expandedSectors.has(s.id));

      if (allOpen) {
        secState.expandedSectors.clear();
      } else {
        ranked.forEach((s) => secState.expandedSectors.add(s.id));
      }

      if (secState.viewMode !== "bar") {
        secState.viewMode = "bar";
        document.getElementById("btnViewSectorBar")?.classList.add("active");
        document.getElementById("btnViewSectorTable")?.classList.remove("active");
      }
      updateAllViews();
    });

    document.getElementById("sectorSearchInput")?.addEventListener("input", (ev) => {
      if (state.currentPage === "global") return;
      state.sectorPages[state.currentPage].searchQuery = ev.target.value || "";
      updateAllViews();
    });

    document.querySelectorAll("#sectorTable thead th[data-sector-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        if (state.currentPage === "global") return;
        const secState = state.sectorPages[state.currentPage];
        const key = th.getAttribute("data-sector-sort");
        if (secState.sortKey === key) {
          secState.sortDir = secState.sortDir === "asc" ? "desc" : "asc";
        } else {
          secState.sortKey = key;
          secState.sortDir =
            key === "primaryCap" || key === "secondaryCap" || key === "weightPct" || key === "changePct" || key === "count"
              ? "desc"
              : "asc";
        }
        updateAllViews();
      });
    });

    // Macro Page Controls
    document.getElementById("btnViewMacroCards")?.addEventListener("click", () => {
      state.macroViewMode = "cards";
      document.getElementById("btnViewMacroCards")?.classList.add("active");
      document.getElementById("btnViewMacroTable")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnViewMacroTable")?.addEventListener("click", () => {
      state.macroViewMode = "table";
      document.getElementById("btnViewMacroTable")?.classList.add("active");
      document.getElementById("btnViewMacroCards")?.classList.remove("active");
      updateAllViews();
    });

    document.getElementById("macroSearchInput")?.addEventListener("input", (ev) => {
      state.macroSearchQuery = ev.target.value || "";
      updateAllViews();
    });

    document.querySelectorAll("#macroTable thead th[data-macro-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-macro-sort");
        if (state.macroSortKey === key) {
          state.macroSortDir = state.macroSortDir === "asc" ? "desc" : "asc";
        } else {
          state.macroSortKey = key;
          state.macroSortDir = key === "usVal" || key === "krVal" ? "desc" : "asc";
        }
        updateAllViews();
      });
    });

    // Modals & Resize
    document.getElementById("btnCloseModal")?.addEventListener("click", () => {
      document.getElementById("companyModal")?.classList.add("hidden");
    });
    document.getElementById("companyModal")?.addEventListener("click", (ev) => {
      if (ev.target.id === "companyModal") {
        document.getElementById("companyModal")?.classList.add("hidden");
      }
    });

    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        document.getElementById("companyModal")?.classList.add("hidden");
      }
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (state.currentPage === "global" && state.viewMode === "poster") {
          renderTreemap(getActiveRankedCompanies());
        }
      }, 150);
    });
  }

  // Initialize App on DOM Ready
  function init() {
    loadInitialPreferences();
    syncNavLinkState();

    if (state.currentPage === "global" && typeof window.d3 === "undefined") {
      showToast("D3.js 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
    }

    try {
      window.history.replaceState({ page: state.currentPage }, "", window.location.href);
    } catch (_e) {
      // Ignore on strict file://
    }

    bindEvents();
    updateAllViews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
