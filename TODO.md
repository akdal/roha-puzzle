# TODO.md - 3D Puzzle Games Collection

## 완료된 작업 (Completed Tasks)

### 2025-12-25: Hanoi Tower Visual Improvement

**목표 (Goal)**: 하노이 탑 게임의 디스크와 기둥 선택/힌트 시각 피드백 개선

**구현 내용 (Implementation)**:

#### Disk.tsx 변경사항
- 선택된 디스크에 바운스 애니메이션 추가 (사인파, +0.15 오프셋)
- 힌트 디스크에 더 역동적인 바운스 효과 (+0.2 오프셋)
- 선택/힌트 디스크 아래에 글로우 링 추가 (RingGeometry 사용)
- 맥동하는 emissive intensity 애니메이션 구현
- 선택 상태: 앰버 글로우 (#fbbf24)
- 힌트 상태: 시안 글로우 (#22d3ee)

#### Peg.tsx 변경사항
- 기둥 베이스 주변에 선택/힌트 링 효과 추가
- useFrame을 사용한 맥동 emissive 애니메이션 구현
- 힌트 출발지: 골드 펄스 (#fbbf24)
- 힌트 목적지: 시안 펄스 (#22d3ee)
- 선택된 기둥: 미묘한 앰버 펄스

**결과 (Result)**:
- 사용자가 어떤 디스크/기둥이 선택되었는지 명확히 인지 가능
- 힌트 시스템이 시각적으로 더욱 직관적으로 작동
- 게임 플레이 경험 향상 및 시각적 피드백 개선

**관련 파일 (Related Files)**:
- `/Users/hwijin/Projects/cube-3d/src/games/hanoi/Disk.tsx`
- `/Users/hwijin/Projects/cube-3d/src/games/hanoi/Peg.tsx`

---

### 2025-12-25: Unified "New Game" Button

**목표 (Goal)**: 모든 게임의 설정 창에 통일된 "새 게임" 버튼 추가

**관련 커밋**: c38ecd8

---

### 2025-12-25: Rubik's Cube Hint Feature Removal

**목표 (Goal)**: 루빅스 큐브에서 힌트 기능 제거

**관련 커밋**: 0d860f0

---

### 2025-12-25: Hanoi Target Peg Visual Update

**목표 (Goal)**: 하노이 탑 목표 기둥을 흰색으로 변경하고 안내 텍스트 업데이트

**관련 커밋**: 7f4331a

---

### 2025-12-25: Menu Snow Effect & UI Cleanup

**목표 (Goal)**: 메뉴에 떨어지는 눈 효과 추가, 루빅스 큐브에서 테마/반전 버튼 제거

**관련 커밋**: fb4a115

---

## 향후 개선 사항 (Future Improvements)

### 단기 (Short-term)

1. **사운드 효과 추가**
   - 디스크 이동 시 효과음
   - 게임 완료 시 축하 사운드
   - 버튼 클릭 피드백 사운드
   - 우선순위: Medium
   - 예상 작업량: 2-3시간

2. **애니메이션 설정 옵션**
   - 애니메이션 속도 조절 슬라이더
   - 애니메이션 비활성화 옵션
   - 우선순위: Low
   - 예상 작업량: 1-2시간

3. **모바일 터치 최적화**
   - 터치 제스처 개선
   - 반응형 UI 조정
   - 우선순위: High
   - 예상 작업량: 3-4시간

### 중기 (Mid-term)

1. **게임 통계 대시보드**
   - 전체 게임 플레이 통계
   - 시간대별/일별 플레이 기록
   - 우선순위: Medium
   - 예상 작업량: 4-5시간

2. **다크/라이트 테마 전환**
   - 전역 테마 설정
   - 각 게임에 테마 적용
   - 우선순위: Medium
   - 예상 작업량: 3-4시간

3. **튜토리얼 모드**
   - 첫 방문 사용자를 위한 안내
   - 각 게임 규칙 설명
   - 우선순위: Medium
   - 예상 작업량: 4-5시간

### 장기 (Long-term)

1. **멀티플레이어 기능**
   - 실시간 대전 모드
   - 랭킹 시스템
   - 우선순위: Low
   - 예상 작업량: 1-2주

2. **추가 게임**
   - 15 퍼즐 (4x4 슬라이드)
   - 매치-3 퍼즐
   - 우선순위: Low
   - 예상 작업량: 각 1-2일

3. **PWA 지원**
   - 오프라인 플레이
   - 홈 화면 설치
   - 우선순위: Low
   - 예상 작업량: 2-3시간

---

## 알려진 이슈 (Known Issues)

현재 알려진 이슈 없음.

---

## 참고 사항 (Notes)

- 프로덕션 도메인: `3d-puzzle-roha.vercel.app`
- 배포 명령: `npx vercel --prod --yes`
