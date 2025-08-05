import React from 'react';
import { Link } from 'wouter';
import { Category } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.id}`}>
      <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 mb-2 flex items-center justify-center">
            <span className="text-4xl">{category.icon}</span>
          </div>
          <h3 className="font-medium text-lg">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}