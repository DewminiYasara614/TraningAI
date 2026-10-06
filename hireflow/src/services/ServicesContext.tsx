import { createContext, useContext, type ReactNode } from "react";
import { LocalApplicationService, type ApplicationService } from "./ApplicationService";
import { LocalStorageService } from "./LocalStorageService";
import type { StorageService } from "./StorageService";

export interface Services {
  applicationService: ApplicationService;
}

export interface CreateServicesOptions {
  storage?: StorageService;
  latencyMs?: number;
  clock?: () => Date;
  idGenerator?: () => string;
}

export function createServices({
  storage = new LocalStorageService(),
  latencyMs = 600,
  clock,
  idGenerator,
}: CreateServicesOptions = {}): Services {
  return {
    applicationService: new LocalApplicationService({ storage, latencyMs, clock, idGenerator }),
  };
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ value, children }: { value: Services; children: ReactNode }) {
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error("useServices must be used inside <ServicesProvider>");
  return services;
}
