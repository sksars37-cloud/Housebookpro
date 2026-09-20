# HouseBook Security Specification & Rules Matrix

## 1. Authentication & Role Definitions
- **Unauthenticated Users**: Can browse public property listings (`/properties`), read standard legal templates (`/legal_documents`), and view public owner profiles.
- **Authenticated Users** (`request.auth != null`):
  - Can read/write their own profile (`/users/$(request.auth.uid)`).
  - Can read/write their own notifications (`/notifications`) where `userId == request.auth.uid`.
  - Can read/write their own coin transactions (`/coin_transactions`) where `userId == request.auth.uid`.
  - Can create and manage their own property listings (`/properties`) where `ownerId == request.auth.uid`.
  - Can submit their own KYC application (`/kyc_applications/$(request.auth.uid)`).
  - Can participate in conversations (`/conversations/$(convId)`) if their UID is in `participantIds`.
  - Can send messages in conversations they are members of.
  - Can record their own UPI payment receipts.
- **Admin Users**: Have administrative access to review KYC submissions and system moderation.

## 2. Resource Path Specifications

### 2.1 `/properties/{propertyId}`
- **Read**: Public (`true`).
- **Create**: Authenticated user where `request.resource.data.ownerId == request.auth.uid`.
- **Update**: Listing owner (`resource.data.ownerId == request.auth.uid`).
- **Delete**: Listing owner (`resource.data.ownerId == request.auth.uid`).

### 2.2 `/users/{userId}`
- **Read**: Authenticated users (public fields) or self.
- **Create/Update**: Self only (`request.auth.uid == userId`).
- **Delete**: Disallowed.

### 2.3 `/notifications/{notificationId}`
- **Read**: Owner only (`resource.data.userId == request.auth.uid`).
- **Create**: Authenticated users (for sending alerts/messages to counterparties).
- **Update**: Owner only (`resource.data.userId == request.auth.uid` - e.g., mark as read).
- **Delete**: Owner only (`resource.data.userId == request.auth.uid`).

### 2.4 `/coin_transactions/{transactionId}`
- **Read**: Owner only (`resource.data.userId == request.auth.uid`).
- **Create**: Authenticated user for self transactions (`request.resource.data.userId == request.auth.uid`).
- **Update/Delete**: Disallowed (immutable ledger).

### 2.5 `/conversations/{conversationId}`
- **Read**: Participants only (`request.auth.uid in resource.data.participantIds`).
- **Create**: Participants only (`request.auth.uid in request.resource.data.participantIds`).
- **Update**: Participants only (`request.auth.uid in resource.data.participantIds`).

### 2.6 `/conversations/{conversationId}/messages/{messageId}`
- **Read**: Participants of parent conversation (`request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds`).
- **Create**: Message sender (`request.resource.data.senderId == request.auth.uid`).

### 2.7 `/kyc_applications/{applicationId}`
- **Read**: Owner (`resource.data.userId == request.auth.uid`) or Admin.
- **Create/Update**: Owner (`request.resource.data.userId == request.auth.uid`).

### 2.8 `/legal_documents/{documentId}`
- **Read**: Public (`true`).
- **Write**: Authenticated users with valid document schema.

### 2.9 `/upi_payments/{paymentId}`
- **Read**: Owner only (`resource.data.userId == request.auth.uid`).
- **Create**: Owner only (`request.resource.data.userId == request.auth.uid`).
