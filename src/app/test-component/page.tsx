"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export async function getServerSideProps() {
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();
  return { props: { data } };
}

interface Props {
  data: { id: number; title: string }[];
}

export default function TestComponent({ data }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = "Test Page";
  }, []);

  function handleNavigate() {
    router.push("/dashboard");
  }

  return (
    <>
      <Head>
        <title>Test Component</title>
        <meta name="description" content="A test page" />
      </Head>

      <div>
        <h1>Test Component</h1>

        <img src="/hero.png" width={800} height={400} alt="Hero" />

        <a href="/dashboard">Go to Dashboard</a>

        <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
        <button onClick={handleNavigate}>Navigate</button>

        <ul>
          {data?.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
