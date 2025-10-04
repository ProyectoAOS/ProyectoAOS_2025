import NavBar from "../navBar/NavBar";
import { Outlet } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <NavBar />
            </header>
            <section className="dashboard-content">
                {/* Aquí se renderizarán las páginas hijas */}
                <Outlet />
            </section>
        </main>
    );
}

export default Dashboard;