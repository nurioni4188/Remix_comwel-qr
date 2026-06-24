import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  Check,
  ExternalLink,
  Phone,
  Globe,
  MapPin,
  ArrowLeft,
  FileDown,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { COMPLAINT_CARDS, CATEGORIES } from './data';
import { ComplaintCard, SavedChecklist } from './types';

/* ─── Apple Design Tokens ──────────────────────────────── */
const AP = {
  blue:        '#0066cc',
  blueDark:    '#004499',
  blueOnDark:  '#2997ff',
  ink:         '#1d1d1f',
  body:        '#1d1d1f',
  muted:       '#6e6e73',
  canvas:      '#ffffff',
  parchment:   '#f5f5f7',
  dark1:       '#1d1d1f',
  dark2:       '#2a2a2c',
  hairline:    '#e0e0e0',
  onDark:      '#ffffff',
  onDarkMute:  'rgba(255,255,255,0.7)',
};

/* ─── Link helpers ─────────────────────────────────────── */
const getOnlineLink = (card: ComplaintCard) => {
  if (card.category === '복지·지원 사업') return 'https://welfare.comwel.or.kr/';
  if (card.onlineUrlLabel.includes('정부24')) return 'https://www.gov.kr/';
  return 'https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp';
};
const getFormLink = () => 'https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp';

/* ─── Category accent colors ───────────────────────────── */
const getCatColor = (category: string) => {
  switch (category) {
    case '자주 찾는 민원': return { bg: '#e8f4ff', text: '#0066cc', dot: '#0066cc' };
    case '가입지원':       return { bg: '#e8f7ee', text: '#1a7f4b', dot: '#1a7f4b' };
    case '재활보상':       return { bg: '#fff4e8', text: '#b45309', dot: '#b45309' };
    case '복지·지원 사업': return { bg: '#f3eeff', text: '#7c3aed', dot: '#7c3aed' };
    default:              return { bg: '#f5f5f7', text: '#6e6e73', dot: '#6e6e73' };
  }
};

const getCatEmoji = (category: string) => {
  switch (category) {
    case '자주 찾는 민원': return '⭐';
    case '가입지원':       return '📋';
    case '재활보상':       return '🏥';
    case '복지·지원 사업': return '💙';
    default:              return '📌';
  }
};

export default function App() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [activeGlossaryIdx, setActiveGlossaryIdx] = useState<number | null>(null);

  const [checklist, setChecklist] = useState<SavedChecklist>(() => {
    try { const s = localStorage.getItem('qr-checklist'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [preChecklist, setPreChecklist] = useState<{ [k: string]: { [i: number]: boolean } }>(() => {
    try { const s = localStorage.getItem('qr-pre-checklist'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem('qr-checklist', JSON.stringify(checklist)); } catch {}
  }, [checklist]);
  useEffect(() => {
    try { localStorage.setItem('qr-pre-checklist', JSON.stringify(preChecklist)); } catch {}
  }, [preChecklist]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleDoc = (cardId: string, idx: number) => {
    setChecklist(prev => {
      const c = prev[cardId] ? { ...prev[cardId] } : {};
      c[idx] = !c[idx];
      return { ...prev, [cardId]: c };
    });
  };
  const togglePre = (cardId: string, idx: number) => {
    setPreChecklist(prev => {
      const c = prev[cardId] ? { ...prev[cardId] } : {};
      c[idx] = !c[idx];
      return { ...prev, [cardId]: c };
    });
  };
  const resetCard = (cardId: string) => {
    setChecklist(prev => { const u = { ...prev }; delete u[cardId]; return u; });
    setPreChecklist(prev => { const u = { ...prev }; delete u[cardId]; return u; });
    triggerToast('체크 이력을 초기화했습니다.');
  };

  const getDocStatus = (card: ComplaintCard) => {
    const c = checklist[card.id] || {};
    const total = card.requiredDocs.length;
    const done = Object.values(c).filter(Boolean).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };
  const getPreStatus = (card: ComplaintCard) => {
    const c = preChecklist[card.id] || {};
    const total = card.preChecklist.length;
    const done = Object.values(c).filter(Boolean).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const activeCard = useMemo(() =>
    selectedCardId ? COMPLAINT_CARDS.find(c => c.id === selectedCardId) ?? null : null,
    [selectedCardId]
  );

  const filteredCards = useMemo(() =>
    activeCategory === '전체'
      ? COMPLAINT_CARDS
      : COMPLAINT_CARDS.filter(c => c.category === activeCategory),
    [activeCategory]
  );

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' });
  const openDetail = (id: string) => { setSelectedCardId(id); scrollTop(); };
  const backToList = () => { setSelectedCardId(null); scrollTop(); };

  /* ── Pill Button ── */
  const PillBtn = ({
    children, onClick, href, variant = 'primary', small = false, style: extraStyle
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    small?: boolean;
    style?: React.CSSProperties;
  }) => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 9999,
      fontFamily: 'var(--font-sans)',
      fontWeight: 400,
      cursor: 'pointer',
      textDecoration: 'none',
      border: 'none',
      transition: 'opacity .15s, transform .1s',
      fontSize: small ? 14 : 16,
      padding: small ? '8px 18px' : '11px 24px',
      letterSpacing: '-0.374px',
      ...extraStyle,
    };
    const styles: Record<string, React.CSSProperties> = {
      primary:   { background: AP.blue, color: '#fff' },
      secondary: { background: 'transparent', color: AP.blue, border: `1px solid ${AP.blue}` },
      ghost:     { background: 'transparent', color: AP.blue, padding: small ? '4px 0' : '8px 0' },
    };
    const merged = { ...base, ...styles[variant] };
    if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={merged}>{children}</a>;
    return <button onClick={onClick} style={merged}>{children}</button>;
  };

  /* ── Glossary data ── */
  const GLOSSARY = [
    { term: '피보험자격', spec: '상용·일용 근로 자격', def: '고용·산재보험에 정식 가입되어 행정적 혜택을 수령할 자격. 입사 시 취득, 퇴사 시 상실 신고가 필요합니다.' },
    { term: '보수총액', spec: '세전 소득 실제 결산액', def: '전년도 1년간 지급된 비과세 제외 세전 임금 총액. 매년 3월 정산하여 보험료 차감 또는 추징을 결정합니다.' },
    { term: '요양급여', spec: '산재 치료비 지원', def: '업무상 부상 또는 질병으로 4일 이상 치료가 필요한 경우 산재보험 범위 내의 요양비를 지원합니다.' },
    { term: '휴업급여', spec: '치료 기간 소득 보전', def: '요양으로 취업하지 못한 기간에 생계 안정을 위해 1일당 평균임금의 70%를 지급하는 제도입니다.' },
    { term: '장해급여', spec: '치료 종결 후 장해 보상', def: '치료가 종결되었으나 영구 장해가 남을 때 장해등급(1~14급)에 따라 연금 또는 일시금을 지급합니다.' },
    { term: '이직확인서', spec: '퇴사 사실 공증 서류', def: '근로자 퇴사 사실과 이직 사유를 증명하는 문서. 실업급여 심사에 필요하며 공단에 제출됩니다.' },
  ];

  /* ════════════════════════════════════════════════════
     LIST VIEW
  ════════════════════════════════════════════════════ */
  const ListView = () => (
    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>

      {/* ── HERO TILE (dark) ── */}
      <section style={{ background: AP.dark1, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 400, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: AP.onDarkMute,
            marginBottom: 20,
          }}>
            고객용 방문 전 안내 서비스
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 600,
            color: AP.onDark,
            lineHeight: 1.07,
            letterSpacing: '-0.28px',
            marginBottom: 20,
            fontFamily: 'var(--font-serif)',
          }}>
            방문 전<br />QR 길잡이
          </h1>
          <p style={{
            fontSize: 18,
            fontWeight: 400,
            color: AP.onDarkMute,
            lineHeight: 1.6,
            letterSpacing: '-0.374px',
            marginBottom: 32,
          }}>
            QR 한 번으로 민원유형 확인 · 준비서류 점검 · 공식 신청 경로 연결까지
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillBtn href="https://www.comwel.or.kr/">공식 홈페이지</PillBtn>
            <PillBtn variant="secondary" style={{ color: AP.onDark, borderColor: 'rgba(255,255,255,0.4)' }}
              href="https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp">
              서식 다운로드
            </PillBtn>
          </div>
        </div>
      </section>

      {/* ── STAT STRIP (parchment) ── */}
      <section style={{ background: AP.parchment, padding: '48px 24px' }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 0,
        }}>
          {[
            { num: '4', label: '민원 카테고리' },
            { num: '13+', label: '수록 민원 종류' },
            { num: '0건', label: '개인정보 수집' },
            { num: '100%', label: '무료 자가진단' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 24px' }}>
              <div style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 600,
                color: AP.ink,
                letterSpacing: '-0.374px',
                lineHeight: 1,
              }}>{s.num}</div>
              <div style={{ fontSize: 14, color: AP.muted, marginTop: 8, letterSpacing: '-0.224px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY FILTER + CARDS (white) ── */}
      <section style={{ background: AP.canvas, padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            민원 안내
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, color: AP.ink, letterSpacing: '-0.28px', marginBottom: 8, lineHeight: 1.1 }}>
            어떤 업무로 방문하시나요?
          </h2>
          <p style={{ fontSize: 17, color: AP.muted, marginBottom: 40, letterSpacing: '-0.374px', lineHeight: 1.47 }}>
            민원 유형을 선택하면 필수 준비서류와 자격 요건을 바로 확인할 수 있습니다.
          </p>

          {/* Pill tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
            {['전체', ...CATEGORIES.map(c => c.label)].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  borderRadius: 9999,
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: '-0.224px',
                  cursor: 'pointer',
                  border: 'none',
                  background: activeCategory === cat ? AP.ink : AP.parchment,
                  color: activeCategory === cat ? AP.onDark : AP.ink,
                  transition: 'background .15s, color .15s',
                  fontFamily: 'var(--font-sans)',
                }}
              >{cat}</button>
            ))}
          </div>

          {/* Card grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {filteredCards.map(card => {
              const cat = getCatColor(card.category);
              const doc = getDocStatus(card);
              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: .15 }}
                  onClick={() => openDetail(card.id)}
                  style={{
                    background: AP.canvas,
                    border: `1px solid ${AP.hairline}`,
                    borderRadius: 18,
                    padding: 24,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: 'rgba(0,0,0,0.04) 0 2px 12px',
                  }}
                >
                  {/* category badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      background: cat.bg, color: cat.text,
                      padding: '4px 10px', borderRadius: 9999,
                      letterSpacing: '-0.12px',
                    }}>
                      {getCatEmoji(card.category)} {card.category}
                    </span>
                    <span style={{
                      fontSize: 11, color: AP.muted,
                      background: AP.parchment,
                      padding: '3px 10px', borderRadius: 9999,
                    }}>
                      {card.target}
                    </span>
                  </div>

                  {/* title */}
                  <div style={{
                    fontSize: 17, fontWeight: 600,
                    color: AP.ink, lineHeight: 1.35,
                    letterSpacing: '-0.374px',
                  }}>
                    {card.title}
                  </div>

                  {/* tagline */}
                  <div style={{
                    fontSize: 14, color: AP.muted,
                    lineHeight: 1.5, letterSpacing: '-0.224px',
                    flex: 1,
                  }}>
                    {card.tagLine}
                  </div>

                  {/* progress bar (if checked) */}
                  {doc.done > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: AP.blue, marginBottom: 4 }}>
                        서류 {doc.done}/{doc.total} 준비됨
                      </div>
                      <div style={{ height: 3, background: AP.hairline, borderRadius: 9999 }}>
                        <div style={{ height: 3, width: `${doc.pct}%`, background: AP.blue, borderRadius: 9999, transition: 'width .3s' }} />
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: AP.blue,
                    fontSize: 14,
                    fontWeight: 400,
                    letterSpacing: '-0.224px',
                    gap: 2,
                    marginTop: 4,
                  }}>
                    안내 보기 <ChevronRight size={14} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESS TILE (parchment) ── */}
      <section style={{ background: AP.parchment, padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>이용 흐름</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 600, color: AP.ink, letterSpacing: '-0.28px', marginBottom: 48, lineHeight: 1.1 }}>
            4단계로 방문 준비 완료
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {[
              { step: '01', emoji: '📷', title: 'QR 스캔', desc: '포스터·안내문의 QR 코드를 스캔하면 모바일 웹에 즉시 접속됩니다.' },
              { step: '02', emoji: '🗂️', title: '민원 선택', desc: '4개 카테고리에서 해당 업무를 선택하면 상세 안내로 이동합니다.' },
              { step: '03', emoji: '✅', title: '서류 체크', desc: '필수 지참 서류와 자격 요건을 항목별로 터치하여 자가진단합니다.' },
              { step: '04', emoji: '🏢', title: '창구 방문', desc: '준비 완료 후 지사 창구를 방문하면 빠른 접수가 가능합니다.' },
            ].map((s, i) => (
              <div key={i} style={{
                background: AP.canvas,
                border: `1px solid ${AP.hairline}`,
                borderRadius: 18,
                padding: 24,
                boxShadow: 'rgba(0,0,0,0.04) 0 2px 12px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: AP.blue, letterSpacing: '-0.12px', marginBottom: 12 }}>{s.step}</div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.emoji}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: AP.ink, letterSpacing: '-0.374px', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: AP.muted, lineHeight: 1.5, letterSpacing: '-0.224px' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOSSARY TILE (dark) ── */}
      <section style={{ background: AP.dark2, padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>용어 사전</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 600, color: AP.onDark, letterSpacing: '-0.28px', marginBottom: 40, lineHeight: 1.1 }}>
            공단 핵심 행정 용어
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {GLOSSARY.map((g, i) => {
              const open = activeGlossaryIdx === i;
              return (
                <div key={i} style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: `1px solid ${open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'background .15s, border .15s',
                }}>
                  <button
                    onClick={() => setActiveGlossaryIdx(open ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '16px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', background: 'transparent', border: 'none',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: AP.onDark, letterSpacing: '-0.374px' }}>{g.term}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginLeft: 10, letterSpacing: '-0.224px' }}>{g.spec}</span>
                    </div>
                    <ChevronDown size={16} color="rgba(255,255,255,0.5)"
                      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: .15 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 20px 16px', fontSize: 14, color: AP.onDarkMute, lineHeight: 1.6, letterSpacing: '-0.224px' }}>
                          {g.def}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PORTAL HUB (parchment) ── */}
      <section style={{ background: AP.parchment, padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>공식 연결</div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, color: AP.ink, letterSpacing: '-0.28px', marginBottom: 32, lineHeight: 1.1 }}>
            원터치 포털 허브
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {[
              { label: '근로복지공단', sub: '공식 포털', href: 'https://www.comwel.or.kr/' },
              { label: '고용산재토탈', sub: '민원 전산 접수', href: 'https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp' },
              { label: '정부24', sub: '인터넷 증명서', href: 'https://www.gov.kr/' },
              { label: '고용노동부', sub: '행정 주무 부처', href: 'https://www.moel.go.kr/' },
              { label: '국민비서 구삐', sub: '알림 서비스', href: 'https://www.ips.go.kr/cht/ptl/main.ndo' },
              { label: '1588-0075', sub: '대표 전화', href: 'tel:1588-0075' },
            ].map((p, i) => (
              <a key={i} href={p.href} target={p.href.startsWith('tel') ? '_self' : '_blank'} rel="noopener noreferrer"
                style={{
                  display: 'block', textDecoration: 'none',
                  background: AP.canvas, border: `1px solid ${AP.hairline}`,
                  borderRadius: 14, padding: '16px 18px',
                  boxShadow: 'rgba(0,0,0,0.04) 0 2px 8px',
                  transition: 'box-shadow .15s, transform .1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'rgba(0,0,0,0.1) 0 4px 16px'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'rgba(0,0,0,0.04) 0 2px 8px'; }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: AP.ink, letterSpacing: '-0.374px' }}>{p.label}</div>
                <div style={{ fontSize: 12, color: AP.muted, marginTop: 3, letterSpacing: '-0.12px' }}>{p.sub}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER (canvas) ── */}
      <section style={{ background: AP.canvas, padding: '48px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            border: `1px solid ${AP.hairline}`,
            borderRadius: 14,
            padding: '20px 24px',
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <AlertTriangle size={18} color={AP.muted} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: AP.muted, lineHeight: 1.6, letterSpacing: '-0.224px' }}>
              <span style={{ fontWeight: 600, color: AP.ink }}>비공식 안내 서비스.</span>{' '}
              본 플랫폼은 근로복지공단 공식 웹사이트가 아닌 비공식 정보 안내 도우미입니다.
              제공되는 정보 및 체크리스트는 참고용이며 법적 효력을 가지지 않습니다.
              어떠한 개인정보도 수집·서버에 저장하지 않습니다.
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: AP.parchment, padding: '48px 24px 32px', borderTop: `1px solid ${AP.hairline}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 32,
            marginBottom: 40,
            paddingBottom: 32,
            borderBottom: `1px solid ${AP.hairline}`,
          }}>
            {[
              { head: '민원 안내', links: ['요양급여', '휴업급여', '이직확인서', '장해급여'] },
              { head: '가입지원', links: ['피보험자격', '보수총액신고', '보험관계성립', '소멸신고'] },
              { head: '복지 사업', links: ['생활안정자금', '직업훈련 생계비', '임금체불 지원'] },
              { head: '공식 채널', links: ['근로복지공단', '고용산재토탈', '정부24', '1588-0075'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
                  {col.head}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <span style={{ fontSize: 14, color: AP.ink, lineHeight: 2.2, letterSpacing: '-0.224px' }}>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: AP.muted, letterSpacing: '-0.12px', lineHeight: 1.6 }}>
            © 2026 방문 전 안심 길잡이 (비공식 도우미). All rights reserved. &nbsp;|&nbsp;
            개인정보 미수집 · 서버 미사용 · 완전 정적 서비스
          </div>
        </div>
      </footer>

    </motion.div>
  );

  /* ════════════════════════════════════════════════════
     DETAIL VIEW
  ════════════════════════════════════════════════════ */
  const DetailView = ({ card }: { card: ComplaintCard }) => {
    const cat = getCatColor(card.category);
    const docSt = getDocStatus(card);
    const preSt = getPreStatus(card);

    return (
      <motion.div key="detail" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: .2 }}>

        {/* Sub-nav */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(245,245,247,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${AP.hairline}`,
          padding: '0 24px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={backToList}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 14, color: AP.blue, cursor: 'pointer',
              background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.224px',
            }}
          >
            <ArrowLeft size={16} /> 민원 목록
          </button>
          <div style={{ fontSize: 15, fontWeight: 600, color: AP.ink, letterSpacing: '-0.374px' }}>
            {card.category}
          </div>
        </div>

        {/* Header tile (parchment) */}
        <section style={{ background: AP.parchment, padding: '56px 24px 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              <span style={{
                fontSize: 12, fontWeight: 600,
                background: cat.bg, color: cat.text,
                padding: '5px 14px', borderRadius: 9999,
              }}>
                {getCatEmoji(card.category)} {card.category}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 400,
                background: AP.canvas, color: AP.muted,
                padding: '5px 14px', borderRadius: 9999,
                border: `1px solid ${AP.hairline}`,
              }}>
                {card.target}
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 600, color: AP.ink,
              letterSpacing: '-0.28px', lineHeight: 1.2,
              marginBottom: 16, fontFamily: 'var(--font-serif)',
            }}>
              {card.title}
            </h1>
            <p style={{ fontSize: 17, color: AP.muted, lineHeight: 1.6, letterSpacing: '-0.374px', marginBottom: 32 }}>
              {card.tagLine}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <PillBtn href={getOnlineLink(card)}>
                <ExternalLink size={15} /> {card.onlineUrlLabel}
              </PillBtn>
              <PillBtn variant="secondary" href={getFormLink()}>
                <FileDown size={15} /> 서식 다운
              </PillBtn>
            </div>
          </div>
        </section>

        {/* Content body */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>

          {/* What is this */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>이 민원은 무엇인가요?</div>
            <p style={{ fontSize: 17, color: AP.body, lineHeight: 1.47, letterSpacing: '-0.374px' }}>{card.whatIsThis}</p>
          </div>

          {/* Who applies */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>누가 신청하나요?</div>
            <p style={{ fontSize: 17, color: AP.body, lineHeight: 1.47, letterSpacing: '-0.374px' }}>{card.whoApplies}</p>
          </div>

          {/* Cases */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>대표 적용 사례</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {card.cases.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: AP.blue,
                    background: '#e8f4ff', borderRadius: 9999,
                    padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0,
                    letterSpacing: '-0.12px', marginTop: 2,
                  }}>사례 {i + 1}</span>
                  <p style={{ fontSize: 15, color: AP.body, lineHeight: 1.6, letterSpacing: '-0.224px' }}>{c}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-checklist */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>준비 자가체크</div>
              <span style={{ fontSize: 13, color: AP.blue }}>{preSt.done}/{preSt.total}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {card.preChecklist.map((item, i) => {
                const checked = !!preChecklist[card.id]?.[i];
                return (
                  <button key={i} onClick={() => togglePre(card.id, i)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderRadius: 14,
                      border: `1px solid ${checked ? AP.blue : AP.hairline}`,
                      background: checked ? '#e8f4ff' : AP.canvas,
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--font-sans)', transition: 'all .15s',
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 14, color: checked ? AP.ink : AP.body, fontWeight: checked ? 600 : 400, letterSpacing: '-0.224px', lineHeight: 1.5 }}>
                      {item}
                    </span>
                    <div style={{
                      width: 22, height: 22, borderRadius: 9999, flexShrink: 0,
                      background: checked ? AP.blue : 'transparent',
                      border: `1.5px solid ${checked ? AP.blue : AP.hairline}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}>
                      {checked && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ height: 4, background: AP.hairline, borderRadius: 9999 }}>
              <div style={{ height: 4, width: `${preSt.pct}%`, background: AP.blue, borderRadius: 9999, transition: 'width .3s' }} />
            </div>
          </div>

          {/* Required docs */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ★ 필수 지참 서류
              </div>
              <span style={{ fontSize: 12, color: '#b45309', background: '#fff4e8', padding: '3px 10px', borderRadius: 9999 }}>
                {docSt.done}/{docSt.total} 준비됨
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {card.requiredDocs.map((doc, i) => {
                const checked = !!checklist[card.id]?.[i];
                return (
                  <button key={i} onClick={() => toggleDoc(card.id, i)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderRadius: 14,
                      border: `1px solid ${checked ? '#10b981' : AP.hairline}`,
                      background: checked ? '#f0fdf4' : AP.canvas,
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--font-sans)', transition: 'all .15s',
                      gap: 12,
                    }}
                  >
                    <span style={{
                      fontSize: 14, letterSpacing: '-0.224px', lineHeight: 1.5,
                      color: checked ? '#6b7280' : AP.ink,
                      fontWeight: checked ? 400 : 600,
                      textDecoration: checked ? 'line-through' : 'none',
                    }}>
                      {doc}
                    </span>
                    <div style={{
                      width: 22, height: 22, borderRadius: 9999, flexShrink: 0,
                      background: checked ? '#10b981' : 'transparent',
                      border: `1.5px solid ${checked ? '#10b981' : AP.hairline}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}>
                      {checked && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ height: 4, background: AP.hairline, borderRadius: 9999 }}>
              <div style={{ height: 4, width: `${docSt.pct}%`, background: '#10b981', borderRadius: 9999, transition: 'width .3s' }} />
            </div>
          </div>

          {/* Helpful docs */}
          {card.helpfulDocs.length > 0 && (
            <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                🔹 가져오면 빠른 서류
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {card.helpfulDocs.map((doc, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#7c3aed', fontSize: 16, flexShrink: 0, marginTop: 1 }}>🔹</span>
                    <span style={{ fontSize: 15, color: AP.body, lineHeight: 1.5, letterSpacing: '-0.224px' }}>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Procedures */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>처리 절차</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {card.procedures.map((proc, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 20 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 9999, flexShrink: 0,
                    background: i < 2 ? AP.blue : AP.hairline,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600,
                    color: i < 2 ? '#fff' : AP.muted,
                    marginTop: 1,
                  }}>
                    {i < 2 ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: i < 2 ? '#10b981' : i === 2 ? AP.blue : AP.muted, letterSpacing: '-0.12px' }}>
                      {i + 1}단계 {i < 2 ? '✓' : i === 2 ? '← 현재' : ''}
                    </span>
                    <p style={{ fontSize: 15, color: i < 2 ? AP.muted : AP.body, lineHeight: 1.5, letterSpacing: '-0.224px', marginTop: 2 }}>{proc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Online guidance */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: AP.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>비대면 온라인 신청</div>
            <div style={{
              background: AP.parchment, borderRadius: 14, padding: '20px',
            }}>
              <p style={{ fontSize: 15, color: AP.body, lineHeight: 1.6, letterSpacing: '-0.224px', marginBottom: 8 }}>{card.onlineGuidance}</p>
              <p style={{ fontSize: 13, color: AP.muted, lineHeight: 1.5, letterSpacing: '-0.224px' }}>
                💡 컴퓨터나 모바일을 이용하시면 대기 없이 즉시 안전하게 신청됩니다.
              </p>
            </div>
          </div>

          {/* Caution */}
          <div style={{ padding: '40px 0', borderBottom: `1px solid ${AP.hairline}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>주의 사항</div>
            <div style={{
              borderLeft: `3px solid #f59e0b`,
              paddingLeft: 16,
            }}>
              <p style={{ fontSize: 15, color: AP.body, lineHeight: 1.6, letterSpacing: '-0.224px' }}>{card.caution}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <PillBtn href={getOnlineLink(card)}>
                <ExternalLink size={15} /> {card.onlineUrlLabel} (온라인 정식 신청)
              </PillBtn>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <a href="tel:1588-0075"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, padding: '16px', borderRadius: 14,
                    background: AP.canvas, border: `1px solid ${AP.hairline}`,
                    textDecoration: 'none', color: AP.ink,
                  }}
                >
                  <Phone size={20} color={AP.blue} />
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.12px' }}>1588-0075</span>
                </a>
                <a href="https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, padding: '16px', borderRadius: 14,
                    background: AP.canvas, border: `1px solid ${AP.hairline}`,
                    textDecoration: 'none', color: AP.ink,
                  }}
                >
                  <Globe size={20} color={AP.blue} />
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.12px' }}>토탈서비스</span>
                </a>
                <a href="https://www.comwel.or.kr/comwel/intr/orgn/find.jsp" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, padding: '16px', borderRadius: 14,
                    background: AP.canvas, border: `1px solid ${AP.hairline}`,
                    textDecoration: 'none', color: AP.ink,
                  }}
                >
                  <MapPin size={20} color={AP.blue} />
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.12px' }}>지사 찾기</span>
                </a>
              </div>
              <a href={getFormLink()} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px', borderRadius: 14,
                  background: AP.canvas, border: `1px solid ${AP.hairline}`,
                  textDecoration: 'none', color: AP.ink, fontSize: 14,
                  letterSpacing: '-0.224px',
                }}
              >
                <FileDown size={16} color={AP.muted} /> 공식 서식 다운
              </a>
              <button
                onClick={() => resetCard(card.id)}
                style={{
                  fontSize: 13, color: AP.muted, cursor: 'pointer',
                  background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
                  padding: '12px', textDecoration: 'underline', letterSpacing: '-0.224px',
                }}
              >
                이 민원의 체크 이력 초기화
              </button>
            </div>
          </div>

          {/* Back */}
          <div style={{ textAlign: 'center' }}>
            <button onClick={backToList} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 14, color: AP.blue, cursor: 'pointer',
              background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.224px',
            }}>
              <ArrowLeft size={14} /> 전체 민원 목록으로
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ── Global Nav ── */
  return (
    <div style={{ minHeight: '100vh', background: AP.canvas, fontFamily: 'var(--font-sans)', color: AP.ink }}>

      {/* Global nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        height: 44,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => { setSelectedCardId(null); scrollTop(); }}
          style={{
            fontSize: 16, fontWeight: 600, color: AP.onDark,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', letterSpacing: '-0.374px',
          }}
        >
          COMWEL QR
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="tel:1588-0075" style={{
            fontSize: 12, color: AP.onDark, textDecoration: 'none',
            background: 'rgba(255,255,255,0.15)', borderRadius: 8,
            padding: '5px 12px', letterSpacing: '-0.12px',
          }}>
            1588-0075
          </a>
          <a href="https://www.comwel.or.kr/" target="_blank" rel="noopener noreferrer" style={{
            fontSize: 12, color: AP.dark1, textDecoration: 'none',
            background: AP.onDark, borderRadius: 8,
            padding: '5px 12px', fontWeight: 600, letterSpacing: '-0.12px',
          }}>
            공식 홈페이지
          </a>
        </div>
      </nav>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {!activeCard ? (
          <ListView key="list" />
        ) : (
          <DetailView key={`detail-${activeCard.id}`} card={activeCard} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            style={{
              position: 'fixed', bottom: 24,
              left: '50%', transform: 'translateX(-50%)',
              zIndex: 100,
              background: AP.dark1,
              color: AP.onDark,
              borderRadius: 14,
              padding: '12px 20px',
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '-0.224px',
              display: 'flex', alignItems: 'center', gap: 10,
              maxWidth: '90vw',
              boxShadow: 'rgba(0,0,0,0.2) 0 8px 32px',
            }}
          >
            <CheckCircle2 size={16} color={AP.blue} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
