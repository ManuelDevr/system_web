import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { FaTrashAlt, FaExclamationTriangle, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
        setShowPassword(false);
    };

    return (
        <section className={`space-y-5 ${className}`}>
            <header className="mb-2">
                <p className="text-sm text-slate-500 mt-1">
                    Una vez eliminada tu cuenta, todos los datos serán borrados permanentemente. Descarga cualquier información importante antes de continuar.
                </p>
            </header>

            {/* Alerta de advertencia */}
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" size={16} />
                <p className="text-sm text-red-700">
                    Esta acción es <strong>irreversible</strong>. Todos tus datos, configuraciones y registros serán eliminados permanentemente.
                </p>
            </div>

            <DangerButton onClick={confirmUserDeletion} className="flex items-center gap-2">
                <FaTrashAlt size={13} />
                Eliminar mi cuenta
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    {/* Icono de advertencia */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-full bg-red-100">
                            <FaTrashAlt className="text-red-600" size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                ¿Eliminar cuenta?
                            </h2>
                            <p className="text-xs text-slate-500">Esta acción no se puede deshacer</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-red-50 border border-red-100 p-3 mb-5">
                        <p className="text-sm text-red-700">
                            Todos tus datos serán eliminados <strong>permanentemente</strong>. Ingresa tu contraseña para confirmar.
                        </p>
                    </div>

                    <div className="mb-5">
                        <InputLabel
                            htmlFor="password"
                            value="Ingresa tu contraseña para confirmar"
                            className="text-slate-700 font-semibold text-sm mb-1"
                        />
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                                <FaLock size={13} />
                            </span>
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full pl-9 pr-10 rounded-lg border border-slate-200 focus:border-red-400 focus:ring-red-200"
                                isFocused
                                placeholder="Tu contraseña actual"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="px-5">
                            Cancelar
                        </SecondaryButton>
                        <DangerButton
                            disabled={processing || !data.password}
                            className="flex items-center gap-2 px-5"
                        >
                            <FaTrashAlt size={12} />
                            {processing ? 'Eliminando...' : 'Eliminar cuenta'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
