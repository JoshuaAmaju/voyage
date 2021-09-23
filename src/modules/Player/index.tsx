import { useMachine } from "@xstate/react";
import clsx from "clsx";
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { IconButton, Slider, Typography } from "../../exports/components";
import {
  ArrowLeft,
  ArrowCounterClockwise,
  Contract,
  Ellipsis,
  Expand,
  GoBackward10,
  GoForward10,
  Lock,
  LockOpen,
  Pause,
  Play,
} from "../../exports/icons";
import layoutMachine from "./machines/layout";
import playerMachine from "./machines/player";
import subtitleMachine from "./machines/subtitle";
import "./style.css";
import { formatTime } from "./utils";

import userStateMachine from "./machines/user-state";

const mainProps = {
  width: 60,
  height: 60,
  color: "white",
};

const subProps = {
  width: 50,
  height: 50,
  color: "white",
};

const svgProps = {
  width: 28,
  height: 28,
  color: "white",
};

function Player() {
  const history = useHistory();

  const { state } = history.location;
  const file = state as File | undefined;

  const timeout = useRef<NodeJS.Timeout | null>();
  const [userActive, setUserState] = useState(true);

  const ref = createRef<HTMLDivElement>();
  const videoRef = createRef<HTMLVideoElement>();

  const [subtitle, sendSubtitle] = useMachine(subtitleMachine);

  const [userState, sendUserState] = useMachine(userStateMachine);

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
        sendUserState("ACTIVE");
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

  const { subtitles } = subtitle.context;

  const { duration, currentTime } = player.context;

  const hasEnded = player.matches("ended");
  const isPaused = player.matches({ loaded: "paused" });
  const isPlaying = player.matches({ loaded: "playing" });

  const timeLeft = useMemo(() => {
    const t = (duration * (duration - currentTime)) / duration;
    return formatTime(t);
  }, [currentTime, duration]);

  // const setInactiveWithTimeout = useCallback(() => {
  //   timeout.current = setTimeout(() => {
  //     clearTimeout(timeout.current as any);
  //     timeout.current = null;
  //     setUserState(false);
  //   }, 4000);
  // }, []);

  // useEffect(() => {
  //   setInactiveWithTimeout();
  //   return () => clearTimeout(timeout.current as any);
  // }, [setInactiveWithTimeout]);

  // useEffect(() => {
  //   if (player.changed && player.matches({ loaded: "paused" })) {
  //     clearTimeout(timeout.current as any);
  //     timeout.current = null;
  //     setUserState(true);
  //   }
  // }, [player]);

  // const MainAction = isPaused
  //   ? Play
  //   : isPlaying
  //   ? Pause
  //   : player.matches("ended")
  //   ? Reload
  //   : null;

  return (
    <div
      ref={ref}
      className={clsx([
        "main",
        "relative",
        layout.matches({ lock: "locked" }) && "lock",
        isPlaying && !userState.matches("active") && "user-inactive",
      ])}
      onMouseMove={() => {
        if (isPaused) return;
        sendUserState("ACTIVE");
      }}
    >
      <header className="header hideable lockable">
        <div className="flex items-center space-x-3">
          <IconButton tabIndex={-1} onClick={() => history.goBack()}>
            <ArrowLeft {...svgProps} />
          </IconButton>

          <Typography variant="h5" color="white" className="title">
            {file?.name}
          </Typography>
        </div>

        <div>
          <IconButton>
            <Ellipsis {...svgProps} />
          </IconButton>
        </div>
      </header>

      <main className="w-full h-full relative">
        <video ref={videoRef} className="w-full h-full">
          {/* {subtitles.map((subtitle) => {
            return <track></track>;
          })} */}
        </video>

        <div
          className={clsx([
            "hideable",
            "lockable",
            "w-full",
            "h-full",
            "absolute",
            "top-0",
            "left-0",
            "right-0",
            "bottom-0",
            "flex",
            "items-center",
            "space-x-4",
            "justify-evenly",
          ])}
        >
          <IconButton
            onClick={() => {
              sendPlayer({ type: "SEEK", value: currentTime - 10 });
            }}
          >
            <GoBackward10 {...subProps} />
          </IconButton>

          <IconButton onClick={() => sendPlayer("PLAY_PAUSE")}>
            {isPaused && <Play {...mainProps} />}
            {isPlaying && <Pause {...mainProps} />}
            {hasEnded && <ArrowCounterClockwise {...mainProps} />}
          </IconButton>

          <IconButton
            onClick={() => {
              sendPlayer({ type: "SEEK", value: currentTime + 10 });
            }}
          >
            <GoForward10 {...subProps} />
          </IconButton>
        </div>
      </main>

      <footer className="footer hideable">
        <div className="lockable w-full flex items-center space-x-4 px-4">
          <Slider
            max={duration}
            value={currentTime}
            onChangeCommitted={(_, value) => {
              sendPlayer({ type: "SEEK", value: value as number });
            }}
          />

          <Typography color="white" fontWeight="bold">
            {timeLeft}
          </Typography>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <IconButton onClick={() => sendLayout("LOCK.cycle")}>
              {layout.matches({ lock: "locked" }) && <Lock {...svgProps} />}

              {layout.matches({ lock: "unlocked" }) && (
                <LockOpen {...svgProps} />
              )}
            </IconButton>
          </div>

          <div className="lockable">
            <IconButton onClick={() => sendLayout("FULLSCREEN.cycle")}>
              {layout.matches({ fullscreen: "exited" }) && (
                <Expand {...svgProps} />
              )}

              {layout.matches({ fullscreen: "entered" }) && (
                <Contract {...svgProps} />
              )}
            </IconButton>
          </div>
        </div>
      </footer>

      {/* <div className="overlay hideable">
        <header className="lockable flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IconButton tabIndex={-1} onClick={() => history.goBack()}>
              <ArrowBack {...svgProps} />
            </IconButton>

            <Typography variant="h5" color="white" className="title">
              {file?.name}
            </Typography>
          </div>

          <div>
            <IconButton tabIndex={-1}>
              <EllipsisVertical {...svgProps} />
            </IconButton>
          </div>
        </header>

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
                {layout.matches({ lock: "locked" }) && (
                  <Lock {...svgProps} stroke="white" />
                )}

                {layout.matches({ lock: "unlocked" }) && (
                  <Unlock {...svgProps} stroke="white" />
                )}
              </IconButton>
            </div>

            <div className="lockable">
              <IconButton onClick={() => sendLayout("FULLSCREEN.cycle")}>
                {layout.matches({ fullscreen: "exited" }) && (
                  <Expand {...svgProps} fill="white" />
                )}

                {layout.matches({ fullscreen: "entered" }) && (
                  <Contract {...svgProps} fill="white" />
                )}
              </IconButton>
            </div>
          </div>
        </footer>
      </div> */}
    </div>
  );
}

export default Player;
