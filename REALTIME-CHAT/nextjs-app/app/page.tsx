'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Load Puter.js script dynamically
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || typeof window.puter === 'undefined' || !window.puter?.ai?.chat) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI is not ready. Please try again in a moment!' }])
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await window.puter.ai.chat(input, { model: 'gpt-5-nano', stream: true })
      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMessage])

      let fullResponse = ''
      for await (const part of response) {
        const text = part?.text || ''
        if (text && !fullResponse.endsWith(text)) { // Prevent duplication
          fullResponse += text
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === 'assistant') {
              lastMessage.content = fullResponse // Update with full text to avoid stretching
            }
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred. Try again!' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <div className="text-center text-white mb-8">
          <h1 className="text-6xl font-bold mb-4">💬 TextStream Template</h1>
          <p className="text-xl opacity-90">Real-time AI chat with streaming responses!</p>
        </div>
        <div ref={chatContainerRef} className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-6 flex flex-col overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <Bot size={48} className="mx-auto mb-4" />
              <p>Start a conversation! Type a message below.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
                  <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-4 mt-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Send size={20} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </main>
  )
}