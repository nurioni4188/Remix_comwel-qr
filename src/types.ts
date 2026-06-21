export interface ComplaintCard {
  id: string;
  title: string;
  category: string;               // '자주 찾는 민원' | '가입지원' | '재활보상' | '복지·지원 사업'
  target: string;                 // '근로자' | '사업주' | '유족' | '공통'
  tagLine: string;
  
  // 상세 화면용 필드 구성 (원본 이미지 참고)
  whatIsThis: string;             // 이 민원은 무엇인가요?
  whoApplies: string;             // 누가 신청하나요?
  cases: string[];                // 전형적인 사례 목록
  preChecklist: string[];         // 방문 전 체크리스트 내 질문지 목록 (자가진단용)
  requiredDocs: string[];         // 필수 준비해야 할 서류 (★ 빨간 별표 목록)
  helpfulDocs: string[];          // 가져오면 빠른 서류 (🔹 파란 마름모 목록)
  procedures: string[];           // 신청 및 처리 절차 (타임라인 단계 목록)
  onlineGuidance: string;         // 비대면 온라인 신청 안내 내용
  caution: string;                // 반려 방지 주의 조항
  
  // 아날로그 연동 링크 및 레이블들
  onlineUrlLabel: string;
  formUrlLabel: string;
  statuteUrlLabel: string;
}

export interface SavedChecklist {
  [cardId: string]: {
    [docIndex: number]: boolean;
  };
}
