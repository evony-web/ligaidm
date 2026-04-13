import { create } from "zustand";

export type AppView = "landing" | "dashboard" | "tournament" | "league" | "admin";
export type Division = "male" | "female";
export type NotifType = "donation" | "match" | "mvp" | "streak" | "victory";

interface Notification {
  id: string;
  type: NotifType;
  message: string;
}

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Division filter
  division: Division;
  setDivision: (d: Division) => void;

  // Mobile sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Loading
  loading: boolean;
  setLoading: (l: boolean) => void;

  // Donation popup (legacy - kept for backward compat)
  donationPopup: { show: boolean; message: string };
  showDonationPopup: (msg: string) => void;
  hideDonationPopup: () => void;

  // Notification queue
  notifications: Notification[];
  addNotification: (type: NotifType, message: string) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "landing",
  setCurrentView: (view) => set({ currentView: view }),

  division: "male",
  setDivision: (d) => set({ division: d }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  loading: false,
  setLoading: (l) => set({ loading: l }),

  donationPopup: { show: false, message: "" },
  showDonationPopup: (msg) => set({ donationPopup: { show: true, message: msg } }),
  hideDonationPopup: () => set({ donationPopup: { show: false, message: "" } }),

  notifications: [],
  addNotification: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ notifications: [...s.notifications, { id, type, message }] }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    }, 5000);
  },
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}));
