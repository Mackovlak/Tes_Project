import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Input } from './components/ui/input'
import {
  Loader2,
  Search,
  Sheet
} from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router'
import Lorem from './pages/Lorem'
import ApiCustomer from './api'
import {Outlet} from "react-router"
import debounce from 'lodash.debounce';
import { SheetProvider } from './context/sheet-context'
import { Toaster } from 'sonner'
import { GlobalLogListener } from './components/GlobalLogListener'
import { SocketInitializer } from './components/SocketInitializer'
import { ThemeProvider } from './context/theme-context'
import { ThemeToggle } from './components/ThemeToggle'
import { ButtonTour } from './components/driver-tour'
import { useMediaQuery } from 'react-responsive'
import { NotifBar } from './components/app-notification'
import { TicketsBar } from './components/app-ticketList'

export function Breadcrumbs({ location }) {
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="text-[10px] w-full sm:text-sm overflow-hidden whitespace-nowrap text-ellipsis" id='breadcrumbs'>
      <Link to="/" className="text-gray-700 font-medium dark:text-gray-300">Home</Link>
      {pathnames.map((segment, index) => {
        const to = '/' + pathnames.slice(0, index + 1).join('/');
        return (
          <span key={to}>
            {' / '}
            <Link to={to} className="text-sky-100 capitalize">{decodeURIComponent(segment)}</Link>
          </span>
        );
      })}
    </nav>
  );
}

export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false)
  const fetchResults = async (q) => {
    if (!q) {
      setResults(null);
      return;
    }

    try {
    setLoading(true);
      const response = await ApiCustomer.get(`/api/global-search?query=${encodeURIComponent(q)}`);
      const data = response.data;
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search call
  const debouncedFetch = useRef(debounce(fetchResults, 300)).current;

  useEffect(() => {
    debouncedFetch(query);
    if (!query) {
      setResults(null);
      setShowResults(false);
    }
  }, [query, debouncedFetch]);

  // Hide results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div ref={containerRef} className="relative" id='global-search'>
      <span className='flex items-center gap-2'> 
        <Input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border bg-white/50 dark:bg-slate-700/40 dark:text-slate-100 dark:border-slate-500 dark:placeholder:text-slate-300 "
        />
        {loading ? <Loader2 className=' animate-spin'></Loader2> : ""}
      </span>
      {showResults && results && (
        <div className="absolute bg-white shadow rounded-md p-2 z-50 w-full overflow-scroll max-h-52 mt-1 text-sm dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-600">
          <div>
            <strong>Cases</strong>
            {results.cases.map(c => (
              <Link key={c.CaseID} to={`/app/case/${c.CaseID}`} className="block hover:underline">
                {c.CaseID} - {c.site_account?.Company}
              </Link>
            ))}
          </div>
          <div>
            <strong>Work Orders</strong>
            {results.workOrders.map(wo => (
              <Link key={wo.WOID} to={`/app/work/${wo.WOID}`} className="block hover:underline">
                {wo.WOID}
              </Link>
            ))}
          </div>
          <div>
            <strong>Material Orders</strong>
            {results.materialOrders.map(mo => (
              <Link key={mo.MOID} to={`/app/material_order/${mo.MOID}`} className="block hover:underline">
                {mo.MOID}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const App = () => {

  const location = useLocation();
  console.log("Check path",location)
  const  isLarge  = useMediaQuery({query: '(max-width: 1024px)'})
  return (
    <ThemeProvider defaultTheme="light" storageKey="my-app-theme">
      <div>
        <SheetProvider>
          <SidebarProvider
            style={{
              "--sidebar-width": "15rem",
              "--sidebar-width-mobile": "20rem",    
            }}
          >
            <AppSidebar id='sidebar'/>
            <SidebarInset className={"w-full"} >
              <header className="  flex sticky top-0 z-10 items-center justify-between px-4 gap-0 bg-gradient-to-r from-hp-50 via-hp-100 to-hp-300 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 w-(screen-64)  dark:border-b-slate-600 transition-all">
                <div className="flex items-center gap-4 p-4">
                  <SidebarTrigger className="-ml-1" id='icsidebar'/>
                 { !isLarge && <Breadcrumbs location={location}/> }
                </div>
                <div className="flex p-2 items-center gap-2 self-center">
                  <GlobalSearchBar />
                </div>
                <div className="flex items-center gap-1 pr-2  " id='three-button'>
                  {/* tombol light/dark */}
                  <ButtonTour/>
                  <ThemeToggle />
                  <NotifBar/>
                  { location.pathname === "/app/searchcaseproto2" &&
                  ( <TicketsBar/> )
                  }
                </div>
              </header>

              <Outlet />
            </SidebarInset>
          </SidebarProvider>
        </SheetProvider>
        <GlobalLogListener />
        <SocketInitializer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
};


export default App
