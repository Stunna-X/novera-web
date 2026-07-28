import Container from "../ui/Container";
import Button from "../ui/Button";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between">

        <h1 className="text-2xl font-bold text-white">
          Novera
        </h1>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-slate-300 hover:text-white">
            Features
          </a>

          <a href="#pricing" className="text-slate-300 hover:text-white">
            Pricing
          </a>

          <a href="#faq" className="text-slate-300 hover:text-white">
            FAQ
          </a>
        </nav>

        <Button>Get Started</Button>

      </Container>
    </header>
  );
}