export interface Session {
  id: string
  name: string
  createdAt: number
  columns: Column[]
  cards: Card[]
  groups: Group[]
  participants: Participant[]
}

export interface Column {
  id: string
  title: string
  emoji: string
  order: number
  color: string
}

export interface Card {
  id: string
  columnId: string
  groupId?: string
  text: string
  authorId: string
  authorName: string
  votes: string[]
  hidden: boolean
  createdAt: number
}

export interface Group {
  id: string
  columnId: string
  title: string
  cardIds: string[]
}

export interface Participant {
  id: string
  name: string
  socketId: string
  online: boolean
}

// Socket event payloads
export interface JoinSessionPayload {
  sessionId: string
  participantId: string
  participantName: string
}

export interface CreateCardPayload {
  sessionId: string
  columnId: string
  text: string
  authorId: string
  authorName: string
}

export interface UpdateCardPayload {
  sessionId: string
  cardId: string
  text: string
}

export interface DeleteCardPayload {
  sessionId: string
  cardId: string
}

export interface VoteCardPayload {
  sessionId: string
  cardId: string
  participantId: string
}

export interface ToggleHiddenPayload {
  sessionId: string
  cardId: string
}

export interface RevealAllPayload {
  sessionId: string
}

export interface HideAllPayload {
  sessionId: string
}

export interface CreateGroupPayload {
  sessionId: string
  columnId: string
  cardIds: [string, string]
}

export interface AddCardToGroupPayload {
  sessionId: string
  groupId: string
  cardId: string
}

export interface UpdateGroupTitlePayload {
  sessionId: string
  groupId: string
  title: string
}

export interface DeleteGroupPayload {
  sessionId: string
  groupId: string
}
