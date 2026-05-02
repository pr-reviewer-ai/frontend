"use client";

import Script from "next/script";
import { env } from "next-runtime-env";

export function PaddleInit() {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="lazyOnload"
      onLoad={() => {
        const Paddle = (window as any).Paddle;
        if (!Paddle) return;
        const token = env("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
        const paddleEnv = env("NEXT_PUBLIC_PADDLE_ENV");
        if (token) {
          if (paddleEnv === "sandbox") {
            Paddle.Environment.set("sandbox");
          }
          Paddle.Initialize({ token });
        }
      }}
    />
  );
}