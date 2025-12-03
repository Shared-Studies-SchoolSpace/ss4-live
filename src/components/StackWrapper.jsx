export default function StackWrapper({ children, gap = "gap-4" }) {
  return (
    <div className={`flex flex-col ${gap}`}>
      {children}
    </div>
  );
}
