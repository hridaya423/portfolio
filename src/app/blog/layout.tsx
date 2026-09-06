import Navbar from "@/components/navbar";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto py-12 sm:py-24 px-6">
      {children}
      <Navbar />
    </div>
  );
}
