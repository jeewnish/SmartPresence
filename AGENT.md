# AGENT
# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# SmartPrecense Mobile App

You are an expert React Native + Expo engineer helping build a production-quality teaching project.

You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction because this app is used to teach developers how to build feature by feature.

You should think like a senior mobile developer, but explain and implement like someone building a practical learning project.

This app using react native and it uses keycloak for authentications.



---

## 


# *Structure of the app*

### Connection

Lecture’s phone broadcasts and student’s phone send via internet

- BLE scanner (student)

- BLE advertiser (lecturer)

- Lecture broadcasting

- Need to be below 31bytes
  
  - session_id, timestamp (T), hash
    
    - hash = session_secret_key + TimeStamp
      CRC 16 hash

#### Lecture’s phone

- Advertise
  
  - session_id
  
  - timestamp (T)
  
  - hash = H(session_secret + T)

Request real time data from database

#### Student’s phone:

STEP 1:

- Scan continuously until token received

STEP 2:
Once token received:
• Authenticate user
• HTTP request for database

For offline:

- student_id

- session_id

- timestamp (T)

- hash_from_lecturer

- received_at (local time)

STEP 3:

- Database sends the message received

#### Database checks:

```
{
student
ID: 22fas2232,
sessionID: 324,
token: (lecture’s hash),HMAC
timeStamp :23122230
}
```

#### Server checks:

**For online:**

1. Is session active?
2. Is token valid? (recompute hash)
3. Is timestamp within allowed window?
4. Is student already marked present?
5. Send the message received token

For offline students

1. Was there an active session at that given local time?
2. Correct hash from lecture?
3. Delete saved memory after 24H
4. Attendance marked message


## UI elements(Images)

let's start the phase 3 and continue creating the ui elements. 
IN THE assests/images here 
L1 - login page
LB1,LB2 - lecture's broadcast
LH1, LH2 - lecture's history
LR1 -  Lecture's roster
SA1 - Student's alerts
SL1, SL2, SL3 - Student's login
SP1 - Student's progress
SR1,SR2,SR3 - student's radar
these are the images and i need the app to look loke this

## Build feature by feature.

For every feature:

1. Understand the user request.

2. Check this file before coding.

3. Keep the implementation simple.

4. Avoid overengineering.

5. Prefer readable code over clever code.

6. Build the smallest useful version first.

7. Refactor only when repetition or complexity appears.

8. Keep the app easy to teach and explain.

This project should feel like a real app, but remain approachable for students.



## Decosion making and clarification

If something is unclear or could be improved:

- Proactively suggest better approaches

- If a new library would significantly simplify or improve the implementation:
  
  - Recommend the library
  
  - Clearly explain why it is useful
  
  - Ask the user for permission before adding or installing it

Example:

> "This could be implemented manually, but using `react-native-reanimated` would make animations smoother. Do you want me to add it?"

Do not install or use new libraries without user approval.



## Architecture Guideline

```text

app/
(auth)/
(tabs)/
lesson/
components/
constants/
data/
hooks/
lib/
store/
types/
assets/

/src/app/
├── App.tsx                   # Main React entry point
├── routes.tsx                # Centralized routing configuration
├── MobileLayout.tsx          # Global wrapper providing mobile constraints
│
├── components/              
│   ├── figma/                # Asset utilities (e.g., ImageWithFallback)
│   └── ui/                   # Shared UI primitives (Buttons, Cards, Inputs)
│
└── screens/                  # Core application views
    ├── RoleSelect.tsx        # Landing view: Choose "Student" or "Lecturer"
    │
    ├── student/              # 🎓 Student-facing views
    │   ├── Registration.tsx  # Device registration landing page
    │   ├── LinkDevice.tsx    # Email/ID form & simulated magic link
    │   ├── StudentLayout.tsx # Main shell with student bottom navigation
    │   ├── SmartRadar.tsx    # Live scanning/BLE detection interface
    │   ├── Dashboard.tsx     # Personal attendance stats and timelines
    │   └── Alerts.tsx        # Dedicated alerts/notifications page
    │
    └── lecturer/             # 👨‍🏫 Lecturer-facing views
        ├── LecturerLayout.tsx# Main shell with lecturer bottom navigation
        ├── SessionManager.tsx# Broadcasting interface (Start/Stop attendance)
        ├── Roster.tsx        # Live monitor and manual attendance override
        └── History.tsx       # Review of past classes and data 


```



### app/

Use this for routes and screens only.

Screens should compose components and call hooks/stores, but should not contain large reusable UI blocks or complex business logic.

### **components/**

Create a component only when:

- it is reused in multiple places

- it makes a screen easier to read

- it represents a clear UI concept like `LessonCard`, `XPBar`, `LanguageCard`, or `PrimaryButton`

Do not create tiny one-off components too early.

When unsure, ask:

> Should this UI be extracted into a reusable component, or should I keep it inside the current screen for now?

---

## **UI Implementation Rules (VERY IMPORTANT)**

---

For any UI-related task:

- The goal is to **replicate the provided design exactly**

- Match the UI **pixel-perfectly**

When the user provides a design image:

You MUST:

- match layout exactly

- match spacing and padding

- match font sizes and hierarchy

- match colors precisely

- match border radius and shadows

- match alignment and positioning

- match proportions of elements

- replicate all visible UI elements

Do not approximate. Do not simplify unless explicitly asked.



After generating images:

- Place them inside the `assets/` folder

- Use clear and organized naming:

Plaintext

```
assets/images/
  onboarding-illustration.png
  mascot-happy.png
```

Use these assets properly in the UI.



### **Styling Rules**

Use NativeWind tailwindcss classes for styling strictly. Don't use StyleSheet unless and until that certain thing is not possible to style with tailwindcss classnames.

Prioritize clean, readable mobile UI.

When building from an attached design image:

- match spacing closely

- match typography hierarchy

- match border radius and shadows

- match layout structure

- use consistent reusable styles

- make the UI responsive for different screen sizes



Prefer reusable class patterns through utilities in `global.css`. If there isn't any utility and you see an possibility, create that as a new utility in `global.css` by following BEM method.

### **Avoid large inline styles unless required.**

---

### **NativeWind Rule**

---

Use the NativeWind version already installed in this app.

Before implementing styling or NativeWind-related code:

- Check the current NativeWind version in `package.json`

- Follow the syntax, setup, and patterns supported by that exact version

- Do not use APIs, config patterns, or expamples from source file

### **NativeWind Rule**

---

Use the NativeWind version already installed in this app.

Before implementing styling or NativeWind-related code:

- Check the current NativeWind version in `package.json`

- Follow the syntax, setup, and patterns supported by that exact version

- Do not use APIs, config patterns, or examples from a different NativeWind version

- Do not upgrade NativeWind unless the user explicitly approves it

Refer this for more info: [https://www.nativewind.dev/v5/llms-full.txt](https://www.google.com/search?q=https://www.nativewind.dev/v5/llms-full.txt)

| **Component / Scenario** | **Why**                                                                             | **Use Instead**                       |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------- |
| **SafeAreaView**         | From `react-native` or `react-native-safe-area-context` — `className` not supported | Inline styles or `StyleSheet`         |
| **Button**               | Only supports `title` and `onPress` props — cannot customize background, border,    | `TouchableOpacity` with custom styles |

| **Component / Scenario** | **Why**                                           | **Use Instead**                   |
| ------------------------ | ------------------------------------------------- | --------------------------------- |
| **KeyboardAvoidingView** | Behavior props not supported by `className`       | Inline styles or `StyleSheet`     |
| **Modal**                | `visible`, `transparent` props                    | Inline styles                     |
| **ScrollView**           | `contentContainerStyle`, `indicatorStyle`         | `StyleSheet`                      |
| **TextInput**            | Input-specific props like `underlineColorAndroid` | Inline styles                     |
| **Animated.View**        | Animated style values                             | `StyleSheet` with animated values |
| **Dynamic styles**       | Styles calculated at runtime                      | `StyleSheet.create()` or inline   |

| **Component / Scenario**       | **Why**                              | **Use Instead**                   |
| ------------------------------ | ------------------------------------ | --------------------------------- |
| **Platform-specific**          | iOS-only or Android-only props       | Conditional inline styles         |
| **Pressable/TouchableOpacity** | `style` prop for pressed states      | `StyleSheet`                      |
| **Shadow (iOS/Android)**       | Different shadow syntax per platform | `StyleSheet` with platform checks |
| **Transform arrays**           | Complex transform combinations       | `StyleSheet`                      |
| **Z-index**                    | Sometimes needs explicit StyleSheet  | `StyleSheet`                      |



### **When to Use StyleSheet**

Use `StyleSheet` or inline styles when:

- The prop is React Native-specific (not web-equivalent)

- The value is dynamic/calculated at runtime

- Platform-specific behavior is needed

- NativeWind doesn't map the property to a style



The app should feel:

- playful

- polished

- friendly

- mobile-first

- visually close to the provided design references

Use:

- rounded cards

- soft shadows

- clear spacing

- progress indicators

- friendly empty states

- large touch targets

- simple animations when useful



### **Image Rule**

---

Use centralized image imports.

Before using any image asset:

1. Check if `constants/images.ts` exists.

2. If it does not exist, create it.

3. Import and export all app images from `constants/images.ts`.

4. Use images through the centralized object.
