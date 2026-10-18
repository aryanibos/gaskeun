import React, { useState } from 'react';
import {
  Video,
  CheckCircle2,
  Unplug,
  Link2,
  Mail,
  Send,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PlatformName } from '../types';
import { Instagram, Linkedin } from '../components/SharedUI';

interface AdminConnectedScreenProps {
  connectedPlatforms: Record<PlatformName, boolean>;
  onToggleConnect: (platform: PlatformName) => void;
}

export default function AdminConnectedScreen({
  connectedPlatforms,
  onToggleConnect,
}: AdminConnectedScreenProps) {
  const [emailNotif, setEmailNotif] = useState(true);
  const [telegramNotif, setTelegramNotif] = useState(true);
  const [testSent, setTestSent] = useState<string | null>(null);

  const platforms: {
    name: PlatformName;
    handle: string;
    accountType: string;
    tokenStatus: string;
    lastSync: string;
    icon: React.ReactNode;
  }[] = [
    {
      name: 'Instagram',
      handle: '@lumbung.studio',
      accountType: 'Instagram Graph API · Business Account',
      tokenStatus: 'OAuth 2.0 healthy · Expires in 54 days',
      lastSync: 'Synced 4 mins ago',
      icon: <Instagram size={22} className="text-[#E1306C]" />,
    },
    {
      name: 'LinkedIn',
      handle: 'Lumbung Studio Official',
      accountType: 'LinkedIn Marketing Developer API · Company Page',
      tokenStatus: 'OAuth 2.0 healthy · Expires in 82 days',
      lastSync: 'Synced 12 mins ago',
      icon: <Linkedin size={22} className="text-[#0A66C2]" />,
    },
    {
      name: 'TikTok',
      handle: '@lumbungstudio.id',
      accountType: 'TikTok Content Posting API · Creator Business',
      tokenStatus: 'Ready to authorize direct video & photo publishing',
      lastSync: 'Not connected',
      icon: <Video size={22} className="text-[#0B1F4D]" />,
    },
  ];

  const triggerTestMessage = (channel: string) => {
    setTestSent(`Sent test notification to ${channel}`);
    setTimeout(() => setTestSent(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="gaskeun-h1">Connected accounts &amp; notifications</h1>
        <p className="text-sm text-[#52607E] mt-1">
          Configure social publishing APIs for Lumbung Studio and manage instant approval alert channels.
        </p>
      </div>

      {testSent && (
        <div className="rounded-xl bg-[#E5F5EC] border border-[#146C3C]/20 px-4 py-3 text-xs font-bold text-[#146C3C] flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{testSent}</span>
        </div>
      )}

      {/* Platform Cards with Connect / Disconnect */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {platforms.map((plat) => {
          const isConnected = connectedPlatforms[plat.name];
          return (
            <div
              key={plat.name}
              className="gaskeun-card p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] flex items-center justify-center">
                    {plat.icon}
                  </div>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F5EC] text-[#146C3C] text-xs font-extrabold">
                      <CheckCircle2 size={13} />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2F9] text-[#52607E] text-xs font-extrabold">
                      Disconnected
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-[#0B1F4D]">{plat.name}</h2>
                  <p className="text-xs font-bold text-[#1450E0] mt-0.5">{plat.handle}</p>
                  <p className="text-xs text-[#52607E] mt-1">{plat.accountType}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F5F7FC] border border-[#E6ECF5] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#0B1F4D]">
                    <ShieldCheck size={14} className="text-[#1450E0]" />
                    <span>Auto-publish status</span>
                  </div>
                  <p className="text-[11px] text-[#52607E]">
                    {isConnected ? plat.tokenStatus : 'Connect account to enable 1-click publishing'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6ECF5] flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#52607E] flex items-center gap-1">
                  <RefreshCw size={12} />
                  {isConnected ? plat.lastSync : 'OAuth 2.0 ready'}
                </span>

                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => onToggleConnect(plat.name)}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-[#FECACA] bg-white hover:bg-[#FEF2F2] text-xs font-extrabold text-[#991B1B] inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Unplug size={14} />
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleConnect(plat.name)}
                    className="gaskeun-btn-primary px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Link2 size={14} />
                    Connect {plat.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Channel Switches (Email, Telegram) */}
      <div className="gaskeun-card p-6 space-y-5">
        <div>
          <h2 className="text-base font-extrabold text-[#0B1F4D]">
            Notification channels
          </h2>
          <p className="text-xs text-[#52607E]">
            Alert Head Designers when new posts are submitted and notify Staff Designers when revisions or approvals happen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Switch Card */}
          <div className="p-5 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E6ECF5] text-[#1450E0] flex items-center justify-center">
                  <Mail size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B1F4D]">Email notifications</h3>
                  <p className="text-xs text-[#52607E]">design-team@lumbung.studio</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={emailNotif}
                onClick={() => setEmailNotif(!emailNotif)}
                className={`w-12 h-7 rounded-full p-1 transition cursor-pointer flex items-center ${
                  emailNotif ? 'bg-[#1450E0] justify-end' : 'bg-[#D5DEEE] justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E6ECF5] text-xs">
              <span className="text-[#52607E]">
                Sends instant digest on submission, revision &amp; publish
              </span>
              <button
                type="button"
                onClick={() => triggerTestMessage('design-team@lumbung.studio (Email)')}
                className="font-extrabold text-[#1450E0] hover:underline cursor-pointer"
              >
                Send test
              </button>
            </div>
          </div>

          {/* Telegram Switch Card */}
          <div className="p-5 rounded-2xl bg-[#F5F7FC] border border-[#E6ECF5] flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E6ECF5] text-[#0891B2] flex items-center justify-center">
                  <Send size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0B1F4D]">Telegram bot alerts</h3>
                  <p className="text-xs text-[#52607E]">@GaskeunLumbungBot · #design-approvals</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={telegramNotif}
                onClick={() => setTelegramNotif(!telegramNotif)}
                className={`w-12 h-7 rounded-full p-1 transition cursor-pointer flex items-center ${
                  telegramNotif ? 'bg-[#1450E0] justify-end' : 'bg-[#D5DEEE] justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-xs block" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E6ECF5] text-xs">
              <span className="text-[#52607E]">
                Real-time group ping with direct Review Queue deep link
              </span>
              <button
                type="button"
                onClick={() => triggerTestMessage('@GaskeunLumbungBot (Telegram)')}
                className="font-extrabold text-[#1450E0] hover:underline cursor-pointer"
              >
                Send test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
