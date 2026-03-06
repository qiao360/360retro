import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { nanoid } from 'nanoid'
import { storage } from './storage'
import { registerHandlers } from './handlers'
import { Column } from 'shared/types'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const DEFAULT_COLUMNS: Column[] = [
  { id: 'col-1', title: 'Went Well', emoji: '✓', order: 0, color: 'green' },
  { id: 'col-2', title: 'To Improve', emoji: '↑', order: 1, color: 'amber' },
  { id: 'col-3', title: 'Action Items', emoji: '→', order: 2, color: 'blue' },
]

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/sessions', (req, res) => {
  const { name } = req.body
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const session = {
    id: nanoid(6),
    name: name.trim(),
    createdAt: Date.now(),
    voteLimit: 3,
    columns: DEFAULT_COLUMNS,
    cards: [],
    groups: [],
    participants: [],
  }

  storage.saveSession(session)
  res.status(201).json({ id: session.id })
})

app.get('/api/sessions/:id', (req, res) => {
  const session = storage.getSession(req.params.id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }
  res.json(session)
})

io.on('connection', (socket) => {
  console.log('client connected:', socket.id)
  registerHandlers(io, socket)
})

const PORT = 3000
httpServer.listen(PORT, () => {
  console.log(`backend running on http://localhost:${PORT}`)
})
