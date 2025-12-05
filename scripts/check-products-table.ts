import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

async function checkProductsTable() {
  console.log('Vérification de la table products...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // Vérifier si la table existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ La table "products" n\'existe pas!');
      client.release();
      return;
    }
    
    console.log('✅ Table "products" trouvée');
    
    // Vérifier les colonnes
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Structure de la table "products":');
    if (columns.rows.length === 0) {
      console.log('   Aucune colonne trouvée!');
    } else {
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    // Compter les lignes
    const countResult = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\n📈 Nombre de produits: ${countResult.rows[0].count}`);
    
    // Voir quelques données
    const sampleData = await client.query('SELECT * FROM products LIMIT 3');
    console.log('\n🎯 Échantillon de données:');
    sampleData.rows.forEach((row, i) => {
      console.log(`   Produit ${i + 1}:`, {
        id: row.id,
        name: row.name,
        type: row.type,
        price: row.price,
      });
    });
    
    client.release();
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkProductsTable();