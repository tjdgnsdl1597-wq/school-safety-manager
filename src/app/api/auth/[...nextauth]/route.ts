import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

// URL 정리 함수
const getCleanUrl = () => {
  const url = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  // 공백 제거 및 중복 프로토콜 정리
  return url.trim()
    .replace(/\s+/g, '')
    .replace(/^https?:\/\/\s*https?:\/\//, 'https://')
    .replace(/^http:\/\/\s*http:\/\//, 'http://');
};

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Simple admin check using environment variables
        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: '1',
            name: '관리자',
            email: 'admin@school-safety.com',
            role: 'admin'
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub || '';
        session.user.role = token.role;
      }
      return session;
    },
  },
};

// 환경 변수에서 URL 정리
process.env.NEXTAUTH_URL = getCleanUrl();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };