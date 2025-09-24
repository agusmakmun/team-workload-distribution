import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onManageTeam: () => void;
}

export function Header({ onManageTeam }: HeaderProps) {
  return (
    <header className="bg-card border-b border-default py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Priority Tracker</h1>
            <p className="text-sm text-muted">Manage and prioritize team tasks</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={onManageTeam}>
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
