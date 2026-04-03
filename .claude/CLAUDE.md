# Block Space Wars

모바일 웹 벽돌깨기 게임. 아직 아무것도 없음.
Vite + React + TypeScript + HTML5 Canvas.

## 제약 조건
- 이미지 에셋 없이 Canvas 코드로만 모든 비주얼 구현
- 모바일 터치 우선, 데스크탑도 지원
- 주말 2일 내 MLP(Minimum Lovable Product) 완성

## gstack
모든 웹 브라우징은 /browse 사용. mcp__claude-in-chrome__* 도구 사용 금지.

사용 가능 스킬: /office-hours, /plan-ceo-review, /plan-eng-review,
/plan-design-review, /design-consultation, /design-shotgun, /design-html,
/review, /ship, /land-and-deploy, /canary, /benchmark, /browse,
/connect-chrome, /qa, /qa-only, /design-review, /setup-browser-cookies,
/setup-deploy, /retro, /investigate, /document-release, /codex, /cso,
/autoplan, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn

gstack 스킬이 작동하지 않으면: cd .claude/skills/gstack && ./setup

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health