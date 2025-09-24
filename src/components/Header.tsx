import { Button } from "@/components/ui/button";
import { Users, Target } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onManageTeam: () => void;
}

export function Header({ onManageTeam }: HeaderProps) {
  return (
    <header className="bg-card border-b border-default py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team Priority Tracker</h1>
              <p className="text-sm text-muted-foreground">Manage and prioritize team tasks</p>
            </div>
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
