# Part 5: Risk & Capital — Deep Dive

> **Parent Topic:** Market Microstructure
> **What this covers:** Leverage, Margin, Margin Calls, and how capital and risk are managed in trading.
> **Subtopics:** Leverage → Margin → Margin Calls → Relationship Between Them
> **Prerequisites:** You should have read Parts 1-4 first.

---

## Before We Start: Words You Need

```
Capital    = The money you have available to trade with
Position   = The total value of stock you currently hold
Equity     = Your capital + any unrealized profit/loss on open positions
Exposure   = How much total risk you have in the market
Collateral = Something of value you pledge as security against a loan
```

---

## 1. Leverage

### 1.1 What is Leverage?

#### Definition

> **Leverage:** The use of borrowed capital (debt) to increase the potential return on an investment beyond what would be possible with only the investor's own equity. Leverage amplifies both gains and losses proportionally — a leverage ratio of N:1 means that a 1% move in the underlying asset results in an N% change in the investor's equity. Leverage is expressed as a ratio (e.g., 5:1 or "5x") and is the mathematical inverse of the margin requirement.

**In simple words:** Leverage means using borrowed money to make bigger trades than your own money would allow. If you have Rs 1,00,000 and use 5x leverage, you can control Rs 5,00,000 worth of stocks. Your profits AND losses are multiplied by 5.

---

### 1.2 How Leverage Actually Works — Step by Step

```
WITHOUT LEVERAGE:

  Your capital: Rs 1,00,000
  You buy: Rs 1,00,000 worth of TCS (about 26 shares at Rs 3,800)
  
  Every Rs 1 move in TCS = Rs 26 change in your portfolio
  A 1% move in TCS = 1% change in your money
  
  The maximum you can lose = Rs 1,00,000 (your entire capital)
  This happens only if TCS goes to Rs 0 (company goes bankrupt)

WITH 5x LEVERAGE:

  Your capital: Rs 1,00,000
  Broker lends you: Rs 4,00,000 (at interest)
  Total buying power: Rs 5,00,000
  You buy: Rs 5,00,000 worth of TCS (about 131 shares at Rs 3,800)
  
  Every Rs 1 move in TCS = Rs 131 change in your portfolio (5x more!)
  A 1% move in TCS = 5% change in YOUR money
  
  The maximum you can lose = MORE than Rs 1,00,000 (explained below)
```

---

### 1.3 Leverage: The Profit Scenario

```
═══════════════════════════════════════════════════════
  LEVERAGE PROFIT EXAMPLE
═══════════════════════════════════════════════════════

Setup:
  Your capital: Rs 1,00,000
  Leverage: 5x
  Total position: Rs 5,00,000 (131 shares of TCS at Rs 3,800)
  Borrowed: Rs 4,00,000 (from broker)

TCS goes UP 10%: Rs 3,800 → Rs 4,180

  New position value: 131 × Rs 4,180 = Rs 5,47,580
  You return the borrowed: Rs 4,00,000
  You keep: Rs 5,47,580 - Rs 4,00,000 = Rs 1,47,580
  
  YOUR profit: Rs 1,47,580 - Rs 1,00,000 = Rs 47,580
  YOUR return: 47,580 / 1,00,000 = 47.58%

  Without leverage:
    26 shares × Rs 380 profit = Rs 9,880
    Return: 9.88%

  LEVERAGE MULTIPLIED YOUR RETURN: 47.58% vs 9.88% ≈ 4.8x

  Wow, this is amazing! But wait...
```

---

### 1.4 Leverage: The Loss Scenario

```
═══════════════════════════════════════════════════════
  LEVERAGE LOSS EXAMPLE
═══════════════════════════════════════════════════════

Same setup:
  Your capital: Rs 1,00,000
  Leverage: 5x
  Total position: Rs 5,00,000 (131 shares at Rs 3,800)
  Borrowed: Rs 4,00,000

TCS goes DOWN 10%: Rs 3,800 → Rs 3,420

  New position value: 131 × Rs 3,420 = Rs 4,48,020
  You return the borrowed: Rs 4,00,000
  You keep: Rs 4,48,020 - Rs 4,00,000 = Rs 48,020
  
  YOUR loss: Rs 1,00,000 - Rs 48,020 = Rs 51,980
  YOUR return: -51.98%

  Without leverage:
    26 shares × Rs 380 loss = Rs 9,880 loss
    Return: -9.88%

  LEVERAGE MULTIPLIED YOUR LOSS: -51.98% vs -9.88% ≈ 5.3x

  A 10% stock drop wiped out HALF your money.
```

---

### 1.5 Leverage: The Wipeout Scenario

```
═══════════════════════════════════════════════════════
  LEVERAGE WIPEOUT EXAMPLE
═══════════════════════════════════════════════════════

Same setup:
  Your capital: Rs 1,00,000
  Leverage: 5x
  Total position: Rs 5,00,000

TCS goes DOWN 20%: Rs 3,800 → Rs 3,040

  New position value: 131 × Rs 3,040 = Rs 3,98,240
  You return the borrowed: Rs 4,00,000
  You keep: Rs 3,98,240 - Rs 4,00,000 = -Rs 1,760

  YOUR loss: Rs 1,00,000 + Rs 1,760 = Rs 1,01,760
  YOUR return: -101.76%

  YOU LOST MORE THAN 100% OF YOUR MONEY.
  You now OWE the broker Rs 1,760.

  This is why leverage is called a "double-edged sword."
  You can lose MORE than your initial investment.
```

---

### 1.6 The Leverage Table

```
Stock moves:     1%      5%     10%     20%     50%

1x (no leverage):
  Your return:   1%      5%     10%     20%     50%
  
2x leverage:
  Your return:   2%     10%     20%     40%    100%
  
5x leverage:
  Your return:   5%     25%     50%    100%    250%
  Wipeout at:                    20% stock drop → you lose 100%

10x leverage:
  Your return:  10%     50%    100%    200%    500%
  Wipeout at:            10% stock drop → you lose 100%

20x leverage:
  Your return:  20%    100%    200%    400%   1000%
  Wipeout at:     5% stock drop → you lose 100%

50x leverage (forex):
  Your return:  50%    250%    500%   1000%   2500%
  Wipeout at:   2% move → you lose 100%

KEY INSIGHT:
  Wipeout threshold = 100% / leverage
  5x leverage  → 20% adverse move = total loss
  10x leverage → 10% adverse move = total loss
  50x leverage → 2% adverse move = total loss
```

---

### 1.7 Where Leverage Comes From (Who Lends the Money?)

```
SOURCE 1: BROKER (most common for retail)
  ───────────────────────────────────────
  Your broker (Zerodha, ICICI Direct, etc.) lends you money.
  They charge interest on the borrowed amount.
  They have rules about how much they'll lend (margin requirements).
  
  In India:
    Intraday equity: Up to 5x-20x leverage (depending on stock)
    Delivery equity: Usually 1x (no leverage) or 2x with margin trading
    F&O (Futures): Built-in leverage of 5x-15x

SOURCE 2: EXCHANGE (built into the product)
  ───────────────────────────────────────
  Futures and Options contracts have leverage BUILT IN.
  You don't "borrow" explicitly — you just put up a small margin
  and control a large notional value.
  
  Example: Nifty Futures
    One lot = 50 units × Rs 22,000 = Rs 11,00,000 notional value
    Margin required: ~Rs 1,50,000 (about 13%)
    Leverage: 11,00,000 / 1,50,000 ≈ 7.3x

SOURCE 3: PRIME BROKER (for hedge funds)
  ───────────────────────────────────────
  Large institutions borrow from "prime brokers" (Goldman Sachs, 
  Morgan Stanley, etc.)
  They get much better terms: lower interest, higher leverage.
  Typical hedge fund leverage: 2x-6x
  Some (like Long-Term Capital Management before they blew up): 25x+
```

---

### 1.8 The Cost of Leverage

```
Leverage is NOT free. The borrowed money comes with costs:

1. INTEREST ON BORROWED AMOUNT
   The broker charges daily interest on the money you've borrowed.
   Typical rates in India: 12-18% per annum
   
   Example:
     Borrowed: Rs 4,00,000
     Annual rate: 15%
     Daily cost: 4,00,000 × 0.15 / 365 = Rs 164 per day
     Monthly cost: Rs 4,931
   
   This eats into your profit. If your strategy makes 20% per year
   but your borrowing costs 15%, your net return is only 5%.

2. MARGIN INTEREST (for margin accounts)
   Similar to above but may have different rate structure.

3. OPPORTUNITY COST
   The capital you put up as margin (Rs 1,00,000) is locked.
   You can't use it for other investments.

4. LIQUIDATION RISK (the hidden cost)
   If your position drops too much, the broker FORCEFULLY sells.
   This often happens at the WORST possible moment.
   You might have been right long-term, but leverage killed you
   in the short term.
   
   "The market can stay irrational longer than you can stay solvent."
   — John Maynard Keynes
```

---

### 1.9 Real-World Leverage Disasters

```
DISASTER 1: LONG-TERM CAPITAL MANAGEMENT (LTCM) — 1998
  Who: Nobel Prize-winning economists running a hedge fund
  Leverage: 25x (borrowed $125 billion against $5 billion equity)
  What happened: Russian debt crisis. Their positions moved against them.
  Result: Lost $4.6 billion in months. Required a $3.6 billion bailout
          from 14 banks organized by the Federal Reserve.
  Lesson: Even geniuses get killed by excessive leverage.

DISASTER 2: BILL HWANG / ARCHEGOS CAPITAL — 2021
  Who: Family office of former hedge fund manager
  Leverage: ~5x-8x using "total return swaps" (hidden leverage)
  What happened: Concentrated bets on a few stocks. When they dropped,
    broker margin calls forced selling → prices dropped more → more margin
    calls → death spiral.
  Result: Lost ~$20 billion in two days. Banks lost ~$10 billion.
  Lesson: Leverage + concentration = catastrophic risk.

DISASTER 3: RETAIL TRADERS IN INDIA (recurring)
  Who: Small traders using high leverage in futures/options
  Leverage: 10x-20x on stock futures
  What happened: Any sharp market move (budget day, war news, COVID crash)
  Result: Accounts wiped out in minutes. Some owe money to brokers.
  SEBI data (2023): 89% of F&O traders in India LOST money.
  Lesson: Most retail traders overestimate their ability to manage leverage.
```

---

## 2. Margin

### 2.1 What is Margin?

#### Definition

> **Margin:** The minimum amount of equity (the trader's own capital) that must be deposited and maintained in a brokerage account as collateral when using leverage to trade securities. Margin is expressed either as an absolute currency amount or as a percentage of the total position value. It serves as a financial guarantee to the broker and exchange that the trader can absorb potential losses. There are two key thresholds: the initial margin (required to open a position) and the maintenance margin (required to keep a position open).

**In simple words:** Margin is your "security deposit" — the minimum amount of YOUR OWN money that you must keep in your account when you're trading with borrowed money. It's the broker's protection against your losses.

---

### 2.2 The Relationship Between Margin and Leverage

Margin and leverage are two sides of the same coin:

```
MARGIN PERCENTAGE = 1 / LEVERAGE RATIO × 100

  Margin 100% = 1x leverage  (all your money, no borrowing)
  Margin 50%  = 2x leverage  (you put up half, broker lends half)
  Margin 20%  = 5x leverage  (you put up 20%, broker lends 80%)
  Margin 10%  = 10x leverage (you put up 10%, broker lends 90%)
  Margin 5%   = 20x leverage (you put up 5%, broker lends 95%)
  Margin 2%   = 50x leverage (you put up 2%, broker lends 98%)

LEVERAGE RATIO = 1 / (MARGIN PERCENTAGE / 100)

  If broker requires 20% margin:
    Leverage = 1/0.20 = 5x
    Your Rs 1,00,000 controls Rs 5,00,000

  If broker requires 12.5% margin:
    Leverage = 1/0.125 = 8x
    Your Rs 1,00,000 controls Rs 8,00,000
```

---

### 2.3 Types of Margin

```
┌───────────────────┬──────────────────────────────────────────────┐
│ Type              │ What It Is                                    │
├───────────────────┼──────────────────────────────────────────────┤
│                   │                                               │
│ INITIAL MARGIN    │ The amount you must deposit BEFORE opening   │
│                   │ a leveraged position. This is the "entry     │
│                   │ fee" to start the trade.                     │
│                   │                                               │
│                   │ Example: To buy Rs 5,00,000 of TCS with     │
│                   │ 20% initial margin, you need Rs 1,00,000.   │
│                   │                                               │
├───────────────────┼──────────────────────────────────────────────┤
│                   │                                               │
│ MAINTENANCE       │ The MINIMUM amount that must remain in your  │
│ MARGIN            │ account while the position is open. This is  │
│                   │ lower than initial margin.                   │
│                   │                                               │
│                   │ Example: If maintenance margin is 10%,       │
│                   │ you must always have at least Rs 50,000 in  │
│                   │ equity against your Rs 5,00,000 position.    │
│                   │                                               │
│                   │ If your equity drops below this → MARGIN CALL│
│                   │                                               │
├───────────────────┼──────────────────────────────────────────────┤
│                   │                                               │
│ VARIATION MARGIN  │ The daily profit/loss adjustment. At the end │
│ (Mark-to-Market)  │ of each day, your account is credited or    │
│                   │ debited based on the day's price movement.   │
│                   │                                               │
│                   │ Used in: Futures markets                     │
│                   │ If you lost Rs 10,000 today, Rs 10,000 is   │
│                   │ debited from your account tonight.           │
│                   │                                               │
├───────────────────┼──────────────────────────────────────────────┤
│                   │                                               │
│ SPAN MARGIN       │ NSE uses SPAN (Standard Portfolio Analysis   │
│ (India-specific)  │ of Risk) to calculate margin for F&O.       │
│                   │ It simulates 16 stress scenarios and charges │
│                   │ margin based on the WORST-CASE scenario.     │
│                   │                                               │
│                   │ More volatile stock → higher SPAN margin     │
│                   │ Less volatile stock → lower SPAN margin      │
│                   │                                               │
├───────────────────┼──────────────────────────────────────────────┤
│                   │                                               │
│ EXPOSURE MARGIN   │ An ADDITIONAL margin charged by NSE on top   │
│ (India-specific)  │ of SPAN margin. Acts as extra buffer.        │
│                   │                                               │
│                   │ Total margin = SPAN margin + Exposure margin │
│                   │                                               │
└───────────────────┴──────────────────────────────────────────────┘
```

---

### 2.4 How Margin Works — Complete Example

```
═══════════════════════════════════════════════════════
  MARGIN TRADING — FULL LIFECYCLE
═══════════════════════════════════════════════════════

SETUP:
  Your account: Rs 2,00,000 cash
  Stock: TCS at Rs 3,800
  Broker's initial margin: 20% (so 5x leverage)
  Broker's maintenance margin: 10%

STEP 1: OPEN THE POSITION
  ─────────────────────────
  You want to buy Rs 10,00,000 worth of TCS (263 shares).
  
  Required initial margin: 20% × Rs 10,00,000 = Rs 2,00,000
  Your cash: Rs 2,00,000 ← exactly enough!
  
  Broker lends you: Rs 8,00,000
  You buy: 263 shares × Rs 3,800 = Rs 9,99,400 ≈ Rs 10,00,000
  
  Your account:
    Position value:   Rs 10,00,000
    Borrowed:         Rs  8,00,000
    Your equity:      Rs  2,00,000 (position - borrowed)
    Margin ratio:     2,00,000 / 10,00,000 = 20% ✓

STEP 2: PRICE GOES UP (good day)
  ─────────────────────────
  TCS rises to Rs 3,900 (+2.63%)
  
  Your account:
    Position value:   263 × Rs 3,900 = Rs 10,25,700
    Borrowed:         Rs 8,00,000 (unchanged)
    Your equity:      Rs 10,25,700 - Rs 8,00,000 = Rs 2,25,700
    Margin ratio:     2,25,700 / 10,25,700 = 22% ✓
    Unrealized profit: Rs 25,700 (on YOUR Rs 2,00,000 = +12.85% return)
    
  Note: Stock moved 2.63%, but YOUR equity moved 12.85%. That's leverage!

STEP 3: PRICE GOES DOWN (bad day)
  ─────────────────────────
  TCS drops to Rs 3,600 (-5.26% from original)
  
  Your account:
    Position value:   263 × Rs 3,600 = Rs 9,46,800
    Borrowed:         Rs 8,00,000
    Your equity:      Rs 9,46,800 - Rs 8,00,000 = Rs 1,46,800
    Margin ratio:     1,46,800 / 9,46,800 = 15.5%
    Unrealized loss:  Rs 53,200 (-26.6% of YOUR money)
    
  Margin ratio (15.5%) is still above maintenance (10%) → You're OK.
  But you've lost 26.6% of your money on a 5.26% stock drop.

STEP 4: PRICE DROPS MORE → MARGIN CALL
  ─────────────────────────
  TCS drops to Rs 3,400 (-10.5% from original)
  
  Your account:
    Position value:   263 × Rs 3,400 = Rs 8,94,200
    Borrowed:         Rs 8,00,000
    Your equity:      Rs 8,94,200 - Rs 8,00,000 = Rs 94,200
    Margin ratio:     94,200 / 8,94,200 = 10.5%
    
  Getting dangerously close to 10% maintenance margin...
  
  TCS drops to Rs 3,350:
    Position value:   263 × Rs 3,350 = Rs 8,81,050
    Your equity:      Rs 8,81,050 - Rs 8,00,000 = Rs 81,050
    Margin ratio:     81,050 / 8,81,050 = 9.2%
    
  9.2% < 10% maintenance margin → ★ MARGIN CALL ★

═══════════════════════════════════════════════════════
```

---

## 3. Margin Calls

### 3.1 What is a Margin Call?

#### Definition

> **Margin Call:** A demand by a broker or exchange for a trader to deposit additional funds or securities into their account when the account equity falls below the maintenance margin requirement. If the trader fails to meet the margin call within the stipulated time (which may be as short as minutes in fast-moving markets), the broker has the legal right to liquidate some or all of the trader's positions at prevailing market prices to restore the account to compliance — typically without requiring the trader's consent.

**In simple words:** When your losses eat into your margin deposit and your equity drops below the minimum level, the broker says: "Put in more money RIGHT NOW, or I'll sell your stocks to protect myself from your losses."

---

### 3.2 What Happens During a Margin Call

```
═══════════════════════════════════════════════════════
  MARGIN CALL PROCESS
═══════════════════════════════════════════════════════

  Your equity: Rs 81,050
  Maintenance margin needed: Rs 88,105 (10% of Rs 8,81,050)
  Shortfall: Rs 88,105 - Rs 81,050 = Rs 7,055

  ★ MARGIN CALL TRIGGERED ★

  OPTION 1: DEPOSIT MORE MONEY
    Broker: "Deposit at least Rs 7,055 within [time limit]"
    
    If you deposit Rs 50,000:
      New equity: Rs 81,050 + Rs 50,000 = Rs 1,31,050
      Margin ratio: 1,31,050 / 9,31,050 = 14.1% ✓
      Crisis averted! Position remains open.

  OPTION 2: CLOSE PART OF YOUR POSITION
    Sell some shares to reduce the position size.
    
    You sell 50 shares at Rs 3,350 = Rs 1,67,500
    New position: 213 shares × Rs 3,350 = Rs 7,13,550
    Return to broker: Rs 1,67,500 (reduces borrowed amount)
    Borrowed: Rs 8,00,000 - Rs 1,67,500 = Rs 6,32,500
    Equity: Rs 7,13,550 - Rs 6,32,500 = Rs 81,050
    Margin ratio: 81,050 / 7,13,550 = 11.4% ✓
    Position is smaller but now within margin.

  OPTION 3: DO NOTHING (WORST OPTION)
    If you don't respond within the time limit:
    Broker FORCEFULLY SELLS your shares.
    
    They sell at MARKET PRICE — which in a falling market might
    be EVEN LOWER than when the margin call was triggered.
    
    They sell enough shares to bring the account back above margin.
    You have NO CONTROL over which shares are sold or at what price.
    
    This is called "forced liquidation" or "margin closeout."
```

---

### 3.3 The Margin Call Death Spiral

This is how margin calls can cascade and cause massive losses:

```
═══════════════════════════════════════════════════════
  THE DEATH SPIRAL
═══════════════════════════════════════════════════════

  You're not alone. Thousands of traders hold leveraged positions.

  Day 1: Market drops 5%
    → Hundreds of margin calls issued
    → Traders who can't meet calls → forced liquidation
    → Forced selling pushes prices DOWN further

  Day 2: Market drops another 3% (partly from forced selling)
    → More margin calls on traders who survived Day 1
    → More forced liquidation → more selling → prices drop more

  Day 3: Market drops another 4%
    → Even conservative leveraged traders are now underwater
    → Massive forced liquidation → panic selling
    → Prices crash

  This is a "margin call cascade" or "deleveraging event."
  
  Real examples:
    - 2008 Financial Crisis: Forced selling accelerated the crash
    - March 2020 COVID crash: Margin calls across ALL asset classes
    - Archegos 2021: One fund's margin calls crashed several stocks 50%+

  THE DANGEROUS FEEDBACK LOOP:
    Prices fall → Margin calls → Forced selling → Prices fall more →
    More margin calls → More forced selling → ...
    
    It only stops when:
    1. Prices get so low that new buyers step in, OR
    2. Enough leveraged positions have been liquidated
```

---

### 3.4 Margin in Different Markets

```
EQUITY (STOCKS) IN INDIA:
  ┌────────────────────────┬─────────────────────────────┐
  │ Type                   │ Typical Margin               │
  ├────────────────────────┼─────────────────────────────┤
  │ Cash/Delivery (CNC)    │ 100% (no leverage)           │
  │ Intraday (MIS)         │ 20-40% (2.5x-5x leverage)   │
  │ Margin Trading (MTF)   │ 50% (2x leverage)            │
  └────────────────────────┴─────────────────────────────┘

FUTURES & OPTIONS (F&O) IN INDIA:
  ┌────────────────────────┬─────────────────────────────┐
  │ Product                │ Typical Margin               │
  ├────────────────────────┼─────────────────────────────┤
  │ Nifty Futures          │ ~12-15% (7-8x leverage)      │
  │ Bank Nifty Futures     │ ~12-15% (7-8x leverage)      │
  │ Stock Futures          │ ~15-40% (2.5-7x leverage)    │
  │ Option Buying          │ Premium only (100%)           │
  │ Option Selling         │ Very high margin              │
  └────────────────────────┴─────────────────────────────┘

FOREX:
  ┌────────────────────────┬─────────────────────────────┐
  │ Type                   │ Typical Margin               │
  ├────────────────────────┼─────────────────────────────┤
  │ Major pairs (EUR/USD)  │ 2-5% (20-50x leverage!)      │
  │ Minor pairs            │ 3-10% (10-33x leverage)      │
  └────────────────────────┴─────────────────────────────┘

CRYPTOCURRENCY:
  ┌────────────────────────┬─────────────────────────────┐
  │ Exchange               │ Typical Max Leverage          │
  ├────────────────────────┼─────────────────────────────┤
  │ Binance                │ Up to 125x (extremely risky!) │
  │ Bybit                  │ Up to 100x                    │
  │ (Many countries now    │                               │
  │  restrict crypto       │                               │
  │  leverage for retail)  │                               │
  └────────────────────────┴─────────────────────────────┘
```

---

## 4. Margin and Leverage in a Paper Trading Engine

### 4.1 Why Simulate Margin in Paper Trading?

```
If your paper trading engine IGNORES leverage and margin:

  Your strategy might take positions of Rs 50,00,000 with Rs 10,00,000 capital.
  In the backtest, it shows 40% annual returns.
  
  In REALITY:
  - The broker would require Rs 10,00,000 in margin for a Rs 50,00,000 position
  - Your capital IS Rs 10,00,000 — you have nothing left for margin calls
  - The first 5% drop would trigger a margin call
  - Forced liquidation at the worst time
  - Your 40% return becomes a -60% loss
  
  Simulating margin makes your backtest HONEST.
```

---

### 4.2 How Alpha Arena Handles This

```
Alpha Arena's approach (from the spec):

  GROSS EXPOSURE LIMIT: 2x
    → Total position value cannot exceed 2x portfolio value
    → With Rs 10,00,000 → max position = Rs 20,00,000
    → This IS 2x leverage. Simple and clear.

  MAX SINGLE POSITION: 10%
    → No single stock can be more than 10% of portfolio
    → Prevents concentration risk

  DRAWDOWN AUTO-FLATTEN: 25%
    → If portfolio drops 25% from its peak → SELL EVERYTHING
    → This is like an automatic margin call on yourself
    → Prevents catastrophic losses

  These three rules together prevent:
    ✓ Excessive leverage (max 2x)
    ✓ Concentration risk (max 10% per stock)
    ✓ Catastrophic losses (25% drawdown limit)
```

---

## 5. Putting It All Together: Complete Margin + Leverage Scenario

```
═══════════════════════════════════════════════════════
  RAVI'S LEVERAGED TRADING WEEK
═══════════════════════════════════════════════════════

SETUP:
  Ravi's capital: Rs 5,00,000
  Broker: Allows 5x intraday leverage (20% margin)
  Ravi uses 3x leverage (conservative for him)
  Total position: Rs 15,00,000
  Borrowed: Rs 10,00,000
  Initial margin: Rs 5,00,000 (33%)
  Maintenance margin: 15% (Rs 2,25,000 equity minimum)
  
  Portfolio:
    TCS:      100 shares × Rs 3,800 = Rs 3,80,000
    INFY:     200 shares × Rs 1,500 = Rs 3,00,000
    RELIANCE: 150 shares × Rs 2,500 = Rs 3,75,000
    HDFC:     250 shares × Rs 1,650 = Rs 4,12,500
    ICICI:      50 shares × Rs  650 = Rs   32,500
    TOTAL:                           = Rs 15,00,000

─────────────────────────────────────────────────────
MONDAY: Good day (+1.5% on portfolio)
─────────────────────────────────────────────────────
  Position value: Rs 15,22,500 (+Rs 22,500)
  Equity: Rs 15,22,500 - Rs 10,00,000 = Rs 5,22,500
  Margin: 5,22,500 / 15,22,500 = 34.3% ✓
  Ravi's return: +4.5% (1.5% × 3x leverage)

─────────────────────────────────────────────────────
TUESDAY: Bad day (-3% on portfolio)
─────────────────────────────────────────────────────
  Position value: Rs 14,76,825 (-Rs 45,675 from Monday)
  Equity: Rs 14,76,825 - Rs 10,00,000 = Rs 4,76,825
  Margin: 4,76,825 / 14,76,825 = 32.3% ✓
  Ravi's return from start: -4.6%

─────────────────────────────────────────────────────
WEDNESDAY: Very bad day (-5% on portfolio)
─────────────────────────────────────────────────────
  Position value: Rs 14,02,984
  Equity: Rs 14,02,984 - Rs 10,00,000 = Rs 4,02,984
  Margin: 4,02,984 / 14,02,984 = 28.7% ✓
  Ravi's return from start: -19.4%
  
  Ravi is nervous but still above maintenance margin (15%).

─────────────────────────────────────────────────────
THURSDAY: Market crash (-8% on portfolio — bad news globally)
─────────────────────────────────────────────────────
  Position value: Rs 12,90,745
  Equity: Rs 12,90,745 - Rs 10,00,000 = Rs 2,90,745
  Margin: 2,90,745 / 12,90,745 = 22.5% ✓ (still OK)
  Ravi's return from start: -41.9%
  
  In 4 days, Ravi lost 41.9% of his capital on a ~14% market drop.
  Without leverage, he'd have lost ~14%. Leverage tripled his pain.

─────────────────────────────────────────────────────
FRIDAY: Another bad day (-4%)
─────────────────────────────────────────────────────
  Position value: Rs 12,39,115
  Equity: Rs 12,39,115 - Rs 10,00,000 = Rs 2,39,115
  Margin: 2,39,115 / 12,39,115 = 19.3% ✓ (still above 15%)
  
  BUT if market drops just 3.5% more:
    Position: Rs 11,95,756
    Equity: Rs 1,95,756
    Margin: 1,95,756 / 11,95,756 = 16.4% → still OK
    
  Another 2%:
    Position: Rs 11,71,841
    Equity: Rs 1,71,841
    Margin: 1,71,841 / 11,71,841 = 14.7%
    → ★ MARGIN CALL ★
    
─────────────────────────────────────────────────────
RESULT SUMMARY:
─────────────────────────────────────────────────────
  Starting capital:        Rs 5,00,000
  Ending equity (Friday):  Rs 2,39,115
  Loss:                    Rs 2,60,885 (-52.2%)
  
  If Ravi had NOT used leverage (1x):
    Starting capital: Rs 5,00,000
    Market dropped ~18% across the week
    Loss: Rs 90,000 (-18%)
    Ending: Rs 4,10,000
  
  LEVERAGE COST RAVI AN EXTRA Rs 1,70,885 in losses.
  
  3x leverage turned an 18% market drop into a 52% personal loss.
  
═══════════════════════════════════════════════════════
```

---

## Key Takeaways

```
1. LEVERAGE = using borrowed money to trade bigger.
   Leverage of Nx means a 1% stock move = N% change in YOUR equity.
   It multiplies BOTH profits AND losses equally.

2. MARGIN = your security deposit for using leverage.
   Margin % = 1 / Leverage ratio.
   20% margin = 5x leverage.
   Initial margin to open, maintenance margin to keep.

3. MARGIN CALL = "deposit more money or I sell your stocks."
   Triggered when equity drops below maintenance margin.
   Can cascade into death spirals in market crashes.

4. THE WIPEOUT THRESHOLD:
   Wipeout at = 100% / leverage ratio.
   5x leverage → 20% adverse move = total loss.
   10x leverage → 10% adverse move = total loss.

5. LEVERAGE IS NOT FREE:
   Interest on borrowed money, liquidation risk, and the
   psychological pressure of amplified losses.

6. FOR PAPER TRADING ENGINES:
   You MUST simulate leverage constraints.
   Without them, backtests produce unrealistic results.
   Alpha Arena uses: 2x max exposure, 10% max per stock, 
   25% drawdown auto-flatten.

7. THE GOLDEN RULE:
   Never use more leverage than you can survive the WORST
   realistic scenario with. If 2008 happens again (50% market
   drop), will you survive? That's your leverage limit.
```

---

*Next up: Part 6 — Optional Topics (Algorithmic Trading, HFT, Arbitrage, Stat Arb, Investing Styles, Superforecasting)*
