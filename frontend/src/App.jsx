import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Savings from './pages/Savings';
import Budget from './pages/Budget';
import Checklist from './pages/Checklist';
import Rundown from './pages/Rundown';
import Guests from './pages/Guests';
import Vendors from './pages/Vendors';
import Tables from './pages/Tables';
import BridalParty from './pages/BridalParty';
import Login from './pages/Login';
import { Menu, X, AlertTriangle, RefreshCw, Heart } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-800">Terjadi Kesalahan Tampilan</h3>
          <p className="text-xs text-slate-500">
            {this.state.error?.message || 'Gagal memuat komponen.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('wedding_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // States
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savings, setSavings] = useState([]);
  const [budgetItems, setBudgetItems] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [rundownItems, setRundownItems] = useState([]);
  const [guests, setGuests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tables, setTables] = useState([]);
  const [bridalParty, setBridalParty] = useState([]);

  // Fetch all data
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        sumData,
        profData,
        savData,
        budData,
        chkData,
        runData,
        gstData,
        vndData,
        tblData,
        ptyData,
      ] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getProfile().catch(() => null),
        api.getSavings().catch(() => []),
        api.getBudget().catch(() => []),
        api.getChecklist().catch(() => []),
        api.getRundown().catch(() => []),
        api.getGuests().catch(() => []),
        api.getVendors().catch(() => []),
        api.getTables().catch(() => []),
        api.getBridalParty().catch(() => []),
      ]);

      if (sumData) setSummary(sumData);
      if (profData) setProfile(profData);
      setSavings(Array.isArray(savData) ? savData : []);
      setBudgetItems(Array.isArray(budData) ? budData : []);
      setChecklistItems(Array.isArray(chkData) ? chkData : []);
      setRundownItems(Array.isArray(runData) ? runData : []);
      setGuests(Array.isArray(gstData) ? gstData : []);
      setVendors(Array.isArray(vndData) ? vndData : []);
      setTables(Array.isArray(tblData) ? tblData : []);
      setBridalParty(Array.isArray(ptyData) ? ptyData : []);
    } catch (err) {
      console.error('Error fetching wedding data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await api.logout().catch(() => {});
    } finally {
      localStorage.removeItem('wedding_token');
      localStorage.removeItem('wedding_user');
      setCurrentUser(null);
    }
  }, []);

  // Verify auth on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('wedding_token');
      if (!token) {
        setCurrentUser(null);
        setIsAuthChecking(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem('wedding_user', JSON.stringify(res.user));
          await loadAllData();
        } else {
          handleLogout();
        }
      } catch (err) {
        console.warn('Sesi login telah berakhir:', err);
        handleLogout();
      } finally {
        setIsAuthChecking(false);
      }
    };

    verifyAuth();
  }, [handleLogout, loadAllData]);

  // Login handler
  const handleLoginSuccess = async (user, token) => {
    setCurrentUser(user);
    await loadAllData();
  };

  // Refresh summary after changes
  const refreshSummary = async () => {
    try {
      const sum = await api.getDashboard();
      setSummary(sum);
    } catch (e) {
      console.error(e);
    }
  };

  // Profile handlers
  const handleUpdateProfile = async (data) => {
    const updated = await api.updateProfile(data);
    setProfile(updated);
    await refreshSummary();
  };

  // Savings handlers
  const handleAddSavings = async (data) => {
    const created = await api.createSavings(data);
    setSavings((prev) => [...prev, created]);
    await refreshSummary();
  };
  const handleUpdateSavings = async (id, data) => {
    const updated = await api.updateSavings(id, data);
    setSavings((prev) => prev.map((s) => (s.id === id ? updated : s)));
    await refreshSummary();
  };
  const handleDeleteSavings = async (id) => {
    await api.deleteSavings(id);
    setSavings((prev) => prev.filter((s) => s.id !== id));
    await refreshSummary();
  };

  // Budget handlers
  const handleAddBudget = async (data) => {
    const created = await api.createBudget(data);
    setBudgetItems((prev) => [...prev, created]);
    await refreshSummary();
  };
  const handleUpdateBudget = async (id, data) => {
    const updated = await api.updateBudget(id, data);
    setBudgetItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
    await refreshSummary();
  };
  const handleDeleteBudget = async (id) => {
    await api.deleteBudget(id);
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));
    await refreshSummary();
  };

  // Checklist handlers
  const handleToggleChecklist = async (id) => {
    const updated = await api.toggleChecklist(id);
    setChecklistItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
    await refreshSummary();
  };
  const handleAddChecklist = async (data) => {
    const created = await api.createChecklist(data);
    setChecklistItems((prev) => [...prev, created]);
    await refreshSummary();
  };
  const handleUpdateChecklist = async (id, data) => {
    const updated = await api.updateChecklist(id, data);
    setChecklistItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
    await refreshSummary();
  };
  const handleDeleteChecklist = async (id) => {
    await api.deleteChecklist(id);
    setChecklistItems((prev) => prev.filter((c) => c.id !== id));
    await refreshSummary();
  };

  // Rundown handlers
  const handleAddRundown = async (data) => {
    const created = await api.createRundown(data);
    setRundownItems((prev) => [...prev, created]);
    await refreshSummary();
  };
  const handleUpdateRundown = async (id, data) => {
    const updated = await api.updateRundown(id, data);
    setRundownItems((prev) => prev.map((r) => (r.id === id ? updated : r)));
    await refreshSummary();
  };
  const handleDeleteRundown = async (id) => {
    await api.deleteRundown(id);
    setRundownItems((prev) => prev.filter((r) => r.id !== id));
    await refreshSummary();
  };

  // Guest handlers
  const handleAddGuest = async (data) => {
    const created = await api.createGuest(data);
    setGuests((prev) => [...prev, created]);
    await refreshSummary();
  };
  const handleUpdateGuest = async (id, data) => {
    const updated = await api.updateGuest(id, data);
    setGuests((prev) => prev.map((g) => (g.id === id ? updated : g)));
    await refreshSummary();
  };
  const handleToggleSouvenir = async (id) => {
    const updated = await api.toggleSouvenir(id);
    setGuests((prev) => prev.map((g) => (g.id === id ? updated : g)));
    await refreshSummary();
  };
  const handleDeleteGuest = async (id) => {
    await api.deleteGuest(id);
    setGuests((prev) => prev.filter((g) => g.id !== id));
    await refreshSummary();
  };

  // Vendor handlers
  const handleAddVendor = async (data) => {
    const created = await api.createVendor(data);
    setVendors((prev) => [...prev, created]);
    await refreshSummary();
  };
  const handleUpdateVendor = async (id, data) => {
    const updated = await api.updateVendor(id, data);
    setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
    await refreshSummary();
  };
  const handleDeleteVendor = async (id) => {
    await api.deleteVendor(id);
    setVendors((prev) => prev.filter((v) => v.id !== id));
    await refreshSummary();
  };

  // Table handlers
  const handleAddTable = async (data) => {
    const created = await api.createTable(data);
    setTables((prev) => [...prev, created]);
    const tbls = await api.getTables();
    setTables(tbls);
  };
  const handleUpdateTable = async (id, data) => {
    await api.updateTable(id, data);
    const tbls = await api.getTables();
    setTables(tbls);
  };
  const handleDeleteTable = async (id) => {
    await api.deleteTable(id);
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  // Bridal Party handlers
  const handleAddMember = async (data) => {
    const created = await api.createBridalParty(data);
    setBridalParty((prev) => [...prev, created]);
  };
  const handleUpdateMember = async (id, data) => {
    const updated = await api.updateBridalParty(id, data);
    setBridalParty((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };
  const handleDeleteMember = async (id) => {
    await api.deleteBridalParty(id);
    setBridalParty((prev) => prev.filter((m) => m.id !== id));
  };

  // If verifying authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-linear-to-br from-rose-50 via-stone-50 to-amber-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-3xl bg-linear-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-300 mb-4 animate-pulse">
          <Heart className="w-7 h-7 fill-white" />
        </div>
        <h2 className="font-serif text-xl font-bold text-slate-800">
          Wedding Planner
        </h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 justify-center">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
          Memuat Portal Wedding Planner...
        </p>
      </div>
    );
  }

  // If not authenticated, show Login screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          daysRemaining={summary?.days_remaining}
          currentUser={currentUser}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-white flex flex-col h-full shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b">
              <span className="font-bold text-slate-800">Menu Navigasi</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              profile={profile}
              daysRemaining={summary?.days_remaining}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif font-bold text-sm text-slate-800">
            {profile?.bride_name && profile?.groom_name
              ? `${profile.bride_name} & ${profile.groom_name}`
              : (currentUser?.name || 'Wedding Planner')}
          </span>
          <div className="w-9" />
        </div>

        <Navbar
          profile={profile}
          currentUser={currentUser}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {activeTab === 'dashboard' && (
              <Dashboard
                summary={summary}
                onNavigate={(tab) => setActiveTab(tab)}
                onToggleChecklist={handleToggleChecklist}
              />
            )}

            {activeTab === 'profile' && (
              <Profile
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'savings' && (
              <Savings
                savings={savings}
                targetSavings={profile?.target_savings || 50000000}
                onAddSavings={handleAddSavings}
                onUpdateSavings={handleUpdateSavings}
                onDeleteSavings={handleDeleteSavings}
              />
            )}

            {activeTab === 'budget' && (
              <Budget
                budgetItems={budgetItems}
                totalBudget={profile?.total_budget || 50000000}
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                onDeleteBudget={handleDeleteBudget}
              />
            )}

            {activeTab === 'checklist' && (
              <Checklist
                checklistItems={checklistItems}
                onToggleChecklist={handleToggleChecklist}
                onAddChecklist={handleAddChecklist}
                onUpdateChecklist={handleUpdateChecklist}
                onDeleteChecklist={handleDeleteChecklist}
              />
            )}

            {activeTab === 'rundown' && (
              <Rundown
                rundownItems={rundownItems}
                onAddRundown={handleAddRundown}
                onUpdateRundown={handleUpdateRundown}
                onDeleteRundown={handleDeleteRundown}
              />
            )}

            {activeTab === 'guests' && (
              <Guests
                guests={guests}
                onAddGuest={handleAddGuest}
                onUpdateGuest={handleUpdateGuest}
                onToggleSouvenir={handleToggleSouvenir}
                onDeleteGuest={handleDeleteGuest}
                profile={profile}
              />
            )}

            {activeTab === 'vendors' && (
              <Vendors
                vendors={vendors}
                onAddVendor={handleAddVendor}
                onUpdateVendor={handleUpdateVendor}
                onDeleteVendor={handleDeleteVendor}
              />
            )}

            {activeTab === 'tables' && (
              <Tables
                tables={tables}
                onAddTable={handleAddTable}
                onUpdateTable={handleUpdateTable}
                onDeleteTable={handleDeleteTable}
              />
            )}

            {activeTab === 'bridal-party' && (
              <BridalParty
                bridalParty={bridalParty}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
