'use client';

import { useAuthActions } from '@convex-dev/auth/react';

export default function SignIn() {
  const { signIn } = useAuthActions();
  return (
    <div className="mx-auto flex h-screen w-96 flex-col items-center justify-center gap-8">
      <p>Log in to see the numbers</p>
      <button
        className="rounded-md bg-foreground px-4 py-2 text-background"
        type="button"
        onClick={() => {
          void signIn('google');
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
