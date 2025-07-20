import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavLink, Outlet } from "react-router-dom";

const NAV_MENS = [
  { to: "/", label: "Home" },
  { to: "/editor", label: "Editor" },
  { to: "/mention", label: "Mention" },
];

export function RootLayout() {
  return (
    <div>
      <ul className="flex space-x-1">
        {NAV_MENS.map((item) => (
          <li key={item.to}>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground aria-[current='page']:bg-accent aria-[current='page']:text-foreground"
            >
              <NavLink to={item.to}>{item.label}</NavLink>
            </Button>
          </li>
        ))}
      </ul>
      <Separator className="my-6" />
      <Outlet />
    </div>
  );
}
