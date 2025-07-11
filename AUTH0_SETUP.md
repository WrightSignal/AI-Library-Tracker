# Auth0 Setup Guide

## Prerequisites

You'll need to create an Auth0 account and set up an application. Follow these steps:

## 1. Create Auth0 Application

1. Go to [Auth0 Dashboard](https://auth0.com)
2. Create a new application
3. Choose "Regular Web Application"
4. Note down your Domain, Client ID, and Client Secret

## 2. Configure Auth0 Application

In your Auth0 application settings:

### Allowed Callback URLs
```
http://localhost:3000/api/auth/callback
https://https://v0-silent-partners-ai-library.vercel.app//api/auth/callback
```

### Allowed Logout URLs
```
http://localhost:3000
https://v0-silent-partners-ai-library.vercel.app/
```

### Allowed Web Origins
```
http://localhost:3000
https://v0-silent-partners-ai-library.vercel.app/
```

## 3. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3003'
AUTH0_ISSUER_BASE_URL='dev-16eeg51tui1oqj3s.us.auth0.com'
AUTH0_CLIENT_ID='Ds306azmqYuehWbFmNC1hywiXdPy66OK'
AUTH0_CLIENT_SECRET='scWhVP8P53ul9h2SUxRrl28nRNfkCCN14FYhwdSQ2SAfsLPRDn-OyDOzVjE0FVxA'

# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=https://rklbdlwhlisxyszpyuip.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbGJkbHdobGlzeHlzenB5dWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzYxMTYsImV4cCI6MjA2NzE1MjExNn0.Y2VC6QGS9VJ3FqoBZOKSSUoJYbJfPn7dxK2GUWiZQiU
```

**Note**: Make sure to replace:
- `YOUR_DOMAIN` with your Auth0 domain (without https://)
- `YOUR_CLIENT_ID` with your Auth0 Client ID
- `YOUR_CLIENT_SECRET` with your Auth0 Client Secret

## 4. Generate AUTH0_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -hex 32
```

## 5. Features Added

The Auth0 integration includes:

- **Authentication**: Users must log in to access the dashboard
- **User Profile**: Dropdown menu with user info and logout
- **Protected Routes**: Dashboard is protected and requires authentication
- **Login/Logout**: Automatic redirects to Auth0 login page

## 6. Implementation Details

### Environment Variables
The setup uses the following environment variables:
- `AUTH0_SECRET`: Session encryption key
- `AUTH0_BASE_URL`: Your app's base URL
- `AUTH0_ISSUER_BASE_URL`: Your Auth0 domain URL
- `AUTH0_CLIENT_ID`: Your Auth0 app client ID
- `AUTH0_CLIENT_SECRET`: Your Auth0 app client secret

### Components Added
- `UserProfile`: User avatar dropdown with logout
- `ProtectedRoute`: Authentication wrapper component
- `AuthLoading`: Loading state for auth operations

### API Routes
The implementation creates manual API routes for:
- `/api/auth/login` - Redirects to Auth0 login
- `/api/auth/logout` - Logs out and redirects
- `/api/auth/callback` - Handles Auth0 callback (needs implementation)
- `/api/auth/me` - Returns user profile (needs implementation)

## 7. Usage

- **Login**: Users are redirected to Auth0 login page when accessing the app
- **Logout**: Click on user avatar → logout option
- **User Info**: User's name and email are displayed in the dropdown

## 8. Current Status

🚧 **In Progress**: The basic authentication flow is set up, but you'll need to:

1. **Set up environment variables** as described above
2. **Implement the callback handler** to exchange authorization codes for tokens
3. **Implement session management** to store user information
4. **Update the user profile components** to work with the session data

## 9. Next Steps for Full Implementation

To complete the Auth0 integration:

1. **Implement proper callback handling** with token exchange
2. **Add session management** using cookies or database
3. **Update user profile components** to read from the session
4. **Add proper error handling** for authentication flows

## 10. Alternative Approach

For a more complete out-of-the-box solution, consider using:
- **NextAuth.js** with Auth0 provider
- **Clerk** for a complete authentication solution
- **Supabase Auth** as an alternative

## Troubleshooting

If you encounter issues:

1. **Environment variables**: Ensure all variables are set correctly
2. **Callback URLs**: Verify your callback URLs in Auth0 dashboard match your local/production URLs
3. **HTTPS requirement**: Auth0 requires HTTPS in production

The application now has the basic Auth0 integration structure in place! 

Perfect! I've successfully integrated OpenGraph.io into your SP-AI-Library application. Here's what has been implemented:

## ✅ What's Been Added

### 1. **OpenGraph Data Storage**
- Updated `Tool` type definition with OpenGraph fields
- Added database columns: `og_title`, `og_description`, `og_image`, `og_site_name`, `og_last_fetched`
- Updated Supabase TypeScript definitions

### 2. **OpenGraph API Service**
- Created `/lib/opengraph.ts` with API integration functions
- Added `/app/api/opengraph/route.ts` API endpoint
- Supports both client-side and server-side fetching

### 3. **Enhanced Tool Cards**
- **Grid View**: Shows full OpenGraph images as headers with overlay action buttons
- **List View**: Displays OpenGraph thumbnails and enhanced metadata
- Falls back gracefully when OpenGraph data isn't available
- Uses OpenGraph title/description when available, with fallbacks

### 4. **Smart Tool Creation**
- **Auto-fetch**: Automatically fetches OpenGraph data when URL is entered (1-second debounce)
- **Auto-fill**: Populates tool name and description from OpenGraph data if fields are empty
- **Manual refresh**: Button to manually re-fetch OpenGraph data
- **Real-time preview**: Shows fetched website information in the form

### 5. **Environment Configuration**
- Updated `env.template` with OpenGraph API key placeholder

## 🚀 Next Steps

### 1. **Add Your API Key**
Add this line to your `.env.local` file:
```bash
OPENGRAPH_API_KEY=059b12fd-de40-4999-b45e-8932b662a368
```

### 2. **Update Your Database**
Run this SQL script in your Supabase SQL Editor:
```sql
-- Add OpenGraph metadata columns
ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_site_name TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS og_last_fetched TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tools_og_last_fetched ON tools(og_last_fetched);
```

### 3. **Restart Your Dev Server**
```bash
pnpm dev
```

## 🎉 How It Works

1. **When adding a new tool**: Enter a URL, and the system automatically fetches the website's OpenGraph metadata
2. **Enhanced cards**: Tool cards now display rich previews with logos, proper titles, and descriptions
3. **Smart fallbacks**: If OpenGraph data isn't available, it falls back to manually entered information
4. **Manual control**: You can manually refresh OpenGraph data using the "Refresh" button

The integration seamlessly enhances your existing tool library with rich visual previews and metadata, making your tool cards much more attractive and informative!

Try adding a new tool with a URL like `https://openai.com` or `https://github.com` to see the OpenGraph integration in action! 🚀 