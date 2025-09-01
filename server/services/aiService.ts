import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ExpenseAnalysis {
  suggestedCategory: string;
  confidence: number;
  tags: string[];
  insights: string;
}

export interface FinancialAdvice {
  advice: string;
  recommendations: string[];
  savingsOpportunities: string[];
  category: string;
}

export interface SpendingInsights {
  patterns: string[];
  warnings: string[];
  suggestions: string[];
  savingsPotential: number;
}

export class AIService {
  async analyzeExpense(description: string, amount: number, location?: string): Promise<ExpenseAnalysis> {
    try {
      const prompt = `Analyze this expense and provide categorization suggestions:
      
      Description: "${description}"
      Amount: $${amount}
      Location: ${location || "Not specified"}
      
      Please respond with JSON in this format:
      {
        "suggestedCategory": "category_name",
        "confidence": confidence_score_0_to_1,
        "tags": ["tag1", "tag2"],
        "insights": "brief_insight_about_expense"
      }
      
      Categories to choose from: food, transport, entertainment, shopping, utilities, healthcare, education, other`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a financial categorization expert. Analyze expenses and provide accurate categorization with insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        suggestedCategory: result.suggestedCategory || "other",
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        tags: result.tags || [],
        insights: result.insights || "No specific insights available.",
      };
    } catch (error) {
      console.error("AI expense analysis failed:", error);
      return {
        suggestedCategory: "other",
        confidence: 0,
        tags: [],
        insights: "Unable to analyze expense automatically.",
      };
    }
  }

  async getFinancialAdvice(userExpenses: any[], question: string): Promise<FinancialAdvice> {
    try {
      const expenseSummary = this.summarizeExpenses(userExpenses);
      
      const prompt = `Based on the user's spending data and their question, provide financial advice:
      
      User Question: "${question}"
      
      Spending Summary:
      ${expenseSummary}
      
      Please respond with JSON in this format:
      {
        "advice": "main_advice_response",
        "recommendations": ["recommendation1", "recommendation2"],
        "savingsOpportunities": ["opportunity1", "opportunity2"],
        "category": "advice_category"
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional financial advisor. Provide helpful, practical advice based on spending patterns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        advice: result.advice || "I'd be happy to help with your financial questions.",
        recommendations: result.recommendations || [],
        savingsOpportunities: result.savingsOpportunities || [],
        category: result.category || "general",
      };
    } catch (error) {
      console.error("AI financial advice failed:", error);
      return {
        advice: "I'm here to help with your financial questions. Please try asking again.",
        recommendations: [],
        savingsOpportunities: [],
        category: "general",
      };
    }
  }

  async generateSpendingInsights(userExpenses: any[]): Promise<SpendingInsights> {
    try {
      const expenseSummary = this.summarizeExpenses(userExpenses);
      
      const prompt = `Analyze the user's spending patterns and provide insights:
      
      ${expenseSummary}
      
      Please respond with JSON in this format:
      {
        "patterns": ["pattern1", "pattern2"],
        "warnings": ["warning1", "warning2"],
        "suggestions": ["suggestion1", "suggestion2"],
        "savingsPotential": estimated_monthly_savings_amount
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a financial analyst. Identify spending patterns and provide actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 600,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        patterns: result.patterns || [],
        warnings: result.warnings || [],
        suggestions: result.suggestions || [],
        savingsPotential: Number(result.savingsPotential || 0),
      };
    } catch (error) {
      console.error("AI spending insights failed:", error);
      return {
        patterns: [],
        warnings: [],
        suggestions: [],
        savingsPotential: 0,
      };
    }
  }

  private summarizeExpenses(expenses: any[]): string {
    const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
    
    const categoryTotals = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return `
      Total Monthly Income: $${totalIncome.toFixed(2)}
      Total Monthly Expenses: $${totalExpenses.toFixed(2)}
      Net: $${(totalIncome - totalExpenses).toFixed(2)}
      
      Top Spending Categories:
      ${topCategories.map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`).join('\n')}
      
      Number of Transactions: ${expenses.length}
    `;
  }
}

export const aiService = new AIService();
