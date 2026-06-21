import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Check,
  Info,
  SearchX,
  ExternalLink,
  Sparkles,
  Phone,
  Globe,
  MapPin,
  ArrowLeft,
  FileDown,
  Sparkle,
  QrCode,
  HeartPulse,
  LayoutGrid
} from 'lucide-react';
import { COMPLAINT_CARDS, CATEGORIES } from './data';
import { ComplaintCard, SavedChecklist } from './types';

// 공통 공고 및 안내 텍스트 상수 정의로 중복 최소화
const NOTICE_DISCLAIMER = "본 안내는 방문 전 참고 정보입니다. 실제 신청 가능 여부, 필요 서류, 처리 절차는 관련 법령 개정이나 개별 사안에 따라 달라질 수 있으니, 정확한 사항은 근로복지공단 공식 채널(1588-0075, comwel.or.kr) 또는 관할 지사를 통해 다시 확인하시기 바랍니다.";
const SERVICE_INTRO_TEXT = "본 서비스는 이용자의 개인정보를 전혀 수집하거나 저장하지 않는 근로복지공단 서울동부지사 전용 방문 안내 자가진단 편의 도구입니다.";

const getOnlineLink = (card: ComplaintCard) => {
  return 'https://www.comwel.or.kr/comwel/main.jsp';
};

const getFormLink = (card: ComplaintCard) => {
  return 'https://www.comwel.or.kr/comwel/main.jsp';
};

export default function App() {
  // 상세 보기 상태: null이면 메설 목록(혹은 포스터), cardId가 채워지면 해당 서비스 정밀 가이드 화면
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // 체크리스트 상태 (기본 구비서류)
  const [checklist, setChecklist] = useState<SavedChecklist>(() => {
    try {
      const saved = localStorage.getItem('qr-guide-checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 방문 전 자가 진단 체크리스트 상태
  const [preChecklistState, setPreChecklistState] = useState<{ [key: string]: { [idx: number]: boolean } }>(() => {
    try {
      const saved = localStorage.getItem('qr-guide-pre-checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('qr-guide-checklist', JSON.stringify(checklist));
    } catch (e) {
      console.warn('LocalStorage 동기화 실패', e);
    }
  }, [checklist]);

  useEffect(() => {
    try {
      localStorage.setItem('qr-guide-pre-checklist', JSON.stringify(preChecklistState));
    } catch (e) {
      console.warn('LocalStorage 동기화 실패 (사전체크)', e);
    }
  }, [preChecklistState]);

  // 임시 토스트 알림창 기동
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 체크 이력 토글 공통 핸들러 (중복 코드 완벽 해소)
  const toggleCheckedState = (
    setState: React.Dispatch<React.SetStateAction<SavedChecklist>>,
    cardId: string,
    index: number
  ) => {
    setState(prev => {
      const cardChecked = prev[cardId] ? { ...prev[cardId] } : {};
      cardChecked[index] = !cardChecked[index];
      return {
        ...prev,
        [cardId]: cardChecked
      };
    });
  };

  const toggleDocChecked = (cardId: string, index: number) => {
    toggleCheckedState(setChecklist, cardId, index);
  };

  const togglePreChecked = (cardId: string, index: number) => {
    toggleCheckedState(setPreChecklistState, cardId, index);
  };

  // 카드별 모든 체크 이력 일괄 초기화
  const resetCardChecklist = (cardId: string) => {
    setChecklist(prev => {
      const updated = { ...prev };
      delete updated[cardId];
      return updated;
    });
    setPreChecklistState(prev => {
      const updated = { ...prev };
      delete updated[cardId];
      return updated;
    });
    triggerToast('해당 민원의 준비 서류 및 자가 자격 체크 이력을 초기화했습니다.');
  };

  // 진척률 및 지참 완료 백분율 수립 공통 공식 (중복 연산 및 속성 제거)
  const getProgress = (checkedObj: { [idx: number]: boolean } = {}, total: number) => {
    const checkedCount = Object.values(checkedObj).filter(Boolean).length;
    return {
      total,
      checkedCount,
      percentage: total > 0 ? Math.round((checkedCount / total) * 100) : 0,
      isAllDone: checkedCount === total && total > 0
    };
  };

  // 필수서류 준비 상태 분석
  const getPreparedStatus = (card: ComplaintCard) => {
    return getProgress(checklist[card.id], card.requiredDocs.length);
  };

  // 사전 체크리스트 자가진단 상태 분석
  const getPreCheckStatus = (card: ComplaintCard) => {
    return getProgress(preChecklistState[card.id], card.preChecklist.length);
  };

  // 카테고리별 민원 리스트를 메모이징하여 효율성과 유지보수성 최적화
  const categorizedCards = useMemo(() => {
    const groups: { [key: string]: ComplaintCard[] } = {};
    COMPLAINT_CARDS.forEach(card => {
      if (!groups[card.category]) {
        groups[card.category] = [];
      }
      groups[card.category].push(card);
    });
    return groups;
  }, []);

  // 현재 열려 있는 세부 내용 조회
  const activeCard = useMemo(() => {
    if (!selectedCardId) return null;
    return COMPLAINT_CARDS.find(c => c.id === selectedCardId) || null;
  }, [selectedCardId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenDetail = (id: string) => {
    setSelectedCardId(id);
    scrollToTop();
  };

  const handleBackToList = () => {
    setSelectedCardId(null);
    scrollToTop();
  };



  return (
    <div className="min-h-screen bg-[#FAF7F2] selection:bg-[#F3EFE6] selection:text-[#514339] flex flex-col font-sans transition-all duration-300 antialiased">
      
      {/* 1. 상단 글로벌 네비게이션 */}
      <nav className="sticky top-0 z-40 w-full border-b border-[#E2E8F0]/85 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-[#033C77] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-[#0F294A] leading-none">방문 전 QR 길잡이</h1>
              <span className="text-[10px] font-bold text-[#005BAC] tracking-tight block mt-1">근로복지공단 서울동부지사 방문 전 참고 안내</span>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1.5 text-[10px] sm:text-xs font-black text-[#005BAC] border border-sky-100 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#0D9488] shrink-0" />
              고객용 방문 안내
            </span>
          </div>
        </div>
      </nav>

      {/* 2. 메인 컨텐츠 영역 */}
      <AnimatePresence mode="wait">
        {!activeCard ? (
          /* ========================================================
             CASE A: 전체 목록 및 대시보드 화면
             ======================================================== */
          <motion.div
            key="list-layout-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col"
          >
            {/* 고품격 비주얼 히어로 배너 (업로드 이미지 전량 고화소 복제형) */}
            <header className="px-4 pt-6 pb-6 text-center sm:px-6 shrink-0 max-w-4xl mx-auto w-full">
              <div className="bg-gradient-to-br from-[#0A2540] via-[#0D3A66] to-[#0A192F] rounded-[24px] sm:rounded-[32px] p-6 sm:p-12 text-center text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center border border-[#1E3E62]">
                {/* 비주얼 오버레이 */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_top_right,rgba(0,91,172,0.15),transparent_70%)] pointer-events-none" />

                {/* 태그라인 배지 */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-white border border-white/20 mb-5 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  근로복지공단 서울동부지사
                </div>

                {/* 메인 헤드라인 */}
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight select-none">
                  방문 전 QR 길잡이
                </h2>

                {/* 하단 점검 권고 슬로건 */}
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-white bg-white/5 border border-white/10 px-4.5 py-2.5 rounded-xl shadow-3xs">
                  <span>💡</span>
                  <span>사전에 준비서류를 점검하시면 접수 및 처리과정이 신속히 이루어 집니다.</span>
                </div>
              </div>
            </header>

            {/* 메인 콘텐츠 바디 */}
            <main className="mx-auto w-full max-w-4xl px-4 pb-14 flex-1">
              
              <div className="bg-[#FCFAF7] border-2 border-[#EBE3D3] rounded-[24px] p-4.5 sm:p-9 shadow-lg relative overflow-hidden">
                {/* 상단 기하학 모서리 프레임 장식 */}
                <div className="absolute top-2 left-2 right-2 bottom-2 border border-[#E9E1D0]/60 pointer-events-none rounded-[18px]" />
                <div className="absolute top-[18px] left-[18px] text-[#C0B49F] text-xs font-serif select-none hidden sm:block">COMWEL</div>
                <div className="absolute top-[18px] right-[18px] text-[#C0B49F] text-xs font-serif select-none hidden sm:block">설명 대조판</div>

                <div className="space-y-8 relative z-10">
                      
                      {/* 2단 앙상블 리포트 그리드 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 text-left">
                        
                        {/* LEFT COLUMN: 1. 자주찾는 민원 | 2. 재활보상 | 3. 복지지원 사업 */}
                        <div className="space-y-8">
                          
                          {/* 1) 자주 찾는 민원 */}
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2 border-b border-[#E3DAC8] pb-1.5">
                              <span className="h-5.5 w-5.5 rounded-md bg-[#FAF2EA] text-[#A66E38] border border-[#F2DECE] flex items-center justify-center text-xs font-serif font-black">1</span>
                              <h3 className="text-base sm:text-lg font-bold text-brand-brown font-serif">자주 찾는 민원</h3>
                              <span className="text-[10px] text-brand-brown-light font-serif italic ml-auto uppercase tracking-wide">Most Requested Services</span>
                            </div>

                            <div className="space-y-2">
                              {(categorizedCards['자주 찾는 민원'] || []).map((card, index) => {
                                return (
                                  <button
                                    key={card.id}
                                    onClick={() => handleOpenDetail(card.id)}
                                    className="w-full text-left p-3 rounded-xl border border-transparent hover:border-[#EDE5DA] hover:bg-[#FAF6EE] transition-all group flex items-start gap-2.5"
                                  >
                                    <div className="h-6 w-6 rounded-full border border-[#D9CEB5] flex items-center justify-center text-xs font-bold text-brand-brown shrink-0 bg-[#FAF8F5] group-hover:bg-[#514339] group-hover:text-white transition-colors">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-baseline justify-between gap-1.5">
                                        <h4 className="text-xs sm:text-sm font-extrabold text-[#33251E] group-hover:text-brand-brown-light transition-colors truncate">
                                          {card.title}
                                        </h4>
                                        <span className={`text-[10px] font-black shrink-0 ${card.target === '사업주' ? 'text-[#3E6346]' : 'text-[#A66E38]'}`}>
                                          [{card.target}]
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#8C7667] leading-relaxed truncate">
                                        {card.tagLine}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2) 재활보상 */}
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2 border-b border-[#E3DAC8] pb-1.5">
                              <span className="h-5.5 w-5.5 rounded-md bg-[#FAF2EA] text-[#A66E38] border border-[#F2DECE] flex items-center justify-center text-xs font-serif font-black">2</span>
                              <h3 className="text-base sm:text-lg font-bold text-brand-brown font-serif">재활보상</h3>
                              <span className="text-[10px] text-brand-brown-light font-serif italic ml-auto uppercase tracking-wide">Rehabilitation & Compensation</span>
                            </div>

                            <div className="space-y-2">
                              {(categorizedCards['재활보상'] || []).map((card, index) => {
                                return (
                                  <button
                                    key={card.id}
                                    onClick={() => handleOpenDetail(card.id)}
                                    className="w-full text-left p-3 rounded-xl border border-transparent hover:border-[#EDE5DA] hover:bg-[#FAF6EE] transition-all group flex items-start gap-2.5"
                                  >
                                    <div className="h-6 w-6 rounded-full border border-[#D9CEB5] flex items-center justify-center text-xs font-bold text-brand-brown shrink-0 bg-[#FAF8F5] group-hover:bg-[#514339] group-hover:text-white transition-colors">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-baseline justify-between gap-1.5">
                                        <h4 className="text-xs sm:text-sm font-extrabold text-[#33251E] group-hover:text-brand-brown-light transition-colors truncate">
                                          {card.title}
                                        </h4>
                                        <span className={`text-[10px] font-black shrink-0 ${card.target === '사업주' ? 'text-[#3E6346]' : card.target === '유족' ? 'text-purple-700' : 'text-[#A66E38]'}`}>
                                          [{card.target}]
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#8C7667] leading-relaxed truncate">
                                        {card.tagLine}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 3) 복지·지원 사업 */}
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2 border-b border-[#E3DAC8] pb-1.5">
                              <span className="h-5.5 w-5.5 rounded-md bg-[#FAF2EA] text-[#A66E38] border border-[#F2DECE] flex items-center justify-center text-xs font-serif font-black">3</span>
                              <h3 className="text-base sm:text-lg font-bold text-brand-brown font-serif">복지·지원 사업</h3>
                              <span className="text-[10px] text-brand-brown-light font-serif italic ml-auto uppercase tracking-wide">Welfare Support</span>
                            </div>

                            <div className="space-y-2">
                              {(categorizedCards['복지·지원 사업'] || []).map((card, index) => {
                                return (
                                  <button
                                    key={card.id}
                                    onClick={() => handleOpenDetail(card.id)}
                                    className="w-full text-left p-3 rounded-xl border border-transparent hover:border-[#EDE5DA] hover:bg-[#FAF6EE] transition-all group flex items-start gap-2.5"
                                  >
                                    <div className="h-6 w-6 rounded-full border border-[#D9CEB5] flex items-center justify-center text-xs font-bold text-brand-brown shrink-0 bg-[#FAF8F5] group-hover:bg-[#514339] group-hover:text-white transition-colors">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-baseline justify-between gap-1.5">
                                        <h4 className="text-xs sm:text-sm font-extrabold text-[#33251E] group-hover:text-brand-brown-light transition-colors truncate">
                                          {card.title}
                                        </h4>
                                        <span className="text-[10px] font-black text-[#A66E38] shrink-0">
                                          [{card.target}]
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#8C7667] leading-relaxed truncate">
                                        {card.tagLine}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* RIGHT COLUMN: 4. 가입지원 | 5. 민원처리 안내 | 6. 안내 메모 */}
                        <div className="space-y-8">
                          
                          {/* 4) 가입지원 */}
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2 border-b border-[#E3DAC8] pb-1.5">
                              <span className="h-5.5 w-5.5 rounded-md bg-[#FAF2EA] text-[#A66E38] border border-[#F2DECE] flex items-center justify-center text-xs font-serif font-black">4</span>
                              <h3 className="text-base sm:text-lg font-bold text-brand-brown font-serif">가입지원</h3>
                              <span className="text-[10px] text-brand-brown-light font-serif italic ml-auto uppercase tracking-wide">Enrollment Support</span>
                            </div>

                            <div className="space-y-2">
                              {(categorizedCards['가입지원'] || []).map((card, index) => {
                                return (
                                  <button
                                    key={card.id}
                                    onClick={() => handleOpenDetail(card.id)}
                                    className="w-full text-left p-3 rounded-xl border border-transparent hover:border-[#EDE5DA] hover:bg-[#FAF6EE] transition-all group flex items-start gap-2.5"
                                  >
                                    <div className="h-6 w-6 rounded-full border border-[#D9CEB5] flex items-center justify-center text-xs font-bold text-brand-brown shrink-0 bg-[#FAF8F5] group-hover:bg-[#514339] group-hover:text-white transition-colors">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-baseline justify-between gap-1.5">
                                        <h4 className="text-xs sm:text-sm font-extrabold text-[#33251E] group-hover:text-brand-brown-light transition-colors truncate">
                                          {card.title}
                                        </h4>
                                        <span className="text-[10px] font-black text-[#3E6346] shrink-0">
                                          [{card.target}]
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#8C7667] leading-relaxed truncate">
                                        {card.tagLine}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 5) 민원 처리 안내 */}
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2 border-b border-[#E3DAC8] pb-1.5">
                              <span className="h-5.5 w-5.5 rounded-md bg-[#FAF2EA] text-[#A66E38] border border-[#F2DECE] flex items-center justify-center text-xs font-serif font-black">5</span>
                              <h3 className="text-base sm:text-lg font-bold text-brand-brown font-serif">민원 처리 안내</h3>
                              <span className="text-[10px] text-brand-brown-light font-serif italic ml-auto uppercase tracking-wide">Service Process</span>
                            </div>

                            <div className="bg-white border border-[#EBE3D3] rounded-2xl p-4.5 space-y-4 relative overflow-hidden">
                              {/* 세로 대시 타임라인 선 */}
                              <div className="absolute top-[28px] bottom-[32px] left-[25px] w-[1px] border-l border-dashed border-[#C0B49F]" />
                              
                              {[
                                { step: '①', label: '서비스 접속', sub: '사전 준비를 위한 자가 진단 서비스 접속' },
                                { step: '②', label: '민원 선택', sub: '원하는 업무를 선택하여 확인' },
                                { step: '③', label: '준비서류 확인', sub: '필요 서류와 처리 대상을 사전 점검' },
                                { step: '④', label: '창구 상담', sub: '준비 후 방문하여 신속하게 상담' }
                              ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start relative z-10">
                                  <div className="h-6 w-6 rounded-full bg-[#FAF5EC] border border-[#D9CEB5] flex items-center justify-center text-xs font-serif font-bold text-brand-brown shrink-0 mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <div className="text-left leading-normal">
                                    <h4 className="text-xs sm:text-sm font-extrabold text-[#33251E]">
                                      {item.label}
                                    </h4>
                                    <p className="text-[11px] text-[#8C7667] font-medium">
                                      {item.sub}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 6) 안내 메모 */}
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2 border-b border-[#E3DAC8] pb-1.5">
                              <span className="h-5.5 w-5.5 rounded-md bg-[#FAF2EA] text-[#A66E38] border border-[#F2DECE] flex items-center justify-center text-xs font-serif font-black">6</span>
                              <h3 className="text-base sm:text-lg font-bold text-brand-brown font-serif">안내 메모</h3>
                              <span className="text-[10px] text-brand-brown-light font-serif italic ml-auto uppercase tracking-wide">Quick Notes</span>
                            </div>

                            <div className="bg-[#FAF5EC] border border-[#E9DDC2] rounded-2xl p-4.5 text-left leading-normal">
                              <ul className="space-y-2.5 text-xs font-semibold text-[#5C4D41]">
                                <li className="flex gap-2 items-start">
                                  <span className="text-[10px] text-brand-accent mt-0.5 select-none">•</span>
                                  <span>세부 준비서류는 업무별로 달라질 수 있습니다.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                  <span className="text-[10px] text-brand-accent mt-0.5 select-none">•</span>
                                  <span>온라인 신고 가능 업무는 공단홈페이지를 이용하세요.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                  <span className="text-[10px] text-brand-accent mt-0.5 select-none">•</span>
                                  <span>방문 전 최신 안내를 반드시 확인하세요.</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* 하단 공인 장식 및 라벨링 */}
                      <div className="pt-6 border-t border-[#EBE3D3] flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-[#C0B49F] text-xs">
                          <span className="text-[10px]">◆</span>
                          <span className="font-serif">문의 및 상세안내: 근로복지공단 공식 안내채널 참고</span>
                          <span className="text-[10px]">◆</span>
                        </div>
                      </div>

                    </div>
                  </div>

              {/* 이용 유의사항 및 안내 박스 */}
              <section className="rounded-2xl border border-brand-brown/20 bg-[#FCFAF7] overflow-hidden shadow-3xs text-left mt-6">
                <div className="bg-[#514339] text-white px-4 py-2.5 flex items-center gap-1.5 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <h4 className="text-xs sm:text-sm font-black tracking-tight text-white">이용 안내 및 유의사항</h4>
                </div>
                <div className="p-4 space-y-2.5 text-[11px] sm:text-xs text-[#514339] font-semibold leading-relaxed">
                  <p className="text-slate-800">
                    본 안내는 방문 전 참고 정보입니다. 실제 신청 가능 여부, 필요 서류, 처리 절차는 관련 법령 개정이나 개별 사안에 따라 달라질 수 있으니, 정확한 사항은 근로복지공단 공식 채널(1588-0075, comwel.or.kr) 또는 관할 지사를 통해 다시 확인하시기 바랍니다.
                  </p>
                  <p className="text-[#A66E38] font-black">
                    본 서비스는 이용자의 개인정보를 수집하거나 저장하지 않습니다.
                  </p>
                </div>
              </section>

              {/* 하단 통합 포털 허브 */}
              <section className="space-y-3.5 pt-6 text-left">
                <div className="flex items-center justify-between border-b border-[#EDE9DF] pb-1.5">
                  <span className="text-[9px] font-black text-[#8C7667] tracking-wider font-serif">OFFICIAL DIRECTORY</span>
                  <span className="text-[10px] font-extrabold text-brand-accent">원 터치 간편 연결</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center font-bold">
                  <a
                    href="https://www.comwel.or.kr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast('근로복지공단 공식 홈페이지로 이동합니다.')}
                    className="p-2.5 bg-white border border-[#EDE9DF] rounded-xl hover:border-brand-brown-light transition-colors shadow-3xs group cursor-pointer block no-underline"
                  >
                    <span className="text-xs font-black text-slate-800 block group-hover:text-brand-accent">근로복지공단</span>
                    <span className="text-[8px] sm:text-[9px] text-[#8C7667] font-bold block mt-0.5">공식포털</span>
                  </a>
                  <a
                    href="https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast('고용산재보험 토탈서식 페이지로 이동합니다.')}
                    className="p-2.5 bg-white border border-[#EDE9DF] rounded-xl hover:border-brand-brown-light transition-colors shadow-3xs group cursor-pointer block no-underline"
                  >
                    <span className="text-xs font-black text-slate-800 block group-hover:text-brand-accent">고용산재토탈</span>
                    <span className="text-[8px] sm:text-[9px] text-[#8C7667] font-bold block mt-0.5">민원전산접수</span>
                  </a>
                  <a
                    href="https://www.ips.go.kr/cht/ptl/main.ndo"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast('국민비서 구삐 공식 서비스 홈페이지로 이동합니다.')}
                    className="p-2.5 bg-white border border-[#E9E2D5] rounded-xl hover:border-brand-brown-light transition-colors shadow-3xs group cursor-pointer block no-underline bg-linear-to-b from-white to-[#FDFBF7]"
                  >
                    <span className="text-xs font-black text-amber-900 block group-hover:text-brand-accent flex items-center justify-center gap-0.5">
                      <span className="text-[10px]">🤖</span>국민비서 구삐
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-[#CD8B62] font-black block mt-0.5 animate-pulse">알림서비스</span>
                  </a>
                  <a
                    href="https://www.moel.go.kr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast('고용노동부 공식 홈페이지로 이동합니다.')}
                    className="p-2.5 bg-white border border-[#EDE9DF] rounded-xl hover:border-brand-brown-light transition-colors shadow-3xs group cursor-pointer block no-underline"
                  >
                    <span className="text-xs font-black text-slate-800 block group-hover:text-brand-accent">고용노동부</span>
                    <span className="text-[8px] sm:text-[9px] text-[#8C7667] font-bold block mt-0.5">행정주무부처</span>
                  </a>
                  <a
                    href="tel:1588-0075"
                    onClick={() => triggerToast('통합 문의 안내센터(1588-0075)로 전화를 연결합니다.')}
                    className="col-span-2 sm:col-span-1 p-2.5 bg-[#FDF6ED] border border-[#F5E6D3] rounded-xl hover:bg-[#FDF2EA] transition-colors shadow-3xs text-center block no-underline cursor-pointer"
                  >
                    <span className="text-xs font-black text-[#A66E38] block">대표 전용망</span>
                    <span className="text-[9px] text-[#8C7667] font-extrabold block mt-0.5">1588-0075</span>
                  </a>
                </div>
              </section>

            </main>
          </motion.div>
        ) : (
          /* ========================================================
             CASE B: 단독 풀프레임 정밀 민원 상세서 (체크리스트 기능 탑재)
             ======================================================== */
          <motion.div
            key="detail-layout-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.12 }}
            className="flex-1 flex flex-col"
          >
            {/* 뒤로가기 전용 상보적 서브 네비 타이틀 탑바 */}
            <header className="bg-white border-b border-[#EDE9DF]/80 text-[#33251E] py-3.5 px-4 sm:px-6 sticky top-[58px] z-30 shadow-2xs">
              <div className="mx-auto max-w-2xl flex items-center justify-between">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#FAF8F5] hover:bg-[#F5ECE1] border border-[#EDE9DF] px-3.5 py-2 rounded-xl active:scale-97 transition-all cursor-pointer select-none text-[#514339]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  전체 민원 목록으로 가기
                </button>
                <div className="text-[11px] font-black text-[#A66E38] font-serif">
                  {activeCard.category} 안내서 실시간 대조 중
                </div>
              </div>
            </header>

            {/* 세부 뷰 본문 내용 */}
            <main className="mx-auto w-full max-w-2xl px-4 py-6 flex-1 space-y-6">
              
              {/* 타이틀 요약 정보판 */}
              <section className="bg-white border border-[#EDE9DF] rounded-2xl p-5 shadow-2xs space-y-3.5 text-left">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-[#FAF8F5] px-2.5 py-0.5 text-[10px] font-black text-[#514339] border border-[#EDE9DF]">
                    영역: {activeCard.category}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#FDF6ED] text-[#A66E38] px-2.5 py-0.5 text-[10px] font-black border border-[#F5E6D3]">
                    업무대상: {activeCard.target}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#33251E] tracking-tight leading-tight font-serif">
                    {activeCard.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8C7667] font-semibold leading-relaxed">
                    {activeCard.tagLine}
                  </p>
                </div>

                <div className="bg-[#FAF2EA] border border-[#F2DECE] rounded-xl p-3 flex gap-2.5 items-start text-xs font-bold text-[#8C7667]">
                  <Sparkle className="h-4 w-4 text-[#A66E38] shrink-0 mt-0.5" />
                  <span>하단의 '준비 및 자격 자가체크' 항목을 자율적으로 체크하여 적합율을 실시간으로 확인해 보실 수 있습니다.</span>
                </div>
              </section>

              {/* 핵심 정보 종합 진단 도식판 */}
              <section className="bg-white border border-[#EDE9DF] rounded-[24px] p-5 sm:p-6 shadow-sm text-left">
                <div className="flex items-center gap-1.5 border-b border-[#EDE9DF] pb-2.5 mb-4">
                  <div className="h-4.5 w-4.5 rounded-md bg-[#FAF2EA] text-[#A66E38] flex items-center justify-center border border-[#F2DECE] text-[9px] font-black shrink-0">
                    ℹ️
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#514339] tracking-wide uppercase font-serif">
                      민원 정보 종합 요약 도식
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 왼쪽: 개념 및 대상 */}
                  <div className="space-y-3">
                    {/* 무엇인가요? */}
                    <div className="bg-[#FAF8F5]/60 border border-[#EDE9DF]/80 hover:border-brand-brown-light/40 rounded-xl p-4 flex gap-3 transition-colors h-[48%] min-h-[115px]">
                      <div className="h-7 w-7 rounded-lg bg-[#FDF6ED] border border-[#F5E6D3] flex items-center justify-center shrink-0 text-xs font-bold text-[#A66E38]">
                        ❔
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-[#8C7667] block uppercase font-serif tracking-wider">concept / 정의</span>
                        <h5 className="text-[11.5px] font-black text-[#33251E]">이 민원은 무엇인가요?</h5>
                        <p className="text-[11px] sm:text-[11.5px] font-semibold text-[#514339] leading-relaxed">
                          {activeCard.whatIsThis}
                        </p>
                      </div>
                    </div>

                    {/* 신청 대상은? */}
                    <div className="bg-[#FAF8F5]/60 border border-[#EDE9DF]/80 hover:border-teal-200/40 rounded-xl p-4 flex gap-3 transition-colors h-[48%] min-h-[115px]">
                      <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-xs font-bold text-[#4F7B5A]">
                        👤
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-[#8C7667] block uppercase font-serif tracking-wider">target / 대상</span>
                        <h5 className="text-[11.5px] font-black text-[#33251E]">누가 신청하나요?</h5>
                        <p className="text-[11px] sm:text-[11.5px] font-semibold text-[#514339] leading-relaxed">
                          {activeCard.whoApplies}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 청구 대표사례 */}
                  <div className="bg-[#FCFAF7] border border-[#EDE9DF]/90 rounded-xl p-4 flex flex-col justify-between hover:border-brand-brown-light/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5 mb-3 pb-1.5 border-b border-[#EDE9DF]/65">
                        <span className="text-[9.5px] font-black text-[#8C7667] uppercase font-serif tracking-wider font-semibold">Cases / 대표 안내</span>
                        <span className="h-1 w-1 rounded-full bg-teal-500" />
                        <h5 className="text-[11.5px] font-black text-brand-brown">청구 대표사례</h5>
                      </div>
                      <ul className="space-y-3">
                        {activeCard.cases.map((cs, idx) => (
                          <li key={idx} className="flex gap-2 items-start text-[11px] sm:text-[11.5px] text-[#514339] font-semibold leading-relaxed">
                            <span className="h-4.5 px-1.5 rounded bg-[#FAF2EA] text-[9px] font-black text-[#A66E38] flex items-center justify-center shrink-0 mt-0.5 border border-[#F2DECE] tracking-tighter">
                              대표 {idx + 1}
                            </span>
                            <span>{cs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4) 사전 체크리스트 자가진단 */}
              <section className="space-y-2 text-left">
                <div className="flex items-center justify-between border-b border-[#EDE9DF] pb-1.5">
                  <h4 className="text-xs font-bold text-[#8C7667] tracking-wide uppercase flex items-center gap-1.5 font-serif">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                    준비 및 자격 자가체크
                  </h4>
                  {(() => {
                    const { checkedCount, total } = getPreCheckStatus(activeCard);
                    return (
                      <span className="text-sm font-serif italic text-brand-brown-light font-medium">
                        진행 {checkedCount}/{total}
                      </span>
                    );
                  })()}
                </div>

                <div className="bg-white border border-[#EDE9DF] rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="space-y-2">
                    {activeCard.preChecklist.map((item, idx) => {
                      const isPreChecked = !!preChecklistState[activeCard.id]?.[idx];
                      return (
                        <button
                          key={idx}
                          onClick={() => togglePreChecked(activeCard.id, idx)}
                          className={`w-full flex items-center justify-between p-3.5 text-left rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                            isPreChecked
                              ? 'bg-[#FDF6ED] border-[#F5E6D3] text-[#33251E] shadow-2xs font-bold'
                              : 'bg-[#FAF8F5] border-[#EDE9DF] text-[#514339] hover:bg-[#F5ECE1]'
                          }`}
                        >
                          <span className={isPreChecked ? 'text-[#33251E] font-extrabold pr-2' : 'text-[#514339] pr-2'}>
                            {item}
                          </span>
                          
                          <div className={`h-[22px] w-[22px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isPreChecked ? 'bg-[#514339] border-[#514339] text-white' : 'border-[#D9CEB5] bg-white hover:border-[#8C7667]'
                          }`}>
                            {isPreChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 진척률 게이지 */}
                  {(() => {
                    const { checkedCount, total, percentage } = getPreCheckStatus(activeCard);
                    return (
                      <div className="pt-2 flex flex-col gap-1.5 text-[10px] border-t border-[#EDE9DF]/50 mt-1">
                        <div className="flex-1 bg-[#F5ECE1] h-[5px] rounded-full overflow-hidden">
                          <div 
                            className="bg-[#514339] h-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-brand-brown-light font-bold">
                          <span>자가자격 적합율</span>
                          <span className="font-serif">
                            {percentage}% ({checkedCount}/{total})
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </section>

              {/* 6) 가져오면 빠른 서류들 (🔹 파란 마름모) */}
              {activeCard.helpfulDocs.length > 0 && (
                <section className="space-y-1.5 text-left">
                  <h4 className="text-xs font-bold text-[#695D75] tracking-wide uppercase flex items-center gap-1.5 font-serif">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#695D75]" />
                    가져오면 빠른 대안 서류 🔹
                  </h4>
                  <div className="bg-white border border-[#EDE9DF] rounded-2xl p-4.5 shadow-2xs">
                    <ul className="space-y-2.5">
                      {activeCard.helpfulDocs.map((doc, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm text-[#514339] font-medium leading-normal">
                          <span className="text-[#695D75] text-xs mt-0.5 select-none">🔹</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
              {/* 8) 비대면 온라인 신청 안내 */}
              <section className="space-y-1.5 text-left">
                <h4 className="text-xs font-bold text-[#514339] tracking-wide uppercase flex items-center gap-1.5 font-serif">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#BFA081]" />
                  비대면 온라인 신청 안내
                </h4>
                <div className="bg-[#FAF8F5] border border-[#EDE9DF] rounded-2xl p-4.5 shadow-2xs space-y-2 text-xs sm:text-sm font-extrabold text-[#33251E] leading-relaxed">
                  <p>{activeCard.onlineGuidance}</p>
                  <p className="text-[10px] sm:text-xs text-[#8C7667] font-semibold leading-normal">
                    💡 지사에 직접 방문하지 않고 인터넷이나 모바일을 이용하시면, 장소에 구애받지 않고 원격 서류 접수 및 신청이 가능합니다. 비대면 방식을 권장해 드립니다.
                  </p>
                </div>
              </section>

              {/* 9) 유의사항 및 사전 확인 사항 */}
              <section className="space-y-1.5 text-left">
                <h4 className="text-xs font-bold text-[#C45E5E] tracking-wide uppercase flex items-center gap-1.5 font-serif">
                  <AlertTriangle className="h-4 w-4 text-[#C45E5E]" />
                  유의사항 및 사전 확인 사항
                </h4>
                <div className="bg-white border-l-4 border-l-[#C45E5E] border-[#EDE9DF] rounded-r-2xl border-t border-b border-r p-4 shadow-2xs text-xs sm:text-sm font-semibold text-[#514339] leading-relaxed">
                  <p>{activeCard.caution}</p>
                </div>
              </section>

              {/* 10) 대인 조작 및 다이렉트 처리 공간 */}
              <section className="space-y-3.5 pt-4">
                <div className="flex items-center justify-between border-b border-[#EDE9DF] pb-1.5">
                  <span className="text-[10px] font-black text-brand-brown-light font-serif uppercase tracking-widest">OFFICIAL ACTION AREA</span>
                  <span className="text-[10px] font-extrabold text-[#514339]">안심 다이렉트 소인</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <a
                    href={getOnlineLink(activeCard)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerToast(`[안내] "${activeCard.onlineUrlLabel}" 공단홈페이지 연동 페이지로 이동합니다.`)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#514339] px-5 py-4 text-sm font-black text-white hover:bg-[#33251E] active:scale-98 transition-all shadow-md cursor-pointer no-underline text-center"
                  >
                    <ExternalLink className="h-5 w-5 shrink-0" />
                    {activeCard.onlineUrlLabel} (온라인 정식 신청)
                  </a>

                  <div className="grid grid-cols-2 gap-2.5 font-bold">
                    <a
                      href="tel:1588-0075"
                      onClick={() => triggerToast('대표전화 안내 서비스: 1588-0075로 전화 연결이 준비되었습니다.')}
                      className="inline-flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white border border-[#EDE9DF] px-3 py-3.5 text-xs text-brand-brown hover:bg-[#FAF8F5] active:scale-97 transition-all shadow-3xs cursor-pointer no-underline text-center"
                    >
                      <Phone className="h-5 w-5 text-[#A66E38] shrink-0" />
                      <span className="text-[11px] font-black">1588-0075</span>
                    </a>
                    
                    {/* 공단홈페이지 바로가기 */}
                    <a
                      href="https://www.comwel.or.kr/comwel/main.jsp"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerToast('[대화] 온라인 민원 및 서식 다운로드가 가능한 공단홈페이지로 연결됩니다.')}
                      className="inline-flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white border border-[#EDE9DF] px-3 py-3.5 text-xs text-brand-brown hover:bg-[#FAF8F5] active:scale-97 transition-all shadow-3xs cursor-pointer no-underline text-center"
                    >
                      <Globe className="h-5 w-5 text-[#4F7B5A] shrink-0" />
                      <span className="text-[11px] font-black">공단홈페이지</span>
                    </a>
                  </div>

                  <div className="pt-1 font-bold">
                    {/* 공식 서식 다운로드 - 공식 연결 */}
                    <a
                      href={getFormLink(activeCard)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerToast('[안내] 공식 홈페이지 서식 다운로드 코너로 이동합니다.')}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white border border-[#EDE9DF] px-4 py-3.5 text-xs text-slate-800 hover:bg-[#FAF8F5] active:scale-97 transition-all shadow-3xs cursor-pointer no-underline text-center"
                    >
                      <FileDown className="h-4 w-4 text-[#4F7B5A] shrink-0" />
                      공식 서식 다운
                    </a>
                  </div>

                  <button
                    onClick={() => resetCardChecklist(activeCard.id)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-brown-light/80 hover:text-rose-700 border border-dashed border-[#EDE9DF] py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-rose-50/50 transition-colors cursor-pointer mt-1 font-bold"
                  >
                    이 특정 민원에 체크된 자가 기록 초기화하기
                  </button>
                </div>
              </section>

              {/* 하단 뒤로가기 보조 리크 */}
              <div className="pt-6 text-center font-bold">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-1 text-xs text-brand-brown hover:underline cursor-pointer"
                >
                  ← 전체 안내판으로 돌아가서 다른 서류 대조해보기
                </button>
              </div>

            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 명예 공인 골드 배터 리본 및 푸터 */}
      <footer className="w-full bg-[#514339] text-[#FAF7F2] pt-12 pb-10 px-4 sm:px-6 relative overflow-hidden shrink-0 mt-auto border-t border-[#33251E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(191,160,129,0.15),transparent_40%)] pointer-events-none" />
        
        <div className="mx-auto max-w-4xl space-y-6 text-center relative z-10">
          
          <div className="bg-white/5 rounded-2xl py-4.5 px-4 border border-white/10 max-w-lg mx-auto shadow-sm">
            <p className="text-xs sm:text-sm font-bold tracking-tight text-[#FAF7F2] leading-relaxed">
              💡 사전에 서류를 확인하면 방문 시 소요 시간을 줄이는 데 도움이 될 수 있습니다.
            </p>
          </div>

          <p className="text-[10px] sm:text-[11.5px] text-[#EDE7E2]/75 leading-relaxed max-w-xl mx-auto font-medium">
            {SERVICE_INTRO_TEXT}
          </p>

          <p className="text-[9.5px] sm:text-[10.5px] text-[#CD8B62] leading-relaxed max-w-xl mx-auto font-semibold border-t border-white/5 pt-3">
            {NOTICE_DISCLAIMER}
          </p>

          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#EDE7E2]/40 font-bold max-w-3xl mx-auto">
            <span>© 2026 근로복지공단 서울동부지사 방문 전 참고 안내. All rights reserved.</span>
            <span>고객 전용 자가진단 편의 시스템</span>
          </div>

        </div>
      </footer>

      {/* 글로벌 알림 팝업 토스트 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#33251E] text-brand-cream rounded-xl py-3.5 px-5 shadow-xl border border-brand-brown/50 flex items-center gap-2.5 min-w-[280px] sm:min-w-[340px] max-w-[90vw]"
          >
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-brand-accent" />
            <span className="text-xs font-bold leading-snug text-left">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
