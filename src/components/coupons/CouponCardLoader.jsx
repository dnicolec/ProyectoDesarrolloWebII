const CouponCardLoader = () => {
  return (
    <div className="bg-white rounded-2xl border border-cream overflow-hidden animate-pulse">
      <div className="h-36 sm:h-44 bg-cream" />
      <div className="relative h-5">
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-cream-bg rounded-full" />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-cream-bg rounded-full" />
      </div>
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 space-y-3">
        <div className="h-5 w-24 bg-cream rounded-lg" />
        <div className="h-5 w-full bg-cream rounded-lg" />
        <div className="h-5 w-3/4 bg-cream rounded-lg" />
        <div className="h-4 w-full bg-cream-light rounded-lg" />
        <div className="h-4 w-2/3 bg-cream-light rounded-lg" />
        <div className="flex items-end gap-2 pt-1">
          <div className="h-7 w-20 bg-cream rounded-lg" />
          <div className="h-4 w-14 bg-cream-light rounded-lg" />
        </div>
        <div className="flex justify-between pt-3 border-t border-cream">
          <div className="h-3 w-24 bg-cream-light rounded" />
          <div className="h-3 w-20 bg-cream-light rounded" />
        </div>
      </div>
    </div>
  );
};

export default CouponCardLoader;
