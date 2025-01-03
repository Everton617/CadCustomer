import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const secret = process.env.AUTH_SECRET;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Verifica se o usuário está tentando acessar páginas de login ou cadastro
  const isAuthPage = ['/sign-in', '/sign-up'].includes(pathname);

  // Obtém o token de autenticação
  const token = await getToken({ req, secret });

  // Caso não tenha um token
  if (!token) {
    // Permite acesso às páginas de login e cadastro
    if (isAuthPage) {
      return NextResponse.next();
    }

    // Redireciona para a página de login
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Caso tenha um token e esteja em uma página de login ou cadastro, redireciona para a rota protegida
  if (isAuthPage) {
    return NextResponse.redirect(new URL('/form', req.url));
  }

  // Permite acesso às outras rotas
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/form/:path*', '/sign-in', '/sign-up'], // Define as rotas para o middleware
};
