"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Star } from "lucide-react"
import type { Product } from "@/lib/store"

interface ProductSuggestionCardProps {
  product: Product
  onViewDetails: (productId: string) => void
  onBuyNow: (product: Product) => void
}

export default function ProductSuggestionCard({ product, onViewDetails, onBuyNow }: ProductSuggestionCardProps) {
  return (
    <Card className="w-full max-w-xs mx-auto bg-card text-card-foreground border border-purple-300 dark:border-purple-700 shadow-lg">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="aspect-square overflow-hidden rounded-md mb-2">
          <img src={product.image || "/product.png"} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-green-600">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails(product.id)}>
          🔍 View Details
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onBuyNow(product)}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Buy Now
        </Button>
      </CardFooter>
    </Card>
  )
}
