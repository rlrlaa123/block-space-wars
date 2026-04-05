export interface CutsceneScreen {
  character: 'turtle' | 'rabbit' | 'dragon-king' | 'guard' | 'none'
  text: string
}

export interface ChapterStory {
  prologue: CutsceneScreen[]
  epilogue: CutsceneScreen[]
  // Mid-chapter interludes keyed by the stage index they play AFTER clearing.
  // Example: { 3: [...] } plays after clearing stage 3 (index).
  interludes?: Record<number, CutsceneScreen[]>
}

export const STORIES: ChapterStory[] = [
  // ═══════════════════════════════════════════
  // Chapter 1: 용왕의 명령
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'none', text: '머나먼 우주의 심해.\n용궁 왕국은 고요했다...' },
      { character: 'dragon-king', text: '"콜록... 콜록...!\n내 몸이 자꾸 약해지는구나."' },
      { character: 'dragon-king', text: '"의원이 말하길,\n토끼의 간을 먹어야\n이 병이 낫는다 하더라."' },
      { character: 'turtle', text: '"폐하, 제가 가겠습니다.\n우주 끝 토끼별까지라도요."' },
    ],
    interludes: {
      3: [
        { character: 'dragon-king', text: '"거북아, 들리느냐.\n이 통신은 용궁에서다."' },
        { character: 'dragon-king', text: '"길은 험하지.\n그러나 믿고 있다."' },
      ],
      6: [
        { character: 'turtle', text: '(이 훈련은 끝이 없다...\n정말 내가 할 수 있을까?)' },
        { character: 'turtle', text: '"아니. 할 수 있다.\n폐하께서 믿어주시니."' },
      ],
    },
    epilogue: [
      { character: 'turtle', text: '시험은 가혹했다.\n하지만 나는 통과했다.' },
      { character: 'none', text: '용궁의 수문이 열렸다.\n거북이의 첫 우주 비행.' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 2: 우주로의 출발
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'turtle', text: '별들이 흐르고 있었다.\n이렇게 많은 별은 처음이다.' },
      { character: 'none', text: '그때, 경보가 울렸다.' },
      { character: 'turtle', text: '"소행성대...!\n정면으로 돌파해야 한다."' },
    ],
    interludes: {
      3: [
        { character: 'none', text: '파편 하나가 선체를 긁고 지나간다.\n쇳소리가 선실을 울렸다.' },
        { character: 'turtle', text: '"아직... 괜찮아.\n아직 갈 수 있어."' },
      ],
      6: [
        { character: 'turtle', text: '"연료가 절반을 넘겼다.\n지금 돌아가도 이상하지 않아."' },
        { character: 'turtle', text: '"...하지만 여기서 포기하면\n폐하는 어떻게 되지?"' },
      ],
    },
    epilogue: [
      { character: 'turtle', text: '운석 사이를 빠져나왔다.\n우주선은 아직 날고 있다.' },
      { character: 'turtle', text: '"저기다. 파란 별."' },
      { character: 'none', text: '토끼별이 시야에 들어왔다.' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 3: 토끼별 도착
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'turtle', text: '토끼별은 상상과 달랐다.\n달빛 같은 풀밭, 그리고... 요새.' },
      { character: 'guard', text: '"정지! 신분을 밝혀라!"' },
      { character: 'turtle', text: '"...평화의 사신입니다.\n토끼님을 뵈러 왔습니다."' },
      { character: 'guard', text: '"수상한 놈이로군.\n통과할 수 있나 보자!"' },
    ],
    interludes: {
      3: [
        { character: 'guard', text: '"거북이 주제에 제법이다.\n하지만 여기까지다."' },
        { character: 'turtle', text: '"...미안합니다. 지나가야 해요."' },
      ],
      6: [
        { character: 'none', text: '요새의 깊숙한 복도.\n거북이는 숨을 고른다.' },
        { character: 'turtle', text: '"거의 다 왔다.\n이 문 너머에..."' },
      ],
    },
    epilogue: [
      { character: 'none', text: '왕좌의 방 앞.\n문이 서서히 열렸다.' },
      { character: 'rabbit', text: '"호오?\n우주 거북이라니, 진귀하군."' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 4: 속임수
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'turtle', text: '"토끼님, 용궁에 가시면\n부귀영화를 누리실 수 있습니다."' },
      { character: 'rabbit', text: '"흠... 듣기에는 달콤하군."' },
      { character: 'rabbit', text: '"그런데 왜 갑자기\n나를 초대하지?"' },
    ],
    interludes: {
      3: [
        { character: 'rabbit', text: '"설명이 너무 매끄럽군.\n외운 것 같기도 하고."' },
        { character: 'turtle', text: '(침착해. 침착해야 해.)' },
      ],
      6: [
        { character: 'turtle', text: '(심장이 터질 것 같다.\n이 거짓말이 통할까?)' },
        { character: 'rabbit', text: '"...거북이, 눈을 피하는군."' },
      ],
    },
    epilogue: [
      { character: 'rabbit', text: '"잠깐.\n방금 뭐라고 했지?"' },
      { character: 'rabbit', text: '"내 간을 쓴다고?!\n너, 나를 속인 거구나!!"' },
    ],
  },

  // ═══════════════════════════════════════════
  // Chapter 5: 토끼의 역습
  // ═══════════════════════════════════════════
  {
    prologue: [
      { character: 'rabbit', text: '"거북아, 내가 바보인 줄\n알았느냐?"' },
      { character: 'rabbit', text: '"간은 집에 두고 왔다!\n자, 쫓아와보시지!"' },
      { character: 'turtle', text: '"토끼! 멈춰!!"' },
    ],
    interludes: {
      3: [
        { character: 'rabbit', text: '"거북이의 속도로는 무리지.\n하하하!"' },
        { character: 'turtle', text: '"너... 생각보다 교활하구나!"' },
      ],
      6: [
        { character: 'turtle', text: '(이 여정이 이렇게 끝나는 건가...)' },
        { character: 'turtle', text: '"하지만 배운 것이 있다.\n이 우주 자체가 선물이다."' },
      ],
    },
    epilogue: [
      { character: 'rabbit', text: '"하하하! 수고했다.\n다음엔 더 똑똑한 수를 써라."' },
      { character: 'turtle', text: '빈손으로 돌아가는 길.\n우주는 여전히 아름다웠다.' },
      { character: 'turtle', text: '폐하의 병은 못 고칠지 모른다.\n그러나 나는 더 먼 곳을 보았다.' },
      { character: 'turtle', text: '돌아가면 폐하께\n이 여정의 이야기를\n들려드려야겠다.' },
      { character: 'none', text: '— 끝 —\n\nBLOCK SPACE WARS\nRabbit Tales' },
    ],
  },
]
