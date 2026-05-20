import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import {
  User, Category, Brand, Product, ProductSize,
  Order, OrderItem, Review, Wishlist, PromoCode,
} from '../models/index.js';

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ' ': '-',
};

function slugify(s) {
  return s.toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] !== undefined ? TRANSLIT[ch] : ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) { return arr[rand(0, arr.length - 1)]; }

async function main() {
  await sequelize.authenticate();
  console.log('Сброс БД...');
  await sequelize.sync({ force: true });

  console.log('Создание пользователей...');
  const adminHash = await bcrypt.hash('admin12345', 10);
  const customerHash = await bcrypt.hash('user12345', 10);

  const admin = await User.create({
    email: 'admin@sportarena.com',
    password_hash: adminHash,
    name: 'Администратор Петров',
    phone: '+375 29 111-11-11',
    role: 'admin',
    address: 'г. Могилёв, пр-т Мира, 43',
  });

  const customerSeedData = [
    ['ivan@mail.com', 'Иван Сидоров', '+375 29 222-33-44'],
    ['olga@mail.com', 'Ольга Смирнова', '+375 29 333-44-55'],
    ['nikolai@mail.com', 'Николай Волков', '+375 33 111-22-33'],
    ['anna@mail.com', 'Анна Петрова', '+375 44 555-66-77'],
    ['dmitry@mail.com', 'Дмитрий Козлов', '+375 25 888-99-00'],
    ['elena@mail.com', 'Елена Морозова', '+375 29 444-55-66'],
    ['sergei@mail.com', 'Сергей Белов', '+375 33 999-88-77'],
    ['maria@mail.com', 'Мария Орлова', '+375 44 222-11-00'],
    ['alex@mail.com', 'Александр Лебедев', '+375 25 333-22-11'],
    ['tatyana@mail.com', 'Татьяна Соколова', '+375 29 666-77-88'],
    ['pavel@mail.com', 'Павел Новиков', '+375 33 555-44-33'],
    ['irina@mail.com', 'Ирина Павлова', '+375 44 777-88-99'],
  ];
  const customers = await Promise.all(
    customerSeedData.map(([email, name, phone]) =>
      User.create({
        email, name, phone,
        password_hash: customerHash,
        role: 'customer',
        address: `г. Минск, пр-т Независимости, ${rand(1, 200)}, кв. ${rand(1, 250)}`,
      })
    )
  );
  console.log(`  ${1 + customers.length} пользователей`);

  console.log('Создание категорий...');
  const categoriesData = [
    ['Футболки и топы', '👕'],
    ['Худи и свитшоты', '🧥'],
    ['Брюки и джоггеры', '👖'],
    ['Шорты', '🩳'],
    ['Кроссовки', '👟'],
    ['Куртки', '🧥'],
    ['Спортивные топы', '👙'],
    ['Леггинсы', '🦵'],
    ['Аксессуары', '🧢'],
    ['Футбольная экипировка', '⚽'],
  ];
  const categories = await Promise.all(
    categoriesData.map(([name, icon], i) =>
      Category.create({ name, slug: `category-${i + 1}-${slugify(name)}`, icon })
    )
  );
  console.log(`  ${categories.length} категорий`);

  console.log('Создание брендов...');
  const brandsData = [
    ['Nike', 'США'],
    ['Adidas', 'Германия'],
    ['Puma', 'Германия'],
    ['Under Armour', 'США'],
    ['Reebok', 'США'],
    ['New Balance', 'США'],
    ['ASICS', 'Япония'],
    ['Mizuno', 'Япония'],
    ['Columbia', 'США'],
    ['Salomon', 'Франция'],
  ];
  const brands = await Promise.all(
    brandsData.map(([name, country]) =>
      Brand.create({ name, slug: slugify(name), country })
    )
  );
  console.log(`  ${brands.length} брендов`);

  console.log('Создание товаров...');
  const productTemplates = [
    // Футболки
    { catIdx: 0, name: 'Беговая футболка Dri-FIT', basePrice: 95, sport: 'Running', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' },
    { catIdx: 0, name: 'Хлопковая футболка Classic', basePrice: 75, sport: 'Training', img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600' },
    { catIdx: 0, name: 'Поло Performance', basePrice: 120, sport: 'Tennis', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600' },
    // Худи
    { catIdx: 1, name: 'Худи Tech Fleece', basePrice: 240, sport: 'Training', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600' },
    { catIdx: 1, name: 'Свитшот плотный Heavyweight', basePrice: 200, sport: 'Training', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600' },
    { catIdx: 1, name: 'Худи Pullover Classic', basePrice: 175, sport: 'Training', img: 'https://images.unsplash.com/photo-1542406775-ade58c52d2e4?w=600' },
    // Брюки
    { catIdx: 2, name: 'Джоггеры зауженные', basePrice: 150, sport: 'Training', img: 'https://images.unsplash.com/photo-1473966968600-fa801b96a598?w=600' },
    { catIdx: 2, name: 'Брюки ветрозащитные', basePrice: 190, sport: 'Running', img: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600' },
    // Шорты
    { catIdx: 3, name: 'Беговые шорты 5"', basePrice: 85, sport: 'Running', img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600' },
    { catIdx: 3, name: 'Шорты для зала Pro', basePrice: 75, sport: 'Training', img: 'https://images.unsplash.com/photo-1591195854279-cae16e6c4f4c?w=600' },
    // Кроссовки
    { catIdx: 4, name: 'Кроссовки Air Zoom Pegasus', basePrice: 350, sport: 'Running', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
    { catIdx: 4, name: 'Кроссовки Ultraboost Light', basePrice: 480, sport: 'Running', img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600' },
    { catIdx: 4, name: 'Кроссовки Court Vision Lo', basePrice: 200, sport: 'Basketball', img: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600' },
    { catIdx: 4, name: 'Кроссовки Gel-Kayano 30', basePrice: 440, sport: 'Running', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
    // Куртки
    { catIdx: 5, name: 'Куртка Windrunner', basePrice: 290, sport: 'Running', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600' },
    { catIdx: 5, name: 'Куртка-дождевик Rain Shell', basePrice: 390, sport: 'Hiking', img: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600' },
    // Спортивные топы
    { catIdx: 6, name: 'Спортивный топ высокой поддержки', basePrice: 120, sport: 'Running', img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600' },
    { catIdx: 6, name: 'Спортивный топ средней поддержки', basePrice: 100, sport: 'Yoga', img: 'https://images.unsplash.com/photo-1518310790802-723a1d04f8a6?w=600' },
    // Леггинсы
    { catIdx: 7, name: 'Леггинсы для йоги High-Rise', basePrice: 175, sport: 'Yoga', img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600' },
    { catIdx: 7, name: 'Леггинсы для тренировок 7/8', basePrice: 155, sport: 'Training', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600' },
    // Аксессуары
    { catIdx: 8, name: 'Рюкзак спортивный 30 л.', basePrice: 150, sport: 'Hiking', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
    { catIdx: 8, name: 'Кепка Snapback', basePrice: 65, sport: 'Training', img: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600' },
    { catIdx: 8, name: 'Носки Crew, набор 3 пары', basePrice: 50, sport: 'Running', img: 'https://images.unsplash.com/photo-1586350977771-b3714c4a8f31?w=600' },
    // Футбол
    { catIdx: 9, name: 'Футбольная джерси Home', basePrice: 260, sport: 'Football', img: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600' },
    { catIdx: 9, name: 'Бутсы Mercurial', basePrice: 380, sport: 'Football', img: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600' },
  ];

  const genders = ['male', 'female', 'unisex'];
  const products = [];
  for (let i = 0; i < productTemplates.length; i++) {
    const tpl = productTemplates[i];
    const brand = brands[i % brands.length];
    const price = tpl.basePrice + rand(-5, 25);
    const onSale = Math.random() < 0.3;
    const product = await Product.create({
      name: `${brand.name} ${tpl.name}`,
      slug: `${brand.slug}-tovar-${i}`,
      description: `Премиальная модель «${tpl.name}» от ${brand.name}. Разработана для занятий: ${russianSport(tpl.sport)}. Дышащий материал, эргономичный крой, прочные швы и износостойкие материалы. Идеальный выбор для тех, кто требует максимума от экипировки.`,
      price,
      sale_price: onSale ? Math.round(price * 0.8) : null,
      gender: genders[i % genders.length],
      sport_type: tpl.sport,
      image_url: tpl.img,
      is_popular: i % 4 === 0,
      is_active: true,
      category_id: categories[tpl.catIdx].id,
      brand_id: brand.id,
    });
    products.push(product);
  }
  console.log(`  ${products.length} товаров`);

  console.log('Создание размеров...');
  const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes = ['38', '39', '40', '41', '42', '43', '44', '45'];
  const accessorySizes = ['One Size'];
  let sizeCount = 0;
  for (const p of products) {
    const cat = categories.find((c) => c.id === p.category_id);
    let sizes;
    if (cat.name === 'Кроссовки' || cat.name === 'Футбольная экипировка') sizes = shoeSizes;
    else if (cat.name === 'Аксессуары') sizes = accessorySizes;
    else sizes = apparelSizes;
    for (const sz of sizes) {
      await ProductSize.create({
        product_id: p.id,
        size: sz,
        stock: rand(0, 25),
      });
      sizeCount++;
    }
  }
  console.log(`  ${sizeCount} строк размеров`);

  console.log('Создание промокодов...');
  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 86400000);
  const promoCodes = await Promise.all([
    PromoCode.create({ code: 'WELCOME10', discount_percent: 10, valid_until: future(60), max_uses: 1000, is_active: true }),
    PromoCode.create({ code: 'SPORT20', discount_percent: 20, valid_until: future(30), max_uses: 200, is_active: true }),
    PromoCode.create({ code: 'SUMMER15', discount_percent: 15, valid_until: future(45), max_uses: 500, is_active: true }),
    PromoCode.create({ code: 'BLACKFRI30', discount_percent: 30, valid_until: future(14), max_uses: 300, is_active: true }),
    PromoCode.create({ code: 'STUDENT5', discount_percent: 5, valid_until: future(365), max_uses: 10000, is_active: true }),
    PromoCode.create({ code: 'EXPIRED', discount_percent: 50, valid_until: new Date(now.getTime() - 86400000), max_uses: 100, is_active: true }),
  ]);
  console.log(`  ${promoCodes.length} промокодов`);

  console.log('Создание заказов...');
  const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  let orderCount = 0;
  let itemCount = 0;
  for (let i = 0; i < 25; i++) {
    const customer = pick(customers);
    const itemsCount = rand(1, 4);
    const items = [];
    let subtotal = 0;
    const usedProducts = new Set();
    for (let j = 0; j < itemsCount; j++) {
      let product;
      do { product = pick(products); } while (usedProducts.has(product.id));
      usedProducts.add(product.id);
      const sizes = await ProductSize.findAll({ where: { product_id: product.id } });
      const sizeRow = pick(sizes);
      const qty = rand(1, 3);
      const unit = Number(product.sale_price || product.price);
      subtotal += unit * qty;
      items.push({ product, sizeRow, qty, unit });
    }
    const usePromo = Math.random() < 0.4;
    const promo = usePromo ? pick(promoCodes.slice(0, 5)) : null;
    const discount = promo ? Math.round(subtotal * promo.discount_percent) / 100 : 0;
    const status = pick(statuses);
    const daysAgo = rand(0, 90);
    const createdAt = new Date(now.getTime() - daysAgo * 86400000);

    const order = await Order.create({
      user_id: customer.id,
      status,
      subtotal,
      discount,
      total: subtotal - discount,
      promo_code_id: promo?.id || null,
      shipping_address: customer.address,
      contact_phone: customer.phone,
      payment_method: pick(['card', 'cash']),
    });
    // Backdate created_at so analytics charts have multi-day data
    await sequelize.query(
      `UPDATE orders SET created_at = :ts, updated_at = :ts WHERE id = :id`,
      { replacements: { ts: createdAt, id: order.id } }
    );

    for (const it of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: it.product.id,
        size: it.sizeRow.size,
        quantity: it.qty,
        unit_price: it.unit,
      });
      itemCount++;
    }
    orderCount++;
  }
  console.log(`  ${orderCount} заказов, ${itemCount} позиций`);

  console.log('Создание отзывов...');
  const reviewTexts = [
    'Отличное качество и идеальная посадка по фигуре, очень доволен покупкой!',
    'Материал приятный к телу, размер соответствует. Рекомендую.',
    'Быстрая доставка, товар совпадает с описанием.',
    'За свою цену неплохо, но ожидал чуть лучшего качества швов.',
    'Мой новый фаворит для тренировок.',
    'Хорошо выглядит, дышит, после нескольких стирок не теряет вид.',
    'В плечах немного узковато, в остальном отлично.',
    'Покупал в подарок, угодил на 100%!',
    'Крепкое исполнение, подходит для повседневной носки.',
    'Удобный и стильный, обязательно куплю ещё.',
    'Отличный выбор для занятий спортом, легко стирается.',
    'Сидит как влитой, цвет соответствует фото.',
    'Цена-качество на уровне, доволен заказом.',
    'Долго ждал доставку, но товар того стоит.',
    'Очень мягкий и приятный материал, рекомендую.',
  ];
  let reviewCount = 0;
  const reviewKeys = new Set();
  for (let i = 0; i < 40; i++) {
    const product = pick(products);
    const customer = pick(customers);
    const key = `${product.id}-${customer.id}`;
    if (reviewKeys.has(key)) continue;
    reviewKeys.add(key);
    await Review.create({
      product_id: product.id,
      user_id: customer.id,
      rating: rand(3, 5),
      text: pick(reviewTexts),
    });
    reviewCount++;
  }
  console.log(`  ${reviewCount} отзывов`);

  console.log('Создание избранного...');
  let wishCount = 0;
  const wishKeys = new Set();
  for (let i = 0; i < 30; i++) {
    const product = pick(products);
    const customer = pick(customers);
    const key = `${product.id}-${customer.id}`;
    if (wishKeys.has(key)) continue;
    wishKeys.add(key);
    await Wishlist.create({ user_id: customer.id, product_id: product.id });
    wishCount++;
  }
  console.log(`  ${wishCount} записей в избранном`);

  const total = 1 + customers.length + categories.length + brands.length + products.length
    + sizeCount + promoCodes.length + orderCount + itemCount + reviewCount + wishCount;
  console.log(`\n=== ИТОГО СТРОК В БД: ${total} ===`);
  console.log('\nДанные для входа:');
  console.log('  Админ      → admin@sportarena.com / admin12345');
  console.log('  Покупатель → ivan@mail.com / user12345');
}

function russianSport(en) {
  const map = {
    Running: 'бег', Football: 'футбол', Basketball: 'баскетбол',
    Yoga: 'йога', Training: 'тренировки в зале', Tennis: 'теннис', Hiking: 'хайкинг',
  };
  return map[en] || en;
}

main()
  .then(() => { console.log('Заполнение завершено.'); process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
