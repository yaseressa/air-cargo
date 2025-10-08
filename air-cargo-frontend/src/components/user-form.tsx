import { useRegisterUser, useUpdateUser } from "@/services/calls/mutators";
import {
  useUsersStore,
  useModalNumber,
  useSelectedUserStore,
} from "@/utils/store";
import { FC, useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError, RegistrationRequest, Role } from "@/utils/types";
import { AxiosError } from "axios";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import Loader from "./loader";
import { PasswordInput } from "./ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { PhoneInput } from "./ui/phone-input";
import { FloatingLabelInput } from "./re/input";
import { useTranslation } from "react-i18next";

type UserFormProps = {
  action: "create" | "update";
  trigger?: React.ReactNode;
};

export const UserForm: FC<UserFormProps> = ({ action, trigger }) => {
  const { t } = useTranslation();
  const [users, user] = [useUsersStore(), useSelectedUserStore()];
  const modalNumber = useModalNumber();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(!trigger);
  const [{ mutate: registerUser }, { mutate: updateUser }] = [
    useRegisterUser(),
    useUpdateUser(),
  ];

  const FormSchema = z.object({
    firstName: z.string().min(1, t("validation.firstNameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    email: z.string().email(t("validation.invalidEmail")),
    password: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (action === "create")
            return value?.length ? value.length >= 8 : false;
          return true;
        },
        {
          message: t("validation.passwordLength"),
        }
      ),
    phoneNumber: z.string().min(1, t("validation.phoneRequired")),
    role: z.enum(["ADMIN", "USER"], {
      errorMap: () => ({ message: t("validation.roleRequired") }),
    }),
  });

  useEffect(() => {
    if (user?.user && action === "update") {
      const { password: _, ...userData } = user.user;
      form.reset({ ...userData, role: user.user.roles![0] });
    }
  }, [user.user]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  const handleOpenChange = () => {
    setOpen((prev) => !prev);
    if (!trigger) modalNumber.setModalNumberAndType(0);
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    if (action === "create") {
      registerUser(
        { ...data, roles: [data.role], enabled: true },
        {
          onSuccess: (returnedData) => {
            setLoading(false);
            handleOpenChange();
            users.addUser({
              ...returnedData,
              enabled: true,
              roles: [data.role! as Role],
            });
            toast({
              title: t("userCreated"),
              description: t("userCreatedDescription", {
                name: returnedData.firstName,
              }),
            });
          },
          onError: (error) => {
            setLoading(false);
            let description =
              (error as AxiosError<ApiError>).response?.data?.detail ??
              t("errorOccurred");
            if ((error as AxiosError).response?.status === 400) {
              description = t("requestCannotComplete");
            }
            toast({
              title: t("userCreateError"),
              variant: "destructive",
              description,
            });
          },
        }
      );
    } else {
      updateUser(
        {
          ...user.user,
          ...(data as RegistrationRequest),
          roles: [data.role],
        },
        {
          onSuccess: (data) => {
            setLoading(false);
            handleOpenChange();
            toast({
              title: t("userUpdated"),
              description: t("userUpdatedDescription", {
                name: data.firstName,
              }),
            });
          },
          onError: (error) => {
            setLoading(false);
            let description =
              (error as AxiosError<ApiError>).response?.data?.detail ??
              t("errorOccurred");
            if ((error as AxiosError).response?.status === 400) {
              description = t("requestCannotComplete");
            }
            toast({
              title: t("userUpdateError"),
              variant: "destructive",
              description,
            });
          },
        }
      );
    }
  }

  const onPasswordGenerate = (password: string) => {
    form.setValue("password", password);
  };

  return (
    <>
      <div onClick={handleOpenChange}>{trigger}</div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle>{t("userDetails")}</DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid md:grid-cols-2 gap-3 py-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label={t("firstName")} {...field} />
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
                        <FloatingLabelInput label={t("lastName")} {...field} />
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
                        <FloatingLabelInput label={t("email")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {action === "create" && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PasswordInput
                            {...field}
                            onPasswordGenerate={onPasswordGenerate}
                            passwordLength={8}
                            label={t("password")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phoneNumber")}</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("role")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectRole")} />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="USER">
                            {t("roles.user")}
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            {t("roles.admin")}
                          </SelectItem>

                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {action == "create" && !loading ? (
                    t("createUser")
                  ) : action == "update" && !loading ? (
                    t("updateUser")
                  ) : (
                    <Loader className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};



