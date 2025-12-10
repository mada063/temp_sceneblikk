import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "View",
};

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}






