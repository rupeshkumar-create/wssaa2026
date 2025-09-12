"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_TREE, getAllSubcategories } from "@/lib/categories";
import { Category } from "@/lib/constants";

interface Step3CategoryProps {
  selectedCategory: Category | null;
  onNext: (category: Category) => void;
  onBack: () => void;
}

export function Step3Category({ selectedCategory, onNext, onBack }: Step3CategoryProps) {
  const [selected, setSelected] = useState<Category | null>(selectedCategory);

  const handleNext = () => {
    if (selected) {
      onNext(selected);
    }
  };

  const allSubcategories = getAllSubcategories();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Select Award Category</CardTitle>
        <CardDescription>
          Choose the category that best fits your nomination
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Award Category *</Label>
          <Select value={selected || ""} onValueChange={(value) => setSelected(value as Category)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_TREE.map((group) => (
                <div key={group.id}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                    {group.label}
                  </div>
                  {group.subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      <div className="flex items-center gap-2">
                        <span>{subcategory.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {subcategory.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Categories Include:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {CATEGORY_TREE.map((group) => (
              <div key={group.id}>
                <span className="font-medium text-foreground">{group.label}:</span>
                <span className="text-muted-foreground ml-1">
                  {group.subcategories.map(sub => sub.label).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack} className="rounded-full">
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!selected}
            className="rounded-full"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}