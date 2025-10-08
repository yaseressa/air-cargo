import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { useForgotPasswordStore } from "@/utils/store";
import { useState } from "react";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  useForgotChangePassword,
  useForgotPassword,
  useOtpValidation,
} from "@/services/calls/mutators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@components/ui/form";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { OtpInputWrapper } from "@/components/re/input-otp";
import { ApiError, OtpResponse } from "@/utils/types";
import { PasswordInput } from "@/components/ui/password-input";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/theme-toggle";
export default () => {
  const forgotPasswordStore = useForgotPasswordStore();
  const { t } = useTranslation();

  return (
    <div className="w-full grid sm:grid-col-1 lg:min-h-[600px] lg:grid-cols-[450px_1fr_60px] xl:min-h-[800px] h-screen bg-background">
      <div className="flex items-center justify-center py-12 backdrop-brightness-150 backdrop-blur-2xl border z-10">
        <div className="mx-auto grid md:w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-mute">
              {t("forgotPassword")}
            </h1>
          </div>
          {forgotPasswordStore.forgotPassword?.email ? (
            forgotPasswordStore.forgotPassword.otp ? (
              forgotPasswordStore.forgotPassword.validated ? (
                <ForgotChangeForm />
              ) : (
                <OtpForm />
              )
            ) : (
              ""
            )
          ) : (
            <EmailForm />
          )}
        </div>
      </div>
      <div className="hidden lg:flex w-full  justify-center items-center z-0">
        <img src="logo.png" alt="Image" className=" z-0 " />
      </div>
      <div className="flex justify-end items-start m-2 z-10">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <ThemeToggle />
            </TooltipTrigger>
            <TooltipContent side="right" className="slide-in-from-left-28 ">
              <p className="uppercase">{t("theme")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
function EmailForm() {
  const forgotPasswordStore = useForgotPasswordStore();
  const { mutate: forgotPassword } = useForgotPassword();
  const [loading, setLoading] = useState(false);
  const FormSchema = z.object({
    email: z.string().email(),
  });
  function handleSuccess(data: string) {
    toast({
      title: "Email sent",
      description: "Check your email for a link to reset your password",
    });
    forgotPasswordStore.setOtp(data);
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(input: z.infer<typeof FormSchema>) {
    setLoading(true);
    forgotPassword(input.email, {
      onSuccess: (data) => {
        setLoading(false);
        handleSuccess(data);
        forgotPasswordStore.setEmail(input.email);
      },
      onError: (error) => {
        setLoading(false);
        let description =
          (error as AxiosError<ApiError>).response?.data?.detail ??
          "An error occurred";
        if ((error as AxiosError).response?.status === 404) {
          description = "User does not exist";
        }
        toast({
          title: "Error logging in",
          variant: "destructive",
          description,
        });
      },
    });
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-10"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="py-2 h-10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link to={"/login"} className="ml-auto inline-block text-sm underline">
          Back to login
        </Link>
        <Button type="submit" className="w-full h-10" disabled={loading}>
          {!loading ? "Submit" : <Loader className="h-5 w-5" />}
        </Button>
      </form>
    </Form>
  );
}
function OtpForm() {
  const forgotPasswordStore = useForgotPasswordStore();
  const { mutate: validateOtp } = useOtpValidation();
  const [loading, setLoading] = useState(false);

  const FormSchema = z.object({
    otp: z
      .string()
      .min(6)
      .max(6)
      .refine((value) => {
        return /^\d+$/.test(value);
      }),
  });
  function handleSuccess(_: OtpResponse) {
    forgotPasswordStore.setValidated(true);
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    if (data.otp == forgotPasswordStore.forgotPassword?.otp) {
      validateOtp(
        { email: forgotPasswordStore.forgotPassword?.email!, otp: data.otp },
        {
          onSuccess: (data) => {
            setLoading(false);
            handleSuccess(data);
          },
          onError: () => {
            setLoading(false);
            toast({
              title: "Error validating otp",
              variant: "destructive",
              description: "Otp is Expired. Please try again",
            });
          },
        }
      );
    } else {
      setLoading(false);
      toast({
        title: "Error validating otp",
        variant: "destructive",
        description: "Invalid otp. Please try again",
      });
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-10"
      >
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <OtpInputWrapper maxLength={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {!loading ? "Submit" : <Loader className="h-5 w-5" />}
        </Button>
      </form>
    </Form>
  );
}
function ForgotChangeForm() {
  const forgotPasswordStore = useForgotPasswordStore();
  const navigate = useNavigate();
  const { mutate: forgotChangePassword } = useForgotChangePassword();
  const [loading, setLoading] = useState(false);
  const FormSchema = z
    .object({
      newPassword: z.string(),
      renewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.renewPassword, {
      message: "Passwords do not match",
      path: ["repassword"],
    });
  function handleSuccess(data: string) {
    toast({
      title: "Password changed successfully",
      description: data,
    });
    navigate("/login");
    forgotPasswordStore.reset();
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(input: z.infer<typeof FormSchema>) {
    setLoading(true);
    forgotChangePassword(
      {
        email: forgotPasswordStore.forgotPassword?.email!,
        password: input.newPassword,
        otp: forgotPasswordStore.forgotPassword?.otp!,
      },
      {
        onSuccess: (data) => {
          setLoading(false);
          handleSuccess(data);
        },
        onError: (error) => {
          setLoading(false);
          let description =
            (error as AxiosError<ApiError>).response?.data?.detail ??
            "An error occurred";
          if ((error as AxiosError).response?.status === 404) {
            description = "User does not exist";
          }
          toast({
            title: "Error logging in",
            variant: "destructive",
            description,
          });
        },
      }
    );
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-10"
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput className="py-2 h-10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="renewPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput className="py-2 h-10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {!loading ? "Submit" : <Loader className="h-5 w-5" />}
        </Button>
      </form>
    </Form>
  );
}
