'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle, Clock, Send } from 'lucide-react';
import Link from 'next/link';

export default function NewClaimPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [claimData, setClaimData] = useState({
    title: '',
    description: '',
    clientId: '',
    file: null as File | null,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        fetchClientInfo(user.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setErrorMessage('Error reading your information');
      }
    } else {
      setErrorMessage('You must be logged in to create a claim');
    }
  }, []);

  const fetchClientInfo = async (email: string) => {
    try {
      const clientsRes = await fetch('/api/clients');
      if (!clientsRes.ok) {
        throw new Error(`API error: ${clientsRes.status}`);
      }
      
      const clientsData = await clientsRes.json();
      const currentClient = clientsData.find((c: any) => c.email === email);
      
      if (currentClient) {
        setClientInfo(currentClient);
        setClaimData(prev => ({ ...prev, clientId: currentClient.id }));
      } else {
        setErrorMessage('Client not found. Please check your account.');
      }
    } catch (error: any) {
      console.error('Error fetching client info:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large (max. 10MB)');
        return;
      }
      setClaimData({ ...claimData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!claimData.title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    if (!claimData.description.trim()) {
      setErrorMessage('Description is required');
      return;
    }

    if (!claimData.clientId) {
      setErrorMessage('Client not found. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      let body: any;
      let headers: any = {};
      
      if (claimData.file) {
        const formData = new FormData();
        formData.append('title', claimData.title);
        formData.append('description', claimData.description);
        formData.append('clientId', claimData.clientId);
        formData.append('status', 'submitted');
        formData.append('file', claimData.file);
        
        body = formData;
      } else {
        body = JSON.stringify({
          title: claimData.title,
          description: claimData.description,
          clientId: claimData.clientId,
          status: 'submitted',
        });
        headers['Content-Type'] = 'application/json';
      }

      let response;
      
      try {
        response = await fetch('/api/claims', {
          method: 'POST',
          headers,
          body,
        });
      } catch (fetchError: any) {
        console.error('First endpoint failed:', fetchError);
      }

      if (!response || !response.ok) {
        const simpleBody = JSON.stringify({
          title: claimData.title,
          description: claimData.description,
          clientId: claimData.clientId,
          status: 'submitted',
        });

        response = await fetch('/api/claims/simple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: simpleBody,
        });
      }

      if (!response) {
        throw new Error('No response from server');
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid server response');
      }

      if (response.ok) {
        alert('✅ Claim created successfully!');
        router.push('/client');
      } else {
        throw new Error(data.error || data.details || data.message || 'Error creating claim');
      }
    } catch (error: any) {
      console.error('Full error:', error);
      setErrorMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!claimData.clientId && !errorMessage) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/client"
          className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">New Claim</h1>
          <p className="text-gray-600 mt-2">
            Fill out this form to submit a new claim
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <div>
              <p className="font-medium">{errorMessage}</p>
              {!claimData.clientId && (
                <p className="text-red-600 text-sm mt-1">
                  Please verify that you are properly logged in.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Client Information */}
              {clientInfo && (
                <div className="bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 border border-emerald-200/50 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Client: {clientInfo.name} ({clientInfo.email})
                      </p>
                      {clientInfo.company && (
                        <p className="text-gray-600 text-sm">{clientInfo.company}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        ID: {clientInfo.id?.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Claim Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Ex: Billing issue, Technical bug, Information request..."
                  value={claimData.title}
                  onChange={(e) => setClaimData({ ...claimData, title: e.target.value })}
                  disabled={!claimData.clientId}
                />
                <p className="text-gray-500 text-sm">
                  Briefly describe the subject of your claim
                </p>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Describe your problem or request in detail..."
                  value={claimData.description}
                  onChange={(e) => setClaimData({ ...claimData, description: e.target.value })}
                  disabled={!claimData.clientId}
                />
                <p className="text-gray-500 text-sm">
                  The more precise your description, the faster we can help you
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Attach File (optional)
                </label>
                <div className="border-2 border-dashed border-gray-300/50 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors duration-200 bg-white/50">
                  <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here or click to browse
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={!claimData.clientId}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-block px-6 py-2 rounded-lg cursor-pointer font-medium transition-all duration-200 ${
                      !claimData.clientId 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                    }`}
                  >
                    Browse Files
                  </label>
                  {claimData.file && (
                    <p className="text-emerald-600 text-sm mt-3">
                      ✓ File selected: {claimData.file.name} ({(claimData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-3">
                    Accepted formats: PDF, JPG, PNG, DOC (max. 10MB)
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-8 border-t border-gray-200/50">
                <Link
                  href="/client"
                  className="px-8 py-3 border border-gray-300/50 text-gray-700 rounded-xl hover:bg-gray-50/50 font-medium transition-all duration-200"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || !claimData.clientId}
                  className="group px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Claim
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Information */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 border border-emerald-100/50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Good to know:</h3>
            <ul className="space-y-3 text-gray-700 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
                <span>Your claim will be processed within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
                <span>You will receive email notifications about progress</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
                <span>You can track status from your dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
                <span>An operator will be assigned for follow-up</span>
              </li>
            </ul>
          </div>

          {/* Status Steps */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Next Steps</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                <Clock className="text-blue-500" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Submission</p>
                  <p className="text-gray-600 text-sm">Claim registered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg">
                <Clock className="text-amber-500" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Review</p>
                  <p className="text-gray-600 text-sm">Analysis by our team</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg">
                <CheckCircle className="text-emerald-500" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Resolution</p>
                  <p className="text-gray-600 text-sm">Processing completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}