import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureOperatorsWithProperDates() {
  console.log('🔄 Vérification et mise à jour des opérateurs...');
  
  const client = await pool.connect();
  
  try {
    // 1. Vérifier l'état actuel
    console.log('\n🔍 État actuel des opérateurs:');
    console.log('==============================');
    
    const existingOperators = await client.query(
      "SELECT id, email, name, role, created_at FROM users WHERE role IN ('operator', 'admin')"
    );
    
    console.log(`${existingOperators.rows.length} opérateur(s) existant(s).`);
    
    // 2. Liste des opérateurs souhaités
    const saltRounds = 10;
    const defaultPassword = 'operator123';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    
    const desiredOperators = [
      {
        email: 'operator1@entreprise.com',
        passwordHash: hashedPassword,
        role: 'operator',
        name: 'Thomas Dubois',
      },
      {
        email: 'operator2@entreprise.com',
        passwordHash: hashedPassword,
        role: 'operator',
        name: 'Sophie Martin',
      },
      {
        email: 'operator3@entreprise.com',
        passwordHash: hashedPassword,
        role: 'operator',
        name: 'Lucas Bernard',
      },
      {
        email: 'admin@entreprise.com',
        passwordHash: hashedPassword,
        role: 'admin',
        name: 'Admin Principal',
      },
      {
        email: 'support@entreprise.com',
        passwordHash: hashedPassword,
        role: 'operator',
        name: 'Service Support',
      },
    ];
    
    console.log('\n🔄 Traitement des opérateurs:');
    console.log('============================');
    
    const now = new Date();
    let createdCount = 0;
    let updatedCount = 0;
    
    for (let i = 0; i < desiredOperators.length; i++) {
      const desired = desiredOperators[i];
      
      try {
        // Vérifier si l'opérateur existe déjà
        const existing = existingOperators.rows.find(
          (op: any) => op.email === desired.email
        );
        
        // Créer une date réaliste (entre 1 et 30 jours dans le passé)
        const daysAgo = i + 1;
        const realisticDate = new Date(now);
        realisticDate.setDate(now.getDate() - daysAgo);
        realisticDate.setHours(9 + i, 30, 0, 0);
        
        if (existing) {
          // Opérateur existe déjà
          const id = `operator_${Date.now()}_${i + 1}`;
          
          // Vérifier si created_at doit être mis à jour
          let updateCreatedAt = false;
          if (!existing.created_at) {
            updateCreatedAt = true;
          } else {
            // Si la date est très récente (aujourd'hui), on la met à jour
            const existingDate = new Date(existing.created_at);
            const today = new Date();
            if (existingDate.toDateString() === today.toDateString()) {
              updateCreatedAt = true;
            }
          }
          
          // Construction de la requête UPDATE
          let updateQuery = `
            UPDATE users SET 
              name = $1,
              role = $2,
              password_hash = $3
          `;
          
          const params: any[] = [desired.name, desired.role, desired.passwordHash];
          
          if (updateCreatedAt) {
            updateQuery += `, created_at = $4 WHERE email = $5`;
            params.push(realisticDate.toISOString(), desired.email);
          } else {
            updateQuery += ` WHERE email = $4`;
            params.push(desired.email);
          }
          
          await client.query(updateQuery, params);
          
          console.log(`✅ ${updateCreatedAt ? 'MIS À JOUR' : 'EXISTE DÉJÀ'}: ${desired.name} (${desired.email})`);
          if (updateCreatedAt) updatedCount++;
          
        } else {
          // Opérateur n'existe pas, le créer
          const id = `operator_${Date.now()}_${i + 1}`;
          
          await client.query(
            `INSERT INTO users (id, email, password_hash, role, name, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id,
              desired.email,
              desired.passwordHash,
              desired.role,
              desired.name,
              realisticDate.toISOString(),
            ]
          );
          
          console.log(`➕ CRÉÉ: ${desired.name} (${desired.email}) - ${realisticDate.toISOString().split('T')[0]}`);
          createdCount++;
        }
        
      } catch (error: any) {
        console.error(`❌ Erreur avec ${desired.email}:`, error.message);
      }
    }
    
    // 3. Vérification finale
    console.log('\n📊 RÉSULTAT FINAL:');
    console.log('=================');
    
    const finalResult = await client.query(
      `SELECT 
        name, 
        email, 
        role,
        created_at,
        CASE 
          WHEN created_at IS NULL THEN '❌ MANQUANTE'
          WHEN created_at::date = CURRENT_DATE THEN '⚠️  AJOURD\'HUI'
          ELSE '✅ OK'
        END as date_status
       FROM users 
       WHERE role IN ('operator', 'admin') 
       ORDER BY created_at ASC, role, name`
    );
    
    console.log('\n📋 Liste des opérateurs:');
    console.log('-----------------------');
    
    finalResult.rows.forEach((row: any, index: number) => {
      const dateInfo = row.created_at 
        ? new Date(row.created_at).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : 'N/A';
      
      console.log(`${index + 1}. ${row.name.padEnd(20)} ${row.email.padEnd(30)} ${row.role.padEnd(8)} ${dateInfo.padEnd(25)} ${row.date_status}`);
    });
    
    console.log(`\n📈 Statistiques:`);
    console.log(`   • Créés: ${createdCount}`);
    console.log(`   • Mis à jour: ${updatedCount}`);
    console.log(`   • Total: ${finalResult.rows.length}`);
    
    console.log('\n🔑 Informations de connexion:');
    console.log('=============================');
    console.log('📧 Email: operator1@entreprise.com');
    console.log('🔐 Mot de passe: operator123');
    console.log('👑 Admin: admin@entreprise.com');
    console.log('⚠️  Changez ces mots de passe en production !');
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
    console.log('\n✨ Script terminé avec succès !');
  }
}

// Exécuter le script
ensureOperatorsWithProperDates();