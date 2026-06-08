import Sidenav from "@/app/components/ui/sidenav";

export default function DashboardPage() {
    return (
        <Sidenav>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200">
                <h1 className="text-3xl font-black text-zinc-900 mb-2">Tableau de bord</h1>
                <p className="text-zinc-600 font-medium mb-6">
                    Bienvenue sur l'application de gestion des Fermes JN Beauchemin.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 shadow-sm flex flex-col items-center justify-center min-h-[160px]">
                        <span className="text-4xl mb-3">📦</span>
                        <h3 className="font-bold text-green-900 text-lg">Inventaire</h3>
                        <p className="text-green-700 text-sm text-center mt-1">Gérez vos stocks et commandes</p>
                    </div>
                    
                    <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 shadow-sm flex flex-col items-center justify-center min-h-[160px]">
                        <span className="text-4xl mb-3">🐄</span>
                        <h3 className="font-bold text-yellow-900 text-lg">Rations</h3>
                        <p className="text-yellow-700 text-sm text-center mt-1">Calculez les rations alimentaires</p>
                    </div>
                </div>
            </div>
        </Sidenav>
    );
}
