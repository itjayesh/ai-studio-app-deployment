
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Logout: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (context?.logout) {
            context.logout();
        }
        // Redirect to live gigs page after logout
        navigate('/live', { replace: true });
    }, [context, navigate]);

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-white">Logging you out...</h1>
                <p className="text-gray-400">You will be redirected shortly.</p>
            </div>
        </div>
    );
};

export default Logout;
