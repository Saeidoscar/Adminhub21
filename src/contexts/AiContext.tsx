import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react"
import type {
  AiConversationRow,
  AiMessageRow,
  AiModelRow,
} from "@adminhub/shared"
import {
  createConversation as createConversationApi,
  deleteConversation,
  getConversation,
  listConversations as listConversationsApi,
  listMessages,
  listModels,
  renameConversation,
  sendMessage as sendMessageApi,
  switchModel as switchModelApi,
} from "../lib/api"

export interface AiContextValue {
  conversations: AiConversationRow[]
  activeConversation: AiConversationRow | null
  messages: AiMessageRow[]
  models: AiModelRow[]
  isLoading: boolean
  isSending: boolean
  error: string | null
  createConversation: (modelId: string, title?: string) => Promise<AiConversationRow>
  selectConversation: (id: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  switchModel: (modelId: string) => Promise<void>
  renameConversation: (id: string, title: string) => Promise<AiConversationRow>
  deleteConversation: (id: string) => Promise<void>
  refreshConversations: () => Promise<void>
  clearError: () => void
}

const AiContext = createContext<AiContextValue>(null as never)

export function useAi() {
  return useContext(AiContext)
}

export function AiProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<AiConversationRow[]>([])
  const [activeConversation, setActiveConversation] =
    useState<AiConversationRow | null>(null)
  const [messages, setMessages] = useState<AiMessageRow[]>([])
  const [models, setModels] = useState<AiModelRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(true)
  const activeConversationIdRef = useRef<string | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const refreshConversations = useCallback(async () => {
    try {
      const items = await listConversationsApi()
      if (mountedRef.current) {
        setConversations(items)
      }
    } catch (err) {
      if (mountedRef.current) {
        console.warn("Failed to load conversations", err)
        setConversations([])
      }
    }
  }, [])

  const refreshModels = useCallback(async () => {
    try {
      const items = await listModels()
      if (mountedRef.current) {
        setModels(items)
      }
    } catch (err) {
      if (mountedRef.current) {
        console.warn("Failed to load models", err)
        setModels([])
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialData() {
      try {
        const [convos, modelList] = await Promise.all([
          listConversationsApi(),
          listModels(),
        ])
        if (!cancelled) {
          setConversations(convos)
          setModels(modelList)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Failed to load initial AI data", err)
          setConversations([])
          setModels([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      cancelled = true
    }
  }, [])

  const refreshMessages = useCallback(async (conversationId: string) => {
    try {
      const items = await listMessages(conversationId)
      if (mountedRef.current) {
        setMessages(items)
      }
    } catch (err) {
      if (mountedRef.current) {
        console.warn("Failed to load messages", err)
        setMessages([])
      }
    }
  }, [])

  useEffect(() => {
    if (activeConversation) {
      activeConversationIdRef.current = activeConversation.id
      void refreshMessages(activeConversation.id)
    } else {
      activeConversationIdRef.current = null
      setMessages([])
    }
  }, [activeConversation?.id, refreshMessages])

  const createConversation = useCallback(
    async (modelId: string, title?: string): Promise<AiConversationRow> => {
      const conversation = await createConversationApi({
        title: title || "New Conversation",
        modelId,
      })
      if (mountedRef.current) {
        setConversations((list) => [conversation, ...list])
        setActiveConversation(conversation)
        setMessages([])
      }
      return conversation
    },
    [],
  )

  const selectConversation = useCallback(async (id: string) => {
    const conversation = await getConversation(id)
    if (conversation && mountedRef.current) {
      setActiveConversation(conversation)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation) return

      const trimmed = content.trim()
      if (!trimmed) return

      setIsSending(true)
      setError(null)

      const optimisticMessage: AiMessageRow = {
        id: `temp-${Date.now()}`,
        conversationId: activeConversation.id,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      }

      setMessages((list) => [...list, optimisticMessage])

      try {
        const assistantMessage = await sendMessageApi(
          activeConversation.id,
          trimmed,
        )
        if (mountedRef.current) {
          setMessages((list) => [...list, assistantMessage])
        }
      } catch (err) {
        if (mountedRef.current) {
          setMessages((list) =>
            list.filter((m) => m.id !== optimisticMessage.id),
          )
          setError(
            err instanceof Error
              ? err.message
              : "Failed to send message. Please try again.",
          )
        }
        throw err
      } finally {
        if (mountedRef.current) {
          setIsSending(false)
        }
      }
    },
    [activeConversation],
  )

  const switchModel = useCallback(
    async (modelId: string) => {
      if (!activeConversation) return

      try {
        const conversation = await switchModelApi(
          activeConversation.id,
          modelId,
        )
        if (mountedRef.current) {
          setActiveConversation(conversation)
          setConversations((list) =>
            list.map((item) =>
              item.id === conversation.id ? conversation : item,
            ),
          )
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to switch model. Please try again.",
          )
        }
        throw err
      }
    },
    [activeConversation],
  )

  const handleRenameConversation = useCallback(
    async (id: string, title: string): Promise<AiConversationRow> => {
      const conversation = await renameConversation(id, title)
      if (mountedRef.current) {
        setConversations((list) =>
          list.map((item) => (item.id === id ? conversation : item)),
        )
        if (activeConversation?.id === id) {
          setActiveConversation(conversation)
        }
      }
      return conversation
    },
    [activeConversation?.id],
  )

  const handleDeleteConversation = useCallback(
    async (id: string): Promise<void> => {
      await deleteConversation(id)
      if (mountedRef.current) {
        setConversations((list) => list.filter((item) => item.id !== id))
        if (activeConversationIdRef.current === id) {
          setActiveConversation(null)
          setMessages([])
        }
      }
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AiContextValue = {
    conversations,
    activeConversation,
    messages,
    models,
    isLoading,
    isSending,
    error,
    createConversation,
    selectConversation,
    sendMessage,
    switchModel,
    renameConversation: handleRenameConversation,
    deleteConversation: handleDeleteConversation,
    refreshConversations,
    clearError,
  }

  return (
    <AiContext.Provider value={value}>{children}</AiContext.Provider>
  )
}
