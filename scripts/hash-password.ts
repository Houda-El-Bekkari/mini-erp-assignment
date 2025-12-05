import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

async function hashUserPasswords() {
  console.log('URL DB:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connexion réussie');

    // Récupérer les utilisateurs
    const result = await client.query('SELECT id, email, password_hash FROM users');
    console.log(`📊 ${result.rows.length} utilisateur(s)`);

    for (const row of result.rows) {
      console.log(`Traitement: ${row.email}`);
      
      // Vérifier si c'est déjà un hash
      if (row.password_hash.length < 50) {
        const hashed = await bcrypt.hash(row.password_hash, 10);
        
        await client.query(
          'UPDATE users SET password_hash = $1 WHERE id = $2',
          [hashed, row.id]
        );
        
        console.log(`  ✓ ${row.email} -> hashé`);
      } else {
        console.log(`  → Déjà hashé`);
      }
    }

    client.release();
    console.log('✅ Terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

hashUserPasswords();