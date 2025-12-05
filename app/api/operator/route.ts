import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { claims, leads, users, clients } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

// GET - Récupérer toutes les données de l'opérateur connecté
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
    
    if (!decoded || decoded.role !== 'operator') {
      return NextResponse.json(
        { error: 'Accès réservé aux opérateurs' },
        { status: 403 }
      );
    }
    
    const operatorId = decoded.userId;
    
    // 1. Récupérer les informations de l'opérateur
    const operator = await db.query.users.findFirst({
      where: eq(users.id, operatorId),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (!operator) {
      return NextResponse.json(
        { error: 'Opérateur non trouvé' },
        { status: 404 }
      );
    }
    
    // 2. Récupérer les réclamations assignées à cet opérateur
    const assignedClaims = await db.query.claims.findMany({
      where: eq(claims.assignedTo, operatorId),
      orderBy: desc(claims.createdAt),
    });
    
    // Enrichir les réclamations avec les infos client
    const enrichedClaims = await Promise.all(
      assignedClaims.map(async (claim) => {
        const client = claim.clientId 
          ? await db.query.clients.findFirst({
              where: eq(clients.id, claim.clientId),
              columns: { name: true, email: true }
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
          fileUrl: claim.fileUrl,
          comments: claim.comments,
          createdAt: claim.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        };
      })
    );
    
    // 3. Récupérer les leads assignés à cet opérateur
    const assignedLeads = await db.query.leads.findMany({
      where: eq(leads.assignedTo, operatorId),
      orderBy: desc(leads.createdAt),
    });
    
    // Formatter les leads
    const formattedLeads = assignedLeads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      status: lead.status as 'new' | 'in_progress' | 'converted',
      comments: lead.comments || '',
      createdAt: lead.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    }));
    
    // 4. Calculer les statistiques
    const stats = {
      operator: {
        totalClaims: assignedClaims.length,
        pendingClaims: assignedClaims.filter(c => c.status === 'submitted' || c.status === 'in_review').length,
        resolvedClaims: assignedClaims.filter(c => c.status === 'resolved').length,
        totalLeads: assignedLeads.length,
        activeLeads: assignedLeads.filter(l => l.status === 'new' || l.status === 'in_progress').length,
        convertedLeads: assignedLeads.filter(l => l.status === 'converted').length,
      },
      general: {
        totalClaims: await db.select().from(claims).then(res => res.length),
        totalLeads: await db.select().from(leads).then(res => res.length),
      }
    };
    
    return NextResponse.json({
      operator,
      claims: enrichedClaims,
      leads: formattedLeads,
      stats,
      count: {
        claims: enrichedClaims.length,
        leads: formattedLeads.length,
      },
    });
    
  } catch (error) {
    console.error('Error fetching operator data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une réclamation ou d'un lead
export async function PATCH(request: NextRequest) {
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
    
    if (!decoded || decoded.role !== 'operator') {
      return NextResponse.json(
        { error: 'Accès réservé aux opérateurs' },
        { status: 403 }
      );
    }
    
    const operatorId = decoded.userId;
    const body = await request.json();
    const { itemId, itemType, status, comments } = body;
    
    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'ID et type d\'élément requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'opérateur est bien assigné à cet élément
    if (itemType === 'claim') {
      const claim = await db.query.claims.findFirst({
        where: and(
          eq(claims.id, itemId),
          eq(claims.assignedTo, operatorId)
        ),
      });
      
      if (!claim) {
        return NextResponse.json(
          { error: 'Réclamation non trouvée ou non assignée à cet opérateur' },
          { status: 404 }
        );
      }
      
      // Mettre à jour la réclamation
      const updateData: any = {};
      if (status) updateData.status = status;
      if (comments !== undefined) updateData.comments = comments;
      updateData.updatedAt = new Date();
      
      await db.update(claims)
        .set(updateData)
        .where(eq(claims.id, itemId));
      
      return NextResponse.json({
        success: true,
        message: 'Réclamation mise à jour',
        data: { id: itemId, status, comments }
      });
      
    } else if (itemType === 'lead') {
      const lead = await db.query.leads.findFirst({
        where: and(
          eq(leads.id, itemId),
          eq(leads.assignedTo, operatorId)
        ),
      });
      
      if (!lead) {
        return NextResponse.json(
          { error: 'Lead non trouvé ou non assigné à cet opérateur' },
          { status: 404 }
        );
      }
      
      // Mettre à jour le lead
      const updateData: any = {};
      if (status) updateData.status = status;
      if (comments !== undefined) updateData.comments = comments;
      updateData.updatedAt = new Date();
      
      // Si le lead est converti en client, créer un client
      if (status === 'converted' && !lead.convertedToClientId) {
        // Créer un nouveau client à partir du lead
        const newClientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.insert(clients).values({
          id: newClientId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: 'active',
          notes: `Converti depuis lead: ${lead.id}\n${lead.comments || ''}`,
        });
        
        updateData.convertedToClientId = newClientId;
      }
      
      await db.update(leads)
        .set(updateData)
        .where(eq(leads.id, itemId));
      
      return NextResponse.json({
        success: true,
        message: 'Lead mis à jour',
        data: { id: itemId, status, comments }
      });
      
    } else {
      return NextResponse.json(
        { error: 'Type d\'élément invalide. Utilisez "claim" ou "lead"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error updating operator item:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}