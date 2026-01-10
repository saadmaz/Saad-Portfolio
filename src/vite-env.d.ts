declare module "*.png" {
  const value: any;
  export default value;
}

declare module "*.jpg" {
  const value: any;
  export default value;
}

// This tells TypeScript that files ending in .pdf are valid modules
declare module "*.pdf" {
  const content: string;
  export default content;
}