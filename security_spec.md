# Security Specification: CEME Firebase / Firestore Rules

This document outlines the security architecture, relational invariants, and data integrity guarantees for the CEME platform database.

## 1. Data Invariants

-   **Admin Privilege (Role-Based Access)**: Only authenticated users with the verified email `impacttech237@gmail.com` have `write` (create, update, delete) permissions over all CMS collections (`recommended_links`, `gallery_photos`, `church_events`, `testimonials`, `study_documents`).
-   **Unverified Sign-In**: Anyone authenticated with Google Login is restricted to `read` operations. Public visitors can also `read` active elements to see schedules and download PDFs.
-   **Temporal Consistency**: Timestamp fields such as `createdAt` must match `request.time` exactly at creation and are immutable.
-   **Identity & Scope**: Admin elements cannot be manipulated by anonymous or unverified identities.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to break access rules and must return `PERMISSION_DENIED`.

### Payload 1: Anonymous Create on Recommended Link
-   **Collection**: `/recommended_links/`
-   **Operation**: `create`
-   **Auth State**: Unauthenticated
-   **Data**: `{ "title": "Injected Hack", "youtubeId": "xyz123", "category": "Sermon" }`
-   **Result**: `PERMISSION_DENIED`

### Payload 2: Member but Not Admin Write Link
-   **Collection**: `/recommended_links/`
-   **Operation**: `create`
-   **Auth State**: Under `member@gmail.com`, UID `test-uid`
-   **Data**: `{ "id": "atk-1", "title": "Impersonated", "youtubeId": "xyz1", "category": "Louange" }`
-   **Result**: `PERMISSION_DENIED`

### Payload 3: Fake Admin E-mail Spoof (Not verified)
-   **Collection**: `/gallery_photos/`
-   **Operation**: `create`
-   **Auth State**: Token `{ email: "impacttech237@gmail.com", email_verified: false }`
-   **Data**: `{ "id": "p-1", "category": "Cultes", "title": "Spoofed Event", "url": "https://hack.com" }`
-   **Result**: `PERMISSION_DENIED`

### Payload 4: Invalid ID Character Injection (Path Vulnerability)
-   **Collection**: `/church_events/`
-   **Operation**: `create`
-   **Auth State**: Authenticated Admin `impacttech237@gmail.com`
-   **Path ID**: `event$hack#%^&*`
-   **Result**: `PERMISSION_DENIED` (IDs must comply with `isValidId`)

### Payload 5: Sizing Poisoning (1MB String Title)
-   **Collection**: `/church_events/`
-   **Operation**: `create`
-   **Auth State**: Authenticated Admin `impacttech237@gmail.com`
-   **Data**: `{ "id": "ev-1", "title": "[1MB STRING...]", "type": "special", "dateStr": "Today", "isoDate": "2026-06-05", "location": "Temple", "badge": "Special", "image": "img.png" }`
-   **Result**: `PERMISSION_DENIED` (Exceeds size limits)

### Payload 6: Field Alteration on Update (Shadow Update to Event Type)
-   **Collection**: `/church_events/ev-1`
-   **Operation**: `update`
-   **Auth State**: Non-Admin Member
-   **Data**: Attempts to modify type field
-   **Result**: `PERMISSION_DENIED`

### Payload 7: Fake Testimonial by Member
-   **Collection**: `/testimonials/`
-   **Operation**: `create`
-   **Auth State**: Non-Admin Member
-   **Data**: `{ "id": "t-1", "author": "Hacker", "since": "Since now", "text": "Hacked!", "category": "home" }`
-   **Result**: `PERMISSION_DENIED`

### Payload 8: Study Document Overwrite by Stranger
-   **Collection**: `/study_documents/doc-1`
-   **Operation**: `write`
-   **Auth State**: Unauthenticated
-   **Data**: Overwriting URL with malicious download payload
-   **Result**: `PERMISSION_DENIED`

### Payload 9: Forged Timestamp Creation (Bypass Request Time)
-   **Collection**: `/study_documents/`
-   **Operation**: `create`
-   **Auth State**: Authenticated Admin `impacttech237@gmail.com`
-   **Data**: `{ "id": "doc-2", "title": "Sermon", "url": "http://g.com", "fileType": "PDF", "createdAt": "2020-01-01" }`
-   **Result**: `PERMISSION_DENIED` (Must match `request.time`)

### Payload 10: Deleting Gallery Image without Admin verification
-   **Collection**: `/gallery_photos/photo-1`
-   **Operation**: `delete`
-   **Auth State**: Authenticated Member (verified email but not admin)
-   **Result**: `PERMISSION_DENIED`

### Payload 11: Bulk Overwrite (No hasOnly definition)
-   **Collection**: `/recommended_links/link-1`
-   **Operation**: `update`
-   **Auth State**: Admin (but adding key not specified in schema)
-   **Data**: `{ "xyz": "extra random value" }`
-   **Result**: `PERMISSION_DENIED`

### Payload 12: Anonymous Delete of Testimonials
-   **Collection**: `/testimonials/t-1`
-   **Operation**: `delete`
-   **Auth State**: Unauthenticated
-   **Result**: `PERMISSION_DENIED`
