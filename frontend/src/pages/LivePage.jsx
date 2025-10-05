import Navbar from "../components/Navbar";
import GlobeComponent from "../components/GlobeComponent";

const LivePage = () => {
  return (
    <>
      <Navbar></Navbar>
      <main className="bg-[var(--color-background)] min-h-screen">
        <div style={{ background: "#000", height: "100vh", width: "100vw" }}>
          <GlobeComponent />
        </div>
      </main>
    </>
  );
};

export default LivePage;
