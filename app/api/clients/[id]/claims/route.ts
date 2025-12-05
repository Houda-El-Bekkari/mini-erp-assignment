import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claims, clients, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

function extractClientId(url: string): string | null {
  const parts = url.split('/');
  const clientsIndex = parts.indexOf('clients');
  return clientsIndex !== -1 && clientsIndex + 1 < parts.length 
    ? parts[clientsIndex + 1] 
    : null;
}

export async function GET(request: NextRequest) {
  try {
    const clientId = extractClientId(request.url);
    
    if (!clientId || clientId === '[id]') {
      return NextResponse.json(
        { error: 'ID client manquant' },
        { status: 400 }
      );
    }

    // Vérifier que le client existe
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les réclamations de ce client
    const clientClaims = await db.query.claims.findMany({
      where: eq(claims.clientId, clientId),
      orderBy: desc(claims.createdAt),
    });

    // Enrichir avec les informations d'assignation
    const enrichedClaims = await Promise.all(
      clientClaims.map(async (claim) => {
        const assignedUser = claim.assignedTo
          ? await db.query.users.findFirst({
              where: eq(users.id, claim.assignedTo),
              columns: { name: true, email: true }
            })
          : null;

        return {
          id: claim.id,
          title: claim.title,
          description: claim.description,
          status: claim.status,
          assignedTo: claim.assignedTo,
          assignedToName: assignedUser?.name || 'Non assigné',
          fileUrl: claim.fileUrl,
          comments: claim.comments,
          createdAt: claim.createdAt?.toISOString().split('T')[0],
        };
      })
    );

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
      claims: enrichedClaims,
      count: enrichedClaims.length,
    });
    
  } catch (error) {
    console.error('Error fetching client claims:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réclamations' },
      { status: 500 }
    );
  }
}