import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // ...existing login logic...
    navigate('/home'); // Redirect to homepage after login
  };

  return (
    // ...existing JSX...
    <button onClick={handleLogin}>Login</button>
    // ...existing JSX...
  );
}

export default Login;