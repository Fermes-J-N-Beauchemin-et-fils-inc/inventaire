'use client';

import { useState } from "react";
import logo from '../public/images/logo.png';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tentative de connexion :", { username, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] px-4 py-8">
      {/* Conteneur principal large et confortable */}
      <div className="w-full max-w-xl bg-white p-8 sm:p-14 rounded-xl shadow-sm border border-zinc-200/60">

        {/* Conteneur du Logo */}
        <div className="w-full h-44 flex items-center justify-center mb-10">
          <img
            src={logo.src}
            alt="Logo Fermes J.N. Beauchemin"
            className="max-h-full object-contain"
          />
        </div>

        {/* Titres */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
            Se connecter
          </h1>
          <p className="text-base text-zinc-500">
            Accédez à votre plateforme de gestion agricole
          </p>
        </div>

        {/* Formulaire avec champs et bouton agrandis */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-base font-semibold text-zinc-700 mb-2"
            >
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: admin_beauchemin"
              className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-200 text-base shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-base font-semibold text-zinc-700 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all duration-200 text-base shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 px-6 py-4 bg-[#15803D] hover:bg-[#16a34a] active:bg-[#15803D] text-white font-bold rounded-xl shadow-md transition-all duration-200 text-base tracking-wide"
          >
            Se connecter
          </button>
        </form>

      </div>

      {/* Pied de page adaptatif */}
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left text-xs text-zinc-400 font-medium tracking-wide uppercase">
        <span>La Ferme JN Beauchemin Et Fils.inc</span>
        <span className="hidden sm:inline h-1 w-1 rounded-full bg-[#15803D]"></span>
        <span>2139 rang St-Pierre, Saint-Ours QC J0G 1P0</span>
        <span className="hidden sm:inline h-1 w-1 rounded-full bg-[#15803D]"></span>
        <span>450 785-5537</span>
      </div>
    </div>
  );
}