'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');

  // Mock data for demo
  const stats = [
    { 
      title: 'Active Leads', 
      value: '24', 
      change: '+12.5%', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      color: 'from-blue-500 to-blue-600',
      trend: 'up'
    },
    { 
      title: 'Total Clients', 
      value: '148', 
      change: '+5.2%', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.5v-1.5a4 4 0 00-4-4h-2.5" />
        </svg>
      ), 
      color: 'from-green-500 to-emerald-600',
      trend: 'up'
    },
    { 
      title: 'Monthly Revenue', 
      value: '$45,278', 
      change: '+18.3%', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      color: 'from-purple-500 to-indigo-600',
      trend: 'up'
    },
    { 
      title: 'Pending Claims', 
      value: '8', 
      change: '-2.1%', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ), 
      color: 'from-orange-500 to-amber-600',
      trend: 'down'
    },
  ];

  const recentLeads = [
    { id: 1, name: 'John Smith', email: 'john@example.com', status: 'New', date: '2024-01-15', priority: 'high' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'In Progress', date: '2024-01-14', priority: 'medium' },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', status: 'Converted', date: '2024-01-13', priority: 'low' },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com', status: 'New', date: '2024-01-12', priority: 'high' },
    { id: 5, name: 'Robert Brown', email: 'robert@example.com', status: 'Contacted', date: '2024-01-11', priority: 'medium' },
  ];

  const recentClaims = [
    { id: 1, client: 'Acme Corporation', type: 'Service Issue', status: 'Submitted', date: '2024-01-15', priority: 'urgent' },
    { id: 2, client: 'Tech Solutions LLC', type: 'Billing Inquiry', status: 'In Review', date: '2024-01-14', priority: 'high' },
    { id: 3, client: 'Global Industries', type: 'Product Defect', status: 'Resolved', date: '2024-01-13', priority: 'low' },
    { id: 4, client: 'Innovate Co', type: 'Technical Support', status: 'In Progress', date: '2024-01-12', priority: 'medium' },
  ];

  const quickActions = [
    { label: 'Create New Lead', icon: 'plus', href: '/admin/leads/new', color: 'bg-gradient-to-r from-blue-600 to-blue-700' },
    { label: 'Add New Client', icon: 'user-plus', href: '/admin/clients/new', color: 'bg-gradient-to-r from-green-600 to-emerald-700' },
    { label: 'Manage Users', icon: 'users', href: '/admin/users', color: 'bg-gradient-to-r from-purple-600 to-indigo-700' },
    { label: 'Generate Report', icon: 'file-text', href: '/admin/analytics', color: 'bg-gradient-to-r from-gray-600 to-slate-700' },
    { label: 'View Analytics', icon: 'bar-chart', href: '/admin/analytics', color: 'bg-gradient-to-r from-orange-600 to-amber-700' },
    { label: 'System Settings', icon: 'settings', href: '/admin/settings', color: 'bg-gradient-to-r from-cyan-600 to-blue-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, Administrator. Here's what's happening with your business.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1">
            {['day', 'week', 'month', 'quarter'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <svg className={`w-3 h-3 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={stat.trend === 'up' ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
                  />
                </svg>
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.title}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-blue-600 font-medium text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                View details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Leads</h2>
                <p className="text-gray-500 text-sm mt-1">Latest lead interactions and status</p>
              </div>
              <Link 
                href="/admin/leads" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group/link"
              >
                View all
                <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Lead</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          lead.priority === 'high' ? 'bg-red-500' :
                          lead.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-gray-500 text-sm">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'Converted' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Claims</h2>
                <p className="text-gray-500 text-sm mt-1">Latest client claims and resolutions</p>
              </div>
              <Link 
                href="/admin/claims" 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group/link"
              >
                View all
                <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Client</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {recentClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{claim.client}</p>
                      <p className="text-gray-500 text-xs">{claim.date}</p>
                    </td>
                    <td className="p-4 text-gray-600">{claim.type}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          claim.status === 'Submitted' ? 'bg-gray-100 text-gray-800' :
                          claim.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                          claim.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {claim.status}
                        </span>
                        {claim.priority === 'urgent' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-500 text-sm mt-1">Frequently used actions and shortcuts</p>
          </div>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group relative overflow-hidden rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className={`p-3 rounded-xl ${action.color} text-white w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={
                      action.icon === 'plus' ? "M12 4v16m8-8H4" :
                      action.icon === 'user-plus' ? "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" :
                      action.icon === 'users' ? "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.5v-1.5a4 4 0 00-4-4h-2.5" :
                      action.icon === 'file-text' ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" :
                      action.icon === 'bar-chart' ? "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" :
                      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    }
                  />
                </svg>
              </div>
              <p className="font-medium text-gray-800 group-hover:text-gray-900">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}