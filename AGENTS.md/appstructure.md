# SmartPresence Attendance Tracking System

## Overview

Mobile attendance tracking system using BLE broadcasting and internet verification.

## Technologies

- React Native
- Expo
- NativeWind
- Keycloak Authentication
- BLE Advertising
- BLE Scanning
- REST API
- PostgreSQL

## User Roles

1. Student
2. Lecturer

## Attendance Flow

Lecturer:
- Start Session
- Generate session token
- Broadcast BLE packet

Student:
- Scan BLE packet
- Authenticate via Keycloak
- Send attendance request

Server:
- Verify token
- Verify timestamp
- Mark attendance
