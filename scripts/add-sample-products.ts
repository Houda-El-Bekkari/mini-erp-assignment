import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

async function addSampleProducts() {
  console.log('Ajout de produits de test...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // Vider la table d'abord (optionnel)
    await client.query('DELETE FROM products');
    console.log('Table vidée');
    
    // Ajouter 5 produits de test
    const products = [
      {
        name: 'Support Technique 24/7',
        type: 'service',
        price: 299,
        description: 'Support technique disponible 24 heures sur 24, 7 jours sur 7 avec réponse sous 1 heure'
      },
      {
        name: 'Formation Utilisateur Premium',
        type: 'service',
        price: 149,
        description: 'Session de formation complète de 2 heures pour les nouveaux utilisateurs'
      },
      {
        name: 'Licence Logiciel Entreprise',
        type: 'product',
        price: 999,
        description: 'Licence annuelle complète pour usage commercial avec mises à jour incluses'
      },
      {
        name: 'Consulting Stratégique',
        type: 'service',
        price: 199,
        description: 'Session de consulting stratégique d\'une heure avec nos experts'
      },
      {
        name: 'Abonnement Cloud Premium',
        type: 'subscription',
        price: 49,
        description: 'Abonnement mensuel au service cloud premium avec 100GB de stockage'
      },
      {
        name: 'Maintenance Préventive',
        type: 'service',
        price: 89,
        description: 'Contrat de maintenance mensuel pour prévenir les problèmes'
      },
      {
        name: 'Pack Démarrage',
        type: 'product',
        price: 499,
        description: 'Pack complet pour démarrer avec notre solution'
      }
    ];
    
    let added = 0;
    for (const product of products) {
      try {
        // Générer un ID unique
        const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await client.query(
          `INSERT INTO products (id, name, type, price, description) 
           VALUES ($1, $2, $3, $4, $5)`,
          [id, product.name, product.type, product.price, product.description]
        );
        console.log(`✓ ${product.name} ajouté (${product.price}€)`);
        added++;
        
        // Petite pause pour éviter les ID identiques
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error: any) {
        console.log(`⚠ Erreur pour ${product.name}:`, error.message);
      }
    }
    
    // Vérifier
    const count = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\n✅ ${added} produits ajoutés sur ${products.length} tentés`);
    console.log(`📊 Total produits dans la table: ${count.rows[0].count}`);
    
    client.release();
  } catch (error: any) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleProducts();