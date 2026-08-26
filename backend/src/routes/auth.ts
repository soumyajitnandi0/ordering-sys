import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@wafflecircle.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'secret';
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '7d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

router.get('/me', (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
  
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  
  try {
    jwt.verify(token, jwtSecret);
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
