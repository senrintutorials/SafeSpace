import React, { useState } from 'react';
import { 
  GraduationCap, Users, Building2, HeartHandshake, Briefcase, 
  ShieldCheck, UserCheck, Award, ShieldAlert, X, Lock, Mail, 
  User, Phone, ArrowRight, Sparkles, LogIn, UserPlus, CheckCircle2,
  ChevronRight, Building, KeyRound, BookOpen, MapPin, Landmark
} from 'lucide-react';
import { ROLE_CONFIGS, DEMO_USERS, UserRole, UserProfile, getUserDisplayName } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, currentUser, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'demologin'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  
  // Sign In Form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Sign Up Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [roleSpecificFields, setRoleSpecificFields] = useState<Record<string, string>>({});
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const currentRoleConfig = ROLE_CONFIGS[selectedRole];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRoleSpecificFields({});
    setStatusMessage(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    setRoleSpecificFields(prev => ({ ...prev, [key]: value }));
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Check if email matches a demo user or localStorage
    const saved = localStorage.getItem('safespace_registered_users') || localStorage.getItem('selfsense_registered_users');
    const registeredUsers: UserProfile[] = saved ? JSON.parse(saved) : [];
    const allUsers = [...DEMO_USERS, ...registeredUsers];

    const found = allUsers.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase());

    if (found) {
      if (found.role !== selectedRole) {
        setStatusMessage({
          type: 'error',
          text: `Account found under '${ROLE_CONFIGS[found.role].label}'. Please select the matching role to sign in.`
        });
        return;
      }
      onLogin(found);
      setStatusMessage({ type: 'success', text: `Welcome back, ${found.fullName}!` });
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      // Create new session user for this email with selected role
      const newUser: UserProfile = {
        id: 'usr-' + Date.now(),
        fullName: emailInput.split('@')[0].replace('.', ' ').toUpperCase(),
        email: emailInput,
        role: selectedRole,
        organization: 'Verified Portal Entity',
        contactNumber: '0917-000-0000',
        roleSpecificData: {},
        createdAt: new Date().toISOString()
      };
      onLogin(newUser);
      setStatusMessage({ type: 'success', text: `Signed in as ${newUser.fullName} (${currentRoleConfig.label})` });
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!fullName || !email || !password) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields (Full Name, Email, Password).' });
      return;
    }

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      fullName,
      email,
      role: selectedRole,
      subRole: roleSpecificFields[currentRoleConfig.requiredFields[0]?.key] || currentRoleConfig.shortLabel,
      organization: organization || 'Department of Education / Partner Agency',
      contactNumber: contactNumber || '0917-000-0000',
      roleSpecificData: roleSpecificFields,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const saved = localStorage.getItem('safespace_registered_users') || localStorage.getItem('selfsense_registered_users');
    const registeredUsers: UserProfile[] = saved ? JSON.parse(saved) : [];
    registeredUsers.push(newUser);
    localStorage.setItem('safespace_registered_users', JSON.stringify(registeredUsers));

    onLogin(newUser);
    setStatusMessage({ type: 'success', text: `Account created successfully! Logged in as ${newUser.fullName}.` });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleDemoUserClick = (demoUser: UserProfile) => {
    onLogin(demoUser);
    setStatusMessage({ type: 'success', text: `Switched profile to ${demoUser.fullName} (${ROLE_CONFIGS[demoUser.role].label})` });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const renderRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'MapPin': return <MapPin className="w-5 h-5" />;
      case 'Landmark': return <Landmark className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative my-auto text-slate-800">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                SafeSpace Authentication Portal
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Role-Based Sign In & Registration for School & National Safety Ecosystem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300 transition-colors border border-slate-300"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => { setMode('signin'); setStatusMessage(null); }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              mode === 'signin'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-white/60'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In to Account
          </button>
          <button
            onClick={() => { setMode('signup'); setStatusMessage(null); }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              mode === 'signup'
                ? 'bg-white text-purple-700 border-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-white/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create New Account (Sign Up)
          </button>
          <button
            onClick={() => { setMode('demologin'); setStatusMessage(null); }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              mode === 'demologin'
                ? 'bg-white text-amber-700 border-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Quick Demo Role Switcher (12 Roles)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-white">
          
          {/* Active Status Banner */}
          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 border ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Current Logged In Profile Badge if any */}
          {currentUser && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${ROLE_CONFIGS[currentUser.role]?.badgeBg || 'bg-blue-100'} ${ROLE_CONFIGS[currentUser.role]?.badgeText || 'text-blue-700'} flex items-center justify-center border border-indigo-200 shrink-0`}>
                  {renderRoleIcon(ROLE_CONFIGS[currentUser.role]?.iconName || 'User')}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Currently Logged In:</div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {getUserDisplayName(currentUser)}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_CONFIGS[currentUser.role]?.badgeBg} ${ROLE_CONFIGS[currentUser.role]?.badgeText} border ${ROLE_CONFIGS[currentUser.role]?.border}`}>
                      {ROLE_CONFIGS[currentUser.role]?.shortLabel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 text-right hidden sm:block font-mono">
                {currentUser.organization}
              </div>
            </div>
          )}

          {/* MODE 1: DEMO ROLE SWITCHER */}
          {mode === 'demologin' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Instant One-Click Login as Any Role</h3>
                <p className="text-xs text-slate-600">Select any of the official stakeholder roles below to test and explore the portal with realistic verified credentials.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {DEMO_USERS.map((user) => {
                  const cfg = ROLE_CONFIGS[user.role];
                  const isCurrent = currentUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleDemoUserClick(user)}
                      className={`p-4 rounded-2xl text-left border transition-all duration-200 group flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-md' 
                          : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-9 h-9 rounded-xl ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.border} flex items-center justify-center`}>
                            {renderRoleIcon(cfg.iconName)}
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.border} uppercase tracking-wider`}>
                            {cfg.shortLabel}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {getUserDisplayName(user)}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 font-medium">
                          {user.subRole || cfg.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-2 font-mono truncate">
                          {user.organization}
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                        <span>{isCurrent ? 'Active Profile' : 'Select Profile'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2 & 3: SIGN IN OR SIGN UP */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="space-y-6">
              {/* Role Selection Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                  1. Select Account Role Category (9 Roles Available)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
                  {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((rKey) => {
                    const cfg = ROLE_CONFIGS[rKey];
                    const isSelected = selectedRole === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => handleRoleSelect(rKey)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.border} shadow-sm ring-1 ring-indigo-400`
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/80' : 'bg-slate-200/80'}`}>
                          {renderRoleIcon(cfg.iconName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs truncate">{cfg.shortLabel}</div>
                          <div className="text-[10px] text-slate-500 truncate opacity-80">{cfg.category}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role Context Callout */}
              <div className={`p-4 rounded-2xl ${currentRoleConfig.badgeBg} border ${currentRoleConfig.border} flex items-start gap-3.5`}>
                <div className="p-2.5 rounded-xl bg-white text-slate-900 shrink-0 mt-0.5 border border-slate-200 shadow-sm">
                  {renderRoleIcon(currentRoleConfig.iconName)}
                </div>
                <div>
                  <div className={`text-sm font-bold ${currentRoleConfig.badgeText} flex items-center gap-2`}>
                    Selected Role: {currentRoleConfig.label}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {currentRoleConfig.description}
                  </p>
                </div>
              </div>

              {/* Form Render */}
              {mode === 'signin' ? (
                /* SIGN IN FORM */
                <form onSubmit={handleSignInSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-indigo-600" />
                    2. Enter Account Credentials for {currentRoleConfig.shortLabel}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address / DepEd Account
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder={`e.g. name@${selectedRole === 'pnp_authority' ? 'pnp.gov.ph' : 'deped.gov.ph'}`}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        // Quick fill email from demo matching role
                        const demo = DEMO_USERS.find(d => d.role === selectedRole);
                        if (demo) {
                          setEmailInput(demo.email);
                          setPasswordInput('password123');
                        }
                      }}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Fill sample {currentRoleConfig.shortLabel} credentials
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In as {currentRoleConfig.shortLabel}
                    </button>
                  </div>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form onSubmit={handleSignUpSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-purple-600" />
                    2. Complete Account Registration ({currentRoleConfig.label})
                  </h4>

                  {/* Standard Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Juan Dela Cruz"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@school.edu.ph"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        School / Organization / Unit Name
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. Ramon Magsaysay HS / SDO Manila"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact / Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="e.g. 0917-123-4567"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Specific Verification Fields */}
                  <div className="pt-3 border-t border-slate-200">
                    <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2.5">
                      3. Role Verification Details ({currentRoleConfig.shortLabel})
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentRoleConfig.requiredFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={roleSpecificFields[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Register & Log In as {currentRoleConfig.shortLabel}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DepEd / National Safety & Mental Health Verification Portal</span>
          <span className="font-mono text-[11px] text-slate-600">9 Authenticated Role Modules Enabled</span>
        </div>

      </div>
    </div>
  );
}
