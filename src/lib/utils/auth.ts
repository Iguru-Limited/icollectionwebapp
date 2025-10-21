import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthResponse } from "@/types/auth/userauthentication";
import { API_ENDPOINTS } from "@/lib/utils/constants";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Prepare data from user credentials
          const requestData = {
            username: credentials.username,
            pass_phrase: credentials.password
          };

          // Use external API endpoint for authentication
          const apiUrl = `${API_ENDPOINTS.BASE_URL}/api/auth/login.php`;
          
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });

          const responseText = await response.text();
          console.log("Authentication response:", responseText);

          if (!response.ok) {
            return null;
          }

          // Parse the response text as JSON
          let data: AuthResponse;
          try {
            data = JSON.parse(responseText);
          } catch {
            console.error("Failed to parse authentication response");
            return null;
          }
          
          // Validate the response structure
          if (!data.access_token || !data.user || !data.user.username) {
            return null;
          }

          return {
            id: data.user.username,
            username: data.user.username,
            role: data.role,
            token: data.access_token,
            refresh_token: data.refresh_token,
            company_details: data.user.company,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If user is already authenticated and accessing login, redirect to /user
      if (url === baseUrl + "/login") {
        return baseUrl + "/user";
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      // Default redirect to /user for successful auth
      return baseUrl + "/user";
    },
    async jwt({ token, user, trigger, session }) {
      // Handle token refresh
      if (trigger === 'update' && session?.token && session?.refresh_token) {
        token.token = session.token;
        token.refresh_token = session.refresh_token;
        // Set new token expiry (1 hour token lifetime)
        token.expiresAt = Date.now() + (60 * 60 * 1000);
        // Set refresh token expiry (assuming 7 days)
        token.refreshExpiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
        token.lastActivity = Date.now();
        return token;
      }

      if (user) {
        token.role = user.role;
        token.token = user.token;
        token.refresh_token = user.refresh_token;
        token.company_details = user.company_details;
        token.username = user.username;
        // Set token expiry to 1 hour from now (shorter for security)
        token.expiresAt = Date.now() + (60 * 60 * 1000);
        // Set refresh token expiry to 7 days
        token.refreshExpiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
        token.lastActivity = Date.now();
      }

      // Check if token is expired and needs refresh
      if (token.expiresAt && Date.now() >= token.expiresAt) {
        if (token.refresh_token && token.refreshExpiresAt && Date.now() < token.refreshExpiresAt) {
          // Token is expired but refresh token is still valid
          // This will be handled by the client-side refresh service
        } else {
          // Both tokens are expired, mark as expired
          token.expiresAt = 0;
        }
      }

      // Check for inactivity timeout (1 hour)
      if (token.lastActivity && Date.now() - token.lastActivity > (60 * 60 * 1000)) {
        token.expiresAt = 0; // Mark as expired
      }

      // Check for session timeout (6 hours)
      if (token.lastActivity && Date.now() - token.lastActivity > (6 * 60 * 60 * 1000)) {
        token.expiresAt = 0; // Mark as expired
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.token = token.token;
        session.user.refresh_token = token.refresh_token;
        session.user.company_details = token.company_details;
        session.user.username = token.username || '';
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors back to login page
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour in seconds (session timeout)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
