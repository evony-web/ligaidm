import { create } from "zustand";

export type AppView = "dashboard" | "tournament" | "league" | "admin";
export type Division = "male" | "female";

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

  // Donation popup
  donationPopup: { show: boolean; message: string };
  showDonationPopup: (msg: string) => void;
  hideDonationPopup: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "dashboard",
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
}));
