import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claims, clients, users } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const assignedFilter = searchParams.get('assignedTo');
    const clientIdFilter = searchParams.get('clientId'); // NOUVEAU: filtre par client

    // Construire la requête de base
    let queryConditions = [];

    // Ajouter le filtre client si fourni
    if (clientIdFilter) {
      queryConditions.push(eq(claims.clientId, clientIdFilter));
    }

    // Appliquer les autres filtres
    if (statusFilter && statusFilter !== 'all') {
      queryConditions.push(eq(claims.status, statusFilter));
    }

    if (assignedFilter && assignedFilter !== 'all') {
      queryConditions.push(eq(claims.assignedTo, assignedFilter));
    }

    // Exécuter la requête avec les conditions
    let query = db.select()
      .from(claims)
      .orderBy(desc(claims.createdAt));

    if (queryConditions.length > 0) {
      query = query.where(and(...queryConditions));
    }

    const allClaims = await query;

    // Enrichir avec les informations client et assigné
    const enrichedClaims = await Promise.all(
      allClaims.map(async (claim) => {
        const client = claim.clientId 
          ? await db.query.clients.findFirst({
              where: eq(clients.id, claim.clientId),
              columns: { name: true, email: true }
            })
          : null;

        const assignedUser = claim.assignedTo
          ? await db.query.users.findFirst({
              where: eq(users.id, claim.assignedTo),
              columns: { name: true, email: true, role: true }
            })
          : null;

        return {
          id: claim.id,
          title: claim.title,
          description: claim.description,
          status: claim.status as 'submitted' | 'in_review' | 'resolved',
          clientId: claim.clientId,
          clientName: client?.name || 'Client inconnu',
          clientEmail: client?.email || '',
          assignedTo: claim.assignedTo,
          assignedToName: assignedUser?.name || 'Non assigné',
          assignedToRole: assignedUser?.role,
          fileUrl: claim.fileUrl,
          comments: claim.comments,
          createdAt: claim.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        };
      })
    );

    return NextResponse.json(enrichedClaims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}