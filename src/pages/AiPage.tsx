import { useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ConversationSidebar } from "../components/ai/ConversationSidebar"
import { MessageList } from "../components/ai/MessageList"
import { MessageInput } from "../components/ai/MessageInput"
import { ModelSelector } from "../components/ai/ModelSelector"
import { useAi } from "../contexts/AiContext"
import { Icon } from "../components/layout/Icon"
import { Button } from "../components/ui/Button"

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  if (!message) return null

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      <span className="flex items-center gap-2">
        <Icon name="warning" className="h-4 w-4 shrink-0" />
        {message}
      </span>
      <Button variant="ghost" className="h-7 px-2 text-xs" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex gap-3 slide-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
        AI
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

export default function AiPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const {
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
    renameConversation,
    deleteConversation,
    refreshConversations,
    clearError,
  } = useAi()

  const hasActiveConversation = !!activeConversation
  const hasMessages = messages.length > 0
  const hasModels = models.length > 0
  const isConversationLoaded =
    !conversationId || activeConversation?.id === conversationId

  useEffect(() => {
    if (conversationId && conversationId !== activeConversation?.id) {
      void selectConversation(conversationId)
    }
  }, [conversationId, activeConversation?.id, selectConversation])

  const handleNewConversation = useCallback(async () => {
    const defaultModel = models.find((m) => m.isActive) || models[0]
    if (!defaultModel) return

    try {
      const conversation = await createConversation(defaultModel.id)
      navigate(`/ai/${conversation.id}`, { replace: true })
    } catch (err) {
      console.warn("Failed to create conversation", err)
    }
  }, [models, createConversation, navigate])

  const handleSend = useCallback(
    async (content: string) => {
      try {
        await sendMessage(content)
      } catch (err) {
        console.warn("Failed to send message", err)
      }
    },
    [sendMessage],
  )

  const handleSelectConversation = useCallback(
    async (id: string) => {
      await selectConversation(id)
      navigate(`/ai/${id}`)
    },
    [selectConversation, navigate],
  )

  const handleRenameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        await renameConversation(id, title)
        await refreshConversations()
      } catch (err) {
        console.warn("Failed to rename conversation", err)
      }
    },
    [renameConversation, refreshConversations],
  )

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id)
        await refreshConversations()
      } catch (err) {
        console.warn("Failed to delete conversation", err)
      }
    },
    [deleteConversation, refreshConversations],
  )

  const selectedModel = models.find((m) => m.id === activeConversation?.modelId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading AI...
        </div>
      </div>
    )
  }

  if (!hasModels) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Icon name="bot" size={24} className="text-muted" />
          </div>
          <h2 className="text-lg font-bold text-foreground">No models available</h2>
          <p className="mt-2 text-sm text-muted">
            There are no AI models configured. Please contact an administrator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-[calc(100vh-0px)] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 lg:w-80">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConversation?.id}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onRename={handleRenameConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {!isConversationLoaded && conversationId ? (
          <div className="flex flex-1 items-center justify-center gap-3 text-sm text-muted">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading conversation...
          </div>
        ) : hasActiveConversation ? (
          <>
            <ErrorBanner message={error} onDismiss={clearError} />

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {activeConversation.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedModel && (
                  <ModelSelector
                    models={models}
                    selectedModelId={selectedModel.id}
                    onSelect={switchModel}
                  />
                )}
              </div>
            </div>

            {/* Messages */}
            {hasMessages ? (
              <MessageList messages={messages} />
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted">
                No messages yet. Start the conversation below.
              </div>
            )}

            {isSending && !hasMessages && (
              <div className="flex flex-col gap-4 px-4 py-4">
                <LoadingBubble />
              </div>
            )}

            {/* Input */}
            <MessageInput onSend={handleSend} disabled={isSending || !hasModels} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon name="bot" size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Welcome to AI Chat
              </h2>
              <p className="mt-1 text-sm text-muted">
                Select a conversation from the sidebar or start a new one.
              </p>
            </div>
            <Button
              onClick={handleNewConversation}
              variant="primary"
              className="mt-2"
            >
              <Icon name="plus" size={16} />
              New Conversation
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
