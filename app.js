(() => {
  "use strict";

  // Country Configuration
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

  const IPO_COLOR = "#D97A54";
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
    { id: "anthropic", name: "Anthropic", koName: "앤스로픽", ticker: "ANT", country: "US", marketCapB: 1400.0, changePct: 0.0, sector: "생성형 AI 모델", isIPO: true, summary: "수정 증권신고서(S-1/A) 공모 희망가 상단(78달러) 기준 완전희석 기업가치 1.4조 달러를 기록한 엔터프라이즈 AI 선두주자." },
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

  // Application State
  const state = {
    companies: INITIAL_COMPANIES.map((c) => ({ ...c })),
    usdKrw: DEFAULT_USD_KRW,
    topLimit: 50,
    viewMode: "poster",
    includeAnthropic: true,
    countryFilter: "ALL",
    searchQuery: "",
    sortKey: "rank",
    sortDir: "asc",
    activeCompanyId: null,
    baseDateObj: new Date()
  };

  // Safe Storage Helpers (guards against file:// strict security settings)
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

  // Date Formatters (Korean YYYY년 M월 D일 & ISO YYYY-MM-DD)
  function getTodayISO(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatKoreanDate(d = new Date()) {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  // Number Formatters
  function formatMarketCapPoster(capB, isIPO) {
    const suffix = isIPO ? "*" : "";
    if (capB >= 1000) {
      return `$${(capB / 1000).toFixed(1)}T${suffix}`;
    }
    return `$${Math.round(capB)}B${suffix}`;
  }

  function formatMarketCapDetail(capB, isIPO) {
    const suffix = isIPO ? " (공모가 상단)" : "";
    if (capB >= 1000) {
      return `$${(capB / 1000).toFixed(3)}T${suffix}`;
    }
    return `$${capB.toFixed(2)}B${suffix}`;
  }

  function formatKrwEstimate(capB, usdKrw) {
    const jo = (capB * usdKrw) / 1000; // 1B USD * 1400 KRW = 1.4조 원
    if (jo >= 10000) {
      const gyeong = Math.floor(jo / 10000);
      const remJo = Math.round(jo % 10000);
      return `약 ${gyeong}경 ${remJo.toLocaleString("ko-KR")}조 원`;
    }
    return `약 ${Math.round(jo).toLocaleString("ko-KR")}조 원`;
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

  // Compute Filtered & Ranked List
  function getActiveRankedCompanies() {
    const pool = state.companies
      .filter((c) => (state.includeAnthropic ? true : !c.isIPO))
      .slice()
      .sort((a, b) => b.marketCapB - a.marketCapB)
      .slice(0, state.topLimit)
      .map((c, idx) => ({ ...c, rank: idx + 1 }));

    return pool;
  }

  function matchesFilterAndSearch(c) {
    if (state.countryFilter !== "ALL" && c.country !== state.countryFilter) {
      return false;
    }
    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.trim().toLowerCase();
      const hay = `${c.name} ${c.koName} ${c.ticker} ${COUNTRY_META[c.country].ko}`.toLowerCase();
      return hay.includes(q);
    }
    return true;
  }

  // Render Header Dates & Labels in Korean
  function renderHeaderAndFootnotes() {
    const koDate = formatKoreanDate(state.baseDateObj);
    document.getElementById("posterDateLabel").textContent = koDate;
    document.getElementById("posterBaseDateNote").textContent = koDate;
    document.getElementById("syncDateLabel").textContent = `${koDate} 기준`;
    document.getElementById("posterSubLabel").textContent = `전 세계 상위 ${state.topLimit}대 기업`;

    const fnEl = document.getElementById("footnoteAnthropic");
    if (state.includeAnthropic) {
      fnEl.classList.remove("hidden");
    } else {
      fnEl.classList.add("hidden");
    }
  }

  // Render Country Filter Chips & Legend
  function renderCountryControls(ranked) {
    const counts = { ALL: ranked.length };
    ranked.forEach((c) => {
      counts[c.country] = (counts[c.country] || 0) + 1;
    });

    const chipsWrap = document.getElementById("countryChips");
    const chipItems = [
      { code: "ALL", label: `전체 (${counts.ALL})`, color: "#141414" },
      ...Object.keys(COUNTRY_META)
        .filter((code) => counts[code] > 0)
        .map((code) => ({
          code,
          label: `${COUNTRY_META[code].ko} (${counts[code]})`,
          color: COUNTRY_META[code].color
        }))
    ];

    chipsWrap.innerHTML = chipItems
      .map(
        (item) => `<button type="button" class="chip ${state.countryFilter === item.code ? "active" : ""}" data-country="${item.code}">
          <span class="chip-swatch" style="background:${item.color}"></span>
          <span>${item.label}</span>
        </button>`
      )
      .join("");

    chipsWrap.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.countryFilter = btn.getAttribute("data-country");
        updateAllViews();
      });
    });

    // Legend
    const legendEl = document.getElementById("posterLegend");
    const legendItems = Object.keys(COUNTRY_META)
      .filter((code) => counts[code] > 0)
      .map(
        (code) => `<span class="legend-item">
          <span class="legend-dot" style="background:${COUNTRY_META[code].color}"></span>
          <span>${COUNTRY_META[code].ko} (${counts[code]})</span>
        </span>`
      );
    if (state.includeAnthropic && ranked.some((c) => c.isIPO)) {
      legendItems.push(
        `<span class="legend-item"><span class="legend-dot" style="background:${IPO_COLOR}"></span><span>공모 희망가 상단 기준 (비상장*)</span></span>`
      );
    }
    legendEl.innerHTML = legendItems.join("");
  }

  // Render Asymmetric D3 Squarified Treemap
  function renderTreemap(ranked) {
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
    const totalHeight = state.topLimit === 30 ? 960 : 1220;

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

    // Render US Column
    usCol.innerHTML = "";
    if (usItems.length > 0) {
      const rootUS = d3
        .hierarchy({ children: usItems })
        .sum((d) => d.marketCapB)
        .sort((a, b) => b.value - a.value);

      d3.treemap().size([usW, usH]).paddingInner(2).round(true).tile(d3.treemapSquarify.ratio(1.12))(rootUS);

      const topUSId = usItems[0].id;
      rootUS.leaves().forEach((leaf) => {
        const el = createTileElement(leaf.data, leaf.x0, leaf.y0, leaf.x1 - leaf.x0, leaf.y1 - leaf.y0, leaf.data.id === topUSId);
        usCol.appendChild(el);
      });
    }

    // Group International Countries by Visual Capitalist Reference Order
    intlCol.innerHTML = "";
    const countryGroups = d3
      .groups(intlItems, (d) => d.country)
      .sort((a, b) => COUNTRY_META[a[0]].order - COUNTRY_META[b[0]].order);

    const clusterGap = 9;
    const availableIntlH = Math.max(260, intlTotalH - clusterGap * Math.max(0, countryGroups.length - 1));

    // Combine small single-tile European clusters if needed or give proportional height with readable floor
    const rawHeights = countryGroups.map(([, list]) => {
      const gSum = d3.sum(list, (d) => d.marketCapB);
      return Math.max(82, (gSum / Math.max(1, intlSum)) * availableIntlH);
    });
    const rawSum = d3.sum(rawHeights);
    const normFactor = availableIntlH / Math.max(1, rawSum);

    countryGroups.forEach(([countryCode, list], idx) => {
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

      intlCol.appendChild(clusterDiv);
    });
  }

  function createTileElement(c, x, y, w, h, showFlag) {
    const div = document.createElement("div");
    const isMatched = matchesFilterAndSearch(c);
    const hasFilter = state.countryFilter !== "ALL" || state.searchQuery.trim() !== "";

    div.className = "company-tile";
    if (hasFilter) {
      div.classList.add(isMatched ? "highlighted" : "dimmed");
    }

    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.width = `${Math.max(0, w)}px`;
    div.style.height = `${Math.max(0, h)}px`;
    div.style.backgroundColor = c.isIPO ? IPO_COLOR : COUNTRY_META[c.country].color;

    const valFontSize = Math.max(11, Math.min(34, Math.round(Math.min(w * 0.16, h * 0.22))));
    const rankFontSize = Math.max(10, Math.min(18, Math.round(Math.min(w * 0.12, h * 0.16))));
    const showMarketCapSub = c.rank === 1 && w > 160 && h > 140;

    const flagSize = Math.max(18, Math.min(40, Math.round(w * 0.16)));
    const flagHTML = showFlag && w > 58 && h > 48 ? `<div class="tile-flag">${getFlagSVG(c.country, flagSize)}</div>` : "";

    div.innerHTML = `
      <div class="tile-val" style="font-size:${valFontSize}px">
        ${formatMarketCapPoster(c.marketCapB, c.isIPO)}
        ${showMarketCapSub ? '<span class="tile-val-sub">MARKET CAP</span>' : ""}
      </div>
      ${flagHTML}
      <div class="tile-center">
        ${renderCompanyBrandHTML(c, w, h)}
      </div>
      <div class="tile-rank" style="font-size:${rankFontSize}px">#${c.rank}</div>
    `;

    // Hover Tooltip Events
    div.addEventListener("mouseenter", (ev) => showTooltip(ev, c));
    div.addEventListener("mousemove", (ev) => moveTooltip(ev));
    div.addEventListener("mouseleave", hideTooltip);
    div.addEventListener("click", () => openCompanyModal(c));

    return div;
  }

  // Tooltip Logic
  function showTooltip(ev, c) {
    const tip = document.getElementById("tileTooltip");
    const chgSign = c.changePct > 0 ? "+" : "";
    tip.innerHTML = `
      <div style="font-weight:800;font-size:13.5px">#${c.rank} ${c.koName} (${c.name})</div>
      <div style="opacity:0.82;font-size:11.5px;margin-bottom:4px">${c.ticker} · ${COUNTRY_META[c.country].ko} · ${c.sector}</div>
      <div>시가총액: <strong>${formatMarketCapDetail(c.marketCapB, c.isIPO)}</strong></div>
      <div>원화 추정: <strong>${formatKrwEstimate(c.marketCapB, state.usdKrw)}</strong></div>
      <div>일간 변동: <strong>${chgSign}${c.changePct.toFixed(2)}%</strong></div>
    `;
    tip.classList.remove("hidden");
    moveTooltip(ev);
  }

  function moveTooltip(ev) {
    const tip = document.getElementById("tileTooltip");
    const pad = 14;
    const maxLeft = window.innerWidth - (tip.offsetWidth || 240) - 12;
    const maxTop = window.innerHeight - (tip.offsetHeight || 110) - 12;
    tip.style.left = `${Math.min(maxLeft, ev.clientX + pad)}px`;
    tip.style.top = `${Math.min(maxTop, ev.clientY + pad)}px`;
  }

  function hideTooltip() {
    document.getElementById("tileTooltip").classList.add("hidden");
  }

  // Render Detailed Ranking Table & KPIs
  function renderTable(ranked) {
    const filtered = ranked.filter(matchesFilterAndSearch);

    const totalCapB = d3.sum(filtered, (d) => d.marketCapB);
    const usCount = filtered.filter((d) => d.country === "US").length;
    const krCapB = d3.sum(filtered.filter((d) => d.country === "KR"), (d) => d.marketCapB);

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
        const pillColor = c.isIPO ? IPO_COLOR : COUNTRY_META[c.country].color;
        return `<tr data-id="${c.id}">
          <td><strong>#${c.rank}</strong></td>
          <td>
            <strong>${c.koName}</strong>
            <span style="color:#666;font-size:12px;margin-left:4px">${c.name}${c.isIPO ? "*" : ""}</span>
          </td>
          <td>${c.ticker}</td>
          <td><span class="country-pill" style="background:${pillColor}">${COUNTRY_META[c.country].ko}</span></td>
          <td class="num"><strong>${formatMarketCapDetail(c.marketCapB, false)}</strong></td>
          <td class="num">${formatKrwEstimate(c.marketCapB, state.usdKrw)}</td>
          <td class="num ${chgClass}">${chgPrefix}${c.changePct.toFixed(2)}%</td>
          <td><button type="button" class="btn-ghost" style="padding:3px 8px;font-size:11.5px">브리핑</button></td>
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

  // Modal & Live AI Briefing
  function openCompanyModal(company) {
    state.activeCompanyId = company.id;
    const pillColor = company.isIPO ? IPO_COLOR : COUNTRY_META[company.country].color;
    document.getElementById("modalHeaderBadge").innerHTML = `
      <span class="country-pill" style="background:${pillColor}">${COUNTRY_META[company.country].ko}</span>
      <span class="chip" style="cursor:default">#${company.rank}위 · ${company.sector}</span>
    `;
    document.getElementById("modalCompanyTitle").textContent = `${company.koName} (${company.name})`;
    document.getElementById("modalCompanySub").textContent = `티커: ${company.ticker} | 기준일: ${formatKoreanDate(state.baseDateObj)}`;

    const chgSign = company.changePct > 0 ? "+" : "";
    document.getElementById("modalMetricsGrid").innerHTML = `
      <div class="metric-box">
        <span>달러 시가총액</span>
        <strong>${formatMarketCapDetail(company.marketCapB, company.isIPO)}</strong>
      </div>
      <div class="metric-box">
        <span>원화 환산 추정치</span>
        <strong>${formatKrwEstimate(company.marketCapB, state.usdKrw)}</strong>
      </div>
      <div class="metric-box">
        <span>일간 주가 등락률</span>
        <strong>${chgSign}${company.changePct.toFixed(2)}%</strong>
      </div>
      <div class="metric-box">
        <span>상태 구분</span>
        <strong>${company.isIPO ? "공모가 상단 기준(S-1/A)" : "정식 상장 거래 중"}</strong>
      </div>
    `;

    document.getElementById("modalBriefingContent").textContent = company.summary;
    document.getElementById("companyModal").classList.remove("hidden");
  }

  async function fetchCompanyLiveBriefing() {
    const ranked = getActiveRankedCompanies();
    const company = ranked.find((c) => c.id === state.activeCompanyId);
    if (!company) return;

    const apiKey = safeGetStorage("VC_GEMINI_API_KEY") || "";
    const contentEl = document.getElementById("modalBriefingContent");
    const btn = document.getElementById("btnFetchBriefing");

    if (!apiKey) {
      contentEl.innerHTML = `${company.summary}<br><br><span style="color:#57544E;font-size:12px">※ 상단 [API 설정]에 Gemini API 키를 등록하면 Google 실시간 검색 기반 당일 뉴스 브리핑을 불러옵니다.</span>`;
      return;
    }

    btn.disabled = true;
    btn.textContent = "조회 중...";
    contentEl.textContent = `${formatKoreanDate(new Date())} 기준 ${company.koName}(${company.ticker})의 최신 시가총액 변동 요인과 주요 공시·뉴스를 검색하고 있습니다...`;

    try {
      const prompt = `${formatKoreanDate(new Date())} 기준 ${company.koName} (${company.name}, 티커 ${company.ticker})의 최신 시가총액 동향과 최근 주가 변동 핵심 요인을 한국어 3문장 이내로 간결하게 요약해줘.`;
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }]
          })
        }
      );

      if (!resp.ok) {
        throw new Error(`API 응답 오류 (${resp.status})`);
      }

      const data = await resp.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
        company.summary;
      contentEl.textContent = text.trim();
    } catch (err) {
      contentEl.textContent = `${company.summary} (실시간 검색 호출 실패: ${err.message})`;
    } finally {
      btn.disabled = false;
      btn.textContent = "실시간 AI 이슈 조회";
    }
  }

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    const banner = document.getElementById("toastBanner");
    banner.textContent = msg;
    banner.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      banner.classList.add("hidden");
    }, 4500);
  }

  // Daily Market Cap Auto-Sync Engine
  async function syncDailyMarketCap(forceNetwork = false) {
    const todayISO = getTodayISO(new Date());
    const cacheKey = `VC_MARKETCAP_CACHE_${todayISO}`;
    const badge = document.getElementById("syncStatusBadge");
    const spinner = document.getElementById("syncSpinner");
    const syncBtn = document.getElementById("btnSyncLive");

    if (!forceNetwork) {
      const cachedRaw = safeGetStorage(cacheKey);
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          applySyncedPayload(parsed, new Date());
          return;
        } catch (_e) {
          // Ignore malformed cache
        }
      }
    }

    const apiKey = safeGetStorage("VC_GEMINI_API_KEY") || "";
    state.baseDateObj = new Date();
    renderHeaderAndFootnotes();

    if (!apiKey) {
      if (forceNetwork) {
        showToast(
          `${formatKoreanDate(state.baseDateObj)} 기준 내장 최신 시가총액 데이터를 적용했습니다. (실시간 웹 검색 연동은 상단 [API 설정]에서 키 등록 시 활성화)`
        );
      }
      updateAllViews();
      return;
    }

    badge.classList.add("syncing");
    spinner.classList.add("spinning");
    syncBtn.disabled = true;

    try {
      const tickerList = state.companies.map((c) => `${c.id}:${c.ticker}`).join(", ");
      const prompt = `오늘(${formatKoreanDate(new Date())}) 기준 글로벌 주요 상장사의 최신 시가총액(단위: 십억 달러, Billions USD), 일간 등락률(%), 그리고 원/달러(USD/KRW) 환율을 Google 검색으로 확인하여 아래 JSON 형식으로만 응답해줘. 마크다운 코드블록 없이 순수 JSON만 반환해:
{"usdKrw": 1398.5, "items": [{"id": "apple", "marketCapB": 5097.0, "changePct": -1.12}]}
대상 기업 목록(id:ticker): ${tickerList}`;

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }]
          })
        }
      );

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("유효한 JSON 응답을 파싱할 수 없습니다.");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      applySyncedPayload(parsed, new Date());
      safeSetStorage(cacheKey, JSON.stringify(parsed));
      showToast(`${formatKoreanDate(state.baseDateObj)} 실시간 글로벌 시가총액 및 환율 동기화가 완료되었습니다.`);
    } catch (err) {
      showToast(`실시간 동기화 중 기본 데이터를 유지합니다 (${err.message}).`);
      updateAllViews();
    } finally {
      badge.classList.remove("syncing");
      spinner.classList.remove("spinning");
      syncBtn.disabled = false;
    }
  }

  function applySyncedPayload(payload, dateObj) {
    if (payload && typeof payload.usdKrw === "number" && payload.usdKrw > 800) {
      state.usdKrw = payload.usdKrw;
    }
    if (payload && Array.isArray(payload.items)) {
      const map = new Map(payload.items.map((item) => [item.id, item]));
      state.companies = state.companies.map((c) => {
        const hit = map.get(c.id);
        if (!hit) return c;
        return {
          ...c,
          marketCapB: typeof hit.marketCapB === "number" && hit.marketCapB > 50 ? hit.marketCapB : c.marketCapB,
          changePct: typeof hit.changePct === "number" ? hit.changePct : c.changePct
        };
      });
    }
    state.baseDateObj = dateObj;
    updateAllViews();
  }

  // Master Render Orchestrator
  function updateAllViews() {
    renderHeaderAndFootnotes();
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
    document.getElementById("btnTop30").addEventListener("click", () => {
      state.topLimit = 30;
      document.getElementById("btnTop30").classList.add("active");
      document.getElementById("btnTop50").classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnTop50").addEventListener("click", () => {
      state.topLimit = 50;
      document.getElementById("btnTop50").classList.add("active");
      document.getElementById("btnTop30").classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnViewPoster").addEventListener("click", () => {
      state.viewMode = "poster";
      document.getElementById("btnViewPoster").classList.add("active");
      document.getElementById("btnViewTable").classList.remove("active");
      updateAllViews();
    });

    document.getElementById("btnViewTable").addEventListener("click", () => {
      state.viewMode = "table";
      document.getElementById("btnViewTable").classList.add("active");
      document.getElementById("btnViewPoster").classList.remove("active");
      updateAllViews();
    });

    document.getElementById("toggleAnthropic").addEventListener("change", (ev) => {
      state.includeAnthropic = ev.target.checked;
      updateAllViews();
    });

    document.getElementById("searchInput").addEventListener("input", (ev) => {
      state.searchQuery = ev.target.value || "";
      updateAllViews();
    });

    document.getElementById("btnSyncLive").addEventListener("click", () => {
      syncDailyMarketCap(true);
    });

    // Table Sorting
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

    // Company Modal Events
    document.getElementById("btnCloseModal").addEventListener("click", () => {
      document.getElementById("companyModal").classList.add("hidden");
    });
    document.getElementById("companyModal").addEventListener("click", (ev) => {
      if (ev.target.id === "companyModal") {
        document.getElementById("companyModal").classList.add("hidden");
      }
    });
    document.getElementById("btnFetchBriefing").addEventListener("click", fetchCompanyLiveBriefing);

    // API Modal Events
    document.getElementById("btnApiConfig").addEventListener("click", () => {
      document.getElementById("apiKeyInput").value = safeGetStorage("VC_GEMINI_API_KEY") || "";
      document.getElementById("apiModal").classList.remove("hidden");
    });
    document.getElementById("btnCloseApiModal").addEventListener("click", () => {
      document.getElementById("apiModal").classList.add("hidden");
    });
    document.getElementById("apiModal").addEventListener("click", (ev) => {
      if (ev.target.id === "apiModal") {
        document.getElementById("apiModal").classList.add("hidden");
      }
    });
    document.getElementById("btnSaveApiKey").addEventListener("click", () => {
      const val = document.getElementById("apiKeyInput").value.trim();
      if (val) {
        safeSetStorage("VC_GEMINI_API_KEY", val);
        showToast("Gemini API 키가 저장되었습니다. [오늘 실시간 시총 동기화] 버튼을 눌러 최신 시세를 반영하세요.");
      }
      document.getElementById("apiModal").classList.add("hidden");
    });
    document.getElementById("btnClearApiKey").addEventListener("click", () => {
      safeRemoveStorage("VC_GEMINI_API_KEY");
      document.getElementById("apiKeyInput").value = "";
      showToast("저장된 API 키가 삭제되었습니다.");
    });

    // Keyboard Escape closes modals
    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        document.getElementById("companyModal").classList.add("hidden");
        document.getElementById("apiModal").classList.add("hidden");
      }
    });

    // Debounced Window Resize
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (state.viewMode === "poster") {
          renderTreemap(getActiveRankedCompanies());
        }
      }, 150);
    });
  }

  // Initialize App on DOM Ready
  function init() {
    if (typeof window.d3 === "undefined") {
      showToast("D3.js 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
      return;
    }
    bindEvents();
    updateAllViews();
    syncDailyMarketCap(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
