import {
  useRef,
  createRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useHistory } from "react-router-dom";
import { useMachine, asEffect } from "@xstate/react";
import clsx from "clsx";
import { parse } from "id3-parser";
import {
  convertFileToBuffer,
  fetchFileAsBuffer,
} from "id3-parser/lib/universal/helpers";

import { fetchFile, createFFmpeg } from "@ffmpeg/ffmpeg";

import {
  Lock,
  Play,
  Minimize,
  Maximize,
  ArrowLeft,
  MoreVertical,
  Unlock,
  Pause,
  RotateCCW,
} from "../../exports/icons";
import {
  Slider,
  IconButton,
  Typography,
  LinearProgress,
} from "../../exports/components";

import playerMachine from "./machines/player";
import layoutMachine from "./machines/layout";

import "./style.css";
import { formatTime } from "./utils";

const mainProps = {
  width: 60,
  height: 60,
  color: "white",
};

function Player() {
  const history = useHistory();

  const timeout = useRef<NodeJS.Timeout | null>();
  const [userActive, setUserState] = useState(true);

  const ref = createRef<HTMLDivElement>();
  const videoRef = createRef<HTMLVideoElement>();

  const { state } = history.location;

  const file = state as File | undefined;

  const [layout, sendLayout] = useMachine(layoutMachine, {
    actions: {
      exitFullscreen: () => {
        document.exitFullscreen();
      },

      enterFullscreen: () => {
        document.documentElement.requestFullscreen();
      },
    },
  });

  const [player, sendPlayer] = useMachine(playerMachine, {
    actions: {
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      seek: (_, { value }: any) => {
        const video = videoRef.current;

        if (video) {
          if (video.fastSeek) {
            video.fastSeek(value);
          } else {
            video.currentTime = value;
          }
        }
      },
    },
    services: {
      load: () => {
        return new Promise(async (resolve, reject) => {
          const video = videoRef.current;

          if (file && video) {
            console.log(
              "can play type",
              video.canPlayType(file.type),
              file.type
            );

            // const { name } = file;

            // const ffmpeg = createFFmpeg({
            //   log: true,
            //   corePath: "http://localhost:3000/public/ffmpeg-core.js",
            // });

            // await ffmpeg.load();

            // ffmpeg.FS("writeFile", name, await fetchFile(file));

            // await ffmpeg.run(
            //   "-thread_queue_size",
            //   "4096",
            //   "-i",
            //   name,
            //   "-c",
            //   "copy",
            //   "-preset",
            //   "fast",
            //   "output.mp4"
            // );

            // const data = ffmpeg.FS("readFile", name);

            // ffmpeg.FS('unlink', name);

            video.addEventListener("loadeddata", () => {
              resolve({ duration: video.duration });
            });

            video.addEventListener("error", reject);
            video.src = URL.createObjectURL(file);

            // video.src = URL.createObjectURL(
            //   new Blob([data.buffer], { type: "video/mp4" })
            // );
          }
        });
      },
      watcher: () => (callback) => {
        const video = videoRef.current;

        const onEnded = () => callback("ENDED");

        const onTimeUpdate = () => {
          callback({ type: "TIME_UPDATE", value: video?.currentTime });
        };

        video?.addEventListener("ended", onEnded);
        video?.addEventListener("timeupdate", onTimeUpdate);

        return () => {
          video?.removeEventListener("ended", onEnded);
          video?.removeEventListener("timeupdate", onTimeUpdate);
        };
      },
    },
  });

  const { duration, currentTime } = player.context;

  const isPaused = player.matches({ loaded: "paused" });
  const isPlaying = player.matches({ loaded: "playing" });

  const timeLeft = useMemo(() => {
    return (duration * (duration - currentTime)) / duration;
  }, [currentTime, duration]);

  const timeLeftStr = useMemo(() => formatTime(timeLeft), [timeLeft]);

  const setInactiveWithTimeout = useCallback(() => {
    timeout.current = setTimeout(() => {
      clearTimeout(timeout.current as any);
      timeout.current = null;
      setUserState(false);
    }, 4000);
  }, []);

  useEffect(() => {
    setInactiveWithTimeout();
    return () => clearTimeout(timeout.current as any);
  }, [setInactiveWithTimeout]);

  // useEffect(() => {
  //   if (player.changed && player.matches({ loaded: "paused" })) {
  //     clearTimeout(timeout.current as any);
  //     timeout.current = null;
  //     setUserState(true);
  //   }
  // }, [player]);

  return (
    <div
      ref={ref}
      className={clsx([
        "main",
        isPlaying && !userActive && "user-inactive",
        layout.matches({ lock: "locked" }) && "lock",
      ])}
      onMouseMove={() => {
        if (isPaused) return;

        if (!userActive) {
          clearTimeout(timeout.current as any);
          setInactiveWithTimeout();
          setUserState(true);
        }
      }}
    >
      <video ref={videoRef} className="h-full w-full" />

      <div className="overlay">
        <header className="lockable flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IconButton onClick={() => history.goBack()}>
              <ArrowLeft color="white" />
            </IconButton>

            <Typography variant="h5" color="white" className="title">
              {file?.name}
            </Typography>
          </div>

          <div>
            <IconButton>
              <MoreVertical color="white" />
            </IconButton>
          </div>
        </header>

        <main className="lockable w-min flex space-x-4 self-center">
          <IconButton onClick={() => sendPlayer("PLAY_PAUSE")}>
            {isPaused && <Play {...mainProps} />}
            {isPlaying && <Pause {...mainProps} />}
            {player.matches("ended") && <RotateCCW {...mainProps} />}
          </IconButton>
        </main>

        <footer className="space-y-2">
          <div className="lockable flex items-center space-x-4 px-4">
            <Slider
              max={duration}
              value={currentTime}
              onChangeCommitted={(_, value) => {
                sendPlayer({ type: "SEEK", value: value as number });
              }}
            />

            <Typography color="white">{timeLeftStr}</Typography>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <IconButton onClick={() => sendLayout("LOCK.cycle")}>
                {layout.matches({ lock: "locked" }) && <Lock color="white" />}

                {layout.matches({ lock: "unlocked" }) && (
                  <Unlock color="white" />
                )}
              </IconButton>
            </div>

            <div className="lockable">
              <IconButton onClick={() => sendLayout("FULLSCREEN.cycle")}>
                {layout.matches({ fullscreen: "exited" }) && (
                  <Maximize color="white" />
                )}

                {layout.matches({ fullscreen: "entered" }) && (
                  <Minimize color="white" />
                )}
              </IconButton>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Player;
