import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Campaigns() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaignType: "email",
    integrationId: "",
    budget: "",
  });

  const campaignsQuery = trpc.campaign.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const integrationsQuery = trpc.integration.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCampaignMutation = trpc.campaign.create.useMutation({
    onSuccess: () => {
      campaignsQuery.refetch();
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        campaignType: "email",
        integrationId: "",
        budget: "",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.integrationId) {
      alert("Please fill in all required fields");
      return;
    }

    createCampaignMutation.mutate({
      name: formData.name,
      description: formData.description,
      campaignType: formData.campaignType as any,
      integrationId: formData.integrationId,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
    });
  };

  if (!isAuthenticated) {
    return <div className="p-8">Please log in to view campaigns.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new marketing campaign and connect it to your integrations.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Sale Campaign"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Campaign Type *</Label>
                  <Select value={formData.campaignType} onValueChange={(value) => setFormData({ ...formData, campaignType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="paid_ads">Paid Ads</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="integration">Integration *</Label>
                  <Select value={formData.integrationId} onValueChange={(value) => setFormData({ ...formData, integrationId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an integration" />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationsQuery.data?.map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          {integration.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <Button type="submit" disabled={createCampaignMutation.isPending} className="w-full">
                  {createCampaignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {campaignsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : campaignsQuery.data && campaignsQuery.data.length > 0 ? (
          <div className="grid gap-4">
            {campaignsQuery.data.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <a>
                  <Card className="hover:shadow-md transition cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{campaign.name}</CardTitle>
                          <CardDescription>{campaign.description || "No description"}</CardDescription>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {campaign.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Type</p>
                          <p className="font-semibold capitalize">{campaign.campaignType.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Budget</p>
                          <p className="font-semibold">${campaign.budget || "—"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Created</p>
                          <p className="font-semibold">{campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : "—"}</p>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-slate-500 mb-4">No campaigns yet</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Set up a new marketing campaign and connect it to your integrations.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Campaign Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Summer Sale Campaign"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Campaign Type *</Label>
                      <Select value={formData.campaignType} onValueChange={(value) => setFormData({ ...formData, campaignType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="paid_ads">Paid Ads</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="integration">Integration *</Label>
                      <Select value={formData.integrationId} onValueChange={(value) => setFormData({ ...formData, integrationId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an integration" />
                        </SelectTrigger>
                        <SelectContent>
                          {integrationsQuery.data?.map((integration) => (
                            <SelectItem key={integration.id} value={integration.id}>
                              {integration.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="budget">Budget (Optional)</Label>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <Button type="submit" disabled={createCampaignMutation.isPending} className="w-full">
                      {createCampaignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Campaign
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

