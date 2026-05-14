import BottomNav from '@/components/BottomNav';

export default function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-canvas">
      <div className="flex-1 pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
