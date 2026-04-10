import type { ReactNode } from "react";

interface ProductPageLayoutProps {
  children: ReactNode;
}

export function ProductPageLayout({ children }: ProductPageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#000624]">
      <main className="relative z-10">{children}</main>
    </div>
  );
}

export default ProductPageLayout;
