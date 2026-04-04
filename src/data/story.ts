export interface CutsceneScreen {
  character: 'turtle' | 'rabbit' | 'dragon-king' | 'guard' | 'none'
  text: string
}

export interface ChapterStory {
  prologue: CutsceneScreen[]
  epilogue: CutsceneScreen[]
}

export const STORIES: ChapterStory[] = [
  // Chapter 1: 용왕의 명령
  {
    prologue: [
      { character: 'dragon-king', text: '심해의 용궁이 위기에 처했다.\n용왕은 병에 걸렸고,\n유일한 치료법은 토끼의 간...' },
      { character: 'dragon-king', text: '"거북아, 네가 우주로 가서\n토끼의 간을 가져오거라.\n이것은 명령이다."' },
    ],
    epilogue: [
      { character: 'turtle', text: '거북이는 용왕의 시험을 통과했다.\n우주로 향하는 여정이 시작된다.' },
    ],
  },
  // Chapter 2: 우주로의 출발
  {
    prologue: [
      { character: 'turtle', text: '거북이는 우주선에 올라탔다.\n별들 사이를 가르며\n토끼별을 향해 출발한다.' },
      { character: 'none', text: '하지만 소행성대가\n거북이의 앞을 막아선다...' },
    ],
    epilogue: [
      { character: 'turtle', text: '소행성대를 무사히 통과했다.\n저 멀리 토끼별이 보인다!' },
    ],
  },
  // Chapter 3: 토끼별 도착
  {
    prologue: [
      { character: 'turtle', text: '토끼별에 도착한 거북이.\n하지만 경비대가 삼엄하다.' },
      { character: 'guard', text: '"멈춰라! 이곳은 함부로\n들어올 수 없는 곳이다!"' },
    ],
    epilogue: [
      { character: 'turtle', text: '경비대를 뚫고 들어간 거북이는\n마침내 토끼를 만났다.\n"토끼님, 반갑습니다..."' },
    ],
  },
  // Chapter 4: 속임수
  {
    prologue: [
      { character: 'turtle', text: '"토끼님, 용궁에 가면\n부귀영화를 누릴 수 있습니다.\n함께 가시지요."' },
      { character: 'rabbit', text: '"흠... 정말인가?\n뭔가 수상한데..."' },
    ],
    epilogue: [
      { character: 'rabbit', text: '"잠깐, 내 간을 원한다고?!\n거북아, 너 나를 속인 거야!"' },
    ],
  },
  // Chapter 5: 토끼의 역습
  {
    prologue: [
      { character: 'rabbit', text: '"거북아, 내가 바보인 줄 알았나?\n간은 집에 두고 왔다고!\n나를 잡을 수 있으면 잡아봐!"' },
      { character: 'turtle', text: '"토끼! 멈춰!!"' },
    ],
    epilogue: [
      { character: 'rabbit', text: '"하하하! 거북아, 수고했다.\n다음에는 더 똑똑한 수를 써야 할걸?"' },
      { character: 'turtle', text: '거북이는 빈손으로 돌아왔다.\n하지만 우주를 여행하며\n진짜 소중한 것을 깨달았다...' },
      { character: 'none', text: '— 끝 —\n\n감사합니다!\nBLOCK SPACE WARS\nRabbit Tales' },
    ],
  },
]
