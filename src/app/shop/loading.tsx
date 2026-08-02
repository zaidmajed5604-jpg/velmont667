export default function ShopLoading() {
  return (
    <div className="container-luxury pb-section-sm pt-32">
      <div className="mb-12 h-24 animate-pulse border-b border-border" />
      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="aspect-[4/5] w-full animate-pulse bg-beige-light" />
            <div className="h-4 w-3/4 animate-pulse bg-beige-light" />
            <div className="h-4 w-1/3 animate-pulse bg-beige-light" />
          </div>
        ))}
      </div>
    </div>
  );
}
