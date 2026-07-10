"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/app/lib/client-auth";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faLaptop, faArrowRightFromBracket, faSpinner, faTrash, faEye, faEyeSlash, faExclamationTriangle, faShieldHalved, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faChrome, faSafari, faFirefox, faEdge, faOpera } from "@fortawesome/free-brands-svg-icons";
import { UAParser } from "ua-parser-js";

interface User {
    id: string;
    name: string;
    email: string;
}

export default function AccountSettings({ user, currentSessionId }: { user: User, currentSessionId: string }) {
    const router = useRouter();

    // States for Update Name
    const [name, setName] = useState(user.name);
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [nameMessage, setNameMessage] = useState("");

    // States for Change Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [pwdMessage, setPwdMessage] = useState("");
    const [pwdStrength, setPwdStrength] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // States for Sessions
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // @ts-ignore
                const { data } = await authClient.listSessions();
                if (data) {
                    const parsedSessions = await Promise.all(data.map(async (s: any) => {
                        let location = "Localisation inconnue";
                        if (s.ipAddress && s.ipAddress !== "::1" && s.ipAddress !== "127.0.0.1") {
                            try {
                                const res = await fetch(`http://ip-api.com/json/${s.ipAddress}`);
                                const ipData = await res.json();
                                if (ipData.status === "success") {
                                    location = `${ipData.city}, ${ipData.country}`;
                                }
                            } catch(e) {}
                        } else if (s.ipAddress === "::1" || s.ipAddress === "127.0.0.1") {
                            location = "Machine locale";
                        }

                        const parser = new UAParser(s.userAgent || "");
                        const browser = parser.getBrowser().name || "Navigateur inconnu ";
                        const os = parser.getOS().name || "OS inconnu";
                        
                        return { ...s, location, browser, os };
                    }));
                    setSessions(parsedSessions);
                }
            } catch (err) {
                console.error("Erreur chargement sessions", err);
            } finally {
                setIsLoadingSessions(false);
            }
        };
        fetchSessions();
    }, []);

    const evaluatePassword = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        setPwdStrength(score);
    };

    const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewPassword(val);
        evaluatePassword(val);
    };

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingName(true);
        setNameMessage("");
        try {
            // @ts-ignore
            const { error } = await authClient.updateUser({ name });
            if (error) throw error;
            setNameMessage("Nom mis à jour avec succès !");
            router.refresh();
        } catch (error: any) {
            setNameMessage(error.message || "Erreur lors de la mise à jour");
        } finally {
            setIsUpdatingName(false);
        }
    };

    const confirmPasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setPwdMessage("Les mots de passe ne correspondent pas.");
            return;
        }
        if (pwdStrength < 3) {
            setPwdMessage("Le mot de passe est trop faible. Utilisez au moins 8 caractères, des lettres, des chiffres et des majuscules.");
            return;
        }
        setShowModal(true);
    };

    const handleChangePassword = async () => {
        setIsChangingPassword(true);
        setPwdMessage("");
        try {
            // @ts-ignore
            const { error } = await authClient.changePassword({
                newPassword,
                currentPassword,
                revokeOtherSessions: true
            });
            if (error) throw error;
            setPwdMessage("Mot de passe modifié avec succès !");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowModal(false);
        } catch (error: any) {
            setPwdMessage(error.message || "Erreur, vérifiez votre mot de passe actuel");
            setShowModal(false);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authClient.signOut();
        } finally {
            router.push("/");
        }
    };

    const handleRevokeSession = async (sessionToken: string) => {
        try {
            // @ts-ignore
            await authClient.revokeSession({ token: sessionToken });
            setSessions(sessions.filter(s => s.token !== sessionToken));
        } catch (error) {
            console.error(error);
        }
    };

    const getStrengthColor = () => {
        if (pwdStrength <= 2) return "bg-red-500";
        if (pwdStrength === 3) return "bg-orange-500";
        if (pwdStrength >= 4) return "bg-green-500";
        return "bg-zinc-200";
    };

    const getStrengthLabel = () => {
        if (pwdStrength <= 2) return "Faible";
        if (pwdStrength === 3) return "Moyen";
        if (pwdStrength >= 4) return "Fort";
        return "";
    };

    return (
        <div className="space-y-6 relative">
            {/* Modal de confirmation */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-zinc-200 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl" />
                        </div>
                        <h3 className="text-2xl font-black text-center text-zinc-900 mb-2">Modifier le mot de passe</h3>
                        <p className="text-center text-zinc-600 font-medium mb-6">
                            Êtes-vous sûr de vouloir modifier votre mot de passe ? Vous serez déconnecté de vos autres appareils.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-800 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="flex-1 px-4 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isChangingPassword ? <FontAwesomeIcon icon={faSpinner} spin /> : "Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Informations Personnelles */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-6">
                    <FontAwesomeIcon icon={faPen} className="text-zinc-400" />
                    Informations personnelles
                </h2>
                <form onSubmit={handleUpdateName} className="max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Nom complet</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none font-medium text-black"
                            required
                        />
                    </div>
                    {nameMessage && (
                        <p className={`text-sm font-medium ${nameMessage.includes("succès") ? "text-green-600" : "text-red-600"}`}>
                            {nameMessage}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isUpdatingName || name === user.name}
                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUpdatingName ? <FontAwesomeIcon icon={faSpinner} spin /> : "Enregistrer"}
                    </button>
                </form>
            </div>

            {/* Sécurité */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-6">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-zinc-400" />
                    Sécurité et Mot de passe
                </h2>
                <form onSubmit={confirmPasswordChange} className="max-w-md space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Mot de passe actuel</label>
                        <input
                            type={showPwd ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-black pr-12"
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPwd(!showPwd)}
                            className="absolute right-4 top-[34px] text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={showPwd ? faEyeSlash : faEye} />
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Nouveau mot de passe</label>
                        <input
                            type={showPwd ? "text" : "password"}
                            value={newPassword}
                            onChange={handlePasswordInput}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-black"
                            required
                        />
                        {/* Jauge de complexité */}
                        {newPassword && (
                            <div className="mt-3 space-y-1">
                                <div className="flex gap-1 h-2">
                                    {[1, 2, 3, 4].map(idx => (
                                        <div 
                                            key={idx} 
                                            className={`flex-1 rounded-full transition-all duration-300 ${pwdStrength >= idx ? getStrengthColor() : "bg-zinc-200"}`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs font-bold text-right ${pwdStrength >= 4 ? "text-green-600" : pwdStrength === 3 ? "text-orange-500" : "text-red-500"}`}>
                                    {getStrengthLabel()}
                                </p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Confirmer le mot de passe</label>
                        <input
                            type={showPwd ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-black"
                            required
                        />
                    </div>
                    {pwdMessage && (
                        <p className={`text-sm font-medium ${pwdMessage.includes("succès") ? "text-green-600" : "text-red-600"}`}>
                            {pwdMessage}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                        className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-900 transition-colors disabled:opacity-50 flex items-center gap-2 mt-4"
                    >
                        Mettre à jour
                    </button>
                </form>
            </div>

            {/* Sessions Actives */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2 mb-6">
                    <FontAwesomeIcon icon={faLaptop} className="text-zinc-400" />
                    Sessions Actives
                </h2>
                {isLoadingSessions ? (
                    <div className="flex items-center gap-2 text-zinc-500 font-medium">
                        <FontAwesomeIcon icon={faSpinner} spin /> Chargement des sessions...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session, index) => {
                            const isCurrent = session.id === currentSessionId;
                            
                            const getBrowserIcon = (browserName: string) => {
                                const name = (browserName || "").toLowerCase();
                                if (name.includes("chrome")) return faChrome;
                                if (name.includes("safari")) return faSafari;
                                if (name.includes("firefox")) return faFirefox;
                                if (name.includes("edge")) return faEdge;
                                if (name.includes("opera")) return faOpera;
                                return faGlobe;
                            };
                            
                            return (
                                <div key={index} className={`flex items-center justify-between p-5 rounded-2xl border ${isCurrent ? "border-green-300 bg-green-50/50" : "border-zinc-200 bg-zinc-50"} transition-all`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-sm ${isCurrent ? "bg-white text-green-600 border border-green-200" : "bg-white text-zinc-500 border border-zinc-200"}`}>
                                            <FontAwesomeIcon icon={getBrowserIcon(session.browser)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="font-black text-zinc-900 text-lg">{session.os}</p>
                                                {isCurrent && (
                                                    <span className="px-2.5 py-1 text-xs font-black text-green-800 bg-green-100 rounded-lg">Votre session</span>
                                                )}
                                            </div>
                                            <div className="text-sm font-medium text-zinc-500 space-y-0.5">
                                                <p>Navigateur : {session.browser}</p>
                                                <p>Lieu : {session.location}</p>
                                                <p>Créée le : {new Date(session.createdAt).toLocaleDateString('fr-CA', { timeZone: 'America/Toronto' })} à {new Date(session.createdAt).toLocaleTimeString('fr-CA', {timeZone: 'America/Toronto', hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Zone de Danger - Déconnexion */}
            <div className="pt-4 pb-10">
                <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto px-8 py-4 bg-red-50 text-red-600 font-black rounded-2xl border-2 border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-3 text-lg"
                >
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                    Se déconnecter de l'application
                </button>
            </div>
        </div>
    );
}
