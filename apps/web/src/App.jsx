import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

function Shell({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          Go N Shop
        </Link>

        <nav className="nav">
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}

function Hero({ title, copy }) {
  return (
    <section className="hero-card">
      <p className="eyebrow">Go N Shop</p>
      <h1>{title}</h1>
      <p className="copy">{copy}</p>
    </section>
  );
}

function HomePage() {
  return (
    <Hero
      title="Frontend route setup is ready."
      copy="We now have React Router wired into the web workspace, so we can build pages for the shop without touching the backend structure."
    />
  );
}

function ProductsPage() {
  return (
    <Hero
      title="Products page"
      copy="This will later show product listings, filters, and pagination."
    />
  );
}

function CartPage() {
  return (
    <Hero
      title="Cart page"
      copy="This is where cart items, quantity controls, and checkout flow will live."
    />
  );
}

function LoginPage() {
  return (
    <Hero
      title="Login page"
      copy="Use this route for authentication forms and session handling."
    />
  );
}

function NotFoundPage() {
  return (
    <Hero
      title="Page not found"
      copy="The route you tried does not exist. Use the navigation to go back."
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
