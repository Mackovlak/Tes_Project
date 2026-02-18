import { useState, useEffect, useMemo } from "react";
import { ChartArea, ChartBar, ChartPie, ChartAreaInteractive, ChartBarMixed } from "../components/sc-chart";
import { CaseTable } from "@/components/table-data/CaseTable";
import ApiCustomer from "@/api"
import { parse } from "date-fns";
import { Week } from "react-day-picker";
import { toast } from "sonner";
import { CalendarDays, CircleAlert, Download, PinIcon, RefreshCw, ShieldIcon, Wrench } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { buildBusinessDayCaseTypeSeries } from "@/components/chart-data/utils-config";
import { ChartAreaBig } from "@/components/chart-data/ChartAreaBig";
import { ChartPieClose } from "@/components/chart-data/PieChartClose";
import axios from "axios";

function StatCard({
  title,
  value,
  subtext,
  icon : Icon,
  accent = "bg-gray-200 text-gray-700",
  color,
}
) {
  return (
    <Card className={`h-full dark:bg-gradient-to-bl dark:from-slate-900 dark:via-slate-800 dark:to-slate-800 dark:to-10% via-80% from-20%`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-white">
          {title}
        </CardTitle>
         {Icon && (
          <div className={`p-2 rounded-md ${accent}/10`}>
            <Icon className={`h-4 w-4 mx-auto ${accent.replace("bg-", "text-")}`} />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold leading-none dark:text-white">{value} Cases</div>
        {subtext ? (
          <p className="text-xs text-muted-foreground transition-all dark:text-white">{subtext}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

const EMPTY_TOTALS = {
  Bench: 0,
  Onsite: 0,
  InWarranty: 0,
  OutWarranty: 0,
  Cancel: 0,
  Close: 0,
};

export default function Landing() {
  const [caseData, setCaseData] = useState([]);
  const [holidaysData, setHolidaysData] = useState([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState("30")
  const [refresh, setRefresh] = useState(false)


  // Some stuff for learning
// const calculateChartNumber = () => {
//   const keydata = Object.keys(totalChartData)
//   const total = chartData.reduce((acc, curr) => {
//     keydata.forEach((key) => {
//       acc[key] += (curr[key] || 0)
//     })
//     return acc;
//   }, {...totalChartData})
//  setTotalChartData(total);
// }

  const { user } = useAuth();
    const fetchCaseData = async () => {
       setLoading(true)
        try {
            const response = await ApiCustomer.get("/api/case-information");
            if (response.data.data) {
              const data = response.data.data
                setCaseData(data);
            }
        } catch (err) {
            toast.error("Failed fetching");
        } finally {
          setLoading(false)
        }
    };

   const holidaystime = async () => {
     
     try {
       const response = await axios.get('https://libur.deno.dev/api');
       setHolidaysData(response.data)
     } catch (err) {
       toast.warning("Cant Fetch Holidays Time",err)
     }
   }

    const refreshdata = () => {
      setRefresh(prev => !prev)
    }

    useEffect(() => {
      fetchCaseData();
      holidaystime();
    }, [refresh]);

 const chartData = useMemo(() => {
    if (!user) return [];
    return buildBusinessDayCaseTypeSeries(caseData, user, {
      businessDays: Number(range),
      holidaysData
    });
  }, [caseData, user, range]);

  const totalChartData = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => {
        acc.Bench += curr.Bench || 0;
        acc.Onsite += curr.Onsite || 0;
        acc.InWarranty += curr.InWarranty || 0;
        acc.OutWarranty += curr.OutWarranty || 0;
        acc.Cancel += curr.Cancel ||0;
        acc.Close += curr.Close ||0;
        return acc;
      },
      { ...EMPTY_TOTALS }
    );
  }, [chartData]);

    return (
      <div className="max-h-full w-full overflow-hidden">
      <div className="mx-auto flex h-full   flex-col px-4 py-1 md:px-6 bg-sky-50 dark:bg-slate-600 ">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {/* <h1 className="truncate text-2xl font-semibold">Admin Dashboard</h1> */}
            {/* <p className="text-sm text-muted-foreground"> */}
            {/*   Overview of traffic, conversions, and platform breakdown */}
            {/* </p> */}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="260">Last 260 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="hidden h-9 sm:block" />

            <Button variant="outline" size="sm" className="gap-2" onClick={() => refreshdata()} disabled={loading}>
              <RefreshCw className={"h-4 w-4", loading && "animate-spin"} />
              Refresh
            </Button>
            <Button size="sm" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Bench Case"
                value={totalChartData.Bench}
                // subtext="+12.4% vs previous period"
                icon={Wrench}
                accent={"from-[var(--chart-1)] to-slate-200 bg-gradient-to-bl "}
              />
              <StatCard
                title="Total Onsite Case"
                value={totalChartData.Onsite}
                // subtext="+0.4pp improvement"
                icon={PinIcon}
                accent={"from-[var(--chart-2)] to-slate-200 bg-gradient-to-bl "}
              />
              <StatCard
                title="Total Warranty Case"
                value={totalChartData.InWarranty}
                // subtext="+2% improvement"
                icon={ShieldIcon}
              accent={"from-[var(--chart-3)] to-slate-200 bg-gradient-to-bl "}
              />
              <StatCard
                title="Total Not Warranty Case"
                value={totalChartData.OutWarranty}
                // subtext="+8.1% vs previous period"
                icon={CircleAlert}
                accent={"from-[var(--chart-4)] to-slate-200 bg-gradient-to-bl "}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="h-[420px] lg:h-[520px]">
                  <ChartAreaBig chartData={chartData}/>
                </div>
              </div>

              <div className="grid gap-4 lg:col-span-4">
                <div className=" ">
                  {/* <ChartPie /> */}
                  <ChartPieClose totalChartData={totalChartData}/>
                </div>
                <div className=" ">
                  {/* <ChartBarMixed /> */}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    );
}
