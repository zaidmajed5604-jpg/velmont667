export default function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-paper p-6">
      <p className="font-sans text-xs uppercase tracking-widest2 text-ink-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}
