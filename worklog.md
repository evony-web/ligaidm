---
Task ID: 1
Agent: Main Agent
Task: Create admin login system for IDM League

Work Log:
- Added Admin model to Prisma schema (username, passwordHash, role)
- Installed bcryptjs for password hashing
- Created auth utility library (/src/lib/auth.ts) with password hashing, session token creation/verification, admin CRUD
- Created auth API helper (/src/lib/api-auth.ts) with requireAdmin middleware for API routes
- Created login API route (/api/auth/login) - POST with username/password, sets httpOnly cookie
- Created logout API route (/api/auth/logout) - POST, clears cookie
- Created session API route (/api/auth/session) - GET, checks cookie validity
- Created init-admin API route (/api/init-admin) - POST, seeds super admin jose/tazevsta
- Created AdminLogin component (/src/components/idm/admin-login.tsx) - login form with gold theme
- Updated Zustand store with adminAuth state (isAuthenticated, admin, setAdminAuth, clearAdminAuth)
- Updated AppShell to protect admin panel (shows AdminLogin instead of AdminPanel if not authenticated)
- Added session check on mount in AppShell
- Added admin status display and logout button in sidebar
- Protected 14 admin API routes with requireAdmin middleware
- Updated page.tsx to call init-admin on startup
- Fixed TypeScript error: changed requireAdmin to accept generic Request instead of NextRequest

Stage Summary:
- Super admin account: username=jose, password=tazevsta, role=super_admin
- All admin API routes now require authentication (POST/PUT/DELETE)
- GET routes remain public for data display
- Self-registration (/api/register) remains public
- Session uses httpOnly cookies with HMAC-signed tokens (7-day expiry)
- All lint and TypeScript checks pass
