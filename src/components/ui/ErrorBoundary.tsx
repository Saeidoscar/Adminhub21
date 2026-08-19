import { Component, ReactNode } from "react"

interface Props {
  fallback?: ReactNode
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="font-bold text-[#0f172a] mb-1 text-lg">
              Something went wrong
            </div>
            <div className="text-sm text-[#64748b] mb-4">
              Please refresh the page or try again later.
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors btn-press"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
