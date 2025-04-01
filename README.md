# Vibe Analyzer

**Vibe Analyzer** - built with React + Node/Express; detects outlier songs in a Spotify playlist. 

> **Note**: As of **November 27, 2024**, Spotify has deprecated the `audio-features` endpoint. Functionality is broken until a workaround or official alternative is provided.

---

## Features

- **Spotify Login** via OAuth2
- Paste a **playlist URL or ID** to analyze
- Detect and highlight **vibe-breaking outliers**
- Previously based on Spotify's audio features (danceability, energy, valence, etc.)

---

## Tech Stack

- **Frontend**: React (with hooks), CSS
- **Backend**: Node.js, Express
- **Auth**: Spotify OAuth 2.0
- **API**: Spotify Web API
