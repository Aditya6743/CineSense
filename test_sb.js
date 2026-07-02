const { createClient } = require('@supabase/supabase-js');
const sb = createClient('postgresql://postgres.sirfutmxumyjioghwlwq:cinesense6777@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres', 'fakekey');
sb.auth.signUp({email: 'test@test.com', password: 'test'}).catch(e => console.log(e.message));
