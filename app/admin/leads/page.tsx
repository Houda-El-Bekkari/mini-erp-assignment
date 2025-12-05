'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, User, Mail, Phone, MessageSquare,
  Eye, Edit, Trash2, CheckCircle, Users, TrendingUp, Clock
} from 'lucide-react';
import Link from 'next/link';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'in_progress' | 'converted';
  assignedTo: string | null;
  assignedUserName: string | null;
  comments: string;
  convertedToClientId: string | null;
  createdAt: string;
};

export default function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new' as 'new' | 'in_progress' | 'converted',
    comments: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        console.error('Failed to fetch leads');
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      });

      const data = await response.json();

      if (response.ok) {
        // Add new lead to the list
        setLeads([...leads, {
          ...data,
          assignedTo: null,
          assignedUserName: null,
          convertedToClientId: null,
        }]);
        
        // Reset form
        setNewLead({
          name: '',
          email: '',
          phone: '',
          status: 'new',
          comments: '',
        });
        
        setShowCreateModal(false);
        alert('✅ Lead created successfully!');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error creating lead:', error);
      alert(`❌ Error: ${error.message || 'Unable to create lead'}`);
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    if (!confirm('Convert this lead to client? This will create a client account.')) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}/convert`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Update lead status
        setLeads(leads.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: 'converted', convertedToClientId: data.clientId }
            : lead
        ));
        
        alert(`✅ Lead converted to client!\n\nClient created: ${data.client.name}\nEmail: ${data.client.email}\nPassword: ${data.user.password}`);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error converting lead:', error);
      alert(`❌ Error: ${error.message || 'Unable to convert lead'}`);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLeads(leads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus as any } : lead
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    inProgressLeads: leads.filter(l => l.status === 'in_progress').length,
    convertedLeads: leads.filter(l => l.status === 'converted').length,
    conversionRate: leads.length > 0 
      ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100)
      : 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200';
      case 'in_progress': return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200';
      case 'converted': return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'converted': return 'Converted';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Leads Management</h1>
          <p className="text-gray-600">
            {leads.length === 0 ? 'No leads found' : `Manage your ${leads.length} leads`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          New Lead
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Total Leads</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">New</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.newLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-6 rounded-2xl border border-yellow-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.inProgressLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-2xl border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.conversionRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Message if no leads */}
      {leads.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200/50 rounded-2xl p-8 text-center">
          <p className="text-yellow-800 font-medium mb-2">No leads found</p>
          <p className="text-yellow-600">
            The database does not contain any leads yet.
            <br />
            Click "New Lead" to create one.
          </p>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={leads.length === 0}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-500" size={20} />
              <select
                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={leads.length === 0}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="converted">Converted</option>
              </select>
            </div>
            
            <button 
              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              disabled={leads.length === 0}
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-4 font-semibold">Lead</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Assigned To</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <span className="font-semibold text-blue-700">
                            {lead.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          {lead.comments && (
                            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                              <MessageSquare size={12} />
                              {lead.comments.length > 50 ? lead.comments.substring(0, 50) + '...' : lead.comments}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-gray-700">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-gray-500 text-sm">{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <select
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(lead.status)} focus:ring-0 focus:border-0`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        disabled={lead.status === 'converted'}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4">
                      {lead.assignedUserName ? (
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="text-gray-700">{lead.assignedUserName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-gray-600">{lead.createdAt}</td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lead.status !== 'converted' ? (
                          <button
                            onClick={() => handleConvertToClient(lead.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:shadow-md transition-shadow"
                            title="Convert to client"
                          >
                            Convert
                          </button>
                        ) : lead.convertedToClientId ? (
                          <Link
                            href={`/admin/clients/${lead.convertedToClientId}`}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:shadow-md transition-shadow"
                          >
                            View Client
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-sm">Converted</span>
                        )}
                        
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
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
                {filteredLeads.length} lead{filteredLeads.length > 1 ? 's' : ''} displayed
              </p>
              <div className="flex items-center gap-4">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  ← Previous
                </button>
                <span className="text-gray-700">Page 1 of 1</span>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : leads.length > 0 ? (
        <div className="bg-gray-50/50 rounded-2xl p-8 text-center">
          <p className="text-gray-600">No leads match your search.</p>
        </div>
      ) : null}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Lead</h2>
                  <p className="text-gray-500 text-sm mt-1">Add a new lead to the system</p>
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
              <form onSubmit={handleCreateLead} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
                        placeholder="John Doe"
                        value={newLead.name}
                        onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
                        placeholder="john@example.com"
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
                      placeholder="+33 1 23 45 67 89"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    value={newLead.status}
                    onChange={(e) => setNewLead({...newLead, status: e.target.value as any})}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Comments
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                    </div>
                    <textarea
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all group-hover:border-gray-400"
                      rows={3}
                      placeholder="Notes about the lead..."
                      value={newLead.comments}
                      onChange={(e) => setNewLead({...newLead, comments: e.target.value})}
                    />
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
                    <span className="relative">Create Lead</span>
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