# SmartPresence — Lecturer Side UI Documentation

> Design system reference: **Academic Gold / Minimal Academic Corporate**
> Typefaces: **Playfair Display** (titles) · **Lato** (all functional content)
> Core accent: `#F6A242` · Background: `#FDFDFD` · Surface: `#FFFFFF`

---

icon path - assets\icons

font path - assets\font

animated icon for radar page - assets\animated-icons

## Navigation Bar

The lecturer app uses a persistent bottom navigation bar present on every screen.

**Visual Treatment**

- Background: `#FDFDFD` (Primary Background)
- Active item icon + label: `#F6A242` (Primary Accent gold)
- Inactive item icon + label: `#BAC0BE` (Secondary Text)
- Font: Lato, Caption weight (500), 12px

**Tab Items (left → right)**

| Tab | Icon     | Label                           |
| --- | -------- | ------------------------------- |
| 1   | House    | Home                            |
| 2   | roster   | Roster                          |
| 3   | Radar    | *(Mark Attendance — icon only)* |
| 4   | Bell     | Alert                           |
| 5   | Settings | Settings                        |

The active tab indicator uses the gold `#F6A242` across icon, label, and any underline/dot indicator. The "Schedule" tab appears active in the Roster screen, confirming that the Roster page lives under the Schedule tab.

---

## Screen 1 — Home

### Purpose

The dashboard landing screen. Gives the lecturer an immediate overview of their day: what sessions are scheduled and how attendance is tracking across those sessions.

### Layout Structure

**Header Row**

- Left: Greeting text — `"Hello {Name}!"` — Playfair Display, H1 (700, 36px), color `#3C3D48`
- Right: Circular avatar placeholder — full-radius (`border-radius: 9999px`), filled with `#E8E8E7` (Secondary Surface tier 2), diameter ~56px

**Section 1 — Today's Schedule**

- Section heading: `"Today's schedule"` — Playfair Display, H2 (600, 24px), `#3C3D48`
- Container: Standard Card — `#FFFFFF` background, `1px solid #E8E8E7` border, `12px` radius
- Each schedule row: two-column layout
  - Left: `{subject_name}` — Lato, Body Medium (14px, 400), `#3C3D48`
  - Right: `{time}` — Lato, Body Medium (14px, 400), `#3C3D48`
- Four schedule rows are shown; spacing follows 8px base unit rhythm
- Row dividers: implicit via whitespace rather than explicit rules (whitespace-first principle)

**Section 2 — Attendance of Today's Lectures**

- Section heading: `"Attendence of Today's lectures"` — Playfair Display, H2 (600, 24px), `#3C3D48`
- Container: Standard Card — same card treatment as above
- Each row: two-column layout
  - Left: `{subject_name}` — Lato, Body Medium, `#3C3D48`
  - Right: `{percentage}` — Playfair Display, Metric Value (700), `#F6A242`; draws eye immediately to the key metric
- Four course rows displayed
- Percentage values follow the **Metric Value** typography rule: gold accent reserved for important statistics

### Design Principles Applied

- Whitespace ratio respected: generous padding inside cards, breathing room between sections
- Gold (`#F6A242`) appears only on the attendance percentage figures — "Gold Must Be Earned"
- No decorative elements; hierarchy is driven purely through typography scale

---

## Screen 2 — Roster

these are mock data and it need to be pull real data from the backend.

### Purpose

Provides the lecturer with a per-session class list, showing each student's cumulative attendance percentage. Also allows manual attendance entry.

### Layout Structure

**Page Title**

- `"Roster"` — Playfair Display, H1 (700, 36px), `#3C3D48`
- No sub-header or breadcrumb; minimal navigation cognitive load

**Control Row**

- Left label: `"Current Attendance - {no}"` — Lato, Body Medium (14px), `#3C3D48`; the `{no}` token resolves to the count of students who have checked in
- Right: `"Add Manually"` button
  - Style: **Secondary Button** — transparent background, `2px solid #F6A242` border, `#F6A242` text, Lato SemiBold
  - Radius: `8px` (Standard Radius)
  - Function: opens a manual entry flow to add a student's attendance record without Bluetooth proximity

**Student List**

- Container: Standard Card surface `#FFFFFF`, `1px solid #E8E8E7`, `12px` radius
- Each row: two-column layout
  - Left: `{subject_name}` — used here as student name placeholder; Lato, Body Medium, `#3C3D48`
  - Right: `{percentage}` — Lato, Body Medium, `#3C3D48` (note: on this screen the percentage is presented in the functional Lato weight, not Playfair gold — it is list-level data, not a headline metric)
- Seven rows visible; scrollable list inferred
- Rows separated by whitespace; no explicit dividers

### Design Principles Applied

- Functional data (the roster list) uses Lato exclusively, consistent with the prohibition on Playfair for tables and attendance lists
- The "Add Manually" button uses the Secondary Button style so it does not compete visually with primary actions on other screens
- The `{no}` count gives the lecturer at-a-glance session context without navigating elsewhere

---

## Screen 3 — Broadcasting (Radar / Mark Attendance tab)

these are mock data and it need to be pull real data from the backend.

### Purpose

The active attendance session screen. The lecturer initiates a Bluetooth broadcast so nearby students can detect the signal and mark their attendance. This is the core real-time interaction of the lecturer workflow.

### Layout Structure

**Page Title**

- `"Broadcasting"` — Playfair Display, H1 (700, 36px), `#3C3D48`

**Broadcast Visualisation Area (Upper Half)**

- Full-width zone with `#FDFDFD` background
- Central animated circle: a large filled circle in a cyan/teal tone (distinct from the design system's gold — this is a functional status colour indicating an active broadcast state, analogous to a radar "ping" animation)
- use - assets\animated-icons\radar.gif for middle icon.
- The circle likely pulses or radiates rings to communicate active signal emission
- No text overlaid on the visual; the animation is the communication

**Session Info Panel (Lower Half)**

- Background: elevated dark surface (~`#3C3D48` tonal variant or `#E8E8E7` deeply shadowed) — creates a two-tone split layout
- Two metadata rows:
  - `{Course name}` — Lato, Body Large (16px), light text on dark surface
  - `{Hole no.}` — Lato, Body Medium (14px), secondary text — likely represents Hall/Room number
- **Broadcast Button**
  - Style: **Primary Button** — background `#F6A242`, text `#FDFDFD`, Lato SemiBold
  - Full-width within panel, `8px` radius
  - Label: `"Broadcast"`
  - Tapping this button initiates or stops the BLE broadcast session

### Design Principles Applied

- The split-panel layout (light top / dark bottom) creates visual hierarchy without extra UI chrome
- The animated circle is the centrepiece; everything else is subordinate context
- The Broadcast button as a Primary Button correctly signals this is the single most important action on the screen

---

## Screen 4 — Notification

these are mock data and it need to be pull real data from the backend.

### Purpose

A log of system-generated alerts relevant to the lecturer — primarily attendance marking confirmations and anomalies (missed sessions, unverified marks).

### Layout Structure

**Page Title**

- `"Notification"` — Playfair Display, H1 (700, 36px), `#3C3D48`

**Notification List**

- Background: `#FDFDFD` (primary background — no card wrapping on this screen; items sit directly on the background)

- Three notification item types visible:
  
  | Item Text                  | Type                                                 |
  | -------------------------- | ---------------------------------------------------- |
  | `Attendance marked - {no}` | Confirmation — student count successfully recorded   |
  | `Missed {lecture_name}`    | Warning — a scheduled session had no attendance data |
  | `Not verified`             | Alert — an attendance record failed verification     |

- Item typography: Lato, Body Medium (14px, 400), `#3C3D48`

- Items are line-separated with 16–24px vertical spacing (2–3 × 8px base unit)

- No status badges or colour coding visible at this fidelity; the full implementation should apply:
  
  - Confirmation items: `#4E8D63` (Present green) dot or left-border
  - Warning/Alert items: `#C05A5A` (Absent red) or `#D89A3C` (Late amber) treatment per the Attendance Status System

### Design Principles Applied

- Minimal decoration; the notification feed is functional prose, not a visual dashboard
- Typography hierarchy is flat by design — all three notification types use the same base style; differentiation comes from content + status colour, not font changes
- The screen respects the Whitespace Is a Feature principle: ample spacing prevents the list from feeling crowded even with multiple alerts

---

## Screen 5 — Settings

### Purpose

Profile management for the lecturer. Displays identity information and provides a credential management action.

#### Settings Needs Logout

Even MVPs need:

```
Logout
```

Usually a tertiary button.

I would add:

```
Reset Password
```

Primary

```
Logout
```

Text Button

Secondary importance.

### Layout Structure

**Page Title**

- `"Settings"` — Playfair Display, H1 (700, 36px), `#3C3D48`

**Avatar**

- Large circular placeholder — `border-radius: 9999px` (Full Radius), ~80px diameter
- Fill: a warm yellow tint (`#E6C18B` Secondary Accent range) — distinguishes the profile avatar from generic grey placeholders elsewhere
- Centred horizontally with generous top margin (~32px)

**Profile Fields**

- `Name - {name}` — Lato, Body Large (16px), `#3C3D48`
- `Email - {email}` — Lato, Body Large (16px), `#3C3D48`
- Fields displayed as read-only labelled rows (not inside input containers); they are informational, not editable inline
- Vertical spacing: 16px between rows (2 × 8px)

**Action Button**

- `"Reset Password"` — **Primary Button** style: background `#F6A242`, text `#FDFDFD`, Lato SemiBold, full-width, `8px` radius
- This is the sole CTA on the screen; placement below the profile fields follows natural reading flow
- No secondary actions (no logout, no delete account) visible in this iteration — MVP scope

### Design Principles Applied

- The warm avatar tint (`#E6C18B`) uses the Secondary Accent purposefully — it personalises the profile space without introducing a new colour
- A single Primary Button ensures the "Reset Password" action has maximum affordance without competing elements
- The lecturer settings screen is deliberately lighter than the student equivalent — lecturers have fewer account-management concerns in the MVP

---

## Cross-Screen Design Notes

**Colour application summary across lecturer screens**

| Element                          | Colour                        | Token                             |
| -------------------------------- | ----------------------------- | --------------------------------- |
| Screen backgrounds               | `#FDFDFD`                     | Primary Background                |
| Card / panel surfaces            | `#FFFFFF`                     | Elevated Surface                  |
| Section borders                  | `#E8E8E7`                     | Secondary Surface / Border        |
| Primary text (headings, body)    | `#3C3D48`                     | Primary Text                      |
| Secondary / caption text         | `#BAC0BE`                     | Secondary Text                    |
| Attendance percentages (Home)    | `#F6A242`                     | Primary Accent                    |
| Active nav item                  | `#F6A242`                     | Primary Accent                    |
| Primary buttons                  | `#F6A242` bg / `#FDFDFD` text | Primary Accent                    |
| Secondary buttons (Add Manually) | `#F6A242` border + text       | Primary Accent                    |
| Avatar on Settings               | `#E6C18B` fill                | Secondary Accent                  |
| Broadcast animation              | Cyan (status colour)          | Functional / outside gold palette |

**Typography application summary**

| Usage                                                               | Typeface         | Weight  | Size        |
| ------------------------------------------------------------------- | ---------------- | ------- | ----------- |
| Page titles (Home, Roster, Broadcasting, Notification, Settings)    | Playfair Display | 700     | 36px        |
| Section headings (Today's schedule, Attendence of Today's lectures) | Playfair Display | 600     | 24px        |
| Attendance % on Home dashboard                                      | Playfair Display | 700     | accent gold |
| All body text, list rows, labels, button text                       | Lato             | 400–600 | 14–16px     |
| Nav labels, captions                                                | Lato             | 500     | 12px        |

**Navigation structure**

```
Home ──────────── Dashboard (Today's schedule + Attendance summary)
Schedule ─────── Roster (student list + manual add)
[Check icon] ─── Broadcasting (BLE session initiation)
Notifi ────────── Notification log
Settings ─────── Profile + Reset Password
```
