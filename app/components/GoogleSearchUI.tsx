export default function GoogleSearchUI() {
  return (
    <iframe
      src="https://www.google.com/webhp?igu=1"
      className="fixed inset-3 w-[calc(100vw-1.5rem*2)] h-[calc(100vh-1.5rem*2)] bg-white rounded-lg shadow-lg"
    ></iframe>
  );
}
