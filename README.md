# Lead CRM

A simple lead tracker for social-media and referral leads. Add a lead, move it
through the pipeline, log notes, and see where the funnel is leaking.

Everything runs on your own machine. There is no login, no cloud account, and
no internet connection required after setup. All data lives in a single file
called `dev.db` in the project folder.

---

## Part 1 — Setup

### Before you start

You need **Node.js version 20.9 or newer**.

Check what you have by opening a terminal (Command Prompt or PowerShell on
Windows, Terminal on Mac) and running:

```bash
node -v
```

If you see something like `v20.9.0` or higher (`v22`, `v24`…), you're set. If
the command isn't found or the number is lower, install the **LTS** version
from [nodejs.org](https://nodejs.org), then close and reopen your terminal.

### The easy way (recommended)

The project ships with a database already filled with ~50 example leads, so
there is nothing to set up beyond installing the code's dependencies.

**1. Open a terminal in the project folder.**

- **Windows:** open the `lead-crm` folder in File Explorer, click the address
  bar, type `powershell`, and press Enter.
- **Mac:** right-click the `lead-crm` folder → Services → New Terminal at Folder.

> **Windows — unzip somewhere short,** like `C:\Projects\lead-crm`. Buried
> inside a long OneDrive or Documents path, Windows' 260-character path limit
> makes the app return 404 on every page with no useful error.

**2. Install the dependencies.** Run this once. It takes a few minutes and
prints a lot of text — that's normal.

```bash
npm install
```

**3. Start the app.**

```bash
npm run dev
```

**4. Open the app.** Wait for the terminal to print `Ready`, then open
**<http://localhost:3000>** in your browser.

> The very first page you visit takes 30–60 seconds to appear while the app
> builds itself. This happens once. Every page after that loads instantly.

**To stop the app:** click the terminal window and press `Ctrl + C`.
**To start it again later:** just `npm run dev`. You don't need to reinstall.

---

### The alternate way — start with a fresh, empty database

Use this if you want to build the database yourself, if you'd rather start with
your own leads instead of the examples, or if the included `dev.db` is missing
or has been damaged.

**1. Create the settings file.** Copy `.env.example` to a new file named `.env`
in the same folder.

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

**2. Install dependencies** (skip if you already did this):

```bash
npm install
```

**3. Build the database.** This creates the tables and fills them with ~50
example leads:

```bash
npm run db:setup
```

To get a **completely empty** database instead — no example leads at all —
delete the `dev.db` file, then run:

```bash
npx prisma migrate deploy
```

**4. Start the app:**

```bash
npm run dev
```

Then open **<http://localhost:3000>**.

---

### Starting over

To wipe everything and go back to the ~50 example leads:

```bash
npm run db:reset
```

This deletes all leads and notes you've added. There is no undo — export a CSV
first if you want to keep anything.

---

### If something goes wrong

| What you see | What to do |
|---|---|
| The page loads but nothing is clickable — search, dropdowns, and buttons do nothing | You're using the wrong address. Use `http://localhost:3000`, **not** `http://127.0.0.1:3000`. The app blocks the second one in development. |
| `Error: listen EADDRINUSE: address already in use :::3000` | The app is already running in another terminal window. Either use that one, or run it on a different port: `npx next dev -p 3001`, then open `http://localhost:3001`. |
| `'npm' is not recognized` / `command not found: npm` | Node.js isn't installed, or the terminal was open before you installed it. Install from [nodejs.org](https://nodejs.org), then close and reopen the terminal. |
| The first page takes a very long time | Normal on the first visit — up to a minute. If it's still spinning after ~3 minutes, press `Ctrl + C`, delete the `.next` folder, and run `npm run dev` again. |
| `PrismaClientInitializationError` or errors mentioning `dev.db` | The database is missing. Follow **The alternate way** above. |
| Pages render but every list is empty | The database is empty. Run `npm run db:setup`. |
| **Windows:** every page shows "404 — This page could not be found", even the home page | The project folder is nested too deeply. Windows caps file paths at 260 characters and the build files quietly fail to write. Move the whole `lead-crm` folder somewhere short — `C:\Projects\lead-crm` or `C:\lead-crm` — delete the `.next` folder, and run `npm run dev` again. |

---

## Part 2 — Using the app

There are five things you can do: **find** a lead, **work** the pipeline,
**open** a lead, **read** the dashboard, and **export** to CSV. The top bar
links to all of them.

### The lead pipeline: seven stages

Every lead sits in exactly one stage. The first five are the funnel, in order.
The last two are outcomes.

| Stage | Meaning |
|---|---|
| **New** | Just came in. Nobody has contacted them yet. |
| **Contacted** | You've reached out. Waiting to hear back. |
| **Qualified** | They're a real fit — right need, right budget. |
| **Proposal Sent** | They have your quote or proposal. |
| **Negotiation** | Talking terms, price, or timing. |
| **Won** ✅ | Closed. They bought. |
| **Lost** ❌ | Closed. They didn't. You can record a reason. |

### Home — find a lead fast

The search box matches on **name, phone, email, campaign, interest, or owner** —
so "Instagram Reel Ad", "Priya", and "+1206" all work as searches. Results appear
as you type; click one to jump straight to that lead. It shows the **8 most
recently updated** matches, so narrow the text if what you want isn't there.

Below the search box are four counters. Each is a link:

- **Total Leads** — everything in the system → opens the Pipeline
- **Open** — everything not yet Won or Lost → opens the Dashboard
- **Overdue Follow-ups** — leads whose follow-up date has already passed
- **Won** — closed-won leads

### Pipeline — the working board

This is where day-to-day work happens. Two views, toggled at the top left:

**Pipeline view** (the default) shows a column per stage. Each card shows the
lead's name, estimated value, source, an owner initials badge, and a small
progress bar showing how far along the funnel they've travelled.

**Table view** shows the same leads as a sortable-looking list with name,
source, stage, priority, owner, value, and next follow-up date.

**Filters** narrow both views, and they stack:

- **Source row** (top right) — Instagram, Facebook, LinkedIn, Google Ads,
  Referral, Other
- **Lifecycle row** (below) — filter to a single stage

Click **All sources** / **All stages** to clear them.

**To move a lead to another stage,** use the small dropdown at the bottom of
its card and pick the new stage. It saves immediately — there's no Save button.
If you pick **Lost**, a box pops up asking why; type a short reason or leave it
blank. Every stage change is recorded in that lead's timeline automatically.

### Lead detail — one lead, everything about it

Click any lead's name to open it. The page has three parts:

**Lead Details** (left) — the editable record. Change anything and click
**Save Changes**:

| Field | Notes |
|---|---|
| Name | Required |
| Phone, Email | Optional |
| Source | Where the lead came from |
| Campaign / Ad / Post | The specific ad, post, or referral partner |
| Interest / Product | What they're asking about |
| Estimated Value ($) | Numbers only — feeds the "Won value" total |
| Owner | Whoever's handling it. Type the name consistently — the dashboard groups by exact spelling, so "Priya" and "Priya Anand" count as two people. |
| Priority | Low / Medium / High |
| Next Follow-up | A date. Once it's in the past, the lead shows up under Overdue Follow-ups. |

**Add Note** (right) — log a call, a reply, next steps. Notes are timestamped
and can't be edited or deleted afterwards.

**Activity Timeline** (right, below) — every note and every stage change, newest
first. This is the lead's history.

**Stage dropdown and Delete** sit at the top right. Delete removes the lead and
its entire history permanently — there's no confirmation and no undo.

### Add Lead

The **+ Add Lead** button in the top bar. Only **Name** is required; fill in
what you know. New leads start in the **New** stage. After saving you land on
the lead's detail page.

### Dashboard — how the funnel is doing

Four numbers across the top:

- **Total Leads**
- **Open** — not yet Won or Lost
- **Win Rate (closed)** — Won ÷ (Won + Lost). Open leads are excluded, so this
  answers "of the deals we finished, how many did we win?"
- **Avg. Days to Close** — for **Won** leads only, the average days between when
  the lead was created and when it was last updated. Lost leads aren't counted.

Then three charts:

- **Leads by Stage** — how many sit in each stage, plus total **Won value** in
  dollars. Click a bar to see those leads in the Pipeline.
- **Leads by Source** — which channels are actually producing. Click a bar to
  filter the Pipeline to that source.
- **Leads by Person, by Stage** — one row per owner, split into coloured
  segments by stage. Long green segment = closing well. Long red = losing a lot.

At the bottom, **Overdue Follow-ups** lists every **open** lead whose follow-up
date has passed, oldest first. Won and Lost leads are never chased. This is the
daily to-do list.

### Export CSV

**Export CSV** in the top bar downloads every lead as a spreadsheet file —
name, phone, email, source, campaign, interest, value, owner, priority, stage,
lost reason, follow-up date, and created date. Opens in Excel, Numbers, or
Google Sheets. Use it for reporting or as a backup before a reset.

---

## Good to know

- **No login.** Anyone who can open the page has full access, including delete.
- **One machine at a time.** This runs locally. Two people running it on their
  own laptops have two completely separate sets of leads — nothing syncs.
- **Your data is one file.** Everything lives in `dev.db` in the project folder.
  To back it up, copy that file somewhere safe. To move your work to another
  computer, copy `dev.db` across. To hand the whole thing to someone else,
  send them the project folder without `node_modules`.
- **Deleting is permanent.** Deleting a lead or running `npm run db:reset`
  cannot be undone. Export a CSV first.
- **Development mode.** `npm run dev` is meant for local use, not for putting
  on the internet.
