import { createRef, useCallback } from "react";
import clsx from "clsx";
import { Helmet } from "react-helmet";
import { Typography } from "../exports/components";
import { useHistory } from "react-router-dom";
import usePlayerStore from "../zustand/player.store";
import { useManager } from "../context/Manager";
import Button from "../components/Button";

function Home() {
  const history = useHistory();

  const { isFloating } = useManager();

  const ref = createRef<HTMLInputElement>();

  const setPlayer = usePlayerStore(({ set }) => set);

  const onClick = useCallback(() => {
    ref.current?.click();
  }, [ref]);

  return (
    <>
      <Helmet>
        <title>Voyage | Home</title>
      </Helmet>

      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Typography variant="h5">Get started</Typography>

        <Button variant="contained" onClick={onClick}>
          Select File
        </Button>

        <input
          hidden
          ref={ref}
          type="file"
          name="file"
          // accept="video/*"
          onChange={({ target: { files } }) => {
            if (files) {
              const [file] = files;
              if (!isFloating) history.push("/player", file);

              setPlayer({
                file,
                volume: 1,
                currentTime: 0,
                isPlaying: true,
              });
            }
          }}
        />
      </div>
    </>
  );
}

export default Home;
