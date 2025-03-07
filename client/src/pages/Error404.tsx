import React from 'react';
import { Container, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Error404: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container className="p-5 text-center">
            <Image src={logo} alt="Logo" fluid className="mb-4" />
            <h1 className="display-4">404 - Page not found</h1>
            <p className="lead">
                It looks like you've reached a non-existent page.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
                Go back to home
            </button>
        </Container>
    );
};

export default Error404;