SmartPresence is a Fingerprint-First, Multi-Modal Biometric Attendance & Analytics System designed to eliminate attendance fraud and provide real-time analytical insights for institutions and organizations.

This system integrates biometric authentication, indoor location verification, and cloud-based analytics to create a secure, scalable, and intelligent attendance ecosystem.

Project Overview

1.Traditional attendance systems suffer from:

2.Proxy attendance

3.Manual errors

4.Lack of indoor location accuracy

5.No real-time analytics

SmartPresence solves these problems using:

1.Fingerprint authentication

2.Facial recognition backup

3. Beacon indoor verification

4.GPS geofencing

5.Real-time analytics dashboard

Objectives

1.Maximize accessibility using smartphone fingerprint sensors

2.Prevent proxy attendance using multi-modal biometric verification

3.Ensure room-level indoor accuracy using BLE Beacons

4.Maintain sub-3-second verification performance

5.Provide real-time administrative insights and anomaly alerts

System Architecture
#Backend

1.Java (JDK 21+)

2.Spring Boot 3

3.Spring Security

4.PostgreSQL / MySQL

4.RESTful APIs

#Mobile Application

1.React Native

2.Native Biometric SDKs (Fingerprint / Face)

3.BLE Integration

4.GPS Geofencing

#Cloud & Integrations

1.AWS / Azure SDK

2.Optional Cloud AI APIs for facial recognition

🔐 Core Features
1️⃣ Multi-Modal Biometric Verification

Primary: Fingerprint Authentication

Secondary: Facial Recognition / Secure PIN

2️⃣ Location-Aware Check-in

GPS geofencing

BLE Beacon scanning

Haversine distance validation

3️⃣ Real-Time Attendance Logging

Instant time-stamped database record

Sub-3-second latency

4️⃣ Admin Dashboard

Live attendance tracking

Real-time analytics

Automated anomaly alerts

5️⃣ Engagement Services

Beacon-triggered push notifications

Context-aware event alerts

📊 Functional Requirements

Secure biometric enrollment

Three-factor verification (Identity + Location + Time)

Real-time attendance logging

Automated anomaly detection

Administrative reporting

⚙ Non-Functional Requirements

99.9% system uptime

AES-256 encryption (data at rest)

TLS encryption (data in transit)

High scalability using modular/microservice architecture

Cross-platform compatibility (Android 8+ / iOS 12+)

Optimized user experience with instant visual feedback

💻 Hardware Requirements
Development

Intel Core i5 / AMD Ryzen 5

8GB RAM

256GB SSD

End Users

Android 8.0+ or iOS 12.0+

Fingerprint sensor

Camera

GPS

Bluetooth

Infrastructure

BLE Beacons deployed in indoor zones

🛠 Development Tools

IntelliJ IDEA / VS Code

Git

Postman

Figma
