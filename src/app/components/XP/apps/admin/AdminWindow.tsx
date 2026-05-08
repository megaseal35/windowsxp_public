import { useState } from 'react';
import {
    useGetMeQuery,
    useLoginMutation,
    useLogoutMutation,
} from '../../../../store/authApi';

export default function AdminWindow() {
    const { data: me, isLoading } = useGetMeQuery();

    if (isLoading) {
        return <div className="window-body" style={{ padding: 12 }}>Checking session…</div>;
    }

    return (
        <div className="window-body" style={{ padding: 12 }}>
            {me?.loggedIn ? <AdminPanel /> : <LoginForm />}
        </div>
    );
}

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading, error }] = useLoginMutation();

    const onSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = async (e) => {
        e.preventDefault();
        if (!username || !password) return;
        try {
            await login({ username, password }).unwrap();
            setUsername('');
            setPassword('');
        } catch {
        }
    };

    const errorMsg = error
        ? (error && typeof error === 'object' && 'data' in error
            ? String((error as { data?: { error?: string } }).data?.error ?? 'Login failed')
            : 'Login failed')
        : null;

    return (
        <form onSubmit={onSubmit}>
            <div className="field-row-stacked" style={{ width: 240 }}>
                <label style={{color: '#000000'}} htmlFor="admin-username">Username</label>
                <input
                    id="admin-username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="field-row-stacked" style={{ width: 240, marginTop: 8 }}>
                <label style={{ color: '#000000' }} htmlFor="admin-password">Password</label>
                <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {errorMsg && (
                <ul className="post-dialog-errors"><li>{errorMsg}</li></ul>
            )}

            <section className="field-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" disabled={isLoading || !username || !password}>
                    {isLoading ? 'Signing in…' : 'Log in'}
                </button>
            </section>
        </form>
    );
}

function AdminPanel() {
    const [logout, { isLoading: loggingOut }] = useLogoutMutation();

    return (
        <section className="field-row" style={{ justifyContent: 'flex-end' }}>
            <button onClick={() => logout()} disabled={loggingOut}>
                {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
        </section>
    );
}
