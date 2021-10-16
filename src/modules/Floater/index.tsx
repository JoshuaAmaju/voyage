import { IconButton } from "@material-ui/core";
import { useMachine } from "@xstate/react";
import "./style.css";
import React, { createRef, useCallback, useEffect } from "react";
import {
  ArrowCounterClockwise,
  ArrowUpBackwardCircle,
  Pause,
  Play,
  RectangleInsetBottom,
  XMark,
} from "../../exports/icons";
import usePlayerStore from "../../zustand/player.store";
import playerMachine from "../Player/machines/player";
import { useManager } from "../../context/Manager";
import clsx from "clsx";
import { useHistory } from "react-router-dom";

const noop = () => {};

const icon = {
  width: 30,
  height: 30,
  color: "white",
};

const small = {
  width: 20,
  height: 20,
  color: "white",
};

const Floater = ({ onClose }: { onClose?: () => void }) => {
  const history = useHistory();

  const { enterFull } = useManager();

  const videoRef = createRef<HTMLVideoElement>();

  const { file, volume, currentTime, ...store } = usePlayerStore();

  const [setPlayer, reset] = usePlayerStore(({ set, reset }) => [set, reset]);

  //   const [cue, setCue] = useState<string | null>();

  const [player, sendPlayer] = useMachine(playerMachine, {
    actions: {
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      seek: noop,
      mute: noop,
      volume: noop,
      paused: noop,
      playing: noop,
    },
    services: {
      load: () => {
        return new Promise(async (resolve, reject) => {
          const video = videoRef.current;

          if (file && video) {
            video.addEventListener("loadeddata", () => {
              resolve({ duration: video.duration });
              if (store.isPlaying) video.play();
            });

            video.addEventListener("error", reject);

            video.volume = volume;
            video.currentTime = currentTime;
            video.src = URL.createObjectURL(file);
          }
        });
      },
      watcher: () => (callback) => {
        const video = videoRef.current;

        const onPlay = () => callback("PLAY");
        const onPause = () => callback("PAUSE");
        const onEnded = () => callback("ENDED");

        const onTimeUpdate = () => {
          callback({ type: "TIME_UPDATE", value: video?.currentTime as any });
        };

        video?.addEventListener("play", onPlay);
        video?.addEventListener("pause", onPause);
        video?.addEventListener("ended", onEnded);
        video?.addEventListener("timeupdate", onTimeUpdate);

        return () => {
          video?.removeEventListener("play", onPlay);
          video?.removeEventListener("pause", onPause);
          video?.removeEventListener("ended", onEnded);
          video?.removeEventListener("timeupdate", onTimeUpdate);
        };
      },
    },
  });

  // const { context } = player;

  const hasEnded = player.matches("ended");
  const isPaused = player.matches({ loaded: "paused" });
  const isPlaying = player.matches({ loaded: "playing" });

  const _onClose = useCallback(() => {
    enterFull();
    onClose?.();
    reset();
  }, [enterFull, onClose, reset]);

  //   useEffect(() => {
  //     const video = videoRef.current;

  //     if (video) {
  //       const tracks = [...video.textTracks];

  //       const track = tracks.find((track) => track.id === current);

  //       if (track) {
  //         // console.log(track.activeCues);

  //         track.addEventListener("cuechange", (e) => {
  //           const { activeCues } = track;

  //           // console.log("cues", activeCues);

  //           if (activeCues) {
  //             const [activeCue] = [...activeCues];
  //             const html = (activeCue as VTTCue)?.getCueAsHTML();
  //             const cue = html?.firstChild;
  //             // console.dir(cue?.textContent);
  //             // console.log("cue change", cue, (cue as HTMLElement)?.innerHTML);
  //             setCue(cue?.textContent);
  //           }
  //         });

  //         track.mode = "hidden";
  //       }
  //     }
  //   }, [current, subtitles, videoRef]);

  return (
    <div className="main w-full h-full relative">
      <video ref={videoRef} className="w-full h-full">
        {/* {[...subtitles.keys()].map((id) => (
            <track
              id={id}
              key={id}
              kind="subtitles"
              src={subtitles.get(id)}
              default={id === current}
            />
          ))} */}
      </video>

      <div className="overlay">
        <div
          className={clsx([
            "w-full absolute",
            "top-0 left-0 p-2",
            "flex items-center justify-between",
          ])}
        >
          <IconButton
            onClick={() => {
              enterFull();
              history.push("/player", file);

              setPlayer({
                currentTime: videoRef.current?.currentTime,
                isPlaying: player.matches({ loaded: "playing" }),
              });
            }}
          >
            <ArrowUpBackwardCircle {...icon} />
          </IconButton>

          <IconButton onClick={onClose}>
            <XMark {...small} />
          </IconButton>
        </div>

        <IconButton onClick={() => sendPlayer("PLAY_PAUSE")}>
          {isPaused && <Play {...icon} />}
          {isPlaying && <Pause {...icon} />}
          {hasEnded && <ArrowCounterClockwise {...icon} />}
        </IconButton>
      </div>
    </div>
  );
};

export default Floater;
