import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useLocation } from "wouter";
import { MessageSquare, Sparkles } from "lucide-react";
import type { Business } from "@shared/schema";

export default function Search() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: businesses = [], isLoading } = useQuery<Business[]>({
    queryKey: ["/api/businesses/search", query],
    enabled: query.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Force a refetch when the form is submitted
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Find Businesses</CardTitle>
          <CardDescription>
            Our AI matches your needs with the right business capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Describe what you need... (e.g., 'need AC repair')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>

          <div className="mt-8 space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="animate-pulse h-6 w-6 mx-auto mb-2" />
                AI is analyzing your request...
              </div>
            ) : businesses.length > 0 ? (
              <>
                <Alert className="bg-primary/5 mb-4">
                  <AlertDescription className="text-sm">
                    Found {businesses.length} businesses that can help with your request
                  </AlertDescription>
                </Alert>
                {businesses.map((business) => (
                  <Card key={business.id}>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {business.category}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {business.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>📍 {business.location}</span>
                        <span>•</span>
                        <span>{business.services.join(", ")}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="secondary"
                        className="ml-auto"
                        onClick={() => setLocation(`/messages/${business.userId}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            ) : query.length > 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No businesses found matching your needs
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}