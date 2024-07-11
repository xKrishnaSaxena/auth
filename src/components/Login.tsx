import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();
  const handleSubmit = () => {
    navigate("/");
  };
  return (
    <div>
      <div>Login</div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <button>Forgot Password?</button>
    </div>
  );
};
