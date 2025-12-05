import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '@/lib/db';
import { products } from '@/lib/schema';

async function seedProducts() {
  console.log('Création de produits/services de test...');
  
  const sampleProducts = [
    { name: 'Support Technique 24/7', type: 'service', price: 299, description: 'Support technique disponible 24 heures sur 24, 7 jours sur 7' },
    { name: 'Formation Utilisateur', type: 'service', price: 149, description: 'Session de formation pour les nouveaux utilisateurs' },
    { name: 'Licence Logiciel Entreprise', type: 'product', price: 999, description: 'Licence annuelle pour usage commercial' },
    { name: 'Consulting Stratégique', type: 'service', price: 199, description: 'Session de consulting stratégique d\'une heure' },
    { name: 'Abonnement Cloud Premium', type: 'subscription', price: 49, description: 'Abonnement mensuel au service cloud premium' },
  ];

  for (const productData of sampleProducts) {
    try {
      await db.insert(products).values({
        id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...productData,
      });
      console.log(`✓ ${productData.name} créé`);
    } catch (error) {
      console.log(`⚠ ${productData.name} existe déjà ou erreur`);
    }
  }
  
  console.log('✅ Produits/services de test créés');
}

seedProducts();