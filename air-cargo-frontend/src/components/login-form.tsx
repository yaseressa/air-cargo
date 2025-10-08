import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "./ui/use-toast";
import { PasswordInput } from "./ui/password-input";
import { useLogin } from "../services/calls/mutators";
import { useState } from "react";
import { ApiError, AuthResponse, Role } from "../utils/types";
import Loader from "./loader";
import { AxiosError } from "axios";
import { useLoggedUserStore } from "@/utils/store";
import { FloatingLabelInput } from "./re/input";
import { useTranslation } from "react-i18next";

export function LoginForm() {
  const { t } = useTranslation();
  const currentUser = useLoggedUserStore();
  const navigate = useNavigate();
  const { mutate: loginCustomer } = useLogin();
  const [loading, setLoading] = useState(false);

  const FormSchema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

  function handleSuccess(data: AuthResponse) {
    localStorage.setItem("token", data.token);
    toast({
      title: t("loginSuccessful"),
      description: t("loggedInSuccessfully"),
    });
    navigate("/dashboard");
    currentUser.setUser({
      ...data,
      roles: data.roles.map((role) => role as Role),
    });
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    loginCustomer(data, {
      onSuccess: (data) => {
        setLoading(false);
        handleSuccess(data);
      },
      onError: (error) => {
        setLoading(false);
        let description =
          (error as AxiosError<ApiError>).response?.data?.detail ??
          t("errorOccurred");
        if ((error as AxiosError).response?.status === 404) {
          description = t("userDoesNotExist");
        } else if ((error as AxiosError).response?.status === 401) {
          description = t("invalidCredentials");
        } else if ((error as AxiosError).response?.status === 403) {
          description = t("incorrectCredentials");
        }
        toast({
          title: t("loginError"),
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
                <FloatingLabelInput
                  label={t("email")}
                  className="py-2 h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  label={t("password")}
                  className="py-2 h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Link
          to={"/forgot-password"}
          className="ml-auto inline-block text-sm underline"
        >
          {t("forgotPassword")}
        </Link>
        <Button type="submit" className="w-full h-10" disabled={loading}>
          {!loading ? t("login") : <Loader className="h-5 w-5" />}
        </Button>
      </form>
    </Form>
  );
}
