import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claims, clients, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function extractId(url: string): string | null {
  const parts = url.split('/');
  const claimsIndex = parts.indexOf('claims');
  return claimsIndex !== -1 && claimsIndex + 1 < parts.length 
    ? parts[claimsIndex + 1] 
    : null;
}

export async function GET(request: NextRequest) {
  try {
    const claimId = extractId(request.url);
    
    if (!claimId || claimId === '[id]') {
      return NextResponse.json(
        { error: 'ID réclamation manquant' },
        { status: 400 }
      );
    }

    const claim = await db.query.claims.findFirst({
      where: eq(claims.id, claimId),
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'Réclamation non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les infos client et assigné
    const client = claim.clientId 
      ? await db.query.clients.findFirst({
          where: eq(clients.id, claim.clientId),
        })
      : null;

    const assignedUser = claim.assignedTo
      ? await db.query.users.findFirst({
          where: eq(users.id, claim.assignedTo),
          columns: { id: true, name: true, email: true, role: true }
        })
      : null;

    return NextResponse.json({
      claim: {
        id: claim.id,
        title: claim.title,
        description: claim.description,
        status: claim.status,
        clientId: claim.clientId,
        assignedTo: claim.assignedTo,
        fileUrl: claim.fileUrl,
        comments: claim.comments,
        createdAt: claim.createdAt?.toISOString(),
      },
      client: client ? {
        id: client.id,
        name: client.name,
        email: client.email,
      } : null,
      assignedTo: assignedUser,
    });
    
  } catch (error) {
    console.error('Error fetching claim:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la réclamation' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const claimId = extractId(request.url);
    const body = await request.json();
    
    if (!claimId || claimId === '[id]') {
      return NextResponse.json(
        { error: 'ID réclamation manquant' },
        { status: 400 }
      );
    }

    // Mettre à jour la réclamation
    await db.update(claims)
      .set(body)
      .where(eq(claims.id, claimId));

    return NextResponse.json(
      { success: true, message: 'Réclamation mise à jour' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la réclamation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const claimId = extractId(request.url);
    
    if (!claimId || claimId === '[id]') {
      return NextResponse.json(
        { error: 'ID réclamation manquant' },
        { status: 400 }
      );
    }

    // Récupérer le client ID avant suppression
    const claim = await db.query.claims.findFirst({
      where: eq(claims.id, claimId),
      columns: { clientId: true }
    });

    // Supprimer la réclamation
    await db.delete(claims).where(eq(claims.id, claimId));

    // Mettre à jour le compteur du client
    if (claim?.clientId) {
      const activeClaims = await db.query.claims.findMany({
        where: eq(claims.clientId, claim.clientId),
      });
      
      await db.update(clients)
        .set({ activeClaims: activeClaims.length })
        .where(eq(clients.id, claim.clientId));
    }

    return NextResponse.json(
      { success: true, message: 'Réclamation supprimée' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting claim:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la réclamation' },
      { status: 500 }
    );
  }
}