import DataTable from "@/components/data-table";
import { useEffect, useState } from "react";
import { useUsers } from "@/services/calls/queries";
import { useSelectedUserStore, useUsersStore } from "@/utils/store";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import DialogWrapper from "@/components/re/dialog";
import { PenBox, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteUser, useEnableDisableUser } from "@/services/calls/mutators";
import { UserForm } from "@/components/user-form";
import Header from "@/components/header";
import { useTranslation } from "react-i18next";

export default () => {
  const { t } = useTranslation();
  const userStore = useSelectedUserStore();
  const usersStore = useUsersStore();
  const { mutate: toggleUserStatus } = useEnableDisableUser();
  const { mutate: deleteUser } = useDeleteUser();
  const {
    data: customersPage,
    isLoading,
    refetch,
    isRefetching,
  } = useUsers(
    usersStore.currentPage!,
    usersStore.perPage!,
    usersStore.searchCriteria!,
    usersStore.filter!
  );

  useEffect(() => {
    usersStore.put(customersPage);
    usersStore.setColumns([
      {
        header: t("phoneNumber"),
        accessorKey: "Phone Number",
        cell: ({ row }) => {
          return <p>{row.original.phoneNumber}</p>;
        },
      },
      {
        header: t("firstName"),
        accessorKey: "First Name",
        cell: ({ row }) => {
          return <p>{row.original.firstName}</p>;
        },
      },
      {
        header: t("lastName"),
        accessorKey: "Last Name",
        cell: ({ row }) => {
          return <p>{row.original.lastName}</p>;
        },
      },
      {
        header: t("email"),
        accessorKey: "Email",
        cell: ({ row }) => {
          return <p>{row.original.email}</p>;
        },
      },
      {
        header: t("actions"),
        accessorKey: "Actions",
        cell: ({ row }) => {
          const [isEnabled, setIsEnabled] = useState(row.original.enabled);

          return (
            <div className="flex flex-col items-center gap-3">
              <Switch
                checked={isEnabled}
                onCheckedChange={() =>
                  toggleUserStatus(row.original.id, {
                    onSuccess: () => {
                      setIsEnabled((prev: boolean) => !prev);
                      toast({
                        title: t("userStatusUpdated"),
                        description: t("userStatusUpdatedSuccessfully"),
                      });
                    },
                    onError: () => {
                      toast({
                        title: t("error"),
                        description: t("failedToUpdateUserStatus"),
                        variant: "destructive",
                      });
                    },
                  })
                }
              />
              <div className="flex">
                <DialogWrapper
                  title={t("deleteUser")}
                  trigger={
                    <Button variant="ghost" className="p-2">
                      <Trash
                        className="text-destructive cursor-pointer"
                        size={16}
                      />
                    </Button>
                  }
                  footer={
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        onClick={() => {
                          deleteUser(row.original.id, {
                            onSuccess: () => {
                              toast({
                                title: t("userDeleted"),
                                description: t("userDeletedSuccessfully"),
                              });
                            },
                            onError: () => {
                              toast({
                                title: t("error"),
                                description: t("failedToDeleteUser"),
                                variant: "destructive",
                              });
                            },
                          });
                          usersStore.deleteUser(row.original.id);
                        }}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  }
                >
                  <p>
                    {t("confirmDeleteUser")} {row.original.firstName}{" "}
                    {row.original.lastName}?
                  </p>
                </DialogWrapper>

                <UserForm
                  action="update"
                  trigger={
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={() => userStore.setUser(row.original)}
                    >
                      <PenBox
                        onClick={() => {
                          userStore.setUser(row.original);
                        }}
                        className="text-primary cursor-pointer"
                        size={16}
                      />
                    </Button>
                  }
                />
              </div>
            </div>
          );
        },
      },
    ]);
  }, [isLoading]);

  useEffect(() => {
    const searching = async () => {
      const { data } = await refetch();
      usersStore.put(data);
      usersStore.setTotalPages(data.totalPages);
      usersStore.setTotalElements(data.totalElements);
    };
    searching();
  }, [
    usersStore.searchCriteria,
    usersStore.currentPage,
    usersStore.perPage,
    usersStore.filter,
  ]);

  return (
    <>
      <Header />
      <main className="flex flex-col justify-start items-stretch gap-4 m-2">
        <DataTable
          loading={isLoading}
          refetching={isRefetching}
          columns={usersStore.columns}
          tableData={usersStore.data?.content!}
          headerShown={true}
          create={1}
          selectValues={[t("roles.admin"), t("roles.user")]}
          pagination={{
            currentPage: usersStore.currentPage!,
            totalPages: usersStore.totalPages!,
            totalElements: usersStore.totalElements!,
            perPage: usersStore.perPage!,
            order: usersStore.order!,
            sortBy: usersStore.sortBy!,
          }}
          setPerPage={usersStore.setPerPage}
          setSearchCriteria={usersStore.setSearchCriteria}
          setPageNo={usersStore.setPerPage}
          setFilter={usersStore.setFilter}
        />
      </main>
    </>
  );
};
