import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  Check,
  ArrowLeft,
  ExternalLink,
  Phone,
  Globe,
  MapPin,
  FileDown,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { COMPLAINT_CARDS, CATEGORIES } from './data';
import { ComplaintCard, SavedChecklist } from './types';

/* ══════════════════════════════════════════════════════
   IBM Carbon Design System v11 — Design Tokens (White theme)
   https://carbondesignsystem.com
══════════════════════════════════════════════════════ */
const C = {
  /* Backgrounds / Layers */
  background:      '#ffffff',   // $background
  layer01:         '#f4f4f4',   // $layer-01 (Gray 10)
  layer02:         '#ffffff',   // $layer-02
  layerAccent01:   '#e0e0e0',   // $layer-accent-01

  /* Interactive (Blue 60) */
  interactive:     '#0f62fe',   // $interactive — primary action
  interactiveHov:  '#0050e6',   // hover half-step
  interactiveAct:  '#002d9c',   // active Blue 80

  /* Text */
  textPrimary:     '#161616',   // $text-primary
  textSecondary:   '#525252',   // $text-secondary
  textPlaceholder: '#a8a8a8',   // $text-placeholder
  textOnColor:     '#ffffff',   // $text-on-color
  textHelper:      '#6f6f6f',   // $text-helper
  link:            '#0f62fe',   // $link-primary

  /* Icon */
  iconPrimary:     '#161616',
  iconSecondary:   '#525252',
  iconOnColor:     '#ffffff',
  iconInteractive: '#0f62fe',

  /* Border */
  borderSubtle01:  '#e0e0e0',   // $border-subtle-01
  borderStrong01:  '#8d8d8d',   // $border-strong-01
  borderInteractive: '#0f62fe', // $border-interactive

  /* Support */
  supportError:    '#da1e28',   // $support-error
  supportSuccess:  '#198038',   // $support-success
  supportWarning:  '#f1c21b',   // $support-warning
  supportInfo:     '#0043ce',   // $support-info (Blue 70)

  /* Notification */
  notificationBgInfo: '#edf5ff',// Blue 10

  /* Tag colors (category specific) */
  tagBlueBg:       '#d0e2ff',
  tagBlueText:     '#0043ce',
  tagGreenBg:      '#defbe6',
  tagGreenText:    '#0e6027',
  tagTealBg:       '#d9fbfb',
  tagTealText:     '#004144',
  tagPurpleBg:     '#e8daff',
  tagPurpleText:   '#6929c4',

  /* Shell */
  shellBg:         '#161616',   // $shell-header-bg-01 (Gray 100)
  shellText:       '#f4f4f4',   // $shell-header-text-01
};

/* ── Spacing (8px base) ───────────────────────────── */
const S = {
  s1: '2px', s2: '4px', s3: '8px', s4: '12px',
  s5: '16px', s6: '24px', s7: '32px', s8: '40px',
  s9: '48px', s10: '64px', s11: '80px', s12: '96px',
};

/* ── Typography (IBM Plex Sans — productive set) ──── */
const T: Record<string, React.CSSProperties> = {
  label01:     { fontSize: '12px', lineHeight: '16px', fontWeight: 400, letterSpacing: '.32px' },
  body01:      { fontSize: '14px', lineHeight: '20px', fontWeight: 400, letterSpacing: '.16px' },
  body02:      { fontSize: '16px', lineHeight: '24px', fontWeight: 400, letterSpacing: '0px' },
  bodyCompact01: { fontSize: '14px', lineHeight: '18px', fontWeight: 400, letterSpacing: '.16px' },
  heading01:   { fontSize: '14px', lineHeight: '18px', fontWeight: 600, letterSpacing: '.16px' },
  heading02:   { fontSize: '16px', lineHeight: '22px', fontWeight: 600, letterSpacing: '0px' },
  heading03:   { fontSize: '20px', lineHeight: '28px', fontWeight: 400, letterSpacing: '0px' },
  heading04:   { fontSize: '28px', lineHeight: '36px', fontWeight: 400, letterSpacing: '0px' },
  heading05:   { fontSize: '32px', lineHeight: '40px', fontWeight: 400, letterSpacing: '0px' },
  heading06:   { fontSize: '42px', lineHeight: '50px', fontWeight: 300, letterSpacing: '0px' },
  heading07:   { fontSize: '54px', lineHeight: '64px', fontWeight: 300, letterSpacing: '0px' },
  code01:      { fontSize: '12px', lineHeight: '16px', fontWeight: 400, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '.32px' },
};

/* ── Link helpers ────────────────────────────────── */
const getOnlineLink = (card: ComplaintCard) => {
  if (card.category === '복지·지원 사업') return 'https://welfare.comwel.or.kr/';
  if (card.onlineUrlLabel.includes('정부24')) return 'https://www.gov.kr/';
  return 'https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp';
};
const getFormLink = () => 'https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp';

/* ── Category tag tokens ─────────────────────────── */
const getCatTag = (category: string) => {
  switch (category) {
    case '자주 찾는 민원': return { bg: C.tagBlueBg,   text: C.tagBlueText };
    case '가입지원':       return { bg: C.tagGreenBg,  text: C.tagGreenText };
    case '재활보상':       return { bg: C.tagTealBg,   text: C.tagTealText };
    case '복지·지원 사업': return { bg: C.tagPurpleBg, text: C.tagPurpleText };
    default:              return { bg: C.layer01,     text: C.textSecondary };
  }
};

/* ── Glossary ────────────────────────────────────── */
const GLOSSARY = [
  { term: '피보험자격', spec: '상용·일용 근로 자격', def: '고용·산재보험에 정식 가입되어 행정적 혜택을 수령할 자격. 입사 시 취득, 퇴사 시 상실 신고가 필요합니다.' },
  { term: '보수총액',   spec: '세전 소득 실제 결산액', def: '전년도 1년간 지급된 비과세 제외 세전 임금 총액. 매년 3월 정산하여 보험료 차감 또는 추징을 결정합니다.' },
  { term: '요양급여',   spec: '산재 치료비 지원',      def: '업무상 부상 또는 질병으로 4일 이상 치료가 필요한 경우 산재보험 범위 내의 요양비를 지원합니다.' },
  { term: '휴업급여',   spec: '치료 기간 소득 보전',   def: '요양으로 취업하지 못한 기간에 생계 안정을 위해 1일당 평균임금의 70%를 지급하는 제도입니다.' },
  { term: '장해급여',   spec: '치료 종결 후 장해 보상', def: '치료가 종결되었으나 영구 장해가 남을 때 장해등급(1~14급)에 따라 연금 또는 일시금을 지급합니다.' },
  { term: '이직확인서', spec: '퇴사 사실 공증 서류',   def: '근로자 퇴사 사실과 이직 사유를 증명하는 문서. 실업급여 심사에 필요하며 공단에 제출됩니다.' },
];

export default function App() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [activeGlossaryIdx, setActiveGlossaryIdx] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [checklist, setChecklist] = useState<SavedChecklist>(() => {
    try { const s = localStorage.getItem('carbon-checklist'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [preChecklist, setPreChecklist] = useState<{ [k: string]: { [i: number]: boolean } }>(() => {
    try { const s = localStorage.getItem('carbon-pre-checklist'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'info' } | null>(null);

  useEffect(() => {
    try { localStorage.setItem('carbon-checklist', JSON.stringify(checklist)); } catch {}
  }, [checklist]);
  useEffect(() => {
    try { localStorage.setItem('carbon-pre-checklist', JSON.stringify(preChecklist)); } catch {}
  }, [preChecklist]);

  const triggerToast = (msg: string, kind: 'success' | 'info' = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleDoc = (cardId: string, idx: number) => {
    setChecklist(prev => {
      const c = { ...(prev[cardId] ?? {}) };
      c[idx] = !c[idx];
      return { ...prev, [cardId]: c };
    });
  };
  const togglePre = (cardId: string, idx: number) => {
    setPreChecklist(prev => {
      const c = { ...(prev[cardId] ?? {}) };
      c[idx] = !c[idx];
      return { ...prev, [cardId]: c };
    });
  };
  const resetCard = (cardId: string) => {
    setChecklist(prev => { const u = { ...prev }; delete u[cardId]; return u; });
    setPreChecklist(prev => { const u = { ...prev }; delete u[cardId]; return u; });
    triggerToast('체크 이력을 초기화했습니다.', 'info');
  };

  const getDocStatus = (card: ComplaintCard) => {
    const c = checklist[card.id] ?? {};
    const done = Object.values(c).filter(Boolean).length;
    return { done, total: card.requiredDocs.length, pct: card.requiredDocs.length > 0 ? Math.round((done / card.requiredDocs.length) * 100) : 0 };
  };
  const getPreStatus = (card: ComplaintCard) => {
    const c = preChecklist[card.id] ?? {};
    const done = Object.values(c).filter(Boolean).length;
    return { done, total: card.preChecklist.length, pct: card.preChecklist.length > 0 ? Math.round((done / card.preChecklist.length) * 100) : 0 };
  };

  const activeCard = useMemo(() =>
    selectedCardId ? COMPLAINT_CARDS.find(c => c.id === selectedCardId) ?? null : null,
    [selectedCardId]
  );
  const filteredCards = useMemo(() =>
    activeCategory === '전체' ? COMPLAINT_CARDS : COMPLAINT_CARDS.filter(c => c.category === activeCategory),
    [activeCategory]
  );

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' });
  const openDetail = (id: string) => { setSelectedCardId(id); scrollTop(); };
  const backToList = () => { setSelectedCardId(null); scrollTop(); };

  /* ── Carbon Button ───────────────────────────────── */
  const CarbonBtn = ({
    children, onClick, href, kind = 'primary', size = 'md', icon,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
  }) => {
    const heights: Record<string, string> = { sm: '32px', md: '40px', lg: '48px' };
    const pads:    Record<string, string> = { sm: '0 15px', md: '0 15px', lg: '0 15px' };
    const kinds: Record<string, React.CSSProperties> = {
      primary:   { background: C.interactive, color: C.textOnColor, border: 'none' },
      secondary: { background: C.layer01, color: C.textPrimary, border: `1px solid ${C.borderStrong01}` },
      tertiary:  { background: 'transparent', color: C.interactive, border: `1px solid ${C.interactive}` },
      ghost:     { background: 'transparent', color: C.interactive, border: 'none' },
      danger:    { background: C.supportError, color: C.textOnColor, border: 'none' },
    };
    const style: React.CSSProperties = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 8, height: heights[size], padding: pads[size],
      fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
      ...T.bodyCompact01, fontWeight: 600,
      cursor: 'pointer', textDecoration: 'none',
      borderRadius: 0,  // Carbon has 0px radius on buttons
      transition: 'background .1s',
      whiteSpace: 'nowrap',
      ...kinds[kind],
    };
    if (href) return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        <span>{children}</span>
        {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      </a>
    );
    return (
      <button onClick={onClick} style={style}>
        <span>{children}</span>
        {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      </button>
    );
  };

  /* ── Carbon Tag ──────────────────────────────────── */
  const CarbonTag = ({ label, bg, text }: { label: string; bg: string; text: string }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 24, padding: '0 8px',
      background: bg, color: text,
      ...T.label01, fontWeight: 400,
      fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
      borderRadius: '100px',
    }}>
      {label}
    </span>
  );

  /* ── Carbon Checkbox row ────────────────────────── */
  const CheckRow = ({
    label, checked, onChange, strikethrough = false,
  }: {
    label: string; checked: boolean; onChange: () => void; strikethrough?: boolean;
  }) => (
    <button onClick={onChange}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 16px',
        background: checked ? C.notificationBgInfo : C.background,
        borderTop: `1px solid ${C.borderSubtle01}`,
        cursor: 'pointer', textAlign: 'left',
        width: '100%', border: 'none',
        borderBottom: 'none',
        fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
        transition: 'background .1s',
      }}
    >
      {/* Carbon checkbox shape */}
      <div style={{
        width: 18, height: 18, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? C.interactive : C.borderStrong01}`,
        background: checked ? C.interactive : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 2,
        transition: 'all .1s',
      }}>
        {checked && <Check size={12} color={C.textOnColor} />}
      </div>
      <span style={{
        ...T.body01, color: checked ? C.textSecondary : C.textPrimary,
        textDecoration: strikethrough && checked ? 'line-through' : 'none',
        lineHeight: '20px',
        fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
      }}>
        {label}
      </span>
    </button>
  );

  /* ── Progress bar (Carbon style) ────────────────── */
  const ProgressBar = ({ pct, color = C.interactive }: { pct: number; color?: string }) => (
    <div style={{ background: C.layerAccent01, height: 8 }}>
      <div style={{ height: 8, width: `${pct}%`, background: color, transition: 'width .3s' }} />
    </div>
  );

  /* ════════════════════════════════════════════════
     LIST VIEW
  ════════════════════════════════════════════════ */
  const ListView = () => (
    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>

      {/* ── HERO (Gray 100 dark shell) ── */}
      <section style={{ background: C.shellBg, padding: '40px 16px', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: 1056, margin: '0 auto', boxSizing: 'border-box' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: S.s7, ...T.label01, color: C.textPlaceholder, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            <span>홈</span>
            <span>/</span>
            <span style={{ color: C.shellText }}>방문 전 QR 길잡이</span>
          </div>

          <div style={{ maxWidth: 672 }}>
            <div style={{ ...T.label01, color: C.interactive, marginBottom: S.s4, textTransform: 'uppercase', letterSpacing: '.16px', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              고객용 방문 전 안내 서비스
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 8vw, 54px)', lineHeight: 1.15, fontWeight: 300, color: C.shellText, marginBottom: S.s5, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              방문 전<br />QR 길잡이
            </h1>
            <p style={{ ...T.body02, color: C.textPlaceholder, marginBottom: S.s8, maxWidth: 560, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>
              QR 한 번으로 민원유형 확인 · 준비서류 점검 · 공식 신청 경로 연결까지.
              방문 전 준비하면 시간이 절약됩니다.
            </p>
            <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
              <CarbonBtn kind="primary" size="lg" href="https://www.comwel.or.kr/" icon={<ExternalLink size={16} />}>공식 홈페이지</CarbonBtn>
              <CarbonBtn kind="tertiary" size="lg" href="https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp" icon={<FileDown size={16} />}>서식 다운로드</CarbonBtn>
            </div>
          </div>

          {/* Stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, marginTop: S.s8, borderTop: `1px solid #393939` }}>
            {[
              { num: '4', label: '민원 카테고리' },
              { num: '13+', label: '수록 민원 종류' },
              { num: '0건', label: '개인정보 수집' },
              { num: '100%', label: '무료 자가진단' },
            ].map((s, i) => (
              <div key={i} style={{ padding: `${S.s6} ${S.s5} ${S.s6} 0`, borderRight: (i % 2 === 0) ? `1px solid #393939` : 'none', borderBottom: i < 2 ? `1px solid #393939` : 'none' }}>
                <div style={{ fontSize: 'clamp(28px, 6vw, 42px)', lineHeight: 1.2, fontWeight: 300, color: C.shellText, fontFamily: "'IBM Plex Sans', sans-serif" }}>{s.num}</div>
                <div style={{ ...T.body01, color: C.textPlaceholder, marginTop: 4, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARDS SECTION ── */}
      <section style={{ background: C.layer01, padding: '40px 16px', boxSizing: 'border-box' as const, width: '100%' }}>
        <div style={{ maxWidth: 1056, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: S.s7, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ ...T.label01, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.32px', marginBottom: S.s3, fontFamily: "'IBM Plex Sans', sans-serif" }}>민원 안내</div>
              <h2 style={{ ...T.heading05, color: C.textPrimary, fontFamily: "'IBM Plex Sans', sans-serif" }}>어떤 업무로 방문하시나요?</h2>
            </div>
          </div>

          {/* Content switcher (Carbon tab style) */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.borderSubtle01}`, marginBottom: S.s7, overflowX: 'auto' }}>
            {['전체', ...CATEGORIES.map(c => c.label)].map(cat => {
              const active = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: `${S.s4} ${S.s5}`,
                    background: 'transparent', border: 'none',
                    borderBottom: active ? `3px solid ${C.interactive}` : '3px solid transparent',
                    ...T.body01, fontWeight: active ? 600 : 400,
                    color: active ? C.textPrimary : C.textSecondary,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
                    transition: 'border .1s, color .1s',
                  }}
                >{cat}</button>
              );
            })}
          </div>

          {/* Card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: C.borderSubtle01 }}>
            {filteredCards.map(card => {
              const tag = getCatTag(card.category);
              const doc = getDocStatus(card);
              return (
                <motion.div key={card.id} whileHover={{ backgroundColor: C.layer01 }} transition={{ duration: .1 }}
                  onClick={() => openDetail(card.id)}
                  style={{
                    background: C.background, padding: S.s6,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12,
                    borderLeft: `4px solid transparent`,
                    transition: 'border .1s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = C.interactive; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent'; }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <CarbonTag label={card.category} bg={tag.bg} text={tag.text} />
                    <span style={{ ...T.label01, color: C.textHelper, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{card.target}</span>
                  </div>

                  {/* Title */}
                  <div style={{ ...T.heading02, color: C.textPrimary, lineHeight: '24px', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>
                    {card.title}
                  </div>

                  {/* Tagline */}
                  <div style={{ ...T.body01, color: C.textSecondary, lineHeight: '20px', flex: 1, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>
                    {card.tagLine}
                  </div>

                  {/* Progress (if any) */}
                  {doc.done > 0 && (
                    <div>
                      <div style={{ ...T.label01, color: C.interactive, marginBottom: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        서류 준비 {doc.done}/{doc.total}
                      </div>
                      <ProgressBar pct={doc.pct} />
                    </div>
                  )}

                  {/* Ghost CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.interactive, ...T.body01, fontWeight: 600, marginTop: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    안내 보기 <ChevronRight size={16} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESS SECTION (White) ── */}
      <section style={{ background: C.background, padding: '40px 16px', boxSizing: 'border-box' as const, width: '100%' }}>
        <div style={{ maxWidth: 1056, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ ...T.label01, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.32px', marginBottom: S.s3, fontFamily: "'IBM Plex Sans', sans-serif" }}>이용 흐름</div>
          <h2 style={{ ...T.heading05, color: C.textPrimary, marginBottom: S.s9, fontFamily: "'IBM Plex Sans', sans-serif" }}>4단계로 방문 준비 완료</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, background: C.borderSubtle01 }}>
            {[
              { step: '01', title: 'QR 스캔', desc: '포스터·안내문의 QR 코드를 스캔하면 모바일 웹에 즉시 접속됩니다.' },
              { step: '02', title: '민원 선택', desc: '4개 카테고리에서 해당 업무를 선택하면 상세 안내로 이동합니다.' },
              { step: '03', title: '서류 체크', desc: '필수 지참 서류와 자격 요건을 항목별로 터치하여 자가진단합니다.' },
              { step: '04', title: '창구 방문', desc: '준비 완료 후 지사 창구를 방문하면 빠른 접수가 가능합니다.' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.background, padding: S.s7 }}>
                <div style={{ ...T.heading06, color: C.interactive, marginBottom: S.s4, fontFamily: "'IBM Plex Sans', sans-serif" }}>{s.step}</div>
                <div style={{ height: 2, width: 32, background: C.interactive, marginBottom: S.s5 }} />
                <div style={{ ...T.heading02, color: C.textPrimary, marginBottom: S.s4, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{s.title}</div>
                <div style={{ ...T.body01, color: C.textSecondary, lineHeight: '20px', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOSSARY (Gray 100) ── */}
      <section style={{ background: C.shellBg, padding: '40px 16px', boxSizing: 'border-box' as const, width: '100%' }}>
        <div style={{ maxWidth: 1056, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ ...T.label01, color: '#6f6f6f', textTransform: 'uppercase', letterSpacing: '.32px', marginBottom: S.s3, fontFamily: "'IBM Plex Sans', sans-serif" }}>용어 사전</div>
          <h2 style={{ ...T.heading05, color: C.shellText, marginBottom: S.s8, fontFamily: "'IBM Plex Sans', sans-serif" }}>공단 핵심 행정 용어</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 0, borderTop: '1px solid #393939' }}>
            {GLOSSARY.map((g, i) => {
              const open = activeGlossaryIdx === i;
              return (
                <div key={i} style={{ borderBottom: '1px solid #393939' }}>
                  <button onClick={() => setActiveGlossaryIdx(open ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: S.s6,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: open ? '#262626' : 'transparent', border: 'none',
                      cursor: 'pointer', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif",
                    }}
                  >
                    <div style={{ display: 'flex', gap: S.s5, alignItems: 'baseline' }}>
                      <span style={{ ...T.heading01, color: C.shellText, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{g.term}</span>
                      <span style={{ ...T.label01, color: '#6f6f6f', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{g.spec}</span>
                    </div>
                    <ChevronDown size={16} color="#6f6f6f"
                      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .15 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: `0 ${S.s6} ${S.s6}`, ...T.body01, color: '#c6c6c6', lineHeight: '20px', background: '#262626', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>
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

      {/* ── PORTAL HUB (Layer 01) ── */}
      <section style={{ background: C.layer01, padding: '40px 16px', boxSizing: 'border-box' as const, width: '100%' }}>
        <div style={{ maxWidth: 1056, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ ...T.label01, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.32px', marginBottom: S.s3, fontFamily: "'IBM Plex Sans', sans-serif" }}>공식 연결</div>
          <h2 style={{ ...T.heading04, color: C.textPrimary, marginBottom: S.s7, fontFamily: "'IBM Plex Sans', sans-serif" }}>원터치 포털 허브</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: C.borderSubtle01 }}>
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
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: S.s6, background: C.background,
                  textDecoration: 'none', color: C.textPrimary,
                  borderLeft: `4px solid transparent`,
                  transition: 'border .1s, background .1s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = C.interactive;
                  (e.currentTarget as HTMLElement).style.background = C.layer01;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.background = C.background;
                }}
              >
                <div>
                  <div style={{ ...T.heading01, color: C.textPrimary, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{p.label}</div>
                  <div style={{ ...T.label01, color: C.textSecondary, marginTop: 2, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{p.sub}</div>
                </div>
                <ExternalLink size={16} color={C.iconInteractive} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section style={{ background: C.background, padding: '32px 16px', boxSizing: 'border-box' as const, width: '100%' }}>
        <div style={{ maxWidth: 1056, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ background: C.notificationBgInfo, borderLeft: `4px solid ${C.supportInfo}`, padding: S.s5, display: 'flex', gap: S.s4, alignItems: 'flex-start' }}>
            <AlertTriangle size={20} color={C.supportInfo} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ ...T.heading01, color: C.textPrimary, marginBottom: 4, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>비공식 안내 서비스</div>
              <div style={{ ...T.body01, color: C.textSecondary, lineHeight: '20px', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>
                본 플랫폼은 근로복지공단 공식 웹사이트가 아닌 비공식 정보 안내 도우미입니다.
                제공되는 정보 및 체크리스트는 참고용이며 법적 효력을 가지지 않습니다.
                어떠한 개인정보도 수집·서버에 저장하지 않습니다.
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* ── FOOTER ── */}
      <footer style={{ background: C.shellBg, padding: '32px 16px 24px', borderTop: '1px solid #393939', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: 1056, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* 2x2 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px 16px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #393939',
          }}>

            {/* 민원 안내 */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f4', marginBottom: 10, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>민원 안내</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['요양급여', '휴업급여', '이직확인서', '장해급여'].map((l, j) => (
                  <li key={j} style={{ fontSize: 13, color: '#c6c6c6', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{l}</li>
                ))}
              </ul>
            </div>

            {/* 가입지원 */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f4', marginBottom: 10, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>가입지원</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['피보험자격', '보수총액신고', '보험관계성립', '소멸신고'].map((l, j) => (
                  <li key={j} style={{ fontSize: 13, color: '#c6c6c6', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{l}</li>
                ))}
              </ul>
            </div>

            {/* 복지 사업 */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f4', marginBottom: 10, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>복지 사업</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['생활안정자금', '직업훈련 생계비', '임금체불 지원'].map((l, j) => (
                  <li key={j} style={{ fontSize: 13, color: '#c6c6c6', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{l}</li>
                ))}
              </ul>
            </div>

            {/* 바로가기 */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f4', marginBottom: 10, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>바로가기</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: '근로복지공단', href: 'https://www.comwel.or.kr/' },
                  { label: '고용산재토탈', href: 'https://www.comwel.or.kr/comwel/info/data/papr/papr_lst.jsp' },
                  { label: '정부24', href: 'https://www.gov.kr/' },
                  { label: '1588-0075', href: 'tel:1588-0075' },
                ].map((l, j) => (
                  <li key={j}>
                    <a href={l.href}
                      target={l.href.startsWith('tel') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, color: C.interactive, textDecoration: 'none', fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* 저작권 */}
          <p style={{ fontSize: 11, color: '#6f6f6f', fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: '16px', margin: 0 }}>
            © 2026 방문 전 안심 길잡이 (비공식 도우미). All rights reserved.<br />
            개인정보 미수집 · 서버 미사용 · 완전 정적 서비스
          </p>
        </div>
      </footer>

      {/* Inline toast (Carbon notification style) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 100,
              background: toast.kind === 'success' ? '#defbe6' : C.notificationBgInfo,
              borderLeft: `4px solid ${toast.kind === 'success' ? C.supportSuccess : C.supportInfo}`,
              padding: `${S.s4} ${S.s5}`,
              display: 'flex', alignItems: 'center', gap: S.s4,
              maxWidth: 360,
              boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
            }}
          >
            <CheckCircle2 size={16} color={toast.kind === 'success' ? C.supportSuccess : C.supportInfo} />
            <span style={{ ...T.body01, color: C.textPrimary, fontFamily: "'IBM Plex Sans', 'Noto Sans KR', sans-serif" }}>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
