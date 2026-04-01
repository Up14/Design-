# Part 4: Market Data Representation — Deep Dive

> **Parent Topic:** Market Microstructure
> **What this covers:** How market price data is recorded, stored, displayed, and used. OHLC bars, candlestick charts, different timeframes, volume, and data formats.
> **Subtopics:** OHLC Data → Candlestick Charts → Timeframes → Volume → Data Formats
> **Prerequisites:** You should have read Parts 1-3 first.

---

## Before We Start: Quick Recap

```
You now know:
  - Orders sit in the order book (bids and asks)
  - The matching engine matches them into trades
  - Each trade has a price, quantity, and timestamp
  - Thousands of trades happen every second for a single stock

PROBLEM: You can't look at thousands of individual trades.
  TCS has ~50,000 trades per day. Across 252 trading days = 12.6 million trades/year.
  Nobody can read 12.6 million data points.

SOLUTION: Summarize the data. Instead of every trade, show a SUMMARY
  of what happened during a time period. This summary is called a "bar"
  or "candle" and its format is OHLC.
```

---

## 1. OHLC Data

### 1.1 What is OHLC?

#### Definition

> **OHLC (Open-High-Low-Close):** A standardized method of summarizing the price action of a security over a defined time period using four data points: the opening price (first trade), the highest traded price, the lowest traded price, and the closing price (last trade) within that period. OHLC data is the most widely used representation of financial time series data and serves as the foundational input for technical analysis, charting, and quantitative strategy development.

**In simple words:** OHLC is a way to compress thousands of trades into just 4 numbers that tell you the complete story of what happened during a time period.

```
O = Open  → The FIRST price at which a trade happened in this period
H = High  → The HIGHEST price any trade happened at during this period
L = Low   → The LOWEST price any trade happened at during this period
C = Close → The LAST price at which a trade happened in this period
```

---

### 1.2 Why Exactly These 4 Numbers?

These 4 numbers were chosen because together they answer every important question:

```
Question: "Where did trading START?"
Answer:   Open price

Question: "How HIGH did it go?" (maximum optimism)
Answer:   High price

Question: "How LOW did it go?" (maximum pessimism)
Answer:   Low price

Question: "Where did trading END?" (final consensus)
Answer:   Close price

Question: "Did price go UP or DOWN overall?"
Answer:   Compare Open vs Close
          Close > Open → went UP
          Close < Open → went DOWN

Question: "How VOLATILE was it?" (how much did it swing?)
Answer:   High - Low = the total range of price movement

Question: "Was it a decisive move or a tug-of-war?"
Answer:   If |Close - Open| is close to (High - Low) → decisive
          If |Close - Open| is small relative to (High - Low) → tug-of-war
```

With just O, H, L, C you can reconstruct the entire "story" of that time period — not every detail, but the essential narrative.

---

### 1.3 How OHLC is Calculated from Raw Trades

Let's trace exactly how raw trades become an OHLC bar:

```
═══════════════════════════════════════════════════════
  TCS — All trades on March 31, 2026 (simplified)
═══════════════════════════════════════════════════════

  Time      | Trade Price | Quantity
  ----------+-------------+---------
  9:15:00   | Rs 3,800    | 500       ← FIRST trade of the day
  9:15:01   | Rs 3,802    | 200
  9:15:03   | Rs 3,798    | 1,000
  9:20:00   | Rs 3,810    | 300
  9:45:00   | Rs 3,825    | 150
  10:30:00  | Rs 3,850    | 2,000     ← HIGHEST trade of the day
  11:00:00  | Rs 3,840    | 500
  12:00:00  | Rs 3,790    | 800
  1:15:00   | Rs 3,760    | 1,500     ← LOWEST trade of the day
  2:00:00   | Rs 3,785    | 600
  2:30:00   | Rs 3,800    | 400
  3:15:00   | Rs 3,815    | 700
  3:29:59   | Rs 3,820    | 300       ← LAST trade of the day
  
  (In reality there would be ~50,000 trades, not 13)

═══════════════════════════════════════════════════════
  OHLC CALCULATION:
═══════════════════════════════════════════════════════

  Open  = First trade price  = Rs 3,800 (at 9:15:00)
  High  = Maximum trade price = Rs 3,850 (at 10:30:00)
  Low   = Minimum trade price = Rs 3,760 (at 1:15:00)
  Close = Last trade price    = Rs 3,820 (at 3:29:59)

  OHLC = (3800, 3850, 3760, 3820)

  Derived metrics:
    Range:        High - Low       = Rs 90 (total price swing)
    Body:         Close - Open     = Rs 20 (net change, positive = UP)
    Upper shadow: High - Close     = Rs 30 (rejected upside)
    Lower shadow: Open - Low       = Rs 40 (rejected downside)
    Change %:     (Close-Open)/Open = +0.53%
```

---

### 1.4 The Fifth Element: Volume

OHLC is actually almost always accompanied by a fifth data point: **Volume**.

#### Definition

> **Volume:** The total number of shares (or contracts) traded during a given time period. Volume measures the intensity of trading activity and serves as a proxy for market participation, liquidity, and the conviction behind price movements. High volume on a price move suggests strong agreement; low volume suggests weak conviction.

**In simple words:** Volume = how many shares were bought and sold during that period. More volume = more people participating = more "real" the price move is.

```
From our example above:
  Total volume = 500 + 200 + 1,000 + 300 + 150 + 2,000 + 500 + 
                 800 + 1,500 + 600 + 400 + 700 + 300
               = 8,950 shares

So the full bar is: OHLCV = (3800, 3850, 3760, 3820, 8950)
```

#### Why Volume Matters

```
SCENARIO 1: Price goes up 5% on HIGH volume (10x average)
  Many buyers are pushing the price up.
  Strong conviction. The move is likely "real."
  Traders call this: "Volume confirms the move."

SCENARIO 2: Price goes up 5% on LOW volume (0.2x average)
  Very few buyers pushed the price up.
  Weak conviction. The move might reverse.
  Traders call this: "Low volume rally — don't trust it."

SCENARIO 3: Price is FLAT but volume is HUGE
  Lots of buying AND selling happening, but price isn't moving.
  This means buyers and sellers are equally matched.
  Something big might be about to happen (breakout or breakdown).
  Traders call this: "Accumulation" or "Distribution."
```

---

### 1.5 VWAP — Volume Weighted Average Price

#### Definition

> **VWAP (Volume Weighted Average Price):** The average price of a security over a given time period, weighted by the volume traded at each price level. VWAP is calculated as the cumulative sum of (price x volume) divided by the cumulative total volume. It is widely used as a benchmark for institutional order execution quality — buying below VWAP or selling above VWAP indicates favorable execution.

**In simple words:** VWAP tells you the "true average" price for the day, accounting for the fact that more shares were traded at some prices than others.

```
SIMPLE AVERAGE vs VWAP:

  Trade 1: 100 shares at Rs 3,800
  Trade 2: 10,000 shares at Rs 3,810
  Trade 3: 50 shares at Rs 3,850

  Simple average: (3,800 + 3,810 + 3,850) / 3 = Rs 3,820
  → Treats all three prices equally (WRONG — Trade 2 was 100x larger!)

  VWAP: (100×3800 + 10000×3810 + 50×3850) / (100 + 10000 + 50)
      = (3,80,000 + 3,81,00,000 + 1,92,500) / 10,150
      = 3,86,72,500 / 10,150
      = Rs 3,809.61
  → Much closer to 3,810 because MOST shares traded at 3,810

VWAP is the "real" price the market paid.
```

#### Why VWAP Matters

```
For institutions (mutual funds, hedge funds):
  They're judged on whether they bought BELOW or ABOVE VWAP.

  Fund manager buys 50,000 shares. Day's VWAP = Rs 3,810.
  
  If average buy price = Rs 3,805 → "Beat VWAP by Rs 5" → GOOD execution
  If average buy price = Rs 3,818 → "Missed VWAP by Rs 8" → BAD execution

  This is why VWAP algorithms exist — computer programs that slowly buy
  throughout the day to try to match or beat the VWAP.
```

---

## 2. Candlestick Charts

### 2.1 What is a Candlestick?

#### Definition

> **Candlestick:** A graphical representation of OHLC price data for a single time period, rendered as a rectangular "body" (spanning the open-to-close range) with vertical "shadows" or "wicks" extending to the high and low prices. Originally developed in 18th-century Japan for rice trading by Munehisa Homma, candlestick charts are now the most widely used chart type in financial markets globally due to their ability to convey price action, direction, and volatility in a single visual element.

**In simple words:** A candlestick is a visual shape drawn from the 4 OHLC numbers. One candle = one time period. Line up many candles and you get a chart that tells the price story over time.

---

### 2.2 Anatomy of a Single Candlestick

```
BULLISH CANDLE (Close > Open = price went UP = typically GREEN or WHITE)

         High → ─── │ ─── ← Thin line = "Upper Shadow" or "Upper Wick"
                    │        (price went this high but got pushed back down)
                    │
    Close → ───┌────┤────┐ ← Top of body
                │████████│
                │████████│ ← "Body" (thick rectangle)
                │████████│    (shows the Open-to-Close range)
                │████████│
     Open → ───└────┤────┘ ← Bottom of body
                    │
                    │        
          Low → ─── │ ─── ← Thin line = "Lower Shadow" or "Lower Wick"
                             (price went this low but bounced back up)


BEARISH CANDLE (Close < Open = price went DOWN = typically RED or BLACK)

         High → ─── │ ───
                    │
     Open → ───┌────┤────┐ ← Open is NOW on top (because Open > Close)
                │░░░░░░░░│
                │░░░░░░░░│ ← Body (often filled/red)
                │░░░░░░░░│
    Close → ───└────┤────┘ ← Close is on bottom
                    │
          Low → ─── │ ───
```

#### Measuring Each Part

```
Given: Open=3800, High=3850, Low=3760, Close=3820 (Bullish — Close > Open)

  Upper Shadow = High - max(Open, Close) = 3850 - 3820 = Rs 30
  Body         = |Close - Open|          = |3820 - 3800| = Rs 20
  Lower Shadow = min(Open, Close) - Low  = 3800 - 3760  = Rs 40
  Total Range  = High - Low              = 3850 - 3760  = Rs 90

  Body as % of range: 20/90 = 22% (small body relative to range)
  This tells us: price swung a lot but didn't move far net → indecisive day
```

---

### 2.3 Reading Candlestick Shapes — What Each Shape Tells You

```
╔═══════════════════════════════════════════════════════════════════════╗
║  SHAPE              │ WHAT IT LOOKS LIKE     │ WHAT IT MEANS          ║
╠═══════════════════════════════════════════════════════════════════════╣
║                     │                        │                        ║
║  Long Green Body    │    ┌────┐              │ Strong buying. Bulls   ║
║                     │    │████│              │ (buyers) dominated     ║
║                     │    │████│              │ the entire period.     ║
║                     │    │████│              │ Very bullish.          ║
║                     │    │████│              │                        ║
║                     │    └────┘              │                        ║
║─────────────────────┼────────────────────────┼────────────────────────║
║                     │                        │                        ║
║  Long Red Body      │    ┌────┐              │ Strong selling. Bears  ║
║                     │    │░░░░│              │ (sellers) dominated.   ║
║                     │    │░░░░│              │ Very bearish.          ║
║                     │    │░░░░│              │                        ║
║                     │    │░░░░│              │                        ║
║                     │    └────┘              │                        ║
║─────────────────────┼────────────────────────┼────────────────────────║
║                     │       │                │                        ║
║  Doji               │    ───┼───             │ Open ≈ Close.          ║
║  (cross shape)      │       │                │ Total indecision.      ║
║                     │                        │ Buyers and sellers     ║
║                     │                        │ perfectly balanced.    ║
║                     │                        │ Often signals a        ║
║                     │                        │ potential reversal.    ║
║─────────────────────┼────────────────────────┼────────────────────────║
║                     │       │                │                        ║
║  Hammer             │       │                │ Price dropped a LOT    ║
║  (short body,       │    ┌──┼──┐            │ during the period but  ║
║   long lower wick)  │    └──┼──┘            │ buyers pushed it all   ║
║                     │       │                │ the way back up.       ║
║                     │       │                │ Bullish signal: "we    ║
║                     │       │                │ rejected the low."     ║
║                     │       │                │                        ║
║─────────────────────┼────────────────────────┼────────────────────────║
║                     │       │                │                        ║
║  Shooting Star      │       │                │ Price went UP a lot    ║
║  (short body,       │       │                │ but sellers pushed it  ║
║   long upper wick)  │    ┌──┼──┐            │ all the way back down. ║
║                     │    └──┼──┘            │ Bearish signal: "we    ║
║                     │       │                │ rejected the high."    ║
║                     │                        │                        ║
║─────────────────────┼────────────────────────┼────────────────────────║
║                     │                        │                        ║
║  Small Body         │    ┌─┐                │ Very little movement.  ║
║  (Spinning Top)     │    │ │                │ Market is quiet or     ║
║                     │    └─┘                │ waiting for something. ║
║                     │                        │ Low conviction.        ║
║─────────────────────┼────────────────────────┼────────────────────────║
║                     │                        │                        ║
║  Marubozu           │    ┌────┐              │ No shadows at all.     ║
║  (no wicks at all)  │    │████│              │ Open = Low, Close = High║
║                     │    │████│              │ (bullish marubozu)     ║
║                     │    └────┘              │ Extreme conviction.    ║
║                     │                        │ Buyers controlled from ║
║                     │                        │ first trade to last.   ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

### 2.4 Reading Multiple Candles Together (Patterns)

Single candles tell a story for one period. But the REAL power is reading sequences of candles:

```
PATTERN 1: ENGULFING (Reversal Signal)

  Bearish Engulfing (top of an uptrend → price might reverse down):

  Day 1:     Day 2:
   ┌──┐     
   │██│     ┌──────┐
   │██│     │░░░░░░│
   └──┘     │░░░░░░│
            │░░░░░░│
            │░░░░░░│
            └──────┘
  
  Day 1: Small green candle (up day)
  Day 2: BIG red candle that completely covers Day 1's body
  
  Meaning: Day 2's sellers overwhelmed Day 1's buyers.
  The momentum has shifted. Price might go down.

  Bullish Engulfing (bottom of a downtrend → price might reverse up):
  Same thing but flipped — small red followed by big green.


PATTERN 2: THREE WHITE SOLDIERS (Strong Bullish)

  Day 1:    Day 2:    Day 3:
                       ┌──┐
                       │██│
              ┌──┐     │██│
              │██│     └──┘
   ┌──┐      │██│
   │██│      └──┘
   │██│
   └──┘
  
  Three consecutive green candles, each closing higher.
  Each candle opens within the previous body and closes above it.
  Strong buying momentum — likely to continue.


PATTERN 3: MORNING STAR (Reversal at Bottom)

  Day 1:    Day 2:    Day 3:
  ┌────┐                    ┌────┐
  │░░░░│                    │████│
  │░░░░│                    │████│
  │░░░░│              ┌─┐   │████│
  └────┘              │ │   └────┘
                      └─┘
  Big red   Tiny body   Big green
  (down)    (indecision) (up)
  
  Day 1: Strong selling
  Day 2: Selling stops, tiny candle (market pauses)
  Day 3: Strong buying takes over
  Meaning: Sellers exhausted → buyers take control → trend reverses up
```

#### Important Warning About Candlestick Patterns

```
┌──────────────────────────────────────────────────────────────┐
│ REALITY CHECK:                                                │
│                                                               │
│ Candlestick patterns are NOT magic. They work SOMETIMES,     │
│ not always. Academic research shows:                          │
│                                                               │
│ - Most patterns have a success rate of 50-60% (barely        │
│   better than a coin flip)                                    │
│ - They work BETTER when combined with other analysis          │
│   (volume, support/resistance, trend)                         │
│ - They work WORSE on shorter timeframes (1-min candles        │
│   are almost random)                                          │
│ - They work BETTER on daily/weekly charts                     │
│                                                               │
│ Professional quant traders generally DON'T use candlestick   │
│ patterns as their primary strategy. They use statistical      │
│ models that look at the raw OHLCV numbers mathematically.    │
│                                                               │
│ But understanding candle shapes helps you VISUALLY            │
│ interpret charts quickly, which is valuable for               │
│ understanding market behavior.                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Timeframes

### 3.1 What is a Timeframe?

#### Definition

> **Timeframe (Bar Period / Resolution):** The duration of time that each individual OHLC bar or candlestick represents. Common timeframes range from 1-second bars (used in high-frequency analysis) to monthly or yearly bars (used in long-term investing). The choice of timeframe fundamentally affects the granularity of price information visible and must align with the trading strategy's holding period and signal frequency.

**In simple words:** The timeframe is how much time one candle represents. A "1-day candle" compresses an entire day into one candle. A "5-minute candle" compresses just 5 minutes.

---

### 3.2 Common Timeframes

```
ULTRA SHORT-TERM (for HFT and scalpers):
  ┌──────────────┬─────────────────────────────────────────┐
  │ 1-second     │ 1 candle = 1 second of trading          │
  │ 5-second     │ Used by: HFT firms, market microstructure│
  │ 15-second    │ research                                 │
  │ 1-minute     │ ~375 candles per trading day (6.25 hrs) │
  └──────────────┴─────────────────────────────────────────┘

SHORT-TERM (for day traders):
  ┌──────────────┬─────────────────────────────────────────┐
  │ 5-minute     │ ~75 candles per day                     │
  │ 15-minute    │ ~25 candles per day                     │
  │ 30-minute    │ ~13 candles per day. Popular for        │
  │              │ intraday swing trading                   │
  │ 1-hour       │ ~6 candles per day                      │
  └──────────────┴─────────────────────────────────────────┘

MEDIUM-TERM (for swing traders):
  ┌──────────────┬─────────────────────────────────────────┐
  │ 4-hour       │ ~2 candles per day                      │
  │ Daily (1D)   │ 1 candle = 1 trading day                │
  │              │ ~252 candles per year                    │
  │              │ THE MOST COMMONLY USED timeframe         │
  └──────────────┴─────────────────────────────────────────┘

LONG-TERM (for investors):
  ┌──────────────┬─────────────────────────────────────────┐
  │ Weekly (1W)  │ 1 candle = Monday open to Friday close  │
  │              │ ~52 candles per year                     │
  │ Monthly (1M) │ 1 candle = first trading day open to    │
  │              │ last trading day close of the month      │
  │              │ ~12 candles per year                     │
  └──────────────┴─────────────────────────────────────────┘
```

---

### 3.3 Same Stock, Different Timeframes — How It Looks

```
TCS on March 31, 2026 — The SAME price action at different timeframes:

═════════════════════════════════════════════════════
5-MINUTE TIMEFRAME (showing 9:15 - 9:45 AM):
═════════════════════════════════════════════════════

  6 candles, each covering 5 minutes:

  9:15-9:20  │ O:3800 H:3810 L:3795 C:3808 │ Green (up Rs 8)
  9:20-9:25  │ O:3808 H:3815 L:3805 C:3812 │ Green (up Rs 4)
  9:25-9:30  │ O:3812 H:3820 L:3810 C:3818 │ Green (up Rs 6)
  9:30-9:35  │ O:3818 H:3825 L:3808 C:3810 │ Red (down Rs 8)
  9:35-9:40  │ O:3810 H:3815 L:3800 C:3805 │ Red (down Rs 5)
  9:40-9:45  │ O:3805 H:3812 L:3802 C:3810 │ Green (up Rs 5)

  You see: ups and downs, lots of detail, looks choppy

═════════════════════════════════════════════════════
30-MINUTE TIMEFRAME (showing 9:15 - 9:45 AM):
═════════════════════════════════════════════════════

  1 candle covering the same 30 minutes:

  9:15-9:45  │ O:3800 H:3825 L:3795 C:3810 │ Green (up Rs 10)

  You see: one simple upward move. The choppiness is hidden.

═════════════════════════════════════════════════════
DAILY TIMEFRAME:
═════════════════════════════════════════════════════

  1 candle covering the entire day:

  March 31   │ O:3800 H:3850 L:3760 C:3820 │ Green (up Rs 20)

  You see: the overall direction for the day. All intraday noise is gone.
```

#### The Key Insight

```
SHORTER timeframe = MORE detail, MORE noise, HARDER to spot trends
LONGER timeframe  = LESS detail, LESS noise, EASIER to spot trends

Analogy:
  5-minute chart  = Looking at the ground while walking 
                    (you see every pebble but can't see where the road goes)
  
  Daily chart     = Looking at a map
                    (you see the road direction but miss the pebbles)
  
  Monthly chart   = Looking at a satellite view
                    (you see the city layout but can't see individual roads)

WHICH TIMEFRAME TO USE?
  It depends on your trading style:
    Day trader (holds for minutes-hours)     → 5-min, 15-min
    Swing trader (holds for days-weeks)      → Daily, 4-hour
    Investor (holds for months-years)        → Weekly, Monthly
    Quant strategy (backtesting)             → Usually Daily
```

---

### 3.4 How Higher Timeframes Are Built From Lower Ones

```
You can ALWAYS construct a higher timeframe from lower ones.
You can NEVER go the other way (can't split a daily candle into 
  5-minute candles unless you have the original 5-minute data).

CONSTRUCTING A DAILY BAR FROM 5-MINUTE BARS:

  Given: All seventy-five 5-minute bars for the day

  Daily Open  = Open of the FIRST 5-minute bar (9:15-9:20)
  Daily High  = MAXIMUM of all 75 bars' highs
  Daily Low   = MINIMUM of all 75 bars' lows
  Daily Close = Close of the LAST 5-minute bar (3:25-3:30)
  Daily Volume = SUM of all 75 bars' volumes

CONSTRUCTING A WEEKLY BAR FROM DAILY BARS:

  Given: 5 daily bars (Monday through Friday)

  Weekly Open  = Monday's Open
  Weekly High  = MAX(Mon high, Tue high, Wed high, Thu high, Fri high)
  Weekly Low   = MIN(Mon low, Tue low, Wed low, Thu low, Fri low)
  Weekly Close = Friday's Close
  Weekly Volume = Sum of all 5 days' volumes
```

---

## 4. Additional Market Data Fields

Beyond OHLCV, there are other important data fields that trading systems use:

### 4.1 Adjusted Prices

#### Definition

> **Adjusted Price:** A historical stock price that has been retroactively modified to account for corporate actions — primarily stock splits, reverse splits, and dividend distributions — that affect the share price without reflecting a change in the company's fundamental value. Adjusted prices ensure that historical price comparisons and return calculations are accurate and not distorted by these events.

**In simple words:** When a company does a stock split or pays a dividend, the raw price changes in a way that doesn't reflect real market movement. Adjusted prices "fix" this so your historical data is consistent.

```
EXAMPLE: STOCK SPLIT

  TCS does a 2-for-1 split on June 1:
    Before split: 1 share at Rs 7,600
    After split:  2 shares at Rs 3,800 each

  RAW PRICE HISTORY:
    May 30: Rs 7,600
    May 31: Rs 7,620
    June 1: Rs 3,810  ← Looks like a 50% CRASH! But it's just a split.

  ADJUSTED PRICE HISTORY:
    May 30: Rs 3,800  ← divided by 2
    May 31: Rs 3,810  ← divided by 2
    June 1: Rs 3,810  ← unchanged

  Now the chart looks smooth. No fake crash.

WHY THIS MATTERS:
  If your strategy calculates "% change from yesterday":
    Raw data:      (3810 - 7620) / 7620 = -50% → Strategy thinks CRASH → SELLS
    Adjusted data: (3810 - 3810) / 3810 = 0%   → Strategy sees nothing unusual

  Using raw (unadjusted) data will DESTROY your backtest.
  ALWAYS use adjusted prices for historical analysis.
```

---

### 4.2 Market Capitalization

#### Definition

> **Market Capitalization (Market Cap):** The total market value of a company's outstanding shares of stock, calculated as the current share price multiplied by the total number of shares outstanding. Market cap is used to classify companies by size (mega-cap, large-cap, mid-cap, small-cap, micro-cap) and is a key factor in index construction and portfolio weighting.

**In simple words:** Market cap = price per share x total number of shares. It tells you how "big" the company is in the market's eyes.

```
TCS:
  Share price: Rs 3,800
  Shares outstanding: 365 crore (3.65 billion)
  Market cap: 3,800 × 365,00,00,000 = Rs 13,87,000 crore (~$165 billion)

SIZE CATEGORIES:
  Mega-cap:  > Rs 5,00,000 crore    (Reliance, TCS, HDFC)
  Large-cap: Rs 50,000 - 5,00,000 cr (top 100 companies)
  Mid-cap:   Rs 15,000 - 50,000 cr   (101st to 250th)
  Small-cap: < Rs 15,000 crore       (251st and below)

WHY IT MATTERS FOR TRADING:
  Large-cap stocks: More liquid, tighter spreads, lower market impact
  Small-cap stocks: Less liquid, wider spreads, higher market impact
  Your strategy might work on large-caps but FAIL on small-caps
  because of liquidity differences.
```

---

### 4.3 Returns (How to Measure Price Changes)

#### Definition

> **Return:** The percentage change in the value of an investment over a specified period. Returns can be calculated as simple (arithmetic) returns or logarithmic (log) returns. Simple returns are intuitive and additive across assets; log returns are additive across time periods and have better statistical properties, making them preferred in quantitative finance for modeling and analysis.

**In simple words:** Return = how much money you made or lost, as a percentage.

```
TWO WAYS TO CALCULATE RETURNS:

1. SIMPLE (ARITHMETIC) RETURN:
   R = (P_today - P_yesterday) / P_yesterday

   Example: Price went from Rs 3,800 to Rs 3,838
   R = (3838 - 3800) / 3800 = 38/3800 = 0.01 = 1%

   Pros: Easy to understand, intuitive
   Cons: Not additive across time (1% + 1% ≠ 2.01%, it's actually 2.01%)

2. LOGARITHMIC (LOG) RETURN:
   r = ln(P_today / P_yesterday)

   Example: Price went from Rs 3,800 to Rs 3,838
   r = ln(3838/3800) = ln(1.01) = 0.00995 = 0.995%

   Pros: Additive across time (0.995% + 0.995% = 1.99%, and this IS correct)
         Better statistical properties (more normally distributed)
         Symmetry: +10% and -10% are equal in magnitude
   Cons: Less intuitive

FOR QUANT STRATEGIES: Use log returns for calculations, convert to simple 
  returns for reporting (because people understand "I made 15%" not "I made 
  0.1398 log return").
```

---

## 5. Data Sources and Formats

### 5.1 Where Does Market Data Come From?

```
┌────────────────────┬────────────────────────────────────────────┐
│ Data Source         │ What You Get                               │
├────────────────────┼────────────────────────────────────────────┤
│ Exchange Direct     │ Official tick-by-tick data from NSE/BSE   │
│ (NSE, BSE)         │ Most accurate. Expensive. Requires license.│
├────────────────────┼────────────────────────────────────────────┤
│ Data Vendors        │ Cleaned, adjusted, ready-to-use data      │
│ (Bloomberg,        │ Multiple markets, multiple frequencies     │
│  Reuters, Quandl)  │ Expensive ($$$)                            │
├────────────────────┼────────────────────────────────────────────┤
│ Free APIs           │ Daily OHLCV data, often delayed           │
│ (Yahoo Finance,    │ Good for learning and basic backtesting    │
│  Alpha Vantage)    │ May have errors, gaps, survivorship bias   │
├────────────────────┼────────────────────────────────────────────┤
│ Broker APIs         │ Data from your brokerage account          │
│ (Zerodha Kite,     │ Real-time during market hours              │
│  Interactive        │ Historical data varies by broker           │
│  Brokers)          │                                            │
└────────────────────┴────────────────────────────────────────────┘
```

---

### 5.2 Data Formats

```
FORMAT 1: CSV (Comma Separated Values)
  Simple text file. Every row = one bar.
  
  date,open,high,low,close,volume
  2024-01-02,3780.00,3825.00,3770.00,3810.00,1234567
  2024-01-03,3812.00,3850.00,3805.00,3840.00,987654
  2024-01-04,3838.00,3842.00,3790.00,3795.00,1567890

  Pros: Human-readable, universal, any program can read it
  Cons: Slow to load for large datasets, no type information
  Used for: Small datasets, sharing data, simple projects

FORMAT 2: PARQUET (columnar binary format)
  Binary file. Compressed. Column-oriented.

  Pros: 10-50x smaller than CSV, 10-100x faster to read
        Preserves data types (float, int, datetime)
        Can read individual columns without loading entire file
  Cons: Not human-readable (binary)
  Used for: Production systems, large datasets, Alpha Arena

FORMAT 3: HDF5 (Hierarchical Data Format)
  Binary file. Can store multiple datasets in one file.
  
  Pros: Fast, supports multiple tables, compression
  Cons: Complex, less common than Parquet
  Used for: Scientific computing, some quant systems

FORMAT 4: DATABASE (PostgreSQL, TimescaleDB)
  Data stored in SQL database tables.
  
  Pros: Queryable (SQL), handles updates well, ACID guarantees
  Cons: Slower than Parquet for bulk reads, needs database server
  Used for: Live systems that need real-time updates

THE WINNER FOR BACKTESTING: Parquet
  It's the industry standard for storing historical market data.
  Python's pandas library reads Parquet natively.
  
  import pandas as pd
  data = pd.read_parquet("tcs_daily.parquet")
  # Loads 5 years of daily data in ~10 milliseconds
```

---

### 5.3 Data Quality Issues (Things That Go Wrong)

```
ISSUE 1: MISSING DATA
  Some days have no data (holidays, exchange outages).
  Some stocks stop trading temporarily (circuit limits, suspension).
  
  Fix: Forward-fill the last known price. Mark gaps.

ISSUE 2: WRONG DATA (Bad Ticks)
  Sometimes the data contains obvious errors:
    TCS: Open=3800, High=38000, Low=3780, Close=3820
    That High of 38,000 is clearly wrong (10x the real price).
  
  Fix: Filter outliers — if any OHLC value is more than X% from
  the others, flag it as suspicious.

ISSUE 3: SURVIVORSHIP BIAS
  Your database only contains stocks that EXIST today.
  Stocks that went bankrupt, delisted, or merged are missing.
  
  This makes your backtest look better than reality because
  you never test on the stocks that failed.
  
  Fix: Use a "point-in-time" dataset that includes dead stocks.

ISSUE 4: LOOK-AHEAD BIAS IN DATA
  Your data file might contain "adjusted" prices that use
  FUTURE information (like a split that happened later).
  
  Fix: Use point-in-time adjusted data. Each day's data should
  only use information available up to that day.

ISSUE 5: TIMEZONE CONFUSION
  US markets (NYSE): Eastern Time (ET)
  Indian markets (NSE): IST
  If your data mixes timezones without labels → wrong bar alignment
  
  Fix: Always store timestamps in UTC. Convert to local only for display.
```

---

## 6. Putting It All Together: From Raw Trades to Strategy Input

```
╔═══════════════════════════════════════════════════════════════════╗
║           THE DATA PIPELINE: RAW TRADES → STRATEGY INPUT         ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────┐                                             ║
║  │ EXCHANGE         │  Produces: Tick-by-tick trade data          ║
║  │ (NSE/NYSE)      │  Format: timestamp, price, qty, side        ║
║  │                  │  Volume: ~50,000 trades/day/stock           ║
║  └────────┬─────────┘                                            ║
║           │                                                       ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ DATA VENDOR      │  Collects, cleans, adjusts                 ║
║  │ (or your own     │  Handles: splits, dividends, delistings    ║
║  │  pipeline)       │  Outputs: Clean adjusted OHLCV bars        ║
║  └────────┬─────────┘                                            ║
║           │                                                       ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ STORAGE          │  Format: Parquet files (or database)       ║
║  │                  │  Organization: One file per stock           ║
║  │                  │  Schema: date|open|high|low|close|volume   ║
║  └────────┬─────────┘                                            ║
║           │                                                       ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ DATA LOADER      │  Reads parquet, validates quality          ║
║  │                  │  Builds EquitySnapshot (Pydantic model)    ║
║  │                  │  Prevents look-ahead bias                  ║
║  └────────┬─────────┘                                            ║
║           │                                                       ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ STRATEGY         │  Receives: clean OHLCV data + volume       ║
║  │                  │  Plus: portfolio state, risk limits         ║
║  │                  │  Outputs: trading signals / orders          ║
║  └─────────────────┘                                            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Key Takeaways

```
1. OHLC compresses thousands of trades into 4 numbers:
   Open (first), High (max), Low (min), Close (last).
   Add Volume for OHLCV — the standard representation.

2. CANDLESTICKS are the visual form of OHLC:
   Body = Open-Close range, Wicks = High/Low extremes.
   Green = up, Red = down. Shape tells the story.

3. TIMEFRAME determines granularity:
   5-min for day traders, Daily for most strategies, Weekly for investors.
   Higher timeframes are built by aggregating lower ones.

4. VOLUME confirms price moves:
   High volume = strong conviction. Low volume = weak/suspicious.
   VWAP is the "true average price" weighted by volume.

5. ADJUSTED PRICES are essential:
   Always use split/dividend adjusted data for backtesting.
   Raw prices will give you fake signals and wrong returns.

6. DATA QUALITY matters:
   Missing data, bad ticks, survivorship bias, timezone issues.
   Bad data → bad backtest → bad strategy → lost money.

7. PARQUET is the standard format:
   10-100x faster than CSV. Use it for anything serious.
```

---

*Next up: Part 5 — Risk & Capital (Leverage and Margin)*
