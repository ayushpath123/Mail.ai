"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function CVChatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide tooltip after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm your CV assistant. I can help you with questions about your CV, resume tips, career advice, and more. What would you like to know?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/backend/v2/cv-chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          subject: subject || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      >
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="relative bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg shadow-lg border-2 border-black dark:border-white text-sm font-medium whitespace-nowrap mb-1"
            >
              How can I help?
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-black dark:border-t-white"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className="rounded-full h-16 w-16 shadow-2xl hover:shadow-3xl transition-all bg-black dark:bg-white border-2 border-black dark:border-white hover:bg-gray-900 dark:hover:bg-gray-100 flex items-center justify-center group"
        >
          {isOpen ? (
            <X className="h-8 w-8 stroke-[3] text-white dark:text-black" />
          ) : (
            <MessageCircle className="h-8 w-8 stroke-[3] text-white dark:text-black fill-none" />
          )}
        </button>
      </motion.div>

      {/* Chat Popup - 1/4 screen width */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-1/4 min-w-[360px] max-w-[450px] z-50"
          >
            <div className="h-full bg-white dark:bg-gray-900 border-l-2 border-black dark:border-white shadow-2xl flex flex-col">
              {/* Header */}
              <div className="bg-black dark:bg-white px-6 py-4 border-b-2 border-black dark:border-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-black p-2 rounded-lg border border-white dark:border-black">
                      <MessageCircle className="h-5 w-5 text-black dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white dark:text-black">CV Assistant</h3>
                      {session?.user?.email && (
                        <p className="text-xs text-gray-300 dark:text-gray-700 mt-0.5">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-white dark:text-black hover:bg-white/20 dark:hover:bg-black/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Input
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-3 h-9 bg-white dark:bg-black border-2 border-white dark:border-black text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-300 dark:focus:border-gray-600"
                />
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
                <ScrollArea className="flex-1 px-4 py-6">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                            message.role === "user"
                              ? "bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white"
                              : "bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-2 ${
                              message.role === "user"
                                ? "text-gray-300 dark:text-gray-700"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-md border-2 border-gray-300 dark:border-gray-600">
                          <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t-2 border-black dark:border-white bg-white dark:bg-gray-900 p-4 flex gap-3"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about your CV..."
                    disabled={isLoading}
                    className="flex-1 bg-white dark:bg-gray-800 border-2 border-black dark:border-white text-black dark:text-white focus:border-gray-500 dark:focus:border-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                    className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 border-2 border-black dark:border-white"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
}

