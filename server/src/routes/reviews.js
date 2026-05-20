import { Router } from 'express';
import { Review, User } from '../models/index.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: req.params.productId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (err) { next(err); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { product_id, rating, text } = req.body;
    if (!product_id || !rating || !text) {
      return res.status(400).json({ error: 'Поля product_id, rating и text обязательны' });
    }
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Оценка должна быть от 1 до 5' });

    const existing = await Review.findOne({ where: { product_id, user_id: req.user.id } });
    if (existing) {
      await existing.update({ rating, text });
      const withUser = await Review.findByPk(existing.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      });
      return res.json(withUser);
    }
    const review = await Review.create({
      product_id, user_id: req.user.id, rating, text,
    });
    const withUser = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    });
    res.status(201).json(withUser);
  } catch (err) { next(err); }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Отзыв не найден' });
    if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    await review.destroy();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
