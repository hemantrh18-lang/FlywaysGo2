FLYWAYSGO - STARTER WEBSITE FILES

Files:
1. index.html             Customer-facing website
2. style.css              Website design
3. app.js                 Deals + booking request form
4. admin.html             Private admin login/dashboard
5. admin.js               Admin functions
6. supabase-setup.sql     Database tables and initial security policies
7. privacy.html           Privacy notice starter (must be completed)

IMPORTANT:
- This is a manual booking-request website. It does NOT connect to live airline inventory and does NOT issue tickets automatically.
- Do not accept payment until your authorized travel agent confirms current fare and seats, and you share the final terms with the customer.
- The sample deals shown before Supabase setup are DEMO placeholders. Remove/replace them before public launch.
- Replace the Supabase URL and anon public key in BOTH app.js and admin.js.
- Never put the Supabase service_role key in browser code.

SETUP (beginner steps):
A. Create a NEW Supabase project. Keep it separate from Meesho Sale.
B. In Supabase, open SQL Editor, create a new query, paste supabase-setup.sql, and run it.
C. In Supabase Project Settings > API, copy Project URL and anon/public key.
D. Open app.js and admin.js. Replace:
   PASTE_YOUR_SUPABASE_PROJECT_URL
   PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY
   with the values from your new project.
E. In Supabase Authentication, create an admin user with your email and a strong password.
F. Upload all files to a new GitHub repository (or your hosting provider).
G. Open index.html website and test one booking request. Sign in at admin.html and verify it appears.
H. Before public launch, restrict admin policies to a dedicated admin role/user, complete privacy notice, replace support email, remove demo data, verify your travel agent and agreement, and test the entire ticket/refund process.

SECURITY NOTE:
The starter SQL lets any authenticated Supabase user manage the admin tables. For a real launch, use a dedicated admin role and policies that check that role (or an admin allow-list). Create only your own admin account and do not enable public sign-up. Ask for a security review before taking real customer data.
