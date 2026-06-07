import { useState, useEffect, useMemo, useRef } from "react";
import { DayPicker } from "react-day-picker";
import {
  format,
  getYear,
  getMonth,
  setYear,
  setMonth as setMonthOfDate,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  isValid,
  startOfDay,
  parse
} from "date-fns";

import "react-day-picker/dist/style.css";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LucideCalendarDays, Clock } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// 📏 Responsive width detection
function useAutoDirection(threshold = 200) {
  const ref = useRef(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < threshold);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isNarrow };
}

export default function DatePicker({
  value,
  onChange,
  variant = "full",
  className,
  readOnly = false,
  dateFormat = "MM/dd/yyyy",
  timeFormat = "hh:mm a",
  minDate,
  maxDate,
  mode = "single"
}) {
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [showTimePopover, setShowTimePopover] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [hide, setHide] = useState(true);

  const { ref: containerRef, isNarrow } = useAutoDirection();

  // 🔄 Sync state with external value
  useEffect(() => {
    if (mode === "range") {
      const { from, to } = value || {};
      if (from && to) {
        setDateInput(`${format(from, dateFormat)} - ${format(to, dateFormat)}`);
      } else if (from) {
        setDateInput(`${format(from, dateFormat)} - ...`);
      } else {
        setDateInput("");
      }
    } else if (value && isValid(value)) {
      setDateInput(format(value, dateFormat));
      setTimeInput(format(value, timeFormat));
      setViewDate(value);
    } else {
      setDateInput("");
      setTimeInput("");
    }
  }, [value, mode]);

  // 🧠 Smart Date Parser (handles MMDDYYYY or MMDDYY)
  const parseFlexibleDate = (input) => {
    const digits = input.replace(/\D/g, "");
    if (digits.length < 4) return null;
    let month = digits.slice(0, 2);
    let day = digits.slice(2, 4);
    let year = digits.slice(4);
    if (year.length === 2) year = "20" + year;
    if (year.length === 0) year = String(new Date().getFullYear());

    const parsed = new Date(`${month}/${day}/${year}`);
    return isValid(parsed) ? parsed : null;
  };

  const handleDateInputSubmit = () => {
    // const parsed = parseFlexibleDate(dateInput) || new Date(dateInput);
    // if (isValid(parsed)) {
    //   onChange?.(setMinutes(setHours(parsed, getHours(value || new Date())), getMinutes(value || new Date())));
    // } else {
    //   setDateInput(value ? format(value, dateFormat) : "");
    // }
    if (mode === "range") {
      // Split by dash and trim spaces
      const parts = dateInput.split("-").map(p => p.trim());
      if (parts.length === 2) {
        const from = parse(parts[0], dateFormat, new Date());
        const to = parse(parts[1], dateFormat, new Date());
        
        if (isValid(from) && isValid(to)) {
          onChange?.({ from, to });
          setViewDate(from);
          return;
        }
      }
      // Revert on fail
      const { from, to } = value || {};
      setDateInput(from && to ? `${format(from, dateFormat)} - ${format(to, dateFormat)}` : "");
      
    } else {
      const parsed = parse(dateInput, dateFormat, new Date());
      if (isValid(parsed)) {
        onChange?.(parsed);
        setViewDate(parsed);
      } else {
        setDateInput(value ? format(value, dateFormat) : "");
      }
    }
  };

  // 📅 Select from calendar
  const handleDateSelect = (date) => {
    if (!date) return onChange?.(null);
    if (mode === "range") {
      onChange?.(date)
      return;
    }
    const updated = setMinutes(setHours(date, getHours(value || new Date())), getMinutes(value || new Date()));
    onChange?.(updated);
    setShowDatePopover(false);
  };

  // 🕐 Smart Time Parser (handles HHMM, HMM, with optional AM/PM)
  const parseFlexibleTime = (input) => {
    const raw = input.trim().toLowerCase();
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 3) return null;

    let hour = parseInt(digits.slice(0, digits.length - 2), 10);
    let minute = parseInt(digits.slice(-2), 10);
    let isPM = /p$|pm$/.test(raw);

    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    if (hour > 23) hour = 23;
    if (minute > 59) minute = 59;

    return { hour, minute };
  };

  const handleTimeInputSubmit = () => {
    const parsed = parseFlexibleTime(timeInput);
    if (parsed && value) {
      const updated = setMinutes(setHours(value, parsed.hour), parsed.minute);
      onChange?.(updated);
    } else {
      setTimeInput(format(value || new Date(), timeFormat));
    }
  };

  const handleTimeSelect = (hour, minute) => {
    if (!value) return;
    onChange?.(setMinutes(setHours(value, hour), minute));
    setShowTimePopover(false);
  };

  const handleToday = () => {
    const today = startOfDay(new Date());
    handleDateSelect(today);
    setViewDate(today);
  };

  const handleMonthSelect = (m) => setViewDate((prev) => setMonthOfDate(prev, m));
  const handleYearInput = (e) => {
    const y = parseInt(e.target.value, 10);
    if (!isNaN(y)) setViewDate((prev) => setYear(prev, y));
  };

  const handlehide = () => {
    const condition = !hide;
    setHide(condition)
  }

  const timeOptions = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        hour: Math.floor(i / 2),
        minute: i % 2 === 0 ? 0 : 30,
        label: format(setMinutes(setHours(new Date(), Math.floor(i / 2)), i % 2 === 0 ? 0 : 30), timeFormat),
      })),
    [timeFormat]
  );

  return (
    <div ref={containerRef} className={cn("flex w-full gap-4", isNarrow ? "flex-col" : "flex-row", className)}>
      {/* 📅 Date Picker */}
      <Popover open={showDatePopover} onOpenChange={setShowDatePopover}>
        <div className="relative w-full">
          <Input
            type="text"
            value={dateInput}
            onChange={(e) => !readOnly && setDateInput(e.target.value)}
            onBlur={() => !readOnly && handleDateInputSubmit()}
            onKeyDown={(e) => e.key === "Enter" && handleDateInputSubmit()}
            placeholder="MMDDYYYY"
            readOnly={readOnly}
            className={cn("border rounded-md text-sm px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 dark:text-white")}
          />
          <PopoverTrigger asChild>
            <button type="button" className="absolute right-2 top-2 text-gray-500 hover:text-blue-500" disabled={readOnly}>
              <LucideCalendarDays className="h-5 w-5" />
            </button>
          </PopoverTrigger>
        </div>

        <PopoverContent className={cn("p-4 w-full min-w-[260px]  shadow-xl rounded-2xl", !hide ? "sm:w-full" : "sm:w-[340px]")}>
          <div className="flex">
            <div className="flex-1">
              <div className="flex justify-between">
                <Button variant={'outline'}  onClick={handleToday}>Todays</Button>
                <Button variant={'outline'}  onClick={handlehide}>Month</Button>
              </div>
    {mode === "range" && (
              <div className="flex flex-row  gap-2 border-b sm:border-b-0 sm:border-r border-gray-100 pr-0 sm:pr-4 pb-4 sm:pb-0 overflow-x-auto no-scrollbar w-70">
                <Button variant="ghost" size="sm" onClick={() => handlePreset("today")} className="justify-start text-xs h-8">Today</Button>
                <Button variant="ghost" size="sm" onClick={() => handlePreset("last7")} className="justify-start text-xs h-8">Last 7 Days</Button>
                <Button variant="ghost" size="sm" onClick={() => handlePreset("thisMonth")} className="justify-start text-xs h-8">This Month</Button>
                <Button variant="ghost" size="sm" onClick={() => handlePreset("thisYear")} className="justify-start text-xs h-8">This Year</Button>
              </div>
            )}
              <DayPicker
                mode={mode}
                selected={value}
                onSelect={handleDateSelect}
                month={viewDate}
                onMonthChange={setViewDate}
                showOutsideDays
                fixedWeeks
              // fromDate={minDate}
              // toDate={maxDate}
              />
          </div>
            {/* 📆 Month & Year Panel (Right, default open) */}
            <div className="w-32  border-l pl-3 transition-all" hidden={hide}>
              <label className="text-xs font-medium block mb-1">Year</label>
              <Input
                type="number"
                value={getYear(viewDate)}
                onChange={handleYearInput}
                className="border rounded px-2 py-1 text-sm w-full mb-3"
              />
              <label className="text-xs font-medium block mb-1">Month</label>
              <div className="grid grid-cols-2 gap-1">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <button
                    key={m}
                    onClick={() => handleMonthSelect(i)}
                    className={cn(
                      "text-xs py-1 rounded hover:bg-blue-100",
                      getMonth(viewDate) === i && "bg-blue-500 text-white font-semibold"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* 🕒 Time Picker */}
      {variant !== "Date" && value && isValid(value) && (
        <Popover open={showTimePopover} onOpenChange={setShowTimePopover}>
          <div className="relative w-full">
            <Input
              type="text"
              value={timeInput}
              onChange={(e) => !readOnly && setTimeInput(e.target.value)}
              onBlur={() => !readOnly && handleTimeInputSubmit()}
              onKeyDown={(e) => e.key === "Enter" && handleTimeInputSubmit()}
              placeholder="HHMMa"
              readOnly={readOnly}
              className={cn("border rounded-md text-sm px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 dark:text-white")}
            />
            <PopoverTrigger asChild>
              <button type="button" className="absolute right-2 top-2 text-gray-500 hover:text-blue-500 " disabled={readOnly}>
                <Clock className="h-5 w-5" />
              </button>
            </PopoverTrigger>
          </div>

          <PopoverContent className="max-h-[220px] overflow-y-auto p-0 w-36 rounded-2xl shadow-xl">
            <ul className="divide-y divide-gray-100 dark:divide-transparent">
              {timeOptions.map(({ hour, minute, label }) => {
                const isSelected = getHours(value) === hour && getMinutes(value) === minute;
                return (
                  <li key={label}>
                    <button
                      onClick={() => handleTimeSelect(hour, minute)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-blue-100 dark:hover:bg-gray-700",
                        isSelected && "bg-blue-500 text-white font-semibold dark:bg-slate-500"
                      )}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
