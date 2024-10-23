import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Menu,
  Search,
  ShoppingCart,
  CircleUserRound,
  LogOut,
  Settings,
  Heart,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import AnnouncementBanner from "@/components/dynamic-ui/AnnouncementBanner";
import SearchPopup from "./SearchPopup";
import { useHeaderContext } from "@/context/HeaderContext";
import DynamicDropdownMenu from "@/components/dynamic-ui/DropDownMenu";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const useOS = () => {
  const [os, setOS] = useState("loading");

  useEffect(() => {
    const detectOS = () => {
      if (window) {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.includes("mac")) {
          setOS("mac");
        } else if (userAgent.includes("win")) {
          setOS("windows");
        } else {
          setOS("other");
        }
      }
    };

    detectOS();
  }, []);

  return os;
};

const SearchField = ({ onClick }: { onClick: () => void }) => {
  const os = useOS();

  return (
    <button className="flex items-center" onClick={onClick}>
      <Search strokeWidth={1.5} className="mr-6 lg:mr-3 w-5 h-5" />
      {os === "loading" ? (
        <span className="text-xs pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          ...
        </span>
      ) : (
        <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">{os === "mac" ? "⌘" : "ctrl"}</span>K
        </kbd>
      )}
    </button>
  );
};

const navigation = [
  { name: "Store", href: "/store" },
  { name: "Categories", href: "#" },
  { name: "Company", href: "#" },
];

const Header = ({ setMobileMenuOpen }: any) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true); // New state for checking top position
  const { searchFieldVisible, setSearchFieldVisible } = useHeaderContext();

  useEffect(() => {
    const controlHeader = () => {
      setIsAtTop(window.scrollY === 0); // Check if at the top
      if (window.scrollY < lastScrollY || window.scrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchFieldVisible(!searchFieldVisible);
      } else if (event.key === "Escape") {
        setSearchFieldVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchFieldVisible, setSearchFieldVisible]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isVisible
            ? isAtTop
              ? "bg-transparent backdrop-blur-none"
              : "bg-white/50 backdrop-blur-lg"
            : "-translate-y-full bg-transparent"
        }`}
      >
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">KOTEK</span>
              <Image
                alt="logo"
                src="/kotek.png"
                className="h-6 w-auto"
                width={200}
                height={100}
              />
            </a>
          </div>
          <div className="flex lg:hidden items-center">
            <SearchField onClick={() => setSearchFieldVisible(true)} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center rounded-md p-2.5"
            >
              <span className="sr-only">Open main menu</span>
              <Menu aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <div className="hidden lg:flex flex-grow justify-center gap-20">
            <div className="hidden lg:flex justify-center">
              <AnnouncementBanner
                message="Discover our sale for this week."
                link="#"
                linkText="Go Now"
              />
            </div>
            <div className="hidden lg:flex lg:gap-x-6 items-center">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold"
                >
                  {item.name}
                </a>
              ))}
              <SearchField onClick={() => setSearchFieldVisible(true)} />
            </div>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-12 lg:border-l lg:border-slate-900/15 pl-5">
            <a href="/cart">
              <ShoppingCart strokeWidth={1.5} className="w-5 h-5" />
            </a>
            <AccountDropDown />
          </div>
        </nav>
      </header>

      <SearchPopup
        open={searchFieldVisible}
        onOpenChange={setSearchFieldVisible}
      />
    </>
  );
};

export default Header;
function AccountDropDown() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      setUserImage("");
    },
  });
  const [userImage, setUserImage] = useState<string | null>(null);

  // Options for logged-out users
  const items = [
    {
      label: "Log in",
      onClick: () => router.push("/login"),
      icon: <LogIn strokeWidth={1.5} />,
    },
    {
      label: "Register",
      onClick: () => router.push("/login?create=true"),
      icon: <UserPlus strokeWidth={1.5} />,
    },
  ];

  // Options for logged-in users with icons
  const authItems = [
    {
      label: "Profile",
      onClick: () => router.push("/profile"),
      icon: <User />,
    },
    {
      label: "My Orders",
      onClick: () => router.push("/orders"),
      icon: <ShoppingCart />,
    },
    {
      label: "Settings",
      onClick: () => router.push("/settings"),
      icon: <Settings />,
    },
    { label: "Log Out", onClick: () => signOut(), icon: <LogOut /> },
  ];

  // Add "Dashboard" for ADMIN role
  if (status === "authenticated" && session?.user?.role === "ADMIN") {
    authItems.unshift({
      label: "Dashboard",
      onClick: () => router.push("/admin/dashboard"),
      icon: <LayoutDashboard strokeWidth={1.5} />,
    });
  }

  // Items to display based on authentication status
  const itemsToDisplay = status === "authenticated" ? authItems : items;

  // Load image from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedImage = localStorage.getItem("userImage");
      if (storedImage) {
        setUserImage(storedImage); // Set from storage
      }
    }
  }, []);

  // Update user image only if it changes or user logs in/out
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (status === "authenticated" && session?.user?.image) {
        setUserImage(session.user.image);
      }
    }
  }, [session, status]);

  return (
    <DynamicDropdownMenu
      label="Account"
      items={itemsToDisplay}
      image={userImage || undefined} // Pass the image if available
    />
  );
}
