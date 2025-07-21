import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api.js";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  console.log("useAuth is running", authUser);

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};

export default useAuthUser;
