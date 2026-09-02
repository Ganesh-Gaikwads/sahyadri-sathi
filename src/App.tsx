import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import type { Session } from '@supabase/supabase-js'

interface Trek {
  id: number
  name: string
  region: string
  difficulty: string
  distance_km: number
  best_season: string
  description: string
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [treks, setTreks] = useState<Trek[]>([])
  const [loading, setLoading] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All")
  const [plannedDates, setPlannedDates] = useState<{ [trekId: number]: string }>({})
  const [plansByTrek, setPlansByTrek] = useState<{ [trekId: number]: number }>({})

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function fetchTreks() {
      const { data, error } = await supabase.from('treks').select('*')
      if (error) {
        console.error('Error fetching treks:', error)
      } else {
        setTreks(data as Trek[])
      }
      setLoading(false)
    }
    fetchTreks()
  }, [])

  async function fetchPlanCount(trekId: number, date: string) {
    const { count } = await supabase
      .from('planned_treks')
      .select('*', { count: 'exact', head: true })
      .eq('trek_id', trekId)
      .eq('planned_date', date)

    setPlansByTrek((prev) => ({ ...prev, [trekId]: count ?? 0 }))
  }

  async function handlePlanTrek(trekId: number) {
    const date = plannedDates[trekId]
    if (!date || !session) return

    const { error } = await supabase.from('planned_treks').insert({
      user_id: session.user.id,
      trek_id: trekId,
      planned_date: date,
    })

    if (error) {
      alert('Error saving plan: ' + error.message)
    } else {
      alert('Trek planned!')
      fetchPlanCount(trekId, date)
    }
  }

  if (!session) return <Auth />

  if (loading) return <p>Loading treks...</p>

  const filteredTreks =
    difficultyFilter === "All"
      ? treks
      : treks.filter((t) =>
          t.difficulty.toLowerCase().includes(difficultyFilter.toLowerCase())
        )

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold text-stone-800">Sahyadri Sathi</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-stone-500 underline"
          >
            Sign out
          </button>
        </div>
        <p className="text-center text-stone-500 mb-10">
          Discover treks across the Sahyadris
        </p>

        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {["All", "Easy", "Moderate", "Difficult"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficultyFilter(level)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                difficultyFilter === level
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreks.map((trek) => (
            <div
              key={trek.id}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-stone-800">
                  {trek.name}
                </h2>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    trek.difficulty.toLowerCase().includes("easy")
                      ? "bg-green-100 text-green-700"
                      : trek.difficulty.toLowerCase().includes("difficult") ||
                        trek.difficulty.toLowerCase().includes("strenuous")
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {trek.difficulty}
                </span>
              </div>
              <p className="text-sm text-stone-500 mb-1">{trek.region}</p>
              <p className="text-sm text-stone-600 mb-4">
                {trek.distance_km} km · {trek.best_season}
              </p>

              <div className="border-t border-stone-100 pt-3 space-y-2">
                <input
                  type="date"
                  value={plannedDates[trek.id] || ''}
                  onChange={(e) => {
                    const date = e.target.value
                    setPlannedDates((prev) => ({ ...prev, [trek.id]: date }))
                    if (date) fetchPlanCount(trek.id, date)
                  }}
                  className="w-full border border-stone-300 rounded-lg px-2 py-1.5 text-sm"
                />
                <button
                  onClick={() => handlePlanTrek(trek.id)}
                  disabled={!plannedDates[trek.id]}
                  className="w-full bg-stone-800 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-stone-700 transition disabled:opacity-40"
                >
                  I'm planning to go
                </button>
                {plansByTrek[trek.id] !== undefined && plannedDates[trek.id] && (
                  <p className="text-xs text-stone-500 text-center">
                    {plansByTrek[trek.id]} {plansByTrek[trek.id] === 1 ? 'person' : 'people'} going on this date
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App