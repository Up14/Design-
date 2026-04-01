# Part 1: Order Book Mechanics — Deep Dive

> **Parent Topic:** Market Microstructure
> **What this covers:** Everything about how buy/sell orders are organized, displayed, and prioritized inside an exchange.
> **Subtopics:** Bid, Ask, Spread → Central Limit Order Book (CLOB) → Price-Time Priority

---

## Before We Start: Words You Must Know

These are basic terms used EVERYWHERE below. Read these first.

| Term | Simple Meaning | Example |
|------|---------------|---------|
| **Stock / Share** | A tiny piece of ownership in a company | You own 10 shares of TCS = you own a tiny fraction of TCS |
| **Exchange** | The marketplace where stocks are bought and sold | NSE (National Stock Exchange), BSE (Bombay Stock Exchange), NYSE |
| **Broker** | The middleman app/company that sends your orders to the exchange | Zerodha, Groww, Upstox, Angel One |
| **Ticker / Symbol** | Short code name for a stock | TCS, INFY, RELIANCE, HDFCBANK |
| **Quantity (Qty)** | How many shares you want to buy or sell | "Buy 100 shares" → qty = 100 |
| **Price** | How much money per share | "Buy at Rs 3,800 per share" |
| **Order** | Your instruction to buy or sell | "Buy 100 shares of TCS at Rs 3,800" |
| **Trade / Fill** | When an order actually gets executed — shares and money actually move | Your buy order matched a seller → trade happened |
| **Liquidity** | How easy it is to buy/sell without moving the price | High liquidity = many buyers & sellers = easy to trade |
| **Tick Size** | The smallest allowed price movement for a stock | On NSE, tick size = Rs 0.05. So price can be 100.00, 100.05, 100.10 — but NOT 100.03 |

---

## 1. Bid, Ask, and Spread

### 1.1 The Fundamental Problem of Trading

Imagine a bazaar (mandi). You have mangoes to sell. A customer walks up.

```
You (seller):    "I'll sell 1 kg for Rs 200"
Customer (buyer): "I'll pay Rs 150"
```

There's a GAP between what you want and what the customer wants. In stock markets, this gap exists for EVERY stock, ALL the time. Understanding this gap is the foundation of everything.

---

### 1.2 What is a Bid?

#### Definition

A **Bid** is a price that a BUYER is offering to pay. "I BID Rs 3,800 for this stock" = "I'm willing to pay Rs 3,800."

There are usually MANY buyers at MANY different prices. Together, all these buy prices form the **bid side** of the order book.

#### The "Best Bid"

Out of all the buyers waiting, the one offering the HIGHEST price is called the **Best Bid** (also called "Top of Book bid" or "BBO — Best Bid and Offer").

Why? Because if you're a seller, you want the most money possible. The highest bidder is the most attractive buyer.

#### Example

```
Buyers waiting for TCS shares:

  Buyer A: "I'll pay Rs 3,800 for 100 shares"
  Buyer B: "I'll pay Rs 3,795 for 200 shares"
  Buyer C: "I'll pay Rs 3,790 for 500 shares"
  Buyer D: "I'll pay Rs 3,785 for 150 shares"

Best Bid = Rs 3,800 (Buyer A — highest offer)
```

If you're a seller and want to sell RIGHT NOW, the best you can get is Rs 3,800 — because that's the most anyone is currently willing to pay.

---

### 1.3 What is an Ask (Offer)?

#### Definition

An **Ask** (also called **Offer**) is a price that a SELLER is willing to accept. "I'm ASKING Rs 3,805 for this stock" = "I want Rs 3,805, pay me that and I'll sell."

There are usually MANY sellers at MANY different prices. Together, all these sell prices form the **ask side** (or **offer side**) of the order book.

#### The "Best Ask"

Out of all the sellers waiting, the one willing to sell at the LOWEST price is called the **Best Ask**.

Why? Because if you're a buyer, you want to pay as little as possible. The cheapest seller is the most attractive.

#### Example

```
Sellers waiting to sell TCS shares:

  Seller P: "I'll sell at Rs 3,805 for 150 shares"
  Seller Q: "I'll sell at Rs 3,810 for 300 shares"
  Seller R: "I'll sell at Rs 3,815 for 100 shares"
  Seller S: "I'll sell at Rs 3,820 for 250 shares"

Best Ask = Rs 3,805 (Seller P — cheapest seller)
```

If you're a buyer and want to buy RIGHT NOW, the cheapest you can get is Rs 3,805.

---

### 1.4 What is the Spread?

#### Definition

The **Spread** is the difference between the Best Ask and the Best Bid.

```
Spread = Best Ask - Best Bid
```

It's the GAP between the cheapest seller and the most expensive buyer.

#### Example

```
Best Bid:  Rs 3,800 (most a buyer will pay)
Best Ask:  Rs 3,805 (least a seller will accept)
Spread:    Rs 3,805 - Rs 3,800 = Rs 5
```

No one is trading at prices between Rs 3,800 and Rs 3,805 right now. That Rs 5 gap is "no man's land."

---

### 1.5 Why Does the Spread Exist?

Think about it: if a buyer offered Rs 3,800 and a seller wanted Rs 3,800, they'd match INSTANTLY and a trade would happen. The order would disappear from the book.

The spread exists BECAUSE the remaining buyers and sellers DON'T agree on price. All the orders that DID agree have already been matched and executed. What's LEFT in the book is the disagreement.

```
Orders that agreed on price → Already matched → GONE (became trades)
Orders still in the book   → Disagree on price → The spread is their disagreement
```

---

### 1.6 Spread: What It Tells You

The spread is one of the most important numbers in trading. It tells you about the stock's **liquidity** (how easy it is to trade).

#### Tight Spread (small gap) = High Liquidity

```
Example: Reliance Industries
  Best Bid: Rs 2,499.95
  Best Ask: Rs 2,500.00
  Spread: Rs 0.05 (1 tick — the smallest possible!)

What this means:
  - TONS of buyers and sellers
  - Very easy to buy or sell
  - Very small cost to trade
  - This is a highly liquid stock
```

#### Wide Spread (big gap) = Low Liquidity

```
Example: Some small company "XYZ Textiles Ltd"
  Best Bid: Rs 45.00
  Best Ask: Rs 48.50
  Spread: Rs 3.50 (huge relative to the price — that's 7.8%!)

What this means:
  - Few buyers and sellers
  - Hard to trade quickly
  - You lose 7.8% just by buying and immediately selling
  - This is an illiquid stock
```

#### The "Invisible Cost" of the Spread

```
You buy TCS at Rs 3,805 (ask price).
You immediately want to sell.
You can only sell at Rs 3,800 (bid price).
You just lost Rs 5 per share without the price even moving.

This is called the "bid-ask bounce" or "crossing the spread."
Every time you trade, you pay HALF the spread as a hidden cost.

Cost per trade ≈ Spread / 2

Spread = Rs 5 → Each trade costs you ~Rs 2.50 per share in hidden costs.
```

This is why spread matters so much, especially for people who trade frequently.

---

### 1.7 Bid-Ask Depth (not just one price — many prices!)

So far we've talked about the BEST bid and BEST ask. But in reality, there are orders waiting at MANY price levels. This is called **depth**.

```
============ TCS Order Book — Full Depth ============

   BID SIDE (Buyers)                    ASK SIDE (Sellers)
   Price     | Qty    | # Orders       Price     | Qty    | # Orders
   ----------+--------+--------        ----------+--------+--------
   3,800.00  | 5,000  | 23       ←→    3,805.00  | 3,200  | 15
   3,799.95  | 8,000  | 45             3,805.05  | 6,500  | 31
   3,799.90  | 12,000 | 67             3,810.00  | 4,000  | 22
   3,799.85  | 3,500  | 18             3,810.05  | 7,800  | 42
   3,799.80  | 15,000 | 89             3,815.00  | 2,100  | 11
   ...       | ...    | ...            ...       | ...    | ...
```

**Reading this:**

- **Qty column:** Total number of shares waiting at that price level.
  At Rs 3,800, there are 5,000 shares worth of buy orders.

- **# Orders column:** How many individual orders make up that quantity.
  Those 5,000 shares come from 23 different buyers.

- **Depth:** How much total volume is waiting across all price levels.
  More depth = harder to push the price with a single big order.

---

### 1.8 What Happens When Someone "Hits the Bid" or "Lifts the Offer"

These are trading terms you'll hear a lot:

#### "Hitting the Bid"

A seller who wants to sell RIGHT NOW sends a market sell order. It matches against the best bid.

```
Best Bid: Rs 3,800 (5,000 shares waiting)
You: SELL 1,000 shares at MARKET

→ You sell 1,000 shares at Rs 3,800
→ The bid at 3,800 reduces from 5,000 to 4,000 shares
→ You "hit the bid"
```

#### "Lifting the Offer"

A buyer who wants to buy RIGHT NOW sends a market buy order. It matches against the best ask.

```
Best Ask: Rs 3,805 (3,200 shares waiting)
You: BUY 1,000 shares at MARKET

→ You buy 1,000 shares at Rs 3,805
→ The ask at 3,805 reduces from 3,200 to 2,200 shares
→ You "lifted the offer"
```

---

### 1.9 What Moves the Bid and Ask?

The bid and ask prices change constantly throughout the trading day. Here's what causes movement:

```
Scenario 1: More buyers arrive (demand increases)
  New buyer places bid at Rs 3,802 (higher than current best bid of 3,800)
  → Best Bid moves UP from 3,800 to 3,802
  → Spread shrinks from Rs 5 to Rs 3

Scenario 2: Sellers get impatient
  A seller at Rs 3,805 cancels and re-submits at Rs 3,801
  → Best Ask moves DOWN from 3,805 to 3,801
  → Spread shrinks from Rs 5 to Rs 1

Scenario 3: Big buy order eats through the ask side
  Someone buys 10,000 shares at MARKET
  → First 3,200 shares filled at Rs 3,805 (clears that level)
  → Next 6,500 shares filled at Rs 3,805.05 (moves to next level)
  → Remaining 300 shares filled at Rs 3,810
  → Best Ask is now Rs 3,810 (jumped up!)
  → Spread WIDENED because the ask moved up

Scenario 4: Bad news comes out about TCS
  Many buyers cancel their orders (they don't want to buy anymore)
  New sellers flood in at lower prices
  → Bids collapse downward, Asks drop too
  → The whole order book "shifts down"
```

---

### 1.10 Real-World Context: Who Are These Buyers and Sellers?

```
On the BID side (buyers), you might find:
  - Retail investors (people like you and me using Zerodha)
  - Mutual funds building a position slowly
  - Algo trading bots placing limit orders
  - Market makers (firms whose job is to always have buy orders)

On the ASK side (sellers), you might find:
  - Retail investors selling their holdings
  - Institutional investors rebalancing their portfolio
  - Promoters selling a small stake
  - Short sellers (people who borrowed shares and are selling them — hoping to buy back cheaper later)
```

---

## 2. Central Limit Order Book (CLOB)

### 2.1 What Problem Does the CLOB Solve?

Before electronic exchanges, trading was chaos:

```
The old way (1800s - 1990s): "Open Outcry"
  Hundreds of traders standing in a pit on the trading floor.
  Everyone shouting prices at each other.
  "I'll BUY 500 at 42!" "SELL 300 at 43!" "ANYONE SELLING AT 41?!"
  Deals done with hand signals and scribbled paper tickets.

Problems:
  - Only people physically present could trade
  - Hard to know the true best price
  - Human errors (mishearing, wrong tickets)
  - Slow — minutes per trade
  - Unfair — loudest/fastest person got the best deals
```

The CLOB was invented to solve ALL of this with a computer.

---

### 2.2 Definition

A **Central Limit Order Book (CLOB)** is an electronic system that:

1. **Collects** all buy and sell limit orders for a stock
2. **Organizes** them by price (and within same price, by time)
3. **Displays** them so everyone can see the same information
4. **Matches** them automatically when a buy price meets a sell price

Let's break down the name:

```
Central  → ONE single system for all participants (not scattered across many places)
Limit    → Primarily holds LIMIT orders (orders with a specific price)
Order    → Buy/sell instructions
Book     → The organized list/record of all waiting orders
```

---

### 2.3 What the CLOB Looks Like (Full Picture)

Here's a realistic view of what the order book for TCS might look like at 10:30 AM on a trading day:

```
═══════════════════════════════════════════════════════════════════
                ORDER BOOK: TCS (Tata Consultancy Services)
                Time: 10:30:15.234 AM | Last Trade: Rs 3,802.50
═══════════════════════════════════════════════════════════════════

 BID SIDE (Buyers — want to buy)          ASK SIDE (Sellers — want to sell)
 ──────────────────────────────           ──────────────────────────────
 #Orders |  Qty   |  Price    |           |  Price    |  Qty   | #Orders
 ────────+────────+───────────+           +───────────+────────+────────
    23   |  5,000 | 3,800.00  | ← Best   | 3,805.00  |  3,200 |   15
    45   |  8,000 | 3,799.95  |   Bid     | 3,805.05  |  6,500 |   31
    67   | 12,000 | 3,799.90  |           | 3,810.00  |  4,000 |   22
    18   |  3,500 | 3,799.85  |     ↑     | 3,810.05  |  7,800 |   42
    89   | 15,000 | 3,799.80  |   SPREAD  | 3,815.00  |  2,100 |   11
    34   |  7,200 | 3,799.75  |   = Rs 5  | 3,815.05  |  5,400 |   28
    56   | 10,500 | 3,799.70  |     ↓     | 3,820.00  |  8,900 |   47
    12   |  2,800 | 3,799.65  |           | 3,820.05  |  1,600 |    9
    78   | 20,000 | 3,799.60  |   Best    | 3,825.00  | 11,000 |   53
    41   |  6,100 | 3,799.55  |   Ask →   | 3,830.00  |  4,300 |   25
 ────────+────────+───────────+           +───────────+────────+────────
 TOTAL:    90,100 shares                    54,800 shares
 (buyers waiting)                          (sellers waiting)

═══════════════════════════════════════════════════════════════════
```

#### How to read this:

**Left side (Bids):** Read from TOP to BOTTOM = highest price to lowest price.
- Top row: 23 individual buy orders, totaling 5,000 shares, all at Rs 3,800.00
- These are the most aggressive buyers (willing to pay the most)

**Right side (Asks):** Read from TOP to BOTTOM = lowest price to highest price.
- Top row: 15 individual sell orders, totaling 3,200 shares, all at Rs 3,805.00
- These are the most aggressive sellers (willing to sell cheapest)

**The gap in the middle:** Rs 5 spread. No orders exist here.

**Total quantities:**
- 90,100 shares of buying interest (bid side)
- 54,800 shares of selling interest (ask side)
- More buyers than sellers → slight "buying pressure"

---

### 2.4 What Happens Inside the CLOB — Step by Step Stories

Let me walk you through several scenarios to show EXACTLY what happens:

#### Story 1: A Limit Buy Order That DOESN'T Match

```
Starting book:
  Best Bid: Rs 3,800 (5,000 shares)
  Best Ask: Rs 3,805 (3,200 shares)

Rajesh sends: "BUY 200 shares of TCS at LIMIT Rs 3,798"

CLOB thinks:
  Is there a seller at Rs 3,798 or lower? NO (cheapest seller is 3,805)
  → No match possible
  → Add Rajesh's order to the BID SIDE at Rs 3,798

Updated book:
  Best Bid: Rs 3,800 (5,000 shares)       ← unchanged
  ...
  Rs 3,798: 200 shares (Rajesh's order)   ← NEW entry
  ...
  Best Ask: Rs 3,805 (3,200 shares)       ← unchanged

Rajesh's order sits in the book. It will only execute if a seller comes
along and is willing to sell at Rs 3,798 or lower.
```

#### Story 2: A Limit Buy Order That DOES Match

```
Starting book:
  Best Bid: Rs 3,800 (5,000 shares)
  Best Ask: Rs 3,805 (3,200 shares)

Priya sends: "BUY 1,000 shares of TCS at LIMIT Rs 3,805"

CLOB thinks:
  Is there a seller at Rs 3,805 or lower? YES! 3,200 shares at Rs 3,805.
  Priya wants 1,000 shares. 1,000 ≤ 3,200, so fully matchable.
  → TRADE: 1,000 shares at Rs 3,805
  → Priya gets 1,000 shares (she's the buyer)
  → The seller(s) at 3,805 lose 1,000 shares from their total

Updated book:
  Best Bid: Rs 3,800 (5,000 shares)       ← unchanged
  Best Ask: Rs 3,805 (2,200 shares)       ← reduced by 1,000 (was 3,200)

Priya's order is GONE — it was fully filled. She now owns 1,000 shares.
```

#### Story 3: A Market Order That Eats Through Multiple Levels

This is where it gets interesting. What if someone sends a HUGE market order?

```
Starting book (Ask side):
  Rs 3,805.00 | 3,200 shares
  Rs 3,805.05 | 6,500 shares
  Rs 3,810.00 | 4,000 shares

Amit sends: "BUY 8,000 shares of TCS at MARKET" (he wants it NOW, any price)

CLOB processes step by step:

  Step 1: Match against cheapest seller first
    Rs 3,805.00 has 3,200 shares
    Fill 3,200 shares at Rs 3,805.00
    Amit still needs: 8,000 - 3,200 = 4,800 more shares
    Rs 3,805.00 level is now EMPTY (fully consumed)

  Step 2: Move to next price level
    Rs 3,805.05 has 6,500 shares
    Fill 4,800 shares at Rs 3,805.05
    Amit still needs: 4,800 - 4,800 = 0 (done!)
    Rs 3,805.05 has 1,700 shares left (6,500 - 4,800)

  Result:
    Amit bought:
      3,200 shares @ Rs 3,805.00 = Rs 1,21,76,000
      4,800 shares @ Rs 3,805.05 = Rs 1,82,64,240
      Total: 8,000 shares for Rs 3,04,40,240
      Average price: Rs 3,805.03 per share

Updated book (Ask side):
  Rs 3,805.05 | 1,700 shares    ← this is now the Best Ask!
  Rs 3,810.00 | 4,000 shares
  (the Rs 3,805.00 level is completely gone)

The Best Ask MOVED from Rs 3,805.00 to Rs 3,805.05
The spread CHANGED.
```

**This is called "walking the book"** — a large order "walks" up (or down) through multiple price levels, consuming liquidity at each level.

**This is also "market impact"** — Amit's own order pushed the price up from 3,805.00 to 3,805.05. If his order was 50,000 shares, it would push even further.

#### Story 4: A Sell Order That Creates a Trade

```
Starting book:
  Best Bid: Rs 3,800 (5,000 shares)
  Best Ask: Rs 3,805 (3,200 shares)

Neha sends: "SELL 2,000 shares of TCS at LIMIT Rs 3,800"

CLOB thinks:
  Is there a buyer at Rs 3,800 or higher? YES! 5,000 shares at Rs 3,800.
  Neha wants to sell 2,000. 2,000 ≤ 5,000, fully matchable.
  → TRADE: 2,000 shares at Rs 3,800
  → Neha sells 2,000 shares
  → Bid at 3,800 reduces from 5,000 to 3,000

Updated book:
  Best Bid: Rs 3,800 (3,000 shares)       ← reduced by 2,000
  Best Ask: Rs 3,805 (3,200 shares)       ← unchanged
```

#### Story 5: What Happens When Bid Meets Ask (Price Crosses)

This is rare but important to understand:

```
Starting book:
  Best Bid: Rs 3,800 (5,000 shares)
  Best Ask: Rs 3,805 (3,200 shares)

Scenario: A buyer sends "BUY 500 at Rs 3,810" (limit higher than best ask!)

CLOB thinks:
  This buyer is willing to pay up to Rs 3,810.
  Cheapest seller is at Rs 3,805.
  Rs 3,805 < Rs 3,810, so we can match!
  → TRADE: 500 shares at Rs 3,805 (seller's price, NOT 3,810!)
  → The buyer gets a BETTER deal than they asked for

Why Rs 3,805 and not Rs 3,810?
  Because the seller was already waiting at Rs 3,805.
  The matching engine gives the BEST possible price.
  The buyer said "I'll pay UP TO Rs 3,810" — they got 3,805. That's better.
  This is called "price improvement."
```

---

### 2.5 CLOB Under the Hood: The Data Structure

If you're a programmer, here's how the CLOB is actually stored in memory:

```
CLOB
├── Bids (Buy side)
│   Stored as: Sorted map/tree, ordered by PRICE DESCENDING
│   Key = Price
│   Value = Queue of orders at that price (FIFO — first in, first out)
│
│   3800.00 → [Order_A (100 shares, 10:00:00), Order_B (200 shares, 10:00:01), ...]
│   3799.95 → [Order_C (500 shares, 10:00:02), ...]
│   3799.90 → [Order_D (300 shares, 10:00:03), ...]
│
├── Asks (Sell side)
│   Stored as: Sorted map/tree, ordered by PRICE ASCENDING
│   Key = Price
│   Value = Queue of orders at that price (FIFO)
│
│   3805.00 → [Order_P (150 shares, 10:00:00), Order_Q (300 shares, 10:00:01), ...]
│   3805.05 → [Order_R (200 shares, 10:00:02), ...]
│   3810.00 → [Order_S (100 shares, 10:00:04), ...]
│
└── Metadata
    ├── Last trade price: 3802.50
    ├── Last trade time: 10:30:15.234
    ├── Total bid volume: 90,100
    └── Total ask volume: 54,800
```

**Why sorted tree?**
- Finding the best bid/ask = O(1) — just look at the top
- Inserting a new order = O(log n) — fast even with millions of orders
- Most exchanges use a Red-Black tree or similar balanced tree structure

**Why FIFO queue at each price level?**
- This implements TIME PRIORITY. At the same price, whoever came first gets matched first.

---

### 2.6 What You See vs What Exists

Important: As a regular trader, you usually DON'T see the full order book. You see a simplified version:

```
What NSE shows retail traders (Level 1 — "Top of Book"):
  Best Bid: Rs 3,800 | Best Ask: Rs 3,805

What NSE shows with "Market Depth" (Level 2 — Top 5 levels):
  Bid                    Ask
  3,800 | 5,000          3,805 | 3,200
  3,799 | 8,000          3,805 | 6,500
  3,798 | 12,000         3,810 | 4,000
  3,797 | 3,500          3,810 | 7,800
  3,796 | 15,000         3,815 | 2,100

What high-frequency traders and institutions see (Level 3 — Full Book):
  Every single order, at every price level, with timestamps.
  This costs a LOT of money and requires special data feeds.

What NOBODY sees:
  "Iceberg orders" — large orders that only show a small portion.
  Someone might have a 50,000 share order but only shows 500 at a time.
  (More on this in later topics)
```

---

### 2.7 Properties of the CLOB

| Property | What It Means | Why It Matters |
|----------|--------------|----------------|
| **Central** | One book per stock, maintained by the exchange | Everyone trades against the same book — no private deals |
| **Transparent** | All participants see the same bid/ask/depth | Fair pricing — no information advantage from the book itself |
| **Continuous** | Matching happens instantly, all day | No waiting for "batch auctions" (except at open/close) |
| **Anonymous** | You don't know WHO placed each order | Prevents discrimination (big fund vs small retail trader) |
| **Deterministic** | Same inputs always produce same outputs | The matching result is predictable and auditable |

---

### 2.8 Alternatives to CLOB (for context)

Not all markets use a CLOB. Knowing the alternatives helps you appreciate why CLOB is dominant:

```
1. Dealer Market (Over-The-Counter / OTC)
   Instead of a central book, you call individual dealers and ask for quotes.
   Used for: Bonds, forex (partially), some derivatives
   Problem: You don't know if you're getting the best price

2. Request for Quote (RFQ)
   You send "I want to buy 10,000 shares" to multiple dealers.
   They each send back a private price. You pick the best one.
   Used for: Large block trades, corporate bonds
   Problem: Slow, limited to your network of dealers

3. Dark Pool
   An order book that is NOT visible to anyone. Orders match secretly.
   Used by: Large institutions who don't want to show their hand
   Problem: No transparency, potential for unfair matching

4. Auction Market
   Orders are collected for a period, then matched all at once at a single price.
   Used for: Stock exchange open/close, IPOs
   Example: NSE opening auction (9:00-9:15 AM) sets the opening price
```

**CLOB wins for most trading because:** transparency + speed + fairness. About 80%+ of global stock trading happens on CLOBs.

---

## 3. Price-Time Priority

### 3.1 The Core Question

When there are HUNDREDS of orders in the book and a new matching order arrives, the exchange needs clear, deterministic rules to answer:

**"Which order gets filled first? And if there isn't enough for everyone, who gets left out?"**

The answer is **Price-Time Priority** — the most common matching algorithm used by exchanges worldwide (including NSE, BSE, NYSE, NASDAQ, LSE, etc.).

---

### 3.2 Rule 1: Price Priority (the main rule)

**The order with the BETTER PRICE always goes first.**

What "better" means depends on the side:

```
For BUY orders: HIGHER price = better
  Why? A buyer willing to pay Rs 3,805 is more aggressive than one at Rs 3,800.
  The Rs 3,805 buyer gets filled first.

For SELL orders: LOWER price = better
  Why? A seller willing to accept Rs 3,800 is more aggressive than one at Rs 3,810.
  The Rs 3,800 seller gets filled first.
```

#### Example

```
Three buy orders waiting:
  Order A: BUY 100 at Rs 3,800
  Order B: BUY 200 at Rs 3,805  ← highest price = BEST = goes first
  Order C: BUY 150 at Rs 3,798

A seller arrives: "SELL 200 at MARKET"

Price Priority says:
  1st: Order B at Rs 3,805 (highest bid) → fills 200 shares → DONE
  Order A and C don't get filled at all.
```

This is intuitive — the person willing to pay the most money should get served first.

---

### 3.3 Rule 2: Time Priority (the tiebreaker)

**When two orders have the EXACT SAME price, the one that arrived FIRST gets filled first.**

First come, first served. Simple.

#### Example

```
Three buy orders, ALL at Rs 3,800:
  Order A: BUY 100 at Rs 3,800 — arrived at 10:00:00.000
  Order B: BUY 200 at Rs 3,800 — arrived at 10:00:00.500  (0.5 sec later)
  Order C: BUY 150 at Rs 3,800 — arrived at 10:00:01.200  (1.2 sec later)

A seller arrives: "SELL 250 at MARKET"

Same price, so Time Priority kicks in:
  1st: Order A (earliest) → 100 shares filled at Rs 3,800
  Remaining to sell: 250 - 100 = 150
  2nd: Order B (next earliest) → 150 shares filled at Rs 3,800
       (Order B only partially filled — had 200, got 150, still has 50 left)
  Remaining to sell: 150 - 150 = 0 → DONE
  3rd: Order C → gets NOTHING. Still waiting in the book.
```

---

### 3.4 Full Combined Example (Price + Time Together)

Let's do a complete, realistic example:

```
═══════════════════════════════════════════════════════
         ORDER BOOK FOR TCS — Before the incoming order
═══════════════════════════════════════════════════════

BID SIDE:
  Price      | Orders (in time order)
  -----------+--------------------------------------------------
  Rs 3,805   | Order_E: 300 shares (arrived 10:00:05)
  Rs 3,802   | Order_D: 500 shares (arrived 10:00:04)
  Rs 3,800   | Order_A: 100 shares (arrived 10:00:00)
             | Order_B: 200 shares (arrived 10:00:01)
             | Order_C: 150 shares (arrived 10:00:02)
  Rs 3,798   | Order_F: 400 shares (arrived 10:00:06)

INCOMING: Neha sends "SELL 900 shares at MARKET"

═══════════════════════════════════════════════════════
         MATCHING — Step by step
═══════════════════════════════════════════════════════

Neha wants to sell 900 shares. Who buys?

PRICE PRIORITY first — start from HIGHEST bid:

Step 1: Rs 3,805 — Order_E (300 shares)
  → Fill 300 at Rs 3,805
  → Neha has 900 - 300 = 600 left to sell
  → Order_E is fully filled and removed from book

Step 2: Rs 3,802 — Order_D (500 shares)
  → Fill 500 at Rs 3,802
  → Neha has 600 - 500 = 100 left to sell
  → Order_D is fully filled and removed from book

Step 3: Rs 3,800 — Multiple orders here! TIME PRIORITY kicks in:

  Step 3a: Order_A (100 shares, arrived 10:00:00) — EARLIEST
    → Fill 100 at Rs 3,800
    → Neha has 100 - 100 = 0 left to sell → DONE!
    → Order_A is fully filled and removed

  Order_B and Order_C at Rs 3,800: NOT touched (Neha's order is complete)
  Order_F at Rs 3,798: NOT touched

═══════════════════════════════════════════════════════
         RESULT SUMMARY
═══════════════════════════════════════════════════════

Neha's fills:
  300 shares @ Rs 3,805 = Rs 11,41,500
  500 shares @ Rs 3,802 = Rs 19,01,000
  100 shares @ Rs 3,800 = Rs  3,80,000
  ─────────────────────────────────────
  900 shares total       = Rs 34,22,500
  Average price: Rs 3,802.78 per share

Updated book (Bid side):
  Rs 3,800 | Order_B: 200 shares, Order_C: 150 shares  ← still waiting
  Rs 3,798 | Order_F: 400 shares                       ← still waiting
  (Rs 3,805 and Rs 3,802 levels are completely gone)

New Best Bid: Rs 3,800 (was Rs 3,805 — it moved DOWN)
```

---

### 3.5 Why Price-Time Priority? (The Fairness Argument)

```
Price Priority ensures:
  "If you're willing to pay more, you deserve to be served first."
  This is fair because you're taking more risk / offering more value.

Time Priority ensures:
  "If you're equally willing, whoever showed up first gets served."
  This prevents queue-jumping and rewards decisiveness.

Together, they create a system where:
  1. The "best" price is always what determines the match (efficient market)
  2. You can't game the queue without offering a better price
  3. The rules are transparent and predictable
  4. Everyone plays by the same rules (institution or retail, big or small)
```

---

### 3.6 Time Priority — Why Milliseconds Matter

In modern markets, time priority creates a speed race:

```
If two traders both want to buy at Rs 3,805:
  Trader A's order arrives at 10:00:00.001234 (1.234 milliseconds after 10 AM)
  Trader B's order arrives at 10:00:00.001235 (1.235 milliseconds after 10 AM)

  Trader A is ahead by 0.000001 seconds (1 microsecond).
  Trader A gets priority.

This is why:
  - High Frequency Trading firms spend millions on faster connections
  - They put their servers PHYSICALLY NEXT TO the exchange ("co-location")
  - They use special network cables and even microwave towers
  - 1 microsecond of speed advantage = millions of Rs in profit over a year
```

---

### 3.7 Alternative Priority Systems (for context)

Price-Time is the most common, but not the only system:

```
1. Price-Time Priority (most common)
   Rule: Best price first, then earliest time.
   Used by: NSE, BSE, NYSE, NASDAQ, most exchanges
   Pros: Simple, fair, transparent
   Cons: Creates speed arms race

2. Price-Size Priority (rare)
   Rule: Best price first, then LARGEST order.
   Used by: Some bond markets
   Pros: Rewards large institutional orders
   Cons: Disadvantages small/retail traders

3. Pro-Rata Priority (some futures markets)
   Rule: Best price first, then proportional to order size.
   Example: Two orders at same price — 1,000 shares and 500 shares.
            If 600 shares match, split proportionally:
            1,000/(1,000+500) × 600 = 400 shares
            500/(1,000+500) × 600 = 200 shares
   Used by: CME (Chicago) for some products
   Pros: More fair distribution
   Cons: Complex, partial fills everywhere

4. Price-Random Priority
   Rule: Best price first, then RANDOM selection.
   Used by: Almost nowhere (experimental)
   Pros: Eliminates speed advantage entirely
   Cons: Unpredictable, hard to plan around
```

---

### 3.8 Partial Fills — An Important Consequence

Because of priority rules, orders often get **partially filled** — you wanted to buy 500 shares but only got 300, because someone ahead of you in the queue took the rest.

```
Your order: BUY 500 shares at Rs 3,800
Queue ahead of you at Rs 3,800: Order_X (200 shares), Order_Y (400 shares)

A seller comes to sell 700 shares at market.

Priority:
  Order_X: gets 200 (fully filled)
  Order_Y: gets 400 (fully filled)
  Remaining: 700 - 200 - 400 = 100
  Your order: gets 100 out of 500 (PARTIAL FILL)

Your order status: 100 filled, 400 still waiting in the book.
You can:
  - Wait for more sellers (your remaining 400 keeps its time priority)
  - Modify the order (WARNING: you lose your place in the queue!)
  - Cancel the remaining 400
```

**Important:** If you MODIFY your order (change price or quantity), you go to the BACK of the time queue. Your original timestamp is lost. This is why traders are careful about modifying orders.

---

## 4. Putting It All Together: A Complete Trading Day Story

Let's trace a COMPLETE sequence of events for TCS stock, from market open:

```
═══════════════════════════════════════════════════════
  TCS — COMPLETE TRADING SEQUENCE
═══════════════════════════════════════════════════════

9:15:00 AM — MARKET OPENS
  The book is populated from pre-market orders:
  Bids: 3,800 (10,000 shares) | 3,799 (8,000)
  Asks: 3,805 (5,000 shares)  | 3,810 (3,000)
  Spread: Rs 5

9:15:01 AM — Rajesh (retail trader) places limit buy
  "BUY 100 TCS at Rs 3,800"
  → Added to bid at 3,800, behind existing 10,000 shares
  → No change to best bid/ask

9:15:02 AM — Algo Bot #7 (HFT) places limit buy
  "BUY 5,000 TCS at Rs 3,802"
  → New price level! No sellers at 3,802, so no match.
  → New Best Bid: Rs 3,802 (was 3,800)
  → Spread SHRINKS to Rs 3 (3,805 - 3,802)

9:15:03 AM — Mutual Fund XYZ places market sell
  "SELL 3,000 TCS at MARKET"
  → Matches against best bid: Algo Bot #7 at Rs 3,802
  → TRADE: 3,000 shares at Rs 3,802
  → Algo Bot #7 has 2,000 shares remaining at Rs 3,802
  → Last Trade Price: Rs 3,802

9:15:05 AM — Bad news drops: "TCS loses major client"
  Many buyers CANCEL their orders (don't want to buy anymore)
  → Algo Bot #7 cancels remaining 2,000 at Rs 3,802
  → Best Bid drops back to Rs 3,800
  → Spread widens back to Rs 5

  New sellers flood in:
  → "SELL at 3,800" "SELL at 3,799" "SELL at 3,795"
  → These match against existing bids, pushing price DOWN

9:15:06 AM — Panicked selling
  Sellers willing to sell at Rs 3,790 (below all bids!)
  → Eats through bids: 3,800 level consumed, 3,799 consumed
  → Price crashes from 3,800 to 3,790 in seconds
  → Rajesh's buy at 3,800 gets FILLED (a seller hit his bid)
  → He bought at 3,800 but price is now 3,790 — he's already losing Rs 10/share

9:15:30 AM — Market stabilizes
  New bids come in at 3,785-3,790
  New asks at 3,795-3,800
  Spread: Rs 5-10 (wider than before — less confidence)

9:20:00 AM — Gradual recovery
  Good earnings report expected next week
  Value buyers start placing bids
  Price slowly climbs back...

... and so on, thousands of orders per second, all day until 3:30 PM.
```

---

## Summary: The Mental Model

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│   BUYERS (Bid Side)         SELLERS (Ask Side)       │
│   ──────────────           ──────────────            │
│   Sorted: Highest → Lowest  Sorted: Lowest → Highest │
│                                                       │
│   ┌─────────┐                    ┌─────────┐         │
│   │ Rs 3,802│ ← Best Bid  Ask → │ Rs 3,805│         │
│   │ Rs 3,800│      ↑            │ Rs 3,810│         │
│   │ Rs 3,798│   SPREAD = Rs 3   │ Rs 3,815│         │
│   │ Rs 3,795│      ↓            │ Rs 3,820│         │
│   └─────────┘                    └─────────┘         │
│                                                       │
│   At each price: orders queue by TIME (FIFO)         │
│                                                       │
│   MATCHING RULES:                                     │
│   1. Best PRICE first (higher bid, lower ask)        │
│   2. Same price? Earlier TIME first                  │
│   3. Match → Trade → Remove from book                │
│   4. No match → Order waits in book                  │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

*Next up: Part 2 — Order Management (Order Types, Order Actions, Orders vs Trades)*
