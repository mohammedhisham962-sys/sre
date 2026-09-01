'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    environment: 'production',
    repository_url: '',
    monitor_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchProjects = () => {
    fetch('/api/v1/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 1. Create Project
      const projRes = await fetch('/api/v1/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          environment: formData.environment,
          repository_url: formData.repository_url || null
        })
      });
      
      if (!projRes.ok) throw new Error('Failed to create project');
      const newProject = await projRes.json();

      // 2. Create Monitor
      if (formData.monitor_url) {
        const monRes = await fetch('/api/v1/monitoring/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: newProject.id,
            name: `${formData.name} Live Monitor`,
            url: formData.monitor_url,
            monitor_type: 'HTTP',
            interval_seconds: 60,
            is_active: true
          })
        });
        if (!monRes.ok) throw new Error('Failed to create monitor');
      }

      // Success
      setIsModalOpen(false);
      setFormData({ name: '', environment: 'production', repository_url: '', monitor_url: '' });
      fetchProjects();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="p-12 bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            + Add Project
          </button>
          <Link href="/" className="text-blue-600 hover:underline">← Dashboard</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Environment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No projects found.</td>
              </tr>
            ) : (
              projects.map((project: any) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    {project.repository_url && <div className="text-xs text-gray-400 mt-1">{project.repository_url}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{project.environment}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'Healthy' ? 'bg-green-100 text-green-800' : 
                        project.status === 'Failing' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                      {project.latency !== null && (
                        <span className="text-xs text-gray-500">{project.latency}ms</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                <input 
                  type="text" required 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-800 bg-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Production Frontend"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Live Monitor URL (Real-time tracking) *</label>
                <input 
                  type="url" required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-800 bg-white"
                  value={formData.monitor_url}
                  onChange={e => setFormData({...formData, monitor_url: e.target.value})}
                  placeholder="https://my-website.com"
                />
                <p className="text-xs text-gray-500 mt-1">The AIGRA Ops worker will ping this every 60s.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">GitHub Repository URL (Optional)</label>
                <input 
                  type="url" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-800 bg-white"
                  value={formData.repository_url}
                  onChange={e => setFormData({...formData, repository_url: e.target.value})}
                  placeholder="https://github.com/user/repo.git"
                />
                <p className="text-xs text-gray-500 mt-1">Required for AI Automated Repair capability.</p>
              </div>

              {submitError && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{submitError}</div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Start Monitoring'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
