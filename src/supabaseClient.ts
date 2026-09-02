import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xrrlpyjslocitehuslfx.supabase.co'
const supabaseKey = 'sb_publishable_0iprKPJNkH64WkHFGi7cSg_B3OVT5KQ'

export const supabase = createClient(supabaseUrl, supabaseKey);