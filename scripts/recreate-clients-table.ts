import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

async function recreateClientsTable() {
  console.log('Recréation de la table clients...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // 1. Supprimer la table existante (attention: supprime les données!)
    console.log('Suppression de l\'ancienne table...');
    await client.query('DROP TABLE IF EXISTS clients CASCADE');
    
    // 2. Créer la nouvelle table avec la structure complète
    console.log('Création de la nouvelle table...');
    await client.query(`
      CREATE TABLE clients (
        id TEXT PRIMARY KEY DEFAULT 'client_' || floor(extract(epoch from now()) * 1000) || '_' || substr(md5(random()::text), 1, 8),
        user_id TEXT REFERENCES users(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        company TEXT,
        address TEXT,
        status TEXT DEFAULT 'active',
        total_revenue INTEGER DEFAULT 0,
        assigned_products INTEGER DEFAULT 0,
        active_claims INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // 3. Créer les index
    console.log('Création des index...');
    await client.query(`
      CREATE INDEX clients_email_idx ON clients(email);
      CREATE INDEX clients_status_idx ON clients(status);
    `);
    
    // 4. Insérer des données de test
    console.log('Insertion de données de test...');
    await client.query(`
      INSERT INTO clients (id, name, email, phone, company, status, total_revenue, assigned_products, active_claims) VALUES
      ('client_1', 'Acme Corporation', 'contact@acme.com', '+1 234 567 890', 'Acme Corp', 'active', 12500, 5, 2),
      ('client_2', 'Tech Solutions LLC', 'info@techsolutions.com', '+1 987 654 321', 'Tech Solutions', 'active', 8500, 3, 0),
      ('client_3', 'Global Industries', 'support@global.com', '+1 555 123 456', 'Global Industries', 'active', 23000, 8, 1),
      ('client_4', 'StartUp Innov', 'hello@startupinnov.com', NULL, 'StartUp Innov', 'pending', 3200, 2, 3);
    `);
    
    client.release();
    console.log('✅ Table clients recréée avec succès!');
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

recreateClientsTable();