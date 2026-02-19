import React, { useState, useEffect } from 'react';
import { Icons } from '../../components/Icons';
import { agencyAPI } from '../../services/api';

export default function AgencyProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'female',
    dateOfBirth: '',
    maritalStatus: 'never_married',
    religion: '',
    country: 'Sri Lanka',
    city: '',
    bio: '',
    successFee: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await agencyAPI.getMyProfiles();
      // support multiple shapes: { data: [...] } | { profiles: [...] } | [...]
      const list = response?.data || response?.profiles || response || [];
      setProfiles(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Fetch profiles error:', error);
      alert('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.dateOfBirth || !formData.religion || !formData.city) {
      alert('Please fill all required fields');
      return;
    }

    if (!formData.successFee || parseFloat(formData.successFee) <= 0) {
      alert('Please enter a valid success fee');
      return;
    }

    try {
      setSubmitting(true);
      await agencyAPI.createProfile({
        ...formData,
        successFee: parseFloat(formData.successFee),
      });

      alert('Profile created successfully');
      setShowCreateModal(false);
      setFormData({
        fullName: '',
        gender: 'female',
        dateOfBirth: '',
        maritalStatus: 'never_married',
        religion: '',
        country: 'Sri Lanka',
        city: '',
        bio: '',
        successFee: '',
      });
      fetchProfiles();
    } catch (error) {
      console.error('Create profile error:', error);
      alert(error?.message || 'Failed to create profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    try {
      await agencyAPI.deleteProfile(profileId);
      alert('Profile deleted');
      fetchProfiles();
    } catch (error) {
      console.error('Delete profile error:', error);
      alert(error?.message || 'Failed to delete profile');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Profiles</h1>
          <p className="text-[var(--text-secondary)]">
            Create profiles with success fees. You earn 80% when marriages happen.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Icons.Plus size={18} />
          <span>Create Profile</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Icons.Users size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Array.isArray(profiles) ? profiles.length : 0}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Profiles</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Icons.Check size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Array.isArray(profiles) ? profiles.filter((p) => p.isActive !== false).length : 0}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">Active Profiles</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Icons.Eye size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Array.isArray(profiles) ? profiles.reduce((sum, p) => sum + (p.profileViews || 0), 0) : 0}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profiles List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Icons.Loader size={24} className="animate-spin text-[var(--accent-500)]" />
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="card p-8 text-center">
          <Icons.Users size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Profiles Yet</h3>
          <p className="text-[var(--text-secondary)] mb-4">Create your first profile to start receiving inquiries</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary mx-auto">
            <Icons.Plus size={18} />
            <span>Create Profile</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div key={profile._id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center text-white font-bold overflow-hidden">
                    {profile.photos?.[0]?.url ? (
                      <img src={profile.photos[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.fullName?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{profile.fullName}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{profile.profileId || 'ID Pending'}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                  }`}
                >
                  {profile.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Icons.MapPin size={14} />
                  <span>
                    {profile.city || '—'}, {profile.country || '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Icons.Calendar size={14} />
                  <span>
                    {profile.age || calculateAge(profile.dateOfBirth)} years, {profile.gender || '—'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-green-500 font-medium">
                  <Icons.CreditCard size={14} />
                  <span>
                    Fee: {profile.successFeeCurrency || 'LKR'}{' '}
                    {profile.successFee != null ? profile.successFee.toLocaleString() : 0}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Icons.Eye size={14} />
                  <span>{profile.profileViews || 0} views</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`/profile/${profile._id}`, '_blank')}
                  className="btn-secondary flex-1 text-sm justify-center"
                >
                  <Icons.Eye size={14} />
                  <span>View</span>
                </button>

                <button
                  onClick={() => handleDeleteProfile(profile._id)}
                  className="btn-secondary text-red-500 hover:bg-red-500/10 px-3"
                  title="Delete"
                >
                  <Icons.Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--bg-secondary)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-secondary)] p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h2 className="text-xl font-bold">Create New Profile</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[var(--surface-glass)] rounded-lg">
                <Icons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="select w-full">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Marital Status *</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="select w-full"
                  >
                    <option value="never_married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="awaiting_divorce">Awaiting Divorce</option>
                    <option value="annulled">Annulled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Religion *</label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Buddhist, Hindu"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="e.g., Colombo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="textarea w-full"
                  rows={3}
                  placeholder="Write a brief description..."
                />
              </div>

              {/* Success Fee */}
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <label className="block text-sm font-medium mb-1 text-green-400">Success Fee (LKR) *</label>
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  This fee is charged after a successful marriage. You receive 80%, admin gets 20%.
                </p>
                <input
                  type="number"
                  name="successFee"
                  value={formData.successFee}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g., 50000"
                  min="1000"
                  required
                />
                {formData.successFee && (
                  <p className="text-sm mt-2 text-green-400">
                    Your earning: LKR {Math.round(parseFloat(formData.successFee) * 0.8).toLocaleString()} (80%)
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? (
                    <>
                      <Icons.Loader size={18} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Plus size={18} />
                      <span>Create Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}