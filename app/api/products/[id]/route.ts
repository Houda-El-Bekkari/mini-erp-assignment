import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function extractId(url: string): string | null {
  const parts = url.split('/');
  const productsIndex = parts.indexOf('products');
  return productsIndex !== -1 && productsIndex + 1 < parts.length 
    ? parts[productsIndex + 1] 
    : null;
}

export async function GET(request: NextRequest) {
  try {
    const productId = extractId(request.url);
    
    if (!productId || productId === '[id]') {
      return NextResponse.json(
        { error: 'ID produit manquant' },
        { status: 400 }
      );
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const productId = extractId(request.url);
    const body = await request.json();
    
    if (!productId || productId === '[id]') {
      return NextResponse.json(
        { error: 'ID produit manquant' },
        { status: 400 }
      );
    }

    await db.update(products)
      .set(body)
      .where(eq(products.id, productId));

    return NextResponse.json(
      { success: true, message: 'Produit mis à jour' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const productId = extractId(request.url);
    
    if (!productId || productId === '[id]') {
      return NextResponse.json(
        { error: 'ID produit manquant' },
        { status: 400 }
      );
    }

    await db.delete(products).where(eq(products.id, productId));
    
    return NextResponse.json(
      { success: true, message: 'Produit supprimé' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}