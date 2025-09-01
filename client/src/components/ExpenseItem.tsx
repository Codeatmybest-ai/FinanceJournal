import { Expense } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Trash2, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onDuplicate: (expense: Expense) => void;
  onClick?: (expense: Expense) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete, onDuplicate, onClick }: ExpenseItemProps) {
  const { t } = useLanguage();

  const formatAmount = (amount: string | number, type: string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const prefix = type === "expense" ? "-" : "+";
    return `${prefix}$${num.toFixed(2)}`;
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  const getMoodEmoji = (mood: string | null) => {
    const moods: Record<string, string> = {
      satisfied: "😊",
      neutral: "😐",
      regret: "😔",
      excited: "🎉",
    };
    return mood ? moods[mood] || "😐" : "";
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: "fas fa-utensils",
      transport: "fas fa-car",
      entertainment: "fas fa-film",
      shopping: "fas fa-shopping-bag",
      utilities: "fas fa-home",
      healthcare: "fas fa-heartbeat",
      education: "fas fa-graduation-cap",
      other: "fas fa-question",
    };
    return icons[category] || "fas fa-receipt";
  };

  return (
    <div 
      className="expense-item flex items-center justify-between p-6 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-b-0"
      onClick={() => onClick?.(expense)}
      data-testid={`expense-item-${expense.id}`}
    >
      <div className="flex items-center space-x-4">
        {/* Receipt/Icon */}
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {expense.receiptUrl ? (
            <img 
              src={expense.receiptUrl} 
              alt="Receipt" 
              className="w-full h-full object-cover"
              data-testid={`img-receipt-${expense.id}`}
            />
          ) : (
            <i className={cn(getCategoryIcon(expense.category), "text-2xl text-muted-foreground")} />
          )}
        </div>
        
        <div>
          <h4 className="font-semibold text-foreground" data-testid={`text-expense-description-${expense.id}`}>
            {expense.description}
          </h4>
          <p className="text-sm text-muted-foreground">
            <span data-testid={`text-expense-category-${expense.id}`}>
              {t(`categories.${expense.category}`)}
            </span> • 
            <span data-testid={`text-expense-date-${expense.id}`}>
              {formatDate(expense.date)}
            </span>
          </p>
          
          <div className="flex items-center space-x-4 mt-2">
            {expense.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground" data-testid={`text-expense-location-${expense.id}`}>
                  {expense.location}
                </span>
              </div>
            )}
            
            {expense.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-muted-foreground" data-testid={`text-expense-rating-${expense.id}`}>
                  {expense.rating}
                </span>
              </div>
            )}
            
            {expense.mood && (
              <div className="flex items-center space-x-1">
                <span className="text-sm" data-testid={`text-expense-mood-${expense.id}`}>
                  {getMoodEmoji(expense.mood)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p 
          className={cn(
            "font-bold text-lg",
            expense.type === "expense" ? "text-destructive" : "text-success"
          )}
          data-testid={`text-expense-amount-${expense.id}`}
        >
          {formatAmount(expense.amount, expense.type)}
        </p>
        
        <div className="flex items-center space-x-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(expense);
            }}
            data-testid={`button-edit-expense-${expense.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(expense);
            }}
            data-testid={`button-duplicate-expense-${expense.id}`}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(expense.id);
            }}
            className="hover:text-destructive"
            data-testid={`button-delete-expense-${expense.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
