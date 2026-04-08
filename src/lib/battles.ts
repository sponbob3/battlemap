import { BattleData } from "./types";
import { ankaraData } from "./ankara";
import { barbarossaData } from "./barbarossa";
import { daraData } from "./dara";
import { grandSlamData } from "./grandslam";
import { kargilData } from "./kargil";
import { uhudData } from "./uhud";
import { yarmoukData } from "./yarmouk";

export interface SampleBattle {
  slug: string;
  name: string;
  year: string;
  subtitle: string;
  data: BattleData;
}

export const SAMPLE_BATTLES: SampleBattle[] = [
  {
    slug: "operation-barbarossa",
    name: "Operation Barbarossa",
    year: "1941",
    subtitle: "Ten-phase study from blitz breakthrough to Moscow winter reversal",
    data: barbarossaData,
  },
  {
    slug: "battle-of-yarmouk",
    name: "Battle of Yarmouk",
    year: "636 CE",
    subtitle: "Khalid's reserve cavalry and ravine geography break Byzantine Syria army",
    data: yarmoukData,
  },
  {
    slug: "kargil-war-1999",
    name: "Kargil War (Pakistani Push)",
    year: "1999",
    subtitle: "Ten-phase high-altitude study of intrusion, interdiction, and rollback",
    data: kargilData,
  },
  {
    slug: "battle-of-uhud",
    name: "Battle of Uhud",
    year: "625 CE",
    subtitle: "Early Muslim gains reverse after cavalry exploitation of the Ainain pass",
    data: uhudData,
  },
  {
    slug: "operation-grand-slam",
    name: "Operation Grand Slam",
    year: "1965",
    subtitle: "Pakistani thrust at Chhamb-Jaurian aimed to cut Akhnoor communications",
    data: grandSlamData,
  },
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
