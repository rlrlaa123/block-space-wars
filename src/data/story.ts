export interface CutsceneScreen {
  character: 'turtle' | 'rabbit' | 'dragon-king' | 'guard' | 'none'
  text: string
}

export interface ChapterStory {
  prologue: CutsceneScreen[]
  epilogue: CutsceneScreen[]
}

export const STORIES: ChapterStory[] = [
  // ═══════════════════════════════════════════
  // Chapter 1: 용왕의 명령
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'none', text: '머나먼 우주의 심해.\n용궁 왕국은 수 천 년간\n고요했다...' },
      { character: 'dragon-king', text: '"콜록... 콜록...!\n내 몸이 자꾸 약해지는구나.\n이대로라면 왕국은..."' },
      { character: 'dragon-king', text: '"의원의 말이,\n토끼의 간을 먹어야만\n병을 고칠 수 있다 하더라."' },
      { character: 'turtle', text: '"폐하, 제가 가겠습니다.\n우주 끝 토끼별까지라도\n다녀오겠나이다."' },
      { character: 'dragon-king', text: '"거북아, 너만이 할 수 있다.\n이것은 왕의 명령이자\n왕국의 운명이다."' },
    ],
    epilogue: [
      { character: 'turtle', text: '시험은 가혹했다.\n하지만 나는 통과했다.' },
      { character: 'turtle', text: '이제 진짜 여정이 시작된다.\n우주선의 엔진이 깨어나고...' },
      { character: 'none', text: '용궁의 수문이 열렸다.\n거북이의 첫 우주 비행.' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 2: 우주로의 출발
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'turtle', text: '별들이 흐르고 있었다.\n이렇게 많은 별을\n내 눈으로 보는 건 처음이다.' },
      { character: 'turtle', text: '"토끼별까지...\n얼마나 걸릴까."' },
      { character: 'none', text: '그때였다.\n우주선 경보가 울렸다.' },
      { character: 'turtle', text: '"소행성대...!\n이 많은 운석을 어떻게..."' },
      { character: 'turtle', text: '"할 수 있다.\n폐하가 나를 믿으셨으니.\n나도 나를 믿어야 한다."' },
    ],
    epilogue: [
      { character: 'turtle', text: '파편이 우주선을 스쳐갔다.\n조금만 빗나갔어도...' },
      { character: 'turtle', text: '"저기다. 파란 별."' },
      { character: 'none', text: '토끼별이 시야에 들어왔다.\n푸른 빛이 감도는 작은 행성.' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 3: 토끼별 도착
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'turtle', text: '토끼별은 상상과 달랐다.\n달빛 같은 풀밭,\n그리고... 요새.' },
      { character: 'none', text: '토끼 왕국의 경비대가\n거북이의 앞을 가로막았다.' },
      { character: 'guard', text: '"정지!\n신분과 목적을 밝혀라!"' },
      { character: 'turtle', text: '"...저는 평화의 사신입니다.\n토끼님을 뵈러 왔습니다."' },
      { character: 'guard', text: '"수상한 놈이로군.\n어디 통과할 수 있나 보자!"' },
    ],
    epilogue: [
      { character: 'turtle', text: '경비를 뚫었다.\n심장이 쿵쿵 뛴다.' },
      { character: 'none', text: '왕좌의 방 앞.\n문이 서서히 열렸다.' },
      { character: 'turtle', text: '"토끼님...\n드디어 뵙게 되었습니다."' },
      { character: 'rabbit', text: '"호오?\n우주 거북이라니, 진귀하군."' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 4: 속임수
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'turtle', text: '"토끼님, 용궁에 가시면\n부귀영화를 누리실 수 있습니다."' },
      { character: 'turtle', text: '"황금의 궁전, 진주의 정원...\n그 모든 것이 토끼님을\n기다리고 있습니다."' },
      { character: 'rabbit', text: '"흠... 듣기에는 달콤하군.\n하지만 세상에 공짜는 없지."' },
      { character: 'rabbit', text: '"거북이 양반,\n왜 갑자기 나를 초대하지?"' },
      { character: 'turtle', text: '(심장이 떨린다.\n이 거짓말이 통할까...?)' },
    ],
    epilogue: [
      { character: 'rabbit', text: '"...잠깐."' },
      { character: 'rabbit', text: '"방금 뭐라고 했지?\n내 간을 쓴다고?!"' },
      { character: 'turtle', text: '"아, 아니, 그게 아니라—"' },
      { character: 'rabbit', text: '"거북아! 너...\n나를 속인 거구나!!"' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 5: 토끼의 역습
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'rabbit', text: '"거북아, 내가 정말\n바보인 줄 알았느냐?"' },
      { character: 'rabbit', text: '"간은 집에 두고 왔다!\n소중한 건 함부로 들고\n돌아다니지 않거든."' },
      { character: 'turtle', text: '"토끼, 잠깐만 얘기하자!"' },
      { character: 'rabbit', text: '"할 말이 남았다면\n나를 잡고 해!"' },
      { character: 'rabbit', text: '"자, 쫓아와보시지!\n거북이의 속도로 말야!"' },
    ],
    epilogue: [
      { character: 'rabbit', text: '"하하하하!\n수고했다, 거북아."' },
      { character: 'rabbit', text: '"다음에는 조금 더\n똑똑한 수를 쓰도록."' },
      { character: 'turtle', text: '"..."' },
      { character: 'turtle', text: '빈손으로 돌아가는 길.\n우주는 여전히 아름다웠다.' },
      { character: 'turtle', text: '폐하의 병은 낫지 않을지 모른다.\n그러나 나는\n더 먼 곳을 보았다.' },
      { character: 'turtle', text: '별들 사이의 고요함,\n낯선 땅의 경비병,\n교활하지만 지혜로운 토끼—' },
      { character: 'turtle', text: '돌아가면 폐하께\n이 모든 이야기를\n들려드려야겠다.' },
      { character: 'none', text: '— 끝 —\n\n감사합니다.\n\nBLOCK SPACE WARS\nRabbit Tales' },
    ],
  },
]
