# Part 3: Exchange Infrastructure — Deep Dive

> **Parent Topic:** Market Microstructure
> **What this covers:** How an exchange matching engine works internally, and how to build a realistic paper trading engine from scratch.
> **Subtopics:** Exchange Matching Engine → Building a Paper Trading Matching Engine
> **Prerequisites:** You should have read Part 1 (Order Book Mechanics) and Part 2 (Order Management) first.

---

## Before We Start: Quick Recap

```
You now know:
  - The order book has BIDS (buyers) and ASKS (sellers)
  - Orders match using PRICE-TIME PRIORITY
  - Order types: Market, Limit, Stop-Loss, Stop-Limit
  - Order actions: New, Modify, Cancel
  - Orders ≠ Trades (intention vs execution)
```

This part answers: **What is the SOFTWARE that makes all of this work? And how do you build your own version of it?**

---

## 1. Exchange Matching Engine

### 1.1 What Is It?

#### Definition

> **Matching Engine:** The central computational system of a securities exchange responsible for receiving, validating, and matching incoming buy and sell orders according to a defined priority algorithm (typically price-time priority). The matching engine maintains the order book, executes trades by pairing compatible orders, disseminates trade and market data, and operates with deterministic, low-latency processing (typically in microseconds). It is the most performance-critical and fault-sensitive component in the exchange technology stack.

**In simple words:** The Matching Engine is the core software at the heart of every stock exchange. It is the program that:

1. **Receives** incoming orders from all traders
2. **Checks** the order book for possible matches
3. **Executes** trades when a buyer's price meets a seller's price
4. **Updates** the order book after every match
5. **Broadcasts** trade information to everyone

It is the "brain" of the exchange. Without it, there is no exchange — just a bunch of people shouting into the void.

#### Analogy: The Matchmaker at a Wedding Bureau

```
Imagine a wedding bureau (shaadi.com but physical):

  Families register: "Our son wants a bride. Requirements: ..."
  Other families register: "Our daughter is looking. Requirements: ..."

  The MATCHMAKER sits in the middle:
    - Collects all profiles (like collecting all orders)
    - Checks for compatible matches (like checking price compatibility)
    - When a match is found → introduces the families (like executing a trade)
    - Updates records (remove matched profiles from the list)

  The exchange matching engine IS this matchmaker,
  except it handles millions of "profiles" per second
  and matches them based on PRICE and TIME, not personality.
```

---

### 1.2 Where the Matching Engine Sits in the System

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE FULL EXCHANGE SYSTEM                       │
│                                                                   │
│  TRADERS                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                           │
│  │Retail│ │ Fund │ │ HFT  │ │ Algo │  ... thousands more        │
│  │Trader│ │House │ │ Firm │ │ Bot  │                            │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘                           │
│     │        │        │        │                                 │
│     ▼        ▼        ▼        ▼                                 │
│  ┌──────────────────────────────────┐                            │
│  │        GATEWAY / ROUTER          │  Receives all orders       │
│  │  (validates format, throttles)   │  Basic checks              │
│  └──────────────┬───────────────────┘                            │
│                 │                                                 │
│                 ▼                                                 │
│  ┌──────────────────────────────────┐                            │
│  │     ★ MATCHING ENGINE ★          │  THE CORE                  │
│  │                                   │                            │
│  │  ┌────────────┐ ┌────────────┐   │                            │
│  │  │ Order Book │ │ Order Book │   │  One order book per stock  │
│  │  │   (TCS)    │ │  (INFY)   │   │  NSE has ~2,000 stocks     │
│  │  └────────────┘ └────────────┘   │                            │
│  │  ┌────────────┐ ┌────────────┐   │                            │
│  │  │ Order Book │ │ Order Book │   │                            │
│  │  │(RELIANCE)  │ │ (HDFC)    │   │                            │
│  │  └────────────┘ └────────────┘   │                            │
│  │         ... 2000+ more ...       │                            │
│  └──────────────┬───────────────────┘                            │
│                 │                                                 │
│        ┌────────┼────────┐                                       │
│        ▼        ▼        ▼                                       │
│  ┌──────┐ ┌──────────┐ ┌──────────┐                             │
│  │Trade │ │ Market   │ │ Risk     │                              │
│  │Logger│ │ Data     │ │ Manager  │                              │
│  │      │ │ Publisher│ │          │                              │
│  └──────┘ └──────────┘ └──────────┘                             │
│     │         │             │                                    │
│     ▼         ▼             ▼                                    │
│  Save to   Broadcast     Check for                               │
│  database  prices to     circuit breakers,                       │
│            everyone      margin violations                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1.3 The Matching Algorithm — Step by Step

This is the EXACT logic that runs inside the matching engine every time a new order arrives:

```
╔═══════════════════════════════════════════════════════════════╗
║            MATCHING ENGINE — CORE ALGORITHM                   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  INPUT: A new order arrives                                   ║
║                                                               ║
║  Step 1: DETERMINE SIDE                                       ║
║    Is it a BUY order? → Look at ASK side for sellers          ║
║    Is it a SELL order? → Look at BID side for buyers          ║
║                                                               ║
║  Step 2: CHECK FOR MATCH                                      ║
║    BUY order: Is best_ask_price ≤ buy_limit_price?            ║
║    SELL order: Is best_bid_price ≥ sell_limit_price?          ║
║    MARKET order: Always matches (takes whatever's available)  ║
║                                                               ║
║    If NO match → Go to Step 5                                 ║
║    If YES → Go to Step 3                                      ║
║                                                               ║
║  Step 3: EXECUTE MATCH                                        ║
║    Determine trade price:                                     ║
║      → Price of the RESTING order (the one already in book)  ║
║      → NOT the incoming order's price                         ║
║    Determine trade quantity:                                  ║
║      → MIN(incoming_qty_remaining, resting_order_qty)         ║
║    Create a TRADE record                                      ║
║    Update quantities of both orders                           ║
║    If resting order fully filled → remove from book           ║
║                                                               ║
║  Step 4: CHECK IF INCOMING ORDER IS FULLY FILLED              ║
║    If YES → Done! All matched.                                ║
║    If NO → Go back to Step 2 (check next best price level)   ║
║                                                               ║
║  Step 5: ADD REMAINING TO BOOK (if limit order)               ║
║    If incoming is a limit order with unfilled quantity:        ║
║      → Insert into the correct side of the order book         ║
║      → At the correct price level                             ║
║      → At the END of the time queue (newest)                  ║
║    If incoming is a market order with unfilled quantity:       ║
║      → This shouldn't happen (means book is empty on          ║
║        that side — very unusual)                              ║
║      → Cancel remaining or wait (depends on exchange rules)   ║
║                                                               ║
║  Step 6: PUBLISH                                              ║
║    Send trade confirmations to buyer and seller               ║
║    Update market data feed (last price, volume, etc.)         ║
║    Update the displayed order book (new quantities)           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### 1.4 The Algorithm in Action — Complete Walkthrough

Let's trace through the algorithm with real numbers:

```
═══════════════════════════════════════════════════════
  MATCHING ENGINE WALKTHROUGH
═══════════════════════════════════════════════════════

STARTING ORDER BOOK FOR TCS:

  BID SIDE:                          ASK SIDE:
  Price    | Orders (time-sorted)    Price    | Orders (time-sorted)
  ---------+------------------------  ---------+------------------------
  3,802    | B1: 300 @ 10:00:01     3,808    | S1: 200 @ 10:00:00
  3,800    | B2: 500 @ 10:00:00     3,810    | S2: 400 @ 10:00:02
           | B3: 200 @ 10:00:03     3,812    | S3: 600 @ 10:00:01
  3,798    | B4: 1000 @ 10:00:02              | S4: 100 @ 10:00:04
                                    3,815    | S5: 500 @ 10:00:03

  Best Bid: 3,802 | Best Ask: 3,808 | Spread: Rs 6

═══════════════════════════════════════════════════════
  INCOMING ORDER: Amit sends "BUY 800 shares at LIMIT Rs 3,812"
═══════════════════════════════════════════════════════

Step 1: DETERMINE SIDE
  → It's a BUY. Look at ASK side.

Step 2: CHECK FOR MATCH
  Best ask = Rs 3,808 (S1: 200 shares)
  Is 3,808 ≤ 3,812 (Amit's limit)? YES → Match!

Step 3: EXECUTE MATCH #1
  Trade price: Rs 3,808 (resting order S1's price)
  Trade qty: MIN(800, 200) = 200 shares
  → TRADE: Amit buys 200 from S1 at Rs 3,808
  → S1 is fully filled → REMOVE from book
  → Amit still needs: 800 - 200 = 600 shares

Step 4: Amit fully filled? NO (600 remaining). Back to Step 2.

Step 2 (again): CHECK FOR MATCH
  Best ask is now Rs 3,810 (S2: 400 shares) — S1 was removed
  Is 3,810 ≤ 3,812? YES → Match!

Step 3: EXECUTE MATCH #2
  Trade price: Rs 3,810 (S2's price)
  Trade qty: MIN(600, 400) = 400 shares
  → TRADE: Amit buys 400 from S2 at Rs 3,810
  → S2 is fully filled → REMOVE from book
  → Amit still needs: 600 - 400 = 200 shares

Step 4: Amit fully filled? NO (200 remaining). Back to Step 2.

Step 2 (again): CHECK FOR MATCH
  Best ask is now Rs 3,812 (S3: 600 shares, S4: 100 shares)
  Is 3,812 ≤ 3,812? YES → Match!
  (exact equal counts as a match)

Step 3: EXECUTE MATCH #3
  At Rs 3,812, there are two orders. TIME PRIORITY:
    S3: 600 shares @ 10:00:01 (earlier)
    S4: 100 shares @ 10:00:04 (later)
  → Match with S3 first.
  
  Trade price: Rs 3,812
  Trade qty: MIN(200, 600) = 200 shares
  → TRADE: Amit buys 200 from S3 at Rs 3,812
  → S3 is PARTIALLY filled: 600 - 200 = 400 remaining
  → Amit still needs: 200 - 200 = 0 → FULLY FILLED!

Step 4: Amit fully filled? YES → Done!

Step 5: Nothing to add to book (Amit's order is complete)

Step 6: PUBLISH
  Three trades generated:
    Trade 1: 200 shares @ Rs 3,808
    Trade 2: 400 shares @ Rs 3,810
    Trade 3: 200 shares @ Rs 3,812
  
  Amit's average price: 
    (200×3808 + 400×3810 + 200×3812) / 800 = Rs 3,810.00

═══════════════════════════════════════════════════════
  UPDATED ORDER BOOK:
  
  BID SIDE:                          ASK SIDE:
  Price    | Orders                  Price    | Orders
  ---------+------------------------  ---------+------------------------
  3,802    | B1: 300                 3,812    | S3: 400 (was 600)
  3,800    | B2: 500, B3: 200                 | S4: 100
  3,798    | B4: 1000               3,815    | S5: 500

  Best Bid: 3,802 | Best Ask: 3,812 | Spread: Rs 10
  (Spread WIDENED from 6 to 10 because Amit consumed the 3,808 and 3,810 levels)
  
  Last Trade Price: Rs 3,812
═══════════════════════════════════════════════════════
```

---

### 1.5 How the Matching Engine Handles Different Order Types

#### Market Orders

```
MARKET BUY arrives:
  → Engine sets effective limit to INFINITY
  → Will match against ANY ask price
  → Walks the book from cheapest ask upward until fully filled
  → If book is completely empty on ask side → order fails / is cancelled

MARKET SELL arrives:
  → Engine sets effective limit to ZERO
  → Will match against ANY bid price
  → Walks the book from highest bid downward until fully filled
```

#### Limit Orders

```
LIMIT BUY at Rs X arrives:
  → Check: Is best_ask ≤ X?
    YES → Match (possibly multiple levels, up to price X)
    NO → Add to bid side at price X, wait

LIMIT SELL at Rs X arrives:
  → Check: Is best_bid ≥ X?
    YES → Match (possibly multiple levels, down to price X)
    NO → Add to ask side at price X, wait
```

#### Stop-Loss Orders

```
Stop-Loss is NOT handled by the matching engine directly!

Here's the surprising truth:
  Stop-loss orders live in a SEPARATE system — the "trigger engine"
  or "stop order book" managed by the broker or exchange.

Flow:
  1. You place stop-loss: "SELL TCS if price drops to Rs 3,600"
  2. This goes to the TRIGGER ENGINE, NOT the matching engine
  3. The trigger engine watches the market data feed
  4. When last traded price ≤ Rs 3,600:
     → Trigger engine converts stop-loss into a MARKET SELL order
     → Sends this market sell to the MATCHING ENGINE
     → Matching engine processes it like any other market order
  5. Trade happens at whatever the best bid is at that moment

  ┌──────────────┐    trigger    ┌──────────────┐    match    ┌───────┐
  │ Trigger      │ ──────────→  │ Matching     │ ─────────→ │ Trade │
  │ Engine       │  (converts   │ Engine       │             │       │
  │ (watches     │   to market  │ (order book) │             │       │
  │  prices)     │   order)     │              │             │       │
  └──────────────┘              └──────────────┘             └───────┘
```

#### IOC (Immediate or Cancel)

```
IOC order arrives:
  → Normal matching process (Step 1-4)
  → After matching, if any quantity remains unfilled:
    → DO NOT add to book
    → CANCEL the remaining quantity immediately
  → Result: you get whatever was available NOW, rest is gone
```

#### FOK (Fill or Kill)

```
FOK order arrives:
  → BEFORE matching, check: Is the total available quantity
    at acceptable prices ≥ my order quantity?
    YES → Execute all at once
    NO → Cancel the ENTIRE order (nothing fills, zero trades)
  → All-or-nothing check happens BEFORE any trades
```

---

### 1.6 The Trade Price Rule: Who Gets the Better Deal?

When a match happens, at what price does the trade execute? This confuses many people.

```
THE RULE: The trade executes at the RESTING order's price,
          NOT the incoming order's price.

"Resting" = the order that was already in the book, waiting.
"Incoming" = the order that just arrived and caused the match.

WHY?
  The resting order was there first. It declared its price publicly.
  It earned the right to trade at its stated price.
  The incoming order is the "aggressor" — it chose to match.

EXAMPLE 1:
  Resting: SELL 100 at Rs 3,805 (been in book for 10 minutes)
  Incoming: BUY 100 at Rs 3,810 (just arrived)
  
  Trade price: Rs 3,805 (resting sell price)
  NOT Rs 3,810 or Rs 3,807.50 (average)
  
  The buyer gets "price improvement" — willing to pay 3,810 but got 3,805.
  The seller gets exactly what they asked for — 3,805.

EXAMPLE 2:
  Resting: BUY 100 at Rs 3,800 (been in book for 5 minutes)
  Incoming: SELL 100 at Rs 3,795 (just arrived)
  
  Trade price: Rs 3,800 (resting buy price)
  
  The seller gets "price improvement" — willing to accept 3,795 but got 3,800.
  The buyer pays exactly what they offered — 3,800.

KEY INSIGHT:
  If you place a limit order and wait → you get YOUR price
  If you send an aggressive order into the book → you get THEIR price
  Passive/patient traders are rewarded with price certainty.
  Aggressive/impatient traders pay for immediacy.
```

---

### 1.7 Performance: How Fast Is a Real Matching Engine?

```
┌───────────────┬────────────────────┬─────────────────────────┐
│ Exchange      │ Matching Latency   │ Orders Per Second        │
├───────────────┼────────────────────┼─────────────────────────┤
│ NSE (India)   │ ~10 microseconds   │ ~100,000+ per second    │
│ BSE (India)   │ ~6 microseconds    │ ~500,000+ per second    │
│ NYSE (USA)    │ ~30 microseconds   │ ~millions per second    │
│ NASDAQ (USA)  │ ~20 microseconds   │ ~millions per second    │
│ LSE (London)  │ ~25 microseconds   │ ~millions per second    │
│ CME (Chicago) │ ~1-5 microseconds  │ ~millions per second    │
└───────────────┴────────────────────┴─────────────────────────┘

For reference:
  1 microsecond = 0.000001 seconds = 0.001 milliseconds
  A blink of your eye takes ~300,000 microseconds (300 milliseconds)
  In the time you blink, NSE can match 30,000 orders.
```

#### How Do They Achieve This Speed?

```
1. PROGRAMMING LANGUAGE: C or C++ (not Python, not Java)
   → Direct memory control, no garbage collector pauses
   → Some use FPGA (custom hardware chips)

2. DATA STRUCTURES: Lock-free concurrent data structures
   → No thread waiting for another thread
   → Compare-and-swap (CAS) operations

3. MEMORY: Everything in RAM (no disk I/O during matching)
   → Order book lives entirely in memory
   → Trades written to disk asynchronously AFTER matching

4. NETWORK: Kernel bypass networking
   → Skip the operating system's network stack entirely
   → Use specialized network cards (Solarflare, Mellanox)
   → Direct NIC-to-application communication

5. LOCATION: Co-location
   → Matching engine servers in a special data center
   → Trading firms put their servers in the SAME data center
   → 1 meter of cable = ~5 nanoseconds of latency
   → Even cable length differences matter!

6. OPERATING SYSTEM: Tuned Linux kernel
   → Specific CPU cores dedicated to matching (CPU pinning)
   → Interrupt handling disabled on matching cores
   → No swap, no unnecessary services running
   → Some use real-time Linux patches
```

---

### 1.8 What Happens When Things Go Wrong

Real matching engines must handle edge cases:

#### Circuit Breakers

```
WHAT: Automatic trading halt when price moves too much.

NSE circuit limits:
  If a stock moves more than 5%, 10%, 15%, or 20% from previous close
  → Trading is HALTED for that stock for a cooling period.

Index-level circuit breaker (applies to entire market):
  10% drop in Nifty → Trading halted for 45 minutes
  15% drop → Halted for 1 hour 45 minutes
  20% drop → Trading halted for rest of the day

PURPOSE: Prevent panic-driven crashes. Give traders time to think rationally.

MATCHING ENGINE'S ROLE:
  Before executing any match, check:
    "Would this trade price exceed the circuit limit?"
    YES → REJECT the order, don't match
    NO → Proceed normally
```

#### Self-Trade Prevention

```
WHAT: Prevent a firm from accidentally trading with itself.

Example:
  Goldman Sachs Algo A: BUY 1,000 TCS at Rs 3,805
  Goldman Sachs Algo B: SELL 500 TCS at Rs 3,805
  
  Without prevention: Goldman buys from itself (pointless, fake volume)
  With prevention: Engine detects same firm → cancels one or both orders

This is important because self-trading:
  - Creates fake volume (misleading other traders)
  - Could be used for market manipulation
  - Is illegal in most jurisdictions
```

#### Fat Finger Protection

```
WHAT: Catching obviously erroneous orders.

Example:
  TCS is trading at Rs 3,800.
  A trader mistakenly types Rs 38,000 (added an extra zero).
  
  Without protection: If someone has a sell at Rs 38,000 → trade at Rs 38,000!
  With protection: Engine checks — is Rs 38,000 within reasonable range of Rs 3,800?
    It's 10x the current price → REJECT as "fat finger" error.

NSE rule: Orders more than X% away from last traded price are rejected.
This band is typically 5-20% depending on the stock.
```

#### Order Book Imbalance

```
WHAT: When one side of the book is overwhelmingly larger.

Example:
  BID side: 5,00,000 shares total
  ASK side: 10,000 shares total
  Ratio: 50:1 (extreme buying pressure)

  If a large market buy arrives, it could:
    - Consume all 10,000 ask shares in milliseconds
    - Push price up dramatically (no sellers left!)
    - This is where "flash crashes" or "flash rallies" come from

  Some exchanges monitor imbalance and:
    - Trigger volatility auctions (pause and batch-match)
    - Widen spread requirements
    - Alert market surveillance
```

---

### 1.9 Matching Engine Components — Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 MATCHING ENGINE INTERNALS                  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                ORDER GATEWAY                         │ │
│  │  Receives orders, validates format, assigns ID       │ │
│  │  Enforces rate limits (max orders per second)        │ │
│  └────────────────────┬────────────────────────────────┘ │
│                       │                                   │
│                       ▼                                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              PRE-TRADE RISK CHECK                    │ │
│  │  - Is price within circuit limits?                   │ │
│  │  - Does trader have sufficient margin?               │ │
│  │  - Does order exceed position limits?                │ │
│  │  - Fat finger check                                  │ │
│  │  If FAIL → reject order, send error                  │ │
│  └────────────────────┬────────────────────────────────┘ │
│                       │                                   │
│                       ▼                                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              ORDER ROUTER                            │ │
│  │  Routes to the correct order book                    │ │
│  │  (each stock has its own book)                       │ │
│  │  TCS → Book #1, INFY → Book #2, etc.               │ │
│  └────────────────────┬────────────────────────────────┘ │
│                       │                                   │
│                       ▼                                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           ★ ORDER BOOK + MATCHER ★                   │ │
│  │                                                       │ │
│  │  ┌──────────┐        ┌──────────┐                    │ │
│  │  │ BID TREE │◄──────►│ ASK TREE │                    │ │
│  │  │ (sorted) │ match? │ (sorted) │                    │ │
│  │  └──────────┘        └──────────┘                    │ │
│  │                                                       │ │
│  │  For each match:                                     │ │
│  │    → Create Trade record                             │ │
│  │    → Update order quantities                         │ │
│  │    → Remove fully filled orders                      │ │
│  └──────┬─────────────────────┬────────────────────────┘ │
│         │                     │                           │
│         ▼                     ▼                           │
│  ┌──────────────┐     ┌──────────────┐                   │
│  │ TRADE        │     │ MARKET DATA  │                   │
│  │ PUBLISHER    │     │ PUBLISHER    │                   │
│  │              │     │              │                   │
│  │ Sends fill   │     │ Broadcasts:  │                   │
│  │ confirmations│     │ - Best bid   │                   │
│  │ to buyer and │     │ - Best ask   │                   │
│  │ seller       │     │ - Last price │                   │
│  │              │     │ - Volume     │                   │
│  └──────────────┘     └──────────────┘                   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              PERSISTENCE LAYER                       │ │
│  │  Write all trades and order events to disk           │ │
│  │  (asynchronous — does NOT slow down matching)        │ │
│  │  Used for: audit trail, crash recovery, reporting    │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 1.10 The Order Book Data Structure — In Detail

This is how the order book is actually implemented in code:

```
ORDER BOOK FOR ONE STOCK (e.g., TCS):

  ┌─────────────────────────────────────────────────────┐
  │                                                       │
  │  BIDS (Sorted Tree — Price DESCENDING)                │
  │                                                       │
  │  Price Level 3802 ─→ [Queue of orders, FIFO]         │
  │       │               ├── Order B1: qty=300, t=10:01  │
  │       │               └── Order B5: qty=100, t=10:04  │
  │       │                                               │
  │  Price Level 3800 ─→ [Queue of orders, FIFO]         │
  │       │               ├── Order B2: qty=500, t=10:00  │
  │       │               └── Order B3: qty=200, t=10:03  │
  │       │                                               │
  │  Price Level 3798 ─→ [Queue of orders, FIFO]         │
  │                       └── Order B4: qty=1000, t=10:02 │
  │                                                       │
  │  Operations:                                          │
  │    get_best_bid()     → O(1)  — just peek at top     │
  │    insert(order)      → O(log P) — P = # price levels│
  │    remove(order)      → O(log P) — by order ID       │
  │    match_against()    → O(1) per match from top       │
  │                                                       │
  ├─────────────────────────────────────────────────────┤
  │                                                       │
  │  ASKS (Sorted Tree — Price ASCENDING)                 │
  │                                                       │
  │  Price Level 3808 ─→ [Queue of orders, FIFO]         │
  │       │               └── Order S1: qty=200, t=10:00  │
  │       │                                               │
  │  Price Level 3810 ─→ [Queue of orders, FIFO]         │
  │       │               └── Order S2: qty=400, t=10:02  │
  │       │                                               │
  │  Price Level 3812 ─→ [Queue of orders, FIFO]         │
  │                       ├── Order S3: qty=600, t=10:01  │
  │                       └── Order S4: qty=100, t=10:04  │
  │                                                       │
  │  (Same operations as bids, mirrored)                  │
  │                                                       │
  ├─────────────────────────────────────────────────────┤
  │                                                       │
  │  METADATA:                                            │
  │    last_trade_price: 3808                             │
  │    last_trade_qty:   200                              │
  │    total_bid_volume: 2100                             │
  │    total_ask_volume: 1300                             │
  │    order_count:      7                                │
  │    trade_count_today: 15,234                          │
  │    total_volume_today: 1,23,456 shares                │
  │                                                       │
  └─────────────────────────────────────────────────────┘

WHY THIS STRUCTURE WORKS:

  Sorted Tree (Red-Black tree or similar):
    → Keeps prices sorted automatically
    → Finding best price = O(1) — just look at root/min/max
    → Inserting new price level = O(log P) — balanced tree
    → Typically P (number of active price levels) < 1000
    → So log(1000) ≈ 10 operations per insert — FAST

  FIFO Queue at each price level:
    → Orders at same price served in time order
    → Adding to back = O(1)
    → Removing from front = O(1)
    → Implements TIME PRIORITY perfectly

  HashMap for order lookup by ID:
    → When a CANCEL or MODIFY comes, need to find the order fast
    → HashMap: O(1) lookup by order_id
    → Maps: order_id → pointer to the order in the tree/queue
```

---

## 2. Building a Paper Trading Matching Engine

### 2.1 What Are We Building?

> **Paper Trading Engine (Simulated Exchange):** A software system that replicates the behavior of a real securities exchange — including order acceptance, matching, fill simulation, cost modeling, and portfolio accounting — using either historical or real-time market data but without executing actual transactions or committing real capital. Paper trading engines are used for strategy development, backtesting, risk-free experimentation, and education.

**In simple words:** A paper trading engine is a simulated (fake) exchange. It looks and behaves like a real exchange, but:
- Uses NO real money
- Trades are NOT real
- Perfect for testing strategies without risk

```
WHAT WE'RE BUILDING:

  Your Trading       Paper Trading          Results
  Strategy    ─→     Engine          ─→     & Analysis
  (code)             (fake exchange)        (P&L, Sharpe, etc.)

The engine must simulate:
  ✓ Order book mechanics (bids, asks, spread)
  ✓ Order matching (price-time priority)
  ✓ Multiple order types (market, limit)
  ✓ Realistic costs (commission, slippage, market impact)
  ✓ Portfolio tracking (positions, cash, P&L)
  ✓ Risk checks (position limits, drawdown)
```

---

### 2.2 Levels of Realism

You can build your engine at different levels of realism. More realistic = more accurate results, but harder to build and slower to run:

```
LEVEL 1: "Toy Engine" — Good for learning
  ────────────────────────────────────────
  - No order book simulation
  - All orders fill at the CLOSE price of the bar
  - No slippage, no market impact
  - Instant fills, no partial fills
  
  Realism: 30%
  Build time: 1 day
  Speed: Extremely fast
  Problem: Overly optimistic results (everything fills perfectly)

LEVEL 2: "Basic Engine" — Good for initial strategy testing
  ────────────────────────────────────────
  - No order book, but uses OHLC data
  - Orders fill at NEXT BAR'S OPEN price (not current close)
  - Fixed slippage (e.g., 2 basis points)
  - Commissions included
  - No partial fills
  
  Realism: 55%
  Build time: 3-5 days
  Speed: Very fast
  This is what most backtesting frameworks use.

LEVEL 3: "Realistic Engine" — Good for serious strategy validation
  ────────────────────────────────────────
  - No full order book, but volume-based fill simulation
  - Orders fill at next bar's open + square-root market impact
  - Random slippage component (±1-2 bps)
  - Partial fills based on volume available
  - Commission model matching real broker
  - Position limits and drawdown checks
  
  Realism: 75%
  Build time: 1-2 weeks
  This is what Alpha Arena uses.

LEVEL 4: "Exchange Simulator" — Research-grade
  ────────────────────────────────────────
  - Full order book simulation with synthetic orders
  - Limit orders queue with time priority
  - Realistic fill probability based on queue position
  - Dynamic spread simulation
  - Full market impact modeling
  - Latency simulation
  
  Realism: 90%
  Build time: 1-3 months
  Used by: Quant hedge funds, exchange vendors, academic research

LEVEL 5: "Full Replay" — Production-grade
  ────────────────────────────────────────
  - Replay actual historical order book data (tick-by-tick)
  - Your orders inserted into the real historical stream
  - True interaction with the actual order flow
  - Accounts for queue position in real data
  
  Realism: 95%+
  Build time: 3-6 months
  Requires: Very expensive historical tick data (~$10,000+/year)
  Used by: Top-tier HFT firms and market makers
```

---

### 2.3 Building a Level 3 Engine (What Alpha Arena Uses)

We'll design this step by step. This is the sweet spot of realism vs complexity.

#### Component Overview

```
┌────────────────────────────────────────────────────────────────┐
│              PAPER TRADING ENGINE (Level 3)                      │
│                                                                  │
│  ┌────────────┐                                                 │
│  │  Market    │  Feeds historical OHLCV data bar by bar         │
│  │  Data Feed │  (or live data in real-time mode)               │
│  └─────┬──────┘                                                 │
│        │ provides price data                                     │
│        ▼                                                         │
│  ┌────────────┐         ┌──────────────┐                        │
│  │  Strategy  │────────→│  Order       │  Strategy sends orders  │
│  │  (your     │  orders │  Validator   │  Validator checks them  │
│  │   code)    │         └──────┬───────┘                        │
│  └────────────┘                │ valid orders                    │
│        ▲                       ▼                                 │
│        │              ┌──────────────┐                           │
│        │ fills &      │  Matching    │  Simulates order matching │
│        │ portfolio    │  Simulator   │  against market data      │
│        │              └──────┬───────┘                           │
│        │                     │ raw fills                         │
│        │                     ▼                                   │
│        │              ┌──────────────┐                           │
│        │              │  Cost Model  │  Adds slippage, impact,  │
│        │              │              │  commissions              │
│        │              └──────┬───────┘                           │
│        │                     │ adjusted fills                    │
│        │                     ▼                                   │
│        │              ┌──────────────┐                           │
│        │              │  Risk        │  Checks position limits, │
│        │              │  Manager     │  drawdown, exposure       │
│        │              └──────┬───────┘                           │
│        │                     │ approved fills                    │
│        │                     ▼                                   │
│        │              ┌──────────────┐                           │
│        └──────────────│  Portfolio   │  Tracks positions, cash, │
│                       │  Tracker    │  P&L, history              │
│                       └──────────────┘                           │
└────────────────────────────────────────────────────────────────┘
```

---

### 2.4 Component 1: Market Data Feed

The data feed provides price information to the engine. In backtesting, it replays historical data one bar at a time.

```
WHAT IT PROVIDES (per stock, per time bar):

  ┌──────────────────────────────────────────────┐
  │ Field       │ Example        │ What it means  │
  ├──────────────┼────────────────┼────────────────┤
  │ timestamp   │ 2024-03-15     │ Date of bar    │
  │ open        │ Rs 3,800.00    │ First trade    │
  │ high        │ Rs 3,850.00    │ Highest price  │
  │ low         │ Rs 3,770.00    │ Lowest price   │
  │ close       │ Rs 3,820.00    │ Last trade     │
  │ volume      │ 12,34,567      │ Total shares   │
  │ vwap        │ Rs 3,810.50    │ Volume-weighted│
  │             │                │ average price  │
  └──────────────┴────────────────┴────────────────┘

KEY DESIGN DECISION: What data can the strategy see?

  ┌─────────────────────────────────────────────────────────┐
  │ THE LOOK-AHEAD BIAS PROBLEM                              │
  │                                                          │
  │ If your strategy can see TODAY's data and also           │
  │ trade at TODAY's open price, it's CHEATING.              │
  │                                                          │
  │ In reality:                                              │
  │   - You see data up to YESTERDAY                         │
  │   - You make a decision TONIGHT                          │
  │   - Your order fills at TOMORROW's OPEN                  │
  │                                                          │
  │ Timeline:                                                │
  │   Day 1 close → You see Day 1 data                       │
  │   Evening     → Your algo decides: "BUY TCS"            │
  │   Day 2 open  → Order fills at Day 2's open price       │
  │                                                          │
  │ If you use Day 2's close to fill Day 2's order,          │
  │ you're using FUTURE information → results are fake.      │
  │                                                          │
  │ RULE: ALWAYS fill at NEXT bar's open, using PREVIOUS    │
  │       bar's data for decisions.                          │
  └─────────────────────────────────────────────────────────┘
```

#### Implementation in Pseudocode

```
class MarketDataFeed:
    data = load_historical_data("TCS", "2019-01-01", "2023-12-31")
    # data is a table with columns: date, open, high, low, close, volume
    
    current_index = 0  # which row we're on
    
    def get_current_bar():
        # Returns YESTERDAY's completed bar
        # Strategy uses this to make decisions
        return data[current_index - 1]
    
    def get_fill_price():
        # Returns TODAY's open price
        # This is where orders actually fill
        return data[current_index].open
    
    def advance():
        # Move to next day
        current_index += 1
    
    def get_history(lookback=252):
        # Returns last N bars of data
        # Strategy can look at history for signals
        end = current_index - 1  # yesterday
        start = end - lookback
        return data[start:end+1]
```

---

### 2.5 Component 2: Order Validator

Before an order enters the matching simulator, it must pass validation checks.

```
VALIDATION CHECKS:

1. QUANTITY CHECK
   Is quantity > 0? Is it a whole number?
   Is it within exchange lot size? (NSE requires multiples of 1)
   Is it within maximum allowed quantity?
   
2. PRICE CHECK (for limit orders)
   Is price > 0?
   Is price within circuit limits? (e.g., within 20% of last close)
   Is price on a valid tick? (e.g., multiples of 0.05)

3. SYMBOL CHECK
   Does this stock exist in our universe?
   Is it currently tradable? (not suspended, not delisted)

4. MARGIN CHECK
   Does the trader have enough cash/margin for this order?
   For a BUY: required_cash = price × quantity × (1 + buffer)
   For a SELL: does the trader actually hold enough shares?

5. POSITION LIMIT CHECK
   Would this order cause the position to exceed limits?
   Example: Max position = 10% of portfolio. This order would make it 15%.
   → REJECT

6. RISK CHECK
   Would this order violate any risk rules?
   Is the portfolio already in drawdown lockout?
   Is gross exposure already at maximum?

If ANY check fails → REJECT the order, return error to strategy.
If ALL checks pass → Forward to matching simulator.
```

---

### 2.6 Component 3: Matching Simulator

This is the heart of the paper engine. It decides IF and WHEN your orders fill.

#### The Simple Approach (Level 2)

```
RULE: Any market order fills at the next bar's open price.
      Any limit buy fills if next bar's low ≤ limit price.
      Any limit sell fills if next bar's high ≥ limit price.

Example:
  Your order: BUY 100 TCS at LIMIT Rs 3,780
  Next bar: Open=3,805, High=3,850, Low=3,770, Close=3,820

  Did low (3,770) go below your limit (3,780)? YES
  → ORDER FILLS at Rs 3,780

Problem: In reality, the low was 3,770 for just a moment.
  There might have been a million shares trying to buy at 3,780.
  Your 100 shares might NOT have been filled even though price touched 3,780.
  This is called "fill assumption bias."
```

#### The Realistic Approach (Level 3)

```
For MARKET ORDERS:
  Fill price = next_bar.open + market_impact + random_slippage

For LIMIT ORDERS:
  Step 1: Did price reach my limit?
    BUY: Did next_bar.low ≤ my_limit_price? 
    SELL: Did next_bar.high ≥ my_limit_price?
    If NO → order does not fill
    
  Step 2: Fill probability
    Even if price touched my level, would I actually get filled?
    
    fill_probability = my_quantity / (volume_at_that_price × participation_rate)
    
    Example:
      My order: 1,000 shares at Rs 3,780
      Estimated volume near Rs 3,780: 50,000 shares
      Participation rate: 10% (I can capture at most 10% of volume)
      Max fillable: 50,000 × 0.10 = 5,000 shares
      My order (1,000) < Max fillable (5,000) → FULL FILL likely
      
    If my order was 8,000 shares:
      Max fillable: 5,000
      Fill: 5,000 shares (partial fill), 3,000 remaining

  Step 3: Fill price
    For limit orders that fill: fill at the limit price
    (in reality you'd get your price or better, but limit price
     is a conservative assumption)
```

---

### 2.7 Component 4: Cost Model

> **Transaction Cost Model:** A mathematical framework that estimates the total cost of executing a trade, encompassing explicit costs (brokerage commissions, exchange fees, taxes) and implicit costs (bid-ask spread, market impact, and slippage). Accurate cost modeling is essential for realistic backtesting, as transaction costs can erode 30-70% of a strategy's gross returns.

**In simple words:** This is what separates a toy engine from a realistic one. Every trade in reality has costs:

```
TOTAL COST = Commission + Slippage + Market Impact

Each component explained:
```

#### A. Commission (Fixed Costs)

```
WHAT: The fee your broker charges per trade.

EXAMPLES (India):
  Zerodha:
    Equity delivery: Rs 0 (free!)
    Equity intraday: Rs 20 per order or 0.03% (whichever is lower)
    F&O: Rs 20 per order
  
  For our simulation:
    Use a fixed cost like 2 basis points (bps) per trade.
    1 basis point = 0.01%
    2 bps on Rs 3,800 stock = Rs 3,800 × 0.0002 = Rs 0.76 per share

IMPLEMENTATION:
  commission_per_share = fill_price × 0.0002  # 2 bps
  total_commission = commission_per_share × quantity
```

#### B. Slippage (Random Noise)

```
WHAT: The small random difference between expected and actual fill price.
  Caused by: price moving between when you decide and when order fills,
  slight differences in displayed vs actual best price, etc.

HOW TO MODEL:
  Random noise of ±1 basis point.
  
  slippage = fill_price × random_uniform(-0.0001, +0.0001)
  
  For a BUY: slippage is usually POSITIVE (you pay slightly more)
  For a SELL: slippage is usually NEGATIVE (you get slightly less)
  
  Some engines use: slippage = ±1 bps × sign(side)
  Where sign = +1 for buy, -1 for sell (always against you)

EXAMPLE:
  Buying TCS at Rs 3,800:
  Random slippage: +0.5 bps = Rs 3,800 × 0.00005 = Rs 0.19
  Actual fill: Rs 3,800.19
  
  This is tiny per trade but ADDS UP over thousands of trades.
  1,000 trades × Rs 0.19 average slippage × 100 shares = Rs 19,000
```

#### C. Market Impact (The Big One)

```
WHAT: When you buy a lot of shares, YOUR buying pushes the price UP.
      When you sell a lot, YOUR selling pushes the price DOWN.
      This "impact" costs you money.

WHY IT HAPPENS:
  You want to buy 10,000 shares.
  Best ask: 3,805 with 2,000 shares.
  Next ask: 3,806 with 3,000 shares.
  Next: 3,807 with 5,000 shares.
  
  Your order eats through all three levels.
  Average fill is ~3,806.4 instead of 3,805.
  That extra Rs 1.4/share IS market impact.

THE SQUARE-ROOT MODEL (industry standard):

  impact = η × σ × sqrt(Q / V)

  Where:
    η (eta) = impact coefficient (calibrated, typically 0.1 to 0.5)
    σ (sigma) = stock's daily volatility (e.g., 2% = 0.02)
    Q = number of shares you're trading
    V = average daily volume of the stock

  WHY SQUARE ROOT?
    Impact grows with order size, but NOT linearly.
    Buying 4x more shares doesn't cost 4x more impact.
    It costs 2x more (sqrt(4) = 2).
    
    This matches what's observed in real markets:
    small orders = negligible impact
    medium orders = noticeable impact
    huge orders = very significant impact
    
  EXAMPLE:
    η = 0.3
    σ = 0.02 (2% daily volatility)
    Q = 5,000 shares
    V = 10,00,000 shares (daily volume)
    
    impact = 0.3 × 0.02 × sqrt(5,000 / 10,00,000)
           = 0.3 × 0.02 × sqrt(0.005)
           = 0.3 × 0.02 × 0.0707
           = 0.000424 = 4.24 bps
    
    On a Rs 3,800 stock:
    impact_per_share = 3,800 × 0.000424 = Rs 1.61
    total_impact = 5,000 × 1.61 = Rs 8,050
    
    If you traded 50,000 shares instead (10x more):
    impact = 0.3 × 0.02 × sqrt(50,000 / 10,00,000)
           = 0.3 × 0.02 × 0.2236
           = 0.001342 = 13.42 bps
    
    Impact only went from 4.24 bps to 13.42 bps (3.2x, not 10x)
    This is the square-root effect.
```

#### Putting It All Together

```
FULL COST CALCULATION FOR A SINGLE TRADE:

  Stock: TCS
  Side: BUY
  Quantity: 5,000 shares
  Base fill price: Rs 3,805.00 (next bar's open)

  1. Market Impact:
     impact = 4.24 bps = Rs 1.61 per share
     Adjusted price: Rs 3,805.00 + Rs 1.61 = Rs 3,806.61

  2. Slippage:
     Random: +0.8 bps = Rs 0.30 per share
     Adjusted price: Rs 3,806.61 + Rs 0.30 = Rs 3,806.91

  3. Commission:
     2 bps = Rs 0.76 per share
     (This doesn't change the fill price but is a cost)

  FINAL:
     Fill price: Rs 3,806.91
     Commission: Rs 0.76 × 5,000 = Rs 3,800
     Total cost vs ideal price (3,805):
       (3,806.91 - 3,805.00) × 5,000 + 3,800
       = Rs 9,550 + Rs 3,800
       = Rs 13,350 total trading cost

  On a Rs 1,90,25,000 trade (5,000 × 3,805), that's 0.07% in costs.
  Seems tiny, but if you trade daily for a year (252 days):
  252 × Rs 13,350 = Rs 33,64,200 in annual trading costs!
  
  THIS is why cost modeling matters.
```

---

### 2.8 Component 5: Risk Manager

> **Risk Manager:** A system component that enforces pre-defined risk limits on a trading portfolio in real time. It monitors metrics such as position concentration, gross leverage, portfolio drawdown, and order rate, and has the authority to reject orders or forcibly liquidate positions when limits are breached. The risk manager acts as the final safeguard between a strategy's decisions and actual order execution.

**In simple words:** The risk manager prevents your strategy from blowing up.

```
RISK CHECKS (run on every order AND continuously):

1. MAXIMUM POSITION SIZE
   ─────────────────────
   Rule: No single stock can be more than X% of portfolio value.
   Example: Max 10% in any one stock.
   
   Portfolio: Rs 10,00,000
   Max TCS position: Rs 1,00,000 (about 26 shares at Rs 3,800)
   
   If strategy tries to buy 50 shares of TCS:
     50 × 3,800 = Rs 1,90,000 (19% of portfolio)
     BLOCKED! Reduce to 26 shares maximum.

2. GROSS EXPOSURE LIMIT
   ─────────────────────
   Rule: Total absolute value of all positions ≤ X × portfolio value.
   Example: Max 2x gross exposure.
   
   Portfolio: Rs 10,00,000
   Long positions: Rs 12,00,000
   Short positions: Rs 5,00,000
   Gross exposure: Rs 12,00,000 + Rs 5,00,000 = Rs 17,00,000
   Ratio: 1.7x ← OK (under 2x)
   
   If strategy wants to add Rs 5,00,000 more:
   New gross: Rs 22,00,000 = 2.2x
   BLOCKED!

3. DRAWDOWN AUTO-FLATTEN
   ──────────────────────
   Rule: If portfolio drops X% from peak, SELL EVERYTHING.
   Example: Max 25% drawdown.
   
   Portfolio peak: Rs 12,00,000
   25% drawdown level: Rs 9,00,000
   Current value: Rs 9,10,000 ← close to trigger!
   
   If value drops to Rs 8,99,999:
     FLATTEN! Sell all positions at market.
     Strategy is STOPPED. Cannot place new orders.
     
   This prevents catastrophic losses.
   Even the best strategies can have bad periods.
   Without this, a bug in the strategy could wipe out everything.

4. ORDER RATE LIMIT
   ─────────────────
   Rule: Max N orders per time period.
   Prevents: Strategy bugs that spam thousands of orders.
   Example: Max 100 orders per day, max 10 per minute.

5. CONCENTRATION CHECK
   ────────────────────
   Rule: Must be diversified across N+ stocks.
   Prevents: Putting everything into one bet.
```

---

### 2.9 Component 6: Portfolio Tracker

The portfolio tracker maintains the current state of your simulated account.

```
PORTFOLIO STATE:

  ┌──────────────────────────────────────────────────────┐
  │ ACCOUNT SUMMARY                                       │
  ├──────────────────────────────────────────────────────┤
  │ Starting Capital:     Rs 10,00,000                    │
  │ Current Cash:         Rs 2,45,600                     │
  │ Positions Value:      Rs 8,12,400                     │
  │ Total Portfolio:      Rs 10,58,000                    │
  │ Total P&L:            Rs 58,000 (+5.8%)               │
  │ Peak Value:           Rs 11,20,000                    │
  │ Current Drawdown:     Rs 62,000 (5.5% from peak)     │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │ POSITIONS                                             │
  ├──────────┬─────┬──────────┬──────────┬───────────────┤
  │ Stock    │ Qty │ Avg Cost │ Mkt Price│ Unrealized P&L│
  ├──────────┼─────┼──────────┼──────────┼───────────────┤
  │ TCS      │ 100 │ 3,800.00 │ 3,870.00│ +Rs 7,000     │
  │ INFY     │ -50 │ 1,520.00 │ 1,490.00│ +Rs 1,500     │
  │ RELIANCE │ 200 │ 2,450.00 │ 2,410.00│ -Rs 8,000     │
  │ HDFC     │  80 │ 1,650.00 │ 1,680.00│ +Rs 2,400     │
  └──────────┴─────┴──────────┴──────────┴───────────────┘
  
  Note: INFY qty is -50 (NEGATIVE = SHORT position)
    She borrowed 50 shares and sold them at Rs 1,520.
    Price dropped to Rs 1,490. She's making money because she 
    can buy them back cheaper. This is "shorting."
```

#### How Portfolio Updates on Each Trade

```
TRADE EVENT: Buy 100 TCS at Rs 3,800

BEFORE:
  Cash: Rs 6,25,600
  TCS position: 0 shares

UPDATE:
  Cash: Rs 6,25,600 - (100 × Rs 3,800) - Rs 760 (commission)
      = Rs 6,25,600 - Rs 3,80,000 - Rs 760
      = Rs 2,44,840
  
  TCS position: 100 shares, avg cost Rs 3,800

AFTER:
  Cash: Rs 2,44,840
  TCS: 100 shares @ Rs 3,800 avg
```

#### How Portfolio Updates on Each Time Bar (Mark-to-Market)

```
Every day (or every bar), recalculate everything using current prices:

  For each position:
    market_value = quantity × current_price
    unrealized_pnl = (current_price - avg_cost) × quantity
    
  Total portfolio = cash + sum(all market_values)
  Total unrealized P&L = sum(all unrealized_pnl)
  
  Check if new high (for drawdown tracking):
    if total_portfolio > peak_value:
        peak_value = total_portfolio
    
    drawdown = (peak_value - total_portfolio) / peak_value
    if drawdown > max_drawdown_limit:
        FLATTEN EVERYTHING (emergency liquidation)
```

---

### 2.10 Putting All Components Together: The Backtest Loop

This is the main loop that ties everything together:

```
THE BACKTEST LOOP (pseudocode):

initialize:
    portfolio = Portfolio(starting_cash=10_00_000)
    cost_model = CostModel(commission_bps=2, impact_eta=0.3)
    risk_manager = RiskManager(max_position=0.10, max_drawdown=0.25)
    data_feed = MarketDataFeed("2019-01-01", "2023-12-31")
    strategy = load_strategy("my_strategy.py")

for each trading_day in data_feed:

    # 1. FILL PENDING ORDERS from yesterday
    for order in pending_orders:
        fill_price = data_feed.get_fill_price(order.symbol)  # today's open
        
        # Apply cost model
        fill_price = cost_model.apply(fill_price, order)
        
        # Check risk
        if risk_manager.check(order, portfolio):
            # Execute the fill
            trade = execute(order, fill_price)
            portfolio.update(trade)
            strategy.on_fill(trade)
        else:
            reject(order, reason="risk limit")
    
    # 2. MARK-TO-MARKET (update portfolio with current prices)
    portfolio.mark_to_market(data_feed.get_current_prices())
    
    # 3. CHECK RISK (drawdown, etc.)
    if risk_manager.is_drawdown_breached(portfolio):
        flatten_all_positions(portfolio)
        STOP strategy
        break
    
    # 4. RUN STRATEGY (strategy sees yesterday's data, decides orders)
    current_data = data_feed.get_current_snapshot(portfolio)
    new_orders = strategy.on_data(current_data)
    
    # 5. VALIDATE AND QUEUE ORDERS
    for order in new_orders:
        if order_validator.validate(order, portfolio):
            pending_orders.append(order)
        else:
            log("Order rejected: " + reason)
    
    # 6. ADVANCE TO NEXT DAY
    data_feed.advance()

# BACKTEST COMPLETE — Calculate results
results = analyze(portfolio.trade_history, portfolio.daily_values)
print(results.sharpe_ratio, results.total_return, results.max_drawdown)
```

#### The Critical Timing

```
                    DAY N                          DAY N+1
    ┌──────────────────────────────┐  ┌──────────────────────────┐
    │                              │  │                          │
    │  Market trades all day       │  │  Market opens            │
    │  OHLCV data is recorded      │  │                          │
    │                              │  │  ★ ORDERS FILL HERE ★   │
    │  Market closes               │  │    (at Day N+1's open)   │
    │                              │  │                          │
    │  ★ STRATEGY RUNS HERE ★     │  │  Market trades...        │
    │    (sees Day N's close data) │  │                          │
    │    (generates orders)        │  │                          │
    └──────────────────────────────┘  └──────────────────────────┘
    
    Strategy sees YESTERDAY → Decides TONIGHT → Fills at TOMORROW's open
    
    This eliminates look-ahead bias.
    The strategy CANNOT use information it wouldn't have in real life.
```

---

### 2.11 Common Pitfalls When Building a Paper Engine

```
PITFALL 1: LOOK-AHEAD BIAS
  ──────────────────────────
  Mistake: Using today's close price to fill today's order.
  Reality: You can't know today's close when the market opens.
  Fix: Always fill at NEXT bar's open.
  Impact: Can make a losing strategy look profitable.

PITFALL 2: SURVIVORSHIP BIAS
  ──────────────────────────
  Mistake: Only testing on stocks that EXIST today.
  Reality: Many stocks that existed in 2019 are now delisted (failed).
  Fix: Use a dataset that includes delisted/dead stocks.
  Impact: Makes everything look better (you only test on winners).

PITFALL 3: IGNORING COSTS
  ──────────────────────────
  Mistake: Assuming all trades are free with perfect fills.
  Reality: Costs eat 30-70% of gross profits for active strategies.
  Fix: Include commission + slippage + market impact.
  Impact: A strategy showing 15% returns might actually return 5%.

PITFALL 4: UNREALISTIC FILL ASSUMPTIONS
  ──────────────────────────
  Mistake: Assuming your limit order at Rs 3,800 fills whenever 
           price touches Rs 3,800.
  Reality: There might be 10,000 shares ahead of you in the queue.
           Price touching 3,800 briefly doesn't mean YOU got filled.
  Fix: Use volume-based fill probability.
  Impact: Overestimates fill rate, especially for illiquid stocks.

PITFALL 5: IGNORING MARKET IMPACT
  ──────────────────────────
  Mistake: Assuming you can trade 1,00,000 shares without moving the price.
  Reality: Your trade IS the price movement.
  Fix: Square-root market impact model.
  Impact: Strategies that trade large sizes look great on paper but 
          fail in reality because their own trading destroys their edge.

PITFALL 6: NOT ACCOUNTING FOR VOLUME
  ──────────────────────────
  Mistake: Trading 50,000 shares of a stock that only trades 10,000/day.
  Reality: You can't trade 5x the daily volume without destroying the price.
  Fix: Limit participation to e.g., 10% of daily volume.
  Impact: Limits how much capital you can deploy.

PITFALL 7: OVERFITTING
  ──────────────────────────
  Mistake: Tuning your strategy to perfectly fit historical data.
  Reality: Past patterns don't repeat exactly.
  Example: Strategy says "buy TCS every March 15 because it went up 
           the last 5 years on March 15." This is coincidence, not a rule.
  Fix: Walk-forward testing (train on period A, test on period B).
  Impact: Strategy looks amazing on historical data, fails live.
```

---

### 2.12 Measuring Your Engine's Output

After running the engine, you need to evaluate the strategy's performance:

```
KEY METRICS:

1. TOTAL RETURN
   ─────────────
   (Final portfolio - Starting portfolio) / Starting portfolio × 100
   Example: (12,50,000 - 10,00,000) / 10,00,000 = 25%

2. ANNUALIZED RETURN
   ──────────────────
   Adjusts total return to a per-year figure.
   Formula: (1 + total_return)^(252/trading_days) - 1
   If 25% over 2 years → annualized ≈ 11.8%

3. SHARPE RATIO (the most important one)
   ─────────────
   Measures RISK-ADJUSTED returns.
   "How much return do you get per unit of risk?"
   
   Sharpe = (Average daily return - Risk-free rate) / Std dev of daily returns
   
   Annualized Sharpe = Daily Sharpe × sqrt(252)
   
   Interpretation:
     < 0:   Losing money
     0-0.5: Bad
     0.5-1: Mediocre
     1-2:   Good
     2-3:   Very good
     > 3:   Exceptional (or suspicious — check for bugs!)

4. MAXIMUM DRAWDOWN
   ─────────────────
   The largest peak-to-trough decline.
   "What's the worst it ever got?"
   
   Example:
     Peak: Rs 13,00,000
     Trough: Rs 10,40,000
     Drawdown: (13,00,000 - 10,40,000) / 13,00,000 = 20%
   
   A 50% drawdown means you need 100% gain just to break even!

5. WIN RATE
   ────────
   Percentage of trades that were profitable.
   Many good strategies have win rates BELOW 50% — they make 
   more on winners than they lose on losers.

6. PROFIT FACTOR
   ──────────────
   Gross profits / Gross losses
   Example: Made Rs 5,00,000 on winners, lost Rs 3,00,000 on losers
   Profit factor: 5/3 = 1.67
   > 1 means profitable. > 2 is very good.
```

---

## 3. Complete Architecture: From Strategy to P&L

Here's the entire system — from a trading idea to actual (simulated) profit and loss:

```
╔═══════════════════════════════════════════════════════════════════╗
║                    THE COMPLETE PICTURE                           ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ┌─────────────────┐                                             ║
║  │ HISTORICAL DATA  │  5 years of daily OHLCV data               ║
║  │ (or Live Feed)   │  for 500+ US stocks                        ║
║  └────────┬─────────┘                                            ║
║           │                                                       ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ DATA FEED       │  Replays data bar by bar                    ║
║  │                 │  Prevents look-ahead bias                   ║
║  └────────┬─────────┘                                            ║
║           │ yesterday's data                                      ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ STRATEGY        │  AI-generated Python code                   ║
║  │ (the brain)     │  Analyzes data → generates signals          ║
║  │                 │  Outputs: list of orders                    ║
║  └────────┬─────────┘                                            ║
║           │ orders                                                ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ ORDER VALIDATOR │  Checks: valid symbol, price, qty           ║
║  │                 │  Checks: sufficient cash/margin             ║
║  └────────┬─────────┘                                            ║
║           │ valid orders                                          ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ MATCHING        │  Simulates exchange matching                ║
║  │ SIMULATOR       │  Fill at next bar's open                    ║
║  │                 │  Volume-based fill probability              ║
║  └────────┬─────────┘                                            ║
║           │ raw fills                                             ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ COST MODEL      │  Commission: 2 bps                         ║
║  │                 │  Impact: η × σ × √(Q/V)                    ║
║  │                 │  Slippage: ±1 bps random                    ║
║  └────────┬─────────┘                                            ║
║           │ adjusted fills                                        ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ RISK MANAGER    │  Max position: 10%                          ║
║  │                 │  Max exposure: 2x                           ║
║  │                 │  Max drawdown: 25% → auto-flatten           ║
║  └────────┬─────────┘                                            ║
║           │ approved fills                                        ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ PORTFOLIO       │  Updates positions, cash, P&L               ║
║  │ TRACKER         │  Mark-to-market daily                       ║
║  │                 │  Tracks equity curve                        ║
║  └────────┬─────────┘                                            ║
║           │ daily portfolio values                                ║
║           ▼                                                       ║
║  ┌─────────────────┐                                             ║
║  │ ANALYZER        │  Calculates: Sharpe, Return, Drawdown      ║
║  │                 │  Generates: equity curve, trade log         ║
║  │                 │  Compares: across strategies and models     ║
║  └─────────────────┘                                             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Key Takeaways

```
1. THE MATCHING ENGINE is the core software of any exchange.
   It receives orders, checks the book, matches, and publishes trades.
   Real engines run in microseconds on specialized hardware.

2. THE MATCHING ALGORITHM is simple:
   New order arrives → Check opposite side → Price match? → Trade!
   No match? → Add to book. Repeat for each price level.

3. THE TRADE PRICE is always the RESTING order's price.
   Passive orders get their price. Aggressive orders pay for immediacy.

4. A PAPER TRADING ENGINE simulates all of this.
   5 levels of realism. Level 3 (volume + costs) is the sweet spot.

5. THE COST MODEL is what makes simulations realistic:
   Commission (fixed) + Slippage (random) + Market Impact (√ model)
   Ignoring costs = your results are lies.

6. THE RISK MANAGER prevents catastrophe:
   Position limits, exposure limits, drawdown auto-flatten.

7. THE BACKTEST LOOP ties everything together:
   For each day: fill orders → update portfolio → run strategy → queue orders.
   Strategy sees yesterday → orders fill at tomorrow's open.

8. COMMON PITFALLS that make your results fake:
   Look-ahead bias, survivorship bias, ignoring costs,
   unrealistic fills, no market impact, overfitting.
```

---

*Next up: Part 4 — Market Data Representation (OHLC Candlesticks, Charts, Data Formats)*
