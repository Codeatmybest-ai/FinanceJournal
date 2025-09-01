import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { Plus, Moon, Sun, Bell, Menu } from "lucide-react";
import { useState } from "react";
import { ExpenseModal } from "./ExpenseModal";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const formatDate = () => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  };

  return (
    <>
      <header className="bg-card border-b border-border p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button 
                onClick={onMenuClick}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                data-testid="button-menu-toggle"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                {t("dashboard.title")}
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-current-date">
                {formatDate()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Quick Add Expense */}
            <button 
              onClick={() => setExpenseModalOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              data-testid="button-add-expense"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("expenses.addExpense")}</span>
            </button>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Notifications */}
            <button 
              className="p-2 hover:bg-muted rounded-lg transition-colors relative"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
                  data-testid="text-notification-count"
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <ExpenseModal 
        isOpen={expenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
      />
    </>
  );
}
