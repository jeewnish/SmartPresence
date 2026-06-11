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


