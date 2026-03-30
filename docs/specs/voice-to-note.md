# Voice-to-Note

**Status:** COMPLETE
**Date:** 2026-03-29

---

## Requirements

### Voice Recording & Transcription
- User can dictate text that gets transcribed and appended to the note body in real time.
- Triggered from the **note editor** page only.
- Uses the browser's **Web Speech API** (`SpeechRecognition`) — no backend changes, no API keys, zero cost.
- Transcribed text is appended at the cursor position (or end of body) as the user speaks.

### UI (from designs)

**Idle state:**
- A dark circular floating button (FAB) in the **bottom-right** corner of the note editor.
- Icon: headphones/headset.

**Recording state:**
- The FAB expands into a **pill-shaped toolbar** anchored to the bottom-right.
- Left side: microphone icon (white) + red stop button (phone-hangup style).
- Right side: live audio **waveform visualization** + headphones icon.
- The pill background matches the note's category color (slightly darker/more opaque).
- Bordered with a darker shade.

**Behavior:**
- Click the FAB → starts recording, FAB expands to pill.
- Transcribed words appear in the note body in real time (interim results shown as they come).
- Click the red stop button → stops recording, pill collapses back to FAB.
- Auto-save fires normally after transcription (existing 1s debounce).
- If the browser doesn't support Speech Recognition, the FAB is hidden (graceful degradation).

---

## Acceptance Criteria

1. Clicking the FAB starts voice recording; the browser asks for microphone permission if needed.
2. Spoken words appear in the note body in real time.
3. Clicking stop ends recording and collapses the toolbar.
4. The waveform animates while recording.
5. The FAB is hidden in browsers that don't support `SpeechRecognition`.
6. No backend changes required.
7. Existing auto-save handles persisting the transcribed text.

---

## Design

### Component Architecture

This is a **frontend-only** feature. No backend or API changes.

```
NoteEditor (existing)
└── VoiceRecorder (new)
    ├── FAB button (idle state)
    └── RecordingToolbar (recording state)
        ├── MicIcon
        ├── StopButton
        ├── Waveform (canvas or animated bars)
        └── HeadphonesIcon
```

### Technical Approach

**Web Speech API** (`window.SpeechRecognition` or `window.webkitSpeechRecognition`):
- `continuous = true` — keeps listening until manually stopped.
- `interimResults = true` — shows partial transcription in real time.
- `onresult` — appends final transcript segments to the note body.
- `onerror` / `onend` — handles failures gracefully (stop recording, show brief error).

**Waveform visualization**:
- Use `navigator.mediaDevices.getUserMedia({ audio: true })` to get an `AudioContext` + `AnalyserNode`.
- Render frequency data as animated bars or a wave in a small canvas/SVG inside the pill.
- Disconnect the stream when recording stops.

**Browser support**: Chrome, Edge, Safari (desktop + mobile). Firefox lacks `SpeechRecognition` — the FAB will be hidden there.

### Data Flow

```
User clicks FAB
  → getUserMedia() (mic permission)
  → SpeechRecognition.start()
  → AudioContext + AnalyserNode (for waveform)
  → onresult: append transcript to note body state
  → existing debounced auto-save picks up the change

User clicks Stop
  → SpeechRecognition.stop()
  → AudioContext.close()
  → Collapse pill back to FAB
```

### File Changes

| File | Change |
|------|--------|
| `frontend/src/components/VoiceRecorder.tsx` | **New** — FAB + recording toolbar + waveform |
| `frontend/src/components/NoteEditor.tsx` | Add `VoiceRecorder` to the editor, pass `onAppendText` callback |
| `frontend/src/app/notes/[id]/page.tsx` | No change (body state already flows through `onBodyChange`) |

---

## Tasks

- [ ] **T1: VoiceRecorder component**
  - Create `frontend/src/components/VoiceRecorder.tsx`
  - Idle state: dark circular FAB with headphones icon, positioned bottom-right
  - Recording state: pill toolbar with mic icon, red stop button, waveform, headphones icon
  - Hook up `SpeechRecognition` API (start/stop, interim + final results)
  - Hook up `AudioContext` + `AnalyserNode` for waveform data
  - Render waveform as animated bars in a canvas element
  - Detect browser support; render nothing if unsupported
  - Props: `onTranscript(text: string)` callback, `accentColor` for pill background

- [ ] **T2: Integrate into NoteEditor**
  - Add `VoiceRecorder` to `NoteEditor.tsx` at the bottom of the editor
  - Wire `onTranscript` to append text to the body (via `onBodyChange`)
  - Pass category `bg_color` as the accent color for the pill

---

## Implementation Notes

*To be filled during implementation.*

---

## Review

*To be filled after implementation.*
