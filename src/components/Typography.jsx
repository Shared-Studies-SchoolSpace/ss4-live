export const H1 = ({ children, className = "" }) => (
  <h1 className={`text-3xl md:text-[2.25rem] font-space font-black text-[#111111] leading-[1.1] tracking-tight mb-8 ${className}`}>
    {children}
  </h1>
);

export const H2 = ({ children, className = "" }) => (
  <h2 className={`text-2xl md:text-[1.5rem] font-space font-black text-[#111111] leading-[1.2] tracking-tight mb-6 ${className}`}>
    {children}
  </h2>
);

export const H3 = ({ children, className = "" }) => (
  <h3 className={`text-[1.25rem] font-space font-extrabold text-[#111111] leading-[1.2] mb-4 ${className}`}>
    {children}
  </h3>
);

export const Body = ({ children, className = "" }) => (
  <p className={`text-[0.875rem] font-avenir text-[#111111] leading-relaxed ${className}`}>
    {children}
  </p>
);

export const BodyLarge = ({ children, className = "" }) => (
  <p className={`text-[1rem] font-avenir font-medium text-[#111111] leading-relaxed ${className}`}>
    {children}
  </p>
);
