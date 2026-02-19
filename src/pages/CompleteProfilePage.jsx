// src/pages/CompleteProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileFormStep1 from '../components/ProfileFormStep1';
import ProfileFormStep2 from '../components/ProfileFormStep2';
import ProfileFormStep3 from '../components/ProfileFormStep3';
import ProfileFormStep4 from '../components/ProfileFormStep4';
import ProfileFormStep5 from '../components/ProfileFormStep5';
import { profileAPI } from '../services/api';
import { Icons } from '../components/Icons';

const DEFAULT_COUNTRY = 'Sri Lanka';

const STEPS = [
  { number: 1, title: 'Basic Info', component: ProfileFormStep1 },
  { number: 2, title: 'Lifestyle', component: ProfileFormStep2 },
  { number: 3, title: 'Location & Career', component: ProfileFormStep3 }, // ✅ updated title
  { number: 4, title: 'Partner', component: ProfileFormStep4 },
  { number: 5, title: 'Photos', component: ProfileFormStep5 },
];

const STEP_VALIDATIONS = {
  1: [
    { key: 'fullName', label: 'Full Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'maritalStatus', label: 'Marital Status' },
    { key: 'religion', label: 'Religion' },
  ],
  2: [],
  3: [
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'education', label: 'Highest Education' }, // ✅ UI says required
    { key: 'occupation', label: 'Occupation' }, // ✅ UI says required
  ],
  4: [],
  5: [],
};

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // ✅ Agencies should not use user profile setup
  const isAgency = user?.role === 'agency';
  const agencyStatus = user?.agencyVerification?.status || 'none';
  const agencyRedirectTo = agencyStatus === 'approved' ? '/agency' : '/agency/pending';

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    religion: '',
    caste: '',
    subCaste: '',
    motherTongue: '',
    bio: '',
    height: { feet: 5, inches: 6 },
    weight: '',
    bodyType: '',
    complexion: '',
    physicalStatus: '',
    diet: '',
    smoking: '',
    drinking: '',
    hobbies: [],
    interests: [],
    languages: [],
    country: DEFAULT_COUNTRY,
    state: '',
    city: '',
    citizenship: 'Sri Lanka',
    residencyStatus: '',
    education: '',
    educationField: '',
    institution: '',
    occupation: '',
    employmentType: '',
    company: '',
    jobTitle: '',

    // ✅ NEW: monthly income (keep annual for backward compatibility)
    monthlyIncome: '',
    annualIncome: '',

    partnerPreferences: {
      ageRange: { min: 21, max: 35 },
      heightRange: { min: 150, max: 180 },
      religion: [],
      caste: [],
      education: [],
      occupation: [],
      maritalStatus: [],
      diet: [],
      city: [],
      country: [],
    },
    photos: [],
    privacySettings: {
      showPhone: false,
      showEmail: false,
      showIncome: false,
      photoVisibility: 'all',
      profileVisibility: 'all',
    },
  });

  useEffect(() => {
    if (isAgency) {
      setInitialLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getMyProfile();
        if (response.profile) {
          setIsEditMode(true);
          const profile = response.profile;

          let heightObj = { feet: 5, inches: 6 };
          if (profile.height) {
            if (typeof profile.height === 'object') {
              heightObj = {
                feet: profile.height.feet || 5,
                inches: profile.height.inches || 6,
              };
            } else if (typeof profile.height === 'number') {
              const totalInches = Math.round(profile.height / 2.54);
              heightObj = {
                feet: Math.floor(totalInches / 12),
                inches: totalInches % 12,
              };
            }
          }

          setFormData((prev) => ({
            ...prev,
            fullName: profile.fullName || '',
            gender: profile.gender || '',
            dateOfBirth: profile.dateOfBirth
              ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
              : '',
            maritalStatus: profile.maritalStatus || '',
            religion: profile.religion || '',
            caste: profile.caste || '',
            subCaste: profile.subCaste || '',
            motherTongue: profile.motherTongue || '',
            bio: profile.bio || '',
            height: heightObj,
            weight: profile.weight || '',
            bodyType: profile.bodyType || '',
            complexion: profile.complexion || '',
            physicalStatus: profile.physicalStatus || '',
            diet: profile.diet || '',
            smoking: profile.smoking || '',
            drinking: profile.drinking || '',
            hobbies: profile.hobbies || [],
            interests: profile.interests || [],
            languages: profile.languages || [],
            country: profile.country || DEFAULT_COUNTRY,
            state: profile.state || '',
            city: profile.city || '',
            citizenship: profile.citizenship || '',
            residencyStatus: profile.residencyStatus || '',
            education: profile.education || '',
            educationField: profile.educationField || '',
            institution: profile.institution || '',
            occupation: profile.occupation || '',
            employmentType: profile.employmentType || '',
            company: profile.company || '',
            jobTitle: profile.jobTitle || '',

            // ✅ NEW: prefill monthlyIncome
            monthlyIncome: profile.monthlyIncome || '',
            annualIncome: profile.annualIncome || '',

            partnerPreferences: {
              ...prev.partnerPreferences,
              ...(profile.partnerPreferences || {}),
            },
            privacySettings: {
              showPhone: Boolean(profile.privacySettings?.showPhone),
              showEmail: Boolean(profile.privacySettings?.showEmail),
              showIncome: Boolean(profile.privacySettings?.showIncome),
              photoVisibility: profile.privacySettings?.photoVisibility || 'all',
              profileVisibility: profile.privacySettings?.profileVisibility || 'all',
            },
            photos: profile.photos || [],
          }));
        }
      } catch {
        // no profile yet
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgency]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step) => {
    const validations = STEP_VALIDATIONS[step] || [];
    const missing = validations.filter(({ key }) => {
      const value = formData[key];
      return !value || (typeof value === 'string' && !value.trim());
    });

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.map((m) => m.label).join(', ')}`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setError('');
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const prepareProfileData = () => {
    const data = {};

    if (formData.fullName?.trim()) data.fullName = formData.fullName.trim();
    if (formData.gender) data.gender = formData.gender;
    if (formData.maritalStatus) data.maritalStatus = formData.maritalStatus;
    if (formData.religion?.trim()) data.religion = formData.religion.trim();

    if (formData.country?.trim()) data.country = formData.country.trim();
    if (formData.city?.trim()) data.city = formData.city.trim();

    if (formData.dateOfBirth) data.dateOfBirth = new Date(formData.dateOfBirth).toISOString();

    if (formData.height) {
      const feet = parseInt(formData.height.feet, 10) || 5;
      const inches = parseInt(formData.height.inches, 10) || 6;
      const cm = Math.round((feet * 12 + inches) * 2.54);
      data.height = { feet, inches, cm };
    }

    const optionalStringFields = [
      'caste',
      'subCaste',
      'motherTongue',
      'bio',
      'bodyType',
      'complexion',
      'physicalStatus',
      'state',
      'citizenship',
      'residencyStatus',
      'education',
      'educationField',
      'institution',
      'occupation',
      'employmentType',
      'company',
      'jobTitle',

      // ✅ NEW
      'monthlyIncome',

      // keep old (optional)
      'annualIncome',

      'diet',
      'smoking',
      'drinking',
    ];

    optionalStringFields.forEach((field) => {
      const value = formData[field];
      if (value && typeof value === 'string' && value.trim()) data[field] = value.trim();
    });

    if (formData.weight) {
      const weight = parseInt(formData.weight, 10);
      if (weight > 0) data.weight = weight;
    }

    ['hobbies', 'interests', 'languages'].forEach((field) => {
      if (Array.isArray(formData[field]) && formData[field].length > 0) data[field] = formData[field];
    });

    if (formData.partnerPreferences) {
      const prefs = {};
      Object.entries(formData.partnerPreferences).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value) && value.length > 0) prefs[key] = value;
          else if (typeof value === 'object' && !Array.isArray(value)) {
            if (value.min !== undefined || value.max !== undefined) prefs[key] = value;
          }
        }
      });
      data.partnerPreferences = prefs;
    }

    data.privacySettings = {
      showPhone: Boolean(formData.privacySettings?.showPhone),
      showEmail: Boolean(formData.privacySettings?.showEmail),
      showIncome: Boolean(formData.privacySettings?.showIncome),
      photoVisibility: formData.privacySettings?.photoVisibility || 'all',
      profileVisibility: formData.privacySettings?.profileVisibility || 'all',
    };

    return data;
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    setLoadingMessage('Preparing profile...');
    setError('');

    try {
      const profileData = prepareProfileData();

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Profile payload:', JSON.stringify(profileData, null, 2));
      }

      if (isEditMode) {
        setLoadingMessage('Updating profile...');
        await profileAPI.updateProfile(profileData);
      } else {
        setLoadingMessage('Creating profile...');
        await profileAPI.createProfile(profileData);
      }

      const newPhotos = (formData.photos || []).filter((p) => p.file instanceof File);
      if (newPhotos.length > 0) {
        setLoadingMessage(`Uploading ${newPhotos.length} photo(s)...`);
        const uploadFormData = new FormData();
        newPhotos.forEach((p) => uploadFormData.append('photos', p.file));

        try {
          await profileAPI.uploadPhotos(uploadFormData);
        } catch (photoErr) {
          console.warn('Photo upload failed:', photoErr);
        }
      }

      setLoadingMessage('Finalizing...');
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Failed to save profile');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  if (isAgency) return <Navigate to={agencyRedirectTo} replace />;

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12 px-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-[var(--accent-500)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-[var(--accent-700)]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-[var(--accent-500)]" />
            <span className="text-[10px] font-bold text-[var(--accent-500)] uppercase tracking-widest">
              {isEditMode ? 'Edit Profile' : 'Create Profile'}
            </span>
            <span className="w-8 h-px bg-[var(--accent-500)]" />
          </div>
          <h1 className="heading-xl mb-2">
            Profile <span className="text-gradient">Setup</span>
          </h1>
          <p className="text-[var(--text-muted)]">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        <div className="mb-8 lg:mb-12">
          <div className="flex justify-between mb-4 lg:mb-6">
            {STEPS.map((step) => (
              <button
                key={step.number}
                onClick={() => currentStep > step.number && setCurrentStep(step.number)}
                disabled={currentStep < step.number}
                className={`flex flex-col items-center gap-2 transition-all ${
                  currentStep >= step.number ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                    currentStep === step.number
                      ? 'bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] text-white shadow-lg'
                      : currentStep > step.number
                        ? 'bg-green-500/20 border border-green-500/50 text-green-500'
                        : 'glass-surface'
                  }`}
                >
                  {currentStep > step.number ? <Icons.Check size={18} /> : step.number}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider hidden sm:block">
                  {step.title}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full bg-[var(--surface-glass)] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="card p-6 lg:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3">
                <Icons.AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-400 font-medium mb-1">Error</p>
                  <pre className="text-xs text-red-400/80 whitespace-pre-wrap font-sans">{error}</pre>
                </div>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                  <Icons.X size={16} />
                </button>
              </div>
            </div>
          )}

          <CurrentStepComponent data={formData} onChange={handleFieldChange} />

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-[var(--border-primary)]">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="btn-secondary w-full sm:w-auto order-2 sm:order-1 disabled:opacity-30"
            >
              <Icons.ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="btn-primary w-full sm:w-auto order-1 sm:order-2"
              >
                <span>Next</span>
                <Icons.ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner-sm" />
                    <span>{loadingMessage}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icons.Check size={16} />
                    <span>{isEditMode ? 'Update Profile' : 'Complete Profile'}</span>
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {!isEditMode && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-500)] transition-colors"
            >
              Skip for now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}