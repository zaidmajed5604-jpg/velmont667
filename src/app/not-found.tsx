import Link from "next/link";
import Button from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-luxury flex min-h-[70vh] flex-col items-center justify-center pt-20 text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="mt-5 font-display text-display-lg font-normal text-ink">Page Not Found</h1>
      <p className="mt-4 max-w-md font-sans text-[15px] text-ink-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
