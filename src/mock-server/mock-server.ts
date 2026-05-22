import { createServer, type Server } from "node:http";

const defaultPages: Record<string, string> = {
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

export function createMockServer(
	pages: Record<string, string> = defaultPages,
): Server {
	return createServer((req, res) => {
		const page = pages[req.url ?? "/"];
		if (!page) {
			res.writeHead(404, { "Content-Type": "text/html" });
			res.end("<html><body>Not found</body></html>");
			return;
		}
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(page);
	});
}

export async function startMockServer(
	pages?: Record<string, string>,
): Promise<{ server: Server; baseUrl: URL; close: () => Promise<void> }> {
	const server = createMockServer(pages);
	await new Promise<void>((resolve) => server.listen(0, resolve));
	const { port } = server.address() as { port: number };
	const baseUrl = new URL(`http://localhost:${port}/`);
	const close = () =>
		new Promise<void>((resolve) => server.close(() => resolve()));
	return { server, baseUrl, close };
}
