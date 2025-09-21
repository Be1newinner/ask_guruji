import type React from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  zodiacSign?: string
}

export interface Message {
  id: string
  content: string | React.ReactNode // Allow ReactNode for product cards
  sender: "user" | "astrologer"
  timestamp: Date
  astrologer?: string
}

export interface ChatThread {
  id: string
  title: string
  messages: Message[]
  lastMessage: string
  timestamp: Date
  astrologer: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

interface ChatState {
  currentThread: ChatThread | null
  threads: ChatThread[]
  isTyping: boolean
  isDummyJourneyActive: boolean // New: Controls if dummy journey is active
  dummyJourneyStep: number // New: Tracks current step in dummy journey
  createNewThread: () => void
  setCurrentThread: (thread: ChatThread | null) => void
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  setIsTyping: (typing: boolean) => void
  updateThreadTitle: (threadId: string, title: string) => void
  startDummyJourney: () => void // New: Initiates the dummy journey
  advanceDummyJourney: () => void // New: Advances the dummy journey to the next step
  resetDummyJourney: () => void // New: Resets the dummy journey
}

// New Language State
interface LanguageState {
  currentLanguage: "hindi" | "english" | "hinglish"
  setLanguage: (language: "hindi" | "english" | "hinglish") => void
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  inStock: boolean
  benefits: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

interface StoreState {
  products: Product[]
  cart: CartItem[]
  isCartOpen: boolean
  currentPage: number
  selectedCategory: string
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCartOpen: (open: boolean) => void
  setCurrentPage: (page: number) => void
  setSelectedCategory: (category: string) => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

// New Language Store
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: "hinglish",
      setLanguage: (language) => set({ currentLanguage: language }),
    }),
    {
      name: "language-storage",
    },
  ),
)

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentThread: null,
      threads: [],
      isTyping: false,
      isDummyJourneyActive: false, // Initialize new state
      dummyJourneyStep: 0, // Initialize new state
      createNewThread: () => {
        const newThread: ChatThread = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
          lastMessage: "",
          timestamp: new Date(),
          astrologer: "गुरुजी राम शर्मा",
        }
        set((state) => ({
          threads: [newThread, ...state.threads],
          currentThread: newThread,
          isDummyJourneyActive: false, // Reset on new thread
          dummyJourneyStep: 0, // Reset on new thread
        }))
      },
      setCurrentThread: (thread) => set({ currentThread: thread }),
      addMessage: (message) => {
        const messageWithId: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        }

        set((state) => {
          if (!state.currentThread) return state

          const updatedThread = {
            ...state.currentThread,
            messages: [...state.currentThread.messages, messageWithId],
            lastMessage: typeof message.content === "string" ? message.content : "Product suggestion", // Update last message
            timestamp: new Date(),
          }

          // Update thread title if it's the first user message
          if (message.sender === "user" && state.currentThread.messages.length === 0) {
            updatedThread.title =
              (typeof message.content === "string" ? message.content : "New Chat").slice(0, 30) +
              ((typeof message.content === "string" ? message.content.length : 0) > 30 ? "..." : "")
          }

          const updatedThreads = state.threads.map((thread) =>
            thread.id === updatedThread.id ? updatedThread : thread,
          )

          return {
            currentThread: updatedThread,
            threads: updatedThreads,
          }
        })
      },
      setIsTyping: (typing) => set({ isTyping: typing }),
      updateThreadTitle: (threadId, title) => {
        set((state) => ({
          threads: state.threads.map((thread) => (thread.id === threadId ? { ...thread, title } : thread)),
          currentThread: state.currentThread?.id === threadId ? { ...state.currentThread, title } : state.currentThread,
        }))
      },
      // New dummy journey actions
      startDummyJourney: () => set({ isDummyJourneyActive: true, dummyJourneyStep: 0 }),
      advanceDummyJourney: () => set((state) => ({ dummyJourneyStep: state.dummyJourneyStep + 1 })),
      resetDummyJourney: () => set({ isDummyJourneyActive: false, dummyJourneyStep: 0 }),
    }),
    {
      name: "chat-storage",
      // Add custom serialization to handle Date objects
      serialize: (state) => {
        return JSON.stringify(state, (key, value) => {
          // Convert Date objects to ISO strings
          if (value instanceof Date) {
            return value.toISOString()
          }
          // Handle ReactNode content by converting it to a placeholder string
          if (key === "content" && typeof value !== "string") {
            return "[Product Card]" // Placeholder for ReactNode content
          }
          return value
        })
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str, (key, value) => {
          // Convert ISO strings back to Date objects
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
            return new Date(value)
          }
          return value
        })
        // Ensure currentThread and threads messages have Date objects
        if (parsed.state?.threads) {
          parsed.state.threads = parsed.state.threads.map((thread: any) => ({
            ...thread,
            timestamp: new Date(thread.timestamp),
            messages: thread.messages.map((message: any) => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
          }))
        }
        if (parsed.state?.currentThread) {
          parsed.state.currentThread = {
            ...parsed.state.currentThread,
            timestamp: new Date(parsed.state.currentThread.timestamp),
            messages: parsed.state.currentThread.messages.map((message: any) => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
          }
        }
        return parsed
      },
    },
  ),
)

export const useStoreState = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [
        {
          id: "chakra-bookmark",
          name: "Nadis Chakra Bookmark Stick",
          description: "A spiritual bookmark crafted with sacred geometry to guide your energy back into harmony",
          price: 299,
          originalPrice: 399,
          image: "/nadis_chakra_bookmark_stick.webp?height=300&width=300",
          category: "Spiritual",
          rating: 4.9,
          reviews: 156,
          inStock: true,
          benefits: [
            "Daily spiritual reminder",
            "Sacred geometry design",
            "Energy alignment",
            "Mindful reading companion",
          ],
        },
        {
          id: "1",
          name: "Shri Hanuman Chalisa Book",
          description: "Sacred Hanuman Chalisa with detailed meanings and benefits",
          price: 299,
          originalPrice: 399,
          image: "/product.png?height=300&width=300",
          category: "Books",
          rating: 4.8,
          reviews: 156,
          inStock: true,
          benefits: ["Removes obstacles", "Brings courage", "Protection from evil"],
        },
        {
          id: "2",
          name: "Nazar Suraksha Kavach",
          description: "Powerful protection amulet against evil eye and negative energies",
          price: 599,
          originalPrice: 799,
          image: "/product.png?height=300&width=300",
          category: "Protection",
          rating: 4.9,
          reviews: 234,
          inStock: true,
          benefits: ["Evil eye protection", "Negative energy shield", "Spiritual safety"],
        },
        {
          id: "3",
          name: "Rudraksha Mala (108 Beads)",
          description: "Authentic 5-mukhi Rudraksha mala for meditation and spiritual growth",
          price: 1299,
          originalPrice: 1599,
          image: "/product.png?height=300&width=300",
          category: "Spiritual",
          rating: 4.7,
          reviews: 89,
          inStock: true,
          benefits: ["Enhances meditation", "Reduces stress", "Spiritual awakening"],
        },
        {
          id: "4",
          name: "Shri Yantra (Brass)",
          description: "Sacred geometry yantra for prosperity and abundance",
          price: 899,
          originalPrice: 1199,
          image: "/product.png?height=300&width=300",
          category: "Yantras",
          rating: 4.6,
          reviews: 67,
          inStock: true,
          benefits: ["Attracts wealth", "Brings prosperity", "Enhances focus"],
        },
        {
          id: "5",
          name: "Ganesha Idol (Marble)",
          description: "Beautiful handcrafted Ganesha idol for home temple",
          price: 2499,
          originalPrice: 2999,
          image: "/product.png?height=300&width=300",
          category: "Idols",
          rating: 4.9,
          reviews: 123,
          inStock: true,
          benefits: ["Removes obstacles", "Brings good luck", "Blesses new beginnings"],
        },
        {
          id: "6",
          name: "Raksha Bandhan Special Thread",
          description: "Sacred thread blessed by pandits for protection",
          price: 199,
          originalPrice: 299,
          image: "/product.png?height=300&width=300",
          category: "Protection",
          rating: 4.5,
          reviews: 45,
          inStock: true,
          benefits: ["Divine protection", "Strengthens bonds", "Spiritual blessing"],
        },
        {
          id: "7",
          name: "Astrology Prediction Book",
          description: "Complete guide to understanding your horoscope and future",
          price: 699,
          originalPrice: 899,
          image: "/product.png?height=300&width=300",
          category: "Books",
          rating: 4.4,
          reviews: 78,
          inStock: true,
          benefits: ["Self-awareness", "Future insights", "Astrological knowledge"],
        },
        {
          id: "8",
          name: "Gomti Chakra Set",
          description: "Set of 11 natural Gomti chakras for Vastu and protection",
          price: 399,
          originalPrice: 599,
          image: "/product.png?height=300&width=300",
          category: "Protection",
          rating: 4.3,
          reviews: 92,
          inStock: true,
          benefits: ["Vastu correction", "Wealth attraction", "Home protection"],
        },
        {
          id: "9",
          name: "Mahamrityunjaya Yantra",
          description: "Powerful yantra for health and longevity",
          price: 799,
          originalPrice: 999,
          image: "/product.png?height=300&width=300",
          category: "Yantras",
          rating: 4.8,
          reviews: 156,
          inStock: true,
          benefits: ["Health improvement", "Longevity", "Disease protection"],
        },
        {
          id: "10",
          name: "Crystal Healing Set",
          description: "Set of 7 chakra crystals for energy healing",
          price: 1599,
          originalPrice: 1999,
          image: "/product.png?height=300&width=300",
          category: "Crystals",
          rating: 4.6,
          reviews: 134,
          inStock: true,
          benefits: ["Chakra balancing", "Energy healing", "Emotional wellness"],
        },
        {
          id: "11",
          name: "Panchmukhi Hanuman Pendant",
          description: "Five-faced Hanuman pendant for ultimate protection",
          price: 999,
          originalPrice: 1299,
          image: "/product.png?height=300&width=300",
          category: "Jewelry",
          rating: 4.7,
          reviews: 89,
          inStock: true,
          benefits: ["Complete protection", "Courage boost", "Spiritual strength"],
        },
        {
          id: "12",
          name: "Vastu Compass",
          description: "Professional Vastu compass for home and office alignment",
          price: 1299,
          originalPrice: 1599,
          image: "/product.png?height=300&width=300",
          category: "Vastu",
          rating: 4.5,
          reviews: 67,
          inStock: true,
          benefits: ["Vastu compliance", "Energy alignment", "Prosperity enhancement"],
        },
        {
          id: "13",
          name: "Tulsi Plant with Pot",
          description: "Sacred Tulsi plant in decorative brass pot",
          price: 599,
          originalPrice: 799,
          image: "/product.png?height=300&width=300",
          category: "Plants",
          rating: 4.8,
          reviews: 234,
          inStock: true,
          benefits: ["Air purification", "Spiritual benefits", "Health improvement"],
        },
        {
          id: "14",
          name: "Lal Kitab Remedies Book",
          description: "Complete Lal Kitab with effective remedies and solutions",
          price: 899,
          originalPrice: 1199,
          image: "/product.png?height=300&width=300",
          category: "Books",
          rating: 4.6,
          reviews: 145,
          inStock: true,
          benefits: ["Problem solutions", "Astrological remedies", "Life improvement"],
        },
        {
          id: "15",
          name: "Navgraha Ring Set",
          description: "Set of 9 gemstone rings representing all planets",
          price: 4999,
          originalPrice: 5999,
          image: "/product.png?height=300&width=300",
          category: "Jewelry",
          rating: 4.9,
          reviews: 78,
          inStock: true,
          benefits: ["Planetary balance", "Astrological benefits", "Life harmony"],
        },
        {
          id: "16",
          name: "Diya Set (Brass)",
          description: "Set of 5 traditional brass diyas for daily worship",
          price: 799,
          originalPrice: 999,
          image: "/product.png?height=300&width=300",
          category: "Worship",
          rating: 4.4,
          reviews: 123,
          inStock: true,
          benefits: ["Divine blessings", "Positive energy", "Spiritual ambiance"],
        },
        {
          id: "17",
          name: "Kaal Sarp Dosh Yantra",
          description: "Special yantra to neutralize Kaal Sarp Dosh effects",
          price: 1199,
          originalPrice: 1499,
          image: "/product.png?height=300&width=300",
          category: "Yantras",
          rating: 4.7,
          reviews: 89,
          inStock: true,
          benefits: ["Dosh removal", "Life improvement", "Obstacle elimination"],
        },
        {
          id: "18",
          name: "Feng Shui Laughing Buddha",
          description: "Prosperity bringing Laughing Buddha statue",
          price: 699,
          originalPrice: 899,
          image: "/product.png?height=300&width=300",
          category: "Feng Shui",
          rating: 4.5,
          reviews: 156,
          inStock: true,
          benefits: ["Happiness", "Prosperity", "Good fortune"],
        },
        {
          id: "19",
          name: "Parad Shivling",
          description: "Sacred mercury Shivling for spiritual practices",
          price: 2999,
          originalPrice: 3499,
          image: "/product.png?height=300&width=300",
          category: "Spiritual",
          rating: 4.8,
          reviews: 67,
          inStock: true,
          benefits: ["Spiritual growth", "Divine blessings", "Meditation enhancement"],
        },
        {
          id: "20",
          name: "Evil Eye Wall Hanging",
          description: "Decorative evil eye protection for home entrance",
          price: 399,
          originalPrice: 599,
          image: "/product.png?height=300&width=300",
          category: "Protection",
          rating: 4.3,
          reviews: 234,
          inStock: true,
          benefits: ["Home protection", "Evil eye shield", "Positive energy"],
        },
        {
          id: "21",
          name: "Astrology Chart Reading",
          description: "Personalized birth chart analysis by expert astrologers",
          price: 1999,
          originalPrice: 2499,
          image: "/product.png?height=300&width=300",
          category: "Services",
          rating: 4.9,
          reviews: 345,
          inStock: true,
          benefits: ["Life insights", "Future predictions", "Personalized guidance"],
        },
        {
          id: "22",
          name: "Sphatik Mala",
          description: "Pure crystal mala for meditation and healing",
          price: 899,
          originalPrice: 1199,
          image: "/product.png?height=300&width=300",
          category: "Spiritual",
          rating: 4.6,
          reviews: 123,
          inStock: true,
          benefits: ["Mental clarity", "Spiritual growth", "Healing energy"],
        },
        {
          id: "23",
          name: "Mangal Yantra",
          description: "Mars yantra for courage and strength",
          price: 699,
          originalPrice: 899,
          image: "/product.png?height=300&width=300",
          category: "Yantras",
          rating: 4.4,
          reviews: 89,
          inStock: true,
          benefits: ["Courage enhancement", "Strength building", "Mars blessing"],
        },
        {
          id: "24",
          name: "Kamakhya Yantra",
          description: "Powerful yantra for wish fulfillment",
          price: 1599,
          originalPrice: 1999,
          image: "/product.png?height=300&width=300",
          category: "Yantras",
          rating: 4.8,
          reviews: 156,
          inStock: true,
          benefits: ["Wish fulfillment", "Divine grace", "Spiritual power"],
        },
        {
          id: "25",
          name: "Astro Consultation Package",
          description: "Complete astrology consultation with remedies",
          price: 2999,
          originalPrice: 3999,
          image: "/product.png?height=300&width=300",
          category: "Services",
          rating: 4.9,
          reviews: 234,
          inStock: true,
          benefits: ["Expert guidance", "Personalized remedies", "Life solutions"],
        },
      ],
      cart: [],
      isCartOpen: false,
      currentPage: 1,
      selectedCategory: "All",
      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cart.find((item) => item.product.id === product.id)
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            }
          }
          return {
            cart: [...state.cart, { product, quantity: 1 }],
          }
        })
      },
      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }))
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          cart: state.cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        }))
      },
      clearCart: () => set({ cart: [] }),
      setCartOpen: (open) => set({ isCartOpen: open }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      getTotalPrice: () => {
        const state = get()
        return state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },
      getTotalItems: () => {
        const state = get()
        return state.cart.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: "store-storage",
    },
  ),
)
