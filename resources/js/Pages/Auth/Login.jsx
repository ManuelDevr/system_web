import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        website: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            {status && (
                <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 duration-300">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                        <AlertCircle size={18} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-tighter text-emerald-800">
                        {status}
                    </p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                {/* Honeypot anti-bot: el campo "website" es invisible para
                    humanos (un bot lo rellena robóticamente). El backend lo
                    rechaza con validación max:0. */}
                <input
                    type="text"
                    name="website"
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
                />
                <div>
                    <label className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Correo Electrónico
                    </label>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:text-indigo-600">
                            <Mail size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-800 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-0 group-hover:bg-slate-100"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nombre@ejemplo.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="ml-1 mt-2" />
                </div>

                <div>
                    <div className="mb-2 ml-1 flex items-center justify-between">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Contraseña
                        </label>
                        {/* {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )} */}
                    </div>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:text-indigo-600">
                            <Lock size={18} className="text-slate-400" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full rounded-2xl border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 font-medium text-slate-800 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-0 group-hover:bg-slate-100"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                    <InputError
                        message={errors.password}
                        className="ml-1 mt-2"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="group flex cursor-pointer items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 transition-all focus:ring-indigo-500"
                        />
                        <span className="ms-3 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-700">
                            Recordarme
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        ) : (
                            <>
                                <LogIn size={18} />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
