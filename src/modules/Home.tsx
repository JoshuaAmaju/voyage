import { createRef, useCallback } from "react";
import clsx from "clsx";
import { Typography, Button } from "../exports";

function Home() {
  const ref = createRef<HTMLInputElement>();

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
      <Typography variant="h4">Get started</Typography>

      <Button variant="contained" color="primary" onClick={onClick}>
        Select File
      </Button>

      <input
        ref={ref}
        type="file"
        name="file"
        hidden
        onChange={({ target: { files } }) => {
          if (files) {
            const [file] = files;
            console.log(file);
          }
        }}
      />
    </div>
  );
}

export default Home;
