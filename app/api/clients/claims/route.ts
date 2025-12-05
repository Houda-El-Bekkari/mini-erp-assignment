import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claims, clients, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'client') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Trouver le client associé à cet utilisateur
    const client = await db.query.clients.findFirst({
      where: eq(clients.userId, decoded.userId),
    });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }
    
    // Récupérer les réclamations de ce client
    const clientClaims = await db.query.claims.findMany({
      where: eq(claims.clientId, client.id),
      orderBy: desc(claims.createdAt),
    });
    
    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
      claims: clientClaims,
      count: clientClaims.length,
    });
    
  } catch (error) {
    console.error('Error fetching client claims:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}