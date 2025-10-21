"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CompanyTemplateResponse } from "@/types/company-template";

type CompanyTemplateState = {
  template: CompanyTemplateResponse | null;
  setTemplate: (t: CompanyTemplateResponse | null) => void;
  clear: () => void;
};

export const useCompanyTemplateStore = create<CompanyTemplateState>()(
  persist(
    (set) => ({
      template: null,
      setTemplate: (t) => set({ template: t }),
      clear: () => set({ template: null }),
    }),
    {
      name: "company-template-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ template: s.template }),
    }
  )
);
