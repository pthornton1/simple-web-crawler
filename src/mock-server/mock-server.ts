import { createServer } from "node:http";

const pages: Record<string, string> = {
	"/": `<html><body>
    <a href="/about">About</a>
    <a href="/products">Products</a>
  </body></html>`,
	"/about": `<html><body>
    <a href="/">Home</a>
    <a href="/team">Team</a>
  </body></html>`,
	"/products": `<html><body>
    <a href="/products/1">Product 1</a>
  </body></html>`,
};

const server = createServer((req, res) => {
	const page = pages[req.url ?? "/"];
	if (!page) {
		res.writeHead(404, { "Content-Type": "text/html" });
		res.end("<html><body>Not found</body></html>");
		return;
	}
	res.writeHead(200, { "Content-Type": "text/html" });
	res.end(page);
});

server.listen(0, () => {
	const { port } = server.address() as { port: number };
	console.log(`Mock server on http://localhost:${port}`);
});
