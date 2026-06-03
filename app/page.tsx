
'use client';

import { signIn } from "next-auth/react";
import logo from '../public/images/logo.png';


export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] px-4">
      {/* Main Login Container */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-zinc-200/60 text-center">

        {/* Placeholder Container for the Logo */}
        <div className="w-full h-70 flex items-center justify-center mb-8  text-zinc-400 text-sm font-medium">
          <img src={logo.src} alt="Logo Fermes J.N. Beauchemin"></img>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
          Se connecter
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Accédez à votre plateforme de gestion agricole
        </p>

        {/* Microsoft Sign-In Button */}
        <button
          onClick={() => signIn("microsoft-entra-id", { redirectTo: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-zinc-200 bg-white text-zinc-700 font-semibold rounded-lg shadow-sm hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100 transition-all duration-200 text-sm"
        >
          {/* Native Microsoft Grid Icon Colors */}
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H11V11H0V0Z" fill="#F25022" />
            <path d="M12 0H23V11H12V0Z" fill="#7FBA00" />
            <path d="M0 12H11V23H0V12Z" fill="#00A4EF" />
            <path d="M12 12H23V23H12V12Z" fill="#FFB900" />
          </svg>
          Se connecter avec Microsoft
        </button>

      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-zinc-400 font-medium tracking-wide uppercase">
        <span>Production Laitière</span>
        <span className="h-1 w-1 rounded-full bg-[#15803D]"></span>
        <span>Céréalière</span>
        <span className="h-1 w-1 rounded-full bg-[#15803D]"></span>
        <span>Acéricole</span>
      </div>
    </div>
  );
}