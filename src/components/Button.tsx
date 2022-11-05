import { styled, Button as MUIButton } from "@material-ui/core";

const Button = styled(MUIButton)((t) => ({
  borderRadius: "0.4rem",
  backgroundColor: "#f9184c",
  "&:hover": {
    backgroundColor: "#f9184c",
  },
}));

export default Button;
