import {
  List,
  ListItem,
  Popover,
  PopoverProps,
  Stack,
} from "@material-ui/core";
import { useMachine } from "@xstate/react";
import clsx from "clsx";
import { flow } from "fp-ts/lib/function";
import PopoverState, {
  bindPopover,
  bindTrigger,
} from "material-ui-popup-state";
import { createRef, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
import { IconButton, Slider, Typography } from "../../exports/components";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  Contract,
  Ellipsis,
  Expand,
  GoBackward10,
  GoForward10,
  Lock,
  LockOpen,
  Pause,
  Play,
  SpeakerSlash,
  SpeakerWave2,
} from "../../exports/icons";
import layoutMachine from "./machines/layout";
import playerMachine from "./machines/player";
import subtitleMachine from "./machines/subtitle";
import userStateMachine from "./machines/user-state";
import "./style.css";
import { formatTime } from "./utils";

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

const overflowAnchor: Record<
  string,
  PopoverProps["anchorOrigin"] | PopoverProps["transformOrigin"]
> = {
  anchorOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "right",
  },
};

function Player() {
  const history = useHistory();

  const { state } = history.location;
  const file = state as File | undefined;

  const ref = createRef<HTMLDivElement>();
  const videoRef = createRef<HTMLVideoElement>();

  const [subtitle, sendSubtitle] = useMachine(subtitleMachine);

  const [userState, sendUserState] = useMachine(userStateMachine);

  console.log(userState.value, userState.event);

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
        // sendUserState("ACTIVE");
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
      volume: (_, { value }: any) => {
        const video = videoRef.current;
        if (video) video.volume = value;
      },
      mute: () => {
        const video = videoRef.current;
        if (video) video.muted = !video.muted;
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
              video.play();
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

        const onPlay = () => callback("PLAY");

        const onPause = () => callback("PAUSE");

        const onEnded = () => callback("ENDED");

        const onTimeUpdate = () => {
          callback({ type: "TIME_UPDATE", value: video?.currentTime });
        };

        const onVolumeChange = () => {
          callback({ type: "VOLUME", value: video?.volume });
        };

        video?.addEventListener("play", onPlay);
        video?.addEventListener("pause", onPause);
        video?.addEventListener("ended", onEnded);
        video?.addEventListener("timeupdate", onTimeUpdate);
        video?.addEventListener("volumechange", onVolumeChange);

        return () => {
          video?.removeEventListener("play", onPlay);
          video?.removeEventListener("pause", onPause);
          video?.removeEventListener("ended", onEnded);
          video?.removeEventListener("timeupdate", onTimeUpdate);
          video?.removeEventListener("volumechange", onVolumeChange);
        };
      },
    },
  });

  const { subtitles } = subtitle.context;

  const { duration, volume, currentTime } = player.context;

  const hasEnded = player.matches("ended");
  const isPaused = player.matches({ loaded: "paused" });
  const isPlaying = player.matches({ loaded: "playing" });

  const timeLeft = useMemo(() => {
    const t = (duration * (duration - currentTime)) / duration;
    return formatTime(t);
  }, [currentTime, duration]);

  const menus = [
    {
      action: () => {},
      label: "Add subtitle",
    },
    {
      action: () => {},
      label: "About",
    },
  ];

  // useLayoutEffect(() => {
  //   const parent = ref.current;

  //   const onMouseMove = () => sendUserState("ACTIVE");

  //   if (userState.matches("active")) {
  //     parent?.removeEventListener("mousemove", onMouseMove);
  //   } else {
  //     parent?.addEventListener("mousemove", onMouseMove, {
  //       passive: true,
  //     });
  //   }

  //   return () => {
  //     parent?.removeEventListener("mousemove", onMouseMove);
  //   };
  // }, [ref, sendUserState, userState]);

  return (
    <div
      ref={ref}
      onPointerMove={({ target, currentTarget }) => {
        // console.log("pointer move", target, currentTarget);
        if (isPaused && target !== currentTarget) return;
        sendUserState("ACTIVE");
      }}
      className={clsx([
        "main",
        "relative",
        layout.matches({ lock: "locked" }) && "lock",
        userState.matches("inactive") && "user-inactive",
      ])}
    >
      <Helmet>
        <title>Voyage | {file?.name}</title>
      </Helmet>

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
          <PopoverState variant="popover">
            {(state) => {
              return (
                <>
                  <IconButton {...bindTrigger(state)}>
                    <Ellipsis {...svgProps} />
                  </IconButton>

                  <Popover
                    {...overflowAnchor}
                    {...bindPopover(state)}
                    classes={{ paper: "px-3" }}
                  >
                    <List>
                      {menus.map(({ label, action }, i) => {
                        return (
                          <ListItem
                            button
                            key={i}
                            onClick={flow(action, state.close)}
                            classes={{ root: "flex space-x-2" }}
                          >
                            {label}
                          </ListItem>
                        );
                      })}
                    </List>
                  </Popover>
                </>
              );
            }}
          </PopoverState>
        </div>
      </header>

      <main className="w-full h-full relative">
        <video ref={videoRef} className="w-full h-full">
          {/* {subtitles.map((subtitle) => {
            return <track></track>;
          })} */}
        </video>

        <div
          onClick={({ target, currentTarget }) => {
            if (target === currentTarget) {
              sendUserState("CYCLE");
            }
          }}
          className={clsx([
            "w-full",
            "h-full",
            "absolute",
            "top-0",
            "left-0",
            "right-0",
            "bottom-0",
          ])}
        >
          <div
            onClick={({ target, currentTarget }) => {
              if (target === currentTarget) {
                sendUserState("CYCLE");
              }
            }}
            className={clsx([
              "hideable",
              "lockable",
              "w-full",
              "h-full",
              "flex",
              "items-center",
              "justify-evenly",
              "space-x-4",
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
        </div>
      </main>

      <footer className="footer hideable">
        <div
          className={clsx([
            "lockable",
            "w-full",
            "flex",
            "items-center",
            "space-x-4",
            "px-4",
          ])}
        >
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

          <div
            className={clsx(["lockable", "flex", "items-center", "space-x-3"])}
          >
            <PopoverState variant="popover">
              {(state) => {
                return (
                  <>
                    <IconButton
                      {...bindTrigger(state)}
                      onClick={(e) => {
                        sendUserState("SUSPEND");
                        state.toggle(e);
                      }}
                    >
                      {volume > 0 ? (
                        <SpeakerWave2 {...svgProps} />
                      ) : (
                        <SpeakerSlash {...svgProps} />
                      )}
                    </IconButton>

                    <Popover
                      {...bindPopover(state)}
                      classes={{ paper: "px-3 py-6" }}
                      onClose={() => {
                        state.close();
                        sendUserState("RESUME");
                      }}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                    >
                      <Stack sx={{ height: 120 }}>
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={volume}
                          orientation="vertical"
                          classes={{ track: "h-full" }}
                          onChange={(_, value) => {
                            sendPlayer({
                              type: "VOLUME",
                              value: value as number,
                            });
                          }}
                        />
                      </Stack>
                    </Popover>
                  </>
                );
              }}
            </PopoverState>

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
    </div>
  );
}

export default Player;
