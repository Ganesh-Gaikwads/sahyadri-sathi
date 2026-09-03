import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

interface Trek {
  id: number
  name: string
  region: string
  difficulty: string
  distance_km: number
  best_season: string
  description: string
}

export default function TrekDetail() {
  const { id } = useParams()
  const [trek, setTrek] = useState<Trek | null>(null)
  const [loading, setLoading] = useState(true)
  const [plannedDate, setPlannedDate] = useState('')
  const [planCount, setPlanCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchTrek() {
      const { data, error } = await supabase
        .from('treks')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching trek:', error)
      } else {
        setTrek(data as Trek)
      }
      setLoading(false)
    }
    fetchTrek()
  }, [id])

  async function fetchPlanCount(date: string) {
    const { count } = await supabase
      .from('planned_treks')
      .select('*', { count: 'exact', head: true })
      .eq('trek_id', Number(id))
      .eq('planned_date', date)

    setPlanCount(count ?? 0)
  }

  async function handlePlanTrek() {
    if (!plannedDate) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert('Please log in first')
      return
    }

    const { error } = await supabase.from('planned_treks').insert({
      user_id: session.user.id,
      trek_id: Number(id),
      planned_date: plannedDate,
    })

    if (error) {
      alert('Error saving plan: ' + error.message)
    } else {
      alert('Trek planned!')
      fetchPlanCount(plannedDate)
    }
  }

  if (loading) return <p className="p-10 text-center">Loading...</p>
  if (!trek) return <p className="p-10 text-center">Trek not found.</p>

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-stone-500 underline mb-6 inline-block">
          ← Back to all treks
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-3xl font-bold text-stone-800">{trek.name}</h1>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                trek.difficulty.toLowerCase().includes('easy')
                  ? 'bg-green-100 text-green-700'
                  : trek.difficulty.toLowerCase().includes('difficult') ||
                    trek.difficulty.toLowerCase().includes('strenuous')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {trek.difficulty}
            </span>
          </div>

          <p className="text-stone-500 mb-1">{trek.region}</p>
          <p className="text-stone-600 mb-4">
            {trek.distance_km} km · Best season: {trek.best_season}
          </p>
          <p className="text-stone-700 mb-6">{trek.description}</p>

          <div className="border-t border-stone-100 pt-4 space-y-2">
            <input
              type="date"
              value={plannedDate}
              onChange={(e) => {
                setPlannedDate(e.target.value)
                if (e.target.value) fetchPlanCount(e.target.value)
              }}
              className="w-full border border-stone-300 rounded-lg px-2 py-1.5 text-sm"
            />
            <button
              onClick={handlePlanTrek}
              disabled={!plannedDate}
              className="w-full bg-stone-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-stone-700 transition disabled:opacity-40"
            >
              I'm planning to go
            </button>
            {planCount !== null && plannedDate && (
              <p className="text-xs text-stone-500 text-center">
                {planCount} {planCount === 1 ? 'person' : 'people'} going on this date
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}