import { Skeleton } from "@/components/ui/Skeleton";

interface SkeletonBlockProps {
    titleWidth?: string;
    contentHeight?: string;
}

export const SkeletonBlock = ({
    titleWidth = "w-32",
    contentHeight = "h-24"
}: SkeletonBlockProps) => {
    return (
        <div className="border-none rounded-[16px] md:rounded-[20px] bg-card p-6 bg-card-alt">
            <Skeleton className={`h-7 ${titleWidth} mb-4`} />
            <Skeleton className={`${contentHeight} w-full`} />
        </div>
    );
}; 