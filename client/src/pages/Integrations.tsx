import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Integrations() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    platform: "google_analytics",
    name: "",
    accessToken: "",
    accountId: "",
  });

  const integrationsQuery = trpc.integration.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createIntegrationMutation = trpc.integration.create.useMutation({
    onSuccess: () => {
      integrationsQuery.refetch();
      setOpen(false);
      setFormData({
        platform: "google_analytics",
        name: "",
        accessToken: "",
        accountId: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Please enter an integration name");
      return;
    }

    createIntegrationMutation.mutate({
      platform: formData.platform as any,
      name: formData.name,
      accessToken: formData.accessToken || undefined,
      accountId: formData.accountId || undefined,
    });
  };

  if (!isAuthenticated) {
    return <div className="p-8">Please log in to view integrations.</div>;
  }

  const platformNames: Record<string, string> = {
    google_analytics: "Google Analytics",
    facebook_ads: "Facebook Ads",
    mailchimp: "Mailchimp",
    hubspot: "HubSpot",
    manual_upload: "Manual Upload",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Connect Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect New Integration</DialogTitle>
                <DialogDescription>
                  Connect your marketing platforms to start collecting data and generating predictions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_analytics">Google Analytics</SelectItem>
                      <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="hubspot">HubSpot</SelectItem>
                      <SelectItem value="manual_upload">Manual Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Integration Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Email Account"
                  />
                </div>

                <div>
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="Your API token or access key"
                  />
                </div>

                <div>
                  <Label htmlFor="accountId">Account ID</Label>
                  <Input
                    id="accountId"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    placeholder="Your account or property ID"
                  />
                </div>

                <Button type="submit" disabled={createIntegrationMutation.isPending} className="w-full">
                  {createIntegrationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Connect Integration
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {integrationsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : integrationsQuery.data && integrationsQuery.data.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {integrationsQuery.data.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{integration.name}</CardTitle>
                      <CardDescription>{platformNames[integration.platform] || integration.platform}</CardDescription>
                    </div>
                    {integration.isActive ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {integration.accountId && (
                      <div>
                        <p className="text-slate-600">Account ID</p>
                        <p className="font-mono text-slate-900">{integration.accountId}</p>
                      </div>
                    )}
                    {integration.lastSyncedAt && (
                      <div>
                        <p className="text-slate-600">Last Synced</p>
                        <p className="text-slate-900">{new Date(integration.lastSyncedAt).toLocaleString()}</p>
                      </div>
                    )}
                    <div className="pt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        {integration.isActive ? "Disconnect" : "Reconnect"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-slate-500 mb-4">No integrations connected yet</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Your First Integration
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect New Integration</DialogTitle>
                    <DialogDescription>
                      Connect your marketing platforms to start collecting data and generating predictions.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="platform">Platform *</Label>
                      <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google_analytics">Google Analytics</SelectItem>
                          <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                          <SelectItem value="mailchimp">Mailchimp</SelectItem>
                          <SelectItem value="hubspot">HubSpot</SelectItem>
                          <SelectItem value="manual_upload">Manual Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="name">Integration Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Main Email Account"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accessToken">Access Token</Label>
                      <Input
                        id="accessToken"
                        type="password"
                        value={formData.accessToken}
                        onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                        placeholder="Your API token or access key"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountId">Account ID</Label>
                      <Input
                        id="accountId"
                        value={formData.accountId}
                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                        placeholder="Your account or property ID"
                      />
                    </div>

                    <Button type="submit" disabled={createIntegrationMutation.isPending} className="w-full">
                      {createIntegrationMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Connect Integration
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

