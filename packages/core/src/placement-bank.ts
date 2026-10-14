import type { LevelBand } from "./levels";

/**
 * Original placement items. Not taken from exams or textbooks.
 * The answer key stays on the server; the public item type omits it.
 */

export interface PlacementMcq {
  id: string;
  skill: "grammar" | "vocabulary" | "reading" | "listening";
  level: LevelBand;
  prompt: string;
  koreanHint: string;
  options: readonly [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  passage?: string;
  listenText?: string;
  /** Reading and listening questions that share one text. */
  groupId?: string;
}

export interface PlacementPrompt {
  id: string;
  level: LevelBand;
  prompt: string;
  koreanHint: string;
}

export interface PlacementBank {
  mcq: readonly PlacementMcq[];
  writing: readonly PlacementPrompt[];
}

const grammarHint = "가장 알맞은 말을 고르세요.";
const vocabHint = "문맥에 가장 맞는 말을 고르세요.";

export const PLACEMENT_BANK: PlacementBank = {
  mcq: [
    mcq(
      "g-a2-1",
      "grammar",
      "A2",
      "I ___ coffee every morning.",
      ["drink", "drinks", "drinking", "drank"],
      0,
    ),
    mcq("g-a2-2", "grammar", "A2", "She ___ a teacher.", ["is", "are", "am", "be"], 0),
    mcq(
      "g-b1-1",
      "grammar",
      "B1",
      "If it rains tomorrow, we ___ at home.",
      ["will stay", "stayed", "staying", "stays"],
      0,
    ),
    mcq(
      "g-b1-2",
      "grammar",
      "B1",
      "I have lived here ___ 2019.",
      ["since", "for", "during", "ago"],
      0,
    ),
    mcq(
      "g-b1p-1",
      "grammar",
      "B1+",
      "She suggested ___ the meeting early.",
      ["leaving", "to leave", "leave", "left"],
      0,
    ),
    mcq(
      "g-b1p-2",
      "grammar",
      "B1+",
      "The report ___ by Friday.",
      ["must be finished", "must finish", "must finished", "must be finish"],
      0,
    ),
    mcq(
      "g-b2-1",
      "grammar",
      "B2",
      "Had I known about the delay, I ___ earlier.",
      ["would have left", "would leave", "had left", "will leave"],
      0,
    ),
    mcq(
      "g-b2-2",
      "grammar",
      "B2",
      "Not only ___ late, he also forgot the notes.",
      ["did he arrive", "he arrived", "arrived he", "he did arrived"],
      0,
    ),
    mcq(
      "g-c1-1",
      "grammar",
      "C1",
      "Were it not for the traffic this morning, we ___ on time.",
      ["would have arrived", "would arrive", "had arrived", "arrived"],
      0,
    ),
    mcq(
      "g-c1-2",
      "grammar",
      "C1",
      "Rarely ___ such a clear explanation.",
      ["have I heard", "I have heard", "I heard", "did I heard"],
      0,
    ),

    mcq(
      "v-a2-1",
      "vocabulary",
      "A2",
      "The shop is ___ at 9.",
      ["open", "opened", "opener", "openingly"],
      0,
    ),
    mcq(
      "v-a2-2",
      "vocabulary",
      "A2",
      "Can you ___ me the salt?",
      ["pass", "past", "post", "press"],
      0,
    ),
    mcq(
      "v-b1-1",
      "vocabulary",
      "B1",
      "We need to ___ a table for dinner.",
      ["book", "lend", "borrow", "owe"],
      0,
    ),
    mcq(
      "v-b1-2",
      "vocabulary",
      "B1",
      "The train was late, so I ___ my appointment.",
      ["missed", "lost", "failed", "dropped"],
      0,
    ),
    mcq(
      "v-b1p-1",
      "vocabulary",
      "B1+",
      "Could you ___ that email to the whole team?",
      ["forward", "borrow", "postpone", "afford"],
      0,
    ),
    mcq(
      "v-b1p-2",
      "vocabulary",
      "B1+",
      "I am not sure yet. I need to ___ it over.",
      ["think", "look", "take", "get"],
      0,
    ),
    mcq(
      "v-b2-1",
      "vocabulary",
      "B2",
      "The new policy may ___ small shops.",
      ["affect", "effect", "afford", "effort"],
      0,
    ),
    mcq(
      "v-b2-2",
      "vocabulary",
      "B2",
      "She gave a clear ___ of the problem.",
      ["account", "accent", "access", "accord"],
      0,
    ),
    mcq(
      "v-c1-1",
      "vocabulary",
      "C1",
      "His comment was ___ as a joke, but nobody laughed.",
      ["intended", "pretended", "attended", "extended"],
      0,
    ),
    mcq(
      "v-c1-2",
      "vocabulary",
      "C1",
      "The results are not ___ with last year's report.",
      ["consistent", "constant", "consequent", "considerate"],
      0,
    ),

    ...passage(
      "r-a2",
      "reading",
      "A2",
      "Mina takes the bus to work. The bus leaves at 8. She buys a coffee near the office.",
      [
        ["What time does the bus leave?", ["8", "9", "7", "10"], 0],
        [
          "Where does Mina buy coffee?",
          ["Near the office", "On the bus", "At home", "At the station"],
          0,
        ],
      ],
    ),
    ...passage(
      "r-b1",
      "reading",
      "B1",
      "Jun was going to meet a friend at 6, but the friend texted to say she would be twenty minutes late. Jun decided to wait in a cafe across the street and order tea.",
      [
        [
          "Why is Jun in the cafe?",
          [
            "His friend is late",
            "The cafe is his office",
            "He missed the bus",
            "The meeting was cancelled",
          ],
          0,
        ],
        ["How late is the friend?", ["20 minutes", "6 minutes", "One hour", "She is not late"], 0],
      ],
    ),
    ...passage(
      "r-b1p",
      "reading",
      "B1+",
      "The team agreed to move the product launch from Monday to Thursday. Hana will email customers today, and Ben will update the website after he finishes the slides.",
      [
        ["When is the launch now?", ["Thursday", "Monday", "Today", "After the slides"], 0],
        ["Who emails the customers?", ["Hana", "Ben", "The customers", "Nobody yet"], 0],
      ],
    ),
    ...passage(
      "r-b2",
      "reading",
      "B2",
      "Although the workshop was optional, most of the staff attended. Several people said afterwards that the examples were useful, but that the last activity ran too long and should be shorter next time.",
      [
        [
          "How did most people feel about the examples?",
          ["They were useful", "They were too long", "They were optional", "They were confusing"],
          0,
        ],
        [
          "What should change next time?",
          [
            "The last activity should be shorter",
            "The workshop should be required",
            "Fewer staff should attend",
            "The examples should be removed",
          ],
          0,
        ],
      ],
    ),
    ...passage(
      "r-c1",
      "reading",
      "C1",
      "The committee stopped short of rejecting the proposal. Instead it asked the author to clarify how the extra cost would be covered, implying that approval was still possible if that point were answered.",
      [
        [
          "What did the committee do?",
          [
            "It asked for a clearer cost plan",
            "It rejected the proposal",
            "It approved the extra cost",
            "It replaced the author",
          ],
          0,
        ],
        [
          "Approval is still possible if the author…",
          [
            "explains the extra cost",
            "withdraws the proposal",
            "shortens the committee",
            "ignores the question",
          ],
          0,
        ],
      ],
    ),

    ...listen(
      "l-a2",
      "listening",
      "A2",
      "The meeting room is on the second floor. Please bring a notebook.",
      [
        [
          "Where is the meeting room?",
          ["On the second floor", "On the first floor", "Next to the cafe", "Outside"],
          0,
        ],
        ["What should you bring?", ["A notebook", "A laptop", "Lunch", "A ticket"], 0],
      ],
    ),
    ...listen(
      "l-b1",
      "listening",
      "B1",
      "I can't join the call at three because I have a dentist appointment. I can talk at four thirty.",
      [
        [
          "Why can't the speaker join at three?",
          [
            "They have a dentist appointment",
            "The call was cancelled",
            "They are on holiday",
            "The office is closed",
          ],
          0,
        ],
        ["When can they talk?", ["At 4:30", "At 3:00", "Tomorrow morning", "They cannot talk"], 0],
      ],
    ),
    ...listen(
      "l-b1p",
      "listening",
      "B1+",
      "Let's postpone the client visit until next Wednesday. I'll send a new calendar invite after I check the train times.",
      [
        [
          "What are they postponing?",
          ["A client visit", "A train trip alone", "A calendar training", "Wednesday's holiday"],
          0,
        ],
        [
          "What will the speaker do next?",
          [
            "Check the train times and send an invite",
            "Visit the client today",
            "Cancel the client",
            "Buy the train tickets for the team",
          ],
          0,
        ],
      ],
    ),
    ...listen(
      "l-b2",
      "listening",
      "B2",
      "I'd rather we didn't promise a date yet. The design is fine, but we still haven't tested it with real customers, and that could change the schedule.",
      [
        [
          "What is the speaker worried about?",
          [
            "Testing with real customers may change the schedule",
            "The design is not fine",
            "Customers already rejected it",
            "The date was promised last week",
          ],
          0,
        ],
        [
          "What does the speaker not want to do yet?",
          ["Promise a date", "Test with customers", "Keep the design", "Change the schedule"],
          0,
        ],
      ],
    ),
    ...listen(
      "l-c1",
      "listening",
      "C1",
      "I'm not opposed to the idea itself. I just think we should weigh it against the work we've already committed to, otherwise we'll dilute both.",
      [
        [
          "What is the speaker's position?",
          [
            "The idea is acceptable, but it competes with existing work",
            "The idea should be rejected",
            "Existing work should be cancelled",
            "Both projects are already finished",
          ],
          0,
        ],
        [
          'What does "dilute both" warn against?',
          [
            "Doing both poorly by splitting effort",
            "Mixing the two budgets",
            "Publishing both on the same day",
            "Hiring for both teams",
          ],
          0,
        ],
      ],
    ),
  ],
  writing: [
    {
      id: "w-a2",
      level: "A2",
      prompt: "Write three or four sentences about what you usually do on a weekday morning.",
      koreanHint: "평일 아침에 보통 하는 일을 짧은 문장으로 쓰세요.",
    },
    {
      id: "w-b1",
      level: "B1",
      prompt:
        "A friend is visiting your city for one day. Write a short message suggesting what to do together and why.",
      koreanHint: "하루 동안 같이 할 일과 이유를 짧게 제안하세요.",
    },
    {
      id: "w-b1p",
      level: "B1+",
      prompt:
        "Your team meeting was moved to Friday. Write a short message to a teammate explaining the change and what they should prepare.",
      koreanHint: "회의가 금요일로 바뀐 이유와 준비할 점을 쓰세요.",
    },
    {
      id: "w-b2",
      level: "B2",
      prompt:
        "Some people prefer to learn a language alone, and others prefer a class. Explain which you prefer, and why.",
      koreanHint: "혼자 배우는 것과 수업 중 어느 쪽을 선호하는지 이유를 쓰세요.",
    },
    {
      id: "w-c1",
      level: "C1",
      prompt:
        "A colleague wants to skip user testing to launch sooner. Write a short reply that disagrees and proposes a practical compromise.",
      koreanHint: "사용자 테스트를 빼자는 의견에 반대하고, 절충안을 쓰세요.",
    },
  ],
};

function mcq(
  id: string,
  skill: "grammar" | "vocabulary",
  level: LevelBand,
  prompt: string,
  options: readonly [string, string, string, string],
  answerIndex: 0 | 1 | 2 | 3,
): PlacementMcq {
  return {
    id,
    skill,
    level,
    prompt,
    koreanHint: skill === "grammar" ? grammarHint : vocabHint,
    options,
    answerIndex,
  };
}

function passage(
  groupId: string,
  skill: "reading",
  level: LevelBand,
  text: string,
  questions: ReadonlyArray<[string, readonly [string, string, string, string], 0 | 1 | 2 | 3]>,
): PlacementMcq[] {
  return questions.map(([prompt, options, answerIndex], index) => ({
    id: `${groupId}-${index + 1}`,
    groupId,
    skill,
    level,
    passage: text,
    prompt,
    koreanHint: "글을 읽고 알맞은 답을 고르세요.",
    options,
    answerIndex,
  }));
}

function listen(
  groupId: string,
  skill: "listening",
  level: LevelBand,
  spoken: string,
  questions: ReadonlyArray<[string, readonly [string, string, string, string], 0 | 1 | 2 | 3]>,
): PlacementMcq[] {
  return questions.map(([prompt, options, answerIndex], index) => ({
    id: `${groupId}-${index + 1}`,
    groupId,
    skill,
    level,
    listenText: spoken,
    prompt,
    koreanHint: "듣고 알맞은 답을 고르세요. 다시 들을 수 있습니다.",
    options,
    answerIndex,
  }));
}
