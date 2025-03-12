import { FormEvent, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../css/auth.css';
import { useLogin } from '../hooks/useLogin';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useLogin();

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Read the requested page from state, if present, otherwise redirect to home
    const from = searchParams.get('logout')
        ? '/'
        : (location.state?.from?.pathname || '/');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validazione base
        if (!email || !password) {
            alert('Please fill in all the fields');
            return;
        }

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Error during login:', err);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-left">
                    <img src={logo} alt="Selfie" />
                </div>
                <div className="auth-right">
                    <h1 className="auth-title">Welocme back</h1>
                    <p className="auth-subtitle">Log into your Seflie account</p>

                    <Form className="auth-form" onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </Form.Group>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="auth-button"
                            onClick={handleSubmit}
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </Button>

                        {error && <div className="auth-error">{error}</div>}

                        <div className="auth-links">
                            <span>Don't have an account?</span>
                            <Link to="/signup">Register</Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
};

export default Login;
