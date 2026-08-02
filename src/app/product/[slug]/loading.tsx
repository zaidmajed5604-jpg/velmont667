export default function ProductLoading() {
  return (
    <div className="container-luxury pt-32">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/5] w-full animate-pulse bg-beige-light" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 animate-pulse bg-beige-light" />
          <div className="h-10 w-2/3 animate-pulse bg-beige-light" />
          <div className="h-6 w-32 animate-pulse bg-beige-light" />
          <div className="mt-4 h-24 w-full animate-pulse bg-beige-light" />
          <div className="mt-4 h-12 w-full animate-pulse bg-beige-light" />
        </div>
      </div>
    </div>
  );
}
