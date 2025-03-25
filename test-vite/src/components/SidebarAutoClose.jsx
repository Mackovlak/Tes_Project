import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

function SidebarAutoClose() {
  const location = useLocation();
  const { setOpen } = useSidebar();

  useEffect(() => {
    if (location.pathname.includes("/case/:caseID")) {
      setOpen(false); // Auto-close sidebar on specific routes
    }
  }, [location, setOpen]);

  return null;
}

export default SidebarAutoClose;
