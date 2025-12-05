import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

async function checkTables() {
  console.log('Vérification des tables...');
  console.log('URL DB:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connexion réussie à PostgreSQL');
    
    // Lister toutes les tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables disponibles:');
    if (result.rows.length === 0) {
      console.log('   Aucune table trouvée!');
    } else {
      result.rows.forEach(row => console.log(`   - ${row.table_name}`));
    }
    
    // Vérifier si la table clients existe
    const clientsExist = result.rows.some(row => row.table_name === 'clients');
    
    if (!clientsExist) {
      console.log('\n❌ La table "clients" n\'existe pas!');
      console.log('\nPour la créer, exécute:');
      console.log('1. npx drizzle-kit generate');
      console.log('2. npx drizzle-kit migrate');
    } else {
      console.log('\n✅ Table "clients" trouvée');
      
      // Vérifier les colonnes de la table clients
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'clients'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📊 Structure de la table "clients":');
      columns.rows.forEach(col => console.log(`   - ${col.column_name} (${col.data_type})`));
    }
    
    client.release();
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();