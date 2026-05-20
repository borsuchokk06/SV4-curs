import { Router } from 'express';
import { PromoCode } from '../models/index.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/validate/:code', async (req, res, next) => {
  try {
    const promo = await PromoCode.findOne({
      where: { code: req.params.code.toUpperCase().trim(), is_active: true },
    });
    if (!promo) return res.status(404).json({ valid: false, error: 'Промокод не найден' });
    if (new Date(promo.valid_until) < new Date()) {
      return res.status(400).json({ valid: false, error: 'Срок действия промокода истёк' });
    }
    if (promo.used_count >= promo.max_uses) {
      return res.status(400).json({ valid: false, error: 'Лимит использования исчерпан' });
    }
    res.json({ valid: true, code: promo.code, discount_percent: promo.discount_percent });
  } catch (err) { next(err); }
});

router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const items = await PromoCode.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const data = { ...req.body, code: String(req.body.code).toUpperCase().trim() };
    const item = await PromoCode.create(data);
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.patch('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const item = await PromoCode.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Промокод не найден' });
    await item.update(req.body);
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const item = await PromoCode.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Промокод не найден' });
    await item.destroy();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
