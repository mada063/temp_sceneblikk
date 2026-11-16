export const makeCellKey = (row: number, column: number) => `${row}-${column}`;
export const parseKey = (key: string) => {
  const [row, column] = key.split("-").map(Number);
  return { row, column };
};
export const deriveGridGeometry = (config: any) => ({
  widthInches: config.screenInches || 20,
  heightInches: config.screenInches || 10,
  maxSlots: 100,
});
export const adjustGridToCapacity = (config: any, maxSlots: number) => config;
export const isAreaAvailable = () => true;
export const assignComponentToRegion = (
  key: string,
  grid: any,
  config: any,
  componentId: string,
  colSpan: number,
  rowSpan: number
) => {
  grid[key] = { componentId, colSpan, rowSpan };
};
export const resolveRootKey = (key: string) => key;
