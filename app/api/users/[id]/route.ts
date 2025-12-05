import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Fonction pour extraire les params
async function getParams(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop(); // Récupère le dernier segment
  
  return { id };
}

export async function DELETE(request: NextRequest) {
  try {
    // Extraire l'ID depuis l'URL
    const { id } = await getParams(request);
    
    console.log('ID à supprimer:', id); // Pour debug
    
    if (!id || id === '[id]') {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Ne pas permettre de supprimer les administrateurs principaux
    if (user.role === 'admin' && user.email === 'admin@example.com') {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'administrateur principal' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur
    await db.delete(users).where(eq(users.id, id));
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Utilisateur supprimé avec succès',
        deletedUser: { id, email: user.email }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        error: 'Échec de la suppression',
        details: error.message 
      },
      { status: 500 }
    );
  }
}