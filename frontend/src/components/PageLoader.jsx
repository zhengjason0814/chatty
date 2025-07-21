import { LoaderIcon } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <LoaderIcon className="animate-spin size-10 text-primary"></LoaderIcon>
    </div>
  );
};

export default PageLoader;
