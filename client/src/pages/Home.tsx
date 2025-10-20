import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { BarChart3, Zap, TrendingUp, AlertCircle } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const campaignsQuery = trpc.campaign.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const alertsQuery = trpc.alert.getUnread.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
              <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              Marketing Automation with <span className="text-blue-400">Predictive Analytics</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Optimize your campaigns with AI-powered predictions. Get real-time insights, smart recommendations, and automated optimizations to maximize your ROI.
            </p>
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <a href={getLoginUrl()}>Get Started Free</a>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-blue-400 mb-4" />
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  AI-powered predictions for campaign performance, optimal timing, and audience segmentation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-400 mb-4" />
                <CardTitle>Smart Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Get actionable recommendations to optimize headlines, budgets, and audience targeting.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-blue-400 mb-4" />
                <CardTitle>Real-time Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Monitor campaign performance with real-time metrics and instant alerts for anomalies.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to transform your marketing?</h3>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of marketers using PredictFlow AI to optimize their campaigns.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href={getLoginUrl()}>Start Your Free Trial</a>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user?.name || user?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {alertsQuery.data && alertsQuery.data.length > 0 && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">
                You have {alertsQuery.data.length} unread alert{alertsQuery.data.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-amber-800">Check your alerts for important campaign updates.</p>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{campaignsQuery.data?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {campaignsQuery.data?.filter((c) => c.status === "running").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Unread Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{alertsQuery.data?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsQuery.isLoading ? (
                <p className="text-slate-500">Loading campaigns...</p>
              ) : campaignsQuery.data && campaignsQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {campaignsQuery.data.slice(0, 5).map((campaign) => (
                    <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                      <a className="block p-3 rounded-lg hover:bg-slate-50 border border-slate-200 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                            <p className="text-sm text-slate-600">{campaign.campaignType}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {campaign.status}
                          </span>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-4">No campaigns yet</p>
                  <Button asChild size="sm">
                    <Link href="/campaigns">Create Your First Campaign</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Navigate to key features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/campaigns">
                  <a>Manage Campaigns</a>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/integrations">
                  <a>Connect Integrations</a>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/analytics">
                  <a>View Analytics</a>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/recommendations">
                  <a>AI Recommendations</a>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

