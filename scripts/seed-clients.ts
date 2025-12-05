import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '@/lib/db';
import { clients } from '@/lib/schema';

async function seedClients() {
  console.log('Création de clients de test...');
  
  const sampleClients = [
    {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1 234 567 890',
      company: 'Acme Corp',
      status: 'active',
      totalRevenue: 12500,
      assignedProducts: 5,
      activeClaims: 2,
    },
    {
      name: 'Tech Solutions LLC',
      email: 'info@techsolutions.com',
      phone: '+1 987 654 321',
      company: 'Tech Solutions',
      status: 'active',
      totalRevenue: 8500,
      assignedProducts: 3,
      activeClaims: 0,
    },
  ];

  for (const clientData of sampleClients) {
    try {
      await db.insert(clients).values({
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...clientData,
      });
      console.log(`✓ ${clientData.name} créé`);
    } catch (error) {
      console.log(`⚠ ${clientData.name} existe déjà`);
    }
  }
  
  console.log('✅ Clients de test créés');
}

seedClients();