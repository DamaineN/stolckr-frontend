// WebSocket service for real-time stock price updates
export interface StockUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  timestamp: string
}

export interface WebSocketCallbacks {
  onConnect?: () => void
  onDisconnect?: () => void
  onStockUpdate?: (update: StockUpdate) => void
  onError?: (error: Event) => void
}

class WebSocketService {
  private ws: WebSocket | null = null
  private callbacks: WebSocketCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private watchedSymbols: Set<string> = new Set()
  
  // Update intervals (in milliseconds)
  private static readonly UPDATE_INTERVALS = {
    REALTIME: 5000,      // 5 seconds (for testing)
    FREQUENT: 30000,     // 30 seconds
    NORMAL: 120000,      // 2 minutes (realistic for stocks)
    SLOW: 300000,        // 5 minutes
  }
  
  // Start with FREQUENT for immediate testing, can be changed to NORMAL later
  private updateInterval = WebSocketService.UPDATE_INTERVALS.FREQUENT

  constructor() {
    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.subscribe = this.subscribe.bind(this)
    this.unsubscribe = this.unsubscribe.bind(this)
  }

  connect(callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks

    try {
      // In a real app, this would connect to your WebSocket endpoint
      // For now, we'll simulate WebSocket with mock data
      this.simulateWebSocket()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Event)
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.reconnectAttempts = 0
    if (this.callbacks.onDisconnect) {
      this.callbacks.onDisconnect()
    }
  }

  subscribe(symbol: string) {
    const upperSymbol = symbol.toUpperCase()
    
    // Prevent duplicate subscriptions
    if (this.watchedSymbols.has(upperSymbol)) {
      console.log(`Already subscribed to ${upperSymbol}, skipping`)
      return
    }
    
    this.watchedSymbols.add(upperSymbol)
    console.log(`Subscribed to ${symbol} price updates`)
    
    // Send immediate initial price update
    setTimeout(() => {
      const basePrice = this.getBasePriceForSymbol(upperSymbol)
      const initialUpdate: StockUpdate = {
        symbol: upperSymbol,
        price: basePrice,
        change: 0,
        changePercent: 0,
        timestamp: new Date().toISOString()
      }
      
      if (this.callbacks.onStockUpdate) {
        this.callbacks.onStockUpdate(initialUpdate)
      }
    }, 100) // Send after 100ms delay
  }

  unsubscribe(symbol: string) {
    this.watchedSymbols.delete(symbol.toUpperCase())
    console.log(`Unsubscribed from ${symbol} price updates`)
  }
  
  // Configure update frequency
  setUpdateFrequency(frequency: 'REALTIME' | 'FREQUENT' | 'NORMAL' | 'SLOW') {
    this.updateInterval = WebSocketService.UPDATE_INTERVALS[frequency]
    console.log(`Stock update frequency set to ${frequency} (${this.updateInterval / 1000} seconds)`)
  }

  // Simulate WebSocket connection with mock data
  private simulateWebSocket() {
    // Simulate connection success
    setTimeout(() => {
      if (this.callbacks.onConnect) {
        this.callbacks.onConnect()
      }
      this.startMockUpdates()
    }, 1000)
  }

  private startMockUpdates() {
    // Send realistic stock price updates based on configured interval
    // Default: every 2 minutes (more realistic for stock market updates)
    console.log('Starting mock stock price updates...', `Interval: ${this.updateInterval / 1000} seconds`)
    
    const interval = setInterval(() => {
      if (this.watchedSymbols.size === 0) {
        console.log('No watched symbols, skipping update')
        return
      }

      console.log(`Updating prices for ${this.watchedSymbols.size} symbols:`, Array.from(this.watchedSymbols))
      
      this.watchedSymbols.forEach(symbol => {
        // More realistic price simulation
        const basePrice = this.getBasePriceForSymbol(symbol)
        const volatility = 0.02 // 2% max change per update
        const changePercent = (Math.random() - 0.5) * volatility * 100
        const newPrice = basePrice * (1 + changePercent / 100)
        const change = newPrice - basePrice
        
        const mockUpdate: StockUpdate = {
          symbol,
          price: Math.round(newPrice * 100) / 100, // Round to 2 decimal places
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          timestamp: new Date().toISOString()
        }

        console.log(`Price update for ${symbol}:`, mockUpdate)
        
        if (this.callbacks.onStockUpdate) {
          this.callbacks.onStockUpdate(mockUpdate)
        } else {
          console.warn('No onStockUpdate callback available')
        }
      })
    }, this.updateInterval)

    // Store interval for cleanup
    if (typeof window !== 'undefined') {
      (window as any).__stockWebSocketInterval = interval
      console.log('Stock WebSocket interval stored globally')
    }
  }

  isConnected(): boolean {
    // For mock implementation, return true if we have active intervals
    return typeof window !== 'undefined' && (window as any).__stockWebSocketInterval !== undefined
  }

  getWatchedSymbols(): string[] {
    return Array.from(this.watchedSymbols)
  }
  
  // Get realistic base prices for popular stocks
  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: Record<string, number> = {
      'AAPL': 185.50,
      'GOOGL': 2750.30,
      'GOOG': 2760.15,
      'MSFT': 425.75,
      'TSLA': 245.80,
      'NVDA': 875.40,
      'META': 520.25,
      'AMZN': 3450.80,
      'NFLX': 485.90,
      'SPY': 455.30,
      'QQQ': 390.15,
      'VTI': 265.80
    }
    
    return basePrices[symbol] || 150.00 // Default price if symbol not found
  }
}

// Global WebSocket instance
export const stockWebSocket = new WebSocketService()

// React hook for using WebSocket
export function useStockWebSocket(callbacks?: WebSocketCallbacks) {
  const connect = () => stockWebSocket.connect(callbacks)
  const disconnect = () => stockWebSocket.disconnect()
  const subscribe = (symbol: string) => stockWebSocket.subscribe(symbol)
  const unsubscribe = (symbol: string) => stockWebSocket.unsubscribe(symbol)
  const setUpdateFrequency = (frequency: 'REALTIME' | 'FREQUENT' | 'NORMAL' | 'SLOW') => 
    stockWebSocket.setUpdateFrequency(frequency)

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    setUpdateFrequency,
    isConnected: stockWebSocket.isConnected(),
    watchedSymbols: stockWebSocket.getWatchedSymbols()
  }
}
