import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Temporary in-memory storage
const drops = new Map();

app.post('/api/drops', (req, res) => {
  const { expiration } = req.body;
  
  // Generate cryptographically secure values
  const dropId = crypto.randomBytes(16).toString('hex');
  const sourceToken = crypto.randomBytes(16).toString('hex');
  const creatorToken = crypto.randomBytes(16).toString('hex');
  
  // Calculate expiration timestamp
  let ms = 15 * 60 * 1000; // default 15m
  if (expiration === '5m') ms = 5 * 60 * 1000;
  if (expiration === '1h') ms = 60 * 60 * 1000;
  
  const expiresAt = Date.now() + ms;
  
  // Store temporarily in server memory
  drops.set(dropId, {
    id: dropId,
    sourceToken,
    creatorToken,
    expiresAt,
    createdAt: Date.now()
  });
  
  res.status(201).json({
    id: dropId,
    sourceToken,
    creatorToken,
    expiresAt
  });
});

app.get('/api/drops/:id', (req, res) => {
  const { token } = req.query;
  const drop = drops.get(req.params.id);
  
  if (!drop || drop.sourceToken !== token) {
    return res.status(404).json({ error: 'Drop not found, expired, or invalid token' });
  }
  
  if (Date.now() > drop.expiresAt) {
    drops.delete(drop.id);
    return res.status(404).json({ error: 'Drop expired' });
  }
  
  res.json({
    id: drop.id,
    expiresAt: drop.expiresAt
  });
});

app.post('/api/drops/:id/submit', (req, res) => {
  const { token } = req.query;
  const drop = drops.get(req.params.id);
  
  if (!drop || drop.sourceToken !== token) {
    return res.status(404).json({ error: 'Drop not found, expired, or invalid token' });
  }
  
  if (Date.now() > drop.expiresAt) {
    drops.delete(drop.id);
    return res.status(404).json({ error: 'Drop expired' });
  }
  
  if (drop.status === 'submitted') {
    return res.status(400).json({ error: 'Evidence already submitted' });
  }
  
  const { text, fileData, fileName, fileType } = req.body;
  
  drop.status = 'submitted';
  drop.evidence = { text, fileData, fileName, fileType, submittedAt: Date.now() };
  
  res.json({ success: true });
});

app.get('/api/dashboard/:id', (req, res) => {
  const { token } = req.query;
  const drop = drops.get(req.params.id);
  
  if (!drop || drop.creatorToken !== token) {
    return res.status(404).json({ error: 'Drop not found, expired, or invalid token' });
  }
  
  if (Date.now() > drop.expiresAt) {
    drops.delete(drop.id);
    return res.status(404).json({ error: 'Drop expired' });
  }
  
  res.json({
    id: drop.id,
    expiresAt: drop.expiresAt,
    createdAt: drop.createdAt,
    status: drop.status || 'pending',
    evidence: drop.evidence || null
  });
});

app.delete('/api/drops/:id', (req, res) => {
  const { token } = req.query;
  const drop = drops.get(req.params.id);
  
  if (!drop || drop.creatorToken !== token) {
    return res.status(404).json({ error: 'Drop not found or invalid token' });
  }
  
  drops.delete(req.params.id);
  
  res.json({ success: true, destroyed: true });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

export default app;
