import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  const business = await prisma.business.upsert({
    where: { slug: 'andre-burger' },
    update: {},
    create: {
      name: 'Andre Burger',
      slug: 'andre-burger',
      description:
        'Hamburguesas, perros, carnes y productos de la casa preparados con el sabor de Andre Burger.',
      phone: '3043800967',
      whatsappNumber: '573043800967',
      address: 'Carrera 31 # 8-60',
      openingHours: 'Lunes a domingo de 4:00 p.m. a 12:00 a.m.',
      settings: {
        create: {
          acceptsPickup: true,
          acceptsDelivery: true,
          manualDeliveryFee: true,
          primaryColor: '#F59E0B',
          secondaryColor: '#111111',
        },
      },
    },
  });

  const password = await bcrypt.hash('Admin123*', 10);

  await prisma.user.upsert({
    where: { email: 'admin@andreburger.com' },
    update: {},
    create: {
      businessId: business.id,
      name: 'Administrador Andre Burger',
      email: 'admin@andreburger.com',
      password,
      role: 'ADMIN',
    },
  });

  const categories = [
    { name: 'Hamburguesas', emoji: '🍔', sortOrder: 1 },
    { name: 'Perros calientes', emoji: '🌭', sortOrder: 2 },
    { name: 'Carnes', emoji: '🥩', sortOrder: 3 },
    { name: 'Productos de la casa', emoji: '🍟', sortOrder: 4 },
    { name: 'Bebidas', emoji: '🥤', sortOrder: 5 },
    { name: 'Adiciones', emoji: '➕', sortOrder: 6 },
  ];

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: {
        businessId_slug: {
          businessId: business.id,
          slug: slugify(category.name),
        },
      },
      update: {},
      create: {
        businessId: business.id,
        name: category.name,
        slug: slugify(category.name),
        emoji: category.emoji,
        sortOrder: category.sortOrder,
      },
    });

    categoryMap.set(category.name, created.id);
  }

  const products = [
    // Hamburguesas
    ['Hamburguesas', 'Hamburguesa Ranchera Doble', 28000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Andrés Burger', 26000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Callejera', 18000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Criolla', 22000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Clásica', 16000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Mexicana', 24000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Ranchera', 23000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Cheese Smash', 24000, '🍔'],
    ['Hamburguesas', 'Hamburguesa Golden Smash', 27000, '🍔'],

    // Perros calientes
    ['Perros calientes', 'Perro Sencillo', 12000, '🌭'],
    ['Perros calientes', 'Perro Mexicano', 17000, '🌭'],
    ['Perros calientes', 'Perro Ranchero', 18000, '🌭'],
    ['Perros calientes', 'Perro Chiscorn', 19000, '🌭'],

    // Carnes
    ['Carnes', 'Churrasco', 32000, '🥩'],
    ['Carnes', 'Punta de Anca', 35000, '🥩'],
    ['Carnes', 'Pechuga', 28000, '🍗'],
    ['Carnes', 'Filete', 30000, '🥩'],

    // Productos de la casa
    ['Productos de la casa', 'Mega Papitas', 28000, '🍟'],
    ['Productos de la casa', 'Papitas Andrés', 24000, '🍟'],
    ['Productos de la casa', 'Mazorcada', 22000, '🌽'],
    ['Productos de la casa', 'Mazorcada Desgranada', 25000, '🌽'],
    ['Productos de la casa', 'Salchipapas', 18000, '🍟'],

    // Bebidas
    ['Bebidas', 'Coca-Cola personal', 4000, '🥤'],
    ['Bebidas', 'Coca-Cola litro y medio', 8000, '🥤'],
    ['Bebidas', 'Coca-Cola tres litros', 12000, '🥤'],
    ['Bebidas', 'Ginger', 4000, '🥤'],
    ['Bebidas', 'Jugo del Valle', 4000, '🧃'],
    ['Bebidas', 'Manzana Postobón', 4000, '🥤'],
    ['Bebidas', 'Colombiana', 4000, '🥤'],
    ['Bebidas', 'Uva Postobón', 4000, '🥤'],
  ];

  for (const [categoryName, name, price, emoji] of products) {
    const categoryId = categoryMap.get(categoryName as string);

    if (!categoryId) continue;

    await prisma.product.upsert({
      where: {
        businessId_slug: {
          businessId: business.id,
          slug: slugify(name as string),
        },
      },
      update: {},
      create: {
        businessId: business.id,
        categoryId,
        name: name as string,
        slug: slugify(name as string),
        description: `${name} de Andre Burger.`,
        price: price as number,
        emoji: emoji as string,
        imageUrl: null,
      },
    });
  }

  const additions = [
    ['Porción de papa', 6000, '🍟'],
    ['Porción de tocineta', 5000, '🥓'],
    ['Porción de ensalada', 4000, '🥗'],
    ['Porción de carne desmechada', 7000, '🥩'],
    ['Porción de pollo desmechado', 7000, '🍗'],
    ['Porción de lomo de cerdo', 8000, '🥩'],
    ['Porción de pechuga', 8000, '🍗'],
    ['Porción de maduro', 5000, '🍌'],
  ];

  for (const [name, price, emoji] of additions) {
    await prisma.addition.upsert({
      where: {
        businessId_slug: {
          businessId: business.id,
          slug: slugify(name as string),
        },
      },
      update: {},
      create: {
        businessId: business.id,
        name: name as string,
        slug: slugify(name as string),
        price: price as number,
        emoji: emoji as string,
      },
    });
  }

  console.log('Seed Andre Burger ejecutado correctamente.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
