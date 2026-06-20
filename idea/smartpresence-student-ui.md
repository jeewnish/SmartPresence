# SmartPresence — Student Side UI Documentation

> Design system reference: **Academic Gold / Minimal Academic Corporate**
> Typefaces: **Playfair Display** (titles & metric values) · **Lato** (all functional content)
> Core accent: `#F6A242` · Background: `#FDFDFD` · Surface: `#FFFFFF`

---

icon path - assets\icons

font path - assets\font

animated icon for radar page - assets\animated-icons

## Navigation Bar

The student app uses a persistent bottom navigation bar present on every screen.

**Visual Treatment**

- Background: `#FDFDFD` (Primary Background)
- Active item icon + label: `#F6A242` (Primary Accent gold)
- Inactive item icon + label: `#BAC0BE` (Secondary Text)
- Font: Lato, Caption weight (500), 12px
- Height: standard mobile nav height (~56px); elevated above content by a subtle shadow (`0px 4px 12px`, 5% opacity of `#3C3D48`)

**Tab Items (left → right)**

| Tab | Icon     | Label                        |
| --- | -------- | ---------------------------- |
| 1   | home     | Home                         |
| 2   | Book-alt | Courses                      |
| 3   | Radar    | *(active check — icon only)* |
| 4   | Bell     | Alert                        |
| 5   | Settings | Settings                     |

The student navigation mirrors the lecturer bar structurally but the student's "check" icon tab routes to the Bluetooth scanning (Radar) screen, whereas the lecturer's same tab routes to Broadcasting. Active state uses gold across icon and label consistently.

---

## Screen 1 — Home

these are mock data and it need to be pull real data from the backend.

### Purpose

The primary dashboard for students. Gives an immediate view of today's lecture schedule and current attendance percentages per course — the two things a student checks most frequently.

### Layout Structure

**Header Zone**

- Background strip: `#4E8D63` (Present green) — a full-width coloured header band that immediately signals a live/active application state; this is the most visually distinctive departure from the raw wireframe fidelity and grounds the design
- Left column:
  - Institution sub-label: `"Sabaragamuwa University of Sri Lanka / Faculty of Computing"` — Lato, Caption (500, 12px), `#FDFDFD` or light tint
  - Small institution avatar/icon: circular, ~24px, `border-radius: 9999px`
  - Greeting: `"Hello"` in Lato Body Large (16px) + `"Nadun!"` in Playfair Display H1 (700, 36px), `#3C3D48` — the dual-typeface greeting pattern is a signature SmartPresence moment; student name uses Playfair for personality while "Hello" stays Lato for function
- Right: Circular avatar placeholder — `border-radius: 9999px`, ~56px diameter, `#E8E8E7` fill

**Section 1 — Today's Lectures**

- Section heading: `"Today's lectures"` — Playfair Display, H2 (600, 24px), `#3C3D48`
- Right-aligned date: `"2025/05/05"` — Lato, Body Medium (14px), `#BAC0BE` (Secondary Text / caption treatment)
- Container: Standard Card — `#FFFFFF` background, `1px solid #E8E8E7` border, `12px` radius, 20px side margins
- Each lecture row: two columns
  - Left: Course code + name (e.g., `IS31000 Web application`) — Lato, Body Medium (14px), `#3C3D48`
  - Right: Time (e.g., `08:00 A.M.`) — Lato, Body Medium (14px), `#3C3D48`
- Four rows displayed; the list is scrollable when more entries exist
- Row rhythm: 16px vertical spacing (2 × 8px)

**Section 2 — Attendance of Today's Lectures**

- Section heading: `"Attendence of Today's lectures"` — Playfair Display, H2 (600, 24px), `#3C3D48`
- Each course appears as an individual **Highlight Card**:
  - Background: very light tint of `#E6C18B` (Secondary Accent) — the Highlight Card treatment
  - Border: `1px solid #E8E8E7`, `12px` radius
  - Course label: `IS31000 WEB APPLICATION` — Lato, Labels (500), `#3C3D48`, uppercase
  - Percentage value: e.g., `95%`, `90%`, `75%`, `45%` — Playfair Display, Metric Value (700), `#F6A242` (Primary Accent gold); right-aligned
  - Progress bar:
    - Track: `#E8E8E7` (secondary surface)
    - Fill: `#4E8D63` green for healthy attendance (≥75%) — maps to the Present colour; the fill at 45% would typically shift toward `#C05A5A` (Absent red) per the Attendance Status System
    - Bar height: ~6px, full-radius pill shape (`border-radius: 9999px`)
    - Fill width is proportional to the percentage value
- Four cards shown with distinct fill lengths visually encoding attendance health at a glance
- Cards are spaced 8px apart within the section

### Design Principles Applied

- The green header band is a high-contrast contextual anchor — it communicates institutional identity immediately without a full splash screen
- Metric values in Playfair gold (`#F6A242`) and progress bars working together create a two-layer redundancy for attendance data: number (Playfair metric) + spatial encoding (bar fill)
- The Highlight Card background tint (`#E6C18B`) reserves the Secondary Accent for genuinely important data widgets
- 45% attendance card would visually signal risk — the progress bar shortness combined with a potential colour shift to red (`#C05A5A`) communicates urgency without additional text

---

## Screen 2 — Courses (Attendance of Lectures — full list)

these are mock data and it need to be pull real data from the backend.

### Purpose

A dedicated full-screen view of the student's cumulative attendance across all enrolled courses, not just today's. Accessed via the Schedule tab or by navigating from the Home attendance section.

### Layout Structure

**Navigation Header**

- Back arrow (`←`) — Lato, `#3C3D48`; navigates to previous screen (Home)
- Page title: `"Attendance of lectures"` — Playfair Display, H2 (600, 24px), `#3C3D48`
- No date filter visible at this fidelity — displays cumulative records

**Course Attendance List**

- Background: `#FDFDFD` (Primary Background) — no card wrapping; the list is the screen
- Each course entry is a **Highlight Card**:
  - Background: light `#E6C18B` tint
  - `1px solid #E8E8E7` border, `12px` radius
  - Course label: `IS31000 WEB APPLICATION` — Lato, Labels (500, uppercase), `#3C3D48`
  - Percentage: right-aligned, Playfair Display Metric Value (700), `#F6A242`
  - Progress bar: same treatment as Home — `#4E8D63` green fill, `#E8E8E7` track, pill radius
- Seven+ cards visible; the screen is vertically scrollable
- Sample percentages shown: 95%, 90%, 75%, 45%, 95%, 90%, 75%
- The 45% card renders with a noticeably short bar — a passive risk signal with no additional warning text in this iteration (the design allows for a future colour-coded fill state)
- Card spacing: 8px vertical gap between each card

### Functional Notes

- This screen is the student's primary tool for monitoring academic standing
- The absence of filtering, sorting, or search in the MVP keeps cognitive load low
- Each card could in future be tappable to drill into session-by-session attendance history

### Design Principles Applied

- Consistent card pattern with Home creates spatial familiarity — the student immediately understands the encoding
- Scrollable flat list with no section breaks: the course list is the only content type, so grouping would add unnecessary chrome
- Gold percentage values and green bars are the only non-neutral colours — everything else is `#3C3D48` or `#BAC0BE`, keeping the accent colours purposeful

---

## Screen 3 — Radar (BLE Scanning / Mark Attendance)

### Purpose

The student's active attendance marking screen. The student opens this when they are physically present in class. The app scans for the lecturer's Bluetooth broadcast signal and, upon detection, presents the session details for confirmation.

### Layout Structure

**Header Strip**

- Background: `#4E8D63` (Present green) — matches the Home header; reinforces brand consistency for active/live states
- Back arrow (`←`) — returns to Home without marking
- Page title: `"Scanning..."` — Lato, Body Large (16px), `#FDFDFD`; the ellipsis communicates active/loading state

**Scanning Animation Area**

- White/light background zone occupying ~55% of screen height
- Central Bluetooth icon — standard BT symbol, rendered in a deep green tonal colour, ~48px
- Concentric ring animation: two or three rings expanding outward from the BT icon — communicates active scanning; rings are rendered in `#4E8D63` green with decreasing opacity outward
- Bottom-right of animation zone(this is amount of strenght of signal that is re): `95%` — Playfair Display Metric Value (700), `#F6A242`; this is the student's current attendance rate for the detected session, shown in context so the student understands what marking this session will affect

**Session Info Card**

    this need to be animated as it comes from below.

- Standard Card: `#FFFFFF` background, `1px solid #E8E8E7`, `12px` radius, 16px inner padding
- Three info rows with leading icons:
  - 👤 `Prof. Shantha Bandara` — Lato, Body Medium (14px), `#3C3D48`; lecturer name
  - 📖 `IS31000 Web application` — Lato, Body Medium (14px), `#3C3D48`; course name
  - 🏛 `Z9 Hall` — Lato, Body Medium (14px), `#3C3D48`; venue
- **Check Attendance Button**
  - Style: **Secondary Button** — transparent background, border `2px solid #F6A242`, text `#F6A242`, Lato SemiBold
  - Full-width within card, `8px` radius
  - Label: `"Check Attendance"`
  - Tapping confirms the student's presence and submits the attendance record

after clicking check attendence app requests phone for it's biometrics(face id or fingerprint)

### Why Secondary (not Primary) Button here

The Check Attendance action uses the Secondary Button style. This may reflect that the confirmation step follows an auto-detection — the system has already validated proximity; the student is confirming a pre-validated state rather than initiating a fresh primary action. Alternatively, the final implementation may upgrade this to a Primary Button (`#F6A242` background) to maximise tap affordance during a time-sensitive class start.

### Design Principles Applied

- Green header + green scanning rings + green accent on the BT icon create a coherent "active/live" visual language using the Present colour (`#4E8D63`)
- The `95%` metric in gold anchors the student's attendance context without requiring navigation away
- Session info (lecturer, course, hall) is surfaced automatically from the BLE signal — no student data entry required; simplicity is the feature

---

## Screen 4 — Notification

### Purpose

A chronological log of the student's attendance events — confirmations of successful marks and alerts for missed sessions. Serves as an audit trail and a passive reminder system.

### Layout Structure

**Header Strip**

- Background: `#4E8D63` (Present green)
- Back arrow (`←`)
- Page title: `"Notification"` — Lato, Body Large (16px), `#FDFDFD`

**Notification List**

    Notification Screen Should Use Status Dots

- Background: `#FDFDFD`; items sit directly on the background inside lightly bordered cards
- Each notification item is a Standard Card: `#FFFFFF`, `1px solid #E8E8E7`, `12px` radius, 12px inner padding

**Item Structure (three entries shown)**

  **Entry 1 — Attended (2026/02/02)**

these are mock data and it need to be pull real data from the backend.

- Date: `2026/02/02` — Lato, Caption (500, 12px), `#BAC0BE`

- Course: `IS31000 WEB APPLICATION` — Lato, Labels (500), `#3C3D48`, uppercase

- Status badge: `● ATTENDED` — pill badge (`border-radius: 9999px`), background light green tint, text `#4E8D63` (Present colour), Lato 500, 12px; dot indicator `#4E8D63`

- Sub-text: `"Marked your attendance at 08:23 A.M. at Hall Z1"` — Lato, Body Medium (14px), `#4E8D63`; confirmation message in the Present green
  
  **Entry 2 — Attended (2026/02/02)**

- Identical structure to Entry 1; a second session marked the same day
  
  **Entry 3 — Not Attended (2026/02/04)**

- Date: `2026/02/04` — Lato, Caption (500, 12px), `#BAC0BE`

- Course: `IS31000 WEB APPLICATION` — Lato, Labels (500), `#3C3D48`, uppercase

- Status badge: `● NOT ATTENDED` — pill badge, background light red tint, text `#C05A5A` (Absent colour); dot indicator `#C05A5A`

- Sub-text: `"Not participated to the lecure at 10.30 A.M. at Hall Z9"` — Lato, Body Medium (14px), `#C05A5A` (Absent red); absence message in red

### Colour Semantics in Use

| Status       | Badge background     | Badge text | Sub-text  | Dot       |
| ------------ | -------------------- | ---------- | --------- | --------- |
| ATTENDED     | Light `#4E8D63` tint | `#4E8D63`  | `#4E8D63` | `#4E8D63` |
| NOT ATTENDED | Light `#C05A5A` tint | `#C05A5A`  | `#C05A5A` | `#C05A5A` |

This is the clearest use of the Attendance Status System in the entire app. Green and red are applied purposefully and never used decoratively.

### Design Principles Applied

- Status pill badges use Full Radius (`9999px`) per the design system specification for pills and status badges
- Dates in `#BAC0BE` (Secondary Text) de-emphasise metadata without hiding it
- The absent entry's red text is the only alarming element on the screen — all other text is neutral; this creates a clear signal-to-noise ratio
- Cards provide enough separation between entries to prevent the feed from feeling like a dense data table

---

## Screen 5 — Settings

### Purpose

Student profile management. Displays identity details and allows the student to update their credentials. More detailed than the lecturer settings screen, including a Student ID field and an editable avatar.

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

**Header Strip**

- Background: `#4E8D63` (Present green)
- Back arrow (`←`)
- Page title: `"Settings"` — Lato, Body Large (16px), `#FDFDFD`

**Profile Section**

- Avatar:
  - Circular image — `border-radius: 9999px`, ~80px diameter
  - Actual student photo/illustration rather than a colour placeholder (in contrast to the lecturer settings avatar placeholder)
  - Edit badge: small circular button overlaid bottom-right of avatar, `#F6A242` background or dark icon, pencil/edit icon — tappable to change photo
- Name display: `"Nadun Perera"` — Lato, H3 weight (700, 18px) or Body Large Bold, `#3C3D48`; centred below avatar
- Student ID display: `"22CIS0200"` — Lato, Body Medium (14px), `#BAC0BE` (Secondary Text); registration number shown as caption-level metadata

**Editable Fields Container**

- Background: Standard Card `#FFFFFF`, `1px solid #E8E8E7`, `12px` radius; contains all three input fields as a grouped form
  
  **Field 1 — Student ID**
  
  - Label: `"Student ID"` — Lato, Labels (500), `#3C3D48`
  - Input: `"STU-2024-XXXX"` placeholder — Tier 2 Input style: background `#E8E8E7`, `1px solid #BAC0BE` border, `8px` radius, Lato Body Medium, `#BAC0BE` placeholder text
  - Right icon: ID card icon, `#4E8D63` — visually indicates field type; teal/green treatment consistent with the student app's Present-green active identity
  
  **Field 2 — Password**
  
  - Label: `"Password"` — Lato, Labels (500), `#3C3D48`
  - Input: masked `•••••••` — same input style; `#3C3D48` for the dots
  - Right icon: padlock icon, `#4E8D63` — locked/security indicator
  
  **Field 3 — Email**
  
  - Label: `"Email"` — Lato, Labels (500), `#3C3D48`
  - Input: masked `•••••••` — same input style
  - Right icon: padlock icon, `#4E8D63`

**Action Button**

- `"Change"` — **Primary Button**: background `#F6A242`, text `#FDFDFD`, Lato SemiBold, full-width, `8px` radius
- Submits all changed field values simultaneously
- Positioned with ~24px top margin from the last field (3 × 8px)

### Design Notes

- The student Settings screen is substantially richer than the lecturer equivalent — it provides editable fields, a real avatar with an edit affordance, and displays the student ID. This reflects that students are the primary end-users who need full account management.
- Field icons use `#4E8D63` green rather than gold — they are passive affordance indicators, not interactive primary elements; the green colour echoes the header and maintains visual consistency within the student app's accent palette.
- Input fields follow the design system specification exactly: Tier 2 surface `#E8E8E7`, focus state would shift border to `#F6A242`.
- The `"Change"` Primary Button is the single CTA — identical pattern to the lecturer `"Reset Password"` button.

---

## Cross-Screen Design Notes

**Colour application summary across student screens**

| Element                                       | Colour                        | Token                          |
| --------------------------------------------- | ----------------------------- | ------------------------------ |
| Screen backgrounds                            | `#FDFDFD`                     | Primary Background             |
| Card / panel surfaces                         | `#FFFFFF`                     | Elevated Surface               |
| Section borders                               | `#E8E8E7`                     | Secondary Surface / Border     |
| Primary text (headings, body)                 | `#3C3D48`                     | Primary Text                   |
| Secondary / caption text (dates, sub-labels)  | `#BAC0BE`                     | Secondary Text                 |
| Attendance percentage metrics (Home, Courses) | `#F6A242`                     | Primary Accent                 |
| Active nav item                               | `#F6A242`                     | Primary Accent                 |
| Primary buttons (Change)                      | `#F6A242` bg / `#FDFDFD` text | Primary Accent                 |
| Secondary buttons (Check Attendance)          | `#F6A242` border + text       | Primary Accent                 |
| Progress bar fill (healthy)                   | `#4E8D63`                     | Present (Attendance Status)    |
| Active/live header band                       | `#4E8D63`                     | Present (Attendance Status)    |
| ATTENDED notification badge + text            | `#4E8D63`                     | Present (Attendance Status)    |
| NOT ATTENDED notification badge + text        | `#C05A5A`                     | Absent (Attendance Status)     |
| Scanning animation rings                      | `#4E8D63`                     | Present (Attendance Status)    |
| Avatar edit badge                             | `#F6A242`                     | Primary Accent                 |
| Field icons in Settings                       | `#4E8D63`                     | Present (functional indicator) |

**Typography application summary**

| Usage                                            | Typeface         | Weight         | Size        |
| ------------------------------------------------ | ---------------- | -------------- | ----------- |
| Page titles (where Playfair is used)             | Playfair Display | 600–700        | 24–36px     |
| Student name in greeting ("Nadun!")              | Playfair Display | 700            | 36px        |
| Attendance % values (Home + Courses)             | Playfair Display | 700            | accent gold |
| "Hello" greeting prefix                          | Lato             | 400            | 16px        |
| Course labels in cards (uppercase)               | Lato             | 500            | 14px        |
| Body rows (schedule, course names, session info) | Lato             | 400            | 14–16px     |
| Notification sub-text                            | Lato             | 400            | 14px        |
| Date metadata, captions, student ID sub-label    | Lato             | 500            | 12px        |
| Nav labels                                       | Lato             | 500            | 12px        |
| Button labels                                    | Lato             | 600 (SemiBold) | 14–16px     |

**Navigation structure**

```
Home ──────────── Dashboard (Today's schedule + Attendance % per course)
Schedule ─────── Courses (full cumulative attendance list)
[Check icon] ─── Radar (BLE scan → session details → Check Attendance)
Notifi ────────── Notification log (ATTENDED / NOT ATTENDED history)
Settings ─────── Profile (avatar + Student ID + Password + Email + Change)
```

**Student vs. Lecturer — key differences**

| Aspect                | Student App                                 | Lecturer App                                |
| --------------------- | ------------------------------------------- | ------------------------------------------- |
| Header band colour    | `#4E8D63` Present green                     | `#FDFDFD` neutral (no coloured band)        |
| Radar screen role     | Scan / receive BLE signal                   | Broadcast BLE signal                        |
| Settings depth        | Avatar edit + 3 editable fields             | Read-only name/email + Reset Password       |
| Notification content  | Per-student attendance confirmations        | Session-level attendance counts + anomalies |
| Courses/Roster screen | Student's own attendance across all courses | Class roster with all students' percentages |
| Progress bars         | Present on Home + Courses screens           | Absent (percentages shown as text only)     |
