# SmartPresence Design System

## Academic Gold

---

# Brand & Style

SmartPresence is designed for academic institutions that value professionalism, reliability, and modern efficiency. The design language combines traditional academic elegance with contemporary usability, creating an experience that feels premium without becoming intimidating.

The visual identity follows a **Minimal Academic Corporate** style, emphasizing generous whitespace, strong typography, subtle depth, and restrained use of gold accents.

The application should never feel crowded, overly colorful, or aggressively modern. Instead, it should communicate trust, prestige, and clarity.

---

# Design Principles

### 1. Academic Elegance

Use serif typography selectively to create hierarchy and establish a distinguished academic identity.

### 2. Functional Simplicity

Prioritize readability and efficient task completion over visual decoration.

### 3. Gold Must Be Earned

Accent colors are reserved for achievements, actions, active states, and important metrics.

### 4. Typography Creates Hierarchy

Use typography before color to establish information hierarchy.

### 5. Whitespace Is a Feature

Maintain generous spacing throughout the interface. Empty space contributes to the premium feel.

---

# Color System

## Core Palette

| Purpose            | Color   |
| ------------------ | ------- |
| Primary Background | #FDFDFD |
| Elevated Surface   | #FFFFFF |
| Secondary Surface  | #E8E8E7 |
| Border / Divider   | #BAC0BE |
| Primary Text       | #3C3D48 |
| Secondary Text     | #BAC0BE |
| Primary Accent     | #F6A242 |
| Secondary Accent   | #E6C18B |

---

## Surface Hierarchy

### Tier 0 — Background

Background Color:

#FDFDFD

Used for all screen backgrounds.

---

### Tier 1 — Standard Surface

Surface Color:

#FFFFFF

Border:

#E8E8E7

Used for:

- Cards

- Panels

- Statistics widgets

- Navigation containers

---

### Tier 2 — Recessed Surface

Surface Color:

#E8E8E7

Used for:

- Input fields

- Secondary containers

- Search bars

- Filter panels

---

## Text Colors

### Primary Text

#3C3D48

Used for:

- Headings

- Navigation

- Body text

- Labels

- Dashboard content

---

### Secondary Text

#BAC0BE

Used for:

- Captions

- Metadata

- Placeholder text

- Helper text

---

### Accent Text

#F6A242

Used sparingly for:

- Attendance percentages

- Key metrics

- Active states

- Achievements

---

# Attendance Status System

To prevent overuse of the gold palette, attendance states use dedicated semantic colors.

## Present

Color:

#4E8D63

Purpose:

Successful attendance records.

---

## Absent

Color:

#C05A5A

Purpose:

Missed attendance records.

---

## Late

Color:

#D89A3C

Purpose:

Late attendance records.

---

## Excused

Color:

#6B84A6

Purpose:

Approved absences and exemptions.

---

# Typography

The design system follows a Dual-Typeface Strategy.

---

## Playfair Display

Used exclusively for:

- Welcome screens

- Dashboard titles

- Main page titles

- Screen titles

- Hero sections

Playfair should never be used for operational data.

### Allowed Usage

✓ Welcome Back

✓ Attendance Overview

✓ Dashboard

✓ Course Summary

### Forbidden Usage

✗ Attendance percentages

✗ Timetables

✗ Forms

✗ Tables

✗ Attendance lists

✗ Analytics data

✗ Reports

All functional information must use Lato.

---

## Lato

Used for:

- Body text

- Navigation

- Forms

- Tables

- Timetables

- Attendance lists

- Dashboard metrics

- Analytics

- Buttons

- Labels

Lato is the primary functional typeface of the system.

---

# Typography Scale

## H1

Font: Playfair Display

Weight: 700

Size: 36px

Color: #3C3D48

Purpose:

Main dashboard and welcome titles.

---

## H2

Font: Playfair Display

Weight: 600

Size: 24px

Color: #3C3D48

Purpose:

Screen titles and major sections.

---

## H3

Font: Lato

Weight: 700

Size: 18px

Color: #3C3D48

Purpose:

Card titles and content sections.

---

## Body Large

Font: Lato

Size: 16px

Weight: 400

Color: #3C3D48

---

## Body Medium

Font: Lato

Size: 14px

Weight: 400

Color: #3C3D48

---

## Labels

Font: Lato

Weight: 500

Color: #3C3D48

---

## Captions

Font: Lato

Weight: 500

Size: 12px

Color: #BAC0BE

---

# Dashboard Metrics

Dashboard metrics receive a dedicated visual treatment.

---

## Metric Value

Font:

Playfair Display

Weight:

700

Color:

#F6A242

Examples:

92%

87%

120

Purpose:

Draw immediate attention to important statistics.

---

## Metric Label

Font:

Lato

Weight:

500

Color:

#BAC0BE

Examples:

Attendance Rate

Present Days

Classes Attended

Purpose:

Provide context while maintaining focus on the value.

---

# Navigation

## Navigation Bar

Background:

#FDFDFD

---

## Active Item

Icon:

#F6A242

Text:

#F6A242

Indicator:

#F6A242

---

## Inactive Item

Icon:

#BAC0BE

Text:

#BAC0BE

---

# Buttons

## Primary Button

Background:

#F6A242

Text:

#FDFDFD

Font:

Lato SemiBold

Purpose:

Primary actions.

Examples:

- Sign In

- Sign Up

- Mark Attendance

---

## Secondary Button

Background:

Transparent

Border:

2px solid #F6A242

Text:

#F6A242

---

## Tertiary Button

Background:

Transparent

Text:

#3C3D48

Hover:

Underline

---

## Disabled Button

Background:

#BAC0BE

Text:

#FDFDFD

---

# Input Fields

Background:

#E8E8E7

Border:

1px solid #BAC0BE

Text:

#3C3D48

Focus State:

Border color changes to #F6A242

---

# Cards

## Standard Card

Background:

#FFFFFF

Border:

1px solid #E8E8E7

Radius:

12px

---

## Highlight Card

Background:

Very light tint of #E6C18B

Metric Value:

#F6A242

Used for:

- Attendance percentage

- Achievements

- Important statistics

---

# Progress Indicators

## Track

#E8E8E7

---

## Fill

Primary:

#F6A242

Pending:

#E6C18B

---

# Layout & Spacing

## Grid System

### Mobile

Single column

20px side margins

---

### Tablet

8-column grid

16px gutters

---

### Desktop

12-column grid

Maximum width:

1200px

Centered layout

---

## Spacing Rhythm

Base Unit:

8px

Use multiples of 8px throughout the application.

---

## Whitespace Ratio

70% White Space

20% Typography

10% Accent Colors

This ratio should guide every screen design decision.

---

# Elevation

Depth should be achieved through layering rather than shadows.

### Base Layer

#FDFDFD

### Card Layer

#FFFFFF

### Interactive Layer

Soft shadow:

0px 4px 12px

5% opacity of #3C3D48

Avoid heavy shadows and gradients.

---

# Shapes

## Standard Radius

8px

Used for:

- Buttons

- Inputs

- Standard cards

---

## Large Radius

16px

Used for:

- Modals

- Dashboard containers

---

## Full Radius

9999px

Used for:

- Avatars

- Pills

- Status badges

---

# Future Considerations

Dark mode is intentionally excluded from the MVP.

The color system has been designed to support a future dark theme.

Potential future palette:

Background: #1A1B25

Surface: #2A2C36

Primary Accent: #F6A242

Text: #FDFDFD

Dark mode should be implemented only after the core attendance experience is fully validated.
