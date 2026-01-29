import { Button, IconButton, Input, type InputProps, Stack } from "@chakra-ui/react";
import { forwardRef, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
// import { InputGroup } from "./input-group"; // Need to check if this exists or use standard Chakra Group

// Using standard Chakra UI v3 input group pattern if possible or manually composing
// Chakra v3 uses Group/InputGroup? Let's assume standard pattern with right element.
// Actually Chakra v3 might use `InputGroup` with `endElement`.

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Input type={show ? "text" : "password"} ref={ref} {...props} paddingRight="2.5rem" />
      <div
        style={{
          position: "absolute",
          right: "0.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          cursor: "pointer",
          display: "flex",
        }}
      >
        <IconButton aria-label={show ? "Hide password" : "Show password"} variant="ghost" size="sm" onClick={handleClick}>
          {show ? <LuEyeOff /> : <LuEye />}
        </IconButton>
      </div>
    </div>
  );
});
