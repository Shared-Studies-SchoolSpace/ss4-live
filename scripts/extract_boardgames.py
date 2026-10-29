#!/usr/bin/env python3
"""Extract theBoardGames schedule, Lichess links and titles from the WhatsApp
group export and write src/features/chess-league/data/boardGamesData.json.

Usage: python3 scripts/extract_boardgames.py "SS4 Chess League.zip"
"""
import json
import re
import sys
import zipfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/features/chess-league/data/boardGamesData.json"

zpath = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / "SS4 Chess League.zip")
with zipfile.ZipFile(zpath) as z:
    text = z.read("chat.txt").decode("utf-8").replace("\r", "")

# ── split into messages: "[10/9/26, 6:06:46 PM] Sender: body"
MSG = re.compile(r"^\[(\d+)/(\d+)/(\d+), [^\]]+\] ([^:]+): ", re.M)
heads = list(MSG.finditer(text))
messages = []
for i, h in enumerate(heads):
    end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
    mo, d, yy = int(h[1]), int(h[2]), int(h[3])
    messages.append({"date": date(2000 + yy, mo, d), "sender": h[4], "body": text[h.end():end]})

# ── stage detection: announcement title -> stage key
STAGES = [
    (re.compile(r"📣\s*theBoardGames\s*\|?\s*LeagueMatch\s*(\d)", re.I), lambda m: f"LM{m[1]}"),
    (re.compile(r"📣\s*theBoardGames\s*\|?\s*Round of 32", re.I), lambda m: "RO32"),
    (re.compile(r"📣\s*theBoardGames[^\n]*\|\s*Round of 16", re.I), lambda m: "RO16"),
    (re.compile(r"📣\s*theBoardGames\s*\|?\s*Quarterfinals\s*\n", re.I), lambda m: "QF"),
    (re.compile(r"📣\s*theBoardGames\s*\|?\s*Semi\s*Finals", re.I), lambda m: "SF"),
]
LINK = re.compile(r"https://lichess\.org/(tournament|swiss)/([A-Za-z0-9]{8})")

found = {}  # stage -> latest announcement (later messages override reschedules)
for m in messages:
    for rx, key in STAGES:
        s = rx.search(m["body"])
        link = LINK.search(m["body"])
        if s and link:
            title = re.search(r"📣\s*([^\n]+)", m["body"])[1].strip()
            found[key(s)] = {
                "date": m["date"], "title": title,
                "kind": link[1], "id": link[2], "link": link[0],
            }

# ── original schedule table (Oct 6 post) for league match dates + finals
sched = {f"LM{n}": int(d) for n, d in re.findall(r"LeagueMatch\s+(\d)\s+Oct\.\s+(\d+)", text)}
sched["F"] = int(re.search(r"^Finals\s+Oct\.\s+(\d+)", text, re.M)[1])

# ── podiums hand-read from the results recaps in the chat (prose, not regex-able)
PODIUM = {
    "LM3": ["D-Genius"],  # inferred: "third win" on LM4 + "guarded the board for 3 LeagueMatches" on LM5
    "LM4": ["D-Genius", "Scrableplayer"],
    "LM5": ["Ataria", "Prince of Piece", "Mittenstock"],
    "LM6": ["Fizzy", "Ataria", "Juk3s"],
    "LM7": ["Emike001", "Mittenstock", "Bobbyf1she"],
    "LM8": ["D-Genius", "Darlington12", "Juk3s"],
}
RECAP = {
    "RO32": "Best of 3, 10+0. Originally set for Oct 25, rescheduled to Oct 26 at 8 PM.",
    "RO16": "Best of 3, 10+0. Darlington (MOUAU) and David (MOUAU) sealed comebacks; Kenneth (UNILORIN), John (BELLS) and Chiamaka (UNICAL) won with clean sheets. Chiamaka secured theBoardLady Oct. ’26.",
    "QF": "Darlington (MOUAU) beat Ataria (NDU) 2–0, David (MOUAU) beat John (BELLS) 2–0, Chiamaka (UNICAL) beat Godspower (NDU) 2–1 and Kenneth (UNILORIN) beat Emmanuel (FUTIA) 2–1.",
    "SF": "The last four. Watch live on Lichess.",
}

def tc(stage):
    if stage in ("LM1", "LM2", "LM3", "LM4"):
        return "3+0 Blitz"
    if stage in ("LM5", "LM6", "LM7", "LM8"):
        return "5+0 Blitz"
    return "10+0 Rapid"

LABEL = {"RO32": "Round of 32", "RO16": "Round of 16", "QF": "Quarterfinals", "SF": "Semifinals", "F": "Finals"}
today = messages[-1]["date"]  # last day covered by the export

events = []
order = [f"LM{i}" for i in range(1, 9)] + ["RO32", "RO16", "QF", "SF", "F"]
for key in order:
    f = found.get(key)
    day = f["date"].day if f else sched[key]
    d = date(2026, 10, day)
    status = "COMPLETED" if d < today else "LIVE" if d == today else "SCHEDULED"
    n = int(key[2:]) if key.startswith("LM") else None
    events.append({
        "key": key,
        "matchNumber": n,
        "label": f"Match {n}" if n else LABEL[key],
        "day": day,
        "weekday": d.strftime("%a"),
        "title": "theBoardGames " + (f"LeagueMatch {n}" if n else LABEL[key]),
        "announcement": f["title"] if f else None,
        "kind": f["kind"] if f else None,
        "id": f["id"] if f else None,
        "link": f["link"] if f else None,
        "timeControl": tc(key),
        "status": status,
        "podium": PODIUM.get(key, []),
        "recap": RECAP.get(key, ""),
    })

OUT.write_text(json.dumps(events, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
for e in events:
    print(e["key"], e["day"], e["weekday"], e["status"], e["link"], "|", e["title"])
