import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients, products, claims } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Fonction pour extraire l'ID depuis l'URL
async function getParams(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  return { id };
}

export async function GET(request: NextRequest) {
  try {
    const { id } = await getParams(request);
    
    if (!id || id === '[id]') {
      return NextResponse.json(
        { error: 'ID client manquant' },
        { status: 400 }
      );
    }

    // Récupérer le client
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, id),
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les produits assignés (à implémenter avec une table de liaison)
    // Pour l'instant, on simule
    const mockProducts = [
      { id: '1', name: 'Plan Entreprise Premium', type: 'Abonnement', price: 5000, assignedDate: '2024-01-10' },
    ];

    // Récupérer les réclamations
    const clientClaims = await db.query.claims.findMany({
      where: eq(claims.clientId, id),
    });

    // Récupérer l'activité (à implémenter avec une table activities)
    const mockActivities = [
      { id: '1', type: 'note', description: 'Client créé', date: client.createdAt?.toISOString().split('T')[0], user: 'System' },
    ];

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        website: '', // À ajouter au schéma si nécessaire
        status: client.status,
        totalRevenue: client.totalRevenue,
        activeClaims: client.activeClaims,
        assignedProducts: client.assignedProducts,
        notes: client.notes,
        createdAt: client.createdAt?.toISOString().split('T')[0],
        lastActivity: client.lastActivity?.toISOString().split('T')[0],
      },
      products: mockProducts,
      claims: clientClaims.map(claim => ({
        id: claim.id,
        title: claim.title,
        status: claim.status,
        date: claim.createdAt?.toISOString().split('T')[0],
        assignedTo: claim.assignedTo,
      })),
      activities: mockActivities,
    });
    
  } catch (error) {
    console.error('Error fetching client details:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails' },
      { status: 500 }
    );
  }
}