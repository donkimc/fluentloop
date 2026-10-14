import { LEVEL_BANDS, type LevelBand, type Skill } from "./levels";

/**
 * Curriculum backbone for daily generation.
 *
 * Bands B1, B1+, and B2 are the focus. A2 and C1 are edge bands.
 * Vocabulary is original. The New General Service List 1.2 (Browne, Culligan,
 * and Phillips) is Creative Commons BY-SA 4.0, so that list is not copied here.
 */

export const TOPICS = ["daily-life", "work", "travel", "small-talk", "opinions"] as const;

export type Topic = (typeof TOPICS)[number];

export const CORE_BANDS = ["B1", "B1+", "B2"] as const satisfies readonly LevelBand[];

export interface CurriculumNode {
  id: string;
  level: LevelBand;
  skill: Skill;
  topic: Topic;
  title: string;
  korean: string;
  summary: string;
  headwords: readonly string[];
}

const TASKS: Record<
  Topic,
  Record<"reading" | "listening" | "writing", Pick<CurriculumNode, "title" | "korean" | "summary">>
> = {
  "daily-life": {
    reading: {
      title: "A note about today's plans",
      korean: "오늘 일정에 대한 짧은 글",
      summary: "Someone explains what they are doing today and why one plan changed.",
    },
    listening: {
      title: "A voicemail about errands",
      korean: "심부름에 대한 음성 메시지",
      summary: "A friend lists two errands and asks for a small favor.",
    },
    writing: {
      title: "Describe a normal weekday",
      korean: "평범한 평일을 설명하기",
      summary: "The learner describes a weekday and one thing they would change.",
    },
  },
  work: {
    reading: {
      title: "A short project update",
      korean: "짧은 업무 진행 소식",
      summary: "A teammate reports what is done, what is late, and what they need.",
    },
    listening: {
      title: "A standup update",
      korean: "스탠드업 업데이트",
      summary: "Someone says what they finished and what is blocking them.",
    },
    writing: {
      title: "Reply to a schedule change",
      korean: "일정 변경에 답장하기",
      summary: "The learner agrees to a new time and says what they will prepare.",
    },
  },
  travel: {
    reading: {
      title: "A message about a trip delay",
      korean: "여행 지연에 대한 메시지",
      summary: "A traveler explains a delay and how they will still meet.",
    },
    listening: {
      title: "Directions from the station",
      korean: "역에서 찾아가는 길",
      summary: "Someone gives two steps for getting from the station to a cafe.",
    },
    writing: {
      title: "Suggest a plan for a visitor",
      korean: "방문객에게 일정 제안하기",
      summary: "The learner suggests where to go for one day and why.",
    },
  },
  "small-talk": {
    reading: {
      title: "A chat after a long week",
      korean: "긴 한 주 뒤의 대화",
      summary: "Two people catch up and one of them mentions a plan for the weekend.",
    },
    listening: {
      title: "Small talk before a meeting",
      korean: "회의 전 스몰토크",
      summary: "Two people greet each other and ask about the weekend.",
    },
    writing: {
      title: "Keep a conversation going",
      korean: "대화를 이어 가기",
      summary: "The learner answers a casual question and asks one back.",
    },
  },
  opinions: {
    reading: {
      title: "A short opinion with a reason",
      korean: "이유 하나를 댄 짧은 의견",
      summary: "Someone states a preference and gives one concrete reason.",
    },
    listening: {
      title: "Agree, then add a point",
      korean: "동의한 뒤 의견 보태기",
      summary: "A person agrees with a colleague and adds one different example.",
    },
    writing: {
      title: "Give an opinion and a reason",
      korean: "의견과 이유 쓰기",
      summary: "The learner takes a side on a familiar question and explains why.",
    },
  },
};

const GRAMMAR: readonly CurriculumNode[] = [
  grammar(
    "a2-be-have",
    "A2",
    "daily-life",
    "be and have",
    "be와 have",
    "Introduce people and say what they have.",
  ),
  grammar(
    "a2-present-simple",
    "A2",
    "daily-life",
    "Present simple for routines",
    "루틴을 말하는 현재시제",
    "Talk about habits with everyday time words.",
  ),
  grammar(
    "b1-present-perfect",
    "B1",
    "daily-life",
    "Present perfect with since and for",
    "since와 for를 쓰는 현재완료",
    "Talk about something that started in the past and continues.",
  ),
  grammar(
    "b1-first-conditional",
    "B1",
    "travel",
    "First conditional",
    "가정법 현재",
    "Talk about a likely future result.",
  ),
  grammar(
    "b1-comparatives",
    "B1",
    "opinions",
    "Comparatives",
    "비교급",
    "Compare two choices and say which is better.",
  ),
  grammar(
    "b1-past-vs-perfect",
    "B1",
    "small-talk",
    "Past simple and present perfect",
    "과거와 현재완료",
    "Choose the past simple for a finished time and the present perfect when the time is open.",
  ),
  grammar(
    "b1p-gerunds",
    "B1+",
    "work",
    "Gerunds after suggest and enjoy",
    "suggest와 enjoy 뒤의 동명사",
    "Use a gerund after common verbs instead of an infinitive.",
  ),
  grammar(
    "b1p-obligation",
    "B1+",
    "work",
    "must, have to, and should",
    "must, have to, should",
    "Separate a rule, a necessity, and advice.",
  ),
  grammar(
    "b1p-passive",
    "B1+",
    "work",
    "Present and past passive",
    "현재와 과거 수동태",
    "Focus on what happened when the doer is not important.",
  ),
  grammar(
    "b1p-relative",
    "B1+",
    "travel",
    "Defining relative clauses",
    "한정 관계절",
    "Add who or which to identify a person or thing.",
  ),
  grammar(
    "b2-second-conditional",
    "B2",
    "opinions",
    "Second conditional",
    "가정법 과거",
    "Talk about an unreal present or future.",
  ),
  grammar(
    "b2-reported-speech",
    "B2",
    "work",
    "Reported speech",
    "간접화법",
    "Report what someone said without quoting them.",
  ),
  grammar(
    "b2-wish",
    "B2",
    "daily-life",
    "wish and if only",
    "wish와 if only",
    "Talk about a present situation you want to be different.",
  ),
  grammar(
    "b2-modals-past",
    "B2",
    "travel",
    "Modals for past speculation",
    "과거에 대한 추측",
    "Use might have and must have for past guesses.",
  ),
  grammar(
    "c1-inversion",
    "C1",
    "opinions",
    "Negative inversion",
    "부정어 도치",
    "Put a negative adverb first for emphasis.",
  ),
  grammar(
    "c1-hedging",
    "C1",
    "work",
    "Hedging",
    "완곡한 표현",
    "Soften a claim with seems, tends to, or a modal.",
  ),
];

const VOCABULARY: Record<LevelBand, Record<Topic, readonly string[]>> = {
  A2: {
    "daily-life": ["morning", "breakfast", "bus", "home", "dinner", "early"],
    work: ["job", "office", "email", "meeting", "boss", "late"],
    travel: ["ticket", "station", "map", "hotel", "bag", "train"],
    "small-talk": ["weekend", "weather", "friend", "movie", "busy", "fine"],
    opinions: ["like", "prefer", "good", "bad", "because", "think"],
  },
  B1: {
    "daily-life": [
      "routine",
      "appointment",
      "neighbor",
      "grocery",
      "schedule",
      "errand",
      "remind",
      "laundry",
    ],
    work: ["deadline", "colleague", "schedule", "update", "attach", "confirm", "postpone", "task"],
    travel: [
      "reservation",
      "platform",
      "delay",
      "luggage",
      "transfer",
      "one-way",
      "arrive",
      "book",
    ],
    "small-talk": [
      "catch up",
      "recently",
      "plan",
      "recommend",
      "free",
      "looking forward",
      "actually",
      "by the way",
    ],
    opinions: [
      "agree",
      "disagree",
      "reason",
      "advantage",
      "disadvantage",
      "prefer",
      "point",
      "example",
    ],
  },
  "B1+": {
    "daily-life": [
      "commute",
      "chore",
      "convenient",
      "arrange",
      "balance",
      "occasional",
      "household",
      "postpone",
    ],
    work: [
      "follow up",
      "priority",
      "feedback",
      "available",
      "estimate",
      "hand over",
      "in charge",
      "move forward",
    ],
    travel: [
      "connection",
      "boarding",
      "refund",
      "itinerary",
      "nearby",
      "overlook",
      "check in",
      "get around",
    ],
    "small-talk": [
      "how's it going",
      "not bad",
      "the other day",
      "sounds good",
      "come over",
      "for a change",
      "pretty busy",
      "take it easy",
    ],
    opinions: [
      "on the one hand",
      "fair point",
      "it depends",
      "rather",
      "tend to",
      "in my view",
      "trade-off",
      "for instance",
    ],
  },
  B2: {
    "daily-life": [
      "prioritize",
      "commitment",
      "overlook",
      "maintain",
      "flexible",
      "inconvenience",
      "coordinate",
      "habit",
    ],
    work: [
      "stakeholder",
      "scope",
      "workaround",
      "bottleneck",
      "align",
      "deliverable",
      "push back",
      "on track",
    ],
    travel: [
      "layover",
      "reimburse",
      "detour",
      "peak season",
      "spare",
      "run out of",
      "in advance",
      "end up",
    ],
    "small-talk": [
      "small world",
      "long time no see",
      "what have you been up to",
      "can't complain",
      "that reminds me",
      "off the top of my head",
      "as it happens",
      "no rush",
    ],
    opinions: [
      "to some extent",
      "I see your point",
      "that said",
      "drawback",
      "worthwhile",
      "I'm not convinced",
      "on balance",
      "a case in point",
    ],
  },
  C1: {
    "daily-life": [
      "juggle",
      "streamline",
      "obligation",
      "accommodate",
      "constraint",
      "foreseeable",
    ],
    work: ["caveat", "viable", "defer", "oversight", "contention", "preliminary"],
    travel: ["contingency", "proximity", "divert", "at short notice", "en route", "holdup"],
    "small-talk": [
      "touch base",
      "circle back",
      "for what it's worth",
      "between you and me",
      "as luck would have it",
      "I won't keep you",
    ],
    opinions: [
      "nuance",
      "qualify",
      "reservations",
      "with all due respect",
      "the crux",
      "broadly speaking",
    ],
  },
};

function grammar(
  id: string,
  level: LevelBand,
  topic: Topic,
  title: string,
  korean: string,
  summary: string,
): CurriculumNode {
  return { id, level, skill: "grammar", topic, title, korean, summary, headwords: [] };
}

function skillNodes(): CurriculumNode[] {
  const skills = ["reading", "listening", "writing"] as const;
  return LEVEL_BANDS.flatMap((level) =>
    TOPICS.flatMap((topic) =>
      skills.map((skill) => {
        const task = TASKS[topic][skill];
        return {
          id: `${level.toLowerCase().replace("+", "p")}-${skill}-${topic}`,
          level,
          skill,
          topic,
          title: task.title,
          korean: task.korean,
          summary: task.summary,
          headwords: [],
        };
      }),
    ),
  );
}

function vocabularyNodes(): CurriculumNode[] {
  return LEVEL_BANDS.flatMap((level) =>
    TOPICS.map((topic) => ({
      id: `${level.toLowerCase().replace("+", "p")}-vocabulary-${topic}`,
      level,
      skill: "vocabulary" as const,
      topic,
      title: topic.replace("-", " "),
      korean: TOPIC_KOREAN[topic],
      summary: `Words and phrases for ${topic.replace("-", " ")} at ${level}.`,
      headwords: VOCABULARY[level][topic],
    })),
  );
}

const TOPIC_KOREAN: Record<Topic, string> = {
  "daily-life": "일상",
  work: "일",
  travel: "여행",
  "small-talk": "스몰토크",
  opinions: "의견",
};

export const CURRICULUM: readonly CurriculumNode[] = [
  ...GRAMMAR,
  ...vocabularyNodes(),
  ...skillNodes(),
];

export function isCoreBand(level: LevelBand): boolean {
  return (CORE_BANDS as readonly string[]).includes(level);
}

export function curriculumNodes(
  filter: { level?: LevelBand; skill?: Skill; topic?: Topic } = {},
): CurriculumNode[] {
  return CURRICULUM.filter((node) => {
    if (filter.level && node.level !== filter.level) return false;
    if (filter.skill && node.skill !== filter.skill) return false;
    if (filter.topic && node.topic !== filter.topic) return false;
    return true;
  });
}

/**
 * The nodes a nightly shared set should cover: every grammar point at the
 * band, plus the topic's vocabulary, reading, listening, and writing nodes.
 */
export function nodesForDailySet(level: LevelBand, topic: Topic): CurriculumNode[] {
  const grammar = curriculumNodes({ level, skill: "grammar" });
  const rest = (["vocabulary", "reading", "listening", "writing"] as const).map((skill) => {
    const exact = curriculumNodes({ level, skill, topic })[0];
    const fallback = curriculumNodes({ level, skill })[0];
    const node = exact ?? fallback;
    if (!node) throw new Error(`No ${skill} node for ${level}.`);
    return node;
  });
  return [...grammar, ...rest];
}
