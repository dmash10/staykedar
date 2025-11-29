
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Home, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet";
import Container from "../components/Container";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | StayKedarnath</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow flex items-center justify-center py-20">
          <Container size="md">
            <div className="max-w-lg mx-auto text-center">
              <div className="icon-box w-20 h-20 mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <h1 className="text-6xl font-display font-bold text-indigo-deep mb-4 animate-fade-in">
                404
              </h1>

              <h2 className="text-2xl font-semibold text-gray-800 mb-4 animate-fade-in animate-delay-100">
                Lost in the Mountains?
              </h2>

              <p className="text-lg text-gray-600 mb-8 animate-fade-in animate-delay-200">
                The path you're looking for seems to be covered in snow. Let's guide you back to the main trail.
              </p>

              <Link to="/" className="btn-primary inline-flex animate-fade-in animate-delay-200">
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </Link>
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NotFound;
