import ApiCustomer from '@/api'
import { SearchBar } from '@/components/sidebar/search-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'
import { se } from 'date-fns/locale'
import { filter, set } from 'lodash'
import { PanelRight, RefreshCw } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { data, Link, useNavigate } from 'react-router'
import Swal from 'sweetalert2'
import { Label } from '@/components/ui/label'
import { format, subMonths, isValid, differenceInCalendarMonths } from 'date-fns'
import { toast } from 'sonner'
import { STATUS_ENUM_TO_LABEL } from '@/hooks/useCaseStatus'
import { useMediaQuery } from 'react-responsive'


export const FlowCase = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null; // dont render listener until auth is ready
  }
  return <FlowCaseData user={user}/>

}

export const FlowCaseData = (user) => {
  const [caseData, setCaseData] = useState([]);
  const [renderer, setRenderer] = useState(false)
  const [error, setError] = useState(false)
  const [filters, setFilters] = useState({
    SerialNumber: "",
    Company: "",
    Email: "",
    Phone: "",
    Id: "",
    Status: "",
    Type: "",
    Role: "",
    RangeTime: {
      from: subMonths(new Date(), 3), // <-- Set default 3 months ago
      to: new Date()                  // <-- Set default to today
    },
    TimeLength: "",
  });
  const isToggleUser = user.user?.role === "admin" || user.user?.role === "fd";
  const isAdmin = user.user?.role === "admin" ;
  const [filterClose, setFilterClose] = useState(true)
  const [filterFinish, setFilterFinish] = useState(true)
  const [adminViewDoneOnly, setAdminViewDoneOnly] = useState(false);
  const [fetchNew, setFetchNew] = useState(false)


    function handleFetchnew(){
      setFetchNew(prev => !prev)
    }

const fetchData = async () => {
  setRenderer(true);
  try {
    const apiParams = { mode: 'all' };

    // 1. DATE RANGE LOGIC (Performance Protection)
    // If user hasn't picked a date, default to last 3 months
    const startDate = filters.RangeTime?.from || subMonths(new Date(), 3);
    const endDate = filters.RangeTime?.to || new Date();

    apiParams.startDate = format(startDate, "yyyy-MM-dd");
    apiParams.endDate = format(endDate, "yyyy-MM-dd");

    // 2. STATUS & OWNERSHIP LOGIC
    if (isToggleUser && (!filterClose || !filterFinish)) {
      /** * GLOBAL MODE: If a user toggles "View Closed" or "View Finish", 
       * we assume they want to see everything globally.
       * We DO NOT send apiParams.createdOrOwner
       */
      if (!filterClose) {
         // Note: Assuming your state 'filterClose' being false means the switch is ON (to show them)
         apiParams['includeStatuses[]'] = ['Close', 'Cancel'];
      } else if (!filterFinish) {
         apiParams['includeStatuses[]'] = ['FinishRepair'];
      }
    } else {
      /** * PERSONAL/NORMAL MODE: 
       * Show active cases for the specific user
       */
      if (!isAdmin) apiParams.createdOrOwner = user.user.id;
      apiParams['excludeStatuses[]'] = ['Close', 'Cancel', 'FinishRepair'];
    }

    const response = await ApiCustomer.get('/api/case-information', { params: apiParams });

    // API now handles the filtering, so we just sort and set
    const sorted = (response.data.data || []).sort((a, b) => {
      const dateA = a.UpdateOn ? new Date(a.UpdateOn) : new Date(0);
      const dateB = b.UpdateOn ? new Date(b.UpdateOn) : new Date(0);
      return dateB - dateA;
    });

    setCaseData(sorted);
  } catch (error) {
    console.error(error);
  } finally {
    setRenderer(false);
  }
};
  useEffect(() => {
    fetchData();
  }, [user.user, filterClose, filterFinish, fetchNew]);

  function parseCreatedOn(dateStr) {
    const [datePart, timePart] = dateStr.split(', ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split('.').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
  function isWithinRange(createdOn, rangeFrom, rangeTo, compareDateOnly = false) {
    if (compareDateOnly) {
      // Strip the time (normalize all to midnight local time)
      const created = new Date(createdOn.getFullYear(), createdOn.getMonth(), createdOn.getDate());
      const from = new Date(rangeFrom.getFullYear(), rangeFrom.getMonth(), rangeFrom.getDate());
      const to = new Date(rangeTo.getFullYear(), rangeTo.getMonth(), rangeTo.getDate());

      // Inclusive comparison — includes same-day matches
      return created >= from && created <= to;
    } else {
      // Compare full date-time
      return createdOn >= rangeFrom && createdOn <= rangeTo;
    }
  }
const handleRangeTimeChange = React.useCallback((val) => {
    const from = val?.from;
    const to   = val?.to;

    // Both ends must be valid Dates before we allow the range to take effect
    if (
      from instanceof Date && isValid(from) &&
      to   instanceof Date && isValid(to)
    ) {
      // Enforce max 3-month span
      const spanMonths = differenceInCalendarMonths(to, from);
      if (spanMonths > 3) {
        toast.warning("Date range cannot exceed 3 months. Adjusting end date.");
        const cappedTo = subMonths(to, spanMonths - 3);
        setFilters((prev) => ({
          ...prev,
          RangeTime: { from, to: cappedTo },
        }));
        return;
      }
      setFilters((prev) => ({ ...prev, RangeTime: { from, to } }));
    } else if (!from && !to) {
      // User cleared the picker — reset to default window
      setFilters((prev) => ({ ...prev, RangeTime: { from: undefined, to: undefined } }));
    } else {
      // Partial selection (e.g. only `from` picked) — update locally, no fetch yet
      setFilters((prev) => ({ ...prev, RangeTime: val ?? { from: undefined, to: undefined } }));
    }
  }, []);

const handleFilterChange = React.useCallback((field, value) => {
    if (field === "RangeTime") {
      handleRangeTimeChange(value);
    } else {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  }, [handleRangeTimeChange]);


  // filter logic
  const filteredCases = caseData.filter(c => {
      const isCreatedBy = c?.caseinformation?.CreatedBy == user.user.id;

      const isOwner = c?.Owner == user.user.id;
      const matchesStatus = !filters.Status || c.CaseStatus === filters.Status || c.UpdatedActionLogs?.[0]?.dataNew === filters.Status;


      const parseCreatedON = parseCreatedOn(c?.CreatedOn);
      let isInCreatedRange = true;
      if (filters.RangeTime?.from && filters.RangeTime?.to && parseCreatedON instanceof Date && !isNaN(parseCreatedON)) {
        isInCreatedRange = isWithinRange(parseCreatedON, filters.RangeTime.from, filters.RangeTime.to, true);
      }

        
      let isInTimeLength = true;
      const updateDate = c.UpdateOn ? new Date(c.UpdateOn) : null;

      if (filters.TimeLength && updateDate) {
        const daysAgo = Math.floor((Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.TimeLength) {
          case "within4":
            isInTimeLength = daysAgo < 4;
            break;
          case "within8":
            isInTimeLength = daysAgo >= 4 && daysAgo < 8;
            break;
          case "within15":
            isInTimeLength = daysAgo >= 8 && daysAgo < 15;
            break;
          case "over15":
            isInTimeLength = daysAgo >= 15;
            break;
          default:
            isInTimeLength = true;
        }
      }

      return (
        (filters.SerialNumber === "" || c.SerialNumber?.toLowerCase().includes(filters.SerialNumber.toLowerCase())) &&
        (filters.Company === "" || c.CustomerAccount?.toLowerCase().includes(filters.Company.toLowerCase())) &&
        (filters.Email === "" || c.caseinformation?.contact_information?.Email?.toLowerCase().includes(filters.Email.toLowerCase())) &&
        (filters.Phone === "" || c.caseinformation?.contact_information?.Phone?.toLowerCase().includes(filters.Phone.toLowerCase())) &&
        (filters.Id === "" || c.CaseID.toString().includes(filters.Id)) &&
        (filters.Status === "" || c.CaseStatus === filters.Status) &&
        (filters.Type === "" || c.caseinformation?.CaseType === filters.Type) &&
        (filters.Role === "" || (filters.Role === "CreatedBy" && c.caseinformation.CreatedBy === user.user.id) || (filters.Role === "Owner" && c.caseinformation.Owner === user.user.id)) &&
          isInCreatedRange &&
        isInTimeLength
      );
    })
    .sort((a, b) => {
      const aIsOwner = a.Owner == user.user.username;
      const bIsOwner = b.Owner == user.user.username;
      if (aIsOwner && !bIsOwner) return -1;
      if (!aIsOwner && bIsOwner) return 1;
      return 0;
    })
    .map(c => {
      
      // Grab the raw CreatedOn
      const rawCreated = c.UpdateOn;
      const createdDate = rawCreated ? (rawCreated instanceof Date ? rawCreated : new Date(rawCreated)) : null;

      let estimatedTime = null;
      if (createdDate) {
        const diffMs = Date.now() - createdDate.getTime(); // difference in milliseconds
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
          estimatedTime = `${diffDays} day(s) ago`;
        } else if (diffHours > 0) {
          estimatedTime = `${diffHours} hour(s) ago`;
        } else if (diffMinutes > 0) {
          estimatedTime = `${diffMinutes} minute(s) ago`;
        } else {
          estimatedTime = `${diffSeconds} second(s) ago`;
        }
      }

      return {
        ...c,
        FormattedCreatedOn: createdDate ? createdDate.toLocaleString("id-ID") : null,
        EstimedTimeFromUpdate: estimatedTime || "No Update",
      };
    });

  const emptyData = { within4: [], within8: [], within15: [], over15: [] };  
  

  const dataTime = [
    { status: "FinishRepair", data: { ...emptyData }, hide: user.user.role === "fd" || user.user.role === "admin" ? false : true },
    { status: "NEW_POPDoc", data: { ...emptyData }, hide: user.user.role === "ps" || user.user.role === "fd" || user.user.role === "admin" ? false : true },
    { status: "NEW_AssignPS", data: { ...emptyData }, hide: user.user.role === "ps" || user.user.role === "admin" ? false : true },
    { status: "NEW_AssignCE", data: { ...emptyData }, hide: user.user.role === "ce" || user.user.role === "admin" ? false : true},
    { status: "NEW_AssignLeader", data: { ...emptyData }, hide: user.user.role === "celead" || user.user.role === "admin" ? false : true},
    { status: "Pending_Quote", data: { ...emptyData }, hide: user.user.role === "cm" || user.user.role === "admin" ? false : true},
    { status: "Quote_Requested", data: { ...emptyData }, hide: user.user.role === "cm" || user.user.role === "admin" ? false : true},
    { status: "Escalated", data: { ...emptyData }, hide: user.user.role === "ce" || user.user.role === "celead" || user.user.role === "admin" ? false : true},
    { status: "RepairProgress", data: { ...emptyData }, hide: user.user.role === "ce" || user.user.role === "celead" || user.user.role === "admin" ? false : true},
    { status: "PartAvailable", data: { ...emptyData }, hide: user.user.role === "ce" || user.user.role === "celead" || user.user.role === "admin" ? false : true},
    { status: "PartRequest", data: { ...emptyData }, hide: user.user.role === "apo"  || user.user.role === "admin" ? false : true},
    { status: "Quote_Approved", data: { ...emptyData }, hide: user.user.role === "apo"  || user.user.role === "admin" ? false : true},
    { status: "PartRequestLog", data: { ...emptyData }, hide: user.user.role === "lg" ||  user.user.role === "admin" ? false : true},
    { status: "PartOrder", data: { ...emptyData }, hide: user.user.role === "lg" ||  user.user.role === "admin" ? false : true},
    { status: "Close", data: { ...emptyData }, hide: filterClose }
  ];


  const getDaysAgo = (val) => {
    const date = val ? (val instanceof Date ? val : new Date(val)) : null;
    if (!date || isNaN(date)) return Infinity;
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  };
  let groupedDataTime = [];

  if (caseData) {
    groupedDataTime = dataTime.map((t) => {
      const filt = caseData.filter((data) => {
        const dataStatus = data.CaseStatus
        return (
          dataStatus === t.status
        )
      }
      );

      const groupedCases = {
        within4: [],
        within8: [],
        within15: [],
        over15: [],
      };

      filt.forEach((c) => {
        const days = getDaysAgo(c.UpdateOn);
        if (days < 4) groupedCases.within4.push(c);
        else if (days < 8) groupedCases.within8.push(c);
        else if (days < 15) groupedCases.within15.push(c);
        else groupedCases.over15.push(c);
      });

      t.data = groupedCases;
      return t;
    });
  }

  const finishedCases = caseData.filter(c => c.CaseStatus === "FinishRepair");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  // if the window width size more than 2400px set page size to 12
  const totalPages = Math.ceil(filteredCases.length / pageSize);
  const MAX_PAGES_SHOWN = 3;
  const getPaginationPages = () => {
    if (totalPages <= MAX_PAGES_SHOWN) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 2) {
      return [1, 2, 3];
    }
    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 1, currentPage, currentPage + 1];
  };
  const paginationPages = getPaginationPages();
  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const allowedRoles = ["fd", "admin"];
  const navigate = useNavigate();

  const warrantyBadge = (caseinfo) => {
    
    const condition = caseinfo?.OTCCode ? 
    caseinfo.otcCodeTable?.WarrantyCondition :
    caseinfo.asset_information?.WarrantyOTCCode?.WarrantyCondition

    const statusMap = {
      InWarranty: { label: "IW", color: "bg-green-500" },
      OutWarranty: { label: "OOW", color: "bg-red-500"}
    }

    const { label, color } = statusMap[condition] || { label: "?", color: "bg-gray-500" }

    return <Badge className={`${color} text-[10px]`}>{label}</Badge>
  }

  // Reset to page 1 when filters or page size changes
  useEffect(() => { setCurrentPage(1); }, [filters, filterClose, filterFinish, pageSize]);
  const  isLarge  = useMediaQuery({query: '(max-width: 1024px)'})
  return (
    <>
      <SidebarProvider defaultOpen className={"h-full dark:bg-gradient-to-t  dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1% min-h-0"} id='your-case'>
        <SidebarInset className={"dark:bg-gradient-to-t dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%"}>
          <div className="flex flex-col w-full ">
            <div className="sticky top-13 dark:bg-transparent bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className=" flex h-14 w-full items-center gap-3 px-4  place-content-between ">
                {isToggleUser &&
                <div className="flex gap-2 items-center bg-secondary px-3 py-2 rounded-md dark:bg-gradient-to-t dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%" id='case-toggle'>
                  <Switch
                    checked={filterClose === false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterClose(true); // Turn off filterFinish if filterClose is unchecked
                      }
                      setFilterClose(checked ? false : true);
                    }}
                    className=" hover:bg-blue-500 hover:ring-1 hover:ring-blue-500 dark:bg-gradient-to-t dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%"
                    id="Close"
                  />
                  <Label htmlFor="Close" className={"font-[700]"}>
                    Show Status Extras
                  </Label>
                  <Switch
                    checked={filterFinish === false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterClose(true); // Turn off filterFinish if filterClose is unchecked
                      }
                      setFilterFinish(checked ? false : true);
                    }}
                    className=" hover:bg-blue-500 hover:ring-1 hover:ring-blue-500 dark:bg-gradient-to-t dark:from-slate-800 dark:via-slate-600 dark:to-slate-800 dark:to-70% dark:via-6% dark:from-1%"
                    id="Finish"
                  /> 
                  <Label htmlFor="Finish" className={"font-[700]"} >
                    Show Finished Case
                  </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchnew}
              disabled={renderer}
              className="gap-1.5"
            >
              <RefreshCw className={renderer ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Refresh
            </Button>
                </div>
                }
                <h1 className="lg:text-xl md:text-md font-semibold tracking-tight text-sm">
                  Case For You
                </h1>
                <SidebarTrigger icon={PanelRight} />
              </div>
            </div>

            <div className="space-y-3 p-5" >
              {renderer ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="flex-col lg:flex-row p-4 shadow-sm dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 w-(screen-64)  dark:border-b-slate-600">
                    <div className='space-y-2'>
                    <Skeleton className="h-6 w-70 lg:w-122" />
                    <Skeleton className="h-6 w-70 lg:w-122" />
                    </div>
                    <div className="flex flex-col items-center gap-2 align-middle" id='case-badge'>  
                        <div className="space-x-2 justify-center inline-flex">
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-6 w-10" />
                        </div>
                    <Skeleton className="h-6 w-20" />
                    </div>
                  </Card>
                ))
              ) : (
                currentPageData.map((c) => (
                  <Link to={`/app/case/${c.CaseID}`}
                    key={c.CaseID}
                  >
                  <Card
                    className={cn("flex-col lg:flex-row justify-between items-center p-4 shadow-md hover:shadow-md hover:border-amber-200 transition cursor-pointer border-l-4 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 w-(screen-64)  dark:border-b-slate-600 dark:hover:border-purple-700 mt-3 gap-1",
                      c.CaseStatus === "FinishRepair" ? "border-green-300 dark:border-green-600 bg-gradient-to-r from-white via-emerald-100 to-emerald-300 " : 
                      (c.CaseStatus === "Close" || c.CaseStatus === "Cancel") ? "border-red-300 bg-fuchsia-100 dark:border-red-600" :
                        c?.caseinformation.Owner !== user.user.id ? "border-blue-300 dark:border-blue-600" : 'dark:border-slate-600'
                    )}
                  id='case-card'
                  >
                    <div>
                      <p className="font-semibold">#{c.CaseID} - {c.ProductName}</p>
                      <p className="text-sm text-gray-500">{c.SerialNumber} | {c.Primary} | {c.CustomerAccount || "No Company"} | {c.CreatedOn}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 align-middle" id='case-badge'>  
                        <div className="space-x-2 justify-center inline-flex">
                          {warrantyBadge(c.caseinformation)}
                          <Badge className="bg-cyan-600 text-[10px]">
                            {STATUS_ENUM_TO_LABEL[c.CaseStatus]}
                          </Badge>
                          <Badge>{c.caseinformation.CaseType}</Badge>
                           {!isLarge &&
                          (c?.caseinformation.Owner === user.user.id ? (
                            <Badge className="bg-purple-500 text-[10px]">Owner</Badge>
                          ) : (
                            <Badge className="bg-sky-500 text-[10px]">CreatedBy</Badge>
                          ))
                           }
                        </div>
                        {c.EstimedTimeFromUpdate}
                    </div>
                  </Card>
                  </Link>
                ))
              )
            }
              <Pagination className="flex justify-center items-center flex-col lg:flex-row " id='case-pagination'>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      placeholder="First"
                      href="#"
                      className={"dark:hover:bg-slate-800"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(1);
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={"dark:hover:bg-slate-800"}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                    />
                  </PaginationItem>

                  {paginationPages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        className={"dark:hover:bg-slate-800"}
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      className={"dark:hover:bg-slate-800"}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      placeholder='Last'
                      className={"dark:hover:bg-slate-800"}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(totalPages);
                      }}
                    />
                  </PaginationItem>
		
                </PaginationContent>
                  <div className="flex gap-3 p-1 items-center">
                    Total Page
                    <span className='border-2 p-1 rounded-md shadow-2xl dark:border-slate-500 text-center'>
                      {totalPages} For {caseData.length} Cases
                    </span>
                  </div>
                <div className="flex items-center ml-4 gap-2">
                  <span className="text-sm">Page Size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border rounded-md p-1 dark:bg-slate-800"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </Pagination>
              {error ? <h1 className="text-center text-destructive dark:text-red-500">Something went wrong</h1> : ""}
            </div>
          </div>
        </SidebarInset>
        <SearchBar
          filters={filters}
          // setFilters={setFilters}
          setFilters={(updater) => {
          // Support both direct object and functional updater from SearchBar
          if (typeof updater === "function") {
            setFilters(updater);
          } else {
            // SearchBar's handleChange calls setFilters({...prev, [field]: value})
            // but we need to intercept RangeTime. Route through handleFilterChange.
            setFilters(updater);
          }
        }}
        onFilterChange={handleFilterChange}
          caseData={caseData}
          filterClose={filterClose}
          dataTime={dataTime}
        />
      </SidebarProvider>
    </>
  );
  
}


