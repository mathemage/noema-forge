# NoemaForge

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://choosealicense.com/licenses/agpl-3.0/)

## Debug Your Mind: Journaling Web App

NoemaForge is a journaling web app focused on turning raw thoughts into clearer, searchable reflections.

## Overview

The project is intended to support low-friction journal capture across multiple input modes, including typing, voice, and handwriting OCR.

Planned capabilities:

- Cross-modal capture in a single journal
- Follow-up prompts to refine raw input into reflection
- Searchable history for pattern tracking over time
- Future LLM support would likely use open-source models served by a separately hosted Ollama instance (for example, on a self-hosted VM), with the Vercel-hosted app calling that service
- LLM use would stay narrow: generate a specific "Next action?" question and offer 2-3 next-step suggestions based on the identified root cause problem

See [PHILOSOPHY.md](PHILOSOPHY.md) for the detailed product philosophy, rationale, and longer-form background.
