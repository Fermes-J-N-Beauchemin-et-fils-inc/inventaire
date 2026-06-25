'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/lib/client-auth";
import logo from '@/public/images/logo.png';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data, error: signInError } = await signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError("Identifiants invalides. Veuillez vérifier votre courriel et mot de passe.");
      setIsLoading(false);
    } else {
      // Redirection après succès
      router.push("/dashboard");
    }
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

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold text-center">
            {error}
          </div>
        )}

        {/* Formulaire avec champs et bouton agrandis */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-base font-semibold text-zinc-700 mb-2"
            >
              Courriel
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: admin@example.com"
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
            disabled={isLoading}
            className="w-full mt-4 px-6 py-4 bg-[#15803D] hover:bg-[#16a34a] active:bg-[#15803D] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all duration-200 text-base tracking-wide flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
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