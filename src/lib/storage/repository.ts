import { Store } from "@tauri-apps/plugin-store";
import { DEFAULT_DATA } from "./defaults";
import { CURRENT_SCHEMA_VERSION, storedDataSchema, type StoredApplicationData } from "./schema";

export interface ApplicationRepository {
  load(): Promise<StoredApplicationData>;
  save(data: StoredApplicationData): Promise<void>;
}

const cloneDefaults = (): StoredApplicationData => structuredClone(DEFAULT_DATA);

export function migrateStoredData(input: unknown): StoredApplicationData {
  const current = storedDataSchema.safeParse(input);
  if (current.success) return current.data;

  if (typeof input !== "object" || input === null) return cloneDefaults();
  const legacy = input as Record<string, unknown>;
  if (legacy.schemaVersion === 0) {
    const migrated = {
      ...cloneDefaults(),
      ...legacy,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      settings: {
        ...DEFAULT_DATA.settings,
        ...(typeof legacy.settings === "object" ? legacy.settings : {}),
      },
    };
    const result = storedDataSchema.safeParse(migrated);
    return result.success ? result.data : cloneDefaults();
  }
  return cloneDefaults();
}

export class TauriApplicationRepository implements ApplicationRepository {
  private storePromise: Promise<Store> | null = null;

  private getStore(): Promise<Store> {
    this.storePromise ??= Store.load("nib-color-picker.json", { autoSave: false });
    return this.storePromise;
  }

  async load(): Promise<StoredApplicationData> {
    try {
      const store = await this.getStore();
      return migrateStoredData(await store.get("application"));
    } catch (error) {
      console.warn("Stored application data could not be loaded; defaults are being used.", error);
      return cloneDefaults();
    }
  }

  async save(data: StoredApplicationData): Promise<void> {
    const validated = storedDataSchema.parse(data);
    const store = await this.getStore();
    await store.set("application", validated);
    await store.save();
  }
}

export class BrowserApplicationRepository implements ApplicationRepository {
  private readonly key = "nib-color-picker.application";

  load(): Promise<StoredApplicationData> {
    try {
      const value = localStorage.getItem(this.key);
      return Promise.resolve(
        value ? migrateStoredData(JSON.parse(value) as unknown) : cloneDefaults(),
      );
    } catch {
      return Promise.resolve(cloneDefaults());
    }
  }

  save(data: StoredApplicationData): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(storedDataSchema.parse(data)));
    return Promise.resolve();
  }
}

export function createRepository(): ApplicationRepository {
  return "__TAURI_INTERNALS__" in window
    ? new TauriApplicationRepository()
    : new BrowserApplicationRepository();
}
