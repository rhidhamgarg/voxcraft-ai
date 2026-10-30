# API Design & Endpoint Specification: Original AI Voice SaaS MVP

**Document Version:** 1.0  
**Status:** REST / HTTP Specification  
**Base URL:** `https://api.yourdomain.com/api` (Production) / `http://localhost:3000/api` (Local Dev)  
**Content-Type:** `application/json` (unless binary audio stream)  

---

## 1. Global Architectural Standards

### 1.1 Response Envelope Formats
All standard JSON responses adhere to a consistent contract:

**Success Response Envelope (`200 OK`, `201 Created`):**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-30T16:30:00.000Z",
    "requestId": "req_8f192b0c"
  }
}
```

**Error Response Envelope (`400`, `401`, `402`, `404`, `429`, `500`):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Generation requires 450 credits. Current available balance is 120 credits.",
    "details": {
      "required": 450,
      "available": 120
    }
  }
}
```

### 1.2 HTTP Status Code Matrix
- `200 OK`: Successful synchronous retrieval or state query.
- `201 Created`: Generation or entity successfully created.
- `400 Bad Request`: Validation failure (empty prompt, invalid parameters).
- `401 Unauthorized`: Missing or invalid session JWT.
- `402 Payment Required`: Credit balance insufficient to satisfy generation request.
- `404 Not Found`: Voice or generation ID does not exist.
- `429 Too Many Requests`: Rate limit exceeded (e.g., maximum 5 requests/sec).
- `502 Bad Gateway`: AI voice provider network timeout or upstream failure.

---

## 2. Authentication Endpoints

### 2.1 `POST /api/auth/register`
Creates a new user profile and allocates starter credits.
- **Request Body**:
  ```json
  {
    "email": "creator@example.com",
    "password": "SecurePassword123!",
    "fullName": "Alex Rivera"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "creator@example.com",
        "fullName": "Alex Rivera",
        "subscriptionTier": "free",
        "creditsBalance": 10000
      }
    }
  }
  ```

### 2.2 `POST /api/auth/login`
Authenticates user credentials and issues an `HttpOnly` session cookie.
- **Request Body**:
  ```json
  {
    "email": "creator@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response Headers**:
  `Set-Cookie: voxcraft_session=<jwt>; Path=/; HttpOnly; Secure; SameSite=Lax`

### 2.3 `GET /api/auth/me`
Retrieves authenticated session state and real-time credits balance.
- **Headers**: Required Cookie or `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "creator@example.com",
        "subscriptionTier": "free",
        "creditsBalance": 9480,
        "creditsTotalUsed": 520
      }
    }
  }
  ```

---

## 3. Voice Catalog Endpoints

### 3.1 `GET /api/voices`
Lists available stock voice presets with optional filtering.
- **Query Parameters**:
  - `category` (optional): `conversational` | `narration` | `characters` | `social_media`
  - `gender` (optional): `female` | `male` | `non-binary`
  - `search` (optional): string filter matching name, accent, or tags
  - `limit` (default: 20, max: 100)
  - `offset` (default: 0)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "voices": [
        {
          "id": "v_elise_01",
          "name": "Elise Vance",
          "category": "conversational",
          "gender": "female",
          "accent": "American (Standard)",
          "description": "Warm, natural tone for friendly dialogues.",
          "sampleText": "Welcome to our voice platform.",
          "previewUrl": "https://cdn.voxcraft.ai/samples/elise-preview.wav",
          "tags": ["Warm", "Conversational", "Podcasts"],
          "isPremium": false
        }
      ],
      "total": 1
    }
  }
  ```

---

## 4. Speech Generation Endpoints

### 4.1 `POST /api/tts/generate` (Standard Synchronous Generation)
Generates audio, uploads to object storage, logs to history, and debits credits.
- **Request Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "text": "The quietest minds often carry the loudest revolutions.",
    "voiceId": "v_elise_01",
    "settings": {
      "stability": 0.65,
      "similarity": 0.80,
      "styleExaggeration": 0.10,
      "speed": 1.0
    },
    "format": "audio/wav"
  }
  ```
- **Validation Rules**:
  - `text`: Non-empty string, minimum 1 character, maximum 5,000 characters.
  - `voiceId`: Must resolve to an active voice preset.
  - `settings.speed`: Float between $0.5$ and $2.0$.
  - `settings.stability`: Float between $0.0$ and $1.0$.
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "generationId": "gen_88c4b2a1",
      "audioUrl": "https://cdn.voxcraft.ai/audio/gen_88c4b2a1.wav",
      "durationSeconds": 3.84,
      "characterCount": 55,
      "creditsDeducted": 55,
      "creditsRemaining": 9425,
      "providerUsed": "Deepgram Aura",
      "voice": {
        "id": "v_elise_01",
        "name": "Elise Vance"
      },
      "createdAt": "2026-10-30T16:32:00.000Z"
    }
  }
  ```

### 4.2 `POST /api/tts/stream` (Chunked Real-Time Audio Streaming)
Streams raw audio bytes directly to the client Web Audio API buffer as they are synthesized.
- **Request Body**: Same as `/api/tts/generate`.
- **Response Headers**:
  - `Content-Type: audio/mpeg` (or `audio/wav`)
  - `Transfer-Encoding: chunked`
  - `X-Audio-Duration: 3.84`
  - `X-Credits-Deducted: 55`
- **Response Body**: Raw binary stream.

---

## 5. Audio History & File Management Endpoints

### 5.1 `GET /api/history`
Returns paginated generation history for the authenticated user.
- **Query Parameters**:
  - `limit` (default: 20, max: 50)
  - `cursor` (optional pagination cursor timestamp)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "gen_88c4b2a1",
          "promptText": "The quietest minds often carry the loudest revolutions.",
          "voiceName": "Elise Vance",
          "audioUrl": "https://cdn.voxcraft.ai/audio/gen_88c4b2a1.wav",
          "durationSeconds": 3.84,
          "characterCount": 55,
          "settings": {
            "stability": 0.65,
            "speed": 1.0
          },
          "createdAt": "2026-10-30T16:32:00.000Z"
        }
      ],
      "nextCursor": null
    }
  }
  ```

### 5.2 `DELETE /api/history/:id`
Deletes a generation record and cleans up associated audio storage in R2.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": { "deletedId": "gen_88c4b2a1" }
  }
  ```

### 5.3 `GET /api/audio/:id/download`
Generates a forced-download disposition stream for saving audio directly to disk.
- **Response Headers**:
  - `Content-Type: audio/wav`
  - `Content-Disposition: attachment; filename="voxcraft-elise-vance-20261030.wav"`

---

## 6. Usage Tracking & Credit Management Endpoints

### 6.1 `GET /api/user/credits`
Returns real-time quota status and consumption metrics.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "balance": 9425,
      "tier": "free",
      "monthlyAllowance": 10000,
      "resetsAt": "2026-11-29T10:00:00.000Z",
      "totalLifetimeUsed": 575
    }
  }
  ```

### 6.2 `GET /api/user/transactions`
Retrieves the immutable audit log of credit transactions.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "transactions": [
        {
          "id": "tx_01",
          "amount": -55,
          "balanceAfter": 9425,
          "type": "tts_generation",
          "description": "Synthesized 55 characters with Elise Vance",
          "createdAt": "2026-10-30T16:32:00.000Z"
        },
        {
          "id": "tx_00",
          "amount": 10000,
          "balanceAfter": 10000,
          "type": "monthly_renewal",
          "description": "Initial starter free credit allotment",
          "createdAt": "2026-10-30T16:00:00.000Z"
        }
      ]
    }
  }
  ```
