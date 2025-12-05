import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  console.log('📝 Simple Claims API called');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, description, clientId, status } = body;
    
    if (!title || !clientId) {
      return NextResponse.json(
        { error: 'Titre et client ID sont requis' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    // Vérifier que le client existe
    const clientCheck = await client.query(
      'SELECT id FROM clients WHERE id = $1',
      [clientId]
    );
    
    if (clientCheck.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }
    
    // Créer la réclamation
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await client.query(
      `INSERT INTO claims (id, title, description, client_id, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, title, status, client_id, created_at`,
      [claimId, title, description || '', clientId, status || 'submitted']
    );
    
    // Mettre à jour le compteur du client
    const countResult = await client.query(
      'SELECT COUNT(*) FROM claims WHERE client_id = $1',
      [clientId]
    );
    
    await client.query(
      'UPDATE clients SET active_claims = $1 WHERE id = $2',
      [countResult.rows[0].count, clientId]
    );
    
    client.release();
    
    console.log('✅ Claim created:', result.rows[0]);
    
    // Formater la date correctement
    const createdAt = result.rows[0].created_at;
    let formattedDate: string;
    
    if (createdAt instanceof Date) {
      // Si c'est un objet Date
      formattedDate = createdAt.toISOString().split('T')[0];
    } else if (typeof createdAt === 'string') {
      // Si c'est déjà une string
      formattedDate = createdAt.split('T')[0];
    } else {
      // Sinon, utiliser la date actuelle
      formattedDate = new Date().toISOString().split('T')[0];
    }
    
    return NextResponse.json({
      id: result.rows[0].id,
      title: result.rows[0].title,
      status: result.rows[0].status,
      clientId: result.rows[0].client_id,
      createdAt: formattedDate,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Simple claims error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // Récupérer toutes les réclamations avec infos client
    const result = await client.query(`
      SELECT 
        c.*,
        cl.name as client_name,
        cl.email as client_email
      FROM claims c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.created_at DESC
      LIMIT 50
    `);
    
    client.release();
    
    const claims = result.rows.map(row => {
      // Formater la date correctement pour chaque ligne
      let formattedDate: string;
      const createdAt = row.created_at;
      
      if (createdAt instanceof Date) {
        formattedDate = createdAt.toISOString().split('T')[0];
      } else if (typeof createdAt === 'string') {
        formattedDate = createdAt.split('T')[0];
      } else {
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        clientId: row.client_id,
        clientName: row.client_name,
        clientEmail: row.client_email,
        assignedTo: row.assigned_to,
        fileUrl: row.file_url,
        comments: row.comments,
        createdAt: formattedDate,
      };
    });
    
    return NextResponse.json(claims);
    
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await pool.end();
  }
}