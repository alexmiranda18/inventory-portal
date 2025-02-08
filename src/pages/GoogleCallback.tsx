// pages/GoogleCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code'); // Extrai o código de autorização

    if (code) {
      // Envia o código para o backend
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback?code=${code}`, {
        method: 'GET',
       // headers: {
         // 'Content-Type': 'application/json',
       // },
       // body: JSON.stringify({ code }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem('token', data.token);
            navigate('/dashboard'); // Redireciona para o dashboard após o login
          } else {
            console.error('Erro no login com Google:', data);
            navigate('/login'); // Redireciona de volta para o login em caso de erro
          }
        })
        .catch((error) => {
          console.error('Erro:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Processando login com Google...</div>;
};

export default GoogleCallback;