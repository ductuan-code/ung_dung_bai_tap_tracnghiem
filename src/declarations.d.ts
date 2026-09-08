// CSS modules (dùng trong animated-icon.web.tsx của template)
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Global CSS (dùng trong constants/theme.ts của template)
declare module '*.css' {}
