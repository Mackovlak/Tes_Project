
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BadgeAlert, Bell, Ticket, Trash } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { useSheet } from '@/context/sheet-context'
import { useAuth } from '@/context/auth-context'
import ApiCustomer from '@/api'
// import { AppAccordion } from './app-accordion'
 
export function TicketsBar({}) {
    const { sheetopen, setSheetOpen } = useSheet();
    const { user } = useAuth();
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
  const [refresh, setRefresh] = React.useState(false);

    const typeColors = {
        created: "bg-blue-100 text-blue-700",
        updated: "bg-yellow-100 text-yellow-700",
        assigned: "bg-purple-100 text-purple-700",
        closed: "bg-green-100 text-green-700",
    };

    function handleRefresh() {
      setRefresh((prev) => !prev);
    }
    const fetchTicket = React.useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ApiCustomer.get(`/api/tickets`);
        setData(res.data.data);
      } catch (error) {
        toast.error("Failed to fetch Symptom Code data");
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }, []);

    React.useEffect(() => {
      fetchTicket();
    }, [fetchTicket, refresh]);
console.log("check the output of it",data)
  return (
    <Sheet open={sheetopen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          title={"Notification"}
          variant="outline"
          className={
            "cursor-pointer dark:border-b-slate-500 dark:bg-gradient-to-b dark:from-slate-600 dark:via-slate-800 dark:to-slate-700"
          }
        >
         <Ticket />
        </Button>
      </SheetTrigger>
      <SheetContent
        className={
          "dark:bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%"
        }
      >
        <SheetHeader>
          <SheetTitle className="flex justify-center text-2xl mt-5">
            List Ticket Case
          </SheetTitle>
          <SheetDescription>

          </SheetDescription>
        </SheetHeader>
        <div className="overflow-auto flex gap-2 flex-col p-4">
          {
        data.map((i) => (
<Card 
  className="relative overflow-hidden flex flex-col shadow-md border rounded-xl hover:shadow-lg transition dark:border-slate-600 dark:bg-gradient-to-b dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" 
  key={i.token}
>                            
  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/50 blur-2xl" />

  <CardHeader className="flex flex-col gap-1 relative z-10">
    <div className="flex justify-between items-center gap-10">
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[i.type] || "bg-gray-100 text-gray-700"}`}>
        {i.TicketNumber || "unknown"}
      </span>
      <span className="text-xs text-gray-400">{new Date(i.CreatedAt).toLocaleString()}</span>
    </div>
    <CardTitle className="text-sm font-semibold">{i.Subject }</CardTitle>
  </CardHeader>

  <CardContent className="relative z-10">
    <CardDescription className={"dark:text-gray-400"}>
      {i.contact_information.FirstName} {i.contact_information.LastName}
    </CardDescription>
  </CardContent>

  <CardFooter className={"flex justify-between relative z-10"}>
    <Button 
      variant={"outline"} 
      className={"dark:border-b-slate-500 dark:bg-gradient-to-b dark:from-slate-600 dark:via-slate-800 dark:to-slate-700"} 
      onClick={() => deleteNotification(i.token)}
    >
    </Button>
    <h1 className='text-lg p-3 rounded-2xl absolute right-0 text-amber-900 font-medium'>
      {i.Status}
    </h1>
  </CardFooter>
</Card>
        ))
          }
        </div>
      </SheetContent>
    </Sheet>
  );
}
