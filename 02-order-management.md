# Part 2: Order Management — Deep Dive

> **Parent Topic:** Market Microstructure
> **What this covers:** The different types of orders you can send, the actions you can take on them, and the critical difference between orders and trades.
> **Subtopics:** Order Types (Limit, Market, Stop-Loss) → Order Actions (New, Modify, Cancel) → Orders vs Trades
> **Prerequisites:** You should have read Part 1 (Order Book Mechanics) first.

---

## Before We Start: Quick Recap from Part 1

```
You now know:
  - The order book has a BID side (buyers) and ASK side (sellers)
  - Best Bid = highest buyer, Best Ask = lowest seller
  - Spread = gap between them
  - Matching follows Price-Time Priority
  - When orders match → a trade happens → orders are removed from book
```

This part answers: **What KINDS of orders can you send? What can you DO with them once sent? And what's the difference between sending an order and getting a trade?**

---

## 1. Order Types

### 1.1 Why Do Different Order Types Exist?

Every trader has a different situation:

```
Situation A: "I NEED to buy right now, price doesn't matter!"
  → You need a MARKET order

Situation B: "I want to buy, but only if I get a good price"
  → You need a LIMIT order

Situation C: "I already own this stock and I'm scared it might crash"
  → You need a STOP-LOSS order

Situation D: "I want to buy if the price breaks above a certain level"
  → You need a STOP-BUY order

Situation E: "I want a stop-loss but I also want to control the price I get"
  → You need a STOP-LIMIT order
```

Each order type is a TOOL designed for a specific situation. Using the wrong tool is like using a hammer to cut wood — technically possible but you'll get hurt.

---

### 1.2 Market Order

#### Definition

> **Market Order:** An instruction to a broker or exchange to buy or sell a security immediately at the best currently available price. A market order guarantees execution but does not guarantee the execution price. It is the fastest order type and takes liquidity from the order book.

**In simple words:** A Market Order says: "Execute my order IMMEDIATELY at the best available price. I don't care what the exact price is — just get it done NOW."

You are giving up control of PRICE in exchange for guaranteed SPEED.

#### How It Works Inside the Order Book

```
Order book for TCS:
  Ask side (sellers):
    Rs 3,805 | 3,200 shares
    Rs 3,810 | 6,500 shares
    Rs 3,815 | 4,000 shares

You send: "BUY 1,000 shares of TCS at MARKET"

What happens:
  The exchange doesn't add your order to the book.
  Instead, it immediately matches you against the best available sellers.

  → 1,000 shares matched at Rs 3,805 (best ask)
  → TRADE: You buy 1,000 @ Rs 3,805
  → Done instantly. You now own 1,000 shares.
```

#### When Market Orders Get Tricky: Slippage

If your market order is BIGGER than the quantity at the best price, you "walk the book" and get worse prices:

```
You send: "BUY 5,000 shares of TCS at MARKET"

Ask side:
  Rs 3,805 | 3,200 shares  ← not enough for your full order!
  Rs 3,810 | 6,500 shares

Execution:
  3,200 shares @ Rs 3,805 = Rs 1,21,76,000
  1,800 shares @ Rs 3,810 = Rs   68,58,000
  ──────────────────────────────────────────
  5,000 shares total       = Rs 1,90,34,000
  Average price: Rs 3,806.80

You EXPECTED to pay: Rs 3,805.00 (the price you saw on screen)
You ACTUALLY paid:   Rs 3,806.80 (because you ate through the first level)
Difference:          Rs 1.80 per share

This Rs 1.80 difference is called SLIPPAGE.
Total slippage cost: 1.80 × 5,000 = Rs 9,000 extra you paid.
```

#### Extreme Slippage Example (Why Market Orders Can Be Dangerous)

```
Imagine an ILLIQUID stock "XYZ Textiles":
  Ask side:
    Rs 48.00 |    500 shares
    Rs 52.00 |    200 shares
    Rs 58.00 |    100 shares
    Rs 65.00 |  1,000 shares   ← huge gap!

You send: "BUY 800 shares at MARKET"

Execution:
  500 @ Rs 48.00 = Rs 24,000
  200 @ Rs 52.00 = Rs 10,400
  100 @ Rs 58.00 = Rs  5,800
  ─────────────────────────────
  800 shares      = Rs 40,200
  Average price: Rs 50.25

But you expected Rs 48! That's 4.7% slippage.
If you had been patient with a limit order, you could have waited
and bought all 800 at Rs 48 over a few hours.
```

#### Market Order: The Complete Picture

```
┌─────────────────────────────────────────────────────┐
│                  MARKET ORDER                        │
├─────────────────────────────────────────────────────┤
│ What you specify:  Stock + Quantity + Direction      │
│                    (NO price — exchange picks it)    │
│                                                      │
│ What you get:      Immediate execution               │
│                    (or as fast as possible)           │
│                                                      │
│ What you risk:     Slippage (worse price than seen)  │
│                                                      │
│ Best for:          Urgent trades, liquid stocks,     │
│                    small quantities                   │
│                                                      │
│ Worst for:         Illiquid stocks, large quantities,│
│                    volatile moments (earnings, news)  │
│                                                      │
│ Goes to book?:     NO — matches immediately and      │
│                    disappears                         │
└─────────────────────────────────────────────────────┘
```

---

### 1.3 Limit Order

#### Definition

> **Limit Order:** An instruction to buy or sell a security at a specified price or better. A buy limit order will only execute at the limit price or lower; a sell limit order will only execute at the limit price or higher. Limit orders provide price certainty but do not guarantee execution, as the market price may never reach the specified limit.

**In simple words:** A Limit Order says: "Execute my order ONLY at my specified price OR BETTER. If the market isn't at my price, put my order in the book and WAIT."

You are giving up guaranteed SPEED in exchange for control of PRICE.

#### "Or Better" — What Does That Mean?

```
BUY limit at Rs 3,800:
  Fill at Rs 3,800 or LOWER (you want to pay less = better for buyer)
  Will NOT fill at Rs 3,801 or higher

SELL limit at Rs 3,810:
  Fill at Rs 3,810 or HIGHER (you want more money = better for seller)
  Will NOT fill at Rs 3,809 or lower
```

#### How It Works: Scenario A (Limit Order That Matches Immediately)

```
Order book:
  Best Ask: Rs 3,805 | 3,200 shares

You send: "BUY 500 TCS at LIMIT Rs 3,808"

Exchange checks: Is there a seller at Rs 3,808 or lower?
  YES! Best ask is Rs 3,805, which is lower than your limit of Rs 3,808.
  → TRADE: 500 shares at Rs 3,805 (seller's price, NOT your limit!)
  → You got "price improvement" — you were willing to pay 3,808 but got 3,805

Your order never even enters the book. It matched immediately.
This is called an "aggressive" or "marketable" limit order.
```

#### How It Works: Scenario B (Limit Order That Waits in the Book)

```
Order book:
  Best Bid: Rs 3,800 | 5,000 shares
  Best Ask: Rs 3,805 | 3,200 shares

You send: "BUY 500 TCS at LIMIT Rs 3,798"

Exchange checks: Is there a seller at Rs 3,798 or lower?
  NO. Cheapest seller is Rs 3,805.
  → Your order is added to the BID side of the book at Rs 3,798
  → It sits there, waiting for a seller to come down to 3,798

Updated book:
  Best Bid: Rs 3,800 | 5,000 shares
  Rs 3,798: 500 shares (YOUR order)    ← new entry
  Best Ask: Rs 3,805 | 3,200 shares

Your order might fill in 5 minutes, 5 hours, or NEVER.
This is called a "passive" or "resting" limit order.
```

#### How It Works: Scenario C (Partial Fill Then Rest)

```
Order book:
  Best Ask: Rs 3,805 | 300 shares
  Next Ask: Rs 3,810 | 5,000 shares

You send: "BUY 500 TCS at LIMIT Rs 3,805"

Exchange checks: Seller at Rs 3,805 or lower? YES, 300 shares at 3,805.
  → TRADE: 300 shares at Rs 3,805
  → You still need 200 more shares.
  → Next seller is at Rs 3,810. But your limit is 3,805. 3,810 > 3,805.
  → CANNOT match. Your remaining 200 shares go into the book.

Updated book:
  Best Bid: Rs 3,805 | 200 shares (YOUR remaining order) ← new best bid!
  Rs 3,800: 5,000 shares
  Best Ask: Rs 3,810 | 5,000 shares

Your order is now the BEST BID! Anyone selling at market will hit you first.
You got 300 shares immediately, and 200 are waiting.
```

#### Limit Order Subtypes Based on Time

How long should the order live if it doesn't match?

```
DAY order (most common):
  Lives until end of trading day (3:30 PM on NSE).
  If not filled by close → automatically cancelled.

GTC (Good Till Cancelled):
  Lives until YOU cancel it. Could last days or weeks.
  Example: "Buy TCS at Rs 3,500 GTC" — this sits in the book
  for days/weeks until price drops to 3,500 or you cancel it.

IOC (Immediate or Cancel):
  Fill whatever you can RIGHT NOW. Cancel the rest immediately.
  Example: "Buy 500 at Rs 3,805 IOC"
  → 300 available at 3,805 → fill 300 → cancel remaining 200 → done
  → Never rests in the book.

FOK (Fill or Kill):
  Fill the ENTIRE order RIGHT NOW, or cancel the WHOLE thing.
  Example: "Buy 500 at Rs 3,805 FOK"
  → Only 300 available at 3,805 → not enough for full 500 → CANCEL EVERYTHING
  → All-or-nothing. No partial fills.
```

#### The Decision: Market vs Limit Visualized

```
                        MARKET ORDER          LIMIT ORDER
                        ────────────          ───────────
You specify price?      NO                    YES
Execution guaranteed?   YES (if liquid)       NO (might never fill)
Slippage risk?          YES                   NO (but might not fill)
Goes to order book?     NO (instant match)    MAYBE (if no match)
Price control?          NONE                  FULL

When price is moving FAST and you MUST act:    → Market Order
When you have a target price and can WAIT:     → Limit Order
```

#### Limit Order: The Complete Picture

```
┌─────────────────────────────────────────────────────┐
│                  LIMIT ORDER                         │
├─────────────────────────────────────────────────────┤
│ What you specify:  Stock + Quantity + Direction      │
│                    + YOUR PRICE (the limit)          │
│                                                      │
│ What you get:      Your price or better              │
│                    (never worse)                      │
│                                                      │
│ What you risk:     Non-execution (order may never    │
│                    fill if price doesn't reach you)  │
│                                                      │
│ Best for:          Patient traders, specific entry   │
│                    points, illiquid stocks            │
│                                                      │
│ Worst for:         Urgent situations, fast-moving    │
│                    prices where missing the trade     │
│                    costs more than slippage           │
│                                                      │
│ Goes to book?:     YES (if no match available)       │
│                    NO (if matches immediately)        │
└─────────────────────────────────────────────────────┘
```

---

### 1.4 Stop-Loss Order

#### The Problem It Solves

You bought TCS at Rs 3,800. You believe it'll go up. But what if you're WRONG? What if it crashes to Rs 3,500 while you're sleeping?

Without protection, you'd wake up to a Rs 300/share loss. A stop-loss is your insurance policy.

#### Definition

> **Stop-Loss Order (Stop Order):** A conditional order that remains dormant until the market price of a security reaches a specified trigger price (the "stop price"), at which point it is automatically converted into a market order and submitted to the exchange for immediate execution. Stop-loss orders are primarily used as a risk management tool to limit potential losses on an existing position.

**In simple words:** A Stop-Loss Order has two stages:

1. **Stage 1 — Sleeping:** The order is NOT in the order book. It's held by the broker, invisible to the market. It has a **trigger price**.

2. **Stage 2 — Triggered:** When the market price reaches the trigger price, the order "wakes up" and becomes a regular MARKET ORDER, which is immediately sent to the exchange.

```
Stop-Loss = A market order that ACTIVATES only when price hits your trigger.

It's like telling your broker:
"Watch TCS for me. If it drops to Rs 3,600, SELL MY SHARES IMMEDIATELY."
```

#### Step-by-Step Example

```
YOUR SETUP:
  You own 100 shares of TCS, bought at Rs 3,800.
  You set a Stop-Loss: "If TCS drops to Rs 3,600, SELL all 100 shares."
  Trigger price: Rs 3,600

WHAT HAPPENS IN THE MARKET:

Day 1: TCS closes at Rs 3,820 (+20)
  → Stop-loss: Still sleeping. 3,820 > 3,600. Nothing happens.

Day 2: TCS closes at Rs 3,780 (-20 from your buy)
  → Stop-loss: Still sleeping. 3,780 > 3,600. Nothing happens.

Day 3: Bad earnings report. TCS opens at Rs 3,650, drops fast.
  10:15 AM: Price = Rs 3,610
  → Stop-loss: Still sleeping. 3,610 > 3,600.

  10:16 AM: Price = Rs 3,599 (dropped below 3,600!)
  → TRIGGER! Your stop-loss ACTIVATES.
  → A MARKET SELL order for 100 shares is sent to the exchange.
  → Matches against best bid, let's say Rs 3,598.
  → TRADE: You sell 100 shares at Rs 3,598.

RESULT:
  Bought at: Rs 3,800
  Sold at:   Rs 3,598
  Loss:      Rs 202 per share (Rs 20,200 total)

WITHOUT stop-loss:
  Day 4: TCS drops to Rs 3,400
  Your loss would be: Rs 400 per share (Rs 40,000 total)

The stop-loss SAVED you Rs 198 per share (Rs 19,800).
```

#### The Gap Problem (Why Stop-Loss Isn't Perfect)

```
SCENARIO: TCS closes at Rs 3,650 on Friday.
  Your stop-loss trigger: Rs 3,600

WEEKEND: Major scandal breaks. TCS CFO arrested.

MONDAY MORNING: TCS opens at Rs 3,400 (huge gap down!)

  The price NEVER traded at Rs 3,600.
  It jumped from Rs 3,650 → Rs 3,400 overnight.

  Your stop-loss trigger was Rs 3,600.
  At market open, price is already Rs 3,400.
  → TRIGGER activates (price is BELOW 3,600)
  → Market sell order sent
  → Fills at Rs 3,400 (or maybe even lower due to panic selling)

  You expected to sell around Rs 3,600.
  You actually sold at Rs 3,400.
  This Rs 200 gap is called "gap risk" or "slippage through the stop."
```

**Key lesson:** A stop-loss doesn't GUARANTEE you'll sell at the trigger price. It guarantees that when price hits the trigger, a market order is sent. In fast-moving or gapping markets, the fill price can be much worse than the trigger.

---

### 1.5 Stop-Limit Order (Stop-Loss but with Price Control)

#### The Problem with Regular Stop-Loss

As we saw above, a regular stop-loss becomes a market order when triggered. In a fast-moving market, you could get filled at a terrible price far from your trigger.

#### Definition

> **Stop-Limit Order:** A conditional order that combines features of a stop order and a limit order. It specifies two prices: a stop (trigger) price that activates the order, and a limit price that sets the maximum (for buys) or minimum (for sells) acceptable execution price. Unlike a stop-loss order which converts to a market order upon triggering, a stop-limit converts to a limit order, providing price control but not guaranteeing execution.

**In simple words:** A Stop-Limit Order has TWO prices:
1. **Trigger Price (Stop Price):** When market hits this, the order activates.
2. **Limit Price:** The worst price you're willing to accept AFTER activation.

When triggered, instead of becoming a market order, it becomes a LIMIT order.

```
Stop-Loss:       Trigger → Market Order (guaranteed fill, uncertain price)
Stop-Limit:      Trigger → Limit Order  (uncertain fill, controlled price)
```

#### Example

```
You own 100 shares of TCS at Rs 3,800.
You set: Stop-Limit order
  Trigger: Rs 3,600
  Limit:   Rs 3,580

SCENARIO 1 — Normal drop:
  Price gradually drops: 3,650... 3,620... 3,605... 3,599
  → Trigger hit at Rs 3,599!
  → Limit SELL order placed: "Sell 100 at Rs 3,580 or better"
  → Current bid is Rs 3,598 (above your limit of 3,580)
  → TRADE: 100 shares sold at Rs 3,598
  → You're protected. Loss = Rs 202/share.

SCENARIO 2 — Gap down:
  Price gaps from Rs 3,650 to Rs 3,400 overnight.
  → Trigger hit! (price is below 3,600)
  → Limit SELL order placed: "Sell 100 at Rs 3,580 or better"
  → Current bid is Rs 3,400. That's BELOW your limit of 3,580.
  → NO FILL. Your limit order sits in the book at Rs 3,580.
  → Price keeps dropping: 3,350... 3,300... 3,200...
  → Your order NEVER FILLS because no one will pay Rs 3,580.
  → You're STUCK holding shares that are crashing.

This is the trade-off:
  Stop-Loss:  You WILL sell, but maybe at a bad price.
  Stop-Limit: You control the price, but you might NOT sell at all.
```

#### Which Is Safer?

```
For most people: Regular Stop-Loss is safer.

Why? Because the whole POINT of a stop-loss is "GET ME OUT."
If you set a stop-limit and it doesn't fill during a crash,
you've defeated the entire purpose of having protection.

Use Stop-Limit only when:
  - You're worried about slippage but NOT about gap risk
  - The stock is liquid enough that gaps are rare
  - You have a specific worst-case price and would rather
    hold than sell below it
```

---

### 1.6 Stop-Buy Order (The Reverse Stop)

Most people think stop orders are only for selling. But you can also use them for BUYING.

#### Definition

A **Stop-Buy** activates a BUY order when the price RISES to your trigger level.

"Why would you want to buy at a HIGHER price?" — Good question!

#### Use Case: Breakout Trading

```
TCS has been stuck between Rs 3,750 and Rs 3,800 for weeks.
This is called a "range" or "consolidation."

You believe: "If TCS breaks above Rs 3,800, it will shoot up to Rs 4,000."
But you DON'T want to buy if it stays in the range.

Your order: Stop-Buy
  Trigger: Rs 3,805 (just above the range)
  
What happens:
  TCS at Rs 3,790 → Nothing. Sleeping.
  TCS at Rs 3,798 → Nothing. Sleeping.
  TCS at Rs 3,806 → TRIGGERED! Market buy order sent.
  → You buy at approximately Rs 3,806.
  → TCS continues up to Rs 3,900, Rs 3,950, Rs 4,000...
  → You caught the "breakout" without watching the screen all day.

The logic is opposite to stop-loss:
  Stop-Loss Sell: "If it drops to X, sell" (protect from loss)
  Stop-Buy:       "If it rises to X, buy"  (catch the momentum)
```

---

### 1.7 Advanced Order Types (Brief Overview)

These exist on some exchanges and brokers. You don't need to memorize them, but knowing they exist is useful:

```
1. Bracket Order (BO)
   Three orders in one: Entry + Stop-Loss + Target
   "Buy TCS at 3,800. If it drops to 3,700, sell (stop-loss).
    If it goes up to 3,900, sell (profit target)."
   Whichever exit triggers first, the other is cancelled automatically.

2. Trailing Stop-Loss
   A stop-loss that MOVES with the price.
   "Set stop-loss Rs 100 below the highest price reached."
   
   TCS goes: 3,800 → 3,850 → 3,900 → 3,870
   Stop moves: 3,700 → 3,750 → 3,800 → stays 3,800 (doesn't go down)
   
   If TCS drops to Rs 3,800 → TRIGGERED. You sell.
   You locked in Rs 3,800 even though the peak was 3,900.

3. Cover Order (CO)
   A market order with a mandatory stop-loss.
   Broker gives you extra leverage because the stop-loss limits risk.

4. After-Market Order (AMO)
   An order placed after market hours (3:30 PM - 9:15 AM).
   It enters the book when market opens next day.

5. Iceberg Order (Hidden Order)
   A large order that only shows a small "visible" quantity.
   You want to buy 50,000 shares but only show 500 at a time.
   Prevents other traders from seeing your full size and trading against you.
   
   Book shows: BUY 500 at Rs 3,800
   Reality:     BUY 50,000 at Rs 3,800 (hidden)
   Each time 500 fills, another 500 appears. Like an iceberg — 
   only the tip is visible.
```

---

### 1.8 Order Type Decision Tree

```
Do you need to trade RIGHT NOW?
├── YES → Use MARKET ORDER
│         (accept slippage for guaranteed execution)
│
└── NO → Do you have a specific price in mind?
         ├── YES → Use LIMIT ORDER
         │         (wait for your price, may not fill)
         │
         └── NO → Do you want PROTECTION on an existing position?
                  ├── YES → Is gap risk a concern?
                  │         ├── NO → Use STOP-LOSS ORDER
                  │         │        (guaranteed exit, uncertain price)
                  │         │
                  │         └── YES → Use STOP-LIMIT ORDER
                  │                   (controlled price, uncertain exit)
                  │
                  └── Do you want to BUY on a breakout?
                       └── YES → Use STOP-BUY ORDER
                                 (buy only if price rises to trigger)
```

---

## 2. Order Actions (New, Modify, Cancel)

### 2.1 The Lifecycle of an Order

An order is not a one-time event. It has a LIFECYCLE — from creation to completion (or cancellation). Understanding this lifecycle is crucial.

```
┌─────────┐     ┌───────────┐     ┌──────────────────────────┐
│  NEW     │────→│  LIVE     │────→│  Terminal State:          │
│ (Create) │     │ (In Book) │     │  FILLED / CANCELLED /    │
└─────────┘     └───────────┘     │  REJECTED / EXPIRED      │
                     │    ↑        └──────────────────────────┘
                     │    │
                     ↓    │
                ┌───────────┐
                │  MODIFY   │
                │ (Change)  │
                └───────────┘
```

---

### 2.2 Action 1: NEW (Create an Order)

#### Definition

> **New Order (Order Entry):** The act of submitting a fresh buy or sell instruction to the exchange for the first time. A new order is assigned a unique order identifier and, upon acceptance, either matches immediately against existing orders in the book or rests in the order book awaiting a counterparty.

**In simple words:** Sending a brand new instruction to the exchange. This is the first action — without it, nothing else exists.

#### What You Specify When Creating an Order

```
Every new order must include:

REQUIRED FIELDS:
  ┌──────────────┬─────────────────────────────────────┐
  │ Field        │ Example                              │
  ├──────────────┼─────────────────────────────────────┤
  │ Symbol       │ TCS                                  │
  │ Side         │ BUY or SELL                          │
  │ Quantity     │ 100 shares                           │
  │ Order Type   │ MARKET / LIMIT / STOP-LOSS          │
  │ Price        │ Rs 3,800 (required for LIMIT)       │
  │ Trigger      │ Rs 3,600 (required for STOP orders) │
  └──────────────┴─────────────────────────────────────┘

OPTIONAL FIELDS:
  ┌──────────────┬─────────────────────────────────────┐
  │ Field        │ Example                              │
  ├──────────────┼─────────────────────────────────────┤
  │ Time validity│ DAY / GTC / IOC / FOK               │
  │ Disclosed qty│ 500 (for iceberg orders)            │
  │ Product type │ CNC (delivery) / MIS (intraday)     │
  └──────────────┴─────────────────────────────────────┘
```

#### What Happens After You Press "Buy"

```
You click "Buy" on Zerodha:

1. YOUR DEVICE → BROKER SERVER
   Your order goes from your phone/laptop to Zerodha's server.
   Time: ~50-200 milliseconds (depends on your internet)

2. BROKER SERVER → VALIDATION
   Zerodha checks:
   ├── Do you have enough money? (margin check)
   ├── Is the stock valid and trading today?
   ├── Is the price within allowed range? (circuit limits)
   ├── Is the quantity within limits?
   └── Is your account in good standing?
   
   If ANY check fails → ORDER REJECTED (you get an error message)
   Time: ~1-5 milliseconds

3. BROKER SERVER → EXCHANGE
   Zerodha sends your validated order to NSE/BSE.
   Time: ~1-10 milliseconds

4. EXCHANGE → ORDER BOOK
   Exchange receives the order and:
   ├── If matchable → immediately matches → TRADE
   └── If not matchable → adds to order book → OPEN/PENDING
   Time: ~10-50 microseconds (extremely fast)

5. EXCHANGE → BROKER → YOU
   Confirmation sent back to you.
   You see "Order placed" or "Order executed" on your app.
   Total round-trip: ~100-500 milliseconds

TOTAL TIME from click to confirmation: Under 1 second typically.
```

#### Order States After Creation

```
After you create an order, it can be in one of these states:

OPEN / PENDING
  → Order is in the book, waiting for a match.
  → You can still MODIFY or CANCEL it.

PARTIALLY FILLED
  → Part of your order has been executed, rest is still waiting.
  → Example: Ordered 500, got 300, still waiting for 200.
  → You can MODIFY or CANCEL the remaining 200.

FILLED / EXECUTED
  → Your entire order has been matched. A trade happened.
  → NOTHING more can be done. It's done.

CANCELLED
  → You (or the system) cancelled the order before it filled.
  → It's gone. No more action possible.

REJECTED
  → The exchange or broker refused your order.
  → Common reasons: insufficient funds, invalid price, market closed.

EXPIRED
  → A DAY order that wasn't filled by market close.
  → Automatically removed. Same as cancelled.
```

---

### 2.3 Action 2: MODIFY (Amend an Order)

#### Definition

> **Order Modification (Amendment):** The act of changing one or more parameters (price, quantity, or both) of an existing open order that has not yet been fully executed. Most exchanges implement modification as an atomic cancel-and-replace operation, which results in the loss of the order's original time priority in the queue.

**In simple words:** Changing the details of an existing order that is still OPEN (not yet filled). You can change the **price**, the **quantity**, or **both**.

#### The Critical Rule: Modifying Resets Your Time Priority

This is the MOST IMPORTANT thing about modification:

```
YOUR ORIGINAL ORDER:
  BUY 500 TCS at Rs 3,800 — placed at 10:00:00 AM
  Queue position at Rs 3,800: 3rd in line (behind 2 earlier orders)

YOU MODIFY (change price to Rs 3,802):
  The exchange treats this as:
    1. CANCEL the old order (removes from Rs 3,800 queue)
    2. Create a NEW order at Rs 3,802
    3. New timestamp: 10:15:00 AM (the time of modification)

  Your old time priority at 10:00:00 is GONE.
  At Rs 3,802, you're at the BACK of the queue (newest order).

EVEN IF YOU MODIFY ONLY QUANTITY (same price):
  Many exchanges STILL reset your time priority.
  Because changing quantity could be gamed to get unfair advantage.

EXCEPTION: Some exchanges allow "downward" quantity modification
  (reducing quantity) WITHOUT losing time priority.
  Reducing from 500 to 300 keeps your spot in line.
  Increasing from 500 to 700 loses your spot (goes to back).
```

#### When Should You Modify?

```
GOOD reasons to modify:
  ✓ Price moved and your limit is now too far away — adjust closer
  ✓ You want fewer shares than originally ordered — reduce quantity
  ✓ You made an error in the original order

BAD reasons to modify (think twice):
  ✗ You're impatient — maybe just wait
  ✗ Price moved 1 tick — the lost time priority might cost more
  ✗ You want to "chase" the price — often leads to overpaying
```

#### Example: Good Modify

```
BEFORE:
  Your order: BUY 500 TCS at Rs 3,790 (placed 30 min ago, no fills)
  Current market: Best Ask at Rs 3,800, moving up

  Analysis: Price isn't coming down to 3,790. You still want to buy.

MODIFY: Change to BUY 500 TCS at Rs 3,798
  → Old order at 3,790 cancelled
  → New order at 3,798 placed
  → Much closer to market, higher chance of filling
```

#### Example: Bad Modify (Chasing)

```
BEFORE:
  Your order: BUY 500 TCS at Rs 3,800

  Price starts running up:
  10:00 — Ask at Rs 3,805. You modify to Rs 3,805.
  10:01 — Ask at Rs 3,808. You modify to Rs 3,808.
  10:02 — Ask at Rs 3,812. You modify to Rs 3,812.
  10:03 — Fill at Rs 3,812.

  You ended up paying Rs 3,812 instead of Rs 3,800.
  Each modify lost time priority AND chased a higher price.
  
  Better approach: Either use a MARKET ORDER (accept the current price)
  or KEEP your limit at Rs 3,800 and be patient.
```

---

### 2.4 Action 3: CANCEL

#### Definition

> **Order Cancellation:** The act of withdrawing an open (unfilled or partially filled) order from the exchange's order book before it is fully executed. Upon successful cancellation, the order ceases to exist in the matching engine. Any previously executed partial fills remain valid and irreversible; only the unfilled remainder is cancelled.

**In simple words:** Removing your order from the book completely. "Never mind, I don't want to buy/sell anymore." After cancellation, the order is gone and has no effect.

#### What Happens When You Cancel

```
Your order: BUY 500 TCS at Rs 3,800 — sitting in the book

You click "Cancel":

1. Cancel request sent from your device to broker
2. Broker forwards cancel to exchange
3. Exchange finds your order in the book
4. Exchange removes it from the Rs 3,800 bid queue
5. Confirmation sent back: "Order cancelled"

Total time: ~100-500 milliseconds (same as placing an order)
```

#### Can You ALWAYS Cancel?

```
YES, you can cancel if:
  ✓ Order is OPEN (in the book, waiting)
  ✓ Order is PARTIALLY FILLED (cancel the remaining unfilled portion)

NO, you CANNOT cancel if:
  ✗ Order is already FULLY FILLED (it's done, trade happened)
  ✗ Order is already CANCELLED or EXPIRED (nothing to cancel)
  ✗ Order is in the process of being matched (microsecond timing issue)
```

#### The Race Condition: Cancel vs Fill

This is subtle but important:

```
Your order: SELL 500 TCS at Rs 3,800 — in the book
A buyer sends a market buy that will match your order.

SIMULTANEOUSLY, you click "Cancel."

Two messages are now racing to the exchange:
  Message 1: The buyer's order (wants to match with yours)
  Message 2: Your cancel request

If Message 1 arrives first:
  → Your order is MATCHED → TRADE happens → You sold 500 shares
  → Your cancel arrives but the order no longer exists
  → Cancel FAILS with "order already filled"
  → You're stuck with the trade (you sold even though you tried to cancel)

If Message 2 arrives first:
  → Your order is CANCELLED → removed from book
  → The buyer's order has no one to match against (your order is gone)
  → Cancel SUCCEEDS

This race happens in microseconds. You have no control over the outcome.
This is called a "cancel-fill race" and it's a real thing traders deal with.
```

#### Cancelling a Partial Fill

```
Your order: BUY 500 TCS at Rs 3,800
  200 shares already filled (you own 200 shares now)
  300 shares still waiting in the book

You cancel:
  → The 300 remaining shares are removed from the book
  → The 200 shares you already got? Those STAY. That trade is done.
  → Your final position: 200 shares of TCS (not the 500 you originally wanted)
```

---

### 2.5 Order Action Summary

```
┌─────────┬───────────────────────────────────────────────────────┐
│ Action  │ What it does                                          │
├─────────┼───────────────────────────────────────────────────────┤
│ NEW     │ Creates an order. It enters the book or matches.      │
│         │ This is the starting point of everything.             │
├─────────┼───────────────────────────────────────────────────────┤
│ MODIFY  │ Changes price/qty of an OPEN order.                   │
│         │ WARNING: Resets time priority (back of queue).        │
│         │ Exchange treats it as: Cancel old + Create new.       │
├─────────┼───────────────────────────────────────────────────────┤
│ CANCEL  │ Removes an OPEN order from the book.                  │
│         │ Cannot undo a trade that already happened.            │
│         │ Might fail if order fills simultaneously (race).      │
└─────────┴───────────────────────────────────────────────────────┘

The lifecycle:
  NEW → [OPEN] → MODIFY (optional, repeatable) → FILL or CANCEL or EXPIRE
```

---

## 3. Orders vs Trades: The Critical Distinction

### 3.1 Why This Distinction Matters

This is one of the most common sources of confusion for beginners. Many people say "I traded TCS" when they mean "I placed an order for TCS." These are NOT the same thing.

Getting this wrong can lead to real problems:

```
DANGER SCENARIO:
  You place a LIMIT BUY for 1,000 shares at Rs 3,800.
  You see the order confirmation and think "I own 1,000 shares now."
  You go about your day.
  
  But the order is just sitting in the book — it hasn't filled.
  TCS goes from Rs 3,810 to Rs 3,900. Your limit at Rs 3,800 never executes.
  
  You missed a Rs 100/share opportunity (Rs 1,00,000) because you confused
  an ORDER (intention) with a TRADE (execution).
```

---

### 3.2 Order = Intention, Trade = Execution

> **Order:** An instruction submitted by a market participant to an exchange or broker to buy or sell a specified quantity of a security, optionally at a specified price. An order represents an intent to transact and may or may not result in execution. Orders are mutable (can be modified or cancelled) until fully filled.

> **Trade (Execution / Fill):** The completed transaction that occurs when a buy order is matched with a sell order by the exchange's matching engine. A trade represents an irrevocable transfer of securities and funds between counterparties. Trades generate a unique trade identifier, are recorded in the exchange's trade log, and are subject to settlement and regulatory reporting.

**In simple words:**

```
ORDER = What you WANT to happen
  "I want to buy 100 shares at Rs 3,800"
  Like ordering food — you've told the waiter, but it hasn't arrived.

TRADE = What ACTUALLY happened
  "100 shares were bought at Rs 3,800"
  Like receiving the food — it's on your table, you can eat it.
```

---

### 3.3 Detailed Comparison

```
┌────────────────────┬─────────────────────┬────────────────────────┐
│ Aspect             │ ORDER               │ TRADE                  │
├────────────────────┼─────────────────────┼────────────────────────┤
│ What is it?        │ An instruction      │ A completed            │
│                    │ (request)           │ transaction            │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Guaranteed?        │ NO. It might not    │ YES. It already        │
│                    │ execute.            │ happened.              │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Money moves?       │ Not yet. Money is   │ YES. Money is debited  │
│                    │ "blocked" / held.   │ or credited.           │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Shares move?       │ Not yet.            │ YES. Shares transfer   │
│                    │                     │ to/from your account.  │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Can be cancelled?  │ YES (if still open) │ NO. Done is done.      │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Can be modified?   │ YES (if still open) │ NO. Done is done.      │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Visible in         │ YES (if it's a      │ Shows up in "trade     │
│ order book?        │ resting limit)      │ history" / "executions"│
├────────────────────┼─────────────────────┼────────────────────────┤
│ You have control?  │ YES (modify/cancel) │ NO (irreversible)      │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Unique ID          │ Order ID            │ Trade ID               │
│                    │ (assigned on        │ (assigned on           │
│                    │  creation)          │  execution)            │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Tax implications?  │ NONE (no event      │ YES. Capital gains     │
│                    │ happened)           │ tax may apply.         │
├────────────────────┼─────────────────────┼────────────────────────┤
│ Settlement?        │ N/A                 │ T+1 in India           │
│                    │                     │ (trade + 1 business    │
│                    │                     │  day for shares to     │
│                    │                     │  appear in demat)      │
└────────────────────┴─────────────────────┴────────────────────────┘
```

---

### 3.4 One Order Can Produce Multiple Trades

This catches people off guard. A single order can result in multiple trades:

```
Your order: BUY 5,000 TCS at MARKET

Ask side of book:
  Rs 3,805 | 2,000 shares (from 8 different sellers)
  Rs 3,806 | 1,500 shares (from 5 sellers)
  Rs 3,807 | 2,000 shares (from 10 sellers)

Result: ONE order, but potentially 23 individual trades:
  Trade 1:  200 shares @ 3,805 (from seller A)
  Trade 2:  300 shares @ 3,805 (from seller B)
  Trade 3:  150 shares @ 3,805 (from seller C)
  ... and so on
  Trade 20: 400 shares @ 3,807 (from seller X)
  Trade 21: 100 shares @ 3,807 (from seller Y)
  ... etc.

Your ORDER is one entry.
Your TRADES are 23 entries.
Your brokerage app shows: "Order filled" with an average price.
But behind the scenes, 23 separate transactions happened.
```

---

### 3.5 Multiple Orders Can be Part of One Strategy

And the inverse — one trading IDEA might involve multiple orders:

```
Your strategy: "Buy TCS and set protection"

Order 1: BUY 100 TCS at Rs 3,800 (LIMIT)
Order 2: SELL 100 TCS at Rs 3,600 (STOP-LOSS — protection)
Order 3: SELL 100 TCS at Rs 4,000 (LIMIT — profit target)

Three separate orders, working together.
When Order 1 fills → Order 2 and 3 are active.
If price goes to 4,000 → Order 3 fills (profit!) → Cancel Order 2.
If price drops to 3,600 → Order 2 triggers (loss limited) → Cancel Order 3.
```

This manual linking of related orders is what Bracket Orders (mentioned earlier) automate.

---

### 3.6 The Order-Trade Flow Visualized

```
                    YOU
                     │
                     ▼
              ┌──────────────┐
              │ Place ORDER   │  "BUY 100 TCS at Rs 3,800"
              └──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Broker       │  Validates: funds, limits, rules
              │ Validates    │
              └──────────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
        REJECTED      ACCEPTED
        (error)       (sent to exchange)
                          │
                          ▼
                   ┌──────────────┐
                   │ Exchange     │  Matching engine checks book
                   │ Processes    │
                   └──────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
         NO MATCH    PARTIAL       FULL
         (rests in   MATCH         MATCH
          book)      │             │
              │       │             │
              │       ▼             ▼
              │    ┌────────┐  ┌────────┐
              │    │TRADE(s)│  │TRADE(s)│
              │    │created │  │created │
              │    │+ rest  │  │        │
              │    │in book │  │        │
              │    └────────┘  └────────┘
              │       │             │
              ▼       ▼             ▼
         ┌──────────────────────────────┐
         │ Your broker app shows:       │
         │  - Order status (open/filled)│
         │  - Trade confirmations       │
         │  - Updated portfolio         │
         └──────────────────────────────┘
```

---

### 3.7 Real-World Analogy: Amazon Order vs Delivery

This analogy makes it crystal clear:

```
AMAZON ANALOGY:

"Order" on Amazon = "Order" in stock market
  You clicked "Buy Now" for a laptop.
  → Money is blocked (not yet charged permanently)
  → The laptop hasn't arrived yet
  → You CAN cancel the order (if it hasn't shipped)
  → You DON'T have the laptop

"Delivery" on Amazon = "Trade" in stock market
  The laptop arrived at your door. You signed for it.
  → Money is permanently charged
  → You HAVE the laptop in your hands
  → You can't "cancel" the delivery (you'd need a return/refund)
  → It's done

"Pending" on Amazon = "Open Order" in stock market
  Your order is placed but the laptop hasn't shipped.
  → Still cancellable
  → Status: "Processing"

"Shipped" ≈ "Partially Filled"
  It's on the way. Part of the process is done.
  Cancellation gets harder.

"Out of stock" = "Order not filled"
  Amazon: "Sorry, this item is currently unavailable."
  Stock market: "No seller at your price. Order sits in book."
```

---

### 3.8 The Settlement Process (What Happens AFTER a Trade)

When a trade happens, the shares and money don't transfer INSTANTLY. There's a settlement process:

```
T+1 SETTLEMENT (India, since January 2023):

Day T (Trade Day): Monday
  You buy 100 TCS at Rs 3,800.
  → TRADE happens at 10:30 AM Monday
  → Your broker app shows: "+100 TCS shares" immediately
  → BUT these shares are not officially in your demat account yet
  → Money is blocked from your bank account

Day T+1 (Settlement Day): Tuesday
  → The official settlement happens
  → Shares are transferred from seller's demat to YOUR demat
  → Money is transferred from your bank to seller's bank
  → Now you're the legal owner of those shares
  → You can sell them anytime from Tuesday onward

Different countries have different settlement cycles:
  India:  T+1 (one business day)
  USA:    T+1 (changed from T+2 in May 2024)
  China:  T+1 for some, T+0 for others
  UK:     T+2 still (moving to T+1 in 2027)

WHAT IF you sell BEFORE settlement?
  This is called "BTST" (Buy Today, Sell Tomorrow) in India.
  You can do it, but there's a small risk:
  If the seller fails to deliver (very rare), your sale also fails.
```

---

## 4. Putting It All Together: Complete Example

Let's trace a COMPLETE real-world scenario combining everything from this chapter:

```
═══════════════════════════════════════════════════════
  PRIYA'S COMPLETE TRADING SESSION — March 31, 2026
═══════════════════════════════════════════════════════

BACKGROUND:
  Priya has Rs 5,00,000 in her Zerodha account.
  She wants to buy TCS because she thinks earnings will be good.
  Current TCS price: Rs 3,810 (Best Bid 3,808, Best Ask 3,812)

─────────────────────────────────────────────────────
10:00 AM — ORDER 1: NEW (Limit Buy)
─────────────────────────────────────────────────────
  "BUY 100 TCS at LIMIT Rs 3,800"
  
  Exchange: Best Ask is 3,812. Priya's limit is 3,800. No match.
  → Order enters the book at Rs 3,800
  → Status: OPEN
  → Money blocked: Rs 3,80,000
  → Remaining cash: Rs 1,20,000

  She sits and waits.

─────────────────────────────────────────────────────
10:45 AM — Market dips on some news
─────────────────────────────────────────────────────
  TCS drops: 3,810 → 3,805 → 3,802 → 3,800!
  
  A seller hits the Rs 3,800 level.
  Queue at 3,800: [Buyer_X (200), Buyer_Y (500), PRIYA (100)]
  
  Seller sells 750 shares at market:
    Buyer_X: 200 filled at 3,800
    Buyer_Y: 500 filled at 3,800
    Priya: 50 filled at 3,800 (only 50 left from the 750!)
  
  → TRADES: Priya gets 50 shares at Rs 3,800
  → Status: PARTIALLY FILLED (50 of 100)
  → Her remaining 50 shares sit in the book

─────────────────────────────────────────────────────
10:50 AM — ORDER 1: More fills trickle in
─────────────────────────────────────────────────────
  Another seller sells 200 at market.
  Priya is now first in queue at Rs 3,800.
  → 50 more shares filled at Rs 3,800
  → Status: FULLY FILLED
  → TRADE complete: 100 shares at Rs 3,800 (in 2 separate trades)

  Priya now owns 100 shares of TCS.
  Her cost: 100 × Rs 3,800 = Rs 3,80,000
  Cash remaining: Rs 1,20,000

─────────────────────────────────────────────────────
10:55 AM — ORDER 2: NEW (Stop-Loss)
─────────────────────────────────────────────────────
  "Set STOP-LOSS: If TCS drops to Rs 3,700, SELL 100 shares"
  
  Trigger: Rs 3,700
  → Order is NOT in the book (sleeping, watched by broker)
  → Status: TRIGGER PENDING

─────────────────────────────────────────────────────
11:30 AM — Good news: analyst upgrades TCS
─────────────────────────────────────────────────────
  TCS rallies: 3,800 → 3,820 → 3,850 → 3,870
  
  Priya's position: +100 shares at 3,800. Current price: 3,870.
  Unrealized profit: (3,870 - 3,800) × 100 = Rs 7,000

  She wants to lock in some profit.

─────────────────────────────────────────────────────
11:35 AM — ORDER 2: MODIFY (Update Stop-Loss)
─────────────────────────────────────────────────────
  "Change my stop-loss trigger from Rs 3,700 to Rs 3,830"
  
  Old trigger: Rs 3,700 (would have locked Rs 100/share loss)
  New trigger: Rs 3,830 (locks in Rs 30/share PROFIT minimum!)
  
  Even if TCS crashes, she'll sell at around Rs 3,830.
  Guaranteed minimum profit: 30 × 100 = Rs 3,000

─────────────────────────────────────────────────────
2:00 PM — ORDER 3: NEW (Limit Sell — Profit Target)
─────────────────────────────────────────────────────
  "SELL 100 TCS at LIMIT Rs 3,900"
  
  Current price: Rs 3,865. Her target is Rs 3,900.
  → Order enters the book on the ASK side at Rs 3,900
  → Status: OPEN

  Now Priya has TWO exit orders:
    - Stop-loss at Rs 3,830 (protection)
    - Limit sell at Rs 3,900 (profit target)
  Whichever hits first wins. She needs to manually cancel the other.

─────────────────────────────────────────────────────
2:45 PM — TCS reaches Rs 3,900!
─────────────────────────────────────────────────────
  A buyer places a market buy that matches Priya's sell at Rs 3,900.
  → TRADE: 100 shares sold at Rs 3,900
  → Status: FULLY FILLED

  Priya's result:
    Bought: 100 × Rs 3,800 = Rs 3,80,000
    Sold:   100 × Rs 3,900 = Rs 3,90,000
    Profit: Rs 10,000 (before brokerage and taxes)

─────────────────────────────────────────────────────
2:46 PM — ORDER 2: CANCEL (Stop-Loss no longer needed)
─────────────────────────────────────────────────────
  "Cancel my stop-loss order"
  
  She already sold her shares at 3,900. The stop-loss at 3,830
  is no longer needed (she has no TCS shares to protect).
  → Stop-loss cancelled. Status: CANCELLED

─────────────────────────────────────────────────────
3:30 PM — MARKET CLOSES
─────────────────────────────────────────────────────
  
  PRIYA'S DAY SUMMARY:
  ┌─────────────────────────────────────────────────┐
  │ Orders placed:      3 (1 buy, 1 stop-loss, 1 sell)
  │ Orders modified:    1 (stop-loss trigger raised)
  │ Orders cancelled:   1 (stop-loss after selling)
  │ Trades executed:    3 (2 buy fills + 1 sell fill)
  │ Gross profit:       Rs 10,000
  │ Brokerage:          Rs 40 (Rs 20 per order on Zerodha)
  │ STT + other taxes:  ~Rs 390
  │ Net profit:         ~Rs 9,570
  │ Return on capital:  2.52% in one day
  └─────────────────────────────────────────────────┘
```

---

## Key Takeaways

```
1. ORDER TYPES exist because different situations need different tools:
   - Market: speed over price
   - Limit: price over speed
   - Stop-Loss: automatic protection
   - Stop-Limit: protection with price control

2. ORDER ACTIONS are the three things you can do:
   - NEW: create it
   - MODIFY: change it (but you lose your place in line!)
   - CANCEL: remove it

3. ORDERS ≠ TRADES:
   - Order = what you WANT to happen (cancellable, modifiable)
   - Trade = what ACTUALLY happened (permanent, irreversible)
   - One order can create zero, one, or many trades
   - Always check if your order was FILLED, not just PLACED

4. The lifecycle:
   NEW → OPEN → [MODIFY] → FILLED / CANCELLED / EXPIRED
                              ↓
                           TRADE(s) created (permanent record)
```

---

*Next up: Part 3 — Exchange Infrastructure (Matching Engine, Building a Paper Trading Engine)*
