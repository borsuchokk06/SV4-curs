import { Router } from 'express';
import { Category } from '../models/index.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const item = await Category.create(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.patch('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const item = await Category.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Категория не найдена' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const item = await Category.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Категория не найдена' });
    await item.destroy();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
