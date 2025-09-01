import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Shield, Smartphone, Bot, PieChart } from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-app-title">
              {t("app.title")}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="/api/login"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="link-sign-in"
            >
              {t("auth.signIn")}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6" data-testid="text-hero-title">
            {t("app.title")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            {t("app.subtitle")}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a 
              href="/api/login"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg hover:bg-primary/90 transition-colors"
              data-testid="button-get-started"
            >
              Get Started
            </a>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 text-lg"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">Powerful Features</h3>
          <p className="text-lg text-muted-foreground">Everything you need to manage your finances effectively</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">AI-Powered Insights</h4>
              <p className="text-muted-foreground">Get intelligent financial advice and automatic expense categorization with our advanced AI assistant.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Smart Analytics</h4>
              <p className="text-muted-foreground">Visualize your spending patterns with interactive charts and detailed financial analytics.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PieChart className="w-8 h-8 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Budget Management</h4>
              <p className="text-muted-foreground">Create and track budgets with smart notifications and goal-setting features.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Secure & Private</h4>
              <p className="text-muted-foreground">Bank-level security with biometric authentication and encrypted data storage.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Multi-Platform</h4>
              <p className="text-muted-foreground">Access your finances anywhere with our responsive web app and mobile support.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-chart-2" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Multi-Currency</h4>
              <p className="text-muted-foreground">Support for multiple currencies with real-time conversion and international tracking.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">Ready to take control of your finances?</h3>
            <p className="text-lg text-muted-foreground mb-8">Join thousands of users who are already managing their money smarter with ExpenseJournal.</p>
            <a 
              href="/api/login"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg hover:bg-primary/90 transition-colors inline-block"
              data-testid="button-cta-signup"
            >
              Start Your Financial Journey
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">{t("app.title")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ExpenseJournal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
