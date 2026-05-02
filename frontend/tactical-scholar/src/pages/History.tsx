import { HistoryRow } from "../components/history/HistoryRow"
import { useAppState } from "../state/AppStateProvider"
import { EmptyState } from "../components/ui/EmptyState"
import { Skeleton } from "../components/ui/Skeleton"
import * as React from "react"

export function History() {
  const { state } = useAppState()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-3xl font-bold text-text-primary">Match History</h2>
      <div className="grid gap-4 max-w-3xl">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          : state.history.length === 0
            ? <EmptyState title="No matches yet" description="Your scholarly record will appear after the first game." />
            : state.history.map((item) => <HistoryRow key={item.id} item={item} />)}
      </div>
    </div>
  )
}
