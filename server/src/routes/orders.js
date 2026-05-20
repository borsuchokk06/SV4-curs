import { Router } from 'express';
import { Op } from 'sequelize';
import {
  Order, OrderItem, Product, ProductSize, PromoCode, User, sequelize,
} from '../models/index.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = Router();

// Customer: my orders
router.get('/mine', authRequired, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: PromoCode, as: 'promoCode' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) { next(err); }
});

// Admin: list all orders
router.get('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: PromoCode, as: 'promoCode' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) { next(err); }
});

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: PromoCode, as: 'promoCode' },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    res.json(order);
  } catch (err) { next(err); }
});

// Customer: create order from cart
router.post('/', authRequired, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, shipping_address, contact_phone, payment_method = 'card', promoCode } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Корзина пуста' });
    if (!shipping_address || !contact_phone) {
      return res.status(400).json({ error: 'Адрес доставки и телефон обязательны' });
    }

    // Validate stock and prices
    let subtotal = 0;
    const itemsData = [];
    for (const it of items) {
      const product = await Product.findByPk(it.productId, { transaction: t });
      if (!product || !product.is_active) {
        throw Object.assign(new Error(`Товар №${it.productId} недоступен`), { status: 400 });
      }
      const sizeRow = await ProductSize.findOne({
        where: { product_id: product.id, size: it.size },
        transaction: t,
      });
      if (!sizeRow || sizeRow.stock < it.quantity) {
        throw Object.assign(new Error(`Недостаточно товара «${product.name}», размер ${it.size}`), { status: 400 });
      }
      const unit = Number(product.sale_price || product.price);
      subtotal += unit * it.quantity;
      itemsData.push({
        productId: product.id,
        size: it.size,
        quantity: it.quantity,
        unit_price: unit,
        sizeRow,
      });
    }

    // Apply promo
    let discount = 0;
    let promoCodeId = null;
    if (promoCode) {
      const promo = await PromoCode.findOne({
        where: { code: String(promoCode).toUpperCase().trim(), is_active: true },
        transaction: t,
      });
      if (!promo) throw Object.assign(new Error('Промокод не найден или отключён'), { status: 400 });
      if (new Date(promo.valid_until) < new Date()) {
        throw Object.assign(new Error('Срок действия промокода истёк'), { status: 400 });
      }
      if (promo.used_count >= promo.max_uses) {
        throw Object.assign(new Error('Лимит использования промокода исчерпан'), { status: 400 });
      }
      discount = Math.round(subtotal * promo.discount_percent) / 100;
      promoCodeId = promo.id;
      promo.used_count += 1;
      await promo.save({ transaction: t });
    }

    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({
      user_id: req.user.id,
      status: 'pending',
      subtotal,
      discount,
      total,
      promo_code_id: promoCodeId,
      shipping_address,
      contact_phone,
      payment_method,
    }, { transaction: t });

    for (const it of itemsData) {
      await OrderItem.create({
        order_id: order.id,
        product_id: it.productId,
        size: it.size,
        quantity: it.quantity,
        unit_price: it.unit_price,
      }, { transaction: t });
      it.sizeRow.stock -= it.quantity;
      await it.sizeRow.save({ transaction: t });
    }

    await t.commit();
    const full = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: PromoCode, as: 'promoCode' },
      ],
    });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

// Admin: update status
router.patch('/:id/status', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Недопустимый статус' });
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
});

export default router;
