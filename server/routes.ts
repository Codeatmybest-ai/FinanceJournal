import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/aiService";
import { currencyService } from "./services/currencyService";
import { insertExpenseSchema, insertBudgetSchema, insertGoalSchema, insertCategorySchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const user = await storage.updateUserPreferences(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Expense routes
  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseData = insertExpenseSchema.parse({ ...req.body, userId });
      
      // AI analysis for categorization if not provided
      if (!expenseData.category && expenseData.description) {
        const analysis = await aiService.analyzeExpense(
          expenseData.description,
          Number(expenseData.amount),
          expenseData.location
        );
        expenseData.category = analysis.suggestedCategory;
        expenseData.tags = analysis.tags;
      }
      
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const filters = req.query;
      
      // Convert date strings to Date objects
      if (filters.startDate) filters.startDate = new Date(filters.startDate);
      if (filters.endDate) filters.endDate = new Date(filters.endDate);
      if (filters.tags) filters.tags = filters.tags.split(',');
      
      const expenses = await storage.getExpenses(userId, filters);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const expense = await storage.getExpenseById(id, userId);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.patch('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updates = req.body;
      const expense = await storage.updateExpense(id, userId, updates);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.deleteExpense(id, userId);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // File upload route
  app.post('/api/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Dashboard analytics routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/category-breakdown', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const breakdown = await storage.getCategoryBreakdown(userId, start, end);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching category breakdown:", error);
      res.status(500).json({ message: "Failed to fetch category breakdown" });
    }
  });

  app.get('/api/dashboard/spending-trends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const months = parseInt(req.query.months as string) || 6;
      const trends = await storage.getSpendingTrends(userId, months);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching spending trends:", error);
      res.status(500).json({ message: "Failed to fetch spending trends" });
    }
  });

  // AI routes
  app.post('/api/ai/analyze-expense', isAuthenticated, async (req: any, res) => {
    try {
      const { description, amount, location } = req.body;
      const analysis = await aiService.analyzeExpense(description, amount, location);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing expense:", error);
      res.status(500).json({ message: "Failed to analyze expense" });
    }
  });

  app.post('/api/ai/financial-advice', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { question } = req.body;
      const userExpenses = await storage.getExpenses(userId);
      const advice = await aiService.getFinancialAdvice(userExpenses, question);
      res.json(advice);
    } catch (error) {
      console.error("Error getting financial advice:", error);
      res.status(500).json({ message: "Failed to get financial advice" });
    }
  });

  app.get('/api/ai/spending-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userExpenses = await storage.getExpenses(userId);
      const insights = await aiService.generateSpendingInsights(userExpenses);
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  // Currency routes
  app.get('/api/currencies', async (req, res) => {
    try {
      const currencies = currencyService.getSupportedCurrencies();
      res.json(currencies);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });

  app.post('/api/currencies/convert', isAuthenticated, async (req, res) => {
    try {
      const { amount, from, to } = req.body;
      const conversion = await currencyService.convert(amount, from, to);
      res.json(conversion);
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(500).json({ message: "Failed to convert currency" });
    }
  });

  // Budget routes
  app.post('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgetData = insertBudgetSchema.parse({ ...req.body, userId });
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.get('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgets = await storage.getBudgets(userId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  // Goal routes
  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertGoalSchema.parse({ ...req.body, userId });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Category routes
  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.markNotificationAsRead(id, userId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Data management routes
  app.delete('/api/user/data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAllUserData(userId);
      res.json({ message: "All user data deleted successfully" });
    } catch (error) {
      console.error("Error deleting user data:", error);
      res.status(500).json({ message: "Failed to delete user data" });
    }
  });

  app.get('/api/user/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exportData = await storage.exportUserData(userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="expense-data-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
