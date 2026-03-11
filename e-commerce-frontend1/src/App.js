import Navbar from "./components/Navbar";
import "./styles/theme.css";
import AppRouter from "./router/AppRouter";

function App() {

  return (
    <div className="app">
      <Navbar/>
      <AppRouter />
    </div>
  );
}

export default App;