import { Router } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Product, Category, Brand, ProductSize, Review, sequelize } from '../models/index.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const {
      q,
      categoryId,
      brandId,
      gender,
      sportType,
      minPrice,
      maxPrice,
      popular,
      size,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const where = { is_active: true };
    if (q) where.name = { [Op.iLike]: `%${q}%` };
    if (categoryId) where.category_id = categoryId;
    if (brandId) where.brand_id = brandId;
    if (gender) where.gender = gender;
    if (sportType) where.sport_type = sportType;
    if (popular === 'true') where.is_popular = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const order = (() => {
      switch (sort) {
        case 'price_asc': return [['price', 'ASC']];
        case 'price_desc': return [['price', 'DESC']];
        case 'name_asc': return [['name', 'ASC']];
        case 'name_desc': return [['name', 'DESC']];
        case 'oldest': return [['createdAt', 'ASC']];
        default: return [['createdAt', 'DESC']];
      }
    })();

    const include = [
      { model: Category, as: 'category' },
      { model: Brand, as: 'brand' },
      { model: ProductSize, as: 'sizes' },
    ];

    if (size) {
      include.push({
        model: ProductSize,
        as: 'sizes',
        where: { size, stock: { [Op.gt]: 0 } },
        required: true,
      });
      // remove duplicate
      include.splice(2, 1);
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      order,
      limit: Number(limit),
      offset,
      distinct: true,
    });

    // attach avg rating
    const productIds = rows.map((p) => p.id);
    let ratings = [];
    if (productIds.length) {
      ratings = await Review.findAll({
        where: { product_id: productIds },
        attributes: ['product_id', [fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'reviewCount']],
        group: ['product_id'],
        raw: true,
      });
    }
    const ratingMap = Object.fromEntries(
      ratings.map((r) => [r.product_id, { avg: Number(r.avgRating), count: Number(r.reviewCount) }])
    );

    res.json({
      items: rows.map((p) => ({
        ...p.toJSON(),
        rating: ratingMap[p.id]?.avg || 0,
        reviewCount: ratingMap[p.id]?.count || 0,
      })),
      total: count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/popular', async (req, res, next) => {
  try {
    const items = await Product.findAll({
      where: { is_active: true, is_popular: true },
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
      ],
      limit: 8,
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: ProductSize, as: 'sizes' },
      ],
    });
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    const reviewStats = await Review.findOne({
      where: { product_id: product.id },
      attributes: [[fn('AVG', col('rating')), 'avg'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });

    res.json({
      ...product.toJSON(),
      rating: Number(reviewStats?.avg) || 0,
      reviewCount: Number(reviewStats?.count) || 0,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: create
router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { sizes = [], ...productData } = req.body;
    if (!productData.slug && productData.name) {
      productData.slug = productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 150) + '-' + Date.now();
    }
    const product = await Product.create(productData);
    if (sizes.length) {
      await ProductSize.bulkCreate(
        sizes.map((s) => ({ product_id: product.id, size: s.size, stock: s.stock || 0 }))
      );
    }
    const full = await Product.findByPk(product.id, {
      include: [{ model: ProductSize, as: 'sizes' }],
    });
    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    const { sizes, ...productData } = req.body;
    await product.update(productData);

    if (Array.isArray(sizes)) {
      await ProductSize.destroy({ where: { product_id: product.id } });
      if (sizes.length) {
        await ProductSize.bulkCreate(
          sizes.map((s) => ({ product_id: product.id, size: s.size, stock: s.stock || 0 }))
        );
      }
    }
    const full = await Product.findByPk(product.id, {
      include: [{ model: ProductSize, as: 'sizes' }],
    });
    res.json(full);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    // soft delete: just deactivate
    product.is_active = false;
    await product.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
