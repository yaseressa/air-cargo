import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "./ui/use-toast";
import { PasswordInput } from "./ui/password-input";
import { FloatingLabelInput } from "./re/input";
import { useChangePassword } from "../services/calls/mutators";
import { useState } from "react";
import Loader from "./loader";
import { AxiosError } from "axios";
import { logout } from "@/utils";
import { useLoggedUserStore } from "@/utils/store";
import { useTranslation } from "react-i18next";

export function ChangePasswdForm() {
  const { t } = useTranslation();
  const loggedUser = useLoggedUserStore();
  const { mutate: changePassword } = useChangePassword();
  const [loading, setLoading] = useState(false);

  const FormSchema = z
    .object({
      oldPassword: z.string(),
      newPassword: z.string(),
      repassword: z.string(),
    })
    .refine((data) => data.newPassword === data.repassword, {
      message: t("validation.passwordsMatch"),
      path: ["repassword"],
    });

  function handleSuccess(data: string) {
    toast({
      title: t("passwordChange.success"),
      description: data,
    });
    logout();
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function InputByType({ field, label }: { field: any; label: string }) {
    const isPassword =
      field.name.toLowerCase().includes("password") || field.name === "sir";

    return isPassword ? (
      <PasswordInput className="py-2 h-10" {...field} label={label} />
    ) : (
      <FloatingLabelInput label={label} className="py-2 h-10" {...field} />
    );
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    changePassword(
      { ...data, email: loggedUser.user.email! },
      {
        onSuccess: handleSuccess,
        onError: (error) => {
          error = error as AxiosError;
          let description = t("errorOccurred");
          if ((error as AxiosError).response?.status === 409) {
            description = t("passwordChange.incorrectOldPassword");
          }
          toast({
            title: t("error"),
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
        className="flex flex-col items-stretch gap-10"
      >
        <div className="grid md:grid-cols-4 gap-10">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputByType
                    field={field}
                    label={t("passwordChange.oldPassword")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputByType
                    field={field}
                    label={t("passwordChange.newPassword")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputByType
                    field={field}
                    label={t("passwordChange.confirmPassword")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="h-10" disabled={loading}>
          {!loading ? (
            t("passwordChange.changeButton")
          ) : (
            <Loader className="h-5 w-5" />
          )}
        </Button>
      </form>
    </Form>
  );
}
