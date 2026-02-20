// ===== FILE: ./src/pages/VisitorsPage.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI, profileAPI } from '../services/api';
import { Icons } from '../components/Icons';
import ProfileCard from '../components/ProfileCard';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVisitors = async () => {
      try {
        // 1. Fetch 'profile_view' notifications
        // The backend notification controller supports filtering by type
        const res = await notificationAPI.getNotifications({ type: 'profile_view', limit: 20 });
        
        // 2. Extract unique user IDs from the notifications
        const uniqueUserIds = [...new Set(res.notifications.map(n => n.relatedUserId).filter(Boolean))];
        
        if (uniqueUserIds.length === 0) {
          setVisitors([]);
          return;
        }

        // 3. Fetch full profile details for these users
        // We use Promise.all to fetch them in parallel
        const profiles = await Promise.all(
          uniqueUserIds.map(id => profileAPI.getProfileById(id).then(r => r.profile).catch(() => null))
        );
        
        setVisitors(profiles.filter(Boolean));
      } catch (err) {
        console.error("Failed to load visitors:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVisitors();
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icons.Eye size={24} className="text-[var(--accent-500)]" />
            Recent Visitors
          </h1>
          <p className="text-[var(--text-secondary)]">People who viewed your profile recently</p>
        </div>
        <Link to="/dashboard" className="btn-secondary">
          <Icons.ChevronLeft size={16} /> Back
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-96 animate-pulse bg-[var(--surface-glass)]/50" />
          ))}
        </div>
      ) : visitors.length === 0 ? (
        <div className="card p-12 text-center border-dashed">
          <Icons.EyeOff size={48} className="mx-auto text-[var(--text-muted)] mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No visitors yet</h3>
          <p className="text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
            Your profile hasn't been viewed recently. Try updating your photo or details to get more attention!
          </p>
          <Link to="/complete-profile" className="btn-primary mt-6 inline-flex">
            <Icons.Edit size={16} className="mr-2" />
            Update Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visitors.map(profile => (
            <ProfileCard 
              key={profile._id} 
              profile={profile}
              // Basic handlers to prevent errors if clicked
              onInterest={() => {}} 
              onShortlist={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}