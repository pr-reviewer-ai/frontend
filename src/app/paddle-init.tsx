"use client";

import Script from "next/script";

export function PaddleInit() {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="lazyOnload"
      onLoad={() => {
        const Paddle = (window as any).Paddle;
        if (!Paddle) return;
        const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        const env = process.env.NEXT_PUBLIC_PADDLE_ENV; // "sandbox" or "production"
        if (token) {
          if (env === "sandbox") {
            Paddle.Environment.set("sandbox");
          }
          Paddle.Initialize({ token });
        }
      }}
    />
  );
}