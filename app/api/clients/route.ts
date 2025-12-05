import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const allClients = await db.query.clients.findMany({
      orderBy: (clients, { desc }) => [desc(clients.createdAt)],
    });

    // Formater les données
    const formattedClients = allClients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      status: client.status as 'active' | 'inactive' | 'pending',
      totalRevenue: client.totalRevenue || 0,
      assignedProducts: client.assignedProducts || 0,
      activeClaims: client.activeClaims || 0,
      notes: client.notes || '',
      createdAt: client.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      lastActivity: client.lastActivity?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, address, status } = body;

    // Vérifier si le client existe déjà
    const existingClient = await db.query.clients.findFirst({
      where: (clients, { eq }) => eq(clients.email, email),
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Un client avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Créer le client
    const newClient = await db.insert(clients).values({
      id: `client_${Date.now()}`,
      name,
      email,
      phone,
      company,
      address,
      status: status || 'active',
      totalRevenue: 0,
      assignedProducts: 0,
      activeClaims: 0,
    }).returning();

    return NextResponse.json({
      id: newClient[0].id,
      name: newClient[0].name,
      email: newClient[0].email,
      phone: newClient[0].phone,
      company: newClient[0].company,
      status: newClient[0].status,
      totalRevenue: newClient[0].totalRevenue,
      createdAt: newClient[0].createdAt?.toISOString().split('T')[0],
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du client' },
      { status: 500 }
    );
  }
}