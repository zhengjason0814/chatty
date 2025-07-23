import { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let videoClient;
    let callInstance;
    let isMounted = true;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) {
        if (isMounted) setIsConnecting(false);
        return;
      }

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Stream video client initialized");

        if (isMounted) {
          setClient(videoClient);
          setCall(callInstance);
          toast.success("Joined call successfully!");
        }
      } catch (error) {
        console.error("Error joining call:", error);
        if (isMounted) {
          toast.error("Could not join call. Try again.");
        }
      } finally {
        if (isMounted) setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      isMounted = false;
      (async () => {
        try {
          if (callInstance && callInstance.isJoined) {
            await callInstance.leave();
          }
          if (videoClient) {
            await videoClient.disconnectUser();
          }
        } catch (err) {
          console.warn("Cleanup error:", err);
        }
      })();
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Trying again... {"Refresh if takes awhile."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
