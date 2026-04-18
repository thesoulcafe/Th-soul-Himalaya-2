# Security Specification: The Soul Himalaya

## 1. Data Invariants

1.  **User Isolation**: A user MUST NOT be able to read or write another user's private profile data (collection `/users/{userId}`).
2.  **RBAC Integrity**: The `role` field in `/users/{userId}` MUST ONLY be modifiable by an existing Admin. Users cannot set themselves to `admin` during registration or update.
3.  **Booking Ownership**: A booking MUST be linked to the `auth.uid` of the creator. Users can only see their own bookings.
4.  **Immutability**: Fields like `createdAt` and `userId` in bookings/reviews MUST NOT be changed after creation.
5.  **Status Flow**: Users can only transition a booking status from `pending` to `cancelled`. Terminal states like `confirmed` or `paid` are Admin-only.
6.  **Temporal Integrity**: All `createdAt` fields MUST use `request.time` (Server Timestamp).
7.  **Resource Limits**: All string fields and arrays MUST have strict size limits to prevent "Denial of Wallet" attacks.

## 2. The Dirty Dozen (Vulnerability Test Payloads)

| ID | Name | Payload / Action | Expected Result |
|----|------|------------------|-----------------|
| D1 | SPOOF_UID | Create user doc with `uid: "other-user"` | PERMISSION_DENIED |
| D2 | SELF_PROMOTION | Create user doc with `role: "admin"` | PERMISSION_DENIED |
| D3 | GHOST_FIELD | Update profile with extra field `{ isVerified: true }` | PERMISSION_DENIED |
| D4 | ADMIN_HIJACK | Update role to `admin` on own profile | PERMISSION_DENIED |
| D5 | STEAL_BOOKING | List `/bookings` without filtering by `userId` | PERMISSION_DENIED |
| D6 | FAKE_TIMESTAMP | Create booking with `createdAt: "2026-01-01T00:00:00Z"` | PERMISSION_DENIED |
| D7 | NEGATIVE_GUESTS | Create booking with `guests: -5` | PERMISSION_DENIED |
| D8 | STATUS_SKIP | Update booking status from `pending` to `confirmed` | PERMISSION_DENIED |
| D9 | LONG_ID | Use a 2KB string as `reviewId` | PERMISSION_DENIED |
| D10 | UNVERIFIED_WRITE | Write to `/reviews` without `email_verified: true` in auth token | PERMISSION_DENIED |
| D11 | POINT_INJECTION | Increment `soulPoints` by 1,000,000 manually | PERMISSION_DENIED |
| D12 | MESSAGE_READ | Attempt to read `/messages` as a standard user | PERMISSION_DENIED |

## 3. Test Runner (Verification Scenarios)

The following scenarios will be verified against the rules:

### Scenario A: User Onboarding
- **Success**: User creates their own profile with `role: 'user'`, `soulPoints: 0`, and `uid` matching their auth.
- **Fail**: User tries to set `role: 'admin'`.

### Scenario B: Booking Lifecycle
- **Success**: User creates a booking with status `pending` and `createdAt: serverTimestamp()`.
- **Success**: User cancels their own `pending` booking.
- **Fail**: User tries to confirm their own booking.

### Scenario C: Review Management
- **Success**: Authenticated & Verified user posts a review.
- **Fail**: User tries to edit `userId` of an existing review.

### Scenario D: Admin Access
- **Success**: Admin (piush10122001@gmail.com) reads all `/messages` and `/bookings`.
- **Fail**: standard user tries to read `/messages`.
