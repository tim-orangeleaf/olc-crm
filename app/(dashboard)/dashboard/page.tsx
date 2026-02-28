import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Orangeleaf CRM</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your CRM dashboard will be built here in Phase 3. Sign-in with
            Microsoft SSO is active.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
