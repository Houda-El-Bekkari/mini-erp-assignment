import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

async function seedClaims() {
  console.log('Ajout de réclamations de test...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // Récupérer un client et un opérateur
    const clientsResult = await client.query('SELECT id, name FROM clients LIMIT 1');
    const operatorsResult = await client.query(
      "SELECT id, name FROM users WHERE role IN ('operator', 'admin') LIMIT 1"
    );
    
    if (clientsResult.rows.length === 0) {
      console.log('❌ Aucun client trouvé, créez d\'abord un client');
      client.release();
      return;
    }
    
    const clientId = clientsResult.rows[0].id;
    const operatorId = operatorsResult.rows.length > 0 ? operatorsResult.rows[0].id : null;
    
    // Vider la table d'abord
    await client.query('DELETE FROM claims');
    console.log('Table claims vidée');
    
    // Ajouter des réclamations de test
    const claims = [
      {
        title: 'Problème de facturation',
        description: 'Facture du mois de janvier incorrecte, montant surestimé de 20%',
        status: 'submitted',
        assignedTo: operatorId,
      },
      {
        title: 'Demande de fonctionnalité',
        description: 'Ajouter un export PDF des rapports mensuels',
        status: 'in_review',
        assignedTo: operatorId,
      },
      {
        title: 'Bug dans l\'interface',
        description: 'Le menu déroulant ne s\'affiche pas correctement sur mobile',
        status: 'resolved',
        assignedTo: operatorId,
      },
      {
        title: 'Question sur l\'utilisation',
        description: 'Comment configurer les notifications par email?',
        status: 'submitted',
        assignedTo: null,
      },
      {
        title: 'Problème de connexion',
        description: 'Impossible de se connecter depuis hier soir',
        status: 'in_review',
        assignedTo: operatorId,
      },
    ];
    
    let added = 0;
    for (const claim of claims) {
      try {
        const id = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await client.query(
          `INSERT INTO claims (id, title, description, status, client_id, assigned_to, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW() - interval '${added} days')`,
          [id, claim.title, claim.description, claim.status, clientId, claim.assignedTo]
        );
        
        console.log(`✓ "${claim.title}" ajouté (${claim.status})`);
        added++;
        
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error: any) {
        console.log(`⚠ Erreur: ${error.message}`);
      }
    }
    
    // Mettre à jour le compteur du client
    await client.query(
      'UPDATE clients SET active_claims = $1 WHERE id = $2',
      [added, clientId]
    );
    
    const count = await client.query('SELECT COUNT(*) FROM claims');
    console.log(`\n✅ ${added} réclamations ajoutées`);
    console.log(`📊 Total réclamations: ${count.rows[0].count}`);
    
    client.release();
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

seedClaims();