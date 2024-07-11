import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const navigate = useNavigate();
  const handleSubmit = () => {
    navigate("/");
  };
  return (
    <div>
      <div>Signup</div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Email" />
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};
