import SignInButton from "@/components/auth/SignInButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-24">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            Welcome to My App
          </h1>
          <p className="text-gray-600">Sign in with Google to continue</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
