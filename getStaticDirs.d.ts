type Resolver = (specifier: string, relativeToFile?: string) => { to: string; from: string };

export declare function getCodeEditorStaticDirs(relativeToFile?: string): { to: string; from: string }[];
export declare function getExtraStaticDir(
  specifier: string,
  relativeToFile?: string
): { to: string; from: string };
