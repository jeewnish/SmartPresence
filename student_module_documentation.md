**SMART PRESENCE**

Academic Attendance System

**Student Module**

*Screen-by-Screen Functional Documentation*

# 1. Authentication & Onboarding

|  |  |
| --- | --- |
| ![Image: image_001.png](./student_module_documentation_images/image_001.png) | **Splash Screen**  The app launch screen that greets users while the system initializes. Displays the Smart Presence branding and AI Power System tagline with an animated loading indicator.  **Functions**  • App initialization — loads AI core and system services on startup  • Loading state display — shows a progress bar and status text during boot  • Auto-navigation — redirects to Login once initialization completes  **UI Elements**  • App logo with checkmark icon  • SMARTPRESENCE title and 'AI Power System' subtitle  • 'Secure Smart Attendance System' tagline  • Three-dot animation indicator  • Gradient progress bar with 'Initializing AI Core' label |

|  |  |
| --- | --- |
| ![Image: image_002.png](./student_module_documentation_images/image_002.png) | **Login Screen**  The main entry point for students. Allows authentication using university email and password credentials. Includes a biometric shortcut and link to account registration.  **Functions**  • Credential login — authenticates the student using Keycloak SSO with university email and password  • Biometric login — provides a fingerprint shortcut button for faster sign-in on registered devices  • Password visibility toggle — eye icon reveals or hides the password field input  • Forgot password — links to password recovery flow  • Sign Up redirect — navigates new users to the account creation screen  **UI Elements**  • App logo and 'Smart Presence' hero banner with university building background  • 'Welcome Back' heading and sign-in prompt  • University Email input field with mail icon  • Password field with lock icon, visibility toggle and 'Forgot?' link  • 'Sign In' primary button with arrow icon  • Fingerprint biometric button (secondary)  • 'Don't have an account? Sign Up' link  • Bottom trust badges (institution, security, QR icons) |

|  |  |
| --- | --- |
| ![Image: image_003.png](./student_module_documentation_images/image_003.png) | **Create Account**  New student registration screen. Students enter their academic details and upload their university ID for verification. Account activation is subject to admin approval within 24–48 hours.  **Functions**  • Account creation — submits full name, university email, student ID, and password to create a new account  • University ID upload — allows the student to attach a photo of their ID card (up to 5 MB) for identity verification  • Form validation — checks all required fields before allowing submission  • Pending state handling — informs the student their account requires admin verification before activation  **UI Elements**  • Back arrow navigation  • 'Join Smart Presence' heading and subtitle  • Full Name input field with person icon  • University Email input field with mail icon  • Student ID field (22SED0434 format) with ID badge icon  • Password field with lock icon  • ID photo upload area with cloud icon (drag/click, max 5 MB)  • 'Create Account' primary button  • Info banner: '24–48 hour verification' notice |

|  |  |
| --- | --- |
| ![Image: image_004.png](./student_module_documentation_images/image_004.png) | **Verification Status**  Displayed after account creation while the university authority reviews the submitted ID. Shows the current approval stage in a step-by-step timeline.  **Functions**  • Status polling — continuously checks and updates the verification stage (Submitted → Waiting → Complete)  • Timeline display — renders a 3-step progress trail showing where in the process the student currently sits  • Notification readiness — confirms the student will receive an alert once verification is approved  **UI Elements**  • Back navigation arrow and notification bell  • ID card illustration with pending clock badge  • 'Verification Pending' heading and status description  • Step timeline: ID Submitted (with timestamp), Waiting for Approval (in progress), Verification Complete  • Info banner: '2–3 business days' estimated time notice |

|  |  |
| --- | --- |
| ![Image: image_005.png](./student_module_documentation_images/image_005.png) | **Fingerprint Enrollment**  One-time biometric setup screen triggered after admin approval. Students register their fingerprint to activate biometric authentication for future logins and attendance verification.  **Functions**  • Fingerprint scan — captures and encrypts the student's biometric data (256-bit encryption)  • Onboarding progress tracking — displays a 3-step checklist: ID Upload → Admin Approval → Fingerprint Verification  • Cancel option — allows the student to exit and complete enrollment later  **UI Elements**  • Back navigation arrow  • 3-step progress checklist (Upload ID ✓, Admin Approval ✓, Fingerprint – In Progress)  • Animated fingerprint sensor graphic with shield badge  • 'Complete Your Verification' heading and instruction text  • 'Secure Data' and '256-bit Encrypted' trust badges  • 'Scan Fingerprint' primary call-to-action button  • 'Cancel Verification' secondary link |

# 2. Profile & Account Settings

|  |  |
| --- | --- |
| ![Image: image_006.png](./student_module_documentation_images/image_006.png) | **Profile Settings**  Displays the student's personal and academic information. Only the mobile number is editable inline; other fields are read-only. Provides access to password change and sign-out actions.  **Functions**  • Profile picture edit — pencil icon allows the student to update their avatar  • Mobile number edit — only editable field; pencil icon opens an inline text input  • Device status display — shows the registered device name and its 'Device Authorized' status  • Change password — navigates to the password change screen  • Sign out — ends the current session and returns to the Login screen  **UI Elements**  • Back arrow and Settings gear icon  • Avatar with edit (pencil) overlay  • Device Status card (device name + 'Device Authorized' badge)  • Student name and ID number  • 'Academic Details' section header  • Department card (read-only, with chevron)  • Institutional Email card (read-only, with lock icon)  • Mobile Number card (editable, with pencil icon)  • 'Change Password' button with key icon  • 'Sign Out' button with exit icon (red)  • Bottom navigation bar: Home, Schedule, History, Profile |

|  |  |
| --- | --- |
| ![Image: image_007.png](./student_module_documentation_images/image_007.png) | **Change Password**  Allows the student to update their account password. Requires identity re-verification via student ID and optionally an updated university ID photo.  **Functions**  • Password update — submits old password, new password, and student ID to update credentials securely  • University ID re-upload — optionally re-attaches an ID photo as part of the verification process  • Form validation — prevents submission if required fields are empty or passwords do not match  **UI Elements**  • Back navigation arrow and notification bell  • 'Change Smart Presence' heading and subtitle  • Full Name input field  • Student ID input field  • Old Password field with lock icon  • New Password field with lock icon  • ID photo upload area (cloud icon, max 5 MB)  • 'Change Password' primary submit button |

# 3. Dashboard (Home)

|  |  |
| --- | --- |
| ![Image: image_008.png](./student_module_documentation_images/image_008.png) | **Home Dashboard**  The central hub of the app. Shows the student's upcoming or active session at a glance, real-time verification signal statuses, and quick-access shortcuts to key areas.  **Functions**  • Mark Attendance — primary CTA button that launches the attendance flow for the current session  • Verification signal monitoring — live status indicators for Bluetooth, Biometric, and Secure Link readiness  • Attendance History shortcut — navigates to the full history log  • My Courses shortcut — opens the course enrollment list  • Alerts & Notices shortcut — opens the notifications panel  • Notification bell — opens unread system alerts  **UI Elements**  • User avatar and 'Welcome back, [Name]' greeting  • Notification bell with badge count  • Current Session card: course name, time, lecture hall, 'Upcoming' status badge, 'Mark Attendance' button  • 'Verification Signals' section: Bluetooth (Active), Biometric (Ready), Secure Link (Verified) status tiles  • 'Quick Access' section: Attendance History, My Courses, Alerts & Notices row links  • Bottom navigation bar: Home, Schedule, History, Profile |

# 4. Attendance Flow (Smart Radar)

|  |  |
| --- | --- |
| ![Image: image_009.png](./student_module_documentation_images/image_009.png) | **BLE Session Detection**  Activated when the student initiates the attendance process. The app scans for nearby Bluetooth proximity beacons. When a lecturer's session beacon is detected, this screen confirms the session details and signal quality.  **Functions**  • BLE proximity scan — continuously scans for nearby lecture-hall Bluetooth beacons  • Session detail display — shows matched lecture hall, time period, session code, and subject name  • Signal strength meter — live percentage bar showing proximity/reliability of the BLE connection  • Proceed to biometric — advances the flow to fingerprint verification once a valid session is found  **UI Elements**  • Back arrow, 'Smart Presence' title, notification bell  • 'Bluetooth Active' and 'Device Bound' status pills  • 'Lecturer session detected nearby' heading  • Animated radar/concentric circle graphic with location pin  • Session info: Lecture Hall, Time Period, Code, Subject  • Signal Strength bar with percentage label  • 'Connected to Proximity Beacon' status line  • 'Proceed to Biometric Verification' primary button |

|  |  |
| --- | --- |
| ![Image: image_010.png](./student_module_documentation_images/image_010.png) | **Biometric Verification**  The fingerprint identity step within the attendance flow. Confirms the student's physical presence by requiring a biometric scan tied to their registered device and the detected session.  **Functions**  • Fingerprint scan — captures the student's biometric to confirm identity for attendance  • Current location display — shows the resolved building and lecture hall name  • Course context display — shows the course code being attended  • Attendance submission — on successful scan, records presence against the live session  **UI Elements**  • Back arrow, 'Attendance' title, notification bell  • 'Bluetooth Active' and 'Device Bound' status pills  • 'Biometric Verification' heading and subtitle  • Animated fingerprint sensor circular graphic  • Current Location info and course detail card (building and hall, course)  • 'Scan Fingerprint' primary action button  • Bottom navigation bar: Home, Schedule, History, Profile |

|  |  |
| --- | --- |
| ![Image: image_011.png](./student_module_documentation_images/image_011.png) | **Attendance Success**  Confirmation screen displayed after a successful attendance submission. Shows the course details for the recorded session and provides navigation back to the dashboard or attendance history.  **Functions**  • Attendance confirmation display — renders the success state with course code, lecturer, time, and hall details  • Back to Dashboard — returns to the Home screen  • View History — navigates to the Attendance History log  **UI Elements**  • Back arrow, 'Attendance Status' title, notification bell  • Large animated checkmark success icon  • 'Attendance Marked Successfully' heading  • 'Your presence has been recorded for today's session' subtitle  • Course Details card: course code/name, lecturer, time, hall number  • 'Back to Dashboard' primary button with grid icon  • 'View History' secondary text link  • Bottom navigation bar: Home, Schedule, History, Profile |

# 5. Schedule — Upcoming Lectures

|  |  |
| --- | --- |
| ![Image: image_012.png](./student_module_documentation_images/image_012.png) | **Schedule — Today View**  Shows the student's lectures scheduled for the current day, allowing them to stay on top of their daily timetable at a glance.  **Functions**  • Filter by Today — displays only lectures scheduled for the current date  • Lecture list navigation — each row is tappable to view more details or initiate attendance  • View All shortcut — expands to the complete schedule list  **UI Elements**  • Back arrow, 'Smart Presence' title, notification bell  • Tab bar: Today (active), Week, All  • 'Upcoming Lectures' section heading with 'View All' link  • Lecture cards: course code, course name, date and time range, subject-type icon |

|  |  |
| --- | --- |
| ![Image: image_013.png](./student_module_documentation_images/image_013.png) | **Schedule — Week View**  Displays all lectures scheduled within the current week, giving the student a broader view of their upcoming academic commitments.  **Functions**  • Filter by Week — switches the list to show this week's full lecture schedule  • Lecture list navigation — tapping a row opens session details  • View All shortcut — expands to the complete schedule  **UI Elements**  • Tab bar: Today, Week (active), All  • 'Upcoming Lectures' section with 'View All' link  • Same lecture card layout with date and time info |

|  |  |
| --- | --- |
| ![Image: image_014.png](./student_module_documentation_images/image_014.png) | **Schedule — All View**  Shows every upcoming lecture across all future dates, useful for planning ahead beyond the current week.  **Functions**  • Filter by All — loads the full list of all future scheduled lectures  • Lecture list navigation — tapping a row opens session details  **UI Elements**  • Tab bar: Today, Week, All (active)  • 'Upcoming Lectures' section with 'View All' link  • Extended lecture card list with all future sessions |

# 6. Alerts & Notices

|  |  |
| --- | --- |
| ![Image: image_015.png](./student_module_documentation_images/image_015.png) | **Alerts & Notices**  Centralised notification centre for academic events, assignment reminders, and administrative updates. Each card displays the date, category tag, course name, time, and venue.  **Functions**  • Notification listing — renders all pending alerts in reverse chronological order  • Event detail display — shows full context per alert: assignment type, session date/time, and venue  • Status badge — 'Upcoming' badge highlights events that are yet to occur  **UI Elements**  • Back arrow and 'Alerts & Notices' page title  • Alert cards with: date badge, 'Assignment' category label, course name, time range, lecture hall  • 'Upcoming' status badge (green dot + label)  • Bottom navigation bar: Home, Schedule, History, Profile |

# 7. Attendance History

|  |  |
| --- | --- |
| ![Image: image_016.png](./student_module_documentation_images/image_016.png) | **Attendance History — Month View**  Provides a filtered view of the student's attendance records for the current month. The health card at the top gives an overall attendance percentage with a trend indicator.  **Functions**  • Filter by Month — shows all sessions attended and missed within the selected month  • Attendance health summary — calculates and displays overall percentage with improvement trend  • Session status display — each row shows Present/Absent badge per lecture  • Explore more — loads additional records beyond the visible list  • View All — expands the full session log  **UI Elements**  • Back arrow, 'Attendance History' title, notification bell  • Student avatar with name and student ID  • Attendance Health card: status label ('Excellent'), percentage ring (95%), trend indicator (+2.4%)  • Filter tab bar: Week, Month (active), All  • 'Recent Sessions' section with 'View All' link  • Session rows: course code/name, date/time, Present (green) or Absent (red) badge  • 'Explore more' primary button  • Bottom navigation bar: Home, Schedule, History (active), Profile |

|  |  |
| --- | --- |
| ![Image: image_017.png](./student_module_documentation_images/image_017.png) | **Attendance History — Week View**  Filters the attendance history to the current week, helping students quickly check their recent attendance compliance.  **Functions**  • Filter by Week — restricts the session list to the past 7 days  • Same session status and health summary functions as the Month view  **UI Elements**  • Filter tab bar: Week (active), Month, All  • Identical layout to Month view with week-scoped data  • Session rows with Present/Absent indicators |

|  |  |
| --- | --- |
| ![Image: image_018.png](./student_module_documentation_images/image_018.png) | **Attendance History — All View**  Displays the complete attendance history across all semesters and dates, useful for end-of-semester reviews or appeals.  **Functions**  • Filter by All — loads the full cumulative attendance record  • Same summary and status functions as Week/Month views  **UI Elements**  • Filter tab bar: Week, Month, All (active)  • Full session log with all historical Present/Absent records |

# 8. Progress

|  |  |
| --- | --- |
| ![Image: image_019.png](./student_module_documentation_images/image_019.png) | **Progress Screen**  A detailed breakdown of the student's attendance performance per subject. Features an overall health score at the top and per-course progress bars with percentage labels to highlight subjects needing attention.  **Functions**  • Overall attendance health display — shows a summary status card with percentage ring and trend change  • Recent check-in log — lists the last few attendance timestamps and their Present/Absent status  • Per-subject progress bars — colour-coded bars (green for good, red for low) show each course's attendance rate  • Monthly progress view — aggregates data to the current month for subject-level comparison  **UI Elements**  • Back arrow, 'Progress' title, notification bell  • Attendance Health card: status ('Excellent'), avatar, student ID, 95% ring, '+2.4% from last month'  • 'Recent Check-Ins' list: date/time rows with 'Present' status  • 'Monthly Progress' section header  • Per-subject progress rows: subject name, percentage label, coloured progress bar (e.g. Database 95%, OOAD 45%, OOP 85%, Capstone 90%)  • Bottom navigation bar: Home, Schedule, History, Profile |