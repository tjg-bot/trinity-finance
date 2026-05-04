import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false }, // No tracking on /apply
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-[#0B2545] px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <span className="font-bold text-[#C9A227]">Trinity Finance</span>
            <span className="ml-2 text-sm text-white/60">Secure Application</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillLockRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            256-bit SSL encrypted
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="mt-16 border-t px-4 py-6 text-center text-xs text-gray-400">
        <p>Trinity Finance - 613 Chillicothe Street, Portsmouth, Ohio 45662</p>
        <p className="mt-1">
          All applications are subject to credit approval. Equal Opportunity Lender.
          Your information is protected by 256-bit SSL encryption.
        </p>
      </footer>
    </div>
  );
}
