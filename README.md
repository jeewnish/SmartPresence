SmartPresence is a Fingerprint-First, Multi-Modal Biometric Attendance & Analytics System designed to eliminate attendance fraud and provide real-time analytical insights for institutions and organizations.

This system integrates biometric authentication, indoor location verification, and cloud-based analytics to create a secure, scalable, and intelligent attendance ecosystem.

📌 Project Overview

Traditional attendance systems suffer from:

Proxy attendance

Manual errors

Lack of indoor location accuracy

No real-time analytics

SmartPresence solves these problems using:

Fingerprint authentication

Facial recognition backup

BLE Beacon indoor verification

GPS geofencing

Real-time analytics dashboard

🎯 Objectives

Maximize accessibility using smartphone fingerprint sensors

Prevent proxy attendance using multi-modal biometric verification

Ensure room-level indoor accuracy using BLE Beacons

Maintain sub-3-second verification performance

Provide real-time administrative insights and anomaly alerts

🏗 System Architecture
Backend

Java (JDK 21+)

Spring Boot 3

Spring Security

PostgreSQL / MySQL

RESTful APIs

Mobile Application

React Native

Native Biometric SDKs (Fingerprint / Face)

BLE Integration

GPS Geofencing

Cloud & Integrations

AWS / Azure SDK

Optional Cloud AI APIs for facial recognition

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

🚀 Future Enhancements

AI-based attendance pattern prediction

Advanced behavioral analytics

Multi-institution support

Integration with LMS platforms

(This project is developed as part of the IS 4110 Capstone Project.)
