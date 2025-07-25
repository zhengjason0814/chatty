import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import NoRecommendedFound from "../components/NoRecommendedFound";
import { capitalize } from "../lib/utils";
import useAuthUser from "../hooks/useAuthUser";
import { getFriendRequests } from "../lib/api";
import toast from "react-hot-toast";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const { authUser } = useAuthUser();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });
  const incomingRequestIds = new Set(
    friendRequests?.incomingReqs?.map((req) => req.sender._id) || []
  );

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Friend request sent!");
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  const matchingUsers = [];
  const otherUsers = [];

  if (recommendedUsers && authUser) {
    recommendedUsers.forEach((user) => {
      if (
        user.nativeLanguage === authUser.learningLanguage ||
        user.nativeLanguage === authUser.nativeLanguage
      ) {
        matchingUsers.push(user);
      } else {
        otherUsers.push(user);
      }
    });
  }

  const renderUserCard = (user) => {
    const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
    const userSentRequestToMe = incomingRequestIds.has(user._id);

    return (
      <div key={user._id} className="card bg-base-200 hover:shadow-lg transition-all duration-300">
        <div className="card-body p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="avatar size-16 rounded-full">
              <img src={user.profilePic} alt={user.fullName} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.fullName}</h3>
              {user.location && (
                <div className="flex items-center text-xs opacity-70 mt-1">
                  <MapPinIcon className="size-3 mr-1" />
                  {user.location}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="badge badge-secondary">
              {getLanguageFlag(user.nativeLanguage)}
              Native: {capitalize(user.nativeLanguage)}
            </span>
            <span className="badge badge-outline">
              {getLanguageFlag(user.learningLanguage)}
              Learning: {capitalize(user.learningLanguage)}
            </span>
          </div>

          {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

          {userSentRequestToMe ? (
            <Link to="/notifications" className="btn btn-accent w-full mt-2">
              <UsersIcon className="size-4 mr-2" />
              Check your notifications!
            </Link>
          ) : (
            <button
              className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
              onClick={() => sendRequestMutation(user._id)}
              disabled={hasRequestBeenSent || isPending}
            >
              {hasRequestBeenSent ? (
                <>
                  <CheckCircleIcon className="size-4 mr-2" />
                  Request Sent
                </>
              ) : (
                <>
                  <UserPlusIcon className="size-4 mr-2" />
                  Send Friend Request
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
              <p className="opacity-70">
                Discover perfect language exchange partners based on your profile
              </p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <NoRecommendedFound />
          ) : (
            <>
              <h3 className="text-xl font-bold mb-4">Matched Language Learners!</h3>
              {matchingUsers.length > 0 ? (
                <div className="mb-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {matchingUsers.map((user) => renderUserCard(user))}
                  </div>
                </div>
              ) : (
                <NoRecommendedFound />
              )}
              <h3 className="text-xl font-bold mb-4 mt-4">Other Learners!</h3>
              {otherUsers.length > 0 ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {otherUsers.map((user) => renderUserCard(user))}
                  </div>
                </div>
              ) : (
                <NoRecommendedFound />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
