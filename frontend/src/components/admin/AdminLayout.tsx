import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Sprout } from "lucide-react";
import { AdminSidebar } from "./AdminSideBar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#2d4029] flex flex-col lg:flex-row antialiased selection:bg-[#e2ebe0] selection:text-[#2d4029]">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-40">
        <AdminSidebar />
      </aside>

      {/* Mobile Top Header Bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white/90 backdrop-blur-md border-b border-[#e5dfd3]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#e2ebe0] border border-[#c3d6c0] flex items-center justify-center text-[#4c6a46]">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-sm tracking-tight text-[#2d4029]">
            Control Panel
          </span>
        </div>

        {/* Mobile Drawer Toggle */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="h-9 w-9 flex items-center justify-center text-stone-500 hover:text-[#2d4029] hover:bg-[#f4efe6] rounded-xl transition-colors">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Toggle Admin Navigation</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 bg-white border-r border-[#e5dfd3] text-[#2d4029]"
          >
            <SheetTitle className="sr-only">Admin Navigation Drawer</SheetTitle>
            <AdminSidebar onNavItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
