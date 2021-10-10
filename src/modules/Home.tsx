import { createRef, useCallback } from "react";
import clsx from "clsx";
import { Helmet } from "react-helmet";
import { Typography, Button } from "../exports/components";
import { useHistory } from "react-router-dom";
import usePlayerStore from "../zustand/player.store";
import { useManager } from "../context/Manager";

function Home() {
  const history = useHistory();

  const { isFloating } = useManager();

  const ref = createRef<HTMLInputElement>();

  const setPlayer = usePlayerStore(({ set }) => set);

  const onClick = useCallback(() => {
    ref.current?.click();
  }, [ref]);

  return (
    <div
      className={clsx([
        "h-full",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "space-y-2",
      ])}
    >
      <Helmet>
        <title>Voyage | Home</title>
      </Helmet>

      <Typography variant="h4">Get started</Typography>

      <Button variant="contained" color="primary" onClick={onClick}>
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
  );
}

export default Home;
