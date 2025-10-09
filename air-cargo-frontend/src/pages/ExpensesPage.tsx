import Header from "@/components/header";
import ExpensesManager from "@/components/expenses-manager";
import { useTranslation } from "react-i18next";

const ExpensesPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main className="flex flex-col gap-4 m-2">
        <div className="px-2">
          <h1 className="text-2xl font-semibold text-primary">{t("expenses")}</h1>
          <p className="text-sm text-muted-foreground">{t("expensesPageSubtitle")}</p>
        </div>
        <ExpensesManager />
      </main>
    </>
  );
};

export default ExpensesPage;
