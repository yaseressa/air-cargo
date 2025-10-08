import { DateRange } from "@/components/data-table";
import Header from "@/components/header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addYears, format } from "date-fns";
import { Scroll } from "lucide-react";
import { useState } from "react";

export default () => {
  return (
    <>
      <Header />
      <main className="flex flex-col justify-start items-stretch gap-4 m-2 p-4 sm:px-6 sm:py-0 md:gap-14 my-2">
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid md:w-[400px] grid-cols-2">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="cargos">Cargo</TabsTrigger>
          </TabsList>
          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>
          <TabsContent value="cargos">
            <CargosTab />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

const CustomersTab = () => {
  const [searchCriteria, setSearchCriteria] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: format(addYears(new Date(), -1), "yyyy-MM-dd'T'HH:mm"),
    to: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [phoneSwitch, setPhoneSwitch] = useState<boolean>(false);

  const downloadFile = async () => {
    const apiUrl =
      import.meta.env.VITE_BACKEND_API_URL +
      `/api/reports/customers?search=${searchCriteria.replace(
        "+",
        ""
      )}&startDate=${dateRange.from}&endDate=${dateRange.to}`;
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("token")); // Add the Authorization header

    try {
      const response = await fetch(apiUrl, { method: "GET", headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch the file: ${response.status}`);
      }

      // Convert the response into a Blob and create a downloadable link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "CustomerReports.xlsx"; // Specify the file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex md:flex-row flex-col justify-between gap-4 w-full my-2"
    >
      {" "}
      <div className="flex-1 flex flex-col gap-4">
        {!phoneSwitch ? (
          <Input
            className="h-10"
            value={searchCriteria}
            onChange={(event) => setSearchCriteria(event.target.value)}
            onSubmitCapture={downloadFile}
          />
        ) : (
          <PhoneInput
            value={searchCriteria}
            defaultCountry="SO"
            onChange={(event) => setSearchCriteria(event)}
            className=" rounded !m-0 !p-0"
            onSubmitCapture={downloadFile}
          />
        )}
        <div className="flex items-center gap-2">
          <p className="text-xs">Search by phone</p>
          <Switch checked={phoneSwitch} onCheckedChange={setPhoneSwitch} />
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-evenly flex-1 gap-4">
        <Input
          className="h-10"
          type="datetime-local"
          value={dateRange.from! as string}
          onChange={(e) =>
            setDateRange((v) => ({
              ...v,
              from: e.target.value,
            }))
          }
        />
        <Input
          className="h-10"
          type="datetime-local"
          value={dateRange.to! as string}
          onChange={(e) =>
            setDateRange((v) => ({
              ...v,
              to: e.target.value,
            }))
          }
        />
      </div>
      <Button
        variant={"secondary"}
        className="h-10 shadow-none flex gap-x-3"
        onClick={downloadFile}
      >
        <div>
          <Scroll size={20} className="text-primary" />
        </div>
        <p>Download Excel</p>
      </Button>
    </form>
  );
};
const CargosTab = () => {
  const [searchCriteria, setSearchCriteria] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: format(addYears(new Date(), -1), "yyyy-MM-dd'T'HH:mm"),
    to: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [phoneSwitch, setPhoneSwitch] = useState<boolean>(false);

  const downloadFile = async () => {
    const apiUrl =
      import.meta.env.VITE_BACKEND_API_URL +
      `/api/reports/cargos?search=${searchCriteria.replace(
        "+",
        ""
      )}&startDate=${dateRange.from}&endDate=${dateRange.to}`;
    const headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("token")); // Add the Authorization header

    try {
      const response = await fetch(apiUrl, { method: "GET", headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch the file: ${response.status}`);
      }

      // Convert the response into a Blob and create a downloadable link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "CustomerReports.xlsx"; // Specify the file name
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex md:flex-row flex-col justify-between gap-4 w-full my-2"
    >
      {" "}
      <div className="flex-1 flex flex-col gap-4">
        {!phoneSwitch ? (
          <Input
            className="h-10"
            value={searchCriteria}
            onChange={(event) => setSearchCriteria(event.target.value)}
            onSubmitCapture={downloadFile}
          />
        ) : (
          <PhoneInput
            value={searchCriteria}
            defaultCountry="SO"
            onChange={(event) => setSearchCriteria(event)}
            className=" rounded !m-0 !p-0"
            onSubmitCapture={downloadFile}
          />
        )}
        <div className="flex items-center gap-2">
          <p className="text-xs">Search by phone</p>
          <Switch checked={phoneSwitch} onCheckedChange={setPhoneSwitch} />
        </div>
      </div>
      <div className="flex md:flex-row flex-col justify-evenly flex-1 gap-4">
        <Input
          className="h-10"
          type="datetime-local"
          value={dateRange.from! as string}
          onChange={(e) =>
            setDateRange((v) => ({
              ...v,
              from: e.target.value,
            }))
          }
        />
        <Input
          className="h-10"
          type="datetime-local"
          value={dateRange.to! as string}
          onChange={(e) =>
            setDateRange((v) => ({
              ...v,
              to: e.target.value,
            }))
          }
        />
      </div>
      <Button
        variant={"secondary"}
        className="h-10 shadow-none flex gap-x-3"
        onClick={downloadFile}
      >
        <div>
          <Scroll size={20} className="text-primary" />
        </div>
        <p>Download Excel</p>
      </Button>
    </form>
  );
};
