import { createContext, useContext, useState, useCallback } from 'react';
import { typesStore, historyStore, getStats } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [certTypes, setCertTypes]   = useState(() => typesStore.list());
  const [history,   setHistory]     = useState(() => historyStore.list());
  const [stats,     setStats]       = useState(() => getStats());

  const refresh = useCallback(() => {
    setCertTypes(typesStore.list());
    setHistory(historyStore.list());
    setStats(getStats());
  }, []);

  const addType     = useCallback((data)      => { typesStore.create(data);          refresh(); }, [refresh]);
  const updateType  = useCallback((id, data)  => { typesStore.update(id, data);      refresh(); }, [refresh]);
  const deleteType  = useCallback((id)        => { typesStore.delete(id);            refresh(); }, [refresh]);
  const addHistory  = useCallback((data)      => { historyStore.add(data);           refresh(); }, [refresh]);

  return (
    <AppContext.Provider value={{
      certTypes, history, stats,
      addType, updateType, deleteType, addHistory, refresh,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  // Return safe defaults during HMR or if accidentally used outside provider
  if (!ctx) return { certTypes: [], stats: null, addType: () => {}, updateType: () => {}, deleteType: () => {}, addHistory: () => {} };
  return ctx;
}
