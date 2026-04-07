export const H1 = ({ children, className = "" }) => (
  <h1 className={`text-4xl md:text-[3rem] lg:text-[3.75rem] font-black text-[#111111] leading-[1.1] mb-8 ${className}`}>
    {children}
  </h1>
);

export const H2 = ({ children, className = "" }) => (
  <h2 className={`text-3xl md:text-[2.25rem] lg:text-[3rem] font-black text-[#111111] leading-[1.1] mb-8 ${className}`}>
    {children}
  </h2>
);

export const H3 = ({ children, className = "" }) => (
  <h3 className={`text-[0.875rem] font-bold text-[#111111] tracking-[0.2em] leading-snug mb-4 ${className}`}>
    {children}
  </h3>
);

export const Body = ({ children, className = "" }) => (
  <p className={`text-base text-[#111111] leading-relaxed ${className}`}>
    {children}
  </p>
);

export const BodyLarge = ({ children, className = "" }) => (
  <p className={`text-[1.125rem] font-medium text-[#111111] leading-relaxed ${className}`}>
    {children}
  </p>
);
