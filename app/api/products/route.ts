import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';

export async function GET() {
  try {
    const allProducts = await db.query.products.findMany({
      orderBy: (products, { desc }) => [desc(products.id)],
    });

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, price, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du produit est requis' },
        { status: 400 }
      );
    }

    const newProduct = await db.insert(products).values({
      id: `product_${Date.now()}`,
      name,
      type: type || 'service',
      price: price || 0,
      description: description || '',
    }).returning();

    return NextResponse.json(newProduct[0], { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    );
  }
}