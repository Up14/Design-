# Trading & Market Microstructure — Complete Guide

> **How to read this:** Every topic starts with a simple definition, then a real-world example. No prior knowledge assumed. If a term is used, it's explained first.

---

## Table of Contents

### Core Topics
1. [What is Bid, Ask, and Spread](#1-what-is-bid-ask-and-spread)
2. [Order Types (Limit, Market, Stop-Loss)](#2-order-types-limit-market-stop-loss)
3. [Order Actions (New, Modify, Cancel)](#3-order-actions-new-modify-cancel)
4. [Difference Between Orders and Trades](#4-difference-between-orders-and-trades)
5. [Central Limit Order Book (CLOB)](#5-central-limit-order-book-clob)
6. [Price-Time Priority in Order Book](#6-price-time-priority-in-order-book)
7. [Exchange Matching Engine](#7-exchange-matching-engine)
8. [What is OHLC Candlestick](#8-what-is-ohlc-candlestick)
9. [What is Leverage](#9-what-is-leverage)
10. [What is Margin](#10-what-is-margin)
11. [How to Build a Realistic Paper Trading Matching Engine](#11-how-to-build-a-realistic-paper-trading-matching-engine)

### Optional Topics
12. [What is Algorithmic Trading](#12-what-is-algorithmic-trading)
13. [What is High Frequency Trading](#13-what-is-high-frequency-trading)
14. [What is Arbitrage](#14-what-is-arbitrage)
15. [What is Statistical Arbitrage](#15-what-is-statistical-arbitrage)
16. [Styles of Investing](#16-styles-of-investing)
17. [What is Superforecasting](#17-what-is-superforecasting)

---

## Core Topics

---

### 1. What is Bid, Ask, and Spread

#### Prerequisites
- **Stock:** A tiny piece of ownership in a company. If a company is a pizza, a stock is one slice.
- **Buyer:** Someone who wants to purchase a stock.
- **Seller:** Someone who wants to sell a stock they already own.

#### Definition

- **Bid Price:** The highest price a buyer is currently willing to pay for a stock. Think of it as: "I'll buy it for THIS much."

- **Ask Price (also called Offer Price):** The lowest price a seller is currently willing to accept. Think of it as: "I'll sell it for THIS much."

- **Spread:** The gap (difference) between the ask price and the bid price. Spread = Ask - Bid.

#### Why does the spread exist?

The buyer wants to pay as little as possible. The seller wants to get as much as possible. They rarely agree on the exact same price. The gap between what the buyer offers and what the seller wants is the spread.

#### Example

Imagine you want to buy shares of Reliance Industries.

```
Current market for Reliance:
  Best Bid (highest buyer):  Rs 2,498  (someone is saying "I'll buy at 2,498")
  Best Ask (lowest seller):  Rs 2,502  (someone is saying "I'll sell at 2,502")
  Spread:                    Rs 4      (2,502 - 2,498 = 4)
```

- If you want to buy RIGHT NOW, you pay Rs 2,502 (the ask price) because that's the cheapest anyone is willing to sell for.
- If you want to sell RIGHT NOW, you get Rs 2,498 (the bid price) because that's the most anyone is willing to pay right now.
- The Rs 4 gap is profit for whoever is standing in the middle (this middle person is called a "market maker" — more on that later).

#### Key Insight

A **tight spread** (small gap, like Rs 1) means the stock is very actively traded — lots of buyers and sellers (this is called "liquid"). A **wide spread** (big gap, like Rs 50) means fewer people are trading it — harder to buy/sell quickly (this is called "illiquid").

---

### 2. Order Types (Limit, Market, Stop-Loss)

#### Prerequisites
- You know what bid and ask prices are (see above).
- **Broker:** A middleman company (like Zerodha, Groww) that sends your buy/sell request to the stock exchange (like NSE/BSE).

#### Definition

An **order** is an instruction you give to your broker: "Buy or sell this stock, at this price, in this quantity." There are different types of orders depending on HOW you want the transaction to happen.

---

#### A. Market Order

**Definition:** "Buy/sell this stock RIGHT NOW at whatever the current price is. I don't care about the exact price, I just want it done immediately."

**Example:**

```
You: "Buy 10 shares of TCS at market price"
Current Ask: Rs 3,800

Result: You get 10 shares of TCS at approximately Rs 3,800 each.
Total cost: ~Rs 38,000
```

**Pros:** Guaranteed to execute (as long as someone is selling).
**Cons:** You might pay slightly more (or sell for slightly less) than you expected, especially if the stock is moving fast. This difference is called **slippage**.

**When to use:** When speed matters more than price. "Just get me in/out NOW."

---

#### B. Limit Order

**Definition:** "Buy/sell this stock ONLY at my specified price or better. If the price doesn't reach my level, don't do anything — I'll wait."

**Example:**

```
TCS is currently trading at Rs 3,800.
You: "Buy 10 shares of TCS, but only at Rs 3,750 or lower"

Scenario 1: Price drops to Rs 3,750 → Order executes! You buy at Rs 3,750.
Scenario 2: Price stays at Rs 3,800 all day → Order does NOT execute. Nothing happens.
Scenario 3: Price drops to Rs 3,740 → Order executes at Rs 3,740 (even better than you asked!)
```

**Pros:** You control the exact price. No surprises.
**Cons:** Your order might never execute if the price doesn't reach your level.

**When to use:** When price matters more than speed. "I'll only buy if I get a good deal."

---

#### C. Stop-Loss Order

**Definition:** "If the price moves AGAINST me and hits a certain bad level, automatically sell (or buy) to limit my losses."

It's like a safety net. You set a trigger price. If the stock reaches that trigger, a market order is automatically placed.

**Example:**

```
You bought TCS at Rs 3,800. You're worried it might crash.
You set a Stop-Loss: "If TCS falls to Rs 3,600, sell my shares automatically."

Scenario 1: TCS goes to Rs 4,000 → Nothing happens. You're making profit.
Scenario 2: TCS drops to Rs 3,600 → TRIGGERED! Your shares are sold automatically at ~Rs 3,600.
             You lost Rs 200 per share instead of potentially Rs 500+ if it kept falling.
```

**Why it matters:** Without a stop-loss, if the stock crashes while you're sleeping or not watching, you could lose a LOT more money. Stop-loss protects you automatically.

---

#### Summary Table

| Order Type | Speed | Price Control | Use When |
|-----------|-------|--------------|----------|
| Market | Instant | None (take current price) | Speed > Price |
| Limit | May never fill | Full control | Price > Speed |
| Stop-Loss | Triggers at threshold | Partial (trigger then market) | Protection from losses |

---

### 3. Order Actions (New, Modify, Cancel)

#### Definition

Once you understand what an order is, there are three things (actions) you can do with it:

#### A. New Order

**Definition:** Sending a fresh instruction to the exchange. "I want to buy/sell this stock."

**Example:**
```
Action: NEW
You: "Buy 50 shares of Infosys at limit price Rs 1,500"
→ A brand new order is created and sent to the exchange.
→ The exchange puts it in the order book (waiting list).
```

#### B. Modify Order (also called Amend)

**Definition:** Changing the details of an order that hasn't been executed yet. You can change the price, quantity, or both.

**Example:**
```
Your existing order: "Buy 50 shares of Infosys at Rs 1,500"
Infosys is now trading at Rs 1,520 and not coming down.

Action: MODIFY
You: "Change my order to: Buy 50 shares of Infosys at Rs 1,510"
→ The exchange updates your order with the new price.
```

**Important:** You can only modify an order that is still WAITING (not yet filled). Once it's executed, it's done — you can't modify it.

#### C. Cancel Order

**Definition:** Removing your order completely. "Never mind, I don't want to buy/sell anymore."

**Example:**
```
Your existing order: "Buy 50 shares of Infosys at Rs 1,500"
You changed your mind.

Action: CANCEL
You: "Cancel my Infosys buy order"
→ The exchange removes your order from the waiting list.
→ Nothing happens. No shares bought, no money spent.
```

#### Real Life Flow
```
1. You place a NEW order          → Order sits in the order book, waiting
2. Price isn't right, you MODIFY  → Order is updated with new price/quantity
3. You change your mind, CANCEL   → Order is removed completely
   OR
3. Price matches, order EXECUTES  → You now own the shares (this is a trade!)
```

---

### 4. Difference Between Orders and Trades

#### Definition

This is one of the most important distinctions in trading:

- **Order:** Your INTENTION. "I want to buy 50 shares at Rs 1,500." It's a request. It may or may not happen.

- **Trade (also called Execution or Fill):** The ACTUAL transaction. "50 shares were bought at Rs 1,500." It already happened. Money moved, shares moved.

#### Analogy

Think of ordering food at a restaurant:
- **Order** = You tell the waiter "I want butter chicken" (this is your request)
- **Trade** = The kitchen makes it and the waiter brings it to your table (this is the actual delivery)

Just because you ordered doesn't mean you'll get it. The kitchen might be out of chicken (no seller at your price). You might cancel before it's made (cancel order). You might change to paneer (modify order).

#### Example

```
Step 1 - ORDER:
  You: "Buy 100 shares of HDFC Bank at limit Rs 1,650"
  Status: ORDER PLACED (pending... waiting for a seller at Rs 1,650)

Step 2 - Waiting...
  Current price: Rs 1,660 (no one selling at 1,650 yet)
  Status: OPEN ORDER (still waiting)

Step 3 - TRADE:
  Price drops to Rs 1,650. A seller agrees.
  Status: EXECUTED / FILLED
  → A TRADE happened: 100 shares transferred to you, Rs 1,65,000 debited from your account.
```

#### Key Differences Table

| | Order | Trade |
|---|---|---|
| What is it? | A request/instruction | An actual completed transaction |
| Can be cancelled? | Yes (if not yet filled) | No (already done) |
| Money moves? | Not yet | Yes |
| Shares move? | Not yet | Yes |
| Guaranteed? | No | Yes (it already happened) |

---

### 5. Central Limit Order Book (CLOB)

#### Prerequisites
- You know what bid, ask, limit orders, and market orders are.

#### Definition

A **Central Limit Order Book (CLOB)** is a system that collects ALL buy orders and ALL sell orders for a stock in ONE place, organized by price. It's like a public waiting list that everyone can see.

- **Central** = One single place (the exchange, like NSE)
- **Limit** = It primarily holds limit orders (orders with specific prices)
- **Order Book** = A list/book of all waiting orders

#### What does it look like?

```
============== ORDER BOOK for TCS ==============

        BUY SIDE (Bids)          |         SELL SIDE (Asks)
   Price    | Quantity            |    Price    | Quantity
   ---------+----------          |    ---------+----------
   Rs 3,798 | 200 shares         |    Rs 3,802 | 150 shares    ← Best Ask
   Rs 3,795 | 500 shares         |    Rs 3,805 | 300 shares
   Rs 3,790 | 1,000 shares       |    Rs 3,810 | 100 shares
   Rs 3,785 | 350 shares         |    Rs 3,815 | 800 shares
        ↑                                ↑
    Best Bid (highest buyer)     Lowest seller

   Spread = Rs 3,802 - Rs 3,798 = Rs 4
```

**Reading this:**
- Left side: People who want to BUY. Sorted highest price on top (because the person willing to pay the most is most likely to get shares first).
- Right side: People who want to SELL. Sorted lowest price on top (because the person willing to sell cheapest is most likely to sell first).

#### How it works step by step

```
1. Rajesh places: "BUY 100 TCS at Rs 3,798"
   → Goes to the BUY side of the book

2. Priya places: "SELL 100 TCS at Rs 3,802"
   → Goes to the SELL side of the book

3. No match yet! (Rajesh wants to pay 3,798, Priya wants 3,802)
   Both orders sit in the book, waiting.

4. Amit places: "BUY 100 TCS at MARKET PRICE"
   → He wants it NOW, doesn't care about price
   → The exchange matches him with Priya (cheapest seller at 3,802)
   → TRADE: Amit buys 100 shares at Rs 3,802 from Priya
   → Priya's order is removed from the book (it's been filled)
```

#### Why is it important?

The CLOB is the HEART of any stock exchange. Every buy and sell goes through it. It ensures:
- **Transparency:** Everyone sees the same prices
- **Fairness:** Orders are matched by rules (price-time priority, explained next)
- **Price Discovery:** The "real" price of a stock emerges from where buyers and sellers meet

---

### 6. Price-Time Priority in Order Book

#### Definition

When multiple orders are waiting in the order book, the exchange needs rules to decide: "Which order gets filled first?" The rule is called **Price-Time Priority:**

1. **Price Priority (first rule):** Better price goes first.
   - For BUY orders: Higher price = better (willing to pay more = you go first)
   - For SELL orders: Lower price = better (willing to sell cheaper = you go first)

2. **Time Priority (tiebreaker):** If two orders have the SAME price, whoever placed their order FIRST goes first. First come, first served.

#### Example

```
Three people want to BUY TCS:

Order 1: Rajesh  — BUY 100 at Rs 3,800 — placed at 10:00:00 AM
Order 2: Priya   — BUY 200 at Rs 3,805 — placed at 10:00:05 AM
Order 3: Amit    — BUY 150 at Rs 3,800 — placed at 10:00:03 AM

Now a seller comes: "SELL 300 shares at market price"

Who gets filled first?

Step 1 — PRICE PRIORITY:
  Priya offered Rs 3,805 (highest bid) → She goes FIRST
  Rajesh and Amit both offered Rs 3,800 → They're tied on price

Step 2 — TIME PRIORITY (for the tie):
  Rajesh placed at 10:00:00, Amit at 10:00:03
  Rajesh was first → He goes SECOND
  Amit → He goes THIRD

Execution order:
  1. Priya gets 200 shares at Rs 3,805 (best price)
  2. Rajesh gets 100 shares at Rs 3,800 (same price as Amit, but earlier)
  3. Amit: Only 0 shares left (300 - 200 - 100 = 0). Amit gets nothing this time.
     His order stays in the book, waiting for the next seller.
```

#### Why this matters

This prevents unfair advantages. You can't jump the queue unless you offer a better price. And if prices are equal, it's strictly first-come-first-served. This is how EVERY major stock exchange in the world works.

---

### 7. Exchange Matching Engine

#### Definition

The **Matching Engine** is the software at the heart of a stock exchange that takes incoming orders and matches buyers with sellers. It runs the CLOB and enforces price-time priority.

Think of it as the "brain" of the exchange.

#### What it does

```
Incoming Order → Matching Engine → Does a matching seller/buyer exist?
                                      ↓ YES → Execute trade, notify both parties
                                      ↓ NO  → Add order to the order book, wait
```

#### Step-by-step example

```
The order book for TCS is:

  SELL side:
    Rs 3,802 | 150 shares (Priya)
    Rs 3,805 | 300 shares (Neha)

New order arrives: "Amit wants to BUY 200 shares at Rs 3,805 (limit)"

Matching Engine thinks:
  1. Is there a seller at Rs 3,805 or lower? YES — Priya at Rs 3,802!
  2. Priya has 150 shares. Amit wants 200.
  3. Match 150 shares at Rs 3,802 (Priya's price, because she was there first)
     → TRADE 1: 150 shares at Rs 3,802
  4. Amit still needs 50 more shares. Next seller? Neha at Rs 3,805.
  5. Match 50 shares at Rs 3,805
     → TRADE 2: 50 shares at Rs 3,805
  6. Amit's order is now fully filled (150 + 50 = 200). Done!
  7. Neha still has 250 shares left in the book (300 - 50 = 250).
```

#### Speed

Real exchange matching engines are EXTREMELY fast:
- **NSE (India):** Processes orders in ~10 microseconds (0.00001 seconds)
- **NYSE (USA):** Handles millions of orders per second
- They use special hardware and low-level programming (C/C++, FPGA chips)

#### Key properties of a good matching engine
- **Fast:** Microsecond-level response
- **Fair:** Follows price-time priority strictly
- **Reliable:** Cannot crash or lose orders (billions of rupees depend on it)
- **Deterministic:** Same inputs always produce same outputs

---

### 8. What is OHLC Candlestick

#### Prerequisites
- **Trading Day:** The hours when the stock exchange is open (e.g., NSE: 9:15 AM to 3:30 PM).
- **Time Period:** Candlesticks can represent any time period: 1 minute, 5 minutes, 1 hour, 1 day, 1 week, etc.

#### Definition

**OHLC** stands for four prices that summarize trading activity during a specific time period:

- **O = Open:** The FIRST price at which the stock traded when the period started.
- **H = High:** The HIGHEST price the stock reached during the period.
- **L = Low:** The LOWEST price the stock went to during the period.
- **C = Close:** The LAST price at which the stock traded when the period ended.

A **Candlestick** is a visual way to draw these 4 numbers as a shape on a chart.

#### Example (1-day candle for TCS on March 31, 2026)

```
TCS trading on March 31:
  9:15 AM  — First trade at Rs 3,800       → Open  = 3,800
  11:30 AM — Price shoots up to Rs 3,850    → High  = 3,850
  1:45 PM  — Price drops to Rs 3,770        → Low   = 3,770
  3:30 PM  — Last trade at Rs 3,820         → Close = 3,820

OHLC = (3800, 3850, 3770, 3820)
```

#### How a candlestick is drawn

```
    If Close > Open (price went UP = "bullish" = green candle):

         ┃  ← High (3,850) — this thin line is called the "wick" or "shadow"
         ┃
        ┏┃┓ ← Close (3,820) — top of the thick box (called the "body")
        ┃┃┃
        ┃┃┃  Body (filled/colored rectangle)
        ┃┃┃
        ┗┃┛ ← Open (3,800) — bottom of the body
         ┃
         ┃  ← Low (3,770)

    If Close < Open (price went DOWN = "bearish" = red candle):

         ┃  ← High
        ┏┃┓ ← Open (top of body, because Open > Close)
        ┃┃┃
        ┗┃┛ ← Close (bottom of body)
         ┃  ← Low
```

#### Reading candles at a glance

| What you see | What it means |
|---|---|
| Green/white candle | Price went UP (Close > Open) |
| Red/black candle | Price went DOWN (Close < Open) |
| Long body | Big price move (strong trend) |
| Short body | Small price move (indecision) |
| Long upper wick | Price went high but got pushed back down |
| Long lower wick | Price went low but bounced back up |

#### Why candlesticks matter

Instead of looking at thousands of individual trades, you can look at one candle and instantly know:
- Where the price started
- How high and low it went
- Where it ended
- Whether it went up or down

A chart with many candles side by side shows you the story of a stock over time.

---

### 9. What is Leverage

#### Prerequisites
- **Capital:** The money you have available to invest/trade.
- **Position:** The total value of stock you hold. If you buy 100 shares at Rs 1,000 each, your position is Rs 1,00,000.

#### Definition

**Leverage** means using borrowed money to increase the size of your trade beyond what your own money would allow. It's like a multiplier on your buying power.

If you have Rs 1,00,000 and use **5x leverage**, you can trade as if you have Rs 5,00,000.

#### Example

```
Without leverage:
  Your money: Rs 1,00,000
  You buy: 100 shares of XYZ at Rs 1,000 each
  Stock goes up 10%: You make Rs 10,000 profit (10% of 1,00,000)
  Stock goes down 10%: You lose Rs 10,000 (10% of 1,00,000)

With 5x leverage:
  Your money: Rs 1,00,000
  Broker lends you: Rs 4,00,000
  Total buying power: Rs 5,00,000
  You buy: 500 shares of XYZ at Rs 1,000 each

  Stock goes up 10%:
    Position value: Rs 5,50,000
    Return the borrowed Rs 4,00,000
    You keep: Rs 1,50,000
    Profit: Rs 50,000 (50% return on YOUR Rs 1,00,000!)

  Stock goes down 10%:
    Position value: Rs 4,50,000
    Return the borrowed Rs 4,00,000
    You keep: Rs 50,000
    Loss: Rs 50,000 (50% of YOUR money is gone!)

  Stock goes down 20%:
    Position value: Rs 4,00,000
    Return the borrowed Rs 4,00,000
    You keep: Rs 0
    Loss: Rs 1,00,000 — ALL YOUR MONEY IS GONE.
```

#### The key insight

Leverage **multiplies both profits AND losses.** A 10% move with 5x leverage becomes a 50% move on your actual money. This is why leverage is often called a "double-edged sword."

#### Real-world leverage examples
- **Futures trading in India:** Typically 5x-15x leverage
- **Forex trading:** Up to 50x-100x leverage (extremely risky)
- **Buying a house with a home loan:** That's leverage too! You put 20% down, borrow 80%.

---

### 10. What is Margin

#### Definition

**Margin** is the minimum amount of YOUR OWN money that you must deposit with the broker to use leverage. It's the "collateral" or "security deposit" that the broker requires.

Margin and leverage are two sides of the same coin:
- **Leverage = Total Position / Your Money**
- **Margin = Your Money / Total Position** (expressed as a percentage)

#### Example

```
You want to buy Rs 5,00,000 worth of stocks.
Broker requires 20% margin.

  Margin (your money):  20% of 5,00,000 = Rs 1,00,000
  Broker's money:       80% of 5,00,000 = Rs 4,00,000
  Leverage:             5,00,000 / 1,00,000 = 5x

Relationship:
  20% margin = 5x leverage   (1/0.20 = 5)
  10% margin = 10x leverage  (1/0.10 = 10)
  50% margin = 2x leverage   (1/0.50 = 2)
```

#### Margin Call — The scary part

If your trade starts losing money, the broker gets nervous. If your losses eat into the margin, the broker sends a **margin call**: "Deposit more money, or I'll forcefully close your position."

```
Your margin: Rs 1,00,000
Position: Rs 5,00,000 in stocks (5x leverage)
Maintenance margin: 10% (Rs 50,000 minimum)

Stock drops 10%:
  Position value: Rs 4,50,000
  Loss: Rs 50,000
  Your remaining equity: Rs 1,00,000 - Rs 50,000 = Rs 50,000
  That's exactly 10% — MARGIN CALL!

  Broker: "Deposit more money within 24 hours or I sell everything."

If you don't deposit:
  Broker sells your shares at whatever price they can get.
  You get back whatever is left (maybe nothing).
```

#### Types of margin
- **Initial Margin:** The amount needed to OPEN a position (e.g., 20%)
- **Maintenance Margin:** The minimum amount needed to KEEP the position open (e.g., 10%)
- **Margin Call:** When your equity drops below the maintenance margin

---

### 11. How to Build a Realistic Paper Trading Matching Engine

#### Prerequisites
You should understand all topics above (1-10) before this section.

#### Definition

A **paper trading matching engine** is a fake (simulated) exchange that behaves like a real one, but uses no real money. It's used for:
- Testing trading strategies without risking money
- Learning how exchanges work
- Backtesting (testing strategies on historical data)

"Paper trading" = trading on paper, not for real.

#### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Paper Trading Engine                  │
│                                                       │
│  ┌──────────┐    ┌──────────────┐    ┌────────────┐ │
│  │  Order    │───→│  Matching    │───→│   Trade    │ │
│  │  Gateway  │    │  Engine      │    │   Logger   │ │
│  └──────────┘    └──────────────┘    └────────────┘ │
│       ↑               ↑│                    │        │
│       │          ┌─────┘│                   ↓        │
│  ┌──────────┐   │  ┌────↓─────┐    ┌────────────┐  │
│  │  Your    │   │  │  Order   │    │  Portfolio  │  │
│  │ Strategy │   │  │  Book    │    │  Tracker    │  │
│  └──────────┘   │  └──────────┘    └────────────┘  │
│                 │       ↑                            │
│            ┌────┘  ┌────┴─────┐                     │
│            │       │  Market  │                      │
│            │       │  Data    │                      │
│            │       │  Feed    │                      │
│            │       └──────────┘                      │
│            │                                         │
│       ┌────┴─────┐                                   │
│       │  Cost    │                                   │
│       │  Model   │                                   │
│       └──────────┘                                   │
└─────────────────────────────────────────────────────┘
```

#### Component-by-component

##### A. Order Book (the data structure)

```python
# Simplified order book structure
class OrderBook:
    # Buy orders: sorted by price DESCENDING (highest first), then by time
    bids = [
        {"price": 3805, "qty": 200, "time": "10:00:05", "id": "order_2"},
        {"price": 3800, "qty": 100, "time": "10:00:00", "id": "order_1"},
        {"price": 3800, "qty": 150, "time": "10:00:03", "id": "order_3"},
    ]

    # Sell orders: sorted by price ASCENDING (lowest first), then by time
    asks = [
        {"price": 3802, "qty": 150, "time": "10:00:01", "id": "order_4"},
        {"price": 3810, "qty": 300, "time": "10:00:02", "id": "order_5"},
    ]
```

##### B. Matching Logic (the core algorithm)

```
When a new BUY order arrives:
  1. Look at the SELL side (asks)
  2. Is the lowest ask price <= buy order price?
     YES → Match them! Create a trade.
           If buy order not fully filled, check next ask.
     NO  → No match possible. Add buy order to the order book.

When a new SELL order arrives:
  1. Look at the BUY side (bids)
  2. Is the highest bid price >= sell order price?
     YES → Match them! Create a trade.
           If sell order not fully filled, check next bid.
     NO  → No match possible. Add sell order to the order book.
```

##### C. Cost Model (making it realistic)

A real trade isn't free. To make your paper engine realistic, you need to simulate costs:

```
Total cost of a trade = Commission + Slippage + Market Impact

1. Commission: Fixed fee per trade (e.g., Rs 20 per order on Zerodha)

2. Slippage: The difference between expected price and actual fill price.
   In real markets, by the time your order reaches the exchange,
   the price might have moved slightly.
   Simulation: Add random noise of ±1-2 basis points.
   (1 basis point = 0.01%, so on Rs 3,800 stock, 2 bps = Rs 0.76)

3. Market Impact: Large orders move the price against you.
   If you try to buy 1,00,000 shares, your own buying pushes the price up.
   Simulation: Use square-root model:
   Impact = constant × sqrt(order_size / daily_volume) × volatility
```

##### D. Fill Simulation (when do orders get filled?)

Two approaches:

```
Approach 1: "Top of Book" (simple)
  Your limit buy at Rs 3,800 gets filled IF the market ask ever touches Rs 3,800.
  Problem: In reality, there are many orders at 3,800. You might not be first.

Approach 2: "Probabilistic" (more realistic)
  Even if price touches Rs 3,800, your fill probability depends on:
  - How deep is the order book at that price level?
  - How much volume traded at that level?
  - Your order size vs. available volume
  Smaller orders and more volume = higher fill probability.
```

##### E. Portfolio Tracker

```
After each trade, update:
  - Positions: Which stocks do you hold, how many shares?
  - Cash: How much money is left?
  - P&L: Profit/Loss (both realized and unrealized)

  Realized P&L = Profit from trades you've closed
  Unrealized P&L = Profit/loss on positions you still hold (paper profit)

  Total P&L = Realized + Unrealized
```

##### F. Key design decisions for realism

| Decision | Simple (fast to build) | Realistic (accurate results) |
|----------|----------------------|------------------------------|
| Fill price | Use close price | Simulate slippage + impact |
| Fill timing | Instant | Next bar's open price |
| Partial fills | All or nothing | Allow partial fills based on volume |
| Order book | No order book, just price data | Full order book simulation |
| Costs | Zero | Commission + slippage + impact |

**Recommendation:** Start simple, add realism incrementally. A paper engine that's 80% realistic is infinitely more useful than a perfect one that's never built.

---

## Optional Topics

---

### 12. What is Algorithmic Trading

#### Definition

**Algorithmic trading (algo trading)** means using a computer program to automatically make trading decisions and place orders, instead of a human clicking buttons.

The "algorithm" is just a set of rules written in code. The computer follows these rules much faster and more consistently than any human could.

#### Example

```
Human trader:
  Stares at screen → Sees TCS drop 2% → Thinks "should I buy?" →
  Checks news → Hesitates → Finally clicks buy → 3 minutes later

Algo trader (computer):
  Detects TCS drop 2% → Checks 15 conditions in 0.001 seconds →
  All conditions met → Places buy order → 0.01 seconds total
```

#### A simple algorithm example

```python
# "Buy when the 10-day average price crosses above the 50-day average"
# This is called a "Moving Average Crossover" strategy

every_minute:
    short_avg = average(last 10 days of closing prices)
    long_avg = average(last 50 days of closing prices)

    if short_avg > long_avg and not holding_stock:
        BUY 100 shares  # Short-term trend is going UP

    if short_avg < long_avg and holding_stock:
        SELL 100 shares  # Short-term trend is going DOWN
```

#### Why use algo trading?
- **Speed:** Computers react in milliseconds
- **No emotions:** Won't panic-sell or greed-buy
- **Consistency:** Follows rules exactly, every time
- **Scale:** Can monitor 1,000 stocks simultaneously
- **Backtesting:** Can test strategy on 20 years of historical data before risking real money

#### Who uses it?
- Hedge funds, investment banks, proprietary trading firms
- Individual traders with programming skills
- About 50-70% of all US stock trading volume is algorithmic

---

### 13. What is High Frequency Trading

#### Definition

**High Frequency Trading (HFT)** is a specialized form of algorithmic trading that:
- Operates at EXTREMELY high speeds (microseconds — millionths of a second)
- Holds positions for very short durations (milliseconds to seconds, rarely minutes)
- Makes tiny profits per trade but does MILLIONS of trades per day
- Requires special hardware, co-location (servers physically next to the exchange), and direct market access

#### Example

```
Normal algo trading:
  Speed: Milliseconds to seconds
  Holds positions: Minutes to days
  Profit per trade: Rs 100-10,000
  Trades per day: 10-1,000

High Frequency Trading:
  Speed: Microseconds (0.000001 seconds)
  Holds positions: Milliseconds to seconds
  Profit per trade: Rs 0.01 - Rs 1 per share
  Trades per day: 100,000 - 10,000,000
```

#### How HFT makes money

**Market Making:** The HFT firm places both buy AND sell orders, earning the spread.

```
HFT places: BUY at Rs 3,798 and SELL at Rs 3,802
Someone sells to them at Rs 3,798
Someone buys from them at Rs 3,802
Profit: Rs 4 per share

Repeat this 1,000,000 times per day = Rs 40,00,000 per day
(minus costs, still very profitable)
```

#### Why it's controversial
- **For:** Provides liquidity, tightens spreads (good for everyone)
- **Against:** Creates unfair speed advantage, can cause "flash crashes" (sudden market drops)
- **Example flash crash:** On May 6, 2010, the US market dropped 1,000 points in minutes because of HFT algorithms going haywire, then recovered just as quickly

---

### 14. What is Arbitrage

#### Definition

**Arbitrage** means buying something at a lower price in one place and simultaneously selling it at a higher price in another place, making a risk-free profit from the price difference.

The key word is **risk-free** — true arbitrage has no risk because you buy and sell at the same time.

#### Example 1: Simple arbitrage

```
TCS is trading at:
  NSE (National Stock Exchange): Rs 3,800
  BSE (Bombay Stock Exchange):   Rs 3,805

Arbitrage:
  1. Buy 100 shares on NSE at Rs 3,800
  2. Simultaneously sell 100 shares on BSE at Rs 3,805
  3. Profit: Rs 5 × 100 = Rs 500 (risk-free!)

This is called "exchange arbitrage" or "cross-market arbitrage"
```

#### Example 2: Currency arbitrage

```
In Delhi:  1 USD = Rs 84.00
In Mumbai: 1 USD = Rs 84.10

Buy USD in Delhi, sell in Mumbai.
Profit: Rs 0.10 per dollar, risk-free.
```

#### Why arbitrage opportunities are rare

In practice, thousands of traders (especially computers/HFT) are looking for these gaps. The moment a gap appears, they jump on it, and their buying/selling closes the gap almost instantly. This is why arbitrage opportunities:
- Last for milliseconds
- Require very fast systems to capture
- Are typically very small (fractions of a percent)

This process of closing gaps is called "arbitrage elimination" and it's actually what keeps prices fair and consistent across markets.

---

### 15. What is Statistical Arbitrage

#### Definition

**Statistical arbitrage (stat arb)** is a trading strategy that uses math and statistics to find stocks that are "out of line" with their normal relationship, and bets that they'll return to normal.

Unlike pure arbitrage (risk-free), statistical arbitrage has RISK — the relationship might not return to normal. That's why it's called "statistical" — it works on average, over many trades, but any individual trade can lose money.

#### The key concept: Mean Reversion

**Mean reversion** = Things that deviate from their average tend to come back to the average.

#### Example: Pairs Trading (simplest form of stat arb)

```
HDFC Bank and ICICI Bank normally move together (both are big Indian banks).

Normal relationship: HDFC is usually Rs 200 more than ICICI

Today:
  HDFC Bank: Rs 1,600
  ICICI Bank: Rs 1,350
  Difference: Rs 250 (normally Rs 200 — the gap is WIDER than usual)

Statistical Arbitrage trade:
  SELL HDFC (it's "too expensive" relative to ICICI)
  BUY ICICI (it's "too cheap" relative to HDFC)

Wait...

Later:
  HDFC Bank: Rs 1,580 (dropped Rs 20)
  ICICI Bank: Rs 1,370 (rose Rs 20)
  Difference: Rs 210 (closer to the normal Rs 200)

Profit:
  HDFC short: +Rs 20 per share (sold high, price dropped)
  ICICI long: +Rs 20 per share (bought low, price rose)
  Total: Rs 40 per share

Risk: What if the gap KEEPS widening instead of closing?
  HDFC goes to 1,650, ICICI drops to 1,330.
  Now you're losing on BOTH sides. This is the risk.
```

#### Why "statistical"?

The strategy looks at hundreds of stock pairs, calculates the historical average relationship, and finds pairs where the current gap is statistically unusual (e.g., 2 standard deviations from the mean). It bets on many pairs simultaneously, so even if some trades lose, the overall portfolio profits on average.

---

### 16. Styles of Investing

There are many different philosophies for how to pick stocks/investments. Here are the major ones:

---

#### A. Value Investing

**Definition:** Buy stocks that are currently "cheap" compared to their true worth, and wait for the market to realize their real value.

**Analogy:** Finding a brand new iPhone at a garage sale for Rs 5,000. You know it's worth Rs 80,000 — you buy it and wait.

**How it works:**
```
Company ABC:
  Current stock price: Rs 500
  Company's actual assets, earnings, etc. suggest it's worth: Rs 800
  "Intrinsic value" (true worth): Rs 800
  Margin of Safety: Rs 300 (800 - 500)

Value investor: "This stock is 37% undervalued. I'll buy and hold until
the market realizes it's worth Rs 800."
```

**Famous practitioners:** Warren Buffett, Benjamin Graham
**Time horizon:** Years (very patient)
**Key metric:** Price-to-Earnings ratio (P/E), Price-to-Book ratio (P/B)

---

#### B. Fundamental Analysis / Fundamental Investing

**Definition:** Analyzing a company's financial health, business model, industry position, and growth potential to decide if it's a good investment.

**Analogy:** Before buying a restaurant, you'd check: How much revenue does it make? What are its costs? How many customers come daily? Is the neighborhood growing? That's fundamental analysis.

**What fundamentalists look at:**
```
Financial statements:
  - Income Statement: How much money does the company make?
  - Balance Sheet: What does the company own vs owe?
  - Cash Flow: How much actual cash is flowing in and out?

Business quality:
  - Is it a monopoly? (good)
  - Is management competent? (very important)
  - Is the industry growing? (check)
  - Does it have a "moat"? (competitive advantage others can't easily copy)
```

**Difference from value investing:** Value investing IS a type of fundamental investing, but specifically focused on finding cheap stocks. Fundamental investing is broader — you might pay a "fair" or even "expensive" price for an excellent company.

---

#### C. Momentum Investing

**Definition:** Buy stocks that are already going UP, and sell stocks that are going DOWN. Ride the trend.

**Analogy:** "The rich get richer." A stock that's been going up for 6 months is likely to keep going up for a while. Jump on the train.

**How it works:**
```
Look at all stocks over the last 6-12 months:

Winners (top 20% performers):
  Stock A: +45%
  Stock B: +38%
  Stock C: +35%
  → BUY these

Losers (bottom 20% performers):
  Stock X: -30%
  Stock Y: -25%
  Stock Z: -22%
  → SELL / avoid these

Rebalance every month: sell old winners that are slowing, buy new winners.
```

**Why it works (sometimes):** Trends persist because of investor psychology:
- Good news spreads slowly (underreaction)
- Success attracts more buyers (bandwagon effect)
- Analysts slowly revise estimates upward

**Risk:** Momentum can reverse suddenly (called "momentum crash"). When the trend breaks, everyone runs for the exit at once.

---

#### D. Macro Investing

**Definition:** Making investment decisions based on big-picture economic trends — interest rates, inflation, GDP growth, government policies, global events — rather than individual companies.

**Analogy:** Instead of analyzing which restaurant to buy, you analyze "Is this neighborhood going to boom or bust in the next 5 years?"

**Example:**
```
Macro observation: "India's central bank is going to cut interest rates"

Impact chain:
  Lower interest rates →
  Cheaper loans for companies →
  Companies invest more, grow faster →
  Banks make more loans (more revenue) →
  Real estate becomes cheaper to buy

Macro trade:
  BUY: Banking stocks, real estate stocks, infrastructure stocks
  SELL: Fixed deposits, bonds (they pay less when rates drop)
```

**Famous practitioners:** George Soros (who "broke the Bank of England" in 1992 by betting against the British pound), Ray Dalio

**What macro investors track:**
- Interest rates (RBI in India, Federal Reserve in US)
- Inflation (rising prices)
- GDP growth
- Currency movements
- Government fiscal policy (spending, taxes)
- Geopolitical events (wars, trade deals, elections)

---

#### E. Growth Investing

**Definition:** Buy stocks of companies that are growing revenue and earnings much faster than average, even if they look "expensive" by traditional measures.

**Analogy:** Buying stock in a small chai brand that's growing 100% per year. It's expensive relative to current profits, but if it becomes the next Tata Tea, you'll make 100x your money.

**Example:**
```
Company DEF (a tech startup):
  Revenue 2023: Rs 100 crore
  Revenue 2024: Rs 250 crore (+150% growth!)
  Revenue 2025: Rs 500 crore (+100% growth!)
  P/E ratio: 200x (looks insanely expensive)

Growth investor: "I don't care that the P/E is 200. If revenue doubles
every year, in 5 years this will be a Rs 10,000 crore company.
At that point, today's price will look like a bargain."
```

---

#### F. Quantitative / Systematic Investing

**Definition:** Using mathematical models, statistics, and computer algorithms to make investment decisions. No human judgment — pure data and rules.

**This is what Alpha Arena is about!**

**How it works:**
```
1. Collect data: prices, volumes, financial ratios, news sentiment, etc.
2. Build a model: Find statistical patterns that predict future returns
3. Test the model: Run it on historical data (backtesting)
4. If it works: Deploy it to trade automatically
5. Monitor: Watch for the model's "alpha" decaying over time
```

**Key terms:**
- **Alpha:** Returns above the market (the "edge" your strategy has)
- **Beta:** Returns that just come from the market going up/down (no edge)
- **Sharpe Ratio:** Measures risk-adjusted returns. Higher = better.

---

#### Summary Table

| Style | What Matters | Time Horizon | Risk | Skill Needed |
|---|---|---|---|---|
| Value | Cheapness | Years | Medium | Financial analysis |
| Fundamental | Business quality | Years | Medium | Industry knowledge |
| Momentum | Price trends | Weeks-Months | High | Statistics |
| Macro | Economic trends | Months-Years | Very High | Economics |
| Growth | Revenue growth | Years | High | Vision |
| Quantitative | Data patterns | Any | Varies | Programming + Math |

---

### 17. What is Superforecasting

#### Definition

**Superforecasting** is the practice (and skill) of making unusually accurate predictions about future events. The term comes from research by Philip Tetlock, a professor who ran a massive study called the "Good Judgment Project."

#### The backstory

```
In 2011, the US intelligence community ran a tournament:
  "Can anyone predict world events better than our intelligence analysts?"

They recruited 20,000+ volunteers to make predictions like:
  - "Will North Korea test a nuclear weapon before December?"
  - "Will the Euro drop below $1.20 in the next 6 months?"
  - "Will the Syrian regime fall in 2014?"

Result: A small group of regular people (not intelligence experts!)
consistently beat professional analysts WITH access to classified data.

These people were called "superforecasters."
```

#### What makes a superforecaster?

It's NOT about being an expert in one field. It's about HOW you think:

```
1. Think in probabilities, not certainties
   Bad:  "TCS will definitely go up"
   Good: "There's a 65% chance TCS goes up in the next quarter"

2. Update beliefs with new evidence
   Started at 65% → New earnings report is great → Update to 75%
   Started at 65% → CEO resigns suddenly → Update to 40%

3. Break big questions into smaller, answerable sub-questions
   "Will India's stock market crash?"
   → "What are interest rate trends?"
   → "How are corporate earnings looking?"
   → "What's the global risk sentiment?"
   → "Are valuations historically extreme?"
   → Combine sub-answers into an overall probability

4. Be humble and self-critical
   Track your predictions. When you're wrong, figure out WHY.
   Most people remember hits and forget misses. Superforecasters do the opposite.

5. Seek out opposing views
   If you think market will go up, actively look for reasons it might go down.
   Try to prove yourself wrong before betting.
```

#### How this relates to trading and investing

```
Every trade is a forecast:
  "I think TCS will go up" = you're predicting the future
  "I'm buying HDFC because earnings will beat expectations" = forecast

Better forecasting = better trading decisions

Superforecasting principles applied to trading:
  1. Size your positions based on your confidence (probability)
     70% confident → put in 5% of portfolio
     95% confident → put in 15% of portfolio

  2. Have a pre-mortem: "If this trade loses money, what went wrong?"
     Think about this BEFORE entering the trade.

  3. Keep a trading journal with predictions and outcomes.
     Review monthly. Find patterns in your mistakes.
```

#### Key takeaway

Superforecasting isn't a gift — it's a learnable skill. The core of it is intellectual humility, probabilistic thinking, and relentless updating of beliefs based on evidence. It applies to trading, investing, business, and life.

---

## Quick Reference: How Everything Connects

```
You want to trade
    ↓
You send an ORDER to the exchange (via your broker)
    ↓
The exchange's MATCHING ENGINE receives your order
    ↓
It checks the Central Limit ORDER BOOK (CLOB)
    ↓
Using PRICE-TIME PRIORITY, it either:
    ├── Finds a match → Creates a TRADE → Updates your portfolio
    └── No match → Adds your order to the book → Waits
    ↓
Your portfolio is tracked using OHLC data for valuation
    ↓
If you're using LEVERAGE, the broker monitors your MARGIN
    ↓
If your strategy is an ALGORITHM, it decides when to trade automatically
    ↓
The algorithm might use VALUE, MOMENTUM, or STAT ARB logic
    ↓
Performance is measured by SHARPE RATIO and compared across strategies
```

---

*This guide covers the foundational knowledge needed to understand how financial markets work at a technical level. Each topic builds on the previous ones — if something doesn't make sense, re-read the earlier sections first.*
