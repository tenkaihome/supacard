import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Phương thức POST thực tế để lừa hoàn toàn trình duyệt Chrome
  // Sau đó chuyển hướng ngay lập tức về trang Success
  return NextResponse.redirect(new URL("/success", request.url), 303);
}
