import { db } from '@/lib/db';

export default async function TestDB() {
  try {
    // Récupère tous les utilisateurs depuis la base
    const allUsers = await db.query.users.findMany();
    
    // Récupère aussi les autres tables pour vérifier
    const allLeads = await db.query.leads.findMany();
    const allClients = await db.query.clients.findMany();

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Test de Connexion à la Base de Données</h1>
        
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 font-medium">✅ Connexion réussie à PostgreSQL</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Utilisateurs */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Utilisateurs ({allUsers.length})</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(allUsers, null, 2)}
            </pre>
          </div>

          {/* Leads */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Leads ({allLeads.length})</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(allLeads, null, 2)}
            </pre>
          </div>

          {/* Clients */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Clients ({allClients.length})</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(allClients, null, 2)}
            </pre>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="mt-8 bg-gray-50 p-6 rounded">
          <h3 className="font-semibold mb-2">Informations de connexion:</h3>
          <p className="text-sm text-gray-600">
            Base de données: PostgreSQL (Neon)<br/>
            URL: {process.env.DATABASE_URL ? '✓ Configurée' : '✗ Non configurée'}<br/>
            ORM: Drizzle
          </p>
        </div>
      </div>
    );
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Test de Connexion à la Base de Données</h1>
        
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-medium">❌ Erreur de connexion à la base de données</p>
          <p className="text-red-600 text-sm mt-2">
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
        </div>

        <div className="mt-6 bg-yellow-50 p-6 rounded">
          <h3 className="font-semibold mb-2">Prochaines étapes pour debug:</h3>
          <ol className="list-decimal pl-5 text-gray-700">
            <li>Vérifie que <code>.env.local</code> existe avec <code>DATABASE_URL</code></li>
            <li>Vérifie que la chaîne de connexion Neon est correcte</li>
            <li>Vérifie que la migration a bien été exécutée</li>
            <li>Vérifie que les tables existent dans Neon Studio</li>
          </ol>
        </div>
      </div>
    );
  }
}