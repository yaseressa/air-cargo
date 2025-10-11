import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ExternalLink, PenBox, Trash } from "lucide-react";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";

import DataTable, { ColumnDef } from "@/components/data-table";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import DialogWrapper from "@/components/re/dialog";
import {
  useCreateExpense,
  useDeleteExpense,
  useUpdateExpense,
} from "@/services/calls/mutators";
import { useExpenses, useSupportedCurrencies } from "@/services/calls/queries";
import type { Expense } from "@/utils/types";

type ExpenseFormValues = {
  description: string;
  amount: string;
  currencyCode: string;
  incurredAt: string;
};

const formatAmount = (expense?: Expense) => {
  if (!expense?.amount?.amount) return "";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: expense.amount.currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(Number(expense.amount.amount));
  } catch (error) {
    return `${expense.amount.amount} ${
      expense.amount.currencyCode ?? ""
    }`.trim();
  }
};

const ExpensesPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading, isFetching } = useExpenses();
  const { data: supportedCurrencies = [], isLoading: loadingCurrencies } =
    useSupportedCurrencies();
  const { mutate: createExpense, isLoading: isCreating } = useCreateExpense();
  const { mutate: updateExpense, isLoading: isUpdating } = useUpdateExpense();
  const { mutate: removeExpense, isLoading: isDeleting } = useDeleteExpense();

  const [searchCriteria, setSearchCriteria] = useState("");
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [receiptFile, setReceiptFile] = useState<globalThis.File | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formSchema = useMemo(
    () =>
      z.object({
        description: z.string().min(1, t("validation.required")),
        amount: z
          .string()
          .min(1, t("validation.required"))
          .refine((value) => {
            const parsed = Number(value);
            return !Number.isNaN(parsed) && parsed > 0;
          }, t("validation.positiveNumber")),
        currencyCode: z.string().min(1, t("validation.required")),
        incurredAt: z.string().min(1, t("validation.required")),
      }),
    [t]
  );

  const today = format(new Date(), "yyyy-MM-dd");

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      currencyCode: "",
      incurredAt: today,
    },
  });

  useEffect(() => {
    if (supportedCurrencies?.length && !form.getValues("currencyCode")) {
      form.setValue("currencyCode", supportedCurrencies[0]);
    }
  }, [form, supportedCurrencies]);

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingExpense(undefined);
      resetForm();
    }
  };

  const resetForm = () => {
    const preferredCurrency =
      form.getValues("currencyCode") || supportedCurrencies?.[0] || "";
    form.reset({
      description: "",
      amount: "",
      currencyCode: preferredCurrency,
      incurredAt: today,
    });
    setReceiptFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = useCallback(
    (expense: Expense) => {
      if (!expense?.id) {
        return;
      }

      const incurredDate = expense.incurredAt
        ? format(new Date(expense.incurredAt), "yyyy-MM-dd")
        : today;

      form.reset({
        description: expense.description ?? "",
        amount:
          expense.amount?.amount !== undefined
            ? String(expense.amount.amount)
            : "",
        currencyCode:
          expense.amount?.currencyCode ??
          form.getValues("currencyCode") ??
          supportedCurrencies?.[0] ??
          "",
        incurredAt: incurredDate,
      });
      setEditingExpense(expense);
      setReceiptFile(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDialogOpen(true);
    },
    [form, setDialogOpen, supportedCurrencies, today]
  );

  const handleDelete = useCallback(
    (expense: Expense) => {
      if (!expense?.id) {
        return;
      }

      setDeletingExpenseId(expense.id);
      removeExpense(expense.id, {
        onSuccess: () => {
          toast({
            title: t("success"),
            description: t("expenseDeleted"),
          });
          queryClient.invalidateQueries(["expenses"]);
        },
        onError: (error) => {
          toast({
            title: t("error"),
            description:
              error instanceof Error
                ? error.message
                : t("expenseDeletionFailed"),
            variant: "destructive",
          });
        },
        onSettled: () => {
          setDeletingExpenseId(null);
        },
      });
    },
    [queryClient, removeExpense, setDeletingExpenseId, t]
  );

  const onSubmit = (values: ExpenseFormValues) => {
    const payload = {
      description: values.description,
      amount: Number(values.amount),
      currencyCode: values.currencyCode,
      incurredAt: values.incurredAt
        ? new Date(values.incurredAt).toISOString()
        : null,
    };

    const handleSuccess = (message: string) => {
      toast({
        title: t("success"),
        description: message,
      });
      queryClient.invalidateQueries(["expenses"]);
      handleDialogChange(false);
    };

    const handleError = (error: unknown, fallbackMessage: string) => {
      toast({
        title: t("error"),
        description:
          error instanceof Error ? error.message : fallbackMessage,
        variant: "destructive",
      });
    };

    if (editingExpense?.id) {
      updateExpense(
        { id: editingExpense.id, data: payload, file: receiptFile },
        {
          onSuccess: () => {
            handleSuccess(t("expenseUpdated"));
          },
          onError: (error) => {
            handleError(error, t("expenseUpdateFailed"));
          },
        }
      );
    } else {
      createExpense(
        { data: payload, file: receiptFile },
        {
          onSuccess: () => {
            handleSuccess(t("expenseCreated"));
          },
          onError: (error) => {
            handleError(error, t("expenseCreationFailed"));
          },
        }
      );
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = searchCriteria
        ? [
            expense.description,
            expense.amount?.currencyCode,
            expense.amount?.amount?.toString(),
          ]
            .filter(Boolean)
            .some((value) =>
              value!
                .toString()
                .toLowerCase()
                .includes(searchCriteria.toLowerCase())
            )
        : true;

      const incurredDate = expense.incurredAt
        ? new Date(expense.incurredAt)
        : undefined;
      const from = fromDate ? new Date(fromDate) : undefined;
      const to = toDate ? new Date(toDate) : undefined;

      const afterFrom = from
        ? incurredDate
          ? incurredDate >= from
          : false
        : true;
      const beforeTo = to ? (incurredDate ? incurredDate <= to : false) : true;

      return matchesSearch && afterFrom && beforeTo;
    });
  }, [expenses, fromDate, searchCriteria, toDate]);

  const totalsByCurrency = useMemo(() => {
    return filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
      const currency = expense.amount?.currencyCode ?? "";
      const value = Number(expense.amount?.amount ?? 0);
      if (!currency) return acc;
      acc[currency] = (acc[currency] ?? 0) + value;
      return acc;
    }, {});
  }, [filteredExpenses]);

  const isSubmitting = isCreating || isUpdating;

  const columns = useMemo<ColumnDef[]>(
    () => [
      {
        header: t("expenseDescription"),
        accessorKey: "description",
        cell: ({ row }) => (
          <span className="font-medium text-primary">
            {row.original.description}
          </span>
        ),
      },
      {
        header: t("amount"),
        accessorKey: "amount",
        cell: ({ row }) => <span>{formatAmount(row.original)}</span>,
      },
      {
        header: t("expenseCurrency"),
        accessorKey: "currencyCode",
        cell: ({ row }) => (
          <Badge variant="outline" className="uppercase">
            {row.original.amount?.currencyCode ?? ""}
          </Badge>
        ),
      },
      {
        header: t("expenseDate"),
        accessorKey: "incurredAt",
        cell: ({ row }) =>
          row.original.incurredAt
            ? format(new Date(row.original.incurredAt), "PP")
            : t("nA"),
      },
      {
        header: t("createdAt"),
        accessorKey: "createdAt",
        cell: ({ row }) =>
          row.original.createdAt
            ? format(new Date(row.original.createdAt), "PP")
            : t("nA"),
      },
      {
        header: t("expenseReceipt"),
        accessorKey: "receipt",
        cell: ({ row }) =>
          row.original.receipt?.fileUrl ? (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={row.original.receipt.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("viewReceipt")}
              </a>
            </Button>
          ) : (
            <span className="text-muted-foreground">
              {t("noReceiptAttached")}
            </span>
          ),
      },
      {
        header: t("actions"),
        accessorKey: "actions",
        cell: ({ row }) => {
          const expense: Expense = row.original;
          const isRowDeleting =
            isDeleting && deletingExpenseId === expense.id;

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(expense)}
                aria-label={t("edit")}
              >
                <PenBox className="h-4 w-4" />
              </Button>
              <DialogWrapper
                title={t("deleteExpense")}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("delete")}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                footer={
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(expense)}
                    disabled={isRowDeleting}
                  >
                    {isRowDeleting ? t("deleting") : t("delete")}
                  </Button>
                }
              >
                <p className="text-sm text-muted-foreground">
                  {t("confirmDeleteExpense", {
                    description:
                      expense.description || t("expense").toLowerCase(),
                  })}
                </p>
              </DialogWrapper>
            </div>
          );
        },
      },
    ],
    [
      deletingExpenseId,
      handleDelete,
      handleEdit,
      isDeleting,
      t,
    ]
  );

  return (
    <>
      <Header />
      <main className="flex flex-col gap-6 m-2">
        <div className="px-2 flex flex-col gap-2">
          <div className="flex flex-wrap gap-4">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <Card key={currency} className="min-w-[180px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                    {t("totalExpensesIn", { currency })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency,
                    }).format(total)}
                  </p>
                </CardContent>
              </Card>
            ))}
            {!Object.keys(totalsByCurrency).length && (
              <Card className="min-w-[180px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("noExpensesYet")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-muted-foreground">
                    {t("startByRecordingExpense")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? t("editExpense") : t("addExpense")}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense
                    ? t("updateExpenseDescription")
                    : t("recordNewExpenseDescription")}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("expenseDescription")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("expenseDescriptionPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("expenseAmount")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currencyCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("expenseCurrency")}</FormLabel>
                          <Select
                            disabled={loadingCurrencies}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("selectCurrency")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supportedCurrencies?.map((currency) => (
                                <SelectItem
                                  key={currency}
                                  value={currency}
                                  className="uppercase"
                                >
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="incurredAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("expenseDate")}</FormLabel>
                        <FormControl>
                          <Input type="date" max={today} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {editingExpense?.receipt?.fileUrl && (
                    <div className="space-y-1">
                      <FormLabel>{t("currentReceipt")}</FormLabel>
                      <Button variant="link" asChild className="px-0">
                        <a
                          href={editingExpense.receipt.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4 inline" />
                          {t("viewReceipt")}
                        </a>
                      </Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <FormLabel>{t("expenseReceipt")}</FormLabel>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      ref={fileInputRef}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setReceiptFile(file ?? undefined);
                      }}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? t("saving")
                        : editingExpense
                        ? t("update")
                        : t("save")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable
          loading={isLoading}
          refetching={isFetching}
          columns={columns}
          tableData={filteredExpenses}
          setSearchCriteria={(value: string) => setSearchCriteria(value)}
          setFromDate={(value: string) => setFromDate(value)}
          setToDate={(value: string) => setToDate(value)}
          searchCriteria={searchCriteria}
          headerShown
          paginationVisible={false}
          columnsShown={false}
          report="expenses"
          onCreateClick={() => handleDialogChange(true)}
        />
      </main>
    </>
  );
};

export default ExpensesPage;
