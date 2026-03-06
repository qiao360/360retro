import { io, Socket } from 'socket.io-client'
import { useRetroStore } from '../stores/retro'
import type {
  Card,
  Group,
  Participant,
  Session,
  CreateCardPayload,
  UpdateCardPayload,
  DeleteCardPayload,
  VoteCardPayload,
  ToggleHiddenPayload,
  RevealAllPayload,
  HideAllPayload,
  CreateGroupPayload,
  AddCardToGroupPayload,
  UpdateGroupTitlePayload,
  DeleteGroupPayload,
} from 'shared/types'

let socket: Socket | null = null

export function useSocket() {
  function connect(sessionId: string, participantId: string, participantName: string) {
    if (socket?.connected) socket.disconnect()

    socket = io({ path: '/socket.io' })
    const store = useRetroStore()

    socket.on('connect', () => {
      socket!.emit('session:join', { sessionId, participantId, participantName })
    })

    socket.on('session:state', (state: Session) => store.setSession(state))
    socket.on('card:created', (card: Card) => store.addCard(card))
    socket.on('card:updated', (card: Card) => store.updateCard(card))
    socket.on('card:deleted', (cardId: string) => store.removeCard(cardId))
    socket.on('card:voted', ({ cardId, votes }: { cardId: string; votes: string[] }) =>
      store.updateVotes(cardId, votes),
    )
    socket.on('session:revealed', (cards: Card[]) => store.revealAll(cards))
    socket.on('group:created', ({ group, cards }: { group: Group; cards: Card[] }) =>
      store.addGroup(group, cards),
    )
    socket.on('group:updated', (group: Group) => store.updateGroup(group))
    socket.on('group:deleted', ({ groupId, cards }: { groupId: string; cards: Card[] }) =>
      store.deleteGroup(groupId, cards),
    )
    socket.on('participant:joined', (participants: Participant[]) =>
      store.updateParticipants(participants),
    )
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
  }

  function emit<T>(event: string, payload: T) {
    socket?.emit(event, payload)
  }

  function createCard(payload: CreateCardPayload) {
    emit('card:create', payload)
  }

  function updateCard(payload: UpdateCardPayload) {
    emit('card:update', payload)
  }

  function deleteCard(payload: DeleteCardPayload) {
    emit('card:delete', payload)
  }

  function voteCard(payload: VoteCardPayload) {
    emit('card:vote', payload)
  }

  function toggleHidden(payload: ToggleHiddenPayload) {
    emit('card:toggle-hidden', payload)
  }

  function revealAll(payload: RevealAllPayload) {
    emit('session:reveal-all', payload)
  }

  function hideAll(payload: HideAllPayload) {
    emit('session:hide-all', payload)
  }

  function createGroup(payload: CreateGroupPayload) {
    emit('group:create', payload)
  }

  function addCardToGroup(payload: AddCardToGroupPayload) {
    emit('group:add-card', payload)
  }

  function updateGroupTitle(payload: UpdateGroupTitlePayload) {
    emit('group:update-title', payload)
  }

  function deleteGroup(payload: DeleteGroupPayload) {
    emit('group:delete', payload)
  }

  return {
    connect,
    disconnect,
    createCard,
    updateCard,
    deleteCard,
    voteCard,
    toggleHidden,
    revealAll,
    hideAll,
    createGroup,
    addCardToGroup,
    updateGroupTitle,
    deleteGroup,
  }
}
