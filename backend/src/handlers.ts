import { Server, Socket } from 'socket.io'
import { nanoid } from 'nanoid'
import { storage } from './storage'
import {
  JoinSessionPayload,
  CreateCardPayload,
  UpdateCardPayload,
  DeleteCardPayload,
  VoteCardPayload,
  ToggleHiddenPayload,
  RevealAllPayload,
  CreateGroupPayload,
  AddCardToGroupPayload,
  UpdateGroupTitlePayload,
  HideAllPayload,
  DeleteGroupPayload,
} from 'shared/types'

// Map socketId → sessionId for disconnect tracking
const socketSessions = new Map<string, string>()

export function registerHandlers(io: Server, socket: Socket): void {
  socket.on('session:join', (payload: JoinSessionPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) {
      socket.emit('error', { message: 'Session not found' })
      return
    }

    socket.join(payload.sessionId)

    const existing = session.participants.find((p) => p.id === payload.participantId)
    if (existing) {
      existing.socketId = socket.id
      existing.online = true
    } else {
      session.participants.push({
        id: payload.participantId,
        name: payload.participantName,
        socketId: socket.id,
        online: true,
      })
    }

    storage.saveSession(session)
    socketSessions.set(socket.id, payload.sessionId)
    socket.emit('session:state', session)
    socket.to(payload.sessionId).emit('participant:joined', session.participants)
  })

  socket.on('card:create', (payload: CreateCardPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const card = {
      id: nanoid(8),
      columnId: payload.columnId,
      text: payload.text,
      authorId: payload.authorId,
      authorName: payload.authorName,
      votes: [],
      hidden: true,
      createdAt: Date.now(),
    }

    session.cards.push(card)
    storage.saveSession(session)
    io.to(payload.sessionId).emit('card:created', card)
  })

  socket.on('card:update', (payload: UpdateCardPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const card = session.cards.find((c) => c.id === payload.cardId)
    if (!card) return

    card.text = payload.text
    storage.saveSession(session)
    io.to(payload.sessionId).emit('card:updated', card)
  })

  socket.on('card:delete', (payload: DeleteCardPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    session.cards = session.cards.filter((c) => c.id !== payload.cardId)
    session.groups = session.groups
      .map((g) => ({ ...g, cardIds: g.cardIds.filter((id) => id !== payload.cardId) }))
      .filter((g) => g.cardIds.length > 0)

    storage.saveSession(session)
    io.to(payload.sessionId).emit('card:deleted', payload.cardId)
  })

  socket.on('card:vote', (payload: VoteCardPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const card = session.cards.find((c) => c.id === payload.cardId)
    if (!card) return

    const idx = card.votes.indexOf(payload.participantId)
    if (idx === -1) {
      const totalVotes = session.cards.reduce(
        (n, c) => n + (c.votes.includes(payload.participantId) ? 1 : 0), 0,
      )
      if (totalVotes >= session.voteLimit) return
      card.votes.push(payload.participantId)
    } else {
      card.votes.splice(idx, 1)
    }

    storage.saveSession(session)
    io.to(payload.sessionId).emit('card:voted', { cardId: card.id, votes: card.votes })
  })

  socket.on('card:toggle-hidden', (payload: ToggleHiddenPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const card = session.cards.find((c) => c.id === payload.cardId)
    if (!card) return

    card.hidden = !card.hidden
    storage.saveSession(session)
    io.to(payload.sessionId).emit('card:updated', card)
  })

  socket.on('session:reveal-all', (payload: RevealAllPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    session.cards.forEach((c) => { c.hidden = false })
    storage.saveSession(session)
    io.to(payload.sessionId).emit('session:revealed', session.cards)
  })

  socket.on('session:hide-all', (payload: HideAllPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    session.cards.forEach((c) => { c.hidden = true })
    storage.saveSession(session)
    io.to(payload.sessionId).emit('session:revealed', session.cards)
  })

  socket.on('group:create', (payload: CreateGroupPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const group = {
      id: nanoid(8),
      columnId: payload.columnId,
      title: 'Group',
      cardIds: payload.cardIds,
    }

    payload.cardIds.forEach((cardId) => {
      const card = session.cards.find((c) => c.id === cardId)
      if (card) card.groupId = group.id
    })

    session.groups.push(group)
    storage.saveSession(session)
    io.to(payload.sessionId).emit('group:created', { group, cards: session.cards })
  })

  socket.on('group:add-card', (payload: AddCardToGroupPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const group = session.groups.find((g) => g.id === payload.groupId)
    const card = session.cards.find((c) => c.id === payload.cardId)
    if (!group || !card) return

    if (!group.cardIds.includes(payload.cardId)) {
      group.cardIds.push(payload.cardId)
    }
    card.groupId = payload.groupId

    storage.saveSession(session)
    io.to(payload.sessionId).emit('group:updated', group)
  })

  socket.on('group:delete', (payload: DeleteGroupPayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const group = session.groups.find((g) => g.id === payload.groupId)
    if (!group) return

    group.cardIds.forEach((cardId) => {
      const card = session.cards.find((c) => c.id === cardId)
      if (card) delete card.groupId
    })
    session.groups = session.groups.filter((g) => g.id !== payload.groupId)

    storage.saveSession(session)
    io.to(payload.sessionId).emit('group:deleted', { groupId: payload.groupId, cards: session.cards })
  })

  socket.on('group:update-title', (payload: UpdateGroupTitlePayload) => {
    const session = storage.getSession(payload.sessionId)
    if (!session) return

    const group = session.groups.find((g) => g.id === payload.groupId)
    if (!group) return

    group.title = payload.title
    storage.saveSession(session)
    io.to(payload.sessionId).emit('group:updated', group)
  })

  socket.on('disconnect', () => {
    const sessionId = socketSessions.get(socket.id)
    if (!sessionId) return

    socketSessions.delete(socket.id)

    const session = storage.getSession(sessionId)
    if (!session) return

    const participant = session.participants.find((p) => p.socketId === socket.id)
    if (participant) {
      participant.online = false
      storage.saveSession(session)
      io.to(sessionId).emit('participant:joined', session.participants)
    }
  })
}
