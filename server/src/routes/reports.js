import { Router } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Order, OrderItem, Product, User, sequelize } from '../models/index.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { streamOrderReceipt, streamSalesReport } from '../utils/pdfGenerator.js';

const router = Router();

router.get('/analytics', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = { status: { [Op.ne]: 'cancelled' } };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const totalOrders = await Order.count({ where });
    const revenueRow = await Order.findOne({
      where,
      attributes: [[fn('COALESCE', fn('SUM', col('total')), 0), 'revenue']],
      raw: true,
    });
    const totalRevenue = Number(revenueRow.revenue || 0);

    // Revenue by day
    const dailyRows = await Order.findAll({
      where,
      attributes: [
        [fn('DATE', col('created_at')), 'day'],
        [fn('COALESCE', fn('SUM', col('total')), 0), 'revenue'],
        [fn('COUNT', col('id')), 'orders'],
      ],
      group: [literal('day')],
      order: [[literal('day'), 'ASC']],
      raw: true,
    });

    // Top products
    const topProducts = await OrderItem.findAll({
      attributes: [
        'product_id',
        [fn('SUM', col('quantity')), 'units'],
        [fn('SUM', literal('quantity * unit_price')), 'revenue'],
      ],
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image_url'] }],
      group: ['product_id', 'product.id'],
      order: [[literal('units'), 'DESC']],
      limit: 5,
    });

    // Orders by status
    const byStatus = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const customers = await User.count({ where: { role: 'customer' } });

    res.json({
      totalOrders,
      totalRevenue,
      avgCheck: totalOrders ? totalRevenue / totalOrders : 0,
      customers,
      daily: dailyRows.map((d) => ({
        day: d.day,
        revenue: Number(d.revenue),
        orders: Number(d.orders),
      })),
      topProducts: topProducts.map((p) => ({
        productId: p.product_id,
        name: p.product?.name,
        image: p.product?.image_url,
        units: Number(p.get('units')),
        revenue: Number(p.get('revenue')),
      })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
    });
  } catch (err) { next(err); }
});

router.get('/sales-pdf', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = { status: { [Op.ne]: 'cancelled' } };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    const orders = await Order.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const summary = {
      totalOrders: orders.length,
      totalRevenue,
      avgCheck: orders.length ? totalRevenue / orders.length : 0,
    };
    await streamSalesReport(orders, summary, { from, to }, res);
  } catch (err) { next(err); }
});

router.get('/order-pdf/:id', authRequired, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { association: 'promoCode' },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    await streamOrderReceipt(order, res);
  } catch (err) { next(err); }
});

export default router;
