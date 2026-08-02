# Clerk role-based access setup

## Student ID authentication

The app stores each student's Student ID in Clerk's `username` field.

In the Clerk Dashboard, open **User & authentication → Username** and enable:

- Sign-up with username
- Sign-in with username

Student IDs must contain exactly two digits, three letters, and four digits,
for example `22CIS0279`. The app normalizes the letters to uppercase before
sending the value to Clerk.

## Account policy

- Every account created through the mobile sign-up screen is a student.
- Lecturer accounts must be created by an administrator in Clerk.
- The mobile client never accepts a role from its sign-up form.
- Only `publicMetadata.role: "lecturer"` grants lecturer navigation.
- An account with no role, `student`, or an invalid role is treated as a
  student.

This default is safe because Clerk public metadata can be read by the mobile
client but cannot be changed by it.

## Create a lecturer in Clerk

1. Open the Clerk Dashboard and select the correct application and environment.
2. Open **Users** and select **Create user**.
3. Enter the lecturer's first name, last name, email address, and a temporary
   password.
4. If Clerk requires a username, enter a unique staff identifier. Lecturers
   can sign in to this app using their email address.
5. Create the user.
6. Open the new user's profile.
7. Open **User metadata** and edit **Public metadata**.
8. Save:

```json
{
  "role": "lecturer"
}
```

9. Give the lecturer their email address and temporary password. They should
   use the email option on the app's sign-in screen.

Do not put the lecturer role in unsafe metadata. Unsafe metadata can be
changed by frontend code and must not be trusted for authorization.

## Existing student accounts

Student accounts do not require role metadata because student is the secure
default. You may optionally save:

```json
{ "role": "student" }
```

After changing a role, have the user sign out and sign in again so Clerk
refreshes their session.

## Optional session claim for backend authorization

In Clerk Dashboard, open **Sessions** and customize the session token with:

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

The backend must validate the Clerk JWT and independently reject requests to
lecturer endpoints unless `metadata.role` is `lecturer`. The navigation split
in the Android app improves isolation and user experience, but it is not the
server-side security boundary.
