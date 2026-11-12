import express from "express";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const app = express();
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", {
    key: process.env.MAPTILER_KEY
  });
});

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) {
    return res.json({ error: "No data found." });
  }

  let search = db
    .from("zip_codes")
    .select(`
      zip_code, city, county, latitude,longitude,
      states(state_name),
      zip_languages(languages(language_name))
    `);

 if (isNaN(q)) {
  search = search.ilike("city", `%${q}%`);
} else {
  search = search.eq("zip_code", q);
}

  const { data, error } = await search;
  const rows = data.filter(row => row.states.state_name.toLowerCase() === "california")
    .map(row => ({
      city: row.city,
      county: row.county,
      latitude: row.latitude,
      longitude: row.longitude,
      langs: row.zip_languages.map(item => item.languages.language_name)
    }));
  res.json(rows);
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});