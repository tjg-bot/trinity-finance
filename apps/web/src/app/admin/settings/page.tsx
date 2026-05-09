export const dynamic = "force-dynamic";

const SETTING_GROUPS = [
  {
    title: "Platform",
    items: [
      { key: "NEXT_PUBLIC_APP_URL", label: "App URL", env: true },
      { key: "DATABASE_URL", label: "Database", env: true, redact: true },
      { key: "REDIS_URL", label: "Redis", env: true, redact: true },
    ],
  },
  {
    title: "Authentication",
    items: [
      { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", label: "Clerk Publishable Key", env: true },
      { key: "CLERK_SECRET_KEY", label: "Clerk Secret Key", env: true, redact: true },
    ],
  },
  {
    title: "AI & Processing",
    items: [
      { key: "ANTHROPIC_API_KEY", label: "Anthropic API Key", env: true, redact: true },
      { key: "AWS_ACCESS_KEY_ID", label: "AWS Access Key", env: true, redact: true },
      { key: "AWS_REGION", label: "AWS Region", env: true },
      { key: "S3_BUCKET_NAME", label: "S3 Bucket", env: true },
    ],
  },
  {
    title: "Notifications",
    items: [
      { key: "RESEND_API_KEY", label: "Resend API Key", env: true, redact: true },
      { key: "TWILIO_ACCOUNT_SID", label: "Twilio SID", env: true, redact: true },
      { key: "FROM_EMAIL", label: "From Email", env: true },
      { key: "FROM_PHONE", label: "From Phone", env: true },
    ],
  },
];

function getEnvStatus(key: string, redact: boolean): { value: string; ok: boolean } {
  const val = process.env[key];
  if (!val) return { value: "Not set", ok: false };
  if (redact) return { value: `${val.slice(0, 6)}${"*".repeat(12)}`, ok: true };
  return { value: val, ok: true };
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Environment configuration status. Edit values in your deployment environment.
        </p>
      </div>

      {SETTING_GROUPS.map((group) => (
        <div key={group.title} className="rounded-lg border bg-white overflow-hidden">
          <div className="border-b bg-gray-50 px-6 py-3">
            <h2 className="text-sm font-semibold text-[#0B2545]">{group.title}</h2>
          </div>
          <div className="divide-y">
            {group.items.map((item) => {
              const { value, ok } = getEnvStatus(item.key, item.redact ?? false);
              return (
                <div key={item.key} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{item.label}</div>
                    <div className="font-mono text-xs text-gray-400">{item.key}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-500 max-w-[200px] truncate">
                      {value}
                    </span>
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${ok ? "bg-green-500" : "bg-red-400"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400">
        To update environment variables, edit your Vercel project settings or Railway service config and redeploy.
      </p>
    </div>
  );
}
