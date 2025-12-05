import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, clients, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const allLeads = await db.query.leads.findMany({
      orderBy: (leads, { desc }) => [desc(leads.createdAt)],
    });

    // Formater les données avec info assigné
    const formattedLeads = await Promise.all(
      allLeads.map(async (lead) => {
        let assignedUser = null;
        if (lead.assignedTo) {
          assignedUser = await db.query.users.findFirst({
            where: eq(users.id, lead.assignedTo),
            columns: { name: true, email: true },
          });
        }

        return {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone || '',
          status: lead.status as 'new' | 'in_progress' | 'converted',
          assignedTo: lead.assignedTo,
          assignedUserName: assignedUser?.name,
          comments: lead.comments || '',
          convertedToClientId: lead.convertedToClientId,
          createdAt: lead.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        };
      })
    );

    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, status, assignedTo, comments } = body;

    // Vérifier si le lead existe déjà
    const existingLead = await db.query.leads.findFirst({
      where: (leads, { eq }) => eq(leads.email, email),
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Un lead avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Créer le lead
    const newLead = await db.insert(leads).values({
      id: `lead_${Date.now()}`,
      name,
      email,
      phone,
      status: status || 'new',
      assignedTo,
      comments,
    }).returning();

    return NextResponse.json({
      id: newLead[0].id,
      name: newLead[0].name,
      email: newLead[0].email,
      phone: newLead[0].phone,
      status: newLead[0].status,
      assignedTo: newLead[0].assignedTo,
      comments: newLead[0].comments,
      createdAt: newLead[0].createdAt?.toISOString().split('T')[0],
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du lead' },
      { status: 500 }
    );
  }
}