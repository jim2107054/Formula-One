"use client";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

export default function VideoItem({
  title = "",
  url = "",
}: {
  title?: string;
  url?: string;
}) {
  return (
    <div className="mt-10">
      {url.includes("dropboxusercontent.com") ? (
        <video
          src={url ?? ""}
          title={title ?? ""}
          controls
          controlsList="nodownload"
          className="w-full"
          preload="auto"
        ></video>
      ) : (
        <MediaPlayer
          title={title ?? ""}
          autoPlay={true}
          playsInline={true}
          src={url ?? ""}
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
      )}
    </div>
  );
}
