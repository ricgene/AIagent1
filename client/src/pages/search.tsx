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
import { useLocation } from "wouter";
import { MessageSquare } from "lucide-react";
import type { Business } from "@shared/schema";

export default function Search() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: businesses = [], isLoading } = useQuery<Business[]>({
    queryKey: ["/api/businesses/search", query],
    enabled: query.length > 0,
  });

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Find Businesses</CardTitle>
          <CardDescription>
            Discover businesses that match your needs using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="mt-8 space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Searching...
              </div>
            ) : businesses.length > 0 ? (
              businesses.map((business) => (
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
              ))
            ) : query.length > 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No businesses found
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
