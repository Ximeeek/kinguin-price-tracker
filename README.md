# Kinguin Price Tracker

Desktop application for tracking, analyzing, and predicting video game key prices on Kinguin.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## Overview

```
[Tracker] Monitored Products: 5 | Active Alerts: 2
- Cyberpunk 2077: Phantom Liberty  | 24.99 EUR (-37.5%) [Steady decrease]
- The Witcher 3: Complete Edition  | 14.99 EUR (±12.0%) [Fluctuating]
- Grand Theft Auto VI (Pre-Order)  | 79.99 EUR (+23.0%) [Steady increase]
```

## Quick Start

```bash
git clone https://github.com/Ximeeek/kinguin-price-tracker.git
cd kinguin-price-tracker
npm install
npm run dev
```

## Usage

Paste any valid Kinguin product URL into the input field at the top of the Tracker view to start monitoring.

* **Scraping Pipeline**: Direct HTTP fetcher running in the main process to bypass browser CORS limitations.
* **Trend Calculation Engine**: Statistical mean-reverting engine calculating 30-day moving averages, volatility metrics, and price directions.
* **Price Predictions**: Forecast price trends over 2 weeks, 1 month, 6 months, and 1 year intervals.
* **Multi-Currency & i18n**: Toggle between EUR, USD, PLN, and GBP with instant interface translation (English and Polish).
* **Mock Test Commands**: Enter `test1` through `test5` or `test-all` into the search bar during development mode (`npm run dev`) to populate simulated price history snapshots.

## Development & Build

Run the automated engine test suite:
```bash
npm test
```

Build production binaries:
```bash
npm run build
```

## Caveats & Limitations

* Parsing relies on public Kinguin HTML structure. DOM changes on Kinguin may require selector updates.
* Test commands (`test1`–`test5`, `test-all`) operate exclusively in development builds and are stripped in production.

## License

MIT
