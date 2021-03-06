export const loadApiKeys = (regExp: RegExp): string[] =>
    Object.keys(process.env)
        .filter((key) => regExp.test(key))
        .map((key) => process.env[key] as string);
