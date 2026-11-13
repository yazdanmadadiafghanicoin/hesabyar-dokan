
const pool = require("./db");

module.exports = async function handler(req, res) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGSERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        product TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        amount NUMERIC(14,2) NOT NULL,
        person TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    if (req.method === "GET") {
      const result = await pool.query(
        "SELECT * FROM transactions ORDER BY id DESC LIMIT 200"
      );
      return res.status(200).json({
        ok: true,
        transactions: result.rows
      });
    }

    if (req.method === "POST") {
      const {
        type, product, quantity, amount, person, notes
      } = req.body || {};

      const validTypes = ["sale", "purchase", "expense", "debt"];

      if (
        !validTypes.includes(type) ||
        typeof product !== "string" ||
        !product.trim() ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 1 ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({
          ok: false,
          message: "اطلاعات معامله درست نیست"
        });
      }

      const result = await pool.query(
        `INSERT INTO transactions
        (type, product, quantity, amount, person, notes)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [
          type,
          product.trim(),
          Number(quantity),
          Number(amount),
          String(person || ""),
          String(notes || "")
        ]
      );

      return res.status(201).json({
        ok: true,
        transaction: result.rows[0]
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Database error"
    });
  }
};
