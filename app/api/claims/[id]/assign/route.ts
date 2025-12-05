import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claims, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const claimId = url.pathname.split('/').slice(-2)[0]; // claims/[id]/assign
    const { operatorId } = await request.json();
    
    if (!claimId || claimId === '[id]') {
      return NextResponse.json(
        { error: 'ID réclamation manquant' },
        { status: 400 }
      );
    }

    if (!operatorId) {
      return NextResponse.json(
        { error: 'ID opérateur manquant' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est un opérateur
    const operator = await db.query.users.findFirst({
      where: eq(users.id, operatorId),
    });

    if (!operator || (operator.role !== 'operator' && operator.role !== 'admin')) {
      return NextResponse.json(
        { error: 'L\'utilisateur n\'est pas un opérateur valide' },
        { status: 400 }
      );
    }

    // Assigner la réclamation
    await db.update(claims)
      .set({ assignedTo: operatorId })
      .where(eq(claims.id, claimId));

    return NextResponse.json({
      success: true,
      message: 'Réclamation assignée avec succès',
      claimId,
      operatorId,
      operatorName: operator.name,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error assigning claim:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'assignation de la réclamation' },
      { status: 500 }
    );
  }
}