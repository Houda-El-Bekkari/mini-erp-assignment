import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, clients, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Fonction pour extraire l'ID depuis l'URL
function extractLeadId(url: string): string | null {
  const parts = url.split('/');
  const leadsIndex = parts.indexOf('leads');
  
  if (leadsIndex !== -1 && leadsIndex + 1 < parts.length) {
    return parts[leadsIndex + 1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Extraire l'ID depuis l'URL
    const url = request.url;
    const leadId = extractLeadId(url);
    
    console.log('URL:', url);
    console.log('Lead ID extrait:', leadId);
    
    if (!leadId || leadId === '[id]' || leadId === 'convert') {
      return NextResponse.json(
        { error: 'ID lead manquant ou invalide' },
        { status: 400 }
      );
    }

    // Récupérer le lead
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le lead est déjà converti
    if (lead.convertedToClientId) {
      return NextResponse.json(
        { error: 'Ce lead a déjà été converti en client' },
        { status: 400 }
      );
    }

    // Vérifier si un client existe déjà avec cet email
    const existingClient = await db.query.clients.findFirst({
      where: eq(clients.email, lead.email),
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Un client avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Créer un nouvel utilisateur pour le client
    const newUser = await db.insert(users).values({
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: lead.email,
      passwordHash: 'default123', // Mot de passe par défaut
      role: 'client',
      name: lead.name,
    }).returning();

    // Créer le client à partir du lead
    const newClient = await db.insert(clients).values({
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: newUser[0].id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: 'active',
      totalRevenue: 0,
      assignedProducts: 0,
      activeClaims: 0,
      notes: `Converti depuis lead ${lead.id} - ${lead.comments || 'Pas de commentaires'}`,
    }).returning();

    // Marquer le lead comme converti
    await db.update(leads)
      .set({ 
        status: 'converted',
        convertedToClientId: newClient[0].id 
      })
      .where(eq(leads.id, leadId));

    return NextResponse.json({
      success: true,
      message: 'Lead converti en client avec succès',
      clientId: newClient[0].id,
      client: {
        id: newClient[0].id,
        name: newClient[0].name,
        email: newClient[0].email,
      },
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        password: 'default123', // À communiquer au client
      },
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error converting lead:', error);
    return NextResponse.json(
      { error: `Erreur lors de la conversion du lead: ${error.message}` },
      { status: 500 }
    );
  }
}