"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { CheckCircle, Package, MessageCircle, Home } from "lucide-react"

export default function OrderSuccessPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const orderNumber = `AST${Date.now().toString().slice(-6)}`

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-600">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-2">Thank you for your order. Your spiritual journey continues!</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium">Order Number</p>
              <p className="text-lg font-bold text-purple-600">{orderNumber}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium">Expected Delivery</p>
                <p className="text-xs text-muted-foreground">3-5 business days</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <p className="text-sm font-medium">Order Updates</p>
                <p className="text-xs text-muted-foreground">We'll send updates via email</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/chat" className="block">
              <Button className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Continue Chatting with Guruji
              </Button>
            </Link>

            <Link href="/store" className="block">
              <Button variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>

            <Link href="/chat" className="block">
              <Button variant="ghost" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Need help? Contact our support team or chat with our astrologers.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
