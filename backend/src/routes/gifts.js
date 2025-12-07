import express, { raw } from "express";
import multer from "multer";
import { q } from "../db.js";
import { SELECT_GIFTS } from "../utils/sql.js";
import { bucket } from "../firebaseAdmin.js"; // precisa exportar o bucket no backend

const router = express.Router();

/* =========================
   helpers
========================= */
function toMoneyNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}
function httpError(res, code, msg) {
  return res.status(code).json({ error: msg });
}
function isIdValid(id) {
  return /^\d+$/.test(String(id));
}

// Multer em memória (limite 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(png|jpe?g|webp|gif|svg\+xml)/i.test(
      file.mimetype || ""
    );
    if (!ok) return cb(new Error("Tipo de arquivo não suportado"));
    cb(null, true);
  },
});

/* =========================
   GET /gifts
========================= */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await q(SELECT_GIFTS);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (e) {
    console.error("GET /gifts error:", e);
    httpError(res, 500, "Erro ao listar gifts");
  }
});

/* =========================
   POST /gifts
   body: { name, goal_amount, img?, descricao?, especificacoes?, link_referencia? }
   received_amount inicia 0, is_active true
========================= */
router.post("/", async (req, res) => {
  console.log("POST /gifts body:", JSON.stringify(req.body));
  const {
    name,
    goal_amount,
    img,
    descricao,
    especificacoes,
    link_referencia,
  } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return httpError(res, 400, "name é obrigatório");
  }
  const goal = toMoneyNumber(goal_amount);
  if (goal === null) {
    return httpError(res, 400, "goal_amount inválido");
  }

  // descrição
  const rawDesc = typeof descricao === "string" ? descricao.trim() : null;
  const desc = rawDesc && rawDesc.length ? rawDesc : null;

  // especificações
  const rawSpecs =
    typeof especificacoes === "string" ? especificacoes.trim() : null;
  const specs = rawSpecs && rawSpecs.length ? rawSpecs : null;

  // link de referência
  const rawLink =
    typeof link_referencia === "string" ? link_referencia.trim() : null;
  const link = rawLink && rawLink.length ? rawLink : null;

  try {
    await q(
      `INSERT INTO public.gifts
         (name, goal_amount, received_amount, is_active, img, descricao, especificacoes, link_referencia)
       VALUES ($1,   $2,          0,              true,     $3,  $4,        $5,             $6)`,
      [name.trim(), goal, img || null, desc, specs, link]
    );
    const { rows } = await q(SELECT_GIFTS);
    res.status(201).json(rows);
  } catch (e) {
    console.error("POST /gifts error:", e);
    httpError(res, 500, "Erro ao criar gift");
  }
});

/* =========================
   PATCH /gifts/:id
   body: { is_active?, goal_amount?, img?, descricao?, concluido?, especificacoes?, link_referencia? }
========================= */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("PATCH /gifts/:id body:", req.body);
  if (!isIdValid(id)) return httpError(res, 400, "id inválido");

  const {
    is_active,
    goal_amount,
    img,
    descricao,
    concluido,
    especificacoes,
    link_referencia,
  } = req.body || {};

  const sets = [];
  const vals = [];
  let i = 1;

  if (typeof is_active === "boolean") {
    sets.push(`is_active = $${i++}`);
    vals.push(is_active);
  }

  if (goal_amount != null) {
    const goal = toMoneyNumber(goal_amount);
    if (goal === null) return httpError(res, 400, "goal_amount inválido");
    sets.push(`goal_amount = $${i++}`);
    vals.push(goal);
  }

  // img pode ser string (URL) ou null pra limpar
  if (img !== undefined) {
    if (img !== null && typeof img !== "string") {
      return httpError(res, 400, "img deve ser string (URL) ou null");
    }
    sets.push(`img = $${i++}`);
    vals.push(img || null);
  }

  // descrição
  if (descricao !== undefined) {
    if (descricao !== null && typeof descricao !== "string") {
      return httpError(res, 400, "descricao deve ser string ou null");
    }
    const d = descricao === null ? null : descricao.trim();
    sets.push(`descricao = $${i++}`);
    vals.push(d && d.length ? d : null);
  }

  // ✅ NOVO: especificações
  if (especificacoes !== undefined) {
    if (especificacoes !== null && typeof especificacoes !== "string") {
      return httpError(res, 400, "especificacoes deve ser string ou null");
    }
    const s = especificacoes === null ? null : especificacoes.trim();
    sets.push(`especificacoes = $${i++}`);
    vals.push(s && s.length ? s : null);
  }

  // ✅ NOVO: link_referencia
  if (link_referencia !== undefined) {
    if (link_referencia !== null && typeof link_referencia !== "string") {
      return httpError(res, 400, "link_referencia deve ser string ou null");
    }
    const l = link_referencia === null ? null : link_referencia.trim();
    sets.push(`link_referencia = $${i++}`);
    vals.push(l && l.length ? l : null);
  }

  // concluir/reabrir
  if (concluido !== undefined) {
    // Aceita 'X', null ou "" (vazio). Qualquer outra coisa -> 400
    let value = null;
    if (concluido === "X") value = "X";
    else if (concluido === null || concluido === "") value = null;
    else return httpError(res, 400, "concluido deve ser 'X' ou null/vazio");

    sets.push(`concluido = $${i++}`);
    vals.push(value);
  }

  if (sets.length === 0) {
    return httpError(res, 400, "Nada para atualizar");
  }

  vals.push(id);

  try {
    await q(
      `UPDATE public.gifts SET ${sets.join(", ")} WHERE id = $${i}`,
      vals
    );
    const { rows } = await q(SELECT_GIFTS);
    res.json(rows);
  } catch (e) {
    console.error("PATCH /gifts/:id error:", e);
    httpError(res, 500, "Erro ao atualizar gift");
  }
});


/* =========================
   POST /gifts/:id/image
   multipart/form-data: campo "file"
   Sobe pro Firebase Storage e salva URL em gifts.img
========================= */
router.post("/:id/image", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  if (!isIdValid(id)) return httpError(res, 400, "id inválido");
  if (!req.file) return httpError(res, 400, "Arquivo ausente (campo 'file').");

  try {
    const { rows: exists } = await q(
      "SELECT 1 FROM public.gifts WHERE id = $1",
      [id]
    );
    if (!exists.length) return httpError(res, 404, "Gift não encontrado");

    const original = (req.file.originalname || "upload").replace(
      /[^\w.-]/g,
      "_"
    );
    const filename = `Casamento/${id}/${Date.now()}-${original}`;
    const file = bucket.file(filename);

    await file.save(req.file.buffer, {
      contentType: req.file.mimetype || "application/octet-stream",
      public: true,
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    await q(`UPDATE public.gifts SET img = $1 WHERE id = $2`, [publicUrl, id]);

    const { rows } = await q(SELECT_GIFTS);
    res.status(201).json(rows);
  } catch (e) {
    console.error("POST /gifts/:id/image error:", e);
    httpError(res, 500, "Falha ao enviar imagem");
  }
});

/* =========================
   DELETE /gifts/:id/image
   Remove do Storage (se pertencer ao bucket) e zera gifts.img
========================= */
router.delete("/:id/image", async (req, res) => {
  const { id } = req.params;
  if (!isIdValid(id)) return httpError(res, 400, "id inválido");

  try {
    const { rows: cur } = await q(
      `SELECT img FROM public.gifts WHERE id = $1`,
      [id]
    );
    if (!cur.length) return httpError(res, 404, "Gift não encontrado");

    const currentUrl = cur[0]?.img;
    if (currentUrl && typeof currentUrl === "string") {
      // tenta extrair o caminho do objeto a partir da URL pública
      // https://storage.googleapis.com/<bucket>/<path>
      // ou https://<bucket>.storage.googleapis.com/<path>
      let objectPath = null;
      const byGcs = currentUrl.match(
        /https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)/i
      );
      const byCname = currentUrl.match(
        /^https?:\/\/([^/]+)\.storage\.googleapis\.com\/(.+)/i
      );

      if (byGcs && byGcs[1] === bucket.name) objectPath = byGcs[2];
      if (!objectPath && byCname && byCname[1]) {
        const cname = byCname[1];
        if (bucket.name.startsWith(cname)) objectPath = byCname[2];
      }

      if (objectPath) {
        try {
          await bucket.file(objectPath).delete();
        } catch (e) {
          // se já não existir no storage, tudo bem
          console.warn("delete storage warning:", e.message);
        }
      }
    }

    await q(`UPDATE public.gifts SET img = NULL WHERE id = $1`, [id]);
    const { rows } = await q(SELECT_GIFTS);
    res.json(rows);
  } catch (e) {
    console.error("DELETE /gifts/:id/image error:", e);
    httpError(res, 500, "Falha ao remover imagem");
  }
});

/* =========================
   DELETE /gifts/:id
   Obs: se houver FK em contributions, pode falhar
========================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isIdValid(id)) return httpError(res, 400, "id inválido");

  try {
    await q("DELETE FROM public.gifts WHERE id = $1", [id]);
    const { rows } = await q(SELECT_GIFTS);
    res.json(rows);
  } catch (e) {
    console.error("DELETE /gifts/:id error:", e);
    httpError(
      res,
      500,
      "Erro ao excluir gift (verifique FK em contributions)"
    );
  }
});

export default router;