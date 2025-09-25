// app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-5xl font-bold">
          Welcome to <span className="text-blue-600">Next.js 13!</span>
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs <span>-&gt;</span>
          </h2>
          <p className="m-0 text-sm opacity-50">
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Learn <span>-&gt;</span>
          </h2>
          <p className="m-0 text-sm opacity-50">
            Learn about Next.js in an interactive course with quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Templates <span>-&gt;</span>
          </h2>
          <p className="m-0 text-sm opacity-50">
            Discover and deploy boilerplate example Next.js projects.
          </p>
        </a>

        <a
          href="https://vercel.com/new"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Deploy <span>-&gt;</span>
          </h2>
          <p className="m-0 text-sm opacity-50">
            Instantly deploy your Next.js site with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}
