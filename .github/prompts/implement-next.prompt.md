---
description: "Implement the next uncompleted feature from ROADMAP.md. Reads the roadmap, finds the next [ ] item, and starts implementation."
agent: "Roadmap Dev"
model: "GPT-4o (copilot)"
argument-hint: "Which roadmap item? (leave empty for next uncompleted)"
---

Read ROADMAP.md and find the next uncompleted `[ ]` item.

If the user specified an item number, implement that one. Otherwise, implement the first uncompleted item.

Follow your full workflow: collect context → find reference pattern → implement step by step → self-check → update roadmap.
