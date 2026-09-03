import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface PlannedTrek {
  id: number;
  planned_date: string;
  treks: {
    id: number;
    name: string;
    region: string;
    difficulty: string;
  };
}

export default function MyTreks() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [plans, setPlans] = useState<PlannedTrek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    async function fetchMyPlans() {
      if (!session) return;

      const { data, error } = await supabase
        .from("planned_treks")
        .select("id, planned_date, treks(id, name, region, difficulty)")
        .eq("user_id", session.user.id)
        .order("planned_date", { ascending: true });

      if (error) {
        console.error("Error fetching plans:", error);
      } else {
        setPlans(data as unknown as PlannedTrek[]);
      }
      setLoading(false);
    }

    if (session) fetchMyPlans();
  }, [session]);

  if (session === null) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-sm text-stone-500 underline mb-6 inline-block">
          ← Back to all treks
        </Link>

        <h1 className="text-3xl font-bold text-stone-800 mb-6">My Planned Treks</h1>

        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : plans.length === 0 ? (
          <p className="text-stone-500">
            You haven't planned any treks yet. Go pick one!
          </p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                to={`/trek/${plan.treks.id}`}
                className="block bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-stone-800">
                      {plan.treks.name}
                    </h2>
                    <p className="text-sm text-stone-500">{plan.treks.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-stone-700">
                      {new Date(plan.planned_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-stone-500">{plan.treks.difficulty}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}