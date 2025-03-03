import { Skeleton } from "@/components/ui/skeleton";

export default function PersonaDetailsSkeleton() {
    return (
      <div className="bg-card-alt">
        <Skeleton className="h-6 w-40 mb-3" />
  
        <div className="space-y-3 md:space-y-4">
          <section>
            <Skeleton className="h-5 w-36 mb-1.5" />
            <Skeleton className="h-10 w-full" />
          </section>
  
          <section>
            <Skeleton className="h-5 w-44 mb-1.5" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </section>
  
          <section>
            <Skeleton className="h-5 w-48 mb-1.5" />
            <Skeleton className="h-8 w-full mb-1.5" />
            <Skeleton className="h-10 w-full" />
          </section>
  
          <section>
            <Skeleton className="h-5 w-32 mb-1.5" />
            <Skeleton className="h-10 w-full" />
          </section>
        </div>
      </div>
    );
  };