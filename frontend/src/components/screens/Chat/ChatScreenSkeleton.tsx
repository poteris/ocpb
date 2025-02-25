import { Skeleton } from "@/components/ui/skeleton";

const ChatScreenSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white to-gray-100 ">
      <div className="flex-shrink-0">
        <Skeleton className="h-16 w-full" />
      </div>

      <main className="flex-grow overflow-hidden">
        <div className="bg-white  flex flex-col h-full container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="flex flex-col h-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full pt-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-pcsprimary02-light  py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatScreenSkeleton;
