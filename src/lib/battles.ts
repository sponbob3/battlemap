import { BattleData } from "./types";
import { ankaraData } from "./ankara";
import { daraData } from "./dara";

export interface SampleBattle {
  slug: string;
  name: string;
  year: string;
  subtitle: string;
  data: BattleData;
}

export const SAMPLE_BATTLES: SampleBattle[] = [
  {
    slug: "battle-of-ankara",
    name: "Battle of Ankara",
    year: "1402 AD",
    subtitle: "Timur shatters Bayezid's Ottoman Empire in a single day",
    data: ankaraData,
  },
  {
    slug: "battle-of-dara",
    name: "Battle of Dara",
    year: "530 AD",
    subtitle: "Belisarius defeats a larger Sasanian force with engineered defense",
    data: daraData,
  },
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findHardcodedBattle(query: string): BattleData | null {
  const q = normalize(query);
  for (const battle of SAMPLE_BATTLES) {
    if (
      normalize(battle.name) === q ||
      normalize(battle.slug) === q ||
      q.includes(normalize(battle.name)) ||
      normalize(battle.name).includes(q)
    ) {
      return battle.data;
    }
  }
  return null;
}
