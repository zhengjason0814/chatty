import { LoaderIcon } from "lucide-react";

export const PageLoader = () => {
  const { theme } = useThemeStore();

  return (
    <div className="min-h-screen flex items-center justify-center" data-theme={theme}>
      <LoaderIcon className="animate-spin size-10 text-primary"></LoaderIcon>
    </div>
  );
};

export default PageLoader;
