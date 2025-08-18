// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const BLOCKED_IPS = ['125.212.158.49 ', '203.0.113.45']; // Thay thế bằng các IP bạn muốn chặn

export function middleware(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');

    if (ip && BLOCKED_IPS.includes(ip)) {
        console.log(`Blocked IP: ${ip} from accessing ${request.nextUrl.pathname}`);
        return new NextResponse('Access Denied', { status: 403 });
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/:path*', // Áp dụng middleware cho tất cả các đường dẫn
};
