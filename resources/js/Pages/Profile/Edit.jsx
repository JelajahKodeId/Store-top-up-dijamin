import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Card from '@/Components/ui/Card';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-black text-store-dark">
                        Pengaturan Profil
                    </h2>
                    <p className="text-sm text-store-muted mt-1">
                        Kelola informasi akun dan keamanan data Anda.
                    </p>
                </div>
            }
        >
            <Head title="Profil Saya" />

            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* Profile Info */}
                <Card className="animate-fade-in-up">
                    <Card.Body>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </Card.Body>
                </Card>

                {/* Password Change */}
                <Card className="animate-fade-in-up [animation-delay:100ms]">
                    <Card.Body>
                        <UpdatePasswordForm />
                    </Card.Body>
                </Card>

                {/* Danger Zone */}
                <Card variant="flat" className="animate-fade-in-up [animation-delay:200ms] !border-red-100 bg-red-50/10">
                    <Card.Body>
                        <DeleteUserForm />
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
