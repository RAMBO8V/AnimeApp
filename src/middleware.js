export { default } from 'next-auth/middleware';

export const config = {
    matcher: [
        '/admin',
        '/admin/users',
        '/anime/:path*/edit',
        '/anime/:path*/track',
        '/profile',
    ],
};
