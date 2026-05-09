"use client";

import { trpc } from "@/lib/trpc";
import { Users, Mail, Shield } from "lucide-react";

const ROLE_META: Record<string, { label: string; color: string }> = {
  OWNER:   { label: "Owner",   color: "bg-purple-100 text-purple-700" },
  MANAGER: { label: "Manager", color: "bg-blue-100 text-blue-700" },
  AGENT:   { label: "Agent",   color: "bg-gray-100 text-gray-600" },
};

export default function PartnerTeamPage() {
  const { data: me } = trpc.user.me.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2545]">Team</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your team members and permissions.</p>
        </div>
      </div>

      {/* Current user */}
      {me && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#0B2545]">
            <Shield className="h-4 w-4" /> Your Account
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B2545] text-lg font-bold text-[#C9A227]">
              {(me.firstName?.[0] ?? me.email[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-[#0B2545]">
                {me.firstName && me.lastName ? `${me.firstName} ${me.lastName}` : me.email}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                {me.email}
              </div>
            </div>
            <div className="ml-auto">
              {me.memberships.map((m) => {
                const meta = ROLE_META[m.role] ?? ROLE_META.AGENT;
                return (
                  <span key={m.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}>
                    {meta.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Team invite placeholder */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-1 flex items-center gap-2 font-semibold text-[#0B2545]">
          <Users className="h-4 w-4" /> Team Members
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Invite agents and managers to collaborate on your pipeline.
        </p>

        <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No additional team members yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Team invitations are managed through your partner agreement with Trinity Finance.
          </p>
          <a
            href="mailto:partners@trinityfinance.com"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-[#C9A227] hover:bg-[#0d2d52] transition"
          >
            <Mail className="h-4 w-4" />
            Contact Partner Support
          </a>
        </div>
      </div>

      {/* Role guide */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0B2545]">Role Permissions</h2>
        <div className="space-y-3">
          {[
            { role: "Owner", perms: "Full access: manage team, view all commissions, submit applications, configure settings." },
            { role: "Manager", perms: "View and manage all team applications, view commission summaries, submit applications." },
            { role: "Agent", perms: "Submit and view their own applications only. No access to team commissions or settings." },
          ].map((r) => (
            <div key={r.role} className="flex gap-4 text-sm">
              <span className={`w-20 flex-shrink-0 rounded-full px-3 py-0.5 text-center text-xs font-semibold ${ROLE_META[r.role.toUpperCase()]?.color ?? "bg-gray-100 text-gray-600"}`}>
                {r.role}
              </span>
              <span className="text-gray-500">{r.perms}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
