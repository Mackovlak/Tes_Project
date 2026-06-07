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
import { BadgeAlert, Bell, Trash } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useSheet } from '@/context/sheet-context'
import { NotificationCard } from './NotificationCard'
import { useNotifications } from '@/hooks/useNotification'
// import { AppAccordion } from './app-accordion'
 
export function NotifBar({
}) {

  const { sheetopen, setSheetOpen } = useSheet();
  const { clearNotification } = useNotifications();

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
          <Bell className="h-5"></Bell>
        </Button>
      </SheetTrigger>
      <SheetContent
        className={
          "dark:bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%"
        }
      >
        <SheetHeader>
          <SheetTitle className="flex justify-center text-2xl mt-5">
            Notification
          </SheetTitle>
          <SheetDescription>
            <Button
              variant={"outline"}
              className={
                "dark:border-b-slate-500 dark:bg-gradient-to-b dark:from-slate-600 dark:via-slate-800 dark:to-slate-700"
              }
              onClick={() => clearNotification()}
            >
              <Trash /> Clear All Notification
            </Button>
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-auto flex gap-2 flex-col p-4">
          <NotificationCard />
        </div>
      </SheetContent>
    </Sheet>
  );
}
