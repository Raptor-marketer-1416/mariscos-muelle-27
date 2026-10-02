// functions/_middleware.js — Markdown for Agents (versión Raptor)
// Sirve la versión .md cuando un agente manda Accept: text/markdown.
// Los navegadores reciben HTML exactamente igual que antes.
//
// DISENO DEFENSIVO (importante): la ruta del navegador es la PRIMERA
// condicion y hace `return next()` sin tocar nada — ni lee la respuesta,
// ni la reconstruye, ni le agrega headers. Si este archivo fallara, solo
// podria fallar para quien pida markdown, nunca para una persona.
// El header Link de alternativa se declara en _headers (estatico), no aqui.
//
// Pages Functions esta incluido en el plan Free (100,000 req/dia).
// Los assets estaticos no consumen esa cuota.

export async function onRequest(context) {
  const { request, next } = context;

  // --- Ruta rapida: todo lo que no sea una peticion de markdown ---
  const accept = request.headers.get('Accept') || '';
  if (!accept.toLowerCase().includes('text/markdown')) return next();
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();

  // --- Ruta de agente ---
  try {
    const url = new URL(request.url);
    const candidatas = rutasMd(url.pathname);
    if (!candidatas.length) return next();

    for (const destino of candidatas) {
      const md = await context.env.ASSETS.fetch(new Request(url.origin + destino));
      if (md.status === 200) {
        const headers = new Headers();
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
        headers.set('Vary', 'Accept');
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Cache-Control', 'public, max-age=3600');
        return new Response(md.body, { status: 200, headers });
      }
    }
    return next();                                  // no hay .md -> HTML normal
  } catch (e) {
    return next();                                  // ante cualquier fallo, HTML
  }
}

// Devuelve las rutas .md candidatas, en orden de preferencia.
// Se prueban DOS convenciones porque conviven en la cartera:
//   /servicio           -> /servicio.md         (sitios planos, .html en la raiz)
//                       -> /servicio/index.md   (estandar arquitectura-web)
// Probarlas ambas evita que el middleware falle en silencio segun la epoca
// del sitio (bug real detectado en Fumigaciones Metropolitan, 2026-09-06).
function rutasMd(pathname) {
  if (pathname.endsWith('.md')) return [];          // ya lo pidio directo
  if (pathname.endsWith('/')) return [pathname + 'index.md', pathname.slice(0, -1) + '.md'];
  if (pathname.endsWith('.html')) return [pathname.slice(0, -5) + '.md'];
  if (!pathname.includes('.')) return [pathname + '.md', pathname + '/index.md'];
  return [];                                        // css, js, imagenes...
}
