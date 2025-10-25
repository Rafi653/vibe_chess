function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-300">
          &copy; {new Date().getFullYear()} Vibe Chess. A modern chess experience.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
