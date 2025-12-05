'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, FileText, User, Clock, CheckCircle, 
  Eye, Edit, Trash2, AlertCircle, Users, MessageSquare, Download
} from 'lucide-react';
import Link from 'next/link';

type Claim = {
  id: string;
  title: string;
  description: string;
  status: 'submitted' | 'in_review' | 'resolved';
  clientId: string;
  clientName: string;
  clientEmail: string;
  assignedTo: string | null;
  assignedToName: string;
  assignedToRole: string | null;
  fileUrl: string | null;
  comments: string;
  createdAt: string;
};

type Operator = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ClaimsManagement() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newClaim, setNewClaim] = useState({
    title: '',
    description: '',
    clientId: '',
    status: 'submitted' as 'submitted' | 'in_review' | 'resolved',
    assignedTo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch claims
      const claimsRes = await fetch('/api/claims');
      const claimsData = await claimsRes.json();
      setClaims(claimsData);

      // Fetch operators
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      const operatorsData = usersData.filter((user: any) => 
        user.role === 'operator'
      );
      setOperators(operatorsData);

      // Fetch clients
      const clientsRes = await fetch('/api/clients');
      const clientsData = await clientsRes.json();
      setClients(clientsData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim),
      });

      const data = await response.json();

      if (response.ok) {
        // Reload data
        await fetchData();
        
        // Reset form
        setNewClaim({
          title: '',
          description: '',
          clientId: '',
          status: 'submitted',
          assignedTo: '',
        });
        
        setShowCreateModal(false);
        alert('✅ Claim created successfully!');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleStatusChange = async (claimId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setClaims(claims.map(claim => 
          claim.id === claimId ? { ...claim, status: newStatus as any } : claim
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignOperator = async (claimId: string, operatorId: string) => {
    try {
      const response = await fetch(`/api/claims/${claimId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId }),
      });

      const data = await response.json();

      if (response.ok) {
        setClaims(claims.map(claim => 
          claim.id === claimId 
            ? { 
                ...claim, 
                assignedTo: operatorId,
                assignedToName: data.operatorName || 'Operator'
              } 
            : claim
        ));
        alert('✅ Claim assigned!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    if (!confirm('Delete this claim?')) return;

    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClaims(claims.filter(claim => claim.id !== claimId));
        alert('✅ Claim deleted!');
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesAssigned = assignedFilter === 'all' || 
      (assignedFilter === 'unassigned' && !claim.assignedTo) ||
      (assignedFilter === 'assigned' && claim.assignedTo) ||
      claim.assignedTo === assignedFilter;
    
    return matchesSearch && matchesStatus && matchesAssigned;
  });

  // Statistics
  const stats = {
    total: claims.length,
    submitted: claims.filter(c => c.status === 'submitted').length,
    inReview: claims.filter(c => c.status === 'in_review').length,
    resolved: claims.filter(c => c.status === 'resolved').length,
    unassigned: claims.filter(c => !c.assignedTo).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200';
      case 'in_review': return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200';
      case 'resolved': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'in_review': return 'In Review';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <AlertCircle size={16} />;
      case 'in_review': return <Clock size={16} />;
      case 'resolved': return <CheckCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Claims Management</h1>
          <p className="text-gray-600">
            {claims.length === 0 ? 'No claims' : `Manage your ${claims.length} claims`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          New Claim
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Submitted</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.submitted}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-6 rounded-2xl border border-yellow-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">In Review</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.inReview}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.resolved}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 rounded-2xl border border-red-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 text-sm font-medium">Unassigned</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{stats.unassigned}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-100">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
            </div>
            <input
              type="text"
              placeholder="Search by title, description or client..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={claims.length === 0}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" size={20} />
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={claims.length === 0}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="text-gray-500" size={20} />
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              disabled={claims.length === 0}
            >
              <option value="all">All Assignments</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
              {operators.map(op => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      {filteredClaims.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-4 font-semibold">Claim</th>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Assigned To</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 mt-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{claim.title}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {claim.description || 'No description'}
                          </p>
                          {claim.comments && (
                            <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                              <MessageSquare size={10} />
                              {claim.comments.length > 50 ? claim.comments.substring(0, 50) + '...' : claim.comments}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{claim.clientName}</p>
                        <p className="text-gray-500 text-sm">{claim.clientEmail}</p>
                        <Link
                          href={`/admin/clients/${claim.clientId}`}
                          className="text-blue-600 text-xs hover:underline font-medium"
                        >
                          View Client
                        </Link>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(claim.status)} focus:ring-0 focus:border-0`}
                          value={claim.status}
                          onChange={(e) => handleStatusChange(claim.id, e.target.value)}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="in_review">In Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="text-sm border border-gray-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={claim.assignedTo || ''}
                          onChange={(e) => handleAssignOperator(claim.id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {operators.map(op => (
                            <option key={op.id} value={op.id}>
                              {op.name} ({op.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-gray-600 text-sm">{claim.createdAt}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {claim.fileUrl && (
                          <a
                            href={claim.fileUrl}
                            target="_blank"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-xl"
                            title="Download file"
                            rel="noopener noreferrer"
                          >
                            <Download size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="p-6 border-t border-gray-200/50 bg-gray-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-600 text-sm">
                {filteredClaims.length} claim{filteredClaims.length > 1 ? 's' : ''} displayed
              </p>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      ) : claims.length > 0 ? (
        <div className="bg-gray-50/50 rounded-2xl p-8 text-center">
          <p className="text-gray-600">No claims match your search.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200/50 rounded-2xl p-8 text-center">
          <p className="text-yellow-800 font-medium mb-2">No claims found</p>
          <p className="text-yellow-600">
            The database does not contain any claims yet.
            <br />
            Click "New Claim" to create one.
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Claim</h2>
                  <p className="text-gray-500 text-sm mt-1">Create a new claim for a client</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreateClaim} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
                      placeholder="Ex: Billing Issue"
                      value={newClaim.title}
                      onChange={(e) => setNewClaim({...newClaim, title: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                    <textarea
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
                      rows={3}
                      placeholder="Describe the claim..."
                      value={newClaim.description}
                      onChange={(e) => setNewClaim({...newClaim, description: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Client *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <select
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400 appearance-none"
                        value={newClaim.clientId}
                        onChange={(e) => setNewClaim({...newClaim, clientId: e.target.value})}
                      >
                        <option value="">Select a client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Initial Status
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400 appearance-none"
                        value={newClaim.status}
                        onChange={(e) => setNewClaim({...newClaim, status: e.target.value as any})}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="in_review">In Review</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Assign To (optional)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400 appearance-none"
                      value={newClaim.assignedTo}
                      onChange={(e) => setNewClaim({...newClaim, assignedTo: e.target.value})}
                    >
                      <option value="">Unassigned</option>
                      {operators.map(op => (
                        <option key={op.id} value={op.id}>
                          {op.name} ({op.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative">Create Claim</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}