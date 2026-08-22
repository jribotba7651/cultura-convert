import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CONTENT_URL =
  "https://cultura-convert.lovable.app/__l5e/assets-v1/da90b845-3849-4319-85bc-aa42463a8ba6/essay-content.txt";
const COVER =
  "/__l5e/assets-v1/98ec8eab-b8fe-44a3-843c-b3dc9c186ce7/machine-trust-0.jpg";
const EXCERPT =
  "Artificial intelligence is not the end of mysticism. It is its largest amplifier since the printing press. An essay on AI, intimacy, and the return of the sacred.";

Deno.serve(async () => {
  try {
    const content = await (await fetch(CONTENT_URL)).text();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase
      .from("blog_posts")
      .upsert(
        {
          slug: "in-the-machine-we-trust",
          title_es: "In the Machine We Trust: AI and the Return of the Sacred",
          title_en: "In the Machine We Trust: AI and the Return of the Sacred",
          excerpt_es: EXCERPT,
          excerpt_en: EXCERPT,
          content_es: content,
          content_en: content,
          category_es: "Ensayo",
          category_en: "Essay",
          tags: ["AI", "essay", "mysticism", "technology", "Rosnelma García"],
          cover_image: COVER,
          published: true,
          featured: true,
          date: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id, slug, published");
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, data, length: content.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
