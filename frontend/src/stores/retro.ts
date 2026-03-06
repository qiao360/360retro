import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, Card, Group, Participant } from 'shared/types'

export const useRetroStore = defineStore('retro', () => {
  const session = ref<Session | null>(null)

  const cardsByColumn = computed(() => {
    if (!session.value) return {}
    return session.value.cards.reduce<Record<string, Card[]>>((acc, card) => {
      if (!card.groupId) {
        if (!acc[card.columnId]) acc[card.columnId] = []
        acc[card.columnId].push(card)
      }
      return acc
    }, {})
  })

  const groupsByColumn = computed(() => {
    if (!session.value) return {}
    return session.value.groups.reduce<Record<string, Group[]>>((acc, group) => {
      if (!acc[group.columnId]) acc[group.columnId] = []
      acc[group.columnId].push(group)
      return acc
    }, {})
  })

  function setSession(s: Session) {
    session.value = s
  }

  function addCard(card: Card) {
    session.value?.cards.push(card)
  }

  function updateCard(updated: Card) {
    if (!session.value) return
    const idx = session.value.cards.findIndex((c) => c.id === updated.id)
    if (idx !== -1) session.value.cards[idx] = updated
  }

  function removeCard(cardId: string) {
    if (!session.value) return
    session.value.cards = session.value.cards.filter((c) => c.id !== cardId)
    session.value.groups = session.value.groups
      .map((g) => ({ ...g, cardIds: g.cardIds.filter((id) => id !== cardId) }))
      .filter((g) => g.cardIds.length > 0)
  }

  function updateVotes(cardId: string, votes: string[]) {
    const card = session.value?.cards.find((c) => c.id === cardId)
    if (card) card.votes = votes
  }

  function revealAll(cards: Card[]) {
    if (!session.value) return
    session.value.cards = cards
  }

  function addGroup(group: Group, updatedCards: Card[]) {
    session.value?.groups.push(group)
    if (session.value) session.value.cards = updatedCards
  }

  function updateGroup(updated: Group) {
    if (!session.value) return
    const existing = session.value.groups.find((g) => g.id === updated.id)
    if (!existing) return
    existing.title = updated.title
    existing.cardIds = updated.cardIds
    // Sync groupId on any newly added card
    const lastCardId = updated.cardIds.at(-1)
    const card = session.value.cards.find((c) => c.id === lastCardId)
    if (card) card.groupId = updated.id
  }

  function deleteGroup(groupId: string, updatedCards: Card[]) {
    if (!session.value) return
    session.value.groups = session.value.groups.filter((g) => g.id !== groupId)
    session.value.cards = updatedCards
  }

  function updateParticipants(participants: Participant[]) {
    if (session.value) session.value.participants = participants
  }

  return {
    session,
    cardsByColumn,
    groupsByColumn,
    setSession,
    addCard,
    updateCard,
    removeCard,
    updateVotes,
    revealAll,
    addGroup,
    updateGroup,
    deleteGroup,
    updateParticipants,
  }
})
