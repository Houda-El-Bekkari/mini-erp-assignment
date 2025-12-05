'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Clock, CheckCircle, AlertCircle, MessageSquare,
  User, Bell, Calendar, TrendingUp, Filter, Search,
  ChevronRight, Download, Eye, RefreshCw, Users, Mail, Phone
} from 'lucide-react';
import Link from 'next/link';

type Claim = {
  id: string;
  title: string;
  description: string;
  status: 'submitted' | 'in_review' | 'resolved';
  clientName: string;
  clientEmail: string;
  createdAt: string;
  comments: string;
  fileUrl: string | null;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'in_progress' | 'converted';
  comments: string;
  createdAt: string;
};

type OperatorData = {
  operator: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  claims: Claim[];
  leads: Lead[];
  stats: {
    operator: {
      totalClaims: number;
      pendingClaims: number;
      resolvedClaims: number;
      totalLeads: number;
      activeLeads: number;
      convertedLeads: number;
    };
  };
  count: {
    claims: number;
    leads: number;
  };
};

// Composant de carte statistique réutilisable
const StatCard = ({ title, value, subtext, icon: Icon, colorClass, subtextColorClass = 'text-gray-500' }: {
  title: string;
  value: number;
  subtext: string;
  icon: React.ElementType;
  colorClass: string;
  subtextColorClass?: string;
}) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 transition duration-300 hover:shadow-xl hover:border-blue-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        <p className={`text-xs mt-1 ${subtextColorClass}`}>{subtext}</p>
      </div>
      <div className={`p-3 ${colorClass} text-white rounded-full shadow-md`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function OperatorDashboard() {
  const [operatorData, setOperatorData] = useState<OperatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'claims' | 'leads'>('claims');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOperatorData();
  }, []);

  const fetchOperatorData = async () => {
    setLoading(true);
    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Rediriger vers login si pas de token
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/operator', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        // Token invalide ou rôle incorrect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setOperatorData(data);
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération des données');
      }
    } catch (error) {
      console.error('Error fetching operator data:', error);
      alert('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId: string, newStatus: string, itemType: 'claim' | 'lead') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/operator', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          itemType,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour les données localement
        if (operatorData) {
          if (itemType === 'claim') {
            const updatedClaims = operatorData.claims.map(claim => 
              claim.id === itemId ? { ...claim, status: newStatus as any } : claim
            );
            setOperatorData({
              ...operatorData,
              claims: updatedClaims,
            });
          } else {
            const updatedLeads = operatorData.leads.map(lead => 
              lead.id === itemId ? { ...lead, status: newStatus as any } : lead
            );
            setOperatorData({
              ...operatorData,
              leads: updatedLeads,
            });
          }
        }
        
        alert(`✅ Statut mis à jour avec succès!`);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  const handleAddComment = async (itemId: string, itemType: 'claim' | 'lead') => {
    const comment = prompt(`Ajouter un commentaire pour cette ${itemType === 'claim' ? 'réclamation' : 'lead'}:`);
    
    if (comment) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Session expirée. Veuillez vous reconnecter.');
          window.location.href = '/login';
          return;
        }

        const response = await fetch('/api/operator', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId,
            itemType,
            comments: comment,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Mettre à jour les données localement
          if (operatorData) {
            if (itemType === 'claim') {
              const updatedClaims = operatorData.claims.map(claim => 
                claim.id === itemId ? { ...claim, comments: comment } : claim
              );
              setOperatorData({
                ...operatorData,
                claims: updatedClaims,
              });
            } else {
              const updatedLeads = operatorData.leads.map(lead => 
                lead.id === itemId ? { ...lead, comments: comment } : lead
              );
              setOperatorData({
                ...operatorData,
                leads: updatedLeads,
              });
            }
          }
          
          alert(`✅ Commentaire ajouté!`);
        } else {
          throw new Error(data.error);
        }
      } catch (error: any) {
        alert(`❌ Erreur: ${error.message}`);
      }
    }
  };

  // Filtrer les données selon le statut et la recherche
  const filteredClaims = operatorData?.claims.filter(claim => {
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const filteredLeads = operatorData?.leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'new':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-300',
          icon: <AlertCircle size={16} className="text-blue-500" />,
          label: status === 'new' ? 'Nouveau' : 'Soumis'
        };
      case 'in_review':
      case 'in_progress':
        return {
          color: 'bg-yellow-50 text-yellow-700 border-yellow-300',
          icon: <Clock size={16} className="text-yellow-500" />,
          label: status === 'in_progress' ? 'En cours' : 'En revue'
        };
      case 'resolved':
      case 'converted':
        return {
          color: 'bg-green-50 text-green-700 border-green-300',
          icon: <CheckCircle size={16} className="text-green-500" />,
          label: status === 'converted' ? 'Converti' : 'Résolu'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-600 border-gray-300',
          icon: <FileText size={16} className="text-gray-500" />,
          label: status
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!operatorData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-10 rounded-xl shadow-2xl max-w-md w-full">
          <div className="inline-block p-4 bg-red-100 text-red-600 rounded-full mb-6">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Accès non autorisé</h2>
          <p className="text-gray-600 mb-8">
            Vous devez être un opérateur pour accéder à cette page.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
          >
            <ChevronRight size={20} />
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const stats = operatorData.stats.operator;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Tableau de bord Opérateur
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Bienvenue, <span className="font-semibold text-blue-600">{operatorData.operator.name || 'Opérateur'}</span> 👋
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                <User size={18} />
                {operatorData.operator.role}
              </div>
              
              <button
                onClick={fetchOperatorData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150 shadow-sm"
                title="Actualiser les données"
              >
                <RefreshCw size={18} className="text-blue-500" />
                <span className="hidden sm:inline font-medium">Actualiser</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Réclamations Totales"
            value={stats.totalClaims}
            subtext={`${stats.pendingClaims} en attente`}
            icon={FileText}
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Réclamations Résolues"
            value={stats.resolvedClaims}
            subtext={stats.totalClaims > 0 
              ? `${Math.round((stats.resolvedClaims / stats.totalClaims) * 100)}% de taux de résolution`
              : 'Aucune réclamation'
            }
            icon={CheckCircle}
            colorClass="bg-green-500"
            subtextColorClass="text-green-600 font-semibold"
          />
          <StatCard
            title="Leads Totaux"
            value={stats.totalLeads}
            subtext={`${stats.activeLeads} actifs`}
            icon={Users}
            colorClass="bg-purple-500"
          />
          <StatCard
            title="Leads Convertis"
            value={stats.convertedLeads}
            subtext={stats.totalLeads > 0 
              ? `${Math.round((stats.convertedLeads / stats.totalLeads) * 100)}% de taux de conversion`
              : 'Aucun lead'
            }
            icon={TrendingUp}
            colorClass="bg-orange-500"
            subtextColorClass="text-orange-600 font-semibold"
          />
        </div>

        {/* Contrôles et Tableau */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-8">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => {
                setActiveTab('claims');
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className={`px-4 py-3 font-semibold text-lg transition duration-150 ${
                activeTab === 'claims'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Réclamations ({stats.totalClaims})
            </button>
            <button
              onClick={() => {
                setActiveTab('leads');
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className={`px-4 py-3 font-semibold text-lg transition duration-150 ${
                activeTab === 'leads'
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Leads ({stats.totalLeads})
            </button>
          </div>

          {/* Filtres et Recherche */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Barre de recherche */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Rechercher dans les ${activeTab === 'claims' ? 'réclamations' : 'leads'}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtre par statut */}
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 appearance-none bg-white pr-8"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                {activeTab === 'claims' ? (
                  <>
                    <option value="submitted">Soumis</option>
                    <option value="in_review">En revue</option>
                    <option value="resolved">Résolu</option>
                  </>
                ) : (
                  <>
                    <option value="new">Nouveau</option>
                    <option value="in_progress">En cours</option>
                    <option value="converted">Converti</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Liste des éléments */}
          {activeTab === 'claims' ? (
            <ClaimsTable 
              filteredClaims={filteredClaims} 
              getStatusConfig={getStatusConfig} 
              handleStatusUpdate={handleStatusUpdate} 
              handleAddComment={handleAddComment}
              operatorData={operatorData}
            />
          ) : (
            <LeadsTable 
              filteredLeads={filteredLeads} 
              getStatusConfig={getStatusConfig} 
              handleStatusUpdate={handleStatusUpdate} 
              handleAddComment={handleAddComment}
              stats={stats}
              operatorData={operatorData}
            />
          )}
        </div>

        {/* Section informations rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-md">
            <h3 className="font-bold text-xl text-blue-700 mb-4 flex items-center gap-2">
              <Bell size={24} />
              Bonnes pratiques
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                <span>**Répondez aux réclamations sous 24h** pour maintenir un haut niveau de satisfaction client.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                <span>**Ajoutez des commentaires régulièrement** pour assurer la traçabilité et la collaboration.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                <span>**Contactez les leads dans les 48h** pour maximiser le taux de conversion.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                <span>**Mettez à jour les statuts au fur et à mesure** pour un tableau de bord précis.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white border border-green-200 rounded-xl p-6 shadow-md">
            <h3 className="font-bold text-xl text-green-700 mb-4 flex items-center gap-2">
              <Calendar size={24} />
              Aperçu du jour
            </h3>
            <div className="text-gray-700 space-y-3">
              <p className="flex justify-between items-center">
                <span className="font-medium flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Réclamations traitées:</span>
                <span className="font-bold text-lg text-green-600">{stats.resolvedClaims}</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="font-medium flex items-center gap-2"><Users size={18} className="text-purple-500" /> Leads contactés:</span>
                <span className="font-bold text-lg text-purple-600">{stats.activeLeads}</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="font-medium flex items-center gap-2"><MessageSquare size={18} className="text-blue-500" /> Commentaires ajoutés:</span>
                <span className="font-bold text-lg text-blue-600">{operatorData.claims.filter(c => c.comments).length + operatorData.leads.filter(l => l.comments).length}</span>
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-500 border-t pt-3">
              Dernière actualisation: {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Composant de table pour les réclamations
const ClaimsTable = ({ filteredClaims, getStatusConfig, handleStatusUpdate, handleAddComment, operatorData }: {
  filteredClaims: Claim[];
  getStatusConfig: (status: string) => { color: string, icon: JSX.Element, label: string };
  handleStatusUpdate: (itemId: string, newStatus: string, itemType: 'claim' | 'lead') => Promise<void>;
  handleAddComment: (itemId: string, itemType: 'claim' | 'lead') => Promise<void>;
  operatorData: OperatorData;
}) => {
  return (
    <>
      {filteredClaims.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réclamation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClaims.map((claim) => {
                const statusConfig = getStatusConfig(claim.status);
                return (
                  <tr key={claim.id} className="hover:bg-blue-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{claim.title}</div>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{claim.description || 'Aucune description'}</p>
                      {claim.comments && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <MessageSquare size={12} className="text-blue-400" />
                          <span className="italic">Commentaire: {claim.comments.length > 30 
                            ? claim.comments.substring(0, 30) + '...' 
                            : claim.comments}</span>
                        </p>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{claim.clientName}</div>
                      <div className="text-sm text-blue-600 hover:text-blue-800 transition duration-150">
                        <a href={`mailto:${claim.clientEmail}`}>{claim.clientEmail}</a>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {claim.status !== 'resolved' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'resolved', 'claim')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                            title="Marquer comme résolu"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Résolu
                          </button>
                        )}
                        
                        {claim.status === 'submitted' && (
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'in_review', 'claim')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150"
                            title="Mettre en revue"
                          >
                            <Clock size={14} className="mr-1" />
                            En revue
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleAddComment(claim.id, 'claim')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                          title="Ajouter un commentaire"
                        >
                          <MessageSquare size={14} className="mr-1" />
                          Commenter
                        </button>
                        
                        {claim.fileUrl && (
                          <a
                            href={claim.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-purple-800 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150"
                            title="Télécharger fichier joint"
                          >
                            <Download size={14} />
                          </a>
                        )}
                        
                        <a
                          href={`mailto:${claim.clientEmail}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-indigo-800 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                          title="Envoyer un email au client"
                        >
                          <Mail size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{filteredClaims.length}</span> réclamation{filteredClaims.length > 1 ? 's' : ''} affiché{filteredClaims.length > 1 ? 's' : ''} sur {operatorData.claims.length} total.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-300 rounded-full"></span>
                Soumis
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-300 rounded-full"></span>
                En revue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-300 rounded-full"></span>
                Résolu
              </span>
            </div>
          </div>
        </div>
      ) : operatorData.claims.length > 0 ? (
        <div className="p-10 text-center bg-gray-50 rounded-lg">
          <div className="inline-block p-4 bg-gray-200 text-gray-600 rounded-full mb-4">
            <Search size={36} />
          </div>
          <p className="text-xl text-gray-700 font-semibold mb-2">Aucune réclamation trouvée</p>
          <p className="text-gray-500">Ajustez vos filtres ou votre terme de recherche pour voir plus de résultats.</p>
        </div>
      ) : (
        <div className="p-10 text-center bg-blue-50 rounded-lg border border-blue-200">
          <div className="inline-block p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
            <FileText size={36} />
          </div>
          <p className="text-xl text-gray-700 font-semibold mb-2">Aucune réclamation assignée</p>
          <p className="text-gray-600">
            Vous n'avez pas encore de réclamations. Elles vous seront assignées par l'administrateur.
          </p>
        </div>
      )}
    </>
  );
};

// Composant de table pour les leads
const LeadsTable = ({ filteredLeads, getStatusConfig, handleStatusUpdate, handleAddComment, stats, operatorData }: {
  filteredLeads: Lead[];
  getStatusConfig: (status: string) => { color: string, icon: JSX.Element, label: string };
  handleStatusUpdate: (itemId: string, newStatus: string, itemType: 'claim' | 'lead') => Promise<void>;
  handleAddComment: (itemId: string, itemType: 'claim' | 'lead') => Promise<void>;
  stats: OperatorData['stats']['operator'];
  operatorData: OperatorData;
}) => {
  return (
    <>
      {filteredLeads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const statusConfig = getStatusConfig(lead.status);
                return (
                  <tr key={lead.id} className="hover:bg-purple-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <p className="text-xs text-gray-500 mt-1">{lead.email}</p>
                      {lead.comments && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <MessageSquare size={12} className="text-blue-400" />
                          <span className="italic">Commentaire: {lead.comments.length > 30 
                            ? lead.comments.substring(0, 30) + '...' 
                            : lead.comments}</span>
                        </p>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">{lead.phone || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => handleStatusUpdate(lead.id, 'converted', 'lead')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                            title="Marquer comme converti"
                          >
                            <TrendingUp size={14} className="mr-1" />
                            Convertir
                          </button>
                        )}
                        
                        {lead.status === 'new' && (
                          <button
                            onClick={() => handleStatusUpdate(lead.id, 'in_progress', 'lead')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150"
                            title="Mettre en cours"
                          >
                            <Clock size={14} className="mr-1" />
                            En cours
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleAddComment(lead.id, 'lead')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                          title="Ajouter un commentaire"
                        >
                          <MessageSquare size={14} className="mr-1" />
                          Commenter
                        </button>
                        
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-indigo-800 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                          title="Envoyer un email au lead"
                        >
                          <Mail size={14} />
                        </a>
                        
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-teal-800 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150"
                            title="Appeler le lead"
                          >
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{filteredLeads.length}</span> lead{filteredLeads.length > 1 ? 's' : ''} affiché{filteredLeads.length > 1 ? 's' : ''} sur {operatorData.leads.length} total.
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Taux de conversion global: <span className="font-bold text-green-600">{stats.totalLeads > 0 
                ? `${Math.round((stats.convertedLeads / stats.totalLeads) * 100)}%`
                : '0%'}</span>
            </p>
          </div>
        </div>
      ) : operatorData.leads.length > 0 ? (
        <div className="p-10 text-center bg-gray-50 rounded-lg">
          <div className="inline-block p-4 bg-gray-200 text-gray-600 rounded-full mb-4">
            <Search size={36} />
          </div>
          <p className="text-xl text-gray-700 font-semibold mb-2">Aucun lead trouvé</p>
          <p className="text-gray-500">Ajustez vos filtres ou votre terme de recherche pour voir plus de résultats.</p>
        </div>
      ) : (
        <div className="p-10 text-center bg-purple-50 rounded-lg border border-purple-200">
          <div className="inline-block p-4 bg-purple-100 text-purple-600 rounded-full mb-4">
            <Users size={36} />
          </div>
          <p className="text-xl text-gray-700 font-semibold mb-2">Aucun lead assigné</p>
          <p className="text-gray-600">
            Vous n'avez pas encore de leads. Ils vous seront assignés par l'administrateur.
          </p>
        </div>
      )}
    </>
  );
};
