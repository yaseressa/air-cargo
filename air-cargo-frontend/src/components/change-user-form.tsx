import { useChangeUserData } from "@/services/calls/mutators";
import { useLoggedUserStore } from "@/utils/store";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { FloatingLabelInput } from "./re/input";
import { Button } from "./ui/button";
import Loader from "./loader";
import { PasswordInput } from "./ui/password-input";
import { PhoneInput } from "./ui/phone-input";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/utils/types";

export const ChangeUserForm = () => {
  const { t } = useTranslation();
  const user = useLoggedUserStore();
  const [loading, setLoading] = useState(false);
  const { mutate: changeUserData } = useChangeUserData();

  const FormSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string(),
    phoneNumber: z.string(),
    role: z.enum(["ADMIN", "USER"]),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    const { password: _, ...userData } = user.user;
    form.reset({ ...userData, role: user.user.roles![0] });
  }, [user.user]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    changeUserData(
      { ...data, roles: [data.role] },
      {
        onSuccess: () => {
          setLoading(false);
          toast({
            title: t("userUpdate.successTitle"),
            description: t("userUpdate.successDescription"),
          });
        },
        onError: (error) => {
          setLoading(false);
          let description =
            (error as AxiosError<ApiError>).response?.data?.detail ??
            t("errorOccurred");
          if ((error as AxiosError).response?.status === 409) {
            description = t("userUpdate.unauthorizedAction");
          }
          toast({
            title: t("userUpdate.errorTitle"),
            variant: "destructive",
            description,
          });
        },
      }
    );
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-stretch gap-10"
        >
          <div className="grid md:grid-cols-4 gap-10">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label={t("userForm.firstName")}
                      className="p-2 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label={t("userForm.lastName")}
                      className="p-2 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingLabelInput
                      label={t("userForm.email")}
                      className="p-2 h-10"
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
                      className="p-2 h-10"
                      placeholder={t("userForm.password")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("userForm.phoneNumber")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      className="p-2 h-10"
                      {...field}
                      placeholder={t("userForm.phonePlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {!loading ? t("update") : <Loader className="h-5 w-5" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

