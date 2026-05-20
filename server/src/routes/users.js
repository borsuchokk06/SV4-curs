import { Router } from 'express';
import { User } from '../models/index.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'phone', 'role', 'created_at'],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (err) { next(err); }
});

router.patch('/:id/role', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Нельзя понизить роль себе' });
    }
    user.role = role;
    await user.save();
    res.json({ id: user.id, role: user.role });
  } catch (err) { next(err); }
});

export default router;
