export const transformQuery = (s: string) => {
    return s?.trim()?.toLowerCase()?.replace(/%/g, "\\%");
};
