"use client"

import { useState, useEffect, useRef } from "react"
import { X, Terminal } from "lucide-react"

interface LogEntry {
  id: number
  timestamp: string
  message: string
  type: "log" | "error" | "warn" | "info"
}

interface DebugConsoleProps {
  isVisible: boolean
  onToggleVisibility: () => void
}

export function DebugConsole({ isVisible, onToggleVisibility }: DebugConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    const addLog = (message: string, type: LogEntry["type"]) => {
      const timestamp = new Date().toLocaleTimeString()
      const id = Date.now() + Math.random()
      setLogs((prev) => [
        ...prev.slice(-99), // Keep only last 100 logs
        {
          id,
          timestamp,
          message,
          type,
        },
      ])
    }

    console.log = (...args) => {
      originalLog(...args)
      addLog(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "), "log")
    }

    console.error = (...args) => {
      originalError(...args)
      addLog(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "), "error")
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "), "warn")
    }

    console.info = (...args) => {
      originalInfo(...args)
      addLog(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "), "info")
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "D") {
        event.preventDefault()
        onToggleVisibility()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      // Restore original console methods
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      console.info = originalInfo
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onToggleVisibility])

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  if (!isVisible) {
    return null
  }

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-red-300"
      case "warn":
        return "text-yellow-300"
      case "info":
        return "text-blue-300"
      default:
        return "text-white"
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-80 bg-black/90 backdrop-blur-sm border border-border rounded-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Debug Console</span>
        </div>
        <button onClick={onToggleVisibility} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-muted-foreground">No logs yet...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
              <span className={getLogColor(log.type)}>{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      <div className="p-2 border-t border-border text-xs text-muted-foreground">
        Press Ctrl+Shift+D to toggle • {logs.length} logs
      </div>
    </div>
  )
}
