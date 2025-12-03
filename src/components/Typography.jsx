export const H1 = ({ children }) => (
  <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
    {children}
  </h1>
);

export const H2 = ({ children }) => (
  <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
    {children}
  </h2>
);

export const H3 = ({ children }) => (
  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
    {children}
  </h3>
);

export const Body = ({ children }) => (
  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
    {children}
  </p>
);

export const BodyLarge = ({ children }) => (
  <p className="text-lg text-gray-600 dark:text-gray-400">
    {children}
  </p>
);
