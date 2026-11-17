# Hisaab — Build Projects (Freedom With AI)

Source: https://dashboard.freedomwithai.com/redesign/v3/projects
Extracted: 2026-11-17

> "Pick one of two projects, build it your way, and send your live link. Top three in each project win."

## One-line pitch

A simple digital ledger for a local shop, like the notebook a kirana keeps for who owes what, with a WhatsApp reminder in one tap.

Design, layout, extras and feel are yours to decide. That is how every submission stays your own.

## What it must do

1. Add a customer with a name and a 10 digit phone number.
2. Add an entry for a customer: **credit** (the shop gave goods) or **payment** (the customer paid), with amount, date and a short note.
3. Show each customer's balance (all credit minus all payments) and the shop's **total outstanding** at the top.
4. A customer page lists that customer's entries, **newest first**.
5. A payment can have a **screenshot attached**. It shows as a small picture on the entry.
6. A **WhatsApp reminder button** per customer, with the customer's name and the balance in rupees in the message.
7. **Data is still there after a reload.** Browser storage is fine, no database needed.
8. An **import box** that loads a JSON file in the format of the sample data. The tester loads a different shop through it.
9. Works well on a phone, **375 px wide**. The shop owner uses it on a phone.

**Hisaab needs no AI.** Plain code and browser storage are enough.

## How we check (exact DOM contract)

After the deadline, the AI tester opens your live link and reads these exactly. Copy them as they are.

| Check | Requirement |
|---|---|
| Total outstanding | `#total-outstanding`, the text contains the number, e.g. `11820` or `Rs 11,820` |
| One row per customer | `[data-customer="<phone>"]`, with the balance inside `[data-balance]` |
| WhatsApp reminder link | `a[data-remind="<phone>"]`, the link is `https://wa.me/91<phone>?text=<message>` |
| Import | a text area `#import-box` and a button `#import-go`. The tester pastes the JSON and presses the button |
| Payment screenshot | a file input `#shot-input` on the payment form. After saving, the entry shows `img[data-shot]` |
| Today's date | if you add anything that depends on the date, honour `?today=2026-11-15` in the URL |

## Bonus menu, 5 marks each (at most 6 items count)

- Overdue list, sorted by days since last payment
- Edit and delete an entry, with balances recalculated
- CSV export that matches your data
- Search by name or phone
- A UPI pay link in the reminder (`upi://pay?pa=...&am=...`)
- Hindi or Telugu labels
- Reading the amount from the payment screenshot

## How you are scored (100 marks, ranked within the project)

| Marks | What |
|---|---|
| 60 | **Hidden-data test** — tester runs a different set of data through your live link and checks the numbers it gets back |
| 30 | **Bonus menu** — 5 marks per item, at most 6 items; decided by a script or screenshot check, not taste |
| 10 | **Phone and light/dark** — no sideways scroll at 375 px (5), readable in both light and dark (5) |

Ties: the earlier submission wins.

## Sample data

- `sample-data.json` — the sample shop (all names and phone numbers are made up). Load it through your import box.
  - 8 customers, 38 entries, shop name "Lakshmi Provision Store (fictional)".
  - Schema: `{ shop, customers: [{name, phone}], entries: [{phone, type: credit|payment, amount, date, note}] }`
- `sample-expected.json` — the numbers you should see after loading the sample.

```json
{
  "today": "2026-11-15",
  "total_outstanding": 11820,
  "balances": {
    "9000000107": 250,
    "9000000104": 1260,
    "9000000103": 2810,
    "9000000106": 2830,
    "9000000105": 230,
    "9000000102": 3470,
    "9000000101": 670,
    "9000000108": 300
  },
  "top_defaulter_phone": "9000000102",
  "customers_with_balance": 8
}
```

## Submission

Live link required, submitted by **Sunday 22 Nov 2026, 10:00 am IST**. One submission per member, editable later. Optional notes/test logins can be added for judges only.

## Contest-wide rules

- Deadline: **Sunday 22 Nov 2026, 10:00 am IST**.
- Nothing is graded now; all submissions are collected first, then graded together after the deadline.
- 100 marks per project, ranked within that project.

### Prizes — top three in each project (six winners total)

1. Dinner with Animesh in Hyderabad, worth about Rs 50,000 (virtual coffee if you cannot come).
2. A Rs 10,000 Diamond coupon (about $110), usable within 14 days on the Black Friday Diamond deal.
3. Your award, on stage.
