import {
  List,
  ListItem,
  Popover,
  PopoverProps,
  Popper,
  PopperProps,
  Stack,
  Tooltip,
} from "@material-ui/core";
import { useMachine } from "@xstate/react";
import clsx from "clsx";
import { flow } from "fp-ts/lib/function";
import { motion } from "framer-motion";
import PopoverState, {
  bindPopover,
  bindTrigger,
} from "material-ui-popup-state";
import { omit } from "ramda";
import {
  cloneElement,
  createRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";
import VTTConverter from "srt-webvtt";
import { useManager } from "../../context/Manager";
import { Typography } from "../../exports/components";
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
  RectangleInsetBottom,
  Speaker,
  SpeakerWave2,
} from "../../exports/icons";
import usePlayerStore from "../../zustand/player.store";
import IconButton from "./components/IconButton";
import Slider from "./components/Slider";
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

  const store = usePlayerStore();

  const { enterFloat } = useManager();

  const { state } = history.location;

  const file = (store.file ?? state) as File | undefined;

  const ref = createRef<HTMLDivElement>();
  const videoRef = createRef<HTMLVideoElement>();

  const subtitlePickerRef = createRef<HTMLInputElement>();

  const [subtitle, sendSubtitle] = useMachine(subtitleMachine);

  const [userState, sendUserState] = useMachine(userStateMachine);

  const [cue, setCue] = useState<string | null>();

  const overlayRef = createRef<HTMLDivElement>();

  const thumbRef = createRef<HTMLDivElement>();

  const previewRef = createRef<HTMLVideoElement>();

  // const src = file && URL.createObjectURL(file);

  const [scrubTime, setScrubTime] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  // console.log(userState.value, userState.event);

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
      playing: () => {
        // sendUserState("RESUME");
      },
      paused: () => {
        // sendUserState("SUSPEND");
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
            //   // "-vf",
            //   // "fps=1/1",
            //   "-preset",
            //   "fast",
            //   "frame/out%d.jpg"
            // );

            // const data = ffmpeg.FS("readFile", name);

            // const data = new Array(60).fill(0).map((_, i) => {
            //   return ffmpeg.FS("readFile", `out${i + 1}.jpg`);
            // });

            // data.forEach((d) => {
            //   const img = document.createElement("img");

            //   img.src = URL.createObjectURL(
            //     new Blob([d.buffer], { type: "image/png" } /* (1) */)
            //   );

            //   img.className = "img";

            //   document.body.appendChild(img);
            // });

            // console.log(data);

            // data.forEach((_, i) => {
            //   ffmpeg.FS("unlink", `out${i + 1}.jpg`);
            // });

            // ffmpeg.FS("unlink", name);

            video.addEventListener("loadeddata", () => {
              resolve({ duration: video.duration });
              if (store.isPlaying) video.play();
            });

            video.addEventListener("error", reject);

            video.volume = store.volume;
            video.currentTime = store.currentTime;
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

  const { current, subtitles } = subtitle.context;

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
      action: () => {
        subtitlePickerRef.current?.click();
      },
      label: "Add subtitle",
    },
    // {
    //   action: () => {},
    //   label: "Video Info",
    // },
    // {
    //   action: () => {},
    //   label: "About",
    // },
  ];

  useEffect(() => {
    const preview = previewRef.current;

    if (preview) {
      preview.currentTime = scrubTime;
      if (file && !preview.src) preview.src = URL.createObjectURL(file);
    }
  }, [file, previewRef, scrubTime]);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const tracks = [...video.textTracks];

      const track = tracks.find((track) => track.id === current);

      if (track) {
        // console.log(track.activeCues);

        track.addEventListener("cuechange", (e) => {
          const { activeCues } = track;

          // console.log("cues", activeCues);

          if (activeCues) {
            const [activeCue] = [...activeCues];
            const html = (activeCue as VTTCue)?.getCueAsHTML();
            const cue = html?.firstChild;
            // console.dir(cue?.textContent);
            // console.log("cue change", cue, (cue as HTMLElement)?.innerHTML);
            setCue(cue?.textContent);
          }
        });

        track.mode = "hidden";
      }
    }
  }, [current, subtitles, videoRef]);

  // useEffect(() => {
  //   const overlay = overlayRef.current;

  //   const onPointerMove = (e: PointerEvent) => {
  //     if (e.target !== e.currentTarget) return;
  //     if (userState.matches("inactive")) sendUserState("ACTIVE");
  //   }

  //   if (overlay) {
  //     if (userState.matches('inactive')) {
  //       overlay.addEventListener("pointermove", onPointerMove);
  //     } else {
  //       overlay?.removeEventListener("pointermove", onPointerMove);
  //     }
  //   }

  //   return () => {
  //     overlay?.removeEventListener("pointermove", onPointerMove);
  //   }
  // }, [overlayRef, sendUserState, userState]);

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
      // onPointerMove={({ target, currentTarget }) => {
      //   if (target !== currentTarget) return;
      //   sendUserState("ACTIVE");
      // }}
      className={clsx([
        "main",
        "relative",
        layout.matches({ lock: "locked" }) && "lock",
        userState.matches("inactive") && "user-inactive",
      ])}
    >
      <Helmet>
        <title>Voyage | {`${file?.name}`}</title>
      </Helmet>

      <motion.main layoutId="player" className="w-full h-full relative">
        <input
          hidden
          type="file"
          name="subtitle-picker"
          ref={subtitlePickerRef}
          onChange={async ({ target: { files } }) => {
            if (files) {
              const [file] = files;
              const vttConverter = new VTTConverter(file);
              const url = await vttConverter.getURL();
              sendSubtitle({ url, type: "ADD" });
            }
          }}
        />

        <video ref={videoRef} className="w-full h-full">
          {[...subtitles.keys()].map((id) => (
            <track
              id={id}
              key={id}
              kind="subtitles"
              src={subtitles.get(id)}
              default={id === current}
            />
          ))}
        </video>

        {/* controls overlay */}
        <div
          ref={overlayRef}
          onPointerMove={({ target, currentTarget }) => {
            if (target !== currentTarget) return;
            if (userState.matches("inactive")) {
              sendUserState("ACTIVE");
            }
          }}
          onClick={({ target, currentTarget }) => {
            if (target === currentTarget) {
              sendUserState("CYCLE");
            }
          }}
          className={clsx([
            "w-full",
            "h-full",
            "fixed",
            "top-0",
            "left-0",
            "right-0",
            "bottom-0",
            "flex",
            "flex-col",
            "justify-between",
            userState.matches("inactive") && "hideable--cursor",
          ])}
        >
          <header className="header lockable hideable">
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
                      <IconButton
                        {...bindTrigger(state)}
                        onClick={(e) => {
                          sendUserState("SUSPEND");
                          state.toggle(e);
                        }}
                      >
                        <Ellipsis {...svgProps} />
                      </IconButton>

                      <Popover
                        {...overflowAnchor}
                        {...bindPopover(state)}
                        classes={{ paper: "px-3" }}
                        onClose={() => {
                          state.close();
                          sendUserState("RESUME");
                        }}
                      >
                        <List>
                          {menus.map(({ label, action }, i) => {
                            return (
                              <ListItem
                                button
                                key={i}
                                onClick={flow(action, state.close)}
                                classes={{ root: "flex px-9 space-x-2" }}
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

          <div
            // onClick={({ target, currentTarget }) => {
            //   if (target === currentTarget) {
            //     sendUserState("CYCLE");
            //   }
            // }}
            className="lockable hideable flex items-center justify-evenly space-x-4"
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

          <footer
            className={clsx([
              "footer space-y-3",
              userState.matches("inactive") && ["lockable", "hideable"],
            ])}
          >
            {scrubbing && (
              <div className="flex p-4">
                <video
                  ref={previewRef}
                  className="m-auto bg-black rounded-md"
                  style={{ width: "20rem", height: "10rem" }}
                />
              </div>
            )}

            <div className="captions-container">
              {cue && <p className="caption">{cue}</p>}
            </div>

            <div className="hideable">
              <div className="lockable w-full flex items-center space-x-4 px-4">
                <Slider
                  size="small"
                  max={duration}
                  // valueLabelDisplay="auto"
                  value={scrubbing ? scrubTime : currentTime}
                  onPointerLeave={() => sendUserState("RESUME")}
                  onPointerEnter={() => sendUserState("SUSPEND")}
                  // components={{
                  //   ValueLabel: ({ open, children, value }) => {
                  //     // console.log('ref', previewRef);

                  //     const preview = previewRef.current;

                  //     if (preview) {
                  //       preview.currentTime = value;
                  //       if (src && !preview.src) preview.src = src;
                  //     }

                  //     return (
                  //       <>
                  //         {cloneElement(children, {
                  //           ...children.props,
                  //           ref: thumbRef,
                  //         })}

                  //         {/* <video
                  //           ref={previewRef}
                  //           // src={file && URL.createObjectURL(file)}
                  //           className="bg-gray-400"
                  //           style={{ width: "20rem", height: "20rem" }}
                  //         /> */}

                  //         {thumbRef.current && (
                  //           <Popper
                  //             open={open}
                  //             anchorEl={thumbRef.current}
                  //             id={open ? "simple-popper" : undefined}
                  //           >
                  //             <video
                  //               ref={previewRef}
                  //               className="bg-black"
                  //               style={{ width: "20rem", height: "10rem" }}
                  //               // src={file && URL.createObjectURL(file)}
                  //             />
                  //           </Popper>
                  //         )}
                  //       </>
                  //     );
                  //   },
                  // }}
                  onChange={(_, value) => {
                    setScrubbing(true);
                    sendUserState("SUSPEND");
                    setScrubTime(value as number);
                  }}
                  onChangeCommitted={(_, value) => {
                    setScrubbing(false);
                    sendPlayer({ type: "SEEK", value: value as number });
                    if (userState.matches("inactive")) sendUserState("RESUME");
                  }}
                />

                <Typography color="white" fontWeight="bold">
                  {timeLeft}
                </Typography>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <IconButton onClick={() => sendLayout("LOCK.cycle")}>
                    {layout.matches({ lock: "locked" }) && (
                      <Lock {...svgProps} />
                    )}

                    {layout.matches({ lock: "unlocked" }) && (
                      <LockOpen {...svgProps} />
                    )}
                  </IconButton>
                </div>

                <div
                  className={clsx([
                    "lockable",
                    "flex",
                    "items-center",
                    "space-x-5",
                    "text-white",
                  ])}
                >
                  <IconButton
                    disabled={
                      !file || layout.matches({ fullscreen: "entered" })
                    }
                    onClick={() => {
                      enterFloat();
                      history.goBack();

                      store.set({
                        file,
                        volume,
                        currentTime: videoRef.current?.currentTime,
                        isPlaying: player.matches({ loaded: "playing" }),
                      });
                    }}
                  >
                    <RectangleInsetBottom {...omit(["color"], svgProps)} />
                  </IconButton>

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
                              <Speaker {...svgProps} />
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
            </div>
          </footer>
        </div>
      </motion.main>
    </div>
  );
}

export default Player;
