import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/legal-page-layout";
import { SIZE_GUIDE } from "@/lib/constants";

export const metadata: Metadata = { title: "Size Guide" };

function SizeTable({ title, rows }: { title: string; rows: readonly { size: string; chest: string; waist: string; length: string }[] }) {
  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl font-normal text-ink">{title}</h2>
      <table className="mt-4 w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-widest2 text-ink-muted">
            <th className="pb-3 font-medium">Size</th>
            <th className="pb-3 font-medium">Chest</th>
            <th className="pb-3 font-medium">Waist</th>
            <th className="pb-3 font-medium">Length</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.size} className="border-b border-border/60 text-ink">
              <td className="py-3 font-medium">{row.size}</td>
              <td className="py-3 text-ink-muted">{row.chest}</td>
              <td className="py-3 text-ink-muted">{row.waist}</td>
              <td className="py-3 text-ink-muted">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <LegalPageLayout eyebrow="Support" title="Size Guide">
      <p>
        All measurements are body measurements, not garment measurements. If you fall between two
        sizes, we recommend sizing up for tailoring and sizing down for knitwear.
      </p>

      <SizeTable title="Tailoring" rows={SIZE_GUIDE.Tailoring} />
      <SizeTable title="Shirts, Knitwear &amp; Outerwear" rows={SIZE_GUIDE.Standard} />

      <h2 className="mt-10 font-display text-2xl font-normal text-ink">How to Measure</h2>
      <p>
        <strong>Chest:</strong> Measure around the fullest part of your chest, under the arms and
        across the shoulder blades.
      </p>
      <p>
        <strong>Waist:</strong> Measure around your natural waistline, keeping the tape
        comfortably loose.
      </p>
      <p>
        <strong>Length:</strong> For tailoring, measure from the base of the collar to the desired
        hem length.
      </p>

      <p className="mt-6">
        Still unsure of your size? Reach out to <a href="mailto:concierge@velmont.com">concierge@velmont.com</a> and
        our team will help you find the right fit.
      </p>
    </LegalPageLayout>
  );
}
