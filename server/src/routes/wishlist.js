import { Router } from 'express';
import { Wishlist, Product, Brand, Category } from '../models/index.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    const productIds = items.map((w) => w.product_id);
    const products = productIds.length
      ? await Product.findAll({
          where: { id: productIds },
          include: [
            { model: Brand, as: 'brand' },
            { model: Category, as: 'category' },
          ],
        })
      : [];
    res.json(products);
  } catch (err) { next(err); }
});

router.post('/:productId', authRequired, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    const [, created] = await Wishlist.findOrCreate({
      where: { user_id: req.user.id, product_id: productId },
    });
    res.status(created ? 201 : 200).json({ ok: true, added: created });
  } catch (err) { next(err); }
});

router.delete('/:productId', authRequired, async (req, res, next) => {
  try {
    await Wishlist.destroy({
      where: { user_id: req.user.id, product_id: req.params.productId },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
