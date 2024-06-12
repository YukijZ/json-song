// global.d.ts
interface Window {
  electronAPI: {
    saveJSON: (jsonString: string) => void;
  };
}
