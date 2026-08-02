# Development Test Commands & Mock Data Guide

> **Note**: These commands are strictly enabled **ONLY in Development Mode (`npm run dev`)**. They are completely disabled and stripped out in production compiled builds (`npm run build`).

---

## Overview

When developing and testing price chart trends, average calculations, and UI components, waiting real days for price history snapshots is impractical. 

The application includes built-in test commands that generate realistic historical price snapshots (30 to 90 days of daily data) with various price patterns (steady drop, steady rise, volatility, flash sales, stability).

---

## How to Execute Test Commands

1. Launch the application in development mode:
   ```bash
   npm run dev
   ```

2. Locate the **"Track product"** input box at the top of the Tracker tab (where product URLs are normally pasted).

3. Type any of the following command keywords and click **Track product** or press Enter:

| Command | Game / Product | History Duration | Price Pattern / Details |
|---|---|---|---|
| `test1` | **Cyberpunk 2077: Phantom Liberty** | 60 Days | Steady decrease (39.99 € down to 24.99 €). Tests "Steady decrease" green badge. |
| `test2` | **The Witcher 3: Wild Hunt - Complete Edition** | 90 Days | Fluctuating price (11.99 € to 19.99 €). Tests "Fluctuating" cyan badge over 3 months. |
| `test3` | **Grand Theft Auto VI (Pre-Order)** | 45 Days | Steady increase (64.99 € up to 79.99 €). Tests "Steady increase" red badge. |
| `test4` | **Elden Ring: Shadow of the Erdtree** | 75 Days | Stable price (~39.99 €). Tests "Stable" gold badge over 2.5 months. |
| `test5` | **Red Dead Redemption 2** | 90 Days | Volatile price drops & flash sales (14.99 € to 29.99 €). Tests "Decreasing (volatile)". |
| `test-all` | **All 5 Test Games** | 45–90 Days | Instantly populates the entire tracking list with all 5 mock games for full UI testing. |

---

## Safety & Production Verification

- Running `npm run build` sets `NODE_ENV=production` and omits `VITE_DEV_SERVER_URL`.
- In production builds, typing `test1` or any test string will be treated as an invalid URL string and fail gracefully with: *"Provided link is not a valid Kinguin product URL."*
- **Mock Product Isolation**: All mock products MUST use an ID prefixed with `mock-` (e.g. `mock-101`). `RemoteRepository` automatically blocks any product starting with `mock-` from syncing to the remote backend database.

