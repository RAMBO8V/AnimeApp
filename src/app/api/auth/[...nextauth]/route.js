import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByUsername, validatePassword } from '@/lib/users';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const user = await getUserByUsername(credentials.username);
                if (!user) {
                    return null;
                }

                const isValid = await validatePassword(user, credentials.password);
                if (!isValid) {
                    return null;
                }

                // Return user without password hash
                return {
                    id: user.id,
                    name: user.username,
                    username: user.username,
                    role: user.role || 'user'
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.role = user.role || 'user';
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.role = token.role || 'user';
                // Add helper properties for easier checking
                session.user.isOwner = token.role === 'owner';
                session.user.isAdmin = token.role === 'admin' || token.role === 'owner';
                session.user.isUser = token.role === 'user';
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
