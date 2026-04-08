import { NextRequest, NextResponse } from "next/server";
import { ankaraData } from "@/lib/ankara";
import { daraData } from "@/lib/dara";
import { findHardcodedBattle } from "@/lib/battles";
import { BattleData } from "@/lib/types";

const SYSTEM_PROMPT = `You are a military historian and battle analyst. The user will ask about a specific battle or conflict. You must research it thoroughly and return a structured JSON response.

Return ONLY valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):

{
  "battleMetadata": {
    "name": "string",
    "date": "string",
    "location": "string",
    "belligerents": ["side A name", "side B name"],
    "commanders": [["side A commanders..."], ["side B commanders..."]],
    "outcome": "string",
    "scale": "string describing scale",
    "environment": "optional: temperate | snow | desert | ocean — match climate/setting for map backdrop colors"
  },
  "context": "2-3 paragraphs of strategic/political context (use \\n\\n between paragraphs)",
  "terrain": [
    {
      "type": "river|forest|hill|ridge|urban|fortification|plain|marsh|road|grassland|woodland|snow|desert|ocean",
      "label": "optional name",
      "points": [{"x": 0-100, "y": 0-100}, ...],
      "width": "optional number for rivers/roads"
    }
  ],
  "forces": [
    {
      "id": "unique-kebab-case-id",
      "name": "Unit name",
      "side": 0 or 1,
      "type": "infantry|cavalry|archers|artillery|tanks|elephants|ships|aircraft|chariots|pikemen",
      "count": number,
      "commander": "Commander name",
      "startPosition": {"x": 0-100, "y": 0-100},
      "color": "hex color - use #8b3a3a for side 0, #3a5a8b for side 1"
    }
  ],
  "phases": [
    {
      "title": "Phase name",
      "timestamp": "Relative or absolute time",
      "duration": "Duration label",
      "narration": "2-3 sentences about what happened tactically",
      "movements": [
        {
          "unitId": "must match a force id",
          "from": {"x": 0-100, "y": 0-100},
          "to": {"x": 0-100, "y": 0-100},
          "action": "advance|retreat|flank|charge|hold|rout|encircle|bombard"
        }
      ],
      "casualties": {
        "side0": number,
        "side1": number,
        "description": "optional"
      },
      "tacticalNote": "Short tactical insight"
    }
  ],
  "aftermath": {
    "outcome": "Summary",
    "casualties": {
      "side0": {"dead": number, "wounded": number, "captured": number},
      "side1": {"dead": number, "wounded": number, "captured": number}
    },
    "significance": "Strategic significance paragraph"
  }
}

IMPORTANT RULES:
- All coordinates use a normalized 0-100 grid (x: left to right, y: top to bottom)
- plain and grassland: optional label placement only (points set label position); they do not render a filled region — open ground is always the map backdrop
- Terrain selection order: first map decisive obstacles (rivers, marsh, coast, urban choke points, fortification lines, key roads), then add elevation features only if they materially shape maneuver
- Use type "ridge" only when historically justified by significant large-scale relief (major mountain flank, long escarpment, dominant high ground) and place it where it actually exists on that battlefield; do not include ridge by default
- Never add mirrored left/right border ridges unless the battlefield is specifically a valley or corridor bounded by high ground on both sides
- Use "hill" for localized rises on the battlefield
- Prefer one accurate major elevation feature over multiple speculative ones; if uncertain, use fewer and smaller elevation features
- Place terrain features realistically relative to battlefield geography
- Side 0 forces should generally start in the bottom half (y: 50-80), side 1 in the top half (y: 20-50)
- Each phase's movements must reference valid unitIds from the forces array
- Movement "from" positions should match the unit's position at the end of the previous phase
- Create 4-8 phases that tell the story of the battle progression
- Include 6-12 unit groups covering both sides
- Make narration engaging and educational
- Tactical notes should reference well-known military concepts where applicable`;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, focus } = body as { query: string; focus?: string };

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const hardcoded = findHardcodedBattle(query);
  if (hardcoded) {
    return NextResponse.json(hardcoded);
  }

  // Prefer the new featured hardcoded scenario when no direct sample match exists.
  if (/\\bdara\\b/i.test(query)) {
    return NextResponse.json(daraData);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(ankaraData);
  }

  try {
    const userMessage = focus
      ? `Research and analyze: ${query}. Specific focus: ${focus}`
      : `Research and analyze: ${query}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 5,
          },
        ],
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return NextResponse.json(ankaraData);
    }

    const result = await response.json();

    let jsonText = "";
    for (const block of result.content) {
      if (block.type === "text") {
        jsonText += block.text;
      }
    }

    jsonText = jsonText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const battleData: BattleData = JSON.parse(jsonText);

    if (
      !battleData.battleMetadata ||
      !battleData.phases ||
      !battleData.forces
    ) {
      throw new Error("Invalid battle data structure");
    }

    return NextResponse.json(battleData);
  } catch (error) {
    console.error("Error processing battle research:", error);
    return NextResponse.json(ankaraData);
  }
}
