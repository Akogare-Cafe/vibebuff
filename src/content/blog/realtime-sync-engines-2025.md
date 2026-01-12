---
title: "Real-time Sync Engines in 2025: LiveBlocks vs Yjs vs Automerge"
description: "Build collaborative apps like Figma and Notion. Compare LiveBlocks, Yjs, Automerge, and CRDTs for real-time multiplayer experiences."
date: "2024-10-02"
readTime: "12 min read"
tags: ["Real-time", "Collaboration", "CRDTs", "LiveBlocks", "Yjs"]
category: "Backend"
featured: false
author: "VIBEBUFF Team"
---

## Building Multiplayer Experiences

Real-time collaboration is expected in modern apps. Users want to see changes instantly, work together simultaneously, and never lose data to conflicts.

## Quick Comparison

| Library | Type | Best For | Complexity |
|---------|------|----------|------------|
| LiveBlocks | Managed | Quick setup | Low |
| Yjs | Open source | Flexibility | Medium |
| Automerge | Open source | Offline-first | Medium |
| PartyKit | Managed | Edge compute | Low |

## Understanding CRDTs

CRDTs (Conflict-free Replicated Data Types) enable automatic conflict resolution:

\`\`\`
User A: "Hello" -> "Hello World"
User B: "Hello" -> "Hello!"

Traditional: Conflict! Which wins?
CRDT: "Hello World!" (merges automatically)
\`\`\`

## LiveBlocks: Managed Simplicity

LiveBlocks provides a complete real-time infrastructure.

### Key Features
- **Presence** - show who's online, cursors
- **Storage** - persistent collaborative data
- **Rooms** - isolated collaboration spaces
- **React hooks** - excellent DX
- **Managed** - no infrastructure

### Quick Setup

\`\`\`tsx
import { useOthers, useMyPresence } from '@liveblocks/react';

function Cursors() {
  const others = useOthers();
  
  return others.map(({ connectionId, presence }) => (
    <Cursor
      key={connectionId}
      x={presence.cursor?.x}
      y={presence.cursor?.y}
    />
  ));
}
\`\`\`

### Best For
- Quick implementation
- React applications
- Teams wanting managed infrastructure

## Yjs: The Flexible Foundation

Yjs is the most popular open-source CRDT implementation.

### Key Features
- **Provider agnostic** - WebSocket, WebRTC, etc.
- **Rich text support** - Quill, ProseMirror, Monaco
- **Awareness** - presence and cursors
- **Offline support** - sync when reconnected
- **Mature** - battle-tested

### Example

\`\`\`typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const doc = new Y.Doc();
const provider = new WebsocketProvider('wss://server', 'room', doc);

const ytext = doc.getText('content');
ytext.observe(event => {
  console.log('Text changed:', ytext.toString());
});
\`\`\`

### Best For
- Custom implementations
- Multiple editor integrations
- Self-hosted requirements

## Automerge: Offline-First

Automerge excels at offline-first applications.

### Key Features
- **JSON-like API** - familiar data structures
- **Git-like history** - branch and merge
- **Offline-first** - sync later
- **Rust core** - high performance
- **Cross-platform** - JS, Rust, Swift

### Best For
- Offline-first apps
- Local-first software
- Document-based apps

## Use Cases

### Collaborative Text Editor
**Recommendation**: Yjs + ProseMirror

### Whiteboard/Canvas
**Recommendation**: LiveBlocks or Yjs

### Real-time Dashboard
**Recommendation**: LiveBlocks

### Offline-First Notes
**Recommendation**: Automerge

## Our Recommendation

- **Quick start**: LiveBlocks
- **Flexibility**: Yjs
- **Offline-first**: Automerge
- **Edge compute**: PartyKit

Explore real-time tools in our [Tools directory](/tools?category=realtime) or compare options with our [Compare tool](/compare).

## Sources
- [LiveBlocks Documentation](https://liveblocks.io/docs)
- [Yjs Documentation](https://docs.yjs.dev/)
- [Automerge Documentation](https://automerge.org/docs/)
