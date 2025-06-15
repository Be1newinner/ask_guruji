"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react" // Import useRef
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useChatStore, useAuthStore, useStoreState } from "@/lib/store"
import { useTranslation } from "@/lib/translations"
import { Send, Plus, LogOut, Settings, Moon, Sun, Mic, Stars, Menu, X, ShoppingBag } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import ProfileModal from "@/components/profile-modal"
import HoroscopeWidget from "@/components/horoscope-widget"
import LanguageSelector from "@/components/language-selector"
import { formatDistanceToNow } from "date-fns"
import ProductSuggestionCard from "./product-suggestion-card"

export default function ChatLayout() {
  const [input, setInput] = useState("")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  const { user, logout } = useAuthStore()
  const {
    currentThread,
    threads,
    isTyping,
    isDummyJourneyActive,
    dummyJourneyStep,
    createNewThread,
    setCurrentThread,
    addMessage,
    setIsTyping,
    startDummyJourney,
    advanceDummyJourney,
    resetDummyJourney,
  } = useChatStore()
  const { products } = useStoreState()

  const chakraProduct = products.find((p) => p.id === "chakra-bookmark")

  // State for typing animation
  const [typingContent, setTypingContent] = useState<string>("")
  const [typingAstrologer, setTypingAstrologer] = useState<string | null>(null)

  // Ref for auto-scrolling
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages or typing content changes
  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight
    }
  }, [currentThread?.messages, typingContent]) // Depend on typingContent to scroll during animation

  const handleViewProduct = () => {
    window.open(
      "https://www.shunyawellness.com/products/nadis-chakra-bookmark-stick?_pos=5&_sid=20a30b4b5&_ss=r&variant=44427286413356",
      "_blank",
    )
  }

  const handleSendMessage = async () => {
    if (!currentThread) return

    if (isDummyJourneyActive) {
      advanceDummyJourney()
      return
    }

    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")

    // Check if user wants to start dummy journey
    if (currentThread.messages.length === 0 && userMessage.toLowerCase().includes("start dummy journey")) {
      addMessage({ content: userMessage, sender: "user" })
      startDummyJourney()
      setTimeout(() => {
        handleDummyJourneyStep(0)
      }, 1000)
      return
    }

    // Regular chat flow
    addMessage({
      content: userMessage,
      sender: "user",
    })

    setIsTyping(true) // Show typing indicator
    setTypingContent("") // Clear previous typing content
    setTypingAstrologer(null) // Clear previous astrologer for typing

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()
      const fullResponseText = data.response
      const astrologerName = data.astrologer

      setTypingAstrologer(astrologerName) // Set astrologer name for typing indicator

      let i = 0
      const typingInterval = setInterval(() => {
        if (i < fullResponseText.length) {
          setTypingContent((prev) => prev + fullResponseText.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
          addMessage({
            content: fullResponseText,
            sender: "astrologer",
            astrologer: astrologerName,
          })
          setIsTyping(false) // Hide typing indicator
          setTypingContent("") // Clear typing content after full message is added
          setTypingAstrologer(null)
        }
      }, 30) // Adjust typing speed here (milliseconds per character)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from astrologer",
        variant: "destructive",
      })
      setIsTyping(false)
      setTypingContent("")
      setTypingAstrologer(null)
    }
  }

  const handleDummyJourneyStep = async (step: number) => {
    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate Guruji typing
    setTypingContent("") // Clear any previous typing content
    setTypingAstrologer(null) // Clear astrologer name for dummy journey


    let messageContent: string | React.ReactNode = ""
    const astrologerName: string | undefined = "गुरुजी राम शर्मा" // Default Guruji name for dummy journey

    switch (step) {
      case 0: // First user message
        messageContent = t("seeker_msg_1")
        addMessage({ content: messageContent, sender: "user" })
        setIsTyping(false) // Hide typing indicator after user message
        return // Don't advance dummy step here, wait for user click
      case 1: // Guruji's first response
        messageContent = t("guruji_msg_1")
        break
      case 2: // Second user message
        messageContent = t("seeker_msg_2")
        addMessage({ content: messageContent, sender: "user" })
        setIsTyping(false) // Hide typing indicator after user message
        return
      case 3: // Guruji's second response
        messageContent = t("guruji_msg_2")
        break
      case 4: // Third user message
        messageContent = t("seeker_msg_3")
        addMessage({ content: messageContent, sender: "user" })
        setIsTyping(false) // Hide typing indicator after user message
        return
      case 5: // Guruji's third response
        messageContent = t("guruji_msg_3")
        break
      case 6: // Fourth user message
        messageContent = t("seeker_msg_4")
        addMessage({ content: messageContent, sender: "user" })
        setIsTyping(false) // Hide typing indicator after user message
        return
      case 7: // Guruji's final response with product
        messageContent = t("guruji_msg_4")
        break
      case 8: // Show product card
        if (chakraProduct) {
          messageContent = (
            <ProductSuggestionCard product={chakraProduct} onViewProduct={handleViewProduct} showViewOnly={true} />
          )
        }
        break
      default:
        resetDummyJourney()
        setIsTyping(false)
        return
    }

    // For Guruji's messages in dummy journey, add them directly
    addMessage({
      content: messageContent,
      sender: "astrologer",
      astrologer: astrologerName,
    })
    setIsTyping(false) // Hide typing indicator after Guruji's message
    if (step === 8) {
      resetDummyJourney() // End dummy journey after product card
    }
  }

  useEffect(() => {
    if (isDummyJourneyActive && dummyJourneyStep > 0) {
      handleDummyJourneyStep(dummyJourneyStep)
    }
  }, [dummyJourneyStep, isDummyJourneyActive])

  const handleLogout = () => {
    logout()
    toast({
      title: t("Logged out"),
      description: "You have been successfully logged out.",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Left Sidebar */}
      <div
        className={`w-80 lg:w-80 md:w-72 sm:w-64 border-r bg-card flex flex-col fixed lg:relative z-40 h-full transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Profile Section */}
        <div className="p-4 border-b">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors"
            onClick={() => setIsProfileOpen(true)}
          >
            <Avatar>
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Horoscope Widget */}
        <div className="p-4 border-b">
          <HoroscopeWidget />
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("Chat History")}</h3>
              <Button size="sm" onClick={createNewThread}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2">
                {threads.map((thread) => (
                  <Card
                    key={thread.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      currentThread?.id === thread.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setCurrentThread(thread)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <Stars className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{thread.astrologer}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {thread.lastMessage || "New conversation"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {thread.timestamp instanceof Date
                              ? formatDistanceToNow(thread.timestamp, { addSuffix: true })
                              : formatDistanceToNow(new Date(thread.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              window.location.href = "/store"
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t("Astro Store")}
          </Button>
          <LanguageSelector />
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {theme === "dark" ? t("Light Mode") : t("Dark Mode")}
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t("Logout")}
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-0 ml-0">
        {/* Header */}
        <div className="border-b p-4 bg-card">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Stars className="h-6 w-6 text-purple-600" />
              <h1 className="text-xl font-serif tracking-wider">{t("AstroChats")}</h1>
              <Badge variant="secondary" className="text-xs">
                {t("by Asaan Hai Coding")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaViewportRef}>
          {currentThread ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentThread.messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[70%] ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      {message.sender === "user" ? (
                        <>
                          <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>🔮</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user" ? "bg-purple-600 text-white" : "bg-muted"
                      }`}
                    >
                      {message.sender === "astrologer" && message.astrologer && (
                        <p className="text-xs font-medium text-purple-600 mb-1">{message.astrologer}</p>
                      )}
                      {typeof message.content === "string" ? (
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      ) : (
                        message.content
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user" ? "text-purple-100" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp instanceof Date
                          ? formatDistanceToNow(message.timestamp, { addSuffix: true })
                          : formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing animation display */}
              {isTyping &&
                typingContent && ( // Only show if typing and content has started
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[70%]">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>🔮</AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-muted">
                        {typingAstrologer && (
                          <p className="text-xs font-medium text-purple-600 mb-1">{typingAstrologer}</p>
                        )}
                        <p className="text-sm whitespace-pre-line">{typingContent}</p>
                        <p className="text-xs mt-1 text-muted-foreground">Typing...</p>
                      </div>
                    </div>
                  </div>
                )}
              {isTyping &&
                !typingContent && ( // Show dots while waiting for first character
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[70%]">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>🔮</AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-muted">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">Typing...</p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Stars className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-serif mb-2">{t("Welcome to AstroChats")}</h2>
                <p className="text-muted-foreground mb-4">
                  {t("Start a new conversation to connect with our astrology experts")}
                </p>
                <Button onClick={createNewThread}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("Start New Chat")}
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Chat Input */}
        {currentThread && (
          <div className="border-t p-4 bg-card">
            <div className="flex space-x-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  placeholder={isDummyJourneyActive ? "Click Send to continue..." : "Ask Guruji about your future..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isTyping || isDummyJourneyActive} // Disable input during dummy journey
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  disabled
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleSendMessage} disabled={(!input.trim() && !isDummyJourneyActive) || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isDummyJourneyActive && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                {t('Dummy journey active. Click "Send" to advance.')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </div>
  )
}
