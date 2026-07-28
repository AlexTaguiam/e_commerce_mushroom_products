// Update your App.tsx imports to look like this:
import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";

function App() {
  return (
    <>
      <h1 className="bg-amber-700">This is app</h1>
    </>
  );
}

export default App;
