import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";

export const OtpInputWrapper = ({
  maxLength,
  ...props
}: {
  maxLength: number;
}) => {
  return (
    <InputOTP maxLength={maxLength} {...props}>
      {Array.from({ length: maxLength / 2 }).map((_, index) => {
        const first = index * 2;
        const second = first + 1;
        if (index < maxLength / 2 - 1) {
          return (
            <>
              <InputOTPGroup>
                <InputOTPSlot index={first} />
                <InputOTPSlot index={second} />
              </InputOTPGroup>
              <InputOTPSeparator />
            </>
          );
        }
        return (
          <InputOTPGroup>
            <InputOTPSlot index={first} />
            <InputOTPSlot index={second} />
          </InputOTPGroup>
        );
      })}
    </InputOTP>
  );
};
