import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        General Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Account settings will be available in Phase 6.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
