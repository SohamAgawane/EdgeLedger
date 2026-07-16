# EdgeLedger

A behavioral analytics platform for retail stock traders. Traders log trades with psychological metadata — emotions, conviction scores, mistake categories — and the platform analyzes that data to surface behavioral patterns they cannot see on their own.

---

## The Problem It Solves

Most traders track portfolio value. EdgeLedger tracks decision quality.

It answers questions no brokerage dashboard answers:
- Which sectors am I actually profitable in?
- Do I trade worse on certain days of the week?
- Does my confidence before a trade predict the result?
- Am I overexposed to one sector without realizing it?
- Do I revenge trade after losses?

---

## How It Works

**Journaling** — Log trades with full psychological context. Emotions, mistakes, conviction scores, sector, and notes alongside the standard price data.

**Analytics** — The backend computes 8 behavioral metrics from stored trade data using a single MongoDB aggregation pipeline with $facet — win rate, average P&L, sector performance, weekday performance, average holding period, mistake distribution, conviction vs profit correlation, and risk concentration.

**Rules Engine** — Users define personal trading rules. Every new trade is checked against active rules in real time and returns non-blocking warnings — maximum capital per trade, maximum trades per day, no trading after a set time, revenge trade detection.

---

## Tech Stack

**Backend** — Node.js, Express, MongoDB, Mongoose, JWT

**Frontend** — React, Tailwind CSS, Recharts, Framer Motion

## Author

Built by [Soham Agawane](https://github.com/SohamAgawane)
