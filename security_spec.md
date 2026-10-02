# Security Specification: AZ Typing Fire

## Phase 0: Security Invariants & Attack Surface Analysis

### 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can ONLY be read and written by the authenticated user whose `request.auth.uid == userId`.
2. **Subcollection Inheritance**: Documents in `/users/{userId}/tests/{testId}` strictly inherit access from the parent user document. Only the owner `userId` can read or write their test records.
3. **Data Integrity & Key Constraints**:
   - `userId` must match `request.auth.uid`.
   - String length bounds: `displayName` <= 100 chars, `email` <= 120 chars, `photoURL` <= 500 chars.
   - Numeric constraints: `xp`, `level`, `bestWpm`, `avgWpm`, `avgAccuracy`, `totalWordsTyped`, `totalTestsCompleted`, `totalPracticeTimeSeconds`, `dailyStreak` must be non-negative numbers.
4. **Immutability of Identity**: `userId` in both `users` and `tests` cannot be modified on update (`incoming().userId == existing().userId`).
5. **No Blind Blanket Reads**: Listing users is forbidden (`allow list: if false`). Reading a user document is restricted to owner only (`isOwner(userId)`).

---

### 2. The "Dirty Dozen" Payloads (Designed to Fail)
1. **Ghost Field Spoof**: Attacker adds `{ "isSuperAdmin": true }` to `/users/{userId}`. (Rejected by schema/field guard).
2. **Identity Spoof**: Authenticated user `user_A` attempts to write to `/users/user_B`. (Rejected by `isOwner(userId)`).
3. **Huge String Attack (Denial of Wallet)**: `displayName` of 500,000 characters. (Rejected by `displayName.size() <= 100`).
4. **Negative XP Exploit**: Client sends `{ "xp": -99999 }`. (Rejected by `xp >= 0`).
5. **Cross-User Test Injection**: User `user_A` writes a fake 200 WPM test record to `/users/user_B/tests/test_1`. (Rejected by parent path match `request.auth.uid == userId`).
6. **Immutable UID Tamper**: User attempts to update their document with `{ "userId": "another_uid" }`. (Rejected by immutability guard).
7. **Unauthenticated Read**: Anonymous/unauthenticated visitor attempts to fetch `/users/{userId}`. (Rejected by `isSignedIn()`).
8. **Public Directory Scraping**: Client executes `db.collection('users').get()` to harvest user emails. (Rejected by catch-all or no collection-wide `allow list`).
9. **Fake Email Infiltration**: Email address longer than 120 chars or containing invalid structure. (Rejected by size limits).
10. **Type Poisoning**: `level` sent as boolean `true` instead of number. (Rejected by `data.level is number`).
11. **Orphaned Test Record**: Test record without matching `userId` field inside document data. (Rejected by `incoming().userId == userId`).
12. **Extreme WPM Manipulation**: Outlandish negative WPM or non-numeric WPM values. (Rejected by `wpm is number && wpm >= 0`).
