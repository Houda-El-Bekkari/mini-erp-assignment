import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Fonction pour extraire l'ID
async function getParams(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  return { id };
}

export async function PATCH(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    const body = await request.json();
    
    if (!id || id === '[id]') {
      return NextResponse.json(
        { error: 'ID lead manquant' },
        { status: 400 }
      );
    }

    // Mettre à jour le lead
    await db.update(leads)
      .set(body)
      .where(eq(leads.id, id));

    return NextResponse.json(
      { success: true, message: 'Lead mis à jour' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    if (!id || id === '[id]') {
      return NextResponse.json(
        { error: 'ID lead manquant' },
        { status: 400 }
      );
    }

    await db.delete(leads).where(eq(leads.id, id));
    
    return NextResponse.json(
      { success: true, message: 'Lead supprimé' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du lead' },
      { status: 500 }
    );
  }
}